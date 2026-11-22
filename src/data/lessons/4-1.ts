import type { Lesson } from '@/types/course';

export const lesson4_1: Lesson = {
  id: '4-1',
  moduleId: 'mod-4',
  number: '4.1',
  title: 'MLPs, Worked Backpropagation & From-Scratch Training Loops',
  subtitle: 'Trace forward activations and exact Chain Rule weight updates numerically by hand, compare ReLU/GELU/SwiGLU, and train an MLP in pure NumPy.',
  durationMinutes: 85,
  track: 'core',
  prerequisites: ['3.1', '1.5'],
  requires: ['linear-regression', 'logistic-regression', 'chain-rule'],
  teaches: [
    'mlp-nonlinearity',
    'backpropagation-chain-rule',
    'activation-functions',
    'weight-initialization',
  ],
  objectives: [
    'Prove algebraically and empirically why linear layers without non-linear activations collapse to a single linear matrix.',
    'Trace forward passes and Chain Rule backward gradients (`dW2`, `db2`, `dh`, `dz1`, `dW1`, `db1`) numerically by hand and in NumPy.',
    'Contrast ReLU, LeakyReLU, GELU, and SwiGLU activations and diagnose the Dying ReLU failure mode.',
    'Prevent zero-weight symmetry collapse using variance-preserving Xavier/He random initialization.',
  ],
  checkWithoutNotes: [
    'Show algebraically why stacking `W2 @ (W1 @ x + b1) + b2` without any activation computes only a single linear hyperplane.',
    'Explain what happens during training if you initialize every weight in `W1` and `W2` to exact `0.0`.',
    'Given `z1 = -2.5` going into `ReLU(z1)`, what are the forward output and local derivative `d(ReLU)/dz1`, and how can huge learning rates cause a Dying ReLU?',
    'Given forward product `out = h @ W2` where `h` has shape `(32, 64)` and `W2` has shape `(64, 1)`, state the exact matrix expressions and shapes for `dW2` and `dh`.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Non-Linearity Turns Linear Algebra into Universal Function Approximation',
      paragraphs: [
        'In Module 3, Logistic Regression drew a single straight hyperplane separating positive and negative examples. Real perceptual and reasoning problems—distinguishing handwritten digits, matching semantic paraphrases, or learning the XOR parity gate where `(0, 1)` and `(1, 0)` belong to Class 1 while `(0, 0)` and `(1, 1)` belong to Class 0—cannot be separated by any straight line.',
        'At first glance, stacking multiple linear layers looks like an easy fix. Look carefully at the algebra: `W2 @ (W1 @ x + b1) + b2 = (W2 @ W1) @ x + (W2 @ b1 + b2) = W_combined @ x + b_combined`. Because matrix multiplication is associative and closed under composition, a 100-layer deep linear network has the exact same expressive power as a **1-layer linear regression**! Inserting a simple element-wise non-linear bend such as `ReLU(z) = max(0, z)` between layers breaks linear collapse, allowing layered combinations of hinged planes to approximate arbitrarily curved manifolds.',
        'Understanding this mechanics from first principles pays off daily in production AI engineering. When a fine-tuned head stalls at random-guess loss, a Transformer MLP spikes `NaN` activations, or a gradient sanity test fails, knowing exact forward/backward tensor shapes and activation derivatives lets you pinpoint the broken layer in minutes instead of guessing blindly.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Origami Folds & Reverse-Mode Blame Assignment',
      frontendConcept: 'Composing pure linear CSS transforms (`translate`, `scale`) that stay straight vs bending shapes with bezier splines, plus tracing which nested function caused a wrong calculation',
      aiConcept: 'Non-Linear Activations (`ReLU` / `GELU` / `SwiGLU`) & Backpropagation',
      explanation:
        'Imagine folding a flat sheet of paper once with **ReLU** along a crease and slicing straight across with a linear output layer—suddenly one straight cut separates two opposite corners (`XOR`) cleanly! **Backpropagation** is structured blame assignment: starting at the final prediction error `loss`, each layer passes backward how much its output mattered (`dh`), scales by its local activation gate (`1` if `z > 0`, else `0`), and nudges its incoming weights proportionally.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Step-by-Step Numeric Backprop Through a 2-Layer ReLU Network',
      paragraphs: [
        'Let us compute **every number by hand** on one training sample before running NumPy! Suppose input `x = [1.0, 2.0]` has target `y = 1.0`. Hidden layer weights are `W1 = [[0.5, -0.5], [1.0, -1.0]]` (shape `2x2`), `b1 = [0.0, 0.0]`, and output weights are `W2 = [[1.0], [1.0]]` (shape `2x1`), `b2 = [0.0]`, using Squared Error loss `L = 0.5 * (y_hat - y)^2` for crystal-clear hand arithmetic.',
        '**Forward Pass:** Compute pre-activation `z1 = x @ W1 + b1`: neuron 0 receives `1.0*0.5 + 2.0*1.0 = 2.5`; neuron 1 receives `1.0*(-0.5) + 2.0*(-1.0) = -2.5`. Passing through `ReLU(z) = max(0, z)` yields hidden vector `h = [2.5, 0.0]`—notice neuron 1 turned completely off (`0.0`) because its input was negative! Next, output prediction is `y_hat = h @ W2 + b2 = 2.5*1.0 + 0.0*1.0 + 0.0 = 2.5`. Loss equals `0.5 * (2.5 - 1.0)^2 = 0.5 * 2.25 = 1.125`.',
        '**Backward Pass:** Start at the output derivative: `dy_hat = y_hat - y = 2.5 - 1.0 = +1.5`. Output bias gradient is `db2 = +1.5`. Output weight gradients multiply incoming `h.T`: `dW2 = [[2.5], [0.0]] * 1.5 = [[3.75], [0.0]]`. Now send error backward into hidden activations: `dh = dy_hat @ W2.T = 1.5 * [1.0, 1.0] = [1.5, 1.5]`. Multiply by the ReLU gate `(z1 > 0) = [1, 0]`: `dz1 = [1.5 * 1, 1.5 * 0] = [1.5, 0.0]`. Notice how neuron 1 receives **zero gradient** because `ReLU(-2.5)` blocked the path! Finally `dW1 = x.T @ dz1 = [[1.0], [2.0]] @ [[1.5, 0.0]] = [[1.5, 0.0], [3.0, 0.0]]` and `db1 = [1.5, 0.0]`. With `lr = 0.1`, updated `W2_new = [[1.0 - 0.375], [1.0 - 0.0]] = [[0.625], [1.0]]`, pulling `y_hat` immediately down toward `1.0`!',
      ],
    },
    {
      type: 'visual-diagram',
      diagramId: 'neural-backprop',
      title: 'Visual Architecture: Forward Pass Predictions & Backpropagation Gradients',
      caption: 'Activations flow left-to-right to produce logits and loss; Chain Rule gradients flow right-to-left using transposed weight matrices (`W.T`).',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Comparing ReLU, GELU, and SwiGLU + Initialization Rules',
      paragraphs: [
        'Look closely at what happened to neuron 1 above when `z1 = -2.5`: its ReLU gradient collapsed to `0.0`. If an aggressive learning rate kicks a neuron’s weights negative for EVERY sample in the dataset, that neuron outputs `0.0` forever and never recovers—the classic **Dying ReLU** problem! In modern Transformers (`GPT`, `BERT`, `Llama`, `Qwen`), sharp `max(0, z)` is replaced by smooth **GELU** (`z * Phi(z)`) or gated **SwiGLU** (`SiLU(x @ W_gate) * (x @ W_val)`), both of which retain gentle non-zero derivatives slightly below zero and smooth optimization landscapes.',
        'Just as critical is **weight initialization**. Never initialize hidden weights to `0.0`: if every neuron in layer 1 starts with identical zero weights, every neuron computes identical activations and receives identical gradients forever (**symmetry collapse**), reducing 512 neurons to 1 effective neuron! Conversely, initializing weights with huge random variance (`N(0, 5.0)`) causes activations and gradients to explode across layers. **He (Kaiming) initialization** (`std = sqrt(2 / fan_in)` for ReLU, accounting for ReLU zeroing half the negatives) and **Xavier/Glorot initialization** (`std = sqrt(1 / fan_in)` or `sqrt(2 / (fan_in + fan_out))` for Tanh/Linear/GELU) keep activation variance near `1.0` across depth.',
      ],
    },
    {
      type: 'table',
      title: 'Modern Neural Network Activation Functions',
      headers: ['Activation', 'Formula / Behavior', 'Gradient for `z < 0`', 'Where Used'],
      rows: [
        ['**ReLU**', '`max(0, z)`', 'Exact `0` (risks Dying ReLU)', 'Classic CNNs, fast lightweight MLPs'],
        ['**LeakyReLU**', '`max(0.01*z, z)`', 'Small `0.01` slope (prevents death)', 'Vision GANs, robust small MLPs'],
        ['**GELU**', '`z * norm_cdf(z)` smooth curve', 'Smooth tiny negative curve', 'BERT, GPT-2/3, Vision Transformers'],
        ['**SwiGLU**', '`SiLU(x W_g) * (x W_v)` gated bilinear', 'Smooth non-zero negative tail', 'Llama-3, Mistral, Qwen, Gemma FFNs'],
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'neural-net',
      title: 'Interactive Lab: Live Neural Network Decision Boundary Playground',
      description:
        'Train a real 2-layer neural network in your browser on XOR, Circle, or Spiral datasets! Toggle Linear vs ReLU vs Tanh activations and hidden width to watch non-linear boundaries form.',
    },
    {
      type: 'prose',
      heading: 'Common MLP & Backprop Mistakes & How to Debug Them',
      paragraphs: [
        '1) Initializing hidden layers with `np.zeros((d_in, d_out))`: loss decreases briefly via output bias `b2`, then stalls completely while all hidden rows stay clones of each other. Always initialize weights randomly (`He` / `Xavier`) while initializing biases to `0.0`.',
        '2) Applying `ReLU` on the final output layer of a regression or binary classification model: if target values can be negative or logits represent log-odds (`z < 0` for `p < 0.5`), clamping outputs at zero kills half your predictions! Keep the final linear output layer un-activated (`raw logits`) before passing into MSE or `Sigmoid` / `Softmax` loss.',
        '3) Missing the `1 / batch_size` normalization factor on loss gradients (`dz2 = (out - y) / len(X)`): omitting `/ len(X)` makes gradient magnitude grow linearly with batch size, causing `lr = 0.2` to work on batch `4` and explode to `NaN` on batch `256`!',
        '4) Confusing matrix transpose shapes (`dW2 = h.T @ dz2` vs `dh = dz2 @ W2.T`): verify every backward gradient shape equals the exact shape of its parameter (`dW2.shape == W2.shape`) and check custom NumPy gradients once against central finite differences (`(L(w+eps) - L(w-eps)) / (2*eps)`).',
        '5) Feeding unstandardized features (`salary = 100,000` vs `age = 30`) directly into MLPs: large raw inputs saturate `Sigmoid`/`Tanh` outputs immediately where derivatives approach zero (`sigma\'(z) ~ 0`), halting early weight updates until inputs are normalized cleanly.',
        '6) Launching a full 50-epoch run before testing **"overfit a single tiny 4-row batch"**: whenever you implement a custom MLP or loss function, verify that it drives training loss near `0.00` on 4 examples inside 300 iterations first—if a network cannot memorize 4 clean points, either your learning rate, sign, transpose shape, or activation gate has a bug.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 4.1 Recap: Neural Network Mechanics',
      body: '- Stacking linear layers without non-linearity collapses algebraically into one matrix `W_combined @ x`.\n- Backprop passes output gradients backward via transposes (`dh = dz2 @ W2.T`) gated by local activation derivatives (`z1 > 0`).\n- Never zero-initialize neural weights (symmetry collapse); use He (`sqrt(2/fan_in)`) for ReLU and Xavier for smooth activations.\n- Modern LLMs prefer smooth GELU or gated SwiGLU over sharp ReLU to eliminate dead neurons.\n- Keep final logits raw before loss/Sigmoid and divide batch gradients cleanly by `len(X)`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-4-1-linear-collapse',
      difficulty: 'guided',
      requires: ['matrices', 'numpy-arrays'],
      title: 'Lab 4.1A: Verify Linear Collapse vs Single-Matrix Equivalence',
      prompt:
        'Prove mathematically in code that stacking two un-activated linear layers `h = X @ W1 + b1; y = h @ W2 + b2` collapses identically to one single linear transform `X @ W_eff + b_eff`. Implement `collapse_two_linear_layers(W1, b1, W2, b2)` returning `(W_eff, b_eff)`.',
      starterCode: `import numpy as np

def collapse_two_linear_layers(W1: np.ndarray, b1: np.ndarray, W2: np.ndarray, b2: np.ndarray):
    # Return (W_eff, b_eff) such that (X @ W1 + b1) @ W2 + b2 == X @ W_eff + b_eff
    pass`,
      testCode: `import numpy as np
rng = np.random.default_rng(42)
X = rng.normal(size=(12, 4))
W1 = rng.normal(size=(4, 7)); b1 = rng.normal(size=(1, 7))
W2 = rng.normal(size=(7, 3)); b2 = rng.normal(size=(1, 3))
deep_out = (X @ W1 + b1) @ W2 + b2
W_eff, b_eff = collapse_two_linear_layers(W1, b1, W2, b2)
assert W_eff.shape == (4, 3) and b_eff.shape == (1, 3)
assert np.allclose(deep_out, X @ W_eff + b_eff, atol=1e-7)
print("PASS: Deep linear network collapsed identically to 1 linear matrix W_eff @ x + b_eff!")`,
      solutionCode: `import numpy as np

def collapse_two_linear_layers(W1: np.ndarray, b1: np.ndarray, W2: np.ndarray, b2: np.ndarray):
    W_eff = W1 @ W2
    b_eff = b1 @ W2 + b2
    return W_eff, b_eff`,
      hint: 'Expand `(X @ W1 + b1) @ W2 + b2` algebraically: `X @ (W1 @ W2) + (b1 @ W2 + b2)`.',
      hints: [
        'Distribute `@ W2` across both `X @ W1` and `b1`.',
        'Set `W_eff = W1 @ W2`.',
        'Set `b_eff = b1 @ W2 + b2`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-4-1',
      difficulty: 'spec',
      requires: ['chain-rule', 'mlp-nonlinearity'],
      title: 'Lab 4.1B: Backpropagation Through a 2-Layer ReLU MLP (XOR)',
      prompt:
        'Complete the backward pass for a 2-layer ReLU MLP solving XOR (`z1 = X @ W1 + b1`, `h = np.maximum(0.0, z1)`, `out = sigmoid(h @ W2 + b2)`). Given `dz2 = (out - y) / len(X)`, compute `dW2`, `db2`, `dh`, `dz1`, `dW1`, `db1` and update `W2, b2, W1, b1`.',
      starterCode: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def train_xor(steps: int = 2000, lr: float = 0.5):
    rng = np.random.default_rng(7)
    X = np.array([[0.,0.], [0.,1.], [1.,0.], [1.,1.]])
    y = np.array([[0.], [1.], [1.], [0.]])
    W1 = rng.normal(0, 0.8, (2, 6))
    b1 = np.zeros((1, 6))
    W2 = rng.normal(0, 0.8, (6, 1))
    b2 = np.zeros((1, 1))

    for _ in range(steps):
        z1 = X @ W1 + b1
        h = np.maximum(0.0, z1)
        out = sigmoid(h @ W2 + b2)

        dz2 = (out - y) / len(X)
        # TODO: compute dW2, db2, dh, dz1, dW1, db1 and update weights & biases
        pass
    return sigmoid(np.maximum(0.0, X @ W1 + b1) @ W2 + b2)

print(np.round(train_xor(), 3))`,
      testCode: `import numpy as np
preds = train_xor(steps=3000, lr=0.5).ravel()
assert preds[0] < 0.1 and preds[3] < 0.1, f"(0,0) and (1,1) must be ~0, got {preds[[0,3]]}"
assert preds[1] > 0.9 and preds[2] > 0.9, f"(0,1) and (1,0) must be ~1, got {preds[[1,2]]}"
print("PASS: Pure-NumPy MLP solved non-linear XOR via backpropagation!")`,
      solutionCode: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def train_xor(steps: int = 2000, lr: float = 0.5):
    rng = np.random.default_rng(7)
    X = np.array([[0.,0.], [0.,1.], [1.,0.], [1.,1.]])
    y = np.array([[0.], [1.], [1.], [0.]])
    W1 = rng.normal(0, 0.8, (2, 6))
    b1 = np.zeros((1, 6))
    W2 = rng.normal(0, 0.8, (6, 1))
    b2 = np.zeros((1, 1))

    for _ in range(steps):
        z1 = X @ W1 + b1
        h = np.maximum(0.0, z1)
        out = sigmoid(h @ W2 + b2)

        dz2 = (out - y) / len(X)
        dW2 = h.T @ dz2
        db2 = dz2.sum(axis=0, keepdims=True)
        dh = dz2 @ W2.T
        dz1 = dh * (z1 > 0)
        dW1 = X.T @ dz1
        db1 = dz1.sum(axis=0, keepdims=True)

        W2 -= lr * dW2
        b2 -= lr * db2
        W1 -= lr * dW1
        b1 -= lr * db1
    return sigmoid(np.maximum(0.0, X @ W1 + b1) @ W2 + b2)`,
      hint: 'Matrix transpose reverses forward flow: `dW2 = h.T @ dz2`, `dh = dz2 @ W2.T`, `dz1 = dh * (z1 > 0)`, `dW1 = X.T @ dz1`.',
      hints: [
        'Use `dW2 = h.T @ dz2` and `db2 = dz2.sum(axis=0, keepdims=True)`.',
        'Propagate back through `W2` (`dh = dz2 @ W2.T`), then apply the ReLU derivative mask `(z1 > 0)`.',
        'Compute `dW1 = X.T @ dz1`, `db1 = dz1.sum(axis=0, keepdims=True)`, and subtract `lr * grad` from all four arrays.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-4-1-relu-debug',
      difficulty: 'debug',
      requires: ['backpropagation-chain-rule'],
      title: 'Lab 4.1C: Debug Zero-Initialization Symmetry Collapse',
      prompt:
        'The starter MLP initializes `W1 = np.zeros(...)` and `W2 = np.zeros(...)`, trapping all 8 hidden neurons in exact identical symmetry so XOR fails completely around `0.50`! Fix `init_and_train_mlp(seed=42)` using He initialization (`std = np.sqrt(2.0 / fan_in)`) so all four XOR predictions separate cleanly (`<0.15` for 0/3, `>0.85` for 1/2).',
      starterCode: `import numpy as np

def _sig(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def init_and_train_mlp(seed: int = 42):
    rng = np.random.default_rng(seed)
    X = np.array([[0.,0.], [0.,1.], [1.,0.], [1.,1.]])
    y = np.array([[0.], [1.], [1.], [0.]])
    # BUG: zero-init traps every hidden neuron in permanent symmetry!
    W1 = np.zeros((2, 8))
    b1 = np.zeros((1, 8))
    W2 = np.zeros((8, 1))
    b2 = np.zeros((1, 1))
    for _ in range(2500):
        z1 = X @ W1 + b1
        h = np.maximum(0.0, z1)
        out = _sig(h @ W2 + b2)
        dz2 = (out - y) / len(X)
        dW2 = h.T @ dz2; db2 = dz2.sum(axis=0, keepdims=True)
        dz1 = (dz2 @ W2.T) * (z1 > 0)
        dW1 = X.T @ dz1; db1 = dz1.sum(axis=0, keepdims=True)
        W2 -= 0.5 * dW2; b2 -= 0.5 * db2; W1 -= 0.5 * dW1; b1 -= 0.5 * db1
    return _sig(np.maximum(0.0, X @ W1 + b1) @ W2 + b2).ravel()`,
      testCode: `import numpy as np
for s in (42, 7, 123):
    preds = init_and_train_mlp(seed=s)
    assert preds[0] < 0.15 and preds[3] < 0.15, f"Seed {s}: negatives too high: {preds}"
    assert preds[1] > 0.85 and preds[2] > 0.85, f"Seed {s}: positives too low: {preds}"
print("PASS: He random initialization broke symmetry cleanly across all tested seeds!")`,
      solutionCode: `import numpy as np

def _sig(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def init_and_train_mlp(seed: int = 42):
    rng = np.random.default_rng(seed)
    X = np.array([[0.,0.], [0.,1.], [1.,0.], [1.,1.]])
    y = np.array([[0.], [1.], [1.], [0.]])
    W1 = rng.normal(0.0, np.sqrt(2.0 / 2), size=(2, 8))
    b1 = np.zeros((1, 8))
    W2 = rng.normal(0.0, np.sqrt(2.0 / 8), size=(8, 1))
    b2 = np.zeros((1, 1))
    for _ in range(2500):
        z1 = X @ W1 + b1
        h = np.maximum(0.0, z1)
        out = _sig(h @ W2 + b2)
        dz2 = (out - y) / len(X)
        dW2 = h.T @ dz2; db2 = dz2.sum(axis=0, keepdims=True)
        dz1 = (dz2 @ W2.T) * (z1 > 0)
        dW1 = X.T @ dz1; db1 = dz1.sum(axis=0, keepdims=True)
        W2 -= 0.5 * dW2; b2 -= 0.5 * db2; W1 -= 0.5 * dW1; b1 -= 0.5 * db1
    return _sig(np.maximum(0.0, X @ W1 + b1) @ W2 + b2).ravel()`,
      hint: 'Replace `np.zeros` on `W1` and `W2` with `rng.normal(0.0, np.sqrt(2.0 / fan_in), size=...)` while keeping `b1`/`b2` at zeros.',
      hints: [
        'Use `fan_in = 2` for `W1` (`std = np.sqrt(2.0 / 2) = 1.0`).',
        'Use `fan_in = 8` for `W2` (`std = np.sqrt(2.0 / 8) = 0.5`).',
        'Keep biases `b1` and `b2` initialized to `np.zeros(...)`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q4-1-1',
      type: 'multiple-choice',
      question: 'What happens if you initialize ALL weights of a multi-layer neural network to `0.0`?',
      options: [
        'Every neuron in a hidden layer stays identical forever (symmetry collapse)',
        'The neural network converges roughly twice as fast because weights start centered cleanly near the origin',
        'ReLU activations transform automatically into smooth Sigmoid curves across negative hidden inputs',
        'The optimizer step size scales toward infinity during the initial backward propagation pass',
      ],
      correctIndex: 0,
      explanation: 'Zero initialization makes every hidden unit emit identical zeros and receive identical gradient updates forever; He/Xavier random initialization breaks symmetry.',
    },
    {
      id: 'q4-1-2',
      type: 'multiple-choice',
      question: 'Without non-linear activation functions (ReLU/GELU/Tanh), what is a 50-layer MLP mathematically equivalent to?',
      options: [
        'A sparse Mixture-of-Experts Transformer capable of approximating arbitrary curved spirals cleanly',
        'A Convolutional Neural Network invariant to horizontal and vertical pixel shifts',
        'An ensemble of 50 boosted decision trees partitioning feature space into axis-aligned boxes',
        'A single linear matrix transform `W x + b`',
      ],
      correctIndex: 3,
      explanation: 'Multiplying consecutive linear matrices `W_50 ... W_1 x` collapses algebraically into one linear transform `W_combined x`, incapable of fitting XOR or curved boundaries.',
    },
    {
      id: 'q4-1-3',
      type: 'multiple-choice',
      question: 'What causes the classic "Dying ReLU" problem during MLP training?',
      options: [
        'All training samples yield negative pre-activations (`z < 0`), locking ReLU gradients at zero',
        'ReLU activations exceed `1.0` continuously during inference when `StandardScaler` is omitted from preprocessing',
        'Mini-batch sizes above `64` prevent PyTorch autograd from differentiating piecewise functions cleanly',
        'Floating-point weights turn automatically into truncated 8-bit integers after epoch 5 completes',
      ],
      correctIndex: 0,
      explanation: 'When `z <= 0` for every input, `ReLU(z) = 0` and `d(ReLU)/dz = 0`, permanently stopping gradient flow into that neuron; GELU/LeakyReLU avoid hard zero slopes.',
    },
    {
      id: 'q4-1-4',
      type: 'numeric',
      question: 'In Worked Example 1, hidden pre-activations were `z1 = [2.5, -2.5]`, `W2 = [[1.0], [1.0]]`, and output error `dy_hat = +1.5`. What is the exact ReLU-gated gradient `dz1[0]` for neuron 0?',
      options: [],
      correctIndex: 0,
      correctNumber: 1.5,
      tolerance: 0.01,
      unit: '',
      explanation: '`dh = 1.5 * [1.0, 1.0] = [1.5, 1.5]`; because `z1[0] = 2.5 > 0`, neuron 0 passes full gradient `1.5 * 1 = 1.5` (while `z1[1] = -2.5 <= 0` gets `0.0`).',
    },
    {
      id: 'q4-1-5',
      type: 'predict-output',
      question: 'Given hidden activations `h` of shape `(16, 32)` and weights `W2` of shape `(32, 5)`, what must `dW2.shape` and `dh.shape` equal during backprop?',
      options: [
        '`dW2`: `(16, 5)` and `dh`: `(32, 32)` because backward transpose preserves batch axis inside `W2`',
        '`dW2`: `(16, 32)` and `dh`: `(16, 5)` matching the incoming forward projection order directly',
        '`dW2`: `(5, 32)` and `dh`: `(32, 16)` because reverse-mode AD flips every tensor axis unconditionally',
        '`dW2`: `(32, 5)` and `dh`: `(16, 32)`',
      ],
      correctIndex: 3,
      explanation: 'Gradient shapes always match their respective tensors: `dW2 = h.T @ dz2` has shape `(32, 16) @ (16, 5) = (32, 5) == W2.shape`, and `dh = dz2 @ W2.T` has shape `(16, 32) == h.shape`.',
    },
    {
      id: 'q4-1-6',
      type: 'spot-bug',
      question: 'Why does changing batch size from `4` to `256` cause this backprop loop to diverge to `NaN` immediately?',
      code: `out = sigmoid(h @ W2 + b2)
dz2 = out - y  # forgot / len(X)
dW2 = h.T @ dz2
W2 -= lr * dW2`,
      options: [
        '`sigmoid` overflows to infinity whenever input batches exceed sixty-four examples simultaneously',
        '`h.T @ dz2` cannot multiply rectangular matrices unless `len(X)` equals an integer power of two',
        'Omitting `/ len(X)` scales gradients 64x larger on batch `256`, exploding `W2`',
        'Updating `W2 -= lr * dW2` adds gradients upward instead of descending loss when `dz2` is positive',
      ],
      correctIndex: 2,
      explanation: 'Averaging loss across the batch (`(out - y) / len(X)`) keeps gradient step magnitude independent of mini-batch size.',
    },
    {
      id: 'q4-1-7',
      type: 'multi-select',
      question: 'Which two activation choices directly avoid Dying ReLU neurons in modern LLM feed-forward blocks?',
      options: [
        'Smooth **GELU** (`z * Phi(z)`) retaining continuous non-zero gradients near zero',
        'Gated **SwiGLU** combining smooth SiLU gating with a linear value projection',
        'Applying sharp `ReLU` twice consecutively (`ReLU(ReLU(z))`) inside every hidden block',
        'Initializing all weights strictly to `-5.0` before the first epoch starts',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'GELU and SwiGLU retain smooth non-zero derivatives across negative inputs, unlike hard `max(0, z)`.',
    },
    {
      id: 'q4-1-8',
      type: 'multiple-choice',
      question: 'Why does **He (Kaiming) initialization** set `std = sqrt(2 / fan_in)` instead of `sqrt(1 / fan_in)` for ReLU layers?',
      options: [
        'To force every hidden weight to exceed `1.0` before backpropagation begins training',
        'Because ReLU zeroes roughly half of inputs (`variance halved`), so the factor `2` keeps output variance near `1.0`',
        'Because Python `np.random` divides standard deviations automatically by two whenever `size` is 2D',
        'Because Sigmoid classification heads require doubling all preceding layer weights for calibration',
      ],
      correctIndex: 1,
      explanation: 'ReLU zeros out negative half-spaces, halving activation variance per layer; scaling variance by `2 / fan_in` preserves unit signal strength across deep layers.',
    },
    {
      id: 'q4-1-9',
      type: 'ordering',
      question: 'Order one complete forward and backward pass through a 2-layer ReLU binary classifier:',
      items: [
        'Compute hidden pre-activations `z1 = X @ W1 + b1` and ReLU `h = max(0, z1)`',
        'Compute output probabilities `out = sigmoid(h @ W2 + b2)`',
        'Compute normalized output gradient `dz2 = (out - y) / len(X)` and `dW2, db2`',
        'Backprop through `W2` and gate by `(z1 > 0)` to obtain `dz1`, `dW1`, `db1`',
        'Update all weights and biases opposite gradients scaled by `lr`',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Forward layer 1 -> forward output -> output loss gradient -> reverse-mode transpose + ReLU gate -> parameter update.',
    },
  ],
};
