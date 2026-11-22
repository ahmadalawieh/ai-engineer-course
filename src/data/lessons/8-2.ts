import type { Lesson } from '@/types/course';

export const lesson8_2: Lesson = {
  id: '8-2',
  moduleId: 'mod-8',
  number: '9.2',
  title: 'ML Theory & Data Science Case Studies: Churn, Uplift & A/B Tests',
  subtitle: 'Connect bias-variance theory, imbalanced evaluation metrics, uplift treatment targeting, and online A/B experimentation to nail ML and Product DS interviews.',
  durationMinutes: 80,
  track: 'ds',
  prerequisites: ['2.4', '3.2', '3.4'],
  requires: ['data-leakage', 'temporal-splits', 'gbdt-boosting', 'cross-validation-schemes'],
  teaches: [
    'interview-ml-theory',
    'uplift-ab-case-study',
  ],
  objectives: [
    'Answer foundational ML theory questions cleanly: bias vs variance, L1 vs L2 regularization, bagging vs gradient boosting, and calibration.',
    'Solve open-ended Product Data Science diagnosis cases ("DAU dropped 12% overnight—walk through your first 15 minutes").',
    'Differentiate raw churn probability from incremental **treatment uplift** so retention budgets target persuadable users.',
    'Design leak-free offline CV + randomized online A/B rollouts (and DiD/propensity fallbacks) proving true business ROI.',
  ],
  checkWithoutNotes: [
    'Explain why sending retention coupons strictly to the **top 10% highest churn-risk** users can lose money compared to targeting persuadable middle-risk users.',
    'Contrast how **Random Forest (bagging)** reduces variance vs how **XGBoost/LightGBM (boosting)** reduces bias.',
    'When a binary classification dataset has `2%` positives, why is `98%` test accuracy completely useless, and which metrics should replace it?',
    'List the exact first steps when a stakeholder asks why a key product metric suddenly fell `12%` yesterday.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Interviewers Pair Classic ML Theory With Messy Product Cases',
      paragraphs: [
        'Anyone can memorize `model.fit(X_train, y_train)` from a library cheat sheet. In real ML Engineer and Product Data Science interviews, hiring managers probe whether you actually understand **why** algorithms succeed or blow up in production—and whether your model decisions make the business money rather than merely polishing offline AUC in a notebook.',
        'That interview typically blends two styles cleanly. First, rapid-fire **ML Theory checks**: *"Why does L1 create sparse weights while L2 shrinks evenly?"*, *"How do bagging and gradient boosting handle bias vs variance differently?"*, or *"Why did your 99%-accurate fraud detector miss every fraudulent transaction?"* Second, a 30-minute **Product Case Study**: *"Subscription churn jumped 15%—diagnose what happened and design an ML intervention that proves ROI."* Mastering both makes you versatile across AI, ML, and Data teams.',
        'Notice that interviewers rarely judge whether you pick Random Forest over LightGBM blindly; they listen carefully for **diagnostic discipline**—checking telemetry before modeling, preventing temporal/entity leakage, choosing metrics matched to asymmetric costs, and proving causal profit online.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Telemetry First + Controlled Experimentation',
      frontendConcept: 'Verifying Sentry error tracking first after a conversion drop, then running an A/B feature flag checking net checkout lift',
      aiConcept: 'Telemetry Segmentation -> Leak-Free Modeling -> Incremental Uplift -> Online A/B Proof',
      explanation:
        'Just as a frontend engineer investigates broken conversion rates by checking analytics tracking bugs before redesigning checkout pages, a strong Data Scientist ALWAYS verifies logging integrity and slices traffic by platform/region/version BEFORE fitting XGBoost—then verifies real product impact with a randomized experiment.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Rapid-Fire ML Theory Deep Dive (Bias-Variance, L1/L2, Bagging vs Boosting)',
      paragraphs: [
        'Trace the exact mathematical intuition interviewers want when asking **Bias vs Variance**. **High bias (underfitting)** occurs when a model is too rigid (e.g., linear regression on curved seasonal demand), missing real patterns in BOTH train and validation splits. **High variance (overfitting)** occurs when a deep unpruned tree memorizes training noise, posting `99%` train accuracy while collapsing to `65%` on unseen validation records.',
        '**Regularization (`L1` vs `L2`)** controls variance by penalizing large weights inside the loss function. **L2 (Ridge)** adds $\\lambda \\sum w_j^2$, shrinking correlated feature weights smoothly toward zero without eliminating them completely (`grad = 2*w` slows near zero). **L1 (Lasso)** adds $\\lambda \\sum |w_j|$, applying constant magnitude push `+-lambda` right all the way to **exact zero**—performing automatic feature selection at the cost of arbitrarily dropping one feature among correlated pairs.',
        '**Bagging vs Boosting** separates tree ensembles cleanly. **Random Forest (Bagging)** trains hundreds of deep low-bias trees independently in parallel on bootstrap row/column subsets and averages votes—slashing **variance** without lowering bias. **Gradient Boosting (XGBoost / LightGBM)** trains shallow weak trees sequentially (`depth 3–6`), each fitting the negative gradient residuals of earlier errors—progressively crushing **bias** while guarding variance via shrinkage learning rate, subsampling, and early stopping.',
      ],
    },
    {
      type: 'table',
      title: 'ML Theory Interview Tradeoff Matrix',
      headers: ['Comparison', 'Mechanism A', 'Mechanism B', 'Interview Key Insight'],
      rows: [
        ['`L1` vs `L2` Penalty', '`L1` pushes noisy weights to exact `0`', '`L2` shrinks correlated weights smoothly', 'Use `L1` for sparse feature pruning; `L2` when keeping correlated signals'],
        ['`ROC-AUC` vs `PR-AUC`', '`ROC` tracks TPR vs FPR across all negatives', '`PR` tracks Precision vs Recall on positives', 'Under `1–5%` positive imbalance, `PR-AUC` catches false-alarm blowups hidden by `ROC`'],
        ['Bagging vs Boosting', 'Parallel independent deep trees (Random Forest)', 'Sequential shallow residual learners (LightGBM)', 'Bagging cuts variance cleanly; boosting wins tabular accuracy when tuned against overfit'],
        ['Correlation vs Causation', 'Observational `P(Y|X)` risk prediction', 'Incremental treatment lift `P(Y|do(T=1)) - P(Y|do(T=0))`', 'Raw churn risk finds likely churners—NOT who a coupon will actually persuade'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: End-to-End Case Study — Subscription Churn & Uplift Targeting',
      paragraphs: [
        'Walk cleanly through the classic SaaS churn case: *"Monthly churn jumped 15%—what do you do?"* **Step 1 — Diagnose Instrumentation & Segments First:** never start by training a model! Verify data pipelines aren’t double-counting cancellations or missing mobile login heartbeats. Then write SQL slicing churn by `platform` (`iOS` vs `Android` vs `Web`), `app_version`, `country`, `acquisition_channel`, and `tenure_days`. Often one SQL slice spots a broken v4.2 Android billing release worth ten times more than any classifier!',
        '**Step 2 — Leak-Free Target Window & Baseline:** once ready to predict individual churn 30 days ahead, cut strictly by calendar timestamp (`observation_window = days -60..-1`, `target_window = days 0..+30`) and group splits by `user_id` so one account never spans train and test. Always benchmark a 10-line Logistic Regression + RFM heuristic baseline before deploying GBDT + SHAP.',
        '**Step 3 — Actionable Uplift Economics (Stop Discounting "Sure Things"!)**: suppose customer Sara has `1%` churn risk (`sure thing`: stays anyway—giving her a `$20` coupon burns pure margin), customer Omar has `92%` risk (`lost cause`: already migrated to a rival—coupon changes nothing), while customer Maya sits in the middle (`60%` baseline stay probability -> `85%` stay with a `$10` offer, **`+25%` uplift**). If Maya’s retained LTV equals `$120`, expected net profit is `0.25 * $120 - $10 = +$20`! Always rank interventions by expected net treatment profit rather than raw churn risk.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Proving Causal ROI Online (A/B Tests & Quasi-Experiments)',
      paragraphs: [
        'An offline ROC-AUC of `0.86` proves ranking correlation, NOT business profit. To prove causal ROI before shipping company-wide, design a **randomized controlled A/B experiment**: randomly split eligible accounts `50/50` into **Control** (status-quo heuristic or no coupon) vs **Treatment** (receiving offers strictly when your uplift/profit rule exceeds zero), stratified by plan tier so traffic balances cleanly.',
        'Calculate statistical significance properly using a two-proportion `z`-test (checking both **primary metric** net retained revenue minus incentive cost AND **guardrail metrics** like customer support tickets or email unsubscribe rate!). Watch for **peeking bias**: checking p-values every morning and stopping early the moment `p < 0.05` inflates false positives above `25%`! Commit upfront to sample size via power analysis (`alpha=0.05`, `power=0.80`, target MDE) and analyze at the planned horizon.',
        'What if randomization is impossible (say evaluating a mandatory legal policy change or past enterprise outage)? Name the three standard **quasi-experimental** methods cleanly: **Difference-in-Differences (DiD)** comparing treated vs matched-trend control groups before and after the change; **Propensity Score Matching** pairing similar users on pre-treatment features; and **Regression Discontinuity (RDD)** examining users right above vs below a strict cutoff score. Always explicitly state the parallel-trends assumption when proposing DiD.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common ML Theory & DS Case Mistakes & How to Debug Them',
      paragraphs: [
        '1) Reporting raw `accuracy = 0.985` on a `1.5%` positive fraud or churn dataset: predicting "all zero" already scores `98.5%`! Always switch evaluation to Precision, Recall, F1, PR-AUC, and profit curves matched to real false-positive vs missed-positive dollar costs.',
        '2) Targeting the highest churn-probability decile blindly with expensive discounts: many top-decile users already closed their usage weeks ago ("lost causes"), wasting retention budget while missing persuadable mid-tier customers.',
        '3) Jumping straight into LightGBM hyperparameter grids before checking telemetry integrity or segmented SQL funnels: half of sudden KPI drops stem from broken logging events or bad mobile releases, not changing user behavior.',
        '4) Ignoring class-imbalance calibration (`predict_proba` shift): downsampling negatives during training inflates predicted probabilities monotonically—so applying a naive `0.50` business cutoff or expected-value formula without probability calibration (`CalibratedClassifierCV` or prior odds correction) over-fires interventions.',
        '5) Stopping an online A/B test on Day 2 because `p = 0.04` popped up during morning peeking: early novelty effects and weekday/weekend cycles skew premature reads. Always complete pre-registered minimum duration covering full weekly cycles before calling winners.',
        '6) Confusing correlation features with causal levers ("users who contact support churn 4x more -> hide the support button!"): contacting support is a *symptom* of friction, not the cause—always validate causal hypotheses safely with domain owners before acting.',
        '7) Skipping baseline simplicity comparisons during case interviews: jumping straight to complex deep ensembles without stating what a three-line SQL rule or logistic regression baseline already scores wastes engineering weeks and raises interviewer suspicion about rigor. Always quantify incremental lift over a clean heuristic baseline AND link model cutoff thresholds directly back to dollar margin and operational ticket capacity.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 9.2 Recap: ML Theory & Product ROI',
      body: '- Explain `L1` (sparse exact zeros) vs `L2` (smooth shrinkage) and Bagging (variance cut) vs Boosting (bias cut) crisply.\n- On sudden KPI drops: verify telemetry integrity first, then slice SQL funnels across segments before training any ML models.\n- Under heavy imbalance, replace Accuracy with Precision/Recall/F1, PR-AUC, and calibrated profit thresholds.\n- Target retention interventions by **incremental uplift ROI** (`uplift * LTV - cost`), never raw churn risk alone.\n- Prove business impact online using power-sized A/B tests with guardrail metrics (or Difference-in-Differences and Regression Discontinuity when unrandomizable).',
    },
    {
      type: 'python-lab',
      labId: 'lab-8-2-uplift',
      difficulty: 'guided',
      requires: ['data-leakage', 'gbdt-boosting'],
      title: 'Lab 9.2A: Profit-Positive Incremental Uplift Targeting Engine',
      prompt:
        'Implement `select_profitable_targets(users: list[dict], offer_cost: float) -> list[str]`: each dict contains `"id"`, `"p_stay_control"`, `"p_stay_treated"`, and `"ltv"`. Compute `uplift = p_stay_treated - p_stay_control` and `expected_net_profit = (uplift * ltv) - offer_cost`. Keep ONLY users with `expected_net_profit > 0`, and return their `"id"`s sorted by descending `expected_net_profit` (tie-break ascending `"id"`).',
      starterCode: `def select_profitable_targets(users: list[dict], offer_cost: float) -> list[str]:
    # Compute uplift = p_stay_treated - p_stay_control, expected net profit = uplift * ltv - offer_cost
    # Keep > 0 profit and sort descending by profit
    pass`,
      testCode: `sample_users = [
    {"id": "sure_thing", "p_stay_control": 0.96, "p_stay_treated": 0.97, "ltv": 200.0},   # +0.01 * 200 - 10 = -8.0 (SKIP!)
    {"id": "lost_cause", "p_stay_control": 0.05, "p_stay_treated": 0.08, "ltv": 200.0},   # +0.03 * 200 - 10 = -4.0 (SKIP!)
    {"id": "persuadable_a", "p_stay_control": 0.50, "p_stay_treated": 0.80, "ltv": 150.0}, # +0.30 * 150 - 10 = +35.0
    {"id": "persuadable_b", "p_stay_control": 0.40, "p_stay_treated": 0.65, "ltv": 200.0}, # +0.25 * 200 - 10 = +40.0
]
res = select_profitable_targets(sample_users, offer_cost=10.0)
assert res == ["persuadable_b", "persuadable_a"], f"Expected ['persuadable_b', 'persuadable_a'], got {res}"
print("PASS: Uplift targeting skipped sure-things/lost-causes and ranked positive ROI targets!")`,
      solutionCode: `def select_profitable_targets(users: list[dict], offer_cost: float) -> list[str]:
    scored = []
    for u in users:
        uplift = float(u["p_stay_treated"]) - float(u["p_stay_control"])
        net_profit = (uplift * float(u["ltv"])) - float(offer_cost)
        if net_profit > 0.0:
            scored.append((net_profit, u["id"]))
    scored.sort(key=lambda item: (-item[0], item[1]))
    return [uid for _, uid in scored]`,
      hint: 'Compute `net_profit = (p_stay_treated - p_stay_control) * ltv - offer_cost`, filter `net_profit > 0`, and sort by `(-net_profit, uid)`.',
      hints: [
        'Avoid sorting by raw churn risk (`1 - p_stay_control`)—compute incremental `uplift` first.',
        'Only users whose `(uplift * ltv) - offer_cost > 0` earn net retention margin.',
        'Sort surviving `(net_profit, id)` pairs by `(-net_profit, id)`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-2-ab',
      difficulty: 'spec',
      requires: ['uplift-ab-case-study'],
      title: 'Lab 9.2B: Two-Proportion A/B Experiment Z-Test Evaluator',
      prompt:
        'Implement `evaluate_ab_test(conv_ctrl: int, n_ctrl: int, conv_trt: int, n_trt: int) -> tuple[float, float, bool]`: compute conversion rates `p_c = conv_ctrl / n_ctrl`, `p_t = conv_trt / n_trt`, `abs_lift = p_t - p_c`, pooled proportion `p_pool = (conv_ctrl + conv_trt) / (n_ctrl + n_trt)`, standard error `se = math.sqrt(p_pool * (1 - p_pool) * (1/n_ctrl + 1/n_trt))`, `z_score = abs_lift / se` (`0.0` if `se == 0`), and `is_significant = abs(z_score) >= 1.96` (`95%` two-sided confidence). Return `(round(abs_lift, 6), round(z_score, 4), is_significant)`.',
      starterCode: `import math

def evaluate_ab_test(conv_ctrl: int, n_ctrl: int, conv_trt: int, n_trt: int) -> tuple[float, float, bool]:
    # Compute p_c, p_t, pooled SE, z-score, and two-sided |z| >= 1.96 check
    pass`,
      testCode: `lift, z, sig = evaluate_ab_test(500, 10000, 580, 10000)  # 5.0% vs 5.8%
assert abs(lift - 0.008) < 1e-6
assert z > 2.4 and sig is True
lift2, z2, sig2 = evaluate_ab_test(50, 1000, 54, 1000)
assert sig2 is False and abs(z2) < 1.96
lift3, z3, sig3 = evaluate_ab_test(0, 100, 0, 100)
assert z3 == 0.0 and sig3 is False
print("PASS: A/B two-proportion z-test correctly distinguished powered lift from underpowered noise!")`,
      solutionCode: `import math

def evaluate_ab_test(conv_ctrl: int, n_ctrl: int, conv_trt: int, n_trt: int) -> tuple[float, float, bool]:
    p_c = conv_ctrl / n_ctrl
    p_t = conv_trt / n_trt
    abs_lift = p_t - p_c
    p_pool = (conv_ctrl + conv_trt) / (n_ctrl + n_trt)
    se = math.sqrt(p_pool * (1.0 - p_pool) * (1.0 / n_ctrl + 1.0 / n_trt))
    z_score = abs_lift / se if se > 0 else 0.0
    is_sig = abs(z_score) >= 1.96
    return round(abs_lift, 6), round(z_score, 4), is_sig`,
      hint: 'Use pooled conversion `p_pool = (conv_ctrl + conv_trt) / (n_ctrl + n_trt)` inside `se = math.sqrt(p_pool * (1 - p_pool) * (1/n_ctrl + 1/n_trt))`.',
      hints: [
        'Guard `if se == 0:` returning `z_score = 0.0` cleanly when conversions are all 0 or all 1.',
        'Check two-sided significance at 95% confidence via `abs(z_score) >= 1.96`.',
        'Return `(round(abs_lift, 6), round(z_score, 4), is_sig)`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-2-metrics',
      difficulty: 'debug',
      requires: ['interview-ml-theory'],
      title: 'Lab 9.2C: Fix Broken Accuracy-Only Imbalanced Metric Evaluator',
      prompt:
        'A buggy model evaluator returns only overall `accuracy`—reporting `0.95` on a dataset with 5% positives when the model predicts zero positives (`recall = 0.0`)! Fix `eval_binary_metrics(y_true: list[int], y_prob: list[float], threshold: float = 0.5) -> dict` so it computes `precision`, `recall`, and `f1` (each `0.0` cleanly when denominators are zero) alongside `accuracy`, rounded to 4 decimals.',
      starterCode: `def eval_binary_metrics(y_true: list[int], y_prob: list[float], threshold: float = 0.5) -> dict:
    # BUG: only computes accuracy and ignores Precision/Recall/F1 completely!
    preds = [1 if p >= threshold else 0 for p in y_prob]
    acc = sum(1 for yt, yp in zip(y_true, preds) if yt == yp) / len(y_true)
    return {"accuracy": round(acc, 4)}`,
      testCode: `yt = [0]*18 + [1, 1]
yp = [0.1]*18 + [0.2, 0.3]  # predicts ALL zero -> 90% accuracy, 0% recall!
m = eval_binary_metrics(yt, yp, threshold=0.5)
assert m["accuracy"] == 0.9 and m["precision"] == 0.0 and m["recall"] == 0.0 and m["f1"] == 0.0
yt2 = [1, 1, 0, 0]
yp2 = [0.9, 0.3, 0.8, 0.1]  # TP=1, FP=1, FN=1 -> prec=0.5, rec=0.5, f1=0.5
m2 = eval_binary_metrics(yt2, yp2, threshold=0.5)
assert m2["precision"] == 0.5 and m2["recall"] == 0.5 and m2["f1"] == 0.5
print("PASS: Imbalanced binary metric evaluator exposed zero-recall failure cleanly!")`,
      solutionCode: `def eval_binary_metrics(y_true: list[int], y_prob: list[float], threshold: float = 0.5) -> dict:
    preds = [1 if p >= threshold else 0 for p in y_prob]
    tp = sum(1 for yt, yp in zip(y_true, preds) if yt == 1 and yp == 1)
    fp = sum(1 for yt, yp in zip(y_true, preds) if yt == 0 and yp == 1)
    fn = sum(1 for yt, yp in zip(y_true, preds) if yt == 1 and yp == 0)
    tn = sum(1 for yt, yp in zip(y_true, preds) if yt == 0 and yp == 0)
    acc = (tp + tn) / len(y_true) if y_true else 0.0
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0
    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
    }`,
      hint: 'Count `tp`, `fp`, `fn`, `tn` directly from `zip(y_true, preds)` and safely guard `tp + fp == 0`, `tp + fn == 0`, and `prec + rec == 0`.',
      hints: [
        'Compute `tp`, `fp`, `fn`, `tn` explicitly after thresholding `p >= threshold`.',
        '`precision = tp / (tp + fp)` if `tp + fp > 0` else `0.0`; same guard for `recall` and `f1`.',
        'Round every metric key to 4 decimal places.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q8-2-1',
      type: 'multiple-choice',
      question: 'A stakeholder asks you to investigate why DAU dropped 12% yesterday. What is your FIRST analytical step?',
      options: [
        'Immediately launch a four-week A/B price experiment on homepage banners',
        'Verify telemetry logging integrity first, then slice the drop by platform, app version, and region',
        'Retrain your churn XGBoost classifier with 500 additional boosted trees overnight',
        'Fine-tune an open-weights LLM on customer support transcripts to summarize theories',
      ],
      correctIndex: 1,
      explanation: 'Always rule out broken analytics events first, then segment along key dimensions to isolate bad client deploys or regional outages before modeling.',
    },
    {
      id: 'q8-2-2',
      type: 'multiple-choice',
      question: 'Why can sending retention discounts solely to the **top 10% highest churn-risk** users generate LOWER ROI than targeting medium-risk users?',
      options: [
        'Top-risk users are often lost causes who leave anyway, whereas persuadable mid-risk users respond to nudges',
        'Discounts mathematically reverse logistic regression log-odds on high-tenure subscribers',
        'Gradient boosting algorithms forbid outputting probabilities above 0.85 accurately',
        'Higher ROC-AUC thresholds automatically double customer acquisition costs across paid channels',
      ],
      correctIndex: 0,
      explanation: 'Targeting by raw risk confuses baseline churn probability with incremental treatment uplift (`P(stay|offer) - P(stay|no_offer)`).',
    },
    {
      id: 'q8-2-3',
      type: 'multiple-choice',
      question: 'How does **L1 (Lasso)** regularization differ mathematically from **L2 (Ridge)** regularization?',
      options: [
        'L1 strictly doubles tree depth inside XGBoost while L2 halving removes leaves',
        'L2 performs hard exact zeroing of noisy weights whereas L1 keeps correlated pairs equal',
        'L1 drives weak weights to exact zero (sparsity), while L2 shrinks weights smoothly without zeroing',
        'L1 increases variance intentionally so neural networks converge without learning rate decay',
      ],
      correctIndex: 2,
      explanation: 'Because `|w|` has constant nonzero subgradient toward 0 regardless of how small `w` gets, L1 zeros out irrelevant coefficients cleanly.',
    },
    {
      id: 'q8-2-4',
      type: 'multiple-choice',
      question: 'Compare **Random Forest** vs **Gradient Boosted Trees (LightGBM/XGBoost)** through the bias-variance lens:',
      options: [
        'Random Forest trains one single tree sequentially while LightGBM averages uncorrelated deep trees',
        'Both methods enforce linear boundaries and increase bias whenever training depth exceeds 2',
        'Gradient boosting lowers variance purely by sampling random features with zero residual updates',
        'Random Forest cuts variance via parallel independent trees; boosting cuts bias by iteratively fitting residuals',
      ],
      correctIndex: 3,
      explanation: 'Bagging averages independent deep trees to reduce variance; boosting sequentially fits errors of weak learners to drive down bias.',
    },
    {
      id: 'q8-2-5',
      type: 'numeric',
      question: 'A churn offer costs `$15`. For a customer segment with `$200` LTV and `+0.10` (`10%`) retention uplift, what is the expected net profit in dollars?',
      options: [],
      correctIndex: 0,
      correctNumber: 5,
      tolerance: 0.01,
      unit: 'USD',
      explanation: '$(0.10 \\times 200) - 15 = 20 - 15 = \\$5$ expected net gain per targeted user.',
    },
    {
      id: 'q8-2-6',
      type: 'spot-bug',
      question: 'Why does checking your online A/B test every morning and shipping immediately when `p = 0.04` appears on Day 2 break statistical guarantees?',
      options: [
        'Repeatedly peeking inflates false-positive Type-I errors far above the stated `5%` alpha',
        'Two-proportion z-tests become undefined unless sample sizes match exact powers of two',
        'P-values always decrease monotonically toward zero regardless of true conversion differences',
        'Random assignment swaps control and treatment groups automatically after midnight UTC',
      ],
      correctIndex: 0,
      explanation: 'Unadjusted daily peeking turns multiple looks into inflated false discovery rates (>25% Type-I error). Commit upfront to sample size/horizon or use sequential testing.',
    },
    {
      id: 'q8-2-7',
      type: 'multi-select',
      question: 'Select the TWO valid **quasi-experimental** methods used in Data Science when true random A/B assignment is impossible.',
      options: [
        '**Difference-in-Differences (DiD)** comparing treated vs matched-trend control before and after',
        '**Regression Discontinuity Design (RDD)** exploiting strict cutoff eligibility thresholds',
        'Fitting a deeper XGBoost model on unsplit historical logs until training ROC-AUC reaches `1.00`',
        'Removing the control group completely and reporting week-over-week raw averages',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'DiD, RDD, and Propensity Matching estimate causal effects when randomization cannot be run; deeper overfitting and control-less comparisons fail causality.',
    },
    {
      id: 'q8-2-8',
      type: 'ordering',
      question: 'Order the four steps of a clean **Churn ML Product Case Study** from FIRST to LAST.',
      items: [
        'Verify telemetry integrity and slice historical churn via SQL by segment/version',
        'Construct leak-free temporal train/test windows grouped strictly by `user_id`',
        'Benchmark logistic/RFM baseline -> GBDT model ranked by net **uplift ROI**',
        'Validate net LTV minus incentive cost in a randomized online **A/B rollout**',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Always diagnose with SQL first, prevent temporal/entity leakage, build baseline-to-uplift modeling, and prove causal profit online.',
    },
    {
      id: 'q8-2-9',
      type: 'predict-output',
      question: 'On a `1%` fraud dataset, Model A flags ZERO transactions as fraud (`all 0s`). What are its Accuracy and Recall?',
      options: [
        '`Accuracy = 0.01`, `Recall = 0.99`',
        '`Accuracy = 0.99`, `Recall = 0.00`',
        '`Accuracy = 0.50`, `Recall = 0.50`',
        '`Accuracy = 1.00`, `Recall = 1.00`',
      ],
      correctIndex: 1,
      explanation: 'Predicting zero catches 99% of rows (the negatives) for `0.99` accuracy while catching `0/1 = 0.00` true fraud cases.',
    },
  ],
};
