import type { Lesson } from '@/types/course';

export const lesson3_5: Lesson = {
  id: '3-5',
  moduleId: 'mod-3',
  number: '3.5',
  title: 'When NOT to Use ML: Rules, Heuristics, Baselines & ROI Decisions',
  subtitle: 'Know when deterministic code, regex, SQL lookups, and simple heuristics beat complex models on latency, auditability, cost, and long-term reliability.',
  durationMinutes: 65,
  track: 'ds',
  prerequisites: ['3.4'],
  requires: ['threshold-cost-roi', 'error-analysis-tracking'],
  teaches: [
    'when-not-to-use-ml',
    'heuristic-baselines',
    'ml-engineering-roi',
  ],
  objectives: [
    'Build a zero-ML baseline (SQL lookup, regex, or weighted heuristic score) before touching scikit-learn or neural nets.',
    'Recognize the five red flags where deterministic software engineering outperforms machine learning completely.',
    'Calculate full-lifecycle ML ROI comparing incremental business gain against training, serving, monitoring, and maintenance costs.',
    'Design hybrid rules-first + ML-second routers so hard policy constraints never rely on probabilistic guesswork.',
  ],
  checkWithoutNotes: [
    'Name three problem domains where hard deterministic rules (`if / else`, SQL constraints, tax tables) strictly outperform machine learning.',
    'Why must every ML project establish a simple non-ML heuristic baseline first before evaluating complex classifiers?',
    'Suppose a churn model lifts annual retained profit by \\$12,000 over a 10-line SQL rule, yet costs \\$30,000 per year in data pipelines and on-call maintenance. Should you ship the ML model?',
    'In a hybrid fraud router, why should deterministic blocklists and legal eligibility rules run BEFORE the ML risk score?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Senior AI Engineers Say "No" to Machine Learning Half the Time',
      paragraphs: [
        'Inexperienced engineers treat machine learning like a magic hammer and treat every business problem like a nail. Someone asks to route refunds, verify tax brackets, detect broken JSON payloads, or score basic customer tiers—and instead of writing twenty lines of readable Python or SQL, a junior engineer spins up an embedding pipeline, training jobs, drift monitors, and container orchestration.',
        'Every deployed ML model incurs silent compounding technical debt: training pipelines break silently when upstream schemas shift, distributions drift after marketing promotions, probability thresholds go stale, and debugging why one VIP customer got rejected at 2 AM takes hours instead of reading a single clear `if` statement. Senior AI engineers earn trust precisely because they know when NOT to reach for ML—and because whenever they DO ship ML, they prove empirically that it beats a fast deterministic baseline by enough margin to pay for its own upkeep.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Thermostat Circuit vs Neural Weather Forecast',
      frontendConcept: 'Replacing a clean deterministic input validator (`email.includes("@")` / JSON Schema) with a probabilistic language classifier',
      aiConcept: 'Zero-ML Baselines, Deterministic Policy Firewalls & Incremental ROI',
      explanation:
        'You do not install an AI weather supercomputer inside a kitchen oven just to turn the heating coil off at 200 degrees—a five-dollar mechanical thermostat handles exact thresholds with zero maintenance and 100% auditability. Reserve probabilistic ML strictly for fuzzy, high-dimensional patterns (`fraud behavior`, `semantic retrieval`, `churn propensity`) where fixed human rules fail to generalize cleanly.',
    },
    {
      type: 'table',
      title: 'Five Red Flags: Deterministic Code vs Machine Learning',
      headers: ['Signal / Condition', 'Prefer Deterministic Rules / SQL', 'Reach for ML Only When...'],
      rows: [
        ['**1. Exact legal, tax, or business policy**', 'Age verification, VAT brackets, contract eligibility (`if plan == "free"`)', 'Never train ML to approximate an exact deterministic formula already known on paper'],
        ['**2. Tiny labeled sample size (`n < 200`)**', 'Domain-expert weighted point score (`risk = 2*failed_logins + 1*new_device`)', 'You have hundreds+ clean verified outcomes or strong zero-shot/pretrained transfer signal'],
        ['**3. Hard auditability & zero error tolerance**', 'Compliance blocklists, banking ledger arithmetic, safety interlocks', 'Model acts as a decision-support scorer backed by strict rule guardrails and human review'],
        ['**4. Unstable or unmeasurable ground truth**', 'Wait until product logging records honest outcomes (`30-day return`, `human resolution`)', 'Labels stay consistently defined across at least several seasonal/weekly cycles'],
        ['**5. Marginal lift fails engineering ROI**', 'Simple SQL query recovers 92% of value in 1 day with near-zero maintenance', 'Incremental lift over heuristic cleanly covers infra, monitoring, and retraining cost'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Always Benchmark a Zero-ML Baseline First',
      paragraphs: [
        'Imagine your company wants to identify inactive accounts likely to churn within 30 days so customer success can reach out. Before installing LightGBM, write a 5-line SQL or Python heuristic baseline: "Flag any account with `days_since_last_login >= 14` OR `open_unresolved_tickets >= 2`." Evaluate that dead-simple rule on the exact same held-out chronological validation split using identical Precision, Recall, and Net Profit metrics.',
        'Two remarkable outcomes happen routinely when you measure the heuristic first. Often the heuristic already catches `75%` of real churn at decent precision in half an afternoon—letting the team ship immediate business value on Day 1 while collecting cleaner feedback logs! Conversely, if an ML model later scores `0.81` PR-AUC against the heuristic’s `0.62`, you hold undeniable quantitative proof showing stakeholders exact incremental dollar lift before asking for cloud compute and monitoring headcount.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Full-Lifecycle ML ROI Calculation by Hand',
      paragraphs: [
        'Never confuse model metric gain (`+3% AUC`) with positive engineering return on investment (ROI). Walk through a concrete annual arithmetic check before writing production deployment tickets. Suppose your existing 15-line deterministic heuristic prevents `\\$120,000` per year in payment disputes at virtually `\\$1,000` annual upkeep cost (net `\\$119,000`).',
        'A candidate Gradient Boosted model boosts caught fraud on validation by `+\\$28,000` per year gross (`\\$148,000` prevented). However, look at the true Total Cost of Ownership (TCO) of running live ML: feature warehouse sync jobs (`\\$4,800/yr` cloud compute), prediction API hosting and latency cache (`\\$3,600/yr`), drift alerts plus quarterly retraining engineer hours (`120 hours * \\$100/hr = \\$12,000/yr`), and label review ops (`\\$2,600/yr`). Total ML annual cost is `\\$4,800 + \\$3,600 + \\$12,000 + \\$2,600 = \\$23,000`. Comparing **incremental ML gross gain** (`+\\$28,000`) against **incremental ML cost** (`\\$23,000 - \\$1,000 = +\\$22,000`) leaves only `+$6,000/yr` fragile net profit—far too thin if one seasonal shift wipes out half that lift! By contrast, at `10x` transaction volume (`+\\$280,000` incremental gain against the same `\\$22,000` infra cost), shipping ML yields `+\\$258,000` net annual ROI and becomes an obvious win.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 3: Hybrid Rules-First + ML-Second Architecture',
      language: 'python',
      code: `def route_payment(tx: dict, ml_score: float) -> str:
    """Layer 1: Exact policy rules run BEFORE probabilistic ML."""
    # Deterministic hard policy (never delegate legal/sanctions checks to ML!)
    if tx.get("sanctioned_country") or tx.get("amount", 0) <= 0:
        return "BLOCK_POLICY"
    if tx.get("verified_enterprise_allowlist") and tx.get("amount", 0) < 5000:
        return "ALLOW_TRUSTED"

    # Layer 2: Fuzzy gray zone -> let calibrated ML probability + threshold decide
    if ml_score >= 0.35:
        return "REVIEW_ML"
    return "ALLOW_ML"

print(route_payment({"sanctioned_country": True, "amount": 50}, ml_score=0.01))   # BLOCK_POLICY
print(route_payment({"sanctioned_country": False, "amount": 900}, ml_score=0.42)) # REVIEW_ML`,
      caption: 'Deterministic policy rules act as an unambiguous Layer-1 firewall, confining ML strictly to the ambiguous middle zone.',
    },
    {
      type: 'prose',
      heading: 'Common Decision & Scoping Mistakes & How to Debug Them',
      paragraphs: [
        '1) Training a classifier to predict deterministic formulas (discount pricing rules, eligibility cutoffs, regex formatting): ML approximates exact step functions fuzzily and creates embarrassing boundary bugs (`age = 17.99` passing intermittently). Keep exact specifications in pure unit-tested code.',
        '2) Comparing an ML model solely against a random `50/50` coin-flip baseline instead of the simplest domain heuristic: beating random chance proves nothing useful if a two-line `WHERE` query beats your model on cost and latency.',
        '3) Allowing ML probabilities to override explicit legal/safety allowlists or blocklists: always wrap ML decisions inside deterministic Layer-1 pre-checks and Layer-3 hard post-condition caps (`max_credit_limit`).',
        '4) Ignoring latency and fallback degradation budgets: if your checkout API has a strict `50 ms` p99 SLA and downstream feature stores time out occasionally, design a graceful fallback directly back to your deterministic heuristic rather than throwing HTTP `500` errors.',
        '5) Building custom ML models from scratch before checking "Buy vs Config vs Heuristic" economics: writing a custom classifier for spam filtering, receipt OCR, or language detection wastes months of engineering payroll when deterministic libraries or proven managed baselines solve the problem immediately. Spend scarce ML headcount strictly on core differentiating company problems.',
        '6) Assuming stakeholders automatically prefer complex black-box accuracy over transparent auditability: in B2B billing disputes, healthcare triage, and insurance underwriting, a customer-facing team needs exact deterministic reasons ("Rule #4 triggered: invoice older than 45 days") rather than opaque neural scores. When the precision gap between an interpretable rule table and XGBoost is small, ship the transparent rule system.',
        '7) Launching a rule-only stopgap WITHOUT instrumentation logging future outcomes: teams sometimes ship a helpful 10-line heuristic and stop logging borderline scores or actual downstream outcomes (`human_override`, `30d_churn`). If you ever intend to graduate from rules to ML later, start logging clean point-in-time feature snapshots and honest labels from Day 1—while also avoiding feedback-loop bias where blocking 100% of a slice prevents ever learning its true rate!',
        '8) Underestimating hidden labeling and human-in-the-loop review costs: an ML fraud scorer whose top-5% queue requires four full-time compliance analysts reviewing false positives costs far more in operations payroll than the model’s cloud GPU bill. Include review-queue labor explicitly inside every Total Cost of Ownership calculation.',
        '9) Failing to retire stale ML models when business processes simplify: if a product redesign eliminates the edge case a classifier originally solved, keeping orphaned retraining pipelines running wastes compute and confuses onboarding engineers. Review active model ROI quarterly and deprecate models whose incremental lift over rules no longer justifies upkeep.',
        '10) Letting an unmaintainable tangle of 400 nested `if / elif` heuristic exceptions fester indefinitely once complexity explodes: deterministic rules shine when five to twenty clear rules govern policy; the moment engineers start adding contradictory brittle patches every week (`if country == "DE" and hour > 2 and spend < 19`), you have crossed the threshold where clean statistical learning generalizes far more safely.',
        '11) Designing zero-ML cold-start heuristics with opaque magic thresholds (`score > 73.4`) nobody understands six months later: document why each weight or cutoff was chosen, keep rules in version-controlled config tables (`YAML` or SQL reference tables), and track per-rule trigger volume weekly so you spot immediately when business traffic outgrows fixed rules.',
        '12) Upgrading from a proven rule system to ML without running a **shadow comparison** first: log candidate ML predictions silently alongside live heuristic outcomes on real production traffic for one to two full weeks to verify upstream null handling, tail latency, and calibration before transferring actual customer decisions to the model.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 3.5 Recap: Pragmatic Engineering Judgment',
      body: '- Build and measure a fast zero-ML heuristic baseline before writing any ML training loop.\n- Never use probabilistic ML for exact legal, mathematical, or policy rules already expressible cleanly in code.\n- Justify ML deployment using incremental net ROI (gross gain minus infra, monitoring, and retraining labor).\n- Wrap ML models inside deterministic Layer-1 policy guards and fallback paths for high-reliability systems.\n- Wait for clean, consistent labels (`n >= hundreds`) before investing in supervised ML.',
    },
    {
      type: 'python-lab',
      labId: 'lab-3-5-baseline',
      difficulty: 'guided',
      requires: ['precision-recall-f1'],
      title: 'Lab 3.5A: Evaluate a Zero-ML Rule Baseline vs ML Candidate',
      prompt:
        'Implement `compare_rule_vs_ml(y_true, rule_preds, ml_probs, threshold=0.5)` returning `{"rule_recall": ..., "rule_precision": ..., "ml_recall": ..., "ml_precision": ..., "ml_wins_both": bool}` where `ml_wins_both` is `True` only when ML strictly beats or matches the rule on BOTH precision and recall (with strict gain on at least one).',
      starterCode: `import numpy as np

def _pr(y_true: np.ndarray, preds: np.ndarray):
    tp = int(np.sum((preds == 1) & (y_true == 1)))
    fp = int(np.sum((preds == 1) & (y_true == 0)))
    fn = int(np.sum((preds == 0) & (y_true == 1)))
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    return float(prec), float(rec)

def compare_rule_vs_ml(y_true, rule_preds, ml_probs, threshold: float = 0.5) -> dict:
    # Compute rule precision/recall, ML precision/recall at threshold, and ml_wins_both
    pass`,
      testCode: `import numpy as np
yt = np.array([1, 1, 1, 0, 0, 0, 0, 0])
rule = np.array([1, 1, 0, 1, 0, 0, 0, 0])       # prec=2/3=0.667, rec=2/3=0.667
ml_weak = np.array([0.8, 0.2, 0.2, 0.9, 0.1, 0.1, 0.1, 0.1])  # prec=0.5, rec=0.333 -> worse!
res1 = compare_rule_vs_ml(yt, rule, ml_weak, 0.5)
assert res1["ml_wins_both"] is False
ml_strong = np.array([0.9, 0.8, 0.7, 0.1, 0.1, 0.1, 0.1, 0.1]) # prec=1.0, rec=1.0
res2 = compare_rule_vs_ml(yt, rule, ml_strong, 0.5)
assert res2["ml_wins_both"] is True and abs(res2["ml_precision"] - 1.0) < 1e-6
print("PASS: Baseline comparison catches weak ML models that fail to beat simple heuristics!")`,
      solutionCode: `import numpy as np

def _pr(y_true: np.ndarray, preds: np.ndarray):
    tp = int(np.sum((preds == 1) & (y_true == 1)))
    fp = int(np.sum((preds == 1) & (y_true == 0)))
    fn = int(np.sum((preds == 0) & (y_true == 1)))
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    return float(prec), float(rec)

def compare_rule_vs_ml(y_true, rule_preds, ml_probs, threshold: float = 0.5) -> dict:
    yt = np.asarray(y_true, dtype=int)
    rp = np.asarray(rule_preds, dtype=int)
    mp = (np.asarray(ml_probs, dtype=float) >= threshold).astype(int)
    r_prec, r_rec = _pr(yt, rp)
    m_prec, m_rec = _pr(yt, mp)
    wins_both = (m_prec >= r_prec and m_rec >= r_rec) and (m_prec > r_prec or m_rec > r_rec)
    return {
        "rule_recall": r_rec,
        "rule_precision": r_prec,
        "ml_recall": m_rec,
        "ml_precision": m_prec,
        "ml_wins_both": bool(wins_both),
    }`,
      hint: 'Reuse `_pr(y_true, preds)` for both `rule_preds` and `(ml_probs >= threshold).astype(int)`, then compare both dimensions.',
      hints: [
        'Convert inputs with `np.asarray` and threshold `ml_probs >= threshold` into `int`.',
        'Call `r_prec, r_rec = _pr(yt, rp)` and `m_prec, m_rec = _pr(yt, mp)`.',
        'Require `m_prec >= r_prec and m_rec >= r_rec` plus at least one strict improvement (`>`).',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-5-roi',
      difficulty: 'spec',
      requires: ['threshold-cost-roi'],
      title: 'Lab 3.5B: Full-Lifecycle ML vs Heuristic Engineering ROI Gate',
      prompt:
        'Implement `decide_ml_deployment(heuristic_net_gain, ml_gross_gain, ml_infra_cost, ml_maint_hours, hourly_eng_rate, min_incremental_profit=15000.0)` that computes `ml_net = ml_gross_gain - (ml_infra_cost + ml_maint_hours * hourly_eng_rate)`, `incremental_net = ml_net - heuristic_net_gain`, and returns `("SHIP_ML", incremental_net)` if `incremental_net >= min_incremental_profit` else `("KEEP_RULES", incremental_net)`.',
      starterCode: `def decide_ml_deployment(
    heuristic_net_gain: float,
    ml_gross_gain: float,
    ml_infra_cost: float,
    ml_maint_hours: float,
    hourly_eng_rate: float,
    min_incremental_profit: float = 15000.0,
) -> tuple[str, float]:
    # Compute total ML cost, ML net gain, incremental_net vs heuristic, and return decision tuple
    pass`,
      testCode: `dec1, net1 = decide_ml_deployment(119000.0, 148000.0, 11000.0, 120.0, 100.0, min_incremental_profit=15000.0)
assert dec1 == "KEEP_RULES" and abs(net1 - 6000.0) < 1e-6, f"Low $6k margin should KEEP_RULES, got {(dec1, net1)}"
dec2, net2 = decide_ml_deployment(119000.0, 399000.0, 11000.0, 120.0, 100.0, min_incremental_profit=15000.0)
assert dec2 == "SHIP_ML" and abs(net2 - 257000.0) < 1e-6
print("PASS: Lifecycle ROI gate properly blocked fragile $6k ML lift and approved high-scale ML!")`,
      solutionCode: `def decide_ml_deployment(
    heuristic_net_gain: float,
    ml_gross_gain: float,
    ml_infra_cost: float,
    ml_maint_hours: float,
    hourly_eng_rate: float,
    min_incremental_profit: float = 15000.0,
) -> tuple[str, float]:
    total_ml_cost = float(ml_infra_cost) + float(ml_maint_hours) * float(hourly_eng_rate)
    ml_net = float(ml_gross_gain) - total_ml_cost
    incremental_net = ml_net - float(heuristic_net_gain)
    decision = "SHIP_ML" if incremental_net >= min_incremental_profit else "KEEP_RULES"
    return decision, float(incremental_net)`,
      hint: 'Compute `total_ml_cost = ml_infra_cost + ml_maint_hours * hourly_eng_rate`, subtract from `ml_gross_gain`, then subtract `heuristic_net_gain`.',
      hints: [
        'Total ML TCO is `ml_infra_cost + ml_maint_hours * hourly_eng_rate`.',
        'Incremental net profit equals `(ml_gross_gain - total_ml_cost) - heuristic_net_gain`.',
        'Return `("SHIP_ML", incremental_net)` iff `incremental_net >= min_incremental_profit`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-3-5-guard',
      difficulty: 'debug',
      requires: ['when-not-to-use-ml'],
      title: 'Lab 3.5C: Fix Broken Rules-First Fallback Router',
      prompt:
        'A naive router lets `ml_score` bypass hard sanctions compliance (`sanctioned == True`) AND crashes with HTTP 500 when `ml_score is None` (model timeout)! Fix `safe_decision_router(record, ml_score, threshold=0.4)` so: (1) if `record.get("sanctioned")` or `record.get("amount", 0) <= 0` -> return `"BLOCK_POLICY"`; (2) if `ml_score is None` (timeout fallback!) -> return `"REVIEW_RULE"` when `record.get("amount", 0) >= 1000` else `"ALLOW_FALLBACK"`; (3) otherwise return `"REVIEW_ML"` if `ml_score >= threshold` else `"ALLOW_ML"`.',
      starterCode: `def safe_decision_router(record: dict, ml_score, threshold: float = 0.4) -> str:
    # BUG 1: skips policy block checks when ml_score is tiny!
    # BUG 2: TypeError when ml_score is None during service outage!
    if ml_score >= threshold:
        return "REVIEW_ML"
    return "ALLOW_ML"`,
      testCode: `assert safe_decision_router({"sanctioned": True, "amount": 50}, 0.01) == "BLOCK_POLICY"
assert safe_decision_router({"sanctioned": False, "amount": 0}, 0.01) == "BLOCK_POLICY"
assert safe_decision_router({"sanctioned": False, "amount": 1500}, None) == "REVIEW_RULE"
assert safe_decision_router({"sanctioned": False, "amount": 200}, None) == "ALLOW_FALLBACK"
assert safe_decision_router({"sanctioned": False, "amount": 200}, 0.65) == "REVIEW_ML"
assert safe_decision_router({"sanctioned": False, "amount": 200}, 0.10) == "ALLOW_ML"
print("PASS: Deterministic policy firewall and timeout fallback protect ML inference!")`,
      solutionCode: `def safe_decision_router(record: dict, ml_score, threshold: float = 0.4) -> str:
    if record.get("sanctioned") or record.get("amount", 0) <= 0:
        return "BLOCK_POLICY"
    if ml_score is None:
        return "REVIEW_RULE" if record.get("amount", 0) >= 1000 else "ALLOW_FALLBACK"
    if float(ml_score) >= threshold:
        return "REVIEW_ML"
    return "ALLOW_ML"`,
      hint: 'Check policy constraints first, handle `if ml_score is None:` second with the amount heuristic, and evaluate `ml_score >= threshold` last.',
      hints: [
        'Run `if record.get("sanctioned") or record.get("amount", 0) <= 0: return "BLOCK_POLICY"` at line 1.',
        'Check `if ml_score is None:` before numeric `>= threshold` comparisons to prevent `TypeError`.',
        'Fallback rule returns `"REVIEW_RULE"` when `amount >= 1000` else `"ALLOW_FALLBACK"`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q3-5-1',
      type: 'multiple-choice',
      question: 'Which task is best solved with deterministic code rather than training a supervised machine learning classifier?',
      options: [
        'Predicting which active B2B customers will silently churn sixty days ahead from unstructured support transcripts',
        'Enforcing regional VAT tax brackets and minimum legal age rules',
        'Ranking top semantic document matches across two hundred thousand unstructured PDF technical manuals',
        'Forecasting noisy hourly warehouse staffing demand across shifting seasonal retail promotional calendars',
      ],
      correctIndex: 1,
      explanation: 'Tax brackets and statutory eligibility follow exact legal formulas; deterministic code guarantees 100% accuracy and auditability with zero drift or training cost.',
    },
    {
      id: 'q3-5-2',
      type: 'multiple-choice',
      question: 'Before investing two weeks tuning XGBoost on a churn table, what should an engineer evaluate first on the exact same validation split?',
      options: [
        'A 100-layer deep residual neural network trained carefully with cosine learning rate warmup schedules',
        'Unlabeled K-Means cluster assignments fitted simultaneously across combined training and test target columns',
        'A simple zero-ML domain heuristic establishing an honest floor',
        'Synthetic SMOTE oversampling accuracy evaluated exclusively on training rows without holding out validation',
      ],
      correctIndex: 2,
      explanation: 'Benchmarking a fast deterministic heuristic immediately reveals how much headroom actually exists before investing in ML pipelines and monitoring.',
    },
    {
      id: 'q3-5-3',
      type: 'numeric',
      question: 'A heuristic yields `\\$80,000` net annual gain. An ML candidate achieves `\\$110,000` gross gain but costs `\\$12,000` in cloud infra plus `150` hours at `\\$100/hr` in annual upkeep. What is the ML incremental net profit over the heuristic in dollars?',
      options: [],
      correctIndex: 0,
      correctNumber: 3000,
      tolerance: 1,
      unit: 'USD',
      explanation: 'Total ML cost `= 12,000 + 150 * 100 = 27,000`. ML net `= 110,000 - 27,000 = 83,000`. Incremental gain `= 83,000 - 80,000 = $3,000`.',
    },
    {
      id: 'q3-5-4',
      type: 'spot-bug',
      question: 'Why is the payment authorization helper below unsafe for production?',
      code: `def approve(tx, ml_risk):
    if ml_risk < 0.25:
        return "APPROVED"
    return "BLOCKED"`,
      options: [
        'Evaluating `ml_risk < 0.25` fails unless the scalar probability is wrapped inside a NumPy array beforehand',
        'Returning literal uppercase string constants instead of numeric HTTP status integers triggers Python `SyntaxError`',
        'It skips hard sanctions rules and crashes if `ml_risk` is `None`',
        'Comparing floating-point numbers directly against `0.25` skips every threshold probability below `0.10`',
      ],
      correctIndex: 2,
      explanation: 'Deterministic policy/sanctions checks must execute BEFORE probabilistic ML scores, and `None` timeouts need an explicit rule fallback.',
    },
    {
      id: 'q3-5-5',
      type: 'multi-select',
      question: 'Which two conditions strongly signal that you should defer or skip supervised ML right now?',
      options: [
        'You only hold 45 noisy historical examples and zero pretrained domain representations',
        'Upstream billing outcomes are undefined (`no clean ground-truth label exists yet`)',
        'You hold 500,000 clean labeled records and a simple SQL rule leaves 40% high-cost errors unsolved',
        'Input logs contain messy non-linear feature interactions that deterministic `if/else` trees fail to separate',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Tiny noisy datasets (`n = 45`) and missing ground-truth labels cannot support reliable supervised training; start with heuristics and clean telemetry logging first.',
    },
    {
      id: 'q3-5-6',
      type: 'predict-output',
      question: 'A team validates that an ML model raises ROC-AUC from `0.78` (simple 3-rule point heuristic) up to `0.80`, costing `\\$45,000/yr` extra infra while recovering `\\$20,000/yr` extra fraud. What is the right engineering call?',
      options: [
        'Deploy the ML model immediately because every +0.02 ROC-AUC improvement justifies permanent cloud infrastructure spend',
        'Double the training dataset size by scraping unverified public records until validation AUC reaches `0.95`',
        'Disable automated logging, drift alerts, and validation monitoring to shrink ML operating bills down to zero',
        'Keep the 3-rule heuristic (`$25k/yr` net savings, easy audits)',
      ],
      correctIndex: 3,
      explanation: 'Shipping a complex pipeline that loses `\\$25,000/yr` net over a transparent heuristic destroys business value; choose simple deterministic rules whenever ML ROI is negative.',
    },
    {
      id: 'q3-5-7',
      type: 'multiple-choice',
      question: 'Why does a production hybrid architecture run deterministic policy rules in Layer 1 BEFORE calling the ML scoring endpoint?',
      options: [
        'To enforce hard policies deterministically and skip ML compute on obvious cases',
        'Because scikit-learn classifiers throw `ValueError` whenever sanctioned country strings appear inside input dictionaries',
        'Because Layer-1 deterministic rules automatically calibrate the downstream gradient booster’s Brier score to zero',
        'Because standard Python `if` statements execute inside GPU tensor cores faster than vectorized NumPy arrays',
      ],
      correctIndex: 0,
      explanation: 'Layer-1 hard guards guarantee exact policy compliance, reduce serving load by filtering obvious cases early, and keep ML focused strictly on ambiguous cases.',
    },
    {
      id: 'q3-5-8',
      type: 'ordering',
      question: 'Order the disciplined engineering decision path for a new business automation request:',
      items: [
        'Clarify exact policy requirements and verify clean outcome labels exist',
        'Write and benchmark a fast zero-ML heuristic/SQL baseline on chronological validation data',
        'Quantify unresolved error cost still left behind by the heuristic baseline',
        'Train an ML candidate only if unresolved business value clearly exceeds TCO infra + maintenance',
        'Deploy ML inside Layer-1 policy guards with deterministic heuristic timeout fallback',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Verify requirements/labels -> benchmark rules baseline -> size remaining opportunity -> build ML iff ROI positive -> wrap with guards and fallback.',
    },
    {
      id: 'q3-5-9',
      type: 'multiple-choice',
      question: 'What is the hidden cost most junior teams underestimate when pitching a custom ML model over a heuristic?',
      options: [
        'The one-time Python `pip install scikit-learn` network bandwidth download on a developer workstation',
        'Ongoing data drift, upstream schema breaks, calibration upkeep, and on-call maintenance',
        'The recurring per-prediction licensing royalty fee charged by open-source NumPy array operations',
        'Writing one automated `pytest` assertion checking JSON response status codes in CI',
      ],
      correctIndex: 1,
      explanation: 'Training a model once is cheap; maintaining feature ETL freshness, monitoring concept drift, and responding to edge failures accounts for most lifecycle TCO.',
    },
  ],
};
