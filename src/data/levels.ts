import type {
  CapstoneEvidence,
  Competency,
  CourseProgress,
  LevelId,
  LevelPath,
  ScenarioAssessment,
} from '@/types/course';
import { ALL_LESSONS } from './curriculum';

export const COMPETENCIES: Competency[] = [
  // Junior AI Engineer
  {
    id: 'jr-env-git',
    level: 'junior',
    area: 'Foundations & Git',
    title: 'Developer Environment, Git & Secrets Hygiene',
    description: 'Uses isolated virtual environments, Git branches/PRs, clean tracebacks, and `.env` separation without leaking secrets.',
  },
  {
    id: 'jr-python-http',
    level: 'junior',
    area: 'Python & Async APIs',
    title: 'Typed Python, Pytest & Reliable HTTP Calls',
    description: 'Writes typed Python functions/dataclasses, unit tests with mocks, async I/O basics, and JSON serialization safely.',
  },
  {
    id: 'jr-llm-client',
    level: 'junior',
    area: 'LLM Integration',
    title: 'Resilient Provider Calls & Structured Output',
    description: 'Calls real LLM APIs with bounded timeouts, exponential-backoff retries, SSE streaming, and schema-validated JSON parsing.',
  },
  {
    id: 'jr-basic-rag',
    level: 'junior',
    area: 'RAG Foundations',
    title: 'Chunking, Vector Search & Grounded Citations',
    description: 'Builds working RAG over real documents with metadata provenance, citations, and honest abstention when evidence is missing.',
  },
  {
    id: 'jr-basic-evals',
    level: 'junior',
    area: 'Testing & Evals',
    title: 'Golden Eval Set & Regression Assertions',
    description: 'Maintains a small golden eval dataset measuring Recall@k, MRR, and schema/citation pass rates offline in CI.',
  },
  {
    id: 'jr-deploy',
    level: 'junior',
    area: 'Service Packaging',
    title: 'FastAPI Service, Docker Container & Live Deploy',
    description: 'Wraps an AI feature behind FastAPI `/healthz` + `/readyz` + Bearer auth, packages in non-root Docker, and deploys live.',
  },

  // Mid AI Engineer
  {
    id: 'mid-hybrid-rag',
    level: 'mid',
    area: 'Retrieval Engineering',
    title: 'Hybrid BM25 + Vector Reranking & Multi-Tenant ACLs',
    description: 'Combines sparse+dense retrieval with RRF, Stage-2 reranking, query rewriting, and mandatory index-level `tenant_id` pre-filters.',
  },
  {
    id: 'mid-agents-guardrails',
    level: 'mid',
    area: 'Agent Engineering',
    title: 'Guarded Tool-Calling Loops, Memory & HITL',
    description: 'Designs tool contracts, parallel tool execution, indirect prompt-injection isolation, max-iteration/cost caps, and HITL approval gates.',
  },
  {
    id: 'mid-eval-gates',
    level: 'mid',
    area: 'Evaluation Systems',
    title: 'Eval-Driven Iteration & CI Regression Gates',
    description: 'Combines deterministic assertions with debiased pairwise/calibrated LLM judges and confidence-interval deltas blocking bad merges.',
  },
  {
    id: 'mid-observability-cost',
    level: 'mid',
    area: 'Observability & FinOps',
    title: 'Tracing, Prompt Versioning & Cost/Latency Optimization',
    description: 'Instruments structured span traces, prompt hashes, prefix/semantic caching, cascading model routing, and batch APIs.',
  },
  {
    id: 'mid-incidents-design',
    level: 'mid',
    area: 'Reliability & Design',
    title: 'Incident Triage, Async Queues & Design Docs',
    description: 'Diagnoses production failures from logs/traces, isolates slow ingestion via idempotent queues + DLQs, and defends architectural tradeoffs.',
  },

  // Senior AI Engineer
  {
    id: 'sr-sys-architecture',
    level: 'senior',
    area: 'Architecture & Standards',
    title: 'Multi-Service AI Architecture, Build-vs-Buy & ADRs',
    description: 'Leads build-vs-buy, managed platform, latency/RAM capacity sizing, and org-wide Architecture Decision Records (ADRs).',
  },
  {
    id: 'sr-org-evals',
    level: 'senior',
    area: 'Evaluation Strategy',
    title: 'Production-Log Evals, Trajectory Audits & Release Gates',
    description: 'Establishes statistically sound online/offline evaluation standards, flaky-eval controls, and canary/shadow rollout gates.',
  },
  {
    id: 'sr-security-gov',
    level: 'senior',
    area: 'Security & Governance',
    title: 'OWASP LLM Threat Modeling, PII & Compliance',
    description: 'Conducts agent/RAG threat models (SSRF, SQLi, exfiltration, multi-tenant cache poisoning), red-teams systems, and enforces governance.',
  },
  {
    id: 'sr-finops-scale',
    level: 'senior',
    area: 'FinOps & Platform',
    title: 'Unit Economics at Scale, Load Testing & Error Budgets',
    description: 'Sets token/cost SLOs, error budgets, autoscaling worker tiers, and automated spend circuit breakers under spiky enterprise load.',
  },
  {
    id: 'sr-leadership-ops',
    level: 'senior',
    area: 'Leadership & Postmortems',
    title: 'Incident Postmortems, PR Mentoring & PRD Scoping',
    description: 'Leads blameless incident postmortems, scopes ambiguous AI PRDs with ROI math, and mentors engineers through high-bar PR reviews.',
  },
];

