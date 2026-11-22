import type { Lesson } from '@/types/course';

export const lesson3_4: Lesson = {
  id: '3-4',
  moduleId: 'mod-3',
  number: '3.4',
  title: 'Production ML Workflows: CV, Tuning, Error Analysis & Explainability',
  subtitle: 'Combine leak-free cross-validation, Bayesian hyperparameter tuning, subgroup error slicing, experiment tracking, calibration, and SHAP attributions.',
  durationMinutes: 85,
  track: 'ds',
  prerequisites: ['2.4', '2.5', '3.2'],
  requires: ['sklearn-pipelines', 'temporal-splits', 'regression-metrics-calibration'],
  teaches: [
    'cross-validation-schemes',
    'hyperparameter-tuning',
    'error-analysis-tracking',
    'shap-explainability',
  ],
  objectives: [
    'Match dataset structure cleanly to `StratifiedKFold`, `GroupKFold`, or `TimeSeriesSplit` inside leak-free `ColumnTransformer + Pipeline` workflows.',
    'Explain why Random Search and Bayesian optimization (TPE / Optuna) outperform dense Grid Search on sensitive hyperparameters.',
    'Run systematic subgroup Error Analysis across false positives and false negatives instead of tuning blindly.',
    'Log reproducible experiment manifests (code commit, dataset hash, seed, params, CV metrics) and explain predictions locally and globally using Permutation Importance and SHAP.',
  ],
  checkWithoutNotes: [
    'A clinical dataset contains 6 X-rays per patient across 800 patients. Why does `StratifiedKFold` leak here, and which splitter fixes it?',
    'Why does evaluating `25` Random or Bayesian hyperparameter trials typically beat a `5 x 5` Grid Search (`25` trials) when only 1 parameter strongly moves validation AUC?',
    'List the 5 core fields every reproducible experiment tracking record should log for each training run.',
    'Contrast Global Permutation Importance against local SHAP additive attributions for a rejected loan application.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Engineering Discipline Separates Production ML from Endless Notebook Tweaking',
      paragraphs: [
        'Training a model once with `.fit()` takes five lines of Python. Shipping a model that holds up six months later requires turning messy trial-and-error into a repeatable engineering loop: selecting a cross-validation scheme that honors real data dependencies, searching hyperparameters within a fixed compute budget, calibrating probabilities, running targeted **Error Analysis** on worst failures, logging every run reproducibly, and explaining decisions clearly to stakeholders and regulators.',
        'Skipping any step in this loop creates silent liabilities. Evaluating random splits on grouped medical images inflates validation scores artificially. Trying 40 tweaks without recording dataset versions leaves nobody able to reproduce last Tuesday’s winning artifact when production drifts.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Automated CI Integration Suite vs Manual Clicking',
      frontendConcept: 'Running deterministic CI tests with pinned lockfiles, structured build logs, and browser error traces before deploying a web release',
      aiConcept: 'Cross-Validation Harness, Reproducible Experiment Tracking & Error Slicing',
      explanation:
        'Cross-validation acts like a multi-environment CI test suite for your model, ensuring one lucky train/val split never fools you. **Experiment tracking** acts like Git commits for metrics—recording exact code SHA, data snapshot hash, hyperparameters, and fold scores—while **Error Analysis** acts like reading crash stack traces grouped by browser so you fix the highest-impact failure bucket first.',
    },
    {
      type: 'table',
      title: 'Choosing the Exact Cross-Validation Splitter',
      headers: ['Dataset Structure', 'Correct CV Splitter', 'Bug If You Pick Wrong'],
      rows: [
        ['Independent tabular rows, skewed binary target', '`StratifiedKFold(n_splits=5, shuffle=True)`', 'Standard `KFold` leaves some tiny folds with erratic rare-class ratios'],
        ['Multiple rows sharing one entity (`patient_id`, `user_id`, `repo_id`)', '`GroupKFold` / `StratifiedGroupKFold`', 'Same patient appears in train and val, letting trees memorize patient quirks'],
        ['Chronological demand, pricing, or rolling churn logs', '`TimeSeriesSplit` (expanding or sliding cutoff)', 'Random CV leaks future macro trends backward into historical training folds'],
      ],
    },
    {
      type: 'code',
      title: 'Gold-Standard Leak-Free Scikit-Learn Pipeline',
      language: 'python',
      code: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression

pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])

pipe = Pipeline([
    ("prep", pre),
    ("clf", LogisticRegression(class_weight="balanced", max_iter=1000)),
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="average_precision")`,
      caption: 'Wrapping `ColumnTransformer` inside `Pipeline` guarantees imputers, scalers, and encoders refit cleanly inside every fold without test leakage.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Hyperparameter Tuning (Grid vs Random vs Bayesian / Optuna)',
      paragraphs: [
        'Suppose you tune `learning_rate` (critical!) and `colsample_bytree` (minor impact here) using a budget of 25 training runs. A `5 x 5` Grid Search evaluates only **5 distinct values** of `learning_rate`, wasting 20 runs re-testing identical `learning_rate` slices across inconsequential column subsampling tweaks! By contrast, 25 **Random Search** trials evaluate **25 unique values** of `learning_rate`, hitting closer to optimal performance immediately.',
        '**Bayesian Optimization** (such as Optuna’s Tree-structured Parzen Estimator, TPE) goes one step further: after 6–10 random warm-up trials, it models which hyperparameter regions yielded strong validation scores (`p(x | good)` vs `p(x | bad)`) and proposes new candidates concentrating budget near promising basins while occasionally exploring uncertain gaps. Always pair tuning with nested or held-out evaluation—never tune 300 trials on a tiny 100-row validation fold ("meta-overfitting" to validation noise!).',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Systematic Error Analysis, Calibration & Experiment Tracking',
      paragraphs: [
        'Once your 5-fold pipeline scores `0.78` PR-AUC, resist guessing random hyperparameters next. Instead run **Error Analysis** on out-of-fold validation predictions: inspect the 30 highest-confidence mistakes (`y_true = 1` predicted `0.04`, or `y_true = 0` predicted `0.96`), and slice error rates across segments (`plan_tier`, `country`, `account_age_bucket`, `missing_spend_flag`). You might discover that Enterprise customers generate 60% of false negatives simply because `currency` strings broke upstream for non-USD locales—a 10-minute data fix worth far more than three days of XGBoost tuning!',
        'Equally vital is **Experiment Tracking**: log every run in an append-only JSONL ledger, MLflow, or Weights & Biases containing `run_id`, `git_commit`, `dataset_sha256`, `cv_scheme`, `hyperparams`, `val_metrics` (`mean +/- std`), `calibration_brier`, and `model_artifact_path`. When calibration drifts (`Brier` worsens under heavy class weighting), wrap the winning estimator in `CalibratedClassifierCV(method="sigmoid", cv=5)` before thresholding.',
      ],
    },
    {
      type: 'callout',
      variant: 'interview',
      title: 'SHAP vs Permutation Importance vs Gini Split Counts',
      body: 'Default Gini feature importance biases toward noisy high-cardinality numerical columns. **Permutation Importance** shuffles one validation column at a time and measures actual validation metric drop (`PR-AUC` loss)—model-agnostic and honest! **SHAP** (game-theoretic Shapley values) goes further by producing exact, additive **per-row local explanations** summing from expected base rate to the exact individual prediction: *"Base rate 12% + 35% due to 3 missed payments - 8% due to 5-year tenure = 39% risk."*',
    },
    {
      type: 'prose',
      heading: 'Common Workflow & Explainability Mistakes & How to Debug Them',
      paragraphs: [
        '1) Computing Permutation Importance on `X_train` instead of `X_val`: shuffling noisy features inside training data can show inflated drops simply because an overfit tree memorized split noise on training rows! Always evaluate permutation drops on held-out validation folds.',
        '2) Applying `cross_val_score` onto already-transformed features (`X_scaled = scaler.fit_transform(X_train)` outside `Pipeline`): even inside `X_train`, scaling before CV leaks validation-fold statistics into every training fold. Always pass the raw `Pipeline` straight into `cross_val_score`.',
        '3) Mistaking correlated feature attributions in SHAP or Permutation Importance: if `spend_30d` and `spend_90d` correlate at `0.98`, shuffling `spend_30d` alone barely drops accuracy because the model substitutes `spend_90d`! Group tightly collinear features before claiming a column "does not matter."',
        '4) Comparing runs across changing validation splits without logging `dataset_sha256` and `random_state`: a metric jump from `0.74` to `0.79` means nothing if someone accidentally swapped in an easier validation split or changed positive class weighting mid-week.',
        '5) Running 500 Bayesian Optuna trials against a tiny 300-row validation set ("hyperparameter overfitting to validation noise"): optimizing dozens of noisy tree regularization parameters repeatedly selects configurations tuned purely to random quirks of that fixed validation sample. Whenever datasets are small, use **Nested Cross-Validation** (outer CV evaluates generalization while inner CV tunes parameters) or hold out an untouched final test set checked strictly once.',
        '6) Skipping subgroup calibration audits when global Brier Score looks clean: a loan classifier can report accurate overall averages while under-predicting risk by `12%` for new-signup regions and over-predicting risk by `12%` for legacy cohorts. Run Error Analysis + reliability checks across every critical segment (`country`, `plan_tier`, `tenure_bucket`) before setting production decision thresholds.',
        '7) Using non-deterministic data loading order without pinning `random_state` and saving feature column ordering: if PostgreSQL returns rows in shifting physical page order without an explicit `ORDER BY` before `train_test_split`, or if inference columns arrive sorted differently than `feature_names_in_`, training runs diverge silently and live predictions break. Sort inputs deterministically before splitting and assert schema order at serving time.',
        '8) Confusing `TreeSHAP` interventional vs path-dependent background assumptions: `TreeExplainer` estimates missing feature expectations using either tree sample coverage or an explicit representative background sample (`X_background`). Document which baseline distribution your SHAP waterfall charts measure against (`expected_value`) so legal and compliance teams interpret `"base rate + contribution"` explanations accurately.',
        '9) Leaving model binaries detached from exact preprocessing code: exporting only `clf.pkl` without the matching `ColumnTransformer` version causes catastrophic training-serving skew whenever someone updates an imputer rule or category map. Bundle preprocessing, calibration, and estimator together inside one versioned `Pipeline` artifact checksummed alongside its training manifest.',
        '10) Optimizing `cross_val_score(..., scoring="accuracy")` inside tuning loops for imbalanced fraud or churn classifiers: Hyperparameter search picks timid models predicting the majority class everywhere whenever accuracy drives selection! Pass `scoring="average_precision"` (PR-AUC) or custom expected-profit scorer directly into `GridSearchCV`, `RandomizedSearchCV`, or Optuna objective functions.',
        '11) Declaring a winning architecture over a `+0.002` CV gain without checking cross-fold standard deviation (`mean +/- std`): if Fold 1–5 scores span `[0.76, 0.84]` (`std = 0.03`), a `+0.002` difference sits purely inside fold sampling noise—prefer simpler, faster, better-calibrated pipelines when gains fall well within one standard error.',
        '12) Ignoring serving latency, memory footprint, and serialization size in model selection experiments: an ensemble averaging fifty deep neural networks and heavy gradient boosters might squeeze `+0.003` higher validation AUC yet violate a strict `40 ms` online p99 SLA. Measure inference time per batch, peak RAM overhead, and serialized artifact weight directly inside every experiment tracking run before promoting candidates.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 3.4 Recap: Repeatable Production ML Engineering',
      body: '- Match CV splitters (`StratifiedKFold`, `GroupKFold`, `TimeSeriesSplit`) strictly to data independence.\n- Wrap every imputer, scaler, and encoder inside `ColumnTransformer` + `Pipeline` before calling CV.\n- Prefer Random Search or Bayesian tuning (`Optuna`) over dense Grid Search.\n- Slice out-of-fold validation failures by business segment before touching model architecture.\n- Track code commit, dataset hash, params, and calibration scores on every experiment, and explain via Validation Permutation / SHAP.',
    },
    {
      type: 'python-lab',
      labId: 'lab-3-4-cv',
      difficulty: 'guided',
      requires: ['sklearn-pipelines', 'data-leakage'],
      title: 'Lab 3.4A: Group-Aware Leak-Free Cross-Validation in scikit-learn',
      prompt:
        'A dataset has multiple rows per `patient_id` (`groups`). Complete `evaluate_grouped_cv(X, y, groups)` using `GroupKFold(n_splits=3)` and a `Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression(max_iter=500, random_state=42))])`, returning the float mean validation `roc_auc` across folds.',
      starterCode: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold, cross_val_score

def evaluate_grouped_cv(X: np.ndarray, y: np.ndarray, groups: np.ndarray) -> float:
    # Build leak-free Pipeline, configure GroupKFold(n_splits=3),
    # pass groups=groups into cross_val_score(..., scoring="roc_auc"), return mean float
    pass`,
      testCode: `import numpy as np
rng = np.random.default_rng(42)
patient_ids = np.repeat(np.arange(30), 3)  # 90 rows across 30 patients
X = rng.normal(size=(90, 4))
# Genuine relationship across patient rows
y_pat = (rng.normal(size=30) > 0).astype(int)
X[:, 0] += np.repeat(y_pat * 2.0, 3)
y = np.repeat(y_pat, 3)
mean_auc = evaluate_grouped_cv(X, y, patient_ids)
assert 0.75 <= mean_auc <= 1.0, f"Expected strong grouped CV AUC >= 0.75, got {mean_auc}"
print(f"PASS: Leak-free GroupKFold pipeline returned honest mean ROC-AUC = {mean_auc:.3f}!")`,
      solutionCode: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold, cross_val_score

