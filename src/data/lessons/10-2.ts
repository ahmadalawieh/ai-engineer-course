import type { Lesson } from '@/types/course';

export const lesson10_2: Lesson = {
  id: '10-2',
  moduleId: 'mod-10',
  number: '10.2',
  title: 'Tool Calling in Depth: Parallel Calls, Repair Loops & Error Contracts',
  subtitle: 'Engineer production tool execution runtimes with strict schemas, parallel fan-out, informative non-leaky errors, idempotency, and automated argument repair.',
  durationMinutes: 80,
  track: 'ai-eng',
  prerequisites: ['6.1', '9.3'],
  requires: ['llm-retries-cost', 'owasp-llm-security'],
  teaches: ['parallel-tool-calling', 'tool-error-contracts', 'structured-repair-loop'],
  competencies: ['jr-llm-client', 'mid-agents-guardrails'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Design unambiguous tool schemas using strict field descriptions, enums, bounds, and `additionalProperties: false`.',
    'Execute independent tool calls concurrently (parallel fan-out) while preserving sequential order for dependent steps.',
    'Return structured tool error contracts (`ok`, `retryable`, `hint`) so the model recovers gracefully instead of hallucinating or crashing.',
    'Enforce idempotency keys and argument repair loops so transient validation mistakes never double-charge or double-write.',
  ],
  checkWithoutNotes: [
    'Why does returning a raw Python stack trace from a tool call hurt both security and model recovery rate?',
    'What three fields belong in an actionable tool error contract when validation fails?',
    'When is parallel tool execution safe versus dangerous?',
    'How does an idempotency key prevent duplicate side effects when an agent retries a write tool after a network timeout?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Tool Calling Fails in Production Beyond Hello World',
      paragraphs: [
        'In tutorials, tool calling looks simple: pass one function schema and watch an LLM call `get_weather("Cairo")`. In real SaaS backends, tool execution breaks constantly because models omit required fields, invent non-existent enum values, trigger duplicate writes after HTTP timeouts, or spin in circles when tools crash with cryptic stack traces.',
        'Production AI engineers treat every tool interface like a public microservice API contract consumed by an untrusted caller. The model proposes arguments; deterministic backend code validates bounds, authorizes caller permissions, executes safely, and returns clean machine-readable feedback.',
        'The mental model is an experienced restaurant order-taker talking to the kitchen expediter. If a waiter writes "steak temp: kinda warmish", the kitchen should neither throw a database traceback onto the dining table nor cook two steaks blindly—it sends back a clear slip: "Invalid temp; choose RARE, MEDIUM, or WELL."',
        'Mastering parallel tool fan-out, repair loops, idempotency, and structured error contracts lifts tool-use completion reliability dramatically on complex multi-step tickets.',
      ],
    },
    {
      type: 'prose',
      heading: 'Schema Design & Bounded Argument Repair Loops',
      paragraphs: [
        'Always anchor tool parameters with tight JSON Schema constraints: set `additionalProperties: false`, narrow strings to explicit `enum` values where finite options exist, add explicit min/max numeric constraints, and document expected units directly inside field descriptions (for example `amount_usd` rather than ambiguous `amount`).',
        'Even with grammar-constrained decoding enabled, semantic errors still happen: a model might supply a future date on an invoice lookup or an `order_id` formatted without its prefix. Instead of crashing immediately or silently defaulting, catch validation errors inside a bounded repair loop (usually maximum 2 retries).',
        'Feed the exact short field-level validation message back as the tool observation so the model repairs just the offending argument without discarding conversation state.',
      ],
    },
    {
      type: 'prose',
      heading: 'Parallel Tool Fan-Out & Idempotent Write Safety',
      paragraphs: [
        'Modern tool-calling models can emit multiple `tool_calls` in a single assistant turn—for example fetching order status, shipping carrier tracking, and return policy simultaneously. Executing independent read-only tools concurrently cuts multi-tool wall-clock latency from `3 * 250ms = 750ms` down to `~260ms`.',
        'Never parallelize dependent writes or steps where step 2 relies on output from step 1. Worse, if an external billing or ticket-creation tool times out after the server already processed it, an automatic retry can create duplicate invoices or duplicate refunds.',
        'Require an explicit `idempotency_key` (derived cleanly from `(ticket_id, action, step_hash)`) on every mutating tool call so duplicate retries safely return the original stored execution receipt instead of repeating the side effect.',
      ],
    },
    {
      type: 'code',
      title: 'Structured Tool Error Contract & Idempotent Dispatch',
      language: 'python',
      code: `def run_tool_safely(tool_name: str, args: dict, seen_receipts: dict, idempotency_key: str | None = None) -> dict:
    if idempotency_key and idempotency_key in seen_receipts:
        return {"ok": True, "replayed": True, "data": seen_receipts[idempotency_key]}
    try:
        # Execute bounded validator + logic
        result = {"status": "ok", "tool": tool_name, "args": args}
        if idempotency_key:
            seen_receipts[idempotency_key] = result
        return {"ok": True, "replayed": False, "data": result}
    except ValueError as exc:
        return {"ok": False, "retryable": True, "error": str(exc), "hint": "Fix invalid parameter and retry."}
    except Exception:
        return {"ok": False, "retryable": False, "error": "upstream_unavailable", "hint": "Escalate or inform user honestly."}`,
      caption: 'Internal stack traces stay strictly in server logs; the LLM sees concise retry hints only.',
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: The Silent Double-Refund Storm',
      paragraphs: [
        'An e-commerce support agent called a billing webhook tool with an aggressive 2-second timeout while upstream payment gateways experienced a brief 3.2-second latency blip. Each timeout raised an exception caught by an unguarded retry loop that re-issued the same refund request three times before giving up.',
        'Forty customers received triple refunds totaling over 11,000 dollars in one afternoon. Adding deterministic `idempotency_key` persistence per `(order_id, step)` plus separating read-only lookups from write tools eliminated duplicate charges permanently.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Tool Error & Execution Strategies',
      headers: ['Pattern', 'Reliability Gain', 'Latency Cost', 'Guardrail Needed'],
      rows: [
        ['Parallel Read Fan-Out', 'High (independent lookups run once)', 'Cuts total wait to slowest single tool', 'Never parallelize sequential writes'],
        ['Bounded Arg Repair Loop', 'Recovers ~70%+ schema/format slips', '+1 fast LLM turn on invalid args only', 'Hard `max_repairs <= 2` cap'],
        ['Actionable Error Contract', 'Guides model self-correction cleanly', 'Zero overhead on happy path', 'Strip internal stack traces and secrets'],
        ['Idempotency Key Store', 'Eliminates duplicate writes on retries', 'Negligible KV lookup (~2ms)', 'Persist key atomically with write result'],
      ],
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'Never Forward Raw Tracebacks to Models',
      body: 'Raw exception tracebacks frequently contain SQL table names, internal hostnames, or environment details—which leak into user chat if the model summarizes the tool error verbatim. Always map exceptions to safe error codes plus brief corrective hints.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-2-repair',
      title: 'Lab 10.2a: Tool Schema Validation & Actionable Error Hint',
      prompt: 'Implement `validate_order_tool(args: dict) -> dict`: require `order_id` starting with `"ORD-"` and numeric `max_items` integer between `1` and `20`, rejecting unexpected keys. On valid input return `{"ok": True, "args": args}`; otherwise return `{"ok": False, "retryable": True, "hint": "<specific error reason>"}`.',
      difficulty: 'guided',
      starterCode: `def validate_order_tool(args: dict) -> dict:
    # Enforce allowed keys {"order_id", "max_items"}, ORD- prefix, and 1 <= max_items <= 20
    return {"ok": False, "retryable": True, "hint": "not implemented"}`,
      testCode: `ok_res = validate_order_tool({"order_id": "ORD-123", "max_items": 5})
assert ok_res["ok"] is True
bad1 = validate_order_tool({"order_id": "123", "max_items": 5})
assert bad1["ok"] is False and bad1["retryable"] is True and "ORD-" in bad1["hint"]
bad2 = validate_order_tool({"order_id": "ORD-1", "max_items": 50})
assert bad2["ok"] is False and "20" in bad2["hint"]
bad3 = validate_order_tool({"order_id": "ORD-1", "max_items": 2, "evil": True})
assert bad3["ok"] is False
print("PASS: Lab 10.2a strict tool validator & repair hints verified!")`,
      solutionCode: `def validate_order_tool(args: dict) -> dict:
    extra = set(args.keys()) - {"order_id", "max_items"}
    if extra:
        return {"ok": False, "retryable": True, "hint": f"Unexpected keys: {sorted(extra)}"}
    oid = str(args.get("order_id", ""))
    if not oid.startswith("ORD-"):
        return {"ok": False, "retryable": True, "hint": "order_id must start with 'ORD-'."}
    mi = args.get("max_items")
    if not isinstance(mi, int) or isinstance(mi, bool) or not (1 <= mi <= 20):
        return {"ok": False, "retryable": True, "hint": "max_items must be an integer between 1 and 20."}
    return {"ok": True, "args": args}`,
      hint: 'Check unexpected keys with set subtraction, then verify `oid.startswith("ORD-")` and `isinstance(mi, int) and 1 <= mi <= 20`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-2-idemp',
      title: 'Lab 10.2b: Idempotent Write Tool Dispatcher (Debug Retry Duplication)',
      prompt: 'Fix `IdempotentToolExecutor.execute(tool_name, key, fn)` so repeated invocations sharing the same `key` return the cached receipt without executing `fn` a second time, and tag replayed outputs with `"replayed": True`.',
      difficulty: 'debug',
      starterCode: `class IdempotentToolExecutor:
    def __init__(self):
        self.receipts = {}

    def execute(self, key: str, fn):
        # BUG: always invokes fn even when key was already processed!
        val = fn()
        return {"ok": True, "replayed": False, "result": val}`,
      testCode: `ex = IdempotentToolExecutor()
calls = 0
def charge():
    global calls
    calls += 1
    return "tx_99"
r1 = ex.execute("idem-1", charge)
r2 = ex.execute("idem-1", charge)
assert calls == 1, f"Expected 1 execution, got {calls}"
assert r1["replayed"] is False and r2["replayed"] is True and r2["result"] == "tx_99"
print("PASS: Lab 10.2b idempotent tool dispatch verified!")`,
      solutionCode: `class IdempotentToolExecutor:
    def __init__(self):
        self.receipts = {}

    def execute(self, key: str, fn):
        if key in self.receipts:
            return {"ok": True, "replayed": True, "result": self.receipts[key]}
        val = fn()
        self.receipts[key] = val
        return {"ok": True, "replayed": False, "result": val}`,
      hint: 'Check `if key in self.receipts:` BEFORE invoking `fn()`, and store `self.receipts[key] = val` on first execution.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-2-fanout',
      title: 'Lab 10.2c: Safe Tool Batch Executor & Repair Loop',
      prompt: 'Implement `execute_tool_calls(calls: list[dict], registry: dict, max_calls: int = 5) -> list[dict]`: process up to `max_calls` items (`{"id": str, "name": str, "args": dict}`). If `name` is missing in `registry`, emit `{"id": ..., "ok": False, "retryable": False, "error": "unknown_tool"}`; if calling `registry[name](args)` raises an exception, catch cleanly and return `{"id": ..., "ok": False, "retryable": True, "error": "tool_failed"}` without internal tracebacks.',
      difficulty: 'spec',
      starterCode: `def execute_tool_calls(calls: list[dict], registry: dict, max_calls: int = 5) -> list[dict]:
    # Cap batch size, handle unknown tools and sanitized exceptions cleanly
    return []`,
      testCode: `def lookup(a):
    if a.get("bad"):
        raise ValueError("secret sql host db-internal:5432 failed")
    return {"status": "shipped"}

out = execute_tool_calls(
    [
        {"id": "1", "name": "lookup", "args": {"id": 1}},
        {"id": "2", "name": "lookup", "args": {"bad": True}},
        {"id": "3", "name": "drop_db", "args": {}},
    ],
    {"lookup": lookup},
)
assert len(out) == 3
assert out[0]["ok"] is True and out[0]["data"]["status"] == "shipped"
assert out[1]["ok"] is False and "5432" not in str(out[1]) and out[1]["retryable"] is True
assert out[2]["ok"] is False and out[2]["error"] == "unknown_tool"
print("PASS: Lab 10.2c tool batch executor verified!")`,
      solutionCode: `def execute_tool_calls(calls: list[dict], registry: dict, max_calls: int = 5) -> list[dict]:
    outputs = []
    for call in calls[:max_calls]:
        cid = call.get("id")
        name = call.get("name", "")
        if name not in registry:
            outputs.append({"id": cid, "ok": False, "retryable": False, "error": "unknown_tool"})
            continue
        try:
            data = registry[name](call.get("args") or {})
            outputs.append({"id": cid, "ok": True, "data": data})
        except Exception:
            outputs.append({"id": cid, "ok": False, "retryable": True, "error": "tool_failed"})
    return outputs`,
      hint: 'Never put raw `str(exc)` inside the returned dict for unexpected exceptions—return sanitized `"tool_failed"`.',
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & Debugging Production Tool Calling',
      paragraphs: [
        'Three recurring bugs dominate real agent tool-calling failures. First, **vague parameter names and units**: naming a refund parameter `amt` causes some models to pass cents (`2500`) and others to pass dollars (`25.0`). Explicitly naming `refund_amount_usd` paired with numeric min/max schema limits and JSON Schema descriptions eliminates unit ambiguity immediately.',
        'Second, **infinite retry thrashing**: if a lookup returns `None` or fails validation twice with identical arguments, an unguarded loop happily pays for 15 identical turns before hitting HTTP gateway timeouts. Always hash `(tool_name, sorted_args)` per ticket run so identical failing invocations short-circuit after the first duplicate.',
        'Third, **parallelizing mutating side effects**: firing two `charge_card` or `update_ticket_status` calls concurrently inside `asyncio.gather` creates nasty race conditions whenever step 2 depends on step 1. Fan out strictly read-only lookups concurrently, execute sequential state transitions one by one with idempotency keys, and inspect both `tool_outputs` and token counts in trace logs.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked End-to-End Example: Parallel Read + Idempotent Write Recovery',
      paragraphs: [
        'Walk through a real multi-turn refund ticket in production. Turn 1: the user writes "Please check Order ORD-4021 and issue a $35 shipping credit." The assistant emits two parallel read tool calls (`lookup_order("ORD-4021")` and `get_shipping_status("ORD-4021")`) taking `180ms` wall-clock instead of `360ms`. Turn 2: both read results confirm delayed carrier delivery inside the 30-day policy window.',
        'Turn 3: the model initially proposes `issue_credit({"order_id": "4021", "amount": 35})`, missing the `ORD-` prefix. Instead of crashing with HTTP 500, `validate_order_tool` returns `{"ok": false, "retryable": true, "hint": "order_id must start with ORD-"}`. On Turn 4, the model repairs its argument to `"ORD-4021"` alongside deterministic key `idem_ord4021_step4`. Even if an upstream payment webhook times out mid-retry, the stored idempotency receipt prevents double credits cleanly.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'Treat every tool parameter schema as an untrusted API boundary with `additionalProperties: false` and explicit enums.',
        'Execute independent read lookups in parallel to reduce latency, but keep stateful writes sequential with persisted `idempotency_key` deduplication.',
        'Wrap validation errors inside bounded repair loops (`<= 2` attempts) with concise corrective hints instead of leaking raw tracebacks.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q10-2-1',
      question: 'Why should tool exceptions return a sanitized error code plus corrective hint instead of raw Python tracebacks?',
      options: [
        'Raw tracebacks cannot serialize validly inside UTF-8 JSON HTTP responses',
        'Tracebacks leak internal schemas/hosts and hurt retry clarity',
        'Python exception messages automatically bypass FastAPI middleware auth checks',
        'Short corrective hints reduce downstream vector index dimensionality cleanly',
      ],
      correctIndex: 1,
      explanation: 'Internal stack traces expose sensitive schema details and noise that hurt self-correction and security.',
    },
    {
      id: 'q10-2-2',
      question: 'When is executing multiple tool calls concurrently in parallel unsafe?',
      options: [
        'When reading a customer profile alongside recent shipping history records',
        'When querying two separate read-only documentation index namespaces',
        'When step 2 mutates billing state based on step 1 results',
        'When generating query embedding vectors for two independent search terms',
      ],
      correctIndex: 2,
      explanation: 'Dependent state mutations require sequential ordering and verified prior results.',
    },
    {
      id: 'q10-2-3',
      type: 'predict-output',
      question: 'With an `idempotency_key` persisted after a successful write, what happens when a retried request sends the same key?',
      code: `receipt = executor.execute("idem-88", issue_refund)`,
      options: [
        'It raises an immediate HTTP 500 server crash back to the client',
        'It executes issue_refund a second time and doubles customer payout',
        'It strips Bearer credentials cleanly from outgoing request headers',
        'It returns the stored receipt without re-running issue_refund',
      ],
      correctIndex: 3,
      explanation: 'Idempotent storage guarantees duplicate retries return the stored result with zero extra side effects.',
    },
    {
      id: 'q10-2-4',
      type: 'spot-bug',
      question: 'Spot the flaw in this tool schema: `{"type": "object", "properties": {"amount": {"type": "number"}}}` for a refund tool.',
      options: [
        'OpenAPI JSON Schema mandates string encoding for all currency values',
        'Missing bounds, unit clarity, and additionalProperties=false',
        'Financial refund tools cannot execute safely inside async Python handlers',
        'Tool schemas must omit property keys so models gain extra flexibility',
      ],
      correctIndex: 1,
      explanation: 'Unbounded `amount` permits negative numbers or huge arbitrary values plus extra unexpected keys.',
    },
    {
      id: 'q10-2-5',
      type: 'multi-select',
      question: 'Which practices harden production tool-calling loops against abuse and runaway costs?',
      options: [
        'Enforcing per-turn max tool call caps',
        'Setting additionalProperties: false on tool schemas',
        'Retrying validation errors infinitely until valid',
        'Requiring idempotency keys on mutating writes',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 3],
      explanation: 'Capping calls, locking schema keys, and idempotency keys stop infinite loops and duplicate writes.',
    },
    {
      id: 'q10-2-6',
      type: 'ordering',
      question: 'Order the safe tool-execution pipeline when an LLM proposes a mutating action:',
      options: [],
      items: [
        'Validate JSON arguments against strict bounds',
        'Verify caller session permissions & HITL policy',
        'Check persisted idempotency_key store',
        'Execute write and persist structured receipt',
      ],
      correctIndex: 0,
      explanation: 'Validate inputs first, verify authorization/HITL second, check idempotency third, and execute last.',
    },
    {
      id: 'q10-2-7',
      type: 'numeric',
      question: 'Three independent read tools each take 240ms sequentially (720ms total). Roughly how many milliseconds does parallel fan-out take?',
      options: [],
      correctIndex: 0,
      correctNumber: 240,
      tolerance: 30,
      unit: 'ms',
      explanation: 'Parallel execution is bounded primarily by the slowest individual tool call (~240ms).',
    },
    {
      id: 'q10-2-8',
      question: 'What is the primary purpose of setting `retryable: false` inside a structured tool error response?',
      options: [
        'Telling the agent loop to stop repeating permanent failures',
        'Switching embedding encoder vector dimensionality at runtime automatically',
        'Enabling wildcard CORS headers cleanly inside FastAPI service routers',
        'Disabling provider Prompt Prefix Caching across subsequent turns',
      ],
      correctIndex: 0,
      explanation: 'Marking permanent errors non-retryable stops the model from burning tokens looping on impossible fixes.',
    },
  ],
};
