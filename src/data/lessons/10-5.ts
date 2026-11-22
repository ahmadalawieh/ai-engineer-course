import type { Lesson } from '@/types/course';

export const lesson10_5: Lesson = {
  id: '10-5',
  moduleId: 'mod-10',
  number: '10.5',
  title: 'Advanced Retrieval: GraphRAG, Parent-Child, Text-to-SQL & Layout OCR',
  subtitle: 'Solve multi-hop, global synthesis, structured database, and complex table PDF queries where naive flat vector chunking breaks down.',
  durationMinutes: 85,
  track: 'ai-eng',
  prerequisites: ['6.3', '10.3'],
  requires: ['rag-citations', 'cosine-similarity'],
  teaches: ['parent-child-rag', 'graph-rag-retrieval', 'safe-text-to-sql'],
  competencies: ['mid-hybrid-rag', 'sr-sys-architecture', 'sr-security-gov'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Implement Parent-Child (small-to-big) retrieval so precise sentence-level matches expand into full surrounding context windows.',
    'Identify multi-hop and corpus-wide synthesis questions where GraphRAG entity/community graphs beat flat top-k vector chunks.',
    'Design read-only Text-to-SQL pipelines featuring schema pruning, AST/SELECT-only guards, row-level tenant predicates, and `LIMIT` enforcement.',
    'Preserve reading order and Markdown table structure during PDF/OCR ingestion before splitting chunks.',
  ],
  checkWithoutNotes: [
    'How does Parent-Child retrieval resolve the tension between small crisp embeddings and full-paragraph generation context?',
    'Give one question category where flat vector top-k works great and one where GraphRAG excels.',
    'List four mandatory code guardrails before executing LLM-generated SQL against production databases.',
    'Why does naive PDF plain-text extraction destroy financial and policy table QA accuracy?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Where Flat Top-k Chunking Fails Completely',
      paragraphs: [
        'Standard top-k Hybrid RAG excels at factoid lookup ("What is the return window for invoice SKU E-402?"). Yet two major real-world workloads shatter naive flat chunking immediately: holistic/multi-hop synthesis ("Which three regional suppliers share sub-tier dependencies cited across Q1–Q4 audit reports?") and exact structured aggregations ("List our top 10 delinquent accounts in EMEA sorted by balance").',
        'If your chunk size is tiny (120 tokens), vector search finds the exact sentence cleanly, but the LLM receives chopped fragments missing table headers or surrounding exceptions. If your chunk size is huge (1,500 tokens), unrelated topics blur the embedding vector and retrieval precision plunges.',
        'The mental model is a library research desk using three specialized tools rather than forcing one hammer everywhere: pinpoint index cards pointing to full book chapters (Parent-Child RAG), an entity relationship whiteboard (GraphRAG), and direct queries to the structured ledger (safe Text-to-SQL).',
      ],
    },
    {
      type: 'prose',
      heading: 'Parent-Child Chunking, Layout-Aware PDFs & GraphRAG Trade-Offs',
      paragraphs: [
        '**Parent-Child (Small-to-Big) Retrieval** solves the chunk-size dilemma cleanly: split each section into crisp 150–250 token child chunks for high-precision dense/BM25 matching, store a `parent_id` pointing to the surrounding 800–1,200 token section, and deduplicate expanded parents before prompting the model.',
        '**Layout-Aware Document Parsing** runs BEFORE chunking. Multi-column PDFs and bordered financial tables scrambled by naive `pdftotext` turn rows into unreadable gibberish. Modern parsers extract bounding boxes, preserve table structure into Markdown/HTML tables, keep `[Doc > Section]` headers attached, and never split a table across chunk boundaries mid-row.',
        '**GraphRAG** extracts `(entity, relation, entity)` triples plus community summaries at ingestion time so queries traverse 1-to-2-hop entity links or summarize whole themes. Reserve GraphRAG strictly for multi-hop investigative or thematic corpora—its upfront indexing cost and LLM extraction tokens are far higher than Hybrid RRF + Reranking.',
      ],
    },
    {
      type: 'prose',
      heading: 'Safe Read-Only Text-to-SQL Architecture',
      paragraphs: [
        'Never ask RAG over serialized CSV text to compute sums, counts, or date filters—LLMs hallucinate arithmetic across retrieved rows. Instead route quantitative queries to a dedicated **Text-to-SQL** tool using four strict defense layers:',
        '1) Connect via a strictly read-only database role (`GRANT SELECT` on allowlisted views only, statement timeout <= 5 seconds).',
        '2) Prune schema context per query so the model sees only relevant tables with explicit column comments.',
        '3) Parse the generated SQL cleanly before execution: verify a single statement starting with `SELECT` or `WITH`, ban `DROP/UPDATE/DELETE/INSERT/ALTER/COPY/ATTACH`, restrict table names to an explicit allowlist, and force a bounded `LIMIT` clause.',
        '4) Inject mandatory tenant scoping (`tenant_id = $auth_tenant`) server-side in a parameterized view or outer wrapper so prompt tricks cannot read another company’s ledger.',
      ],
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: Naive Text-to-SQL Exposes Billing Tables',
      paragraphs: [
        'A SaaS analytics copilot fed its entire 60-table schema into an unconstrained Text-to-SQL prompt connected via the main application DB superuser credentials. A curious user asked "show schema comments and list all customer emails across accounts", causing the model to query `users` and `invoices` globally without any `tenant_id` predicate.',
        'Locking the connection to read-only views pre-filtered by session `tenant_id`, validating single-statement `SELECT` ASTs, pruning allowed tables to `analytics_events_v`, and adding golden cross-tenant CI probes eliminated cross-account leakage permanently.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Retrieval Architecture Selection',
      headers: ['Architecture', 'Strengths', 'Latency & Cost', 'Avoid When'],
      rows: [
        ['Parent-Child Hybrid RAG', 'High search precision + rich context', 'Low cost, fast (<200ms)', 'Needs SQL math or cross-doc global themes'],
        ['GraphRAG (Entities + Communities)', 'Multi-hop links & corpus-wide synthesis', 'High ingestion LLM cost & latency', 'Simple FAQ/policy doc QA (overkill)'],
        ['Safe Read-Only Text-to-SQL', 'Exact counts, sums, joins, sorting', 'Fast DB execution + 1 small LLM call', 'Unstructured policy prose & PDFs'],
        ['Layout-Aware Table OCR + RAG', 'Preserves column/row alignment in PDFs', 'Moderate ingestion compute', 'Pure plain-text Markdown repositories'],
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-10-5-parentchild',
      title: 'Lab 10.5a: Parent-Child Small-to-Big Retriever',
      prompt: 'Implement `retrieve_parents(query, children, parents, top_k_parents=2) -> list[str]`: score each child by matching word count against `query` (`sim + hits`), keep descending child order, expand each child `parent_id` to `parents[pid]`, deduplicate `parent_id` preserving first rank, and return up to `top_k_parents` parent texts.',
      difficulty: 'guided',
      starterCode: `def retrieve_parents(query: str, children: list[dict], parents: dict[str, str], top_k_parents: int = 2) -> list[str]:
    # Score children, expand to deduplicated parent_ids in ranked order
    return []`,
      testCode: `PARENTS = {
    "p1": "Section 4 Refund Table: Tier A=14d, Tier B=30d.",
    "p2": "Section 9 Shipping: Standard 5 days.",
}
CHILDREN = [
    {"id": "c1", "parent_id": "p1", "text": "Tier A=14d refund", "sim": 0.85},
    {"id": "c2", "parent_id": "p1", "text": "Refund Table policy", "sim": 0.80},
    {"id": "c3", "parent_id": "p2", "text": "Standard shipping days", "sim": 0.70},
]
res = retrieve_parents("refund tier table", CHILDREN, PARENTS, top_k_parents=2)
assert len(res) == 2 and res[0] == PARENTS["p1"], f"Expected p1 deduped first, got {res}"
print("PASS: Lab 10.5a parent-child retrieval verified!")`,
      solutionCode: `def retrieve_parents(query: str, children: list[dict], parents: dict[str, str], top_k_parents: int = 2) -> list[str]:
    q_words = set(query.lower().split())
    def score(c: dict) -> float:
        hits = sum(1 for w in q_words if w in c["text"].lower())
        return hits + float(c.get("sim", 0.0))
    ranked = sorted(children, key=score, reverse=True)
    seen = set()
    out = []
    for c in ranked:
        pid = c["parent_id"]
        if pid in seen or pid not in parents:
            continue
        seen.add(pid)
        out.append(parents[pid])
        if len(out) >= top_k_parents:
            break
    return out`,
      hint: 'Track `seen = set()` of `parent_id`s while iterating sorted child matches so duplicate hits from the same parent merge cleanly.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-5-graph',
      title: 'Lab 10.5b: Two-Hop Entity Graph Traversal',
      prompt: 'Implement `two_hop_neighbors(seed_entity: str, edges: list[tuple[str, str, str]]) -> set[str]` returning all entities reachable within 1 or 2 undirected hops from `seed_entity` (excluding `seed_entity` itself). Each edge is `(src, relation, dst)`.',
      difficulty: 'spec',
      starterCode: `def two_hop_neighbors(seed_entity: str, edges: list[tuple[str, str, str]]) -> set[str]:
    # Build undirected adjacency list and collect 1-hop + 2-hop nodes excluding seed_entity
    return set()`,
      testCode: `EDGES = [
    ("Supplier_A", "supplies", "Chip_X"),
    ("Chip_X", "used_in", "Router_Z"),
    ("Router_Z", "sold_to", "Bank_1"),
]
res = two_hop_neighbors("Supplier_A", EDGES)
assert res == {"Chip_X", "Router_Z"}, f"Expected 2-hop set, got {res}"
print("PASS: Lab 10.5b two-hop GraphRAG expansion verified!")`,
      solutionCode: `def two_hop_neighbors(seed_entity: str, edges: list[tuple[str, str, str]]) -> set[str]:
    adj = {}
    for s, _, d in edges:
        adj.setdefault(s, set()).add(d)
        adj.setdefault(d, set()).add(s)
    hop1 = adj.get(seed_entity, set())
    hop2 = set()
    for node in hop1:
        hop2.update(adj.get(node, set()))
    return (hop1 | hop2) - {seed_entity}`,
      hint: 'Populate an adjacency dict symmetrically (`s -> d` and `d -> s`), then union 1-hop and 2-hop neighbors minus `{seed_entity}`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-5-sqlguard',
      title: 'Lab 10.5c: Read-Only Text-to-SQL Validator (Debug & Harden)',
      prompt: 'Fix `validate_readonly_sql(sql: str, allowed_tables: set[str]) -> tuple[bool, str]` to enforce: (1) no `;` multi-statements, (2) starts with `SELECT`, (3) zero forbidden keywords (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`), (4) only tables from `allowed_tables` appear after `FROM`/`JOIN`, and (5) explicit `LIMIT` present.',
      difficulty: 'debug',
      starterCode: `import re

def validate_readonly_sql(sql: str, allowed_tables: set[str]) -> tuple[bool, str]:
    # BUG: allows multi-statement "; DROP", unallowlisted tables, and missing LIMIT!
    if sql.strip().upper().startswith("SELECT"):
        return True, "ok"
    return False, "must_select"`,
      testCode: `ALLOWED = {"orders_view", "products_view"}
assert validate_readonly_sql("SELECT id, total FROM orders_view LIMIT 50", ALLOWED)[0] is True
assert validate_readonly_sql("SELECT id FROM orders_view; DROP TABLE users;", ALLOWED)[0] is False
assert validate_readonly_sql("SELECT * FROM private_users LIMIT 10", ALLOWED)[0] is False
assert validate_readonly_sql("SELECT id FROM orders_view", ALLOWED)[0] is False
assert validate_readonly_sql("DELETE FROM orders_view", ALLOWED)[0] is False
print("PASS: Lab 10.5c read-only Text-to-SQL guard verified!")`,
      solutionCode: `import re

def validate_readonly_sql(sql: str, allowed_tables: set[str]) -> tuple[bool, str]:
    clean = sql.strip()
    if ";" in clean.rstrip(";"):
        return False, "multi_statement_blocked"
    up = clean.upper()
    if not up.startswith("SELECT "):
        return False, "select_only"
    for bad in ("DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "ATTACH"):
        if re.search(rf"\\b{bad}\\b", up):
            return False, f"forbidden_{bad.lower()}"
    if not re.search(r"\\bLIMIT\\s+\\d+\\b", up):
        return False, "limit_required"
    tables = re.findall(r"\\b(?:FROM|JOIN)\\s+([A-Za-z_][A-Za-z0-9_]*)", clean, flags=re.IGNORECASE)
    if not tables or any(t.lower() not in allowed_tables for t in tables):
        return False, "table_not_allowed"
    return True, "ok"`,
      hint: 'Use word-boundary regexes `\\b(?:FROM|JOIN)\\s+([A-Za-z_][A-Za-z0-9_]*)` and verify `\\bLIMIT\\s+\\d+\\b`.',
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & Debugging Advanced Retrieval',
      paragraphs: [
        'Three practical pitfalls explain most disappointing RAG upgrades. First, **returning multiple child chunks from the same parent without deduplication**: if three child snippets inside Section 4 match top-k, stuffing Section 4 three identical times wastes 3,000 input tokens and crowds out diverse evidence from Sections 7 and 9. Always track a `seen_parent_ids` set cleanly before assembling context.',
        'Second, **bypassing table structure during chunking**: extracting multi-column PDF spreadsheets as naive raw strings turns `$420` into orphaned floating numbers detached from `"Q3 Refunds"`. Preserve Markdown or HTML table boundaries with repeated column header rows if tables must be split.',
        'Third, **evaluating Text-to-SQL solely on syntax validity**: checking whether SQL parses cleanly ignores semantic traps like `JOIN` fan-out double-counting or forgotten `WHERE tenant_id = ...` filters. Run golden SQL result-set assertions comparing returned rows directly against verified reference queries alongside negative cross-tenant tests.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked End-to-End Example: Routing Qualitative Docs vs Tabular Aggregations',
      paragraphs: [
        'Consider an internal finance copilot answering two back-to-back employee questions. First question: "What exceptions waive late invoice penalties under Enterprise Tier B?" A query classifier sends this straight to Parent-Child Hybrid RAG. Two tiny child chunks inside Appendix C match `"Enterprise Tier B"` and `"late invoice penalties"`, expanding cleanly into their full deduplicated 950-token parent policy section with intact Markdown exception table headers.',
        'Second question: "How much total credit did Enterprise Tier B tenants receive in Q4?" Rather than stuffing 30 billing CSV rows into vector chunks, the router sends this to our guarded Text-to-SQL pipeline. Schema pruning shares ONLY `credits_tenant_view` (`tenant_id, quarter, amount_usd`), AST validation ensures single `SELECT ... LIMIT 100`, Postgres executes with the caller session `tenant_id`, and the assistant returns the exact verified dollar sum cleanly.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'Use Parent-Child chunking to pair small high-recall search chunks with large full-section generation context.',
        'Reserve GraphRAG for genuine multi-hop or corpus-wide synthesis; Hybrid RRF + Reranking remains faster and cheaper for standard lookup.',
        'Never run RAG arithmetic over tabular rows when read-only AST-checked, tenant-scoped Text-to-SQL answers exactly.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q10-5-1',
      question: 'Why does Parent-Child RAG index tiny ~200-token chunks while passing ~1,000-token parent sections to the generator LLM?',
      options: [
        'Small chunks sharpen search match while parent sections preserve context',
        'Hosted vector databases reject UTF-8 documents exceeding two hundred fifty raw characters',
        'Full parent sections automatically quantize float32 embeddings down into compact 8-bit integers',
        'Large context windows remove every requirement for validating inline document citations',
      ],
      correctIndex: 0,
      explanation: 'Small chunks avoid embedding dilution during search; expanding to parent blocks preserves headers and table rows.',
    },
    {
      id: 'q10-5-2',
      question: 'Which user question clearly favors safe Text-to-SQL over flat vector RAG?',
      options: [
        '"Summarize our remote travel and conference expense policy for new contractors"',
        '"Sum refunded USD grouped by region for Q3 sorted descending"',
        '"Explain the contractual rationale behind our fourteen-day enterprise cancellation SLA window"',
        '"Draft an empathetic follow-up email referencing refund policy subsection 3b cleanly"',
      ],
      correctIndex: 1,
      explanation: 'Exact GROUP BY sums across hundreds of rows belong in SQL rather than top-k approximate text chunks.',
    },
    {
      id: 'q10-5-3',
      type: 'predict-output',
      question: 'In `validate_readonly_sql`, what happens on `"SELECT id FROM users_secret LIMIT 20"` when `allowed_tables = {"orders_view"}`?',
      code: `ok, reason = validate_readonly_sql("SELECT id FROM users_secret LIMIT 20", {"orders_view"})`,
      options: [
        '(True, "ok") cleanly executes SELECT queries',
        '(False, "limit_required") due to low LIMIT',
        '(False, "table_not_allowed")',
        '(True, "users_secret") using implicit view alias',
      ],
      correctIndex: 2,
      explanation: 'Every table extracted after FROM/JOIN must belong to the explicit allowlist.',
    },
    {
      id: 'q10-5-4',
      type: 'spot-bug',
      question: 'Why does splitting PDF financial statements strictly every 500 characters corrupt table QA?',
      options: [
        'Enterprise PDF binaries encode numeric columns backwards inside UTF-16 character streams',
        'Mid-row cuts detach numbers cleanly from column headers',
        'Dense sentence embeddings fail to tokenize floating-point currency decimals above zero',
        'Five hundred ASCII characters routinely exceed standard FastAPI HTTP POST payload limits',
      ],
      correctIndex: 1,
      explanation: 'Without column/row headers intact inside each table chunk, numbers lose all semantic meaning.',
    },
    {
      id: 'q10-5-5',
      type: 'multi-select',
      question: 'Select mandatory guardrails for production Text-to-SQL endpoints:',
      options: [
        'Read-only DB credentials restricted to scoped views',
        'Single-statement SELECT validation & table allowlists',
        'Enforced row-level tenant isolation and query LIMIT',
        'Allowing LLM-generated DDL when users request new dashboards',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 2],
      explanation: 'Never permit DDL/DML writes; lock connections to read-only views with tenant scoping and LIMIT caps.',
    },
    {
      id: 'q10-5-6',
      type: 'ordering',
      question: 'Order the layout-aware PDF ingestion pipeline cleanly from raw bytes to searchable index:',
      options: [],
      items: [
        'Detect page layout blocks & extract tables into Markdown',
        'Keep intact tables paired with section breadcrumbs',
        'Index small child chunks linked to parent sections',
        'Attach tenant_id & ACL metadata onto every chunk',
      ],
      correctIndex: 0,
      explanation: 'Parse layout/tables first, attach breadcrumbs, split parent-child chunks, and stamp ACLs.',
    },
    {
      id: 'q10-5-7',
      type: 'numeric',
      question: 'If three top child matches `[c1, c2, c3]` point to parent IDs `["p1", "p1", "p2"]`, how many unique parent contexts are sent to the LLM?',
      options: [],
      correctIndex: 0,
      correctNumber: 2,
      tolerance: 0,
      unit: 'parents',
      explanation: 'Deduplicating `["p1", "p1", "p2"]` sends only `p1` and `p2` (2 unique parents).',
    },
    {
      id: 'q10-5-8',
      question: 'When should a team skip GraphRAG and ship Hybrid RRF + Reranking instead?',
      options: [
        'When multi-hop entity synthesis across hundreds of documents is your primary query load',
        'When corporate audit teams explicitly demand cross-report community relationship summaries',
        'When PDF ingestion already budgets three Frontier Reasoning extraction passes per page',
        'When Hybrid RRF hits >= 0.90 Recall on single-doc factoid lookups',
      ],
      correctIndex: 3,
      explanation: 'GraphRAG carries steep extraction token/ops overhead; earn it strictly when Hybrid RAG fails multi-hop or global synthesis.',
    },
  ],
};
