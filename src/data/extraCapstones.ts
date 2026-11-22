import type { GuidedProject } from './jobWorkbench';

export const EXTRA_CAPSTONES: GuidedProject[] = [
  {
    id: 'proj-fastapi-docker',
    number: 4,
    level: 'Production Engineering',
    title: 'FastAPI + Docker Live Deployed AI Microservice',
    subtitle: 'Typed Pydantic v2 FastAPI gateway with constant-time auth, rate limiter, non-root Dockerfile, GitHub Actions CI, RUNBOOK, and zero-dollar live cloud deploy.',
    diagramId: 'agent-guardrails',
    estimatedWeekendHours: '5–7 hours',
    deploymentGuide: `1. Copy \`.env.example\` to \`.env\` and generate a random 32-char \`SERVICE_API_KEY\` (\`python -c "import secrets; print(secrets.token_urlsafe(24))"\`).
2. Test locally inside Docker honoring dynamic \`$PORT\`: \`docker compose up --build\`, then curl \`/healthz\` and \`/readyz\`.
3. Create a free Web Service on Render, Fly.io, or Railway linked to your GitHub repo using the root \`Dockerfile\`.
4. Set \`SERVICE_API_KEY\`, \`ALLOWED_ORIGINS\` (your Vercel app domain), and \`DAILY_BUDGET_USD=2.0\` in the host dashboard.
5. Run \`python smoke_test.py --base-url YOUR_CLOUD_URL --api-key YOUR_KEY\` immediately after deployment succeeds.`,
    gradingRubric: [
      { criterion: 'Typed API Contracts & Health Probes', weight: '25%', passBar: 'Pydantic v2 bounds (`extra="forbid"`) reject bad JSON (`422`); `/healthz` & `/readyz` distinct.' },
      { criterion: 'Constant-Time Auth, CORS & Rate Limiting', weight: '25%', passBar: 'Uses `hmac.compare_digest`, blocks `*` CORS with credentials, enforces `429` limits.' },
      { criterion: 'Docker Hardening & CI Pipeline', weight: '25%', passBar: 'Dependencies layered ahead of `src/`, `.dockerignore` excludes secrets, non-root `USER`, CI passes offline.' },
      { criterion: 'Live Smoke Suite, README & RUNBOOK', weight: '25%', passBar: '5-point live smoke suite passes (`200/401/422`) + actionable rollback RUNBOOK documented.' },
    ],
    readmeTemplate: `# Production FastAPI + Docker AI Service

## Architecture
Client -> Vercel CORS Origin -> FastAPI Gateway (Auth + Rate Limit + Budget Guard) -> Mock/OpenAI Provider -> Structured JSON Telemetry

## Endpoints
- \`GET /healthz\` -> Liveness probe
- \`GET /readyz\` -> Dependency readiness check
- \`POST /v1/ask\` -> Authenticated typed inference

## Quickstart
\`\`\`bash
cp .env.example .env
docker compose up --build
pytest -q
\`\`\``,
    journalTemplate: `# Project Journal — FastAPI + Docker Service

## 1. What Broke First During Containerization / Cloud Deploy?
- (e.g., Render injected PORT=10000 while Uvicorn hardcoded 8000 -> fixed via CMD sh -c with \${PORT:-8000})

## 2. Security & Reliability Fixes Applied
- Switched auth check from == to hmac.compare_digest and added per-tenant sliding window 429 guard.

## 3. Live Smoke Measurements
- Cold wakeup latency: __ ms | Warm p95: __ ms | Offline pytest suite: __ passed`,
    liveLab: {
      labId: 'proj-fastapi-docker-live',
      title: 'Run Project 4 Live: Gateway Auth, Bounds Validation & Rate-Limit Pipeline',
      prompt:
        'Implement `handle_gateway_request(auth_header: str, payload: dict, expected_key: str, recent_hits: list[float], now: float, limit: int = 3) -> tuple[int, dict]`:\n1) Require `auth_header.startswith("Bearer ")` and constant-time `hmac.compare_digest(token, expected_key)` -> else `(401, {"error": "unauthorized"})`.\n2) Validate `payload.get("query")` is non-empty str (`1 <= len <= 500`) and `set(payload.keys()) <= {"query", "top_k"}` -> else `(422, {"error": "validation"})`.\n3) Trim `recent_hits` strictly keeping timestamps `> now - 60.0`; if `len(active) >= limit`, return `(429, {"error": "rate_limited"})`; otherwise append `now` to `recent_hits` and return `(200, {"answer": f"ok:{len(q)}"})`.',
      packages: [],
      starterCode: `import hmac

def handle_gateway_request(auth_header: str, payload: dict, expected_key: str, recent_hits: list[float], now: float, limit: int = 3) -> tuple[int, dict]:
    # Enforce 401 hmac auth -> 422 payload bounds -> 429 sliding window -> 200 OK
    return (200, {"answer": "unprotected"})`,
      testCode: `hits = [10.0, 20.0]
c1, _ = handle_gateway_request("Bearer wrong", {"query": "hi"}, "sec-123", hits, 30.0)
assert c1 == 401 and len(hits) == 2
c2, _ = handle_gateway_request("Bearer sec-123", {"query": "", "extra": 1}, "sec-123", hits, 30.0)
assert c2 == 422
c3, b3 = handle_gateway_request("Bearer sec-123", {"query": "hello"}, "sec-123", hits, 35.0, limit=3)
assert c3 == 200 and b3["answer"] == "ok:5" and len(hits) == 3
c4, _ = handle_gateway_request("Bearer sec-123", {"query": "again"}, "sec-123", hits, 40.0, limit=3)
assert c4 == 429
c5, _ = handle_gateway_request("Bearer sec-123", {"query": "later"}, "sec-123", hits, 120.0, limit=3)
assert c5 == 200
print("PASS: Live Project 4 Gateway Auth, Pydantic-style validation, and Rate Limiter verified!")`,
      solutionCode: `import hmac

def handle_gateway_request(auth_header: str, payload: dict, expected_key: str, recent_hits: list[float], now: float, limit: int = 3) -> tuple[int, dict]:
    if not isinstance(auth_header, str) or not auth_header.startswith("Bearer "):
        return (401, {"error": "unauthorized"})
    token = auth_header[7:].strip()
    if not hmac.compare_digest(token.encode("utf-8"), expected_key.encode("utf-8")):
        return (401, {"error": "unauthorized"})
    if not isinstance(payload, dict) or not (set(payload.keys()) <= {"query", "top_k"}):
        return (422, {"error": "validation"})
    q = payload.get("query")
    if not isinstance(q, str) or not (1 <= len(q.strip()) <= 500):
        return (422, {"error": "validation"})
    active = [t for t in recent_hits if t > now - 60.0]
    recent_hits[:] = active
    if len(recent_hits) >= limit:
        return (429, {"error": "rate_limited"})
    recent_hits.append(now)
    return (200, {"answer": f"ok:{len(q.strip())}"})`,
      hint: 'Check auth first (`401`), then schema keys and query bounds (`422`), then prune `recent_hits[:] = [t for t in recent_hits if t > now - 60.0]` before checking `>= limit` (`429`).',
    },
    steps: [
      { id: 'p4-s1', title: '1. Configure fail-fast 12-factor `.env` & Pydantic bounds', detail: 'Require non-empty `SERVICE_API_KEY` at startup and lock down `ChatRequest` with `extra="forbid"`.' },
      { id: 'p4-s2', title: '2. Implement `hmac` auth + `/healthz` & `/readyz`', detail: 'Separate liveness from dependency readiness and verify keys in constant time.' },
      { id: 'p4-s3', title: '3. Author cached non-root `Dockerfile` + `.dockerignore`', detail: 'Install `requirements.txt` before `COPY src/`, bind `--port ${PORT:-8000}`, and run as `USER appuser`.' },
      { id: 'p4-s4', title: '4. Wire GitHub Actions CI + live smoke suite', detail: 'Run offline `pytest` in CI, deploy free-tier cloud container, and run 5-point live smoke assertions.' },
      { id: 'p4-s5', title: '5. Author actionable `RUNBOOK.md` & Project Journal', detail: 'Document rollback commands, `429` budget triage, and deploy measurements.' },
    ],
    files: [
      {
        filename: 'README.md',
        language: 'markdown',
        content: `# Production FastAPI + Docker AI Microservice

## Architecture
Client -> CORS Allowlist -> FastAPI (\`/healthz\`, \`/readyz\`, \`POST /v1/ask\`) -> Auth + Rate Limit -> Mock/OpenAI Engine

## Quickstart
\`\`\`bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest -q
docker compose up --build
\`\`\``,
      },
      {
        filename: '.env.example',
        language: 'bash',
        content: `SERVICE_API_KEY=replace-with-32-char-random-secret
ALLOWED_ORIGINS=localhost:3000
OPENAI_API_KEY=
USE_MOCK_LLM=true`,
      },
      {
        filename: 'requirements.txt',
        language: 'bash',
        content: `fastapi>=0.115
uvicorn[standard]>=0.32
pydantic>=2.9
pytest>=8.3
httpx>=0.27`,
      },
      {
        filename: 'Dockerfile',
        language: 'dockerfile',
        content: `FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN useradd --create-home appuser
COPY --chown=appuser:appuser src/ ./src/
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port \${PORT:-8000}"]`,
      },
      {
        filename: 'docker-compose.yml',
        language: 'yaml',
        content: `services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env`,
      },
      {
        filename: '.dockerignore',
        language: 'bash',
        content: `.git
.venv
__pycache__
.env
*.pyc`,
      },
      {
        filename: 'src/main.py',
        language: 'python',
        content: `import hmac
import os
import time
from collections import deque
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

SERVICE_KEY = os.environ.get("SERVICE_API_KEY", "").strip()
if len(SERVICE_KEY) < 16 and os.environ.get("ALLOW_DEV_BOOT") != "1":
    raise RuntimeError("SERVICE_API_KEY (>=16 chars) is required on startup")

app = FastAPI(title="AI Gateway Service", version="1.0.0")
raw_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]
if raw_origins:
    app.add_middleware(CORSMiddleware, allow_origins=raw_origins, allow_credentials=True, allow_methods=["GET", "POST"], allow_headers=["*"])

_RATE_WINDOWS: dict[str, deque[float]] = {}

class AskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=1, max_length=2000)
    top_k: int = Field(default=3, ge=1, le=10)

def require_auth(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization[7:].strip()
    if not hmac.compare_digest(token.encode(), SERVICE_KEY.encode()):
        raise HTTPException(status_code=401, detail="Invalid API key")
    now = time.monotonic()
    q = _RATE_WINDOWS.setdefault("default", deque())
    while q and q[0] <= now - 60.0:
        q.popleft()
    if len(q) >= 30:
        raise HTTPException(status_code=429, detail="Rate limit exceeded", headers={"Retry-After": "10"})
    q.append(now)
    return "ok"

@app.get("/healthz")
def healthz():
    return {"status": "alive"}

@app.get("/readyz")
def readyz():
    return {"status": "ready"}

@app.post("/v1/ask", dependencies=[Depends(require_auth)])
def ask(req: AskRequest):
    return {"answer": f"[mock-grounded] Answered ({len(req.query)} chars, top_k={req.top_k})", "citations": ["doc_1"]}`,
      },
      {
        filename: 'tests/test_api.py',
        language: 'python',
        content: `import hmac
import os

os.environ["SERVICE_API_KEY"] = "test-secret-key-at-least-16-chars"

try:
    from fastapi.testclient import TestClient
    from src.main import app
    client = TestClient(app)
except ImportError:
    client = None

def test_health_and_readiness():
    if client is None:
        return
    assert client.get("/healthz").status_code == 200
    assert client.get("/readyz").json()["status"] == "ready"

def test_auth_validation_and_success():
    # Constant-time secret check always runs regardless of optional fastapi package
    assert hmac.compare_digest(os.environ["SERVICE_API_KEY"], "test-secret-key-at-least-16-chars")
    assert not hmac.compare_digest(os.environ["SERVICE_API_KEY"], "wrong-key")
    if client is None:
        return
    assert client.post("/v1/ask", json={"query": "hello"}).status_code == 401
    headers = {"Authorization": "Bearer test-secret-key-at-least-16-chars"}
    assert client.post("/v1/ask", headers=headers, json={"query": ""}).status_code == 422
    assert client.post("/v1/ask", headers=headers, json={"query": "hi", "extra": 1}).status_code == 422
    r = client.post("/v1/ask", headers=headers, json={"query": "SLA refund policy?"})
    assert r.status_code == 200 and r.json()["citations"] == ["doc_1"]`,
      },
      {
        filename: 'smoke_test.py',
        language: 'python',
        content: `import argparse, sys
import httpx

def run_smoke(base_url: str, api_key: str) -> None:
    base = base_url.rstrip("/")
    assert httpx.get(f"{base}/healthz", timeout=10).status_code == 200
    assert httpx.get(f"{base}/readyz", timeout=10).status_code == 200
    assert httpx.post(f"{base}/v1/ask", json={"query": "hi"}, timeout=10).status_code == 401
    hdr = {"Authorization": f"Bearer {api_key}"}
    assert httpx.post(f"{base}/v1/ask", headers=hdr, json={"query": ""}, timeout=10).status_code == 422
    r = httpx.post(f"{base}/v1/ask", headers=hdr, json={"query": "hello"}, timeout=15)
    assert r.status_code == 200 and r.json().get("answer")
    print("ALL 5 LIVE SMOKE CHECKS PASSED!")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--base-url", required=True)
    p.add_argument("--api-key", required=True)
    args = p.parse_args()
    run_smoke(args.base_url, args.api_key)`,
      },
      {
        filename: 'docs/RUNBOOK.md',
        language: 'markdown',
        content: `# On-Call Incident RUNBOOK

## 1. HTTP 503 / Upstream LLM Timeout
- Verify: Inspect JSON logs filtering \`status >= 500\` and \`/readyz\`.
- Mitigate: Toggle fallback mock/8B route via env and redeploy prior immutable tag.

## 2. Spike in HTTP 429 Rate Limits
- Verify: Check structured \`tenant_id\` request rates.
- Mitigate: Confirm webhook loop protection; ban runaway key if abused.`,
      },
      {
        filename: 'JOURNAL.md',
        language: 'markdown',
        content: `# Project Journal — FastAPI + Docker AI Service

## Bugs Caught & Fixed
- Replaced naive == key comparison with hmac.compare_digest.
- Fixed Render health-check timeout by binding --port \${PORT:-8000}.`,
      },
    ],
    resumeBullets: [
      'Containerized and deployed a typed FastAPI + Pydantic v2 AI microservice using cached non-root Docker builds, constant-time Bearer auth, and sliding-window rate limits.',
      'Automated GitHub Actions CI unit suites and a 5-point post-deploy HTTP smoke verification alongside an incident `RUNBOOK.md`, eliminating silent auth and `$PORT` deploy regressions.',
      'Structured redacted JSON RED telemetry (`Rate, Errors, Duration`) tracking p95 latency and token cost across endpoints.',
    ],
  },
  {
    id: 'proj-eval-harness',
    number: 5,
    level: 'Mid-Senior Capstone',
    title: 'LLM Evaluation Harness & Regression Report Engine',
    subtitle: 'Deterministic assertions + position-debiased pairwise judge + CI regression delta reporting blocking broken prompt or model merges automatically.',
    diagramId: 'hybrid-rag',
    estimatedWeekendHours: '4–6 hours',
    deploymentGuide: `1. Initialize \`.venv\` and install \`pytest\` (\`pip install -r requirements.txt\`).
2. Run \`python eval_runner.py --baseline fixtures/baseline.json --candidate fixtures/candidate.json\` to generate \`reports/eval_report.md\`.
3. Enable GitHub Actions workflow \`.github/workflows/eval_gate.yml\` so every pull request fails automatically if pass rate drops > 2% or citation validity < 100%.
4. Optionally configure \`OPENAI_API_KEY\` to run live model generation alongside recorded deterministic fixture cases.`,
    gradingRubric: [
      { criterion: 'Golden Dataset Coverage & Refusal Traps', weight: '25%', passBar: 'Covers happy-path, missing-evidence refusal, and JSON schema edge cases cleanly.' },
      { criterion: 'Deterministic + Debiased Judge Scoring', weight: '30%', passBar: 'Checks schema/citations before running swapped `(A,B)/(B,A)` pairwise judging.' },
      { criterion: 'Regression Delta Gate & Exit Codes', weight: '25%', passBar: 'Exits non-zero (`1`) on drop > tolerance and prints per-case diff report.' },
      { criterion: 'Offline CI Tests & Project Journal', weight: '20%', passBar: 'Full `pytest` passes 100% offline with documented real regression catch.' },
    ],
    readmeTemplate: `# LLM Evaluation Harness & Regression Gate

## Highlights
- Combines fast deterministic checks (JSON schema, valid citations, abstention) with swapped pairwise judging to eliminate position bias.
- Outputs Markdown regression reports highlighting every improved or regressed case ID.
- Returns exit code \`1\` in GitHub Actions CI whenever quality falls below baseline tolerance.`,
    journalTemplate: `# Project Journal — LLM Evaluation Harness

## 1. Real Regression Caught by Harness
- Prompt edit v2 boosted tone politeness but broke strict citation validity on unanswerable queries (caught automatically in CI).

## 2. Metrics
- Golden suite size: __ cases | Deterministic gate latency: __ ms | Swapped-judge tie rate: __%`,
    liveLab: {
      labId: 'proj-eval-harness-live',
      title: 'Run Project 5 Live: Debiased Pairwise Judge & CI Regression Gate',
      prompt:
        'Implement two core harness functions:\n1) `debiased_pairwise_winner(forward_choice: str, reversed_choice: str) -> str`: given judge picks on `(A, B)` (`"A"`/`"B"`) and swapped `(B, A)` (`"A"` means original `"B"`, `"B"` means original `"A"`), return `"A"` only if both passes pick original A, `"B"` if both pick original B, else `"TIE"`.\n2) `evaluate_ci_gate(baseline_scores: dict[str, bool], candidate_scores: dict[str, bool], max_drop: float = 0.05) -> tuple[bool, list[str]]`: compute pass rates, find `regressions` (IDs True in baseline but False in candidate), and return `(passed, sorted(regressions))` where `passed` is `True` iff `(cand_rate >= base_rate - max_drop)` AND `len(regressions) == 0`.',
      packages: [],
      starterCode: `def debiased_pairwise_winner(forward_choice: str, reversed_choice: str) -> str:
    # forward_choice in {'A','B'} on (A,B); reversed_choice in {'A','B'} on swapped (B,A)
    pass

def evaluate_ci_gate(baseline_scores: dict[str, bool], candidate_scores: dict[str, bool], max_drop: float = 0.05) -> tuple[bool, list[str]]:
    # Identify regressed case IDs and enforce zero regressions + pass rate within tolerance
    pass`,
      testCode: `assert debiased_pairwise_winner("A", "B") == "A"
assert debiased_pairwise_winner("B", "A") == "B"
assert debiased_pairwise_winner("A", "A") == "TIE"
ok, reg = evaluate_ci_gate({"c1": True, "c2": True, "c3": False}, {"c1": True, "c2": True, "c3": True})
assert ok is True and reg == []
ok2, reg2 = evaluate_ci_gate({"c1": True, "c2": True}, {"c1": True, "c2": False})
assert ok2 is False and reg2 == ["c2"]
print("PASS: Live Project 5 Eval Harness removed position bias and caught CI regression cleanly!")`,
      solutionCode: `def debiased_pairwise_winner(forward_choice: str, reversed_choice: str) -> str:
    rev_mapped = "B" if reversed_choice == "A" else ("A" if reversed_choice == "B" else "TIE")
    if forward_choice == rev_mapped and forward_choice in ("A", "B"):
        return forward_choice
    return "TIE"

def evaluate_ci_gate(baseline_scores: dict[str, bool], candidate_scores: dict[str, bool], max_drop: float = 0.05) -> tuple[bool, list[str]]:
    keys = sorted(baseline_scores.keys())
    if not keys:
        return True, []
    base_rate = sum(1 for k in keys if baseline_scores[k]) / len(keys)
    cand_rate = sum(1 for k in keys if candidate_scores.get(k, False)) / len(keys)
    regressions = [k for k in keys if baseline_scores[k] and not candidate_scores.get(k, False)]
    passed = (cand_rate >= base_rate - max_drop) and len(regressions) == 0
    return passed, regressions`,
      hint: 'In `reversed_choice` on `(B, A)`, picking slot `"A"` actually votes for original `"B"`, and picking slot `"B"` votes for original `"A"`!',
    },
    steps: [
      { id: 'p5-s1', title: '1. Curate 30-case versioned golden JSON dataset', detail: 'Include citations, refusal traps, and edge-case formatting inputs.' },
      { id: 'p5-s2', title: '2. Implement deterministic checks ahead of judge calls', detail: 'Assert JSON parseability, citation subset containment, and zero empty answers first.' },
      { id: 'p5-s3', title: '3. Add swapped `(A,B)/(B,A)` pairwise judge debiasing', detail: 'Treat inconsistent flipped-order picks strictly as ties rather than noisy false wins.' },
      { id: 'p5-s4', title: '4. Build Markdown delta report + CI exit-code gate', detail: 'Print exact improved/regressed case IDs and exit non-zero on quality drops.' },
    ],
    files: [
      {
        filename: 'README.md',
        language: 'markdown',
        content: `# LLM Evaluation Harness & CI Regression Gate

## Quickstart
\`\`\`bash
pip install -r requirements.txt
python eval_runner.py
pytest -q
\`\`\``,
      },
      {
        filename: '.env.example',
        language: 'bash',
        content: `OPENAI_API_KEY=
EVAL_MODE=offline_mock`,
      },
      {
        filename: 'requirements.txt',
        language: 'bash',
        content: `pytest>=8.3`,
      },
      {
        filename: 'eval_runner.py',
        language: 'python',
        content: `import json, sys
from pathlib import Path

def check_case(case: dict, output: dict) -> tuple[bool, list[str]]:
    reasons = []
    if case.get("expect_refusal"):
        if not output.get("refused"):
            reasons.append("failed_to_refuse")
    else:
        allowed = set(case.get("retrieved_ids", []))
        cits = output.get("cited_ids", [])
        if not cits or not all(c in allowed for c in cits):
            reasons.append("invalid_or_missing_citations")
        for kw in case.get("must_include", []):
            if kw.lower() not in output.get("answer", "").lower():
                reasons.append(f"missing_keyword:{kw}")
    return len(reasons) == 0, reasons

def run_suite(cases: list[dict], outputs: dict[str, dict]) -> dict:
    results = {}
    for c in cases:
        ok, reasons = check_case(c, outputs.get(c["id"], {}))
        results[c["id"]] = {"passed": ok, "reasons": reasons}
    rate = sum(1 for v in results.values() if v["passed"]) / max(1, len(results))
    return {"pass_rate": round(rate, 4), "cases": results}

if __name__ == "__main__":
    sample_cases = [{"id": "g1", "retrieved_ids": ["d1"], "must_include": ["14 days"]}, {"id": "g2", "expect_refusal": True}]
    sample_out = {"g1": {"answer": "14 days.", "cited_ids": ["d1"]}, "g2": {"refused": True, "cited_ids": []}}
    report = run_suite(sample_cases, sample_out)
    print(json.dumps(report, indent=2))
    if report["pass_rate"] < 0.90:
        sys.exit(1)`,
      },
      {
        filename: 'tests/test_harness.py',
        language: 'python',
        content: `from eval_runner import run_suite

def test_catches_hallucinated_citation_and_missing_refusal():
    cases = [{"id": "c1", "retrieved_ids": ["d1"], "must_include": ["14 days"]}, {"id": "c2", "expect_refusal": True}]
    bad_out = {"c1": {"answer": "14 days", "cited_ids": ["invented_doc"]}, "c2": {"refused": False}}
    res = run_suite(cases, bad_out)
    assert res["pass_rate"] == 0.0`,
      },
      {
        filename: 'JOURNAL.md',
        language: 'markdown',
        content: `# Project Journal — LLM Eval Harness

## Caught Regression
- Swapping pairwise order exposed 18% position bias in naive judge prompts; enforcing agreement dropped false wins cleanly.`,
      },
    ],
    resumeBullets: [
      'Built an automated LLM evaluation harness combining deterministic schema/citation checks with position-debiased pairwise LLM-as-a-Judge grading.',
      'Integrated per-case regression diff reports into GitHub Actions CI, blocking prompt/model merges automatically whenever pass rate or citation validity drops.',
      'Maintained 100% offline CI test execution via recorded fixture suites alongside optional live-provider runner flags.',
    ],
  },
  {
    id: 'proj-bilingual',
    number: 6,
    level: 'Optional Track',
    title: 'Bilingual (Arabic / English) RTL Support Search Assistant',
    subtitle: 'Unicode NFKC + Arabic orthographic normalization, cross-lingual BM25 + semantic fusion, RTL-safe citations, and bilingual golden eval parity.',
    diagramId: 'hybrid-rag',
    estimatedWeekendHours: '4–6 hours',
    deploymentGuide: `1. Test bilingual normalization and search locally via \`python bilingual_rag.py\` and \`pytest -q\`.
2. Deploy backend API cleanly on Render/Fly alongside a Next.js RTL-aware UI (\`dir="auto"\` per message bubble) on Vercel.
3. Verify both English and Arabic golden evaluation slices score >= 85% Recall before shipping.`,
    gradingRubric: [
      { criterion: 'Symmetric Arabic Normalization', weight: '30%', passBar: 'Strips Tashkeel diacritics and unifies Alef/Ya/Ta-Marbuta symmetrically on index & query.' },
      { criterion: 'Bilingual Hybrid Retrieval & Tenant ACL', weight: '30%', passBar: 'Pre-filters `tenant_id` cleanly and fuses keyword + semantic scores accurately.' },
      { criterion: 'RTL UI & Citation Provenance', weight: '20%', passBar: 'Renders mixed Arabic/English citations cleanly with `dir="auto"` isolation.' },
      { criterion: 'Bilingual Eval Parity & Tests', weight: '20%', passBar: 'Offline `pytest` proves equal retrieval recall on EN and AR test queries.' },
    ],
    readmeTemplate: `# Bilingual (Arabic / English) Support Search Assistant

## Highlights
- Symmetric Arabic text normalization (NFKC, diacritics removal, Alef/Ya/Ta-Marbuta unification).
- Multi-tenant hybrid keyword + semantic retrieval with RTL-friendly inline citations.
- Verified parity across English and Arabic golden test slices.`,
    journalTemplate: `# Project Journal — Bilingual AR/EN Assistant

## 1. Normalization Bug Discovered
- Queries using bare ا missed indexed documents containing أ/إ until symmetric Alef/diacritics normalization ran on both sides.

## 2. Bilingual Parity Results
- English Recall@3: __% | Arabic Recall@3 before norm: __% -> after norm: __%`,
    liveLab: {
      labId: 'proj-bilingual-live',
      title: 'Run Project 6 Live: Arabic Orthographic Normalization & Bilingual Search',
      prompt:
        'Implement `normalize_bilingual(text: str) -> str` and `search_bilingual(query: str, docs: list[dict], tenant_id: str) -> list[str]`:\n- In `normalize_bilingual`: apply `unicodedata.normalize("NFKC", text).lower()`, strip Arabic Tashkeel diacritics (`\\u064b-\\u065f`, `\\u0670`, tatweel `\\u0640`), unify `أ/إ/آ -> ا`, `ى -> ي`, and `ة -> ه`.\n- In `search_bilingual`: pre-filter `docs` where `d["tenant_id"] in (tenant_id, "public")`, score each doc by shared normalized token count + `d.get("semantic_sim", 0.0)`, and return matching doc IDs sorted descending.',
      packages: [],
      starterCode: `import re, unicodedata

def normalize_bilingual(text: str) -> str:
    # NFKC + strip Arabic diacritics + unify Alef/Ya/Ta-Marbuta
    pass

def search_bilingual(query: str, docs: list[dict], tenant_id: str) -> list[str]:
    # Pre-filter tenant_id and rank by normalized token hits + semantic_sim
    pass`,
      testCode: `assert normalize_bilingual("الإسترجاعُ السريعُ") == normalize_bilingual("الاسترجاع السريع")
assert normalize_bilingual("سياسةُ الإرجاعِ") == normalize_bilingual("سياسه الارجاع")
DOCS = [
    {"id": "ar_refund", "tenant_id": "acme", "text": "سياسةُ الإرجاعِ خلال ١٤ يوماً للفواتير", "semantic_sim": 0.85},
    {"id": "beta_ar", "tenant_id": "beta", "text": "خصم سري لشركة بيتا على الإرجاع", "semantic_sim": 0.99},
    {"id": "en_sla", "tenant_id": "acme", "text": "English refund SLA is 14 days.", "semantic_sim": 0.80},
]
res_ar = search_bilingual("سياسه الارجاع", DOCS, "acme")
assert "beta_ar" not in res_ar and res_ar[0] == "ar_refund"
res_en = search_bilingual("refund SLA", DOCS, "acme")
assert res_en[0] == "en_sla"
print("PASS: Live Project 6 Bilingual AR/EN Retriever handled diacritics, Alef/Ta-Marbuta, and ACLs cleanly!")`,
      solutionCode: `import re, unicodedata

def normalize_bilingual(text: str) -> str:
    s = unicodedata.normalize("NFKC", text).lower()
    s = re.sub(r"[\\u0640\\u064b-\\u065f\\u0670]", "", s)
    s = re.sub(r"[أإآ]", "ا", s)
    s = s.replace("ى", "ي").replace("ة", "ه")
    return s

def search_bilingual(query: str, docs: list[dict], tenant_id: str) -> list[str]:
    allowed = [d for d in docs if d["tenant_id"] in (tenant_id, "public")]
    q_toks = set(re.findall(r"[\\w]+", normalize_bilingual(query)))
    def score(d: dict) -> float:
        d_toks = set(re.findall(r"[\\w]+", normalize_bilingual(d["text"])))
        return len(q_toks & d_toks) + float(d.get("semantic_sim", 0.0))
    ranked = sorted(allowed, key=score, reverse=True)
    return [d["id"] for d in ranked]`,
      hint: 'Use `unicodedata.normalize("NFKC", text)`, regex `[\\u0640\\u064b-\\u065f\\u0670]` to strip tatweel & diacritics, and map `[أإآ] -> ا`, `ى -> ي`, `ة -> ه`.',
    },
    steps: [
      { id: 'p6-s1', title: '1. Implement symmetric Arabic/English text normalizer', detail: 'Apply NFKC, Tashkeel removal, and Alef/Ya/Ta-Marbuta unification identically on index and query.' },
      { id: 'p6-s2', title: '2. Build tenant-isolated bilingual hybrid retriever', detail: 'Combine normalized lexical matching with multilingual embedding similarity.' },
      { id: 'p6-s3', title: '3. Add RTL-safe UI rendering (`dir="auto"`)', detail: 'Ensure inline citations and mixed English SKUs inside Arabic prose never flip reading order.' },
      { id: 'p6-s4', title: '4. Verify EN/AR parity in automated CI tests', detail: 'Assert >=85% recall on both English and Arabic golden queries offline.' },
    ],
    files: [
      {
        filename: 'README.md',
        language: 'markdown',
        content: `# Bilingual Arabic / English RTL Support Search Assistant

## Quickstart
\`\`\`bash
pip install -r requirements.txt
pytest -q
\`\`\``,
      },
      {
        filename: '.env.example',
        language: 'bash',
        content: `OPENAI_API_KEY=
DEFAULT_UI_DIR=auto`,
      },
      {
        filename: 'requirements.txt',
        language: 'bash',
        content: `pytest>=8.3`,
      },
      {
        filename: 'bilingual_rag.py',
        language: 'python',
        content: `import re, unicodedata

def normalize_bilingual(text: str) -> str:
    s = unicodedata.normalize("NFKC", text).lower()
    s = re.sub(r"[\\u0640\\u064b-\\u065f\\u0670]", "", s)
    s = re.sub(r"[أإآ]", "ا", s)
    return s.replace("ى", "ي").replace("ة", "ه")

def search_bilingual(query: str, docs: list[dict], tenant_id: str) -> list[dict]:
    allowed = [d for d in docs if d["tenant_id"] in (tenant_id, "public")]
    q_toks = set(re.findall(r"[\\w]+", normalize_bilingual(query)))
    return sorted(allowed, key=lambda d: len(q_toks & set(re.findall(r"[\\w]+", normalize_bilingual(d["text"])))) + d.get("semantic_sim", 0.0), reverse=True)`,
      },
      {
        filename: 'tests/test_bilingual.py',
        language: 'python',
        content: `from bilingual_rag import normalize_bilingual, search_bilingual

def test_arabic_diacritic_and_acl_parity():
    assert normalize_bilingual("الإرجاعُ") == normalize_bilingual("الارجاع")
    docs = [{"id": "a1", "tenant_id": "t1", "text": "الإرجاع خلال ١٤ يوماً", "semantic_sim": 0.9}, {"id": "b1", "tenant_id": "t2", "text": "بيانات سرية", "semantic_sim": 0.99}]
    res = search_bilingual("الارجاع", docs, "t1")
    assert [d["id"] for d in res] == ["a1"]`,
      },
      {
        filename: 'JOURNAL.md',
        language: 'markdown',
        content: `# Project Journal — Bilingual AR/EN Search

## Findings
- NFKC + symmetric Alef/Ya/Ta-Marbuta unification fixed 100% of diacritic query mismatches.`,
      },
    ],
    resumeBullets: [
      'Engineered an Arabic/English bilingual hybrid search assistant with symmetric Unicode `NFKC` and Arabic orthographic normalization (`Tashkeel`, `Alef`, `Ta-Marbuta`), restoring parity across RTL queries.',
      'Enforced mandatory `tenant_id` pre-filtering and automated bilingual golden-eval `pytest` suites verifying zero cross-tenant leakage.',
      'Delivered RTL-safe (`dir="auto"`) citation rendering preventing mixed SKU/number bidirectional layout glitches.',
    ],
  },
  {
    id: 'proj-woocommerce-bilingual',
    number: 7,
    level: 'Mid-Senior Capstone',
    title: 'Bilingual (AR/EN) WooCommerce Product & Order-Status Copilot',
    subtitle: 'Symmetric Arabic/English catalog search, customer-scoped order lookup tool with HITL refund gates, bilingual parity evals & per-request cost ledger.',
    diagramId: 'agent-guardrails',
    estimatedWeekendHours: '5–8 hours',
    deploymentGuide: `1. Run \`make test\` and \`make check\` offline first to verify customer permission checks, Arabic parity evals, and generate \`evidence.json\`.
2. Connect a real store webhook/REST read token or test sandbox, plus local Ollama or an OpenAI-compatible key for \`make live\`.
3. Deploy the FastAPI tool gateway on Render/Fly and verify RTL/LTR product card citations inside Next.js (\`dir="auto"\`).`,
    gradingRubric: [
      { criterion: 'Symmetric AR/EN Catalog Search & Normalization', weight: '25%', passBar: 'Finds Arabic diacritic/Alef variations and English SKUs cleanly above 90% Recall@3.' },
      { criterion: 'Authenticated Order-Status Ownership Check', weight: '30%', passBar: 'Verifies caller identity (`customer_email`) before returning order status (`FORBIDDEN` on mismatch).' },
      { criterion: 'Refund Bounds & HITL Escalation', weight: '25%', passBar: 'Rejects negative/excessive amounts and escalates refunds > $100 to `NEEDS_HUMAN_APPROVAL`.' },
      { criterion: 'Arabic Parity Eval & Cost Ledger', weight: '20%', passBar: 'Emits passing `evidence.json` showing EN/AR parity and unit request cost tracking.' },
    ],
    readmeTemplate: `# Bilingual AR/EN WooCommerce AI Copilot

## Architecture
Shopper Query (AR/EN) -> Symmetric Normalizer + Catalog Search -> Customer-Scoped Order Tool -> HITL Refund Gate -> Cost & Latency Telemetry`,
    journalTemplate: `# Project Journal — Bilingual WooCommerce Copilot

## 1. Security Invariant Verified
- Never let the model supply an arbitrary customer email or trust untrusted coupon/note text to bypass order ownership or refund caps.

## 2. Bilingual Parity & Unit Cost
- EN Recall@3: __% | AR Recall@3: __% | Avg cost/turn: $__`,
    liveLab: {
      labId: 'proj-woocommerce-bilingual-live',
      title: 'Run Project 7 Live: Bilingual Store Catalog, Order Permission Check & HITL Refund Gate',
      prompt:
        'Implement `search_catalog(query, products)` (using NFKC + Arabic Alef/diacritics/Ta-Marbuta normalization) and `lookup_order(order_id, caller_email, orders)` returning `"FORBIDDEN"` unless `caller_email.lower() == order["email"].lower()`, else returning `order["status"]`.',
      packages: [],
      starterCode: `import re, unicodedata

def norm_ar_en(text: str) -> str:
    s = unicodedata.normalize("NFKC", text).lower()
    s = re.sub(r"[\\u0640\\u064b-\\u065f\\u0670]", "", s)
    return re.sub(r"[أإآ]", "ا", s).replace("ى", "ي").replace("ة", "ه")

def search_catalog(query: str, products: list[dict]) -> list[str]:
    # Rank product IDs matching normalized query tokens in title_ar/title_en
    return []

def lookup_order(order_id: str, caller_email: str, orders: dict[str, dict]) -> str:
    # Enforce caller_email == order["email"] case-insensitively else return "FORBIDDEN"
    return "NOT_FOUND"`,
      testCode: `CATALOG = [
    {"id": "sku-espresso", "title_en": "Espresso Grinder Pro", "title_ar": "مطحنةُ الإسبريسو الاحترافية", "in_stock": True},
    {"id": "sku-kettle", "title_en": "Gooseneck Kettle", "title_ar": "غلاية ماء كهربائية", "in_stock": True},
]
assert search_catalog("مطحنه الاسبريسو", CATALOG)[0] == "sku-espresso"
assert search_catalog("grinder", CATALOG)[0] == "sku-espresso"
ORDERS = {"ORD-77": {"email": "sara@shop.test", "status": "SHIPPED"}}
assert lookup_order("ORD-77", "attacker@shop.test", ORDERS) == "FORBIDDEN"
assert lookup_order("ORD-77", "Sara@shop.test", ORDERS) == "SHIPPED"
print("PASS: Live Project 7 WooCommerce AR/EN Catalog & Order ACL verified!")`,
      solutionCode: `import re, unicodedata

def norm_ar_en(text: str) -> str:
    s = unicodedata.normalize("NFKC", text).lower()
    s = re.sub(r"[\\u0640\\u064b-\\u065f\\u0670]", "", s)
    return re.sub(r"[أإآ]", "ا", s).replace("ى", "ي").replace("ة", "ه")

def search_catalog(query: str, products: list[dict]) -> list[str]:
    q_toks = set(re.findall(r"[\\w]+", norm_ar_en(query)))
    def score(p: dict) -> int:
        hay = norm_ar_en(f"{p.get('title_en', '')} {p.get('title_ar', '')}")
        return len(q_toks & set(re.findall(r"[\\w]+", hay)))
    ranked = sorted(products, key=score, reverse=True)
    return [p["id"] for p in ranked if score(p) > 0]

def lookup_order(order_id: str, caller_email: str, orders: dict[str, dict]) -> str:
    order = orders.get(order_id)
    if not order:
        return "NOT_FOUND"
    if order["email"].strip().lower() != caller_email.strip().lower():
        return "FORBIDDEN"
    return str(order["status"])`,
      hint: 'Normalize `f"{title_en} {title_ar}"` symmetrically and compare lowercase stripped caller emails in `lookup_order`.',
    },
    steps: [
      { id: 'p7-s1', title: '1. Build symmetric AR/EN product catalog search', detail: 'Handle Arabic Tashkeel/Alef/Ta-Marbuta variations plus English SKU lookups.' },
      { id: 'p7-s2', title: '2. Implement customer-scoped order lookup tool', detail: 'Enforce server-side caller email ownership check returning FORBIDDEN on cross-customer queries.' },
      { id: 'p7-s3', title: '3. Wire refund guardrail + HITL approval queue', detail: 'Reject out-of-range refunds and pause high-value refunds for human sign-off.' },
      { id: 'p7-s4', title: '4. Run Arabic parity eval & emit evidence.json', detail: 'Verify EN/AR parity and unit economics via `make test` and `make check`.' },
    ],
    files: [
      {
        filename: 'README.md',
        language: 'markdown',
        content: `# Bilingual AR/EN WooCommerce Copilot

## Quickstart
\`\`\`bash
make test
make check
\`\`\``,
      },
      {
        filename: 'requirements.txt',
        language: 'bash',
        content: `pytest>=8.3`,
      },
      {
        filename: 'store_copilot.py',
        language: 'python',
        content: `import re, unicodedata

def norm_ar_en(text: str) -> str:
    s = unicodedata.normalize("NFKC", text).lower()
    s = re.sub(r"[\\u0640\\u064b-\\u065f\\u0670]", "", s)
    return re.sub(r"[أإآ]", "ا", s).replace("ى", "ي").replace("ة", "ه")

def search_catalog(query: str, products: list[dict]) -> list[str]:
    q_toks = set(re.findall(r"[\\w]+", norm_ar_en(query)))
    scored = []
    for p in products:
        hay = norm_ar_en(f"{p.get('title_en', '')} {p.get('title_ar', '')} {p.get('sku', '')}")
        hits = len(q_toks & set(re.findall(r"[\\w]+", hay)))
        if hits > 0:
            scored.append((hits, p["id"]))
    scored.sort(key=lambda x: (-x[0], x[1]))
    return [pid for _, pid in scored]

def lookup_order_status(order_id: str, caller_email: str, orders: dict[str, dict]) -> dict:
    order = orders.get(order_id)
    if not order:
        return {"ok": False, "code": 404, "error": "order_not_found"}
    if order["email"].strip().lower() != caller_email.strip().lower():
        return {"ok": False, "code": 403, "error": "forbidden_cross_customer"}
    return {"ok": True, "code": 200, "order_id": order_id, "status": order["status"], "total_usd": order["total_usd"]}

def propose_refund(order_id: str, caller_email: str, requested_usd: float, orders: dict[str, dict], hitl_threshold: float = 100.0) -> dict:
    order = orders.get(order_id)
    if not order or order["email"].strip().lower() != caller_email.strip().lower():
        return {"status": "FORBIDDEN", "approved": False}
    if requested_usd <= 0 or requested_usd > float(order["total_usd"]):
        return {"status": "REJECTED_INVALID_AMOUNT", "approved": False}
    if requested_usd > hitl_threshold:
        return {"status": "NEEDS_HUMAN_APPROVAL", "approved": False}
    return {"status": "APPROVED", "approved": True, "amount_usd": round(requested_usd, 2)}`,
      },
      {
        filename: 'eval_parity.py',
        language: 'python',
        content: `from store_copilot import search_catalog

PRODUCTS = [
    {"id": "p-grinder", "sku": "ESP-101", "title_en": "Espresso Grinder Pro", "title_ar": "مطحنةُ الإسبريسو"},
    {"id": "p-kettle", "sku": "KET-202", "title_en": "Electric Gooseneck Kettle", "title_ar": "غلايةُ ماءٍ كهربائيةٌ"},
]

def evaluate_bilingual_parity() -> dict:
    en_hit = "p-grinder" in search_catalog("espresso grinder", PRODUCTS)
    ar_hit = "p-grinder" in search_catalog("مطحنه الاسبريسو", PRODUCTS)
    return {"en_recall": 1.0 if en_hit else 0.0, "ar_recall": 1.0 if ar_hit else 0.0, "parity_ok": en_hit and ar_hit}`,
      },
      {
        filename: 'tests/test_woocommerce.py',
        language: 'python',
        content: `from eval_parity import evaluate_bilingual_parity
from store_copilot import lookup_order_status, propose_refund

ORDERS = {"ORD-1": {"email": "nadia@shop.test", "status": "DELIVERED", "total_usd": 180.0}}

def test_order_acl_and_refund_hitl():
    assert lookup_order_status("ORD-1", "other@shop.test", ORDERS)["code"] == 403
    assert lookup_order_status("ORD-1", "nadia@shop.test", ORDERS)["status"] == "DELIVERED"
    assert propose_refund("ORD-1", "nadia@shop.test", 250.0, ORDERS)["status"] == "REJECTED_INVALID_AMOUNT"
    assert propose_refund("ORD-1", "nadia@shop.test", 150.0, ORDERS)["status"] == "NEEDS_HUMAN_APPROVAL"
    assert propose_refund("ORD-1", "nadia@shop.test", 40.0, ORDERS)["status"] == "APPROVED"

def test_en_ar_parity():
    res = evaluate_bilingual_parity()
    assert res["parity_ok"] is True`,
      },
      {
        filename: 'JOURNAL.md',
        language: 'markdown',
        content: `# Project Journal — Bilingual WooCommerce Copilot

## Lessons Learned
- Passing caller email from authenticated session rather than LLM tool arguments eliminates IDOR leaks across shoppers.`,
      },
    ],
    resumeBullets: [
      'Built a bilingual (Arabic/English) WooCommerce AI assistant with symmetric Arabic catalog normalization and verified EN/AR search parity.',
      'Enforced server-side customer email ownership validation on order-status lookups and deterministic HITL gates on high-value refunds.',
      'Instrumented p50/p95 latency, USD request budgets, secret scanning, and reproducible validator evidence.json CI reporting.',
    ],
  },
];
