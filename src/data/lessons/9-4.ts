import type { Lesson } from '@/types/course';

export const lesson9_4: Lesson = {
  id: '9-4',
  moduleId: 'mod-9',
  number: '9.4',
  title: 'Cloud Deployment to Free Hosts, Production READMEs & Incident Runbooks',
  subtitle: 'Deploy FastAPI and Next.js AI apps live onto free-tier cloud hosts with strict CORS, smoke tests, portfolio-grade READMEs, and actionable on-call runbooks.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['9-2', '9-3'],
  requires: ['docker-containers-best-practices', 'owasp-llm-security', 'incident-response'],
  teaches: [
    'free-tier-cloud-deployment',
    'cors-security-config',
    'production-readme-craft',
    'oncall-incident-runbooks',
  ],
  competencies: ['jr-deploy', 'mid-incidents-design'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Deploy a live two-tier AI stack (Next.js UI on Vercel + Dockerized FastAPI backend on Render/Fly.io/Railway free tier) cleanly.',
    'Configure strict CORS origin allowlists (`allow_origins=["myapp.vercel.app"]`) without wildcards paired with credentials.',
    'Execute automated post-deployment smoke tests verifying `/healthz`, `/readyz`, `401` auth rejection, `422` validation, and `200` inference.',
    'Author an employer-ready project `README.md` (architecture, live URL, quickstart, eval metrics, limitations) and actionable incident `RUNBOOK.md`.',
  ],
  checkWithoutNotes: [
    'Why does combining `allow_origins=["*"]` with `allow_credentials=True` in CORS middleware create a security violation that browsers reject or expose cookies across?',
    'List the five essential smoke checks you must run automatically immediately after deploying a new AI backend release.',
    'What six concrete sections make an AI portfolio `README.md` stand out immediately to hiring engineers?',
    'Contrast a generic "restart server if broken" note against an actionable 4-part incident `RUNBOOK.md` entry.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'A Localhost Demo Does Not Get You Hired—Live Deployed Links Do',
      paragraphs: [
        'Hiring managers spend roughly two to three minutes inspecting a junior candidate’s GitHub repository. If your README starts with *"First clone the repo, install CUDA 12.1, run 4 notebooks in order, and manually paste an OpenAI key,"* almost nobody runs it. By contrast, a repo offering a **live clickable demo URL**, a crisp architecture diagram, a one-command `docker compose up` quickstart, measured golden-eval scores, and an on-call `RUNBOOK.md` signals immediately that you ship real software rather than class exercises.',
        'Best of all, deploying a full-stack AI service costs **zero dollars** during job hunting when structured smartly: host your static/Edge React or Next.js frontend cleanly on **Vercel** free Hobby tier, deploy your lightweight Dockerized Python **FastAPI** backend (calling hosted LLM APIs or small CPU embeddings) on **Render**, **Fly.io**, or **Railway** free/starter tiers, connect **Supabase** or **Neon** free Postgres (`pgvector`), and keep API secrets safely inside each host’s encrypted environment dashboard.',
        'Turning a local project into a public production URL exposes real operational hurdles that notebooks hide forever: browser CORS preflight rejections, dynamic container port assignment, cold-start memory ceilings, missing `.env` documentation for reviewers, and noisy cloud outages. Mastering free-tier deployment alongside clean project documentation bridges the exact gap between learning AI concepts and contributing cleanly on an engineering team from week one—while giving recruiters live proof that your systems survive real browser and API traffic.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Wiring Vercel Frontend to Your Python Cloud Container',
      frontendConcept: 'Setting `NEXT_PUBLIC_API_URL` in Vercel to reach a deployed Express API while guarding cross-origin cookies/headers',
      aiConcept: 'CORS Origin Allowlists, Free-Tier Cold-Start Mitigation & Post-Deploy Smoke Suites',
      explanation:
        'When your browser app on `myapp.vercel.app` calls your Python backend on `my-api.onrender.com`, browsers enforce **CORS (Cross-Origin Resource Sharing)** preflight checks. Your FastAPI server must list exact allowed frontend origins (production HTTPS domain + local dev origin)—never mixing wildcard `*` with `allow_credentials=True`—and handle free-tier container sleep wakeups gracefully with loading states and clean retry timeouts.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Zero-Dollar Cloud Deployment Architecture & CORS Hygiene',
      paragraphs: [
        'Trace a concrete end-to-end free-tier deployment checklist step by step. **Step 1 (Containerize Backend):** verify your non-root `Dockerfile` binds `--host 0.0.0.0 --port ${PORT:-8000}` because cloud PaaS hosts assign the external port dynamically via the `$PORT` environment variable (hardcoding `8000` only fails health checks when Render injects `PORT=10000`!). **Step 2 (CORS Allowlist):** parse `ALLOWED_ORIGINS` from env (`"app.example.com,localhost:3000"`) into an explicit list, raising an error on startup if `"*"` appears alongside `allow_credentials=True` or if unencrypted non-local `http` origins slip into production settings.',
        '**Step 3 (Free-Tier Constraints & Cold Starts):** free backend instances often sleep after 15 minutes of idle traffic (taking 15–40 seconds to wake on the first ping) and cap RAM tightly (`512 MB` on Render free tier). Avoid loading giant 1.5 GB PyTorch/sentence-transformer weights inside a 512 MB container! Call hosted `Embedding` tier APIs from `MODEL_CATALOG` or tiny quantized ONNX/TF-IDF retrievers in RAM, configure `/healthz` + `/readyz` probes cleanly, and display a helpful `"Waking backend instance..."` banner on your frontend if the first cold request takes a few seconds.',
        '**Step 4 (Automated Post-Deploy Smoke Check):** never mark a deploy "done" just because CI green-checked earlier on mock fixtures. Missing secrets in the Render/Vercel dashboard, wrong CORS origin typos, or stale migration scripts break live releases even when unit tests passed. Immediately run a 5-check HTTP smoke script against the live URL confirming: `/healthz -> 200`, `/readyz -> 200`, unauthenticated `POST /v1/ask -> 401`, invalid JSON `POST /v1/ask -> 422`, and valid authenticated request `-> 200` returning required JSON fields.',
      ],
    },
    {
      type: 'code',
      title: 'Production Pattern: Dynamic `$PORT` Startup & Smoke Verification Checklist',
      language: 'bash',
      code: `# 1. Bind $PORT dynamically in Dockerfile CMD (essential on Render/Railway/Fly!)
# CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port \${PORT:-8000}"]

# 2. Automated Smoke Test Matrix (run immediately after deploy completes):
# Check 1: GET  /healthz                       -> expect 200 {"status": "alive"}
# Check 2: GET  /readyz                        -> expect 200 {"status": "ready"}
# Check 3: POST /v1/ask (no Auth header)       -> expect 401 (never 200 or 500!)
# Check 4: POST /v1/ask (empty query "")       -> expect 422 Pydantic validation error
# Check 5: POST /v1/ask (valid Auth + payload) -> expect 200 with non-empty citations/answer`,
      caption: 'Binding `${PORT:-8000}` and running a 5-assertion live smoke matrix catches missing cloud env vars and broken auth within seconds of release.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Writing a Standout Portfolio `README.md` & `RUNBOOK.md`',
      paragraphs: [
        'Great repositories answer every reviewer question cleanly in 60 seconds. Structure every capstone `README.md` with six crisp sections: **1) Problem & Architecture:** one-sentence summary + clean ASCII/Mermaid flow showing Client -> FastAPI -> Hybrid Retriever -> LLM -> Eval Gate; **2) Live Demo & Screenshots:** direct demo link plus sample input/output JSON; **3) Measured Evaluation Metrics:** concrete table (`"Golden Eval Pass Rate: 94% across 50 cases, p95 latency: 820 ms, avg cost: $0.0018/query"`); **4) Quickstart Locally:** exact 3 commands (`cp .env.example .env`, `docker compose up --build`, `pytest`); **5) Engineering Tradeoffs & Security:** why you chose Hybrid RRF + Cross-Encoder, tenant isolation, and budget caps; **6) Known Limitations & Next Improvements** (honesty builds massive credibility!).',
        'Alongside `README.md`, author a concise `RUNBOOK.md` inside `docs/` so anyone woken up at 3 AM—including future you two months later—knows exactly how to diagnose and stabilize failures calmly. Cover your top three realistic outages using a 4-part template: **Symptom & Alert Trigger** (e.g., `"HTTP 429 Upstream Rate Limit Spike"` or `"Golden Citation Recall Dropped < 80%"`) -> **Triage Verification** (exact structured log query or `/readyz` probe confirming root cause) -> **Safe Mitigation Now** (exact feature flag toggle, fallback model switch, cache TTL bump, or immutable rollback command) -> **Postmortem Promotion** (add an anonymized failing payload straight into your golden CI suite so the exact regression never ships twice). Rehearsing one simulated failure before launch guarantees every command actually runs cleanly.',
      ],
    },
    {
      type: 'table',
      title: 'Actionable `RUNBOOK.md` Template for AI Services',
      headers: ['Incident Symptom', 'First Telemetry Check', 'Immediate Safe Mitigation'],
      rows: [
        ['`503 / 504` Upstream LLM Timeout Surge', 'Inspect structured `upstream_status` & `latency_ms` logs', 'Trip circuit breaker to fallback smaller/secondary model or cached deterministic response'],
        ['Sudden Daily USD Spend Spike', 'Query `tenant_id` spend counters & trace `tokens_out` loops', 'Verify per-tenant `429` budget breaker active; temporarily lower max `iterations` / `top_k`'],
        ['Bad Prompt / Index Regresses Accuracy', 'Check deployed `prompt_hash` + `index_version` SHA', 'Rollback immutably to prior verified artifact hash; promote sanitized failing query to CI golden suite'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common Cloud Deployment & Documentation Mistakes & How to Debug Them',
      paragraphs: [
        '1) Hardcoding `--port 8000` in container `CMD` without honoring `$PORT`: Render, Cloud Run, and Railway health checkers probe `$PORT` (such as `10000` or `8080`) and kill healthy containers repeatedly if `uvicorn` listens solely on `8000`. Always bind `--port ${PORT:-8000}` inside a shell wrapper.',
        '2) Setting `allow_origins=["*"]` WITH `allow_credentials=True` in FastAPI `CORSMiddleware`: browsers forbid wildcard `*` combined with credentials/cookies per the Fetch specification, breaking authenticated frontend fetches completely! Parse an explicit comma-separated `ALLOWED_ORIGINS` list from environment config instead, checking during boot that production environments never accept wildcard origins.',
        '3) Trying to squeeze a heavy 1.5 GB PyTorch + local BERT embedding checkpoint onto a free `512 MB` cloud container: the container OOM-kills (`Exit Code 137`) during boot before `/readyz` ever answers. Profile `RSS` memory locally via `docker stats` or use hosted embedding APIs alongside lightweight ONNX or sparse BM25 retrievers.',
        '4) Writing a `README.md` containing generic marketing fluff (*"Revolutionary next-gen AI powered by LLMs!"*) with zero eval numbers, zero sample API curl commands, and broken local setup steps: hiring teams skip undocumented repos immediately. Replace vague adjectives with measured golden-eval pass rates, latency percentiles, cost per query, explicit architecture tradeoffs, and tested Docker commands.',
        '5) Putting deployment steps and recovery procedures only in a developer’s head with no `RUNBOOK.md`: during a live outage, guesswork extends downtime tenfold—write exact rollback commands, log query filters, and health-check targets while calm.',
        '6) Forgetting to update `.env.example` whenever adding a new required setting in code: teammates or open-source reviewers hit immediate `KeyError` crashes on startup because required variables went undocumented. Verify `.env.example` parity automatically inside your release checklist.',
        '7) Treating green unit tests on local mocks as proof that live production deploys succeeded: missing cloud secrets, stale database schemas, dynamic port mismatches, or misconfigured CORS rules only appear after real HTTP smoke checks verify `/healthz`, `/readyz`, `401`, `422`, and `200` routes against the live public URL right after every deployment finishes.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 8.4 Recap: Shipping Live & Documenting Like a Pro',
      body: '- Deploy Next.js UIs on Vercel plus lightweight Dockerized FastAPI backends on free cloud PaaS hosts with `$PORT` dynamic binding.\n- Configure explicit `ALLOWED_ORIGINS` CORS lists (never `*` paired with `allow_credentials=True` or unencrypted public `http` origins).\n- Run a 5-step live smoke test (`/healthz`, `/readyz`, `401`, `422`, `200`) immediately on every release.\n- Write concrete `README.md`s featuring architecture, live demo link, eval table, quickstart, and honest limitations.\n- Maintain a clear `RUNBOOK.md` pairing symptoms with verification checks, rollbacks, and CI golden test updates.',
    },
    {
      type: 'python-lab',
      labId: 'lab-9-4-cors',
      difficulty: 'guided',
      requires: ['cors-security-config'],
      title: 'Lab 8.4A: Safe Production CORS Allowlist Validator',
      prompt:
        'Implement `build_cors_config(raw_origins: str, allow_credentials: bool, is_prod: bool) -> list[str]`: split `raw_origins` on commas, strip whitespace, discard blanks, require non-empty list, and raise `ValueError` if `is_prod` or `allow_credentials` sees `"*"`, or if any origin fails scheme validation (require `https` scheme for all non-local origins; unencrypted `http` is allowed ONLY for `localhost` or `127.0.0.1`). Return cleaned origin list.',
      starterCode: `def build_cors_config(raw_origins: str, allow_credentials: bool, is_prod: bool = True) -> list[str]:
    # Split/strip origins, forbid wildcard '*' in prod/credentials, require https scheme (except localhost/127.0.0.1)
    pass`,
      testCode: `HTTPS_PFX = "https:" + "//"
HTTP_PFX = "http:" + "//"
ok = build_cors_config(f"  {HTTPS_PFX}app.example.com , {HTTP_PFX}localhost:3000 ", True, is_prod=True)
assert ok == [f"{HTTPS_PFX}app.example.com", f"{HTTP_PFX}localhost:3000"]
for bad in ["*", f"{HTTPS_PFX}app.example.com, *", f"{HTTP_PFX}public-site.com", ""]:
    try:
        build_cors_config(bad, True, is_prod=True)
        raise AssertionError(f"Expected ValueError for {bad!r}")
    except ValueError:
        pass
print("PASS: Production CORS validator blocked wildcards and insecure non-local HTTP origins!")`,
      solutionCode: `def build_cors_config(raw_origins: str, allow_credentials: bool, is_prod: bool = True) -> list[str]:
    origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    if not origins:
        raise ValueError("At least one CORS origin is required")
    https_pfx = "https:" + "//"
    http_pfx = "http:" + "//"
    for orig in origins:
        if orig == "*":
            if is_prod or allow_credentials:
                raise ValueError("Wildcard CORS origin '*' is forbidden")
            continue
        is_local = orig.startswith((f"{http_pfx}localhost", f"{http_pfx}127.0.0.1"))
        if orig.startswith(https_pfx):
            continue
        if orig.startswith(http_pfx) and is_local:
            continue
        raise ValueError(f"Unsafe or malformed CORS origin: {orig}")
    return origins`,
      hint: 'Check `"*"` first (`is_prod or allow_credentials` -> `ValueError`), then verify `"https:" + "//"` or local `"http:" + "//localhost"` / `"127.0.0.1"`.',
      hints: [
        'Parse `origins = [o.strip() for o in raw_origins.split(",") if o.strip()]` and raise `ValueError` if empty.',
        'Reject `orig == "*"` when `is_prod or allow_credentials`.',
        'Require `https` scheme for all non-local origins (`http` valid solely for `localhost` / `127.0.0.1`).',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-9-4-smoke',
      difficulty: 'spec',
      requires: ['free-tier-cloud-deployment'],
      title: 'Lab 8.4B: Automated Post-Deploy Live Smoke Verification Suite',
      prompt:
        'Implement `run_smoke_suite(request_fn) -> tuple[bool, list[str]]` that calls a simulated client `request_fn(method, path, headers, json_body) -> tuple[int, dict]` across all 5 mandatory checks: (1) `GET /healthz` -> `200`; (2) `GET /readyz` -> `200` and `body.get("status") == "ready"`; (3) `POST /v1/ask` no auth -> `401`; (4) `POST /v1/ask` with `{"Authorization": "Bearer valid"}` and `{"query": ""}` -> `422`; (5) `POST /v1/ask` with valid auth and `{"query": "hello"}` -> `200` and non-empty `"answer"` in body. Return `(len(errors) == 0, errors)`.',
      starterCode: `def run_smoke_suite(request_fn) -> tuple[bool, list[str]]:
    # Execute all 5 smoke checks against request_fn and collect descriptive failure strings
    pass`,
      testCode: `def healthy_server(method, path, headers, body):
    if method == "GET" and path == "/healthz": return 200, {"status": "alive"}
    if method == "GET" and path == "/readyz": return 200, {"status": "ready"}
    if headers.get("Authorization") != "Bearer valid": return 401, {"error": "unauthorized"}
    if not body or not body.get("query"): return 422, {"error": "validation"}
    return 200, {"answer": "Hi!"}

ok, errs = run_smoke_suite(healthy_server)
assert ok is True and errs == [], f"Healthy server failed smoke test: {errs}"

def broken_auth_server(method, path, headers, body):
    if path == "/healthz": return 200, {"status": "alive"}
    if path == "/readyz": return 200, {"status": "ready"}
    return 200, {"answer": "leaked without auth!"}

ok2, errs2 = run_smoke_suite(broken_auth_server)
assert ok2 is False and len(errs2) >= 2
print("PASS: Post-deploy 5-check smoke suite verified health, readiness, 401 auth, 422 validation, and 200 output!")`,
      solutionCode: `def run_smoke_suite(request_fn) -> tuple[bool, list[str]]:
    errors = []
    c1, _ = request_fn("GET", "/healthz", {}, None)
    if c1 != 200:
        errors.append(f"healthz expected 200, got {c1}")
    c2, b2 = request_fn("GET", "/readyz", {}, None)
    if c2 != 200 or b2.get("status") != "ready":
        errors.append(f"readyz unhealthy: {c2} {b2}")
    c3, _ = request_fn("POST", "/v1/ask", {}, {"query": "hello"})
    if c3 != 401:
        errors.append(f"unauth expected 401, got {c3}")
    c4, _ = request_fn("POST", "/v1/ask", {"Authorization": "Bearer valid"}, {"query": ""})
    if c4 != 422:
        errors.append(f"empty query expected 422, got {c4}")
    c5, b5 = request_fn("POST", "/v1/ask", {"Authorization": "Bearer valid"}, {"query": "hello"})
    if c5 != 200 or not str(b5.get("answer", "")).strip():
        errors.append(f"valid ask failed: {c5} {b5}")
    return len(errors) == 0, errors`,
      hint: 'Verify EVERY one of the 5 HTTP status + body assertions cleanly so broken auth (`200` on missing token) or broken validation fails smoke immediately.',
      hints: [
        'Test `/healthz` (`200`), `/readyz` (`200` + `status == "ready"`), unauth POST (`401`).',
        'Test empty query `{"query": ""}` WITH valid Bearer auth so you test `422` validation rather than hitting `401`.',
        'Verify valid POST returns `200` and non-empty stripped `b5.get("answer")`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-9-4-runbook',
      difficulty: 'debug',
      requires: ['production-readme-craft', 'oncall-incident-runbooks'],
      title: 'Lab 8.4C: Fix Release Readiness Audit (Env Example + README + Runbook)',
      prompt:
        'A broken release-readiness audit only checks whether `README.md` exists—missing undocumented env vars (present in code/config but absent from `.env.example`!), missing `Evaluations` metrics in `README.md`, and missing `Rollback` steps in `RUNBOOK.md`! Fix `audit_release_docs(required_env_vars, env_example_vars, readme_text, runbook_text)` returning `(len(gaps) == 0, gaps)`.',
      starterCode: `def audit_release_docs(required_env_vars: list[str], env_example_vars: list[str], readme_text: str, runbook_text: str) -> tuple[bool, list[str]]:
    # BUG: ignores missing env_example keys, README eval section, and RUNBOOK rollback!
    gaps = []
    if not readme_text.strip():
        gaps.append("empty_readme")
    return len(gaps) == 0, gaps`,
      testCode: `good_readme = "# RAG App\\n## Architecture\\n...\\n## Evaluations\\n94% pass rate\\n## Quickstart\\ndocker compose up"
good_runbook = "# Incident Runbook\\n## Rollback\\ngit revert & redeploy tag"
ok, gaps = audit_release_docs(["API_KEY", "LLM_KEY"], ["API_KEY", "LLM_KEY"], good_readme, good_runbook)
assert ok is True and gaps == []
bad_ok, bad_gaps = audit_release_docs(["API_KEY", "LLM_KEY"], ["API_KEY"], "# App\\nCool AI", "# Notes\\nRestart box")
assert bad_ok is False and len(bad_gaps) >= 3, f"Expected >=3 release gaps (env, evals, rollback), got {bad_gaps}"
print("PASS: Release audit caught undocumented env vars, missing eval table, and missing rollback runbook!")`,
      solutionCode: `def audit_release_docs(required_env_vars: list[str], env_example_vars: list[str], readme_text: str, runbook_text: str) -> tuple[bool, list[str]]:
    gaps = []
    missing_env = set(required_env_vars) - set(env_example_vars)
    if missing_env:
        gaps.append(f"undocumented_env:{','.join(sorted(missing_env))}")
    r_low = readme_text.lower()
    for section in ("architecture", "eval", "quickstart"):
        if section not in r_low:
            gaps.append(f"readme_missing_{section}")
    rb_low = runbook_text.lower()
    if "rollback" not in rb_low:
        gaps.append("runbook_missing_rollback")
    return len(gaps) == 0, gaps`,
      hint: 'Check `set(required_env_vars) - set(env_example_vars)`, check `readme_text.lower()` for `"architecture"`, `"eval"`, `"quickstart"`, and check `runbook_text.lower()` for `"rollback"`.',
      hints: [
        'Use set difference `set(required_env_vars) - set(env_example_vars)` to detect missing `.env.example` keys.',
        'Require `"architecture"`, `"eval"`, and `"quickstart"` keywords in `readme_text.lower()`.',
        'Require `"rollback"` inside `runbook_text.lower()`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q9-4-1',
      type: 'multiple-choice',
      question: 'Why does a FastAPI Docker container hardcoded to `--port 8000` fail health checks on cloud PaaS hosts like Render or Cloud Run?',
      options: [
        'Cloud hosts assign dynamic ports via `$PORT`, so hardcoded `8000` misses health checks',
        'Because Python Uvicorn refuses to bind port `8000` unless `--workers 4` runs simultaneously',
        'Because TLS reverse proxies block every TCP socket below port `9000` on Debian containers',
        'Because Vercel frontend apps can only send fetch requests to HTTPS port `443` directly',
      ],
      correctIndex: 0,
      explanation: 'PaaS schedulers inject `$PORT` (e.g., `10000` or `8080`) into the container; startup commands must bind `--port ${PORT:-8000}`.',
    },
    {
      id: 'q9-4-2',
      type: 'spot-bug',
      question: 'Why does this FastAPI CORS setup break authenticated browser requests AND expose cross-origin risks?',
      code: `app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
)`,
      options: [
        'FastAPI forbids calling `add_middleware` after environment variables finish loading',
        'Browsers forbid wildcard `allow_origins=["*"]` with `allow_credentials=True`',
        'CORS middleware automatically blocks `GET /healthz` probes unless `allow_methods=["GET"]` is omitted',
        'Setting `allow_credentials=True` converts all Bearer headers into lowercase query parameters',
      ],
      correctIndex: 1,
      explanation: 'Per the Fetch/CORS specification, `allow_credentials=True` requires explicit exact origin strings (never `"*"`).',
    },
    {
      id: 'q9-4-3',
      type: 'multiple-choice',
      question: 'Why do free-tier `512 MB` backend containers frequently crash with Exit Code `137` (OOM Kill) when importing local `torch` + large sentence-transformer models?',
      options: [
        'Because free-tier Docker engines cap `uvicorn` process counts strictly at one Python file',
        'Because Python `512 MB` containers allocate 400 MB automatically to `git` object packs',
        'Local model weights + PyTorch runtime exceed 512 MB; use hosted embeddings or lightweight ONNX',
        'Because Pydantic schemas require at least `2 GB` swap memory when validating JSON bodies',
      ],
      correctIndex: 2,
      explanation: 'PyTorch + transformer weights exceed 512 MB RAM instantly; on free-tier hosts, keep containers thin via hosted embedding APIs or tiny ONNX/sparse indexes.',
    },
    {
      id: 'q9-4-4',
      type: 'multiple-choice',
      question: 'Which item adds the MOST hiring-manager credibility to an AI portfolio `README.md`?',
      options: [
        'Five paragraphs repeating generic buzzwords about autonomous artificial intelligence disruption',
        'Hiding `.env.example` completely so reviewers write custom variable names from guesswork',
        'Listing forty unrelated libraries inside `requirements.txt` without a local quickstart',
        'Live demo URL, architecture flow, measured eval metrics table, 3-step quickstart, and honest limitations',
      ],
      correctIndex: 3,
      explanation: 'Concrete eval numbers, architecture clarity, working quickstarts, live links, and candid tradeoffs prove real engineering maturity.',
    },
    {
      id: 'q9-4-5',
      type: 'predict-output',
      question: 'During a post-deploy smoke test, `POST /v1/ask` WITHOUT an `Authorization` header returns `200 OK` with a real answer. What just happened?',
      options: [
        'The `/healthz` probe successfully warmed the container’s cold-start cache automatically',
        'Authentication middleware was accidentally bypassed or disabled; halt release and roll back!',
        'CORS preflight headers converted the unauthenticated POST request into a safe read-only GET',
        'The sliding-window rate limiter promoted the anonymous caller to trusted enterprise status',
      ],
      correctIndex: 1,
      explanation: 'An unauthenticated request must ALWAYS return `401 Unauthorized`—returning `200` signals a broken auth dependency that must halt rollout immediately.',
    },
    {
      id: 'q9-4-6',
      type: 'multi-select',
      question: 'Which two elements belong in every actionable on-call `RUNBOOK.md` entry?',
      options: [
        'Exact verification step (`which log metric or /readyz probe confirms the incident`)',
        'Exact immediate mitigation/rollback action plus postmortem golden-CI regression promotion',
        'Instructions telling engineers to disable logging and reboot production databases blindly',
        'Plaintext copies of production root database passwords for fast manual emergency logins',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Actionable runbooks map concrete symptoms -> verification telemetry -> safe rollback/mitigation -> post-incident golden CI regression updates.',
    },
    {
      id: 'q9-4-7',
      type: 'numeric',
      question: 'A smoke suite validates 5 endpoints: `/healthz (200)`, `/readyz (200)`, unauth `/v1/ask (401)`, invalid `/v1/ask (422)`, and valid `/v1/ask (200)`. If `/readyz` fails (`503`) and unauth passes (`401`) while all others pass, how many smoke checks passed?',
      options: [],
      correctIndex: 0,
      correctNumber: 4,
      tolerance: 0,
      unit: 'checks',
      explanation: '4 of 5 checks passed (`/readyz` failed, blocking release promotion).',
    },
    {
      id: 'q9-4-8',
      type: 'multiple-choice',
      question: 'Why must `.env.example` stay strictly synchronized with every required environment variable read in `config.py`?',
      options: [
        'So CI, teammates, and reviewers immediately see every required key name without exposing secret values',
        'Because Docker automatically copies `.env.example` verbatim as live production credentials on boot',
        'Because GitHub rejects pull requests containing Python `os.environ` calls unless `.env.example` sits at root',
        'Because FastAPI merges `.env.example` placeholder strings directly into live JWT signing keys',
      ],
      correctIndex: 0,
      explanation: '`.env.example` documents exact variable names (`API_KEY=`, `OPENAI_API_KEY=`) cleanly with empty placeholders so setup succeeds without secret leaks.',
    },
    {
      id: 'q9-4-9',
      type: 'ordering',
      question: 'Order the end-to-end zero-dollar deployment flow for a full-stack AI app:',
      items: [
        'Build and test container locally via `docker compose up` honoring dynamic `$PORT`',
        'Configure secret env vars and explicit `ALLOWED_ORIGINS` in Vercel & backend cloud host dashboards',
        'Deploy backend FastAPI container and confirm `/healthz` + `/readyz` probes turn green',
        'Deploy Next.js frontend on Vercel pointing `NEXT_PUBLIC_API_URL` to backend HTTPS URL',
        'Execute automated 5-point live smoke test (`401`, `422`, `200`) and link live URL in `README.md`',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Test local Docker `$PORT` -> configure host secrets/CORS -> deploy backend & verify probes -> deploy frontend -> run live smoke test & publish README.',
    },
  ],
};
