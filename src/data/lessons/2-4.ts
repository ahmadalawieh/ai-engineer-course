import type { Lesson } from '@/types/course';

export const lesson2_4: Lesson = {
  id: '2-4',
  moduleId: 'mod-2',
  number: '2.4',
  title: 'Feature Engineering, Time-Aware Splits & Preventing Data Leakage',
  subtitle: 'Catch preprocessing, temporal, and target-proxy leaks before deployment and craft scaled, cyclical, and out-of-fold target features cleanly.',
  durationMinutes: 80,
  track: 'ds',
  prerequisites: ['2.2'],
  requires: ['pandas-timeseries', 'eda-workflow', 'missing-data-mcar-mar-mnar'],
  teaches: [
    'data-leakage',
    'feature-encoding',
    'temporal-splits',
    'target-encoding',
  ],
  objectives: [
    'Diagnose and eliminate the three deadliest leakage patterns: preprocessing leaks, temporal leaks, and target-proxy columns.',
    'Choose the right numerical transforms (`log1p`, `StandardScaler`, `RobustScaler`) and categorical encodings (`One-Hot`, out-of-fold smoothed Target Encoding).',
    'Encode periodic timestamps cleanly using cyclical `sin`/`cos` projections.',
    'Implement strictly chronological train/validation/test cutoffs that protect multi-day customer histories from future leakage.',
  ],
  checkWithoutNotes: [
    'Explain why running `StandardScaler().fit_transform(X)` BEFORE `train_test_split` leaks test distribution knowledge into training.',
    'Why does random `train_test_split` produce unrealistically high validation AUC on monthly customer churn logs, and how should you split instead?',
    'Given `hour = 23` and `hour = 0`, explain why one integer column breaks linear distance and how `(sin(2*pi*h/24), cos(2*pi*h/24))` fixes it.',
    'Explain the two ingredients needed so Target Encoding (`city -> mean_churn`) does not memorize rare 1-row categories.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Feature Craft & Leak Prevention Decide Real-World Model Quality',
      paragraphs: [
        'Junior engineers spend days grid-searching complex hyperparameters while leaving broken features untouched. In real-world tabular machine learning, feature quality and clean data splits dominate almost every model choice: an accurate logistic regression on leak-free domain features routinely outperforms a leaky gradient-boosted model in live production.',
        'Data leakage happens whenever information from the validation set, test set, or future timestamps sneaks into training inputs. Leakage is treacherous because it never throws a Python exception—your local validation score skyrockets unrealistically high, stakeholders approve deployment, and live inference crashes immediately once future signals are missing.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Closed-Book Exam vs Accidental Answer Key',
      frontendConcept: 'Checking your test harness against mocked staging records while accidentally hardcoding production response keys inside the fixture',
      aiConcept: 'Strict Train/Validation/Test Isolation & Leak-Free Pipelines',
      explanation:
        'Evaluating a model on leaked data is like studying for a math exam using the exact printed final questions with faint pencil answers still visible on the page. You feel brilliant scoring 98% at home, then fail completely on real unseen problems at work. Every scaler, imputer, encoder, and threshold must fit exclusively on `train` before touching `validation` or `test`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Diagnosing the Three Deadliest Forms of Leakage',
      paragraphs: [
        '**1) Preprocessing & Oversampling Leakage:** Suppose `X_train` contains `[10, 20]` (mean `15`, standard deviation `5`) and `X_test` contains `[100]`. Under leak-free scaling, we fit strictly on `X_train` and transform `X_test` as `(100 - 15) / 5 = 17.0`. If you accidentally call `scaler.fit_transform(X)` BEFORE splitting across `[10, 20, 100]`, the combined mean jumps to `43.3` and std balloons to `40.2`, corrupting every scaled value in `X_train` (`-0.83, -0.58` instead of `-1.0, +1.0`)! Similarly, running SMOTE synthetic oversampling before `train_test_split` interpolates synthetic clones near test rows straight into training folds. Always split raw rows first, then wrap scaling and imputation inside `sklearn.pipeline.Pipeline` so `.fit()` runs exclusively inside each training fold.',
        '**2) Temporal & Group Leakage:** Suppose a billing log holds 12 monthly rows per customer (`Jan–Dec`) and you call random 80/20 splitting. Customer 104’s November spending behavior lands in `train` while Customer 104’s October row sits in `validation`—your model memorizes customer-specific noise and future trends rather than predicting ahead in time! For forecasting problems, enforce strict chronological cutoffs (`train <= Aug 31`, `val = Sep`, `test = Oct`). When predicting across independent entities that each emit multiple samples without temporal drift (for example, multiple medical scans per patient), use `GroupKFold(groups=patient_id)` so no single entity spans train and test.',
        '**3) Target-Proxy Leakage:** Imagine a churn dataset containing `cancellation_reason`, `refund_issued_at`, or `final_exit_survey_score`. Those fields appear dramatically predictive in notebooks—because they only get written AFTER the customer already canceled! Audit every candidate column with one concrete test: "Is this column populated and settled at the exact millisecond the model must run live inference?" If not, drop it immediately.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1B: `StandardScaler` vs `RobustScaler` Under Extreme Outliers',
      paragraphs: [
        'Choosing the right scaler matters just as much as avoiding leaks. `StandardScaler` subtracts the arithmetic mean and divides by standard deviation, which behaves poorly when one extreme billing glitch (`$50,000`) skews typical `$20–$80` invoices upward and squashes normal observations into a microscopic range near zero.',
        'By contrast, `RobustScaler` centers on the median (`50th percentile`) and divides by the Interquartile Range (`IQR = Q3 - Q1`). Because a single extreme outlier barely shifts the median or quartiles, typical customer values keep crisp relative spacing—and when paired with `np.log1p`, linear and neural models converge cleanly in fewer gradient steps.',
      ],
    },
    {
      type: 'visual-diagram',
      diagramId: 'ml-pipeline',
      title: 'Production Architecture: The Leak-Free Machine Learning Pipeline',
      caption: 'Every reliable ML system isolates raw SQL cleaning, the Train/Test split firewall, `sklearn.Pipeline`, and cost-aware threshold evaluation.',
    },
    {
      type: 'table',
      title: 'Feature Encoding & Scaling Playbook by Model Family',
      headers: ['Feature Type', 'Transform', 'Tree Models Need It?', 'Linear / Neural Nets Need It?'],
      rows: [
        ['Skewed positive (`income`, `latency_ms`)', '`np.log1p(x)`', 'Optional (helps tail stability)', 'Yes — compresses extreme outliers'],
        ['Continuous numeric', '`StandardScaler` / `RobustScaler`', 'No (split thresholds are scale-invariant)', 'Yes — keeps gradient descent isotropic'],
        ['Low-cardinality category (<15 values)', 'One-Hot Encoding (`handle_unknown="ignore"`)', 'Optional', 'Yes — prevents fake integer ordering'],
        ['High-cardinality (`zip_code`, `merchant_id`)', 'Out-of-fold Smoothed Target Encoding', 'Yes (prevents sparse fragmentation)', 'Yes (or learned embeddings)'],
        ['Cyclical (`hour_of_day`, `month`)', '`sin(2*pi*h/P), cos(2*pi*h/P)`', 'Helpful near boundary wrap', 'Yes (`23:00` sits adjacent to `00:00`)'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Cyclical Encodings & Log1p Tail Compression',
      paragraphs: [
        'Consider encoding `hour` (`0..23`) for a support-volume predictor. Treating `hour` as a raw integer forces a linear model to assume `hour = 23` (`11 PM`) and `hour = 0` (`12 AM`) are as far apart as `0` and `23`, even though only 60 minutes separate them! Projecting onto a unit circle via `sin(2 * pi * hour / 24)` and `cos(2 * pi * hour / 24)` places `23` and `0` right next to each other (`cos(0) = 1.0`, `cos(2*pi*23/24) = 0.966`) while preserving unique coordinates for every hour.',
        'Similarly, transaction latency or account spend often ranges from `5` to `50,000`. Feeding raw values into Logistic Regression lets a single outlier crush smaller differences. Applying `np.log1p(x)` (`log(1 + x)`, safe when `x = 0`) maps `0 -> 0`, `9 -> 2.3`, and `9999 -> 9.2`, turning multiplicative differences into clean additive shifts.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Out-of-Fold Smoothed Target Encoding',
      paragraphs: [
        'Suppose `city` has 500 distinct values (`one-hot` would create 500 sparse columns). Replacing each city directly with its average churn rate (`df.groupby("city")["churn"].transform("mean")`) leaks! Why? If `"Smallville"` appears once and churned (`y = 1`), naive target encoding encodes `"Smallville"` as `1.0`, letting a depth-1 tree split memorize that single label directly on training rows while failing completely on unseen validation rows.',
        'Two defenses eliminate target-encoding overfitting cleanly: **1) Out-of-Fold (OOF) calculation:** split training data into `K` folds; compute city statistics for fold `k` using ONLY the other `K - 1` folds, and encode `validation`/`test` using training stats only. **2) Empirical Bayes smoothing:** blend each category mean `y_bar_c` (`n_c` rows) smoothly back toward the global training mean `y_global` using smoothing weight `m` (for instance `m = 10`): `encoded = (n_c * y_bar_c + m * y_global) / (n_c + m)`. For a 1-row city (`y_bar_c = 1.0`, `y_global = 0.20`, `m = 10`), the smoothed estimate pulls back safely from `1.0` to `(1*1.0 + 10*0.20) / 11 = 0.273`!',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 3 Output: Smoothed Target Encoding vs Naive Mean',
      language: 'python',
      code: `import numpy as np

# Training fold counts & churn totals by city (global prior = 0.20, smoothing m = 10)
global_mean = 0.20
m = 10.0

cities = [
    ("RareTown", 1, 1),     # 1 row, 1 churn -> naive 1.000!
    ("MidCity",  20, 8),    # 20 rows, 8 churns -> naive 0.400
    ("MetroHub", 1000, 180) # 1000 rows, 180 churns -> naive 0.180
]

for name, count, pos in cities:
    naive = pos / count
    smoothed = (pos + m * global_mean) / (count + m)
    print(f"{name:10s} n={count:4d} naive={naive:.3f} smoothed={smoothed:.3f}")
# RareTown   n=   1 naive=1.000 smoothed=0.273  <-- protected from single-row leak!
# MidCity    n=  20 naive=0.400 smoothed=0.333
# MetroHub   n=1000 naive=0.180 smoothed=0.180  <-- large n trusts empirical rate`,
      caption: 'Additive smoothing automatically pulls tiny sample sizes back toward the global prior while trusting high-volume categories.',
    },
    {
      type: 'prose',
      heading: 'Common Feature Engineering Mistakes & How to Debug Them',
      paragraphs: [
        '1) Fitting `TfidfVectorizer`, `OneHotEncoder`, or `SimpleImputer` on `df` before `train_test_split`: any vocabulary count, median, or category frequency learned across test rows is leakage. Fix by calling `.fit_transform()` solely on `X_train` and `.transform()` on `X_val` / `X_test`.',
        '2) Unhandled unseen categories crashing live inference: a user signs up from a new country `"PT"` never seen in training. Always configure `OneHotEncoder(handle_unknown="ignore")` and map unknown target-encoded keys gracefully to `global_mean`.',
        '3) Keeping leaky IDs (`row_id`, sequential `ticket_id`, export batch date) in feature columns: if earlier tickets were stored in order or resolved tickets carry higher IDs, trees silently split on ID thresholds instead of genuine signal. Inspect top feature importances early—if an ID or metadata column tops the chart, you caught a leak!',
        '4) Applying `np.log()` instead of `np.log1p()` to columns containing `0.0`: `np.log(0)` yields `-inf`, crashing downstream linear models with `ValueError`.',
        '5) Rebuilding feature preprocessing scripts separately between notebook training and FastAPI live serving ("training-serving skew"): if offline training computes `log1p(spend)` while your inference endpoint feeds raw dollars, model calibration collapses silently. Serialize the entire `ColumnTransformer` + `Pipeline` object cleanly so training and inference execute identical numerical transforms.',
        '6) Creating high-degree polynomial cross-terms blindly across dozens of features without regularization or validation checks: combinatorial explosion increases variance faster than signal, especially on small datasets. Always justify domain interactions explicitly—such as ratios (`spend_per_active_day`) or time deltas (`days_since_last_login`)—and keep only additions that improve chronological out-of-fold metrics consistently across multiple evaluation windows.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 2.4 Recap: Leak-Free Features & Splits',
      body: '- Fit every imputer, scaler, encoder, and selector strictly inside training folds (`sklearn.Pipeline`).\n- Use strict timestamp cutoffs for temporal forecasting and `GroupKFold` when entities repeat across rows.\n- Audit every input column against prediction-time availability to purge post-event target proxies.\n- Compress skewed positive amounts with `np.log1p` and wrap periodic clocks into `(sin, cos)` pairs.\n- Guard high-cardinality target encodings with out-of-fold computation plus Bayesian prior smoothing.',
    },
    {
      type: 'python-lab',
      labId: 'lab-2-3',
      difficulty: 'guided',
      requires: ['numpy-arrays'],
      title: 'Lab 2.4A: Leak-Free Train/Test Scaling',
      prompt:
        'Fix the classic preprocessing leak! Implement `leak_free_scale(X_train, X_test)` so `mean` and `std` (`axis=0, keepdims=True`) are fit strictly on `X_train` (replacing `0` std with `1.0`) and applied identically to both `X_train` and `X_test`.',
      starterCode: `import numpy as np

def leak_free_scale(X_train: np.ndarray, X_test: np.ndarray):
    # Compute mean & std ONLY on X_train (axis=0, keepdims=True)
    # Guard against std == 0 -> 1.0, then transform both arrays
    pass

tr = np.array([[10.0, 1.0], [20.0, 3.0]])
te = np.array([[100.0, 5.0]])
print(leak_free_scale(tr, te))`,
      testCode: `import numpy as np
tr = np.array([[10.0, 1.0], [20.0, 3.0]])
te = np.array([[100.0, 5.0]])
tr_s, te_s = leak_free_scale(tr, te)
assert np.allclose(tr_s.mean(axis=0), 0.0), "Train must have mean 0"
assert np.allclose(te_s, [[17.0, 3.0]]), f"Test must be scaled by train stats (mean=15, std=5 -> (100-15)/5=17), got {te_s}"
print("PASS: Zero leakage from test set into scaling statistics!")`,
      solutionCode: `import numpy as np

def leak_free_scale(X_train: np.ndarray, X_test: np.ndarray):
    mean = X_train.mean(axis=0, keepdims=True)
    raw_std = X_train.std(axis=0, keepdims=True)
    std = np.where(raw_std == 0, 1.0, raw_std)
    return (X_train - mean) / std, (X_test - mean) / std`,
      hint: 'Never concatenate `X_train` and `X_test` before computing `mean` and `std`. Fit once on `X_train`, scale both.',
      hints: [
        'Use `mean = X_train.mean(axis=0, keepdims=True)` and `raw_std = X_train.std(axis=0, keepdims=True)`.',
        'Avoid division-by-zero on constant columns via `std = np.where(raw_std == 0, 1.0, raw_std)`.',
        'Return `(X_train - mean) / std, (X_test - mean) / std`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-4-oof',
      difficulty: 'spec',
      requires: ['pandas-wrangling', 'python-dicts'],
      title: 'Lab 2.4B: Smoothed Target Encoding Without Rare-Category Memorization',
      prompt:
        'Implement `fit_smoothed_target_encoder(train_cats, train_y, test_cats, m=10.0)` returning `(train_encoded_via_oof, test_encoded)` using `2`-fold split (`idx % 2 == 0` vs `1`) for `train_cats`: each fold’s `train_cats` are encoded using ONLY the opposite fold’s smoothed `(pos + m * prior) / (cnt + m)` (falling back to opposite fold `prior` for unseen categories), while `test_cats` use all `train_cats` stats.',
      starterCode: `import numpy as np

def fit_smoothed_target_encoder(train_cats: list[str], train_y: np.ndarray, test_cats: list[str], m: float = 10.0):
    # For each of 2 folds (mask = np.arange(len) % 2 == f):
    # fit stats on ~mask rows, encode mask rows with smoothed fallback to fold prior
    # Finally fit on all train rows and encode test_cats
    pass`,
      testCode: `import numpy as np
cats = ["Rare", "Metro", "Metro", "Rare", "Metro", "Metro"]
y = np.array([1.0, 0.0, 0.0, 1.0, 1.0, 0.0])
te_cats = ["Rare", "BrandNewCity"]
tr_enc, te_enc = fit_smoothed_target_encoder(cats, y, te_cats, m=10.0)
assert len(tr_enc) == 6 and len(te_enc) == 2
# Full train global mean = 3/6 = 0.5; Rare has 2/2=1.0 -> (2 + 10*0.5)/12 = 7/12 = 0.583333
assert abs(te_enc[0] - (7.0 / 12.0)) < 1e-6, f"Expected Rare test=0.5833, got {te_enc[0]}"
assert abs(te_enc[1] - 0.5) < 1e-6, f"Unseen city must fallback to global train mean 0.5, got {te_enc[1]}"
# Check OOF fold 0 ("Rare" at idx 0 uses fold 1 where Rare appears once at idx 3 -> pos=1,cnt=1,prior=1/3)
expected_idx0 = (1.0 + 10.0 * (1.0 / 3.0)) / (1.0 + 10.0)
assert abs(tr_enc[0] - expected_idx0) < 1e-6, f"Expected OOF idx 0={expected_idx0}, got {tr_enc[0]}"
print("PASS: Out-of-fold smoothed target encoding eliminated rare-row memorization!")`,
      solutionCode: `import numpy as np

def _encode_from_fit(fit_cats: list[str], fit_y: np.ndarray, apply_cats: list[str], m: float) -> np.ndarray:
    prior = float(np.mean(fit_y))
    counts = {}
    sums = {}
    for c, val in zip(fit_cats, fit_y):
        counts[c] = counts.get(c, 0) + 1
        sums[c] = sums.get(c, 0.0) + float(val)
    out = []
    for c in apply_cats:
        if c not in counts:
            out.append(prior)
        else:
            out.append((sums[c] + m * prior) / (counts[c] + m))
    return np.array(out, dtype=float)

def fit_smoothed_target_encoder(train_cats: list[str], train_y: np.ndarray, test_cats: list[str], m: float = 10.0):
    n = len(train_cats)
    tr_enc = np.zeros(n, dtype=float)
    idx = np.arange(n)
    for fold in (0, 1):
        val_mask = (idx % 2) == fold
        fit_mask = ~val_mask
        fit_c = [train_cats[i] for i in idx[fit_mask]]
        val_c = [train_cats[i] for i in idx[val_mask]]
        tr_enc[val_mask] = _encode_from_fit(fit_c, train_y[fit_mask], val_c, m)
    te_enc = _encode_from_fit(train_cats, train_y, test_cats, m)
    return tr_enc, te_enc`,
      hint: 'Write a small helper `_encode_from_fit(fit_cats, fit_y, apply_cats, m)` and invoke it on each fold complement plus full train for test.',
      hints: [
        'Track per-category counts and target sums only from `fit_cats`/`fit_y`.',
        'For any unseen category during encoding, return `prior = float(np.mean(fit_y))`.',
        'Compute `tr_enc[val_mask]` using rows where `(idx % 2) != fold`, then encode `test_cats` using all `train_cats`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-4-temporal',
      difficulty: 'debug',
      requires: ['pandas-timeseries'],
      title: 'Lab 2.4C: Fix Random Temporal Leakage into Cutoff Split',
      prompt:
        'The broken helper shuffles rows randomly with `.sample(frac=0.8)`, mixing future September logs into training while validating on August! Fix `chronological_split(df, cutoff_date)` so `train` has strictly `ts < cutoff_date` and `val` has `ts >= cutoff_date`, sorted ascending by `ts` with reset indices.',
      starterCode: `import pandas as pd

def chronological_split(df: pd.DataFrame, cutoff_date: str):
    out = df.copy()
    out["ts"] = pd.to_datetime(out["ts"])
    # BUG: random sampling leaks future rows into train!
    train = out.sample(frac=0.75, random_state=42)
    val = out.drop(train.index)
    return train.reset_index(drop=True), val.reset_index(drop=True)`,
      testCode: `import pandas as pd
df = pd.DataFrame({
    "user_id": [1, 1, 2, 2],
    "ts": ["2024-09-10", "2024-08-01", "2024-08-15", "2024-09-20"],
    "y": [1, 0, 0, 1],
})
tr, va = chronological_split(df, "2024-09-01")
assert len(tr) == 2 and len(va) == 2
assert tr["ts"].max() < pd.Timestamp("2024-09-01")
assert va["ts"].min() >= pd.Timestamp("2024-09-01")
assert tr["ts"].is_monotonic_increasing and va["ts"].is_monotonic_increasing
print("PASS: Chronological cutoff firewall eliminated temporal future leakage!")`,
      solutionCode: `import pandas as pd

def chronological_split(df: pd.DataFrame, cutoff_date: str):
    out = df.copy()
    out["ts"] = pd.to_datetime(out["ts"])
    out = out.sort_values("ts")
    cutoff = pd.Timestamp(cutoff_date)
    train = out[out["ts"] < cutoff].reset_index(drop=True)
    val = out[out["ts"] >= cutoff].reset_index(drop=True)
    return train, val`,
      hint: 'Parse `ts`, sort ascending, convert `cutoff = pd.Timestamp(cutoff_date)`, and slice `< cutoff` vs `>= cutoff`.',
      hints: [
        'Sort `out = out.sort_values("ts")` before slicing so both output frames are monotonic.',
        'Compare `out["ts"] < pd.Timestamp(cutoff_date)` for `train` and `>=` for `val`.',
        'Append `.reset_index(drop=True)` to both `train` and `val`.',
      ],
      packages: ['pandas'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-4-cyclical',
      difficulty: 'challenge',
      requires: ['numpy-arrays'],
      title: 'Lab 2.4D: Cyclical Hour Projection & Log1p Skew Compression',
      prompt:
        'Implement `encode_time_and_spend(hours: np.ndarray, spend: np.ndarray)` returning a 2D float matrix of shape `(n, 3)` with columns `[sin(2*pi*h/24), cos(2*pi*h/24), log1p(np.maximum(spend, 0.0))]`.',
      starterCode: `import numpy as np

def encode_time_and_spend(hours: np.ndarray, spend: np.ndarray) -> np.ndarray:
    # Build columns sin_h, cos_h, log_spend and np.column_stack([...])
    pass`,
      testCode: `import numpy as np
h = np.array([0, 6, 23], dtype=float)
s = np.array([0.0, 99.0, 999.0])
mat = encode_time_and_spend(h, s)
assert mat.shape == (3, 3)
assert np.allclose(mat[0, :2], [0.0, 1.0], atol=1e-6)
assert np.allclose(mat[1, :2], [1.0, 0.0], atol=1e-6)
# Hour 23 and hour 0 must be close neighbors in cos/sin space
dist_23_0 = np.linalg.norm(mat[2, :2] - mat[0, :2])
dist_6_0 = np.linalg.norm(mat[1, :2] - mat[0, :2])
assert dist_23_0 < 0.30 and dist_23_0 < dist_6_0
assert np.isclose(mat[0, 2], 0.0) and np.isclose(mat[1, 2], np.log(100.0))
print("PASS: Cyclical circle coordinates preserve 23:00-00:00 wrap-around proximity!")`,
      solutionCode: `import numpy as np

def encode_time_and_spend(hours: np.ndarray, spend: np.ndarray) -> np.ndarray:
    angles = 2.0 * np.pi * (hours.astype(float) / 24.0)
    sin_h = np.sin(angles)
    cos_h = np.cos(angles)
    log_spend = np.log1p(np.maximum(spend.astype(float), 0.0))
    return np.column_stack([sin_h, cos_h, log_spend])`,
      hint: 'Compute `angles = 2 * np.pi * hours / 24.0`, take `np.sin` and `np.cos`, clip negative spend at `0.0` before `np.log1p`, and stack with `np.column_stack`.',
      hints: [
        'Use `angles = 2.0 * np.pi * (hours.astype(float) / 24.0)`.',
        'Clip spend using `np.maximum(spend.astype(float), 0.0)` so `log1p` never sees values below `-1`.',
        'Combine all three 1D vectors using `np.column_stack([sin_h, cos_h, log_spend])`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q2-4-1',
      type: 'multiple-choice',
      question: 'You are predicting 30-day customer churn from historical daily usage logs. Which split strategy avoids leakage?',
      options: [
        'Randomly shuffling all daily rows 80/20 before training so every month appears evenly in both splits',
        'Strict chronological split (train on Jan–Aug, validate on Sep–Oct) cut along timestamp boundaries',
        'Stratified random split across individual daily rows after standardizing features globally',
        'Split after running SMOTE synthetic oversampling across the complete combined dataset',
      ],
      correctIndex: 1,
      explanation: 'Random splits leak future customer history backward into earlier training windows, and SMOTE/scaling before splitting leaks synthetic or distributional test artifacts.',
    },
    {
      id: 'q2-4-2',
      type: 'multiple-choice',
      question: 'Why does naive Target Encoding (`city -> global mean churn per city`) severely overfit unless computed out-of-fold with smoothing?',
      options: [
        'Because rare categories with 1 or 2 rows memorize their own target label directly (`0.0` or `1.0`)',
        'Because replacing text categories with floating-point averages disables tree splitting in XGBoost',
        'Because Target Encoding works exclusively on continuous regression targets and fails on binary classification',
        'Because grouping by category automatically drops every missing numerical column from the dataset',
      ],
      correctIndex: 0,
      explanation: 'A category appearing once with `y = 1` encodes straight to `1.0`, giving training folds a direct target giveaway that fails on unseen validation items unless computed OOF and smoothed toward the global prior.',
    },
    {
      id: 'q2-4-3',
      type: 'multiple-choice',
      question: 'Which model family generally does NOT require `StandardScaler` feature scaling to train well?',
      options: [
        'Logistic Regression trained with an L2 weight penalty',
        'K-Means clustering minimizing Euclidean distances',
        'Decision Trees, Random Forests, and Gradient Boosted Trees (XGBoost)',
        'Multi-Layer Perceptrons optimized with Adam gradient updates',
      ],
      correctIndex: 2,
      explanation: 'Decision tree splits evaluate single-column monotonic thresholds (`x > c`), so multiplying a column by 1,000 leaves split partitions untouched—unlike distance-based or gradient-parameterized models.',
    },
    {
      id: 'q2-4-4',
      type: 'spot-bug',
      question: 'Why does training this churn model yield 0.99 validation AUC yet collapse to random guessing in production?',
      code: `features = ["tenure_days", "support_tickets_30d", "account_cancellation_reason_code"]
X_train, X_test, y_train, y_test = train_test_split(df[features], df["churned"])`,
      options: [
        '`support_tickets_30d` must be one-hot encoded rather than kept as an integer count',
        '`train_test_split` defaults to 25% test size instead of 20%, starving the classifier of data',
        '`account_cancellation_reason_code` is a target proxy populated only AFTER a customer actually cancels',
        'String labels inside `features` require calling `StandardScaler` before `train_test_split` runs',
      ],
      correctIndex: 2,
      explanation: 'At inference time before churn occurs, `account_cancellation_reason_code` is empty (`NULL`), whereas historical training rows have it populated only when `churned == 1`.',
    },
    {
      id: 'q2-4-5',
      type: 'numeric',
      question: 'In smoothed target encoding `(pos + m * prior) / (count + m)` with `prior = 0.25` and `m = 10`, a rare city has `count = 2` rows and `pos = 2` positives. What is its smoothed encoded value rounded to 2 decimal places?',
      options: [],
      correctIndex: 0,
      correctNumber: 0.38,
      tolerance: 0.01,
      unit: '',
      explanation: '`(2 + 10 * 0.25) / (2 + 10) = 4.5 / 12 = 0.375` (~`0.38`), far safer than naive `1.0`.',
    },
    {
      id: 'q2-4-6',
      type: 'multi-select',
      question: 'Which two transforms safely handle non-negative spend values spanning `[0, 50_000]` before fitting Logistic Regression?',
      options: [
        'Apply `np.log1p(spend)` first to compress extreme right-tail outliers without `log(0)` errors',
        'Fit `StandardScaler` strictly on `X_train` and apply `.transform()` to `X_val` and `X_test`',
        'Compute raw `np.log(spend)` directly without checking for zero-dollar free-tier rows',
        'Fit `RobustScaler` on the concatenated `train + test` matrix before splitting folds',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: '`np.log1p` handles `0.0 -> 0.0` cleanly and fitting scalers inside `X_train` prevents distributional leakage. Raw `np.log(0)` emits `-inf` and fitting on concatenated `train + test` leaks.',
    },
    {
      id: 'q2-4-7',
      type: 'predict-output',
      question: 'For cyclical `hour = 23` using `sin(2*pi*h/24), cos(2*pi*h/24)`, what happens compared to `hour = 0` (`sin=0, cos=1`)?',
      options: [
        '`hour = 23` lands at `(sin ~ +1.0, cos ~ 0.0)`, far away on the opposite quadrant from `hour = 0`',
        '`hour = 23` lands at `(sin ~ -0.26, cos ~ +0.97)`, sitting immediately adjacent to `hour = 0`',
        '`hour = 23` produces `NaN` because `2*pi*23/24` exceeds the domain of `cos`',
        '`hour = 23` yields `(sin = 0.0, cos = -1.0)`, identical to `hour = 12` noon',
      ],
      correctIndex: 1,
      explanation: '`2*pi*23/24 = 345 deg`, giving `sin = -0.259` and `cos = +0.966`, closely neighboring `0 deg` `(0.0, 1.0)`. `hour = 6` is `(1, 0)` and `hour = 12` is `(0, -1)`.',
    },
    {
      id: 'q2-4-8',
      type: 'ordering',
      question: 'Order the steps to train an honest tabular feature pipeline without data leakage:',
      items: [
        'Drop post-event target-proxy columns unavailable at inference time',
        'Partition rows chronologically (or by `GroupKFold`) into train, validation, and test',
        'Fit missing-value imputers, `StandardScaler`, and OOF target encoders strictly on `train`',
        'Transform `validation` and `test` using the frozen training pipeline',
        'Audit top feature importances to verify no suspiciously predictive leak remains',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Purge target proxies, build the split firewall first, fit all stateful transforms inside train, apply cleanly to test, and double-check top feature importances.',
    },
    {
      id: 'q2-4-9',
      type: 'multiple-choice',
      question: 'Your production API receives a transaction from country `"PT"`, which never appeared in training data. Which encoder configuration prevents a runtime crash?',
      options: [
        '`OneHotEncoder(drop="first")` with no unknown-category handling flag enabled',
        'Re-fitting `OneHotEncoder` from scratch on every incoming single inference API payload',
        'Raising `KeyError` and dropping the API user request whenever an unseen string arrives',
        '`OneHotEncoder(handle_unknown="ignore")` emitting an all-zero vector for unseen countries',
      ],
      correctIndex: 3,
      explanation: '`handle_unknown="ignore"` gracefully emits zeros for unseen categories instead of crashing production inference. Re-fitting per single request alters feature column schemas and breaks trained weights.',
    },
  ],
};
