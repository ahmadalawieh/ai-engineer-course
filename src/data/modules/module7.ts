import type { CourseModule } from '@/types/course';

export const module7: CourseModule = {
  id: 'mod-7',
  number: 7,
  title: 'AI Agents, Evals & Production MLOps',
  subtitle: 'Build reliable ReAct agents, automated eval pipelines (RAGAS/LLM-as-a-Judge), vLLM inference optimization, and drift monitoring.',
  track: 'ai-eng',
  estimatedHours: 4,
  capstoneDeliverable: 'Design a CI/CD evaluation suite & production inference budget with drift alerts.',
  lessons: [
    {
      id: '7-1',
      moduleId: 'mod-7',
      number: '7.1',
      title: 'AI Agents, Workflows, Tool Sandboxing & Memory',
      subtitle: 'When to use deterministic workflows vs autonomous ReAct loops—and how MCP standardizes tool ecosystems.',
      durationMinutes: 16,
      track: 'ai-eng',
      prerequisites: ['6.1'],
      objectives: [
        'Distinguish deterministic DAG workflows (Routing, Parallelization, Orchestrator-Workers) from autonomous ReAct agents.',
        'Trace the ReAct loop (Thought $\\rightarrow$ Action $\\rightarrow$ Observation) and prevent infinite loops / cost blowups.',
        'Apply sandboxing, least privilege, and human-in-the-loop approval gates.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Workflows First, Autonomous Agents Only When Needed',
          paragraphs: [
            'The biggest engineering mistake in agentic AI is wrapping a simple 3-step pipeline in an unconstrained autonomous loop. If the control flow is known at compile time (e.g., *Classify $\\rightarrow$ Retrieve $\\rightarrow$ Draft*), use a **deterministic workflow**—cheaper, faster, 100% debuggable.',
            'Use an **autonomous agent (ReAct)** only when the path depends dynamically on intermediate tool results (e.g., *debug a failing test $\\rightarrow$ read stack trace $\\rightarrow$ inspect file $\\rightarrow$ patch $\\rightarrow$ re-run tests*). Always enforce: `max_steps`, `token_budget`, idempotent/read-only tools by default, and **Human-in-the-Loop (HITL)** confirmation before irreversible writes (`refund_payment`, `drop_table`).',
          ],
        },
        {
          type: 'simulator',
          simulatorId: 'react-agent',
          title: 'Interactive Lab: ReAct Agent Execution & Budget Tracer',
          description:
            'Step through a real multi-tool support/engineering agent (SQL query, Docs search, Refund action). Toggle HITL approval & step budgets to inspect Thought $\\rightarrow$ Tool Call $\\rightarrow$ Observation traces.',
        },
        {
          type: 'table',
          title: 'Agent Memory & Protocol Stack',
          headers: ['Component', 'Everyday Web / Tech Analogy', 'AI Engineering Implementation'],
          rows: [
            ['Short-term Working Memory', 'An open browser tab’s live scratchpad', 'Current conversation thread + tool outputs inside Context Window (pruned/summarized)'],
            ['Episodic / Semantic Memory', 'Saved browser bookmarks & user profile settings', 'Vector + relational store of past user preferences & resolved incidents'],
            ['**MCP (Model Context Protocol)**', 'USB-C universal cable standard', 'Open protocol decoupling AI apps from Tools, Files, and Prompts via one standard plug-and-play interface'],
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
            'Untrusted text is always isolated first; deterministic backend guards + HITL checks protect financial writes before execution!',
        },
      ],
      quiz: [
        {
          id: 'q7-1-1',
          question: 'Why should an AI agent’s customer-refund tool NEVER be invoked without deterministic policy/HITL checks?',
          options: [
            'Because LLMs are probabilistic and vulnerable to prompt injection or reasoning mistakes that could trigger unauthorized financial actions',
            'Because JSON does not support numbers',
            'Because ReAct loops can only run 1 tool',
            'Because MCP forbids writes',
          ],
          correctIndex: 0,
          explanation: 'Probabilistic models should propose actions; deterministic backend guards or human approvals enforce financial/security invariants.',
        },
        {
          id: 'q7-1-2',
          question: 'When should you prefer a deterministic LLM workflow over an open-ended autonomous ReAct agent?',
          options: [
            'Never — agents are always better',
            'Whenever the required steps are predictable (e.g., extract $\\rightarrow$ validate $\\rightarrow$ summarize), because workflows give lower latency, predictable cost, and higher reliability',
            'Only when you have no tools',
            'Only for image generation',
          ],
          correctIndex: 1,
          explanation: 'Autonomous loops compound small per-step error rates ($0.95^{10} \\approx 0.60$) and add round-trip latency; keep control flow deterministic whenever possible.',
        },
        {
          id: 'q7-1-3',
          question: 'What problem does **MCP (Model Context Protocol)** solve?',
          options: [
            'It replaces Transformer attention',
            'It provides a universal client-server protocol so any AI app can connect cleanly to tools/data sources without custom glue code per model',
            'It compresses weights to 2 bits',
            'It eliminates the need for evals',
          ],
          correctIndex: 1,
          explanation: 'MCP standardizes tool discovery, schemas, and execution across editors, agents, and backend connectors.',
        },
      ],
    },
    {
      id: '7-2',
      moduleId: 'mod-7',
      number: '7.2',
      title: 'LLM & RAG Evaluation (Evals): Beyond "Vibe Checks"',
      subtitle: 'Build automated CI/CD quality gates using deterministic assertions, RAGAS metrics, and calibrated LLM-as-a-Judge.',
      durationMinutes: 16,
      track: 'ai-eng',
      prerequisites: ['6.3'],
      objectives: [
        'Structure the 3 tiers of AI Evals: Deterministic code checks $\\rightarrow$ Reference/Embedding checks $\\rightarrow$ Calibrated LLM-as-a-Judge.',
        'Measure RAG cleanly with Context Recall, Context Precision, Faithfulness, and Answer Relevance.',
        'Eliminate LLM-as-a-Judge biases (position bias, verbosity bias) and compute Cohen’s Kappa alignment with human labels.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'If You Don’t Have Evals, You’re Shipping Blind',
          paragraphs: [
            'Changing one sentence in a system prompt to fix a bug often silently breaks 5 other edge cases. Treat **Evals as unit & integration tests for probabilistic software**: build a curated **Golden Dataset** (50–300 real production inputs + hard edge cases) and run it in CI on every prompt, chunker, or model swap.',
            '**Don’t jump straight to LLM judges** if code can check it! Always layer: **Level 1 (Deterministic)**: valid JSON, regex, SQL syntax executes cleanly, latency/cost ceiling, citation IDs actually exist in retrieved docs. **Level 2 (Retrieval Metrics)**: Recall@k, MRR, NDCG@k. **Level 3 (LLM-as-a-Judge)**: evaluates subtle traits like *Faithfulness* (are all claims supported by context?) using binary Pass/Fail or 1–5 anchored rubrics with **chain-of-thought reasoning BEFORE the score**.',
          ],
        },
        {
          type: 'table',
          title: 'The RAGAS Evaluation Triad (Isolate Retrieval vs Generation Bugs)',
          headers: ['Metric', 'Inputs Evaluated', 'What Failure It Diagnoses'],
          rows: [
            ['**Context Precision / Recall**', 'Query vs Retrieved Chunks (+ Ground Truth)', '**Retriever bug**: failed to fetch the right doc, or buried it under noise'],
            ['**Faithfulness**', 'Retrieved Chunks vs Generated Answer', '**Hallucination bug**: generator invented facts unsupported by retrieved chunks'],
            ['**Answer Relevance**', 'Query vs Generated Answer', '**Instruction bug**: answer is faithful to chunks, but dodged the user’s actual question'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Two Fatal Biases of LLM-as-a-Judge (and How to Fix Them)',
          body: '1) **Position Bias**: in A/B pairwise judging, LLMs systematically favor whichever answer appears first! Always run twice swapping `(A, B)` and `(B, A)`. 2) **Verbosity Bias**: judges prefer longer fluff unless penalized in the rubric. Always calibrate your judge against 50 human-labeled examples (aim for $> 0.80$ agreement / Cohen’s $\\kappa$).',
        },
        {
          type: 'python-lab',
          labId: 'lab-7-2',
          title: 'Lab 7.2: Deterministic RAG Citation & Recall Scorer',
          prompt:
            'Before calling an expensive LLM-as-a-Judge, write fast Level-1/Level-2 deterministic evals! Implement `eval_rag_case(cited_ids, retrieved_ids, expected_ids)` returning a dict `{"citations_valid": bool, "recall": float}` where `citations_valid` is `True` only if every ID in `cited_ids` actually appeared in `retrieved_ids` (no hallucinated sources!), and `recall` is the fraction of `expected_ids` found in `retrieved_ids`.',
          starterCode: `def eval_rag_case(cited_ids: list[str], retrieved_ids: list[str], expected_ids: list[str]) -> dict:
    # 1. citations_valid = all(cid in retrieved_ids for cid in cited_ids)
    # 2. hits = sum(1 for eid in expected_ids if eid in retrieved_ids)
    # 3. recall = hits / len(expected_ids) if expected_ids else 1.0
    pass

print(eval_rag_case(["doc-1", "doc-9"], ["doc-1", "doc-2"], ["doc-1", "doc-3"]))`,
          testCode: `r1 = eval_rag_case(["doc-1", "doc-9"], ["doc-1", "doc-2"], ["doc-1", "doc-3"])
assert r1["citations_valid"] is False, "doc-9 was hallucinated (not retrieved)"
assert abs(r1["recall"] - 0.5) < 1e-6, f"Expected recall 0.5, got {r1['recall']}"

r2 = eval_rag_case(["doc-2"], ["doc-1", "doc-2", "doc-3"], ["doc-1", "doc-2"])
assert r2["citations_valid"] is True and abs(r2["recall"] - 1.0) < 1e-6
print("PASS: Deterministic RAG eval checks caught hallucinated citations and measured recall!")`,
          solutionCode: `def eval_rag_case(cited_ids: list[str], retrieved_ids: list[str], expected_ids: list[str]) -> dict:
    retrieved_set = set(retrieved_ids)
    citations_valid = all(cid in retrieved_set for cid in cited_ids)
    hits = sum(1 for eid in expected_ids if eid in retrieved_set)
    recall = hits / len(expected_ids) if expected_ids else 1.0
    return {"citations_valid": citations_valid, "recall": recall}`,
          hint: 'Convert `retrieved_ids` to a `set`, use `all(cid in retrieved_set for cid in cited_ids)` for citation validity, and divide matched expected docs by `len(expected_ids)`.',
          packages: [],
        },
      ],
      quiz: [
        {
          id: 'q7-2-1',
          question: 'Your RAG evals show Context Recall = 0.94, Answer Relevance = 0.90, but **Faithfulness = 0.58**. Where is the bug?',
          options: [
            'Your vector database HNSW index is broken',
            'Your retriever is finding the right documents, but the LLM generator is hallucinating extra claims not grounded in those chunks',
            'Your chunk size is too big for BM25',
            'Your users are asking irrelevant questions',
          ],
          correctIndex: 1,
          explanation: 'High Context Recall proves retrieval succeeded; low Faithfulness pinpoints unsupported claims introduced during generation.',
        },
        {
          id: 'q7-2-2',
          question: 'When building an LLM-as-a-Judge evaluator, why should you prompt the judge to output `reasoning` BEFORE `score`?',
          options: [
            'Because JSON parsers require strings before numbers',
            'Because autoregressive decoding locks in the score first if `score` comes first; emitting reasoning first lets the model examine criteria before committing',
            'To double token costs',
            'To disable temperature',
          ],
          correctIndex: 1,
          explanation: 'Generating step-by-step rubric verification prior to the verdict improves judge accuracy and human alignment substantially.',
        },
        {
          id: 'q7-2-3',
          question: 'How do you neutralize **Position Bias** in pairwise A/B LLM judging?',
          options: [
            'Set temperature to 2.0',
            'Run each pair in both orders `(A, B)` and `(B, A)` and treat flips as a Tie',
            'Always put your new model first',
            'Use a smaller context window',
          ],
          correctIndex: 1,
          explanation: 'Order-swapping consistency checks immediately catch and cancel positional favoritism.',
        },
      ],
    },
    {
      id: '7-3',
      moduleId: 'mod-7',
      number: '7.3',
      title: 'Inference Optimization, Latency & Cost Engineering',
      subtitle: 'Master TTFT vs TPOT, vLLM PagedAttention, model routing, prompt caching, and unit economics.',
      durationMinutes: 15,
      track: 'ai-eng',
      prerequisites: ['5.3'],
      objectives: [
        'Separate Prefill (compute-bound, drives TTFT) from Decode (memory-bandwidth-bound, drives TPOT).',
        'Explain Continuous Batching, PagedAttention (vLLM), and Speculative Decoding.',
        'Slash API bills 5–10× via Prompt Prefix Caching, Semantic Caching, and Model Cascading/Routing.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Prefill vs Decode: Why LLM Serving Has Two Totally Different Bottlenecks',
          paragraphs: [
            '1. **Prefill (Time To First Token — TTFT)**: Processes your entire prompt in one massive parallel matrix multiply. **Compute-bound** (GPU FLOPs). Fix: shorten context, use **KV Prompt Prefix Caching** (reusing cached system prompt + RAG doc KV states across requests!).',
            '2. **Decode (Time Per Output Token — TPOT)**: Generates 1 token at a time while streaming the *entire* model weights + KV cache from GPU VRAM into SRAM. **Memory-bandwidth bound**! Fix: **Continuous Batching + PagedAttention (vLLM)** (allocates KV cache in non-contiguous virtual memory pages just like OS RAM paging, boosting throughput 10×!), **Quantization (FP8/AWQ)** (fewer bytes to read per token), and **Speculative Decoding** (tiny fast draft model proposes 5 tokens; target model verifies all 5 in one parallel pass!).',
          ],
        },
        {
          type: 'simulator',
          simulatorId: 'latency-economics',
          title: 'Interactive Lab: Production AI Unit Economics & Latency Calculator',
          description:
            'Model monthly DAU, prompt/completion tokens, prompt cache hit rate, and model routing split (e.g., 80% cheap 8B/mini model + 20% frontier fallback) to optimize gross margin and p95 latency.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The #1 FinOps Lever: Model Cascading / Routing',
          body: 'Don’t send `"Thanks!"` or `"Classify this support tag"` to a flagship reasoning model. Train/prompt a tiny classifier or cheap 8B/mini model as a **router** (handling 70–85% of easy traffic at 10× lower cost and 3× lower latency) and escalate only hard multi-step queries to the frontier model.',
        },
      ],
      quiz: [
        {
          id: 'q7-3-1',
          question: 'Why does **Speculative Decoding** accelerate generation speed WITHOUT changing the target model’s output distribution?',
          options: [
            'It uses a faster, smaller draft model to propose $k$ candidate tokens, then the large target model verifies all $k$ tokens in a single parallel forward pass and accepts matching distributions exactly',
            'It skips Softmax on every 3rd token',
            'It quantizes the target model to 1-bit',
            'It deletes the prompt',
          ],
          correctIndex: 0,
          explanation: 'Verification is parallel (compute-efficient like prefill), and rejection sampling mathematically preserves the exact target model distribution!',
        },
        {
          id: 'q7-3-2',
          question: 'What GPU serving bottleneck does **PagedAttention (vLLM)** directly eliminate?',
          options: [
            'Tokenization speed',
            'KV-cache memory fragmentation & pre-allocation waste, allowing far larger continuous batch sizes and higher GPU throughput',
            'HTTP SSL handshakes',
            'Training data leakage',
          ],
          correctIndex: 1,
          explanation: 'Allocating fixed contiguous max-context buffers wastes 60–80% of VRAM; paging KV blocks on demand lets servers pack many more concurrent requests.',
        },
        {
          id: 'q7-3-3',
          question: 'Your app prepends the exact same 6,000-token system prompt and tool docs to every request. Which feature cuts both TTFT latency and input token cost immediately?',
          options: [
            'Prompt Prefix Caching (KV Cache reuse)',
            'Raising temperature to 1.5',
            'Increasing top-k',
            'Disabling streaming',
          ],
          correctIndex: 0,
          explanation: 'Prefix caching keeps the computed KV tensors for identical leading prompt prefixes, skipping redundant prefill compute and cutting input costs 50–90%.',
        },
      ],
    },
    {
      id: '7-4',
      moduleId: 'mod-7',
      number: '7.4',
      title: 'MLOps, Drift Monitoring, Observability & Guardrails',
      subtitle: 'Keep models healthy months after launch: trace LLM spans, detect data/concept drift, and enforce safety.',
      durationMinutes: 14,
      track: 'core',
      prerequisites: ['3.4', '7.2'],
      objectives: [
        'Distinguish Data/Covariate Drift ($P(X)$ shifts) vs Concept Drift ($P(Y \\mid X)$ shifts) and detect them with PSI / KS tests.',
        'Instrument LLM applications with OpenTelemetry traces (spans for retrieve, rerank, prompt, tool, cost).',
        'Deploy layered guardrails (PII redaction, schema checks, topic/jailbreak filters) with fallback strategies.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Software Breaks Loudly (500 Error); ML Models Rot Silently',
          paragraphs: [
            'A REST API crashes when a column renames. An ML model keeps returning HTTP 200 with smooth probabilities while accuracy quietly drops from 92% to 61% because user demographics shifted (**Data Drift**) or customer behavior changed post-pandemic (**Concept Drift**).',
            'Monitor **3 layers continuously**: 1) **Input/Feature Drift**: Population Stability Index (`PSI > 0.2` = major shift) and Kolmogorov-Smirnov (KS) tests vs training baseline. 2) **Prediction/Proxy Drift**: track average confidence, refusal rate, thumbs-down rate, and latency p95/p99. 3) **Delayed Ground-Truth Performance**: join predictions with actual outcomes (chargebacks, churn, human escalations) as soon as labels arrive.',
          ],
        },
        {
          type: 'simulator',
          simulatorId: 'drift-monitor',
          title: 'Interactive Lab: Production Data Drift (PSI) & Concept Drift Monitor',
          description:
            'Inject covariate shifts (e.g., sudden mobile traffic surge) or concept drift into live production streams and watch PSI, KL divergence, and rolling accuracy trigger automated retraining alerts.',
        },
        {
          type: 'callout',
          variant: 'key-takeaway',
          title: 'LLM Observability Standard: Span Tracing',
          body: 'Log every request as a nested **Trace Tree** (Request $\\rightarrow$ Query Rewrite $\\rightarrow$ Hybrid Retrieval [docs, scores, ms] $\\rightarrow$ Reranker $\\rightarrow$ LLM Call [prompt version, model, TTFT, tokens, \\$] $\\rightarrow$ Guardrail Check). Never guess *why* a user got a bad answer—inspect the exact span!',
        },
      ],
      quiz: [
        {
          id: 'q7-4-1',
          question: 'Your fraud model’s training data had 10% international transactions, and after launching in Europe, international transactions jump to 55%—even though fraud patterns per region are unchanged. What is this?',
          options: [
            'Data / Covariate Drift ($P(X)$ changed)',
            'Concept Drift ($P(Y \\mid X)$ changed)',
            'SQL injection',
            'Gradient explosion',
          ],
          correctIndex: 0,
          explanation: 'The input feature distribution $P(X)$ shifted significantly (detected immediately via PSI/KS even before labels arrive).',
        },
        {
          id: 'q7-4-2',
          question: 'A sudden economic recession causes users with the *exact same* credit score and income as last year to default at 3× the historical rate. What is this?',
          options: [
            'Covariate Drift only',
            'Concept Drift — the relationship $P(Y \\mid X)$ between features and target changed',
            'Missing data MCAR',
            'Over-tokenization',
          ],
          correctIndex: 1,
          explanation: 'The mapping from inputs $X$ to true outcome $Y$ shifted; feature distributions alone may look normal, so delayed ground-truth monitoring is vital.',
        },
        {
          id: 'q7-4-3',
          question: 'In PSI (Population Stability Index) monitoring, what does `PSI > 0.25` typically trigger?',
          options: [
            'No action needed',
            'High-priority alert: significant distribution shift requiring model investigation or retraining',
            'Shut down all servers immediately',
            'Switch from BF16 to FP32',
          ],
          correctIndex: 1,
          explanation: 'Standard rule of thumb: `PSI < 0.1` (no shift), `0.1–0.25` (moderate monitor), `> 0.25` (significant shift requiring investigation/retraining).',
        },
      ],
    },
  ],
};
