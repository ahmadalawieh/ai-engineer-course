import type { Lesson } from '@/types/course';

export const lesson3_3: Lesson = {
  id: '3-3',
  moduleId: 'mod-3',
  number: '3.3',
  title: 'Unsupervised Learning: K-Means, PCA, UMAP & Anomaly Detection',
  subtitle: 'Segment unlabeled customers with standardized K-Means, compress high-dimensional embeddings cleanly with PCA, visualize semantic manifolds, and flag outliers safely.',
  durationMinutes: 75,
  track: 'ds',
  prerequisites: ['2.4'],
  requires: ['svd-pca', 'data-leakage'],
  teaches: [
    'kmeans-clustering',
    'pca-explained-variance',
    'umap-tsne',
    'anomaly-detection',
  ],
  objectives: [
    'Implement and trace K-Means clustering steps, diagnose Euclidean scale distortion, and pick `K` with Elbow Inertia and Silhouette Score.',
    'Compute Principal Component Analysis (PCA) via standardized SVD and choose components via cumulative explained variance ratio.',
    'Contrast PCA (linear global variance) vs t-SNE / UMAP (non-linear neighborhood visualizations) without misreading inter-cluster distances.',
    'Detect rare operational anomalies using Robust Z-Scores (MAD) and `IsolationForest` without relying on labeled fraud samples.',
  ],
  checkWithoutNotes: [
    'Why does failing to run `StandardScaler` before K-Means cause a high-magnitude column (`annual_income` in dollars) to dominate cluster assignments over `tenure_years`?',
    'Explain why Inertia (Within-Cluster Sum of Squares) ALWAYS drops toward `0` as `K` increases toward `N`, and why Silhouette Score catches overly fragmented `K`.',
    'Suppose two clusters sit twice as far apart as two others on a 2D t-SNE plot of 1,536-dim RAG embeddings. Can you treat that 2D separation ratio as global semantic distance?',
    'Why must PCA and `IsolationForest` fit exclusively on `X_train` before projecting or scoring `X_val` and `X_test`?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Finding Structure & Anomalies When Labels Do Not Exist',
      paragraphs: [
        'In supervised classification, someone hands you ground-truth `y` labels. On real engineering teams, most fresh datasets arrive **unlabeled**: two million customer support transcripts, raw clickstreams with no purchase labels yet, or server telemetry logs before anyone manually tagged incidents. Unsupervised learning discovers latent segments, removes redundant correlation noise, compresses giant dense embeddings cleanly, and flags bizarre outliers before incidents cascade.',
        'These techniques show up continuously inside LLM and AI engineering workflows too. Semantic topic discovery groups support tickets into coherent clusters before you write prompt routing rules. PCA compresses dense embedding matrices cleanly to cut vector storage cost and strip noisy correlated directions. Anomaly detection guards embedding pipelines against corrupted inputs or sudden prompt-drift payloads.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Organizing an Unsorted Bookshelf & Shadow Projections',
      frontendConcept: 'Grouping dozens of un-tagged UI components into design-system buckets by eye or squashing a 3D CAD object onto a clean 2D blueprint',
      aiConcept: 'Centroid Clustering (K-Means) & Orthogonal Variance Projection (PCA)',
      explanation:
        'K-Means works like placing `K` magnetic pins onto a table scattered with receipts: first snap every receipt to its closest pin, then slide each pin directly to the center of gravity of its assigned receipts, repeating until nothing moves. **PCA** works like aiming a flashlight at a 3D swarm of fireflies and rotating the camera until the 2D shadow captures the widest possible spread without losing key detail.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: K-Means Arithmetic, Scaling Sensitivity & Choosing `K`',
      paragraphs: [
        'Trace one full assign-and-update cycle of K-Means (`K = 2`) by hand on four 2D points: `A=(0, 0)`, `B=(0, 2)`, `C=(4, 0)`, and `D=(4, 2)`. Suppose initial centroids start at `c0 = (0, 1)` and `c1 = (3, 1)`. Step 1 (Assign): `A` and `B` have distance `1.0` to `c0` vs `sqrt(10) = 3.16` to `c1`, so both join Cluster 0; `C` and `D` sit distance `sqrt(2) = 1.41` from `c1` vs `4.12` from `c0`, joining Cluster 1. Step 2 (Update): Cluster 0 mean is `((0+0)/2, (0+2)/2) = (0, 1)` and Cluster 1 mean moves to `((4+4)/2, (0+2)/2) = (4, 1)`. Total Within-Cluster Sum of Squares (Inertia) drops to `1^2 + 1^2 + 1^2 + 1^2 = 4.0` and converges cleanly!',
        'Watch what breaks without feature scaling: suppose column 1 measures `tenure_years` (`1..5`) while column 2 measures `annual_spend` (`10,000..100,000`). Euclidean distance squares column differences: a `$5,000` spend gap adds `25,000,000` while a 4-year tenure difference adds `16`—K-Means ignores tenure completely! Always fit `StandardScaler` inside your training pipeline before K-Means. Also note how to pick `K`: Inertia drops monotonically toward `0` (`K = N`), so look for the Elbow inflection AND verify **Silhouette Score** `(b - a) / max(a, b)` (measuring how tight points sit inside their cluster relative to the nearest neighboring cluster, peaking near `+1`).',
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'kmeans',
      title: 'Interactive Lab: K-Means Clustering Step-by-Step Playground',
      description:
        'Click to add or regenerate point clouds, vary $K$, and step through Assign $\\rightarrow$ Update Centroids to watch Voronoi partitions and Inertia (WCSS) converge.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: PCA Compression & Explained Variance Ratios via SVD',
      paragraphs: [
        'Suppose you extract 1,536-dimensional embeddings or 50 correlated behavioral metrics (`clicks_7d`, `clicks_14d`, `clicks_30d`, ...). **Principal Component Analysis (PCA)** centers each column (`X_centered = X - mean`, usually also scaled to unit variance when units differ) and decomposes `X_centered = U @ Sigma @ V^T` via Singular Value Decomposition (SVD). Each row of `V^T` is a mutually orthogonal principal direction ordered by captured variance.',
        'The exact variance explained by component `j` equals `Sigma[j]^2 / (n - 1)`, and its **Explained Variance Ratio** equals `Sigma[j]^2 / sum(Sigma^2)`. Suppose four singular values yield squared energies `[72.0, 20.0, 6.0, 2.0]` (total `100.0`). Their ratios are `[0.72, 0.20, 0.06, 0.02]`. Keeping just the top `2` components retains `72% + 20% = 92%` of total dataset variance while cutting dimensionality and noise in half! Remember: just like `StandardScaler`, PCA fit means and eigenvectors belong strictly inside `X_train`—never run `pca.fit(X_all)` before `train_test_split`.',
      ],
    },
    {
      type: 'table',
      title: 'PCA vs t-SNE vs UMAP Comparison',
      headers: ['Method', 'Geometry & Type', 'What It Preserves', 'Practical Production Use'],
      rows: [
        ['**PCA**', 'Linear orthogonal projection', 'Global variance, linear distances, deterministic `.transform()`', 'Fast feature compression (`95%` variance), noise removal, downstream pipeline preprocessing'],
        ['**t-SNE**', 'Non-linear probabilistic neighbor matching', 'Tight local neighborhoods (distorts inter-cluster gaps and sizes)', 'Static 2D visual inspection of small/medium exploratory snapshots (`< 20k` rows)'],
        ['**UMAP**', 'Non-linear topological manifold', 'Local structure + faster global layout + supports `.transform()`', 'Inspecting RAG document clusters and semantic topic maps interactively'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Unsupervised Anomaly Detection (Robust MAD & Isolation Forest)',
      paragraphs: [
        'Suppose latency logs normally stay around `45–60 ms` across 99% of requests, while two runaway DB locks spike to `12,000 ms`. Using standard arithmetic mean and std (`(x - mean) / std`) breaks down immediately because those `12,000 ms` spikes inflate `std` so much that moderate `400 ms` anomalies pass undetected ("masking effect")! Using **Robust Z-Score** via Median Absolute Deviation (`MAD = median(|x - median(x)|)`, scaled by `0.6745 * (x - median) / MAD`) keeps the baseline anchor rock-solid against extreme contamination.',
        'For multi-dimensional tabular anomalies—such as strange combinations of normal individual values (for example `plan = free` alongside `daily_api_calls = 40,000`)—**Isolation Forest** builds random binary tree partitions. Normal dense points sit deep inside crowded regions requiring many random splits to isolate, whereas isolated outliers get separated near the root in very few average splits! Combine standardized features inside `Pipeline`, tune expected contamination fraction carefully on domain audits, and route anomalies to human review queues rather than blind automated bans.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example Output: Standardized PCA Explained Variance + IsolationForest',
      language: 'python',
      code: `import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(42)
base = rng.normal(size=(100, 1))
# Feature 1 & 2 strongly correlated; Feature 3 adds modest independent signal
X = np.hstack([base, 2.0 * base + rng.normal(scale=0.1, size=(100, 1)), rng.normal(scale=0.5, size=(100, 1))])
X_s = StandardScaler().fit_transform(X)
pca = PCA().fit(X_s)
print("Explained variance ratios:", np.round(pca.explained_variance_ratio_, 3))
print("Cumulative ratio (k=2)   :", round(float(np.cumsum(pca.explained_variance_ratio_)[1]), 3))
# Explained variance ratios: [0.669 0.33  0.001]
# Cumulative ratio (k=2)   : 0.999  <-- 2 components capture 99.9% of scaled variance!`,
      caption: 'SVD/PCA reveals redundant collinear columns instantly, keeping 99.9% of variance in 2 dimensions instead of 3.',
    },
    {
      type: 'prose',
      heading: 'Common Unsupervised Mistakes & How to Debug Them',
      paragraphs: [
        '1) Running K-Means on non-spherical shapes (concentric rings, crescent moons, or unequal cluster densities): Euclidean Voronoi boundaries slice right across curved rings. Diagnose by plotting 2D UMAP/PCA or checking Silhouette dips, then switch to density-based **DBSCAN** / **HDBSCAN** or Gaussian Mixture Models (`GMM`).',
        '2) Calling K-Means once with random initialization (`n_init=1`): poor starting centroids trap inertia in terrible local optima. Always use K-Means++ (`init="k-means++"`) with multiple restarts (`n_init=10` or `"auto"`) and a fixed `random_state`.',
        '3) Interpreting cluster sizes or blank gaps on a 2D t-SNE diagram literally: t-SNE actively equalizes local visual spacing by tweaking perplexity, so wide visual emptiness between two t-SNE blobs does NOT guarantee semantic distance. Never feed 2D t-SNE coordinates into downstream distance classifiers.',
        '4) Fitting PCA or `StandardScaler` on combined `train + test` features before supervised classification: unsupervised dimensionality reduction still uses feature covariance matrices and leaks test distribution geometry unless fit strictly inside training folds.',
        '5) Choosing `K` purely by eyeing an ambiguous Elbow curve when the slope bends smoothly without a sharp knee: pair Silhouette Score (`[-1, +1]`), cluster size balance (`no 2-row junk cluster`), and downstream stakeholder interpretability—meaning can product teams describe each cluster cleanly in domain terms (`high-spend enterprise`, `dormant trial`, `power API user`)?',
        '6) Misconfiguring UMAP `n_neighbors` and `min_dist` without sensitivity checks: small `n_neighbors` (`5`) highlights hyper-local micro-clusters that fragment big concepts, whereas larger `n_neighbors` (`50`) preserves global manifold layout. Always run two settings side by side before reading semantic structure into a 2D embedding projection.',
        '7) Treating `IsolationForest` outlier flags (`-1`) as ground-truth fraud labels automatically: unsupervised anomaly detectors flag *statistical rarity*, which catches harmless celebrity or Black Friday spikes right alongside genuine attacks. Route outlier alerts cleanly into analyst review queues or combine them with supervised fraud signals.',
        '8) Running DBSCAN on dense 768-dim raw embeddings without dimensionality reduction or cosine normalization: high-dimensional Euclidean neighborhoods suffer the curse of dimensionality where nearly every point sits equally far apart. Unit-normalize embeddings (`L2 = 1`) and reduce via PCA or UMAP first before density clustering.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 3.3 Recap: Unsupervised Pattern Discovery',
      body: '- Standardize features BEFORE K-Means so large currency/count columns do not erase small-scale features.\n- Validate `K` using Elbow Inertia alongside Silhouette Score; use DBSCAN/GMM when shapes are non-spherical.\n- Fit PCA strictly on `X_train` and choose `k` by cumulative explained variance ratio (`>= 90%`–`95%`).\n- Treat t-SNE and UMAP as neighborhood visualizers rather than faithful global Euclidean rulers.\n- Prefer Robust MAD Z-scores or `IsolationForest` over naive mean/std when detecting extreme multi-column outliers.',
    },
    {
      type: 'python-lab',
      labId: 'lab-3-3-kmeans',
      difficulty: 'guided',
      requires: ['vectors', 'numpy-arrays'],
      title: 'Lab 3.3A: One Exact K-Means Assign & Centroid Update Step',
      prompt:
        'Implement `kmeans_step(X: np.ndarray, centroids: np.ndarray)` that assigns every row `X[i]` to its closest centroid index (Euclidean L2 distance), recomputes each cluster centroid mean (retaining the previous centroid if a cluster happens to receive 0 points), and computes total Inertia (sum of squared distances from each point to its assigned centroid). Return `(new_centroids, labels, inertia)`.',
      starterCode: `import numpy as np

def kmeans_step(X: np.ndarray, centroids: np.ndarray):
    # 1. Compute pairwise squared Euclidean distances (n, k)
    # 2. labels = np.argmin(sq_dists, axis=1)
    # 3. Recompute centroids (fallback to old centroid if empty)
    # 4. Compute inertia using new_centroids[labels] (or assigned distances)
    pass

X = np.array([[0.0, 0.0], [0.0, 2.0], [4.0, 0.0], [4.0, 2.0]])
c = np.array([[0.0, 1.0], [3.0, 1.0]])
print(kmeans_step(X, c))`,
      testCode: `import numpy as np
X = np.array([[0.0, 0.0], [0.0, 2.0], [4.0, 0.0], [4.0, 2.0]])
c = np.array([[0.0, 1.0], [3.0, 1.0]])
new_c, labels, inertia = kmeans_step(X, c)
assert labels.tolist() == [0, 0, 1, 1]
assert np.allclose(new_c, [[0.0, 1.0], [4.0, 1.0]])
assert abs(inertia - 4.0) < 1e-6, f"Expected inertia 4.0 after centroid update, got {inertia}"
print("PASS: K-Means assign/update step converged cleanly with inertia = 4.0!")`,
      solutionCode: `import numpy as np

def kmeans_step(X: np.ndarray, centroids: np.ndarray):
    sq_dists = np.sum((X[:, None, :] - centroids[None, :, :]) ** 2, axis=2)
    labels = np.argmin(sq_dists, axis=1)
    new_centroids = centroids.astype(float).copy()
    for k in range(len(centroids)):
        mask = labels == k
        if np.any(mask):
            new_centroids[k] = X[mask].mean(axis=0)
    inertia = float(np.sum((X - new_centroids[labels]) ** 2))
    return new_centroids, labels, inertia`,
      hint: 'Broadcast `(X[:, None, :] - centroids[None, :, :]) ** 2` and sum over `axis=2` to compute all `(n, K)` squared distances cleanly.',
      hints: [
        'Find nearest centroid per row via `labels = np.argmin(sq_dists, axis=1)`.',
        'Check `if np.any(labels == k):` before taking `X[labels == k].mean(axis=0)` so empty clusters stay valid.',
        'Compute `inertia = float(np.sum((X - new_centroids[labels]) ** 2))`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-3-pca',
      difficulty: 'spec',
      requires: ['svd-pca', 'data-leakage'],
      title: 'Lab 3.3B: Standardized PCA Component Selector & Leak-Free Projection',
      prompt:
        'Implement `fit_transform_pca(X_train: np.ndarray, X_test: np.ndarray, variance_target: float = 0.90)` that standardizes strictly using `X_train` (`StandardScaler`), fits `PCA(n_components=variance_target, random_state=42)` strictly on standardized `X_train`, and returns `(Z_train, Z_test, n_components_kept)`.',
      starterCode: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

def fit_transform_pca(X_train: np.ndarray, X_test: np.ndarray, variance_target: float = 0.90):
    # Scale strictly on X_train, fit PCA(n_components=variance_target) on scaled X_train,
    # transform both and return (Z_tr, Z_te, pca.n_components_)
    pass`,
      testCode: `import numpy as np
rng = np.random.default_rng(42)
z1 = rng.normal(size=(120, 1))
z2 = rng.normal(size=(120, 1))
X = np.hstack([z1, 2.0 * z1 + rng.normal(scale=0.05, size=(120, 1)), z2, 3.0 * z2 + rng.normal(scale=0.05, size=(120, 1))])
Z_tr, Z_te, k = fit_transform_pca(X[:90], X[90:], variance_target=0.95)
assert k == 2, f"Two strong latent factors should compress 4 columns -> 2 components at 95% variance, got {k}"
assert Z_tr.shape == (90, 2) and Z_te.shape == (30, 2)
print("PASS: Standardized PCA compressed 4 correlated columns down to 2 orthogonal components cleanly!")`,
      solutionCode: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

def fit_transform_pca(X_train: np.ndarray, X_test: np.ndarray, variance_target: float = 0.90):
    scaler = StandardScaler()
    X_tr_s = scaler.fit_transform(X_train)
    X_te_s = scaler.transform(X_test)
    pca = PCA(n_components=variance_target, random_state=42)
    Z_tr = pca.fit_transform(X_tr_s)
    Z_te = pca.transform(X_te_s)
    return Z_tr, Z_te, int(pca.n_components_)`,
      hint: 'Fit both `StandardScaler` and `PCA(n_components=variance_target)` exclusively on `X_train`, then `.transform()` `X_test`.',
      hints: [
        'Call `X_tr_s = scaler.fit_transform(X_train)` and `X_te_s = scaler.transform(X_test)`.',
        'scikit-learn `PCA(n_components=0.95)` automatically selects the fewest components explaining >= 95% variance.',
        'Return `Z_tr, Z_te, int(pca.n_components_)`.',
      ],
      packages: ['numpy', 'scikit-learn'],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-3-anom',
      difficulty: 'debug',
      requires: ['numpy-arrays'],
      title: 'Lab 3.3C: Fix Masking Bug in Outlier Detection Using Robust MAD Z-Score',
      prompt:
        'Standard mean/std Z-scores (`z > 3.0`) fail when one catastrophic `50,000 ms` outlier inflates `std` so badly that real `800 ms` anomalies score below `3.0`! Replace the starter detector with Robust MAD Z-scores: `med = np.median(x)`, `mad = np.median(np.abs(x - med))` (guarding `mad == 0`), and `robust_z = 0.6745 * np.abs(x - med) / mad`, flagging anomalies where `robust_z > threshold`.',
      starterCode: `import numpy as np

def flag_robust_outliers(x: np.ndarray, threshold: float = 3.5) -> np.ndarray:
    arr = np.asarray(x, dtype=float)
    # BUG: extreme outliers inflate mean and std so real anomalies get masked!
    z = np.abs(arr - np.mean(arr)) / max(float(np.std(arr)), 1e-9)
    return z > threshold`,
      testCode: `import numpy as np
latencies = np.array([45, 48, 50, 52, 49, 51, 47, 53, 50, 46, 480.0, 50000.0])
flags = flag_robust_outliers(latencies, threshold=3.5)
assert flags[-1] == True and flags[-2] == True, f"Both 480ms and 50000ms must be caught! Got {flags}"
assert not np.any(flags[:-2]), f"Normal ~50ms points must NOT be flagged, got {flags[:-2]}"
print("PASS: Robust MAD Z-score caught masked 480ms anomaly alongside 50,000ms spike!")`,
      solutionCode: `import numpy as np

def flag_robust_outliers(x: np.ndarray, threshold: float = 3.5) -> np.ndarray:
    arr = np.asarray(x, dtype=float)
    med = float(np.median(arr))
    mad = float(np.median(np.abs(arr - med)))
    if mad == 0.0:
        return np.zeros(len(arr), dtype=bool)
    robust_z = 0.6745 * np.abs(arr - med) / mad
    return robust_z > threshold`,
      hint: 'Compute `med = float(np.median(arr))` and `mad = float(np.median(np.abs(arr - med)))`, then check `0.6745 * np.abs(arr - med) / mad > threshold`.',
      hints: [
        'Use `np.median(arr)` instead of `np.mean(arr)` so spikes cannot pull the center upward.',
        'Compute `mad = float(np.median(np.abs(arr - med)))` and return all `False` if `mad == 0.0`.',
        'Scale by the Gaussian consistency constant `0.6745 * np.abs(arr - med) / mad > threshold`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q3-3-1',
      type: 'multiple-choice',
      question: 'When does standard K-Means fail poorly even when you specify the exact right number of clusters `K`?',
      options: [
        'On non-spherical rings, crescents, or unstandardized multi-scale axes',
        'Whenever `K = 3` on a clean dataset containing exactly three hundred standardized observations',
        'Whenever points sit in 2D Euclidean space generated from balanced isotropic Gaussian spheres',
        'Whenever continuous features have already been scaled cleanly to zero mean and unit variance',
      ],
      correctIndex: 0,
      explanation: 'K-Means enforces straight Voronoi hyperplanes around spherical centroids; non-convex rings, moons, and vastly uneven variances require DBSCAN, spectral clustering, or feature scaling.',
    },
    {
      id: 'q3-3-2',
      type: 'multiple-choice',
      question: 'You project 1,536-dim embeddings down to 2D with t-SNE and observe Cluster A appears twice as far from Cluster B as from Cluster C. What can you conclude?',
      options: [
        'Cluster A is mathematically twice as dissimilar semantically from B as from C across original 1,536-dim vectors',
        'Nothing reliable globally — t-SNE distorts inter-cluster gaps and sizes',
        'Perplexity `5` guarantees exact linear preservation of cosine similarity between separated 2D blobs',
        'Cluster C automatically contains twice as many rows as Cluster B in the original feature matrix',
      ],
      correctIndex: 1,
      explanation: 't-SNE optimizes local conditional neighbor probabilities; global gaps and relative sizes between separated blobs are non-metric visual artifacts.',
    },
    {
      id: 'q3-3-3',
      type: 'multiple-choice',
      question: 'What does PCA’s `explained_variance_ratio_` array tell you?',
      options: [
        'Exact classification ROC-AUC accuracy achieved by each feature on the held-out validation split',
        'Fraction of total dataset variance captured per principal component',
        'The optimal number of K-Means clusters (`K`) minimizing Euclidean inertia across unlabeled rows',
        'The statistical p-value testing whether each original feature column is strictly Gaussian',
      ],
      correctIndex: 1,
      explanation: 'Summing the top `k` ratios tells you how much original signal variance survives compression (e.g. retaining `95%` while cutting column count dramatically).',
    },
    {
      id: 'q3-3-4',
      type: 'numeric',
      question: 'A 3-feature PCA decomposition yields singular-value squared energies `[45.0, 40.0, 15.0]` (total `100.0`). Keeping `k = 2` components preserves what cumulative variance percentage (0 to 100)?',
      options: [],
      correctIndex: 0,
      correctNumber: 85,
      tolerance: 0.1,
      unit: '%',
      explanation: '`(45 + 40) / 100 = 85 / 100 = 85%`.',
    },
    {
      id: 'q3-3-5',
      type: 'spot-bug',
      question: 'Why did K-Means cluster customers strictly by `annual_revenue` (`$10k–$200k`) while ignoring `login_days_per_week` (`0–7`) completely?',
      code: `km = KMeans(n_clusters=4, random_state=42)
km.fit(df[["annual_revenue", "login_days_per_week"]])`,
      options: [
        'K-Means skips every numeric integer column whose maximum stays smaller than `10` inside scikit-learn',
        '`n_clusters=4` restricts Euclidean clustering strictly to the first column in alphabetical order',
        'Unscaled `$50k` squared differences overwhelm 5-day differences completely',
        'K-Means requires one-hot encoding integer day counts before clustering numeric money columns',
      ],
      correctIndex: 2,
      explanation: 'Unscaled Euclidean distance scales with variance squared; fitting `StandardScaler` first puts `annual_revenue` and `login_days_per_week` on equal unit variance.',
    },
    {
      id: 'q3-3-6',
      type: 'predict-output',
      question: 'What happens to K-Means Within-Cluster Sum of Squares (Inertia) as you increase `K` from `2` up toward `N` (every point as its own centroid)?',
      options: [
        'Inertia climbs steadily toward infinity as extra centroids add inter-cluster variance penalties',
        'Inertia flattens immediately once `K` exceeds the number of input feature columns in `X`',
        'Inertia drops monotonically toward `0.0` at `K = N`',
        'Inertia oscillates randomly upward and downward depending on feature correlation signs',
      ],
      correctIndex: 2,
      explanation: 'More centroids always fit training points tighter until every point matches its own centroid (`Inertia = 0`); look for diminishing Elbow drops and validate with Silhouette Score.',
    },
    {
      id: 'q3-3-7',
      type: 'multi-select',
      question: 'Which two choices help prevent outlier masking and multi-column blind spots in anomaly detection?',
      options: [
        'Using Robust Median & MAD Z-scores so catastrophic `50,000 ms` spikes cannot inflate the spread scale',
        'Applying `IsolationForest` on standardized features to catch weird combinations of individually normal values',
        'Computing standard `(x - mean) / std` without checking whether two huge outliers skewed `std` 20x higher',
        'Dropping every column except request timestamp before checking anomalies',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Median/MAD resists extreme contamination masking, and `IsolationForest` captures sparse joint multi-feature anomalies.',
    },
    {
      id: 'q3-3-8',
      type: 'multiple-choice',
      question: 'Why must `pca = PCA(n_components=0.95)` be fit strictly inside `X_train` before transforming `X_test`?',
      options: [
        'Because `PCA.fit()` requires supervised target labels `y_test` that remain unavailable until evaluation runs',
        'Because test rows carry `NaN` targets that crash Singular Value Decomposition on combined input matrices',
        'Because `PCA.transform()` raises `NotFittedError` whenever `X_test` contains fewer rows than `X_train`',
        'Because PCA fits input means and axes, leaking test geometry otherwise',
      ],
      correctIndex: 3,
      explanation: 'Even unsupervised preprocessing learns distributional parameters (means, principal axes) from data; fitting strictly on `X_train` keeps `X_test` honestly unseen.',
    },
    {
      id: 'q3-3-9',
      type: 'ordering',
      question: 'Order one clean pipeline run for unsupervised customer segmentation followed by validation:',
      items: [
        'Inspect and clean invalid sentinel values or missing entries in `X_train`',
        'Fit `StandardScaler` on `X_train` so all behavioral metrics share unit scale',
        'Optional: fit `PCA(n_components=0.95)` on scaled `X_train` to remove redundant noise',
        'Evaluate K-Means (`init="k-means++"`) across `K = 2..8` using Elbow Inertia and Silhouette Score',
        'Inspect cluster profiles in business units (median spend, tenure, churn rate) to verify actionability',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Clean data -> standardize -> optionally compress collinear noise via PCA -> select `K` quantitatively -> audit resulting segments in original domain metrics.',
    },
  ],
};
