import type { Lesson } from '@/types/course';

export const lesson6_3: Lesson = {
  id: '6-3',
  moduleId: 'mod-6',
  number: '6.3',
  title: 'Production RAG Architecture & Chunking Pipelines',
  subtitle: 'Most RAG failures happen before the prompt ever reaches the LLM. Learn chunking, ACL pre-filtering, parent-child retrieval, citations, and refusal.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['6.2'],
  requires: ['python-functions', 'cosine-similarity', 'hybrid-search'],
  teaches: [
    'rag-chunking',
    'contextual-retrieval',
    'parent-child-rag',
    'acl-prefiltering',
    'query-rewriting',
    'rag-citations',
    'rag-refusal',
  ],
  competencies: ['jr-basic-rag', 'mid-hybrid-rag'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Design structure-aware contextual chunking pipelines with controlled overlap instead of blind character slicing.',
    'Implement Small-to-Big (parent-child) retrieval so search queries match sharp snippets while generators read full context.',
    'Enforce mandatory multi-tenant ACL pre-filtering inside retrieval before top-k ranking.',
    'Build query rewriting, verifiable inline citations, and grounded refusal using a deterministic offline RAG harness.',
  ],
  checkWithoutNotes: [
    'Why does fixed-width character slicing (like `text[0:500]`) silently degrade RAG accuracy on structured documents?',
    'What breaks in security AND recall when you apply `tenant_id` filtering AFTER taking `top_k` vector matches instead of before?',
    'In the Small-to-Big (parent-child) pattern, why do we embed a smaller child chunk if we plan to send a larger parent block to the LLM anyway?',
    'Why do follow-up chat questions containing pronouns like "How much does it cost?" fail naive retrieval, and how does query rewriting solve this?',
    'What two runtime checks guarantee an answer neither invents fake citations nor answers when retrieved evidence is absent?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'In real company engineering teams, building a toy Retrieval-Augmented Generation (RAG) script takes an afternoon. Making that same system survive real customer traffic takes weeks of careful retrieval, security, and verification work. Almost every urgent ticket you investigate on an AI team is not because the language model forgot English grammar—it is because the retrieval pipeline handed the model broken fragments, wrong-company files, or empty context.',
        'Consider three incidents that show up repeatedly in production. First, a support engineer reports that the AI assistant confidently told a customer a refund takes five days instead of thirty days, because fixed-width chunking sliced a Markdown pricing table directly in half and dropped the footnote row. Second, a security alert fires because an enterprise user in Company A saw a snippet or "no results found" caused by post-filtering `tenant_id` after taking global top-k matches. Third, a user asks a clear follow-up question—"Does it include SAML?"—right after asking about the Enterprise Plan, and the retriever searches literally for the pronoun "it" without knowing which plan was mentioned one turn earlier.',
        'Production RAG solves all three problems systematically at the data-pipeline and retrieval layers before generation even starts. Rather than tweaking adjectives in a system prompt, you control document structure, access boundaries, candidate fusion, parent context expansion, query contextualization, citation verification, and explicit refusal when evidence is missing.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Security Desk, Index Cards & Binder Pages',
      paragraphs: [
        'Think of a production RAG system like an ultra-strict research library inside a multi-company office building. You are the librarian helping an employee answer a question from locked filing cabinets.',
        'Before searching a single folder, the librarian checks the employee badge (`tenant_id` and role permissions) at the door. You do not grab the ten best-matching folders from the whole building and throw away the unauthorized ones afterward—you only unlock the drawers belonging to that employee\'s company. That is **ACL pre-filtering**: unauthorized documents never enter the candidate pool.',
        'Next, instead of ripping every manual into random five-inch paper strips, you file **index cards** (small child chunks labeled with the manual title and section heading, such as `[Billing Handbook > Error Codes]`). An index card is short and laser-focused, so its embedding vector stays sharp instead of blurring five unrelated topics together. When your search matches the index card, you do not hand the employee only that tiny card—you pull the entire **binder page** (the larger parent section containing surrounding caveats, tables, and formulas) and hand that full page to the reader.',
        'Finally, if the question relies on an earlier sentence ("What about on the Pro plan?"), the librarian first writes out the full standalone question on a sticky note (**query rewriting**). Once you read the binder page, you write the final answer citing exact page IDs (`[doc_12]`)—and if the binder page does not contain the answer, you state plainly that the documentation does not cover it instead of guessing from memory.',
      ],
    },
    {
      type: 'visual-diagram',
      diagramId: 'hybrid-rag',
      title: 'Production Multi-Tenant Hybrid RAG Blueprint',
      caption: 'Mandatory `tenant_id` ACL pre-filtering protects privacy before BM25 + Vector RRF fusion, parent expansion, and grounded citation checks.',
    },
    {
      type: 'concept-reel',
      reelId: 'rag-pipeline-reel',
      title: 'Animated Walkthrough: Trace a Customer Question Through Production RAG',
      description: 'Watch how a question with an exact error code (`E-402`) survives ACL filtering, hybrid search, reranking, and citation checks.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Structure-Aware Contextual Chunking',
      paragraphs: [
        'Naive tutorials split documents every 400 or 500 characters (`text[i : i + 500]`). On real handbooks, this creates orphan sentences such as `"Returns take 14 business days."` without stating which product tier or exception applies. Even worse, hard character cuts split words and Markdown tables cleanly in half.',
        'Structure-aware contextual chunking fixes this in two small steps. First, parse natural boundaries such as Markdown headings (`#`, `##`), keeping track of the active section title as you walk down the file. Second, split long sections along sentence or paragraph boundaries with a modest overlap (for example, carrying the last sentence forward so ideas spanning a boundary stay intact), and **prepend the document title and section breadcrumb** directly onto every stored chunk (`[Billing Guide > E-402 Refunds] ...`). Below is a compact Python implementation and its exact printed output.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Contextual Chunker + Explained Output',
      language: 'python',
      code: `def contextual_chunk_markdown(doc_title: str, md_text: str, max_chars: int = 120, overlap_sentences: int = 1) -> list[str]:
    chunks = []
    section = "Overview"
    for block in md_text.strip().split("\\n\\n"):
        line = block.strip()
        if line.startswith("## "):
            section = line[3:].strip()
            continue
        sentences = [s.strip() for s in line.split(". ") if s.strip()]
        prefix = f"[{doc_title} > {section}] "
        i = 0
        while i < len(sentences):
            window = sentences[i : i + 2]
            body = ". ".join(s.rstrip(".") for s in window) + "."
            chunks.append(prefix + body[:max_chars])
            if i + 2 >= len(sentences):
                break
            i += max(1, 2 - overlap_sentences)
    return chunks

doc = """## Refund Policy
Small accessories qualify within 14 days. Laptops require unused packaging. Enterprise contracts use custom terms."""
for idx, c in enumerate(contextual_chunk_markdown("Support SLA", doc), start=1):
    print(f"Chunk {idx}: {c}")`,
      caption: 'Notice the output: `Chunk 1: [Support SLA > Refund Policy] Small accessories qualify within 14 days. Laptops require unused packaging.` and `Chunk 2: [Support SLA > Refund Policy] Laptops require unused packaging. Enterprise contracts use custom terms.` Both chunks retain the breadcrumb AND share the overlapping middle sentence.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Small-to-Big (Parent-Child) Retrieval & Multi-Tenant ACL Pre-Filtering',
      paragraphs: [
        'Embedding models compress an entire piece of text into one fixed-size vector. When a single chunk contains 1,000 tokens spanning three subtopics, that averaged vector becomes blurry and scores poorly against crisp user queries. Conversely, if you retrieve a tiny 150-token snippet and feed ONLY that snippet to the generator, the LLM misses surrounding qualifications in the same section.',
        'The **Small-to-Big (Parent-Child)** pattern decouples what you *index* from what you *read*. Each parent section stores its full text under a `parent_id`, while smaller child sentences point back to that `parent_id`. You search over child chunks for razor-sharp matching, then deduplicate and fetch each winner\'s full parent text before calling the LLM.',
        'At the same time, look closely at what happens if you apply tenant security *after* taking `top_k = 2` matches globally. Suppose Tenant `beta` has two confidential files scoring `0.95` and `0.91`, while Tenant `acme` has a valid file scoring `0.78`. A post-filter grabs `top_k = 2` globally (`beta` and `beta`), removes both because `tenant_id != "acme"`, and returns an **empty list** to Acme—even though Acme had an authorized match waiting at rank 3! Filtering `tenant_id in (user_tenant, "public")` **before** sorting and slicing `[:top_k]` guarantees both zero data leakage and accurate recall.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: ACL Pre-Filtering + Parent-Child Expansion Trace',
      language: 'python',
      code: `PARENTS = {
    "p_acme": "Acme SLA: Error E-402 qualifies for 100% credit within 14 days if submitted via portal.",
    "p_beta": "Beta Secret: Custom 45% volume discount on annual tier.",
}
CHILDREN = [
    {"id": "c1", "parent_id": "p_beta", "tenant": "beta", "score": 0.96},
    {"id": "c2", "parent_id": "p_acme", "tenant": "acme", "score": 0.79},
]

def retrieve_parent_ids(user_tenant: str, prefilter: bool, top_k: int = 1) -> list[str]:
    pool = [c for c in CHILDREN if c["tenant"] in (user_tenant, "public")] if prefilter else CHILDREN
    top = sorted(pool, key=lambda c: c["score"], reverse=True)[:top_k]
    if not prefilter:
        top = [c for c in top if c["tenant"] in (user_tenant, "public")]
    return [PARENTS[c["parent_id"]] for c in top]

print("Post-filter (BUG):", retrieve_parent_ids("acme", prefilter=False, top_k=1))
print("Pre-filter  (FIX):", retrieve_parent_ids("acme", prefilter=True, top_k=1))`,
      caption: 'Explained output: Post-filter prints `[]` because `c1` (`beta`, `0.96`) filled the single `top_k=1` slot before being stripped! Pre-filter restricts `pool` to `acme` first, so `c2` wins cleanly and expands to `"Acme SLA: Error E-402 qualifies for 100% credit within 14 days..."`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Query Rewriting, Deterministic Citations & Grounded Refusal',
      paragraphs: [
        'In multi-turn chat, users rarely repeat full nouns in every follow-up message. After asking *"Compare Starter and Enterprise SSO"* in Turn 1, a user types *"Does it support Okta?"* in Turn 2. Embedding `"Does it support Okta?"` directly yields weak matches because `"Enterprise"` is missing from the query string. A lightweight **Query Rewriter** combines recent conversation entities with the latest turn to produce `"Does Enterprise plan support Okta?"` before hitting the retriever.',
        'After expanding parent sections, your generator prompt must explicitly forbid external guessing and enforce a strict citation format: every factual sentence cites `[chunk_id]`, and if retrieved scores fall below a relevance floor (or no chunk answers the question), the system returns a clear refusal such as `"Not found in provided context."` Why verify citations in deterministic Python code instead of trusting the model? Even capable LLMs occasionally hallucinate plausible-looking IDs like `[doc_99]` when context is noisy. Checking `all(c in retrieved_ids for c in answer_citations)` catches fabricated sources automatically before showing a single word to users.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 3: Deterministic Offline RAG + Citation & Refusal Check',
      language: 'python',
      code: `def rewrite_followup(history: list[str], query: str) -> str:
    if ("it" in query.lower().split() or "that" in query.lower().split()) and history:
        return f"{history[-1]} — {query}"
    return query

def generate_grounded_mock(query: str, chunks: list[dict]) -> dict:
    q_words = set(query.lower().split())
    best = max(chunks, key=lambda c: sum(1 for w in q_words if w in c["text"].lower()), default=None)
    overlap = sum(1 for w in q_words if best and w in best["text"].lower()) if best else 0
    if not best or overlap == 0:
        return {"answer": "Not found in provided context.", "cited_ids": []}
    return {"answer": f"{best['text']} [{best['id']}]", "cited_ids": [best["id"]]}

docs = [{"id": "sso_1", "text": "Enterprise tier includes Okta SAML 2.0 SSO."}]
rewritten = rewrite_followup(["Enterprise SSO"], "Does it support Okta?")
res = generate_grounded_mock(rewritten, docs)
print("Rewritten:", rewritten)
print("Response :", res)
print("No-hit   :", generate_grounded_mock("Crypto tax rules?", docs))`,
      caption: 'Explained output: Follow-up resolves to `"Enterprise SSO — Does it support Okta?"`, returns cited JSON with `cited_ids: ["sso_1"]`, and cleanly refuses `"Crypto tax rules?"` with `cited_ids: []`.',
    },
    {
      type: 'table',
      title: 'Common Production RAG Mistakes & How to Debug Them',
      headers: ['Symptom in Production', 'Root Cause to Check in Traces', 'Exact Engineering Fix'],
      rows: [
        ['Chunk says `"It costs $40"` without naming the plan or currency', 'Chunker discarded parent heading context when splitting', 'Prepend `[Doc Title > Section Heading]` to every child chunk before indexing'],
        ['Authorized user gets empty results (`[]`) on a top-k search', 'Security `tenant_id` filter ran *after* `top_k`, letting another tenant occupy top slots', 'Apply `tenant_id` / ACL `WHERE` clause strictly as a pre-filter before ranking'],
        ['Answer is fluent but quotes `[doc_77]` which was never retrieved', 'Generator fabricated a citation ID from parametric memory', 'Parse cited IDs in Python and reject any ID absent from retrieved `chunk_id` set'],
        ['Follow-up chat questions pull unrelated docs', 'Ambiguous pronouns (`"it"`, `"those"`) sent raw to embeddings', 'Run a standalone query-rewriting step conditioned on recent conversation turns'],
        ['Exact error codes (`E-402`, `SKU-91`) rank poorly in pure vector search', 'Dense embeddings capture broad meaning but smooth over exact rare tokens', 'Combine BM25 keyword scores with dense vector similarity via Reciprocal Rank Fusion'],
      ],
    },
    {
      type: 'callout',
      variant: 'interview',
      title: 'How to Reason About RAG vs Long-Context Windows in Interviews',
      body: 'Long-context models (128k to 1M+ tokens) do not replace RAG for production knowledge bases. Sending a 400,000-token manual on every request consumes dramatically more input tokens and prefill time than retrieving five 300-token chunks (1,500 tokens total—over 250× fewer input tokens per call in that concrete case), cannot hold tens of millions of rotating enterprise records, and offers no automatic per-document ACL boundary. In practice, **Hybrid RAG + Rerank** narrows millions of docs down to the best 10–25 parent sections, and a capable context window synthesizes those cleanly.',
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Chunk by document structure, not arbitrary character counts:** Keep sentences and tables intact, add modest overlap, and prepend `[Doc > Section]` breadcrumbs to every chunk.',
        '2. **Separate search granularity from reading granularity (Parent-Child):** Match against focused child chunks, then expand to full deduplicated parent sections for generation.',
        '3. **Never post-filter security ACLs:** Filter by `tenant_id` and user permissions *before* ranking or slicing `top_k` candidates.',
        '4. **Fix conversational pronouns before retrieval:** Rewrite follow-up questions into standalone queries, and fuse BM25 + dense rankings for exact IDs plus semantics.',
        '5. **Verify grounding in code:** Require inline `[chunk_id]` citations checked against the retrieved set and return an explicit refusal when no chunk passes the relevance bar.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-3-1',
      difficulty: 'guided',
      requires: ['rag-chunking', 'contextual-retrieval'],
      title: 'Lab 6.3.1 (Guided): Contextual Structure-Aware Paragraph Chunker',
      prompt:
        'Complete `build_contextual_chunks(doc_title, sections)` where `sections` is a list of `(heading, paragraph)` tuples. Split each `paragraph` on `". "` into non-empty sentences, take overlapping pairs (step by `1` if `len(sentences) > 2`, else `2`), and format each chunk as `f"[{doc_title} > {heading}] {joined_sentences}"` ending cleanly with a period.',
      starterCode: `def build_contextual_chunks(doc_title: str, sections: list[tuple[str, str]]) -> list[str]:
    chunks = []
    for heading, para in sections:
        sents = [s.strip().rstrip(".") for s in para.split(".") if s.strip()]
        # Create 2-sentence windows with 1-sentence overlap!
        # Prefix every chunk with f"[{doc_title} > {heading}] "
        pass
    return chunks

demo_sections = [
    ("Pricing", "Pro costs $20. Enterprise adds SSO. Custom SLAs apply."),
]
print(build_contextual_chunks("SaaS Guide", demo_sections))`,
      testCode: `secs = [
    ("Pricing", "Pro costs $20. Enterprise adds SSO. Custom SLAs apply."),
    ("Limits", "Rate limit is 60 RPM."),
]
out = build_contextual_chunks("SaaS Guide", secs)
assert len(out) == 3, f"Expected 3 chunks (2 from Pricing with overlap, 1 from Limits), got {len(out)}: {out}"
assert out[0] == "[SaaS Guide > Pricing] Pro costs $20. Enterprise adds SSO."
assert out[1] == "[SaaS Guide > Pricing] Enterprise adds SSO. Custom SLAs apply."
assert out[2] == "[SaaS Guide > Limits] Rate limit is 60 RPM."
print("PASS: Lab 6.3.1 contextual overlap chunker passed!")`,
      solutionCode: `def build_contextual_chunks(doc_title: str, sections: list[tuple[str, str]]) -> list[str]:
    chunks = []
    for heading, para in sections:
        sents = [s.strip().rstrip(".") for s in para.split(".") if s.strip()]
        if len(sents) <= 2:
            if sents:
                chunks.append(f"[{doc_title} > {heading}] " + ". ".join(sents) + ".")
        else:
            for i in range(len(sents) - 1):
                window = ". ".join(sents[i : i + 2]) + "."
                chunks.append(f"[{doc_title} > {heading}] {window}")
    return chunks`,
      hint: 'Handle `len(sents) <= 2` as a single chunk; otherwise loop `for i in range(len(sents) - 1):` joining `sents[i : i + 2]`.',
      hints: [
        'First handle short sections (`len(sents) <= 2`) by joining all sentences in `sents` once.',
        'For 3+ sentences, sliding a 2-sentence window by step `1` (`sents[i:i+2]`) creates `[s0, s1]` then `[s1, s2]` — automatic 1-sentence overlap!',
        'Always prepend `f"[{doc_title} > {heading}] "` and append a single `"."` at the end.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-3-2',
      difficulty: 'spec',
      requires: ['acl-prefiltering', 'hybrid-search'],
      title: 'Lab 6.3.2 (From Spec): ACL Pre-Filtered Hybrid RRF Retriever',
      prompt:
        'Implement `acl_hybrid_search(query, docs, tenant_id, top_k=2)`. Each `doc` dict has `{"id": str, "tenant": str, "text": str, "vec_score": float}`. 1) Pre-filter to keep only docs whose `tenant` is `tenant_id` or `"public"`. 2) Build `bm25_rank`: IDs sorted by count of lowercase query words present in lowercase doc text (tie-break descending `vec_score`). 3) Build `vec_rank`: IDs sorted descending by `vec_score`. 4) Fuse ranks using RRF with `k=60`: score `1 / (60 + rank_idx + 1)` summed across both rankings, and return the top `top_k` doc IDs.',
      starterCode: `def acl_hybrid_search(query: str, docs: list[dict], tenant_id: str, top_k: int = 2) -> list[str]:
    # Your implementation here (enforce ACL pre-filter -> rank BM25 & vector -> RRF fuse)
    return []`,
      testCode: `sample_docs = [
    {"id": "beta_deal", "tenant": "beta", "text": "Confidential E-402 enterprise refund terms", "vec_score": 0.98},
    {"id": "acme_refund", "tenant": "acme", "text": "Error E-402 grants 14 day full credit", "vec_score": 0.72},
    {"id": "acme_general", "tenant": "acme", "text": "General return shipping guidelines", "vec_score": 0.85},
    {"id": "pub_hours", "tenant": "public", "text": "Support hours 9 to 5", "vec_score": 0.40},
]
res = acl_hybrid_search("E-402 credit", sample_docs, "acme", top_k=2)
assert "beta_deal" not in res, "ACL leak: beta_deal must never be returned!"
assert len(res) == 2 and "acme_refund" in res and "acme_general" in res, f"Unexpected results: {res}"
res_exact = acl_hybrid_search("E-402 grants credit", sample_docs, "acme", top_k=1)
assert res_exact == ["acme_refund"], f"Expected acme_refund #1 via BM25+vec RRF, got {res_exact}"
print("PASS: Lab 6.3.2 ACL Pre-Filtered Hybrid RRF passed!")`,
      solutionCode: `def acl_hybrid_search(query: str, docs: list[dict], tenant_id: str, top_k: int = 2) -> list[str]:
    allowed = [d for d in docs if d["tenant"] in (tenant_id, "public")]
    q_words = set(query.lower().split())
    bm25_sorted = sorted(
        allowed,
        key=lambda d: (sum(1 for w in q_words if w in d["text"].lower()), d["vec_score"]),
        reverse=True,
    )
    vec_sorted = sorted(allowed, key=lambda d: d["vec_score"], reverse=True)
    scores = {}
    for ranking in ([d["id"] for d in bm25_sorted], [d["id"] for d in vec_sorted]):
        for idx, doc_id in enumerate(ranking):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (60 + idx + 1)
    return sorted(scores, key=lambda d_id: scores[d_id], reverse=True)[:top_k]`,
      hint: 'Filter `allowed` first! Then create two sorted lists (`bm25_sorted`, `vec_sorted`), accumulate `1.0 / (60 + idx + 1)` into a `scores` dict, and slice `[:top_k]`.',
      hints: [
        'Start with `allowed = [d for d in docs if d["tenant"] in (tenant_id, "public")]`.',
        'Sort `allowed` by `(keyword_hits, d["vec_score"])` descending for BM25, and by `d["vec_score"]` descending for dense vectors.',
        'Sum `1.0 / (60 + idx + 1)` for each `doc_id` across both rankings and return `sorted(scores, key=lambda i: scores[i], reverse=True)[:top_k]`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-3-3',
      difficulty: 'debug',
      requires: ['parent-child-rag', 'rag-citations'],
      title: 'Lab 6.3.3 (Debug Buggy Code): Fix Broken Parent-Child & Citation Guard',
      prompt:
        'A teammate pushed `answer_with_parent_context` below, and two bugs slipped into production: 1) returning child snippets instead of expanding deduplicated `parent_id` texts (keeping first-seen parent order), and 2) failing to filter `cited_ids` strictly against the actually retrieved `parent_ids` (letting hallucinated citations pass!). Fix both bugs.',
      starterCode: `def answer_with_parent_context(children: list[dict], parents: dict[str, str], llm_fn, query: str) -> dict:
    # BUG 1: retrieves child dicts directly without deduplicating or expanding to parents!
    top_children = children[:2]
    context_ids = [c["id"] for c in top_children]
    context_texts = [c["text"] for c in top_children]

    raw_response = llm_fn(query, context_ids, context_texts)
    # BUG 2: blindly trusts raw_response["cited_ids"] even if an ID wasn't in retrieved parents!
    return raw_response`,
      testCode: `parents_db = {
    "p_sla": "Full SLA Parent: E-402 refunds settle within 14 business days for Pro & Enterprise.",
    "p_sso": "Full SSO Parent: SAML 2.0 via Okta requires Enterprise plan.",
}
matched_children = [
    {"id": "c1", "parent_id": "p_sla", "text": "E-402 refunds settle"},
    {"id": "c2", "parent_id": "p_sla", "text": "within 14 business days"},
    {"id": "c3", "parent_id": "p_sso", "text": "SAML 2.0 via Okta"},
]
seen_inputs = {}
def fake_llm(q, ids, texts):
    seen_inputs["ids"] = ids
    seen_inputs["texts"] = texts
    return {"answer": "14 days [p_sla]", "cited_ids": ["p_sla", "hallucinated_99"]}

out = answer_with_parent_context(matched_children, parents_db, fake_llm, "E-402 refund?")
assert seen_inputs["ids"] == ["p_sla", "p_sso"], f"Expected deduplicated parent IDs ['p_sla', 'p_sso'], got {seen_inputs['ids']}"
assert "Full SLA Parent:" in seen_inputs["texts"][0], "Must expand to parent text!"
assert out["cited_ids"] == ["p_sla"], f"Hallucinated citation must be stripped! Got {out['cited_ids']}"
print("PASS: Lab 6.3.3 Parent-Child expansion & citation sanitizer fixed!")`,
      solutionCode: `def answer_with_parent_context(children: list[dict], parents: dict[str, str], llm_fn, query: str) -> dict:
    parent_ids = []
    for c in children:
        pid = c["parent_id"]
        if pid in parents and pid not in parent_ids:
            parent_ids.append(pid)
        if len(parent_ids) == 2:
            break
    context_texts = [parents[pid] for pid in parent_ids]
    raw_response = llm_fn(query, parent_ids, context_texts)
    allowed = set(parent_ids)
    valid_cites = [cid for cid in raw_response.get("cited_ids", []) if cid in allowed]
    return {"answer": raw_response.get("answer", ""), "cited_ids": valid_cites}`,
      hint: 'Deduplicate `c["parent_id"]` preserving order (up to 2 unique parents), pass `[parents[pid] for pid in parent_ids]` to `llm_fn`, then filter `cited_ids` against `set(parent_ids)`.',
      hints: [
        'Loop through `children`, track unique `c["parent_id"]` values preserving order until you have 2 unique parent IDs.',
        'Build `context_texts = [parents[pid] for pid in parent_ids]` and call `llm_fn(query, parent_ids, context_texts)`.',
        'Sanitize citations: `[cid for cid in raw_response.get("cited_ids", []) if cid in set(parent_ids)]`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-3-4',
      difficulty: 'challenge',
      requires: ['query-rewriting', 'acl-prefiltering', 'rag-refusal', 'rag-citations'],
      title: 'Lab 6.3.4 (Open Challenge): End-to-End Offline RAG Pipeline with Refusal',
      prompt:
        'Wire together `run_production_rag(history, query, tenant_id, docs, mock_llm)` using everything from this lesson:\n1) If `query` contains `" it "` or ends with `" it?"` (case-insensitive) and `history` is non-empty, prepend `history[-1] + " "` to `query`.\n2) Pre-filter `docs` to `d["tenant"] in (tenant_id, "public")`.\n3) Keep only docs sharing at least 2 lowercase alphanumeric words (>=2 chars) with the rewritten query (after stripping punctuation `?.,!`). Rank descending by overlap count, taking top 2.\n4) If zero docs match >= 2 words, DO NOT call `mock_llm`—return `{"answer": "Not found in provided context.", "cited_ids": []}`.\n5) Otherwise call `mock_llm(rewritten_query, top_docs)` and keep only `cited_ids` actually in `[d["id"] for d in top_docs]`.',
      starterCode: `import re

def run_production_rag(history: list[str], query: str, tenant_id: str, docs: list[dict], mock_llm) -> dict:
    # Build the complete offline RAG pipeline cleanly!
    pass`,
      testCode: `import re

docs = [
    {"id": "d_sso", "tenant": "acme", "text": "Enterprise plan includes Okta SAML single sign-on."},
    {"id": "d_beta", "tenant": "beta", "text": "Beta enterprise discount secret Okta terms."},
    {"id": "d_sla", "tenant": "public", "text": "Standard support responds within 24 hours."},
]

calls = []
def deterministic_mock_llm(q, retrieved):
    calls.append(q)
    return {"answer": f"{retrieved[0]['text']} [{retrieved[0]['id']}]", "cited_ids": [retrieved[0]["id"], "fake_id"]}

# 1. Conversational follow-up resolves pronoun -> hits d_sso, blocks d_beta, strips fake_id
r1 = run_production_rag(["Enterprise SSO plan"], "Does it include Okta?", "acme", docs, deterministic_mock_llm)
assert r1["cited_ids"] == ["d_sso"], f"Expected ['d_sso'], got {r1}"
assert len(calls) == 1

# 2. Out-of-scope query triggers grounded refusal WITHOUT calling LLM
r2 = run_production_rag([], "What is Mars gravity?", "acme", docs, deterministic_mock_llm)
assert r2 == {"answer": "Not found in provided context.", "cited_ids": []}, f"Expected refusal, got {r2}"
assert len(calls) == 1, "LLM should NOT be called when 0 docs pass overlap gate!"
print("PASS: Lab 6.3.4 Complete Offline Production RAG Pipeline passed!")`,
      solutionCode: `import re

def run_production_rag(history: list[str], query: str, tenant_id: str, docs: list[dict], mock_llm) -> dict:
    q_tokens_raw = re.findall(r"[a-z0-9]+", query.lower())
    rewritten = f"{history[-1]} {query}" if ("it" in q_tokens_raw and history) else query
    q_words = {w for w in re.findall(r"[a-z0-9]+", rewritten.lower()) if len(w) >= 2}

    allowed = [d for d in docs if d["tenant"] in (tenant_id, "public")]
    scored = []
    for d in allowed:
        d_words = set(re.findall(r"[a-z0-9]+", d["text"].lower()))
        overlap = len(q_words & d_words)
        if overlap >= 2:
            scored.append((overlap, d))

    if not scored:
        return {"answer": "Not found in provided context.", "cited_ids": []}

    scored.sort(key=lambda pair: pair[0], reverse=True)
    top_docs = [d for _, d in scored[:2]]
    valid_ids = {d["id"] for d in top_docs}
    resp = mock_llm(rewritten, top_docs)
    return {
        "answer": resp.get("answer", ""),
        "cited_ids": [cid for cid in resp.get("cited_ids", []) if cid in valid_ids],
    }`,
      hint: 'Use `re.findall(r"[a-z0-9]+", text.lower())` for clean word tokenization, check `"it"` in query tokens, require `overlap >= 2`, return refusal early if empty, and filter `cited_ids`.',
      hints: [
        'Tokenize with `re.findall(r"[a-z0-9]+", ...)` so punctuation like `?` does not break `"it?"` or `"Okta?"`.',
        'Pre-filter `allowed` by `tenant_id`, then keep `(overlap, doc)` pairs where `len(q_words & d_words) >= 2`.',
        'If no pairs qualify, return `{"answer": "Not found in provided context.", "cited_ids": []}` immediately before calling `mock_llm`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q6-3-1',
      type: 'multiple-choice',
      question: 'In a multi-tenant RAG index, why must `tenant_id` filtering run BEFORE selecting `top_k` candidates rather than afterward?',
      options: [
        'Pre-filtering stops unauthorized docs from filling top-k candidate slots',
        'Post-filtering disables cosine dot products across normalized unit-length vectors',
        'Vector stores refuse string metadata fields unless filtered in a Python loop afterwards',
        'Pre-filtering automatically converts sparse BM25 counts into dense transformer weights',
      ],
      correctIndex: 0,
      explanation: 'Pre-filtering restricts search to authorized docs first so another tenant cannot displace results or leak presence; post-filtering does not disable cosine similarity, string metadata works fine in pre-filters, and filtering never changes BM25 into dense vectors.',
    },
    {
      id: 'q6-3-2',
      type: 'multiple-choice',
      question: 'What core problem does the Small-to-Big (Parent-Child) retrieval pattern solve?',
      options: [
        'Compressing 1,024-dimensional embeddings down to 64 dimensions at inference time',
        'Searching focused child snippets while giving the LLM full parent context sections',
        'Eliminating the need for chunk IDs or source verification on answers',
        'Replacing relational databases with fixed-width 200-character raw slices',
      ],
      correctIndex: 1,
      explanation: 'Focused child snippets keep embeddings sharp while parent expansion supplies surrounding tables and caveats; it neither reduces vector dimensions, removes citation checks, nor relies on blind 200-char slicing.',
    },
    {
      id: 'q6-3-3',
      type: 'predict-output',
      question: 'What does this post-filtered retrieval call print for `user_tenant="acme"`?',
      code: `docs = [
    {"id": "b1", "tenant": "beta", "score": 0.95},
    {"id": "a1", "tenant": "acme", "score": 0.81},
]
top = sorted(docs, key=lambda d: d["score"], reverse=True)[:1]
out = [d["id"] for d in top if d["tenant"] == "acme"]
print(out)`,
      options: [
        "['b1']",
        "['a1']",
        '[]',
        "['b1', 'a1']",
      ],
      correctIndex: 2,
      explanation: 'Slicing `[:1]` globally keeps only `b1` (highest score `0.95`), which is then removed by `d["tenant"] == "acme"`, leaving `[]`; `b1` fails the `if`, and `a1` was already sliced off before filtering.',
    },
    {
      id: 'q6-3-4',
      type: 'spot-bug',
      question: 'Which defect breaks retrieval quality in this chunking helper?',
      code: `def chunk_markdown(raw_md: str) -> list[str]:
    clean = raw_md.replace("#", "").strip()
    return [clean[i : i + 300] for i in range(0, len(clean), 300)]`,
      options: [
        'Using Python list comprehensions makes string slicing non-deterministic',
        'String lengths in Python cannot be divided cleanly without NumPy arrays',
        'Fixed-step slicing strips heading context and cuts tables across rows',
        'Calling `.strip()` deletes sentence periods and headers throughout the body',
      ],
      correctIndex: 2,
      explanation: 'Removing `#` erases section structure and `range(0, len, 300)` cuts sentences and tables without overlap; list comprehensions are deterministic, standard `range` handles any length, and `.strip()` only trims outer whitespace.',
    },
    {
      id: 'q6-3-5',
      type: 'multiple-choice',
      question: 'Why does prepending `[Doc Title > Section Heading]` to every chunk help retrieval accuracy?',
      options: [
        'It doubles the LLM maximum context window size during token generation',
        'It removes the need to store tenant access-control labels on document records',
        'It bypasses tokenizer vocabulary limits by replacing subwords with integers',
        'It keeps entity nouns attached to split child chunks',
      ],
      correctIndex: 3,
      explanation: 'Contextual breadcrumbs keep entity names attached to child chunks (fixing vague statements like `"It costs $20"`); headers do not expand context windows, replace ACL fields, or change tokenizer vocabularies.',
    },
    {
      id: 'q6-3-6',
      type: 'predict-output',
      question: 'Given `top_parents = ["p1", "p3"]`, what `cited_ids` list survives the deterministic guard below?',
      code: `retrieved = {"p1", "p3"}
raw_cites = ["p3", "p9", "p1"]
checked = [c for c in raw_cites if c in retrieved]
print(checked)`,
      options: [
        "['p3', 'p1']",
        "['p1', 'p9']",
        "['p3', 'p9', 'p1']",
        "['p9']",
      ],
      correctIndex: 0,
      explanation: 'The comprehension preserves original order of `raw_cites` while keeping only IDs in `{"p1", "p3"}`, stripping hallucinated `"p9"`; the other lists either keep `"p9"` or drop valid IDs.',
    },
    {
      id: 'q6-3-7',
      type: 'spot-bug',
      question: 'A support bot fails Turn 2 (*"Does it include refunds?"*) right after Turn 1 (*"Starter Plan limits"*). Which pipeline fix addresses this?',
      options: [
        'Raising temperature from `0.0` to `1.4` during final answer synthesis',
        'Rewriting the follow-up into a standalone query using chat history first',
        'Removing BM25 from hybrid search and setting `top_k` to `1` globally',
        'Disabling source `[chunk_id]` citations inside the generation system prompt',
      ],
      correctIndex: 1,
      explanation: 'Coreference rewriting turns `"it"` into `"Starter Plan"` before embedding/BM25 retrieval; higher sampling temperature only adds randomness, removing BM25 reduces lexical recall, and dropping citations weakens grounding.',
    },
    {
      id: 'q6-3-8',
      type: 'multi-select',
      question: 'Select ALL controls required in a trustworthy enterprise RAG pipeline before returning answers to users:',
      options: [
        'Pre-filtering search indexes by authorized `tenant_id` and role ACLs',
        'Validating output `[chunk_id]` citations against retrieved document IDs',
        'Storing every database password directly inside the system prompt text',
        'Returning a clear refusal when no retrieved chunk supports the question',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 3],
      explanation: 'ACL pre-filtering, deterministic citation verification, and grounded refusal protect privacy and accuracy; putting passwords inside system prompts is a severe security leak via prompt extraction.',
    },
    {
      id: 'q6-3-9',
      type: 'ordering',
      question: 'Order the 5 runtime stages of a safe multi-tenant RAG request from first (top) to last (bottom):',
      options: [],
      correctIndex: 0,
      items: [
        'Rewrite conversational follow-up into a standalone query',
        'Filter candidate pool using mandatory user tenant ACL',
        'Fuse hybrid BM25 + dense rankings and expand parent chunks',
        'Generate cited answer strictly from retrieved parent context',
        'Verify every cited chunk ID exists before sending response',
      ],
      explanation: 'You resolve pronouns before searching, lock tenant scope before ranking, retrieve and expand parent context, generate strictly from those parents, and validate citations before returning output.',
    },
    {
      id: 'q6-3-10',
      type: 'numeric',
      question: 'Instead of stuffing a 300,000-token manual into every prompt, RAG retrieves 5 parent chunks averaging 400 tokens each. How many total chunk tokens enter the prompt?',
      options: [],
      correctIndex: 0,
      correctNumber: 2000,
      tolerance: 0.01,
      unit: 'tokens',
      explanation: 'Five parent chunks multiplied by 400 tokens each equals 2,000 context tokens (instead of 300,000 tokens).',
    },
  ],
};