export const LEVEL_PATHS: LevelPath[] = [
  {
    id: 'junior',
    title: 'Junior AI Engineer',
    tagline: 'Ships a tested, containerized LLM & RAG feature safely with guidance.',
    honestEffortRange: '120–160 hours (course lessons + local Real Build Track capstones)',
    honestScopeNote:
      'Self-reported program readiness backed by deployed repos and validator evidence.json. Job titles are granted solely by employers—never by any course.',
    barSummary:
      'Calls real provider/local APIs with retries, timeouts, streaming & structured outputs; builds working RAG over real docs with citations; writes offline pytest suites + small golden evals; packages FastAPI in Docker and deploys live without leaking secrets.',
    requiredLessonIds: [
      '0-1', '0-2', '0-3',
      '1-0', '1-1', '1-2', '1-3', '1-5',
      '5-1', '5-4',
      '6-0', '6-1', '6-2', '6-3',
      '7-2',
      '9-1', '9-2', '9-4',
      '8-4', '8-5',
    ],
    requiredLabPct: 60,
    requiredModuleExams: ['mod-1', 'mod-6', 'mod-9'],
    requiredCapstones: ['proj-rag', 'proj-fastapi-docker'],
    requiredScenarios: ['scen-sysdesign-rag'],
    competencyIds: [
      'jr-env-git',
      'jr-python-http',
      'jr-llm-client',
      'jr-basic-rag',
      'jr-basic-evals',
      'jr-deploy',
    ],
  },
  {
    id: 'mid',
    title: 'Mid-Level AI Engineer',
    tagline: 'Owns production RAG, guarded agents, CI eval gates, tracing & cost optimization end to end.',
    honestEffortRange: '+100–150 hours beyond Junior (deep builds, trace debugging & ADR writing)',
    honestScopeNote:
      'Passing every requirement here demonstrates strong Mid-level portfolio artifacts; real team experience operating live customer traffic remains the decisive signal for employers.',
    barSummary:
      'Iterates features via CI regression gates; ships hybrid BM25+vector retrieval + reranking with tenant isolation; builds budget-guarded tool agents with HITL; instruments OpenTelemetry spans & prompt caching/routing; triages live incidents and writes crisp ADRs.',
    requiredLessonIds: [
      '0-1', '0-2', '0-3',
      '1-0', '1-1', '1-2', '1-3', '1-4', '1-5', '1-6',
      '5-1', '5-2', '5-3', '5-4',
      '6-0', '6-1', '6-2', '6-3', '6-4', '6-5',
      '7-1', '7-2', '7-3', '7-4',
      '9-1', '9-2', '9-3', '9-4',
      '8-1', '8-3', '8-4', '8-5',
      '10-1', '10-2', '10-3', '10-4', '10-5',
      '11-1', '11-2', '11-3',
    ],
    requiredLabPct: 75,
    requiredModuleExams: ['mod-6', 'mod-7', 'mod-9', 'mod-8', 'mod-10'],
    requiredCapstones: ['proj-rag', 'proj-agent', 'proj-fastapi-docker', 'proj-eval-harness'],
    requiredScenarios: ['scen-sysdesign-rag', 'scen-incident-postmortem', 'scen-adr-routing'],
    competencyIds: [
      'jr-env-git', 'jr-python-http', 'jr-llm-client', 'jr-basic-rag', 'jr-basic-evals', 'jr-deploy',
      'mid-hybrid-rag', 'mid-agents-guardrails', 'mid-eval-gates', 'mid-observability-cost', 'mid-incidents-design',
    ],
  },
  {
    id: 'senior',
    title: 'Senior AI Engineer (Course Bar + Real Production Experience Required)',
    tagline: 'Architects multi-service platforms, sets org eval/security standards, leads postmortems & FinOps.',
    honestEffortRange: '+100 hours beyond Mid + multi-year real production team ownership (cannot be replaced by any course)',
    honestScopeNote:
      'IMPORTANT HONESTY DISCLOSURE: No online course or self-graded capstone can verify or substitute for Senior-level production experience leading live systems, cross-team trade-offs, and organizational scope. This bar represents full course + artifact completion only.',
    barSummary:
      'Designs multi-service AI architectures with build-vs-buy rigor; defines org eval strategy & error budgets; builds threat models against OWASP LLM attacks; optimizes unit economics at scale; leads blameless incident postmortems and engineering reviews.',
    requiredLessonIds: ALL_LESSONS.map((l) => l.id),
    requiredLabPct: 85,
    requiredModuleExams: ['mod-6', 'mod-7', 'mod-8', 'mod-9', 'mod-10', 'mod-11', 'final-assessment'],
    requiredCapstones: [
      'proj-churn',
      'proj-rag',
      'proj-agent',
      'proj-fastapi-docker',
      'proj-eval-harness',
      'proj-bilingual',
      'proj-woocommerce-bilingual',
    ],
    requiredScenarios: ['scen-sysdesign-rag', 'scen-incident-postmortem', 'scen-adr-routing'],
    competencyIds: COMPETENCIES.map((c) => c.id),
  },
];

