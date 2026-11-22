import type { Lesson } from '@/types/course';

export const lesson11_1: Lesson = {
  id: '11-1',
  moduleId: 'mod-11',
  number: '11.1',
  title: 'LLMOps Observability: OpenTelemetry GenAI Spans & Trace Debugging',
  subtitle: 'Instrument distributed AI traces linking retrieval, reranking, model inference, and tools using OpenTelemetry semantic conventions, prompt hashes, and PII redaction.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['9.1', '10.1'],
  requires: ['incident-response', 'prompt-prefix-caching'],
  teaches: ['otel-genai-tracing', 'trace-prompt-correlation', 'telemetry-pii-scrub'],
  competencies: ['mid-observability-cost', 'mid-incidents-design'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Structure hierarchical parent/child OpenTelemetry spans for RAG and agent requests (`request -> retrieval -> rerank -> llm -> tool`).',
    'Attach standard `gen_ai.*` semantic attributes (`gen_ai.system`, `gen_ai.usage.input_tokens`, `prompt_sha`, `index_version`) so metrics aggregate cleanly in tools like Arize Phoenix, Langfuse, or Grafana.',
    'Isolate p95 tail-latency bottlenecks across critical-path child spans rather than guessing blindly.',
    'Scrub credentials, emails, and customer PII cleanly before exporting trace attributes outside VPC boundaries.',
  ],
  checkWithoutNotes: [
    'Why do plain HTTP request logs (`POST /ask 200 1850ms`) fail to diagnose AI latency or quality regressions?',
    'Name four essential attributes to record on every `gen_ai.chat` child span.',
    'How does linking `prompt_version` and `index_version` inside spans speed up 2 AM incident triage?',
    'Why must telemetry exporters run redaction filters ahead of sending payloads to hosted trace dashboards?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why HTTP Access Logs Cannot Debug Production AI Systems',
      paragraphs: [
        'In classic web microservices, an HTTP log showing `POST /v1/checkout 200 48ms` tells you almost everything needed for healthy operations. In AI backends, `POST /v1/ask 200 2,840ms` hides five distinct failure layers inside one status code: did Redis time out, did hybrid search scan 500k vectors unindexed, did the reranker stall, did the LLM retry three times after upstream 429s, or did a silent prompt edit cut answer accuracy in half?',
        'Structured distributed tracing solves this by breaking every user interaction into one root **Trace** composed of timed nested **Spans** carrying typed attributes and token usage counters.',
        'The mental model is a clinical emergency-room chart paired with a factory stopwatch. Instead of timing only how long the patient spent inside the hospital, every step—triage, lab draw, imaging, specialist consult—logs exact duration, operator version, and red-flagged anomalies under one shared `trace_id`.',
      ],
    },
    {
      type: 'prose',
      heading: 'OpenTelemetry GenAI Conventions, Prompt Versioning & Redaction',
      paragraphs: [
        'Vendor lock-in happens quickly when teams sprinkle proprietary SDK decorators across every file. Using OpenTelemetry (`opentelemetry-api` + `gen_ai.*` semantic attributes) lets you export identical spans to self-hosted Arize Phoenix, Langfuse, Honeycomb, or Datadog without rewriting instrumentation.',
        'Every LLM child span should capture `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.usage.cached_tokens`, `prompt_sha`, `cost_usd`, and `finish_reason`. Retrieval spans should capture `rag.index_version`, `rag.candidate_count`, and `rag.rerank_ms`.',
        'Equally vital: **scrub secrets and PII before leaving the process**. Trace dashboards are frequently accessible to broader product and QA engineers; logging raw Authorization headers, JWTs, API keys, or unmasked customer emails creates instant OWASP LLM06 compliance breaches.',
      ],
    },
    {
      type: 'code',
      title: 'Minimal Structured OTel-Compatible GenAI Span Recorder',
      language: 'python',
      code: `def build_genai_span(trace_id: str, span_name: str, duration_ms: float, attrs: dict) -> dict:
    safe_attrs = {k: v for k, v in attrs.items() if "secret" not in k.lower() and "key" not in k.lower()}
    return {
        "trace_id": trace_id,
        "name": span_name,
        "duration_ms": round(duration_ms, 2),
        "attributes": safe_attrs,
    }`,
      caption: 'Keep attribute names standardized (gen_ai.*, prompt_sha) and strip sensitive keys before emission.',
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: Silent Regression Hidden Behind HTTP 200',
      paragraphs: [
        'A coding copilot deployed an updated RAG system prompt Friday afternoon. HTTP availability remained 99.98% and p95 latency actually improved slightly, yet user thumbs-down feedback tripled over the weekend.',
        'Without `prompt_sha` stamped onto traces, engineers spent five hours Monday testing vector index drift before discovering an unreviewed prompt change stripped XML citation formatting. Adding immutable Git `prompt_sha` and `index_version` tags onto every root trace enabled side-by-side cohort comparison in thirty seconds during future releases.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: AI Observability Approaches',
      headers: ['Approach', 'Strengths', 'Overhead / Risk', 'When to Use'],
      rows: [
        ['OpenTelemetry `gen_ai.*` Spans', 'Vendor-neutral standard, ties into infra APM', 'Requires discipline on PII scrubbing', 'All production FastAPI/worker AI services'],
        ['Prompt/Corpus Version Tags', 'Instant before/after cohort slicing', 'Near-zero CPU/cost overhead', 'Mandatory on every deploy'],
        ['Full Raw Payload Capture', 'Deep qualitative debugging', 'High storage cost + PII leak exposure', 'Sampled + scrubbed or dev/staging only'],
        ['Metrics-Only Counters (Prometheus)', 'Ultra-cheap alerting on latency/spend', 'Cannot inspect failing individual traces', 'Pair with sampled OTel spans'],
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-11-1-spans',
      title: 'Lab 11.1a: Critical-Path Trace Bottleneck Analyzer',
      prompt: 'Implement `summarize_trace(spans: list[dict]) -> dict`: given child spans `{"name": str, "duration_ms": float, "tokens_in": int, "tokens_out": int}`, compute `total_ms`, `slowest_span`, `total_tokens`, and `span_pct_breakdown` (`{name: round(dur / total * 100, 1)}`).',
      difficulty: 'guided',
      starterCode: `def summarize_trace(spans: list[dict]) -> dict:
    # Sum durations and tokens across child spans and identify the slowest span
    return {}`,
      testCode: `SPANS = [
    {"name": "embed_query", "duration_ms": 45.0, "tokens_in": 12, "tokens_out": 0},
    {"name": "hybrid_search", "duration_ms": 60.0, "tokens_in": 0, "tokens_out": 0},
    {"name": "reranker", "duration_ms": 295.0, "tokens_in": 0, "tokens_out": 0},
    {"name": "llm_chat", "duration_ms": 400.0, "tokens_in": 1800, "tokens_out": 188},
]
s = summarize_trace(SPANS)
assert s["total_ms"] == 800.0 and s["slowest_span"] == "llm_chat" and s["total_tokens"] == 2000
assert s["span_pct_breakdown"]["reranker"] == 36.9
print("PASS: Lab 11.1a critical-path span analyzer verified!")`,
      solutionCode: `def summarize_trace(spans: list[dict]) -> dict:
    total_ms = round(sum(float(s.get("duration_ms", 0.0)) for s in spans), 2)
    total_tokens = sum(int(s.get("tokens_in", 0)) + int(s.get("tokens_out", 0)) for s in spans)
    slowest = max(spans, key=lambda s: float(s.get("duration_ms", 0.0)))["name"] if spans else ""
    denom = total_ms if total_ms > 0 else 1.0
    breakdown = {s["name"]: round((float(s.get("duration_ms", 0.0)) / denom) * 100.0, 1) for s in spans}
    return {
        "total_ms": total_ms,
        "slowest_span": slowest,
        "total_tokens": total_tokens,
        "span_pct_breakdown": breakdown,
    }`,
      hint: 'Sum durations and tokens across spans, pick `max(spans, key=...)["name"]`, and guard against zero division.',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-1-redact',
      title: 'Lab 11.1b: Pre-Export Telemetry PII & Secret Scrubber (Debug)',
      prompt: 'Fix `scrub_trace_payload(text: str) -> str` so Bearer tokens, `sk-...` API keys, and email addresses are masked cleanly (`[REDACTED_SECRET]`, `[REDACTED_EMAIL]`) before leaving the server.',
      difficulty: 'debug',
      starterCode: `import re

def scrub_trace_payload(text: str) -> str:
    # BUG: does not redact Bearer headers, sk-* keys, or emails!
    return text`,
      testCode: `raw = "Authorization: Bearer tok_9988aabbcc | key=sk-abc12345678901234567 | user=nadia@acme.io"
clean = scrub_trace_payload(raw)
assert "tok_9988" not in clean and "sk-abc" not in clean and "nadia@acme.io" not in clean
assert "[REDACTED_SECRET]" in clean and "[REDACTED_EMAIL]" in clean
print("PASS: Lab 11.1b telemetry PII & secret redactor verified!")`,
      solutionCode: `import re

def scrub_trace_payload(text: str) -> str:
    out = re.sub(r"(?i)Bearer\\s+[A-Za-z0-9._-]+", "Bearer [REDACTED_SECRET]", text)
    out = re.sub(r"sk-[A-Za-z0-9_-]{12,}", "[REDACTED_SECRET]", out)
    out = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", "[REDACTED_EMAIL]", out)
    return out`,
      hint: 'Apply regex substitutions for `Bearer ...`, `sk-...`, and standard email patterns sequentially.',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-1-cohort',
      title: 'Lab 11.1c: Regression Detector Grouped by Prompt Version',
      prompt: 'Implement `compare_prompt_versions(traces: list[dict]) -> dict[str, dict]`: group traces by `prompt_version`, compute `count`, `error_rate` (fraction where `status != 200`), and `avg_latency_ms` rounded to 2 decimals per version.',
      difficulty: 'spec',
      starterCode: `def compare_prompt_versions(traces: list[dict]) -> dict[str, dict]:
    # Group traces by prompt_version -> count, error_rate, avg_latency_ms
    return {}`,
      testCode: `TRACES = [
    {"prompt_version": "v1", "status": 200, "latency_ms": 400},
    {"prompt_version": "v1", "status": 200, "latency_ms": 600},
    {"prompt_version": "v2", "status": 500, "latency_ms": 1200},
    {"prompt_version": "v2", "status": 200, "latency_ms": 800},
]
rep = compare_prompt_versions(TRACES)
assert rep["v1"] == {"count": 2, "error_rate": 0.0, "avg_latency_ms": 500.0}
assert rep["v2"] == {"count": 2, "error_rate": 0.5, "avg_latency_ms": 1000.0}
print("PASS: Lab 11.1c prompt cohort correlation verified!")`,
      solutionCode: `def compare_prompt_versions(traces: list[dict]) -> dict[str, dict]:
    groups = {}
    for t in traces:
        pv = str(t.get("prompt_version", "unknown"))
        groups.setdefault(pv, []).append(t)
    out = {}
    for pv, items in groups.items():
        n = len(items)
        errs = sum(1 for i in items if i.get("status") != 200)
        avg_lat = sum(float(i.get("latency_ms", 0.0)) for i in items) / n
        out[pv] = {
            "count": n,
            "error_rate": round(errs / n, 4),
            "avg_latency_ms": round(avg_lat, 2),
        }
    return out`,
      hint: 'Bucket traces into `groups.setdefault(pv, []).append(t)` first, then compute average latency and error rate per group.',
    },
    {
      type: 'prose',
      heading: 'Worked Debugging Walkthrough: Diagnosing a 2,400ms RAG Spike',
      paragraphs: [
        'Walk step-by-step through how an on-call AI engineer uses OpenTelemetry GenAI spans during a real traffic alert. At 14:20 UTC, monitoring fires an alert because `p95_ttft_ms` jumped from `680ms` to `2,410ms` while endpoint HTTP availability stays at `99.9%`.',
        'Step 1: Filter traces in Arize Phoenix or Grafana Tempo for `duration_ms > 2000` over the past 15 minutes and group by `prompt_sha` and `rag.index_version`. Both match yesterday’s stable SHA, immediately ruling out a bad code/prompt rollout.',
        'Step 2: Inspect the critical path of three slow traces. Each trace shows: `embed_query = 42ms`, `hybrid_search = 1,620ms` (normally `45ms`), `reranker = 115ms`, and `llm_chat = 630ms`. Notice the entire anomaly lives inside `hybrid_search`, NOT the LLM provider!',
        'Step 3: Read child attributes inside `hybrid_search`: `rag.candidate_count = 50` and `db.filter = tenant_id`. Checking Postgres `EXPLAIN ANALYZE` reveals an ingestion batch dropped and recreated the partial HNSW index without recreating `rag_chunks_tenant_idx`, forcing sequential table scans across 400k rows.',
        'Common mistakes to eliminate early: never spawn disconnected async tasks without propagating the active OpenTelemetry `Context` header (orphaned spans look invisible), never skip redacting Bearer/cookie fields before exporter batching, and never log unbounded 50KB retrieved PDF chunks as span attributes when storing `cited_doc_ids` + hashes gives cleaner diagnostics at 1% storage cost.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked End-to-End Example: Correlating Cost & Error Spikes Across Deployments',
      paragraphs: [
        'Walk through how a mid-sized support AI service configures its production OTel pipeline. FastAPI middleware starts the root span on every `/v1/ask` request, mints a trace ID, and binds `tenant_tier` plus Git `prompt_sha` cleanly via Baggage propagation so downstream worker spans inherit context automatically. Each retrieval step emits candidate count and BM25 vs vector overlap scores, while the chat step logs `gen_ai.usage.input_tokens`, cached token savings, and USD cost computed directly via our cost ledger.',
        'Rather than archiving massive raw prompt strings for every happy request, the exporter emits full sampled attributes on 5% of baseline 200 OK traffic and 100% of `status >= 400` or user thumbs-down traces—always scrubbed through our regex PII/Bearer middleware first. Within seconds of any regression deploy, engineers compare `prompt_sha=v41` vs `v42` side by side on error rate, cached prefix hit ratio, and tail p95 latency cleanly.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'Instrument every stage (`embed`, `search`, `rerank`, `llm`, `tool`) under one OpenTelemetry `trace_id` with `gen_ai.*` attributes.',
        'Always attach immutable `prompt_sha` and `index_version` tags so quality drops slice cleanly to exact commits.',
        'Scrub Bearer tokens, secrets, and user PII before telemetry leaves the runtime boundary.',
        'Validate dashboards against real load tests so slow database scans, third-party rate-limit retries, and serialization delays surface cleanly inside distinct spans instead of hiding behind generic HTTP timeout errors.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q11-1-1',
      question: 'Why instrument nested child spans inside an AI request instead of logging only overall endpoint HTTP duration?',
      options: [
        'Child spans pinpoint whether latency stems from search, rerank, or LLM',
        'Nested spans automatically remove Postgres row lock contention inside SQL transactions',
        'HTTP status 200 guarantees zero hallucinated document citations or schema violations',
        'Span hierarchies compress dense embedding vectors down to half storage memory cleanly',
      ],
      correctIndex: 0,
      explanation: 'Timed child spans reveal which internal pipeline stage caused slowness or failure.',
    },
    {
      id: 'q11-1-2',
      question: 'What advantage does OpenTelemetry `gen_ai.*` instrumentation give over vendor-proprietary trace decorators?',
      options: [
        'Eliminates all provider token billing across interactive Frontier Reasoning workloads',
        'Portable telemetry across Phoenix, Langfuse, Honeycomb, or Grafana',
        'Automatic prompt injection resistance without adding XML untrusted data tags cleanly',
        'Built-in strict JSON Schema grammar enforcement inside Python HTTP web frameworks',
      ],
      correctIndex: 1,
      explanation: 'Standard OTel exporters switch backends through config without rewriting application code.',
    },
    {
      id: 'q11-1-3',
      type: 'predict-output',
      question: 'What happens if `scrub_trace_payload` runs on `"Bearer tok_1234 user=bob@test.com"`?',
      code: `clean = scrub_trace_payload("Bearer tok_1234 user=bob@test.com")`,
      options: [
        'Leaves Bearer token credentials readable while hiding email hostnames only',
        'Drops the entire parent OpenTelemetry trace span silently prior to serialization',
        'Masks both Bearer credential and email cleanly with redaction tags',
        'Converts the plain-text string into a salted SHA-256 base64 hash digest',
      ],
      correctIndex: 2,
      explanation: 'Pre-export scrubbers mask credentials and PII before spans leave secure process memory.',
    },
    {
      id: 'q11-1-4',
      type: 'spot-bug',
      question: 'Spot the missing observability field when a weekend regression causes silent citation drops without HTTP 500 errors.',
      options: [
        'Outbound ephemeral client TCP socket port numbers inside HTTP headers',
        'Frontend browser CSS dark-mode theme state strings on the request object',
        'Container runtime root Dockerfile base image UID user number values',
        'Immutable prompt_sha and index_version attributes on traces',
      ],
      correctIndex: 3,
      explanation: 'Correlating traces by `prompt_sha` and `index_version` isolates silent behavioral shifts immediately.',
    },
    {
      id: 'q11-1-5',
      type: 'multi-select',
      question: 'Which attributes belong on every production LLM trace span?',
      options: [
        'gen_ai.request.model & prompt_sha',
        'gen_ai.usage.input_tokens & output_tokens',
        'Raw user Authorization bearer secret',
        'Duration in milliseconds & cost_usd',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 3],
      explanation: 'Log model, version, token counts, duration, and USD cost—never raw secrets.',
    },
    {
      id: 'q11-1-6',
      type: 'ordering',
      question: 'Order the incident triage flow using distributed GenAI traces:',
      options: [],
      items: [
        'Alert triggers on p95 latency or error-rate SLO burn',
        'Slice failing traces by prompt_sha & index_version',
        'Inspect critical-path child span holding maximum duration',
        'Rollback regression tag & add trace failure to golden evals',
      ],
      correctIndex: 0,
      explanation: 'Observe alert -> isolate version cohort -> locate bottleneck span -> rollback & preserve regression case.',
    },
    {
      id: 'q11-1-7',
      type: 'numeric',
      question: 'In a 1,000ms trace where `rerank` took 450ms and `llm_call` took 400ms, what percentage of total latency did `rerank` consume?',
      options: [],
      correctIndex: 0,
      correctNumber: 45,
      tolerance: 0.1,
      unit: '%',
      explanation: '450 / 1000 * 100 = 45%.',
    },
    {
      id: 'q11-1-8',
      question: 'Why avoid logging 100% of full raw user documents unconditionally in long-term trace storage?',
      options: [
        'Storage balloons and PII lingers outside core access controls',
        'Standard JSON structured loggers fail on prose strings above one hundred characters',
        'Sampling active spans invalidates parent trace UUID correlation globally',
        'Telemetry storage engines disable provider Prompt Prefix Caching automatically',
      ],
      correctIndex: 0,
      explanation: 'Sampled redacted traces balance debuggability with storage budget and data-minimization rules.',
    },
  ],
};
