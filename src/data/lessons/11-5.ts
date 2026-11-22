import type { Lesson } from '@/types/course';

export const lesson11_5: Lesson = {
  id: '11-5',
  moduleId: 'mod-11',
  number: '11.5',
  title: 'Engineering Judgment: Ambiguous PRDs, Build-vs-Buy, ADRs & PR Reviews',
  subtitle: 'Translate vague executive wishes into measurable AI PRDs, score build-vs-buy economics honestly, write Architecture Decision Records (ADRs), and mentor via high-leverage code reviews.',
  durationMinutes: 80,
  track: 'ai-eng',
  prerequisites: ['8.3', '11.2', '11.4'],
  requires: ['ci-regression-gates', 'ai-slos-error-budgets', 'agent-trajectory-evals'],
  teaches: ['ai-prd-scoping', 'build-vs-buy-adr', 'senior-pr-review-postmortem'],
  competencies: ['mid-incidents-design', 'sr-sys-architecture', 'sr-leadership-ops'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Convert ambiguous stakeholder requests ("Add AI to search by next quarter") into crisp PRDs with baseline metrics, target eval thresholds, failure behaviors, and ROI ceilings.',
    'Evaluate Build-vs-Buy-vs-Managed-Platform choices cleanly across engineering hours, lock-in, privacy, and 12-month Total Cost of Ownership (TCO).',
    'Write concise **Architecture Decision Records (ADRs)** capturing Context, Decision, Rejected Alternatives, and Explicit Consequences.',
    'Deliver constructive, high-signal Senior PR reviews and lead blameless incident postmortems producing durable systemic gates.',
  ],
  checkWithoutNotes: [
    'What five essential sections prevent an ambiguous AI PRD from turning into an endless science project?',
    'Give an example where buying or using a managed SaaS API beats building a custom fine-tuned model in-house.',
    'List the four standard headings of a crisp 1-page Architecture Decision Record (ADR).',
    'How does a blameless postmortem turn a 2 AM outage into lasting organizational reliability?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Engineering Judgment Separates Mid from Senior Impact',
      paragraphs: [
        'Junior and early-Mid engineers optimize how fast they implement a clear ticket. Above that bar, the bottleneck shifts upstream: stakeholders bring vague wishes ("Can we add an AI copilot that fixes customer billing tickets automatically?"), vendors pitch magic wrappers, and multiple teams propose conflicting architectures.',
        'Senior AI engineering is disproportionately about **avoiding expensive wrong turns before writing line one of Python**. Saying "first clarify what failure mode we tolerate, measure the non-AI baseline, and compute 12-month TCO" saves quarters of wasted engineering effort.',
        'The mental model is a commercial structural architect reviewing blueprints ahead of pouring concrete. Changing a load-bearing wall on paper costs five minutes; jackhammering cured concrete costs months.',
      ],
    },
    {
      type: 'prose',
      heading: 'Scoping PRDs, Build-vs-Buy TCO & Writing ADRs',
      paragraphs: [
        'Before committing sprint capacity to an AI PRD, lock five anchors in writing: (1) **Non-AI / Simple Baseline** (can SQL or BM25 fix 70% today?), (2) **Quantified Offline & Online Metrics** (Recall@5 >= 0.88, citation validity 100%, containment lift), (3) **Explicit Abstention & Escalation UX** when uncertain, (4) **Hard Unit-Cost & Latency Ceiling** (e.g., `<= $0.004/turn`, `p95 <= 800ms`), and (5) **Kill Criteria** if the 2-week pilot fails threshold.',
        'When scoring **Build vs Buy**, include total engineering maintenance hours honestly—a "free" open-source self-hosted setup requiring 25% of two senior engineers per year for GPU scaling, evaluation maintenance, and security patching costs far more than a $1,200/month managed platform API unless massive sustained scale or strict VPC compliance flips the math.',
        'Document irreversible or costly pivots in a 1-page **Architecture Decision Record (ADR)** stored right inside `/docs/adr/` in Git: `Context -> Options Considered -> Decision -> Consequences & Revisit Triggers`. Future teammates understand WHY you chose Postgres `pgvector` over a separate vector SaaS without repeating six weeks of debate.',
      ],
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: The Custom Fine-Tune That Shipped Months Late',
      paragraphs: [
        'A team received a vague mandate to "build proprietary customer-support AI" and immediately spent four months labeling 50,000 chats and provisioning multi-GPU fine-tuning infrastructure before building a golden eval or checking out-of-the-box RAG.',
        'When tested finally against live traffic, pure Hybrid RAG over the clean help-center docs with a Small-Fast + Frontier cascade beat their custom fine-tune by +14% accuracy (because policy rules changed weekly while fine-tuned weights stayed frozen). Scoping a 2-week baseline PRD + ADR first would have shipped better accuracy four months earlier.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Build vs Managed API vs SaaS Vendor',
      headers: ['Option', 'Upfront Speed', '12-Month Engineering Ops Cost', 'Revisit / Pivot Trigger'],
      rows: [
        ['Hosted API + Custom Core Logic', 'Fast (days–weeks)', 'Low infra ops; full control over RAG/evals', 'Strict air-gap compliance or >100M req/mo spend'],
        ['Managed Cloud (Bedrock/Vertex)', 'Fast (weeks)', 'Low ops + IAM/VPC native security', 'Needs custom model architecture absent in catalog'],
        ['Self-Hosted Open Weights (vLLM)', 'Slow (months)', 'High (GPU autoscaling, CUDA, on-call)', 'Sustained >60% GPU saturation or sovereign data rule'],
        ['Turnkey SaaS Point Tool', 'Immediate', 'Near zero ops, high lock-in / rigid UX', 'Core differentiator requires custom data/tools'],
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-11-5-tco',
      title: 'Lab 11.5a: 12-Month Build-vs-Buy TCO Calculator',
      prompt: 'Implement `compare_tco_12m(monthly_api_usd, api_eng_hours, self_host_gpu_monthly_usd, self_host_eng_hours, eng_hourly_rate=100.0) -> dict`: compute 12-month total cost (`12 * monthly + eng_hours * eng_hourly_rate`) for both `"managed_api"` and `"self_hosted"`, and recommend the lower-TCO option along with `savings_usd`.',
      difficulty: 'guided',
      starterCode: `def compare_tco_12m(
    monthly_api_usd: float,
    api_eng_hours: float,
    self_host_gpu_monthly_usd: float,
    self_host_eng_hours: float,
    eng_hourly_rate: float = 100.0,
) -> dict:
    # Compare 12-month infra + engineering maintenance TCO honestly
    return {}`,
      testCode: `res = compare_tco_12m(1500.0, 60.0, 900.0, 400.0, eng_hourly_rate=100.0)
assert res["managed_api_usd"] == 24000.0
assert res["self_hosted_usd"] == 50800.0
assert res["winner"] == "managed_api" and res["savings_usd"] == 26800.0
print("PASS: Lab 11.5a 12-month TCO calculator verified!")`,
      solutionCode: `def compare_tco_12m(
    monthly_api_usd: float,
    api_eng_hours: float,
    self_host_gpu_monthly_usd: float,
    self_host_eng_hours: float,
    eng_hourly_rate: float = 100.0,
) -> dict:
    api_tco = round(12.0 * monthly_api_usd + api_eng_hours * eng_hourly_rate, 2)
    self_tco = round(12.0 * self_host_gpu_monthly_usd + self_host_eng_hours * eng_hourly_rate, 2)
    winner = "managed_api" if api_tco <= self_tco else "self_hosted"
    return {
        "managed_api_usd": api_tco,
        "self_hosted_usd": self_tco,
        "winner": winner,
        "savings_usd": round(abs(self_tco - api_tco), 2),
    }`,
      hint: 'Include engineering hours * hourly rate alongside 12 * monthly compute/API spend—people time dominates early!',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-5-prd',
      title: 'Lab 11.5b: AI PRD Pre-Flight Readiness Linter',
      prompt: 'Implement `lint_ai_prd(prd: dict) -> tuple[bool, list[str]]`: verify `baseline_metric` (non-empty str), `target_threshold` (non-empty str), `max_cost_per_req_usd` (`0 < x <= 1.0`), `p95_latency_budget_ms` (`100 <= x <= 10000`), and `fallback_on_failure` (non-empty str). Return `(len(missing) == 0, missing)`.',
      difficulty: 'spec',
      starterCode: `def lint_ai_prd(prd: dict) -> tuple[bool, list[str]]:
    # Reject underspecified AI PRDs missing baseline, target, cost cap, latency budget, or fallback
    return False, ["unimplemented"]`,
      testCode: `good = {
    "baseline_metric": "BM25 Recall@5=0.71",
    "target_threshold": "Hybrid Recall@5>=0.88",
    "max_cost_per_req_usd": 0.004,
    "p95_latency_budget_ms": 800,
    "fallback_on_failure": "Return ranked FAQ links",
}
assert lint_ai_prd(good) == (True, [])
bad = {**good, "fallback_on_failure": "", "max_cost_per_req_usd": 0}
ok, miss = lint_ai_prd(bad)
assert ok is False and set(miss) == {"fallback_on_failure", "max_cost_per_req_usd"}
print("PASS: Lab 11.5b AI PRD readiness linter verified!")`,
      solutionCode: `def lint_ai_prd(prd: dict) -> tuple[bool, list[str]]:
    missing = []
    if not str(prd.get("baseline_metric", "")).strip():
        missing.append("baseline_metric")
    if not str(prd.get("target_threshold", "")).strip():
        missing.append("target_threshold")
    cost = float(prd.get("max_cost_per_req_usd", 0.0))
    if not (0.0 < cost <= 1.0):
        missing.append("max_cost_per_req_usd")
    lat = float(prd.get("p95_latency_budget_ms", 0.0))
    if not (100.0 <= lat <= 10000.0):
        missing.append("p95_latency_budget_ms")
    if not str(prd.get("fallback_on_failure", "")).strip():
        missing.append("fallback_on_failure")
    return len(missing) == 0, missing`,
      hint: 'Check stripped string emptiness and numeric ranges `(0, 1.0]` and `[100, 10000]`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-5-postmortem',
      title: 'Lab 11.5c: Blameless Postmortem Completeness Gate (Debug)',
      prompt: 'Fix `check_postmortem_quality(pm: dict) -> tuple[bool, list[str]]` which currently accepts postmortems blaming individual engineers (`blames_person=True`) and forgets to require at least one automated prevention gate (`ci_gate` or `alert`)!',
      difficulty: 'debug',
      starterCode: `def check_postmortem_quality(pm: dict) -> tuple[bool, list[str]]:
    # BUG: allows person-blaming and skips systemic prevention check!
    if pm.get("root_cause"):
        return True, []
    return False, ["missing_root_cause"]`,
      testCode: `good = {"root_cause": "Missing tenant_id in cache key", "blames_person": False, "systemic_action": "Add cross-tenant cache CI test"}
assert check_postmortem_quality(good) == (True, [])
bad = {"root_cause": "Dave merged late", "blames_person": True, "systemic_action": ""}
ok, issues = check_postmortem_quality(bad)
assert ok is False and "blameless_violation" in issues and "missing_systemic_action" in issues
print("PASS: Lab 11.5c blameless postmortem verifier verified!")`,
      solutionCode: `def check_postmortem_quality(pm: dict) -> tuple[bool, list[str]]:
    issues = []
    if not str(pm.get("root_cause", "")).strip():
        issues.append("missing_root_cause")
    if pm.get("blames_person") is True:
        issues.append("blameless_violation")
    if not str(pm.get("systemic_action", "")).strip():
        issues.append("missing_systemic_action")
    return len(issues) == 0, issues`,
      hint: 'Flag `blames_person is True` as `"blameless_violation"` and verify non-empty `systemic_action`.',
    },
    {
      type: 'prose',
      heading: 'Worked Guide: Reviewing AI PRs & Running Blameless Postmortems',
      paragraphs: [
        'High-bar Senior PR reviews focus on system boundaries rather than trivial variable renames. Review every AI pull request across four ordered checkpoints: (1) **Security & Isolation** — are `tenant_id` filters enforced inside vector/SQL queries before ranking, and do untrusted strings stay strictly inside XML delimiters? (2) **Cost & Failure Bounds** — are timeouts, max retries, step caps, and USD budget circuit breakers enforced in code? (3) **Evaluations & Tests** — did the author include deterministic offline tests plus updated golden cases? (4) **Rollback Safety** — can the change toggle off via config or revert in under two minutes without corrupting state?',
        'When leading a postmortem after an outage, ban blaming individuals ("Engineer X forgot to check"). Human forgetfulness is ALWAYS a symptom of missing automation. Ask instead: "Which missing CI check, type bound, pre-commit secret scanner, or canary metric allowed this defect into production?" Close every incident review with at most three concrete engineering action items with named owners and deadlines so reliability compounds monotonically over time.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked End-to-End Example: Writing a 1-Page Vector-Database ADR',
      paragraphs: [
        'Trace how a Senior engineer writes an Architecture Decision Record (`ADR-014`) settling a heated team debate over adopting a dedicated managed vector database SaaS versus adding `pgvector` inside the existing PostgreSQL cluster. **Context**: 1.2M support chunks across 3,000 B2B tenants requiring ACID deletions and strict RBAC joins, with two backend engineers maintaining infra.',
        '**Options Evaluated**: (A) Dedicated Vector SaaS adds network sync lag and duplicate billing/security procurement; (B) Existing Postgres `pgvector` HNSW holds all chunks alongside relational `tenant_id` tables under one ACID backup policy and costs zero extra vendor procurement. **Decision & Revisit Trigger**: Ship `pgvector` with scalar quantization (`halfvec`), documenting that we only revisit sharded vector clusters if corpus growth crosses 25M active chunks or p95 filtered scan latency breaches `60ms`.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'Scope every AI PRD around a measured baseline, target golden metric, unit cost/latency cap, and graceful fallback before building.',
        'Include engineering hours honestly in Build-vs-Buy TCO calculations—managed APIs routinely beat premature self-hosting early.',
        'Record irreversible tradeoffs in Git-committed ADRs and convert incidents into blameless, CI-enforced systemic gates.',
        'Document explicit quantitative revisit triggers inside every ADR (`scale > 25M chunks`, `p95 > 60ms`, `spend > $10k/mo`) so teams pivot intentionally on measured data rather than hype.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q11-5-1',
      question: 'Why establish a non-AI or simple retrieval baseline BEFORE implementing a multi-step agent PRD?',
      options: [
        'Tests whether LLM latency and cost truly beat simpler rules',
        'FastAPI refuses web routes whenever SQL baseline tables are missing cleanly',
        'OpenAPI JSON schemas require percentage baseline fields inside route docstrings',
        'Baseline metrics automatically force vector embeddings into normalized unit length',
      ],
      correctIndex: 0,
      explanation: 'A measured baseline proves genuine value and avoids shipping slower, pricier complexity that underperforms simple heuristics.',
    },
    {
      id: 'q11-5-2',
      question: 'Why does naive "self-hosting open weights saves cloud bills" arithmetic frequently mislead teams at low traffic?',
      options: [
        'Self-hosted open-weight models disallow multi-byte UTF-8 punctuation tokenization',
        'Fixed GPUs and engineering ops hours outcost modest API bills',
        'Docker Compose stacks automatically double Python process memory footprints cleanly',
        'Managed cloud platforms prevent running automated offline regression CI checks',
      ],
      correctIndex: 1,
      explanation: 'Engineering maintenance hours and 24/7 idle GPUs make early self-hosting far costlier than pay-per-token APIs.',
    },
    {
      id: 'q11-5-3',
      type: 'predict-output',
      question: 'What does `lint_ai_prd` catch when a stakeholder PRD states `"Build AI search; launch when it feels smart"`?',
      code: `ok, missing = lint_ai_prd({"baseline_metric": "", "target_threshold": "", ...})`,
      options: [
        'Passes cleanly as a fast agile hackathon MVP specification',
        'Concludes the PRD is ready only for Terraform GPU deployment',
        'Flags missing baseline, target, cost cap, latency, and fallback',
        'Strips optional Python runtime type annotations from source files',
      ],
      correctIndex: 2,
      explanation: 'Success metrics, cost/latency budgets, and degraded-mode fallbacks must be explicit before coding.',
    },
    {
      id: 'q11-5-4',
      type: 'spot-bug',
      question: 'Spot the anti-pattern in a postmortem concluding `"Engineer X was careless—remind team to double-check deploys manually."`',
      options: [
        'The summary omitted a Slack link or screenshot inside the Jira incident ticket',
        'The document uses plain Markdown bullets instead of nested JSON spans',
        'The header skipped noting local frontend developer dark-mode CSS preferences',
        'Blaming humans leaves the missing CI gate exposed for next time',
      ],
      correctIndex: 3,
      explanation: 'Blameless postmortems fix systemic gaps (automated CI gates, canary rollbacks, strict defaults).',
    },
    {
      id: 'q11-5-5',
      type: 'multi-select',
      question: 'Which sections belong in a durable Architecture Decision Record (ADR)?',
      options: [
        'Context & problem constraints',
        'Alternatives seriously evaluated and rejected',
        'Final decision & trade-offs/consequences',
        'Unredacted personal production API keys',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 2],
      explanation: 'ADRs capture context, rejected alternatives, final choice, and revisit triggers cleanly in Git.',
    },
    {
      id: 'q11-5-6',
      type: 'ordering',
      question: 'Order a high-leverage Senior code/architecture review sequence cleanly:',
      options: [],
      items: [
        'Verify security/tenant boundaries & failure handling first',
        'Check eval coverage, latency/cost bounds & rollback safety',
        'Evaluate module cohesion & clarity before micro-style nits',
        'Leave actionable feedback citing exact alternatives & rationale',
      ],
      correctIndex: 0,
      explanation: 'Prioritize correctness, security boundaries, and operability ahead of formatting nits.',
    },
    {
      id: 'q11-5-7',
      type: 'numeric',
      question: 'If managed API billing is $500/mo ($6,000/yr) + $4,000 eng setup = $10,000, while self-hosting costs $400/mo ($4,800/yr) + $25,000 ops time = $29,800, how many USD does managed API save in Year 1?',
      options: [],
      correctIndex: 0,
      correctNumber: 19800,
      tolerance: 1,
      unit: 'USD',
      explanation: '$29,800 - $10,000 = $19,800 saved by choosing managed API in Year 1.',
    },
    {
      id: 'q11-5-8',
      question: 'When should a team consider fine-tuning model weights rather than improving RAG retrieval or prompts?',
      options: [
        'Whenever knowledge facts update weekly inside company Notion documentation pages',
        'After strong RAG baselines show style, latency, or format still lags',
        'Ahead of building a fifty-case golden regression evaluation benchmark cleanly',
        'Immediately whenever executives request bespoke custom proprietary AI weights',
      ],
      correctIndex: 1,
      explanation: 'Always earn fine-tuning after validating RAG + structured prompting on a clean golden benchmark.',
    },
  ],
};