export const SCENARIO_ASSESSMENTS: ScenarioAssessment[] = [
  {
    id: 'scen-sysdesign-rag',
    minLevel: 'junior',
    kind: 'system-design',
    title: 'System-Design Review: Multi-Tenant Support Copilot (500K DAU)',
    prompt:
      'Review and complete an architecture spec for a B2B SaaS Support Copilot serving 2,000 enterprise tenants (~120,000 support turns/day, p95 TTFT SLA <= 800 ms, unit budget <= $0.004/turn, zero cross-tenant leaks, and tool access to check order status or propose refunds up to $250). Write your design breakdown covering: (1) Retrieval & tenant isolation; (2) Caching, model routing & latency budget; (3) Tool safety & HITL; (4) Offline/online evals & outage fallback.',
    artifactTitle: 'Candidate Draft Under Review (Spot Flaws & Rewrite Cleanly)',
    artifactContent: `Draft v0.1 Notes:
- Embed all PDFs using vector model into one shared collection; fetch global top_k=5 then filter tenant_id in Python.
- Send full 8,000-token prompt directly to Frontier Reasoning model on every request.
- Allow agent tool issue_refund(order_id, amount) directly whenever model requests it.
- No CI evals yet; rely on manual Slack spot checks.`,
    rubric: [
      {
        id: 'r-sd-1',
        criterion: 'Index-Level Tenant ACL Pre-Filtering & Hybrid Retrieval',
        maxPoints: 25,
        guidance: 'Rejects Python post-filtering; moves tenant_id + role ACL inside index scan before ranking, and fuses BM25 + dense embeddings + Stage-2 reranking for SKU accuracy.',
      },
      {
        id: 'r-sd-2',
        criterion: 'Concrete Latency Budget (<= 800 ms TTFT) & SSE Streaming',
        maxPoints: 20,
        guidance: 'Breaks down millisecond budget (cache ~15ms + embed ~45ms + hybrid search ~50ms + rerank ~110ms + TTFT ~350ms) and streams SSE chunks.',
      },
      {
        id: 'r-sd-3',
        criterion: 'FinOps Unit Economics (Caching + Tiered Routing <= $0.004/turn)',
        maxPoints: 20,
        guidance: 'Combines tenant-partitioned exact/semantic FAQ cache + Prompt Prefix Caching + small-fast router handling ~75% simple queries before escalating.',
      },
      {
        id: 'r-sd-4',
        criterion: 'Deterministic Tool Contracts, Prompt Injection Shield & HITL',
        maxPoints: 20,
        guidance: 'Wraps untrusted notes/docs in XML delimiters, validates `0 < amount <= order_total` in backend code, and requires HITL queue above refund threshold ($100).',
      },
      {
        id: 'r-sd-5',
        criterion: 'CI Golden Eval Gate & Outage Graceful Fallback',
        maxPoints: 15,
        guidance: 'Enforces golden Recall/Citation gate in CI plus circuit breaker failing over to secondary region or verified BM25 snippets on 503/timeout.',
      },
    ],
    passPoints: 75,
    exampleScoredAnswer: `Example Scored Response (95/100):
1) Retrieval & Isolation: Replace global top_k post-filtering (which leaks existence and starves small tenants) with mandatory index-level \`tenant_id\` + role ACL pre-filtering. Run Hybrid BM25 (exact error codes/SKUs) + HNSW dense retrieval fused via RRF (top 40) -> Stage-2 Cross-Encoder reranker (top 5).
2) Latency & FinOps: Budget ~570 ms interactive TTFT (15 ms Redis cache check -> 45 ms query embed -> 50 ms hybrid scan -> 110 ms rerank -> 350 ms SSE streaming TTFT). Partition Redis FAQ cache keys by \`(tenant_id, acl_version, index_version, hash)\`. Route ~75% routine lookups to Small-Fast tier + enable Prefix Caching on static tool/system headers, cutting blended cost below $0.003/turn.
3) Tool & Injection Guardrails: Isolate untrusted customer order notes inside \`<untrusted_note>\` XML bounds, enforce Pydantic \`0 < amount <= order_total\`, and require Human-in-the-Loop approval whenever \`amount > $100\`.
4) Evals & Resilience: Gate PRs on a 100-case golden suite (Recall@5 >= 0.88, 100% valid citations, red-team suite 100% pass). On upstream 503 or >4s timeout, trip circuit breaker to secondary provider or return ranked BM25 doc snippets directly.`,
  },
  {
    id: 'scen-incident-postmortem',
    minLevel: 'mid',
    kind: 'incident-postmortem',
    title: 'Incident Postmortem: Production Latency Spike, Spend Burn & Tenant Cache Leak',
    prompt:
      'Analyze the real-style trace and log bundle below from a Friday 02:14 UTC production incident. Write a blameless incident postmortem covering: (1) Timeline & exact impact; (2) All 3 distinct root causes visible in the telemetry; (3) Immediate emergency mitigations; (4) Permanent engineering fixes & CI gates.',
    artifactTitle: 'Captured Production Telemetry Bundle (UTC 02:10–02:28)',
    artifactContent: `{"ts":"02:12:04","tenant":"acme","cache_key":"faq:sha256(q_refund_policy)","cache_hit":false,"route":"frontier","tokens_in":6400,"tokens_out":420,"cost_usd":0.021,"status":200,"latency_ms":910}
{"ts":"02:14:11","tenant":"beta","cache_key":"faq:sha256(q_refund_policy)","cache_hit":true,"served_doc":"acme_private_sla.pdf","status":200,"latency_ms":4}
{"ts":"02:15:30","tenant":"gamma_webhook","route":"agent","step":1,"tool":"lookup_invoice","arg":"inv=None","error":"ValueError: inv missing","cost_usd":0.032}
{"ts":"02:15:32","tenant":"gamma_webhook","route":"agent","step":2,"tool":"lookup_invoice","arg":"inv=None","error":"ValueError: inv missing","cost_usd":0.034}
... (repeated 28 times on single request; 410 concurrent webhook calls triggered per-minute alert)
{"ts":"02:18:45","route":"uvicorn_worker","event":"event_loop_blocked","blocking_call":"requests.post(upstream_eval_hook)","blocked_ms":14200,"healthz_status":504}`,
    rubric: [
      {
        id: 'r-ip-1',
        criterion: 'Catches Root Cause 1: Cross-Tenant Cache Poisoning',
        maxPoints: 25,
        guidance: 'Identifies `cache_key` missed `tenant_id` (and `acl_version`), leaking `acme_private_sla.pdf` directly to `beta` at 02:14:11.',
      },
      {
        id: 'r-ip-2',
        criterion: 'Catches Root Cause 2: Unbounded Agent Retry Loop + Missing USD Breaker',
        maxPoints: 25,
        guidance: 'Spots `gamma_webhook` spinning 28 identical invalid `lookup_invoice(inv=None)` steps without `max_iterations`, duplicate-call breaker, or per-tenant daily USD cap.',
      },
      {
        id: 'r-ip-3',
        criterion: 'Catches Root Cause 3: Blocking Synchronous HTTP in Async FastAPI Loop',
        maxPoints: 20,
        guidance: 'Identifies synchronous `requests.post` inside `async def` blocking `/healthz` (`504`) for 14.2s across all concurrent requests.',
      },
      {
        id: 'r-ip-4',
        criterion: 'Safe Immediate Mitigations & Customer Containment',
        maxPoints: 15,
        guidance: 'Purges/disables shared Redis cache namespace immediately, revokes/throttles `gamma_webhook`, notifies affected tenant security contact honestly.',
      },
      {
        id: 'r-ip-5',
        criterion: 'Permanent Prevention & Regression Tests',
        maxPoints: 15,
        guidance: 'Mandates `(tenant_id, role_scope, index_version)` cache prefix + CI multi-tenant test, `max_iterations=5` + duplicate-call abort, and `httpx.AsyncClient` + Ruff async lint.',
      },
    ],
    passPoints: 75,
    exampleScoredAnswer: `Example Scored Postmortem (96/100):
1) Impact & Timeline: Between 02:14–02:28 UTC, (a) tenant \`beta\` received a cached private document from \`acme\`, (b) \`gamma_webhook\` burned excess frontier spend looping 28 steps/request, and (c) synchronous upstream telemetry blocked Uvicorn, failing \`/healthz\` probes (504).
2) Root Causes:
   - Cache Poisoning: \`faq:sha256(...)\` lacked \`tenant_id\` and ACL version, allowing cross-tenant cache hits.
   - Missing Agent Guardrails: \`run_agent\` lacked \`max_iterations\`, duplicate identical failing tool-arg detection (\`inv=None\`), and per-tenant USD daily circuit breakers.
   - Event-Loop Starvation: \`requests.post()\` ran synchronously inside an \`async def\` FastAPI route for 14.2s.
3) Immediate Mitigation: Flush Redis \`faq:*\` keys and temporarily bypass cache; throttle/block \`gamma_webhook\` key with 429; roll back or disable blocking eval webhook.
4) Permanent Action Items: (a) Enforce tenant-prefixed cache key helper + automated CI multi-tenant isolation test; (b) Add \`max_iterations=5\`, duplicate-tool-error termination, and daily USD breaker; (c) Replace \`requests.post\` with non-blocking \`httpx.AsyncClient\` with 2s timeout or background worker queue.`,
  },
  {
    id: 'scen-adr-routing',
    minLevel: 'mid',
    kind: 'adr',
    title: 'Architecture Decision Record (ADR): Hosted API vs Self-Hosted Open-Weights + Tiered Router',
    prompt:
      'Your startup processes 400,000 classification + RAG synthesis turns/day (~75% simple policy/routing, ~25% complex technical debugging). Currently 100% hit a Frontier Reasoning API ($1,850/day). Leadership asks: "Should we rent 4x H100 GPUs immediately to self-host a 70B open-weights model?" Write a 1-page ADR evaluating: (1) Context & Constraints; (2) Options Considered (All-Frontier vs Dedicated H100 vLLM vs Hybrid Cascading Router + Caching); (3) Unit-Economics Math; (4) Decision & Reversibility / Eval Gate.',
    rubric: [
      {
        id: 'r-adr-1',
        criterion: 'Crisp Context, Constraints & Non-Goals',
        maxPoints: 20,
        guidance: 'Captures daily QPS/volume (400k turns/day), 75/25 complexity split, team ops capacity, latency SLA, and data-residency requirements.',
      },
      {
        id: 'r-adr-2',
        criterion: 'Honest Multi-Option Tradeoff Comparison',
        maxPoints: 25,
        guidance: 'Compares Status-Quo Frontier API, Self-Hosted 70B vLLM cluster (ops burden, cold failover, spiky peak sizing), and Cascading Small-Fast + Frontier + Prefix/FAQ Cache.',
      },
      {
        id: 'r-adr-3',
        criterion: 'Explicit Cost & Latency Math',
        maxPoints: 25,
        guidance: 'Quantifies daily USD savings (~70%+ drop via 25% cache + 75% small-fast routing) vs GPU rental utilization and maintenance overhead.',
      },
      {
        id: 'r-adr-4',
        criterion: 'Actionable Decision + Reversibility Plan',
        maxPoints: 15,
        guidance: 'Commits cleanly via provider-agnostic adapter (`MODEL_CATALOG` role config) so future swap to vLLM/Ollama stays 1 config change.',
      },
      {
        id: 'r-adr-5',
        criterion: 'Golden Eval & Canary Rollout Criteria',
        maxPoints: 15,
        guidance: 'Requires <=1% quality delta on 200-case golden suite + 5% shadow/canary traffic verification before full rollout.',
      },
    ],
    passPoints: 75,
    exampleScoredAnswer: `Example Scored ADR (94/100):
- Status: Accepted — Adopt Provider-Agnostic Cascading Router + Caching (Defer Self-Hosted 70B GPUs).
- Context: 400k turns/day costs ~$1,850/day (~$55k/mo) on uncached frontier APIs. Our lean 3-engineer team has no dedicated GPU SREs and zero strict on-prem airgap requirement yet.
- Options: (1) Keep 100% Frontier ($55k/mo—unsustainable margin). (2) Self-host 70B across 4x H100 GPUs (~$18k–$25k/mo reserved + SRE ops burden for failover/autoscaling). (3) Keep Frontier strictly for the 25% hard queries + deploy tenant-safe Redis cache (20% hit rate) + Small-Fast model role for 75% routine turns (~$350–$450/day, >75% savings, zero GPU ops!).
- Reversibility & Eval Gate: Keep all inference behind our OpenAI-compatible \`LLMClient\` adapter so if regulatory residency or steady QPS later warrants vLLM, we flip \`LLM_BASE_URL\` cleanly. Roll out router via 10% shadow -> canary gated on <=1% delta across our 200-case golden suite.`,
  },
];