def evaluate_grouped_cv(X: np.ndarray, y: np.ndarray, groups: np.ndarray) -> float:
    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=500, random_state=42)),
    ])
    cv = GroupKFold(n_splits=3)
    scores = cross_val_score(pipe, X, y, cv=cv, groups=groups, scoring="roc_auc")
    return float(np.mean(scores))`,
      hint: 'Pass `groups=groups` explicitly into `cross_val_score(pipe, X, y, cv=GroupKFold(n_splits=3), groups=groups, scoring="roc_auc")`.',
      hints: [
        'Keep `StandardScaler` inside `Pipeline` so each fold scales strictly on training patients.',
        'Instantiate `cv = GroupKFold(n_splits=3)` and remember `cross_val_score` needs `groups=groups`.',
        'Return `float(np.mean(scores))`.',
      ],
      packages: ['numpy', 'scikit-learn'],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-4-perm',
      difficulty: 'spec',
      requires: ['precision-recall-f1'],
      title: 'Lab 3.4B: Implement Validation Permutation Feature Importance',
      prompt:
        'Implement `permutation_importance_scores(predict_fn, X_val, y_val, seed=42)` using validation accuracy (`np.mean((predict_fn(X) >= 0.5) == y_val)`): compute `base_acc`, then for each feature column `j`, copy `X_val`, shuffle column `j` using `rng = np.random.default_rng(seed)` (`rng.permutation(X_val[:, j])`), compute `perm_acc`, and return list of accuracy drops `[base_acc - perm_acc, ...]` per column.',
      starterCode: `import numpy as np

