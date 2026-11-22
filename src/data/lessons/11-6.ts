import type { Lesson } from '@/types/course';
import { MODEL_CATALOG, MODEL_CATALOG_REVIEWED } from '@/data/modelCatalog';

export const lesson11_6: Lesson = {
  id: '11-6',
  moduleId: 'mod-11',
  number: '11.6',
  title: 'Model Landscape, Capability Roles & Config-Driven Selection',
  subtitle: 'Avoid brittle hardcoded model strings by designing around durable capability tiers in MODEL_CATALOG, sizing long-context & reasoning budgets, and enforcing freshness reviews.',
  durationMinutes: 70,
  track: 'ai-eng',
  prerequisites: ['5.4', '10.1', '11.5'],
  requires: ['cascading-routing', 'build-vs-buy-adr'],
  teaches: ['capability-role-catalog', 'reasoning-latency-budget', 'model-catalog-freshness'],
  competencies: ['jr-llm-client', 'mid-observability-cost', 'sr-sys-architecture'],
  lastReviewed: MODEL_CATALOG_REVIEWED,
  objectives: [
    'Decouple application business logic from volatile vendor model names using capability roles (`small-fast`, `frontier-reasoning`, `embedding`, `reranker`, `multimodal-vision`, `speech-audio`, `local-open-weights`).',
    'Inspect `MODEL_CATALOG` (`lastReviewed`) so model choices always include explicit review dates and swap paths.',
    'Budget latency and token costs when Frontier Reasoning models spend internal thinking tokens before emitting visible text.',
    'Evaluate long-context prompting honestly ("lost in the middle" degradation & quadratic prefill cost vs crisp Hybrid RAG).',
  ],
  checkWithoutNotes: [
    'Why is hardcoding provider model snapshots directly inside business logic files an anti-pattern?',
    'Name all seven capability roles tracked in our dated model catalog and match one workload to each.',
    'Why can a reasoning model produce 2,500 billed output tokens while displaying only a 150-token JSON answer to the user?',
    'When is stuffing 100k tokens into a single context window worse than retrieving top-5 chunks via Hybrid RAG?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Hardcoded Model Names Decay Faster Than Your Roadmap',
      paragraphs: [
        'Frontier AI model releases arrive every few months. Tutorials or codebases that sprinkle literal provider model versions across thirty Python modules rot almost immediately—either hitting deprecation warnings, paying obsolete 3× higher token rates, or silently missing new prompt-caching and structured-output capabilities.',
        'Production AI engineering treats concrete vendor model names strictly as **configuration values bound to durable capability roles** stored in a single dated registry (`MODEL_CATALOG`, reviewed `' + MODEL_CATALOG_REVIEWED + '`). Application code asks cleanly for `role="small-fast"` or `role="frontier-reasoning"`, while one swap in config upgrades every pipeline after CI golden evals verify zero regressions.',
        'The mental model is SQL connection pooling paired with logical database replicas (`READ_REPLICA`, `PRIMARY_WRITE`). Business features depend on the logical capability contract; operations swaps underlying hardware or model snapshots seamlessly behind CI regression gates.',
      ],
    },
    {
      type: 'table',
      title: `Capability Roles & Dated Selection Guide (Catalog Reviewed: ${MODEL_CATALOG_REVIEWED})`,
      headers: ['Role ID', 'Capability Focus', 'Use When', 'Avoid When'],
      rows: MODEL_CATALOG.map((m) => [m.roleId, m.roleLabel, m.useWhen, m.avoidWhen]),
    },
    {
      type: 'prose',
      heading: 'Reasoning Models, Long-Context Limits & Swap Readiness',
      paragraphs: [
        'Reasoning-focused models allocate hidden thinking/verification tokens ahead of writing final outputs. That internal reasoning solves hard code synthesis, multi-constraint planning, and root-cause debugging dramatically better—at a double cost: significantly higher TTFT latency AND billed output tokens covering both hidden reasoning steps and visible JSON.',
        'Similarly, massive 128k–1M context windows tempt teams into skipping RAG and dumping entire PDFs into prompts. Even when supported by the window limit, multi-needle retrieval across massive unindexed dumps still suffers degraded recall ("lost in the middle"), slow prefill TTFT, and bloated per-query cost compared to Hybrid RRF + Reranking over top-8 clean chunks.',
        'Finally, schedule explicit model-catalog freshness checks inside quarterly maintenance or CI so stale undated snapshots never linger silently past their review horizon.',
      ],
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: Unpinned Deprecation Shutdown Breaks Checkout Assistant',
      paragraphs: [
        'An e-commerce assistant hardcoded an unversioned provider model ID directly inside six separate FastAPI routes with no capability abstraction and zero golden swap tests. When the provider retired that legacy snapshot with 30-day notice missed in noisy spam folders, production chat failed with HTTP 404 errors during peak traffic.',
        'Migrating to one central capability role map backed by recorded golden eval fixtures enabled instant zero-downtime switching to a fresher Small-Fast snapshot after passing Recall, schema validity, and latency gates in ten minutes.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-11-6-roles',
      title: 'Lab 11.6a: Capability-Role Model Selector',
      prompt: 'Implement `choose_role_for_task(task: dict) -> str`: given `{"requires_offline_privacy": bool, "is_audio": bool, "is_image_scan": bool, "high_complexity_reasoning": bool, "is_rerank": bool}`, return the matching catalog role ID from `{"local-open-weights", "speech-audio", "multimodal-vision", "reranker", "frontier-reasoning", "small-fast"}` prioritizing offline privacy first, then modality, then rerank/complexity.',
      difficulty: 'guided',
      starterCode: `def choose_role_for_task(task: dict) -> str:
    # Map workload constraints cleanly to abstract MODEL_CATALOG role IDs
    return "small-fast"`,
      testCode: `assert choose_role_for_task({"requires_offline_privacy": True, "high_complexity_reasoning": True}) == "local-open-weights"
assert choose_role_for_task({"is_audio": True}) == "speech-audio"
assert choose_role_for_task({"is_image_scan": True}) == "multimodal-vision"
assert choose_role_for_task({"is_rerank": True}) == "reranker"
assert choose_role_for_task({"high_complexity_reasoning": True}) == "frontier-reasoning"
assert choose_role_for_task({}) == "small-fast"
print("PASS: Lab 11.6a capability-role router verified!")`,
      solutionCode: `def choose_role_for_task(task: dict) -> str:
    if task.get("requires_offline_privacy"):
        return "local-open-weights"
    if task.get("is_audio"):
        return "speech-audio"
    if task.get("is_image_scan"):
        return "multimodal-vision"
    if task.get("is_rerank"):
        return "reranker"
    if task.get("high_complexity_reasoning"):
        return "frontier-reasoning"
    return "small-fast"`,
      hint: 'Check `requires_offline_privacy` first, then `is_audio`, `is_image_scan`, `is_rerank`, `high_complexity_reasoning`, defaulting to `"small-fast"`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-6-reasoning',
      title: 'Lab 11.6b: Hidden Reasoning Token Cost & Latency Estimator',
      prompt: 'Implement `estimate_reasoning_call(prompt_tokens: int, thinking_tokens: int, visible_out_tokens: int, tokens_per_sec: float = 80.0, in_rate: float = 2.5, out_rate: float = 10.0) -> dict`: reasoning models bill BOTH `thinking_tokens + visible_out_tokens` at `out_rate` and delay visible output by `thinking_tokens / tokens_per_sec`. Return `total_billed_output`, `cost_usd` (6 decimals), and `ttft_delay_ms` (1 decimal).',
      difficulty: 'spec',
      starterCode: `def estimate_reasoning_call(
    prompt_tokens: int,
    thinking_tokens: int,
    visible_out_tokens: int,
    tokens_per_sec: float = 80.0,
    in_rate: float = 2.5,
    out_rate: float = 10.0,
) -> dict:
    # Account for hidden thinking_tokens in both output billing and TTFT delay
    return {}`,
      testCode: `est = estimate_reasoning_call(2000, 1600, 200, tokens_per_sec=80.0)
assert est["total_billed_output"] == 1800
assert est["ttft_delay_ms"] == 20000.0
assert abs(est["cost_usd"] - 0.023) < 1e-6
print("PASS: Lab 11.6b reasoning token latency & billing estimator verified!")`,
      solutionCode: `def estimate_reasoning_call(
    prompt_tokens: int,
    thinking_tokens: int,
    visible_out_tokens: int,
    tokens_per_sec: float = 80.0,
    in_rate: float = 2.5,
    out_rate: float = 10.0,
) -> dict:
    total_out = thinking_tokens + visible_out_tokens
    cost = (prompt_tokens * in_rate + total_out * out_rate) / 1_000_000.0
    delay_ms = (thinking_tokens / max(1.0, tokens_per_sec)) * 1000.0
    return {
        "total_billed_output": total_out,
        "cost_usd": round(cost, 6),
        "ttft_delay_ms": round(delay_ms, 1),
    }`,
      hint: 'Multiply `(thinking_tokens / tokens_per_sec) * 1000` for TTFT thinking delay and sum thinking + visible tokens for output cost.',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-6-freshness',
      title: 'Lab 11.6c: Model Catalog Freshness Audit Gate (Debug)',
      prompt: 'Fix `audit_catalog_freshness(entries: list[dict], today_iso: str, max_age_days: int = 180) -> tuple[bool, list[str]]` using `datetime.date.fromisoformat`: return `(len(stale) == 0, stale)` where any missing/invalid `lastReviewed` OR `(today - reviewed).days > max_age_days` adds `roleId` to `stale`.',
      difficulty: 'debug',
      starterCode: `from datetime import date

def audit_catalog_freshness(entries: list[dict], today_iso: str, max_age_days: int = 180) -> tuple[bool, list[str]]:
    # BUG: always passes without parsing dates or enforcing max_age_days!
    return True, []`,
      testCode: `CAT = [
    {"roleId": "small-fast", "lastReviewed": "2026-10-01"},
    {"roleId": "frontier-reasoning", "lastReviewed": "2025-01-01"},
    {"roleId": "reranker", "lastReviewed": ""},
]
ok, stale = audit_catalog_freshness(CAT, "2026-11-22", max_age_days=180)
assert ok is False and stale == ["frontier-reasoning", "reranker"]
assert audit_catalog_freshness([{"roleId": "small-fast", "lastReviewed": "2026-10-01"}], "2026-11-22") == (True, [])
print("PASS: Lab 11.6c dated catalog freshness gate verified!")`,
      solutionCode: `from datetime import date

def audit_catalog_freshness(entries: list[dict], today_iso: str, max_age_days: int = 180) -> tuple[bool, list[str]]:
    today = date.fromisoformat(today_iso)
    stale = []
    for e in entries:
        rid = str(e.get("roleId", "unknown"))
        raw_d = str(e.get("lastReviewed", "")).strip()
        try:
            rev = date.fromisoformat(raw_d)
            if (today - rev).days > max_age_days:
                stale.append(rid)
        except ValueError:
            stale.append(rid)
    return len(stale) == 0, stale`,
      hint: 'Wrap `date.fromisoformat(raw_d)` in `try/except ValueError` and check `(today - rev).days > max_age_days`.',
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & Worked Zero-Downtime Model Swap Playbook',
      paragraphs: [
        'Upgrading AI models safely requires treating prompt + model + retrieval as one coupled system rather than assuming "newer model = strictly better everywhere". Even frontier upgrades occasionally shift JSON formatting quirks, become slightly more verbose (pushing response latency up 18%), or over-refuse benign security queries.',
        'Follow this worked 4-step swap protocol whenever `MODEL_CATALOG` receives an updated snapshot: (1) Bind the candidate snapshot cleanly behind a staging feature flag (`role="small-fast-candidate"`), keeping all Python routes completely untouched; (2) Execute your full deterministic CI suite (schema parse rate, citation validity, ACL isolation, red-team suite) plus golden accuracy and cost-per-request comparison; (3) Canary 5% of production traffic for 24 hours watching `error_rate`, `p95_ttft_ms`, and user feedback tags in OpenTelemetry; (4) Flip 100% traffic and stamp `lastReviewed` in Git cleanly.',
        'Also guard against silent embedding-space mismatches: never swap the `embedding` role model on an existing vector collection without running a side-by-side shadow backfill table! Mixed vectors from two distinct embedding architectures share zero geometric alignment and silently degrade retrieval recall toward random chance.',
        'Finally, pair every quarterly `MODEL_CATALOG` audit with a unit-economics check: compare realized cost per resolved ticket, thinking-token ratio on reasoning endpoints, and timeout rate against your baseline SLA. If a freshly released lightweight model drops cost by half while passing every deterministic schema and citation regression check on held-out traffic, promote it cleanly via config PR rather than editing scattered application files.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked End-to-End Example: Mixing Capability Tiers in One Copilot',
      paragraphs: [
        'Inspect how a single production SaaS ticket assistant orchestrates five distinct `MODEL_CATALOG` capability roles seamlessly in one pipeline. Incoming queries first hit an `embedding` tier call (`40ms`) paired with BM25 lexical search over Postgres `pgvector` chunks; a `reranker` tier cross-encoder narrows top-40 candidates down to 5 razor-sharp paragraphs (`105ms`).',
        'Routine FAQ queries dispatch cleanly to the `small-fast` tier (`320ms` TTFT, fractions of a cent per turn), escalating strictly ambiguous edge cases or complex multi-policy reconciliations up to `frontier-reasoning` with explicit thinking-token latency budgets. Meanwhile, scanned user upload receipts branch cleanly to `multimodal-vision`, and every binding lives centrally in dated config verified automatically by CI freshness and golden eval suites.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'Reference capability roles (`small-fast`, `frontier-reasoning`, `embedding`, `reranker`, `multimodal-vision`, `speech-audio`, `local-open-weights`) rather than hardcoded snapshots inside application modules.',
        'Account for hidden thinking tokens in BOTH latency budgets and output token pricing when selecting Frontier Reasoning tiers.',
        'Keep `MODEL_CATALOG` `lastReviewed` dates verified in CI and gate every model swap against your golden evaluation benchmark.',
        'Whenever upgrading an `embedding` role model, always run a clean dual-index shadow backfill rather than mixing incompatible vectors inside one live collection.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q11-6-1',
      question: 'Why reference logical capability roles from `MODEL_CATALOG` instead of hardcoding specific snapshot strings inside route handlers?',
      options: [
        'Config swaps upgrade models and dodge deprecations cleanly',
        'Python runtime JSON parsers reject dict keys containing numeric snapshot hyphens',
        'Logical capability wrappers bypass HTTPS certificate validation automatically',
        'Hardcoded provider model versions disable async Batch API discounts globally',
      ],
      correctIndex: 0,
      explanation: 'Centralizing model bindings in a dated catalog allows rapid safe upgrades after golden eval verification.',
    },
    {
      id: 'q11-6-2',
      question: 'Why do reasoning-tier models show noticeably higher TTFT on simple prompts than Small-Fast chat models?',
      options: [
        'Reasoning endpoints decode uploaded PNG frames synchronously on host CPUs',
        'Hidden thinking tokens accrue time before the first visible token',
        'Reasoning APIs automatically close persistent HTTP keep-alive socket pools',
        'Frontier routers rebuild Postgres HNSW vector indexes on every incoming prompt',
      ],
      correctIndex: 1,
      explanation: 'Internal chain-of-thought reasoning tokens accrue latency and output token billing prior to visible output.',
    },
    {
      id: 'q11-6-3',
      type: 'predict-output',
      question: 'What role does `choose_role_for_task({"requires_offline_privacy": True, "is_image_scan": True})` return?',
      code: `role = choose_role_for_task({"requires_offline_privacy": True, "is_image_scan": True})`,
      options: [
        '"multimodal-vision" priority override',
        '"small-fast" default budget fallback',
        '"local-open-weights" privacy first',
        '"reranker" second-stage cross encoder',
      ],
      correctIndex: 2,
      explanation: 'Hard air-gapped privacy constraints take precedence so data stays completely inside private/local weights.',
    },
    {
      id: 'q11-6-4',
      type: 'spot-bug',
      question: 'Spot the hidden flaw in migrating from Hybrid RAG to "just stuff 200k tokens of raw company PDFs into every user call".',
      options: [
        'Transformer context windows forbid UTF-8 punctuation inside extracted PDFs',
        'Schema validators crash whenever structured JSON arrays exceed five items',
        'OpenTelemetry trace exporters reject HTTP spans carrying large user prompts',
        'Cost and TTFT soar while long unindexed prompts drop recall',
      ],
      correctIndex: 3,
      explanation: 'Prompt stuffing multiplies token bills and latency while reducing signal density vs ranked top-k chunks.',
    },
    {
      id: 'q11-6-5',
      type: 'multi-select',
      question: 'Select safe engineering steps before upgrading a production `small-fast` model snapshot inside `MODEL_CATALOG`:',
      options: [
        'Run the full golden eval & citation CI suite against the candidate snapshot',
        'Compare p95 latency and per-request USD cost in staging',
        'Roll out straight to 100% traffic Friday evening without canary alerts',
        'Update `lastReviewed` and rollback config tag cleanly',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 3],
      explanation: 'Always validate golden accuracy, latency/cost deltas, and rollback configs before promoting model swaps.',
    },
    {
      id: 'q11-6-6',
      type: 'ordering',
      question: 'Order the safe model-swap rollout process:',
      options: [],
      items: [
        'Update candidate snapshot in MODEL_CATALOG config',
        'Pass golden CI eval & trajectory suite cleanly',
        'Canary 5%–10% traffic monitoring error rate & cost',
        'Promote 100% and record new lastReviewed date',
      ],
      correctIndex: 0,
      explanation: 'Config update -> offline golden CI -> canary rollout -> full promotion + review stamp.',
    },
    {
      id: 'q11-6-7',
      type: 'numeric',
      question: 'If a reasoning request spends 1,200 hidden thinking tokens plus 300 visible tokens at 100 tokens/sec, how many total seconds does generation take?',
      options: [],
      correctIndex: 0,
      correctNumber: 15,
      tolerance: 0.1,
      unit: 'seconds',
      explanation: '(1,200 + 300) = 1,500 output tokens / 100 tok/sec = 15 seconds.',
    },
    {
      id: 'q11-6-8',
      question: 'Why enforce an automated freshness check on `MODEL_CATALOG` `lastReviewed` timestamps?',
      options: [
        'Catches legacy snapshots ahead of upstream endpoint deprecation',
        'Guarantees zero factual hallucination probabilities mathematically across inputs',
        'Automatically transliterates bilingual Arabic UTF-8 queries into ASCII slugs',
        'Prevents React hooks from re-rendering dashboard UI states needlessly',
      ],
      correctIndex: 0,
      explanation: 'Scheduled catalog freshness audits keep dependencies aligned with current provider pricing, safety, and deprecations.',
    },
  ],
};
