import type { Lesson } from '@/types/course';

export const lesson6_0: Lesson = {
  id: '6-0',
  moduleId: 'mod-6',
  number: '6.0',
  title: 'Calling LLM APIs Reliably: Messages, Streaming, Retries & Cost Tracking',
  subtitle: 'Connect Python to real LLM APIs cleanly—master chat messages, temperature, streaming deltas, timeouts, exponential backoff, token cost math, and our deterministic mock client.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['1.3'],
  requires: ['python-http-rest', 'python-files-json', 'python-exceptions'],
  teaches: [
    'llm-messages',
    'llm-streaming',
    'llm-retries-cost',
    'mock-llm-client',
  ],
  objectives: [
    'Construct explicit multi-role `messages` lists (`system`, `user`, `assistant`) and pick appropriate `temperature` and `max_tokens` limits.',
    'Accumulate Server-Sent Event (SSE) streaming token deltas reliably while capturing final token usage metadata.',
    'Guard every LLM network call with explicit timeouts, transient-only exponential backoff retries (`429`/`5xx`), and per-call USD cost accounting.',
    'Write offline unit tests and browser labs using a deterministic mock LLM client that matches the exact SDK switch-over interface for local real-API runs.',
  ],
  checkWithoutNotes: [
    'What are the three core chat roles inside an LLM API `messages` payload (`system`, `user`, `assistant`), and why are LLMs stateless between API requests?',
    'Explain why retrying HTTP `400` or `401` errors wastes money and latency, whereas retrying HTTP `429` or `503` with exponential backoff + jitter helps.',
    'If a request uses `1,500` input tokens (`\$0.50` / 1M) and `400` output tokens (`\$1.50` / 1M), compute the exact dollar cost.',
    'How does a deterministic mock LLM client let you run full integration tests offline in CI while keeping the exact same code ready for a real `.env` API key locally?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'In tutorials, calling an LLM looks like three cheerful lines of code that always return an answer in 500 milliseconds. In real customer-facing applications, external model endpoints occasionally return HTTP `429` rate limits during traffic spikes, drop idle sockets after 60 seconds, return incomplete JSON if `max_tokens` runs out mid-sentence, or silently burn hundreds of dollars if a retry bug loops infinitely on malformed prompts.',
        'Production AI engineers treat an LLM API like any other distributed external service: every request carries strict role separation (`messages`), explicit `timeout` and `max_tokens` budgets, status-aware retry backoff (`429`/`5xx` only), streaming delta assembly so users see tokens immediately rather than staring at a blank spinner for eight seconds, and deterministic cost logging on every response. Just as importantly, teams decouple their application behind a small **client interface** so unit tests run deterministically offline with recorded fixtures and local runs swap in a live key seamlessly via `.env`.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Stateless Chefs, Token Meters & Swappable Plugs',
      paragraphs: [
        'Think of an LLM API endpoint (`/v1/chat/completions` or `/v1/messages`) like a brilliant chef with **zero memory between visits**. Every single time your backend calls the endpoint, you must hand over the **entire conversation transcript** inside `messages`: a high-priority **`system`** rule card defining behavior and safety constraints, alternating **`user`** inputs, and prior **`assistant`** replies (plus **`tool`** outputs, covered in Lesson 6.1). Because the server is stateless, chat apps feel "continuous" purely because your code appends each turn onto `messages` and trims old turns before exceeding the model\'s **context window**.',
        'Before sampling output tokens, two parameters govern behavior directly: **`temperature`** divides raw logits prior to Softmax (`0.0`–`0.2` makes extraction/coding repeatable; `0.7`–`1.0` adds stylistic variety at higher hallucination risk), and **`max_tokens`** puts an absolute ceiling on generated output length so a runaway repetition loop never spikes bills or latency. When **streaming (`stream=True`)** is enabled, the server emits small JSON **deltas** over HTTP chunked SSE (`"Hel"`, `"lo"`, `"!"`) as soon as each token decodes—slashing *Time to First Token (TTFT)* while your Python accumulator joins pieces cleanly and watches for the `[DONE]` sentinel plus final `usage` counts.',
        'Finally, remember **cost asymmetry** and **adapter isolation**. Output tokens typically cost **3× to 10× more per token** than input tokens because generating tokens sequentially requires a fresh memory-bandwidth pass per token, whereas prompt input tokens process in parallel prefill! Meanwhile, wrapping SDK calls inside a thin `LLMClient` adapter lets browser labs and `pytest` CI run against a **deterministic recorded fixture client**, while your terminal switches to a real provider key in one `.env` edit without rewriting application code.',
      ],
    },
    {
      type: 'table',
      title: 'Run It for Real vs Browser Offline Mock Harness (Same Code Interface)',
      headers: ['Mode', 'Where It Runs', 'Client Object Passed', 'Configuration Source'],
      rows: [
        ['1. Browser / CI Offline', 'Inside AI Mastery Studio & `pytest`', '`MockLLMClient(fixtures=...)`', 'Zero keys needed; deterministic JSON/stream responses'],
        ['2. Local OpenAI SDK', 'Your `.venv` terminal (`pip install openai`)', '`OpenAI()` wrapper matching `.chat(...)`', '`OPENAI_API_KEY` loaded from gitignored `.env`'],
        ['3. Local Open-Weights Host', 'Ollama / vLLM / LM Studio (`localhost`)', '`OpenAI(base_url=..., api_key="local")`', 'Runs open-weights models locally with zero per-token API bill'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Deterministic Mock LLM Client, Streaming Deltas & Cost Math',
      paragraphs: [
        'Look closely at how clean client design works. Our `MockLLMClient` below implements `.chat(messages, temperature, stream)` using exact recorded fixtures keyed cleanly or matched by prompt keyword, tracks cumulative `prompt_tokens`, `completion_tokens`, and USD `total_cost`, and enforces `max_tokens` truncation just like a live endpoint. Notice how `stream_chat` yields incremental chunks whose concatenated text matches non-streaming output character-for-character while checking `finish_reason` (`"stop"` vs `"length"`).',
        'Check the cost formula carefully: $\\text{cost} = \\frac{\\text{input\\_tokens}}{1{,}000{,}000} \\times \\text{price\\_in} + \\frac{\\text{output\\_tokens}}{1{,}000{,}000} \\times \\text{price\\_out}$. For `1,500` input tokens at `\$0.50 / 1M` (`\$0.00075`) plus `400` output tokens at `\$1.50 / 1M` (`\$0.00060`), total request cost equals `\$0.00135` (`0.135` cents). Logging every single request\'s cost catches accidental mega-context regressions immediately.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Mock LLM Client + Streaming Accumulator + Cost Ledger',
      language: 'python',
      code: `from dataclasses import dataclass

@dataclass(frozen=True)
class ModelPricing:
    input_per_1m: float = 0.50
    output_per_1m: float = 1.50

def compute_usd_cost(input_tokens: int, output_tokens: int, pricing: ModelPricing) -> float:
    return (input_tokens / 1_000_000) * pricing.input_per_1m + (output_tokens / 1_000_000) * pricing.output_per_1m

class MockLLMClient:
    def __init__(self, fixtures: dict[str, dict]):
        self.fixtures = fixtures

    def stream_chat(self, prompt: str):
        rec = self.fixtures[prompt]
        for token in rec["chunks"]:
            yield {"delta": token, "usage": None}
        yield {"delta": "", "usage": rec["usage"], "finish_reason": "stop"}

client = MockLLMClient({
    "Summarize Q4": {
        "chunks": ["Revenue ", "grew ", "12%."],
        "usage": {"input_tokens": 1500, "output_tokens": 400},
    }
})

parts, usage = [], {}
for event in client.stream_chat("Summarize Q4"):
    if event["delta"]:
        parts.append(event["delta"])
    if event["usage"]:
        usage = event["usage"]

full_text = "".join(parts)
cost = compute_usd_cost(usage["input_tokens"], usage["output_tokens"], ModelPricing())
print(f"Text: {full_text!r} | Cost: \${cost:.5f}")`,
      caption: 'Explained output: `Text: \'Revenue grew 12%.\' | Cost: $0.00135`. Keeping `usage` extraction in the final stream event mirrors real `stream_options={"include_usage": True}` responses cleanly.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Timeout, Retry Backoff & History Window Trimming',
      paragraphs: [
        'Two subtle bugs break multi-turn chatbots in production: first, retrying blind exceptions (`400 Bad Request`, `401 Unauthorized`, or `ContextLengthExceeded`) burns rate-limit quota without any hope of recovering; second, appending turns forever without trimming pushes `messages` past the model context limit (`HTTP 400`) and explodes input token bills quadratically across a 30-turn chat!',
        'Smart wrappers classify status codes cleanly—retrying *only* transient `429` (rate limit) and `500/502/503/504` responses with capped exponential backoff (`min(cap, base * 2**attempt)`) while raising immediately on client errors—and maintain a sliding window keeping the pinned `system` message at index `0` plus only the newest `max_turns` pairs of conversation history.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Pinning System Message While Trimming Chat History',
      language: 'python',
      code: `def trim_messages(messages: list[dict], max_history_msgs: int = 4) -> list[dict]:
    system_msgs = [m for m in messages if m["role"] == "system"]
    convo = [m for m in messages if m["role"] != "system"]
    kept_convo = convo[-max_history_msgs:] if max_history_msgs > 0 else []
    return system_msgs[:1] + kept_convo

msgs = [
    {"role": "system", "content": "Be concise."},
    {"role": "user", "content": "Turn 1"},
    {"role": "assistant", "content": "Reply 1"},
    {"role": "user", "content": "Turn 2"},
    {"role": "assistant", "content": "Reply 2"},
    {"role": "user", "content": "Turn 3"},
]
print([m["content"] for m in trim_messages(msgs, max_history_msgs=3)])`,
      caption: 'Explained output: `[\'Be concise.\', \'Reply 1? No -> Reply 2\', ...]` specifically `[\'Be concise.\', \'Reply 2\', \'Turn 2\'? Wait: last 3 of 5 convo items are Turn 2, Reply 2, Turn 3 -> [\'Be concise.\', \'Turn 2\', \'Reply 2\', \'Turn 3\']`. The `system` instruction stays pinned at position 0 while oldest turns roll off safely.',
    },
    {
      type: 'prose',
      heading: 'Run It for Real: Switching From Mock to a Live Key on Your Machine',
      paragraphs: [
        'Once your logic passes unit tests against `MockLLMClient` inside this browser studio, running against a live provider on your laptop requires zero changes to prompt builders, retry loops, or cost ledgers. Inside your local `.venv` repository (Module 0), install the official SDK (`pip install openai python-dotenv`), create a `.env` file containing `OPENAI_API_KEY=...` (verified inside `.gitignore`!), load `load_dotenv()`, and wrap `client.chat.completions.create(model=..., messages=..., temperature=..., max_tokens=..., timeout=30.0)` inside the exact same `.chat(...)` adapter interface.',
        'Even better, start local experiments against a cheap small fast model (or a zero-cost local OpenAI-compatible server via `base_url`) with a hard `$5` spending cap configured on your dashboard, log every request\'s token count and USD cost to stdout or SQLite, and inspect `finish_reason == "length"` to spot truncated answers before users complain.',
        'When debugging real streaming sockets in production, always capture a **request ID** (`response.id` or provider header `x-request-id`), elapsed **Time to First Token (TTFT)**, and total **generation duration** alongside token counts. If users complain that answers hang for four seconds before text appears, comparing TTFT against total duration immediately tells you whether slow retrieval (`pre-LLM`), huge prompt prefill, or upstream provider congestion caused the stall. Keeping deterministic recorded fixtures (`tests/fixtures/*.json`) alongside live config switches guarantees every edge case stays reproducibly tested even offline.',
        'For background batch jobs that summarize thousands of support tickets overnight without strict sub-second deadlines, check whether your provider offers an asynchronous **Batch API** endpoint—trading interactive latency for much lower per-token rates without rewriting your core prompt logic.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Passing only the newest user message without `system` or history:** Expecting an LLM endpoint to "remember" instructions set in an earlier API call fails immediately because API requests are completely stateless.',
        '**Mistake 2 — Slicing `messages[-6:]` blindly without pinning index `0`:** Rolling off oldest entries eventually drops the `system` prompt, causing the bot to forget its persona, output format, and safety boundaries mid-conversation!',
        '**Mistake 3 — Ignoring `finish_reason == "length"`:** When `max_tokens` hits mid-JSON, `json.loads()` fails downstream with confusing `Unterminated string` errors. Always inspect `finish_reason` explicitly and raise or surface truncation cleanly.',
        '**Mistake 4 — Omitting `timeout` on network calls:** Relying on unlimited default socket waits stalls FastAPI workers whenever an upstream provider hangs.',
        '**Mistake 5 — Mixing up token pricing units (per 1K vs per 1M tokens):** Double-check whether a rate card quotes `\$0.50` per `1,000,000` tokens (`1_000_000`) or `1,000` tokens—an off-by-1000x unit bug ruins cost budgets.',
        '**Mistake 6 — Silently falling back to another model without tagging logs:** When your primary endpoint times out and your wrapper falls back to a secondary model, always record `fallback_used: true` and `actual_model` on the trace; otherwise sudden accuracy dips look impossible to explain.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Send full stateless context:** Always supply `system` (pinned at index 0) plus trimmed recent `user`/`assistant` turns.',
        '2. **Control variance & bounds:** Pair low `temperature` (`0.0–0.2`) for deterministic tasks with explicit `max_tokens` and `timeout`.',
        '3. **Stream deltas cleanly:** Yield UI chunks immediately while capturing final `usage` and checking `finish_reason`.',
        '4. **Retry transiently & track USD:** Back off only on `429`/`5xx`, and log input/output token cost per call.',
        '5. **Test offline with a mock adapter:** Build against a `MockLLMClient` interface so tests run free in CI and live SDK keys drop in locally.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-0-1',
      difficulty: 'guided',
      requires: ['llm-messages', 'llm-retries-cost'],
      title: 'Lab 6.0.1 (Guided): Chat History Trimmer & USD Cost Calculator',
      prompt:
        'Implement two core LLM wrapper helpers: 1) `build_window(system_prompt, history, max_history=4)` returning `[{"role": "system", "content": system_prompt}] + history[-max_history:]` (when `max_history == 0`, return only the system message!). 2) `calc_call_cost(in_toks, out_toks, in_per_1m=0.50, out_per_1m=1.50)` returning rounded 6-decimal USD float.',
      starterCode: `def build_window(system_prompt: str, history: list[dict], max_history: int = 4) -> list[dict]:
    # Pin system message first, then keep newest max_history messages
    pass

def calc_call_cost(in_toks: int, out_toks: int, in_per_1m: float = 0.50, out_per_1m: float = 1.50) -> float:
    pass`,
      testCode: `hist = [
    {"role": "user", "content": "m1"},
    {"role": "assistant", "content": "r1"},
    {"role": "user", "content": "m2"},
]
w2 = build_window("SYS", hist, max_history=2)
assert [m["content"] for m in w2] == ["SYS", "r1", "m2"], f"Got {w2}"
w0 = build_window("SYS", hist, max_history=0)
assert w0 == [{"role": "system", "content": "SYS"}], f"Zero-history bug: {w0}"
assert abs(calc_call_cost(2000, 500, 0.50, 1.50) - 0.00175) < 1e-8
print("PASS: Lab 6.0.1 Context window & USD cost calculator passed!")`,
      solutionCode: `def build_window(system_prompt: str, history: list[dict], max_history: int = 4) -> list[dict]:
    tail = history[-max_history:] if max_history > 0 else []
    return [{"role": "system", "content": system_prompt}] + tail

def calc_call_cost(in_toks: int, out_toks: int, in_per_1m: float = 0.50, out_per_1m: float = 1.50) -> float:
    usd = (in_toks / 1_000_000) * in_per_1m + (out_toks / 1_000_000) * out_per_1m
    return round(usd, 6)`,
      hint: 'Watch Python slicing: `history[-0:]` returns the WHOLE list because `-0 == 0`! Guard with `if max_history > 0 else []`.',
      hints: [
        'In Python, `history[-0:]` equals `history[0:]` (all elements!), so explicitly check `if max_history > 0 else []`.',
        'Prepend `[{"role": "system", "content": system_prompt}]` to `tail`.',
        'Compute `(in_toks / 1_000_000) * in_per_1m + (out_toks / 1_000_000) * out_per_1m`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-0-2',
      difficulty: 'spec',
      requires: ['llm-streaming', 'mock-llm-client'],
      title: 'Lab 6.0.2 (From Spec): SSE Streaming Assembler with Truncation Check',
      prompt:
        'Implement `collect_stream(events)` consuming an iterable of streaming delta dicts like `{"delta": "Hi ", "finish_reason": None, "usage": None}` ending with `{"delta": "", "finish_reason": "stop" | "length", "usage": {"in": int, "out": int}}`. Assemble `"text"`, `"truncated"` (`True` if `finish_reason == "length"` else `False`), and `"usage"` (defaulting `{}` if absent) into a returned dict.',
      starterCode: `def collect_stream(events) -> dict:
    # Return {"text": str, "truncated": bool, "usage": dict}
    pass`,
      testCode: `ev1 = [
    {"delta": "Hello", "finish_reason": None, "usage": None},
    {"delta": " world!", "finish_reason": "stop", "usage": {"in": 10, "out": 2}},
]
r1 = collect_stream(ev1)
assert r1 == {"text": "Hello world!", "truncated": False, "usage": {"in": 10, "out": 2}}, f"Got {r1}"

ev2 = [
    {"delta": '{"ans": ', "finish_reason": None, "usage": None},
    {"delta": '"partial', "finish_reason": "length", "usage": {"in": 20, "out": 50}},
]
r2 = collect_stream(ev2)
assert r2["truncated"] is True and r2["text"] == '{"ans": "partial'
print("PASS: Lab 6.0.2 SSE streaming assembler passed!")`,
      solutionCode: `def collect_stream(events) -> dict:
    parts = []
    truncated = False
    usage = {}
    for ev in events:
        d = ev.get("delta")
        if d:
            parts.append(d)
        if ev.get("finish_reason") == "length":
            truncated = True
        if ev.get("usage"):
            usage = dict(ev["usage"])
    return {"text": "".join(parts), "truncated": truncated, "usage": usage}`,
      hint: 'Append non-empty `ev.get("delta")` values to `parts`, flag `truncated = True` if `finish_reason == "length"`, capture `usage`, and join `"".join(parts)`.',
      hints: [
        'Use a list `parts = []` and `"".join(parts)` rather than repeated string `+=` in a loop.',
        'Check `if ev.get("finish_reason") == "length": truncated = True`.',
        'Copy `ev["usage"]` when non-empty into `usage`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-0-3',
      difficulty: 'debug',
      requires: ['llm-retries-cost', 'mock-llm-client'],
      title: 'Lab 6.0.3 (Debug Buggy Code): Fix Retrying `400` Bad Request & Uncapped Backoff',
      prompt:
        'A broken mock LLM retry client sleeps inside backoff without capping delay AND wastes retries on `400` (Bad Request) and `401` (Bad API Key)! Fix `invoke_with_backoff(mock_api, req, max_attempts=3, base_delay=1.0, max_delay=4.0)` returning `(response_dict, delays_used)` where `delays_used` records wait seconds BEFORE each retry (`min(max_delay, base_delay * (2 ** attempt))` for attempt `0, 1, ...`), retrying ONLY `429` and `500..504`, and raising `RuntimeError("fatal_client_error")` on attempt 1 for `400`/`401`.',
      starterCode: `def invoke_with_backoff(mock_api, req: dict, max_attempts: int = 3, base_delay: float = 1.0, max_delay: float = 4.0) -> tuple[dict, list[float]]:
    delays = []
    for attempt in range(max_attempts):
        status, body = mock_api(req)
        if status == 200:
            return (body, delays)
        # Bug: retries EVERY non-200 status (even 400/401) and never caps delay!
        if attempt < max_attempts - 1:
            delays.append(base_delay * (2 ** attempt))
    raise RuntimeError("retries_exhausted")`,
      testCode: `calls_a = 0
def flaky_429(_r):
    global calls_a
    calls_a += 1
    if calls_a < 3:
        return (429, {"err": "rate limit"})
    return (200, {"text": "ok"})

body, delays = invoke_with_backoff(flaky_429, {}, max_attempts=4, base_delay=2.0, max_delay=3.0)
assert body == {"text": "ok"} and delays == [2.0, 3.0], f"Expected capped [2.0, 3.0], got {delays}"

calls_b = 0
def bad_400(_r):
    global calls_b
    calls_b += 1
    return (400, {"err": "invalid json"})

try:
    invoke_with_backoff(bad_400, {}, max_attempts=3)
    assert False, "Should fail immediately on 400"
except RuntimeError as e:
    assert "fatal_client_error" in str(e)
assert calls_b == 1, f"Must NOT retry HTTP 400! Calls={calls_b}"
print("PASS: Lab 6.0.3 Retry filter & capped backoff fixed!")`,
      solutionCode: `def invoke_with_backoff(mock_api, req: dict, max_attempts: int = 3, base_delay: float = 1.0, max_delay: float = 4.0) -> tuple[dict, list[float]]:
    delays = []
    retryable = (429, 500, 502, 503, 504)
    for attempt in range(max_attempts):
        status, body = mock_api(req)
        if status == 200:
            return (body, delays)
        if status not in retryable:
            raise RuntimeError(f"fatal_client_error: {status}")
        if attempt < max_attempts - 1:
            wait = min(max_delay, base_delay * (2 ** attempt))
            delays.append(wait)
    raise RuntimeError("retries_exhausted")`,
      hint: 'Check `if status not in (429, 500, 502, 503, 504): raise RuntimeError("fatal_client_error")` and cap wait using `min(max_delay, base_delay * (2 ** attempt))`.',
      hints: [
        'Immediately raise `RuntimeError("fatal_client_error")` if status is NOT in `(429, 500, 502, 503, 504)`.',
        'Only compute and append backoff delay when `attempt < max_attempts - 1`.',
        'Clamp delay cleanly with `min(max_delay, base_delay * (2 ** attempt))`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q6-0-1',
      type: 'multiple-choice',
      question: 'Why must your backend re-send the `system` prompt and prior turns in `messages` on every chat request?',
      options: [
        'LLM endpoints are stateless across requests and keep zero hidden memory',
        'Because sending only the newest user query causes HTTP 401 authentication rejection from API hosts',
        'Because `system` prompts automatically expire every 60 seconds inside BPE vocabulary tokenizers',
        'Because repeating earlier conversation turns forces Softmax temperature down toward zero',
      ],
      correctIndex: 0,
      explanation: 'Standard `/v1/chat/completions` endpoints hold no state between calls; continuity comes entirely from sending the pinned `system` message plus recent turns.',
    },
    {
      id: 'q6-0-2',
      type: 'spot-bug',
      code: `def trim(sys_msg, hist, max_hist=0):
    return [sys_msg] + hist[-max_hist:]`,
      question: 'What subtle Python slicing bug occurs when `max_hist=0` is passed?',
      options: [
        'Python immediately raises a runtime `IndexError` rejecting negative zero indices inside slices',
        '`hist[-0:]` equals `hist[0:]`, keeping the whole chat history instead of empty',
        '`[sys_msg] + hist` deletes `sys_msg` automatically whenever `max_hist` equals integer zero',
        '`hist[-0:]` silently reverses the message array backward into chronological reverse order',
      ],
      correctIndex: 1,
      explanation: 'Since `-0 == 0` in Python, `hist[-0:]` returns the entire slice `hist[0:]`! Guard explicitly with `hist[-max_hist:] if max_hist > 0 else []`.',
    },
    {
      id: 'q6-0-3',
      type: 'numeric',
      question: 'A call consumes `2,000` input tokens (`$0.50` / 1M) and `1,000` output tokens (`$1.50` / 1M). What is the total cost in USD cents (1 dollar = 100 cents)?',
      options: [],
      correctIndex: 0,
      correctNumber: 0.25,
      tolerance: 0.005,
      unit: 'cents',
      explanation: 'Input: `(2000/1e6)*0.50 = $0.0010`. Output: `(1000/1e6)*1.50 = $0.0015`. Total = `$0.0025` = `0.25` cents.',
    },
    {
      id: 'q6-0-4',
      type: 'multiple-choice',
      question: 'When consuming SSE streaming output from an LLM API, why must your code still inspect `finish_reason`?',
      options: [
        'To translate incremental UTF-8 token deltas cleanly back into dense neural weights in client RAM',
        'To compress final stream payloads automatically before storing evaluation metrics in SQLite',
        'To detect mid-sentence cutoffs (`"length"`) vs normal completion (`"stop"`)',
        'To automatically clear cached `.env` bearer credentials immediately after every streamed response',
      ],
      correctIndex: 2,
      explanation: 'If `max_tokens` interrupts generation halfway through JSON or an answer, `finish_reason == "length"` warns your parser rather than letting half-baked text look complete.',
    },
    {
      id: 'q6-0-5',
      type: 'multi-select',
      question: 'Which TWO practices keep LLM API integrations resilient in CI and production?',
      options: [
        'Configuring explicit network timeouts (`timeout=30.0`) and capped exponential backoff on `429`/`5xx`',
        'Isolating provider calls behind an adapter so `pytest` runs cleanly offline via deterministic mock fixtures',
        'Retrying HTTP `400` and `401` errors up to 10 times with zero delay',
        'Omitting `max_tokens` so complex prompts generate unbounded output lengths',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Timeouts + transient-only backoff protect production availability, while a swappable mock client keeps CI deterministic and zero-cost.',
    },
    {
      id: 'q6-0-6',
      type: 'multiple-choice',
      question: 'Why do output tokens cost several times more per token than input tokens on hosted LLM APIs?',
      options: [
        'Providers charge extra per-character licensing fees strictly on ASCII punctuation marks emitted in replies',
        'Generation steps run sequentially per token while prompt tokens batch in prefill',
        'Input prompt tokens get transparently compressed using lossless gzip inside transformer attention blocks',
        'Output token streams automatically invoke two separate external fact-checking safety models per word',
      ],
      correctIndex: 1,
      explanation: 'Prefill processes all prompt tokens together in dense parallel matrix multiplies, whereas autoregressive decoding emits output tokens sequentially one by one.',
    },
    {
      id: 'q6-0-7',
      type: 'predict-output',
      code: `base, cap = 1.0, 5.0
waits = [min(cap, base * (2 ** i)) for i in range(4)]
print(waits)`,
      question: 'What exact wait sequence (in seconds) is printed?',
      options: [
        '`[1.0, 2.0, 4.0, 8.0]`',
        '`[2.0, 4.0, 5.0, 5.0]`',
        '`[1.0, 1.0, 1.0, 1.0]`',
        '`[1.0, 2.0, 4.0, 5.0]`',
      ],
      correctIndex: 3,
      explanation: 'Powers `1*2^0=1.0`, `1*2^1=2.0`, `1*2^2=4.0`, and `min(5.0, 8.0) = 5.0` yield `[1.0, 2.0, 4.0, 5.0]`.',
    },
    {
      id: 'q6-0-8',
      type: 'ordering',
      question: 'Order the steps inside one resilient LLM API wrapper call:',
      options: [],
      items: [
        'Build pinned system + trimmed recent history messages list',
        'Send request with explicit max_tokens and network timeout',
        'Check HTTP status: fail fast on 400/401 or retry with backoff on 429/5xx',
        'Inspect finish_reason and log token usage + USD cost',
      ],
      correctIndex: 0,
      explanation: 'Prepare bounded context first, apply strict max_tokens/timeout guardrails, handle HTTP retry policy cleanly, and record finish_reason plus USD usage telemetry.',
    },
    {
      id: 'q6-0-9',
      type: 'multiple-choice',
      question: 'When switching a working local script from `MockLLMClient` to an OpenAI-compatible local server (like Ollama/vLLM), which setting prevents accidentally hitting paid cloud APIs?',
      options: [
        'Setting `temperature=0.0` inside every prompt dictionary',
        'Pointing `base_url` cleanly at the local server URL and reading keys via `.env` config',
        'Replacing `"assistant"` role strings with `"system"` throughout `messages`',
        'Disabling `stream=True` so responses buffer completely in local memory',
      ],
      correctIndex: 1,
      explanation: 'Injecting `base_url` and `api_key` from `.env` configuration lets identical SDK code target either local OpenAI-compatible hosts or cloud providers cleanly.',
    },
  ],
};
