import type { CourseModule } from '@/types/course';

export const module1: CourseModule = {
  id: 'mod-1',
  number: 1,
  title: 'Python, Linear Algebra & Probability',
  subtitle: 'Bridge from frontend JavaScript to vectorized NumPy, vector spaces, calculus gradients, and information theory.',
  track: 'core',
  estimatedHours: 3.5,
  capstoneDeliverable: 'Build a pure-NumPy gradient descent optimizer & cosine similarity engine.',
  lessons: [
    {
      id: '1-1',
      moduleId: 'mod-1',
      number: '1.1',
      title: 'Python & NumPy for Frontend Developers',
      subtitle: 'Go from JS arrays and loops to C-speed vectorized tensors in 15 minutes.',
      durationMinutes: 15,
      track: 'core',
      prerequisites: ['Basic JavaScript/TypeScript'],
      objectives: [
        'Translate JS arrays, objects, and array methods into Python lists, dicts, and comprehensions.',
        'Understand why Python loops are slow for ML and how NumPy memory layout fixes it.',
        'Use broadcasting, slicing, and shape manipulation confidently.',
      ],
      blocks: [
        {
          type: 'frontend-bridge',
          title: 'Your JS Mental Model Maps Directly to Python',
          frontendConcept: 'Array.map(), Object literals, const/let, async/await, TypeScript interfaces',
          aiConcept: 'List comprehensions, Dictionaries, dynamic binding, Generators, Type hints + NumPy ndarrays',
          explanation:
            'You already know 80% of Python syntax conceptually. Python drops curly braces and semicolons in favor of indentation, replaces `.map/.filter` chains with readable list comprehensions, and delegates heavy number crunching to NumPy arrays backed by contiguous C memory.',
        },
        {
          type: 'code-compare',
          title: 'JavaScript vs Python & NumPy Side-by-Side',
          jsLabel: 'JavaScript (ES2024)',
          jsCode: `const scores = [72, 85, 91, 64];
const normalized = scores
  .filter(s => s >= 70)
  .map(s => Number((s / 100).toFixed(2)));

const user = { role: "ai_eng", exp: 2 };
const mean = scores.reduce((a, b) => a + b, 0) / scores.length;`,
          pyLabel: 'Python + NumPy',
          pyCode: `import numpy as np

scores = [72, 85, 91, 64]
normalized = [round(s / 100, 2) for s in scores if s >= 70]

user = {"role": "ai_eng", "exp": 2}
arr = np.array(scores, dtype=np.float64)
mean = arr.mean()        # Runs in C, ~100x faster on large arrays
z_scores = (arr - arr.mean()) / arr.std()  # Broadcasting!`,
          takeaway:
            'In Python AI code, never write a `for` loop over numbers when NumPy can vectorize the whole array operation at once.',
        },
        {
          type: 'prose',
          heading: 'Why NumPy Broadcasting Is the Superpower Behind AI',
          paragraphs: [
            'A JavaScript `Array` is a list of pointers to boxed heap objects. Iterating over 10 million numbers in JS or pure Python requires millions of type checks and pointer dereferences. A NumPy `ndarray` stores raw, homogeneous numbers (like `float32`) in one contiguous block of RAM.',
            '**Broadcasting** lets you combine arrays of different shapes without copying memory. For example, subtracting a 1D vector of shape `(3,)` from a 2D matrix of shape `(1000, 3)` automatically stretches the 1D vector across all 1,000 rows in compiled C/SIMD loops.',
            'Key rules to memorize: shapes align **from the trailing (rightmost) dimension**. Two dimensions are compatible if they are equal OR one of them is `1`.',
          ],
        },
        {
          type: 'table',
          title: 'Essential NumPy Operations Cheat Sheet',
          headers: ['Operation', 'NumPy Syntax', 'Shape Effect', 'AI Use Case'],
          rows: [
            ['Create zeros/random', '`np.zeros((3, 4))` / `np.random.randn(3, 4)`', '`(3, 4)`', 'Weight initialization'],
            ['Reshape', '`x.reshape(2, -1)`', 'Infers `-1` automatically', 'Flattening image batches'],
            ['Matrix multiply', '`A @ B` or `np.matmul(A, B)`', '`(m, k) @ (k, n) -> (m, n)`', 'Neural network linear layer'],
            ['Axis reduction', '`x.sum(axis=0)` / `x.mean(axis=-1)`', 'Collapses specified axis', 'Batch mean / Softmax denominator'],
            ['Boolean mask', '`x[x > 0]`', '1D filtered elements', 'ReLU activation (`np.maximum(0, x)`)'],
          ],
        },
        {
          type: 'python-lab',
          labId: 'lab-1-1',
          title: 'Lab 1.1: Vectorized Feature Standardization',
          prompt:
            'Write a function `standardize_rows(X)` that takes a 2D NumPy array `X` of shape `(n_samples, n_features)` and returns a new array where **each column (feature)** has mean `0` and standard deviation `1` using broadcasting (no Python loops!). Avoid division by zero by replacing any `0` std with `1.0`.',
          starterCode: `import numpy as np

def standardize_rows(X: np.ndarray) -> np.ndarray:
    # X has shape (n_samples, n_features)
    # 1. Compute column means with keepdims=True
    # 2. Compute column stds with keepdims=True (replace 0 with 1.0)
    # 3. Return (X - mean) / std
    pass

sample = np.array([[10.0, 1.0], [20.0, 1.0], [30.0, 1.0]])
print(standardize_rows(sample))`,
          testCode: `import numpy as np
X1 = np.array([[10.0, 2.0], [20.0, 4.0], [30.0, 6.0]])
res1 = standardize_rows(X1)
assert isinstance(res1, np.ndarray), "Must return a NumPy ndarray"
assert res1.shape == X1.shape, f"Expected shape {X1.shape}, got {res1.shape}"
assert np.allclose(res1.mean(axis=0), 0.0, atol=1e-7), "Column means must be 0"
assert np.allclose(res1.std(axis=0), 1.0, atol=1e-7), "Column stds must be 1"

X2 = np.array([[5.0, 3.0], [5.0, 9.0]])
res2 = standardize_rows(X2)
assert np.allclose(res2[:, 0], 0.0), "Constant column must become 0 without NaN"
print("PASS: All broadcasting and edge-case assertions succeeded!")`,
          solutionCode: `import numpy as np

def standardize_rows(X: np.ndarray) -> np.ndarray:
    mean = X.mean(axis=0, keepdims=True)
    std = X.std(axis=0, keepdims=True)
    std = np.where(std == 0, 1.0, std)
    return (X - mean) / std`,
          hint: 'Use `axis=0, keepdims=True` so mean/std keep shape `(1, n_features)` for clean column broadcasting, and `np.where(std == 0, 1.0, std)` to guard constant columns.',
          packages: ['numpy'],
        },
        {
          type: 'callout',
          variant: 'interview',
          title: 'Common Interview Trap: In-Place vs View vs Copy',
          body: 'In NumPy, slicing (`b = a[1:4]`) returns a **view** sharing the same memory—mutating `b` mutates `a`! Use `.copy()` when you need isolation, just like shallow vs deep copies in JS.',
        },
      ],
      quiz: [
        {
          id: 'q1-1-1',
          question: 'You have matrix `A` of shape `(128, 64)` and bias vector `b` of shape `(64,)`. What happens when you execute `A + b`?',
          options: [
            'Raises a ValueError because shapes differ',
            'Broadcasts `b` across all 128 rows, yielding shape `(128, 64)`',
            'Broadcasts `b` across columns, yielding shape `(64, 64)`',
            'Concatenates `b` onto `A`, yielding shape `(129, 64)`',
          ],
          correctIndex: 1,
          explanation:
            'NumPy aligns dimensions from right to left: `(128, 64)` and `(1, 64)` match on trailing dimension `64`, so `b` is broadcast across all 128 rows.',
        },
        {
          id: 'q1-1-2',
          question: 'Why does `np.sum(arr)` vastly outperform a Python `for` loop over the same 1 million numbers?',
          options: [
            'Python loops run on a single thread while NumPy always uses all GPU cores',
            'NumPy stores unboxed homogeneous numbers contiguously and executes in compiled C/SIMD loops',
            'NumPy converts all numbers into strings first',
            'Python `for` loops cannot iterate over floats',
          ],
          correctIndex: 1,
          explanation:
            'Contiguous memory + unboxed C primitives + SIMD vector instructions eliminate Python interpreter overhead per element.',
        },
        {
          id: 'q1-1-3',
          question: 'What does `x.reshape(4, -1)` do if `x` has 24 elements?',
          options: [
            'Throws an error because `-1` is invalid',
            'Creates shape `(4, 6)` by automatically inferring the remaining dimension',
            'Reverses the elements along axis 1',
            'Creates shape `(4, 24)` by padding with zeros',
          ],
          correctIndex: 1,
          explanation: 'Passing `-1` tells NumPy to calculate `total_elements // 4 = 6` automatically.',
        },
      ],
    },
    {
      id: '1-2',
      moduleId: 'mod-1',
      number: '1.2',
      title: 'Vectors, Matrices & Geometric Intuition',
      subtitle: 'Understand embeddings, cosine similarity, and matrix transforms visually—not by rote memorization.',
      durationMinutes: 18,
      track: 'core',
      prerequisites: ['1.1'],
      objectives: [
        'Interpret vectors as points/directions in semantic feature space (embeddings).',
        'Compute dot product and cosine similarity and know when to use each.',
        'Visualize matrices as linear transformations (rotations, scaling, projections) and understand SVD/rank.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Everything in AI Is a Vector',
          paragraphs: [
            'A user profile (`[age, sessions, spend]`), a pixel patch, or the meaning of the sentence *"reset my password"* in an LLM is represented as a **vector**—an ordered list of floats $\\mathbf{v} \\in \\mathbb{R}^d$.',
            'Why geometry matters: when two sentences mean similar things, an embedding model places their vectors pointing in nearly the **same direction** in 1536-dimensional space. Measuring similarity becomes pure geometry!',
          ],
        },
        {
          type: 'math',
          title: 'Dot Product & Cosine Similarity',
          latex: '\\mathbf{a} \\cdot \\mathbf{b} = \\sum_{i=1}^d a_i b_i = \\|\\mathbf{a}\\|\\,\\|\\mathbf{b}\\|\\cos\\theta \\qquad \\text{cosine}(\\mathbf{a}, \\mathbf{b}) = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{\\|\\mathbf{a}\\|_2\\,\\|\\mathbf{b}\\|_2}',
          breakdown: [
            { symbol: '\\mathbf{a} \\cdot \\mathbf{b}', meaning: 'Dot product: measures alignment scaled by both magnitudes' },
            { symbol: '\\|\\mathbf{a}\\|_2', meaning: 'L2 norm (Euclidean length): $\\sqrt{\\sum a_i^2}$' },
            { symbol: '\\cos\\theta', meaning: 'Angle alignment from $-1$ (opposite) through $0$ (orthogonal) to $+1$ (identical direction)' },
          ],
          intuition:
            'Cosine similarity strips away vector length and compares pure direction—ideal for text search where short and long documents should still match on topic. When vectors are already L2-normalized ($\\|\\mathbf{v}\\|=1$), cosine similarity equals the dot product!',
        },
        {
          type: 'simulator',
          simulatorId: 'vector-space',
          title: 'Interactive Lab: 2D Matrix Transformation & Dot Product Explorer',
          description:
            'Modify the 2×2 transformation matrix $M$ and input vector $\\mathbf{v}$. Watch how $M$ warps the basis vectors $\\hat{i}, \\hat{j}$, rotates/scales $\\mathbf{v}$, and changes the determinant (area scaling) and cosine similarity.',
        },
        {
          type: 'prose',
          heading: 'Matrices as Functions (and Why SVD/PCA Matters)',
          paragraphs: [
            'Every neural network layer `y = W @ x` is just a **matrix transforming a vector space**: rotating, stretching, shearing, or projecting vectors into a new dimension (e.g., mapping a 768-dim token embedding into 50,000 vocabulary logits).',
            '**Eigenvalues & SVD (Singular Value Decomposition)**: Any matrix $A$ can be factored as $A = U \\Sigma V^T$ (rotate $\\rightarrow$ stretch along perpendicular axes $\\rightarrow$ rotate). This explains **PCA** (keep only the top-$k$ highest-variance directions) and **LoRA fine-tuning** (updating huge LLM weight matrices using tiny low-rank matrices $B A$).',
          ],
        },
        {
          type: 'python-lab',
          labId: 'lab-1-2',
          title: 'Lab 1.2: Implement Batch Cosine Similarity',
          prompt:
            'Given a query vector `q` of shape `(d,)` and a matrix of document embeddings `docs` of shape `(n, d)`, write `top_k_similar(q, docs, k)` returning the indices of the `k` most similar documents by cosine similarity (highest first).',
          starterCode: `import numpy as np

def top_k_similar(q: np.ndarray, docs: np.ndarray, k: int) -> np.ndarray:
    # 1. Compute dot products docs @ q
    # 2. Divide by ||docs||_2 * ||q||_2 (guard against 0 with 1e-9)
    # 3. Return indices of top k descending
    pass

q = np.array([1.0, 0.0, 1.0])
docs = np.array([[0.0, 1.0, 0.0], [2.0, 0.0, 2.0], [1.0, 1.0, 0.0]])
print(top_k_similar(q, docs, 2))`,
          testCode: `import numpy as np
q = np.array([1.0, 0.0, 1.0])
docs = np.array([
    [0.0, 1.0, 0.0],   # ortho -> 0.0
    [5.0, 0.0, 5.0],   # exact direction -> 1.0
    [1.0, 1.0, 0.0],   # 0.5
    [-1.0, 0.0, -1.0], # -1.0
])
res = top_k_similar(q, docs, 2)
assert list(res) == [1, 2], f"Expected [1, 2], got {list(res)}"
print("PASS: Cosine similarity search ranks documents accurately!")`,
          solutionCode: `import numpy as np

def top_k_similar(q: np.ndarray, docs: np.ndarray, k: int) -> np.ndarray:
    q_norm = np.linalg.norm(q) + 1e-9
    docs_norm = np.linalg.norm(docs, axis=1) + 1e-9
    sims = (docs @ q) / (docs_norm * q_norm)
    return np.argsort(-sims)[:k]`,
          hint: 'Use `np.linalg.norm(docs, axis=1)` for row norms and `np.argsort(-sims)[:k]` to sort descending.',
          packages: ['numpy'],
        },
      ],
      quiz: [
        {
          id: 'q1-2-1',
          question: 'Vector $\\mathbf{a} = [3, 0]$ and $\\mathbf{b} = [100, 0]$. What is their cosine similarity?',
          options: ['0.03', '1.0', '300', '0.0'],
          correctIndex: 1,
          explanation: 'Both vectors point in the exact same direction along the x-axis ($\\theta = 0^\\circ$), so $\\cos(0^\\circ) = 1.0$ regardless of magnitude.',
        },
        {
          id: 'q1-2-2',
          question: 'If matrix $A$ has shape `(512, 768)` and matrix $B$ has shape `(768, 128)`, what is the shape of $A @ B$?',
          options: ['(768, 768)', '(512, 128)', '(128, 512)', 'Invalid dimensions'],
          correctIndex: 1,
          explanation: 'Inner dimensions (`768`) match and cancel out, leaving outer dimensions `(512, 128)`.',
        },
        {
          id: 'q1-2-3',
          question: 'Why do vector databases like Pinecone or pgvector often pre-normalize embeddings to unit length ($\\|\\mathbf{v}\\|_2 = 1$)?',
          options: [
            'So cosine similarity reduces to a faster dot product without computing square roots at query time',
            'Because negative floats cannot be stored in databases',
            'To reduce the vector dimension by half',
            'To convert float32 into integers',
          ],
          correctIndex: 0,
          explanation: 'When $\\|\\mathbf{a}\\| = \\|\\mathbf{b}\\| = 1$, $\\text{cosine}(\\mathbf{a}, \\mathbf{b}) = \\mathbf{a} \\cdot \\mathbf{b}$, saving norms at search time.',
        },
      ],
    },
    {
      id: '1-3',
      moduleId: 'mod-1',
      number: '1.3',
      title: 'Calculus, Chain Rule & Gradient Descent',
      subtitle: 'How models actually learn from mistakes—visually and algebraically.',
      durationMinutes: 18,
      track: 'core',
      prerequisites: ['1.2'],
      objectives: [
        'Understand derivatives and gradients as "direction of steepest ascent".',
        'Apply the Chain Rule to trace how loss changes with respect to early weights (backpropagation).',
        'Compare Vanilla SGD, Momentum, and Adam optimizers and diagnose learning rate pathologies.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Optimization Is Just Walking Downhill in the Fog',
          paragraphs: [
            'Training almost every ML model reduces to one loop: define a **loss function** $L(\\mathbf{w})$ measuring how wrong predictions are, compute its **gradient** $\\nabla_{\\mathbf{w}} L$ (a vector of partial derivatives pointing uphill), and step in the **opposite direction**.',
            'Why the **Chain Rule** is the heart of deep learning: a neural network is a composition of functions $L(f_3(f_2(f_1(x))))$. The Chain Rule lets us multiply local slopes backward from the output to the first layer: $\\frac{\\partial L}{\\partial w_1} = \\frac{\\partial L}{\\partial f_3} \\cdot \\frac{\\partial f_3}{\\partial f_2} \\cdot \\frac{\\partial f_2}{\\partial w_1}$. That is literally all **backpropagation** is!',
          ],
        },
        {
          type: 'math',
          title: 'Gradient Descent & Adam Update Intuition',
          latex: '\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla_{\\mathbf{w}} L(\\mathbf{w}_t)',
          breakdown: [
            { symbol: '\\mathbf{w}_t', meaning: 'Current model weights at step $t$' },
            { symbol: '\\eta', meaning: 'Learning rate (step size): too small = slow; too large = explodes/diverges' },
            { symbol: '\\nabla_{\\mathbf{w}} L', meaning: 'Gradient vector: partial derivatives $[\\frac{\\partial L}{\\partial w_1}, \\dots, \\frac{\\partial L}{\\partial w_p}]$' },
          ],
          intuition:
            '**Momentum** adds a rolling average of past gradients (like a heavy ball rolling through small bumps). **Adam** tracks both the first moment (momentum) AND second moment (gradient variance) per parameter—automatically shrinking steps in steep directions and boosting steps in flat ones.',
        },
        {
          type: 'simulator',
          simulatorId: 'gradient-descent',
          title: 'Interactive Lab: Optimizer Race on Non-Convex Loss Surfaces',
          description:
            'Choose a loss landscape (Ravine, Saddle Point, or Double Well), tune the learning rate $\\eta$, and compare SGD, Momentum, and Adam step-by-step.',
        },
        {
          type: 'python-lab',
          labId: 'lab-1-3',
          title: 'Lab 1.3: Gradient Descent From Scratch',
          prompt:
            'Minimize $f(x, y) = (x - 3)^2 + 4(y + 2)^2$. Implement `run_gd(lr, steps)` starting from `(0.0, 0.0)` and return the final `(x, y)` tuple.',
          starterCode: `def run_gd(lr: float = 0.1, steps: int = 60):
    x, y = 0.0, 0.0
    for _ in range(steps):
        # Compute partial derivatives df/dx and df/dy
        # Update x and y by subtracting lr * grad
        pass
    return (x, y)

print("Final point:", run_gd())`,
          testCode: `x, y = run_gd(lr=0.1, steps=80)
assert abs(x - 3.0) < 1e-3, f"Expected x near 3.0, got {x}"
assert abs(y + 2.0) < 1e-3, f"Expected y near -2.0, got {y}"
print("PASS: Gradient descent converged cleanly to (3.0, -2.0)!")`,
          solutionCode: `def run_gd(lr: float = 0.1, steps: int = 60):
    x, y = 0.0, 0.0
    for _ in range(steps):
        dx = 2.0 * (x - 3.0)
        dy = 8.0 * (y + 2.0)
        x -= lr * dx
        y -= lr * dy
    return (x, y)`,
          hint: 'Using the power rule: $\\frac{\\partial f}{\\partial x} = 2(x - 3)$ and $\\frac{\\partial f}{\\partial y} = 8(y + 2)$.',
          packages: [],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Production Gotcha: Learning Rate Divergence',
          body: 'Look at `dy = 8*(y + 2)` in the lab above. If you set `lr = 0.3`, then `1 - 0.3 * 8 = -1.4`, meaning every step overshoots further away and explodes! That is why high-curvature axes restrict max learning rate—and why Adam/AdamW is the default optimizer for transformers.',
        },
      ],
      quiz: [
        {
          id: 'q1-3-1',
          question: 'Why do we subtract the gradient ($w - \\eta \\nabla L$) instead of adding it?',
          options: [
            'Because the gradient points in the direction of steepest ascent, and we want to minimize loss',
            'Because gradients are always negative numbers',
            'To keep weights between 0 and 1',
            'To avoid computing partial derivatives',
          ],
          correctIndex: 0,
          explanation: 'The gradient vector points uphill (steepest increase). Moving opposite ($-\\nabla L$) descends the loss surface.',
        },
        {
          id: 'q1-3-2',
          question: 'What happens if the learning rate $\\eta$ is set far too high?',
          options: [
            'The model trains accurately in 1 step',
            'Weights overshoot the minimum and loss oscillates or diverges to NaN/Infinity',
            'The gradient becomes zero everywhere',
            'The model automatically switches to Adam',
          ],
          correctIndex: 1,
          explanation: 'Steps jump across the valley to higher walls on each iteration, causing exponential divergence.',
        },
        {
          id: 'q1-3-3',
          question: 'What extra information does Adam maintain compared to plain SGD?',
          options: [
            'Second-order Hessian inverse matrices',
            'Running averages of both the gradient (1st moment) and squared gradient (2nd moment) per parameter',
            'Validation dataset labels',
            'A random forest of step sizes',
          ],
          correctIndex: 1,
          explanation: 'Adam combines momentum (1st moment) with RMSProp-style adaptive per-parameter scaling (2nd moment).',
        },
      ],
    },
    {
      id: '1-4',
      moduleId: 'mod-1',
      number: '1.4',
      title: 'Probability, Bayes & Cross-Entropy Loss',
      subtitle: 'Connect Bayes’ theorem, maximum likelihood, and why every classifier and LLM trains on Cross-Entropy.',
      durationMinutes: 18,
      track: 'core',
      prerequisites: ['1.3'],
      objectives: [
        'Compute posterior probabilities with Bayes’ Theorem and avoid base-rate fallacy.',
        'Connect Maximum Likelihood Estimation (MLE) to MSE and Cross-Entropy loss.',
        'Intuit Entropy, KL Divergence, and Cross-Entropy ($H(P, Q) = H(P) + D_{KL}(P \\parallel Q)$).',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'AI Models Predict Probability Distributions, Not Certainties',
          paragraphs: [
            'Whether predicting if an email is spam, whether a user will churn, or predicting the next token out of 100,000 subwords in GPT, a model outputs a **probability distribution** $Q$.',
            '**Bayes’ Theorem** formalizes how to update beliefs given evidence: $P(H \\mid E) = \\frac{P(E \\mid H) P(H)}{P(E)}$. Failing to account for the **prior** $P(H)$ (base rate) is the #1 statistical mistake in fraud detection and medical ML.',
          ],
        },
        {
          type: 'math',
          title: 'Entropy & Cross-Entropy Loss',
          latex: 'H(P, Q) = -\\sum_{i} P(i) \\log Q(i) = H(P) + D_{\\text{KL}}(P \\parallel Q)',
          breakdown: [
            { symbol: 'P(i)', meaning: 'True target distribution (e.g., one-hot `[0, 1, 0]` for true class)' },
            { symbol: 'Q(i)', meaning: 'Model predicted probability for class $i$ (from Softmax)' },
            { symbol: '-\\log Q(y)', meaning: 'Surprise / penalty: if true class gets $Q(y)=0.99$, loss is $0.01$; if $Q(y)=0.01$, loss is $4.6$!' },
          ],
          intuition:
            'Minimizing Cross-Entropy $H(P, Q)$ is mathematically identical to minimizing KL Divergence (distance from true distribution) AND identical to Maximum Likelihood Estimation! And in LLMs, **Perplexity** is literally just $e^{\\text{Cross-Entropy}}$.',
        },
        {
          type: 'simulator',
          simulatorId: 'bayes-entropy',
          title: 'Interactive Lab: Bayesian Base-Rate & Cross-Entropy Explorer',
          description:
            'Test how disease/fraud prevalence affects positive predictive value (Bayes), and slide predicted probabilities $Q$ to watch Cross-Entropy & KL Divergence spike when confident predictions are wrong.',
        },
        {
          type: 'python-lab',
          labId: 'lab-1-4',
          title: 'Lab 1.4: Numerically Stable Softmax & Cross-Entropy',
          prompt:
            'Raw neural net scores (logits) can overflow `np.exp(logits)` if large! Implement `softmax(logits)` using the **max-shift trick** (`logits - np.max(logits)`) and `cross_entropy(logits, target_index)` returning `-log(probs[target_index])`.',
          starterCode: `import numpy as np

def softmax(logits: np.ndarray) -> np.ndarray:
    # Subtract max(logits) for numerical stability before np.exp
    pass

def cross_entropy(logits: np.ndarray, target_idx: int) -> float:
    probs = softmax(logits)
    # Return -np.log(probs[target_idx] + 1e-12)
    pass

print("Probs:", softmax(np.array([1000.0, 1001.0, 999.0])))
print("Loss:", cross_entropy(np.array([2.0, 1.0, 0.1]), 0))`,
          testCode: `import numpy as np
p = softmax(np.array([1000.0, 1001.0, 999.0]))
assert not np.any(np.isnan(p)), "Softmax overflowed! Use max-shift trick."
assert np.isclose(p.sum(), 1.0), "Softmax probabilities must sum to 1"
assert p[1] > p[0] > p[2], "Order must be preserved"

loss = cross_entropy(np.array([2.0, 1.0, 0.1]), 0)
expected = -np.log(np.exp(2.0) / (np.exp(2.0) + np.exp(1.0) + np.exp(0.1)))
assert abs(loss - expected) < 1e-5, f"Expected {expected}, got {loss}"
print("PASS: Numerically stable Softmax & Cross-Entropy verified!")`,
          solutionCode: `import numpy as np

def softmax(logits: np.ndarray) -> np.ndarray:
    shifted = logits - np.max(logits)
    exps = np.exp(shifted)
    return exps / np.sum(exps)

def cross_entropy(logits: np.ndarray, target_idx: int) -> float:
    probs = softmax(logits)
    return float(-np.log(probs[target_idx] + 1e-12))`,
          hint: 'Because $\\frac{e^{z_i - c}}{\\sum_j e^{z_j - c}} = \\frac{e^{z_i}}{\\sum_j e^{z_j}}$, subtracting `np.max(logits)` keeps the largest exponent at `0` ($e^0 = 1$) without changing the output!',
          packages: ['numpy'],
        },
      ],
      quiz: [
        {
          id: 'q1-4-1',
          question: 'A fraud detector has 99% sensitivity and 99% specificity, but only 0.1% of transactions are fraudulent. Roughly what % of flagged alerts are actually fraud?',
          options: ['99%', '50%', '~9%', '0.1%'],
          correctIndex: 2,
          explanation: 'Out of 10,000 transactions: ~10 frauds (10 flagged) and ~9,990 legit (100 false positives). Precision = 10 / 110 ≈ 9.1%!',
        },
        {
          id: 'q1-4-2',
          question: 'Why do we subtract `max(logits)` before `exp` in Softmax?',
          options: [
            'To make the probabilities sum to 0',
            'To prevent floating-point overflow (`exp(1000) -> inf -> NaN`) without changing the result',
            'To turn Softmax into ReLU',
            'To speed up backpropagation by removing exponentials',
          ],
          correctIndex: 1,
          explanation: 'Exponentiating large logits overflows float32/float64 to `inf`; subtracting the max guarantees all exponents are $\\le 0$.',
        },
        {
          id: 'q1-4-3',
          question: 'If an LLM achieves an average Cross-Entropy loss of `ln(2) ≈ 0.693` nats per token, what is its Perplexity?',
          options: ['0.693', '2.0', '4.0', '1.0'],
          correctIndex: 1,
          explanation: 'Perplexity $= e^{H} = e^{\\ln 2} = 2.0$, meaning the model is effectively as uncertain as choosing uniformly between 2 tokens at each step.',
        },
      ],
    },
  ],
};
