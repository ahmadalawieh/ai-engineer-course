import type { Lesson } from '@/types/course';

export const lesson9_2: Lesson = {
  id: '9-2',
  moduleId: 'mod-9',
  number: '9.2',
  title: 'Docker Containers, GitHub Actions CI, Logging, Caching & Queues',
  subtitle: 'Package reproducible non-root Docker images, enforce CI quality and eval gates in GitHub Actions, log structured RED telemetry, cache repeated inferences, and offload slow work to queues.',
  durationMinutes: 85,
  track: 'ai-eng',
  prerequisites: ['9-1', '7.2'],
  requires: ['fastapi-endpoints', 'python-pytest', 'ci-regression-gates'],
  teaches: [
    'docker-containers-best-practices',
    'github-actions-ci',
    'structured-logging-metrics',
    'caching-and-async-queues',
  ],
  competencies: ['jr-deploy', 'mid-observability-cost', 'mid-incidents-design'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Write optimized, non-root `Dockerfile`s (`requirements.txt` layer caching + `.dockerignore`) and `docker-compose.yml` local stacks.',
    'Configure GitHub Actions CI pipelines running lint (`ruff`/`eslint`), unit tests (`pytest`), and deterministic golden LLM eval gates.',
    'Emit structured JSON logs (`trace_id`, `tenant_id`, `latency_ms`, `tokens_in`, `cost_usd`) and track RED telemetry (`Rate, Errors, Duration`).',
    'Offload slow ingestion/batch jobs cleanly to idempotent worker queues with retries and Dead-Letter Queues (DLQ) while caching hot read paths.',
  ],
  checkWithoutNotes: [
    'Why must `COPY requirements.txt .` and `RUN pip install ...` come BEFORE `COPY src/ ./src/` in a `Dockerfile`?',
    'Name three sensitive or bloated directories that MUST appear in `.dockerignore` before running `docker build`.',
    'Explain why synchronous HTTP `POST /ingest-500-pdfs` endpoints time out at reverse proxies and how an `HTTP 202 Accepted` queue + idempotency key solves it.',
    'List the three **RED** metrics every AI microservice dashboard must track continuously.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Reproducibility, Queues & Observability Turn Demos into Reliable Products',
      paragraphs: [
        'How many promising AI projects die right at the handoff line: *"It ran on my MacBook, why did it fail in staging?"* Subtle Python patch mismatches, missing OS shared libraries (`libgomp` for FAISS/PyTorch), leaking `.env` files accidentally copied inside container images, slow PDF ingestion endpoints timing out at 30 seconds, and blind `print()` logs without `trace_id`s stall engineering teams constantly.',
        'Even small differences between laptop macOS and cloud Linux create subtle production regressions: case-sensitive file paths (`Utils.py` vs `utils.py`), unpinned wheel upgrades altering tokenizer output, or missing system fonts breaking PDF text extraction. Without automated CI guardrails and sealed containers, every deploy turns into manual guesswork rather than repeatable delivery.',
        'Production software engineering solves these systematically with four habits: deterministic non-root **Docker** containers built via fast cached layers; automated **GitHub Actions CI** pipelines blocking broken PRs before merge; structured **JSON logging + RED metrics + caching** making bottlenecks obvious in seconds; and **asynchronous job queues** decoupling instant user HTTP responses (`202 Accepted`) from multi-minute embedding or batch evaluation jobs.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Sealed Shipping Container + Background Web Worker',
      frontendConcept: 'Locking Node versions with `package-lock.json` inside CI builds while offloading heavy file parsing into a Web Worker so the UI stays snappy',
      aiConcept: 'Non-Root Multi-Stage Dockerfiles, CI Regression Gates & Idempotent Job Queues',
      explanation:
        'A **Docker container** seals your exact Python runtime, pinned wheel dependencies, and FastAPI server inside an immutable shipping container so laptop, CI runner, and cloud host execute identically. Meanwhile, **background job queues** (`Redis` + `RQ`/`Celery`) work like browser Web Workers: `/v1/ingest` enqueues a job ID in 10 milliseconds instead of blocking the HTTP thread for 3 minutes while chunking PDFs.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Optimized Non-Root `Dockerfile` & GitHub Actions CI Pipeline',
      paragraphs: [
        'Inspect the layer-cache order inside the `Dockerfile` below. Docker hashes each instruction sequentially from top to bottom: if you copy your entire `src/` folder FIRST and run `pip install` afterward, editing a single Python comment invalidates the `pip install` cache layer and forces a slow four-minute dependency reinstall on every commit! Copying `requirements.txt` alone first lets Docker reuse cached dependency layers cleanly across 95% of code edits, cutting CI build duration dramatically.',
        'Container hardening matters just as much as speed. Create an explicit non-root user (`useradd --create-home appuser` + `USER appuser`) so a remote code vulnerability inside a PDF parser never hands attackers root permissions inside the container. Set `PYTHONDONTWRITEBYTECODE=1` and `PYTHONUNBUFFERED=1` so structured error logs stream immediately instead of dying inside buffered memory during crashes, and exclude `.git`, `.venv`, `__pycache__`, and `.env*` inside `.dockerignore`.',
        'Pair that container cleanly with **GitHub Actions CI** (`.github/workflows/ci.yml`): on every pull request, order stages from cheapest/fastest to heaviest—lint (`ruff check`), typed unit/mock checks (`pytest -q`), and finally a deterministic golden evaluation gate (`python evals/run_ci.py --min-pass-rate 0.90`). Running static checks and unit tests first catches syntax or import errors in ten seconds instead of burning minutes booting integration fixtures first.',
      ],
    },
    {
      type: 'code',
      title: 'Production Pattern: Cached Non-Root Dockerfile & GitHub Actions Gate',
      language: 'bash',
      code: `# --- Dockerfile ---
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# 1. Dependency layer cached until requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. App code layer + non-root user
RUN useradd --create-home appuser
COPY --chown=appuser:appuser src/ ./src/
USER appuser
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

# --- .github/workflows/ci.yml (conceptual summary) ---
# steps: checkout -> setup-python 3.12 -> pip install -> ruff check -> pytest -> golden eval gate`,
      caption: 'Ordering `COPY requirements.txt` before `COPY src/` saves minutes on every CI build, and `USER appuser` removes container root privileges.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Structured JSON Logging, RED Metrics & Cache-Aside Speedups',
      paragraphs: [
        'Unstructured `print("error calling llm for bob")` breaks completely at scale: you cannot filter by tenant, measure `p95` latency, or sum daily spend with grep across ten container replicas. Emit one **JSON line per request** containing `ts`, `level`, `trace_id`, `tenant_id`, `route`, `status`, `latency_ms`, `cache_hit`, `tokens_in`, `tokens_out`, and `cost_usd` (making sure sensitive PII and API keys stay masked!).',
        'Structured events feed directly into **RED telemetry** dashboards on every alert rotation: **Rate** (requests per second overall and per tenant), **Errors** (`4xx` client mistakes separated cleanly from `5xx` server/upstream outages), and **Duration** (`p50`, `p95`, and `p99` latency percentiles—because averages hide slow tail requests where retrieval + LLM retries spike over 12 seconds!).',
        'Notice how **Caching** shows up cleanly inside telemetry too. Before hitting an expensive embedding API (`15 ms` + dollars per million tokens) or deterministic RAG FAQ answer, hash the normalized key `(model_id, tenant_id, sha256(normalized_query))` into Redis with a TTL (`e.g., 3600s`). Repeated hits return in `< 2 ms` at zero LLM cost—just remember ALWAYS to include `tenant_id` (plus user role/ACL scope and prompt/index version hash!) inside cache keys so Tenant B never reads Tenant A’s confidential answer or stale outdated policy chunks!',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Async Worker Queues, Idempotency Keys & Dead-Letter Queues (DLQ)',
      paragraphs: [
        'Imagine a user uploads a 120-page PDF manual for RAG indexing. Parsing pages, chunking paragraphs, computing 400 embeddings, and upserting vectors takes 45 seconds—longer than standard 30-second CDN and reverse-proxy HTTP timeouts! Rather than blocking a precious web API worker until the gateway drops the connection, follow the **Async Queue Pattern**: `POST /v1/documents` validates metadata, records `status="queued"` in Postgres, pushes a job onto Redis (`RQ`/`Celery`), and returns **`202 Accepted`** with `{"job_id": "job_91c"}` in `15 ms` so the frontend polls `/v1/jobs/job_91c` cleanly.',
        'Production queues demand two explicit safeguards. **1) Idempotency Keys:** if a mobile app or webhook delivery agent retries the exact same request twice carrying `Idempotency-Key: doc-42-v1`, your ingestion handler checks Redis/Postgres first, avoids indexing 400 duplicate chunks into the vector store, and returns the original `job_id`. **2) Bounded Retries + Dead-Letter Queue (DLQ):** if a corrupt encrypted PDF fails 3 worker attempts (`max_retries=3`), retrying infinitely starves healthy jobs for other customers! Move permanently failing jobs cleanly into a dedicated **Dead-Letter Queue** (`dlq`) carrying structured failure reasons so engineers inspect poison pills safely offline while live ingestion flows smoothly.',
      ],
    },
    {
      type: 'table',
      title: 'Sync HTTP vs Caching vs Async Background Queue Selection',
      headers: ['Workload Latency & Behavior', 'Architecture Choice', 'HTTP Status & Key Safeguard'],
      rows: [
        ['Fast deterministic lookup or cached FAQ (`< 50 ms`)', 'Redis cache-aside + FastAPI handler', '`200 OK`; always include `tenant_id` + `model_id` in cache key'],
        ['Interactive chat / RAG streaming (`0.5–8 s`)', 'FastAPI SSE streaming with hard timeout', '`200 OK` streaming chunks + per-call `timeout` + fallback'],
        ['Heavy PDF indexing, batch evals (`10 s–15 min`)', 'Worker Queue (`Celery`/`RQ`) + Status endpoint', '`202 Accepted` + `Idempotency-Key` + `max_retries` -> `DLQ`'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common Docker, CI & Queue Mistakes & How to Debug Them',
      paragraphs: [
        '1) Building Docker images WITHOUT a `.dockerignore`: Docker happily copies your 1.5 GB `.venv/`, local `.git/` history, and secret `.env` straight into the build context and image layers! Always inspect image size (`docker images`) and `.dockerignore` before pushing, and verify with `docker run --rm myapp ls -la` that no secret `.env` files exist inside the built filesystem.',
        '2) Running containers as `root` or omitting `PYTHONUNBUFFERED=1`: without `PYTHONUNBUFFERED=1`, Python buffers `stdout` in memory so recent crash logs vanish right before container termination, leaving engineers staring at blank crash outputs inside CloudWatch or Render dashboards.',
        '3) Allowing a queue worker to retry malformed poison-pill jobs infinitely without a DLQ: one corrupt document locks up every worker slot forever while healthy customer uploads pile behind it. Monitor DLQ queue depth cleanly and alert whenever dead-letter counts tick above zero.',
        '4) Omitting `Idempotency-Key` deduplication on ingestion or billing webhooks: mobile network timeouts cause clients to retry identical requests, duplicating vector chunks twice in search results or double-charging user accounts unless deduplicated in Redis.',
        '5) Putting `tenant_id` outside Redis cache keys: caching solely on `sha256(query)` leaks Tenant A’s private answers straight to Tenant B when both ask `"What was Q3 revenue?"`. Include `tenant_id`, role ACL scope, and active prompt/index version hashes in every cache key.',
        '6) Skipping CI checks when deadlines tighten (`git push --no-verify` or bypassing PR gates): unreviewed imports, missing `pytest` mocks, or broken JSON prompt regressions turn cheap thirty-second automated CI catches into painful 2 AM production outages.',
        '7) Treating CPU embeddings or vector indexing synchronously inside web request threads: even five-second ingestion spikes starve Gunicorn/Uvicorn workers under concurrent traffic, pushing p99 request duration above load-balancer timeouts across unrelated chat routes.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 8.2 Recap: Containers, CI, Telemetry & Queues',
      body: '- Order Dockerfile layers (`requirements.txt` before `src/`), use `.dockerignore`, set `PYTHONUNBUFFERED=1`, and run as non-root `USER`.\n- Enforce lint + unit tests + deterministic eval gates automatically inside GitHub Actions on every PR.\n- Emit redacted structured JSON logs (`trace_id`, `tenant_id`, `latency_ms`, `cost_usd`) driving RED metrics.\n- Include `tenant_id`, ACL scope, and version hashes in every cache key and offload slow ingestion work to `202 Accepted` queues.\n- Protect queues with `Idempotency-Key` deduplication and bounded `max_retries` routing failures to a DLQ.',
    },
    {
      type: 'python-lab',
      labId: 'lab-9-2-ci',
      difficulty: 'guided',
      requires: ['ci-regression-gates'],
      title: 'Lab 8.2A: GitHub Actions CI & Eval Regression Gate Evaluator',
      prompt:
        'Implement `evaluate_ci_gate(lint_ok: bool, unit_passed: int, unit_total: int, eval_pass_rate: float, p95_ms: float, min_eval: float = 0.88, max_p95: float = 1500.0) -> tuple[bool, list[str]]` checking all four CI gates and returning `(all_passed, list_of_failure_reasons)` (checking: `lint_ok`, `unit_passed == unit_total` and `unit_total > 0`, `eval_pass_rate >= min_eval`, and `p95_ms <= max_p95`).',
      starterCode: `def evaluate_ci_gate(
    lint_ok: bool,
    unit_passed: int,
    unit_total: int,
    eval_pass_rate: float,
    p95_ms: float,
    min_eval: float = 0.88,
    max_p95: float = 1500.0,
) -> tuple[bool, list[str]]:
    # Collect descriptive failure tags for each unmet gate and return (len(failures) == 0, failures)
    pass`,
      testCode: `ok, errs = evaluate_ci_gate(True, 42, 42, 0.92, 820.0)
assert ok is True and errs == []
bad_ok, bad_errs = evaluate_ci_gate(False, 40, 42, 0.81, 2100.0)
assert bad_ok is False and len(bad_errs) == 4, f"All 4 gates failed, got {bad_errs}"
zero_ok, _ = evaluate_ci_gate(True, 0, 0, 0.95, 500.0)
assert zero_ok is False, "0 total unit tests must fail gate!"
print("PASS: CI regression gate caught lint, unit, eval, and latency violations!")`,
      solutionCode: `def evaluate_ci_gate(
    lint_ok: bool,
    unit_passed: int,
    unit_total: int,
    eval_pass_rate: float,
    p95_ms: float,
    min_eval: float = 0.88,
    max_p95: float = 1500.0,
) -> tuple[bool, list[str]]:
    failures = []
    if not lint_ok:
        failures.append("lint_failed")
    if unit_total <= 0 or unit_passed != unit_total:
        failures.append("unit_tests_failed")
    if eval_pass_rate < min_eval:
        failures.append("eval_regression")
    if p95_ms > max_p95:
        failures.append("latency_sla_exceeded")
    return len(failures) == 0, failures`,
      hint: 'Check each of the four conditions independently so CI reports EVERY failing gate together in one PR comment rather than stopping at the first failure.',
      hints: [
        'Initialize `failures = []` and evaluate all 4 checks sequentially.',
        'Require `unit_total > 0` alongside `unit_passed == unit_total` so empty test suites cannot pass CI.',
        'Return `len(failures) == 0, failures`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-9-2-queue',
      difficulty: 'spec',
      requires: ['caching-and-async-queues'],
      title: 'Lab 8.2B: Idempotent Worker Queue with Retries & Dead-Letter Queue',
      prompt:
        'Implement `process_job_batch(jobs: list[dict], run_fn, max_retries: int = 2) -> dict`: each job dict has `{"idempotency_key": str, "payload": dict}`. Deduplicate by `idempotency_key` (skip duplicate retries, incrementing `"deduplicated"` count); attempt `run_fn(payload)` up to `1 + max_retries` times (`try/except Exception`); record `"succeeded"` IDs if any attempt succeeds, or push `{"key": ..., "error": str(e)}` onto `"dlq"` if all attempts fail.',
      starterCode: `def process_job_batch(jobs: list[dict], run_fn, max_retries: int = 2) -> dict:
    # Return {"succeeded": [...], "dlq": [...], "deduplicated": int}
    pass`,
      testCode: `attempts = {"flaky": 0}
def runner(p):
    if p["doc"] == "flaky":
        attempts["flaky"] += 1
        if attempts["flaky"] < 2:
            raise TimeoutError("transient 503")
    elif p["doc"] == "poison":
        raise ValueError("corrupt PDF")
    return "ok"

jobs = [
    {"idempotency_key": "k1", "payload": {"doc": "clean"}},
    {"idempotency_key": "k1", "payload": {"doc": "clean"}},  # duplicate!
    {"idempotency_key": "k2", "payload": {"doc": "flaky"}},
    {"idempotency_key": "k3", "payload": {"doc": "poison"}},
]
res = process_job_batch(jobs, runner, max_retries=2)
assert res["succeeded"] == ["k1", "k2"]
assert res["deduplicated"] == 1
assert len(res["dlq"]) == 1 and res["dlq"][0]["key"] == "k3"
print("PASS: Idempotent queue retried transient errors and isolated poison pills in DLQ!")`,
      solutionCode: `def process_job_batch(jobs: list[dict], run_fn, max_retries: int = 2) -> dict:
    seen = set()
    succeeded = []
    dlq = []
    dedup = 0
    for job in jobs:
        key = job["idempotency_key"]
        if key in seen:
            dedup += 1
            continue
        seen.add(key)
        last_err = ""
        ok = False
        for _ in range(1 + max_retries):
            try:
                run_fn(job["payload"])
                ok = True
                break
            except Exception as exc:
                last_err = str(exc)
        if ok:
            succeeded.append(key)
        else:
            dlq.append({"key": key, "error": last_err})
    return {"succeeded": succeeded, "dlq": dlq, "deduplicated": dedup}`,
      hint: 'Track `seen` keys in a `set()`, attempt `1 + max_retries` invocations inside `try/except`, and append to `dlq` if all fail.',
      hints: [
        'Check `if key in seen: dedup += 1; continue` BEFORE adding `seen.add(key)`.',
        'Try `run_fn(job["payload"])` inside `for _ in range(1 + max_retries):` breaking immediately on success.',
        'If `not ok`, append `{"key": key, "error": last_err}` onto `dlq`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-9-2-log',
      difficulty: 'debug',
      requires: ['structured-logging-metrics', 'caching-and-async-queues'],
      title: 'Lab 8.2C: Fix Cross-Tenant Cache Key & Secret-Leaking Logger',
      prompt:
        'Two nasty bugs sit in this helper: (1) `make_cache_key` ignores `tenant_id` and `model_id` (allowing cross-tenant cache leaks!), and (2) `build_log_record` includes raw `api_key` and raw `query` text in JSON logs! Fix both functions so cache keys hash `f"{tenant_id}:{model_id}:{query.strip().lower()}"` via SHA-256 hex digest, and log records drop `api_key`/`query` completely while keeping `{"trace_id", "tenant_id", "latency_ms", "tokens_total", "cache_hit"}` as a JSON string.',
      starterCode: `import hashlib, json

def make_cache_key(tenant_id: str, model_id: str, query: str) -> str:
    # BUG: omits tenant_id and model_id -> cross-tenant data leak!
    return hashlib.sha256(query.encode("utf-8")).hexdigest()

def build_log_record(trace_id: str, tenant_id: str, api_key: str, query: str, latency_ms: float, tokens_total: int, cache_hit: bool) -> str:
    # BUG: leaks api_key and raw user query PII into log aggregation!
    return json.dumps({"trace_id": trace_id, "api_key": api_key, "query": query})`,
      testCode: `import json
k1 = make_cache_key("acme", "small-fast", "  Q3 revenue? ")
k2 = make_cache_key("beta", "small-fast", "Q3 revenue?")
k3 = make_cache_key("acme", "small-fast", "q3 revenue?")
assert k1 == k3 and k1 != k2, "Same tenant/model normalized queries must match; cross-tenant must differ!"
raw = build_log_record("tr_9", "acme", "sk-secret-999", "My SSN is 123", 42.5, 180, False)
obj = json.loads(raw)
assert "sk-secret" not in raw and "SSN" not in raw
assert obj == {"trace_id": "tr_9", "tenant_id": "acme", "latency_ms": 42.5, "tokens_total": 180, "cache_hit": False}
print("PASS: Tenant-isolated cache key and zero-PII structured JSON logger verified!")`,
      solutionCode: `import hashlib, json

def make_cache_key(tenant_id: str, model_id: str, query: str) -> str:
    canonical = f"{tenant_id}:{model_id}:{query.strip().lower()}"
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

def build_log_record(trace_id: str, tenant_id: str, api_key: str, query: str, latency_ms: float, tokens_total: int, cache_hit: bool) -> str:
    return json.dumps({
        "trace_id": trace_id,
        "tenant_id": tenant_id,
        "latency_ms": float(latency_ms),
        "tokens_total": int(tokens_total),
        "cache_hit": bool(cache_hit),
    })`,
      hint: 'Normalize `query.strip().lower()` prefixed with `{tenant_id}:{model_id}:` before SHA-256, and omit `api_key`/`query` from `json.dumps`.',
      hints: [
        'Format `canonical = f"{tenant_id}:{model_id}:{query.strip().lower()}"` before encoding UTF-8 to `hashlib.sha256`.',
        'Build the JSON log dictionary strictly with `"trace_id"`, `"tenant_id"`, `"latency_ms"`, `"tokens_total"`, and `"cache_hit"`.',
        'Never include `api_key` or raw prompt `query` text in standard telemetry logs.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q9-2-1',
      type: 'multiple-choice',
      question: 'Why should `COPY requirements.txt .` and `RUN pip install` appear BEFORE `COPY src/ ./src/` in a production `Dockerfile`?',
      options: [
        'To cache dependency layers cleanly across routine Python code edits',
        'Because Docker forbids executing `pip install` after copying any local `.py` files into `/app`',
        'Because putting `requirements.txt` first automatically strips secret `.env` keys from container images',
        'Because FastAPI fails to import Pydantic unless dependency wheels compile before source folders exist',
      ],
      correctIndex: 0,
      explanation: 'Docker invalidates all layers following any modified `COPY`; isolating `requirements.txt` keeps heavy dependency installs cached across normal code changes.',
    },
    {
      id: 'q9-2-2',
      type: 'multiple-choice',
      question: 'Why does a production FastAPI upload route (`POST /v1/ingest-pdf`) return `HTTP 202 Accepted` with a `job_id` instead of waiting 45 seconds synchronously?',
      options: [
        'Because `202 Accepted` automatically doubles chunking throughput inside PyPDF parsers',
        'To avoid reverse-proxy timeouts and blocked workers while heavy jobs run in a queue',
        'Because browsers forbid receiving `200 OK` HTTP payloads larger than 4 kilobytes from Python servers',
        'Because Redis sorted sets reject connection pools unless endpoints emit `202` status headers',
      ],
      correctIndex: 1,
      explanation: 'Returning `202 Accepted` frees HTTP worker threads immediately so load balancers never time out while workers process heavy ingestion asynchronously.',
    },
    {
      id: 'q9-2-3',
      type: 'spot-bug',
      question: 'Why does this Redis FAQ caching helper create a severe cross-tenant security breach?',
      code: `def cached_answer(tenant_id: str, query: str):
    key = hashlib.sha256(query.strip().lower().encode()).hexdigest()
    if (hit := redis.get(key)) is not None:
        return hit`,
      options: [
        'SHA-256 hashes collide routinely whenever two queries contain fewer than twenty ASCII letters',
        '`redis.get(key)` decodes JSON strings slowly unless compressed via gzip beforehand',
        'Omitting `tenant_id` from `key` lets Tenant B read Tenant A’s cached confidential reply',
        'Calling `.lower()` inside Python drops punctuation marks required by vector databases',
      ],
      correctIndex: 2,
      explanation: 'Multi-tenant caches must namespace keys with `tenant_id` (and access tier/model ID) so identical questions never cross tenant privacy boundaries.',
    },
    {
      id: 'q9-2-4',
      type: 'multiple-choice',
      question: 'What happens in an async job queue without bounded `max_retries` and a Dead-Letter Queue (`DLQ`) when a corrupt PDF always crashes the parser?',
      options: [
        'The queue automatically fixes broken PDF bytes on retry attempt number ten',
        'The broker deletes all remaining healthy tenants’ jobs cleanly to save Redis memory',
        'Every worker process loops forever on the poison-pill job, starving healthy traffic',
        'Docker restarts the FastAPI endpoint automatically and clears the bad document safely',
      ],
      correctIndex: 2,
      explanation: 'Poison-pill jobs without bounded retries and DLQ isolation monopolize worker capacity endlessly; moving failed jobs to DLQ keeps the queue healthy.',
    },
    {
      id: 'q9-2-5',
      type: 'predict-output',
      question: 'You build a Docker image without a `.dockerignore` file on your laptop containing `.venv/` (1.2 GB) and `.env`. What enters the build context?',
      options: [
        'Only `.py` files listed explicitly inside `requirements.txt` enter Docker build layers',
        'Docker automatically ignores `.env` files and virtualenvs unless `--include-secrets` is passed',
        'The entire `.venv/` and secret `.env` get sent to Docker and risk baking into the image',
        'Docker converts `.venv/` libraries seamlessly into compact `alpine` binary wheels automatically',
      ],
      correctIndex: 2,
      explanation: 'Without `.dockerignore`, `COPY . .` packs local virtualenvs, `.git`, and `.env` secrets straight into slow, insecure images.',
    },
    {
      id: 'q9-2-6',
      type: 'multi-select',
      question: 'Which two safeguards protect asynchronous ingestion queues and container builds reliably?',
      options: [
        'Attaching an `Idempotency-Key` so network retries never duplicate uploaded document chunks twice',
        'Adding `USER appuser` (non-root) and `PYTHONUNBUFFERED=1` inside production `Dockerfile`s',
        'Running `chmod 777` as `root` across `/app` so workers bypass permission boundaries effortlessly',
        'Skipping `.dockerignore` so local developer `.env` keys deploy cleanly inside container images',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Idempotency keys prevent duplicate processing under retries; non-root `USER` + `PYTHONUNBUFFERED=1` secure runtime containers and preserve real-time logs.',
    },
    {
      id: 'q9-2-7',
      type: 'numeric',
      question: 'A queue worker retries transient errors with `max_retries = 3` after the initial execution attempt. What is the maximum total number of times a permanently failing poison job executes before moving to the DLQ?',
      options: [],
      correctIndex: 0,
      correctNumber: 4,
      tolerance: 0,
      unit: 'attempts',
      explanation: '`1` initial attempt `+ 3 retries = 4` total executions before DLQ quarantine.',
    },
    {
      id: 'q9-2-8',
      type: 'multiple-choice',
      question: 'What are the three **RED** telemetry signals tracked continuously on production microservice dashboards?',
      options: [
        'Retries, Embeddings, and Docker image size per deployment tag',
        'Routing accuracy, Entropy, and Dropout rate inside PyTorch training batches',
        'Recall, Explainability, and Dataset hash version across cross-validation splits',
        'Rate (requests/sec), Errors (4xx/5xx counts), and Duration (`p50`/`p95`/`p99` latency)',
      ],
      correctIndex: 3,
      explanation: 'RED stands for Request **Rate**, **Error** rate, and **Duration** latency percentiles—letting on-call engineers spot traffic spikes, failures, or slowdowns immediately.',
    },
    {
      id: 'q9-2-9',
      type: 'ordering',
      question: 'Order a fast-fail GitHub Actions CI pipeline for an AI FastAPI repository:',
      items: [
        'Check out code and install pinned Python dependencies cleanly from cache',
        'Run fast static lint and type checks (`ruff` / `mypy` / `tsc`)',
        'Run fast `pytest` unit and schema tests with mock LLM fixtures',
        'Run golden deterministic RAG/eval regression gate against minimum pass floor',
        'Build non-root Docker image only after all gates pass on `main`',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Install cached deps -> fast lint/types -> fast unit tests -> golden eval gate -> build/publish container.',
    },
  ],
};
