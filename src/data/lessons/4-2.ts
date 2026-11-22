import type { Lesson } from '@/types/course';

export const lesson4_2: Lesson = {
  id: '4-2',
  moduleId: 'mod-4',
  number: '4.2',
  title: 'PyTorch Essentials & Training Dynamics: Autograd, Norm, Residuals & BF16',
  subtitle: 'Master PyTorch tensors, autograd, nn.Module, train/eval modes, CPU vs GPU memory traps, Residual highways, LayerNorm/RMSNorm, AdamW, and BF16.',
  durationMinutes: 90,
  track: 'core',
  prerequisites: ['4.1'],
  requires: ['mlp-nonlinearity', 'backpropagation-chain-rule', 'adam-optimizer'],
  teaches: [
    'pytorch-tensors-autograd',
    'pytorch-nn-module-loops',
    'residual-skip-connections',
    'layernorm-rmsnorm',
    'bf16-mixed-precision',
  ],
  objectives: [
    'Build models with PyTorch `Tensor`, `autograd`, `nn.Module`, and full `train()` vs `eval()` (`torch.no_grad()`) training/validation loops.',
    'Move models and batches cleanly between CPU and CUDA GPUs without cross-device `RuntimeError` or validation-RAM OOM leaks.',
    'Explain mathematically why Residual Skip Connections (`x + F(x)`), LayerNorm/RMSNorm, and Cosine LR Warmup prevent deep gradient collapse.',
    'Contrast FP32, FP16, and BF16 dynamic ranges and verify normalization + gradient clipping mechanics in executable NumPy labs.',
  ],
  checkWithoutNotes: [
    'Write out the exact 5-step PyTorch training loop body and explain what breaks silently if you forget `optimizer.zero_grad()`.',
    'What two layers behave differently when you switch `model.train()` to `model.eval()`, and why do you ALSO wrap validation in `with torch.no_grad():`?',
    'Contrast BatchNorm (vision) vs LayerNorm / RMSNorm (Transformers/LLMs) when inference runs at `batch_size = 1` on variable-length sequences.',
    'Why does `BF16` avoid the overflow/underflow failures of `FP16` despite using the same 16 bits total per parameter?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why PyTorch + Training Stabilization Rules Modern Deep Learning',
      paragraphs: [
        'Writing manual transpose backward equations in NumPy teaches you how gradients work—yet nobody writes hand-derived Chain Rule derivatives for a 32-layer Transformer with residual blocks and RMSNorm in production. **PyTorch** automates differentiation (**autograd**) across arbitrary computation graphs while compiling tensor math seamlessly onto NVIDIA CUDA GPUs or Apple Silicon.',
        'At the same time, simply switching to PyTorch does not stop deep architectures from diverging. Stack 40 naïve linear+ReLU blocks together and gradients either collapse exponentially toward zero or explode to `NaN` within ten steps. Modern deep AI stands on four engineering pillars you must know fluently: PyTorch `nn.Module` loop hygiene (`zero_grad`, `train/eval`, `no_grad`, `device` placement), Residual gradient highways (`x + F(x)`), token-wise normalization (`LayerNorm` / `RMSNorm`), and `AdamW` + Cosine Warmup + `BF16` mixed precision.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Reactive Dependency Graphs & Circuit Breakers',
      frontendConcept: 'A reactive UI signal graph tracking dependencies automatically (`computed` state) alongside explicit cleanup inside `useEffect` and strict production build mode',
      aiConcept: 'PyTorch Dynamic Autograd Graph, `optimizer.zero_grad()`, and `model.eval() / torch.no_grad()`',
      explanation:
        'PyTorch `autograd` acts like a live dependency recorder: every operation on a tensor with `requires_grad=True` logs a small reverse step onto a dynamic graph; calling `loss.backward()` walks that graph backward in reverse topological order and adds derivatives into each weight’s `.grad` attribute. Forgetting `optimizer.zero_grad()` leaves yesterday’s gradients sitting inside `.grad`, silently corrupting every new batch!',
    },
    {
      type: 'prose',
      heading: 'PyTorch Core: Tensors, Autograd, `nn.Module`, and CPU vs GPU Hygiene',
      paragraphs: [
        '**1) Tensors & Devices (CPU vs CUDA GPU):** Every `torch.Tensor` carries `.shape`, `.dtype` (`float32`, `bfloat16`, `int64` for token IDs), and `.device` (`"cpu"` or `"cuda:0"`). PyTorch refuses operations mixing CPU and GPU tensors (`Expected all tensors to be on the same device`). Set `device = torch.device("cuda" if torch.cuda.is_available() else "cpu")` once, call `model.to(device)`, and move every incoming batch `(xb, yb) = xb.to(device), yb.to(device)` inside the loop.',
        '**2) Autograd & Memory Hygiene:** Any tensor created with `requires_grad=True` builds computation history graphs eating GPU VRAM. During validation or live inference, ALWAYS wrap forward calls inside `with torch.no_grad():` (or `@torch.inference_mode()`) so PyTorch skips allocating intermediate backward buffers—AND remember to extract Python floats with `loss.item()` rather than appending live `loss` tensors to `history.append(loss)`, which leaks the entire computation graph until RAM crashes!',
        '**3) `nn.Module`, `.train()`, and `.eval()`:** Subclass `nn.Module`, register layers (`nn.Linear`, `nn.LayerNorm`, `nn.Dropout`) inside `__init__`, and define forward logic inside `forward(self, x)`—calling `model(x)` rather than `model.forward(x)` directly so PyTorch hooks execute cleanly. Always toggle `model.train()` before training (enabling Dropout noise and updating BatchNorm running stats) and `model.eval()` before validation/serving (disabling Dropout deterministically and freezing BatchNorm stats).',
      ],
    },
    {
      type: 'code',
      title: 'Production PyTorch Pattern: Complete `nn.Module` + Train/Eval Loop (Run Locally with `torch`)',
      language: 'python',
      code: `import torch
import torch.nn as nn

class ResidualMLP(nn.Module):
    def __init__(self, d_in: int, d_hidden: int, d_out: int):
        super().__init__()
        self.proj = nn.Linear(d_in, d_hidden)
        self.norm = nn.LayerNorm(d_hidden)
        self.block = nn.Sequential(nn.Linear(d_hidden, d_hidden), nn.GELU(), nn.Dropout(0.1))
        self.head = nn.Linear(d_hidden, d_out)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = self.proj(x)
        h = h + self.block(self.norm(h))  # Pre-Norm Residual Highway!
        return self.head(h)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = ResidualMLP(16, 64, 2).to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
criterion = nn.CrossEntropyLoss()

def run_epoch(loader, train: bool = True) -> float:
    model.train(train)  # toggles Dropout/BatchNorm cleanly!
    total_loss = 0.0
    ctx = torch.enable_grad() if train else torch.no_grad()
    with ctx:
        for xb, yb in loader:
            xb, yb = xb.to(device), yb.to(device)
            if train:
                optimizer.zero_grad(set_to_none=True)
            logits = model(xb)
            loss = criterion(logits, yb)
            if train:
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()
            total_loss += loss.item()  # .item() detaches graph cleanly!
    return total_loss / max(len(loader), 1)`,
      caption: 'Run this exact template on your local Python machine with `pip install torch`; browser labs below implement the core autograd, LayerNorm, and clipping math directly in offline NumPy.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Residual Highways (`x + F(x)`) & Token-Wise Normalization Math',
      paragraphs: [
        'Consider why 50-layer networks used to die without **Residual Connections (`y = x + F(x)`)**. Differentiate `y` with respect to input `x` by the sum rule: `dy/dx = 1 + dF/dx`. Even if `dF/dx` is tiny (`0.001`) during early training, that `+ 1` creates an unobstructed identity gradient highway directly from the final loss straight back to layer 1 without shrinking exponentially!',
        'Next compare **BatchNorm** against **LayerNorm** and **RMSNorm** numerically on a 2-token mini-batch (`row 0 = [2.0, 4.0, 6.0]`, `row 1 = [10.0, 20.0, 30.0]`). BatchNorm normalizes down each **column** across tokens in the batch—which fails at `batch_size = 1` serving and gets messy when padding tokens vary by sequence length. By contrast, **LayerNorm** normalizes **each token row independently** across its `d` features: for `[2, 4, 6]`, mean `= 4.0`, variance `= ((4 + 0 + 4) / 3) = 2.667`, `std = 1.633`, giving normalized output `[-1.225, 0.0, +1.225]` regardless of any other token in the batch! **RMSNorm** (standard in `MODEL_CATALOG` `local-open-weights` decoders) drops the mean subtraction entirely—dividing solely by `sqrt(mean(x^2) + eps)` and multiplying by learned gain `gamma`—achieving matching Transformer stability with fewer reduction passes.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: AdamW Weight Decay, Cosine Warmup & BF16 Mixed Precision',
      paragraphs: [
        'Three optimization details stabilize large neural runs cleanly. First, **AdamW** fixes a subtle bug in classic Adam + L2 penalty: instead of feeding `lambda * w` into Adam’s adaptive variance denominator (which weakens regularization on fast-changing weights), AdamW applies **decoupled weight decay** directly after the Adam step (`w = w * (1 - lr * wd) - lr * adam_step`), and excludes LayerNorm weights and 1D biases from weight decay.',
        'Second, **Linear Warmup + Cosine Decay** protects step 1–500 when random weights emit noisy mismatched Adam second-moment estimates (`v_t`): ramping `lr` linearly from `0` up to `lr_max` over ~2–5% of steps avoids early divergence, then decaying along a smooth cosine curve settles weights cleanly into flat loss basins.',
        'Third, **BF16 (Brain Float 16)** cuts weight and activation VRAM in half compared to 32-bit `FP32` while solving `FP16` crashes. Why? Standard `FP16` allocates only 5 exponent bits (capping max value around `65,504` and underflowing small gradients to `0`), forcing messy dynamic loss scaling. `BF16` keeps the **exact 8-bit exponent range of `FP32`** (`up to ~3.4e38`) while trimming precision bits slightly from 23 to 7—ideal because neural optimization needs dynamic range far more than 7 decimal places!',
      ],
    },
    {
      type: 'table',
      title: 'Modern Deep Learning Training Precision (`FP32` vs `FP16` vs `BF16`)',
      headers: ['Format', 'Total Bits', 'Exponent (Range)', 'Mantissa (Precision)', 'Why It Matters'],
      rows: [
        ['`FP32`', '32', '8 bits', '23 bits', 'Full baseline precision (`4 bytes/param`); slow and VRAM-heavy'],
        ['`FP16`', '16', '5 bits', '10 bits', 'Narrow exponent range (`max 65,504`) — overflows/underflows without `GradScaler`'],
        ['`BF16` (Brain Float)', '16', '8 bits (matches `FP32`!)', '7 bits', 'Modern LLM default: half VRAM, `FP32` dynamic range, zero loss scaling required'],
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'PyTorch Training Loop Anatomy (Check All 5 Steps Every Time)',
      body: '`optimizer.zero_grad()` (wipe stale `.grad`) -> `logits = model(xb)` (forward) -> `loss = criterion(logits, yb)` -> `loss.backward()` (autograd populates `.grad`) -> `torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)` + `optimizer.step()`. Never omit `zero_grad()`, `model.eval()`, `torch.no_grad()`, or `loss.item()`!',
    },
    {
      type: 'prose',
      heading: 'Common PyTorch & Training Dynamics Mistakes & How to Debug Them',
      paragraphs: [
        '1) Forgetting `optimizer.zero_grad()` inside the training loop: PyTorch *accumulates* (`+=`) gradients by default (useful intentionally for gradient accumulation across micro-batches, fatal accidentally!). If loss oscillates wildly after epoch 1, check `zero_grad(set_to_none=True)`.',
        '2) Passing probabilities (`torch.softmax(logits)`) into `nn.CrossEntropyLoss()`: PyTorch `CrossEntropyLoss` computes `log_softmax` internally! Applying Softmax twice squashes logits into `[0, 1]`, crippling early gradients. Feed raw unnormalized `logits` straight into `CrossEntropyLoss` and `BCEWithLogitsLoss`.',
        '3) Leaving `model.train()` active during validation or production serving: Dropout randomly zeroes 10–30% of live activations on every request, making predictions non-deterministic and artificially worse!',
        '4) Appending `losses.append(loss)` instead of `loss.item()` inside epoch metrics: storing a connected PyTorch tensor pins its entire backward computation graph in GPU memory until CUDA throws `OutOfMemoryError` mid-epoch.',
        '5) Putting `1D` `LayerNorm` weights or bias tensors under heavy AdamW `weight_decay`: standard practice excludes `ndim < 2` parameters (biases, norm scales) so gains stay free around `1.0`.',
        '6) Mixing CPU and CUDA GPU tensors inside the same operation (`RuntimeError: Expected all tensors to be on the same device`): model parameters moved via `model.to("cuda")` expect every incoming batch `(xb, yb)` and custom mask tensor to call `.to(device)` too. Keep a single `device` object and move tensors immediately when unpacking your `DataLoader`.',
        '7) Placing `LayerNorm` *after* the residual addition (**Post-Norm**: `LayerNorm(x + F(x))`) instead of *before* each sublayer (**Pre-Norm**: `x + F(LayerNorm(x))`): Post-Norm breaks the pure identity `1 + dF/dx` highway and often fails to converge without aggressive learning-rate warmup, which is why virtually every modern LLM adopts Pre-Norm.',
        '8) Passing `drop_last=False` to BatchNorm training batches when the final trailing batch happens to hold only `1` leftover sample: `BatchNorm` throws a `ValueError` when batch size equals `1` in training mode! Set `drop_last=True` on training `DataLoader`s or use `LayerNorm` instead.',
        '9) Calling `model.forward(xb)` directly instead of `model(xb)`: calling `.forward()` bypasses PyTorch registered forward/backward hooks, DDP wrappers, and mixed-precision autocast hooks cleanly managed by `__call__`.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 4.2 Recap: PyTorch & Stable Training',
      body: '- Track `.shape`, `.dtype`, and `.device` on every tensor; call `model.eval()` and `torch.no_grad()` during validation.\n- Always clear `.grad` with `optimizer.zero_grad()`, feed raw logits to `CrossEntropyLoss`, and extract floats via `loss.item()`.\n- Pre-Norm Residual connections (`x + F(norm(x))`) preserve unobstructed identity gradient highways across depth.\n- Prefer token-independent `LayerNorm` / `RMSNorm` over batch-dependent `BatchNorm` for sequence models.\n- Use `BF16` mixed precision (`8-bit` exponent like `FP32`), decoupled `AdamW`, and linear LR warmup + cosine decay.',
    },
    {
      type: 'python-lab',
      labId: 'lab-4-2-layernorm',
      difficulty: 'guided',
      requires: ['numpy-arrays', 'mlp-nonlinearity'],
      title: 'Lab 4.2A: Implement Token-Wise `LayerNorm` & `RMSNorm` in NumPy',
      prompt:
        'Implement `layer_norm(x: np.ndarray, eps: float = 1e-5)` normalizing every row independently across the last axis (`mean=0, var=1`), and `rms_norm(x: np.ndarray, eps: float = 1e-5)` dividing each row by `sqrt(mean(x^2, axis=-1, keepdims=True) + eps)`. Both operate per row regardless of batch size.',
      starterCode: `import numpy as np

def layer_norm(x: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    # Normalize each row over axis=-1 (keepdims=True): (x - mean) / sqrt(var + eps)
    pass

def rms_norm(x: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    # Divide each row by sqrt(mean(x**2, axis=-1, keepdims=True) + eps)
    pass`,
      testCode: `import numpy as np
X = np.array([[2.0, 4.0, 6.0], [10.0, 20.0, 30.0]])
ln = layer_norm(X)
assert np.allclose(ln.mean(axis=-1), [0.0, 0.0], atol=1e-6)
assert np.allclose(ln.std(axis=-1), [1.0, 1.0], atol=1e-4)
# Token 0 must match identically whether batch_size=1 or batch_size=2!
ln_single = layer_norm(X[:1])
assert np.allclose(ln[0], ln_single[0], atol=1e-7)
rn = rms_norm(X)
assert np.allclose(np.mean(rn ** 2, axis=-1), [1.0, 1.0], atol=1e-5)
print("PASS: Token-independent LayerNorm and RMSNorm match exact Transformer behavior!")`,
      solutionCode: `import numpy as np

def layer_norm(x: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    mean = np.mean(x, axis=-1, keepdims=True)
    var = np.var(x, axis=-1, keepdims=True)
    return (x - mean) / np.sqrt(var + eps)

def rms_norm(x: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    rms = np.sqrt(np.mean(x ** 2, axis=-1, keepdims=True) + eps)
    return x / rms`,
      hint: 'Always compute `mean` and `var` with `axis=-1, keepdims=True` so row 0 never depends on row 1.',
      hints: [
        'Use `np.mean(x, axis=-1, keepdims=True)` and `np.var(x, axis=-1, keepdims=True)` inside `layer_norm`.',
        'Divide `(x - mean)` by `np.sqrt(var + eps)`.',
        'Inside `rms_norm`, omit mean subtraction and divide `x` by `np.sqrt(np.mean(x ** 2, axis=-1, keepdims=True) + eps)`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-4-2-autograd',
      difficulty: 'spec',
      requires: ['backpropagation-chain-rule'],
      title: 'Lab 4.2B: Build a Mini Reverse-Mode Scalar Autograd Engine',
      prompt:
        'See how PyTorch `autograd` works inside! Complete `__add__`, `__mul__`, and `backward()` on `Value` so calling `L.backward()` on `L = (a * b + c)` populates exact reverse-mode gradients `a.grad == b.data`, `b.grad == a.data`, and `c.grad == 1.0`.',
      starterCode: `class Value:
    def __init__(self, data: float, _children=()):
        self.data = float(data)
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other))
        def _backward():
            # TODO: accumulate += out.grad into self.grad and other.grad
            pass
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other))
        def _backward():
            # TODO: product rule accumulation into self.grad and other.grad
            pass
        out._backward = _backward
        return out

    def backward(self):
        topo, visited = [], set()
        def build(v):
            if v not in visited:
                visited.add(v)
                for c in v._prev:
                    build(c)
                topo.append(v)
        build(self)
        self.grad = 1.0
        for node in reversed(topo):
            node._backward()`,
      testCode: `a = Value(3.0)
b = Value(-4.0)
c = Value(2.0)
# Reuse a twice to test += gradient accumulation across branches!
L = (a * b) + (a * c)
L.backward()
assert abs(L.data - (-6.0)) < 1e-6
assert abs(a.grad - (b.data + c.data)) < 1e-6, f"Expected da = b+c = -2.0 (testing += accumulation!), got {a.grad}"
assert abs(b.grad - 3.0) < 1e-6 and abs(c.grad - 3.0) < 1e-6
print("PASS: Mini reverse-mode autograd accumulated branching gradients cleanly!")`,
      solutionCode: `class Value:
    def __init__(self, data: float, _children=()):
        self.data = float(data)
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other))
        def _backward():
            self.grad += 1.0 * out.grad
            other.grad += 1.0 * out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other))
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    def backward(self):
        topo, visited = [], set()
        def build(v):
            if v not in visited:
                visited.add(v)
                for c in v._prev:
                    build(c)
                topo.append(v)
        build(self)
        self.grad = 1.0
        for node in reversed(topo):
            node._backward()`,
      hint: 'Always use `+=` (never `=`) inside `_backward()` so a node used in multiple branches sums all incoming gradient paths cleanly.',
      hints: [
        'For addition `out = self + other`, both children receive `1.0 * out.grad`.',
        'For multiplication `out = self * other`, `self.grad += other.data * out.grad` and `other.grad += self.data * out.grad`.',
        'Accumulate with `+=` so shared variables (`a * b + a * c`) combine gradients properly.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-4-2-clip',
      difficulty: 'debug',
      requires: ['pytorch-nn-module-loops', 'numpy-arrays'],
      title: 'Lab 4.2C: Fix Gradient Accumulation Leak & Exploding Norm Clipping',
      prompt:
        'This NumPy training helper mimics a classic PyTorch loop bug: it FORGETS to zero `.grad` between steps (accumulating stale gradients endlessly!) AND omits `clip_grad_norm` (letting a `500.0` outlier spike blow up the update!). Fix `step_with_zero_and_clip(w, grad_fn, batches, lr=0.1, max_norm=1.0)` so each batch clears `grad = np.zeros_like(w)` first, clips `grad` whenever `norm > max_norm` (`grad * (max_norm / norm)`), and subtracts `lr * grad`.',
      starterCode: `import numpy as np

def step_with_zero_and_clip(w: np.ndarray, grads_per_batch: list[np.ndarray], lr: float = 0.1, max_norm: float = 1.0) -> np.ndarray:
    w = w.astype(float).copy()
    grad_buf = np.zeros_like(w)
    for g in grads_per_batch:
        # BUG 1: accumulates stale grad_buf across steps without zeroing!
        # BUG 2: no global L2 norm clipping to <= max_norm!
        grad_buf += g
        w -= lr * grad_buf
    return w`,
      testCode: `import numpy as np
w0 = np.array([10.0, 0.0])
# Batch 1 normal [0.5, 0.0], Batch 2 huge spike [300.0, 400.0] (norm=500 -> clipped to [0.6, 0.8])
out = step_with_zero_and_clip(w0, [np.array([0.5, 0.0]), np.array([300.0, 400.0])], lr=0.1, max_norm=1.0)
expected = np.array([10.0 - 0.1*0.5 - 0.1*0.6, 0.0 - 0.1*0.8])
assert np.allclose(out, expected, atol=1e-6), f"Expected {expected}, got {out}"
print("PASS: Zeroing gradients + L2 norm clipping blocked stale accumulation and outlier explosion!")`,
      solutionCode: `import numpy as np

def step_with_zero_and_clip(w: np.ndarray, grads_per_batch: list[np.ndarray], lr: float = 0.1, max_norm: float = 1.0) -> np.ndarray:
    w = w.astype(float).copy()
    for g in grads_per_batch:
        grad_buf = np.zeros_like(w)
        grad_buf += g
        norm = float(np.linalg.norm(grad_buf))
        if norm > max_norm:
            grad_buf = grad_buf * (max_norm / norm)
        w -= lr * grad_buf
    return w`,
      hint: 'Reset `grad_buf` to zero at the start of every batch step, compute `norm = np.linalg.norm(grad_buf)`, and scale down by `max_norm / norm` if `norm > max_norm`.',
      hints: [
        'Initialize `grad_buf = np.zeros_like(w)` INSIDE the `for g in grads_per_batch:` loop (`zero_grad`).',
        'Compute `norm = float(np.linalg.norm(grad_buf))`.',
        'If `norm > max_norm`, rescale `grad_buf = grad_buf * (max_norm / norm)` before `w -= lr * grad_buf`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q4-2-1',
      type: 'multiple-choice',
      question: 'Why do Transformers and LLMs use LayerNorm or RMSNorm instead of BatchNorm?',
      options: [
        'Because BatchNorm only supports integer input embeddings inside PyTorch neural modules',
        'LayerNorm/RMSNorm normalize each token independently, working at `batch_size = 1`',
        'Because LayerNorm introduces ten times more trainable matrix weights than multi-head attention',
        'Because BatchNorm operations cannot be differentiated cleanly by PyTorch autograd graphs',
      ],
      correctIndex: 1,
      explanation: 'BatchNorm averages across batch examples, failing when `batch_size = 1` or padded lengths differ; LayerNorm and RMSNorm normalize strictly within each token vector.',
    },
    {
      id: 'q4-2-2',
      type: 'multiple-choice',
      question: 'Why is `BF16` preferred over `FP16` for training large neural networks and LLMs?',
      options: [
        'Because `BF16` compresses every parameter down to 8 bits total instead of 16 bits',
        '`BF16` keeps the 8-bit `FP32` exponent range, preventing overflow without loss scaling',
        'Because `BF16` offers higher decimal mantissa precision than full 32-bit floating-point `FP32`',
        'Because `FP16` matrix operations cannot execute on modern NVIDIA CUDA GPU tensor cores',
      ],
      correctIndex: 1,
      explanation: 'Neural gradients need wide dynamic exponent range (`8 bits` matching `FP32`) far more than fine decimal precision (`7` vs `10` mantissa bits), avoiding `FP16` overflow.',
    },
    {
      id: 'q4-2-3',
      type: 'multiple-choice',
      question: 'How do Residual Skip Connections (`x + F(x)`) prevent vanishing gradients across deep stacks?',
      options: [
        'They automatically prune half of all hidden blocks whenever training epochs exceed ten',
        'The `+ x` identity path adds a `1` derivative highway straight backward',
        'They clamp every hidden matrix parameter strictly positive throughout stochastic gradient updates',
        'They replace AdamW momentum buffers completely with fixed unit-step linear scaling',
      ],
      correctIndex: 1,
      explanation: 'By the calculus sum rule, `d(x + F(x))/dx = I + dF/dx`, preserving direct gradient flow even across 100+ layers.',
    },
    {
      id: 'q4-2-4',
      type: 'spot-bug',
      question: 'Why does this PyTorch training loop eventually crash with CUDA OutOfMemoryError during epoch 4?',
      code: `history = []
for xb, yb in train_loader:
    optimizer.zero_grad()
    loss = criterion(model(xb.to(device)), yb.to(device))
    loss.backward()
    optimizer.step()
    history.append(loss)`,
      options: [
        'Calling `optimizer.zero_grad()` prior to `model(xb)` erases layer parameters rather than gradient buffers',
        'Passing `yb.to(device)` inside `criterion` duplicates validation targets permanently across GPU streams',
        '`history.append(loss)` pins the live autograd graph in VRAM; use `loss.item()`',
        '`loss.backward()` requires calling `model.eval()` right before every mini-batch update executes',
      ],
      correctIndex: 2,
      explanation: 'Appending a PyTorch `loss` tensor retains its entire computation graph in memory; extract scalar floats via `loss.item()` (or `loss.detach()`).',
    },
    {
      id: 'q4-2-5',
      type: 'predict-output',
      question: 'What happens if you pass `torch.softmax(logits, dim=-1)` into `nn.CrossEntropyLoss()` instead of raw `logits`?',
      options: [
        'Cross-entropy accuracy doubles immediately because input probabilities stay normalized cleanly in `[0, 1]`',
        'PyTorch throws a `TypeError` immediately rejecting floating-point tensors passed into `CrossEntropyLoss`',
        'Double `log_softmax` compresses output range and weakens gradients cleanly during training',
        'AdamW switches automatically from decoupled weight decay back to classic L2 gradient coupling',
      ],
      correctIndex: 2,
      explanation: 'PyTorch `CrossEntropyLoss` already runs `LogSoftmax + NLLLoss` internally; feeding already-softmaxed values flattens confidence and degrades gradients.',
    },
    {
      id: 'q4-2-6',
      type: 'multi-select',
      question: 'Which two steps are mandatory when evaluating validation data in PyTorch?',
      options: [
        'Call `model.eval()` so Dropout turns off deterministically and BatchNorm uses running stats',
        'Wrap forward evaluation in `with torch.no_grad():` so autograd skips allocating backward graphs',
        'Call `optimizer.step()` after every validation batch so test examples calibrate layer biases',
        'Keep `model.train()` active so Dropout averages random inference masks on validation batches',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: '`model.eval()` ensures deterministic evaluation behavior and `torch.no_grad()` saves huge amounts of VRAM and compute.',
    },
    {
      id: 'q4-2-7',
      type: 'numeric',
      question: 'A 7-billion-parameter model stored in `BF16` (`2` bytes per parameter) needs roughly how many GB of GPU VRAM for weights alone?',
      options: [],
      correctIndex: 0,
      correctNumber: 14,
      tolerance: 0.5,
      unit: 'GB',
      explanation: '`7 billion * 2 bytes = 14 GB` just for model weights before KV cache or activations.',
    },
    {
      id: 'q4-2-8',
      type: 'multiple-choice',
      question: 'Why does `AdamW` decouple weight decay directly from gradient scaling instead of adding `lambda * w` to the loss?',
      options: [
        'So Adam’s adaptive gradient variance does not shrink decay unevenly across parameters',
        'Because PyTorch forbids calling `.backward()` whenever quadratic L2 weight terms appear inside loss functions',
        'So every bias and LayerNorm scalar parameter receives twice the shrinkage penalty of linear projection matrices',
        'Because decoupled weight decay runs strictly on CPU even when weights live inside CUDA GPU VRAM',
      ],
      correctIndex: 0,
      explanation: 'Adding `lambda * w` directly into `g` divides weight shrinkage by Adam’s running RMS gradient scale; decoupled decay applies uniform proportional shrinkage `w *= (1 - lr * wd)`.',
    },
    {
      id: 'q4-2-9',
      type: 'ordering',
      question: 'Order the exact 5 lines of one standard PyTorch training batch iteration:',
      items: [
        'Clear stale gradients with `optimizer.zero_grad(set_to_none=True)`',
        'Run forward pass `logits = model(xb.to(device))`',
        'Compute scalar loss `loss = criterion(logits, yb.to(device))`',
        'Backpropagate derivatives via `loss.backward()` and `clip_grad_norm_`',
        'Apply weight update via `optimizer.step()`',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Zero old `.grad` -> forward pass -> compute loss -> compute `.grad` + clip -> update weights.',
    },
  ],
};
