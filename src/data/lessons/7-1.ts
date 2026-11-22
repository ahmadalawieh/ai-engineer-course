import type { Lesson } from '@/types/course';

export const lesson7_1: Lesson = {
  id: '7-1',
  moduleId: 'mod-7',
  number: '7.1',
  title: 'AI Agents: Workflows, ReAct Loops, Sandboxing, HITL & Trace Debugging',
  subtitle: 'Know when deterministic workflows beat autonomous agents—and harden ReAct loops with memory tiers, tool sandboxing, permissioning, HITL gates, and execution traces.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['6.1'],
  requires: ['tool-calling', 'prompt-injection-defense', 'structured-outputs'],
  teaches: [
    'agent-workflows-vs-react',
    'agent-memory',
    'tool-sandboxing',
    'hitl-gates',
    'trace-debugging',
  ],
  objectives: [
    'Choose cleanly between deterministic workflows (DAG routing, parallelization) and dynamic autonomous ReAct loops.',
    'Design multi-tier agent memory (short-term context scratchpad vs persistent episodic/semantic profile stores).',
    'Protect tool execution using read/write sandboxing, explicit permission allowlists, Human-in-the-Loop (HITL) approvals, and hard step/cost budgets.',
    'Diagnose stalled, looping, or hallucinating agents systematically via structured step traces.',
  ],
  checkWithoutNotes: [
    'If a task follows fixed steps (`Classify -> Retrieve -> Draft -> Validate`), why is a deterministic workflow strictly better than an open-ended ReAct agent?',
    'Explain why an autonomous 10-step agent with 95% reliability per step finishes all 10 steps cleanly only ~60% of the time ($0.95^{10}$).',
    'What four deterministic guardrails must wrap sensitive write tools like `issue_refund` or `send_email` inside an agent runtime?',
    'How does structured trace logging (`step`, `thought`, `tool_name`, `args`, `latency_ms`, `cost_usd`) turn flaky agent failures into fixable bugs?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Every company experimenting with AI eventually builds an "autonomous agent"—and watches the earliest prototype loop twelve times calling the same search tool, blow past a `$2` per-ticket budget, or fall for hidden instructions inside an uploaded invoice. Beginners often treat agent frameworks as magic autonomy: hand an LLM ten powerful tools and tell it *"solve customer support."* In production, unconstrained loops compound small per-step mistakes geometrically: even a reliable `95%` single-step accuracy drops to $0.95^{10} \\approx 59.9\\%$ end-to-end reliability across ten autonomous hops!',
        'Disciplined AI engineers reverse that instinct. Start with **deterministic workflows** whenever the control-flow graph is known ahead of time, reserve **autonomous ReAct / planning loops** strictly for genuinely open-ended tasks whose next action depends on runtime discoveries, and surround every tool execution with **least-privilege sandboxing**, **explicit permission gates**, **Human-in-the-Loop (HITL) approvals**, **hard step/cost/latency budgets**, **deterministic failure recovery**, and **step-by-step execution traces**.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Train Tracks (Workflows) vs Field Investigators (ReAct) & Cockpit Locks',
      paragraphs: [
        'Picture **deterministic LLM workflows** like a well-signaled commuter railway: *Step 1 classifies ticket intent -> Step 2 retrieves verified policy docs -> Step 3 extracts structured fields -> Step 4 validates schema*. Each station runs predictably, in parallel where independent, with bounded latency and easy unit testing. Contrast that with a **ReAct (Reason + Act) agent**: a field investigator who inspects evidence iteratively—*Thought: "Test failed with ImportError inside utils.py" -> Action: `read_file("utils.py")` -> Observation: sees typo -> Thought: "Let me check tests" -> Action: `run_pytest()`*. Only reach for ReAct or **Plan-and-Execute** loops when you truly cannot predict which files or tools the problem demands upfront.',
        'Next, separate **Agent Memory** into three clear buckets instead of dumping everything into one giant prompt. **Short-term working memory** holds the active task\'s reasoning steps and tool observations inside the context window—pruned or summarized whenever intermediate payloads grow noisy. **Episodic / Semantic memory** persists resolved past incidents, user preferences, or validated workspace facts inside a vector + SQL store retrieved on demand. **Procedural memory** lives inside versioned prompts, tool descriptions, and verified code skills rather than volatile chat history.',
        'Finally, build every tool layer as if the model *might* get tricked by untrusted input tomorrow (**Zero Trust for Probabilistic Planners**). Separate read-only tools (`lookup_order`, `search_docs`) from state-mutating write tools (`issue_refund`, `update_database`). Wrap external files and scraped web text in sanitized delimiters, execute risky actions inside restricted **sandboxes** (containers with non-root users, read-only mounts, network egress restrictions, timeouts), require **Human-in-the-Loop (HITL)** sign-off before high-stakes side effects (`refund > $50`, sending external email, deleting records), and enforce strict `max_steps`, `max_usd`, and `max_wall_seconds` circuit breakers.',
      ],
    },
    {
      type: 'visual-diagram',
      diagramId: 'agent-guardrails',
      title: 'Production Agent Loop with Prompt Shield, Router & HITL Safety Gate',
      caption: 'Real companies never expose raw `eval()` or unlimited tool loops—every action passes input isolation, schema bounds, and HITL rules.',
    },
    {
      type: 'concept-reel',
      reelId: 'agent-ticket-reel',
      title: 'Animated Walkthrough: How a Hardened Support Agent Stops a $5,000 Injection Attack',
      description: 'See how untrusted user notes are sandboxed while real read-only lookups and policy gates run deterministically.',
    },
    {
      type: 'simulator',
      simulatorId: 'react-agent',
      title: 'Interactive Lab: ReAct Agent Execution & Budget Tracer',
      description:
        'Step through a real multi-tool support/engineering agent (SQL query, Docs search, Refund action). Toggle HITL approval & step budgets to inspect Thought -> Tool Call -> Observation traces.',
    },
    {
      type: 'table',
      title: 'Agent Memory, Safety & Protocol Stack',
      headers: ['Component', 'Everyday Analogy', 'AI Engineering Implementation'],
      rows: [
        ['Short-term Working Memory', 'An open desk scratchpad for one active ticket', 'Current `messages` thread + tool observations inside Context Window (pruned/summarized)'],
        ['Episodic / Semantic Memory', 'Filed notebooks & customer CRM history', 'Scoped Vector + PostgreSQL store holding user preferences & resolved cases'],
        ['Sandboxed Execution', 'Glovebox isolation chamber for unknown samples', 'Ephemeral Docker/microVM container with CPU/RAM/time limits & restricted egress'],
        ['**MCP (Model Context Protocol)**', 'Universal USB-C connector for peripherals', 'Standard client-server protocol exposing Tools, Resources, and Prompts cleanly across apps'],
      ],
    },
    {
      type: 'code-builder',
      puzzleId: 'puzzle-7-1-agent',
      title: 'Warm-Up Puzzle: Safe Production Agent Execution Flow',
      prompt:
        'When an agent reads an untrusted customer email and wants to issue a refund, what is the safe execution order?',
      lines: [
        '1. Wrap email text inside <untrusted_data> delimiters',
        '2. Query read-only SQL scoped to verified customer_id',
        '3. Enforce $200 refund cap & rate limits in deterministic backend code',
        '4. Pause for Human-in-the-Loop (HITL) approval on high-risk writes',
        '5. Execute refund with an idempotency key & log OpenTelemetry trace',
      ],
      explanation:
        'Untrusted text is always isolated first; deterministic backend guards + HITL checks protect financial writes before execution.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Budget-Guarded ReAct Loop, Failure Recovery & Cycle Detection',
      paragraphs: [
        'Two runtime failure modes plague autonomous loops in production: **repeating identical failing tool calls** (`lookup_order("INVALID")` four times in a row when the ID clearly does not exist) and **silent budget overrun** when intermediate search outputs bloat input tokens exponentially across steps. Both disappear with two simple deterministic guards inside your orchestrator loop.',
        'First, track a set of `(tool_name, canonical_args)` pairs seen so far (or consecutive identical failures) and inject an explicit system recovery observation if the model repeats a failing call (`"Repeated failing tool call detected; pick a different tool or report missing information cleanly"`). Second, check `steps >= max_steps`, `spent_usd >= max_usd`, and `elapsed_s >= max_wall_s` *before* every model invocation—exiting gracefully with a partial trace summary instead of crashing on an HTTP gateway timeout.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Trace-Logged ReAct Guard with Cost & Repeat-Call Circuit Breakers',
      language: 'python',
      code: `import json

def step_guard(trace: list[dict], next_call: dict, spent_usd: float, max_usd: float, max_steps: int) -> str | None:
    if len(trace) >= max_steps:
        return "halt:max_steps"
    if spent_usd >= max_usd:
        return "halt:max_usd"
    sig = (next_call["name"], json.dumps(next_call.get("arguments", {}), sort_keys=True))
    prior_sigs = {(t["name"], json.dumps(t["arguments"], sort_keys=True)) for t in trace}
    if sig in prior_sigs:
        return "recover:duplicate_call"
    return None

sample_trace = [{"name": "search_docs", "arguments": {"q": "refund"}}]
print(step_guard(sample_trace, {"name": "search_docs", "arguments": {"q": "refund"}}, 0.02, 0.25, 6))
print(step_guard(sample_trace, {"name": "check_order", "arguments": {"id": "O1"}}, 0.26, 0.25, 6))`,
      caption: 'Explained output: first print emits `"recover:duplicate_call"` (stopping repetitive loops cleanly), and second prints `"halt:max_usd"` before spending past budget.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Trace-Based Debugging, Tool Schemas & Failure Recovery',
      paragraphs: [
        'Imagine a user reports: *"The support agent told me it issued my refund, yet nothing arrived in Stripe."* How do you debug an agent bug in two minutes rather than guessing? Open the **trace tree** recorded for that `trace_id`: every hop logs `step_idx`, `tool_name`, `arguments`, `policy_decision` (`allowed` vs `hitl_pending` vs `denied`), `tool_status` (`ok` vs `error`), `latency_ms`, and `cost_usd`.',
        'Inspecting the trace reveals the culprit immediately: at Step 2, `issue_refund` returned `{"status": "pending_human_approval", "approval_id": "apr-81"}`, yet Step 3\'s response generator phrased that observation loosely as *"Your refund has been processed!"* Because every hop was traced structurally, you fix the prompt/template (`"State clearly that approval is pending—never claim completion until executed"`) AND add a deterministic unit test checking tool trace alignment!',
        'Just as helpful is writing **self-documenting tool descriptions** and **actionable tool errors**. When a tool fails (`ValueError: unknown status "cancelled_by_vip"`), do not return a raw 30-line Python traceback to the LLM—return a concise JSON guidance hint: `{"error": "invalid status", "allowed": ["open", "closed", "pending"]}` so the agent recovers cleanly on the very next hop instead of guessing blindly. Finally, prefer **Orchestrator-Workers** (one planner emits a clean step checklist executed by specialized single-purpose workers) over deep unconstrained multi-agent chatter unless tasks genuinely require open debate.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Using an unconstrained ReAct agent for a static 3-step pipeline:** Paying 4 extra LLM round-trips when steps never branch wastes latency, triples token bills, and introduces random failure modes. Use deterministic code orchestration unless branching genuinely requires dynamic discovery.',
        '**Mistake 2 — Giving code-execution or SQL agents unrestricted host access:** Running model-generated SQL against a write-enabled production database or `subprocess.run(cmd, shell=True)` directly on your app server creates catastrophic security exposure. Enforce read-only database roles, parameterized queries, and isolated ephemeral containers.',
        '**Mistake 3 — Trusting prompt rules (`"Never refund >$50"`) without backend validation:** Always re-verify business invariants (`amount <= 50`, `session.user_id == order.owner_id`, HITL token verified) inside Python *after* the model emits tool JSON.',
        '**Mistake 4 — Returning raw 40KB HTML pages directly into `role: "tool"`:** Unbounded tool outputs overflow context windows on hop 2 and spike input token costs. Truncate, clean, and summarize oversized observations before appending to working memory.',
        '**Mistake 5 — Omitting `trace_id` & step spans from logs:** Without ordered per-step tool arguments and statuses, reproducing stochastic multi-step failures in staging is nearly impossible.',
        '**Mistake 6 — Writing vague overlapping tool descriptions:** Giving an agent both `search_tickets(query)` and `find_issues(text)` with nearly identical descriptions causes erratic tool bouncing. Keep tool interfaces non-overlapping, document parameter constraints clearly, and return crisp structured JSON schemas.',
        '**Mistake 7 — Skipping red-team adversarial tests on multi-step tool chains:** Always test poisoned documents that try chaining a benign read (`search_docs`) into an unauthorized write (`issue_refund`) so you prove your HITL and role checks hold across multi-hop plans.',
        '**Mistake 8 — Measuring only final answer text instead of trajectory accuracy:** Even if a lucky guess reaches the right answer after calling three broken tools and burning 12,000 tokens, grade both *expected tool sequence* and *cost/step counts* inside CI.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Prefer deterministic workflows first:** Reserve open ReAct/planning loops strictly for tasks whose path depends on intermediate discoveries.',
        '2. **Isolate memory tiers cleanly:** Keep active context concise (working memory), store facts/incidents externally (episodic/semantic), and enforce contracts in code.',
        '3. **Enforce permissioning & HITL gates:** Separate read-only tools from state mutations, require human sign-off on high-risk actions, and sandbox code execution.',
        '4. **Bound loops & recover gracefully:** Guard every hop with `max_steps`, `max_usd`, timeouts, and duplicate-call recovery.',
        '5. **Debug via structured traces:** Record `(step, tool, args, status, latency_ms, cost_usd)` per run to turn stochastic failures into unit tests.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-1-1',
      difficulty: 'guided',
      requires: ['agent-workflows-vs-react', 'tool-sandboxing'],
      title: 'Lab 7.1.1 (Guided): Budget & Duplicate-Call Guarded ReAct Runner',
      prompt:
        'Implement `run_guarded_agent(mock_planner, tools, query, max_steps=4, max_usd=0.10)` returning `{"status": "done"|"halted_budget"|"halted_steps", "answer": str | None, "trace": list[dict], "spent_usd": float}`. On each step, BEFORE calling `mock_planner(messages)`, check `if steps >= max_steps` -> return `"halted_steps"` and `if spent_usd >= max_usd` -> return `"halted_budget"`. Each `mock_planner` call returns `{"cost_usd": float, "type": "final", "content": str}` OR `{"cost_usd": float, "type": "tool_call", "name": str, "arguments": dict}`. Add `cost_usd` immediately, record a trace entry `{"step": idx, "tool": name, "ok": bool}` for tool calls (catching unknown tools safely as `ok=False` and feeding `"error: unknown tool"` back into messages), and finish cleanly on `"final"`.',
      starterCode: `import json

def run_guarded_agent(mock_planner, tools: dict, query: str, max_steps: int = 4, max_usd: float = 0.10) -> dict:
    messages = [{"role": "user", "content": query}]
    trace = []
    spent_usd = 0.0
    # Loop and check max_steps / max_usd before each planner call
    pass`,
      testCode: `import json
step_n = 0
def planner_ok(msgs):
    global step_n
    step_n += 1
    if step_n == 1:
        return {"cost_usd": 0.02, "type": "tool_call", "name": "lookup", "arguments": {"id": "A1"}}
    return {"cost_usd": 0.02, "type": "final", "content": "Order A1 shipped."}

res1 = run_guarded_agent(planner_ok, {"lookup": lambda id: {"status": "shipped"}}, "Check A1", max_steps=4, max_usd=0.10)
assert res1["status"] == "done" and res1["answer"] == "Order A1 shipped."
assert len(res1["trace"]) == 1 and res1["trace"][0]["ok"] is True
assert abs(res1["spent_usd"] - 0.04) < 1e-6

def planner_expensive(_msgs):
    return {"cost_usd": 0.06, "type": "tool_call", "name": "lookup", "arguments": {"id": "A1"}}

res2 = run_guarded_agent(planner_expensive, {"lookup": lambda id: {}}, "Loop", max_steps=10, max_usd=0.10)
assert res2["status"] == "halted_budget" and res2["spent_usd"] >= 0.10

res3 = run_guarded_agent(planner_expensive, {"lookup": lambda id: {}}, "Loop", max_steps=2, max_usd=5.0)
assert res3["status"] == "halted_steps" and len(res3["trace"]) == 2
print("PASS: Lab 7.1.1 Budget & step-guarded ReAct runner passed!")`,
      solutionCode: `import json

def run_guarded_agent(mock_planner, tools: dict, query: str, max_steps: int = 4, max_usd: float = 0.10) -> dict:
    messages = [{"role": "user", "content": query}]
    trace = []
    spent_usd = 0.0
    for step in range(max_steps + 1):
        if spent_usd >= max_usd:
            return {"status": "halted_budget", "answer": None, "trace": trace, "spent_usd": round(spent_usd, 6)}
        if step >= max_steps:
            return {"status": "halted_steps", "answer": None, "trace": trace, "spent_usd": round(spent_usd, 6)}
        resp = mock_planner(messages)
        spent_usd += float(resp.get("cost_usd", 0.0))
        if resp["type"] == "final":
            return {"status": "done", "answer": resp["content"], "trace": trace, "spent_usd": round(spent_usd, 6)}
        name = resp["name"]
        args = resp.get("arguments", {})
        if name not in tools:
            trace.append({"step": step, "tool": name, "ok": False})
            messages.append({"role": "tool", "content": "error: unknown tool"})
        else:
            out = tools[name](**args)
            trace.append({"step": step, "tool": name, "ok": True})
            messages.append({"role": "tool", "content": json.dumps(out)})
    return {"status": "halted_steps", "answer": None, "trace": trace, "spent_usd": round(spent_usd, 6)}`,
      hint: 'Check `spent_usd >= max_usd` and `step >= max_steps` BEFORE calling `mock_planner`, update `spent_usd` immediately after, and append `trace` dicts on tool calls.',
      hints: [
        'Iterate `for step in range(max_steps + 1):` checking `spent_usd >= max_usd` and `step >= max_steps` first.',
        'Add `resp["cost_usd"]` to `spent_usd` before branching on `"final"` vs `"tool_call"`.',
        'Handle unknown tool names gracefully (`ok=False`) rather than crashing the agent.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-1-2',
      difficulty: 'spec',
      requires: ['hitl-gates', 'tool-sandboxing'],
      title: 'Lab 7.1.2 (From Spec): Deterministic Policy & HITL Gatekeeper',
      prompt:
        'Implement `evaluate_tool_policy(tool_name, args, session, hitl_approved=False)` returning `"execute" | "require_hitl" | "deny"`: 1) Read tools (`"search_docs"`, `"get_order"`) -> `"execute"` only when `not session.get("untrusted_injection_flag", False)` OR `tool_name == "search_docs"`; wait—specifically let `"search_docs"` always `"execute"`, `"get_order"` -> `"execute"` if `args.get("customer_id") == session.get("user_id")` else `"deny"`. 2) Write tool `"issue_refund"` -> `"deny"` if `args.get("amount", 0) <= 0` OR `args.get("amount", 0) > 500` OR `session.get("role") != "support"`; if `amount <= 50` -> `"execute"`; if `50 < amount <= 500` -> `"execute"` if `hitl_approved` else `"require_hitl"`. 3) Any other unknown tool -> `"deny"`.',
      starterCode: `def evaluate_tool_policy(tool_name: str, args: dict, session: dict, hitl_approved: bool = False) -> str:
    # Return "execute", "require_hitl", or "deny"
    pass`,
      testCode: `sess = {"user_id": "u1", "role": "support"}
assert evaluate_tool_policy("search_docs", {"q": "faq"}, sess) == "execute"
assert evaluate_tool_policy("get_order", {"customer_id": "u1"}, sess) == "execute"
assert evaluate_tool_policy("get_order", {"customer_id": "u2"}, sess) == "deny"
assert evaluate_tool_policy("issue_refund", {"amount": 25}, sess) == "execute"
assert evaluate_tool_policy("issue_refund", {"amount": 150}, sess, hitl_approved=False) == "require_hitl"
assert evaluate_tool_policy("issue_refund", {"amount": 150}, sess, hitl_approved=True) == "execute"
assert evaluate_tool_policy("issue_refund", {"amount": 600}, sess, hitl_approved=True) == "deny"
assert evaluate_tool_policy("issue_refund", {"amount": 25}, {"user_id": "u1", "role": "guest"}) == "deny"
assert evaluate_tool_policy("drop_db", {}, sess, hitl_approved=True) == "deny"
print("PASS: Lab 7.1.2 Deterministic agent policy & HITL gatekeeper passed!")`,
      solutionCode: `def evaluate_tool_policy(tool_name: str, args: dict, session: dict, hitl_approved: bool = False) -> str:
    if tool_name == "search_docs":
        return "execute"
    if tool_name == "get_order":
        return "execute" if args.get("customer_id") == session.get("user_id") else "deny"
    if tool_name == "issue_refund":
        amt = args.get("amount", 0)
        if session.get("role") != "support" or not isinstance(amt, (int, float)) or amt <= 0 or amt > 500:
            return "deny"
        if amt <= 50:
            return "execute"
        return "execute" if hitl_approved else "require_hitl"
    return "deny"`,
      hint: 'Check tenant ownership on `get_order`, verify role `"support"` and `0 < amt <= 500` before allowing `"execute"` or `"require_hitl"` on `issue_refund`, and default-deny unknown tools.',
      hints: [
        'Handle `"search_docs"` and tenant-matched `"get_order"` first.',
        'In `"issue_refund"`, deny immediately if `role != "support"` or `amt <= 0` or `amt > 500`.',
        'For `50 < amt <= 500`, check `hitl_approved` to choose `"execute"` vs `"require_hitl"`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-1-3',
      difficulty: 'debug',
      requires: ['trace-debugging', 'agent-memory'],
      title: 'Lab 7.1.3 (Debug Buggy Code): Fix Repeated-Tool Infinite Loop & Unbounded Working Memory',
      prompt:
        'A broken trace post-processor fails two invariants: 1) `detect_stuck_loop(trace, window=3)` returns `True` when the last `window` tool entries share the same `(tool, args)` signature—currently it forgets to check `len(trace) >= window` and crashes or returns `True` on short traces! 2) `prune_working_memory(observations, max_chars=40)` tries to keep total observation string length `<= max_chars` by dropping oldest observations first, yet iterates from oldest to newest and slices wrongly! Fix both helpers cleanly.',
      starterCode: `def detect_stuck_loop(trace: list[dict], window: int = 3) -> bool:
    # Bug 1: fails on len(trace) < window and checks only tool name ignoring args!
    recent = trace[-window:]
    return len({t["tool"] for t in recent}) <= 1

def prune_working_memory(observations: list[str], max_chars: int = 40) -> list[str]:
    # Bug 2: drops newest items instead of dropping oldest while total chars > max_chars!
    kept = []
    total = 0
    for obs in observations:
        if total + len(obs) <= max_chars:
            kept.append(obs)
            total += len(obs)
    return kept`,
      testCode: `assert detect_stuck_loop([{"tool": "s", "args": "a"}], window=3) is False
assert detect_stuck_loop([{"tool": "s", "args": "a"}, {"tool": "s", "args": "b"}, {"tool": "s", "args": "c"}], window=3) is False, "Different args = real progress, not stuck!"
assert detect_stuck_loop([{"tool": "s", "args": "a"}, {"tool": "s", "args": "a"}, {"tool": "s", "args": "a"}], window=3) is True

obs = ["old_123456789012345", "mid_123456789012345", "new_123456"]
pruned = prune_working_memory(obs, max_chars=30)
assert pruned == ["mid_123456789012345", "new_123456"], f"Must keep newest observations! Got {pruned}"
print("PASS: Lab 7.1.3 Loop detector & working-memory pruner fixed!")`,
      solutionCode: `def detect_stuck_loop(trace: list[dict], window: int = 3) -> bool:
    if len(trace) < window or window <= 0:
        return False
    recent = trace[-window:]
    sigs = {(t["tool"], str(t.get("args", ""))) for t in recent}
    return len(sigs) == 1

def prune_working_memory(observations: list[str], max_chars: int = 40) -> list[str]:
    kept_rev = []
    total = 0
    for obs in reversed(observations):
        if total + len(obs) <= max_chars:
            kept_rev.append(obs)
            total += len(obs)
        else:
            break
    return list(reversed(kept_rev))`,
      hint: 'In `detect_stuck_loop`, require `len(trace) >= window` and compare `(t["tool"], str(t.get("args", "")))`. In `prune_working_memory`, iterate `reversed(observations)` then reverse back so newest entries stay.',
      hints: [
        'Guard `if len(trace) < window: return False` before creating the signature set.',
        'Include both `"tool"` and `"args"` inside the signature tuple so legitimate searches with new queries are not flagged.',
        'Walk `reversed(observations)` adding items while `total + len(obs) <= max_chars`, then `list(reversed(kept_rev))`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q7-1-1',
      type: 'multiple-choice',
      question: 'Why should an agent’s customer-refund tool NEVER be invoked without deterministic policy or HITL checks?',
      options: [
        'Probabilistic LLMs can be tricked by injection or errors into bad payouts',
        'JSON tool payloads forbid passing floating-point currency amounts inside arguments',
        'ReAct execution loops automatically terminate after invoking a single read tool',
        'Model Context Protocol servers reject any remote write operations by design',
      ],
      correctIndex: 0,
      explanation: 'Probabilistic models should propose actions; deterministic backend guards or human approvals enforce financial and security invariants.',
    },
    {
      id: 'q7-1-2',
      type: 'multiple-choice',
      question: 'When should you prefer a deterministic LLM workflow over an autonomous ReAct agent?',
      options: [
        'Only when your application connects to zero external search or database tools',
        'Whenever steps are known upfront, giving predictable cost, latency, and control',
        'Never—open ReAct loops achieve strictly higher accuracy on every pipeline',
        'Strictly when processing raw visual images rather than structured text tickets',
      ],
      correctIndex: 1,
      explanation: 'Autonomous loops compound per-step error rates ($0.95^{10} \\approx 0.60$) and add round-trips; keep control flow deterministic whenever steps are predictable.',
    },
    {
      id: 'q7-1-3',
      type: 'multiple-choice',
      question: 'What core integration problem does **MCP (Model Context Protocol)** solve?',
      options: [
        'It replaces causal self-attention inside large Transformer decoder blocks',
        'It quantizes 70B frozen weights cleanly down into 2-bit integer vectors',
        'It standardizes tool and data interfaces across apps, removing custom glue code',
        'It eliminates the need for golden datasets and CI regression evaluation suites',
      ],
      correctIndex: 2,
      explanation: 'MCP acts like a universal connector standardizing tool discovery, schemas, and context resources across editors and agent runtimes.',
    },
    {
      id: 'q7-1-4',
      type: 'numeric',
      question: 'An autonomous agent succeeds on `90%` (`0.90`) of individual steps. Over `3` sequential dependent steps ($0.90^3$), what is its expected end-to-end completion rate in percent (round to 1 decimal)?',
      options: [],
      correctIndex: 0,
      correctNumber: 72.9,
      tolerance: 0.2,
      unit: '%',
      explanation: '$0.90 \\times 0.90 \\times 0.90 = 0.729 = 72.9\\%$, showing why minimizing unnecessary autonomous hops protects reliability.',
    },
    {
      id: 'q7-1-5',
      type: 'spot-bug',
      code: `for step in range(max_steps):
    action = model(messages)
    out = subprocess.run(action["cmd"], shell=True, capture_output=True)`,
      question: 'What critical safety defect exists in executing `action["cmd"]` directly via `shell=True`?',
      options: [
        '`capture_output=True` truncates tool output strings at 64 characters silently',
        '`range(max_steps)` skips checking the very first zero-indexed step',
        '`subprocess.run` refuses executing unless wrapped inside an `async def` coroutine',
        'Model-controlled shell commands let injection payloads compromise the host server',
      ],
      correctIndex: 3,
      explanation: 'Executing untrusted model output on the app host without sandboxing enables arbitrary file deletion or secret exfiltration (`.env`). Sandbox inside ephemeral containers and allowlist narrow commands.',
    },
    {
      id: 'q7-1-6',
      type: 'multi-select',
      question: 'Which TWO safeguards stop runaway loops and surprise bills in autonomous ReAct agents?',
      options: [
        'Enforcing hard `max_steps`, `max_usd`, and wall-clock timeout guards before every planner turn',
        'Detecting repeated identical `(tool, args)` calls to recover cleanly instead of looping',
        'Allowing infinite retries whenever an upstream search tool returns zero documents',
        'Appending unbounded 50KB HTML scrapes directly into short-term working memory',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Hard step/cost caps plus duplicate-call detection halt infinite loops cleanly while bounded memory keeps context sizes under control.',
    },
    {
      id: 'q7-1-7',
      type: 'predict-output',
      code: `trace = ["search:A", "search:A", "search:A"]
stuck = len(trace) >= 3 and len(set(trace[-3:])) == 1
print(stuck)`,
      question: 'What boolean output is printed?',
      options: [
        '`False` because three steps stayed inside `max_steps`',
        '`True`',
        '`None`',
        'Raises `TypeError` calling `set()` on string slices',
      ],
      correctIndex: 1,
      explanation: 'The final 3 trace signatures are identical, making `len(set(trace[-3:])) == 1`, so `stuck` prints `True`.',
    },
    {
      id: 'q7-1-8',
      type: 'ordering',
      question: 'Order the safe execution stages when an agent proposes a high-value customer refund from an untrusted email:',
      options: [],
      items: [
        'Wrap email text in <untrusted_data> delimiters',
        'Verify order ownership via read-only tenant-scoped SQL lookup',
        'Enforce refund policy limits and pause for Human-in-the-Loop approval',
        'Execute idempotent refund and log structured trace span',
      ],
      correctIndex: 0,
      explanation: 'Isolate untrusted input -> verify ownership via read-only lookup -> enforce deterministic bounds + HITL -> execute idempotently with full trace logging.',
    },
    {
      id: 'q7-1-9',
      type: 'multiple-choice',
      question: 'How does **Episodic / Semantic Memory** differ from **Short-Term Working Memory** in agent architecture?',
      options: [
        'Working memory holds active task messages inside the context window; episodic stores persist across sessions externally',
        'Episodic memory resets automatically at the end of every HTTP API call cleanly',
        'Working memory stores permanent weights updated via LoRA during production chats',
        'Episodic memory cannot store JSON profile records alongside vector embeddings',
      ],
      correctIndex: 0,
      explanation: 'Working memory lives inside the current request prompt window, whereas episodic/semantic stores persist facts across sessions in external databases.',
    },
  ],
};
