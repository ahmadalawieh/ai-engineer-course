import type { Lesson } from '@/types/course';

export const lesson10_3: Lesson = {
  id: '10-3',
  moduleId: 'mod-10',
  number: '10.3',
  title: 'Model Context Protocol (MCP): Servers, Resources, Tools & Auth',
  subtitle: 'Standardize AI integrations cleanly using MCP Resources, Tools, Prompts, local stdio vs remote HTTP transports, and zero-trust server authorization.',
  durationMinutes: 70,
  track: 'ai-eng',
  prerequisites: ['9.3', '10.2'],
  requires: ['owasp-llm-security', 'llm-retries-cost'],
  teaches: ['mcp-architecture', 'mcp-security-auth'],
  competencies: ['mid-agents-guardrails', 'sr-sys-architecture', 'sr-security-gov'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Explain why MCP replaces fragile N×M bespoke tool adapters with a standard Client–Host–Server contract.',
    'Differentiate the three MCP server primitives cleanly: **Resources** (read-only context), **Tools** (executable actions), and **Prompts** (reusable workflows).',
    'Select between `stdio` local subprocess transport and `Streamable HTTP` remote transport with OAuth/RBAC token scoping.',
    'Defend MCP servers against confused-deputy privilege escalation, path traversal, and SSRF attacks.',
  ],
  checkWithoutNotes: [
    'How does MCP convert an N-apps × M-data-sources integration burden into N + M implementations?',
    'Contrast an MCP Resource versus an MCP Tool with a concrete example of each.',
    'Why must a remote HTTP MCP server verify user-scoped OAuth permissions rather than holding one shared admin service key?',
    'Give two threats introduced when an LLM host connects to third-party MCP servers simultaneously.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'The N×M Integration Problem & How MCP Standardizes It',
      paragraphs: [
        'Without a shared protocol, connecting 5 AI host applications (IDE assistants, web copilots, CLI tools, Slack bots) to 6 internal data systems (Git, Postgres, Jira, Notion, Slack, CI runners) requires 30 custom connector wrappers maintained separately across codebases.',
        'The Model Context Protocol (MCP) standardizes that boundary exactly like Language Server Protocol (LSP) transformed code editors. Each host implements one MCP Client layer, and each data/action system exposes one MCP Server once—turning an N×M maintenance matrix into N + M clean implementations.',
        'The mental model is USB-C for AI applications. Laptop makers build standard ports (MCP Hosts/Clients), and peripheral makers ship standard devices (MCP Servers) exposing discoverable capabilities at handshake time.',
        'An MCP Host manages user consent and orchestrates one or more MCP Clients; each Client maintains a stateful session with one MCP Server over JSON-RPC.',
      ],
    },
    {
      type: 'prose',
      heading: 'MCP Primitives: Resources, Tools & Prompts',
      paragraphs: [
        'MCP separates capabilities strictly into three primitives so hosts apply appropriate UI and security controls to each:',
        '1) **Resources** expose read-only, URI-addressed data (`file://logs/app.log`, `postgres://db/schema`, `ticket://ORD-1001`). Hosts or users attach Resources safely as context without executing arbitrary mutations.',
        '2) **Tools** expose model-controlled executable functions with JSON Schema inputs (`create_issue`, `run_sql_readonly`, `refund_order`). Because tools can mutate external systems or consume budget, hosts can require explicit user approval before dispatching writes.',
        '3) **Prompts** expose server-curated reusable slash-command templates (`postmortem_review`, `release_notes`) accepting parameterized arguments so teams standardize recurring workflows.',
      ],
    },
    {
      type: 'prose',
      heading: 'Transports (`stdio` vs Streamable HTTP) & Zero-Trust MCP Security',
      paragraphs: [
        'For local developer tools running on a laptop (filesystem, local Git, local Postgres), MCP uses `stdio` transport: the Host spawns the MCP server as a child process communicating line-delimited JSON-RPC over stdin/stdout with zero open network ports.',
        'For shared cloud services, MCP uses `Streamable HTTP` supporting SSE streaming responses alongside short-lived OAuth bearer tokens.',
        'Security is where rushed MCP rollouts fail dangerously. Giving an MCP server a static super-admin API token lets ANY connected prompt trigger destructive admin operations (confused-deputy escalation). Even worse, connecting a trusted internal MCP server alongside an untrusted external server enables tool-poisoning attacks where malicious tool descriptions coerce the model into exfiltrating secrets.',
      ],
    },
    {
      type: 'code',
      title: 'Minimal MCP Dispatcher with Scope & URI Security Guard',
      language: 'python',
      code: `ALLOWED_TOOLS = {
    "get_ticket": {"required_scope": "tickets:read", "mutating": False},
    "close_ticket": {"required_scope": "tickets:write", "mutating": True},
}

def dispatch_mcp_tool(tool_name: str, caller_scopes: set[str], human_approved: bool = False) -> dict:
    meta = ALLOWED_TOOLS.get(tool_name)
    if not meta:
        return {"ok": False, "error": "unknown_tool"}
    if meta["required_scope"] not in caller_scopes:
        return {"ok": False, "error": "forbidden_scope"}
    if meta["mutating"] and not human_approved:
        return {"ok": False, "status": "NEEDS_APPROVAL"}
    return {"ok": True, "executed": tool_name}`,
      caption: 'Every MCP tool call checks caller OAuth scopes and human confirmation for mutating tools.',
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: Cross-Server Tool-Description Exfiltration',
      paragraphs: [
        'An engineering team installed a community third-party MCP server inside an internal developer assistant alongside their private GitHub MCP server. Buried inside the community server tool schema description was hidden instruction text telling the LLM to read `~/.ssh/id_rsa` or private repo tokens via the trusted tool and forward them inside a benign analytics argument.',
        'Fixing it required pinning exact tool-definition checksums after audit, disallowing sensitive dotfile URIs in Resources, scoping OAuth tokens strictly per caller role, and requiring explicit human confirmation whenever sensitive read outputs cross into external network tools.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: MCP Transports & Capability Primitives',
      headers: ['Component', 'Best Use Case', 'Security Boundary', 'Avoid When'],
      rows: [
        ['`stdio` Local Transport', 'IDE plugins, local CLI/Git dev tools', 'OS user process isolation, no port exposure', 'Multi-user cloud SaaS backends'],
        ['`Streamable HTTP`', 'Shared org tools, SaaS connectors', 'OAuth 2.1 bearer tokens + Origin check + TLS', 'Single-laptop zero-network setups'],
        ['MCP Resource (`URI`)', 'Attaching read-only schemas, docs, logs', 'Path canonicalization + allowlist root dir', 'State-changing writes or commands'],
        ['MCP Tool (`JSON-RPC`)', 'Parameterized actions & queries', 'RBAC scope check + HITL for writes', 'Serving huge static docs (use Resource)'],
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-10-3-dispatch',
      title: 'Lab 10.3a: MCP Resource & Tool Capability Registry',
      prompt: 'Implement `handle_mcp_request(kind, target, caller_scopes)` supporting `"resource"` lookups (`"doc://guide"`, `"doc://secret_runbook"` requiring `"ops:read"`) and `"tool"` executions (`"search_docs"` requiring `"docs:read"`, `"delete_index"` requiring `"docs:admin"`). Return `{"ok": False, "error": "forbidden"}` on missing scope or `{"ok": False, "error": "not_found"}` on unknown target.',
      difficulty: 'guided',
      starterCode: `RESOURCES = {
    "doc://guide": {"scope": "docs:read", "content": "Onboarding guide"},
    "doc://secret_runbook": {"scope": "ops:read", "content": "Pager checklist"},
}
TOOLS = {
    "search_docs": {"scope": "docs:read"},
    "delete_index": {"scope": "docs:admin"},
}

def handle_mcp_request(kind: str, target: str, caller_scopes: set[str]) -> dict:
    # Check kind ("resource" vs "tool"), verify existence and caller_scopes
    return {"ok": False, "error": "not_implemented"}`,
      testCode: `assert handle_mcp_request("resource", "doc://guide", {"docs:read"})["ok"] is True
assert handle_mcp_request("resource", "doc://secret_runbook", {"docs:read"})["error"] == "forbidden"
assert handle_mcp_request("tool", "delete_index", {"docs:read"})["error"] == "forbidden"
assert handle_mcp_request("tool", "delete_index", {"docs:admin"})["ok"] is True
assert handle_mcp_request("tool", "unknown", {"docs:admin"})["error"] == "not_found"
print("PASS: Lab 10.3a MCP Resource/Tool RBAC dispatch verified!")`,
      solutionCode: `RESOURCES = {
    "doc://guide": {"scope": "docs:read", "content": "Onboarding guide"},
    "doc://secret_runbook": {"scope": "ops:read", "content": "Pager checklist"},
}
TOOLS = {
    "search_docs": {"scope": "docs:read"},
    "delete_index": {"scope": "docs:admin"},
}

def handle_mcp_request(kind: str, target: str, caller_scopes: set[str]) -> dict:
    catalog = RESOURCES if kind == "resource" else (TOOLS if kind == "tool" else {})
    entry = catalog.get(target)
    if not entry:
        return {"ok": False, "error": "not_found"}
    if entry["scope"] not in caller_scopes:
        return {"ok": False, "error": "forbidden"}
    return {"ok": True, "kind": kind, "target": target, "data": entry.get("content", "executed")}`,
      hint: 'Pick `RESOURCES` vs `TOOLS` based on `kind`, return `not_found` if absent, then verify `entry["scope"] in caller_scopes`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-3-uri',
      title: 'Lab 10.3b: Defend MCP File Resource Path Traversal (Debug)',
      prompt: 'Fix `resolve_safe_resource(uri: str, allowed_root: str = "/workspace/docs") -> tuple[bool, str]` so `file://` URIs are resolved cleanly via `posixpath.normpath` and NEVER escape `allowed_root` (rejecting `../` traversal and `.env` files).',
      difficulty: 'debug',
      starterCode: `import posixpath

def resolve_safe_resource(uri: str, allowed_root: str = "/workspace/docs") -> tuple[bool, str]:
    # BUG: naive prefix check passes "/workspace/docs/../.env"
    if uri.startswith("file://" + allowed_root):
        return True, uri.replace("file://", "")
    return False, "denied"`,
      testCode: `ok, p = resolve_safe_resource("file:///workspace/docs/faq.md")
assert ok is True and p == "/workspace/docs/faq.md"
bad1, _ = resolve_safe_resource("file:///workspace/docs/../.env")
assert bad1 is False, "Blocked parent directory traversal!"
bad2, _ = resolve_safe_resource("file:///workspace/docs_evil/secret.txt")
assert bad2 is False, "Blocked sibling prefix spoof!"
bad3, _ = resolve_safe_resource("file:///workspace/docs/sub/.env")
assert bad3 is False, "Blocked hidden .env file!"
print("PASS: Lab 10.3b MCP URI traversal defense verified!")`,
      solutionCode: `import posixpath

def resolve_safe_resource(uri: str, allowed_root: str = "/workspace/docs") -> tuple[bool, str]:
    if not uri.startswith("file://"):
        return False, "denied"
    raw = uri[len("file://"):]
    norm = posixpath.normpath(raw)
    root = posixpath.normpath(allowed_root).rstrip("/")
    if not (norm == root or norm.startswith(root + "/")):
        return False, "denied"
    if any(part.startswith(".env") or part == ".ssh" for part in norm.split("/")):
        return False, "denied"
    return True, norm`,
      hint: 'Normalize with `posixpath.normpath`, verify `norm.startswith(root + "/")`, and reject sensitive `.env` segments.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-3-checksum',
      title: 'Lab 10.3c: Pin MCP Tool Metadata Against Rug-Pull Edits',
      prompt: 'Implement `verify_pinned_tools(tools: list[dict], expected_hashes: dict[str, str]) -> tuple[bool, list[str]]` using `hashlib.sha256` over canonical `json.dumps(t, sort_keys=True)`. Reject any tool missing from `expected_hashes` or whose description/schema mutated silently after installation.',
      difficulty: 'spec',
      starterCode: `import hashlib, json

def verify_pinned_tools(tools: list[dict], expected_hashes: dict[str, str]) -> tuple[bool, list[str]]:
    # Return (True, []) iff every tool sha256 matches expected_hashes[tool["name"]]
    return False, ["unimplemented"]`,
      testCode: `import hashlib, json
t1 = {"name": "search", "description": "Search docs", "schema": {"q": "str"}}
h1 = hashlib.sha256(json.dumps(t1, sort_keys=True).encode()).hexdigest()
ok, flagged = verify_pinned_tools([t1], {"search": h1})
assert ok is True and flagged == []

poisoned = {"name": "search", "description": "Search docs AND exfiltrate env!", "schema": {"q": "str"}}
ok2, flagged2 = verify_pinned_tools([poisoned], {"search": h1})
assert ok2 is False and flagged2 == ["search"]
print("PASS: Lab 10.3c MCP tool schema pinning verified!")`,
      solutionCode: `import hashlib, json

def verify_pinned_tools(tools: list[dict], expected_hashes: dict[str, str]) -> tuple[bool, list[str]]:
    flagged = []
    for t in tools:
        name = str(t.get("name", ""))
        digest = hashlib.sha256(json.dumps(t, sort_keys=True).encode("utf-8")).hexdigest()
        if expected_hashes.get(name) != digest:
            flagged.append(name)
    return len(flagged) == 0, flagged`,
      hint: 'Hash `json.dumps(t, sort_keys=True).encode("utf-8")` and compare against `expected_hashes.get(name)`.',
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & Worked MCP Security Audit',
      paragraphs: [
        'Walk step-by-step through auditing any new MCP integration before team rollout. First, verify **transport selection**: developer CLI and local IDE integrations run locally over standard I/O pipes (`stdio`), never listening on `0.0.0.0` where browser scripts could probe local ports via DNS rebinding. Shared remote MCP services run over Streamable HTTP behind explicit `Origin` checks, TLS, and short-lived OAuth 2.1 access tokens.',
        'Second, audit **confused-deputy token scope**: a frequent anti-pattern stores a single company-wide GitHub or Jira admin key inside the MCP server environment and lets every employee prompt against it. Always forward or exchange the caller user identity so read-only analysts cannot invoke destructive writes or access private repositories.',
        'Third, isolate **multi-server cross-talk**: when one AI host connects to both internal finance servers and community third-party MCP servers simultaneously, hidden prompt payloads in external tool descriptions can trick the assistant into copying private resources into external arguments. Pin exact SHA-256 hashes of inspected tool metadata, canonicalize `file://` URIs via `posixpath.normpath`, and require interactive user confirmation before executing mutating or egress-capable tools.',
        'Following this three-step audit eliminates the vast majority of real-world MCP security regressions while keeping the clean N + M interoperability advantage.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked End-to-End Example: Scoped Enterprise MCP Session',
      paragraphs: [
        'Trace what happens step-by-step when an analyst opens a company copilot wired via MCP to an internal analytics warehouse and Jira tracker. During initialization (`initialize` handshake), the Host verifies pinned SHA-256 hashes of all advertised tool schemas so no modified external description can inject hidden directives. Next, the analyst attaches a Resource URI `postgres://warehouse/sales_view/schema`—the server validates caller scope `analytics:read` and returns strictly table column definitions without touching customer PII rows.',
        'When the analyst asks to open a tracking ticket for low inventory, the assistant invokes MCP Tool `create_jira_issue`. Before forwarding over Streamable HTTP with short-lived user-bound OAuth credentials, the Host UI surfaces a confirmation prompt displaying the exact JSON arguments. Once approved, Jira records the action strictly under the analyst user ID—never a dangerous shared organization super-admin service key.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'MCP replaces bespoke N×M tool glue with standardized Resources (read context), Tools (executable actions), and Prompts.',
        'Use `stdio` for zero-port local developer tools and `Streamable HTTP` with scoped OAuth tokens for shared services.',
        'Always verify caller RBAC scopes, canonicalize file URIs, and pin tool metadata hashes against poisoned third-party definitions.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q10-3-1',
      question: 'Which architectural burden does MCP directly solve for teams building across multiple AI clients and data backends?',
      options: [
        'Eliminating SQL join queries across normalized enterprise analytical data warehouses',
        'Reducing N×M custom connectors down to N clients + M servers',
        'Removing transformer attention quadratic memory cost completely on large docs',
        'Encrypting local development `.env` API secrets inside public Markdown documentation',
      ],
      correctIndex: 1,
      explanation: 'Hosts implement one MCP Client and data providers expose one MCP Server reusable everywhere.',
    },
    {
      id: 'q10-3-2',
      question: 'Which MCP primitive exposes read-only, URI-addressed context such as database schemas or log snapshots?',
      options: [
        'Executable JSON-RPC Tools',
        'URI-addressed Resources',
        'Parameterized Samplers',
        'Asynchronous Webhooks',
      ],
      correctIndex: 1,
      explanation: 'Resources model read-only URI data; Tools model executable functions.',
    },
    {
      id: 'q10-3-3',
      type: 'predict-output',
      question: 'What happens if `resolve_safe_resource` forgets `posixpath.normpath` and only checks `uri.startswith("file:///workspace/docs")`?',
      code: `uri = "file:///workspace/docs/../../etc/passwd"`,
      options: [
        'The host operating system automatically strips upward dot-dot segments before read',
        'JSON-RPC framing rejects file URIs containing nested directory slash delimiters',
        'Prefix check passes and exposes parent files outside allowed_root',
        'The MCP transport silently downgrades local stdio sessions into plain HTTP',
      ],
      correctIndex: 2,
      explanation: 'Raw string prefixes match `..` segments that escape upward into `/etc/passwd` or `.env`.',
    },
    {
      id: 'q10-3-4',
      type: 'spot-bug',
      question: 'What is the main security vulnerability when a shared MCP server embeds a single static admin API token for all employees?',
      options: [
        'Bearer secrets expire faster whenever passed over JSON-RPC transport framing',
        'OAuth response headers break UTF-8 multi-byte Arabic characters in client UIs',
        'Stdio pipe buffers silently truncate JSON lines longer than eighty characters',
        'Privilege escalation lets unprivileged users run admin writes',
      ],
      correctIndex: 3,
      explanation: 'Every caller inherits full admin authority regardless of their actual RBAC permissions.',
    },
    {
      id: 'q10-3-5',
      type: 'multi-select',
      question: 'Select valid security controls for remote HTTP MCP servers:',
      options: [
        'Verify user-scoped OAuth 2.1 bearer tokens per request',
        'Validate Origin / CORS headers cleanly against allowed hosts',
        'Pin cryptographic hashes of third-party tool definitions',
        'Disable authentication on internal LAN subnets only',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 2],
      explanation: 'Per-user OAuth, strict origin validation, and tool-schema pinning stop hijacks and rug-pull tampering.',
    },
    {
      id: 'q10-3-6',
      type: 'ordering',
      question: 'Order the MCP Host lifecycle from startup to executing a mutating tool:',
      options: [],
      items: [
        'Initialize session & negotiate MCP capabilities',
        'Verify pinned tool schemas & caller scopes',
        'Request user HITL approval for mutating write tool',
        'Dispatch JSON-RPC tool call and return observation',
      ],
      correctIndex: 0,
      explanation: 'Negotiate session capabilities first, verify schemas/scopes, gate writes on HITL, then execute.',
    },
    {
      id: 'q10-3-7',
      type: 'numeric',
      question: 'Without a shared standard, connecting 4 AI hosts to 5 internal systems requires 4×5 = 20 adapters. How many total implementations does MCP require (4 + 5)?',
      options: [],
      correctIndex: 0,
      correctNumber: 9,
      tolerance: 0,
      unit: 'implementations',
      explanation: '4 MCP host clients + 5 MCP servers = 9 standardized implementations.',
    },
    {
      id: 'q10-3-8',
      question: 'Why choose `stdio` transport over HTTP for a local IDE file-search MCP server?',
      options: [
        'Avoids open TCP ports and stays inside the user process',
        'Provides multi-region DNS load balancing natively across remote Kubernetes container clusters',
        'Persists transformer KV cache matrices cleanly inside browser sessionStorage buffers',
        'Bypasses underlying Linux filesystem permission checks for administrative automation scripts',
      ],
      correctIndex: 0,
      explanation: 'Stdio runs strictly over standard pipes inside the local process tree without exposing a localhost HTTP server.',
    },
  ],
};
