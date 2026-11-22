import type { Lesson } from '@/types/course';

export const lesson7_4: Lesson = {
  id: '7-4',
  moduleId: 'mod-7',
  number: '7.4',
  title: 'MLOps: Versioning, Drift Monitoring, Shadow Deploys & Incident Response',
  subtitle: 'Keep models healthy months after launch: version data and models cleanly, catch covariate and concept drift via PSI/KS, deploy safely with shadow/rollback, and run calm incident postmortems.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['3.4', '7.2'],
  requires: ['golden-datasets', 'ci-regression-gates', 'confidence-intervals'],
  teaches: [
    'model-data-versioning',
    'data-concept-drift',
    'shadow-rollback',
    'incident-response',
  ],
  objectives: [
    'Version datasets, feature transforms, prompt templates, and model weights reproducibly using immutable content hashes.',
    'Distinguish **Data / Covariate Drift** ($P(X)$ shifts) from **Concept Drift** ($P(Y \\mid X)$ shifts) and compute Population Stability Index (`PSI`) alerts.',
    'Compare **Shadow Deployment**, **Canary Rollout**, and **Instant Automated Rollback** strategies for low-risk shipping.',
    'Execute a structured AI Incident Response checklist (triage, rollback, root cause, golden eval promotion).',
  ],
  checkWithoutNotes: [
    'What is the critical difference between Covariate Drift ($P(X)$ changed) and Concept Drift ($P(Y \\mid X)$ changed), and why can Concept Drift pass PSI input checks undetected?',
    'Interpret standard PSI alert thresholds: `< 0.1`, `0.1–0.25`, and `> 0.25`.',
    'Contrast Shadow Deployment vs Canary Rollout—when should you run Shadow mode first?',
    'When a newly shipped model spikes customer error rates at 2 AM, what is Step 1 BEFORE debugging code or tuning weights?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Traditional software breaks loudly: rename a database column and your backend throws HTTP 500 immediately. Machine learning and LLM systems **rot silently**: endpoints keep returning cheerful HTTP 200 JSON responses while churn prediction accuracy quietly drops from 89% to 62% because customer demographics shifted after expanding to a new country, or because a major upstream pricing change altered user behavior overnight.',
        'Without disciplined **MLOps**, teams spend days arguing over whether a degradation came from stale feature tables, an accidental prompt tweak, upstream embedding drift, or an unpinned library upgrade. Learning how to **version data and artifacts immutably**, monitor **input drift (`PSI` / `KS`)**, **proxy metrics**, and **delayed ground truth**, validate risky upgrades via **Shadow and Canary deploys**, and run calm **rollback + postmortem runbooks** keeps AI systems trustworthy long after launch day.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Flight Black Boxes (Versioning), Weather Gauges (Drift) & Safety Nets (Shadow/Rollback)',
      paragraphs: [
        'First, understand **Data & Model Versioning**. You must be able to answer *"exactly which code, dataset snapshot, feature pipeline, prompt version, and model weights produced prediction `pred-9021`?"* in thirty seconds. Store immutable artifacts tagged by Git SHA + dataset SHA-256 hash (`models/churn_v14_8f2a9c.pkl` or `registry.json` containing training row count, schema hash, and held-out baseline metrics)—never overwrite `model_latest.pkl` blindly in place.',
        'Second, separate **Covariate (Data) Drift** from **Concept Drift**. In **Covariate Drift**, the input mix $P(X)$ shifts while the underlying relationship $P(Y \\mid X)$ stays intact—for instance, launching marketing in Europe pushes international transactions from 10% to 55%. You detect $P(X)$ shifts *immediately* before labels arrive using **Population Stability Index (`PSI`)** across binned feature distributions (`PSI < 0.1` steady, `0.1–0.25` monitor, `> 0.25` alert!) or two-sample **Kolmogorov-Smirnov (`KS`)** tests. In **Concept Drift**, inputs look completely normal yet reality $P(Y \\mid X)$ shifts—for example, during a sudden recession, borrowers with the exact same `720` credit score default three times more often! Concept drift bypasses pure input checks completely, which is why you MUST track **prediction proxies** (confidence entropy, refusal spikes, human escalation rate) AND join predictions with **delayed ground-truth outcomes** as soon as real labels arrive.',
        'Third, ship changes defensively using **Shadow Deployment** (mirror live production requests asynchronously to the candidate model and log latency/predictions invisibly while still serving the stable baseline to users—zero user blast radius!), followed by **Canary Rollout** (`5% -> 25% -> 100%` gated by automated error/cost/latency rollback triggers). When an incident fires in production, **roll back to the last known good immutable artifact FIRST**, stabilize users, inspect correlated traces, fix the bug, and turn the failure into a permanent regression test.',
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'drift-monitor',
      title: 'Interactive Lab: Production Data Drift (PSI) & Concept Drift Monitor',
      description:
        'Inject covariate shifts (e.g., sudden mobile traffic surge) or concept drift into live production streams and watch PSI, KL divergence, and rolling accuracy trigger automated retraining alerts.',
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'LLM Observability Standard: Span Tracing + Rollback First',
      body: 'Log every request under a trace tree plus `model_version` and `prompt_version`. If error rates, refusal spikes, or p95 latency breach SLA thresholds after deployment, trigger an instant **rollback** to the previous immutable version before investigating root cause.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Computing Population Stability Index (PSI) Safely by Hand & Python',
      paragraphs: [
        'Trace exact PSI math across binned proportions: $\\text{PSI} = \\sum_{i=1}^B (P_i - Q_i) \\ln\\left(\\frac{P_i}{Q_i}\\right)$, where $Q_i$ is the baseline training share in bin $i$ and $P_i$ is today\'s live share. Notice why an unsmoothed zero bin (`P_i = 0.0` or `Q_i = 0.0`) crashes `math.log(P / Q)` with `ValueError` or `ZeroDivisionError`! Always clamp bin proportions with a tiny epsilon (`max(p, 1e-6)`) before taking logs.',
        'Look at concrete numbers: suppose historical age-group shares are `[0.50, 0.30, 0.20]` and live traffic shifts mildly to `[0.48, 0.31, 0.21]`. Notice `(0.48 - 0.50) * ln(0.48/0.50) ≈ 0.0008`—summing across all three bins yields `PSI ≈ 0.0017` (`< 0.1`, healthy). Now shift live traffic sharply to `[0.15, 0.35, 0.50]`: `(0.15 - 0.50)*ln(0.15/0.50) + (0.50 - 0.20)*ln(0.50/0.20) + ... ≈ 0.70` (`> 0.25`, high-severity drift alert!).',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Zero-Safe Population Stability Index (PSI) Monitor',
      language: 'python',
      code: `import math

def compute_psi(expected_props: list[float], actual_props: list[float], eps: float = 1e-6) -> float:
    psi = 0.0
    for q_raw, p_raw in zip(expected_props, actual_props):
        q = max(q_raw, eps)
        p = max(p_raw, eps)
        psi += (p - q) * math.log(p / q)
    return round(psi, 4)

base = [0.50, 0.30, 0.20]
print("Mild shift :", compute_psi(base, [0.48, 0.31, 0.21]))
print("Major shift:", compute_psi(base, [0.15, 0.35, 0.50]))`,
      caption: 'Explained output: `Mild shift: 0.0017` (`< 0.1`, steady) vs `Major shift: 0.7042` (`> 0.25`, immediate investigation alert).',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Shadow Deployment, Lineage Registry & Blameless Incident Runbooks',
      paragraphs: [
        'Suppose you deploy `churn-v2` in **Shadow Mode** alongside live `churn-v1`: every real request runs synchronously on `v1` (returned to users) and asynchronously on `v2` (logged silently). Before graduating `v2` to Canary, your shadow analyzer verifies four checks automatically: `v2` crash/exception rate (`<= 0.1%`), p95 latency within budget, score correlation and calibration against `v1`, and zero guardrail violation spikes. Keep shadow runners strictly non-blocking with short timeouts so a slow experimental candidate never delays live users!',
        'Back every rollout with a machine-readable **artifact lineage manifest** (`manifest.json`) linking `model_sha256`, `dataset_sha256`, `feature_schema_version`, `git_commit`, and held-out golden metrics (`roc_auc`, `brier_score`, `recall`). If a subtle upstream feature-join bug silently doubles null rates in `country_code`, diffing live input schemas and manifests exposes the exact breaking commit within minutes rather than triggering blind retraining.',
        'If an active canary or release later triggers a production incident (for instance, `refusal_rate` spikes from `2%` to `28%`, `PSI` jumps past `0.35`, or `5xx` errors exceed `1%`), execute the four-step **Incident Response Runbook**: 1) **Mitigate immediately**: flip router weight back (`rollback`) to `v1` so users recover in `<60 seconds`. 2) **Verify stabilization**: confirm live dashboards drop back green. 3) **Diagnose from immutable artifacts & traces**: diff `v2` config/data/prompt hashes against `v1`. 4) **Prevent recurrence**: add the triggering failure trace to `golden.jsonl` CI tests cleanly via a blameless postmortem.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Overwriting `model_latest.pkl` or editing prompts in place:** Without immutable versioned filenames or hashes, rolling back broken deployments during a 2 AM outage becomes manual guesswork.',
        '**Mistake 2 — Monitoring ONLY input features (`PSI`) without delayed outcome tracking:** Input distributions can stay rock steady while Concept Drift (`P(Y | X)`) destroys business metrics silently.',
        '**Mistake 3 — Retraining automatically blindly on unverified drifted data:** Automated retraining pipelines that scoop up broken corrupted upstream columns or mislabeled spam flood production with poisoned models! Always validate schema bounds, missing-rate limits, and golden CI evals *before* auto-promoting retrained weights.',
        '**Mistake 4 — Diving into live debugging for 45 minutes while users hit broken predictions:** Mitigate user impact first with an instant rollback to the previous verified artifact, then investigate calmly off production traces.',
        '**Mistake 5 — Tuning alerts so loosely or noisily that engineers mute the channel:** Alerting every time a 20-request hourly window flickers triggers alert fatigue until real outages get ignored! Trigger high-priority pages on sustained multi-window thresholds (such as `PSI > 0.25` over >= 500 samples or `error_rate > 1%` for 5 minutes).',
        '**Mistake 6 — Creating biased feedback loops in churn or ranking models:** If your model hides risky leads from sales reps, you only collect ground-truth outcomes on accepted leads—keep a small randomized exploration holdout (`1%–3%`) so future retraining data stays unbiased.',
        '**Mistake 7 — Allowing training-serving feature skew:** Computing `avg_spend_30d` differently in offline pandas training scripts than in live FastAPI feature builders triggers silent accuracy drops from minute one—share one tested transform module and strict schema contract tests across both offline batch training and live inference paths.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Version everything immutably:** Tag every deployment with code SHA, dataset hash, prompt version, and baseline metrics.',
        '2. **Watch all 3 drift layers:** Track inputs (`PSI`/`KS`), prediction proxies (refusal, confidence, latency), and delayed true labels.',
        '3. **Distinguish Data vs Concept Drift:** `P(X)` shift shows up in PSI; `P(Y | X)` shift needs outcome feedback.',
        '4. **Graduate safely via Shadow -> Canary:** Mirror traffic invisibly first, then ramp small traffic percentages behind automatic rollback gates.',
        '5. **Rollback first during incidents:** Restore user health immediately, inspect trace diffs, and add failing inputs to golden CI tests.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-4-1',
      difficulty: 'guided',
      requires: ['data-concept-drift'],
      title: 'Lab 7.4.1 (Guided): Zero-Safe PSI Drift Calculator & Alert Classifier',
      prompt:
        'Implement `evaluate_psi_drift(baseline_counts, current_counts)` returning `{"psi": float, "status": "ok"|"monitor"|"alert"}`. Normalize both integer count lists into proportions summing to `1.0`, compute zero-safe `PSI = sum((p - q) * math.log(p / q))` clamping `max(prop, 1e-6)`, round `"psi"` to `4` decimals, and classify `"ok"` if `psi < 0.1`, `"monitor"` if `0.1 <= psi <= 0.25`, else `"alert"` (`psi > 0.25`).',
      starterCode: `import math

def evaluate_psi_drift(baseline_counts: list[int], current_counts: list[int]) -> dict:
    # Normalize counts -> proportions, clamp eps=1e-6, compute PSI and status
    pass`,
      testCode: `r_ok = evaluate_psi_drift([500, 300, 200], [490, 305, 205])
assert r_ok["status"] == "ok" and r_ok["psi"] < 0.1

r_mod = evaluate_psi_drift([500, 300, 200], [280, 360, 360])
assert r_mod["status"] == "monitor" and 0.1 <= r_mod["psi"] <= 0.25, f"Got {r_mod}"

r_bad = evaluate_psi_drift([500, 300, 200], [100, 400, 500])
assert r_bad["status"] == "alert" and r_bad["psi"] > 0.25

r_zero = evaluate_psi_drift([500, 500], [0, 1000])
assert r_zero["status"] == "alert" and math.isfinite(r_zero["psi"])
print("PASS: Lab 7.4.1 PSI drift calculator & alert classifier passed!")`,
      solutionCode: `import math

def evaluate_psi_drift(baseline_counts: list[int], current_counts: list[int]) -> dict:
    base_tot = sum(baseline_counts) or 1
    curr_tot = sum(current_counts) or 1
    eps = 1e-6
    psi = 0.0
    for b, c in zip(baseline_counts, current_counts):
        q = max(b / base_tot, eps)
        p = max(c / curr_tot, eps)
        psi += (p - q) * math.log(p / q)
    psi_r = round(psi, 4)
    if psi_r < 0.1:
        status = "ok"
    elif psi_r <= 0.25:
        status = "monitor"
    else:
        status = "alert"
    return {"psi": psi_r, "status": status}`,
      hint: 'Divide each count list by its own `sum(...)`, clamp both `q` and `p` with `max(..., 1e-6)`, sum `(p - q) * math.log(p / q)`, and branch on `< 0.1` vs `<= 0.25`.',
      hints: [
        'Normalize `q = max(b / sum(baseline_counts), 1e-6)` and `p = max(c / sum(current_counts), 1e-6)`.',
        'Sum `(p - q) * math.log(p / q)` across matching bins.',
        'Return `"ok"` (`< 0.1`), `"monitor"` (`0.1–0.25`), or `"alert"` (`> 0.25`).',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-4-2',
      difficulty: 'spec',
      requires: ['shadow-rollback', 'incident-response'],
      title: 'Lab 7.4.2 (From Spec): Canary Health Evaluator & Automated Rollback Gate',
      prompt:
        'Implement `evaluate_canary(canary_metrics, baseline_metrics)` where each dict contains `{"error_rate": float, "p95_ms": float, "refusal_rate": float}`. Trigger automated rollback (`{"action": "rollback", "reasons": list[str]}`) if ANY hold: 1) `canary["error_rate"] > 0.01`, 2) `canary["p95_ms"] > baseline["p95_ms"] * 1.25`, OR 3) `abs(canary["refusal_rate"] - baseline["refusal_rate"]) > 0.08`. Otherwise return `{"action": "promote", "reasons": []}` (sort `reasons` alphabetically: `"error_rate"`, `"latency_p95"`, `"refusal_shift"`).',
      starterCode: `def evaluate_canary(canary: dict[str, float], baseline: dict[str, float]) -> dict:
    # Check error_rate (> 0.01), latency (> 1.25x baseline), and refusal shift (> 0.08)
    pass`,
      testCode: `base = {"error_rate": 0.002, "p95_ms": 400.0, "refusal_rate": 0.03}
ok = evaluate_canary({"error_rate": 0.004, "p95_ms": 460.0, "refusal_rate": 0.05}, base)
assert ok == {"action": "promote", "reasons": []}, f"Got {ok}"

bad = evaluate_canary({"error_rate": 0.025, "p95_ms": 550.0, "refusal_rate": 0.15}, base)
assert bad == {"action": "rollback", "reasons": ["error_rate", "latency_p95", "refusal_shift"]}, f"Got {bad}"
print("PASS: Lab 7.4.2 Canary automated rollback gate passed!")`,
      solutionCode: `def evaluate_canary(canary: dict[str, float], baseline: dict[str, float]) -> dict:
    reasons = []
    if canary["error_rate"] > 0.01:
        reasons.append("error_rate")
    if canary["p95_ms"] > baseline["p95_ms"] * 1.25:
        reasons.append("latency_p95")
    if abs(canary["refusal_rate"] - baseline["refusal_rate"]) > 0.08:
        reasons.append("refusal_shift")
    reasons.sort()
    action = "rollback" if reasons else "promote"
    return {"action": action, "reasons": reasons}`,
      hint: 'Check all three thresholds independently appending `"error_rate"`, `"latency_p95"`, `"refusal_shift"`, sort `reasons`, and return `"rollback"` if non-empty.',
      hints: [
        'Compare `canary["error_rate"] > 0.01`.',
        'Compare `canary["p95_ms"] > baseline["p95_ms"] * 1.25`.',
        'Compare `abs(canary["refusal_rate"] - baseline["refusal_rate"]) > 0.08`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-4-3',
      difficulty: 'debug',
      requires: ['model-data-versioning', 'data-concept-drift'],
      title: 'Lab 7.4.3 (Debug Buggy Code): Fix Concept Drift Window & Mutable Registry Hash Bug',
      prompt:
        'A broken MLOps registry script has TWO bugs: 1) `check_concept_drift(baseline_acc, recent_outcomes, max_drop=0.05)` checks `len(recent_outcomes)` against `max_drop` or ignores empty outcome lists AND flips the sign (`recent_acc - baseline_acc > max_drop` instead of `baseline_acc - recent_acc > max_drop`!). 2) `make_artifact_tag(model_name, schema_text, dataset_rows)` fails to hash `schema_text` deterministically with `hashlib.sha256` (uses Python randomized `hash()` which changes across process restarts!). Fix both functions.',
      starterCode: `import hashlib

def check_concept_drift(baseline_acc: float, recent_outcomes: list[bool], max_drop: float = 0.05) -> bool:
    # Bug 1: crashes on empty recent_outcomes and has flipped subtraction sign!
    recent_acc = sum(recent_outcomes) / len(recent_outcomes)
    return (recent_acc - baseline_acc) > max_drop

def make_artifact_tag(model_name: str, schema_text: str) -> str:
    # Bug 2: Python built-in hash() is randomized per run via PYTHONHASHSEED!
    return f"{model_name}-{abs(hash(schema_text)) % 100000}"`,
      testCode: `assert check_concept_drift(0.90, [], max_drop=0.05) is False
assert check_concept_drift(0.90, [True]*9 + [False], max_drop=0.05) is False
assert check_concept_drift(0.90, [True]*7 + [False]*3, max_drop=0.05) is True, "Accuracy dropped 0.90 -> 0.70 must alert!"

import hashlib
t1 = make_artifact_tag("churn-xgb", "cols:a,b,c")
exp_hex = hashlib.sha256(b"cols:a,b,c").hexdigest()[:8]
assert t1 == f"churn-xgb-{exp_hex}", f"Expected deterministic sha256 tag churn-xgb-{exp_hex}, got {t1}"
print("PASS: Lab 7.4.3 Concept drift detector & deterministic artifact hash fixed!")`,
      solutionCode: `import hashlib

def check_concept_drift(baseline_acc: float, recent_outcomes: list[bool], max_drop: float = 0.05) -> bool:
    if not recent_outcomes:
        return False
    recent_acc = sum(recent_outcomes) / len(recent_outcomes)
    return (baseline_acc - recent_acc) > max_drop

def make_artifact_tag(model_name: str, schema_text: str) -> str:
    digest = hashlib.sha256(schema_text.encode("utf-8")).hexdigest()[:8]
    return f"{model_name}-{digest}"`,
      hint: 'Return `False` on empty `recent_outcomes`, test `(baseline_acc - recent_acc) > max_drop`, and hash `schema_text.encode("utf-8")` with `hashlib.sha256(...).hexdigest()[:8]`.',
      hints: [
        'Guard `if not recent_outcomes: return False` to prevent division by zero.',
        'Concept drift drops accuracy *below* baseline: `(baseline_acc - recent_acc) > max_drop`.',
        'Replace Python randomized `hash()` with `hashlib.sha256(schema_text.encode("utf-8")).hexdigest()[:8]`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q7-4-1',
      type: 'multiple-choice',
      question: 'Your fraud model’s training data had 10% international orders, and after launching in Europe, international orders jump to 55% while regional fraud rates stay identical. What is this?',
      options: [
        'Data / Covariate Drift ($P(X)$ input distribution shifted)',
        'Concept Drift ($P(Y \\mid X)$ relationship flipped globally)',
        'SQL Injection inside retrieval filters',
        'Exploding gradient overflow during AdamW weight decay',
      ],
      correctIndex: 0,
      explanation: 'The input feature distribution $P(X)$ shifted significantly (detected immediately via PSI/KS even before labels arrive).',
    },
    {
      id: 'q7-4-2',
      type: 'multiple-choice',
      question: 'A sudden economic recession causes users with the exact same credit score and income as last year to default at 3× the historical rate. What is this?',
      options: [
        'Covariate Drift detectable immediately via input `PSI` checks alone',
        'Concept Drift ($P(Y \\mid X)$ mapping from features to target shifted)',
        'Missing Completely At Random (`MCAR`) column corruption',
        'Byte-Pair over-tokenization inside multilingual embeddings',
      ],
      correctIndex: 1,
      explanation: 'Because $P(X)$ looks normal while $P(Y \\mid X)$ shifted, delayed ground-truth monitoring and proxy tracking are essential.',
    },
    {
      id: 'q7-4-3',
      type: 'multiple-choice',
      question: 'In Population Stability Index (`PSI`) monitoring, what does `PSI > 0.25` indicate?',
      options: [
        'Normal random batch variance requiring zero operational follow-up',
        'Significant feature shift requiring immediate investigation or retraining',
        'Automatic instruction to delete historical baseline metrics tables immediately',
        'A syntax signal to cast model parameters from `BF16` up to `FP64`',
      ],
      correctIndex: 1,
      explanation: 'Standard PSI thresholds: `< 0.1` steady, `0.1–0.25` moderate shift (monitor), `> 0.25` major distribution shift requiring action.',
    },
    {
      id: 'q7-4-4',
      type: 'spot-bug',
      code: `for q, p in zip(base_bins, live_bins):
    psi += (p - q) * math.log(p / q)`,
      question: 'Why does this PSI loop occasionally crash in live production pipelines?',
      options: [
        '`math.log` refuses negative values whenever `p < q` across normal bins',
        'If any live or baseline bin equals `0.0`, `p / q` or `math.log(0)` crashes',
        '`zip()` silently truncates floating-point numbers to integer bins',
        'Python forbids adding floats inside `+=` loops without NumPy',
      ],
      correctIndex: 1,
      explanation: 'Empty bins (`0.0`) trigger `ZeroDivisionError` (`p / 0`) or `ValueError: math domain error` (`log(0)`). Clamp both `p` and `q` with `max(..., 1e-6)` first.',
    },
    {
      id: 'q7-4-5',
      type: 'multi-select',
      question: 'Which TWO practices make model deployments recoverable within seconds if accuracy or errors regress?',
      options: [
        'Storing immutable versioned model, prompt, and dataset hashes rather than overwriting `latest` in place',
        'Running Shadow mode first, then progressive Canary traffic splits backed by automated rollback triggers',
        'Auto-retraining nightly directly onto production without CI evals or schema bounds checks',
        'Disabling error logging during canary rollouts so CPU stays dedicated to inference',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Immutable versioned artifacts plus Shadow/Canary progressive rollouts enable instant zero-guesswork rollback.',
    },
    {
      id: 'q7-4-6',
      type: 'predict-output',
      code: `canary_err = 0.018
limit = 0.010
print("rollback" if canary_err > limit else "promote")`,
      question: 'What action does the canary gate output?',
      options: [
        '`"promote"`',
        '`"shadow"`',
        '`"monitor"`',
        '`"rollback"`',
      ],
      correctIndex: 3,
      explanation: 'Since `0.018 > 0.010`, the gate prints `"rollback"` immediately.',
    },
    {
      id: 'q7-4-7',
      type: 'ordering',
      question: 'Order the disciplined Incident Response steps when a newly deployed AI update breaks live users:',
      options: [],
      items: [
        'Trigger immediate rollback to the previous verified immutable version',
        'Verify live latency, error rate, and refusal dashboards return green',
        'Inspect correlated traces and diff data/prompt/model version hashes',
        'Add sanitized failing case to golden CI evals to prevent recurrence',
      ],
      correctIndex: 0,
      explanation: 'Restore user availability first via rollback -> confirm recovery -> diagnose via traces/diffs -> harden golden CI tests.',
    },
    {
      id: 'q7-4-8',
      type: 'numeric',
      question: 'Baseline training accuracy was `0.92` and live delayed ground-truth accuracy drops to `0.81`. What is the magnitude of the accuracy drop (`baseline - live`, as a decimal)?',
      options: [],
      correctIndex: 0,
      correctNumber: 0.11,
      tolerance: 0.005,
      explanation: '`0.92 - 0.81 = 0.11` (`11` percentage points drop), signaling urgent concept/pipeline drift investigation.',
    },
    {
      id: 'q7-4-9',
      type: 'multiple-choice',
      question: 'How does **Shadow Deployment** reduce launch risk compared to jumping straight to a 10% user Canary?',
      options: [
        'Shadow mode sends candidate responses straight to users with a 50% disclaimer banner',
        'Shadow mode mirrors real requests asynchronously without exposing users to untested predictions',
        'Shadow mode permanently disables all database reads so models hallucinate cleanly',
        'Shadow mode trains LoRA adapters on live production feedback automatically overnight',
      ],
      correctIndex: 1,
      explanation: 'Shadow mode lets teams measure real latency, exception rates, and output distributions on live production traffic with zero user blast radius.',
    },
  ],
};
