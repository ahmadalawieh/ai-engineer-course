import type { Lesson } from '@/types/course';

export const lesson3_2: Lesson = {
  id: '3-2',
  moduleId: 'mod-3',
  number: '3.2',
  title: 'Decision Trees, Random Forests & Gradient Boosting (XGBoost)',
  subtitle: 'Understand Gini impurity splitting, bagging variance reduction, sequential residual boosting, and why GBDTs dominate structured tabular AI.',
  durationMinutes: 85,
  track: 'ds',
  prerequisites: ['3.1'],
  requires: ['bias-variance', 'regularization-l1-l2'],
  teaches: [
    'decision-trees-gini',
    'random-forest-bagging',
    'gbdt-boosting',
    'sklearn-pipelines',
  ],
  objectives: [
    'Compute Gini impurity and weighted information gain step by step to see how Decision Trees select split thresholds.',
    'Contrast Bagging (Random Forest — parallel variance reduction via decorrelated deep trees) vs Boosting (GBDT — sequential bias reduction on residuals).',
    'Implement an additive decision-stump gradient booster from scratch and a leak-free `scikit-learn` `GradientBoostingClassifier` pipeline.',
    'Control tree overfitting using `max_depth`, `learning_rate`, `subsample`, `min_samples_leaf`, and early stopping—and recognize tree extrapolation limits.',
  ],
  checkWithoutNotes: [
    'Compute Gini impurity `1 - (p0^2 + p1^2)` for a node containing 6 positives and 2 negatives (`n = 8`).',
    'Explain why Random Forests randomly subsample columns (`max_features`) at every tree split rather than evaluating all columns every time.',
    'How does Gradient Boosting turn weak depth-3 trees (`max_depth = 3`) into an accurate non-linear predictor, and why can adding 5,000 trees without `early_stopping` hurt validation?',
    'Explain why Decision Trees and XGBoost fail to extrapolate smoothly when forecasting steadily rising revenue above historical maximums.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Gradient Boosted Decision Trees Still Win on Tabular Business Data',
      paragraphs: [
        'Transformers and convolutional networks rule text, images, and audio. Yet on **structured tabular business tables**—SQL exports containing customer age, tenure, plan tier, rolling spend, support ticket counts, and ratios—**Gradient Boosted Decision Trees (XGBoost, LightGBM, CatBoost, and scikit-learn HistGradientBoosting)** consistently match or beat deep neural networks while training cleanly in seconds on ordinary CPUs.',
        'Why do trees thrive on messy relational columns? Because axis-aligned splits (`spend <= 120.5`) automatically capture sharp non-linear thresholds, handle mixed feature scales without requiring `StandardScaler`, remain unbothered by extreme monotonic skew (`income`), learn multi-way feature interactions inside nested branches, and natively ignore irrelevant noise columns that never win a split.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Committee Voting (Bagging) vs Iterative Draft Polishing (Boosting)',
      frontendConcept: 'Running 50 independent developers in parallel on separate random subsets of bugs vs having 50 consecutive reviewers fix only the mistakes left behind by the previous reviewer',
      aiConcept: 'Random Forest (Bagging) vs Gradient Boosted Decision Trees (Boosting)',
      explanation:
        'A **Random Forest** hires 100 deep, opinionated experts, gives each a different bootstrapped dataset and random column shortlist, and averages their votes—individual errors cancel out, slashing **variance**. **Gradient Boosting** starts with one simple average guess, hires shallow depth-3 "stump editors" one after another where each tree focuses exclusively on the **residual errors** remaining from earlier trees—iteratively slashing **bias**.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: How Decision Trees Split via Gini Impurity',
      paragraphs: [
        'At every internal node, a classification tree tests candidate feature thresholds `x_j <= t` to split the node into cleaner child groups. One standard impurity score is **Gini Impurity**: `G = 1 - sum_k p_k^2`, where `p_k` is the fraction of class `k` inside that node. A completely pure node (`[8 pos, 0 neg]`) scores `1 - (1^2 + 0^2) = 0.0`, whereas a maximally mixed 50/50 node (`[4 pos, 4 neg]`) scores `1 - (0.5^2 + 0.5^2) = 0.50`.',
        'Trace a concrete split on `n = 8` customers (`4` churned, `4` stayed; parent `G = 0.50`). Suppose testing `support_tickets >= 3` splits them into Left (`tickets < 3`: `1` churned, `3` stayed -> `n_L = 4`) and Right (`tickets >= 3`: `3` churned, `1` stayed -> `n_R = 4`). Left Gini is `1 - (0.25^2 + 0.75^2) = 1 - (0.0625 + 0.5625) = 0.375`, and Right Gini is identically `0.375`. Weighted child impurity is `(4/8)*0.375 + (4/8)*0.375 = 0.375`, yielding **Gini Gain = `0.50 - 0.375 = 0.125`**. The tree scans every column and threshold, picking whichever split maximizes Gini reduction!',
      ],
    },
    {
      type: 'table',
      title: 'Bagging (Random Forest) vs Boosting (XGBoost / LightGBM / HistGBDT)',
      headers: ['Dimension', 'Random Forest (Bagging)', 'XGBoost / LightGBM (Boosting)'],
      rows: [
        ['How trees are built', 'In **parallel**, independently on bootstrap resamples + random `max_features` per split', '**Sequentially**: each new shallow tree fits the **pseudo-residuals** (negative gradients) of prior trees'],
        ['Primary error reduction', 'Slashes **variance** (averaging diverse deep trees cancels noise)', 'Slashes **bias** (sequential residual correction captures subtle interactions)'],
        ['Typical tree depth', 'Deep unconstrained or lightly pruned (`max_depth=12..None`)', 'Shallow learners (`max_depth=3..8`, or `num_leaves=15..63`)'],
        ['Adding too many trees', 'Safe (validation error plateaus cleanly)', 'Overfits noise unless controlled via small `learning_rate` + `early_stopping_rounds`'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Tracing Residual Boosting Step by Step',
      paragraphs: [
        'Trace regression gradient boosting by hand with learning rate `lr = 0.5` on three target values `y = [10.0, 12.0, 20.0]`. Round 0 initializes every prediction to the global mean `pred_0 = [14.0, 14.0, 14.0]`. Residuals `r_0 = y - pred_0` equal `[-4.0, -2.0, +6.0]` (note: `-(y - pred)` is the exact derivative of `0.5 * (y - pred)^2`, so `y - pred` is the **negative gradient**!).',
        'Round 1 fits one shallow stump predicting `-3.0` for the first two rows and `+6.0` for the third row. Instead of trusting the step fully (`+1.0`), shrinkage scales it by `lr = 0.5`: `pred_1 = [14 + 0.5*(-3), 14 + 0.5*(-3), 14 + 0.5*(6)] = [12.5, 12.5, 17.0]`. Look at MSE dropping from `((16 + 4 + 36)/3 = 18.67)` down to `((6.25 + 0.25 + 9.0)/3 = 5.17)` in a single shallow round! Lower `learning_rate` (`0.03–0.1`) paired with row/column subsampling (`subsample = 0.8`, `colsample_bytree = 0.8`) and `early_stopping_rounds` gives boosted ensembles crisp generalization.',
      ],
    },
    {
      type: 'code-builder',
      puzzleId: 'puzzle-3-2-ml',
      title: 'Warm-Up Puzzle: Leak-Free Tabular ML Pipeline Order',
      prompt:
        'Ordering steps wrong causes subtle data leakage! Arrange the lines below into exact leak-free training and evaluation order.',
      lines: [
        'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)',
        'pipe = Pipeline([("scaler", StandardScaler()), ("clf", GradientBoostingClassifier())])',
        'pipe.fit(X_train, y_train)',
        'probs = pipe.predict_proba(X_test)[:, 1]',
        'print("Test ROC-AUC:", roc_auc_score(y_test, probs))',
      ],
      explanation:
        'Always split `train` and `test` FIRST, wrap preprocessing + model in a `Pipeline`, `.fit()` strictly on `X_train`, and evaluate `.predict_proba()` on `X_test`.',
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'Critical Limitation of Trees: Zero Extrapolation Beyond Training Bounds',
      body: 'Every decision tree leaf outputs a constant scalar average of the training samples inside that rectangular box. Consequently, **trees cannot extrapolate trends** outside the min/max range seen during training! If monthly SaaS revenue grew steadily from `\\$100k` to `\\$500k` in 2024 and reaches `\\$620k` next quarter, an XGBoost trained directly on `month_number` predicts at most `\\$500k` flat forever. For trending time-series targets, predict growth deltas, detrend linearly first, or pair trees with linear models.',
    },
    {
      type: 'prose',
      heading: 'Common Tree & Boosting Mistakes & How to Debug Them',
      paragraphs: [
        '1) Training XGBoost/LightGBM with `n_estimators = 2000` and NO `early_stopping_rounds`: unlike Random Forest, boosted trees eventually memorize outlier residuals on training rows while validation log-loss climbs. Always pass a held-out `eval_set` (or scikit-learn `early_stopping=True` in `HistGradientBoostingClassifier`) so boosting halts cleanly at the validation trough.',
        '2) Setting `max_depth = 15` inside Gradient Boosting: deep boosted trees carve single-row leaves immediately and overfit badly. Keep boosted trees shallow (`max_depth = 3..6`) and use more slow rounds (`learning_rate = 0.05`) instead.',
        '3) Trusting default `feature_importances_` (Gini/split-count importance) blindly: split counting favors noisy high-cardinality numerical variables (`transaction_id`, random noise floats) that offer lots of candidate thresholds. Debug suspicious rankings using **Permutation Importance** on validation folds or **SHAP** values.',
        '4) Forgetting that tree probability calibration can drift under extreme imbalance or heavy boosting rounds: verify Brier Score and apply `CalibratedClassifierCV` on validation folds before thresholding dollar costs.',
        '5) Ignoring `min_samples_leaf` / `min_child_weight` when training on noisy tabular events: without a minimum leaf floor (for instance `min_samples_leaf=20`), boosted trees isolate tiny clusters of 1 or 2 mislabeled outliers into dedicated leaf buckets. Raising `min_child_weight` prevents chasing sparse noise spikes while leaving rich high-volume patterns intact.',
        '6) One-hot encoding 500-level high-cardinality categories into dense wide matrices for deep trees: sparse indicator flags dilute split probabilities and slow down histogram binning drastically. Prefer out-of-fold smoothed target encoding for scikit-learn / XGBoost, or enable native categorical splitting in `HistGradientBoostingClassifier(categorical_features=...)`, LightGBM, or CatBoost.',
        '7) Treating Gini Impurity vs Shannon Entropy as a major hyperparameter tuning lever: both concave impurity curves rank nearly identical splits (`Entropy` penalizes tiny impurities slightly more sharply and uses logarithms), so focus tuning effort on `max_depth`, `learning_rate`, `subsample`, and `early_stopping` instead.',
        '8) Allowing un-constrained trees to violate domain business monotonicity (e.g., predicting LOWER credit risk as missed payments jump from 3 to 4 due to sparse local noise): modern LightGBM and XGBoost support explicit `monotone_constraints` guaranteeing smooth, auditable directional behavior across sensitive numeric inputs.',
        '9) Underestimating why histogram-based GBDTs (`HistGradientBoostingClassifier`, LightGBM, XGBoost `hist`) run dramatically faster than exact sorting: instead of checking every distinct floating-point value across millions of rows, they quantize continuous inputs into 256 discrete percentile bins once beforehand, cutting split evaluation complexity cleanly while adding gentle regularization against single-point split overfitting.',
        '10) Filling `NaN` values with `-999` blindly before feeding modern tree learners: XGBoost, LightGBM, and `HistGradientBoostingClassifier` learn an explicit **default branch direction** for missing entries at every split node during training, often beating naive median imputation whenever missingness carries MNAR signal—so let native missing routing work or compare both via cross-validation!',
        '11) Omitting `random_state` and `n_jobs` standards in shared team training scripts: stochastic subsampling (`subsample=0.8`, `colsample_bytree=0.8`) changes leaf boundaries slightly across runs unless seeded deterministically, making debugging regressions painful when a candidate change shifts validation PR-AUC by only `0.002`. Pin seeds cleanly inside config manifests and document deterministic thread settings before comparing sibling candidate runs across local laptops, staging containers, and automated CI runners.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 3.2 Recap: Trees, Bagging & Gradient Boosting',
      body: '- Decision Trees greedily maximize purity reduction (Gini or Entropy) via axis-aligned splits.\n- Random Forest reduces variance by averaging deep, feature-subsampled trees trained in parallel.\n- Gradient Boosting reduces bias by sequentially fitting shallow trees (`max_depth=3..6`) to negative residuals scaled by `learning_rate`.\n- Always pair GBDTs with `early_stopping` and row/column subsampling (`subsample`, `colsample_bytree`).\n- Never ask pure trees to extrapolate monotonic upward trends beyond training `y` bounds.',
    },
    {
      type: 'python-lab',
      labId: 'lab-3-2-gini',
      difficulty: 'guided',
      requires: ['numpy-arrays', 'python-functions'],
      title: 'Lab 3.2A: Gini Impurity & Weighted Split Gain Calculator',
      prompt:
        'Implement `gini_impurity(y: np.ndarray) -> float` (`1 - sum(p_k^2)`, returning `0.0` if empty) and `split_gini_gain(y_parent, left_mask) -> float` returning `gini(parent) - (n_left/n * gini(left) + n_right/n * gini(right))`.',
      starterCode: `import numpy as np

def gini_impurity(y: np.ndarray) -> float:
    if len(y) == 0:
        return 0.0
    # Count unique classes, divide by len(y), return 1.0 - np.sum(probs ** 2)
    pass

def split_gini_gain(y_parent: np.ndarray, left_mask: np.ndarray) -> float:
    # Compute parent Gini minus weighted child Gini impurities
    pass`,
      testCode: `import numpy as np
y = np.array([1, 1, 1, 1, 0, 0, 0, 0])
assert abs(gini_impurity(y) - 0.5) < 1e-6
assert abs(gini_impurity(np.array([1, 1, 1])) - 0.0) < 1e-6
mask = np.array([True, False, False, False, True, True, True, False])  # Left: [1,0,0,0], Right: [1,1,1,0]
gain = split_gini_gain(y, mask)
assert abs(gain - 0.125) < 1e-6, f"Expected Gini gain 0.125, got {gain}"
print("PASS: Exact Gini impurity and weighted split gain match hand derivation!")`,
      solutionCode: `import numpy as np

def gini_impurity(y: np.ndarray) -> float:
    if len(y) == 0:
        return 0.0
    _, counts = np.unique(y, return_counts=True)
    probs = counts / len(y)
    return float(1.0 - np.sum(probs ** 2))

def split_gini_gain(y_parent: np.ndarray, left_mask: np.ndarray) -> float:
    n = len(y_parent)
    y_left = y_parent[left_mask]
    y_right = y_parent[~left_mask]
    weighted_child = (len(y_left) / n) * gini_impurity(y_left) + (len(y_right) / n) * gini_impurity(y_right)
    return float(gini_impurity(y_parent) - weighted_child)`,
      hint: 'Use `_, counts = np.unique(y, return_counts=True)` to get class proportions quickly regardless of label encoding.',
      hints: [
        'Divide `counts / len(y)` to obtain class probability array `probs`.',
        'Return `float(1.0 - np.sum(probs ** 2))` inside `gini_impurity`.',
        'Weight child impurities by `len(y_left) / n` and `len(y_right) / n` before subtracting from `gini_impurity(y_parent)`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-2',
      difficulty: 'spec',
      requires: ['decision-trees-gini', 'numpy-arrays'],
      title: 'Lab 3.2B: Build a 1D Gradient Booster from Scratch',
      prompt:
        'Implement `boost_1d(x, y, n_rounds, lr)` where each round fits a 1-split Decision Stump (`best_stump`) to current negative residuals `residuals = y - pred`, then adds `lr * stump_pred` onto `pred`.',
      starterCode: `import numpy as np

def best_stump(x_1d: np.ndarray, residuals: np.ndarray):
    best_thresh, best_left, best_right, best_loss = 0.0, 0.0, 0.0, float('inf')
    for thresh in np.unique(x_1d):
        left_mask = x_1d <= thresh
        if left_mask.all() or (~left_mask).all():
            continue
        l_val = residuals[left_mask].mean()
        r_val = residuals[~left_mask].mean()
        preds = np.where(left_mask, l_val, r_val)
        loss = np.mean((residuals - preds) ** 2)
        if loss < best_loss:
            best_thresh, best_left, best_right, best_loss = thresh, l_val, r_val, loss
    return best_thresh, best_left, best_right

def boost_1d(x: np.ndarray, y: np.ndarray, n_rounds: int = 15, lr: float = 0.3):
    pred = np.full_like(y, y.mean(), dtype=float)
    for _ in range(n_rounds):
        # 1. residuals = y - pred
        # 2. thresh, l_val, r_val = best_stump(x, residuals)
        # 3. pred += lr * np.where(x <= thresh, l_val, r_val)
        pass
    return pred

x = np.linspace(0, 10, 20)
y = np.where(x < 3, 1.0, np.where(x < 7, 5.0, 2.0))
preds = boost_1d(x, y)
print("MSE:", round(float(np.mean((y - preds) ** 2)), 4))`,
      testCode: `import numpy as np
x = np.linspace(0, 10, 30)
y = np.where(x < 3.5, 1.0, np.where(x < 7.0, 6.0, 2.0))
preds = boost_1d(x, y, n_rounds=35, lr=0.3)
mse = float(np.mean((y - preds) ** 2))
assert mse < 0.05, f"Boosted stumps should fit piecewise function tightly (MSE < 0.05), got {mse}"
print(f"PASS: Gradient boosting reduced MSE to {mse:.5f}!")`,
      solutionCode: `import numpy as np

def best_stump(x_1d: np.ndarray, residuals: np.ndarray):
    best_thresh, best_left, best_right, best_loss = 0.0, 0.0, 0.0, float('inf')
    for thresh in np.unique(x_1d):
        left_mask = x_1d <= thresh
        if left_mask.all() or (~left_mask).all():
            continue
        l_val = residuals[left_mask].mean()
        r_val = residuals[~left_mask].mean()
        preds = np.where(left_mask, l_val, r_val)
        loss = np.mean((residuals - preds) ** 2)
        if loss < best_loss:
            best_thresh, best_left, best_right, best_loss = thresh, l_val, r_val, loss
    return best_thresh, best_left, best_right

def boost_1d(x: np.ndarray, y: np.ndarray, n_rounds: int = 15, lr: float = 0.3):
    pred = np.full_like(y, y.mean(), dtype=float)
    for _ in range(n_rounds):
        residuals = y - pred
        thresh, l_val, r_val = best_stump(x, residuals)
        stump_pred = np.where(x <= thresh, l_val, r_val)
        pred += lr * stump_pred
    return pred`,
      hint: 'Each round fits `residuals = y - pred` and adds `lr * np.where(x <= thresh, l_val, r_val)`.',
      hints: [
        'Compute `residuals = y - pred` at the start of every loop round.',
        'Call `thresh, l_val, r_val = best_stump(x, residuals)`.',
        'Construct `stump_pred = np.where(x <= thresh, l_val, r_val)` and accumulate `pred += lr * stump_pred`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-3',
      difficulty: 'debug',
      requires: ['data-leakage'],
      title: 'Lab 3.2C: Real scikit-learn Pipeline & GradientBoostingClassifier',
      prompt:
        'Complete `train_churn_model(X_train, y_train, X_test)` by building a leak-free `Pipeline` with `StandardScaler()` and `GradientBoostingClassifier(random_state=42)`, fitting strictly on `(X_train, y_train)`, and returning `predict_proba(X_test)[:, 1]` (positive-class probabilities).',
      starterCode: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score

def train_churn_model(X_train, y_train, X_test):
    # 1. Build Pipeline([('scaler', StandardScaler()), ('clf', GradientBoostingClassifier(random_state=42))])
    # 2. Fit strictly on (X_train, y_train)
    # 3. Return pipe.predict_proba(X_test)[:, 1]
    pass

rng = np.random.default_rng(7)
X = rng.normal(size=(120, 4))
y = ((X[:, 0] * 1.8 - X[:, 1] * 1.2) > 0.2).astype(int)
probs = train_churn_model(X[:90], y[:90], X[90:])
if probs is not None:
    print("Test ROC-AUC:", round(float(roc_auc_score(y[90:], probs)), 3))`,
      testCode: `import numpy as np
from sklearn.metrics import roc_auc_score
rng = np.random.default_rng(42)
X = rng.normal(size=(160, 4))
y = ((X[:, 0] * 2.0 - X[:, 1] * 1.4 + 0.3 * X[:, 2]) > 0.1).astype(int)
probs = train_churn_model(X[:120], y[:120], X[120:])
assert probs is not None and len(probs) == 40, "Must return 40 predicted probabilities"
auc = float(roc_auc_score(y[120:], probs))
assert auc >= 0.85, f"Expected ROC-AUC >= 0.85, got {auc:.3f}"
print(f"PASS: scikit-learn Pipeline achieved ROC-AUC = {auc:.3f}!")`,
      solutionCode: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier

def train_churn_model(X_train, y_train, X_test):
    pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('clf', GradientBoostingClassifier(random_state=42)),
    ])
    pipe.fit(X_train, y_train)
    return pipe.predict_proba(X_test)[:, 1]`,
      hint: 'Create `Pipeline([("scaler", StandardScaler()), ("clf", GradientBoostingClassifier(random_state=42))])`, fit on train, return column `[:, 1]` of `predict_proba(X_test)`.',
      hints: [
        'Remember `.predict_proba(X_test)` returns 2 columns `[prob_class_0, prob_class_1]`.',
        'Slice `[:, 1]` for positive churn probabilities rather than returning class labels via `.predict()`.',
        'Fit the `Pipeline` strictly on `(X_train, y_train)` before evaluating `X_test`.',
      ],
      packages: ['numpy', 'scikit-learn'],
    },
  ],
  quiz: [
    {
      id: 'q3-2-1',
      type: 'multiple-choice',
      question: 'In Gradient Boosted Decision Trees, what target is each new sequential tree trained to predict?',
      options: [
        'Unlabeled cluster assignments computed periodically from prior K-Means centroids across feature space',
        'Pseudo-residuals (negative loss gradient of prior ensemble predictions)',
        'Only the top two highest-variance Principal Components extracted from raw standardized columns',
        'Randomly bootstrapped duplicates of the exact unchanged original target column every round',
      ],
      correctIndex: 1,
      explanation: 'Each sequential boosted tree models the negative loss gradient (pseudo-residual) left behind by earlier trees, steadily reducing bias.',
    },
    {
      id: 'q3-2-2',
      type: 'multiple-choice',
      question: 'Why does Random Forest randomly sample a subset of candidate features (`max_features`) at every tree split?',
      options: [
        'To decorrelate trees so averaging them cancels variance effectively',
        'Because Python decision tree builders crash whenever internal splits inspect more than three columns together',
        'To guarantee every bootstrap tree in the forest reproduces the exact same optimal root feature split',
        'To deliberately increase training bias until predictions resemble simple unregularized linear slopes',
      ],
      correctIndex: 0,
      explanation: 'Without feature subsampling, one strong predictor forces nearly identical trees across bootstrap samples, neutralizing the variance reduction of bagging.',
    },
    {
      id: 'q3-2-3',
      type: 'multiple-choice',
      question: 'Your XGBoost validation loss begins climbing after 180 trees while training loss continues plunging toward zero. What should you do?',
      options: [
        'Increase `max_depth` sharply from `4` up to `20` so every boosted tree reaches purer leaves immediately',
        'Use `early_stopping_rounds`, lower depth/`learning_rate`, add subsampling',
        'Delete the held-out validation split and evaluate training log-loss up to `5,000` boosting rounds',
        'Multiply every numeric input column by `100` to widen Gini threshold margins across features',
      ],
      correctIndex: 1,
      explanation: 'Early stopping halts boosting cleanly at the validation minimum; shallower depth, lower `learning_rate`, and row/column subsampling curb variance.',
    },
    {
      id: 'q3-2-4',
      type: 'numeric',
      question: 'A decision tree node holds `9` positives and `1` negative (`10` samples total). What is its exact Gini impurity `1 - (0.9^2 + 0.1^2)`?',
      options: [],
      correctIndex: 0,
      correctNumber: 0.18,
      tolerance: 0.005,
      unit: '',
      explanation: '`1 - (0.81 + 0.01) = 1 - 0.82 = 0.18`.',
    },
    {
      id: 'q3-2-5',
      type: 'predict-output',
      question: 'Suppose initial mean prediction is `10.0` on target `y = 14.0`, and Round 1 stump predicts residual `+4.0` with `learning_rate = 0.25`. What is the updated prediction after Round 1?',
      options: [
        '`10.0` because `learning_rate` only activates inside gradient boosting starting after Round 2 completes',
        '`14.0` because single-split regression stumps bypass `learning_rate` whenever fitting exact residuals',
        '`11.0` (`10.0 + 0.25 * 4.0`)',
        '`13.75` because `learning_rate` subtracts `0.25` directly from the true target label `14.0`',
      ],
      correctIndex: 2,
      explanation: 'Additive boosting updates `pred_new = pred_old + lr * stump_pred = 10.0 + 0.25 * 4.0 = 11.0`.',
    },
    {
      id: 'q3-2-6',
      type: 'spot-bug',
      question: 'A retail team trains XGBoost on `2022–2024` monthly revenue (`$100k` rising steadily to `$400k`) using `month_index` to forecast `2025` (`$480k`). Every `2025` month predicts flat `$400k`. Why?',
      options: [
        'XGBoost skips numeric integer trend columns completely unless scaled via `StandardScaler` beforehand',
        'Gradient boosting defaults to Logistic Sigmoid probabilities capped rigidly between `0` and `1` for regression',
        'Tree leaves emit historical box averages and cannot extrapolate past `$400k`',
        '`month_index` triggered silent many-to-many key duplication during `.predict()` execution',
      ],
      correctIndex: 2,
      explanation: 'Axis-aligned tree leaves cannot project slopes upward beyond training `y` bounds; detrend the target or include linear/autoregressive components.',
    },
    {
      id: 'q3-2-7',
      type: 'multi-select',
      question: 'Which two hyperparameters directly curb overfitting in Gradient Boosted Trees?',
      options: [
        'Lowering `max_depth` (for example from `10` down to `4`) to prevent memorizing single-row rules',
        'Setting `subsample = 0.8` and `colsample_bytree = 0.8` so each tree sees a randomized fraction of rows and features',
        'Raising `n_estimators` to `10,000` with `early_stopping_rounds = None` and `learning_rate = 1.0`',
        'Replacing stratified validation folds with training-fold self-evaluation',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Shallow depths (`max_depth=3..6`) and stochastic row/feature subsampling reduce variance cleanly; huge unstopped `learning_rate=1.0` memorizes noise.',
    },
    {
      id: 'q3-2-8',
      type: 'multiple-choice',
      question: 'Why does default Gini split importance in tree libraries often rank a random continuous ID column higher than a genuine binary indicator?',
      options: [
        'Continuous high-cardinality floats offer far more noisy split points than binary flags',
        'Because scikit-learn ranks Gini importance in exact inverse order of true feature-target correlation',
        'Because binary features exhibit zero variance inside trees and get skipped automatically during splitting',
        'Because gradient tree builders assign priority weights strictly to columns near index zero',
      ],
      correctIndex: 0,
      explanation: 'Continuous high-cardinality columns offer thousands of candidate cut points that randomly match training noise slightly better than clean binary flags; use validation Permutation Importance or SHAP instead.',
    },
    {
      id: 'q3-2-9',
      type: 'ordering',
      question: 'Order one round of Gradient Boosted Decision Tree regression training:',
      items: [
        'Compute current predictions `pred` from existing ensemble rounds',
        'Calculate negative residuals `r = y - pred` for every training row',
        'Fit a shallow decision tree (`max_depth = 3..6`) predicting residuals `r`',
        'Add shrinkage update `pred += learning_rate * tree.predict(X)`',
        'Check validation loss and stop early if validation error stops improving',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Evaluate current ensemble -> compute negative gradients -> fit shallow tree on residuals -> shrink and add -> check early-stopping validation criterion.',
    },
  ],
};