def permutation_importance_scores(predict_fn, X_val: np.ndarray, y_val: np.ndarray, seed: int = 42) -> list[float]:
    # Compute base_acc on clean X_val, then shuffle each column j in turn using rng.permutation
    # Return accuracy drops [base_acc - perm_acc, ...]
    pass`,
      testCode: `import numpy as np
rng = np.random.default_rng(42)
X = rng.normal(size=(150, 3))
y = (X[:, 0] > 0.0).astype(int)  # ONLY feature 0 drives the label; 1 & 2 are noise!
fn = lambda arr: (arr[:, 0] > 0.0).astype(float)
drops = permutation_importance_scores(fn, X, y, seed=42)
assert len(drops) == 3
assert drops[0] > 0.35, f"Feature 0 must cause >0.35 accuracy drop when shuffled, got {drops[0]}"
assert abs(drops[1]) < 1e-6 and abs(drops[2]) < 1e-6, f"Unused features must have 0 drop, got {drops[1:]}"
print("PASS: Permutation importance cleanly isolated true driver feature 0!")`,
      solutionCode: `import numpy as np

def permutation_importance_scores(predict_fn, X_val: np.ndarray, y_val: np.ndarray, seed: int = 42) -> list[float]:
    rng = np.random.default_rng(seed)
    base_preds = (np.asarray(predict_fn(X_val)) >= 0.5).astype(int)
    base_acc = float(np.mean(base_preds == y_val))
    drops = []
    for j in range(X_val.shape[1]):
        X_perm = X_val.copy()
        X_perm[:, j] = rng.permutation(X_perm[:, j])
        perm_preds = (np.asarray(predict_fn(X_perm)) >= 0.5).astype(int)
        perm_acc = float(np.mean(perm_preds == y_val))
        drops.append(float(base_acc - perm_acc))
    return drops`,
      hint: 'Always `.copy()` `X_val` inside the column loop before overwriting `X_perm[:, j] = rng.permutation(X_perm[:, j])`.',
      hints: [
        'Measure baseline accuracy once on clean `X_val`.',
        'Copy `X_val` every iteration so shuffling column `j` does not leave earlier columns scrambled.',
        'Append `base_acc - perm_acc` for each `j in range(X_val.shape[1])`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-4-error-slice',
      difficulty: 'debug',
      requires: ['precision-recall-f1'],
      title: 'Lab 3.4C: Debug Subgroup Error Analysis & Experiment Record Helper',
      prompt:
        'A broken error-analysis helper averages global error rate without surfacing WHICH segment has the highest False Negative Rate (`FN / (TP + FN)`), AND omits `dataset_hash` from the tracking manifest! Fix `slice_fnr_and_manifest(y_true, y_pred, segments, dataset_hash, params)` returning `{"worst_segment": ..., "segment_fnr": {seg: fnr, ...}, "manifest": {"dataset_hash": ..., "params": ...}}` (returning `0.0` FNR if a segment has zero positives).',
      starterCode: `def slice_fnr_and_manifest(y_true, y_pred, segments, dataset_hash: str, params: dict) -> dict:
    # BUG: computes global accuracy and drops dataset_hash from tracking manifest!
    acc = sum(int(a == b) for a, b in zip(y_true, y_pred)) / len(y_true)
    return {"worst_segment": "unknown", "segment_fnr": {"all": 1.0 - acc}, "manifest": {"params": params}}`,
      testCode: `yt = [1, 1, 1, 0,  1, 1, 0, 0]
