import type { Lesson } from '@/types/course';

export const lesson6_2: Lesson = {
  id: '6-2',
  moduleId: 'mod-6',
  number: '6.2',
  title: 'Embeddings, Vector DBs (Chroma/FAISS/pgvector), HNSW & Hybrid Search',
  subtitle: 'Understand ANN indexes, choose cleanly between FAISS, Chroma, and pgvector, and beat pure vector search with BM25 + Dense + Reciprocal Rank Fusion + Reranking.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['1.4', '6.1'],
  requires: ['cosine-similarity', 'llm-messages', 'python-dicts'],
  teaches: [
    'embeddings',
    'vector-db',
    'hnsw-ann',
    'hybrid-search',
    'reranking',
  ],
  competencies: ['jr-basic-rag', 'mid-hybrid-rag'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Explain why pure dense embeddings miss exact error codes, SKUs, and acronyms—and how Hybrid Search + RRF solves both.',
    'Choose cleanly between FAISS (in-process index), Chroma (local dev/collections), and PostgreSQL `pgvector` (ACID metadata/ACL joins).',
    'Trace how HNSW multi-layer proximity graphs achieve fast Approximate Nearest Neighbor search compared to $O(N)$ brute force.',
    'Design two-stage retrieval combining fast Bi-Encoder + BM25 recall with precision Cross-Encoder reranking.',
  ],
  checkWithoutNotes: [
    'Give one real query example where pure dense cosine search outperforms BM25, and one where pure dense cosine fails without BM25.',
    'Why does Reciprocal Rank Fusion (`sum(1 / (k + rank))`) avoid min-max calibration headaches between BM25 and Cosine scores?',
    'Why do production multi-tenant RAG systems often choose `pgvector` (or metadata-indexed vector DBs) over bare `FAISS` alone?',
    'Why are Cross-Encoders restricted to Stage-2 reranking of top 20–50 chunks instead of searching 5 million chunks directly?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'One of the biggest surprises for new AI engineers is watching a demo vector database ace paraphrased questions (*"how do I cancel my subscription?"* -> *"Account Termination Policy"*) while failing embarrassingly on exact strings like `"ERR_AUTH_4092"`, `"SKU-X9-440B"`, or `"Section 14(c)"`. Because dense embedding models compress an entire paragraph into one fixed vector, rare alphanumeric codes get smoothed into generic neighborhoods alongside dozens of unrelated error docs.',
        'At the same time, choosing the wrong vector index architecture causes painful migrations six months in: bare in-memory `FAISS` holds vectors fast yet lacks multi-tenant SQL transactions and persistence guarantees out of the box, whereas picking a hosted database blindly without knowing **HNSW memory overhead**, **hybrid BM25 fusion**, or **Stage-2 Cross-Encoder reranking** leads to slow queries and hallucinated answers. Mastering both vector indexing mechanics and hybrid retrieval equips you to build fast, accurate search systems on any stack.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Semantic Maps (Dense), Exact Index Cards (BM25) & Highway Graphs (HNSW)',
      paragraphs: [
        'Think of **Bi-Encoder Dense Embeddings** as placing every paragraph onto a conceptual library floor plan: docs about refunds cluster near refunds regardless of wording. Think of **BM25 (sparse lexical search)** as the back-of-the-book keyword index that locates every exact occurrence of `ERR_AUTH_4092` immediately while rewarding rare informative terms (`IDF`) and avoiding spam repetition (`TF` saturation). Running **both** in parallel recovers both synonyms AND exact identifiers.',
        'How do you combine a BM25 score like `14.2` with a Cosine score like `0.78`? Naive weighted averages break because BM25 is unbounded while cosine sits inside `[-1, 1]`. **Reciprocal Rank Fusion (RRF)** solves this effortlessly by ignoring raw floats and fusing **rank positions**: $\\text{RRF}(d) = \\sum_r \\frac{1}{k + \\text{rank}_r(d)}$ with smoothing constant $k = 60$. Any document appearing near the top of *both* lists climbs to #1 cleanly without brittle threshold tuning.',
        'Next, how do databases search millions of vectors in ~10 milliseconds instead of brute-forcing every dot product? **Approximate Nearest Neighbor (ANN)** indexes like **HNSW (Hierarchical Navigable Small World)** build a multi-layer skip-list graph: top sparse layers take giant highway hops across neighborhoods, then descend down denser bottom layers right to local neighbors in roughly $O(\\log N)$ hops—trading tiny recall (`~95–99%`) and higher graph RAM for massive speedups. Once Stage-1 Hybrid retrieves top ~50 candidates fast, a **Stage-2 Cross-Encoder reranker** reads `[query; doc]` jointly through full self-attention and selects the sharpest top 5 chunks.',
      ],
    },
    {
      type: 'table',
      title: 'Choosing Your Vector Store: FAISS vs Chroma vs PostgreSQL `pgvector`',
      headers: ['Engine', 'Sweet Spot', 'Metadata / ACL Filtering', 'Key Operational Tradeoff'],
      rows: [
        ['**FAISS**', 'In-process batch experiments & massive RAM/GPU vector search', 'Manual external ID mapping required', 'Fastest raw vectors (`Flat`, `IVF-PQ`, `HNSW`); no native transactions or multi-tenant SQL'],
        ['**Chroma**', 'Local prototypes, small-to-medium apps, quick developer UX', 'Built-in JSON metadata filters per collection', 'Simple embedded/client mode; less suited for complex relational joins across business tables'],
        ['**`pgvector` (Postgres)**', 'Production SaaS apps already running PostgreSQL', 'Full ACID SQL `WHERE tenant_id = $1` pre-filtering + joins + HNSW', 'Single operational database & strong consistency; vertical RAM scaling needed for huge HNSW graphs'],
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'vector-search',
      title: 'Interactive Lab: Hybrid Search (BM25 + Dense Cosine + RRF) Tuner',
      description:
        'Test conceptual queries vs exact ID/code queries across a mini knowledge base. Adjust Dense vs BM25 weighting and watch Reciprocal Rank Fusion surface the exact right document.',
    },
    {
      type: 'table',
      title: 'Two-Stage Retrieval Architecture: Bi-Encoder vs Cross-Encoder',
      headers: ['Stage', 'Model Type', 'Speed / Scale', 'Accuracy'],
      rows: [
        ['1. First-stage retrieval (Top 50–100)', '**Bi-Encoder** + HNSW (`Embedding tier` encoder)', 'Precomputes doc vectors once; searches millions fast via ANN', 'Strong recall (compresses doc to 1 vector)'],
        ['2. Reranking (Top 50 -> Top 5)', '**Cross-Encoder** (`Reranker tier` cross-encoder)', 'Runs full query+doc token-by-token cross-attention on top 50 pairs', 'Sharper precision for RAG grounding'],
      ],
    },
    {
      type: 'code-builder',
      puzzleId: 'puzzle-6-2-rag',
      title: 'Warm-Up Puzzle: Production Multi-Tenant Hybrid RAG Flow',
      prompt:
        'Tap the stages below into the correct order to avoid tenant data leaks and maximize precision.',
      lines: [
        '1. Apply mandatory tenant_id / ACL metadata pre-filter',
        '2. Run BM25 keyword search & Dense vector search in parallel',
        '3. Fuse both ranked lists with Reciprocal Rank Fusion (RRF)',
        '4. Cross-Encoder rerank top 50 candidates down to top 5',
        '5. Generate grounded answer with inline [chunk_id] citations',
      ],
      explanation:
        'Pre-filtering `tenant_id` first prevents cross-tenant leaks; Hybrid + RRF + Cross-Encoder delivers sharp top-5 context for grounded citations.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Hand-Solved Reciprocal Rank Fusion & Weighted RRF',
      paragraphs: [
        'Trace exact RRF math by hand with `k = 60`. Suppose dense vector retrieval ranks `["docA", "docB", "docC"]` (1-indexed ranks: `docA=1`, `docB=2`, `docC=3`) while BM25 lexical search ranks `["docC", "docD", "docA"]` (`docC=1`, `docD=2`, `docA=3`).',
        'Compute scores cleanly: `docA` gets $\\frac{1}{60+1} + \\frac{1}{60+3} = 0.01639 + 0.01587 = 0.03227$. `docC` gets $\\frac{1}{60+3} + \\frac{1}{60+1} = 0.03227$. Meanwhile `docB` (`1/62 = 0.01613`) and `docD` (`1/62 = 0.01613`) appear in only one engine—falling cleanly behind documents corroborated by both!',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Weighted Hybrid RRF + Deterministic Tie-Breaking',
      language: 'python',
      code: `def weighted_rrf(
    dense_ranks: list[str],
    bm25_ranks: list[str],
    k: int = 60,
    w_dense: float = 1.0,
    w_bm25: float = 1.0,
) -> list[tuple[str, float]]:
    scores: dict[str, float] = {}
    for rank_idx, doc_id in enumerate(dense_ranks, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + w_dense / (k + rank_idx)
    for rank_idx, doc_id in enumerate(bm25_ranks, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + w_bm25 / (k + rank_idx)
    return sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))

print(weighted_rrf(["docA", "docB", "docC"], ["docC", "docD", "docA"], k=60))`,
      caption: 'Explained output: `[(\'docA\', 0.03226...), (\'docC\', 0.03226...), (\'docB\', 0.01612...), (\'docD\', 0.01612...)]`. Sorting by `(-kv[1], kv[0])` guarantees deterministic tie-breaking across runs.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Sparse Scoring, HNSW vs IVF-PQ, `pgvector` SQL ACLs & Reranking',
      paragraphs: [
        'In lightweight Python or Postgres `tsvector`, lexical matching tokenizes text (`re.findall(r"[a-z0-9_]+", text.lower())`) while rewarding rare distinguishing words via Inverse Document Frequency (`IDF`) and saturating repeated spam words (`TF`). Notice how **Stage-1 Hybrid Search** optimizes purely for **high recall** across the top 50–100 candidates: if the right paragraph sits at #38 in dense search or #12 in BM25, you never pass it to the generator yet—you hand the merged top 50 shortlist into a **Stage-2 Cross-Encoder reranker**. Because the Cross-Encoder evaluates query tokens and document tokens jointly through full transformer attention, it promotes exact answers buried at rank #38 straight into positions #1–#3.',
        'When selecting vector index algorithms inside FAISS, Qdrant, or `pgvector`, balance RAM against recall carefully. **`Flat` (exact brute force)** guarantees `100%` exact recall with zero index memory overhead and works nicely under `~20,000` vectors. **`HNSW`** gives ultra-fast `<15 ms` queries at `95%–99%` recall by holding multi-layer proximity links in RAM; tune `M` (edges per node, commonly `16–32`), build parameter `ef_construction` (`64–200`), and query parameter `ef_search` (raise `ef_search` when selective `WHERE` filters prune many nodes!). When datasets outgrow RAM (`100M+` vectors), **`IVF-PQ` (Inverted File + Product Quantization)** clusters vectors into Voronoi buckets and compresses sub-vectors into compact byte codes at a modest recall tradeoff.',
        'Finally, see why teams running SaaS applications love **`pgvector`** inside PostgreSQL: one single SQL query enforces strict tenant permissions *alongside* HNSW retrieval without syncing two separate databases (`SELECT id, content FROM chunks WHERE tenant_id = $1 AND clearance <= $2 ORDER BY embedding <=> $3 LIMIT 50`). Keeping vectors and access-control metadata inside the same ACID database eliminates stale permission drift when users change teams or delete accounts.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Averaging raw BM25 scores with Cosine scores directly:** Because BM25 varies from `0` to `40+` depending on corpus IDF while cosine stays in `[-1, 1]`, raw sums let BM25 dominate blindly. Use rank-based RRF instead.',
        '**Mistake 2 — Embedding documents with model A and querying with model B:** Vector spaces from different `Embedding` tier encoders (`embed-provider-a` vs `embed-local-b`) are completely incompatible! Always store `embedding_model` metadata alongside collections and re-index when upgrading encoders.',
        '**Mistake 3 — Using HNSW with a tiny `ef_search` on restrictive metadata filters:** Filtering `WHERE tenant_id = "vip"` (only `1%` of rows) after or inside a low-`ef_search` graph traversal can starve results (`top_k` returns 1 doc instead of 5!). Use iterative pre-filtered scans (`pgvector 0.8+` iterative scan) or dedicated per-tenant partitions for tiny tenants.',
        '**Mistake 4 — Sending all 100 Stage-1 chunks directly to the LLM:** Overstuffing context raises latency, balloons token bills, and degrades attention in the middle of long prompts ("lost in the middle"). Always Stage-2 rerank down to the best 3–8 chunks.',
        '**Mistake 5 — Ignoring embedding dimensions & Matryoshka truncation costs:** Upgrading blindly from `384`-dim embeddings to `3072`-dim vectors multiplies HNSW RAM footprint by `8×` for only modest recall gains on many domains. Many modern encoders support **Matryoshka Representation Learning (MRL)**—letting you slice prefix dimensions (`[:512]` or `[:1024]`) and re-normalize to unit length while retaining strong retrieval accuracy at a fraction of the RAM and network cost.',
        '**Mistake 6 — Skipping index rebuilds after normalizing or changing chunkers:** Changing tokenization rules or switching `cosine` vs `L2` distance in Postgres `pgvector` requires creating the matching operator-class index (`vector_cosine_ops` vs `vector_l2_ops`); otherwise Postgres silently falls back to slow sequential table scans!',
        '**Mistake 7 — Overlooking scalar quantization (`int8`/`halfvec`) before scaling RAM:** Before paying for oversized memory instances on a large collection, test `halfvec` (`float16`, halving storage) or `int8` scalar quantization (cutting index RAM by 4×) paired with Stage-2 rescoring in full precision—often recovering practically identical top-5 accuracy at a fraction of infrastructure spend while keeping tail query latency well within interactive budgets.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Pair Dense + BM25:** Dense embeddings catch paraphrases; BM25 catches exact error codes, SKUs, and acronyms.',
        '2. **Fuse with RRF:** `sum(1 / (k + rank))` combines incompatible retrieval scales cleanly without brittle tuning.',
        '3. **Scale with HNSW & pick stores deliberately:** Use FAISS for in-memory experiments, Chroma for lightweight dev, and `pgvector` for SQL ACL joins.',
        '4. **Rerank top 50 -> top 5:** Cross-Encoders boost top-5 precision by running full query-document attention on shortlisted candidates.',
        '5. **Version embedding spaces:** Never mix vectors from two different models inside the same index.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-2',
      difficulty: 'guided',
      requires: ['hybrid-search'],
      title: 'Lab 6.2 (Guided): Implement Reciprocal Rank Fusion (RRF)',
      prompt:
        'Given two ranked lists of document IDs `dense_ranks` and `bm25_ranks` (ordered best-first, 1-indexed rank = `idx + 1`), implement `rrf_fuse(dense_ranks, bm25_ranks, k=60)` returning document IDs sorted by descending RRF score (with alphabetical `doc_id` tie-breaking).',
      starterCode: `def rrf_fuse(dense_ranks: list[str], bm25_ranks: list[str], k: int = 60) -> list[str]:
    scores: dict[str, float] = {}
    # Add 1 / (k + rank) for each list (1-indexed rank: idx + 1)
    # Return doc_ids sorted by descending score
    pass

dense = ["docA", "docB", "docC"]
bm25 = ["docC", "docD", "docA"]
print(rrf_fuse(dense, bm25))`,
      testCode: `dense = ["docA", "docB", "docC"]
bm25 = ["docC", "docD", "docA"]
res = rrf_fuse(dense, bm25, k=60)
assert set(res) == {"docA", "docB", "docC", "docD"}
assert set(res[:2]) == {"docA", "docC"}, f"Docs appearing high in BOTH lists must rank top 2, got {res}"
assert rrf_fuse(["x"], ["y"], k=60) == ["x", "y"]
print("PASS: Lab 6.2 RRF fused lexical & semantic rankings accurately!")`,
      solutionCode: `def rrf_fuse(dense_ranks: list[str], bm25_ranks: list[str], k: int = 60) -> list[str]:
    scores: dict[str, float] = {}
    for rank_list in (dense_ranks, bm25_ranks):
        for idx, doc_id in enumerate(rank_list):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + idx + 1)
    return sorted(scores.keys(), key=lambda d: (-scores[d], d))`,
      hint: 'Iterate both lists with `enumerate`, accumulate `1.0 / (k + idx + 1)`, and sort using `key=lambda d: (-scores[d], d)`.',
      hints: [
        'Initialize `scores: dict[str, float] = {}` and loop over `(dense_ranks, bm25_ranks)`.',
        'For `idx, doc_id in enumerate(rank_list): scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + idx + 1)`.',
        'Return `sorted(scores.keys(), key=lambda d: (-scores[d], d))`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-2-2',
      difficulty: 'spec',
      requires: ['embeddings', 'hybrid-search', 'reranking'],
      title: 'Lab 6.2.2 (From Spec): Hybrid Lexical + Cosine Retriever with Exact-Code Boost',
      prompt:
        'Implement `hybrid_search(query, corpus, top_k=2)` where `corpus` is a list of dicts `{"id": str, "text": str, "vec": np.ndarray}` and `query` has `{"text": str, "vec": np.ndarray}`. Step 1: Rank all docs descending by **dense cosine similarity** (`(doc_vec @ q_vec) / (norm*norm + 1e-9)`). Step 2: Rank docs that share `>= 1` lowercase alphanumeric token (`re.findall(r"[a-z0-9_]+", text.lower())`) descending by count of shared query tokens (ties broken by doc id ascending; docs with 0 shared tokens excluded from BM25 list!). Step 3: Fuse both ranked ID lists using RRF (`k=60`) and return the `top_k` doc IDs.',
      starterCode: `import re
import numpy as np

def tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9_]+", text.lower()))

def hybrid_search(query: dict, corpus: list[dict], top_k: int = 2) -> list[str]:
    # 1. Rank all docs by cosine similarity
    # 2. Rank docs with >0 shared tokens by overlap count
    # 3. Return top_k IDs via RRF (k=60)
    pass`,
      testCode: `import numpy as np
corpus = [
    {"id": "d1", "text": "General auth troubleshooting guide", "vec": np.array([0.99, 0.1])},
    {"id": "d2", "text": "Fix ERR_AUTH_4092 token expiry bug", "vec": np.array([0.75, 0.66])},
    {"id": "d3", "text": "Billing refund timeline FAQ", "vec": np.array([0.0, 1.0])},
]
q = {"text": "ERR_AUTH_4092 error", "vec": np.array([0.95, 0.31])}
top = hybrid_search(q, corpus, top_k=2)
assert top[0] == "d2", f"Exact error code match d2 should rise to #1 via RRF! Got {top}"
assert len(top) == 2
print("PASS: Lab 6.2.2 Hybrid dense + lexical search promoted exact error match!")`,
      solutionCode: `import re
import numpy as np

def tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9_]+", text.lower()))

def hybrid_search(query: dict, corpus: list[dict], top_k: int = 2) -> list[str]:
    qv = query["vec"]
    qn = float(np.linalg.norm(qv)) + 1e-9
    dense_scored = []
    for d in corpus:
        dv = d["vec"]
        sim = float((dv @ qv) / ((float(np.linalg.norm(dv)) + 1e-9) * qn))
        dense_scored.append((d["id"], sim))
    dense_ranks = [doc_id for doc_id, _ in sorted(dense_scored, key=lambda x: (-x[1], x[0]))]

    q_toks = tokenize(query["text"])
    lex_scored = []
    for d in corpus:
        overlap = len(q_toks & tokenize(d["text"]))
        if overlap > 0:
            lex_scored.append((d["id"], overlap))
    lex_ranks = [doc_id for doc_id, _ in sorted(lex_scored, key=lambda x: (-x[1], x[0]))]

    scores = {}
    for lst in (dense_ranks, lex_ranks):
        for idx, doc_id in enumerate(lst):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (60 + idx + 1)
    return [doc_id for doc_id, _ in sorted(scores.items(), key=lambda x: (-x[1], x[0]))][:top_k]`,
      hint: 'Compute dense ranking over all docs, compute lexical overlap ranking for docs with `overlap > 0`, then fuse both lists with `1.0 / (60 + idx + 1)`.',
      hints: [
        'Use `tokenize(query["text"]) & tokenize(d["text"])` to count shared exact keywords.',
        'Include only docs with `overlap > 0` in `lex_ranks`.',
        'Apply RRF with `k=60` across `(dense_ranks, lex_ranks)` and slice `[:top_k]`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-2-3',
      difficulty: 'debug',
      requires: ['hnsw-ann', 'vector-db'],
      title: 'Lab 6.2.3 (Debug Buggy Code): Fix Inverted RRF Formula & Unfiltered Vector Check',
      prompt:
        'A broken retrieval filter has TWO bugs: 1) `compute_rrf_score` computes `1.0 / (k - rank)` instead of `1.0 / (k + rank)`, crashing with `ZeroDivisionError` at rank 60 and giving *lower* ranks higher scores! 2) `safe_vector_query` returns `top_k` docs *before* checking `tenant_id` ACL, leaking private docs from other tenants! Fix both functions cleanly.',
      starterCode: `def rrf_term(rank_1_indexed: int, k: int = 60) -> float:
    return 1.0 / (k - rank_1_indexed)  # Bug 1: minus instead of plus!

def safe_vector_query(scored_docs: list[dict], tenant_id: str, top_k: int) -> list[dict]:
    # Bug 2: slices [:top_k] BEFORE filtering tenant_id!
    top = sorted(scored_docs, key=lambda d: d["score"], reverse=True)[:top_k]
    return [d for d in top if d["tenant"] == tenant_id]`,
      testCode: `assert abs(rrf_term(1, k=60) - 1.0 / 61.0) < 1e-9
assert abs(rrf_term(60, k=60) - 1.0 / 120.0) < 1e-9
assert rrf_term(1) > rrf_term(10)

docs = [
    {"id": "secret1", "tenant": "beta", "score": 0.99},
    {"id": "secret2", "tenant": "beta", "score": 0.95},
    {"id": "mine1", "tenant": "acme", "score": 0.80},
    {"id": "mine2", "tenant": "acme", "score": 0.70},
]
out = safe_vector_query(docs, tenant_id="acme", top_k=2)
assert [d["id"] for d in out] == ["mine1", "mine2"], f"Pre-filter failed! Got {out}"
print("PASS: Lab 6.2.3 RRF sign & ACL pre-filtering bugs fixed!")`,
      solutionCode: `def rrf_term(rank_1_indexed: int, k: int = 60) -> float:
    return 1.0 / (k + rank_1_indexed)

def safe_vector_query(scored_docs: list[dict], tenant_id: str, top_k: int) -> list[dict]:
    allowed = [d for d in scored_docs if d["tenant"] == tenant_id]
    return sorted(allowed, key=lambda d: d["score"], reverse=True)[:top_k]`,
      hint: 'Change `k - rank_1_indexed` to `k + rank_1_indexed`, and filter `[d for d in scored_docs if d["tenant"] == tenant_id]` BEFORE sorting and slicing `[:top_k]`.',
      hints: [
        'Standard RRF term is `1.0 / (k + rank_1_indexed)`.',
        'Pre-filter `allowed` by `d["tenant"] == tenant_id` first.',
        'Sort `allowed` descending by `"score"` and slice `[:top_k]`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q6-2-1',
      type: 'multiple-choice',
      question: 'Why does **HNSW** make searching 10 million vectors take milliseconds instead of seconds?',
      options: [
        'It compresses 1536-dimensional embedding arrays down into single 1D sortable integers',
        'Multi-layer graphs step down coarse highways to local neighbors in $O(\\log N)$ hops',
        'It sorts every stored embedding vector alphabetically by primary key identifier string',
        'It permanently deletes ninety percent of unpopular document chunks during index builds',
      ],
      correctIndex: 1,
      explanation: 'HNSW avoids $O(N)$ brute-force scanning by greedily traversing sparse highway layers down to dense bottom neighborhoods.',
    },
    {
      id: 'q6-2-2',
      type: 'multiple-choice',
      question: 'Why are Cross-Encoders restricted to Stage-2 Reranking (top ~50 candidates) instead of searching 1M documents directly?',
      options: [
        'They run joint `[query; doc]` attention per pair, making 1M comparisons too slow',
        'Cross-Encoders can only compute similarity scores strictly between visual image patches',
        'Cross-Encoders cannot output calibrated float scores suitable for ranking candidate lists',
        'Cross-Encoders deliver lower retrieval precision than raw Bi-Encoder cosine dot products',
      ],
      correctIndex: 0,
      explanation: 'Because query and document attend token-by-token inside the Transformer, document representations cannot be precomputed ahead of query time.',
    },
    {
      id: 'q6-2-3',
      type: 'multiple-choice',
      question: 'What problem does Reciprocal Rank Fusion (RRF) solve when merging BM25 and Cosine similarity?',
      options: [
        'RRF translates multilingual foreign documents cleanly into English prior to tokenization',
        'RRF replaces document chunking pipelines completely by indexing raw PDFs unsplit',
        'RRF merges incompatible BM25 and Cosine scales cleanly using pure ranks',
        'RRF fine-tunes dense embedding layer weights automatically from live user click logs',
      ],
      correctIndex: 2,
      explanation: 'Rank-based fusion avoids brittle min-max normalization across unrelated sparse and dense scoring scales.',
    },
    {
      id: 'q6-2-4',
      type: 'spot-bug',
      code: `hits = vector_db.search(q_vec, top_k=5)
safe_hits = [h for h in hits if h["tenant"] == current_tenant]`,
      question: 'Why is filtering `tenant == current_tenant` AFTER `.search(top_k=5)` a serious RAG failure?',
      options: [
        'It converts Cosine similarity distances back into unnormalized Euclidean lengths silently',
        'List comprehensions fail on database rows containing nested JSON metadata dictionaries',
        'Python runs post-filtering slower than training a dedicated per-tenant embedding encoder',
        'Other tenants can fill `top_k=5`, starving `safe_hits` down to zero docs',
      ],
      correctIndex: 3,
      explanation: 'Post-filtering starves recall whenever top-k slots are filled by other tenants! Always enforce `tenant_id` pre-filtering inside the retrieval engine.',
    },
    {
      id: 'q6-2-5',
      type: 'multi-select',
      question: 'Which TWO statements accurately compare FAISS, Chroma, and PostgreSQL `pgvector`?',
      options: [
        '`pgvector` lets you enforce ACID SQL `WHERE tenant_id = ...` pre-filters and relational joins in one database',
        'FAISS excels at fast in-memory ANN prototyping while lacking built-in SQL relational transactions',
        'Chroma requires training a dedicated GPU cluster before storing 100 local chunks',
        'FAISS automatically converts SQLite tables into distributed multi-region cloud databases',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: '`pgvector` brings transactional SQL joins and ACLs alongside HNSW, while FAISS is a pure vector-index library best for embedded/batch indexing.',
    },
    {
      id: 'q6-2-6',
      type: 'numeric',
      question: 'Using standard RRF (`k = 60`), what is the score contribution `1 / (60 + rank)` for a document at rank `1` in dense AND rank `4` in BM25 (rounded to 4 decimals)?',
      options: [],
      correctIndex: 0,
      correctNumber: 0.032,
      tolerance: 0.001,
      explanation: '`1 / (60 + 1) + 1 / (60 + 4) = 1/61 + 1/64 ≈ 0.01639 + 0.01563 = 0.0320`.',
    },
    {
      id: 'q6-2-7',
      type: 'predict-output',
      code: `d = ["A", "B"]
b = ["B", "C"]
s = {}
for lst in (d, b):
    for i, x in enumerate(lst, 1):
        s[x] = s.get(x, 0) + 1 / (60 + i)
print(max(s, key=s.get))`,
      question: 'Which document ID wins top RRF rank?',
      options: [
        '`"A"`',
        '`"C"`',
        '`"B"`',
        'Ties cleanly between `"A"` and `"C"`',
      ],
      correctIndex: 2,
      explanation: '`"B"` appears in BOTH lists (`1/62 + 1/61 = 0.0325`), beating single-list `"A"` (`1/61`) and `"C"` (`1/62`).',
    },
    {
      id: 'q6-2-8',
      type: 'ordering',
      question: 'Order the stages inside a production hybrid multi-tenant RAG search pipeline:',
      options: [],
      items: [
        'Apply tenant_id / ACL metadata pre-filter',
        'Run BM25 lexical and Dense HNSW retrieval in parallel',
        'Merge top candidates cleanly with Reciprocal Rank Fusion (RRF)',
        'Rerank top 50 candidates down to top 5 with a Cross-Encoder',
      ],
      correctIndex: 0,
      explanation: 'Enforce ACL pre-filter -> run parallel BM25 + Dense -> fuse with RRF -> Cross-Encoder rerank down to final top-k.',
    },
    {
      id: 'q6-2-9',
      type: 'multiple-choice',
      question: 'When might querying a vector collection return meaningless garbage even though HNSW runs fast without throwing errors?',
      options: [
        'When `top_k` is set to `5` instead of `10` on cosine normalized vectors',
        'When you embed user queries with a DIFFERENT embedding model than the stored document vectors',
        'When documents contain lowercase punctuation characters alongside spaces',
        'When using `k = 60` inside Reciprocal Rank Fusion instead of `k = 50`',
      ],
      correctIndex: 1,
      explanation: 'Two different embedding models map identical sentences into completely unrelated coordinate spaces! Always pair query and document indexes under the exact same embedding model version.',
    },
  ],
};
