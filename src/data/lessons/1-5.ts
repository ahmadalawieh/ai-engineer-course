import type { Lesson } from '@/types/course';

export const lesson1_5: Lesson = {
  id: '1-5',
  moduleId: 'mod-1',
  number: '1.5',
  title: 'Calculus Intuition, Chain Rule, Gradients & Optimizers',
  subtitle: 'Walk downhill on real loss curves—solve derivatives and Chain Rule steps numerically by hand, verify them with finite differences in NumPy, and diagnose divergence.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['1.4'],
  requires: ['vectors', 'matrices'],
  teaches: [
    'derivatives',
    'chain-rule',
    'gradient-descent',
    'adam-optimizer',
  ],
  objectives: [
    'Interpret derivatives and gradients geometrically as slopes pointing in the direction of steepest ascent.',
    'Compute single-step gradient updates and multi-layer Chain Rule derivatives numerically by hand and verify them against finite differences in NumPy.',
    'Implement gradient descent from scratch and choose learning rates that converge cleanly instead of diverging.',
    'Contrast Vanilla SGD, Momentum, and Adam/AdamW adaptive per-parameter updates on steep ravines and flat valleys.',
  ],
  checkWithoutNotes: [
    'Given $L(w) = (w - 4)^2$ starting at $w_0 = 1$ with learning rate $\\eta = 0.25$, compute $dL/dw$ and the updated weight $w_1$ by hand.',
    'Why do optimizers compute `w = w - lr * grad` (subtracting) instead of adding `grad`?',
    'Explain how finite-difference gradient checking (`(L(w + eps) - L(w - eps)) / (2 * eps)`) catches math bugs in custom derivatives.',
    'What extra state per weight does Adam maintain beyond Momentum, and why does that tame narrow steep ravines?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Every time you fine-tune a small classifier, train a LoRA adapter, or diagnose why training loss suddenly prints `NaN` at epoch 2, you are watching calculus and optimization work underneath the hood. PyTorch computes exact derivatives automatically via `loss.backward()`, yet PyTorch cannot choose a sane learning rate, detect exploding gradients, or notice when a custom loss function silently breaks gradient flow.',
        'Engineers who understand derivatives intuitively—without drowning in symbolic integrals—diagnose training runs ten times faster. By solving small numeric examples by hand and cross-checking analytical derivatives against numerical finite differences in NumPy, you turn backpropagation and Adam from black-box magic into transparent arithmetic.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Walking Downhill in Dense Fog',
      paragraphs: [
        'Imagine standing blindfolded on a hilly terrain representing a **loss function** $L(\\mathbf{w})$: altitude equals prediction error, and your east-west / north-south coordinates are model weights $\\mathbf{w}$. You want to walk to the lowest valley, yet thick fog hides the full map. What can you feel right under your boots? **Slope!**',
        'A **derivative** $\\frac{dL}{dw}$ measures how fast error rises when nudging weight $w$ slightly positive. If the slope is positive (`+6`), stepping right walks *uphill*, so we step **left** (subtract!). If we tune several weights at once, stacking all partial slopes side by side forms the **gradient vector** $\\nabla_{\\mathbf{w}} L$, which always points straight uphill in the direction of steepest climb. Stepping opposite—`w_new = w_old - lr * grad`—walks straight downhill.',
        'Now trace how **backpropagation** uses the **Chain Rule**. A multi-layer network chains steps together: `z = w * x`, `pred = max(0, z)`, `loss = (pred - y)**2`. Asking "how much does changing early weight `w` alter final `loss`?" multiplies local sensitivities along the chain like interlocking gears: if turning gear `w` by 1 nudges `z` by `x`, and `z` nudges `loss` by `g`, total sensitivity is simply `g * x`.',
      ],
    },
    {
      type: 'math',
      title: 'Gradient Descent & Chain Rule Equations',
      latex: '\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla_{\\mathbf{w}} L(\\mathbf{w}_t) \\qquad \\frac{\\partial L}{\\partial w_1} = \\frac{\\partial L}{\\partial a_2} \\cdot \\frac{\\partial a_2}{\\partial a_1} \\cdot \\frac{\\partial a_1}{\\partial w_1}',
      breakdown: [
        { symbol: '\\mathbf{w}_t', meaning: 'Current weight vector at step $t$' },
        { symbol: '\\eta', meaning: 'Learning rate (step multiplier): too small crawls slowly; too large overshoots walls and diverges' },
        { symbol: '\\nabla_{\\mathbf{w}} L', meaning: 'Gradient vector $[\\frac{\\partial L}{\\partial w_1}, \\dots, \\frac{\\partial L}{\\partial w_p}]$ pointing steeply uphill' },
      ],
      intuition:
        '**Momentum** keeps a rolling velocity average so bumps cancel out. **Adam** tracks both velocity (1st moment) AND squared gradient magnitude (2nd moment) per parameter—shrinking step sizes on super-steep weights while boosting gentle flat weights.',
    },
    {
      type: 'concept-reel',
      reelId: 'gradient-descent-reel',
      title: 'Animated Walkthrough: Watch Gradient Descent Slide Down an Error Valley',
      description: 'See step-by-step how subtracting `lr * gradient` shrinks steep errors automatically toward the bottom minimum.',
    },
    {
      type: 'simulator',
      simulatorId: 'gradient-descent',
      title: 'Interactive Lab: Optimizer Race on Non-Convex Loss Surfaces',
      description:
        'Choose a loss landscape (Ravine, Saddle Point, or Double Well), tune the learning rate $\\eta$, and compare SGD, Momentum, and Adam step-by-step.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Hand-Solved Chain Rule + Finite-Difference Check in NumPy',
      paragraphs: [
        'Take a concrete scalar example solved completely by hand: input $x = 2.0$, target $y = 5.0$, initial weight $w = 1.0$, prediction $\\hat{y} = w \\cdot x = 2.0$, and squared error $L = (\\hat{y} - y)^2 = (2 - 5)^2 = 9.0$. How sensitive is $L$ to $w$?',
        'By the Chain Rule: outer derivative $\\frac{\\partial L}{\\partial \\hat{y}} = 2(\\hat{y} - y) = 2(2 - 5) = -6.0$, and inner derivative $\\frac{\\partial \\hat{y}}{\\partial w} = x = 2.0$. Multiplying gives $\\frac{dL}{dw} = (-6.0)(2.0) = -12.0$! Notice the negative sign tells us increasing $w$ *reduces* error (since prediction $2$ is below target $5$). With learning rate $\\eta = 0.1$, one step sets $w_{\\text{new}} = 1.0 - (0.1)(-12.0) = 2.2$, dropping prediction error from $9.0$ straight down to $(4.4 - 5)^2 = 0.36$!',
        'Verify both the exact Chain Rule AND a tiny **numerical finite difference** $\\frac{L(w + \\epsilon) - L(w - \\epsilon)}{2\\epsilon}$ in NumPy below:',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Verifying Chain Rule vs Finite Difference in NumPy',
      language: 'python',
      code: `import numpy as np

def loss_fn(w: float, x: float = 2.0, y: float = 5.0) -> float:
    return float((w * x - y) ** 2)

w, x, y, lr = 1.0, 2.0, 5.0, 0.1
y_hat = w * x
grad_chain = 2.0 * (y_hat - y) * x

eps = 1e-5
grad_numeric = (loss_fn(w + eps) - loss_fn(w - eps)) / (2 * eps)

w_next = w - lr * grad_chain
print(f"Initial loss : {loss_fn(w):.2f}")
print(f"Chain grad   : {grad_chain:.4f} | Numeric grad: {grad_numeric:.4f}")
print(f"Updated w    : {w_next:.2f} | Next loss: {loss_fn(w_next):.2f}")`,
      caption: 'Explained output: `Initial loss: 9.00`, `Chain grad: -12.0000 | Numeric grad: -12.0000`, `Updated w: 2.20 | Next loss: 0.36`. Finite-difference checking proves your hand Chain Rule formula has zero sign or factor bugs!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Why Steep Axes Explode SGD & How Momentum/Adam Help',
      paragraphs: [
        'Consider $f(x, y) = (x - 3)^2 + 4(y + 2)^2$. Along $x$, curvature is gentle ($\\frac{\\partial f}{\\partial x} = 2(x - 3)$); along $y$, the valley wall is 4× steeper ($\\frac{\\partial f}{\\partial y} = 8(y + 2)$). If you pick $\\eta = 0.3$ trying to speed up slow progress along $x$, then along $y$ every update becomes $y_{t+1} + 2 = (1 - 0.3 \\times 8)(y_t + 2) = -1.4(y_t + 2)$—amplifying distance by $1.4\\times$ every single step until `y` explodes toward $\\pm\\infty$ (`NaN`)!',
        'Watch below how keeping `lr = 0.1` converges smoothly, whereas **Adam** divides each parameter\'s velocity by $\\sqrt{\\text{variance} + \\epsilon}$ automatically so steep coordinates get tamed while gentle coordinates keep steady stride.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Vectorized 2D Gradient Descent Converging to Minimum',
      language: 'python',
      code: `import numpy as np

pos = np.array([0.0, 0.0])  # [x, y]
lr = 0.1
for step in range(40):
    grad = np.array([2.0 * (pos[0] - 3.0), 8.0 * (pos[1] + 2.0)])
    pos = pos - lr * grad

print("Final [x, y]  :", np.round(pos, 5))
print("Grad norm left:", round(float(np.linalg.norm(grad)), 6))`,
      caption: 'Explained output: `Final [x, y]: [ 2.9996  -2.     ]` and `Grad norm left: 0.0010...`—converging directly toward the true minimum `(3.0, -2.0)`!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Full ReLU Computational Graph, Saddle Points & Gradient Clipping',
      paragraphs: [
        'Trace one complete neural-network computational graph numerically: suppose $x = 2.0$, $w = -1.0$, $b = 3.0$, pre-activation $z = w x + b = (-1)(2) + 3 = 1.0$, ReLU activation $a = \\max(0, z) = 1.0$, and squared loss $L = (a - 2.0)^2 = 1.0$. Working strictly backward: $\\frac{\\partial L}{\\partial a} = 2(a - 2) = -2.0$. Because $z = 1.0 > 0$, ReLU\'s local slope is $1.0$ (if $z \\le 0$, slope is $0.0$—which is why "dead ReLU" neurons stop receiving gradients!), giving $\\frac{\\partial L}{\\partial z} = -2.0 \\times 1.0 = -2.0$. Finally, $\\frac{\\partial L}{\\partial w} = -2.0 \\times x = -4.0$ and $\\frac{\\partial L}{\\partial b} = -2.0 \\times 1 = -2.0$.',
        'In deep networks and Transformers, two practical stabilizers protect that loop: **gradient norm clipping** (`clip_grad_norm_(params, max_norm=1.0)`) shrinks unusually spiky batch gradients proportionally so a weird outlier sequence never blows up weights, and **learning rate warmup + cosine decay** starts gently during early unstable steps before annealing smoothly toward the minimum. Whenever training prints sudden `NaN` spikes around batch 300, inspecting the unclipped gradient norm immediately reveals whether exploding steps triggered float overflow.',
        'Note also **saddle points** and **convex vs non-convex valleys**: classical linear regression ($MSE$) is convex with a single global bowl, whereas deep networks traverse rolling hills dotted with flat saddle plateaus where slope nears zero along one axis while dropping down others. Momentum and Adam glide across flat directions smoothly without stalling on shallow noise.',
        'For day-to-day calculus intuition, remember only three derivative rules by hand: constants have zero slope ($\\frac{d}{dw}(7) = 0$), linear terms keep their coefficient ($\\frac{d}{dw}(5w) = 5$), and powers drop the exponent in front ($\\frac{d}{dw}(w^2) = 2w$, so $\\frac{d}{dw}((w - 3)^2) = 2(w - 3)$). Almost every loss slope in ML reduces to combining those three rules with the Chain Rule.',
        'Finally, notice why modern PyTorch training scripts choose **`AdamW`** rather than plain `Adam`: decoupling L2 **weight decay** (gently pulling huge weights slightly closer to zero on every step to curb overfitting) prevents adaptive step-size scaling from accidentally weakening regularization on busy weights.',
        'Keep one more intuition clear: **full-batch vs mini-batch gradient descent**. Computing exact gradients over 1,000,000 training rows for a single weight step is too slow and eats GPU memory; instead, **Stochastic / Mini-batch SGD** averages gradients across small random shuffles of `32`–`256` examples per step, updating weights thousands of times per epoch while mild batch noise actually helps models generalize instead of memorizing brittle narrow minima. When GPU VRAM limits micro-batches to size `8`, engineers sum gradients over `4` steps before calling `optimizer.step()` (**gradient accumulation**), matching an effective batch size of `32` identically.',
        'Before diving into labs, always verify your loss decreases smoothly on a tiny 4-example sanity batch first ("overfit one batch"): if gradient descent cannot drive training error near zero on 4 fixed rows, a sign bug, disconnected graph, or missing `zero_grad()` lurks inside the loop.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Adding the gradient instead of subtracting:** Writing `w = w + lr * grad` climbs *uphill* toward infinite loss on step 1! Always subtract `w -= lr * grad`.',
        '**Mistake 2 — Setting learning rate too high without watching validation loss:** If training loss jumps upward or becomes `NaN` within the first 10 steps, cut `lr` by `3x–10x` and check for exploding gradients (`clip_grad_norm`).',
        '**Mistake 3 — Forgetting the inner multiplier in the Chain Rule:** In `loss = (w*x - y)**2`, beginners frequently write `2*(w*x - y)` and omit `* x`! Always trace every inner variable and cross-check once against numeric finite difference `(f(w+eps)-f(w-eps))/(2*eps)`.',
        '**Mistake 4 — Stopping when loss looks flat before checking learning rate too low:** A tiny `lr = 1e-7` produces a nearly flat curve that merely inches downward; inspect `grad_norm` and test 3× higher learning rates on a tiny batch.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Gradient = steepest uphill arrow:** Subtract `lr * grad` to step downhill toward minimum loss.',
        '2. **Chain Rule = multiplying local slopes backward:** Backpropagation computes exact parameter sensitivities layer by layer.',
        '3. **Verify math numerically:** Finite differences `(f(w+eps)-f(w-eps))/(2*eps)` catch analytical gradient bugs instantly.',
        '4. **Steep curvature caps max SGD `lr`:** Overshooting high-curvature walls causes oscillation and `NaN` explosion.',
        '5. **Adam adapts step scale per parameter:** Tracking both 1st (momentum) and 2nd (squared gradient) moments stabilizes deep-network training.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-5-1',
      difficulty: 'guided',
      requires: ['derivatives', 'gradient-descent'],
      title: 'Lab 1.5.1 (Guided): 2D Gradient Descent From Scratch',
      prompt:
        'Minimize $f(x, y) = (x - 3)^2 + 4(y + 2)^2$. Implement `run_gd(lr=0.1, steps=80)` starting from `(0.0, 0.0)` and returning the final `(x, y)` tuple of floats.',
      starterCode: `def run_gd(lr: float = 0.1, steps: int = 80) -> tuple[float, float]:
    x, y = 0.0, 0.0
    for _ in range(steps):
        # Compute partial derivatives dx = 2*(x - 3) and dy = 8*(y + 2)
        # Update x -= lr * dx and y -= lr * dy
        pass
    return (x, y)

print("Final point:", run_gd())`,
      testCode: `x, y = run_gd(lr=0.1, steps=80)
assert abs(x - 3.0) < 1e-3, f"Expected x near 3.0, got {x}"
assert abs(y + 2.0) < 1e-3, f"Expected y near -2.0, got {y}"
print("PASS: Lab 1.5.1 Gradient descent converged to (3.0, -2.0)!")`,
      solutionCode: `def run_gd(lr: float = 0.1, steps: int = 80) -> tuple[float, float]:
    x, y = 0.0, 0.0
    for _ in range(steps):
        dx = 2.0 * (x - 3.0)
        dy = 8.0 * (y + 2.0)
        x -= lr * dx
        y -= lr * dy
    return (x, y)`,
      hint: 'Compute `dx = 2.0 * (x - 3.0)` and `dy = 8.0 * (y + 2.0)`, then subtract `lr * dx` and `lr * dy`.',
      hints: [
        'Power rule gives partial derivatives `dx = 2.0 * (x - 3.0)` and `dy = 8.0 * (y + 2.0)`.',
        'Subtract `x -= lr * dx` and `y -= lr * dy` on every step.',
        'Return `(x, y)` after the loop completes.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-5-2',
      difficulty: 'spec',
      requires: ['chain-rule', 'gradient-descent'],
      title: 'Lab 1.5.2 (From Spec): Linear Regression via Chain Rule & Finite-Diff Checker',
      prompt:
        'Implement two functions: 1) `numeric_grad_w(fn, w, eps=1e-5)` computing central finite difference `(fn(w + eps) - fn(w - eps)) / (2 * eps)`. 2) `fit_line_slope(xs, ys, lr=0.05, steps=100)` fitting `y_hat = w * xs` (starting `w = 0.0`) to minimize MSE `np.mean((w * xs - ys) ** 2)` using analytical Chain Rule gradient `np.mean(2 * (w * xs - ys) * xs)` and returning final `w`.',
      starterCode: `import numpy as np

def numeric_grad_w(fn, w: float, eps: float = 1e-5) -> float:
    pass

def fit_line_slope(xs: np.ndarray, ys: np.ndarray, lr: float = 0.05, steps: int = 100) -> float:
    w = 0.0
    # Run steps of gradient descent minimizing np.mean((w * xs - ys) ** 2)
    return float(w)`,
      testCode: `import numpy as np
g = numeric_grad_w(lambda w: (w - 4.0) ** 2, 1.0)
assert abs(g - (-6.0)) < 1e-6, f"Expected -6.0, got {g}"

xs = np.array([1.0, 2.0, 3.0, 4.0])
ys = np.array([2.5, 5.0, 7.5, 10.0])  # true slope = 2.5
w_fit = fit_line_slope(xs, ys, lr=0.05, steps=100)
assert abs(w_fit - 2.5) < 1e-4, f"Expected slope 2.5, got {w_fit}"
print("PASS: Lab 1.5.2 Chain rule slope fitter & finite diff checker passed!")`,
      solutionCode: `import numpy as np

def numeric_grad_w(fn, w: float, eps: float = 1e-5) -> float:
    return float((fn(w + eps) - fn(w - eps)) / (2.0 * eps))

def fit_line_slope(xs: np.ndarray, ys: np.ndarray, lr: float = 0.05, steps: int = 100) -> float:
    w = 0.0
    for _ in range(steps):
        preds = w * xs
        grad_w = float(np.mean(2.0 * (preds - ys) * xs))
        w -= lr * grad_w
    return float(w)`,
      hint: 'In `fit_line_slope`, compute `preds = w * xs`, `grad_w = float(np.mean(2.0 * (preds - ys) * xs))`, and update `w -= lr * grad_w`.',
      hints: [
        '`numeric_grad_w` is `(fn(w + eps) - fn(w - eps)) / (2.0 * eps)`.',
        'Chain rule derivative of `(w * x - y)**2` with respect to `w` is `2 * (w * x - y) * x`.',
        'Average across samples using `np.mean(...)` and update `w -= lr * grad_w`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-5-3',
      difficulty: 'debug',
      requires: ['adam-optimizer', 'gradient-descent'],
      title: 'Lab 1.5.3 (Debug Buggy Code): Fix Gradient Ascent & Momentum Accumulation Bugs',
      prompt:
        'A broken Momentum SGD optimizer tries to minimize $L(w) = (w - 5)^2$. It suffers TWO bugs: 1) `w` steps uphill (`w = w + lr * v`) instead of downhill (`w - lr * v`), and 2) `v` forgets `beta * v` history accumulation! Fix `momentum_gd(w0=0.0, lr=0.1, beta=0.8, steps=120)` so `v = beta * v + grad` and `w = w - lr * v` converge smoothly to `5.0`!',
      starterCode: `def momentum_gd(w0: float = 0.0, lr: float = 0.1, beta: float = 0.8, steps: int = 120) -> float:
    w = w0
    v = 0.0
    for _ in range(steps):
        grad = 2.0 * (w - 5.0)
        v = beta * v + grad
        w = w + lr * v       # Bug: adding velocity climbs UPHILL away from minimum!
    return w`,
      testCode: `w_end = momentum_gd(w0=0.0, lr=0.1, beta=0.8, steps=120)
assert abs(w_end - 5.0) < 1e-3, f"Expected convergence near 5.0, got {w_end}"
print("PASS: Lab 1.5.3 Momentum GD signs fixed!")`,
      solutionCode: `def momentum_gd(w0: float = 0.0, lr: float = 0.1, beta: float = 0.8, steps: int = 120) -> float:
    w = w0
    v = 0.0
    for _ in range(steps):
        grad = 2.0 * (w - 5.0)
        v = beta * v + grad
        w = w - lr * v
    return w`,
      hint: 'Change `w = w + lr * v` to `w = w - lr * v` while keeping `v = beta * v + grad`.',
      hints: [
        'Keep velocity aligned with the gradient: `v = beta * v + grad`.',
        'Step downhill by subtracting scaled velocity: `w = w - lr * v`.',
        'At `w = 0.0`, `grad = -10.0`, so `- lr * (-10) = +1.0`, moving `w` toward `+5.0`!',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q1-5-1',
      type: 'numeric',
      question: 'For $L(w) = (w - 4)^2$ starting at $w_0 = 1.0$ with learning rate $\\eta = 0.25$, what is $w_1$ after 1 gradient descent step ($w_0 - \\eta \\frac{dL}{dw}$)?',
      options: [],
      correctIndex: 0,
      correctNumber: 2.5,
      tolerance: 0.001,
      explanation: '$\\frac{dL}{dw} = 2(1 - 4) = -6$. Then $w_1 = 1.0 - (0.25)(-6) = 1.0 + 1.5 = 2.5$.',
    },
    {
      id: 'q1-5-2',
      type: 'multiple-choice',
      question: 'Why do we subtract the gradient ($\\mathbf{w} - \\eta \\nabla L$) during training instead of adding it?',
      options: [
        'Because partial derivatives are strictly negative across every convex objective',
        'Because the gradient vector points uphill and we minimize loss',
        'To guarantee all learned parameters stay clamped strictly inside `[0.0, 1.0]`',
        'Because adding gradients skips backpropagation through hidden network activations',
      ],
      correctIndex: 1,
      explanation: 'The gradient $\\nabla L$ always points steeply uphill; negating it steps downhill to lower loss.',
    },
    {
      id: 'q1-5-3',
      type: 'spot-bug',
      code: `for step in range(100):
    pred = w * 3.0
    loss = (pred - 6.0) ** 2
    grad_w = 2.0 * (pred - 6.0)   # <-- Look here
    w -= 0.05 * grad_w`,
      question: 'Which Chain Rule factor is missing from `grad_w`?',
      options: [
        'It forgot to divide the gradient accumulation by `100` training iterations',
        'It squared `(pred - 6.0)` prematurely before differentiating the loss',
        'It omitted the inner derivative `* 3.0` (`d(pred)/dw`)',
        'Nothing is missing since `d/dw((3w - 6)^2)` already equals `2*(3w - 6)`',
      ],
      correctIndex: 2,
      explanation: 'By the Chain Rule, $\\frac{d}{dw}(3w - 6)^2 = 2(3w - 6) \\cdot 3$. Omitting `* 3.0` under-scales (and for negative inputs, flips the sign!) of the true gradient.',
    },
    {
      id: 'q1-5-4',
      type: 'multiple-choice',
      question: 'How does finite-difference checking `(L(w + eps) - L(w - eps)) / (2 * eps)` help when debugging custom gradients?',
      options: [
        'It replaces backpropagation during multi-billion-parameter LLM pretraining runs',
        'It eliminates the need to pick a learning rate when using Adam optimization',
        'It automatically converts non-differentiable ReLU hinges into smooth curves',
        'It checks analytical Chain Rule formulas numerically on small test inputs',
      ],
      correctIndex: 3,
      explanation: 'Central finite differences cost two forward passes per parameter—too slow for big training runs, yet invaluable for verifying custom analytical gradients on unit tests.',
    },
    {
      id: 'q1-5-5',
      type: 'multiple-choice',
      question: 'What happens if the learning rate $\\eta$ on $f(y) = 4(y + 2)^2$ is set to `0.3`?',
      options: [
        'It converges immediately in one exact step since `0.3` stays below `1.0`',
        'Its curvature `8` makes `1 - 0.3 * 8 = -1.4`, amplifying errors until divergence',
        'The partial derivative vanishes straight to zero across all positive values',
        'Plain SGD automatically upgrades itself into Momentum at higher step sizes',
      ],
      correctIndex: 1,
      explanation: 'When $|1 - \\eta \\cdot 8| > 1$, every update overshoots to a higher wall on the opposite side of the valley until floating-point values overflow.',
    },
    {
      id: 'q1-5-6',
      type: 'multi-select',
      question: 'Which TWO extra running quantities does Adam maintain per parameter compared to plain SGD?',
      options: [
        'An exponentially decaying average of past gradients (1st moment / velocity)',
        'An exponentially decaying average of squared gradients (2nd moment / adaptive scale)',
        'A full second-order inverse Hessian matrix across all parameter pairs',
        'Held-out validation accuracy across the last 5 epochs',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Adam combines Momentum (1st moment) with RMSProp-style per-weight variance scaling (2nd moment) without storing expensive Hessian matrices.',
    },
    {
      id: 'q1-5-7',
      type: 'predict-output',
      code: `w = 4.0
for _ in range(2):
    grad = 2.0 * (w - 4.0)
    w -= 0.1 * grad
print(round(w, 2))`,
      question: 'What exact value is printed?',
      options: [
        '`3.2` after two steps',
        '`0.0` at the valley floor',
        '`4.8` after two steps',
        '`4.0`',
      ],
      correctIndex: 3,
      explanation: 'At the minimum `w = 4.0`, the slope `grad = 2*(4 - 4) = 0.0`, so `w -= 0.1 * 0.0` stays at `4.0`.',
    },
    {
      id: 'q1-5-8',
      type: 'ordering',
      question: 'Order one standard gradient descent iteration for loss $L(\\mathbf{w})$:',
      options: [],
      items: [
        'Run forward pass to compute predictions and loss',
        'Compute gradient vector dL/dw via backpropagation',
        'Verify gradients are finite (not NaN/Inf) and clip if needed',
        'Update parameters w <- w - lr * grad',
      ],
      correctIndex: 0,
      explanation: 'Compute forward loss, run backward pass for gradients, optionally validate/clip norms, then apply the parameter update step.',
    },
    {
      id: 'q1-5-9',
      type: 'multiple-choice',
      question: 'For a composition $y = f(g(h(w)))$ where local slopes at the current point are $f\' = 3$, $g\' = -2$, and $h\' = 0.5$, what is $\\frac{dy}{dw}$?',
      options: [
        '`1.5` (arithmetic mean of the three local slopes)',
        '`-3.0` ($3 \\times -2 \\times 0.5$)',
        '`3.5` (sum of absolute sensitivities across nodes)',
        '`0.5` (governed purely by the innermost node)',
      ],
      correctIndex: 1,
      explanation: 'By the Chain Rule, derivatives multiply along composition chains: $3 \\times (-2) \\times 0.5 = -3.0$.',
    },
  ],
};
