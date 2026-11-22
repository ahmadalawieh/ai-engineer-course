import type { Lesson } from '@/types/course';

export const lesson11_4: Lesson = {
  id: '11-4',
  moduleId: 'mod-11',
  number: '11.4',
  title: 'Managed Cloud AI Platforms, Queues, Load Testing & SLOs',
  subtitle: 'Deploy enterprise AI onto AWS Bedrock, Vertex AI, or Azure AI Foundry inside private VPCs, decouple bursty ingestion via async queues + DLQs, load-test tail concurrency, and track error budgets.',
  durationMinutes: 80,
  track: 'ai-eng',
  prerequisites: ['9.4', '11.1'],
  requires: ['free-tier-cloud-deployment', 'otel-genai-tracing', 'oncall-incident-runbooks'],
  teaches: ['managed-cloud-ai', 'async-queues-dlq', 'ai-slos-error-budgets'],
  competencies: ['mid-incidents-design', 'sr-sys-architecture', 'sr-finops-scale'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Compare direct provider APIs vs Managed Cloud AI Platforms (AWS Bedrock / Vertex AI / Azure AI Foundry) across IAM roles, private VPC routing, cross-region quotas, and compliance.',
    'Decouple slow PDF OCR and embedding ingestion onto idempotent background queues backed by Dead-Letter Queues (DLQs) so interactive chat never blocks.',
    'Run realistic load tests (concurrency ramp + token streaming simulation) locating upstream 429 ceilings before launch.',
    'Define concrete AI Service Level Objectives (SLOs) across availability, p95 TTFT latency, and unit cost paired with error-budget freeze rules.',
  ],
  checkWithoutNotes: [
    'Why do regulated enterprises frequently route LLM calls through AWS Bedrock or Vertex AI inside private VPC endpoints instead of bare public API keys?',
    'Explain why synchronous `/ingest-pdf` HTTP endpoints fail under spiky 500-file uploads, and how a queue + DLQ solves it.',
    'Contrast measuring `requests/sec` alone vs `requests/sec x tokens_per_request` when load-testing LLM rate limits.',
    'What is an Error Budget, and what concrete action happens when monthly error budget burns down to zero?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Direct Provider APIs vs Managed Cloud AI Platforms',
      paragraphs: [
        'Early prototypes call hosted public endpoints with an environment bearer key (`LLM_API_KEY`). As companies sign enterprise healthcare, fintech, or government buyers, infrastructure security teams ask tough questions: does traffic stay inside our AWS/GCP Virtual Private Cloud, can we authenticate via workload IAM roles instead of static long-lived secrets, and are billing + data-residency commitments covered under our existing cloud BAA/DPA?',
        'Managed cloud AI platforms—**AWS Bedrock**, **Google Cloud Vertex AI**, and **Azure AI Foundry**—answer those constraints cleanly: requests authorize over short-lived IAM credentials, route across private network links without traversing public internet proxies, inherit existing regional residency rules, and aggregate cleanly on consolidated cloud billing.',
        'The mental model is buying commercial grid electricity through a dedicated factory substation rather than shipping diesel generators. Self-hosting `vLLM` on raw GPUs maximizes control and low-cost bulk throughput at sustained >60% utilization, whereas managed platforms eliminate cluster autoscaling headaches and provisioning delays.',
      ],
    },
    {
      type: 'prose',
      heading: 'Async Worker Queues, DLQs, Load Testing & SLOs',
      paragraphs: [
        'Never execute 45-second document OCR, chunking, and batch embedding inside an interactive web worker request. Enqueue jobs onto durable message queues (SQS, Cloud Tasks, Redis Streams) consumed by autoscaled workers with idempotent upserts, bounded visibility timeouts, and a **Dead-Letter Queue (DLQ)** capturing malformed PDFs after 3 retries so one corrupt file never blocks healthy documents.',
        'When load testing (`k6` or `Locust`), remember LLM providers enforce BOTH Requests Per Minute (RPM) AND **Tokens Per Minute (TPM)**. A load test sending tiny 20-token health pings will pass 1,000 RPM effortlessly while production 8,000-token RAG prompts slam into HTTP `429` TPM throttling at 30 concurrent users.',
        'Lock reliability expectations with explicit SLOs and error budgets: for example `99.5%` monthly availability (`0.5%` error budget = ~3.6 hours/month), `p95 TTFT <= 800ms`, and `<= $0.005/turn`. When a risky feature release burns error budget too fast, freeze non-essential launches and invest engineering time strictly into stability fixes.',
      ],
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: Corrupted PDF Halts Shared Worker Pool',
      paragraphs: [
        'A legal tech company processed customer contract uploads synchronously inside background Celery loops with infinite auto-retry on errors and zero Dead-Letter Queue. One morning, a customer uploaded an encrypted 380-page corrupted PDF that triggered an out-of-memory worker crash every two minutes.',
        'Because the message stayed at the head of the queue forever, every worker looped restarting on that identical poisoned document for four hours while thousands of normal customer files stalled. Adding strict per-job memory limits, exponential backoff (`max_retries=3`), and DLQ quarantine restored clean throughput immediately.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Cloud AI Inference Deployment Options',
      headers: ['Deployment Mode', 'Auth & Network', 'Cost Profile', 'Best Fit'],
      rows: [
        ['Hosted Direct API', 'Static API key over TLS', 'Pay-per-token, zero idle GPU', 'Fast startup MVPs & ZDR tiers'],
        ['Managed Cloud (Bedrock/Vertex/Azure)', 'IAM Roles + VPC PrivateLink', 'Pay-per-token or Provisioned Throughput', 'Enterprise security, IAM & regional compliance'],
        ['Self-Hosted vLLM Cluster', 'Internal cluster mTLS', 'Fixed GPU $/hr (cheaper at sustained high load)', 'Custom fine-tunes & air-gapped VPCs'],
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-11-4-dlq',
      title: 'Lab 11.4a: Worker Queue Processor with Max Retries & DLQ',
      prompt: 'Implement `process_ingestion_queue(jobs: list[dict], worker_fn, max_retries: int = 2) -> dict`: pop jobs cleanly from FIFO queue. For each job, if `worker_fn(job)` succeeds, record `job["id"]` in `succeeded`; if it fails and `attempts <= max_retries`, re-enqueue with `attempts += 1`; once `attempts > max_retries`, move `job["id"]` to `dlq`. Return `{"succeeded": [...], "dlq": [...]}`.',
      difficulty: 'guided',
      starterCode: `from collections import deque

def process_ingestion_queue(jobs: list[dict], worker_fn, max_retries: int = 2) -> dict:
    # Retry failed jobs up to max_retries then quarantine poisoned jobs in dlq
    return {"succeeded": [], "dlq": []}`,
      testCode: `attempts_log = {}
def flaky_worker(job):
    attempts_log[job["id"]] = attempts_log.get(job["id"], 0) + 1
    if job["id"] == "bad_pdf":
        raise ValueError("corrupted xref")
    if job["id"] == "flaky_pdf" and attempts_log["flaky_pdf"] == 1:
        raise TimeoutError("transient 503")

res = process_ingestion_queue([{"id": "ok_pdf"}, {"id": "flaky_pdf"}, {"id": "bad_pdf"}], flaky_worker, max_retries=2)
assert set(res["succeeded"]) == {"ok_pdf", "flaky_pdf"}
assert res["dlq"] == ["bad_pdf"] and attempts_log["bad_pdf"] == 3
print("PASS: Lab 11.4a async queue + DLQ verified!")`,
      solutionCode: `from collections import deque

def process_ingestion_queue(jobs: list[dict], worker_fn, max_retries: int = 2) -> dict:
    q = deque({**j, "attempts": 0} for j in jobs)
    succeeded = []
    dlq = []
    while q:
        job = q.popleft()
        try:
            worker_fn(job)
            succeeded.append(job["id"])
        except Exception:
            if job["attempts"] < max_retries:
                job["attempts"] += 1
                q.append(job)
            else:
                dlq.append(job["id"])
    return {"succeeded": succeeded, "dlq": dlq}`,
      hint: 'Track `attempts` per job dict; requeue via `q.append(job)` while `attempts < max_retries`, else append ID to `dlq`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-4-slo',
      title: 'Lab 11.4b: Error Budget & Release-Freeze Evaluator',
      prompt: 'Implement `evaluate_error_budget(total_reqs: int, failed_reqs: int, slo_target: float = 0.995) -> dict`: compute `allowed_failures = total_reqs * (1.0 - slo_target)`, `remaining_pct = round(max(0.0, (allowed_failures - failed_reqs) / max(1e-9, allowed_failures)) * 100.0, 1)`, and set `freeze_releases = failed_reqs >= allowed_failures`.',
      difficulty: 'spec',
      starterCode: `def evaluate_error_budget(total_reqs: int, failed_reqs: int, slo_target: float = 0.995) -> dict:
    # Return remaining_pct and freeze_releases boolean against SLO error budget
    return {}`,
      testCode: `r1 = evaluate_error_budget(10000, 25, slo_target=0.995)  # 50 allowed
assert r1["remaining_pct"] == 50.0 and r1["freeze_releases"] is False
r2 = evaluate_error_budget(10000, 60, slo_target=0.995)
assert r2["remaining_pct"] == 0.0 and r2["freeze_releases"] is True
print("PASS: Lab 11.4b SLO error-budget evaluator verified!")`,
      solutionCode: `def evaluate_error_budget(total_reqs: int, failed_reqs: int, slo_target: float = 0.995) -> dict:
    allowed = total_reqs * (1.0 - slo_target)
    rem = max(0.0, (allowed - failed_reqs) / max(1e-9, allowed)) * 100.0
    return {
        "allowed_failures": round(allowed, 2),
        "remaining_pct": round(rem, 1),
        "freeze_releases": failed_reqs >= allowed,
    }`,
      hint: 'Compute `allowed = total_reqs * (1.0 - slo_target)` and clamp remaining ratio cleanly to `>= 0.0`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-4-tpm',
      title: 'Lab 11.4c: Quota Capacity & Load-Test Bottleneck Finder (Debug)',
      prompt: 'Fix `can_sustain_load(rpm_target: int, avg_tokens_per_req: int, provider_rpm_limit: int, provider_tpm_limit: int) -> tuple[bool, str]` which currently ignores Token-Per-Minute limits (`rpm_target * avg_tokens_per_req`) and misses regional multi-region failover guidance!',
      difficulty: 'debug',
      starterCode: `def can_sustain_load(rpm_target: int, avg_tokens_per_req: int, provider_rpm_limit: int, provider_tpm_limit: int) -> tuple[bool, str]:
    # BUG: ignores TPM exhaustion completely!
    if rpm_target <= provider_rpm_limit:
        return True, "ok"
    return False, "rpm_exceeded"`,
      testCode: `assert can_sustain_load(100, 4000, 500, 1_000_000) == (True, "ok")
ok, reason = can_sustain_load(200, 8000, 500, 1_000_000)  # 1.6M TPM > 1M TPM!
assert ok is False and reason == "tpm_exceeded"
print("PASS: Lab 11.4c TPM quota load check verified!")`,
      solutionCode: `def can_sustain_load(rpm_target: int, avg_tokens_per_req: int, provider_rpm_limit: int, provider_tpm_limit: int) -> tuple[bool, str]:
    if rpm_target > provider_rpm_limit:
        return False, "rpm_exceeded"
    if rpm_target * avg_tokens_per_req > provider_tpm_limit:
        return False, "tpm_exceeded"
    return True, "ok"`,
      hint: 'Multiply `rpm_target * avg_tokens_per_req` and compare against `provider_tpm_limit` cleanly.',
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & Worked Cloud Load-Testing Playbook',
      paragraphs: [
        'When migrating prototypes onto enterprise cloud infrastructure, teams hit three recurring scaling bottlenecks. First, **misconfigured VPC DNS and timeout layers**: routing Bedrock or Vertex calls through a NAT gateway paired with an upstream reverse proxy capped at 30 seconds silently kills slow Frontier Reasoning completions. Use AWS PrivateLink / VPC Service Controls directly inside regional subnets with streaming SSE keepalives and bounded connect vs read timeouts.',
        'Second, **poisoned message storms on SQS/Celery**: setting queue visibility timeout shorter than PDF OCR job duration makes active jobs appear invisible twice, leading two workers to embed the exact same document concurrently. Size visibility timeouts safely above worst-case OCR duration (`300s`), write idempotent chunk upserts (`ON CONFLICT DO UPDATE`), and configure `maxReceiveCount=3` directly into a monitored Dead-Letter Queue.',
        'Third, **load-testing solely for average latency**: run stepped concurrency tests (`10 -> 50 -> 150` concurrent users) using realistic prompt lengths and token distributions. Track BOTH `RPM` and `TPM` utilization against regional quotas, verify automatic failover when region A returns `429`, and tie monthly availability + p95 TTFT SLOs straight into automated rollback alerts.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked End-to-End Example: Multi-Region Cloud Failover & Ingestion Isolation',
      paragraphs: [
        'Suppose a legal contract copilot handles 40,000 daily interactive Q&As plus intermittent customer bulk drops of 2,000 scanned agreements on Monday mornings. Interactive routes execute inside private VPC subnets invoking Managed Cloud endpoints via IAM role auth (`timeout=12s`), backed by an active failover router: if US-East hits HTTP `429` or `503` twice, a circuit breaker shifts excess requests smoothly to US-West without dropping user tabs.',
        'Meanwhile, bulk contract uploads return `HTTP 202 Accepted` in 35ms and enqueue job descriptors onto durable worker queues with `max_retries=3` and Dead-Letter Queue alerts. Even when a corrupt 600-page file crashes one OCR container twice and lands in DLQ, interactive Q&A stays completely unaffected below its `750ms` p95 TTFT SLO.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'Use Managed Cloud AI platforms (Bedrock/Vertex/Azure) when VPC isolation, IAM auth, and consolidated cloud compliance matter.',
        'Move heavy ingestion and batch pipelines onto idempotent worker queues backed by DLQs.',
        'Test load concurrency against BOTH RPM and TPM quotas, and enforce error-budget release freezes when SLOs burn down.',
        'Always verify worker memory caps, upstream regional fallback routing, and circuit-breaker degraded responses inside staging chaos drills before granting traffic onto live customer domains.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q11-4-1',
      question: 'Why do regulated teams choose AWS Bedrock or Vertex AI over raw public provider bearer keys?',
      options: [
        'IAM roles, VPC PrivateLink, and cloud DPAs simplify security audits',
        'Public provider HTTP endpoints disable structured JSON Schema response validation',
        'Bedrock automatically translates unstructured natural prompts into read-only SQL views',
        'Vertex AI completely waives all enterprise token billing inside private VPCs',
      ],
      correctIndex: 0,
      explanation: 'Managed cloud platforms provide IAM identity auth, private network isolation, and unified compliance agreements.',
    },
    {
      id: 'q11-4-2',
      question: 'What critical safety role does a Dead-Letter Queue (DLQ) play in document ingestion workers?',
      options: [
        'Stores cached semantic FAQ answers persistently inside user browser IndexedDB',
        'Quarantines crashing poisoned files so healthy jobs keep flowing',
        'Doubles vector embedding HNSW index dimensions across active Postgres shards',
        'Converts Python floating-point score tuples into compressed UTF-8 base64 blocks',
      ],
      correctIndex: 1,
      explanation: 'After bounded retries fail, moving bad payloads to a DLQ keeps one broken job from halting the queue.',
    },
    {
      id: 'q11-4-3',
      type: 'predict-output',
      question: 'Under `can_sustain_load(250, 6000, provider_rpm_limit=500, provider_tpm_limit=1_000_000)`, what fails?',
      code: `tpm = 250 * 6000 # 1,500,000 TPM`,
      options: [
        'Passes cleanly because two hundred fifty RPM stays under limit',
        'Fails immediately with `"rpm_exceeded"` request limit rejection',
        'Fails with `"tpm_exceeded"` despite RPM passing',
        'Automatically doubles provider prefix cache hit ratios at runtime',
      ],
      correctIndex: 2,
      explanation: '1.5M TPM exceeds the 1M TPM ceiling even though RPM looks below limit.',
    },
    {
      id: 'q11-4-4',
      type: 'spot-bug',
      question: 'Spot the flaw in benchmarking production readiness using 20-token synthetic pings instead of realistic 5,000-token RAG payloads.',
      options: [
        'Short requests bypass TLS certificate verification checks on ingress proxies',
        'Twenty-token pings corrupt multi-stage cached Dockerfile dependency layers cleanly',
        'Structured JSON payloads reject ISO timestamps whenever request tokens stay small',
        'Short pings skip prefill cost and hide real TPM throttling',
      ],
      correctIndex: 3,
      explanation: 'Real RAG context lengths determine true TTFT and TPM rate-limit exhaustion.',
    },
    {
      id: 'q11-4-5',
      type: 'multi-select',
      question: 'Which engineering mechanisms improve multi-region resilience on cloud AI backends?',
      options: [
        'Configuring cross-region model failover on HTTP 429/503 spikes',
        'Isolating slow OCR ingestion into async worker queues with DLQs',
        'Enforcing circuit breakers returning verified fallback snippets on upstream outage',
        'Removing all timeouts so requests wait indefinitely until 504 gateway errors',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 2],
      explanation: 'Multi-region failover, async DLQ isolation, and bounded timeouts/circuit breakers protect tail availability.',
    },
    {
      id: 'q11-4-6',
      type: 'ordering',
      question: 'Order an asynchronous ingestion pipeline with DLQ quarantine cleanly:',
      options: [],
      items: [
        'API validates upload & enqueues job ID immediately (202 Accepted)',
        'Worker parses layout & embeds chunks idempotently',
        'Transient failures retry up to max_retries with backoff',
        'Permanent failures route to DLQ + trigger ops alert',
      ],
      correctIndex: 0,
      explanation: 'Enqueue quickly -> worker processes idempotently -> bounded retries -> DLQ quarantine.',
    },
    {
      id: 'q11-4-7',
      type: 'numeric',
      question: 'With a `99.0%` availability SLO over 20,000 monthly requests, how many total failed requests are allowed inside the error budget?',
      options: [],
      correctIndex: 0,
      correctNumber: 200,
      tolerance: 0,
      unit: 'requests',
      explanation: '20,000 * (1 - 0.990) = 200 allowed failed requests.',
    },
    {
      id: 'q11-4-8',
      question: 'When should a team run its own GPU `vLLM` deployment instead of pay-per-token managed APIs?',
      options: [
        'When sustained high load or air-gap security justifies dedicated GPU ops',
        'When launching a low-traffic weekend hackathon prototype for ten beta testers',
        'When avoiding Python virtual environments inside standard CI test workflows',
        'When serving fewer than fifty daily FAQ chat requests across small teams',
      ],
      correctIndex: 0,
      explanation: 'Dedicated GPUs lose money at low idle utilization; adopt vLLM once sustained load or air-gap needs justify GPU ops.',
    },
  ],
};