yp = [1, 1, 1, 0,  0, 0, 0, 0]  # Segment "ent" misses 2/2 positives -> FNR=1.0! "smb" misses 0/3 -> FNR=0.0
segs = ["smb", "smb", "smb", "smb", "ent", "ent", "ent", "ent"]
out = slice_fnr_and_manifest(yt, yp, segs, "sha256:abc123", {"C": 1.0})
assert out["worst_segment"] == "ent", f"Expected worst_segment='ent', got {out['worst_segment']}"
assert abs(out["segment_fnr"]["smb"] - 0.0) < 1e-6
assert abs(out["segment_fnr"]["ent"] - 1.0) < 1e-6
assert out["manifest"]["dataset_hash"] == "sha256:abc123"
assert out["manifest"]["params"] == {"C": 1.0}
print("PASS: Error analysis surfaced broken Enterprise slice and preserved reproducible manifest!")`,
      solutionCode: `def slice_fnr_and_manifest(y_true, y_pred, segments, dataset_hash: str, params: dict) -> dict:
    stats = {}
    for yt, yp, seg in zip(y_true, y_pred, segments):
        if seg not in stats:
            stats[seg] = [0, 0]  # [fn, total_pos]
        if yt == 1:
            stats[seg][1] += 1
            if yp == 0:
                stats[seg][0] += 1
    segment_fnr = {
        seg: (vals[0] / vals[1] if vals[1] > 0 else 0.0)
        for seg, vals in stats.items()
    }
    worst_seg = max(segment_fnr.keys(), key=lambda s: segment_fnr[s])
    return {
        "worst_segment": worst_seg,
        "segment_fnr": segment_fnr,
        "manifest": {
            "dataset_hash": dataset_hash,
            "params": dict(params),
        },
    }`,
      hint: 'Accumulate `(fn, total_positives)` per unique segment, compute `fn / total_pos` (`0.0` if zero positives), and include `dataset_hash` in `manifest`.',
      hints: [
        'Track `[fn_count, positive_count]` per segment key (`yt == 1` increments positive count; `yt == 1 and yp == 0` increments `fn_count`).',
        'Pick `worst_segment = max(segment_fnr, key=lambda s: segment_fnr[s])`.',
        'Include both `"dataset_hash"` and `"params"` in the `"manifest"` sub-dictionary.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q3-4-1',
      type: 'multiple-choice',
      question: 'A radiology dataset contains 5 chest X-rays per patient across 1,000 patients. Which CV splitter prevents patient memorization leakage?',
      options: [
        'Standard shuffled 5-Fold CV splitting individual X-ray rows uniformly across training and validation folds',
        'StratifiedKFold balancing positive scan percentages uniformly across individual images without tracking patient IDs',
        '`GroupKFold` keeping all scans of each `patient_id` in one split',
        'Leave-One-Out CV holding out single X-rays one by one while keeping the remaining four patient scans inside train',
      ],
      correctIndex: 2,
      explanation: '`GroupKFold` isolates all images belonging to any patient together inside either train or validation, blocking patient anatomy memorization.',
    },
    {
      id: 'q3-4-2',
      type: 'multiple-choice',
      question: 'Why do Random Search and Bayesian optimization (Optuna TPE) almost always beat Grid Search on fixed compute budgets?',
      options: [
        'They sample far more unique values of sensitive parameters per budget',
        'Grid Search inside scikit-learn cannot evaluate continuous floating-point regularization hyperparameters cleanly',
        'Random Search computes validation metrics directly on final test rows without spending time running cross-validation folds',
        'Optuna automatically deletes correlated input features before optimization starts so training finishes in zero iterations',
      ],
      correctIndex: 0,
      explanation: 'A `5 x 5` Grid Search only explores 5 unique values of a sensitive hyperparameter across 25 runs, whereas 25 Random or Bayesian trials test 25 distinct values and adapt toward winning regions.',
    },
    {
      id: 'q3-4-3',
      type: 'multiple-choice',
      question: 'What distinct capability does SHAP provide beyond global Permutation Feature Importance?',
      options: [
        'SHAP extracts exact causal feature weights directly from raw unlabeled CSV files before any supervised model fits',
        'SHAP decomposes every individual prediction into additive feature contributions',
        'SHAP always finishes in `O(1)` constant runtime regardless of tree depth, sample count, or feature dimensionality',
        'SHAP automatically resolves severe minority class imbalance without requiring probability calibration or threshold tuning',
      ],
      correctIndex: 1,
      explanation: 'Permutation Importance summarizes global column drop across a dataset, whereas SHAP also explains individual predictions (`base + sum(phi_j) = output`).',
    },
    {
      id: 'q3-4-4',
      type: 'spot-bug',
      question: 'Spot the hidden data-leakage bug in this cross-validation script:',
      code: `X_tr_scaled = StandardScaler().fit_transform(X_train)
