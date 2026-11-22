import type { Lesson } from '@/types/course';

export const lesson8_3: Lesson = {
  id: '8-3',
  moduleId: 'mod-8',
  number: '9.3',
  title: 'AI System Design Interviews: End-to-End Worked Architectures',
  subtitle: 'Walk confidently through 45-minute AI System Design interviews with repeatable architecture pillars, unit-economics math, vector memory sizing, and graceful fallback design.',
  durationMinutes: 90,
  track: 'ai-eng',
  prerequisites: ['6.3', '7.1', '7.2', '8.2'],
  requires: ['rag-chunking', 'acl-prefiltering', 'fastapi-endpoints', 'caching-and-async-queues'],
  teaches: [
    'ai-system-design-framework',
    'system-design-capacity-math',
  ],
  objectives: [
    'Structure any 45-minute AI System Design interview cleanly across 5 pillars (Requirements/SLAs -> Data/Retrieval -> Routing/Caching/Guardrails -> Evals -> Failure Fallbacks).',
    'Present a complete worked architecture for an enterprise multi-tenant RAG + Support Agent copilot at 1M DAU.',
    'Compute back-of-the-envelope capacity math: daily inference USD cost, cache savings, and HNSW vector RAM sizing.',
    'Compare concrete architectural tradeoffs (`pgvector` vs dedicated vector DB, hosted API vs self-hosted `vLLM`, streaming SSE vs async queues).',
  ],
  checkWithoutNotes: [
    'Recite the **5 pillars** of an AI System Design interview in order before drawing a single box on the whiteboard.',
    'Why do junior candidates fail AI System Design interviews even when naming impressive tools like `Pinecone` or `LangGraph`?',
    'Show quick RAM sizing math for `10 million` `1536-dim` `float32` embedding vectors plus HNSW graph overhead.',
    'Explain how **FAQ Semantic Caching + 8B Model Routing + Prompt Prefix Caching** slash support-copilot unit cost without collapsing quality.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'What Separates Junior Candidates From Hire-Ready AI System Designers',
      paragraphs: [
        'Imagine the interviewer opens with: *"Design an AI Customer Support Copilot for a B2B SaaS platform serving 1 million daily active users."* Weak candidates start listing tools excitedly inside thirty seconds: *"First we drop PDFs into LangChain, store vectors in Pinecone, and ask GPT!"* Within ten minutes they have forgotten tenant permissions, token costs, streaming latency, evaluation gates, and what happens when OpenAI throws `503` errors.',
        'Strong engineers control the whiteboard calmly using a repeatable **5-Pillar AI System Design Framework**. First spend five minutes pinning down **Functional & Non-Functional SLAs** (reads vs refund write actions, `p95` TTFT `< 800ms`, tenant ACL isolation, unit cost `< $0.01/ticket`). Second, design **Ingestion & Hybrid Retrieval** (CDC/webhooks, contextual chunking, BM25 + HNSW with mandatory `tenant_id` pre-filter, Cross-Encoder reranking).',
        'Third, architect **Routing, Caching & Guardrails** (exact/semantic Redis cache, prompt prefix caching, 8B classifier routing 75% simple tickets cheaply, structured JSON + HITL confirmation on money actions). Fourth, wire **Offline Golden CI Evals & Online Feedback**. Fifth, detail **Failure Modes & Graceful Fallbacks** (circuit breakers, multi-region failover, fallback BM25 links).',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Cloud Architecture Tradeoffs + Back-of-the-Envelope Budgeting',
      frontendConcept: 'Estimating CDN bandwidth, Next.js Edge caching hit rate, and Postgres read replicas before choosing infrastructure',
      aiConcept: '5-Pillar AI System Design + Token Unit Economics + Vector Index Capacity Math',
      explanation:
        'Great system design answers work like cloud capacity planning in web engineering: instead of guessing blindly whether to use `pgvector` or Qdrant, calculate raw vector memory (`N * dim * 4 bytes`) and daily query volume (`QPS` and `$ / ticket`) on the whiteboard in 30 seconds—your numbers make every infrastructure choice obvious automatically!',
    },
    {
      type: 'prose',
      heading: 'Worked Answer 1: Enterprise Multi-Tenant Support Copilot (1M DAU + Unit Economics)',
      paragraphs: [
        'Walk step by step through exact numbers an interviewer loves seeing. Suppose `1M DAU` generate `200,000` support conversations per day (`~2.3 avg QPS`, peaking at `~12 QPS`). If every conversation averages `3` turns sending `2,500` input tokens and generating `300` output tokens straight to an uncached frontier model (`$2.50/1M in`, `$10/1M out`), each turn costs `$0.00925` (`~$0.028/ticket`, **`$5,600/day`** or **`$2M/year`**)!',
        'Now apply concrete engineering optimizations on the whiteboard: **1) Semantic + Exact FAQ Cache (`25%` hit rate):** identical `"How do I reset SSO?"` queries return cached verified citations in `< 10 ms` for `$0`. **2) Fast 8B Router (`75%` of uncached traffic):** routine policy Q&A routes to a `$0.15/1M in, $0.60/1M out` small model (`$0.00055/turn`), escalating only tricky multi-step billing/API debugging (`25%`) to the frontier model! **3) Prompt Prefix Caching (`50%` input discount)** on shared system/policy headers cuts cost further.',
        'Compute the combined unit cost right on the board: blended turn cost plunges from `$0.00925` down to roughly **`$0.0020/turn`**—nearly a **5x cost reduction** (`~$4,300/day` saved!) while streaming first tokens in `~350 ms` via SSE and isolating every `tenant_id` cleanly in Postgres `pgvector` pre-filters (`WHERE tenant_id = $1`) before top-`k` ranking!',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Answer 2: Vector Storage Sizing & Latency Budget Design (`pgvector` vs Dedicated)',
      paragraphs: [
        'Next, prove you size memory mathematically rather than guessing. Suppose the platform indexes `10 million` text chunks across enterprise tenants using `1536-dim` dense embeddings (`float32` = `4 bytes`). Raw vector bytes equal `10,000,000 * 1536 * 4 = 61.44 GB`. Because HNSW graph edges and Postgres metadata add roughly `1.5x` total memory overhead (`61.44 * 1.5 ≈ 92 GB` RAM), keeping all HNSW indexes memory-resident fits either inside two high-RAM `64 GB` Qdrant/Milvus shards OR stays cleanly under `25 GB` on a single `pgvector` instance using `int8`/`binary` quantization or smaller `512-dim` embeddings!',
        'Articulate **latency budgets** explicitly too. If users expect Time To First Token (`TTFT`) under `800 ms`: budget `15 ms` for API auth/Redis cache lookup, `45 ms` for query embedding call, `50 ms` for tenant-filtered Hybrid BM25 + HNSW candidate retrieval (`top 40`), `120 ms` for Stage-2 Cross-Encoder reranking (`top 40 -> top 6`), and `350 ms` for LLM prefill TTFT (`Total = 580 ms` with `220 ms` safety margin!).',
        'Crucially, explain **failure fallbacks**: if the primary frontier LLM API hangs beyond a `4.0 s` TTFT timeout or returns consecutive `503`s, the **circuit breaker** trips automatically—routing simple queries to a secondary region/model or returning ranked BM25/reranked snippets directly with verified source links (`"Live AI synthesis unavailable; here are the top 3 matching docs"`) so customer support never crashes completely.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Answer 3: High-Throughput Document Ingestion & Asynchronous Eval Pipeline',
      paragraphs: [
        'Interviewers love following up on customer support copilots with: *"Now suppose enterprise admins upload 50,000 updated PDFs overnight—how does your system re-index cleanly without breaking live chat queries?"* Avoid stuffing bulk indexing inside the synchronous FastAPI chat container! Route uploads (`POST /v1/documents`) into object storage (`S3`) and publish chunking jobs onto a partitioned queue (`Redis`/`SQS` + `Idempotency-Key`) emitting `HTTP 202 Accepted` immediately.',
        'Dedicated autoscaling worker pods pull batches cleanly, run layout-aware parsing, compute contextual embeddings in parallel batches (`batch_size = 64`), and upsert into a **versioned collection or shadow index partition** keyed by `(tenant_id, doc_id, doc_version)`. Crucially, when an admin deletes or restricts an HR policy PDF, emit an immediate CDC tombstone event purging outdated vectors within seconds—never waiting for a weekly batch rebuild while stale confidential answers linger in search results or Redis caches!',
        'Finally, wire **Continuous Online Observability & Golden CI Gates** into the architecture box on the right edge: log structured span timings (`embed_ms`, `search_ms`, `rerank_ms`, `llm_ttft_ms`) alongside anonymized user thumbs-down signals, and replay sampled production failures straight back into your GitHub Actions `golden_eval.json` regression suite.',
      ],
    },
    {
      type: 'table',
      title: 'System Design Tradeoff Cheat Sheet',
      headers: ['Design Choice', 'Pick Option A When...', 'Pick Option B When...'],
      rows: [
        ['Hosted Frontier API vs Self-Hosted `vLLM`', 'Spiky variable traffic, complex multi-step reasoning, lean team (`< 5` engineers)', 'Strict HIPAA/VPC data residency, steady high GPU utilization, distilled 8B–70B workload'],
        ['`pgvector` vs Dedicated Qdrant / Pinecone', 'Under `~10M` chunks, relational user/tenant ACL joins (`ACID` zero sync drift)', 'Over `50M–100M+` vectors, strict `< 20ms` tail latency, independent compute/RAM scaling'],
        ['Sync SSE Streaming vs Async `202` Queue', 'Interactive chat copilot (`TTFT < 800ms` perceived responsiveness)', 'Heavy PDF ingestion, batch eval sweeps, multi-minute deep research synthesis'],
        ['Single Frontier Model vs Cascading Router', 'Low query volume (`< 5k/day`) where simplicity beats engineering complexity', 'High daily volume (`> 50k/day`) where 70%+ simple queries justify routing to an 8B tier'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common System Design Interview Mistakes & How to Debug Them',
      paragraphs: [
        '1) Jumping straight into framework branding ("We use LangChain + Pinecone + GPT!") before confirming QPS, latency SLAs, write permissions, or multi-tenant security: always ask 3–4 clarifying questions in the first three minutes.',
        '2) Applying `tenant_id` filters AFTER global vector top-`k` search (`post-filtering`): if Tenant A owns only 2 matching chunks globally outside top-`k`, Tenant A receives zero results OR suffers cross-tenant count leakage! Always enforce `tenant_id` ACL pre-filtering at index scan time.',
        '3) Skipping back-of-the-envelope RAM or USD unit-economics calculations: hiring managers test whether you notice a design costs `$80,000/month` or requires `400 GB` RAM on day one.',
        '4) Leaving agent write actions (`refund_order`, `send_email`, `delete_user`) completely unguarded behind natural-language prompts: require deterministic schema validation, RBAC role verification, and Human-in-the-Loop confirmation on irreversible side effects.',
        '5) Designing zero fallback path when upstream LLM APIs rate-limit (`429`) or time out (`504`): always specify timeouts, jittered retries on idempotent reads, secondary provider failover, and degraded snippet fallback.',
        '6) Forgetting ingestion freshness and index deletion propagation: explain how document edits/deletions flow via CDC/webhooks into queue workers so revoked HR PDFs disappear from vector search within minutes, not next month.',
        '7) Caching RAG replies strictly on `sha256(query)` without including `tenant_id` and `role_scope`: cross-tenant cache poisoning leaks private legal answers instantaneously under concurrent enterprise load.',
        '8) Treating offline golden evaluations as a one-time pre-launch check instead of continuous regression protection: wire deterministic RAGAS/citation gates directly into GitHub Actions alongside live sampled production trace scoring so prompt, model, or chunking edits never silently degrade retrieval faithfulness or citation validity after launch.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 9.3 Recap: AI System Design Mastery',
      body: '- Lead every interview with the **5 Pillars**: SLAs & Economics -> Ingestion/Hybrid RAG -> Routing/Caching/Guardrails -> Evals -> Fallbacks.\n- Quantify daily USD spend cleanly (`cache hits + 8B cascade vs frontier`) and size vector RAM (`N * dim * bytes * HNSW overhead`).\n- Budget latency stage by stage (`cache -> embed -> hybrid recall -> rerank -> TTFT`) against strict `< 800 ms` interactive SLA targets.\n- Enforce pre-filtered `tenant_id` ACLs and HITL approval gates on irreversible tool write operations.\n- Include circuit-breaker fallbacks and CDC ingestion sync so the system degrades gracefully without dropping traffic.',
    },
    {
      type: 'python-lab',
      labId: 'lab-8-3-unit-econ',
      difficulty: 'guided',
      requires: ['ai-system-design-framework', 'caching-and-async-queues'],
      title: 'Lab 9.3A: AI System Unit-Economics & Cache/Router Savings Estimator',
      prompt:
        'Implement `estimate_daily_cost(daily_turns: int, cache_hit_rate: float, mini_share: float, avg_in_tokens: int, avg_out_tokens: int) -> dict`: compute naive uncached daily USD cost if 100% of turns hit a frontier model (`$2.50/1M in`, `$10.00/1M out`), vs optimized daily USD cost where `cache_hit_rate` fraction costs `$0`, `mini_share` of remaining uncached turns use the mini model (`$0.15/1M in`, `$0.60/1M out`), and the rest use frontier. Return `{"naive_usd": round(..., 2), "optimized_usd": round(..., 2), "savings_pct": round(..., 1)}`.',
      starterCode: `def estimate_daily_cost(daily_turns: int, cache_hit_rate: float, mini_share: float, avg_in_tokens: int, avg_out_tokens: int) -> dict:
    # Frontier: $2.50 / 1M in, $10.00 / 1M out; Mini: $0.15 / 1M in, $0.60 / 1M out
    pass`,
      testCode: `res = estimate_daily_cost(600000, cache_hit_rate=0.25, mini_share=0.75, avg_in_tokens=2500, avg_out_tokens=300)
# Naive cost per turn = (2500*2.5 + 300*10)/1e6 = 0.00925 -> *600k = 5550.00
assert res["naive_usd"] == 5550.0
# Uncached turns = 450,000; mini = 337,500 * 0.000555 = 187.3125; frontier = 112,500 * 0.00925 = 1040.625 -> 1227.94
assert abs(res["optimized_usd"] - 1227.94) < 0.05
assert res["savings_pct"] > 77.0
print("PASS: Unit-economics calculator quantified 77.9% inference cost savings accurately!")`,
      solutionCode: `def estimate_daily_cost(daily_turns: int, cache_hit_rate: float, mini_share: float, avg_in_tokens: int, avg_out_tokens: int) -> dict:
    frontier_turn = (avg_in_tokens * 2.50 + avg_out_tokens * 10.00) / 1_000_000.0
    mini_turn = (avg_in_tokens * 0.15 + avg_out_tokens * 0.60) / 1_000_000.0
    naive_usd = daily_turns * frontier_turn
    uncached = daily_turns * (1.0 - cache_hit_rate)
    optimized_usd = (uncached * mini_share * mini_turn) + (uncached * (1.0 - mini_share) * frontier_turn)
    savings_pct = ((naive_usd - optimized_usd) / naive_usd * 100.0) if naive_usd > 0 else 0.0
    return {
        "naive_usd": round(naive_usd, 2),
        "optimized_usd": round(optimized_usd, 2),
        "savings_pct": round(savings_pct, 1),
    }`,
      hint: 'Compute per-turn USD for frontier vs mini (`(in * price_in + out * price_out) / 1e6`), multiply uncached turns `(1 - cache_hit_rate)` across `mini_share` vs `1 - mini_share`.',
      hints: [
        '`frontier_turn = (avg_in_tokens * 2.50 + avg_out_tokens * 10.00) / 1e6`.',
        'Multiply `daily_turns * (1 - cache_hit_rate)` cleanly into mini and frontier shares.',
        'Compute `savings_pct = (naive_usd - optimized_usd) / naive_usd * 100` (guarded for zero).',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-3-capacity',
      difficulty: 'spec',
      requires: ['system-design-capacity-math'],
      title: 'Lab 9.3B: HNSW Vector RAM & Shard Planner',
      prompt:
        'Implement `plan_vector_cluster(num_vectors: int, dim: int, bytes_per_dim: int, overhead_factor: float, shard_ram_gb: float) -> dict`: compute `raw_gb = (num_vectors * dim * bytes_per_dim) / (1000 ** 3)`, `total_ram_gb = raw_gb * overhead_factor`, and `min_shards = math.ceil(total_ram_gb / shard_ram_gb)` (minimum `1` when `num_vectors > 0`). Return `{"raw_gb": round(raw_gb, 2), "total_ram_gb": round(total_ram_gb, 2), "min_shards": min_shards}`.',
      starterCode: `import math

def plan_vector_cluster(num_vectors: int, dim: int, bytes_per_dim: int = 4, overhead_factor: float = 1.5, shard_ram_gb: float = 64.0) -> dict:
    # Compute raw_gb, total_ram_gb with HNSW overhead, and ceiling shard count
    pass`,
      testCode: `p1 = plan_vector_cluster(10_000_000, dim=1536, bytes_per_dim=4, overhead_factor=1.5, shard_ram_gb=64.0)
assert p1["raw_gb"] == 61.44 and p1["total_ram_gb"] == 92.16 and p1["min_shards"] == 2
p2 = plan_vector_cluster(10_000_000, dim=1536, bytes_per_dim=1, overhead_factor=1.5, shard_ram_gb=64.0)  # int8 quant!
assert p2["raw_gb"] == 15.36 and p2["total_ram_gb"] == 23.04 and p2["min_shards"] == 1
print("PASS: Vector index RAM & quantization planner verified shard counts cleanly!")`,
      solutionCode: `import math

def plan_vector_cluster(num_vectors: int, dim: int, bytes_per_dim: int = 4, overhead_factor: float = 1.5, shard_ram_gb: float = 64.0) -> dict:
    raw_gb = (num_vectors * dim * bytes_per_dim) / (1000 ** 3)
    total_ram_gb = raw_gb * overhead_factor
    min_shards = max(1, math.ceil(total_ram_gb / shard_ram_gb)) if num_vectors > 0 else 0
    return {
        "raw_gb": round(raw_gb, 2),
        "total_ram_gb": round(total_ram_gb, 2),
        "min_shards": min_shards,
    }`,
      hint: 'Use decimal GB `1000 ** 3` (`1e9`) per spec so `10_000_000 * 1536 * 4 / 1e9 == 61.44 GB`, multiply by `overhead_factor`, and divide by `shard_ram_gb` with `math.ceil`.',
      hints: [
        '`raw_gb = (num_vectors * dim * bytes_per_dim) / (1000 ** 3)`.',
        '`total_ram_gb = raw_gb * overhead_factor` accounts for HNSW adjacency lists + Postgres row metadata.',
        'Compute `math.ceil(total_ram_gb / shard_ram_gb)` (returning `0` if `num_vectors == 0`).',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-3-router',
      difficulty: 'debug',
      requires: ['ai-system-design-framework', 'fastapi-endpoints'],
      title: 'Lab 9.3C: Fix Missing Graceful Fallback in Model Cascade Router',
      prompt:
        'A broken AI router `select_inference_path(complexity: float, cache_hit: bool, upstream_healthy: bool) -> str` crashes or sends traffic into a broken upstream LLM whenever `upstream_healthy` is `False`! Fix it cleanly: (1) if `cache_hit` is `True`, return `"semantic_cache"` regardless of upstream health; (2) if `upstream_healthy` is `False`, degrade gracefully to `"bm25_doc_fallback"`; (3) otherwise return `"frontier_model"` when `complexity >= 0.7`, else `"mini_8b_model"`.',
      starterCode: `def select_inference_path(complexity: float, cache_hit: bool, upstream_healthy: bool) -> str:
    # BUG: ignores upstream_healthy == False and sends uncached queries straight into dead LLM APIs!
    if cache_hit:
        return "semantic_cache"
    return "frontier_model" if complexity >= 0.7 else "mini_8b_model"`,
      testCode: `assert select_inference_path(0.95, cache_hit=True, upstream_healthy=False) == "semantic_cache"
assert select_inference_path(0.95, cache_hit=False, upstream_healthy=False) == "bm25_doc_fallback"
assert select_inference_path(0.20, cache_hit=False, upstream_healthy=False) == "bm25_doc_fallback"
assert select_inference_path(0.70, cache_hit=False, upstream_healthy=True) == "frontier_model"
assert select_inference_path(0.40, cache_hit=False, upstream_healthy=True) == "mini_8b_model"
print("PASS: AI cascade router preserved cache hits and degraded cleanly during LLM outage!")`,
      solutionCode: `def select_inference_path(complexity: float, cache_hit: bool, upstream_healthy: bool) -> str:
    if cache_hit:
        return "semantic_cache"
    if not upstream_healthy:
        return "bm25_doc_fallback"
    return "frontier_model" if complexity >= 0.7 else "mini_8b_model"`,
      hint: 'Check `if cache_hit:` first (cache hits stay resilient even when LLM providers go down!), then `if not upstream_healthy: return "bm25_doc_fallback"`.',
      hints: [
        'Keep `if cache_hit: return "semantic_cache"` at the very top—Redis cache still serves answers during LLM outages.',
        'Right after cache check, `if not upstream_healthy: return "bm25_doc_fallback"`.',
        'Finally split healthy uncached traffic at `complexity >= 0.7`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q8-3-1',
      type: 'multiple-choice',
      question: 'Your SaaS app already runs PostgreSQL with relational user permissions and stores `1.2M` document chunks. Which vector store usually minimizes operational complexity first?',
      options: [
        'Deploy three separate distributed vector clusters alongside Kafka CDC streams on day one',
        'Store raw dense float arrays inside versioned JSON blobs on S3 without indexing',
        '`pgvector` keeping HNSW vectors and `WHERE tenant_id = ...` ACID permissions in one DB',
        'Save user embeddings inside browser `localStorage` so clients search chunks locally',
      ],
      correctIndex: 2,
      explanation: 'At ~1.2M chunks, `pgvector` keeps transactional ACID writes, relational permissions, and vectors unified in Postgres with zero sync drift.',
    },
    {
      id: 'q8-3-2',
      type: 'multiple-choice',
      question: 'Why does streaming tokens via Server-Sent Events (SSE) dramatically improve user satisfaction even when a full answer takes 4 seconds?',
      options: [
        'Users see first tokens in ~400ms (TTFT) rather than staring at a frozen spinner for 4s',
        'Because SSE compresses transformer attention matrices inside client WebAssembly browsers',
        'Because HTTP streaming reduces upstream API token billing by 90% automatically',
        'Because SSE converts non-deterministic model hallucinations into verified SQL citations',
      ],
      correctIndex: 0,
      explanation: 'Streaming slashes perceived wait time from total generation time down to Time To First Token (TTFT).',
    },
    {
      id: 'q8-3-3',
      type: 'multiple-choice',
      question: 'In a high-volume support copilot costing `$0.04/ticket` on a frontier model, how do you slash cost below `$0.008/ticket` without hurting hard edge cases?',
      options: [
        'Delete the system prompt instructions so input token lengths fall to zero permanently',
        'Raise sampling temperature to `2.0` and drop all retrieval citations from prompts',
        'Disable automated CI evaluation tests so prompt budgets remain unrestricted',
        'Combine FAQ semantic caching, prefix caching, and an 8B router escalating only hard cases',
      ],
      correctIndex: 3,
      explanation: 'Caching eliminates duplicate FAQ calls while cascading routes ~75% simple tickets to cheap 8B models, reserving frontier spend for genuinely complex requests.',
    },
    {
      id: 'q8-3-4',
      type: 'numeric',
      question: 'Raw `float32` (`4 bytes`) memory required for `5,000,000` vectors of dimension `1000` (using `1 GB = 1e9 bytes`) equals how many GB?',
      options: [],
      correctIndex: 0,
      correctNumber: 20,
      tolerance: 0.1,
      unit: 'GB',
      explanation: '$5{,}000{,}000 \\times 1000 \\times 4 = 20{,}000{,}000{,}000$ bytes $= 20$ GB raw before HNSW graph overhead (~30 GB total).',
    },
    {
      id: 'q8-3-5',
      type: 'spot-bug',
      question: 'An engineer configures a multi-tenant RAG database to fetch global `top_k=5` nearest chunks FIRST, and filters `WHERE chunk.tenant_id == user.tenant_id` in Python AFTERWARD. Why does this fail interviews?',
      options: [
        'HNSW cannot calculate cosine similarity unless strings are encoded in ASCII',
        'Other tenants’ documents crowd out valid matches, causing missing hits and leakage risk',
        'Filtering lists in Python consumes `O(n^3)` memory when `k` equals `5`',
        'Post-filtering causes PostgreSQL to drop database indices automatically on read queries',
      ],
      correctIndex: 1,
      explanation: 'If another tenant owns the top 5 global hits, post-filtering returns empty results even when the caller’s tenant has relevant matches at rank 6+. Always pre-filter ACLs inside the search index.',
    },
    {
      id: 'q8-3-6',
      type: 'multi-select',
      question: 'Select the TWO scenarios where **self-hosting vLLM** typically outperforms calling a hosted frontier API.',
      options: [
        'Strict regulatory/HIPAA data residency forbidding prompts from leaving private VPC infrastructure',
        'Steady high GPU utilization running a specialized distilled 8B–70B model at high QPS',
        'Early MVP prototypes receiving 150 random queries per day from beta testers',
        'Needing frontier multi-step agent reasoning on rare complex workflows with spiky load',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Privacy constraints and steady high-volume distilled workloads justify dedicated GPU fleets; low-volume MVPs and complex spiky traffic fit hosted APIs far better.',
    },
    {
      id: 'q8-3-7',
      type: 'ordering',
      question: 'Order the **5 Pillars of AI System Design** from FIRST to LAST in a 45-minute interview.',
      items: [
        'Clarify functional scope, SLAs (`TTFT`), tenant ACLs, and budget constraints',
        'Design ingestion sync + hybrid BM25/vector retrieval with ACL pre-filtering',
        'Layer caching, model routing, structured outputs, and HITL tool guardrails',
        'Specify offline CI golden eval gates, online telemetry, and outage fallbacks',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Always align on requirements/SLAs before drawing ingestion/retrieval, optimization/guardrails, and evals/resilience.',
    },
    {
      id: 'q8-3-8',
      type: 'predict-output',
      question: 'Total user wait time is `TTFT = cache(10ms) + embed(40ms) + search(50ms) + rerank(120ms) + prefill(330ms)`. If your SLA requires `TTFT < 800ms`, what happens when a developer adds a slow `400ms` sequential LLM query-rewriter before embedding?',
      options: [
        'TTFT stays at `550ms` because asyncio runs sequential awaits instantaneously',
        'TTFT rises to `950ms`, breaching the `800ms` interactive SLA by `150ms`',
        'TTFT drops to `350ms` because rewritten queries shrink BM25 dictionary lookups',
        'Rerank time disappears automatically whenever query rewriting returns three keywords',
      ],
      correctIndex: 1,
      explanation: '`550ms + 400ms = 950ms > 800ms`. Adding serial LLM calls in the critical path breaks interactive TTFT SLAs unless skipped or run selectively on ambiguous queries.',
    },
    {
      id: 'q8-3-9',
      type: 'multiple-choice',
      question: 'When the upstream LLM API starts returning `503 Service Unavailable` or timing out past `4s`, what is the healthiest degraded behavior for an enterprise RAG search copilot?',
      options: [
        'Retry in an infinite `while True:` loop with zero backoff until the server runs out of RAM',
        'Return an unhandled Python stack trace straight into the user chat bubble as raw JSON',
        'Trip the circuit breaker to a secondary model or return verified BM25/reranked doc links',
        'Shut down `/healthz` permanently so Kubernetes deletes every web pod across all regions',
      ],
      correctIndex: 2,
      explanation: 'Graceful degradation via secondary provider failover or verified doc snippets keeps users productive instead of cascading total downtime.',
    },
  ],
};
