import type { Lesson } from '@/types/course';
import { MODEL_CATALOG_REVIEWED } from '@/data/modelCatalog';

export const lesson11_8: Lesson = {
  id: '11-8',
  moduleId: 'mod-11',
  number: '11.8',
  title: 'Multi-Tenant RAG Security & Durable Agent Recovery',
  subtitle: 'Enforce tenant-isolated RBAC inside retrieval queries, prevent duplicate side effects with idempotency keys, and gate destructive tool calls with HITL.',
  durationMinutes: 70,
  track: 'ai-eng',
  prerequisites: ['6.2', '7.1', '11.3'],
  requires: ['hybrid-rag', 'agent-guardrails'],
  teaches: ['rbac-tenant-rag', 'idempotent-tool-calls', 'hitl-approval-gates'],
  competencies: ['mid-rag-production', 'mid-agents-guardrails', 'sr-security-governance'],
  lastReviewed: MODEL_CATALOG_REVIEWED,
  objectives: [
    'Enforce tenant_id and role ACL filters BEFORE top-k vector similarity ranking so unauthorized chunks never enter the prompt.',
    'Design idempotent tool-call handlers using deterministic idempotency keys so retries never duplicate writes or charges.',
    'Add Human-in-the-Loop (HITL) approval gates for destructive or external side-effect tools.',
  ],
  checkWithoutNotes: [
    'Why is filtering ACLs AFTER retrieving top-5 vector chunks a security and recall bug?',
    'How does an idempotency key protect an agent tool call during transient network retries?',
    'Which tool categories require a Human-in-the-Loop approval gate before execution?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Tenant-Isolated RAG: Pre-Filter Before Ranking',
      paragraphs: [
        'In multi-tenant SaaS products, a classic mid-level security bug is running `vector_db.search(query, top_k=5)` globally and filtering permissions afterward in Python. Not only can a bug in post-filtering leak another company’s private documents into the LLM context, it also destroys recall when all top-5 global hits belong to other tenants.',
        'Always push `tenant_id` and `allowed_roles` **into the database query filter itself** (pre-filtering in Postgres/`pgvector`, Qdrant, or Pinecone) so unauthorized chunks are structurally invisible to similarity scoring.',
      ],
    },
    {
      type: 'prose',
      heading: 'Durable Agents: Idempotency Keys & HITL Gates',
      paragraphs: [
        'Agents run across flaky networks and rate-limited APIs. If a tool call like `create_refund` or `send_slack_alert` times out after executing on the server, a naive retry executes it twice. Attach a deterministic `idempotency_key` (e.g., `f"{run_id}:{step_index}:{tool_name}"`) so the tool server returns the cached result instead of repeating the side effect.',
        'For irreversible actions (deleting records, issuing refunds, sending external emails), pause the agent state machine and require explicit **Human-in-the-Loop (HITL)** confirmation.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-11-8-rbac-rag',
      title: 'Lab 11.8: Pre-Filtered Tenant RAG & Idempotent Tool Guard',
      prompt:
        'Implement `retrieve_authorized_chunks(chunks: list[dict], tenant_id: str, user_roles: set[str], top_k: int) -> list[dict]`: filter chunks where `c["tenant_id"] == tenant_id` AND `bool(set(c["roles"]) & user_roles)`, then sort descending by `c["score"]` and return at most `top_k` items.',
      difficulty: 'guided',
      hint: 'Use a list comprehension checking `c.get("tenant_id") == tenant_id` and `set(c.get("roles", [])) & user_roles`, then sort descending by `score` and slice `[:top_k]`.',
      starterCode: `def retrieve_authorized_chunks(chunks: list[dict], tenant_id: str, user_roles: set[str], top_k: int) -> list[dict]:
    # Pre-filter by tenant_id and overlapping roles before sorting top_k
    return []`,
      testCode: `docs = [
    {"id": "1", "tenant_id": "acme", "roles": ["admin"], "score": 0.99},
    {"id": "2", "tenant_id": "other", "roles": ["viewer"], "score": 0.98},
    {"id": "3", "tenant_id": "acme", "roles": ["viewer", "editor"], "score": 0.85},
    {"id": "4", "tenant_id": "acme", "roles": ["viewer"], "score": 0.91},
]
out = retrieve_authorized_chunks(docs, "acme", {"viewer"}, 2)
assert [d["id"] for d in out] == ["4", "3"]
print("PASS: Lab 11.8 tenant-isolated RAG pre-filter verified!")`,
      solutionCode: `def retrieve_authorized_chunks(chunks: list[dict], tenant_id: str, user_roles: set[str], top_k: int) -> list[dict]:
    allowed = [
        c for c in chunks
        if c.get("tenant_id") == tenant_id and (set(c.get("roles", [])) & user_roles)
    ]
    allowed.sort(key=lambda c: c.get("score", 0.0), reverse=True)
    return allowed[:top_k]`,
    },
  ],
  quiz: [
    {
      id: 'q11-8-1',
      type: 'multiple-choice',
      question: 'When should tenant_id and role ACL filters be applied in a multi-tenant RAG pipeline?',
      options: [
        'After the LLM generates its final answer',
        'Inside the vector/keyword query filter before top-k ranking',
        'Only during nightly re-indexing',
        'In the frontend browser component',
      ],
      correctIndex: 1,
      explanation: 'Pre-filtering inside the retrieval query prevents cross-tenant leakage and preserves top-k recall for the authorized tenant.',
    },
    {
      id: 'q11-8-2',
      type: 'multiple-choice',
      question: 'What problem do deterministic idempotency keys solve in agent tool execution?',
      options: [
        'They reduce embedding vector dimensions',
        'They prevent duplicate side effects when a timed-out tool call is retried',
        'They bypass OAuth authentication',
        'They increase token context length',
      ],
      correctIndex: 1,
      explanation: 'An idempotency key lets the tool handler deduplicate retries safely without repeating writes or charges.',
    },
  ],
};