scores = cross_val_score(LogisticRegression(), X_tr_scaled, y_train, cv=5)`,
      options: [
        '`LogisticRegression` rejects standardized float inputs inside `cross_val_score` unless explicit `C=100` is specified',
        '`cv=5` executes only five splits instead of the required ten folds inside scikit-learn model selection utilities',
        '`StandardScaler` fit on full `X_train` before CV leaks fold stats',
        'Calling `cross_val_score` directly without scoring metrics evaluates training accuracy instead of validation folds',
      ],
      correctIndex: 2,
      explanation: 'Passing pre-scaled `X_tr_scaled` leaks validation-fold statistics across CV boundaries. Wrap `StandardScaler()` inside `Pipeline` passed directly to `cross_val_score`.',
    },
    {
      id: 'q3-4-5',
      type: 'predict-output',
      question: 'For a loan model with base approval risk `0.15`, SHAP assigns `+0.30` for high utilization and `-0.10` for long account history (all other features `0.0`). What is the predicted output?',
      options: [
        '`0.15` because positive and negative SHAP feature weights cancel each other completely around the global prior',
        '`0.35` (`0.15 + 0.30 - 0.10`)',
        '`0.45` because SHAP sums only positive risk drivers while discarding protective negative feature attributions',
        '`0.55` because expected base risk rates double automatically whenever any individual contribution exceeds `0.20`',
      ],
      correctIndex: 1,
      explanation: 'Local Shapley values satisfy exact additivity: `base_value + sum(shap_values) = 0.15 + 0.30 - 0.10 = 0.35`.',
    },
    {
      id: 'q3-4-6',
      type: 'multi-select',
      question: 'Which two actions ensure trustworthy Error Analysis and reproducible Experiment Tracking?',
      options: [
        'Slicing validation False Negative and False Positive rates by business subgroup (`country`, `plan_tier`) before blind hyperparameter sweeps',
        'Logging `git_commit`, `dataset_sha256`, `cv_scheme`, `params`, and `calibration_brier` for every run',
        'Evaluating Permutation Feature Importance exclusively on `X_train` to check which noisy columns trees memorized',
        'Clearing previous run logs whenever a fresh hyperparameter configuration beats yesterday’s score',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Subgroup error slicing pinpoints high-ROI data fixes, and immutable tracking manifests guarantee every winning model remains reproducible.',
    },
    {
      id: 'q3-4-7',
      type: 'numeric',
      question: 'An experiment tests `learning_rate` (high impact) and `seed_offset` (zero impact) across a `4 x 4` Grid (`16` runs). How many distinct `learning_rate` values did that Grid Search actually evaluate?',
      options: [],
      correctIndex: 0,
      correctNumber: 4,
      tolerance: 0,
      unit: 'values',
      explanation: 'A `4 x 4` grid wastes `16` runs testing only `4` distinct values of `learning_rate` repeated 4 times each.',
    },
    {
      id: 'q3-4-8',
      type: 'multiple-choice',
      question: 'Why can Permutation Importance score two identical collinear features (`spend_30d` and `spend_30d_copy`) near zero even though spend drives 80% of predictions?',
      options: [
        'Shuffling one leaves the intact duplicate copy available to read',
        'Because scikit-learn automatically drops collinear columns prior to measuring validation permutation importance drops',
        'Because duplicate collinear features receive negative permutation weights automatically during stratified cross-validation',
        'Because `StandardScaler` forces identical duplicate feature vectors to exact `0.0` constants before training begins',
      ],
      correctIndex: 0,
      explanation: 'When a redundant copy still carries identical signal, shuffling one feature barely hurts validation score—group correlated columns or inspect SHAP clusters too.',
    },
    {
      id: 'q3-4-9',
      type: 'ordering',
      question: 'Order the disciplined engineering iteration loop for improving a baseline ML system:',
      items: [
        'Select CV scheme honoring entity groups and timestamps (`GroupKFold` / `TimeSeriesSplit`)',
        'Train a leak-free `ColumnTransformer + Pipeline` baseline and log manifest (`hash`, `params`, `CV`)',
        'Run subgroup Error Analysis on out-of-fold validation mistakes to find upstream data/feature bugs',
        'Run bounded Random or Bayesian hyperparameter tuning strictly on training CV folds',
        'Check probability calibration (`Brier`), validate thresholds, and evaluate untouched test once',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Lock valid CV -> log baseline -> diagnose error slices first -> tune efficiently -> verify calibration and evaluate held-out test once.',
    },
  ],
};
