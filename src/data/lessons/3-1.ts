import type { Lesson } from '@/types/course';

export const lesson3_1: Lesson = {
  id: '3-1',
  moduleId: 'mod-3',
  number: '3.1',
  title: 'Linear, Logistic Regression & Bias-Variance Tradeoff',
  subtitle: 'Master parametric baselines, Sigmoid + Binary Cross-Entropy optimization, bias-variance diagnosis, and L1/L2 regularization from scratch and in NumPy.',
  durationMinutes: 75,
  track: 'ds',
  prerequisites: ['2.4', '2.5'],
  requires: ['gradient-descent', 'data-leakage', 'precision-recall-f1'],
  teaches: [
    'linear-regression',
    'logistic-regression',
    'bias-variance',
    'regularization-l1-l2',
  ],
  objectives: [
    'Benchmark production problems with fast, calibrated Linear and Logistic Regression before reaching for heavy ensembles.',
    'Diagnose High Bias (underfitting) vs High Variance (overfitting) directly from Train vs Validation learning curves.',
    'Derive and implement Binary Cross-Entropy gradients for Logistic Regression (`dw = X.T @ (p - y) / n`).',
    'Contrast L2 (Ridge) weight shrinkage vs L1 (Lasso) feature sparsity and standardize inputs cleanly beforehand.',
  ],
  checkWithoutNotes: [
    'Your classifier scores `99.2%` on training data and `67.5%` on validation data. Is this High Bias or High Variance, and what two actions fix it?',
    'Explain mathematically why L1 (`lambda * sum(|w_j|)`) pushes irrelevant feature weights all the way to exact zero while L2 (`lambda * sum(w_j^2)`) only shrinks them smoothly.',
    'Why must every numeric feature be standardized (`StandardScaler`) BEFORE fitting Ridge or Lasso regression?',
    'Why should you NEVER apply L2 weight regularization to the scalar intercept bias `b`?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Linear & Logistic Models Are Still First-Class Production Tools',
      paragraphs: [
        'Before spinning up a GPU cluster or tuning a 500-tree gradient booster, senior machine learning engineers almost always train a standardized Linear or Logistic Regression baseline first. Why? Because linear models train in milliseconds on CPU, expose crystal-clear weight coefficients (`log-odds` or unit dollar impact per feature), output naturally calibrated probabilities when optimized with Binary Cross-Entropy, and establish an honest score floor that complex models must justify beating.',
        'Even if your final role focuses entirely on Large Language Models or deep computer vision, understanding linear models is mandatory: the final classification head at the top of GPT, BERT, and ResNet is literally a linear projection plus Softmax or Sigmoid. Every pitfall you debug here—feature scaling imbalance, vanishing slopes, weight explosion, and high-variance overfitting—reappears inside billion-parameter neural networks.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Underfitting vs Overfitting as Studying Rules vs Memorizing Flashcards',
      frontendConcept: 'Hardcoding three overly broad CSS breakpoints that look broken on tablets vs writing 400 brittle pixel-specific media queries',
      aiConcept: 'The Bias-Variance Tradeoff & Regularization Penalty (`L1` / `L2`)',
      explanation:
        'Imagine preparing for an interview. A student with **High Bias (underfitting)** learns only one rigid rule ("always say binary search") and bombs both practice questions and real interviews—training and validation errors are both terrible. A student with **High Variance (overfitting)** memorizes every word of 50 practice transcripts verbatim—they score 100% on practice sheets yet panic whenever an interviewer rephrases a single number. Regularization penalizes memorizing tiny quirks so your model generalizes smoothly to unseen traffic.',
    },
    {
      type: 'math',
      title: 'Ridge (L2) vs Lasso (L1) Regularized Objectives',
      latex: 'L_{\\text{L2}}(w) = \\frac{1}{n}\\|Xw - y\\|_2^2 + \\lambda \\sum_{j=1}^{d} w_j^2 \\qquad L_{\\text{L1}}(w) = \\frac{1}{n}\\|Xw - y\\|_2^2 + \\lambda \\sum_{j=1}^{d} |w_j|',
      breakdown: [
        { symbol: '\\lambda', meaning: 'Regularization strength: `0` recovers unregularized regression; larger $\\lambda$ restricts weight magnitude to lower variance' },
        { symbol: '\\sum w_j^2', meaning: 'L2 (Ridge): smooth quadratic penalty whose gradient $2\\lambda w_j$ shrinks correlated weights proportionally without zeroing them out' },
        { symbol: '\\sum |w_j|', meaning: 'L1 (Lasso): sharp diamond constraint corners push useless noisy weights cleanly to exact `0.0` (sparse feature selection)' },
      ],
      intuition:
        'Regularization attaches a "complexity tax" to every non-zero slope. If a noisy feature barely lowers training loss, paying the $\\lambda$ weight penalty is not worth it—so L2 shrinks its slope near zero while L1 deletes it cleanly to `0.0`. Notice the sum excludes intercept $b$: shifting overall baseline predictions up or down should never be taxed!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Logistic Regression Forward & Gradient Arithmetic by Hand',
      paragraphs: [
        'Linear Regression predicts unconstrained real outputs `y_hat = x @ w + b` under MSE loss, which fails on probabilities because `y_hat` easily shoots below `0` or above `1`. Logistic Regression wraps that exact linear score ("logit" `z = x @ w + b`) inside the **Sigmoid** `sigma(z) = 1 / (1 + exp(-z))` and minimizes **Binary Cross-Entropy (Log Loss)**.',
        'Trace one hand step on a single example `x = [2.0, -1.0]`, true label `y = 1`, starting weights `w = [0.0, 0.0]`, and bias `b = 0.0`. First compute logit `z = 2.0*0 + (-1.0)*0 + 0 = 0.0`. Passing through Sigmoid yields `p = 1 / (1 + exp(0)) = 0.50`. Under Binary Cross-Entropy, the exact gradient simplifies beautifully via the Chain Rule to `(p - y) * x`! Here error `p - y = 0.50 - 1.0 = -0.50`. Multiplying by input gives `dw = -0.50 * [2.0, -1.0] = [-1.0, +0.5]` and `db = -0.50`.',
        'Applying gradient descent with learning rate `lr = 0.2` moves opposite the gradient: `w_new = [0, 0] - 0.2 * [-1.0, +0.5] = [0.20, -0.10]` and `b_new = 0.0 - 0.2 * (-0.50) = +0.10`. Recomputing the logit on that same sample gives `z_new = 2.0*(0.20) + (-1.0)*(-0.10) + 0.10 = 0.60`, pushing `sigma(0.60) = 0.646` sharply upward toward `y = 1`! Note why clipping `z` cleanly (`np.clip(z, -50, 50)`) avoids `exp()` overflow on extreme logits.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Closed-Form Ridge & Why Feature Scale Breaks Regularization',
      paragraphs: [
        'Suppose you predict apartment price using two features: `distance_km` (`1..10`) and `area_sqft` (`500..3000`). If true price depends equally on distance (`-\\$10,000` per km) and area (`+\\$200` per sqft), unscaled Ridge pays `w_dist^2 = (-10000)^2 = 10^8` versus `w_area^2 = 200^2 = 40,000`—penalizing `distance_km` `2,500x` more harshly solely because kilometers happened to be measured in larger increments per unit than square feet! Standardizing every input to mean `0` and std `1` first places all weights on equal footing.',
        'For small or medium linear problems, Ridge also solves cleanly in one exact linear algebra step without iterative gradient descent loops: adding `lambda * I` onto `X_aug.T @ X_aug` (keeping a `0.0` entry on the intercept diagonal so `b` stays unpenalized!) makes the matrix strictly positive definite and invertible even when two input columns are collinear (`height_cm` and `height_m`).',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example Output: Ridge Collinear Stabilization & Sparsity Inspection',
      language: 'python',
      code: `import numpy as np

# Collinear columns (x1 and x2 = 2*x1 + tiny noise) with intercept column of 1s
rng = np.random.default_rng(42)
x1 = rng.normal(size=100)
X = np.column_stack([np.ones(100), x1, 2.0 * x1 + rng.normal(scale=1e-4, size=100)])
y = 3.0 + 4.0 * x1 + rng.normal(scale=0.5, size=100)

# Unregularized normal equations blow up on opposite giant canceling weights!
w_ols = np.linalg.solve(X.T @ X + 1e-12 * np.eye(3), X.T @ y)
# Ridge penalty (zero on intercept index 0) stabilizes correlated slopes cleanly
reg = np.diag([0.0, 5.0, 5.0])
w_ridge = np.linalg.solve(X.T @ X + reg, X.T @ y)
print("OLS unstable weights  :", np.round(w_ols, 1))    # e.g. [3.0, -560.4, 282.2]
print("Ridge stable weights  :", np.round(w_ridge, 2))  # e.g. [2.98, 0.79, 1.59]`,
      caption: 'Without L2 shrinkage, correlated features explode into huge canceling weights (`-560` and `+282`) that break catastrophically under minor test noise.',
    },
    {
      type: 'table',
      title: 'Diagnostic Playbook: Bias vs Variance Symptoms & Engineering Fixes',
      headers: ['Observed Gap', 'Diagnosis', 'Verified Fixes'],
      rows: [
        ['High Train MSE, High Val MSE (gap small)', '**High Bias** (Underfitting)', 'Add non-linear features/interactions, lower `lambda`, upgrade to GBDT or deeper network'],
        ['Tiny Train MSE, Huge Val MSE (gap large)', '**High Variance** (Overfitting)', 'Gather more training rows, raise L1/L2 `lambda`, drop noisy columns, collect clean CV folds'],
        ['Train & Val both match Bayes noise floor', 'Well-Balanced Fit', 'Ship baseline, check probability calibration (`Brier`), monitor drift'],
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'regularization',
      title: 'Interactive Lab: Polynomial Degree & L2 Regularization Explorer',
      description:
        'Adjust polynomial degree (`1` to `12`) and regularization strength $\\lambda$ on noisy sine data. Watch Train vs Validation MSE curves reveal the exact sweet spot between underfitting and overfitting.',
    },
    {
      type: 'prose',
      heading: 'Common Linear & Regularization Mistakes & How to Debug Them',
      paragraphs: [
        '1) Penalizing the intercept term inside custom Ridge/Lasso solvers: if you penalize `b` when target prices average `\\$500,000`, every prediction gets dragged artificially toward zero! Always exclude `b` from `sum(w^2)` or set position `(0, 0)` of your regularization diagonal matrix to `0.0`.',
        '2) Regularizing unstandardized features (`salary` in dollars alongside `years_experience` in single digits): debug skewed weight shrinkages by inspecting `StandardScaler` inside `sklearn.Pipeline` before `LogisticRegression(C=...)`. Remember that in scikit-learn `LogisticRegression` and `SVC`, parameter `C` equals `1 / lambda`, so **smaller `C` applies STRONGER regularization**—the opposite sign convention from `Ridge(alpha=...)`!',
        '3) Interpreting raw logistic coefficients `w_j` as direct percentage probability increases: `w_j` shifts the log-odds `log(p / (1 - p))`, not raw probability `p` linearly. Explain impact using odds ratios `exp(w_j)` or concrete probability differences around typical customer baselines.',
        '4) Expecting a linear classifier to draw circular or XOR decision boundaries without feature engineering: a straight hyperplane cannot isolate high-risk bands in the middle of a range (`age` `18..25` and `75+` risky while `30..60` safe) unless you add quadratic terms, splines, or bucketed indicators.',
        '5) Using pure L1 Lasso when ten features are tightly correlated (for example `clicks_7d`, `clicks_14d`, `clicks_30d`): Lasso arbitrarily picks one member of the correlated group and zeroes out the rest inconsistently across bootstrap splits! When you need both feature selection and stability among correlated columns, choose **ElasticNet** (`alpha * (l1_ratio * L1 + (1 - l1_ratio) * L2)`), which blends Lasso sparsity with Ridge grouping.',
        '6) Assuming Logistic Regression probabilities remain accurate when you pass `class_weight="balanced"` during training: balancing minority weights boosts recall at fixed thresholds, yet shifts raw predicted probabilities significantly higher than actual population prevalence unless recalibrated afterward.',
        '7) Ignoring `ConvergenceWarning: lbfgs failed to converge` inside scikit-learn: almost always caused by unscaled features (`[0.01 .. 500,000]`) creating ill-conditioned ravines where line search stalls. Placing `StandardScaler()` inside a `Pipeline` and setting `max_iter=1000` resolves convergence immediately.',
        '8) Throwing high-degree `PolynomialFeatures(degree=5)` onto 20 features blindly: `20` features expand to tens of thousands of cross-terms instantly, causing severe high variance unless paired with strong L1/L2 shrinkage and cross-validated learning curves showing whether adding more rows actually lowers validation error.',
        '9) Forgetting why closed-form normal equations `(X.T @ X)^-1 X.T y` break on wide matrices (`100,000` features): matrix inversion scales roughly cubically with feature count (`O(d^3)`), exhausting RAM fast—switch to stochastic gradient descent (`SGDRegressor`) or L-BFGS coordinate solvers when `d` grows beyond a few thousand dimensions.',
        '10) Assuming `Ridge` or `Lasso` selects good `alpha` defaults automatically: always wrap `RidgeCV` or `LogisticRegressionCV` inside your training pipeline so cross-validation chooses penalty strength empirically on validation folds rather than trusting arbitrary library defaults.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 3.1 Recap: Parametric Baselines & Regularization',
      body: '- Benchmark standardized Linear or Logistic Regression before complex non-linear models.\n- Diagnose High Bias (both train & val poor) vs High Variance (train strong, val weak) via learning curves.\n- Sigmoid + Binary Cross-Entropy simplifies cleanly to gradient `dw = X.T @ (p - y) / n`.\n- Standardize features before applying L1 (sparse feature selector) or L2 (collinear stabilizer), and never penalize the intercept `b`.\n- Remember scikit-learn `C = 1 / lambda`: smaller `C` means stronger shrinkage.',
    },
    {
      type: 'python-lab',
      labId: 'lab-3-1',
      difficulty: 'guided',
      requires: ['gradient-descent', 'numpy-arrays'],
      title: 'Lab 3.1A: Logistic Regression Training Loop in NumPy',
      prompt:
        'Implement `fit_logistic(X, y, lr, steps)` using Sigmoid $\\sigma(z) = 1 / (1 + e^{-z})$ and Binary Cross-Entropy gradients: `dw = (X.T @ (preds - y)) / n`, `db = float(np.mean(preds - y))`. Return `(w, b)`.',
      starterCode: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def fit_logistic(X: np.ndarray, y: np.ndarray, lr: float = 0.2, steps: int = 400):
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    for _ in range(steps):
        # 1. preds = sigmoid(X @ w + b)
        # 2. compute dw and db
        # 3. update w -= lr * dw, b -= lr * db
        pass
    return w, b

X = np.array([[-2.0], [-1.0], [1.0], [2.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
w, b = fit_logistic(X, y)
print("Probs:", np.round(sigmoid(X @ w + b), 3))`,
      testCode: `import numpy as np
X = np.array([[-2.0, -1.0], [-1.5, -0.5], [1.5, 0.5], [2.0, 1.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
w, b = fit_logistic(X, y, lr=0.3, steps=500)
probs = sigmoid(X @ w + b)
assert probs[0] < 0.1 and probs[1] < 0.1, f"Negatives should be <0.1, got {probs[:2]}"
assert probs[2] > 0.9 and probs[3] > 0.9, f"Positives should be >0.9, got {probs[2:]}"
print("PASS: Logistic regression learned clean decision boundary!")`,
      solutionCode: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def fit_logistic(X: np.ndarray, y: np.ndarray, lr: float = 0.2, steps: int = 400):
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    for _ in range(steps):
        preds = sigmoid(X @ w + b)
        err = preds - y
        dw = (X.T @ err) / n
        db = float(np.mean(err))
        w -= lr * dw
        b -= lr * db
    return w, b`,
      hint: 'Compute `err = preds - y`, then `dw = (X.T @ err) / n`, `db = float(np.mean(err))`, and subtract `lr * grad`.',
      hints: [
        'Evaluate forward probabilities with `preds = sigmoid(X @ w + b)`.',
        'Compute `err = preds - y`, `dw = (X.T @ err) / n`, and `db = float(np.mean(err))`.',
        'Update parameters in-place with `w -= lr * dw` and `b -= lr * db`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-1-ridge',
      difficulty: 'spec',
      requires: ['matrices', 'data-leakage'],
      title: 'Lab 3.1B: Exact Closed-Form Ridge Solver Without Intercept Penalty',
      prompt:
        'Implement `fit_ridge_closed_form(X: np.ndarray, y: np.ndarray, lam: float) -> tuple[np.ndarray, float]` by augmenting `X` with a leading column of ones `[1, X]`, setting penalty matrix `P = lam * np.eye(d + 1)` with `P[0, 0] = 0.0` (unpenalized intercept!), solving `(X_aug.T @ X_aug + P) theta = X_aug.T @ y`, and returning `(theta[1:], float(theta[0]))`.',
      starterCode: `import numpy as np

def fit_ridge_closed_form(X: np.ndarray, y: np.ndarray, lam: float):
    # Build X_aug with column of ones at index 0, P with P[0, 0] = 0.0,
    # solve with np.linalg.solve, return (w, bias)
    pass`,
      testCode: `import numpy as np
rng = np.random.default_rng(42)
x1 = rng.normal(size=80)
X = np.column_stack([x1, 2.0 * x1 + rng.normal(scale=1e-4, size=80)])
y = 100.0 + 3.0 * x1 + rng.normal(scale=0.1, size=80)
w, b = fit_ridge_closed_form(X, y, lam=5.0)
assert abs(b - 100.0) < 0.5, f"Unpenalized intercept should stay near 100.0, got {b}"
assert np.linalg.norm(w) < 5.0, f"Ridge must prevent giant canceling collinear weights, got {w}"
w0, b0 = fit_ridge_closed_form(np.array([[1.0], [2.0], [3.0]]), np.array([12.0, 14.0, 16.0]), lam=0.0)
assert abs(b0 - 10.0) < 1e-6 and abs(w0[0] - 2.0) < 1e-6
print("PASS: Closed-form Ridge stabilized collinearity without distorting intercept bias!")`,
      solutionCode: `import numpy as np

def fit_ridge_closed_form(X: np.ndarray, y: np.ndarray, lam: float):
    n, d = X.shape
    X_aug = np.column_stack([np.ones(n, dtype=float), X.astype(float)])
    P = lam * np.eye(d + 1, dtype=float)
    P[0, 0] = 0.0
    theta = np.linalg.solve(X_aug.T @ X_aug + P, X_aug.T @ y)
    return theta[1:], float(theta[0])`,
      hint: 'Prepend `np.ones(n)` with `np.column_stack`, build `P = lam * np.eye(d + 1)` with `P[0, 0] = 0.0`, and solve via `np.linalg.solve`.',
      hints: [
        'Use `X_aug = np.column_stack([np.ones(n), X])` so `theta[0]` represents bias `b`.',
        'Set `P = lam * np.eye(d + 1)` and explicitly zero `P[0, 0] = 0.0`.',
        'Solve `theta = np.linalg.solve(X_aug.T @ X_aug + P, X_aug.T @ y)` and return `(theta[1:], float(theta[0]))`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-1-poly-diag',
      difficulty: 'debug',
      requires: ['precision-recall-f1', 'data-leakage'],
      title: 'Lab 3.1C: Fix Overfitted Lambda Selection (Val vs Train MSE Bug)',
      prompt:
        'A buggy selection loop picks the polynomial/regularization setting minimizing **training** MSE, always selecting near-zero `lam` and massively overfitting! Fix `select_best_lambda(X_tr, y_tr, X_val, y_val, lambdas)` so it standardizes inputs strictly using `X_tr`, fits Ridge on `(X_tr_s, y_tr)`, and picks the `lam` minimizing **validation** MSE.',
      starterCode: `import numpy as np
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error

def select_best_lambda(X_tr, y_tr, X_val, y_val, lambdas):
    # BUG 1: scales on combined data or forgets scaling
    # BUG 2: minimizes training MSE instead of validation MSE!
    best_lam, best_score = lambdas[0], float("inf")
    for lam in lambdas:
        m = Ridge(alpha=lam).fit(X_tr, y_tr)
        tr_mse = mean_squared_error(y_tr, m.predict(X_tr))
        if tr_mse < best_score:
            best_score = tr_mse
            best_lam = lam
    return best_lam`,
      testCode: `import numpy as np
rng = np.random.default_rng(42)
X_tr = rng.normal(size=(25, 18))
X_tr[:, 0] *= 1000.0
true_w = np.zeros(18); true_w[0] = 0.005; true_w[1] = 2.0
y_tr = X_tr @ true_w + rng.normal(scale=1.5, size=25)
X_val = rng.normal(size=(80, 18)); X_val[:, 0] *= 1000.0
y_val = X_val @ true_w + rng.normal(scale=1.5, size=80)
best = select_best_lambda(X_tr, y_tr, X_val, y_val, [0.001, 1.0, 20.0, 200.0])
assert best >= 1.0, f"With noisy wide features (25 rows, 18 cols), validation must pick regularized lambda >= 1.0, got {best}"
print("PASS: Standardized validation sweep avoided 0.001 overfit trap and selected lambda =", best)`,
      solutionCode: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error

def select_best_lambda(X_tr, y_tr, X_val, y_val, lambdas):
    best_lam, best_val_mse = lambdas[0], float("inf")
    for lam in lambdas:
        pipe = Pipeline([("scaler", StandardScaler()), ("ridge", Ridge(alpha=lam))])
        pipe.fit(X_tr, y_tr)
        val_mse = float(mean_squared_error(y_val, pipe.predict(X_val)))
        if val_mse < best_val_mse:
            best_val_mse = val_mse
            best_lam = lam
    return best_lam`,
      hint: 'Wrap `StandardScaler()` and `Ridge(alpha=lam)` inside `Pipeline`, fit on `(X_tr, y_tr)`, and evaluate `mean_squared_error(y_val, pipe.predict(X_val))`.',
      hints: [
        'Use `Pipeline([("scaler", StandardScaler()), ("ridge", Ridge(alpha=lam))])` so `X_tr` scaling puts all columns on equal variance.',
        'Fit on `(X_tr, y_tr)` only—never call `.fit()` on `X_val`.',
        'Score `mean_squared_error(y_val, pipe.predict(X_val))` to select `best_lam`.',
      ],
      packages: ['numpy', 'scikit-learn'],
    },
  ],
  quiz: [
    {
      id: 'q3-1-1',
      type: 'multiple-choice',
      question: 'Your classifier achieves `99.4%` training accuracy and `68.0%` validation accuracy. Which diagnosis and corrective action apply?',
      options: [
        'High Bias (underfitting) — add higher-degree polynomial cross features and remove regularization penalties completely across all parameters',
        'High Variance (overfitting) — raise `lambda` or simplify model capacity',
        'Learning rate collapsed to zero — double gradient step sizes until training error drops far below validation error',
        'Data scale mismatch — convert binary validation labels from integer codes into floating-point target categories',
      ],
      correctIndex: 1,
      explanation: 'A massive gap between near-perfect training accuracy (`99.4%`) and poor validation accuracy (`68.0%`) is the hallmark of High Variance (overfitting), solved by regularization, simplification, or more data.',
    },
    {
      id: 'q3-1-2',
      type: 'multiple-choice',
      question: 'You have 500 features where roughly 450 are pure irrelevant noise and want an automatic sparse model zeroing noise weights out. Which penalty fits best?',
      options: [
        'L2 (Ridge) because squaring parameters forces noisy feature columns cleanly to exact `0.0` during optimization',
        'L1 (Lasso) because its diamond penalty zeros out irrelevant weights',
        'No regularization (`lambda = 0`) so Ordinary Least Squares automatically deletes every useless feature column analytically',
        'Unpenalized bias amplification (`b * 100`) to drown out small spurious feature slopes across wide datasets',
      ],
      correctIndex: 1,
      explanation: 'L1 (`sum(|w_j|)`) produces exact sparse zeros for feature selection; L2 shrinks correlated noisy weights close to zero smoothly without exact elimination.',
    },
    {
      id: 'q3-1-3',
      type: 'multiple-choice',
      question: 'Why must continuous features be standardized before fitting L1 or L2 regularized regression?',
      options: [
        'Otherwise unit differences distort slope sizes and make penalties unfair',
        'Because NumPy matrix multiplication throws `ValueError` whenever unscaled floating-point input columns exceed 100',
        'Because regularization automatically treats unscaled negative numbers as zero missing entries inside Ridge solvers',
        'Because scikit-learn decision trees require exact unit variance before evaluating any candidate Gini split threshold',
      ],
      correctIndex: 0,
      explanation: 'Penalties tax `|w_j|` or `w_j^2` directly; changing units from meters to millimeters scales needed `w_j` by `1,000x`, completely distorting which columns get shrunk unless inputs are standardized.',
    },
    {
      id: 'q3-1-4',
      type: 'predict-output',
      question: 'For a single logistic regression example with `z = X @ w + b = 0.0`, true label `y = 1`, and learning rate `lr = 0.2`, what is the updated bias `b_new` after 1 gradient step starting from `b = 0.0`?',
      options: [
        '`-0.50` because Binary Cross-Entropy moves bias parameters downward opposite positive training labels',
        '`0.00` because a zero logit `z = 0.0` produces zero derivative everywhere on the Sigmoid curve',
        '`+0.10` (`p = 0.5`, `db = -0.5`, `b_new = 0 - 0.2*(-0.5)`)',
        '`+0.20` because gradient `db` simplifies directly to `-1.0` regardless of the predicted probability',
      ],
      correctIndex: 2,
      explanation: 'At `z = 0`, `p = 0.5`. Error `p - y = -0.5`, so `b_new = 0.0 - 0.2 * (-0.5) = +0.10`.',
    },
    {
      id: 'q3-1-5',
      type: 'numeric',
      question: 'Given `w = [3.0, -4.0]` and `lam = 2.0`, what is the exact L2 regularization penalty term `lam * sum(w_j^2)` added to MSE loss?',
      options: [],
      correctIndex: 0,
      correctNumber: 50,
      tolerance: 0.01,
      unit: '',
      explanation: '`sum(w_j^2) = 3^2 + (-4)^2 = 9 + 16 = 25`, multiplied by `lam = 2.0` gives `50.0`.',
    },
    {
      id: 'q3-1-6',
      type: 'spot-bug',
      question: 'Why does changing `C = 1.0` to `C = 1000.0` in `sklearn.linear_model.LogisticRegression(C=1000.0)` increase overfitting instead of reducing it?',
      options: [
        '`C` controls maximum L-BFGS training iterations rather than regularization weight penalty strength inside scikit-learn',
        'Setting `C > 1` switches Logistic Regression automatically from L2 shrinkage toward unregularized K-Means centroids',
        '`C = 1 / lambda` is inverse regularization, so larger `C` weakens shrinkage',
        'Larger `C` disables `StandardScaler` mean subtraction inside scikit-learn pipeline transformations silently',
      ],
      correctIndex: 2,
      explanation: 'Unlike `Ridge(alpha=...)`, scikit-learn `LogisticRegression` and `SVC` parameterize inverse penalty `C = 1 / lambda`—smaller `C` means stronger regularization.',
    },
    {
      id: 'q3-1-7',
      type: 'multi-select',
      question: 'Which two statements about the scalar intercept bias `b` in linear models are true?',
      options: [
        'Regularization penalties (`L1` / `L2`) should exclude the intercept `b` so predictions stay unbiased in mean level',
        'Changing `b` shifts the decision threshold surface uniformly without altering relative feature slopes `w`',
        'Penalizing `b` heavily improves calibration when average house prices sit around `\\$500,000`',
        'Setting `b = 0` permanently is required whenever inputs have zero standard deviation',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Excluding `b` from L1/L2 penalties keeps baseline predictions centered cleanly on the target mean while `w` controls slope sensitivity.',
    },
    {
      id: 'q3-1-8',
      type: 'multiple-choice',
      question: 'Both training MSE (`42.0`) and validation MSE (`44.5`) plateau at poor accuracy regardless of extra training rows. What is your diagnosis?',
      options: [
        'Extreme High Variance that disappears immediately once you drop L2 regularization completely down to zero',
        'Perfect generalization ceiling proving no better predictive relationship can exist inside the features',
        'Severe test set contamination inflating validation MSE artificially upward above training error',
        'High Bias (underfitting) — linear class is too simple for non-linear patterns',
      ],
      correctIndex: 3,
      explanation: 'When both training and validation errors remain high together, gathering more data rarely helps; add expressive non-linear features or move to trees/neural nets.',
    },
    {
      id: 'q3-1-9',
      type: 'ordering',
      question: 'Order one complete gradient descent iteration of Binary Logistic Regression:',
      items: [
        'Compute linear logits `z = X @ w + b`',
        'Apply Sigmoid `p = 1 / (1 + exp(-clip(z, -50, 50)))`',
        'Compute residual error `err = p - y`',
        'Compute gradients `dw = (X.T @ err) / n` and `db = mean(err)`',
        'Update parameters `w -= lr * dw` and `b -= lr * db`',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Forward pass (`logits -> sigmoid`), residual error (`p - y`), backward gradient projection, and descending parameter update.',
    },
  ],
};
