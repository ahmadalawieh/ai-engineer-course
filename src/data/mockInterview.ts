import type { InterviewQuestion } from '@/types/course';

export const MOCK_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'iq-1',
    role: 'Both',
    difficulty: 'Core',
    topic: 'Math & Deep Learning',
    question:
      'Explain why we scale attention scores by 1/sqrt(d_k), why Transformers use LayerNorm/RMSNorm instead of BatchNorm, and why subtracting max(logits) makes Softmax stable.',
    rubricPoints: [
      'Dot product variance scales with d_k; dividing by sqrt(d_k) keeps variance ~1 so Softmax avoids vanishing gradients.',
      'LayerNorm/RMSNorm normalizes each token independently across features—working cleanly for variable lengths and batch_size=1.',
      'Subtracting max(logits) prevents exp() floating-point overflow while leaving output probabilities mathematically unchanged.',
    ],
    sampleAnswer:
      'If Q and K entries have mean 0 and variance 1, their dot product has variance d_k. Dividing by sqrt(d_k) restores unit variance so Softmax does not saturate into tiny gradients. LayerNorm/RMSNorm normalizes across hidden features per token rather than across the batch, avoiding noisy batch stats on variable-length sequences or batch=1 inference. Finally, shifting logits by -max(logits) guarantees all exponents are <= 0 (exp <= 1), preventing Inf/NaN overflow while canceling identically in numerator and denominator.',
    followUp: 'What does Grouped-Query Attention (GQA) change on top of Multi-Head Attention?',
  },
  {
    id: 'iq-2',
    role: 'Data Scientist',
    difficulty: 'Core',
    topic: 'Experimentation & A/B Testing',
    question:
      'Your PM wants to test a checkout button change expected to lift conversion from 10% to 10.5%. On Day 2, p = 0.03 and they ask to ship immediately. What do you say?',
    rubricPoints: [
      'Refuse early stopping due to "peeking" inflating false positives far above 5%.',
      'Compute required sample size using MDE=0.5% (small absolute lift -> large n per variant).',
      'Require running at least 1–2 full weekly cycles (7–14 days) to avoid weekday/weekend & novelty bias.',
      'Check guardrail metrics (latency, refund rate, revenue/user) alongside conversion.',
    ],
    sampleAnswer:
      'Peeking daily and stopping as soon as p < 0.05 inflates our Type I false-positive rate from 5% to 20%+. Furthermore, a 0.5% absolute lift (10% -> 10.5%) requires roughly n ≈ 16 * 0.10 * 0.90 / (0.005^2) ≈ 57,600 users PER variant (~115k total) for 80% power. We must lock our horizon to reach full sample size across at least 7–14 days to smooth novelty and day-of-week effects, while monitoring latency and average order value guardrails.',
    followUp: 'What if the business insists on checking results daily? Which statistical method allows valid continuous monitoring?',
  },
  {
    id: 'iq-3',
    role: 'AI Engineer',
    difficulty: 'Senior',
    topic: 'Production RAG Architecture',
    question:
      'You built a RAG app for 5,000 enterprise tenants, and users complain it misses exact error codes, leaks another company’s doc snippet once, and hallucinates numbers. How do you redesign it?',
    rubricPoints: [
      'Replace pure dense search with Hybrid Search (BM25 + Dense HNSW + RRF) + Stage-2 Cross-Encoder reranker.',
      'Enforce mandatory `tenant_id` / ACL metadata PRE-filtering inside the search query (never post-filter).',
      'Upgrade chunking to structure-aware contextual chunking + parent-child retrieval.',
      'Add strict grounding prompt + verifiable inline citations + CI RAGAS Faithfulness & Recall eval gates.',
    ],
    sampleAnswer:
      'First, fix the critical security bug by enforcing tenant_id and ACL filters as pre-filters inside the vector & BM25 index queries—never post-filter after top-k. Second, fix missed error codes by switching to Hybrid Search (BM25 + Dense embeddings fused via RRF) followed by a Cross-Encoder reranker on top 50 -> top 5. Third, prepend document/section titles to chunks (Contextual Retrieval) and return parent sections. Finally, require inline [chunk_id] citations and block regressions with a Golden Eval CI gate tracking Context Recall and Faithfulness.',
    followUp: 'How would you handle conversational follow-up questions like "What about its rate limit?"',
  },
  {
    id: 'iq-4',
    role: 'Data Scientist',
    difficulty: 'Senior',
    topic: 'Tabular ML & Leakage',
    question:
      'You trained an XGBoost churn model achieving 0.98 ROC-AUC offline, yet in production precision at top decile is 8%. Walk through every likely culprit and how you fix it.',
    rubricPoints: [
      'Check target/proxy leakage (feature created after churn, e.g., cancellation_email_sent or zero_days_since_login overlapping target window).',
      'Check preprocessing leakage (scaling/imputing/SMOTE before splitting) and entity/temporal leakage (random split instead of Group + TimeSeriesSplit).',
      'Check metric mismatch: 0.98 ROC-AUC can still yield tiny precision if churn base rate is <0.5% (use PR-AUC!).',
      'Verify train-serving feature skew (training used offline batch SQL, serving computes a different definition).',
    ],
    sampleAnswer:
      'A cliff from 0.98 AUC to 8% precision screams leakage or train-serving skew. I would first audit top SHAP features for proxy leakage—columns updated after the churn decision window. Second, enforce strict temporal cutoffs (`observation_end < target_start`) grouped by `user_id` and move all imputers/encoders inside sklearn `Pipeline` folds. Third, check if base rate is 0.2% where 0.98 ROC-AUC still permits 1–2% FPR (tons of false alarms), switching evaluation to PR-AUC. Fourth, log live inference feature distributions and compare PSI against training snapshots to catch serving skew.',
    followUp: 'Once the model is clean and accurate, why might targeting the top 10% highest churn risk with 30% discounts still lose money?',
  },
  {
    id: 'iq-5',
    role: 'AI Engineer',
    difficulty: 'Senior',
    topic: 'Inference & FinOps Optimization',
    question:
      'Your AI coding/support product currently costs $120k/month on a frontier model with 3.5s p95 Time-To-First-Token (TTFT). Cut cost 70% and TTFT below 900ms.',
    rubricPoints: [
      'Enable Prompt Prefix Caching for shared static system prompts, tools, and few-shot examples.',
      'Add exact + semantic caching (Redis) for repeated/common queries.',
      'Implement a fast 8B/mini Model Router handling 70–80% simple queries, cascading hard ones to frontier.',
      'Trim/rerank RAG context (fewer, higher-signal tokens) and stream responses via SSE.',
    ],
    sampleAnswer:
      'First, audit prompt composition: if 6,000 tokens are static system/tool docs, Prompt Prefix Caching immediately cuts TTFT and input token costs by 50–80%. Second, replace top-30 raw RAG chunks with top-5 Cross-Encoder reranked chunks to shrink prefill FLOPs. Third, introduce a calibrated 8B/mini router (or QLoRA distilled specialist) to resolve 75% of routine requests at ~15x lower cost and ~400ms TTFT, escalating only complex multi-step queries. Fourth, add Redis semantic caching for high-frequency FAQs and monitor quality continuously via shadow evals.',
    followUp: 'If you self-host an 8B model on H100s, what makes vLLM/PagedAttention 5–10x higher throughput than naive HuggingFace generate()?',
  },
  {
    id: 'iq-6',
    role: 'AI Engineer',
    difficulty: 'Staff',
    topic: 'Fine-Tuning vs RAG & Post-Training',
    question:
      'Explain when you choose LoRA/QLoRA fine-tuning over RAG, how LoRA saves VRAM mathematically, and how you would build the evaluation & training dataset.',
    rubricPoints: [
      'RAG = dynamic knowledge & citations; Fine-tuning = behavior, formatting, specialized style, latency/cost distillation.',
      'LoRA freezes base W_0 (no gradients/Adam states) and learns low-rank B*A (r << d), saving >99% trainable weights and ~10x optimizer VRAM; QLoRA adds 4-bit NF4 frozen base.',
      'Curate 1k–10k clean, diverse examples (often distilled from frontier + verified by unit tests/humans), deduplicated and split cleanly.',
      'Zero inference overhead when merged (W_0 + (alpha/r)BA); eval on out-of-domain retention to detect catastrophic forgetting.',
    ],
    sampleAnswer:
      'Use RAG when facts change or citations are mandatory; use LoRA when teaching consistent structured behavior, domain phrasing, or distilling a frontier model into a fast 8B worker. Mathematically, LoRA keeps W_0 frozen (zero optimizer states!) and injects (alpha/r)*B*A with rank r=16, cutting trainable parameters below 1%—and QLoRA stores W_0 in 4-bit NF4 so even 70B fits on one 48GB GPU. At deployment, merging W_0 + BA adds zero latency. I would curate ~2,000 deduplicated prompt-response pairs validated by deterministic checks, evaluate held-out task accuracy alongside general regression benchmarks to guard against catastrophic forgetting.',
    followUp: 'If you also have human preference pairs (chosen vs rejected), why might you follow SFT with DPO?',
  },
  {
    id: 'iq-7',
    role: 'Both',
    difficulty: 'Core',
    topic: 'Classical ML vs Deep Learning',
    question:
      'Why do XGBoost/LightGBM usually beat deep neural networks on structured SQL tabular data—and when does that flip?',
    rubricPoints: [
      'GBDTs naturally learn axis-aligned irregular step functions, handle missing values & mixed scales natively, and resist uninformative noise columns.',
      'Neural networks excel on smooth continuous spatial/temporal/semantic manifolds (images, audio, text, raw sequences) via weight sharing & representation learning.',
      'Tabular + unstructured multimodal data (e.g., product title text + image + price) favors combining embeddings with GBDT or end-to-end neural fusion.',
    ],
    sampleAnswer:
      'Tabular business tables have heterogeneous columns with sharp thresholds, outliers, missing values, and uninformative noise features. GBDTs carve axis-aligned splits directly on raw distributions without needing scaling and ignore noisy columns, beating MLPs with far less tuning. Deep Learning wins on high-dimensional perceptual/sequential data (images via CNN/ViT, text via Transformers) where spatial/semantic structure matters—or when tabular predictions must fuse raw text/image embeddings.',
    followUp: 'Name one tabular scenario where linear models beat GBDTs.',
  },
  {
    id: 'iq-8',
    role: 'AI Engineer',
    difficulty: 'Senior',
    topic: 'Agents, Security & Observability',
    question:
      'Design a safe, observable AI Agent that can read customer emails, look up orders in SQL, and issue refunds up to $200.',
    rubricPoints: [
      'Defense against indirect prompt injection inside customer emails (XML isolation, never trusting email body to override policies).',
      'Principle of least privilege: read-only parameterized SQL views scoped strictly to the authenticated customer_id.',
      'Deterministic backend guardrails: enforce $200 refund cap, idempotency keys, and rate limits in code—NOT just in the prompt.',
      'HITL confirmation for edge/high-risk refunds + OpenTelemetry span tracing + max step/cost budget.',
    ],
    sampleAnswer:
      'Because customer emails are untrusted input vulnerable to indirect prompt injection, the model must never hold direct SQL write access or unrestricted refund authority. I wrap email content in untrusted tags, restrict SQL tools to read-only parameterized queries scoped to the verified user_id, and enforce the $200 cap, daily velocity limits, and idempotency keys deterministically inside the backend refund microservice. High-anomaly refunds pause for Human-in-the-Loop approval. Every loop iteration runs under a strict max_steps=6 budget with full OpenTelemetry span tracing and offline adversarial injection evals.',
    followUp: 'How would you expose these SQL & refund tools cleanly across multiple internal AI apps?',
  },
  {
    id: 'iq-9',
    role: 'Data Scientist',
    difficulty: 'Core',
    topic: 'SQL Joins & Window Functions',
    question:
      'You need a SQL query showing every customer (even those with 0 orders) and their single largest completed order. How do you avoid dropping zero-order users and prevent duplicate rows?',
    rubricPoints: [
      'Use `LEFT JOIN` from `users` to `orders`, putting `o.status = \'completed\'` inside the `ON` clause (putting it in `WHERE` turns a LEFT JOIN into an INNER JOIN!).',
      'Use `ROW_NUMBER() OVER (PARTITION BY u.user_id ORDER BY o.amount DESC)` inside a CTE and filter `rn = 1` to get one row per user.',
      'Use `COALESCE(amount, 0)` to handle NULL amounts cleanly for zero-order users.',
    ],
    sampleAnswer:
      'Use `LEFT JOIN orders o ON u.user_id = o.user_id AND o.status = \'completed\'`—filtering `o.status` inside `WHERE` would accidentally drop users with no orders! Wrap that in a CTE with `ROW_NUMBER() OVER (PARTITION BY u.user_id ORDER BY o.amount DESC) AS rn`, then select `WHERE rn = 1` with `COALESCE(o.amount, 0)`.',
    followUp: 'When would you use `DENSE_RANK()` instead of `ROW_NUMBER()`?',
  },
  {
    id: 'iq-10',
    role: 'AI Engineer',
    difficulty: 'Core',
    topic: 'RAG Debugging & Evals',
    question:
      'Your team’s RAG chatbot answers questions politely, but often gives outdated policy numbers or skips the exact page that has the answer. How do you pinpoint whether retrieval or generation is broken?',
    rubricPoints: [
      'Measure Context Recall@k first: check if the right chunk even made it into the top-k retrieved context.',
      'If Context Recall is low, fix chunking (overlap + headers), add BM25 Hybrid Search + Cross-Encoder reranking, and filter stale docs via metadata.',
      'If Context Recall is high but answers are wrong (low Faithfulness), tighten grounding instructions, enforce Structured Outputs/citations, and lower temperature.',
    ],
    sampleAnswer:
      'Always separate Retrieval from Generation using a 30–50 question Golden Eval set. First check Context Recall@5: if the right document isn’t in the retrieved top 5, it is a retriever bug—add Hybrid BM25 + dense search, Cross-Encoder reranking, and filter out archived doc versions. If the right chunk IS retrieved yet the answer ignores or alters numbers, it is a generation bug—enforce citation IDs, lower temperature near 0, and add Faithfulness assertions in CI.',
    followUp: 'Why can `temperature = 0` still fail if the retrieved chunks contradict each other?',
  },
  {
    id: 'iq-11',
    role: 'Data Scientist',
    difficulty: 'Senior',
    topic: 'Imbalanced Tabular ML & ROI',
    question:
      'In a 1% fraud detection dataset, your LightGBM model gets 99.1% accuracy. Walk through how you properly train, evaluate, calibrate, and pick the decision threshold for production.',
    rubricPoints: [
      'Reject accuracy (predicting "no fraud" gets 99%) and evaluate using PR-AUC (Average Precision) + Precision@k.',
      'Use Stratified/Time-based CV with preprocessing inside `Pipeline` to prevent leakage.',
      'Explain calibration (Platt/Isotonic) if class weights or resampling were used, because `scale_pos_weight` shifts predicted probabilities.',
      'Pick the classification threshold by maximizing expected business profit: TP benefit minus FP manual-review cost and FN fraud loss.',
    ],
    sampleAnswer:
      '99.1% accuracy is worse than a dummy classifier here. I split temporally (with user grouping if repeat users exist), track PR-AUC instead of ROC-AUC/accuracy, and tune XGBoost/LightGBM inside leak-free `Pipeline` folds. If I use `scale_pos_weight`, I calibrate probabilities with isotonic/Platt scaling on a held-out calibration fold so probabilities reflect true risk. Finally, I sweep thresholds against real unit economics (fraud prevented vs manual-review cost + false-decline friction) to pick the profit-maximizing operating point.',
    followUp: 'How do you monitor if fraud patterns shift two months after launch before ground-truth chargebacks arrive?',
  },
  {
    id: 'iq-12',
    role: 'Both',
    difficulty: 'Senior',
    topic: 'Mid-Senior End-to-End System Design',
    question:
      'Design a customer-support copilot that predicts churn risk from billing SQL tables AND drafts grounded policy responses from internal docs.',
    rubricPoints: [
      'Combine two specialized models: SQL feature pipeline + XGBoost/LightGBM for tabular churn risk, plus Hybrid RAG + LLM for policy drafting.',
      'Keep tabular features leak-free (point-in-time SQL snapshots) and enforce tenant/role ACL pre-filtering in RAG.',
      'Serve churn scores synchronously (<30ms) alongside routed LLM responses with Structured Outputs (JSON action + draft + citations).',
      'Monitor both systems: PSI/concept drift for churn + CI Golden Evals (Faithfulness/Recall) and latency/cost budgets for the LLM.',
    ],
    sampleAnswer:
      'Do not ask an LLM to guess churn from raw SQL rows—use the right tool per modality! First, an offline/batch SQL + LightGBM pipeline computes calibrated churn risk and top SHAP drivers (`failed_payments`, `usage_drop`) using point-in-time joins and exposes it in <20ms. Second, when an agent opens a ticket, a Hybrid RAG pipeline (BM25 + Dense + RRF + Cross-Encoder rerank with ACL pre-filters) drafts a cited response constrained to a Pydantic JSON schema, conditioned on the churn tier. Both run behind CI eval gates, PSI drift alerts, and human-in-the-loop send approval.',
    followUp: 'If latency is too high during peak support hours, which two levers cut p95 latency fastest without hurting accuracy?',
  },
  {
    id: 'iq-13',
    role: 'AI Engineer',
    difficulty: 'Core',
    topic: 'Structured Outputs & Tool Safety',
    question:
      'Your app asks an LLM to return JSON like `{"intent": "refund", "priority": 1}` and occasionally crashes when `JSON.parse()` fails on markdown fences. How do you fix this reliably?',
    rubricPoints: [
      'Never rely on prompt wording ("Please only output JSON") or fragile regex post-processing alone.',
      'Use Structured Outputs (`response_format` with JSON Schema / Pydantic), which masks grammar-invalid tokens at Softmax decoding.',
      'Validate enum values, numeric bounds (`1..5`), and business permissions deterministically in backend code before acting.',
    ],
    sampleAnswer:
      'Prompting "output JSON only" is probabilistic and still fails 1–5% of the time with extra prose or code fences. Instead, define a Pydantic/JSON Schema and enable Structured Outputs so constrained decoding masks out any token that violates the JSON grammar right before sampling—guaranteeing 100% parseable output. Then still run deterministic backend checks for authorization and business limits.',
    followUp: 'What happens if you make a JSON schema deeply nested with 50 optional fields?',
  },
  {
    id: 'iq-14',
    role: 'Both',
    difficulty: 'Core',
    topic: 'Python Vectorization & Debugging',
    question:
      'A junior teammate wrote a nested Python `for` loop computing pairwise cosine similarity across 50,000 documents and it takes 40 seconds per search. How do you speed it up 100x in NumPy?',
    rubricPoints: [
      'Replace the nested Python loop with vectorized matrix multiplication (`docs @ q`) after L2-normalizing rows along `axis=1`.',
      'Pre-normalize document embeddings once at ingestion time so query time is a single dot product (`docs_normed @ q_normed`).',
      'Mention switching to an ANN index (HNSW / pgvector / Qdrant) once document count grows to millions.',
    ],
    sampleAnswer:
      'Pre-normalize all 50,000 document vectors once (`docs / np.linalg.norm(docs, axis=1, keepdims=True)`) using float32. At query time, normalize `q` once and compute all 50,000 cosine similarities in one compiled C/BLAS matrix-vector multiply (`sims = docs_normed @ q_normed`) plus `np.argpartition`/`np.argsort`—dropping 40 seconds down to a few milliseconds. Beyond ~1M vectors, move to an HNSW vector index.',
    followUp: 'Why does `docs[0:10]` in NumPy share memory with `docs`, and when can that cause a bug?',
  },
];
