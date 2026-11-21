import type { CourseModule } from '@/types/course';

export const module1: CourseModule = {
  id: 'mod-1',
  number: 1,
  title: 'Python, Linear Algebra & Probability',
  subtitle: 'Start from absolute zero: learn Python basics, NumPy arrays, vectors, gradients, and probability from first principles.',
  track: 'core',
  estimatedHours: 3.5,
  capstoneDeliverable: 'Build your first Python & NumPy score-booster, cosine similarity finder, and gradient optimizer.',
  lessons: [
    {
      id: '1-0',
      moduleId: 'mod-1',
      number: '1.0',
      title: 'Python Zero-to-One: Variables, Loops & Decisions',
      subtitle: 'Start here if you have never written code—learn variables, lists, if/else, and loops in 15 fun minutes.',
      durationMinutes: 15,
      track: 'core',
      prerequisites: ['No prior coding experience required'],
      objectives: [
        'Store numbers and text in Python variables and lists without prior coding experience.',
        'Make smart choices with `if / else` and repeat steps cleanly with `for` loops.',
        'Solve an interactive tap-to-order puzzle and pass your first Python lab.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Coding Is Just Giving Clear Recipes to a Computer',
          paragraphs: [
            'Writing code is just writing a crystal-clear step-by-step recipe—similar to setting rules in a spreadsheet or automating a checklist. In Python, there are only **4 building blocks** you need on Day 1:',
            '1) **Variables** (`score = 85`): a labeled box holding a value. 2) **Lists** (`scores = [60, 85, 92]`): an ordered row of values inside square brackets `[...]`. 3) **Loops** (`for s in scores:`): visit each item one by one. 4) **Decisions** (`if s >= 80:`): take an action only when a rule is true.',
          ],
        },
        {
          type: 'code-builder',
          puzzleId: 'puzzle-1-0',
          title: 'Warm-Up Puzzle: Build a Passing-Score Counter',
          prompt:
            'Tap the lines below in the right order to create a list of scores, loop through them, and count how many are `>= 80`. (Notice how indented lines sit inside the `for` and `if` blocks!)',
          lines: [
            'scores = [65, 82, 95]',
            'passed = 0',
            'for s in scores:',
            '    if s >= 80:',
            '        passed = passed + 1',
            'print(passed)',
          ],
          explanation:
            'First you create the `scores` list and set `passed = 0`. Next the `for` loop checks each score, the indented `if` tests `s >= 80`, and `passed = passed + 1` adds 1 for each match before printing `2`!',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'How to Read Python Error Messages (Zero Panic!)',
          body: 'When Python prints an error, always read the **very last line first**: `IndentationError` means spaces don’t line up; `NameError` means a typo in a variable name; `TypeError` means mixing incompatible types (like `"hello" + 5`). Errors are helpful signposts, not failures!',
        },
        {
          type: 'python-lab',
          labId: 'lab-1-0',
          title: 'Lab 1.0: Filter Confident AI Predictions',
          prompt:
            'Imagine an AI model outputs confidence scores like `[0.45, 0.82, 0.91, 0.60]`. Write a function `filter_confident(scores, threshold)` that starts with an empty list `kept = []`, loops `for s in scores:`, appends `s` when `s >= threshold`, and returns `kept`.',
          starterCode: `def filter_confident(scores, threshold):
    kept = []
    # Loop over every score in scores:
    # if s >= threshold:
    #     kept.append(s)
    return kept

print(filter_confident([0.45, 0.82, 0.91, 0.60], 0.75))`,
          testCode: `res1 = filter_confident([0.45, 0.82, 0.91, 0.60], 0.75)
assert res1 == [0.82, 0.91], f"Expected [0.82, 0.91], got {res1}"
res2 = filter_confident([0.2, 0.5], 0.8)
assert res2 == [], f"Expected [], got {res2}"
print("PASS: Nice work! Your first pure-Python loop & if-filter passed!")`,
          solutionCode: `def filter_confident(scores, threshold):
    kept = []
    for s in scores:
        if s >= threshold:
            kept.append(s)
    return kept`,
          hint: 'Inside `filter_confident`, write `for s in scores:` followed by an indented `if s >= threshold:` and `kept.append(s)`.',
          packages: [],
        },
      ],
      quiz: [
        {
          id: 'q1-0-1',
          question: 'What does `for item in [10, 20, 30]:` do in Python?',
          options: [
            'Deletes the list',
            'Runs the indented code block once for `10`, once for `20`, and once for `30`',
            'Only checks the first number',
            'Sorts the list backwards',
          ],
          correctIndex: 1,
          explanation: 'A `for` loop steps through every element in a list from left to right.',
        },
        {
          id: 'q1-0-2',
          question: 'If you see `NameError: name "scroes" is not defined`, what usually caused it?',
          options: [
            'Your internet disconnected',
            'A spelling typo in the variable name (`scroes` instead of `scores`)',
            'Python cannot store numbers',
            'You forgot a semicolon',
          ],
          correctIndex: 1,
          explanation: '`NameError` simply means Python looked for a variable name you haven’t defined yet—almost always a typo.',
        },
      ],
    },
    {
      id: '1-1',
      moduleId: 'mod-1',
      number: '1.1',
      title: 'Python Functions & NumPy Arrays',
      subtitle: 'Turn manual loops into one-line vectorized math—the speed engine behind every AI model.',
      durationMinutes: 18,
      track: 'core',
      prerequisites: ['1.0'],
      objectives: [
        'Package reusable Python steps into clean functions (`def`) and dictionaries (`{key: value}`).',
        'See how NumPy transforms an entire column of numbers at once—just like a spreadsheet formula.',
        'Run and pass your first NumPy array lab inside the browser.',
      ],
      blocks: [
        {
          type: 'frontend-bridge',
          title: 'From Spreadsheet Formulas to NumPy Arrays',
          frontendConcept: 'Highlighting an entire column in Excel/Google Sheets and applying `+ 5` or `=AVERAGE(A1:A100)` in one step.',
          aiConcept: 'Python dictionaries store labeled profiles; functions (`def`) wrap recipes; NumPy arrays update millions of numbers in one shot.',
          explanation:
            'Instead of updating numbers one by one in a loop, **NumPy** lets you write `scores + 5` and updates every number in the array at once—the exact way AI models process thousands of inputs simultaneously.',
        },
        {
          type: 'code-compare',
          title: 'Step-by-Step Loop vs One-Line NumPy',
          jsLabel: 'Manual Python Loop (1 by 1)',
          jsCode: `scores = [70, 85, 90]
bonus = 5

boosted = []
for s in scores:
    boosted.append(s + bonus)

# Works fine for 3 numbers,
# slow for 10 million numbers!`,
          pyLabel: 'Python + NumPy (All at once)',
          pyCode: `import numpy as np

# 1. A variable is just a labeled box
bonus = 5

# 2. A NumPy array packs numbers tightly in memory
scores = np.array([70, 85, 90])

# 3. Update EVERY score in 1 clean line!
boosted = scores + bonus      # -> [75, 90, 95]
average = scores.mean()       # -> 81.67`,
          takeaway:
            'In AI engineering, NumPy applies math to every number in an array at once—cleaner to read and ~100× faster than manual loops!',
        },
        {
          type: 'prose',
          heading: 'Python 101 in 60 Seconds (Zero Jargon)',
          paragraphs: [
            '**1. Variables (`name = "Maya"`):** Think of a sticky note stuck onto a value. `age = 24` stores the number `24` under the label `age`.',
            '**2. Lists (`[10, 20, 30]`) & Dictionaries (`{"role": "AI"}`):** A list is an ordered row of items (like a numbered playlist). A dictionary stores `key: value` pairs (like a contact card: `{"name": "Maya", "city": "Beirut"}`).',
            '**3. Functions (`def`) & Indentation:** Python uses **4 spaces of indentation** to group lines together. A function starts with `def`, takes inputs inside `(...)`, and sends back an answer with `return`.',
            '**4. Why NumPy (`np`)?** Regular Python lists are great for names or checklists, while **NumPy arrays** pack numbers tightly in memory so AI math runs ~100× faster.',
          ],
        },
        {
          type: 'table',
          title: 'Beginner Cheat Sheet: Everyday Python & NumPy',
          headers: ['Concept', 'Example Code', 'Plain-English Meaning', 'Why AI Uses It'],
          rows: [
            ['Variable', '`lr = 0.01`', 'Save `0.01` under the name `lr`', 'Store settings & model scores'],
            ['Function', '`def add_one(x): return x + 1`', 'A reusable mini-machine', 'Wrap reusable AI steps cleanly'],
            ['NumPy array', '`a = np.array([10, 20, 30])`', 'A fast row (or grid) of numbers', 'Store embeddings, images & weights'],
            ['Broadcast math', '`a + 5` or `a * 2`', 'Add 5 or double every item at once', 'Scale features & adjust weights'],
            ['Cap / limit values', '`np.minimum(a, 100)`', 'Keep each item at most `100`', 'Clip probabilities & clean outliers'],
          ],
        },
        {
          type: 'python-lab',
          labId: 'lab-1-1',
          title: 'Lab 1.1: Your First NumPy AI Score Booster',
          prompt:
            'Welcome to your NumPy lab! Write a function `boost_and_cap(scores, bonus)` that takes a NumPy array `scores` (like `[70.0, 88.0, 97.0]`), adds `bonus` to every score in one line, and caps any score above `100.0` down to `100.0` using `np.minimum(..., 100.0)`. Hit **Check Solution** to see it pass!',
          starterCode: `import numpy as np

def boost_and_cap(scores: np.ndarray, bonus: float) -> np.ndarray:
    # Step 1: Add bonus to every number in scores: updated = scores + bonus
    # Step 2: Cap values at 100.0 using np.minimum(updated, 100.0)
    # Step 3: Return the final array!
    pass

# Try running the Scratchpad or Check Solution below!
my_scores = np.array([70.0, 88.0, 97.0])
print("Before:", my_scores)
print("After +5 bonus:", boost_and_cap(my_scores, 5.0))`,
          testCode: `import numpy as np
s1 = np.array([70.0, 88.0, 97.0])
res1 = boost_and_cap(s1, 5.0)
assert isinstance(res1, np.ndarray), "Make sure your function returns a NumPy array!"
assert np.allclose(res1, [75.0, 93.0, 100.0]), f"Expected [75.0, 93.0, 100.0], got {res1}"

s2 = np.array([40.0, 100.0])
res2 = boost_and_cap(s2, 10.0)
assert np.allclose(res2, [50.0, 100.0]), f"Expected [50.0, 100.0], got {res2}"
print("PASS: Awesome job—you just wrote and tested real Python + NumPy code!")`,
          solutionCode: `import numpy as np

def boost_and_cap(scores: np.ndarray, bonus: float) -> np.ndarray:
    updated = scores + bonus
    return np.minimum(updated, 100.0)`,
          hint: 'Replace `pass` with two indented lines: `updated = scores + bonus` and then `return np.minimum(updated, 100.0)`.',
          packages: ['numpy'],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Pro Tip: Watch Your Indentation & Copies!',
          body: 'In Python, lines inside a `def` function must be indented equally (4 spaces). Also, if you slice a NumPy array (`part = a[1:3]`), changing `part` changes `a`—use `.copy()` when you want an independent duplicate.',
        },
      ],
      quiz: [
        {
          id: 'q1-1-1',
          question: 'If `scores = np.array([60, 80, 90])`, what does `scores + 5` produce?',
          options: [
            'An error because you cannot add a single number to a list of 3 numbers',
            'A new array `[65, 85, 95]` where 5 was added to every element at once',
            'The array `[60, 80, 90, 5]`',
            'Only `[65, 80, 90]` (first item only)',
          ],
          correctIndex: 1,
          explanation:
            'NumPy automatically "broadcasts" the single number `5` across every item in the array—like applying one spreadsheet formula to a whole column.',
        },
        {
          id: 'q1-1-2',
          question: 'In Python, how do you tell which lines belong inside a `def` function?',
          options: [
            'By wrapping them in `{ curly braces }`',
            'By ending each line with a semicolon `;`',
            'By indenting the inner lines consistently (usually 4 spaces)',
            'By putting `END` at the bottom',
          ],
          correctIndex: 2,
          explanation:
            'Python uses clean indentation (4 spaces) instead of curly braces to group code blocks inside functions, loops, and `if` statements.',
        },
        {
          id: 'q1-1-3',
          question: 'Why does AI engineering rely on NumPy arrays instead of plain Python lists for heavy math?',
          options: [
            'Plain Python lists can only store text, never numbers',
            'NumPy stores numbers tightly in memory and runs math across whole arrays in fast compiled C code',
            'NumPy automatically connects to ChatGPT',
            'Python lists cannot be printed',
          ],
          correctIndex: 1,
          explanation:
            'NumPy packs numbers contiguously in RAM and runs vectorized C operations—making array math roughly 100× faster than looping in plain Python.',
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
