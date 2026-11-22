import type { Lesson } from '@/types/course';

export const lesson10_1: Lesson = {
  id: '10-1',
  moduleId: 'mod-10',
  number: '10.1',
  title: 'FinOps: Prompt Prefix Caching, Batch APIs & Tiered Routing',
  subtitle: 'Engineer AI systems that hit strict unit-cost and latency budgets using prefix cache alignment, async Batch APIs, and confidence-based model cascading.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['6.5'],
  requires: ['llm-caching', 'model-routing'],
  teaches: ['prompt-prefix-caching', 'batch-llm-apis', 'cascading-routing'],
  competencies: ['mid-observability-cost', 'sr-finops-scale'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Structure system prompts, schemas, and shared examples so provider Prompt Prefix Caching reuses KV cache reliably across requests.',
    'Identify workloads suited for asynchronous Batch APIs (~50% token discount) versus interactive low-TTFT paths.',
    'Implement Small-Fast to Frontier Reasoning cascading routers with calibrated escalation criteria and per-request cost caps.',
  ],
  checkWithoutNotes: [
    'Why does inserting a volatile timestamp or user ID at the top of a system prompt destroy Prompt Prefix Cache hit rates?',
    'What types of workloads should move to Batch APIs instead of synchronous chat endpoints?',
    'How does a cascading router decide when to escalate a Small-Fast response to a Frontier Reasoning model?',
    'Given 1M daily input tokens where 80% sit in a reusable static prefix, compute the effective savings from prefix caching.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why AI FinOps Decides Whether Features Survive Production',
      paragraphs: [
        'In early prototypes, engineers celebrate getting an LLM workflow working on ten sample inputs. When that same workflow launches to 100,000 daily active users with a 6,000-token system prompt, naive architecture turns an exciting feature into an unsustainable cloud bill overnight. Every dollar spent on uncached repeated context or oversized frontier calls compresses gross margin and triggers emergency rate caps.',
        'Production AI engineers treat token economics as a first-class engineering discipline alongside correctness and latency. Instead of guessing at prompts, you measure cost per resolved user task and tail time-to-first-token (TTFT) across every request tier.',
        'The mental model is a physical restaurant kitchen prep line. Chopping onions from scratch for every single burger order wastes labor; keeping standardized pre-prepped trays ready lets line cooks assemble plates quickly, while reserving master pastry chefs strictly for complex custom cakes.',
        'Three architectural levers dominate applied LLM unit economics: Prompt Prefix Caching, Asynchronous Batch APIs, and Tiered Model Cascading using abstract capability roles rather than hardcoded vendor strings.',
      ],
    },
    {
      type: 'prose',
      heading: 'How Prompt Prefix Caching & KV Reuse Work Under the Hood',
      paragraphs: [
        'During transformer prefill, the model computes Key and Value (KV) attention matrices for every token in the input prompt sequentially from token 0 forward. Each token attention vector depends strictly on tokens that came before it in the sequence.',
        'Because causal attention is strictly left-to-right, if two requests share an identical byte-exact prefix of 4,096 tokens—such as your system rules, tool JSON schemas, and few-shot policy examples—the provider can skip recomputing those 4,096 KV matrices cleanly and serve cached KV blocks at roughly 50% to 90% discount plus drastically lower prefill TTFT.',
        'However, prefix cache keys match strictly from index 0 up to the first differing token. Putting dynamic fields like current UTC timestamps, tenant names, or per-user memory right at line 2 invalidates the entire remaining 4,000-token prefix on every call.',
        'Always lock prompts into a strict canonical layout: first static developer instructions, second stable JSON tool schemas, third shared few-shot examples, and only at the very end volatile per-turn context, retrieved user documents, and current timestamp.',
      ],
    },
    {
      type: 'code',
      title: 'Canonical Prefix-Cache-Friendly Message Builder',
      language: 'python',
      code: `STATIC_HEADER = """Role: Senior Compliance Classifier.
Output valid JSON matching {"label": str, "confidence": float}."""

def build_cache_aligned_messages(tool_specs: str, retrieved_docs: str, user_query: str, now_iso: str) -> list[dict]:
    # Prefix stays byte-identical across all users and timestamps
    return [
        {"role": "system", "content": f"{STATIC_HEADER}\\n\\n{tool_specs}"},
        {"role": "user", "content": f"Context:\\n{retrieved_docs}\\nTimestamp: {now_iso}\\nQuestion: {user_query}"},
    ]`,
      caption: 'Volatile timestamp and retrieved documents live exclusively after the shared prefix boundary.',
    },
    {
      type: 'prose',
      heading: 'Asynchronous Batch APIs & Confidence-Based Cascading',
      paragraphs: [
        'Not every AI call has a human staring at a blinking cursor. Nightly document enrichment, offline golden evaluation runs, CRM ticket tagging, and synthetic dataset labeling can tolerate completion windows between minutes and 24 hours.',
        'Major hosted APIs expose dedicated Batch endpoints accepting JSONL queues of requests in exchange for roughly 50% lower token pricing and higher separate rate limits that will not starve live customer chat.',
        'For interactive requests, tiered cascading beats sending 100% of queries to the Frontier Reasoning tier. Route incoming queries first to a Small-Fast tier model that emits both an answer and calibrated uncertainty flags (missing citation, schema check failure, or self-reported low confidence). Escalate strictly the ambiguous 15%–25% of turns to Frontier Reasoning.',
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'cost-calculator',
      title: 'Interactive FinOps Calculator: Prefix Caching, Batch API & Tiered Routing',
      description: 'Tune request volume, context tokens, prefix cache hit ratio, Small-Fast routing share, and Batch API mode to measure monthly spend and unit cost per request.',
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: The Dynamic Timestamp Cache Wipeout',
      paragraphs: [
        'A B2B support team launched an agent with 9,000 tokens of tool specifications and help-center policy instructions. Expecting automatic prefix caching, finance projected monthly inference spend around 1,800 dollars—yet the first invoice arrived above 7,400 dollars alongside p95 TTFT exceeding 1.9 seconds.',
        'Trace inspection revealed line 3 of the system prompt rendered `Current time: 2026-11-22T14:03:22Z`. Because timestamps mutated every second, zero requests ever matched the KV prefix beyond token 18. Moving the timestamp and `tenant_id` cleanly into the final user message restored an 84% prefix cache hit ratio and dropped monthly spend below 1,650 dollars.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: LLM FinOps Optimization Levers',
      headers: ['Lever', 'Cost Impact', 'Latency Impact', 'Main Risk / Failure Mode'],
      rows: [
        ['Prompt Prefix Caching', '50%–90% savings on cached input tokens', 'Cuts long-prompt TTFT sharply', 'Volatile top-of-prompt values break byte equality'],
        ['Async Batch APIs', '~50% flat discount on input + output', 'Minutes to 24h SLA (non-interactive)', 'Unsuitable for live chat or synchronous webhooks'],
        ['Small-Fast -> Frontier Cascade', '60%–80% lower blended cost', 'Faster median, slower worst-case on escalation', 'Poor router thresholds either over-escalate or hurt quality'],
        ['Semantic FAQ Cache', 'Up to 100% on repeat queries', 'Sub-20ms cache hit', 'Missing tenant_id/ACL scope leaks cross-tenant answers'],
      ],
    },
    {
      type: 'callout',
      variant: 'interview',
      title: 'Architecture Defense Tip',
      body: 'Never say "we pick a smaller model everywhere to save money." Defend measurable gates: start with a Small-Fast tier backed by deterministic schema/citation checks, measure exact pass-rate delta against Frontier Reasoning on your golden set, and ship the cascade only with an automated regression CI threshold.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-1-cost',
      title: 'Lab 10.1a: Unit Cost Calculator with Prefix Cache & Batch Discount',
      prompt: 'Implement `compute_request_cost(prompt_tokens, cached_tokens, completion_tokens, in_rate_per_m, cached_rate_per_m, out_rate_per_m, is_batch=False) -> float` rounded to 6 decimal places. Apply `0.5` multiplier when `is_batch=True`. Clamp `cached_tokens <= prompt_tokens`.',
      difficulty: 'guided',
      starterCode: `def compute_request_cost(
    prompt_tokens: int,
    cached_tokens: int,
    completion_tokens: int,
    in_rate_per_m: float = 2.50,
    cached_rate_per_m: float = 0.625,
    out_rate_per_m: float = 10.00,
    is_batch: bool = False,
) -> float:
    # Compute uncached input + cached input + output cost, scaled by 0.5 if batch
    return 0.0`,
      testCode: `c1 = compute_request_cost(4000, 3000, 400)
assert abs(c1 - 0.008375) < 1e-6, f"Expected 0.008375, got {c1}"
c2 = compute_request_cost(4000, 3000, 400, is_batch=True)
assert abs(c2 - 0.004188) < 1e-5, f"Expected ~0.004188, got {c2}"
c3 = compute_request_cost(1000, 5000, 100)
assert c3 > 0
print("PASS: Lab 10.1a unit cost math verified!")`,
      solutionCode: `def compute_request_cost(
    prompt_tokens: int,
    cached_tokens: int,
    completion_tokens: int,
    in_rate_per_m: float = 2.50,
    cached_rate_per_m: float = 0.625,
    out_rate_per_m: float = 10.00,
    is_batch: bool = False,
) -> float:
    capped_cache = max(0, min(prompt_tokens, cached_tokens))
    uncached = prompt_tokens - capped_cache
    raw = (uncached * in_rate_per_m + capped_cache * cached_rate_per_m + completion_tokens * out_rate_per_m) / 1_000_000.0
    if is_batch:
        raw *= 0.5
    return round(raw, 6)`,
      hint: 'Clamp `capped_cache = min(prompt_tokens, max(0, cached_tokens))` before subtracting `uncached = prompt_tokens - capped_cache`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-1-prefix',
      title: 'Lab 10.1b: Prefix Cache Layout Fix (Spot & Fix Volatile Header)',
      prompt: 'Fix `format_prompt_messages(static_rules, schemas, user_id, query, timestamp)` so repeated calls across different users/timestamps share an identical `system` message for KV cache hits.',
      difficulty: 'debug',
      starterCode: `def format_prompt_messages(static_rules: str, schemas: str, user_id: str, query: str, timestamp: str) -> list[dict]:
    # BUG: volatile user_id and timestamp inside system message break prefix caching!
    sys_msg = f"[{timestamp}] User={user_id}\\n{static_rules}\\n{schemas}"
    return [
        {"role": "system", "content": sys_msg},
        {"role": "user", "content": query},
    ]`,
      testCode: `m1 = format_prompt_messages("Rules", "Schemas", "u1", "Hello?", "2026-11-22T01:00Z")
m2 = format_prompt_messages("Rules", "Schemas", "u2", "Refund?", "2026-11-22T02:00Z")
assert m1[0]["content"] == m2[0]["content"], "System prefix must match byte-for-byte!"
assert "u2" in m2[1]["content"] and "2026-11-22T02:00Z" in m2[1]["content"]
print("PASS: Lab 10.1b prefix cache layout verified!")`,
      solutionCode: `def format_prompt_messages(static_rules: str, schemas: str, user_id: str, query: str, timestamp: str) -> list[dict]:
    sys_msg = f"{static_rules}\\n{schemas}"
    user_msg = f"User={user_id} | Time={timestamp}\\nQuery: {query}"
    return [
        {"role": "system", "content": sys_msg},
        {"role": "user", "content": user_msg},
    ]`,
      hint: 'Keep `system` composed exclusively of `static_rules` + `schemas`, and move `user_id` + `timestamp` into the `user` message.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-1-cascade',
      title: 'Lab 10.1c: Confidence-Based Cascading Router',
      prompt: 'Implement `route_with_cascade(query, small_fn, frontier_fn, min_confidence=0.80) -> dict`: invoke `small_fn(query)` returning `{"answer": str, "confidence": float, "valid_json": bool}`. Return `{"tier": "small-fast", "escalated": False, ...}` if `valid_json` is True and `confidence >= min_confidence`; otherwise escalate to `frontier_fn(query)` and return `{"tier": "frontier-reasoning", "escalated": True, ...}`.',
      difficulty: 'spec',
      starterCode: `def route_with_cascade(query: str, small_fn, frontier_fn, min_confidence: float = 0.80) -> dict:
    # Call small_fn first; escalate to frontier_fn when invalid JSON or low confidence
    return {}`,
      testCode: `calls = {"small": 0, "frontier": 0}
def s_fn(q):
    calls["small"] += 1
    if "hard" in q:
        return {"answer": "unsure", "confidence": 0.45, "valid_json": True}
    if "broken" in q:
        return {"answer": "{bad", "confidence": 0.99, "valid_json": False}
    return {"answer": "ok", "confidence": 0.92, "valid_json": True}
def f_fn(q):
    calls["frontier"] += 1
    return {"answer": "frontier-ok", "confidence": 0.96, "valid_json": True}

r1 = route_with_cascade("easy FAQ", s_fn, f_fn)
assert r1["tier"] == "small-fast" and r1["escalated"] is False
r2 = route_with_cascade("hard dispute", s_fn, f_fn)
assert r2["tier"] == "frontier-reasoning" and r2["escalated"] is True
r3 = route_with_cascade("broken json", s_fn, f_fn)
assert r3["tier"] == "frontier-reasoning" and calls["frontier"] == 2
print("PASS: Lab 10.1c cascading router verified!")`,
      solutionCode: `def route_with_cascade(query: str, small_fn, frontier_fn, min_confidence: float = 0.80) -> dict:
    s_res = small_fn(query)
    if s_res.get("valid_json") and float(s_res.get("confidence", 0.0)) >= min_confidence:
        return {"tier": "small-fast", "escalated": False, "answer": s_res["answer"]}
    f_res = frontier_fn(query)
    return {"tier": "frontier-reasoning", "escalated": True, "answer": f_res["answer"]}`,
      hint: 'Check `s_res.get("valid_json") and float(s_res.get("confidence", 0.0)) >= min_confidence` before accepting Small-Fast.',
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & Debugging Prefix Cache Misses',
      paragraphs: [
        'Even teams that understand prefix caching in theory frequently see near-zero cache hit rates in production telemetry because of three subtle mistakes:',
        '1) **Interpolating JSON dictionaries with un-sorted keys (`json.dumps(schemas)`):** Python dictionaries preserve insertion order, so refactoring one endpoint alters schema key order dynamically and breaks byte-level KV matching. Always serialize tool specs and examples with `json.dumps(..., sort_keys=True)`.',
        '2) **Injecting per-user conversation summaries above the system examples:** Whenever retrieval chunks or rolling memory summaries sit ahead of fixed few-shot examples, every distinct user query invalidates every downstream token KV block. Keep retrieved context and user chat strictly at the bottom suffix.',
        '3) **Routing failures without latency budgets:** A cascading router that invokes Frontier Reasoning sequentially AFTER Small-Fast times out adds double latency on tail percentiles. Enforce strict shorter timeouts (for instance `3.5s`) on the Small-Fast speculative pass and monitor both p50 and p95 latency alongside unit USD cost.',
        'When auditing cache hits in OpenTelemetry or provider logs, divide `cached_tokens / prompt_tokens` per route: anything below `0.50` on a static-system-prompt endpoint signals an unstable token creeping into your prefix boundary.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'Place static instructions, tool schemas, and shared examples cleanly at token index 0 so Prompt Prefix Caching hits reliably.',
        'Move timestamps, user metadata, and retrieved snippets strictly into the trailing turn suffix.',
        'Offload asynchronous evaluation, enrichment, and backfills to Batch APIs for ~50% token cost reduction.',
        'Use deterministic validation + calibrated confidence gates before escalating Small-Fast queries to Frontier Reasoning.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q10-1-1',
      question: 'Why does injecting the current second timestamp at line 1 of a 5,000-token system prompt break Prompt Prefix Caching?',
      options: [
        'Because causal KV cache keys require byte-identical tokens from index 0',
        'Because hosted endpoints disable prefix caching whenever any system message exceeds 2k tokens',
        'Because transformer KV caches store strictly generated assistant output tokens instead of prompt tokens',
        'Because standard tokenizers automatically strip ISO timestamps out of prompt headers cleanly',
      ],
      correctIndex: 0,
      explanation: 'KV states at index k depend causally on indices 0..k-1, so a change at line 1 invalidates the rest of the prefix.',
    },
    {
      id: 'q10-1-2',
      question: 'Which workload fits an asynchronous Batch API queue cleanly instead of synchronous chat endpoints?',
      options: [
        'Interactive live voice customer support greetings requiring sub-second response',
        'Real-time IDE inline code autocomplete as the developer types characters',
        'Nightly golden evaluation grading over 15,000 archived customer transcripts',
        'Interactive multi-turn checkout confirmation inside an active mobile cart',
      ],
      correctIndex: 2,
      explanation: 'Nightly offline grading easily fits an async 24h SLA while cutting token cost by ~50%.',
    },
    {
      id: 'q10-1-3',
      type: 'predict-output',
      question: 'What is the effective input cost if 80% of 10,000 prompt tokens hit a prefix cache discounted 75% vs uncached rate `$2.00/1M`?',
      code: `uncached = 2000 / 1e6 * 2.00
cached   = 8000 / 1e6 * 0.50`,
      options: [
        '$0.0040 per call after rounding uncached input down',
        '$0.0080 total across uncached plus discounted cached blocks',
        '$0.0120 because batch multipliers stack automatically',
        '$0.0200 because cached blocks bill full uncached input rates',
      ],
      correctIndex: 1,
      explanation: 'Uncached 2k tokens cost $0.0040 and cached 8k tokens cost $0.0040, totaling $0.0080 vs $0.0200 uncached.',
    },
    {
      id: 'q10-1-4',
      type: 'spot-bug',
      question: 'Spot the design flaw in a router that sends 100% of queries directly to Frontier Reasoning whenever a user mentions billing.',
      options: [
        'It relies on deterministic substring matching instead of computing neural sentence embeddings',
        'Simple invoice lookups never hit Small-Fast, inflating unit cost needlessly',
        'It disables semantic caching strictly on non-billing documentation queries across tenants',
        'Small-Fast models fail JSON Schema validation whenever numbers appear in billing text',
      ],
      correctIndex: 1,
      explanation: 'Routine invoice status lookups can be handled cheaply by Small-Fast with deterministic escalation only on edge cases.',
    },
    {
      id: 'q10-1-5',
      type: 'multi-select',
      question: 'Which elements belong BEFORE volatile per-user retrieved chunks to preserve prefix KV reuse?',
      options: [
        'Static system role and policy constraints',
        'Fixed tool JSON schemas',
        'Per-request UTC timestamp',
        'Curated shared few-shot examples',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 3],
      explanation: 'System rules, schemas, and shared examples remain identical across requests; timestamps mutate every turn.',
    },
    {
      id: 'q10-1-6',
      type: 'ordering',
      question: 'Order the request routing cascade from cheapest/fastest check to most expensive fallback:',
      options: [],
      items: [
        'Exact tenant-scoped FAQ cache lookup',
        'Small-Fast tier model with schema check',
        'Frontier Reasoning tier escalation',
      ],
      correctIndex: 0,
      explanation: 'Serve free exact cache hits first, try Small-Fast tier next, and escalate hard/ambiguous queries last.',
    },
    {
      id: 'q10-1-7',
      type: 'numeric',
      question: 'If uncached interactive requests cost $0.012 per item across 10,000 items, what does an Async Batch run at 50% discount cost in USD?',
      options: [],
      correctIndex: 0,
      correctNumber: 60,
      tolerance: 0.1,
      unit: 'USD',
      explanation: '10,000 * $0.012 = $120 interactive; with 50% batch discount it costs $60.',
    },
    {
      id: 'q10-1-8',
      question: 'Why enforce a hard per-tenant or daily USD spend cap inside backend FinOps middleware?',
      options: [
        'Because JSON Schema guarantees zero latency spikes only below ten dollars daily',
        'Because Prompt Prefix Caching automatically pauses customer traffic once costs pass ten dollars',
        'Because Async Batch API queues execute synchronously inside frontend browser memory workers',
        'Because retry bugs or webhook loops can otherwise drain API budgets',
      ],
      correctIndex: 3,
      explanation: 'Code-enforced spend breakers stop runaway retries or webhook storms immediately.',
    },
  ],
};