export function validateCapstoneEvidence(
  expectedProjectId: string,
  repoUrl: string,
  demoUrl: string,
  rawJson: string
): { valid: boolean; error?: string; parsedSummary?: CapstoneEvidence['parsedSummary'] } {
  const httpsPrefix = 'https:' + '//';
  const httpLocal = 'http:' + '//localhost';
  const trimmedRepo = repoUrl.trim();
  const trimmedDemo = demoUrl.trim();

  if (!trimmedRepo.startsWith(httpsPrefix) || trimmedRepo.length < 15) {
    return { valid: false, error: 'Public repository URL must be an encrypted web link to your pushed GitHub repo.' };
  }
  if (!(trimmedDemo.startsWith(httpsPrefix) || trimmedDemo.startsWith(httpLocal)) || trimmedDemo.length < 12) {
    return { valid: false, error: 'Live demo URL (or localhost proof URL for local-only runs) is required.' };
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { valid: false, error: 'evidence.json is not valid JSON. Run `make check` inside the downloaded capstone repo and paste the full output.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'evidence.json must be a JSON object.' };
  }
  if (parsed.project_id !== expectedProjectId) {
    return { valid: false, error: `project_id mismatch: expected "${expectedProjectId}", got "${String(parsed.project_id)}".` };
  }
  if (typeof parsed.generated_at !== 'string' || Number.isNaN(Date.parse(parsed.generated_at))) {
    return { valid: false, error: 'evidence.json missing valid ISO-8601 `generated_at` timestamp.' };
  }

  const tests = parsed.tests as Record<string, unknown> | undefined;
  if (!tests || typeof tests.passed !== 'number' || typeof tests.failed !== 'number' || tests.passed < 1 || tests.failed > 0) {
    return { valid: false, error: 'evidence.json `tests` must have `passed >= 1` and `failed === 0`.' };
  }

  const latency = parsed.latency_ms as Record<string, unknown> | undefined;
  const cost = parsed.cost_usd as Record<string, unknown> | undefined;
  const security = parsed.security as Record<string, unknown> | undefined;

  if (!latency || typeof latency.p95 !== 'number' || !cost || typeof cost.per_request !== 'number') {
    return { valid: false, error: 'evidence.json missing numeric `latency_ms.p95` or `cost_usd.per_request`.' };
  }
  if (!security || security.secret_scan_passed !== true || security.injection_tests_passed !== true) {
    return { valid: false, error: 'evidence.json security checks (`secret_scan_passed` and `injection_tests_passed`) must both pass.' };
  }
  if (parsed.passed !== true) {
    return { valid: false, error: 'evidence.json top-level `passed` must be `true`.' };
  }

  return {
    valid: true,
    parsedSummary: {
      passed: true,
      testsPassed: tests.passed,
      testsFailed: tests.failed,
      p95Ms: latency.p95,
      costPerReqUsd: cost.per_request,
      secretScanPassed: true,
      injectionTestsPassed: true,
      mode: typeof parsed.mode === 'string' ? parsed.mode : 'offline_fixture',
    },
  };
}

export interface LevelReadinessResult {
  level: LevelPath;
  ready: boolean;
  lessonsDone: number;
  lessonsTotal: number;
  missingLessons: string[];
  labPct: number;
  labsPass: boolean;
  missingExams: string[];
  missingCapstones: string[];
  missingScenarios: string[];
}

export function evaluateLevelReadiness(
  levelId: LevelId,
  progress: CourseProgress,
  totalLabsCount: number
): LevelReadinessResult {
  const level = LEVEL_PATHS.find((p) => p.id === levelId) || LEVEL_PATHS[0];
  const doneSet = new Set(progress.completedLessons);

  // If developer placement fast track unlocked, beginner module 0 and 1-0..1-2 count toward lesson gate
  if (progress.fastTrackUnlocked) {
    for (const id of ['0-1', '0-2', '0-3', '1-0', '1-1', '1-2']) doneSet.add(id);
  }

  const missingLessons = level.requiredLessonIds.filter((id) => !doneSet.has(id));
  const lessonsDone = level.requiredLessonIds.length - missingLessons.length;

  const labPct = totalLabsCount > 0 ? Math.round((progress.completedLabs.length / totalLabsCount) * 100) : 0;
  const labsPass = labPct >= level.requiredLabPct;

  const missingExams = level.requiredModuleExams.filter((exId) => {
    const rec = progress.moduleExamScores?.[exId];
    if (!rec || rec.total <= 0) return true;
    return rec.bestScore < Math.ceil(rec.total * 0.7);
  });

  const missingCapstones = level.requiredCapstones.filter((projId) => {
    const ev = progress.capstoneEvidence?.[projId];
    return !ev || !ev.parsedSummary?.passed;
  });

  const missingScenarios = level.requiredScenarios.filter((scId) => {
    const spec = SCENARIO_ASSESSMENTS.find((s) => s.id === scId);
    const rec = progress.scenarioScores?.[scId];
    if (!spec || !rec) return true;
    return rec.selfScore < spec.passPoints || rec.responseText.trim().length < 60;
  });

  const ready =
    missingLessons.length === 0 &&
    labsPass &&
    missingExams.length === 0 &&
    missingCapstones.length === 0 &&
    missingScenarios.length === 0;

  return {
    level,
    ready,
    lessonsDone,
    lessonsTotal: level.requiredLessonIds.length,
    missingLessons,
    labPct,
    labsPass,
    missingExams,
    missingCapstones,
    missingScenarios,
  };
}

export function exportEvidencePackMarkdown(
  levelId: LevelId,
  progress: CourseProgress,
  totalLabsCount: number
): string {
  const status = evaluateLevelReadiness(levelId, progress, totalLabsCount);
  const dateStr = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# AI Engineering Level Readiness & Evidence Pack`,
    ``,
    `- **Candidate:** ${progress.learnerName}`,
    `- **Target Level:** ${status.level.title}`,
    `- **Generated:** ${dateStr}`,
    `- **Status:** ${status.ready ? 'ALL PROGRAM REQUIREMENTS MET (Self-Reported Readiness)' : 'IN PROGRESS'}`,
    ``,
    `> **Honesty & Verification Disclaimer:** This document summarizes self-reported course progress paired with local validator \`evidence.json\` artifacts. No online course grants a job title; employers verify real production capability via your public repositories, live deployments, and technical interviews.`,
    ``,
    `## 1. Program Metrics Summary`,
    `- Required Lessons: ${status.lessonsDone}/${status.lessonsTotal}`,
    `- In-Browser Python/SQL Labs: ${progress.completedLabs.length}/${totalLabsCount} (${status.labPct}%, threshold >= ${status.level.requiredLabPct}%)`,
    `- Module / Final Exams Passed (>=70%): ${status.level.requiredModuleExams.length - status.missingExams.length}/${status.level.requiredModuleExams.length}`,
    `- Verified Capstone Evidence Packs: ${status.level.requiredCapstones.length - status.missingCapstones.length}/${status.level.requiredCapstones.length}`,
    `- Rubric Scenario Reviews Completed: ${status.level.requiredScenarios.length - status.missingScenarios.length}/${status.level.requiredScenarios.length}`,
    ``,
    `## 2. Capstone Repository & \`evidence.json\` Proofs`,
  ];

  for (const projId of status.level.requiredCapstones) {
    const ev = progress.capstoneEvidence?.[projId];
    if (ev && ev.parsedSummary) {
      lines.push(`### \`${projId}\``);
      lines.push(`- Repo: ${ev.repoUrl}`);
      lines.push(`- Live Demo: ${ev.demoUrl}`);
      lines.push(
        `- Validator Summary (\`${ev.parsedSummary.mode}\`): ${ev.parsedSummary.testsPassed} tests passed (${ev.parsedSummary.testsFailed} failed) | p95=${ev.parsedSummary.p95Ms}ms | cost=$${ev.parsedSummary.costPerReqUsd}/req | security=${ev.parsedSummary.secretScanPassed && ev.parsedSummary.injectionTestsPassed ? 'PASS' : 'FAIL'}`
      );
    } else {
      lines.push(`### \`${projId}\` — Missing validated \`evidence.json\``);
    }
  }

  lines.push(``);
  lines.push(`## 3. Scenario Reviews (System Design / Incident Postmortem / ADR)`);
  for (const scId of status.level.requiredScenarios) {
    const spec = SCENARIO_ASSESSMENTS.find((s) => s.id === scId);
    const rec = progress.scenarioScores?.[scId];
    lines.push(`### ${spec?.title || scId}`);
    if (rec) {
      lines.push(`- Self-Graded Score: ${rec.selfScore}/${rec.maxScore} (pass bar: ${spec?.passPoints ?? 75})`);
      lines.push(``);
      lines.push(rec.responseText.trim());
    } else {
      lines.push(`- Not completed yet.`);
    }
    lines.push(``);
  }

  return lines.join('\n');
}
