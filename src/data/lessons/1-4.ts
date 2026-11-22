import type { Lesson } from '@/types/course';

export const lesson1_4: Lesson = {
  id: '1-4',
  moduleId: 'mod-1',
  number: '1.4',
  title: 'Linear Algebra: Vectors, Matrices, Cosine Similarity & SVD',
  subtitle: 'Build concrete numeric and geometric mastery of embeddings, dot products, cosine search, matrix multiplication, and SVD/LoRA—solved by hand and in NumPy.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['1.1'],
  requires: ['python-functions', 'numpy-arrays'],
  teaches: [
    'vectors',
    'matrices',
    'dot-product',
    'cosine-similarity',
    'svd-pca',
  ],
  objectives: [
    'Compute vector dot products, Euclidean L2 norms, and cosine similarity step-by-step by hand and verify them in vectorized NumPy.',
    'Explain clearly when cosine similarity outperforms raw dot product or Euclidean distance (and when unit normalization makes dot == cosine).',
    'Trace matrix-vector and matrix-matrix shapes (`(m, d) @ (d, k) -> (m, k)`) cleanly inside neural network layers and batch search.',
    'Connect SVD ($A = U \\Sigma V^T$) to low-rank compression, PCA dimensionality reduction, and LoRA LLM fine-tuning.',
  ],
  checkWithoutNotes: [
    'Compute by hand the dot product and cosine similarity between `a = [3, 4]` and `b = [6, 8]`, and explain why scaling `[3, 4]` by `2` leaves cosine similarity unchanged.',
    'Given `docs` of shape `(500, 384)` and `queries` of shape `(10, 384)`, write the exact matrix product yielding all pairwise dot products and state its output shape.',
    'Why does vector search crash with `ZeroDivisionError` (or `NaN`) on an all-zero vector unless you add a small `1e-9` epsilon to the norm denominator?',
    'Explain in one sentence how LoRA uses low-rank matrix factorization (`B @ A`) to fine-tune huge billion-parameter weight matrices cheaply.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Every time a user types a question into a RAG assistant, sends an image into a classifier, or generates a recommendation feed, your application translates meaning into **vectors** and runs **matrix multiplications**. Understanding vector similarity lets you debug why a semantic retriever returned an irrelevant PDF chunk, recognize immediately when someone forgot to normalize embeddings, and spot shape mismatches (`ValueError: shapes (512, 768) and (128, 768) not aligned`) without trial-and-error guessing.',
        'At the same time, you do NOT need theorem proofs from an abstract linear algebra course to be a strong AI engineer. What separates effective engineers is crystal-clear **numeric and geometric intuition**: knowing how an inner product measures alignment, checking matrix dimensions before multiplying, understanding why unit-normalized cosine similarity ignores document length bias, and seeing how low-rank factorization powers PCA and LoRA adapters.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Arrows in Feature Space & Linear Machines',
      paragraphs: [
        'Picture a **vector** $\\mathbf{v} = [v_1, v_2, \\dots, v_d]$ as an arrow anchored at the origin $(0, \\dots, 0)$ pointing toward coordinates inside a $d$-dimensional map. In classical tabular data, those coordinates might represent concrete traits like `[monthly_spend, support_tickets, tenure_months]`. In modern language models, an embedding encoder places sentences with similar intent pointing in nearly the same direction inside a 384- or 1536-dimensional semantic map.',
        'How do we measure whether two arrows point together? Multiply matching entries and sum them: the **dot product** $\\mathbf{a} \\cdot \\mathbf{b} = \\sum a_i b_i$. Notice what happens if document B says `"billing refund"` once (`[1, 1]`) while document C repeats `"billing refund"` ten times (`[10, 10]`): their arrows point along the *exact same diagonal*, yet the raw dot product with query `[1, 1]` explodes 10× larger for document C simply because it is longer! Dividing by both arrow lengths—called **L2 norms** $\\|\\mathbf{a}\\|_2 = \\sqrt{\\sum a_i^2}$—yields **cosine similarity**, stripping magnitude away so identical directions always score `+1.0`, perpendicular unrelated vectors score `0.0`, and opposite vectors score `-1.0`.',
        'Now view a **matrix** $W$ of shape `(out_dim, in_dim)` as a collection of stacked row detectors transforming any input vector $\\mathbf{x}$ into a new space: `y = W @ x`. Each entry of `y` is simply the dot product between one row of `W` and `x`! Even better, packing 1,000 vectors into matrix `X` of shape `(1000, d)` lets NumPy or a GPU compute 1,000 dot products simultaneously in one `X @ q` operation rather than looping in Python.',
      ],
    },
    {
      type: 'math',
      title: 'Dot Product & Cosine Similarity',
      latex: '\\mathbf{a} \\cdot \\mathbf{b} = \\sum_{i=1}^d a_i b_i = \\|\\mathbf{a}\\|\\,\\|\\mathbf{b}\\|\\cos\\theta \\qquad \\text{cosine}(\\mathbf{a}, \\mathbf{b}) = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{\\|\\mathbf{a}\\|_2\\,\\|\\mathbf{b}\\|_2}',
      breakdown: [
        { symbol: '\\mathbf{a} \\cdot \\mathbf{b}', meaning: 'Dot product: sum of pairwise element products; grows with both alignment and vector length' },
        { symbol: '\\|\\mathbf{a}\\|_2', meaning: 'L2 Euclidean norm (arrow length): $\\sqrt{a_1^2 + a_2^2 + \\dots + a_d^2}$' },
        { symbol: '\\cos\\theta', meaning: 'Pure directional alignment from $-1$ (opposite) through $0$ (orthogonal) to $+1$ (same direction)' },
      ],
      intuition:
        'When all embeddings are pre-normalized to unit length ($\\|\\mathbf{v}\\|_2 = 1$), dividing by $1 \\cdot 1$ disappears—so cosine similarity simplifies directly to the fast dot product $\\mathbf{a} \\cdot \\mathbf{b}$!',
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
      heading: 'Worked Example 1: Hand-Solved vs NumPy Cosine Similarity & Projections',
      paragraphs: [
        'Let us solve a concrete numeric pair completely by hand before touching Python so every step stays transparent. Take vector $\\mathbf{a} = [3, 4]$ and vector $\\mathbf{b} = [6, 8]$, plus an unrelated vector $\\mathbf{c} = [-4, 3]$.',
        'Step 1 (Dot product): $\\mathbf{a} \\cdot \\mathbf{b} = (3)(6) + (4)(8) = 18 + 32 = 50$. Meanwhile $\\mathbf{a} \\cdot \\mathbf{c} = (3)(-4) + (4)(3) = -12 + 12 = 0$ (perpendicular!). Step 2 (L2 lengths): $\\|\\mathbf{a}\\|_2 = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$, and $\\|\\mathbf{b}\\|_2 = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$. Step 3 (Cosine): $\\text{cos}(\\mathbf{a}, \\mathbf{b}) = 50 / (5 \\times 10) = 1.0$, confirming $\\mathbf{b} = 2\\mathbf{a}$ points in the exact same direction! Now verify the exact arithmetic in NumPy:',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Verifying Hand Arithmetic in NumPy',
      language: 'python',
      code: `import numpy as np

a = np.array([3.0, 4.0])
b = np.array([6.0, 8.0])
c = np.array([-4.0, 3.0])

def cosine(u: np.ndarray, v: np.ndarray) -> float:
    return float((u @ v) / ((np.linalg.norm(u) * np.linalg.norm(v)) + 1e-9))

print("dot(a, b) :", a @ b, "| norm(a):", np.linalg.norm(a), "| norm(b):", np.linalg.norm(b))
print("cos(a, b) :", round(cosine(a, b), 4))
print("cos(a, c) :", round(cosine(a, c), 4))`,
      caption: 'Explained output: `dot(a, b): 50.0 | norm(a): 5.0 | norm(b): 10.0`, `cos(a, b): 1.0`, `cos(a, c): 0.0`. Notice `@` computes the exact dot product $3\\cdot 6 + 4\\cdot 8 = 50$, matching our hand calculation.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Matrix Shapes, Batch Search & Low-Rank SVD / LoRA',
      paragraphs: [
        'Suppose your document store holds $n = 3$ unit-normalized chunks in $D \\in \\mathbb{R}^{3 \\times 2}$ and you serve $m = 2$ queries in $Q \\in \\mathbb{R}^{2 \\times 2}$. Multiplying `Q @ D.T` checks inner dimensions: `(2, 2) @ (2, 3) -> (2, 3)`. Entry `[i, j]` holds the similarity between query `i` and document `j`—all computed in one vectorized matrix multiply! Conversely, forgetting `.T` raises a shape mismatch immediately unless $n = d$, in which case square matrices silently produce meaningless garbage instead of crashing.',
        'That same matrix geometry explains **Singular Value Decomposition (SVD)** and **LoRA**. Any matrix $A \\in \\mathbb{R}^{m \\times n}$ decomposes into $A = U \\Sigma V^T$ (rotate $\\rightarrow$ stretch along perpendicular principal axes $\\sigma_1 \\ge \\sigma_2 \\ge \\dots$ $\\rightarrow$ rotate). Keeping only the top $r$ largest singular values shrinks storage and discards noise—which is both how **PCA** compresses high-dimensional features and how **LoRA** freezes a huge $4096 \\times 4096$ ($16.7$M weights) LLM layer $W$ and trains only tiny low-rank adapters $B A$ ($4096 \\times 8$ plus $8 \\times 4096 = 65{,}536$ weights—under $0.4\\%$ of the parameters!).',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Batch Cosine Matrix Search & Low-Rank Approximation Error',
      language: 'python',
      code: `import numpy as np

# Normalize rows across a (3, 2) doc matrix and a (2, 2) query batch
docs = np.array([[1.0, 0.0], [3.0, 4.0], [0.0, 5.0]])
queries = np.array([[3.0, 4.0], [0.0, 1.0]])

docs_unit = docs / (np.linalg.norm(docs, axis=1, keepdims=True) + 1e-9)
q_unit = queries / (np.linalg.norm(queries, axis=1, keepdims=True) + 1e-9)
sim_matrix = q_unit @ docs_unit.T  # shape (2, 3)
print("Similarity matrix (2 queries x 3 docs):\\n", np.round(sim_matrix, 3))`,
      caption: 'Explained output shows row 0 `[0.6, 1.0, 0.8]` (query `[3, 4]` matches doc 1 `[3, 4]` with score `1.0`) and row 1 `[0.0, 0.8, 1.0]` (query `[0, 1]` matches doc 2 `[0, 5]` with score `1.0`). Notice `keepdims=True` keeps column norms `(n, 1)` aligned for row-wise division!',
    },
    {
      type: 'code-builder',
      puzzleId: 'puzzle-1-2',
      title: 'Warm-Up Puzzle: Order the Batch Cosine Search Steps',
      prompt:
        'Tap the lines in order to measure query and document lengths safely, compute cosine similarity scores, and return the top `k` best-matching document indices.',
      lines: [
        'q_norm = np.linalg.norm(q) + 1e-9',
        'docs_norm = np.linalg.norm(docs, axis=1) + 1e-9',
        'sims = (docs @ q) / (docs_norm * q_norm)',
        'top_indices = np.argsort(-sims)[:k]',
        'return top_indices',
      ],
      explanation:
        'First compute norms with `1e-9` division safety, divide dot products `docs @ q` by those lengths, and slice the top `k` indices using `np.argsort(-sims)[:k]`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Cosine vs Euclidean Distance vs Dot Product & Shape Rules',
      paragraphs: [
        'Choosing the right vector similarity metric prevents silent retrieval bugs on the job. **Dot product** rewards both direction and raw magnitude—useful when vector length intentionally reflects popularity or frequency, yet dangerous when verbose documents overpower concise exact answers. **Euclidean distance** (`np.linalg.norm(a - b)`) measures straight-line tip-to-tip gap: vectors `[1, 1]` and `[10, 10]` sit far apart in Euclidean space (`~12.7`), even though their cosine similarity is `+1.0`!',
        'On normalized unit vectors (`norm == 1`), Euclidean distance squared equals $2(1 - \\cos\\theta)$, so ranking by smallest Euclidean distance, largest cosine similarity, and largest dot product all produce the exact same order! Always match the metric your embedding provider trained with (`cosine` or unit-normalized `ip`/inner product for OpenAI, BGE, and E5 text models), and verify `(batch, embed_dim)` row-major ordering consistently across NumPy and vector databases.',
        'Keep one more linear-algebra safeguard in mind when reading ML layers: **rank and projection**. Multiplying a `(100, 1536)` embedding matrix by a `(1536, 256)` learned projection matrix squashes each 1536-number vector down onto a compact 256-dimensional subspace. If two columns of a feature matrix are exact multiples of each other (**collinear** / rank-deficient), linear models become unstable—which is why inspecting eigenvalues or adding small regularization rescues ill-conditioned fits.',
        'Notice also the elegance of **orthogonal directions** (vectors at $90^\\circ$ whose dot product equals zero): principal components produced by PCA and the left/right singular bases in SVD are strictly mutually orthogonal. Because zero dot products mean zero redundant overlap, projecting high-dimensional telemetry or embeddings onto the top orthogonal directions packs maximum variance into fewer stored coordinates with minimal reconstruction loss.',
        'In real RAG deployments, vector RAM sizing is also simple arithmetic: storing `100,000` vectors of dimension `1536` in `float32` (`4` bytes each) uses `100,000 * 1,536 * 4 ≈ 614 MB` of raw RAM before index overhead—making back-of-the-envelope capacity planning trivial.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Forgetting `axis=1` inside `np.linalg.norm(docs)`:** Calling `np.linalg.norm(docs)` without `axis=1` computes ONE scalar Frobenius norm across the entire 2D matrix instead of one length per row vector! Always specify `axis=1` (and `keepdims=True` when dividing back into `docs`).',
        '**Mistake 2 — Using `*` instead of `@` on two NumPy vectors/matrices:** In NumPy, `A * B` performs *element-wise* multiplication, whereas `A @ B` performs true dot product / matrix multiplication. Mixing them up silently produces wrong numbers whenever shapes match.',
        '**Mistake 3 — Dividing by zero on an empty or zero embedding vector:** If an empty document produces `[0.0, 0.0, 0.0]`, dividing by norm `0.0` fills your similarity array with `NaN`, breaking sorting (`np.argsort` puts `NaN` at surprising positions!). Always add `+ 1e-9` to denominators.',
        '**Mistake 4 — Comparing unnormalized vectors with dot product when document lengths vary:** Unnormalized dot product favors long repetitive chunks over concise exact matches. Either L2-normalize first or divide by both norms (`cosine`).',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Vectors represent meaning numerically:** Embeddings encode semantic concepts as directions in $\\mathbb{R}^d$.',
        '2. **Cosine removes length bias:** Divide dot product `a @ b` by `norm(a) * norm(b) + 1e-9`—or unit-normalize first so dot == cosine.',
        '3. **Check matrix shapes explicitly:** `(m, d) @ (d, n) -> (m, n)`; use `axis=1, keepdims=True` for row-wise normalization.',
        '4. **Distinguish `@` from `*`:** `@` is linear-algebra dot/matrix product; `*` is element-wise.',
        '5. **SVD reveals dominant directions:** Low-rank factorization $B A$ captures essential variation for PCA and LoRA fine-tuning.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-4-1',
      difficulty: 'guided',
      requires: ['vectors', 'cosine-similarity'],
      title: 'Lab 1.4.1 (Guided): Batch Cosine Similarity Search',
      prompt:
        'Given query vector `q` of shape `(d,)` and document embedding matrix `docs` of shape `(n, d)`, implement `top_k_similar(q, docs, k)` returning a 1D integer NumPy array of the `k` highest-cosine-similarity document indices in descending order.',
      starterCode: `import numpy as np

def top_k_similar(q: np.ndarray, docs: np.ndarray, k: int) -> np.ndarray:
    # Step 1: q_norm = np.linalg.norm(q) + 1e-9
    # Step 2: docs_norm = np.linalg.norm(docs, axis=1) + 1e-9
    # Step 3: sims = (docs @ q) / (docs_norm * q_norm)
    # Step 4: return np.argsort(-sims)[:k]
    pass

q = np.array([1.0, 0.0, 1.0])
docs = np.array([[0.0, 1.0, 0.0], [2.0, 0.0, 2.0], [1.0, 1.0, 0.0]])
print("Top indices:", top_k_similar(q, docs, 2))`,
      testCode: `import numpy as np
q = np.array([1.0, 0.0, 1.0])
docs = np.array([
    [0.0, 1.0, 0.0],   # 0.0
    [5.0, 0.0, 5.0],   # 1.0
    [1.0, 1.0, 0.0],   # 0.5
    [-1.0, 0.0, -1.0], # -1.0
])
res = top_k_similar(q, docs, 2)
assert list(res) == [1, 2], f"Expected [1, 2], got {list(res)}"
assert list(top_k_similar(q, np.array([[0.0, 0.0, 0.0], [1.0, 0.0, 1.0]]), 2)) == [1, 0]
print("PASS: Lab 1.4.1 Batch cosine similarity search passed!")`,
      solutionCode: `import numpy as np

def top_k_similar(q: np.ndarray, docs: np.ndarray, k: int) -> np.ndarray:
    q_norm = np.linalg.norm(q) + 1e-9
    docs_norm = np.linalg.norm(docs, axis=1) + 1e-9
    sims = (docs @ q) / (docs_norm * q_norm)
    return np.argsort(-sims)[:k]`,
      hint: 'Use `np.linalg.norm(docs, axis=1) + 1e-9` and sort descending with `np.argsort(-sims)[:k]`.',
      hints: [
        'Compute `q_norm = np.linalg.norm(q) + 1e-9`.',
        'Compute per-row norms with `docs_norm = np.linalg.norm(docs, axis=1) + 1e-9`.',
        'Compute `sims = (docs @ q) / (docs_norm * q_norm)` and return `np.argsort(-sims)[:k]`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-4-2',
      difficulty: 'spec',
      requires: ['matrices', 'cosine-similarity'],
      title: 'Lab 1.4.2 (From Spec): Row Unit-Normalization & All-Pairs Similarity Matrix',
      prompt:
        'Implement two functions: 1) `normalize_rows(mat)` normalizing each row of 2D array `mat` (`(n, d)`) to unit L2 length (adding `1e-9` epsilon to zero-norm rows safely without `NaN`). 2) `pairwise_cosine(queries, docs)` returning the `(m, n)` cosine similarity matrix between `(m, d)` queries and `(n, d)` docs.',
      starterCode: `import numpy as np

def normalize_rows(mat: np.ndarray) -> np.ndarray:
    # Return row-wise L2-normalized matrix of same shape
    pass

def pairwise_cosine(queries: np.ndarray, docs: np.ndarray) -> np.ndarray:
    # Normalize both and multiply cleanly
    pass`,
      testCode: `import numpy as np
docs = np.array([[3.0, 4.0], [0.0, 0.0], [0.0, 5.0]])
u = normalize_rows(docs)
assert u.shape == (3, 2)
assert np.allclose(u[0], [0.6, 0.8])
assert np.allclose(u[1], [0.0, 0.0])

q = np.array([[6.0, 8.0], [0.0, 2.0]])
sim = pairwise_cosine(q, docs)
assert sim.shape == (2, 3), f"Expected (2, 3), got {sim.shape}"
assert np.allclose(sim[0], [1.0, 0.0, 0.8]), f"Row 0 mismatch: {sim[0]}"
assert np.allclose(sim[1], [0.8, 0.0, 1.0]), f"Row 1 mismatch: {sim[1]}"
print("PASS: Lab 1.4.2 Row normalization & pairwise matrix passed!")`,
      solutionCode: `import numpy as np

def normalize_rows(mat: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(mat, axis=1, keepdims=True) + 1e-9
    return mat / norms

def pairwise_cosine(queries: np.ndarray, docs: np.ndarray) -> np.ndarray:
    return normalize_rows(queries) @ normalize_rows(docs).T`,
      hint: 'Inside `normalize_rows`, compute `norms = np.linalg.norm(mat, axis=1, keepdims=True) + 1e-9` and return `mat / norms`. Then multiply `normalize_rows(queries) @ normalize_rows(docs).T`.',
      hints: [
        'Use `keepdims=True` in `np.linalg.norm(mat, axis=1, keepdims=True)` so broadcasting divides every row cleanly.',
        'Adding `+ 1e-9` ensures `[0.0, 0.0]` stays `[0.0, 0.0]` instead of becoming `[NaN, NaN]`.',
        'In `pairwise_cosine`, compute `normalize_rows(queries) @ normalize_rows(docs).T`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-4-3',
      difficulty: 'debug',
      requires: ['matrices', 'svd-pca'],
      title: 'Lab 1.4.3 (Debug Buggy Code): Fix Linear Layer Shape & Low-Rank LoRA Update',
      prompt:
        'A broken neural adapter computes `out = x @ (W + B * A)` where `x` has shape `(batch, in_dim)`, `W` has shape `(in_dim, out_dim)`, `B` has shape `(in_dim, r)`, and `A` has shape `(r, out_dim)`. Right now: 1) it multiplies `B * A` element-wise (crashing on mismatched shapes!) instead of matrix product `B @ A`, and 2) `x` gets multiplied in reversed order `W @ x`. Fix `lora_forward(x, W, B, A, alpha)` computing `x @ (W + alpha * (B @ A))`!',
      starterCode: `import numpy as np

def lora_forward(x: np.ndarray, W: np.ndarray, B: np.ndarray, A: np.ndarray, alpha: float = 1.0) -> np.ndarray:
    delta = B * A        # Bug 1: element-wise * instead of matrix product @
    adapted = W + alpha * delta
    return adapted @ x   # Bug 2: reversed matrix order!`,
      testCode: `import numpy as np
rng = np.random.default_rng(42)
x = rng.normal(size=(4, 6))
W = np.zeros((6, 3))
B = np.ones((6, 2))
A = np.ones((2, 3))
out = lora_forward(x, W, B, A, alpha=0.5)
assert out.shape == (4, 3), f"Expected shape (4, 3), got {out.shape}"
expected = x @ (0.5 * (B @ A))
assert np.allclose(out, expected), "Output mismatch with x @ (W + alpha * (B @ A))"
print("PASS: Lab 1.4.3 Linear layer & LoRA low-rank matrix math fixed!")`,
      solutionCode: `import numpy as np

def lora_forward(x: np.ndarray, W: np.ndarray, B: np.ndarray, A: np.ndarray, alpha: float = 1.0) -> np.ndarray:
    delta = B @ A
    adapted = W + alpha * delta
    return x @ adapted`,
      hint: 'Change `B * A` to `B @ A` (`(6, 2) @ (2, 3) -> (6, 3)`) and compute `x @ adapted` (`(4, 6) @ (6, 3) -> (4, 3)`).',
      hints: [
        'Use `@` for low-rank matrix multiplication `delta = B @ A`.',
        'Verify shapes: `x` is `(batch, in_dim)` and `adapted` is `(in_dim, out_dim)`.',
        'Return `x @ adapted` rather than `adapted @ x`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q1-4-1',
      type: 'numeric',
      question: 'Compute by hand the dot product $\\mathbf{a} \\cdot \\mathbf{b}$ for $\\mathbf{a} = [2, -1, 4]$ and $\\mathbf{b} = [5, 3, 2]$.',
      options: [],
      correctIndex: 0,
      correctNumber: 15,
      tolerance: 0,
      explanation: '$(2)(5) + (-1)(3) + (4)(2) = 10 - 3 + 8 = 15$.',
    },
    {
      id: 'q1-4-2',
      type: 'multiple-choice',
      question: 'Vector $\\mathbf{a} = [3, 4]$ and vector $\\mathbf{b} = [30, 40]$. What is their cosine similarity?',
      options: [
        '`10.0`, because vector $\\mathbf{b}$ was scaled ten times longer than vector $\\mathbf{a}$',
        '`250.0`, equal to their unnormalized scalar dot product before division',
        '`0.1`, equal to the ratio dividing magnitude $\\|\\mathbf{a}\\|$ by magnitude $\\|\\mathbf{b}\\|$',
        '`1.0`, because both vectors point in the exact same direction',
      ],
      correctIndex: 3,
      explanation: 'Cosine similarity divides out vector norms: $(3\\cdot 30 + 4\\cdot 40) / (5 \\cdot 50) = 250 / 250 = 1.0$.',
    },
    {
      id: 'q1-4-3',
      type: 'multiple-choice',
      question: 'If matrix $Q$ has shape `(16, 384)` and document matrix $D$ has shape `(500, 384)`, which expression yields the `(16, 500)` similarity score matrix?',
      options: [
        '`Q @ D`',
        '`Q @ D.T`',
        '`D @ Q`',
        '`Q * D`',
      ],
      correctIndex: 1,
      explanation: '`D.T` has shape `(384, 500)`. Inner dimensions `(384)` align cleanly in `(16, 384) @ (384, 500) -> (16, 500)`.',
    },
    {
      id: 'q1-4-4',
      type: 'spot-bug',
      code: `norms = np.linalg.norm(docs)
unit_docs = docs / norms`,
      question: 'Why does `np.linalg.norm(docs)` fail to unit-normalize each document row in a `(100, 384)` matrix?',
      options: [
        '`np.linalg.norm` strictly rejects 2D arrays and requires a flattened 1D Python list',
        'NumPy refuses element-wise division whenever dividing a float matrix by a float scalar',
        'Omitting `axis=1, keepdims=True` computes one scalar norm across the entire matrix',
        'It normalizes columns vertically instead of normalizing document rows horizontally',
      ],
      correctIndex: 2,
      explanation: 'Omitting `axis=1` collapses the entire 2D matrix into a single scalar norm. Pass `axis=1, keepdims=True` to divide every row by its own length.',
    },
    {
      id: 'q1-4-5',
      type: 'predict-output',
      code: `import numpy as np
a = np.array([1.0, 2.0])
b = np.array([3.0, 4.0])
print(a * b, a @ b)`,
      question: 'What exact output is printed?',
      options: [
        '`11.0 [3. 8.]` (dot then product)',
        '`11.0 11.0` (both dot products)',
        'Raises `ValueError` on 1D inputs',
        '`[3. 8.] 11.0`',
      ],
      correctIndex: 3,
      explanation: '`a * b` multiplies element-wise (`[1*3, 2*4] = [3., 8.]`), while `a @ b` computes the dot product `1*3 + 2*4 = 11.0`.',
    },
    {
      id: 'q1-4-6',
      type: 'multi-select',
      question: 'Which TWO statements accurately describe Singular Value Decomposition (SVD) and low-rank updates?',
      options: [
        'Any matrix $A$ factors into $U \\Sigma V^T$ ordering dominant variance axes in $\\Sigma$',
        'LoRA adds a low-rank update $B A$ ($r \\ll d$) instead of updating all $d^2$ dense weights',
        'SVD can only factorize square symmetric matrices with positive entries',
        'Low-rank factorization makes matrices sparse by zeroing out negative rows',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'SVD applies to ANY rectangular matrix $A \\in \\mathbb{R}^{m \\times n}$, revealing rank/variance directions used in PCA and motivating LoRA $B A$ factorization.',
    },
    {
      id: 'q1-4-7',
      type: 'multiple-choice',
      question: 'Why do vector databases often L2-normalize stored embeddings at ingestion time?',
      options: [
        'Normalized vectors shrink storage footprint in memory and disk by 50% per float',
        'Unit length makes cosine equal dot product `a @ b`, skipping norm division',
        'Relational engines like PostgreSQL refuse storing any float entry exceeding `1.0`',
        'L2 normalization compresses 1536-dimensional arrays down into 8-bit integer hashes',
      ],
      correctIndex: 1,
      explanation: 'When $\\|\\mathbf{a}\\|_2 = \\|\\mathbf{b}\\|_2 = 1$, dividing by $\\|\\mathbf{a}\\|\\|\\mathbf{b}\\| = 1$ becomes redundant, so fast dot products yield exact cosine rankings.',
    },
    {
      id: 'q1-4-8',
      type: 'ordering',
      question: 'Order the steps to compute cosine similarity safely between query `q` and matrix `docs`:',
      options: [],
      items: [
        'Compute query length norm_q = np.linalg.norm(q) + 1e-9',
        'Compute per-row lengths norm_docs = np.linalg.norm(docs, axis=1) + 1e-9',
        'Compute raw alignment dots = docs @ q',
        'Divide cosine_scores = dots / (norm_docs * norm_q)',
      ],
      correctIndex: 0,
      explanation: 'Compute both norms safely with `1e-9`, compute dot products `docs @ q`, and divide dot products by the denominator norm products.',
    },
    {
      id: 'q1-4-9',
      type: 'numeric',
      question: 'A weight matrix $W$ is `(1000, 1000)` (`1,000,000` parameters). Using LoRA with rank `r = 8` (`B` is `(1000, 8)` and `A` is `(8, 1000)`), how many trainable parameters does $B$ plus $A$ contain?',
      options: [],
      correctIndex: 0,
      correctNumber: 16000,
      tolerance: 0,
      explanation: '`1000 * 8 + 8 * 1000 = 8,000 + 8,000 = 16,000` parameters—only `1.6%` of the full million-parameter matrix.',
    },
  ],
};
