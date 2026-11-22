import type { Lesson } from '@/types/course';

export const lesson7_3: Lesson = {
  id: '7-3',
  moduleId: 'mod-7',
  number: '7.3',
  title: 'Inference Optimization, FinOps Unit Economics & Span Tracing',
  subtitle: 'Diagnose Prefill (TTFT) vs Decode (TPOT), understand Continuous Batching, PagedAttention, and Speculative Decoding, and instrument nested OpenTelemetry span trees.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['5.3', '6.5'],
  requires: ['llm-caching', 'model-routing', 'llm-retries-cost'],
  teaches: [
    'ttft-vs-tpot',
    'paged-attention',
    'speculative-decoding',
    'span-tracing',
  ],
  competencies: ['mid-observability-cost', 'sr-finops-scale'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Separate compute-bound **Prefill (TTFT)** from memory-bandwidth-bound **Decode (TPOT)** so optimization targets the real bottleneck.',
    'Explain how **Continuous Batching** and **PagedAttention (vLLM)** eliminate GPU idle wait and KV-cache fragmentation waste.',
    'Understand why **Speculative Decoding** accelerates autoregressive decoding without altering the exact target output probability distribution.',
    'Instrument nested **OpenTelemetry-style Span Traces** tracking retrieval, reranking, LLM TTFT/TPOT, guardrails, and USD unit cost.',
  ],
  checkWithoutNotes: [
    'Why is Prefill compute-bound while Decode is memory-bandwidth-bound on modern GPUs?',
    'What memory waste does vLLM PagedAttention eliminate compared to pre-allocating one contiguous `max_seq_len` buffer per request?',
    'How can Speculative Decoding verify 5 draft tokens in almost the same time as generating 1 token while keeping the target distribution exact?',
    'What fields must an AI Span Trace capture so you can explain a slow or inaccurate RAG reply in 30 seconds?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Demo prototypes only serve one developer hitting Enter every thirty seconds. The moment your app launches to five hundred simultaneous users, naive inference stacks crawl: long system prompts push Time to First Token (TTFT) past 4 seconds, contiguous KV-cache buffers exhaust GPU VRAM after only 8 concurrent users, and monthly API or GPU invoices surprise finance because nobody modeled unit economics (`cost_per_user_session`) upfront.',
        'At the same time, when a customer complains *"this response took 11 seconds!"*, guessing blindly between network latency, slow vector search, oversized prompts, or output length gets you nowhere. Mastering **Prefill vs Decode mechanics**, **vLLM PagedAttention & Continuous Batching**, **Speculative Decoding**, **Prompt Prefix Caching**, and **OpenTelemetry Span Tracing** turns serving speed and cloud unit economics into predictable engineering.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Two Phases of LLM Generation & Virtual Memory Paging',
      paragraphs: [
        'Think of LLM generation like reading a 10-page dossier and then typing a 200-word memo one letter at a time. **Phase 1 — Prefill (drives TTFT, Time to First Token)** reads your entire prompt at once using large dense matrix-matrix multiplies across every input token simultaneously. Modern GPUs love parallel matrix multiplies, making Prefill **compute-bound (FLOP-limited)**. You slash TTFT by shrinking redundant prompt tokens or enabling **KV Prompt Prefix Caching** so shared leading system/tool blocks reuse precomputed Key-Value tensors instead of recomputing them every request.',
        '**Phase 2 — Decode (drives TPOT, Time Per Output Token)** emits **one single token per forward pass**. Each token has to load billions of model weights plus the growing **KV cache** from slow GPU HBM VRAM into fast SRAM compute cores just to multiply one tiny vector! That makes Decode strictly **memory-bandwidth-bound**—which is why quantizing weights (`FP8` or `AWQ 4-bit`) speeds decoding directly by moving half as many bytes per token.',
        'Now see why naive batching wastes GPU memory: if max context is `8,192` tokens yet most requests finish around `600` tokens, reserving a contiguous `8,192`-slot KV tensor per active user wastes huge chunks of VRAM to fragmentation (**internal & external fragmentation**). **vLLM PagedAttention** borrows OS virtual memory paging: it breaks KV caches into tiny non-contiguous fixed-size pages (`16` tokens per block) allocated purely on demand, letting **Continuous Batching** swap completed sequences out immediately and pack far more concurrent requests onto the same GPU! Meanwhile, **Speculative Decoding** runs a tiny cheap draft model proposing $k$ candidate tokens sequentially, then lets the giant target model verify all $k$ tokens in **one parallel compute-bound pass**—accepting matching distributions via exact rejection sampling so output quality stays mathematically identical.',
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'latency-economics',
      title: 'Interactive Lab: Production AI Unit Economics & Latency Calculator',
      description:
        'Model monthly DAU, prompt/completion tokens, prompt cache hit rate, and model routing split to optimize gross margin and p95 latency.',
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'The #1 FinOps Lever: Model Cascading / Routing + Prefix Caching',
      body: 'Combine static prompt prefixes (for provider KV Prefix Caching) with complexity routing (sending routine classification/extraction to fast small models while reserving flagship models for multi-step reasoning). Always track monthly gross margin: `revenue_per_user - avg_queries_per_user * avg_cost_per_query`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Modeling End-to-End Request Latency & FinOps Unit Economics',
      paragraphs: [
        'Calculate end-to-end SLA latency directly from component timings instead of guessing. Total response duration equals: $\\text{Retrieval} + \\text{Rerank} + \\text{TTFT} + (N_{\\text{out}} \\times \\text{TPOT}) + \\text{Guardrail}$. Suppose retrieval + rerank takes `90 ms`, Prefill TTFT takes `280 ms`, and Decode runs at `TPOT = 18 ms/token` for `150` output tokens (`2,700 ms`). Total completion time hits `90 + 280 + 2700 = 3,070 ms` (~3.1s)—while streaming delivers the very first word to the user in only `370 ms`!',
        'Verify your **FinOps margin math** cleanly as well: if a SaaS tier charges `\$15.00/month` per active seat and each user averages `400` routed queries/month costing `\$0.0022` each, monthly AI COGS equals `\$0.88` (`94%` gross margin before infra). Without routing/caching, if every query hit an uncached frontier prompt costing `\$0.028`, COGS jumps to `\$11.20/user`, crushing SaaS margins overnight!',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Hierarchical Span Trace Rollup + Latency Breakdown',
      language: 'python',
      code: `from dataclasses import dataclass, field

@dataclass
class TraceSpan:
    name: str
    duration_ms: float
    cost_usd: float = 0.0
    children: list["TraceSpan"] = field(default_factory=list)

def summarize_trace(root: TraceSpan) -> dict:
    total_cost = root.cost_usd + sum(summarize_trace(c)["total_cost"] for c in root.children)
    child_ms = sum(c.duration_ms for c in root.children)
    slowest = max(root.children, key=lambda c: c.duration_ms).name if root.children else root.name
    return {"root": root.name, "children_ms": round(child_ms, 1), "total_cost": round(total_cost, 5), "bottleneck": slowest}

req = TraceSpan("rag_request", 320.0, children=[
    TraceSpan("hybrid_search", 42.0),
    TraceSpan("cross_encoder_rerank", 68.0),
    TraceSpan("llm_generate", 195.0, cost_usd=0.0014),
    TraceSpan("output_guardrail", 15.0),
])
print(summarize_trace(req))`,
      caption: 'Explained output: `{\'root\': \'rag_request\', \'children_ms\': 320.0, \'total_cost\': 0.0014, \'bottleneck\': \'llm_generate\'}`. Nested spans pinpoint slow stages immediately without guesswork.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: KV Cache Sizing, Quantization (`FP8`/`AWQ`) & Queue Saturation',
      paragraphs: [
        'Inspect simple KV cache VRAM sizing on a Transformer (`L=32` layers, `H_kv=8` GQA KV heads, head dim `d=128`, `fp16=2` bytes, `2` tensors for K and V). Per single token, KV cache consumes $2 \\times L \\times H_{\\text{kv}} \\times d \\times 2 = 2 \\times 32 \\times 8 \\times 128 \\times 2 = 131{,}072$ bytes (`128 KB/token`). Over a `4,096`-token context, that equals `512 MB` per concurrent user! You immediately understand why GQA (Grouped-Query Attention) and PagedAttention matter so much: on `40 GB` leftover VRAM after weights, naive `8,192`-slot static pre-allocation (`1 GB/user`) caps concurrency at 40 slots even if actual average length is 500 tokens (`64 MB/user`), whereas dynamic PagedAttention packs vastly more live sessions cleanly.',
        'Weight quantization works hand in hand with PagedAttention during memory-bandwidth-bound Decode: shrinking a `70B` model from `FP16` (`140 GB`—requiring two `80 GB` GPUs) down to `AWQ 4-bit` (`~35–40 GB`) fits cleanly onto a single `80 GB` GPU with room left over for KV cache pages, while halving or quartering memory bytes fetched per token step. Always evaluate quantized checkpoints against your golden eval suite (`7.2`)—especially on complex coding or math reasoning—before swapping production endpoints.',
        'Watch also **tail latency (`p95`/`p99`) under queue spikes**: even when individual forward passes average 1.2s at steady load, sending `2×` request bursts can push queue wait times above 8 seconds! Expose live queue depth, KV-cache utilization %, and `p95` TTFT/TPOT dashboards alongside hard max concurrency limits (`HTTP 503` load-shedding with `Retry-After`) so overloaded replicas never hang silently.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Optimizing TTFT when users complain about 12-second full generation on long outputs:** If output spans 600 tokens at `25 ms/token`, decode takes `15 seconds` while prefill only took `300 ms`! Always inspect TTFT vs `tokens * TPOT` separately before choosing a fix.',
        '**Mistake 2 — Using static request batching instead of Continuous Batching:** Waiting until the longest 1,000-token answer finishes before starting new queued requests leaves short 40-token callers stranded idle. Continuous (iteration-level) batching swaps finished slots at every single decode step.',
        '**Mistake 3 — Placing dynamic variables at line 1 of system prompts:** Changing user names or timestamps at the start invalidates every prefix token\'s KV cache! Always anchor static instructions and tool definitions first.',
        '**Mistake 4 — Logging flat print messages instead of correlated `trace_id` Span Trees:** When ten microservices run concurrently, isolated log lines cannot reconstruct which retrieval call produced which hallucinated output.',
        '**Mistake 5 — Ignoring Speculative Decoding acceptance rate on narrow domain tasks:** If a generic tiny draft model disagrees with your specialized SQL or Arabic target model (`acceptance < 40%`), verification wastes compute rather than speeding decode! Benchmark actual end-to-end `p50` and `p95` TPOT on representative production prompts before enabling speculative decoding.',
        '**Mistake 6 — Over-provisioning GPU replicas for peak without autoscaling & graceful load-shedding:** Measure active KV-cache saturation and queue wait duration to scale replicas cleanly and fail fast (`HTTP 503`) before queues explode.',
        '**Mistake 7 — Letting huge 32K prefill jobs stall active streaming decode users:** Enable **Chunked Prefill** in serving engines like vLLM so long incoming documents slice into smaller compute chunks interleaved smoothly with ongoing decode steps, keeping TPOT steady for concurrent chatters.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Inference Bottlenecks & Optimization Levers',
      headers: ['Lever', 'Targets Phase', 'Throughput / Latency Effect', 'Caveat to Watch'],
      rows: [
        ['Prompt Prefix Caching', 'Prefill (TTFT)', 'Skips recomputing static system/tool KV pages', 'Dynamic values at prompt line 1 break prefix match'],
        ['PagedAttention + Cont. Batch', 'Decode Concurrency', 'Packs variable-length KV blocks without OOM waste', 'Needs explicit concurrency caps & queue depth alerts'],
        ['AWQ / FP8 Weight Quant', 'Decode (TPOT)', 'Cuts HBM weight bytes moved per output token', 'Can degrade tiny <=3B models on strict JSON/math'],
        ['Speculative Decoding', 'Decode (TPOT)', 'Verifies k draft tokens in parallel; exact output math', 'Wastes compute if draft acceptance drops under ~40%'],
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Separate Prefill vs Decode:** Prefill (TTFT) is compute-bound (fix with shorter prompts & Prefix Caching); Decode (TPOT) is memory-bandwidth-bound (fix with quantization, GQA, & Speculative Decoding).',
        '2. **Page KV caches dynamically:** vLLM PagedAttention + Continuous Batching eliminate pre-allocated VRAM fragmentation waste.',
        '3. **Speculative Decoding preserves output math:** Small draft proposes $k$ tokens; target model verifies all $k$ in parallel without quality loss.',
        '4. **Protect SaaS unit economics:** Pair prompt prefix caching with complexity routing and verify `cost_per_user <= budget`.',
        '5. **Trace every stage structurally:** Nested OpenTelemetry spans link retrieval, reranking, generation, and guardrails under one `trace_id`.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-3-1',
      difficulty: 'guided',
      requires: ['ttft-vs-tpot', 'paged-attention'],
      title: 'Lab 7.3.1 (Guided): End-to-End SLA Latency & KV Cache Memory Sizing',
      prompt:
        'Implement two serving-capacity helpers: 1) `estimate_latency_ms(retrieval_ms, ttft_ms, out_tokens, tpot_ms)` returning `{"first_token_ms": retrieval_ms + ttft_ms, "total_ms": retrieval_ms + ttft_ms + out_tokens * tpot_ms}`. 2) `kv_cache_mb(num_layers, kv_heads, head_dim, seq_len, bytes_per_elem=2)` computing `2 * num_layers * kv_heads * head_dim * seq_len * bytes_per_elem / (1024 ** 2)` megabytes (MiB).',
      starterCode: `def estimate_latency_ms(retrieval_ms: float, ttft_ms: float, out_tokens: int, tpot_ms: float) -> dict[str, float]:
    pass

def kv_cache_mb(num_layers: int, kv_heads: int, head_dim: int, seq_len: int, bytes_per_elem: int = 2) -> float:
    pass`,
      testCode: `lat = estimate_latency_ms(80.0, 220.0, 100, 15.0)
assert abs(lat["first_token_ms"] - 300.0) < 1e-6
assert abs(lat["total_ms"] - 1800.0) < 1e-6

# 32 layers, 8 kv heads, 128 head_dim, 4096 seq_len, fp16 (2 bytes) -> 512.0 MiB
mb = kv_cache_mb(32, 8, 128, 4096, 2)
assert abs(mb - 512.0) < 1e-6, f"Expected 512.0 MiB, got {mb}"
print("PASS: Lab 7.3.1 Latency SLA & KV cache sizing passed!")`,
      solutionCode: `def estimate_latency_ms(retrieval_ms: float, ttft_ms: float, out_tokens: int, tpot_ms: float) -> dict[str, float]:
    first = retrieval_ms + ttft_ms
    total = first + (out_tokens * tpot_ms)
    return {"first_token_ms": first, "total_ms": total}

def kv_cache_mb(num_layers: int, kv_heads: int, head_dim: int, seq_len: int, bytes_per_elem: int = 2) -> float:
    total_bytes = 2 * num_layers * kv_heads * head_dim * seq_len * bytes_per_elem
    return total_bytes / (1024 ** 2)`,
      hint: 'Factor of `2` in KV cache accounts for storing BOTH Key and Value tensors per layer; divide bytes by `1024 ** 2` for MiB.',
      hints: [
        '`first_token_ms = retrieval_ms + ttft_ms`, `total_ms = first_token_ms + out_tokens * tpot_ms`.',
        'Multiply `2 * num_layers * kv_heads * head_dim * seq_len * bytes_per_elem`.',
        'Divide bytes by `1024 * 1024` (`1024 ** 2`).',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-3-2',
      difficulty: 'spec',
      requires: ['span-tracing'],
      title: 'Lab 7.3.2 (From Spec): OpenTelemetry-Style Span Tree Aggregator',
      prompt:
        'Implement `aggregate_trace(spans)` where `spans` is a flat list of span dicts recorded under one `trace_id`: `{"span_id": str, "parent_id": str | None, "name": str, "ms": float, "cost_usd": float, "status": "ok"|"error"}`. Return `{"total_cost": float, "root_ms": float, "slowest_child": str | None, "has_errors": bool}`. `root_ms` is the `"ms"` of the span with `parent_id is None` (assume 1 root; `0.0` if missing). `slowest_child` is the `"name"` of the non-root span with highest `"ms"` (`None` if no children). `total_cost` sums `"cost_usd"` across ALL spans (rounded to 6 decimals), and `has_errors` is `True` if any span has `status == "error"`.',
      starterCode: `def aggregate_trace(spans: list[dict]) -> dict:
    # Aggregate total_cost, root_ms, slowest_child, and has_errors from span records
    pass`,
      testCode: `spans = [
    {"span_id": "s0", "parent_id": None, "name": "request", "ms": 420.0, "cost_usd": 0.0, "status": "ok"},
    {"span_id": "s1", "parent_id": "s0", "name": "retrieve", "ms": 55.0, "cost_usd": 0.0001, "status": "ok"},
    {"span_id": "s2", "parent_id": "s0", "name": "llm", "ms": 310.0, "cost_usd": 0.0025, "status": "ok"},
    {"span_id": "s3", "parent_id": "s0", "name": "guardrail", "ms": 20.0, "cost_usd": 0.0, "status": "error"},
]
out = aggregate_trace(spans)
assert out == {"total_cost": 0.0026, "root_ms": 420.0, "slowest_child": "llm", "has_errors": True}, f"Got {out}"
assert aggregate_trace([{"span_id": "r", "parent_id": None, "name": "only", "ms": 10.0, "cost_usd": 0.0, "status": "ok"}])["slowest_child"] is None
print("PASS: Lab 7.3.2 Trace span aggregator passed!")`,
      solutionCode: `def aggregate_trace(spans: list[dict]) -> dict:
    total_cost = round(sum(float(s.get("cost_usd", 0.0)) for s in spans), 6)
    has_errors = any(s.get("status") == "error" for s in spans)
    roots = [s for s in spans if s.get("parent_id") is None]
    root_ms = float(roots[0]["ms"]) if roots else 0.0
    children = [s for s in spans if s.get("parent_id") is not None]
    slowest_child = max(children, key=lambda c: c["ms"])["name"] if children else None
    return {
        "total_cost": total_cost,
        "root_ms": root_ms,
        "slowest_child": slowest_child,
        "has_errors": has_errors,
    }`,
      hint: 'Separate `parent_id is None` (root) from `parent_id is not None` (children), sum `cost_usd` across all spans, and use `max(children, key=lambda c: c["ms"])`.',
      hints: [
        'Use `any(s.get("status") == "error" for s in spans)` for `has_errors`.',
        'Filter `children = [s for s in spans if s.get("parent_id") is not None]` before finding `slowest_child`.',
        'Round `total_cost` to 6 decimal places cleanly.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-3-3',
      difficulty: 'debug',
      requires: ['speculative-decoding', 'ttft-vs-tpot'],
      title: 'Lab 7.3.3 (Debug Buggy Code): Fix FinOps Margin & Speculative Batch Speedup Bugs',
      prompt:
        'A broken FinOps estimator miscomputes two serving checks: 1) `monthly_gross_margin_pct(seat_price, queries_per_seat, cost_per_query)` divides `cogs / seat_price` (returning cost ratio instead of `(seat_price - cogs) / seat_price * 100`!). 2) `paged_concurrency(free_vram_mb, avg_kv_mb, max_kv_mb, use_paged=True)` mistakenly divides by `max_kv_mb` even when `use_paged=True`! Fix both functions so paged serving uses `avg_kv_mb` while naive contiguous uses `max_kv_mb` (`int(free_vram_mb // per_req_mb)`).',
      starterCode: `def monthly_gross_margin_pct(seat_price: float, queries_per_seat: int, cost_per_query: float) -> float:
    cogs = queries_per_seat * cost_per_query
    # Bug 1: returns cost percentage instead of gross margin %!
    return round((cogs / seat_price) * 100.0, 2)

def paged_concurrency(free_vram_mb: float, avg_kv_mb: float, max_kv_mb: float, use_paged: bool = True) -> int:
    # Bug 2: always divides by max_kv_mb even when PagedAttention is enabled!
    return int(free_vram_mb // max_kv_mb)`,
      testCode: `assert monthly_gross_margin_pct(20.0, 500, 0.002) == 95.0, f"Expected 95.0%, got {monthly_gross_margin_pct(20.0, 500, 0.002)}"
assert monthly_gross_margin_pct(10.0, 1000, 0.015) == -50.0

assert paged_concurrency(4096.0, avg_kv_mb=64.0, max_kv_mb=1024.0, use_paged=False) == 4
assert paged_concurrency(4096.0, avg_kv_mb=64.0, max_kv_mb=1024.0, use_paged=True) == 64
print("PASS: Lab 7.3.3 FinOps margin & PagedAttention concurrency fixed!")`,
      solutionCode: `def monthly_gross_margin_pct(seat_price: float, queries_per_seat: int, cost_per_query: float) -> float:
    cogs = queries_per_seat * cost_per_query
    return round(((seat_price - cogs) / seat_price) * 100.0, 2)

def paged_concurrency(free_vram_mb: float, avg_kv_mb: float, max_kv_mb: float, use_paged: bool = True) -> int:
    per_req = avg_kv_mb if use_paged else max_kv_mb
    return int(free_vram_mb // per_req)`,
      hint: 'Gross margin `%` is `((seat_price - cogs) / seat_price) * 100.0`, and PagedAttention sizes per active session using `avg_kv_mb` rather than worst-case `max_kv_mb`.',
      hints: [
        'Subtract `cogs` from `seat_price` in the numerator of gross margin.',
        'Pick `per_req = avg_kv_mb if use_paged else max_kv_mb`.',
        'Divide `free_vram_mb // per_req` as an integer count.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q7-3-1',
      type: 'multiple-choice',
      question: 'Why does **Speculative Decoding** accelerate generation speed WITHOUT changing the target model’s output distribution?',
      options: [
        'A tiny draft proposes $k$ tokens and the target verifies all $k$ in parallel',
        'It disables Softmax normalization on every third generated output vocabulary token',
        'It quantizes all large target-model attention blocks permanently to 1-bit weights',
        'It drops the leading system prompt from KV cache after generating token 1',
      ],
      correctIndex: 0,
      explanation: 'Verification runs in parallel like prefill (compute-efficient), and modified rejection sampling mathematically preserves the exact target model distribution!',
    },
    {
      id: 'q7-3-2',
      type: 'multiple-choice',
      question: 'What GPU serving bottleneck does **PagedAttention (vLLM)** directly eliminate?',
      options: [
        'Slow BPE regex tokenization speed across non-ASCII Unicode strings',
        'KV-cache pre-allocation waste and memory fragmentation across variable lengths',
        'Long TLS/SSL network handshakes between web browsers and API gateways',
        'Train/evaluation data leakage inside supervised fine-tuning JSONL datasets',
      ],
      correctIndex: 1,
      explanation: 'Reserving contiguous `max_seq_len` buffers wastes most VRAM on short/medium chats; paging KV blocks on demand raises concurrency dramatically.',
    },
    {
      id: 'q7-3-3',
      type: 'multiple-choice',
      question: 'Your app prepends the exact same 6,000-token system prompt and tool docs to every request. Which feature cuts TTFT latency and input cost?',
      options: [
        'Increasing sampling `temperature` up toward `1.5` before calling Softmax',
        'Switching `top_k` sampling candidates upward inside the decoder settings',
        'Prompt Prefix Caching (reusing computed KV tensors for static leading tokens)',
        'Disabling HTTP SSE streaming so tokens buffer completely on the server',
      ],
      correctIndex: 2,
      explanation: 'Prefix caching preserves the precomputed KV tensors of identical leading prefixes, skipping redundant prefill FLOPs.',
    },
    {
      id: 'q7-3-4',
      type: 'numeric',
      question: 'If retrieval takes `70` ms, prefill TTFT takes `230` ms, and decode emits `100` tokens at `20` ms/token, what is total response completion time in milliseconds?',
      options: [],
      correctIndex: 0,
      correctNumber: 2300,
      tolerance: 0,
      unit: 'ms',
      explanation: '`70 + 230 + (100 * 20) = 300 + 2000 = 2300` ms.',
    },
    {
      id: 'q7-3-5',
      type: 'spot-bug',
      code: `system = f"Current UTC time: {datetime.utcnow()}\\n" + STATIC_INSTRUCTIONS_6K_TOKENS`,
      question: 'Why does putting `datetime.utcnow()` on line 1 destroy provider KV Prefix Caching?',
      options: [
        'Python `datetime` objects cannot convert into valid UTF-8 strings inside f-strings',
        'KV Prefix Caching requires an identical leading prefix; changing line 1 misses every time',
        'Providers block requests containing UTC timestamps for security reasons',
        'Timestamps force the inference engine to disable Continuous Batching',
      ],
      correctIndex: 1,
      explanation: 'KV caches reuse shared computations strictly from token `0` onward until the first differing token. Put dynamic timestamps at the END of context, never at index 0.',
    },
    {
      id: 'q7-3-6',
      type: 'multi-select',
      question: 'Which TWO statements accurately compare Prefill vs Decode phases of LLM inference?',
      options: [
        'Prefill processes all prompt tokens in parallel (`compute-bound`), governing Time to First Token (TTFT)',
        'Decode generates one token per step while streaming model weights + KV cache (`memory-bandwidth-bound`), governing TPOT',
        'Decode is strictly compute-bound while Prefill is strictly memory-bandwidth-bound',
        'Quantizing weights from FP16 to FP8 slows down Decode because unpacking wastes FLOPs',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Prefill saturates parallel tensor cores; Decode streams weights per token across memory bandwidth (so smaller quantized weights speed up Decode!).',
    },
    {
      id: 'q7-3-7',
      type: 'predict-output',
      code: `spans = [{"name": "a", "ms": 20}, {"name": "b", "ms": 140}, {"name": "c", "ms": 35}]
print(max(spans, key=lambda s: s["ms"])["name"])`,
      question: 'Which span name is identified as the latency bottleneck?',
      options: [
        '`"a"`',
        '`"c"`',
        '`"b"`',
        '`140`',
      ],
      correctIndex: 2,
      explanation: '`max(..., key=lambda s: s["ms"])` returns the dict with `"ms": 140`, whose `["name"]` is `"b"`.',
    },
    {
      id: 'q7-3-8',
      type: 'ordering',
      question: 'Order the end-to-end execution timeline inside one RAG trace span tree:',
      options: [],
      items: [
        'Open root trace_id span on incoming user request',
        'Record retrieval & Cross-Encoder rerank child spans',
        'Record LLM generation child span capturing TTFT, tokens, and USD cost',
        'Record final output guardrail span and return response',
      ],
      correctIndex: 0,
      explanation: 'Root request creates `trace_id` -> child search/rerank spans -> child LLM generation telemetry -> final guardrail verification.',
    },
    {
      id: 'q7-3-9',
      type: 'multiple-choice',
      question: 'How does **Continuous Batching** improve GPU serving throughput compared to naive static request batching?',
      options: [
        'It delays all short queries until the slowest 1,500-token request finishes decoding',
        'It doubles batch latency deliberately so GPU utilization drops below 20%',
        'It skips tokenization completely on repeated requests inside the same batch',
        'It inserts newly queued requests at any decode step the instant another sequence finishes',
      ],
      correctIndex: 3,
      explanation: 'Iteration-level scheduling frees finished slots immediately rather than idling while long sequences complete.',
    },
  ],
};
