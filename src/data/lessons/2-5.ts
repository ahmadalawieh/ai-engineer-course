import type { Lesson } from '@/types/course';

export const lesson2_5: Lesson = {
  id: '2-5',
  moduleId: 'mod-2',
  number: '2.5',
  title: 'Evaluation Metrics, Imbalanced Data, Calibration & Business ROI',
  subtitle: 'Understand why accuracy fails on skewed targets, compare PR-AUC against ROC-AUC, calibrate predicted probabilities, and pick profit-maximizing thresholds.',
  durationMinutes: 75,
  track: 'ds',
  prerequisites: ['2.3', '2.4'],
  requires: ['data-leakage', 'ab-testing', 'bayes-theorem'],
  teaches: [
    'precision-recall-f1',
    'roc-vs-pr-auc',
    'threshold-cost-roi',
    'regression-metrics-calibration',
  ],
  objectives: [
    'Compute Precision, Recall, F1, False Positive Rate, and Precision-Recall AUC from a confusion matrix.',
    'Explain mathematically why PR-AUC exposes false-alarm overload on rare events where ROC-AUC stays deceptively high.',
    'Optimize probability decision thresholds directly against asymmetric False Positive vs False Negative dollar costs.',
    'Diagnose probability miscalibration with Brier Score and contrast RMSE vs MAE sensitivity to extreme regression outliers.',
  ],
  checkWithoutNotes: [
    'Given `1,000,000` legitimate transactions and `100` fraud cases, explain why achieving `0.99` True Negative Rate (`1%` FPR) still yields terrible Precision.',
    'Why does using a naive `0.5` probability threshold lose money when missing a fraudulent charge costs \\$500 (`FN`) while sending a verification SMS costs \\$2 (`FP`)?',
    'Contrast RMSE and MAE on a housing dataset where two luxury outliers sit far above the median home price.',
    'What does a well-calibrated classifier guarantee when it outputs predicted probability `0.30` across 1,000 invoices?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Accuracy Lies on Imbalanced Datasets',
      paragraphs: [
        'In real production problems—credit-card fraud detection, medical triage, server outage prediction, or ad click forecasting—positive events are rare. Imagine auditing 1,000 payment transactions where 995 are legitimate and 5 are fraudulent. A useless model that hardcodes `return False` achieves **99.5% accuracy** while catching **0% of actual fraud**.',
        'Whenever classes are skewed or errors carry unequal business costs, single-number Accuracy hides failure. Instead, inspect the confusion matrix (`TP`, `FP`, `FN`, `TN`) and measure **Precision** ("when my alarm rings, how often is it truly positive?") alongside **Recall** ("of all real positives out there, how many did I catch?").',
        'Equally critical on the job is remembering that models output continuous scores (`0.0` to `1.0`), NOT binary yes/no labels. Picking the decision cutoff threshold (`0.05` vs `0.50` vs `0.85`) is a product economics decision, not a hardcoded constant.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Airport Metal Detectors & Asymmetric Alarm Costs',
      frontendConcept: 'Returning HTTP `200 OK` vs `403 Blocked` from an API abuse filter without measuring how many real customers got locked out',
      aiConcept: 'Precision-Recall Tradeoff, Threshold Tuning, and Cost-Weighted Expected Value',
      explanation:
        'Setting a classifier threshold works just like adjusting airport security scanner sensitivity. Setting sensitivity high catches almost every prohibited item (high Recall), yet triggers extra bag checks on harmless travelers (more False Positives, lower Precision). Turning sensitivity way down stops bothering passengers (high Precision) at the risk of missing real threats (lower Recall). Cost economics tells you exactly where to park the slider.',
    },
    {
      type: 'math',
      title: 'Classification, Regression & Calibration Metrics',
      latex: '\\text{Precision} = \\frac{TP}{TP + FP} \\qquad \\text{Recall} = \\frac{TP}{TP + FN} \\qquad F_1 = \\frac{2 \\cdot P \\cdot R}{P + R} \\qquad t^* \\approx \\frac{C_{FP}}{C_{FP} + C_{FN}}',
      breakdown: [
        { symbol: 'TP, FP, FN', meaning: 'True Positives, False Positives (false alarms), and False Negatives (missed real cases)' },
        { symbol: 'F_1', meaning: 'Harmonic mean of Precision and Recall; collapses if either metric approaches zero' },
        { symbol: 't^*', meaning: 'Bayes-optimal probability threshold minimizing expected dollar loss for FP cost $C_{FP}$ and FN cost $C_{FN}$' },
        { symbol: '\\text{Brier Score}', meaning: '$\\frac{1}{N}\\sum (\\hat{p}_i - y_i)^2$: measures exact probability calibration (lower is better; `0` is perfect)' },
      ],
      intuition:
        'Look at the optimal threshold formula $t^*$: if missing a fraud charge costs $C_{FN} = \\$500$ while an SMS confirmation check costs only $C_{FP} = \\$2$, you should flag transactions whenever $p(\\text{fraud}) \\ge 2 / (2 + 500) \\approx 0.004$ — far below the naive `0.5` textbook default!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Why PR-AUC Beats ROC-AUC on Rare Events',
      paragraphs: [
        'Suppose you evaluate a spam or fraud classifier on **1,000,000 negative rows** and **100 positive rows**. Suppose your model catches `90` of `100` frauds (`Recall / TPR = 0.90`) while firing false alarms on only `1%` of legitimate traffic (`FPR = 0.01`). On a standard ROC curve plotting `TPR` vs `FPR`, `(FPR=0.01, TPR=0.90)` hugs the top-left corner brilliantly—resulting in an impressive ROC-AUC above `0.95`!',
        'Now check Precision: `1%` of `1,000,000` negatives equals **10,000 False Positives** alongside **90 True Positives**! Precision is `90 / (90 + 10,000) = 0.89%`—over ninety-nine out of every hundred alerts are false alarms, overwhelming your human review queue! Because Precision divides `TP` by `(TP + FP)` without diluting `FP` across a million negatives, **Precision-Recall AUC (Average Precision)** exposes this collapse immediately.',
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'roc-threshold',
      title: 'Interactive Lab: Classification Threshold, Confusion Matrix & Cost Optimizer',
      description:
        'Drag the decision threshold between `0.05` and `0.95` and customize False Positive vs False Negative costs to watch Precision, Recall, F1, ROC coordinates, and total net business profit update live.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Computing Cost-Optimal Thresholds & Brier Calibration by Hand',
      paragraphs: [
        'Suppose a retention campaign offers a \\$20 discount (`C_FP = 20` wasted discount if the customer was actually staying) to prevent a \\$200 annual churn loss (`C_FN = 200` lost customer if unaddressed). Under well-calibrated probabilities, intervening yields expected net benefit whenever `p * 200 - 20 > 0`, placing the break-even threshold near `t* = 20 / 200 = 0.10` (or `C_FP / (C_FP + C_FN) = 20 / 220 = 0.091` under symmetric zero-baseline loss tables). Notice why checking net profit on a real validation threshold sweep (`0.05..0.95`) matters: lowering the threshold from `0.50` to `0.10` catches far more high-value churning accounts whose risk sat around `0.15–0.40`.',
        'Crucially, threshold economics assumes **calibrated probabilities**: when your model outputs `0.20` across 1,000 invoices, roughly 200 of them should truly turn positive. Let us verify Brier Score by hand on four validation predictions: `y_true = [0, 1, 0, 1]` and `y_prob = [0.2, 0.8, 0.1, 0.6]`. Compute each squared probability residual: `(0.2 - 0)^2 = 0.04`, `(0.8 - 1)^2 = 0.04`, `(0.1 - 0)^2 = 0.01`, and `(0.6 - 1)^2 = 0.16`. Averaging gives `(0.04 + 0.04 + 0.01 + 0.16) / 4 = 0.25 / 4 = 0.0625`. Compare that against a confident wrong prediction (`y_prob = [0.95, ...]`) which receives `0.9025` penalty!',
        'Tree ensembles (`RandomForest`, gradient-boosted trees without calibration) and Naive Bayes often rank risks well (high ROC-AUC) while pushing or compressing raw probability scores away from true empirical frequencies. Inspecting a reliability diagram (plotting mean predicted probability vs observed positive rate across 10 probability bins) and fitting `CalibratedClassifierCV` (Platt sigmoid scaling for S-shaped distortion, or non-parametric Isotonic regression when calibration datasets hold thousands of rows) restores honest probabilities strictly on held-out calibration folds.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Regression Losses (RMSE vs MAE vs MAPE) Under Outliers',
      paragraphs: [
        'Choose regression metrics according to business tail risk rather than textbook habit. Given residual errors `[2, 2, 2, 100]` (for example predicting support ticket resolution hours when three routine tickets finish within 2 hours of forecast while one outlier hits a vendor outage), **MAE** (`mean(|e|)`) equals `(2 + 2 + 2 + 100) / 4 = 26.5`, weighing every hour of error linearly and driving models to predict the **conditional median**. Meanwhile, **RMSE** (`sqrt(mean(e^2))`) squares that `100` residual into `10,000`: `sqrt((4 + 4 + 4 + 10000) / 4) = sqrt(2503) = 50.03`—nearly double MAE because RMSE optimizes the conditional mean and punishes rare huge misses severely.',
        'Beware **MAPE** (`mean(|y - y_hat| / |y|)`): whenever actual outcomes `y` equal `0` (such as zero daily unit sales on a slow retail SKU), dividing by `|y|` blows up to infinity and crashes reporting dashboards! For sparse demand forecasting containing zero-sales days, use weighted MAPE (`sum(|y - y_hat|) / sum(|y|)`) or quantile pinball loss instead.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example Output: Imbalanced PR-AUC, Profit Sweep & RMSE vs MAE',
      language: 'python',
      code: `import numpy as np
from sklearn.metrics import average_precision_score, roc_auc_score, brier_score_loss

y_true = np.array([0]*95 + [1]*5)
# Weak noisy model: 10 false alarms above threshold + catches 4 positives
y_prob = np.concatenate([np.full(85, 0.05), np.full(10, 0.65), np.array([0.10, 0.70, 0.75, 0.80, 0.90])])
print("ROC-AUC:", round(roc_auc_score(y_true, y_prob), 3))
print("PR-AUC :", round(average_precision_score(y_true, y_prob), 3))
print("Brier  :", round(brier_score_loss(y_true, y_prob), 4))

# Asymmetric regression error example: [2, 2, 2, 100]
errs = np.array([2.0, 2.0, 2.0, 100.0])
print("MAE:", errs.mean(), "RMSE:", round(np.sqrt((errs ** 2).mean()), 2))
# ROC-AUC: 0.884 (looks rosy!)  PR-AUC: 0.562 (reveals FP precision drag!)
# MAE: 26.5  RMSE: 50.03`,
      caption: 'PR-AUC immediately reflects those 10 false positives competing against only 5 true positives, whereas ROC-AUC remains optimistically near 0.88.',
    },
    {
      type: 'prose',
      heading: 'Common Evaluation Mistakes & How to Debug Them',
      paragraphs: [
        '1) Reporting accuracy on imbalanced fraud, churn, or anomaly models: always compute Precision, Recall, F1, and PR-AUC alongside positive base rates.',
        '2) Tuning the decision threshold on `X_test` instead of `X_val`: sweeping 99 thresholds and selecting the maximum score on your final test set leaks test optimization! Always select the optimal cutoff on `X_val` (or out-of-fold validation predictions), then evaluate that frozen threshold once on `X_test`.',
        '3) Applying cost formulas directly to uncalibrated SVM margins or boosted logits: verify Brier Score and reliability curves first, and fit `CalibratedClassifierCV` on a held-out calibration split if predicted probabilities diverge from empirical rates.',
        '4) Using SMOTE synthetic balancing inside validation/test splits: upsampling or SMOTE belongs strictly inside training folds—evaluating on balanced synthetic test sets completely fabricates fake Precision numbers.',
        '5) Using `class_weight="balanced"` blindly and forgetting it distorts predicted probabilities upward: reweighting minority classes helps gradient models focus on rare targets during optimization, yet shifts predicted outputs away from true prior base rates unless you recalibrate probabilities afterward.',
        '6) Choosing F1 when Recall matters far more than Precision (or vice versa): F1 weights Precision and Recall identically via their harmonic mean. When false negatives dominate risk (`F2`) or false positives dominate user churn (`F0.5`), or better yet when exact dollar payoff matrices exist, evaluate `F_beta` or direct expected business profit rather than symmetric F1.',
        '7) Confusing `macro` vs `weighted` vs `micro` averaging on multi-class imbalanced ticket routers: `weighted` F1 hides failure on rare critical categories (such as urgent security alerts) because dominant frequent classes drown them out, whereas `macro` F1 averages every class equally so broken minority classes show up immediately in code review.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 2.5 Recap: Metrics That Match Production Reality',
      body: '- Never trust Accuracy alone on skewed classes; inspect Precision, Recall, F1, and PR-AUC.\n- Prefer PR-AUC over ROC-AUC when negatives vastly outnumber positives and false alarms carry operational cost.\n- Replace arbitrary `0.5` probability cutoffs with cost-weighted thresholds tuned strictly on validation data.\n- Audit probability calibration with Brier Score before plugging probabilities into expected-value formulas.\n- Pick RMSE to punish large errors heavily, MAE for outlier robustness around the median, and avoid raw MAPE near zero.',
    },
    {
      type: 'python-lab',
      labId: 'lab-2-5-pr-auc',
      difficulty: 'guided',
      requires: ['precision-recall-f1', 'numpy-arrays'],
      title: 'Lab 2.5A: Confusion Matrix, Precision, Recall & F1 from Scratch',
      prompt:
        'Implement `binary_metrics(y_true: np.ndarray, y_prob: np.ndarray, threshold: float)` returning a dict `{"accuracy": ..., "precision": ..., "recall": ..., "f1": ...}` computed cleanly from `TP, FP, FN, TN` (returning `0.0` safely when any denominator is `0`).',
      starterCode: `import numpy as np

def binary_metrics(y_true: np.ndarray, y_prob: np.ndarray, threshold: float = 0.5) -> dict:
    preds = (y_prob >= threshold).astype(int)
    # Compute tp, fp, fn, tn, accuracy, precision, recall, f1 (guard zero denominators)
    pass

yt = np.array([1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
yp = np.array([0.9, 0.2, 0.8, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1])
print(binary_metrics(yt, yp, 0.5))`,
      testCode: `import numpy as np
yt = np.array([1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
yp = np.array([0.9, 0.2, 0.8, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1])
m = binary_metrics(yt, yp, 0.5)
assert abs(m["accuracy"] - 0.8) < 1e-6
assert abs(m["precision"] - 0.5) < 1e-6
assert abs(m["recall"] - 0.5) < 1e-6
assert abs(m["f1"] - 0.5) < 1e-6
m_hi = binary_metrics(yt, yp, 0.99)
assert m_hi["precision"] == 0.0 and m_hi["recall"] == 0.0 and m_hi["f1"] == 0.0
print("PASS: Confusion-matrix metrics and zero-denominator guards work accurately!")`,
      solutionCode: `import numpy as np

def binary_metrics(y_true: np.ndarray, y_prob: np.ndarray, threshold: float = 0.5) -> dict:
    preds = (y_prob >= threshold).astype(int)
    y = y_true.astype(int)
    tp = int(np.sum((preds == 1) & (y == 1)))
    fp = int(np.sum((preds == 1) & (y == 0)))
    fn = int(np.sum((preds == 0) & (y == 1)))
    tn = int(np.sum((preds == 0) & (y == 0)))
    acc = (tp + tn) / max(len(y), 1)
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2.0 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
    return {"accuracy": float(acc), "precision": float(prec), "recall": float(rec), "f1": float(f1)}`,
      hint: 'Count boolean overlaps like `np.sum((preds == 1) & (y_true == 1))` and guard `(tp + fp) == 0` and `(prec + rec) == 0`.',
      hints: [
        'Cast `preds = (y_prob >= threshold).astype(int)` and compute `tp`, `fp`, `fn`, `tn`.',
        'Set `prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0` (same guard for `rec` and `f1`).',
        'Return dictionary keys `"accuracy"`, `"precision"`, `"recall"`, `"f1"`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-5-cost-thresh',
      difficulty: 'spec',
      requires: ['data-leakage'],
      title: 'Lab 2.5B: Profit-Optimal Decision Threshold Search',
      prompt:
        'Implement `find_best_threshold(y_val: np.ndarray, prob_val: np.ndarray, fp_cost: float, fn_cost: float)` that sweeps thresholds in `np.linspace(0.05, 0.95, 19)` and returns `(best_threshold, min_total_cost)` minimizing `fp * fp_cost + fn * fn_cost` on validation rows.',
      starterCode: `import numpy as np

def find_best_threshold(y_val: np.ndarray, prob_val: np.ndarray, fp_cost: float, fn_cost: float):
    # Sweep np.linspace(0.05, 0.95, 19) and track (best_thresh, min_cost)
    pass`,
      testCode: `import numpy as np
y_v = np.array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1])
p_v = np.array([0.02, 0.08, 0.12, 0.18, 0.35, 0.45, 0.15, 0.30, 0.60, 0.85])
best_t, min_c = find_best_threshold(y_v, p_v, fp_cost=5.0, fn_cost=100.0)
assert best_t <= 0.15, f"High FN cost ($100 vs $5) should pick low threshold <=0.15, got {best_t}"
assert min_c <= 15.0, f"At t=0.15 total cost should be 3*5=15.0, got {min_c}"
print("PASS: Threshold sweep minimized expected business cost below default 0.5!")`,
      solutionCode: `import numpy as np

def find_best_threshold(y_val: np.ndarray, prob_val: np.ndarray, fp_cost: float, fn_cost: float):
    best_t = 0.5
    min_cost = float("inf")
    for t in np.linspace(0.05, 0.95, 19):
        preds = (prob_val >= t).astype(int)
        fp = int(np.sum((preds == 1) & (y_val == 0)))
        fn = int(np.sum((preds == 0) & (y_val == 1)))
        cost = float(fp * fp_cost + fn * fn_cost)
        if cost < min_cost:
            min_cost = cost
            best_t = float(round(float(t), 4))
    return best_t, min_cost`,
      hint: 'Compute `fp` and `fn` at every candidate threshold in `np.linspace(0.05, 0.95, 19)` and track minimum `fp * fp_cost + fn * fn_cost`.',
      hints: [
        'Initialize `min_cost = float("inf")` and iterate `for t in np.linspace(0.05, 0.95, 19):`.',
        'Compute `preds = (prob_val >= t).astype(int)` and sum `(preds == 1) & (y_val == 0)` for `fp`.',
        'Update `best_t` and `min_cost` strictly when `cost < min_cost`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-5-rmse-mae',
      difficulty: 'debug',
      requires: ['numpy-arrays'],
      title: 'Lab 2.5C: Debug Broken Calibration & Regression Error Helper',
      prompt:
        'The starter function computes `rmse` WITHOUT taking the square root (`mse` instead!) and computes `brier` on thresholded binary `preds` instead of continuous probabilities `y_prob`! Fix `regression_and_brier(y_true_reg, y_pred_reg, y_true_cls, y_prob_cls)` returning `{"mae": ..., "rmse": ..., "brier": ...}`.',
      starterCode: `import numpy as np

def regression_and_brier(y_true_reg, y_pred_reg, y_true_cls, y_prob_cls) -> dict:
    err = np.asarray(y_true_reg, dtype=float) - np.asarray(y_pred_reg, dtype=float)
    mae = float(np.mean(np.abs(err)))
    # BUG 1: forgot sqrt for RMSE!
    rmse = float(np.mean(err ** 2))
    # BUG 2: Brier score must use raw probabilities, NOT hard 0/1 thresholded classes!
    hard_cls = (np.asarray(y_prob_cls) >= 0.5).astype(float)
    brier = float(np.mean((hard_cls - np.asarray(y_true_cls, dtype=float)) ** 2))
    return {"mae": mae, "rmse": rmse, "brier": brier}`,
      testCode: `import numpy as np
res = regression_and_brier(
    np.array([10.0, 20.0, 30.0, 120.0]),
    np.array([8.0, 18.0, 28.0, 20.0]),
    np.array([0, 1, 0, 1]),
    np.array([0.2, 0.8, 0.1, 0.6]),
)
assert abs(res["mae"] - 26.5) < 1e-6
assert abs(res["rmse"] - np.sqrt(2503.0)) < 1e-4, f"Expected sqrt(2503)={np.sqrt(2503.0)}, got {res['rmse']}"
assert abs(res["brier"] - 0.0625) < 1e-6, f"Expected Brier=0.0625, got {res['brier']}"
print("PASS: Fixed RMSE square root and continuous-probability Brier score!")`,
      solutionCode: `import numpy as np

def regression_and_brier(y_true_reg, y_pred_reg, y_true_cls, y_prob_cls) -> dict:
    err = np.asarray(y_true_reg, dtype=float) - np.asarray(y_pred_reg, dtype=float)
    mae = float(np.mean(np.abs(err)))
    rmse = float(np.sqrt(np.mean(err ** 2)))
    probs = np.asarray(y_prob_cls, dtype=float)
    y_c = np.asarray(y_true_cls, dtype=float)
    brier = float(np.mean((probs - y_c) ** 2))
    return {"mae": mae, "rmse": rmse, "brier": brier}`,
      hint: 'Wrap `np.mean(err ** 2)` inside `np.sqrt(...)` and compute Brier directly on `y_prob_cls` without thresholding at `0.5`.',
      hints: [
        'Fix RMSE via `rmse = float(np.sqrt(np.mean(err ** 2)))`.',
        'Remove `(y_prob_cls >= 0.5)` so `probs` retains exact predicted probabilities in `[0, 1]`.',
        'Verify `brier = float(np.mean((probs - y_c) ** 2))` gives `(0.04 + 0.04 + 0.01 + 0.16) / 4 = 0.0625`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q2-5-1',
      type: 'multiple-choice',
      question: 'You are building a severe cancer screening model where missing a sick patient (`FN`) is catastrophic compared to ordering an inexpensive follow-up scan (`FP`). Which objective fits best?',
      options: [
        'Maximize overall Accuracy at the default `0.5` cutoff regardless of minority prevalence',
        'Maximize Recall (Sensitivity) while keeping Precision above your clinical follow-up capacity floor',
        'Maximize Specificity by pushing the cutoff up toward `0.95` so false alarms approach zero',
        'Minimize Mean Absolute Error across predicted hospital billing amounts',
      ],
      correctIndex: 1,
      explanation: 'High Recall minimizes missed diagnoses (`FN`), and enforcing an acceptable Precision floor prevents flooding clinic capacity with endless false positives.',
    },
    {
      id: 'q2-5-2',
      type: 'multiple-choice',
      question: 'With 1,000,000 negative rows and 100 positive rows, why can a classifier reach 0.96 ROC-AUC yet remain unusable in production?',
      options: [
        'Because even a 1% False Positive Rate creates 10,000 false alarms competing against at most 100 positives (~1% Precision)',
        'Because ROC-AUC requires exactly balanced 50/50 classes or scikit-learn returns `NaN`',
        'Because an ROC-AUC score of `0.96` performs worse than random coin-flipping on binary labels',
        'Because ROC-AUC evaluates False Negatives solely and ignores True Positives completely',
      ],
      correctIndex: 0,
      explanation: '`FPR = FP / (FP + TN)` stays tiny when `TN = 1,000,000`, hiding 10,000 false alarms that immediately crush Precision and expose themselves under PR-AUC.',
    },
    {
      id: 'q2-5-3',
      type: 'multiple-choice',
      question: 'When predicting neighborhood home prices containing a handful of extreme \\$50M estates, which regression metric is least distorted by those rare outliers?',
      options: [
        'RMSE because taking the square root cancels out squared residual growth cleanly',
        'MSE because summing squared errors weights small typical homes equally against mansions',
        'MAE (L1 Loss) because linear absolute errors prevent single extreme residuals from dominating gradients',
        'Raw R-squared because variance normalization discards points above three standard deviations',
      ],
      correctIndex: 2,
      explanation: 'MSE and RMSE square errors (`50M^2`), allowing rare extreme residuals to dominate the loss, whereas MAE scales linearly and targets the conditional median.',
    },
    {
      id: 'q2-5-4',
      type: 'numeric',
      question: 'A model detects `TP = 40`, fires `FP = 10` false alarms, and misses `FN = 10` positives. What is its `F1` score?',
      options: [],
      correctIndex: 0,
      correctNumber: 0.8,
      tolerance: 0.01,
      unit: '',
      explanation: 'Precision `= 40 / (40 + 10) = 0.80` and Recall `= 40 / (40 + 10) = 0.80`, so `F1 = 2 * 0.8 * 0.8 / (0.8 + 0.8) = 0.80`.',
    },
    {
      id: 'q2-5-5',
      type: 'predict-output',
      question: 'For regression residual vector `err = [0.0, 0.0, 0.0, 8.0]`, what are exact `(MAE, RMSE)` values?',
      options: [
        '`(2.0, 2.0)` because dividing total error evenly across 4 items produces identical scales',
        '`(2.0, 4.0)` because `MAE = 8 / 4 = 2.0` while `RMSE = sqrt(64 / 4) = 4.0`',
        '`(4.0, 8.0)` because summing squared residuals yields `16` before taking `sqrt`',
        '`(8.0, 64.0)` because maximum error always dictates both summary statistics',
      ],
      correctIndex: 1,
      explanation: '`MAE = (0+0+0+8)/4 = 2.0`; `RMSE = sqrt((0+0+0+64)/4) = sqrt(16) = 4.0`, cleanly illustrating how RMSE weighs single large spikes higher.',
    },
    {
      id: 'q2-5-6',
      type: 'spot-bug',
      question: 'What is wrong with this production evaluation snippet?',
      code: `best_t = max(
    np.linspace(0.05, 0.95, 91),
    key=lambda t: f1_score(y_test, probs_test >= t)
)
print("Final Test F1:", f1_score(y_test, probs_test >= best_t))`,
      options: [
        '`f1_score` only accepts continuous floating-point scores rather than boolean predictions',
        'Sweeping 91 thresholds inside `np.linspace` throws `MemoryError` on standard arrays',
        'Optimizing `best_t` directly on `y_test` leaks test labels into threshold selection instead of tuning on `y_val`',
        '`probs_test >= t` reverses Positive and Negative predictions inside scikit-learn',
      ],
      correctIndex: 2,
      explanation: 'Hyperparameters including the decision threshold must be selected on `y_val` (or cross-validation OOF predictions), then measured once on untouched `y_test`.',
    },
    {
      id: 'q2-5-7',
      type: 'multi-select',
      question: 'Which two checks verify whether a classifier’s raw probability scores can safely drive dollar-cost thresholds?',
      options: [
        'Evaluating Brier Score (`mean((p - y)^2)`) on held-out calibration or validation rows',
        'Inspecting a reliability curve (`calibration_curve`) comparing predicted bin probabilities against observed positive rates',
        'Resampling `X_test` with SMOTE to force an exact 50/50 positive rate prior to inference',
        'Dropping probabilities completely and replacing them with raw unscaled decision tree leaf counts',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Brier Score and reliability diagrams measure whether predicted probabilities match true empirical frequencies; synthetic test resampling distorts calibration artificially.',
    },
    {
      id: 'q2-5-8',
      type: 'multiple-choice',
      question: 'Why does raw MAPE (`mean(|y - y_hat| / |y|)`) fail frequently on retail SKU daily unit demand?',
      options: [
        'Because MAPE only works on negative integer target values inside time-series models',
        'Because `0` unit demand days sit in the denominator, causing division-by-zero explosion',
        'Because MAPE squares errors exponentially whenever daily sales exceed 10 units',
        'Because MAPE strictly forces predicted forecasts to match positive logistic probabilities',
      ],
      correctIndex: 1,
      explanation: 'Whenever actual sales `y = 0`, `|y - y_hat| / |y|` is undefined (`inf`), making weighted MAPE (`sum(|err|) / sum(|y|)`) or MAE far safer.',
    },
    {
      id: 'q2-5-9',
      type: 'ordering',
      question: 'Order the proper workflow for tuning and validating an imbalanced fraud classifier:',
      items: [
        'Train candidate models strictly on chronological training folds using leak-free pipelines',
        'Inspect PR-AUC and Brier Score on held-out validation rows (never Accuracy alone)',
        'Calibrate predicted probabilities on a held-out split if reliability curves drift',
        'Sweep decision thresholds on validation data against real FP and FN business costs',
        'Lock model, calibrator, and threshold and report final metrics once on untouched test data',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Always train cleanly, inspect PR-AUC/calibration, fit calibration if needed, optimize thresholds on validation for cost ROI, and measure once on final test data.',
    },
  ],
};
