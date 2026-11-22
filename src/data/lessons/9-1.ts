import type { Lesson } from '@/types/course';

export const lesson9_1: Lesson = {
  id: '9-1',
  moduleId: 'mod-9',
  number: '8.1',
  title: 'FastAPI Services, Request Validation, Auth Basics & Environment Config',
  subtitle: 'Turn standalone Python notebooks into typed FastAPI endpoints with Pydantic v2 schema validation, constant-time API authentication, 12-factor secrets config, and health probes.',
  durationMinutes: 85,
  track: 'ai-eng',
  prerequisites: ['1.3', '7.4'],
  requires: ['python-http-rest', 'python-dataclasses', 'python-exceptions'],
  teaches: [
    'fastapi-endpoints',
    'pydantic-validation',
    'api-auth-rate-limiting',
    'env-config-12factor',
  ],
  objectives: [
    'Design typed FastAPI `POST` and `GET` endpoints separating `/healthz` liveness from `/readyz` dependency readiness probes.',
    'Enforce strict Pydantic v2 request bounds (`min_length`, `max_length`, temperature `[0, 2]`, role allowlists) returning clean HTTP `422` errors.',
    'Implement constant-time Bearer token / API-key verification (`hmac.compare_digest`) alongside per-tenant sliding-window rate limiting (`HTTP 429`).',
    'Manage secrets and runtime configuration strictly through `12-factor` environment variables (`pydantic-settings`) without leaking keys in Git or tracebacks.',
  ],
  checkWithoutNotes: [
    'What HTTP status code does FastAPI emit automatically when an incoming JSON payload violates a Pydantic field bound, and why should client errors (`4xx`) stay distinct from server errors (`5xx`)?',
    'Explain why checking API keys with naive Python `incoming_key == expected_key` leaks secret bytes statistically while `hmac.compare_digest` stays constant-time.',
    'Distinguish `/healthz` (process alive) from `/readyz` (vector DB + LLM config initialized) inside Kubernetes or cloud container orchestrators.',
    'Why must environment settings crash loudly at server startup if `OPENAI_API_KEY` or `API_AUTH_SECRET` is missing rather than falling back to `"dev-secret"`?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Notebooks Don’t Ship Products—APIs Do',
      paragraphs: [
        'A RAG pipeline or classifier sitting inside a Jupyter notebook helps nobody until a web app, mobile client, Slack bot, or internal dashboard can call it reliably over HTTP. In modern Python AI teams, **FastAPI** is the standard web framework for wrapping ML models, embedding pipelines, and LLM orchestrators into typed, self-documenting microservices.',
        'Shipping a production AI endpoint demands far more than slapping `@app.post("/ask")` onto a function. Real internet traffic sends malformed JSON, fifty-megabyte prompt bombs meant to exhaust memory, invalid temperature strings, unauthenticated scraper bots, expired authorization headers, and sudden burst spikes from downstream webhook retries. A clean API boundary validates every input byte BEFORE calling expensive models, rejects unauthenticated callers in constant time, isolates per-tenant rate limits, loads credentials exclusively from environment config, and exposes distinct health versus readiness probes so cloud orchestrators never route live users onto half-booted containers.',
        'When hiring managers review junior AI engineer take-home projects, the separation between hobby code and production code appears in the very first route file. Hobby apps read `os.getenv("OPENAI_API_KEY", "")` quietly at module import, return raw Python stack traces inside HTTP `200` dictionaries, omit timeouts on outbound requests, and trust arbitrary client-sent JSON fields. Production services enforce strict boundary contracts from the moment TCP bytes hit the socket.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: TypeScript API Gateway & Bouncer at the Door',
      frontendConcept: 'A Zod-validated TypeScript Next.js Route Handler checking request headers, rate limits, and JSON schemas before touching the database',
      aiConcept: 'FastAPI + Pydantic v2 + `Depends()` Auth Middleware + 12-Factor Env Config',
      explanation:
        'If you have written Zod schemas in TypeScript, **Pydantic v2** is Python’s exact counterpart: declare field types, numeric ranges (`ge=0.0, le=2.0`), and string caps once in a `BaseModel`, and FastAPI automatically validates incoming payloads, emits OpenAPI documentation, and returns structured `422 Unprocessable Entity` JSON on invalid requests before your expensive AI logic runs a single line.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Strict Pydantic Request Schemas & Non-Blocking FastAPI Routes',
      paragraphs: [
        'Notice a critical FastAPI concurrency subtlety that catches Python beginners off guard: declaring `async def chat(...)` and calling a **blocking synchronous** SDK inside it (like `requests.post(...)` or heavy CPU tokenization) freezes the entire asyncio event loop for every other connected user! While one request blocks waiting two seconds on an upstream socket, health checks stall, queued clients time out, and Kubernetes marks the worker dead. Use `async def` ONLY when awaiting truly async clients (`httpx.AsyncClient`, `AsyncOpenAI`); declare plain synchronous `def` when calling blocking libraries so FastAPI automatically dispatches execution onto its bounded worker threadpool.',
        'Look closely at strict boundary validation too. Without explicit bounds (`min_length=1`, `max_length=4000`, `le=5` for `top_k`), a malicious or buggy frontend retry sending a 500,000-character string triggers slow regex preprocessing or giant embedding bills before failing downstream. Wrap every route payload in an immutable schema enforcing tight field domains, stripping unexpected extra keys (`ConfigDict(extra="forbid")`), normalizing whitespace cleanly with field validators, and returning deterministic structured response envelopes carrying a unique `request_id` rather than raw Python stack traces.',
        'Trace the execution flow when a client sends `{"query": "", "temperature": 9.5, "debug": true}` to `/v1/ask`. FastAPI injects `require_bearer_auth` first; if the token is wrong, the route rejects immediately with `401` before parsing heavy bodies or touching rate-limit counters. Once authenticated, Pydantic checks `query` (`min_length=1` fails), `temperature` (`le=1.5` fails), and `debug` (`extra="forbid"` rejects unknown keys), returning a single machine-readable `422` validation report detailing every broken field.',
      ],
    },
    {
      type: 'code',
      title: 'Production Pattern: Typed FastAPI Endpoint with Auth, Validation & Health Probes',
      language: 'python',
      code: `import hmac
import os
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI(title="AI Support Gateway", version="1.0.0")
EXPECTED_KEY = os.environ["SERVICE_API_KEY"]  # Fail fast on boot if unset!

class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=1, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)
    temperature: float = Field(default=0.1, ge=0.0, le=1.5)

def require_bearer_auth(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    if not hmac.compare_digest(token.encode(), EXPECTED_KEY.encode()):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return "authenticated"

@app.get("/healthz")
def liveness():
    return {"status": "alive"}

@app.get("/readyz")
def readiness():
    # Verify vector index & model client ready before taking traffic
    return {"status": "ready"}

@app.post("/v1/ask", dependencies=[Depends(require_bearer_auth)])
async def ask(req: ChatRequest):
    return {"answer": f"Processed {len(req.query)} chars at T={req.temperature}"}`,
      caption: 'Keep auth dependencies reusable with `Depends()`, fail fast on missing secrets at startup, and lock down extra fields via `extra="forbid"`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Constant-Time Auth, JWT/Session Hygiene & Rate Limiting',
      paragraphs: [
        'Two authentication bugs appear constantly in junior APIs. First, comparing secrets with Python `==` exits on the very first mismatched character—taking slightly longer when the initial bytes match, creating a statistical timing side-channel leak. Always wrap key comparisons in `hmac.compare_digest(a.encode("utf-8"), b.encode("utf-8"))` when verifying API keys, internal service secrets, or incoming Slack/GitHub webhook HMAC signatures.',
        'Second, leaving an AI endpoint open without **per-tenant rate limiting** lets one buggy client loop drain your monthly token balance in twenty minutes. A simple **sliding-window counter** (stored in Redis sorted sets in distributed clusters, or a `deque` of monotonic timestamps per `tenant_id` in single instances) trims expired timestamps outside `[now - window_sec, now]`: if the active count reaches `limit`, reject immediately with `HTTP 429 Too Many Requests` and set a clear `Retry-After` header so well-behaved clients wait before retrying.',
        'When handling end-user logins rather than machine-to-machine API keys, verify signed `JWT` tokens using short expirations (`15–60 min`), enforce an explicit signature algorithm allowlist (`algorithms=["HS256"]` or `["RS256"]`, rejecting `"none"`), check `exp` and `aud` claims cleanly, and extract `tenant_id` strictly from the verified token claims—never trusting a client-supplied `"tenant_id"` body parameter blindly!',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: 12-Factor Environment Config & Safe Error Envelopes',
      paragraphs: [
        'Hardcoding fallback secrets like `API_KEY = os.getenv("API_KEY", "dev-secret-123")` is a ticking security bomb: if a staging deploy accidentally omits the environment variable, your server silently accepts `"dev-secret-123"` on the public internet! Require non-empty production secrets explicitly at startup (`pydantic-settings` `BaseSettings` throws clear validation errors before port binding if required keys are empty or malformed), and verify minimum lengths on cryptographic keys during boot.',
        'Separating liveness (`/healthz`) from readiness (`/readyz`) works hand in hand with environment startup validation. `/healthz` proves solely that the Python HTTP server process has not deadlocked; `/readyz` pings Postgres/`pgvector`, checks Redis connectivity, and confirms model credentials loaded properly, returning `HTTP 503` during cold index loads or dependency blips so load balancers pause traffic without killing healthy booting containers prematurely.',
        'Equally important is **safe error handling**. Never return raw `str(exc)` from uncaught exceptions straight into HTTP `500` JSON bodies—Python tracebacks frequently leak database hostnames, SQL query strings, file paths, or upstream authorization headers. Log full structured exception context internally keyed by a random `request_id`, and return a clean safe message to the caller (`{"error": "internal_error", "request_id": "req_8f21a"}`) so operators trace failures effortlessly without exposing internals.',
      ],
    },
    {
      type: 'table',
      title: 'Essential HTTP Status Codes for AI Microservices',
      headers: ['Code', 'Meaning', 'When Your AI Endpoint Emits It'],
      rows: [
        ['`200 OK`', 'Success', 'Valid structured prediction, retrieval, or chat completion returned'],
        ['`401` / `403`', 'Auth / Permission failure', 'Missing/invalid Bearer token (`401`) or valid user querying forbidden tenant (`403`)'],
        ['`422`', 'Schema Validation error', 'Pydantic rejected empty prompt, `top_k = 500`, or unknown extra field'],
        ['`429`', 'Rate / Quota limit exceeded', 'Tenant hit per-minute request cap or daily token spend ceiling (include `Retry-After`)'],
        ['`503` / `504`', 'Upstream unavailable / Timeout', 'Vector DB down or upstream LLM API timed out cleanly inside circuit breaker'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common FastAPI & Config Mistakes & How to Debug Them',
      paragraphs: [
        '1) Blocking an `async def` FastAPI route with synchronous `requests.get()`, `time.sleep()`, or heavy CPU embedding inference: the entire server hangs single-threaded for all concurrent requests! Either `await httpx.AsyncClient` inside `async def` or switch the route signature to synchronous `def` so AnyIO runs it cleanly in a worker thread.',
        '2) Trusting client-supplied `tenant_id` JSON fields instead of reading `tenant_id` from verified authentication credentials: an attacker modifies `"tenant_id": "acme"` in curl and searches another company’s documents unless identity comes strictly from the verified Bearer token or signed session.',
        '3) Checking only `GET /healthz -> 200` for readiness while loading a 2 GB embedding model lazily in the background: Kubernetes starts sending traffic immediately before embeddings finish loading, causing 500 errors for the first 30 seconds! Point readiness probes to `/readyz`, which returns `503` until models and DB pools initialize.',
        '4) Committing `.env` files to Git or logging `dict(os.environ)` on boot: add `.env*` (keeping only `.env.example` with empty placeholder keys) to `.gitignore`, and redact keys (`mask_secret`) in startup logs.',
        '5) Using naive `if token == SECRET:` string comparison on Bearer tokens and HMAC webhook headers: switch to `hmac.compare_digest()` everywhere secrets are checked.',
        '6) Returning raw `traceback.format_exc()` in HTTP `500` responses during production deploys: configure a global FastAPI exception handler logging full tracebacks server-side while returning only a sanitized `request_id` externally.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 8.1 Recap: Production AI Service Foundations',
      body: '- Validate every input strictly with Pydantic (`min_length`, `max_length`, numeric bounds, `extra="forbid"`) before invoking models.\n- Keep blocking calls out of `async def` routes (use `await` async I/O or sync `def` worker threads).\n- Verify API keys/tokens with constant-time `hmac.compare_digest` and extract `tenant_id` solely from verified auth.\n- Enforce per-tenant sliding-window rate limits (`429` + `Retry-After`) and crash fast if required secrets are missing.\n- Separate `/healthz` liveness from `/readyz` dependency checks and keep raw tracebacks out of `500` responses.',
    },
    {
      type: 'python-lab',
      labId: 'lab-9-1-pydantic',
      difficulty: 'guided',
      requires: ['python-dataclasses', 'python-exceptions'],
      title: 'Lab 8.1A: Strict Request Payload Validator (`HTTP 422` Guard)',
      prompt:
        'Implement `validate_chat_payload(payload: dict)` enforcing FastAPI/Pydantic-style schema contracts without external imports: allow ONLY keys `{"query", "top_k", "temperature"}` (defaulting `top_k=5`, `temperature=0.1` if omitted); require `query` to be a non-empty stripped `str` of length `1..2000`; require `top_k` `int` (not `bool`!) in `[1, 20]`; require `temperature` `int|float` (not `bool`!) in `[0.0, 1.5]`. Raise `ValueError` on any violation, or return the normalized dict.',
      starterCode: `def validate_chat_payload(payload: dict) -> dict:
    allowed = {"query", "top_k", "temperature"}
    # 1. Reject unknown keys
    # 2. Validate query (str, stripped len 1..2000)
    # 3. Validate top_k (int, not bool, 1..20) and temperature (int/float, not bool, 0.0..1.5)
    pass`,
      testCode: `ok = validate_chat_payload({"query": "  Reset MFA?  "})
assert ok == {"query": "Reset MFA?", "top_k": 5, "temperature": 0.1}
for bad in [
    {"query": "hi", "extra": 1},
    {"query": "   "},
    {"query": "x" * 2001},
    {"query": "ok", "top_k": True},
    {"query": "ok", "top_k": 50},
    {"query": "ok", "temperature": 2.5},
]:
    try:
        validate_chat_payload(bad)
        raise AssertionError(f"Expected ValueError for {bad}")
    except ValueError:
        pass
print("PASS: Strict payload schema validation blocked every malformed edge input!")`,
      solutionCode: `def validate_chat_payload(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("Payload must be a dict")
    allowed = {"query", "top_k", "temperature"}
    extra = set(payload.keys()) - allowed
    if extra:
        raise ValueError(f"Unexpected fields: {sorted(extra)}")
    q = payload.get("query")
    if not isinstance(q, str) or not (1 <= len(q.strip()) <= 2000):
        raise ValueError("query must be a non-empty string up to 2000 chars")
    top_k = payload.get("top_k", 5)
    if isinstance(top_k, bool) or not isinstance(top_k, int) or not (1 <= top_k <= 20):
        raise ValueError("top_k must be integer in [1, 20]")
    temp = payload.get("temperature", 0.1)
    if isinstance(temp, bool) or not isinstance(temp, (int, float)) or not (0.0 <= float(temp) <= 1.5):
        raise ValueError("temperature must be float in [0.0, 1.5]")
    return {"query": q.strip(), "top_k": top_k, "temperature": float(temp)}`,
      hint: 'In Python, `isinstance(True, int)` is `True`! Explicitly reject `isinstance(val, bool)` when validating `top_k` and `temperature`.',
      hints: [
        'Check `set(payload.keys()) - allowed` to mimic Pydantic `ConfigDict(extra="forbid")`.',
        'Remember `isinstance(True, int)` evaluates to `True`, so check `not isinstance(top_k, bool)` explicitly.',
        'Strip `query` and verify `1 <= len(q.strip()) <= 2000`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-9-1-auth',
      difficulty: 'spec',
      requires: ['python-http-rest'],
      title: 'Lab 8.1B: Constant-Time Bearer Auth & Sliding-Window Rate Limiter',
      prompt:
        'Implement `authorize_and_check_rate(auth_header: str, key_to_tenant: dict[str, str], history: dict[str, list[float]], now: float, limit: int = 3, window_sec: float = 60.0) -> tuple[int, str]`: verify `"Bearer <token>"` against `key_to_tenant` using `hmac.compare_digest` (`401` if invalid), prune timestamps `< now - window_sec` for that tenant, emit `(429, tenant)` if active timestamps `>= limit`, else append `now` and return `(200, tenant)`.',
      starterCode: `import hmac

def authorize_and_check_rate(
    auth_header: str,
    key_to_tenant: dict[str, str],
    history: dict[str, list[float]],
    now: float,
    limit: int = 3,
    window_sec: float = 60.0,
) -> tuple[int, str]:
    # 1. Verify Bearer header & constant-time key lookup -> (401, "unauthorized")
    # 2. Prune tenant timestamps older than (now - window_sec)
    # 3. If count >= limit -> (429, tenant), else append now and return (200, tenant)
    pass`,
      testCode: `keys = {"sec_acme_1": "acme", "sec_beta_2": "beta"}
hist = {}
assert authorize_and_check_rate("Basic abc", keys, hist, 10.0)[0] == 401
assert authorize_and_check_rate("Bearer wrong", keys, hist, 10.0)[0] == 401
assert authorize_and_check_rate("Bearer sec_acme_1", keys, hist, 10.0, limit=2) == (200, "acme")
assert authorize_and_check_rate("Bearer sec_acme_1", keys, hist, 20.0, limit=2) == (200, "acme")
assert authorize_and_check_rate("Bearer sec_acme_1", keys, hist, 30.0, limit=2) == (429, "acme")
# Separate tenant unaffected, and after window expires acme succeeds again!
assert authorize_and_check_rate("Bearer sec_beta_2", keys, hist, 30.0, limit=2) == (200, "beta")
assert authorize_and_check_rate("Bearer sec_acme_1", keys, hist, 85.0, limit=2) == (200, "acme")
print("PASS: Constant-time Bearer auth + sliding-window per-tenant rate limiter verified!")`,
      solutionCode: `import hmac

def authorize_and_check_rate(
    auth_header: str,
    key_to_tenant: dict[str, str],
    history: dict[str, list[float]],
    now: float,
    limit: int = 3,
    window_sec: float = 60.0,
) -> tuple[int, str]:
    if not isinstance(auth_header, str) or not auth_header.startswith("Bearer "):
        return 401, "unauthorized"
    token = auth_header.removeprefix("Bearer ").strip()
    matched_tenant = None
    for secret_key, tenant in key_to_tenant.items():
        if hmac.compare_digest(token.encode("utf-8"), secret_key.encode("utf-8")):
            matched_tenant = tenant
    if matched_tenant is None:
        return 401, "unauthorized"
    cutoff = now - window_sec
    recent = [ts for ts in history.get(matched_tenant, []) if ts >= cutoff]
    if len(recent) >= limit:
        history[matched_tenant] = recent
        return 429, matched_tenant
    recent.append(now)
    history[matched_tenant] = recent
    return 200, matched_tenant`,
      hint: 'Iterate across all `key_to_tenant` entries with `hmac.compare_digest` (avoiding short-circuit early dictionary indexing), then filter timestamps `>= now - window_sec`.',
      hints: [
        'Check `auth_header.startswith("Bearer ")` and extract `token = auth_header.removeprefix("Bearer ").strip()`.',
        'Scan `key_to_tenant` using `hmac.compare_digest` so comparison stays constant-time.',
        'Prune expired entries `ts >= now - window_sec`; if `len(recent) >= limit` emit `(429, tenant)`, else append `now` and return `(200, tenant)`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-9-1-config',
      difficulty: 'debug',
      requires: ['env-config-12factor'],
      title: 'Lab 8.1C: Fix Weak Fallback Secrets & Readiness Probe Leak',
      prompt:
        'A buggy startup config helper silently falls back to `"dev-secret"` when `API_KEY` is missing AND exposes raw `API_KEY` values inside its `/readyz` response! Fix `load_and_probe(env: dict, db_ok: bool)` so: (1) missing/whitespace `API_KEY` or `LLM_KEY` raises `RuntimeError("Missing required secret")`; (2) `readiness` returns `(503, {"status": "not_ready"})` when `not db_ok`, else `(200, {"status": "ready", "key_configured": True})` with ZERO secret characters returned.',
      starterCode: `def load_and_probe(env: dict, db_ok: bool) -> tuple[int, dict]:
    # BUG 1: silently defaults to weak hardcoded secret!
    api_key = env.get("API_KEY", "dev-secret")
    # BUG 2: echoes secret and always returns 200 even if DB is down!
    return 200, {"status": "ready", "api_key": api_key}`,
      testCode: `for bad_env in [{}, {"API_KEY": "abc", "LLM_KEY": "   "}, {"API_KEY": "", "LLM_KEY": "xyz"}]:
    try:
        load_and_probe(bad_env, True)
        raise AssertionError("Must fail fast on missing/blank secrets!")
    except RuntimeError:
        pass
code_down, body_down = load_and_probe({"API_KEY": "sk_live_999", "LLM_KEY": "llm_123"}, False)
assert code_down == 503 and body_down == {"status": "not_ready"}
code_up, body_up = load_and_probe({"API_KEY": "sk_live_999", "LLM_KEY": "llm_123"}, True)
assert code_up == 200 and body_up == {"status": "ready", "key_configured": True}
assert "sk_live" not in str(body_up)
print("PASS: Fail-fast secret check and safe readiness probe fixed!")`,
      solutionCode: `def load_and_probe(env: dict, db_ok: bool) -> tuple[int, dict]:
    api_key = str(env.get("API_KEY", "")).strip()
    llm_key = str(env.get("LLM_KEY", "")).strip()
    if not api_key or not llm_key:
        raise RuntimeError("Missing required secret")
    if not db_ok:
        return 503, {"status": "not_ready"}
    return 200, {"status": "ready", "key_configured": True}`,
      hint: 'Strip both `API_KEY` and `LLM_KEY`, raise `RuntimeError` if either is empty, return `(503, {"status": "not_ready"})` when `not db_ok`, and never place secret strings into response dicts.',
      hints: [
        'Validate `bool(env.get("API_KEY", "").strip())` and `bool(env.get("LLM_KEY", "").strip())`.',
        'Return `503` whenever `not db_ok` so load balancers hold traffic until dependencies come online.',
        'Include only boolean status metadata (`"key_configured": True`), zero key substrings.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q9-1-1',
      type: 'multiple-choice',
      question: 'Why does FastAPI freeze concurrent user requests if you put synchronous `requests.post(...)` inside an `async def` route?',
      options: [
        'Blocking I/O inside `async def` stalls the single asyncio event loop for all requests',
        'Because FastAPI automatically drops HTTP keep-alive sockets whenever `requests` runs on Python 3.12',
        'Because Pydantic v2 disables schema caching across parallel requests when `async def` is declared',
        'Because synchronous HTTP clients execute inside GPU CUDA streams rather than host CPU threads',
      ],
      correctIndex: 0,
      explanation: 'FastAPI runs `async def` handlers directly on the single event loop thread; use `await httpx.AsyncClient` inside `async def`, or declare regular `def` so FastAPI uses its threadpool.',
    },
    {
      id: 'q9-1-2',
      type: 'multiple-choice',
      question: 'Which HTTP status code should FastAPI return when a caller violates a Pydantic schema rule (e.g., `temperature = 9.0` or missing `query`)?',
      options: [
        '`200 OK` wrapping an internal warning message inside the normal prediction JSON payload',
        '`422 Unprocessable Entity` detailing exact invalid fields before running inference',
        '`500 Internal Server Error` exposing the full Python validation stack trace to the browser',
        '`302 Found` redirecting the invalid API POST request back to the `/healthz` liveness endpoint',
      ],
      correctIndex: 1,
      explanation: 'Pydantic validation failures map cleanly to HTTP `422`, flagging client schema mistakes cheaply before models execute.',
    },
    {
      id: 'q9-1-3',
      type: 'spot-bug',
      question: 'Why is this FastAPI multi-tenant RAG route critically insecure even though Bearer authentication runs first?',
      code: `@app.post("/v1/search", dependencies=[Depends(require_auth)])
def search(req: SearchReq):  # SearchReq contains user-supplied req.tenant_id
    return rag.query(req.query, tenant_id=req.tenant_id)`,
      options: [
        'Using synchronous `def` instead of `async def` prevents `Depends(require_auth)` from checking headers',
        'Trusting user-supplied `req.tenant_id` lets any authenticated caller query other tenants’ data',
        'Calling `rag.query` without `temperature=0.0` causes vector stores to leak raw API secrets',
        'Pydantic rejects underscore characters inside `req.tenant_id` unless aliased manually',
      ],
      correctIndex: 1,
      explanation: 'Authentication verifies who the caller is, NOT which tenant they typed in JSON! Extract `tenant_id` strictly from verified token/session claims inside `Depends()`.',
    },
    {
      id: 'q9-1-4',
      type: 'multiple-choice',
      question: 'Why should API keys and HMAC webhook signatures always be verified with `hmac.compare_digest(a, b)` rather than `a == b`?',
      options: [
        'Because Python `==` refuses to compare strings longer than 32 UTF-8 characters inside FastAPI headers',
        'Because `hmac.compare_digest` automatically hashes plaintext passwords into salted bcrypt digests',
        'Because `a == b` short-circuits on the first mismatch, creating timing side channels',
        'Because `==` converts uppercase and lowercase Base64 tokens identically before checking equality',
      ],
      correctIndex: 2,
      explanation: 'Naive string equality returns faster on earlier byte mismatches; `hmac.compare_digest` takes constant time across full secret length.',
    },
    {
      id: 'q9-1-5',
      type: 'predict-output',
      question: 'A container boots a 2 GB embedding model during startup. `/healthz` returns `200`, while `/readyz` returns `503` until loading finishes. What does Kubernetes do?',
      options: [
        'Kills and restarts the container immediately because `/readyz` returned `503` during model loading',
        'Sends live customer `/v1/ask` traffic immediately onto the loading container anyway',
        'Keeps the container alive and withholds live user traffic until `/readyz` turns `200`',
        'Caches the `503` readiness status permanently in DNS for the next 24 hours',
      ],
      correctIndex: 2,
      explanation: 'Liveness (`/healthz`) detects dead processes needing restart; Readiness (`/readyz`) gates load-balancer traffic cleanly until heavy dependencies load.',
    },
    {
      id: 'q9-1-6',
      type: 'multi-select',
      question: 'Which two practices prevent secret leaks in Python AI services?',
      options: [
        'Failing loudly at startup when required env vars (`OPENAI_API_KEY`, `API_SECRET`) are missing instead of falling back to `"dev-secret"`',
        'Adding `.env*` to `.gitignore` and returning sanitized `request_id` error envelopes instead of raw `traceback.format_exc()` on `500`s',
        'Echoing `dict(os.environ)` onto `/readyz` JSON responses so DevOps dashboards confirm loaded keys quickly',
        'Hardcoding temporary fallback API keys inside `settings.py` behind a `DEBUG` boolean flag',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Never ship fallback secrets, commit `.env`, or leak env/tracebacks in HTTP responses.',
    },
    {
      id: 'q9-1-7',
      type: 'numeric',
      question: 'A sliding-window rate limiter caps tenants at `5` requests per `60` seconds. A tenant sends requests at timestamps `[10, 20, 30, 40, 50]`. At timestamp `now = 65` (cutoff `65 - 60 = 5`), how many recent requests remain inside the window?',
      options: [],
      correctIndex: 0,
      correctNumber: 5,
      tolerance: 0,
      unit: 'requests',
      explanation: 'All five timestamps (`10, 20, 30, 40, 50`) are `>= 5`, so at `now = 65` the tenant still sits at `5/5` and receives `429` until `t > 70`!',
    },
    {
      id: 'q9-1-8',
      type: 'multiple-choice',
      question: 'What does `model_config = ConfigDict(extra="forbid")` accomplish on a Pydantic v2 request schema?',
      options: [
        'It strips leading and trailing spaces from every string field automatically before parsing',
        'It caches identical incoming request JSON dictionaries inside Redis for 15 minutes',
        'It encrypts sensitive PII properties using AES-256 before FastAPI passes them to route handlers',
        'It rejects unexpected extra JSON keys (`422`) instead of ignoring typos silently',
      ],
      correctIndex: 3,
      explanation: '`extra="forbid"` catches typos (`"temprature": 0.0`) or smuggling attempts immediately instead of silently falling back to defaults.',
    },
    {
      id: 'q9-1-9',
      type: 'ordering',
      question: 'Order the request lifecycle inside a clean production FastAPI AI endpoint:',
      items: [
        'Authenticate caller via `hmac.compare_digest` / verified JWT and derive `tenant_id`',
        'Check per-tenant sliding-window rate limit and budget (`429` if exceeded)',
        'Validate JSON body types, bounds, and extra fields via Pydantic (`422` if invalid)',
        'Execute async or thread-pooled retrieval + LLM inference with timeouts',
        'Log structured latency/tokens internally and return clean schema response (`200`)',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Auth -> Rate limit -> Schema validation -> Bounded inference -> Structured telemetry & response.',
    },
  ],
};
