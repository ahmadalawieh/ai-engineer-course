import type { Lesson } from '@/types/course';

export const lesson9_3: Lesson = {
  id: '9-3',
  moduleId: 'mod-9',
  number: '8.3',
  title: 'OWASP LLM Security, Secrets Management & Cost Monitoring',
  subtitle: 'Defend AI apps against OWASP LLM Top-10 vulnerabilities (Prompt Injection, Insecure Output Handling, Secret/PII Leaks, Unbounded Spend) and enforce real-time dollar budgets.',
  durationMinutes: 80,
  track: 'ai-eng',
  prerequisites: ['9-2', '7.1'],
  requires: ['fastapi-endpoints', 'env-config-12factor', 'structured-logging-metrics'],
  teaches: [
    'owasp-llm-security',
    'insecure-output-handling',
    'secrets-rotation-scrubber',
    'llm-cost-circuit-breaker',
  ],
  objectives: [
    'Identify and mitigate top OWASP LLM vulnerabilities: Prompt Injection (LLM01), Insecure Output Handling (LLM02), Sensitive Info Disclosure (LLM06), and Unbounded Consumption (LLM10).',
    'Treat raw LLM output strictly as untrusted user input—escaping HTML, parameterizing SQL, and blocking SSRF metadata IPs before execution.',
    'Manage secrets safely via secret managers/KMS rotation rather than git history, and scrub PII/API keys out of telemetry logs.',
    'Build hard per-tenant daily dollar budget circuit breakers and spend-spike anomaly alerts.',
  ],
  checkWithoutNotes: [
    'Explain **OWASP LLM02 (Insecure Output Handling)** with two concrete dangerous sinks (rendering markdown/HTML or generating SQL from LLM text).',
    'If a teammate accidentally commits `OPENAI_API_KEY=sk-...` to a public repo and pushes, why is simply running `git rm .env` in a follow-up commit NOT enough?',
    'Contrast defending against **Unbounded Consumption (LLM10)** via static HTTP timeouts vs per-tenant cumulative dollar circuit breakers.',
    'Why must URL-fetching tools verify resolved IP addresses against private/loopback/cloud-metadata CIDRs (`127.0.0.1`, `169.254.169.254`) before connecting?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why AI Apps Expand Classic Web Attack Surfaces',
      paragraphs: [
        'Traditional backend endpoints obey deterministic programmer code: user text stays passive inside database fields unless explicitly interpreted. By contrast, an LLM application deliberately reads messy natural-language text (emails, uploaded PDFs, web scrapes, customer support chats), feeds that untrusted text straight into an instruction-following model, and frequently passes the model’s generated text onward into browsers, SQL databases, or API tools!',
        'That architecture creates brand-new failure modes cataloged in the **OWASP Top 10 for LLM Applications**. Attackers can embed hidden instructions inside retrieved resumes (**LLM01 Prompt Injection**), trick the model into emitting `<script>` payloads or `DROP TABLE` SQL (**LLM02 Insecure Output Handling**), coax system prompts or another customer’s secret keys into chat replies (**LLM06 Sensitive Disclosure**), or trigger infinite multi-agent loops racking up thousands of dollars overnight (**LLM10 Unbounded Consumption**).',
        'Unlike subtle accuracy drift, security and FinOps bugs can cause immediate catastrophic damage within minutes of launch. A single unauthenticated agent endpoint or unsanitized Text-to-SQL route can leak an entire database or burn through an entire annual API budget over one weekend. Security guards, log scrubbers, and real-time spend breakers belong directly inside your core application layer—not bolted on after an incident.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Sanitizing XSS/SQLi at the LLM Output Boundary',
      frontendConcept: 'Never passing untrusted user query strings directly into React `dangerouslySetInnerHTML` or raw `db.execute(f"SELECT ... {input}")`',
      aiConcept: 'OWASP LLM02: Treat Every Model Output Strictly as Untrusted Data',
      explanation:
        'A critical mindset shift for every AI engineer: **an LLM is NOT a trusted compiler—its output IS untrusted input!** Just because your system prompt politely told the model "generate safe read-only SQL" does not stop a cleverly injected PDF chunk from slipping `DELETE FROM users` or `<img src=x onerror=...>` into the completion. Enforce parameterized queries, HTML sanitization, and strict URL allowlists on the **code side** AFTER the model responds.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Blocking Insecure Output Sinks (XSS, SQLi, SSRF)',
      paragraphs: [
        'Look closely at three common sinks where LLM completions turn dangerous unless validated deterministically in Python/TypeScript. **1) Browser XSS:** if a RAG assistant renders Markdown links or HTML generated from scraped web pages directly into raw DOM (`dangerouslySetInnerHTML`), an attacker hiding `[Click here](javascript:alert(document.cookie))` executes scripts inside employee browsers! Always sanitize rendered Markdown/HTML (`DOMPurify`), strip `javascript:` / `data:` schemes, and enforce `https:`-only link protocols when displaying UI links.',
        '**2) Text-to-SQL Injection:** instead of running `conn.execute(llm_sql)` with full admin DB permissions, enforce three deterministic layers: parse AST via `sqlglot` allowing ONLY `SELECT` statements (forbidding `DROP`, `DELETE`, `INSERT`, `ATTACH`, `;` stacked queries), run against a read-only database role scoped solely to the caller’s `tenant_id` view, and attach an automatic `LIMIT 100` row cap.',
        '**3) Tool SSRF (Server-Side Request Forgery):** if an agent tool fetches URLs returned by a prompt or web snippet, an attacker asking *"Summarize `169.254.169.254/latest/meta-data/`"* can trick your cloud container into reading AWS/GCP IAM instance credentials! Resolve target hostnames down to their actual IPv4/IPv6 addresses first (to stop DNS rebinding tricks) and block loopback (`127.0.0.0/8`), private LAN (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and link-local metadata (`169.254.0.0/16`) ranges cleanly.',
      ],
    },
    {
      type: 'table',
      title: 'OWASP LLM Application Risks & Concrete Engineering Defenses',
      headers: ['OWASP Risk', 'How Attacks Happen', 'Deterministic Code Defense'],
      rows: [
        ['**LLM01: Prompt Injection**', 'Untrusted retrieved PDFs/emails hijack system instructions', 'Wrap untrusted text in XML delimiters (`<untrusted_doc>`), enforce tool RBAC & HITL on writes'],
        ['**LLM02: Insecure Output Handling**', 'LLM emits `<script>`, destructive SQL, or `eval()` payloads executed blindly', 'HTML escape / scheme filter, `SELECT`-only AST check + read-only DB user, zero `eval()`/`shell=True`'],
        ['**LLM06: Sensitive Info Disclosure**', 'PII/API keys leak via prompts, training sets, or raw telemetry logs', 'Scrub regex secrets (`sk-*`, Bearer) & PII before logs/LLM calls; store tenant ACL metadata cleanly'],
        ['**LLM10: Unbounded Consumption**', 'Giant prompts, retry storms, or agent loops burn thousands in API bills', 'Input/output `max_tokens` caps, rate limits (`429`), and per-tenant daily USD circuit breakers'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Secrets Hygiene, Rotation & Telemetry Redaction',
      paragraphs: [
        'Suppose a developer accidentally pushes `.env` containing `OPENAI_API_KEY=sk-proj-abc123...` onto GitHub. Simply deleting the line in a second commit (`git rm .env && git commit`) leaves the plaintext secret sitting permanently inside Git commit history—automated bots scrape public GitHub events within **seconds** of a push! The mandatory response order is: **1) Revoke and rotate** the leaked key immediately in the provider console first; **2) Scrub** history (`git filter-repo` if private) and verify `.gitignore`; **3) Enable push protection / secret scanning** so GitHub rejects future commits matching key patterns.',
        'At runtime, prefer platform secret managers (Vercel Env Vars, AWS Secrets Manager, GCP Secret Manager) injected strictly into process memory rather than plaintext `.env` files sitting on shared hosts. Furthermore, remember that debug logs, third-party trace dashboards, and evaluation datasets frequently outlive single requests for months: scrub accidental credentials (`sk-...`, `Bearer ...`, `ghp_...`) AND sensitive customer PII (emails, SSNs, card numbers) BEFORE persisting logs or transmitting traces outside your VPC.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Real-Time Cost Monitoring & Hard Budget Circuit Breakers',
      paragraphs: [
        'Imagine an enterprise support tenant configures an automated webhook calling your `/v1/ask` endpoint—and introduces an accidental infinite feedback loop where your bot’s reply triggers another webhook every two seconds! Per-minute rate limits (`60 req/min`) might still let `86,400` calls run over 24 hours, costing hundreds or thousands of dollars before weekly billing alert emails ever arrive in your inbox.',
        'Protect every multi-tenant platform with a **Cumulative USD Budget Circuit Breaker**. First, enforce a pre-flight ceiling BEFORE forwarding huge payloads upstream (`worst_case_usd = (prompt_tokens_est * p_in + max_tokens * p_out) / 1e6`): if adding that estimate exceeds `tenant.daily_cap_usd`, reject immediately without burning upstream tokens. Next, after each completed call, compute exact actual token spend, atomically increment the tenant’s rolling daily Redis spend counter, fire a soft `80%` threshold Slack/PagerDuty alert, and hard-trip `HTTP 429` the instant spend touches `100%` of the cap!',
      ],
    },
    {
      type: 'prose',
      heading: 'Common LLM Security & FinOps Mistakes & How to Debug Them',
      paragraphs: [
        '1) Relying solely on a polite system prompt line (`"Please never leak secrets or emit dangerous SQL"`) as your security boundary: system prompts are probabilistic nudges, NOT access control boundaries! Enforce permissions, SQL read-only roles, and output sanitization strictly in deterministic Python/TypeScript code after the model responds.',
        '2) Executing LLM-generated Python snippets inside the API server process (`exec(code)` / `subprocess.run(cmd, shell=True)`): even benign-looking formatting bugs turn into full remote server compromise. Run code generation exclusively inside isolated ephemeral sandboxes (`no network`, `read-only rootfs`, tight CPU/RAM limits, and short execution deadlines).',
        '3) Logging full unredacted HTTP headers (`Authorization: Bearer ...`) inside debug error loggers or third-party APM dashboards: always strip or mask `Authorization`, `Cookie`, and `x-api-key` headers plus regex token strings inside middleware serializers before emitting logs.',
        '4) Setting a high monthly account credit limit on OpenAI/Anthropic without per-tenant daily sub-budgets: one compromised client key or looping integration script can burn the entire company’s shared upstream provider allowance across all tenants unless each tenant carries an isolated spend cap enforced before upstream inference.',
        '5) Blocking naive SQL keywords with fragile substring checks (`if "drop" in sql.lower()`) while allowing comments (`DROP/**/TABLE`), stacked semicolons (`SELECT 1; DELETE FROM users`), or legitimate column names like `"dropped_orders"`: parse SQL into a structured AST (`sqlglot`) allowing strictly single-statement `SELECT` nodes against an explicit table allowlist.',
        '6) Assuming "deleted `.env` commit" fixed a leaked key without rotating it in the vendor dashboard: treat any key that ever touched Git history or client JS bundles (`NEXT_PUBLIC_*`) as permanently compromised and rotate it immediately at the provider.',
        '7) Allowing outbound SSRF URL fetches to trust raw hostname checks (`"localhost" not in url`) instead of resolving DNS first: attackers bypass string checks easily with DNS records pointing to `127.0.0.1`, integer IP encoding, or cloud metadata addresses (`169.254.169.254`) unless resolved IP addresses are verified explicitly.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 8.3 Recap: Defense-in-Depth for AI Apps',
      body: '- Treat all LLM completions as untrusted input: sanitize HTML/Markdown, block `javascript:` links, and never pass outputs to `eval()` or raw SQL.\n- Guard Text-to-SQL with single-statement `SELECT`-only AST parsing + read-only tenant DB views.\n- Block SSRF targets on private/loopback/cloud-metadata IPs before tool HTTP fetches.\n- Rotate leaked keys immediately in the vendor dashboard and scrub `sk-` / Bearer / PII patterns before logging.\n- Enforce pre-flight + cumulative per-tenant USD budget circuit breakers (`80%` alert, `100%` hard `429` cutoff).',
    },
    {
      type: 'python-lab',
      labId: 'lab-9-3-xss-sqli',
      difficulty: 'guided',
      requires: ['insecure-output-handling'],
      title: 'Lab 8.3A: Output Sink Guard (SQLi AST & SSRF URL Blocker)',
      prompt:
        'Implement two OWASP LLM02 output validators: (1) `is_safe_readonly_sql(sql: str) -> bool`: strip trailing `;`, reject stacked `;`, reject comments (`--` or `/*`), require starting with `SELECT `, and reject destructive/admin keywords (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `ATTACH`, `PRAGMA`) as whole words; (2) `is_safe_external_host(host: str) -> bool`: reject empty hosts, `"localhost"`, `".local"`, `".internal"`, and private/loopback/metadata IPv4s (`ipaddress.ip_address(host)` where `is_private`, `is_loopback`, `is_link_local`, or `is_reserved` is True).',
      starterCode: `import ipaddress, re

def is_safe_readonly_sql(sql: str) -> bool:
    # 1. Strip whitespace and single trailing semicolon
    # 2. Reject embedded ';', '--', '/*'
    # 3. Require uppercase starts with 'SELECT ' and no forbidden DML/DDL whole words
    pass

def is_safe_external_host(host: str) -> bool:
    # Reject localhost, .local/.internal, and private/loopback/link-local IPs via ipaddress
    pass`,
      testCode: `assert is_safe_readonly_sql("SELECT user_id, total FROM summary WHERE tenant_id = 5;") is True
assert is_safe_readonly_sql("SELECT dropped_items FROM orders") is True  # substring 'dropped' != DROP!
assert is_safe_readonly_sql("SELECT 1; DROP TABLE users") is False
assert is_safe_readonly_sql("DELETE FROM orders WHERE 1=1") is False
assert is_safe_readonly_sql("SELECT * FROM users -- bypass") is False
assert is_safe_external_host("api.github.com") is True
assert is_safe_external_host("169.254.169.254") is False
assert is_safe_external_host("127.0.0.1") is False
assert is_safe_external_host("10.0.2.15") is False
assert is_safe_external_host("localhost") is False
print("PASS: SQLi and SSRF metadata validators cleanly blocked unsafe LLM outputs!")`,
      solutionCode: `import ipaddress, re

FORBIDDEN_SQL = re.compile(r"\\b(DROP|DELETE|UPDATE|INSERT|ALTER|ATTACH|PRAGMA|CREATE|REPLACE|TRUNCATE)\\b", re.IGNORECASE)

def is_safe_readonly_sql(sql: str) -> bool:
    s = sql.strip()
    if s.endswith(";"):
        s = s[:-1].strip()
    if not s or ";" in s or "--" in s or "/*" in s:
        return False
    if not re.match(r"^SELECT\\s+", s, re.IGNORECASE):
        return False
    return FORBIDDEN_SQL.search(s) is None

def is_safe_external_host(host: str) -> bool:
    h = host.strip().lower()
    if not h or h == "localhost" or h.endswith((".local", ".internal")):
        return False
    try:
        ip = ipaddress.ip_address(h)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    except ValueError:
        pass
    return True`,
      hint: 'Use word boundaries `\\b...\\b` in `FORBIDDEN_SQL` so safe column names like `dropped_items` are not falsely flagged!',
      hints: [
        'Strip one optional trailing `;` before rejecting any remaining `;`, `--`, or `/*` tokens.',
        'Check `re.match(r"^SELECT\\s+", s, re.IGNORECASE)` and whole-word regex `\\b(DROP|DELETE|...)\\b`.',
        'Parse `ipaddress.ip_address(h)` inside `try/except ValueError:` to catch IPv4/IPv6 private, loopback, and `169.254.169.254` metadata addresses.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-9-3-budget',
      difficulty: 'spec',
      requires: ['llm-cost-circuit-breaker'],
      title: 'Lab 8.3B: Per-Tenant Daily USD Spend Circuit Breaker',
      prompt:
        'Implement `TenantBudgetGuard` tracking daily USD spend per tenant (`spent: dict[str, float]`). Implement `check_and_record(tenant_id: str, tokens_in: int, tokens_out: int, price_in_per_1m: float, price_out_per_1m: float, daily_limit_usd: float) -> dict`: compute `req_cost`, if `current_spend + req_cost > daily_limit_usd` return `{"allowed": False, "status": 429, "spent_usd": current_spend, "alert": "hard_cap"}` WITHOUT adding cost; else increment `spent[tenant_id]`, set `"alert"` to `"warn_80pct"` if new total `>= 0.8 * daily_limit_usd` else `"ok"`, and return `{"allowed": True, "status": 200, "spent_usd": round(new_total, 6), "alert": alert}`.',
      starterCode: `class TenantBudgetGuard:
    def __init__(self):
        self.spent: dict[str, float] = {}

    def check_and_record(
        self,
        tenant_id: str,
        tokens_in: int,
        tokens_out: int,
        price_in_per_1m: float,
        price_out_per_1m: float,
        daily_limit_usd: float,
    ) -> dict:
        # Compute req_cost, block with 429 if exceeding daily_limit_usd, else record and flag >=80% warning
        pass`,
      testCode: `g = TenantBudgetGuard()
# 1M input @ $1.00 + 0.5M output @ $2.00 -> $2.00 cost against $3.00 daily limit
r1 = g.check_and_record("acme", 1_000_000, 500_000, 1.0, 2.0, 3.0)
assert r1["allowed"] is True and r1["status"] == 200 and abs(r1["spent_usd"] - 2.0) < 1e-6 and r1["alert"] == "ok"
# Another $0.50 -> $2.50 total (>= 80% of $3.00 = $2.40 -> warn_80pct!)
r2 = g.check_and_record("acme", 500_000, 0, 1.0, 2.0, 3.0)
assert r2["allowed"] is True and r2["alert"] == "warn_80pct"
# Another $1.00 -> would hit $3.50 > $3.00 -> blocked 429, spent stays $2.50!
r3 = g.check_and_record("acme", 1_000_000, 0, 1.0, 2.0, 3.0)
assert r3["allowed"] is False and r3["status"] == 429 and abs(r3["spent_usd"] - 2.5) < 1e-6
print("PASS: Per-tenant FinOps budget guard warned at 80% and tripped hard 429 before overspend!")`,
      solutionCode: `class TenantBudgetGuard:
    def __init__(self):
        self.spent: dict[str, float] = {}

    def check_and_record(
        self,
        tenant_id: str,
        tokens_in: int,
        tokens_out: int,
        price_in_per_1m: float,
        price_out_per_1m: float,
        daily_limit_usd: float,
    ) -> dict:
        current = self.spent.get(tenant_id, 0.0)
        req_cost = (tokens_in / 1_000_000.0) * price_in_per_1m + (tokens_out / 1_000_000.0) * price_out_per_1m
        if current + req_cost > daily_limit_usd:
            return {
                "allowed": False,
                "status": 429,
                "spent_usd": round(current, 6),
                "alert": "hard_cap",
            }
        new_total = current + req_cost
        self.spent[tenant_id] = new_total
        alert = "warn_80pct" if new_total >= 0.8 * daily_limit_usd else "ok"
        return {
            "allowed": True,
            "status": 200,
            "spent_usd": round(new_total, 6),
            "alert": alert,
        }`,
      hint: 'Check `if current + req_cost > daily_limit_usd:` BEFORE mutating `self.spent[tenant_id]`.',
      hints: [
        'Calculate `req_cost = (tokens_in / 1e6) * price_in_per_1m + (tokens_out / 1e6) * price_out_per_1m`.',
        'If `current + req_cost > daily_limit_usd`, return `allowed=False, status=429` without adding `req_cost`.',
        'Otherwise update `self.spent[tenant_id] = new_total` and check `new_total >= 0.8 * daily_limit_usd`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-9-3-redact',
      difficulty: 'debug',
      requires: ['secrets-rotation-scrubber'],
      title: 'Lab 8.3C: Fix Telemetry Secret & PII Redaction Scrubber',
      prompt:
        'A broken log scrubber misses `sk-...` API keys containing hyphens/underscores, leaves `Bearer ...` tokens exposed in headers, AND misses email PII! Fix `scrub_sensitive_text(text: str) -> str` so: (1) `Bearer <token>` headers become `"Bearer [REDACTED]"`; (2) `sk-[A-Za-z0-9_-]{8,}` API keys become `"[REDACTED_KEY]"`; (3) email addresses (`user@domain.tld`) become `"[REDACTED_EMAIL]"`.',
      starterCode: `import re

def scrub_sensitive_text(text: str) -> str:
    # BUG: pattern misses hyphens/underscores in sk-proj-..., Bearer headers, and emails!
    return re.sub(r"sk-[a-z0-9]{8,}", "[REDACTED_KEY]", text)`,
      testCode: `sample = "Auth failed: Authorization: Bearer eyJhbGci.123_abc using sk-proj-AbC_987654 for alice.kim@corp.io"
cleaned = scrub_sensitive_text(sample)
assert "eyJhbGci" not in cleaned
assert "sk-proj-AbC_987654" not in cleaned
assert "alice.kim@corp.io" not in cleaned
assert "Bearer [REDACTED]" in cleaned and "[REDACTED_KEY]" in cleaned and "[REDACTED_EMAIL]" in cleaned
print("PASS: Log scrubber masked Bearer tokens, sk- API keys, and email PII cleanly!")`,
      solutionCode: `import re

def scrub_sensitive_text(text: str) -> str:
    out = re.sub(r"Bearer\\s+[A-Za-z0-9._-]+", "Bearer [REDACTED]", text)
    out = re.sub(r"sk-[A-Za-z0-9_-]{8,}", "[REDACTED_KEY]", out)
    out = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", "[REDACTED_EMAIL]", out)
    return out`,
      hint: 'Chain three `re.sub` patterns covering `Bearer\\s+[A-Za-z0-9._-]+`, `sk-[A-Za-z0-9_-]{8,}`, and standard email regex.',
      hints: [
        'Use `[A-Za-z0-9_-]{8,}` after `sk-` so uppercase letters, hyphens (`sk-proj-...`), and underscores match.',
        'Mask Bearer tokens with `re.sub(r"Bearer\\s+[A-Za-z0-9._-]+", "Bearer [REDACTED]", ...)`.',
        'Scrub emails via `r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q9-3-1',
      type: 'multiple-choice',
      question: 'Which OWASP LLM risk occurs when a web app renders unescaped LLM-generated HTML containing `<script>` or `javascript:` links directly into the DOM?',
      options: [
        'Model Denial of Service caused by missing Pydantic query length bounds',
        '**LLM02: Insecure Output Handling** — treating model completions as trusted code/HTML',
        'Covariate Drift triggered by changing customer browser locales over seasonal holidays',
        'Gradient Symmetry Collapse inside pretrained Transformer feed-forward weights',
      ],
      correctIndex: 1,
      explanation: 'OWASP LLM02 occurs whenever applications pass untrusted model outputs blindly into XSS DOM sinks, raw SQL queries, or shell execution without sanitization.',
    },
    {
      id: 'q9-3-2',
      type: 'multiple-choice',
      question: 'A teammate accidentally pushes `.env` containing `OPENAI_API_KEY=sk-...` to a public GitHub repo. What is Step 1 BEFORE rewriting Git history?',
      options: [
        'Run `git rm .env` and push a new commit deleting the file cleanly from the tip branch',
        'Revoke and rotate the exposed API key immediately in the provider console',
        'Wrap the key inside a `.dockerignore` entry so local builds skip copying `.env` onward',
        'Lower the model’s sampling temperature down to `0.0` so prompts stop echoing keys',
      ],
      correctIndex: 1,
      explanation: 'Follow-up deletion commits leave the secret inside earlier Git commits scanned immediately by scrapers; revoke/rotate the compromised key FIRST.',
    },
    {
      id: 'q9-3-3',
      type: 'spot-bug',
      question: 'Why does this Text-to-SQL guardrail fail against real attackers?',
      code: `if "drop" in llm_sql.lower() or "delete" in llm_sql.lower():
    raise ValueError("Unsafe SQL")
return conn.execute(llm_sql).fetchall()`,
      options: [
        'Calling `.lower()` converts table column names into invalid uppercase Postgres tokens',
        'SQLite connections throw `SyntaxError` whenever `fetchall()` follows a parameterized read query',
        'It blocks innocent words like `dropped_at`, allows `UPDATE`, stacked `;`, or `PRAGMA`',
        'Text-to-SQL requires wrapping `llm_sql` inside `json.dumps()` before executing on SQLite',
      ],
      correctIndex: 2,
      explanation: 'Naive substring blacklists suffer false positives (`dropped_at`) AND miss dangerous keywords (`UPDATE`, `ATTACH`, `ALTER`, `INSERT`, stacked `;`). Parse SQL with a read-only allowlist AST + read-only DB role.',
    },
    {
      id: 'q9-3-4',
      type: 'multiple-choice',
      question: 'Why must an agent’s web-fetching tool block target IP `169.254.169.254` and `127.0.0.1`?',
      options: [
        'To block **SSRF** attacks from reading local services or cloud instance credentials',
        'Because IPv4 dotted-decimal addresses overflow UTF-8 Byte-Pair Encoding vocabularies',
        'Because FastAPI automatically converts private IP strings into `HTTP 422` schema exceptions',
        'To ensure Redis response caches store domain hostnames rather than hexadecimal SHA-256 digests',
      ],
      correctIndex: 0,
      explanation: 'Prompt-injected agents fetching `169.254.169.254` expose cloud IAM metadata tokens (SSRF); validate resolved IPs against private/loopback/link-local blocks first.',
    },
    {
      id: 'q9-3-5',
      type: 'predict-output',
      question: 'A tenant has a `$10.00` daily spend limit and currently sits at `$9.60`. A new request estimated at `$0.85` arrives. What should your budget circuit breaker do?',
      options: [
        'Execute the LLM call anyway because `$9.60` remained strictly below the `$10.00` threshold beforehand',
        'Truncate the LLM’s response midway once spend hits `$10.00` and bill the tenant `$10.45`',
        'Reject the call upfront with `HTTP 429` (`$9.60 + $0.85 > $10.00`) without spending',
        'Route the request transparently onto a `70B BF16` self-hosted cluster at zero dollar cost',
      ],
      correctIndex: 2,
      explanation: 'Checking `current + estimated > limit` BEFORE invoking upstream paid models protects against overshooting hard limits cleanly.',
    },
    {
      id: 'q9-3-6',
      type: 'multi-select',
      question: 'Which two controls belong together inside defense-in-depth for an agent executing database or email tools?',
      options: [
        'Read-only DB credentials scoped to the verified caller `tenant_id` plus `SELECT`-only AST validation',
        'Scrubbing `Bearer` tokens, `sk-*` keys, and email PII out of centralized log streams',
        'Adding `"Do not run DROP TABLE or leak keys"` once inside the system prompt without code checks',
        'Putting secret provider keys inside `NEXT_PUBLIC_OPENAI_KEY` so frontend code logs latency directly',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Database role isolation + AST allowlists enforce least privilege deterministically, and log scrubbing prevents secrets/PII persistence.',
    },
    {
      id: 'q9-3-7',
      type: 'numeric',
      question: 'An API call consumes `2,000,000` input tokens at `\\$0.50 / 1M` and `500,000` output tokens at `\\$2.00 / 1M`. What is the exact cost of that request in US dollars?',
      options: [],
      correctIndex: 0,
      correctNumber: 2.0,
      tolerance: 0.001,
      unit: 'USD',
      explanation: '`(2.0 * $0.50) + (0.5 * $2.00) = $1.00 + $1.00 = $2.00`.',
    },
    {
      id: 'q9-3-8',
      type: 'multiple-choice',
      question: 'What is the fatal security flaw with storing an API key in a browser `NEXT_PUBLIC_*` environment variable?',
      options: [
        'Next.js strips uppercase characters from `NEXT_PUBLIC_*` strings during production compilation',
        'Browser localStorage automatically expires `NEXT_PUBLIC_*` strings after twenty-four hours',
        'Next.js inlines `NEXT_PUBLIC_*` values straight into public client JavaScript bundles anyone can read',
        'CORS preflight requests block any server route whenever `NEXT_PUBLIC_*` variables exist',
      ],
      correctIndex: 2,
      explanation: 'Any `NEXT_PUBLIC_*` variable ships plaintext inside frontend JS to every visitor; keep secret keys strictly inside server-side routes/containers.',
    },
    {
      id: 'q9-3-9',
      type: 'ordering',
      question: 'Order the emergency response steps when a private `sk-...` API key is accidentally pushed to GitHub:',
      items: [
        'Revoke and rotate the leaked key immediately in the API provider console',
        'Verify no unauthorized usage or runaway billing spikes occurred during exposure',
        'Remove `.env` from tracking, add `.env*` to `.gitignore`, and scrub commit history if needed',
        'Enable repository secret scanning / push protection to block future accidental commits',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Rotate compromised credentials IMMEDIATELY before touching Git history cleanup, then audit bills and harden CI push protection.',
    },
  ],
};
