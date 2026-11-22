import type { Lesson } from '@/types/course';

export const lesson1_3: Lesson = {
  id: '1-3',
  moduleId: 'mod-1',
  number: '1.3',
  title: 'Testing (`pytest`), `logging`, REST APIs, `async`/`await` & Reading Code',
  subtitle: 'Write automated unit tests, integrate REST/JSON APIs reliably, speed up I/O with async/await, and read unfamiliar repos systematically.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['1.2'],
  requires: ['python-files-json', 'python-exceptions', 'python-dataclasses', 'logging-basics'],
  teaches: [
    'python-pytest',
    'python-http-rest',
    'python-async',
    'code-reading',
  ],
  objectives: [
    'Write focused `pytest`-style unit tests covering normal cases, edge boundaries, and expected exceptions.',
    'Configure structured Python `logging` levels (`INFO`, `WARNING`, `ERROR`) instead of leaving scattered debug `print()`s.',
    'Understand HTTP REST requests (`GET`/`POST`, headers, JSON bodies, status codes `200`/`401`/`429`/`503`) and simulate API calls offline cleanly.',
    'Understand `async` / `await` and `asyncio.gather` for concurrent network/LLM requests, plus a 4-step system for reading unfamiliar repositories.',
  ],
  checkWithoutNotes: [
    'What are the three steps of an Arrange–Act–Assert (`pytest`) test, and why test empty inputs or boundary cases explicitly?',
    'In HTTP REST APIs, what do status codes `200`, `401`, `429`, and `503` tell your client code to do?',
    'Why does `asyncio.gather(...)` speed up 10 slow LLM/API requests, yet provide almost zero speedup for heavy local CPU math?',
    'When handed an unfamiliar 40-file repository on Day 1 at a job, what order do you inspect files in?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Writing brand-new code from a blank file is actually less than half of an AI engineer\'s daily week. Much of your job involves reading existing repositories written by teammates, connecting your FastAPI or Python agent to external REST/JSON endpoints (LLM providers, vector databases, company microservices), verifying behavior with `pytest` before opening a Pull Request, and making slow sequential network calls fast without breaking rate limits.',
        'At the same time, beginners frequently confuse `async def` with multi-core CPU speedups or hammer failing HTTP `429` endpoints without checking status codes. Building crisp mental models for unit testing, structured logging, HTTP semantics, `async`/`await` concurrency, and codebase navigation prepares you directly for Modules 6, 7, and your backend FastAPI capstone.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Kitchen Timers (`async`), Postal Envelopes (HTTP) & Safety Nets (`pytest`)',
      paragraphs: [
        'First, understand **`async` / `await`** with a kitchen timer analogy. Calling an LLM or REST API takes 500–2,000 milliseconds where your CPU sits **completely idle waiting for packets over the network**. Synchronous code (`for req in batch: call_api(req)`) stands staring at the microwave for 10 minutes while boiling 10 pots one after another! Asynchronous code (`async def` + `await` + `asyncio.gather`) puts all 10 pots on the stove at once and handles each response the moment its timer rings—turning 10 seconds of sequential waiting into ~1 second total.',
        'Crucial warning: `asyncio` runs on a **single Python event loop** sharing one thread. It shines on **I/O-bound** network waiting (HTTP APIs, DB queries), whereas CPU-heavy NumPy/PyTorch loops block the event loop unless pushed to worker processes or compiled C threads. Also note: forgetting `await` before calling an `async def` function returns an unexecuted *coroutine object* instead of the actual result!',
        'Second, picture every **HTTP REST request** as an addressed envelope containing four parts: a **Method** (`GET` to read, `POST` to create/query an LLM), an **Endpoint Path** (`/v1/chat/completions` on your configured host), **Headers** (metadata like `Authorization: Bearer <token>` and `Content-Type: application/json`), and an optional JSON **Body**. The server replies with a **Status Code**: `2xx` (`200 OK`) succeeded; `400/422` means your payload failed validation (do NOT retry); `401/403` means bad API key or forbidden permissions; `429` means rate-limited (slow down and retry with backoff); `5xx` (`500`, `503`) means temporary server trouble.',
        'Third, **`pytest` unit tests** follow **Arrange -> Act -> Assert**: construct tiny controlled inputs (including empty lists and malformed inputs!), invoke your function, and `assert` exact outputs—often swapping real network clients for fast deterministic **mock/fake clients** so tests run offline in milliseconds in CI!',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Writing `pytest`-Style Unit Tests & Inspecting HTTP Payloads',
      paragraphs: [
        'Because browser sandboxes and CI suites cannot hit paid external servers during automated grading, engineers pass an injectable **client** or **fetcher** function into business logic (`fetch_summary(client, prompt)`). During unit testing, you pass a tiny deterministic fake client that returns canned HTTP responses (`200`, `429`, `500`), letting you verify retry logic, auth headers, and JSON extraction deterministically in milliseconds.',
        'Study the worked test below. Notice how `test_handles_rate_limit` explicitly checks behavior on HTTP `429` and missing JSON keys—catching bugs long before production deploy:',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Testing a Deterministic Mock HTTP REST Client',
      language: 'python',
      code: `import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api_client")

def parse_chat_response(status_code: int, payload: dict) -> str:
    if status_code == 200:
        choices = payload.get("choices", [])
        if not choices:
            raise ValueError("HTTP 200 payload missing 'choices'")
        return choices[0]["message"]["content"]
    if status_code == 429:
        logger.warning("Rate limit hit (HTTP 429); caller should back off")
        raise RuntimeError("rate_limited")
    raise RuntimeError(f"http_error_{status_code}")

def test_parse_chat_response():
    # Arrange & Act
    text = parse_chat_response(200, {"choices": [{"message": {"content": "Ready"}}]})
    # Assert
    assert text == "Ready"
    try:
        parse_chat_response(429, {})
        assert False, "Expected RuntimeError on 429"
    except RuntimeError as exc:
        assert "rate_limited" in str(exc)

test_parse_chat_response()
print("All assertions passed!")`,
      caption: 'Explained output: `All assertions passed!` (plus a `WARNING:api_client:...` log record when simulating 429). Separating transport (`requests`/`httpx`) from pure response parsing (`parse_chat_response`) makes logic trivial to unit-test with `pytest`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Running Coroutines Concurrently with `asyncio.gather`',
      paragraphs: [
        'Compare running three simulated `await mock_embed(doc)` tasks sequentially versus wrapping them inside `asyncio.gather(...)`. Remember two strict rules: 1) you can only write `await` inside an `async def` function, and 2) top-level scripts kick off the async entrypoint once using `asyncio.run(main())` (or `await main()` inside Jupyter/Pyodide).',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Parallel I/O with `async` / `await` & `asyncio.gather`',
      language: 'python',
      code: `import asyncio

async def mock_fetch_score(doc_id: str) -> dict:
    await asyncio.sleep(0.01)  # Simulates non-blocking network wait
    return {"id": doc_id, "score": len(doc_id) * 0.1}

async def batch_fetch(doc_ids: list[str]) -> list[dict]:
    tasks = [mock_fetch_score(d) for d in doc_ids]
    return await asyncio.gather(*tasks)

results = asyncio.run(batch_fetch(["doc-a", "doc-bb", "doc-ccc"]))
print("Concurrent results:", results)`,
      caption: 'Explained output: `Concurrent results: [{\'id\': \'doc-a\', \'score\': 0.5}, {\'id\': \'doc-bb\', \'score\': 0.6...}, {\'id\': \'doc-ccc\', \'score\': 0.7...}]`. `asyncio.gather(*tasks)` runs all three awaits concurrently while preserving input list order!',
    },
    {
      type: 'table',
      title: 'How Senior Engineers Read an Unfamiliar Codebase in 15 Minutes',
      headers: ['Step', 'Where to Look First', 'Question You Answer', 'Avoid Doing This'],
      rows: [
        ['1. Project Map', '`README.md`, `requirements.txt`, folder tree', 'What does this app do, what versions/frameworks run it?', 'Opening random helper files without context'],
        ['2. Entrypoint', '`main.py`, `app.py`, `cli.py`, `routes/`', 'Where do requests, jobs, or CLI commands enter?', 'Reading 500-line utility classes line by line first'],
        ['3. Data Contracts', '`models.py`, `schemas.py`, `types/`', 'What shapes of inputs/outputs flow through functions?', 'Guessing dict keys mentally'],
        ['4. Test Suite', '`tests/test_*.py`', 'How are real callers expected to run and edge-case tested?', 'Skipping tests; tests are living executable examples!'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Exponential Backoff, Timeouts, Concurrency Caps & `pytest` Edge Fixtures',
      paragraphs: [
        'Firing 500 `asyncio.gather` requests simultaneously against an API quickly triggers HTTP `429` rate limits. Production engineers pair `asyncio.gather` with an **`asyncio.Semaphore(max_in_flight)`** (for example allowing 5–10 requests in flight simultaneously) and **exponential backoff with jitter** (`delay = base * (2 ** attempt) + random.uniform(0, 0.2)`): retrying at `1s`, `2s`, `4s` plus small random jitter prevents hundreds of failing clients from slamming the server in synchronized waves. Equally important, **always set an explicit request timeout** (`timeout=15.0`) on every HTTP client call—without a timeout, a stalled remote socket can hang a backend worker thread indefinitely.',
        'Meanwhile, inside `pytest`, reusable setup states live inside `@pytest.fixture` functions (such as `sample_rag_docs`), exception assertions use `with pytest.raises(ValueError):`, and `@pytest.mark.parametrize` runs one test function cleanly across ten boundary inputs (`""`, `None`, `"ok"`, very long text) without copy-pasting test functions. When a test verifies external API wrappers, dependency injection or `monkeypatch` replaces the HTTP transport with deterministic fake responses so tests execute cleanly offline.',
        'Finally, when reading a teammate\'s unfamiliar pull request or repository, use your editor\'s **Go to Definition** shortcut and trace **one single happy-path request end-to-end** from entrypoint (`app.py`) down to the response dictionary, sketching input/output shapes on paper rather than memorizing helper files out of order.',
        'Two final REST habits protect production budgets: **idempotency** and **pagination**. When retrying timed-out `POST` calls that trigger side effects (billing charges, sending emails, creating tickets), attach an `Idempotency-Key` header so the remote server safely deduplicates duplicate network retries rather than charging twice. When calling list endpoints (`GET /v1/documents?limit=100&cursor=...`), inspect pagination fields (`next_cursor` or `has_more`) inside a bounded `while` loop—otherwise your ingestion pipeline silently reads only page 1 and drops 90% of company knowledge!',
        'Pair clean API loops with deliberate **`logging` levels**: reserve `DEBUG` for noisy per-token diagnostics disabled in production, `INFO` for high-level lifecycle milestones (`"Indexed 250 chunks in 1.4s"`), `WARNING` for recoverable hiccups like an HTTP `429` retry, and `ERROR` exclusively when an operation actually fails or alerts need human attention.',
        'On your local terminal, running `pytest -v -k retry` runs only tests matching `"retry"` in seconds while printing verbose assertion diffs—letting you iterate rapidly on edge cases without executing an entire slow suite after every edit.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Forgetting `await` on an `async def` call:** Calling `res = mock_fetch_score("a")` without `await` gives `<coroutine object ...>` instead of a `dict`, followed later by `TypeError: \'coroutine\' object is not subscriptable` AND a `RuntimeWarning: coroutine was never awaited`. Always `await` coroutines!',
        '**Mistake 2 — Calling blocking `time.sleep(2)` inside `async def`:** Synchronous `time.sleep` freezes the entire event loop so zero other concurrent tasks progress. Always use `await asyncio.sleep(...)` and async HTTP clients (`httpx.AsyncClient`) inside `async def`.',
        '**Mistake 3 — Retrying HTTP `400` or `401` errors in a loop:** Retrying bad credentials (`401`) or malformed JSON (`400`) five times wastes quota and triggers account blocks. Only retry transient statuses (`429` Too Many Requests and `500`/`502`/`503` Server Errors).',
        '**Mistake 4 — Testing only the "happy path":** A test suite checking only `["valid"]` passes while production crashes on `[]`, `None`, or missing dict keys. Include at least one boundary test (`empty`, `zero`, or `bad input`) per function.',
        '**Mistake 5 — Leaving bare `print("HERE 123")` debug lines in PRs:** Use `logger.debug(...)` / `logger.info(...)` cleanly so log verbosity can be adjusted by environment config without editing code.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Unit-test contracts (`pytest`):** Structure tests as Arrange -> Act -> Assert, testing edge cases and mocked failures.',
        '2. **Log with levels (`logging`):** Replace ad-hoc `print` clutter with structured `INFO`/`WARNING`/`ERROR` logs.',
        '3. **Inspect HTTP status semantics:** Handle `200` data extraction, fail fast on `400`/`401`, and back off/retry only on transient `429`/`5xx`.',
        '4. **Use `async`/`await` for I/O concurrency:** Combine `asyncio.gather` for parallel network waits, never blocking `time.sleep` inside coroutines.',
        '5. **Read unfamiliar repos top-down:** Start at `README.md` -> entrypoint -> data schemas -> `tests/` before diving into internals.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-3-1',
      difficulty: 'guided',
      requires: ['python-http-rest', 'python-pytest'],
      title: 'Lab 1.3.1 (Guided): HTTP Status Router & Retry Classifier',
      prompt:
        'Implement `classify_http_outcome(status_code)` returning exact action strings: `"ok"` for `200 <= status_code < 300`, `"retry"` for `status_code in (429, 500, 502, 503, 504)`, `"auth_error"` for `status_code in (401, 403)`, and `"fatal_client_error"` for all other `4xx` codes (e.g. `400`, `404`, `422`).',
      starterCode: `def classify_http_outcome(status_code: int) -> str:
    # Return "ok", "retry", "auth_error", or "fatal_client_error"
    pass

print(classify_http_outcome(200), classify_http_outcome(429), classify_http_outcome(401))`,
      testCode: `assert classify_http_outcome(200) == "ok"
assert classify_http_outcome(201) == "ok"
assert classify_http_outcome(429) == "retry"
assert classify_http_outcome(503) == "retry"
assert classify_http_outcome(401) == "auth_error"
assert classify_http_outcome(403) == "auth_error"
assert classify_http_outcome(400) == "fatal_client_error"
assert classify_http_outcome(422) == "fatal_client_error"
print("PASS: Lab 1.3.1 HTTP status classifier passed!")`,
      solutionCode: `def classify_http_outcome(status_code: int) -> str:
    if 200 <= status_code < 300:
        return "ok"
    if status_code in (429, 500, 502, 503, 504):
        return "retry"
    if status_code in (401, 403):
        return "auth_error"
    return "fatal_client_error"`,
      hint: 'Check ranges/sets with `if 200 <= status_code < 300:`, `status_code in (429, 500, 502, 503, 504)`, and `(401, 403)`.',
      hints: [
        'Handle success `200 <= status_code < 300` first.',
        'Return `"retry"` for `429` and server `500/502/503/504`.',
        'Return `"auth_error"` for `401/403`, and `"fatal_client_error"` otherwise.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-3-2',
      difficulty: 'spec',
      requires: ['python-http-rest', 'python-pytest', 'code-reading'],
      title: 'Lab 1.3.2 (From Spec): Mock REST API Fetcher with Retry Logic',
      prompt:
        'Implement `call_with_retry(mock_transport, payload, max_attempts=3)`. `mock_transport(payload)` returns `(status_code, response_dict)`. If `status_code == 200`, return `response_dict`. If `status_code` is retryable (`429` or `500..504`), retry until `max_attempts` total calls are tried, then raise `RuntimeError("max_retries_exceeded")`. For non-retryable codes (`400`, `401`, etc.), raise `RuntimeError("non_retryable")` immediately WITHOUT retrying!',
      starterCode: `def call_with_retry(mock_transport, payload: dict, max_attempts: int = 3) -> dict:
    # Call mock_transport(payload) up to max_attempts times on retryable codes (429, 500-504)
    # Fail immediately with RuntimeError("non_retryable") on 400/401/etc.
    pass`,
      testCode: `attempts_a = 0
def flaky_ok(p):
    global attempts_a
    attempts_a += 1
    if attempts_a < 3:
        return (429, {"err": "slow down"})
    return (200, {"answer": p["q"].upper()})

assert call_with_retry(flaky_ok, {"q": "hi"}, max_attempts=3) == {"answer": "HI"}
assert attempts_a == 3

attempts_b = 0
def bad_auth(_p):
    global attempts_b
    attempts_b += 1
    return (401, {"err": "bad key"})

try:
    call_with_retry(bad_auth, {"q": "hi"}, max_attempts=3)
    assert False, "Should raise on 401"
except RuntimeError as e:
    assert "non_retryable" in str(e)
assert attempts_b == 1, f"401 must NOT retry! Got {attempts_b} calls"

def always_503(_p):
    return (503, {})
try:
    call_with_retry(always_503, {"q": "hi"}, max_attempts=2)
    assert False, "Should raise max_retries_exceeded"
except RuntimeError as e:
    assert "max_retries_exceeded" in str(e)
print("PASS: Lab 1.3.2 Mock REST retry client passed!")`,
      solutionCode: `def call_with_retry(mock_transport, payload: dict, max_attempts: int = 3) -> dict:
    for _attempt in range(max_attempts):
        status, body = mock_transport(payload)
        if status == 200:
            return body
        if status in (429, 500, 502, 503, 504):
            continue
        raise RuntimeError(f"non_retryable: {status}")
    raise RuntimeError("max_retries_exceeded")`,
      hint: 'Loop `for _ in range(max_attempts):`: unpack `status, body = mock_transport(payload)`, return `body` on `200`, `continue` on `(429, 500, 502, 503, 504)`, else raise `non_retryable`. Raise `max_retries_exceeded` after the loop.',
      hints: [
        'Keep `for _attempt in range(max_attempts):` so total calls never exceed `max_attempts`.',
        'Immediately `raise RuntimeError("non_retryable")` on `400`/`401` so bad requests stop on attempt 1.',
        'Put `raise RuntimeError("max_retries_exceeded")` right after the loop ends.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-3-3',
      difficulty: 'debug',
      requires: ['python-async'],
      title: 'Lab 1.3.3 (Debug Buggy Code): Fix Missing `await` & Coroutine Gather Bug',
      prompt:
        'A broken async helper tries to fetch scores for a list of prompts concurrently. Right now: 1) `tasks` stores coroutine objects properly, EXCEPT `gather_scores` forgets `await` before `asyncio.gather(*tasks)` and returns a coroutine/broken output! 2) `run_all` fails to wrap `tasks` properly. Fix `run_batch(prompts, scorer)` so calling `asyncio.run(run_batch(...))` returns a list of dicts sorted by `prompt`.',
      starterCode: `import asyncio

async def fake_scorer(prompt: str) -> dict:
    await asyncio.sleep(0)
    return {"prompt": prompt, "length": len(prompt)}

async def run_batch(prompts: list[str], scorer) -> list[dict]:
    results = []
    for p in prompts:
        # Bug: calling scorer(p) without await or gather!
        results.append(scorer(p))
    return sorted(results, key=lambda r: r["prompt"])`,
      testCode: `import asyncio

async def run_test():
    out = await run_batch(["zed", "alpha", "mid"], fake_scorer)
    assert out == [
        {"prompt": "alpha", "length": 5},
        {"prompt": "mid", "length": 3},
        {"prompt": "zed", "length": 3},
    ], f"Got {out}"

asyncio.run(run_test())
print("PASS: Lab 1.3.3 Async gather & await bug fixed!")`,
      solutionCode: `import asyncio

async def fake_scorer(prompt: str) -> dict:
    await asyncio.sleep(0)
    return {"prompt": prompt, "length": len(prompt)}

async def run_batch(prompts: list[str], scorer) -> list[dict]:
    results = await asyncio.gather(*(scorer(p) for p in prompts))
    return sorted(results, key=lambda r: r["prompt"])`,
      hint: 'Create tasks `(scorer(p) for p in prompts)`, await `asyncio.gather(*...)`, then sort the returned list of dicts by `r["prompt"]`.',
      hints: [
        'Without `await`, `scorer(p)` returns a coroutine object instead of a dict.',
        'Call `results = await asyncio.gather(*(scorer(p) for p in prompts))` to run them concurrently.',
        'Sort `results` with `sorted(results, key=lambda r: r["prompt"])`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q1-3-1',
      type: 'multiple-choice',
      question: 'Which HTTP error codes should an AI API client retry with exponential backoff versus failing immediately?',
      options: [
        'Retry `400` malformed payloads and `401` invalid keys while failing fast on `429`',
        'Retry all `4xx` and `5xx` responses identically up to 10 times with zero backoff',
        'Retry `429` and `500`/`502`/`503`; fail fast on `400` and `401`',
        'Only retry HTTP `200` and `201` responses when payloads look partially incomplete',
      ],
      correctIndex: 2,
      explanation: '`429` (rate limit) and `5xx` (server errors) are transient and safe to retry with backoff. `400` (bad JSON/schema) and `401` (invalid API key) will keep failing identically, so fail fast.',
    },
    {
      id: 'q1-3-2',
      type: 'spot-bug',
      code: `async def fetch_item(id):
    return {"id": id}

async def main():
    item = fetch_item("x1")
    return item["id"]`,
      question: 'Why does `main()` fail with `TypeError: \'coroutine\' object is not subscriptable`?',
      options: [
        'String literals cannot be passed as parameters into `async def` functions',
        'Dictionaries cannot be serialized or returned directly from async coroutines',
        'Python forbids naming parameters `id` inside asynchronous function blocks',
        '`fetch_item("x1")` omitted `await`, returning an unexecuted coroutine object',
      ],
      correctIndex: 3,
      explanation: 'Calling an `async def` function builds a coroutine object without running its body until `await fetch_item("x1")` executes it.',
    },
    {
      id: 'q1-3-3',
      type: 'multiple-choice',
      question: 'When does `asyncio.gather` deliver large speedups, and when does it NOT?',
      options: [
        'Speeds up parallel I/O waiting (APIs, DBs); little speedup on single-core CPU math',
        'Speeds up heavy NumPy matrix multiplications across multiple CPU/GPU cores automatically',
        'Speeds up synchronous `time.sleep(5)` calls placed inside `async def` helpers',
        'Eliminates underlying TLS network round-trip latency between client and API host',
      ],
      correctIndex: 0,
      explanation: 'Asyncio overlaps idle network waiting on a single event loop. Heavy synchronous CPU math (or blocking `time.sleep`) still occupies the single event-loop thread sequentially.',
    },
    {
      id: 'q1-3-4',
      type: 'multi-select',
      question: 'Which TWO behaviors belong inside clean `pytest` unit tests?',
      options: [
        'Injecting deterministic fake/mock API clients so CI runs offline with zero API keys',
        'Testing boundary inputs (empty lists, zero values, malformed JSON) alongside happy paths',
        'Making live paid GPT calls in every local test commit',
        'Using bare `except: pass` inside tests so failures never block CI',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Reliable `pytest` suites test edge boundaries and mock external network calls so CI runs fast, free, and deterministic.',
    },
    {
      id: 'q1-3-5',
      type: 'predict-output',
      code: `def greet(name):
    return f"hi {name}"

try:
    assert greet("Ada") == "hello Ada"
    print("OK")
except AssertionError:
    print("CAUGHT")`,
      question: 'What does running this block print?',
      options: [
        '`OK` followed by `AssertionError`',
        '`OK` while ignoring the mismatch',
        '`CAUGHT`',
        'Both `OK` and `CAUGHT` in order',
      ],
      correctIndex: 2,
      explanation: '`greet("Ada")` returns `"hi Ada"`, which does not equal `"hello Ada"`, raising `AssertionError` that gets caught cleanly to print `CAUGHT`.',
    },
    {
      id: 'q1-3-6',
      type: 'ordering',
      question: 'Order the best sequence for orienting inside an unfamiliar AI codebase on Day 1:',
      options: [],
      items: [
        'Read README.md and requirements.txt / pyproject.toml',
        'Locate main entrypoints (app.py, cli.py, API routes)',
        'Inspect core data models / @dataclass schemas',
        'Read and run the tests/ directory',
      ],
      correctIndex: 0,
      explanation: 'Start with project purpose and dependencies (`README` + `requirements`), find where execution enters (`app.py`), learn the data contracts (`models`), and inspect executable examples in `tests/`.',
    },
    {
      id: 'q1-3-7',
      type: 'numeric',
      question: 'If 5 API calls each take 400 ms sequentially, approximately how many milliseconds do they take when awaited together via `asyncio.gather` (ignoring tiny overhead)?',
      options: [],
      correctIndex: 0,
      correctNumber: 400,
      tolerance: 50,
      unit: 'ms',
      explanation: 'All 5 network waits overlap concurrently on the event loop, so total wall-clock time approaches the slowest single call (~400 ms) rather than `5 * 400 = 2000` ms.',
    },
    {
      id: 'q1-3-8',
      type: 'multiple-choice',
      question: 'Why do production services prefer `logging.getLogger(__name__)` over `print()`?',
      options: [
        '`print()` raises `BlockingIOError` whenever invoked inside loops over lists',
        '`logging` automatically encrypts all `.env` API tokens stored on local disk',
        '`print()` slows Python arithmetic down substantially even inside comment lines',
        '`logging` adds filterable severity levels (`INFO`/`ERROR`), timestamps, and modules',
      ],
      correctIndex: 3,
      explanation: 'Structured logging enables filtering by severity (`INFO` vs `ERROR`), attaches module origins and timestamps automatically, and routes cleanly to cloud log collectors.',
    },
    {
      id: 'q1-3-9',
      type: 'spot-bug',
      code: `async def check_health():
    time.sleep(2.0)
    return "healthy"`,
      question: 'What is wrong with `time.sleep(2.0)` inside an `async def` FastAPI endpoint?',
      options: [
        '`time.sleep` blocks the whole event loop, stalling every concurrent request for 2s',
        '`time.sleep` immediately throws a compile-time `SyntaxError` inside `async def` bodies',
        '`time.sleep` expects integer milliseconds (`2000`) rather than floating-point seconds',
        'Async coroutine endpoints are forbidden from returning plain string literals directly',
      ],
      correctIndex: 0,
      explanation: 'Synchronous `time.sleep` stalls the whole OS thread running the event loop. Always use `await asyncio.sleep(2.0)` inside `async def` code.',
    },
  ],
};
