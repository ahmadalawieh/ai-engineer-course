import type { Lesson } from '@/types/course';

export const lesson6_5: Lesson = {
  id: '6-5',
  moduleId: 'mod-6',
  number: '6.5',
  title: 'Caching, Latency/Cost Routing & Multilingual / Arabic-RTL Pipelines',
  subtitle: 'Cut LLM bills and tail latency with exact + semantic caching and model routing, and engineer reliable multilingual & Arabic/RTL AI applications.',
  durationMinutes: 60,
  track: 'ai-eng',
  prerequisites: ['6.3', '6.4'],
  requires: ['llm-retries-cost', 'cosine-similarity', 'rag-citations'],
  teaches: [
    'llm-caching',
    'model-routing',
    'multilingual-rtl',
  ],
  objectives: [
    'Design two-layer caching: exact canonicalized key caching AND tenant-scoped semantic similarity caching with safe similarity thresholds.',
    'Route simple queries to fast small models while reserving large frontier models for complex reasoning within latency and USD budgets.',
    'Normalize multilingual and Arabic text cleanly (`NFKC`, Alef/Ya unification, diacritic handling) so BM25 and retrieval stay consistent.',
    'Handle mixed RTL/LTR strings safely in prompts and UIs without corrupting IDs, code snippets, or citation brackets.',
  ],
  checkWithoutNotes: [
    'Why MUST every semantic cache key include `tenant_id` (and prompt version) rather than matching purely on query cosine similarity across all users?',
    'What happens when a semantic cache threshold (`min_sim`) is set too low (e.g. `0.70`), and how do exact + semantic caches complement each other?',
    'Why do byte-level BPE tokenizers often produce 2×–4× more tokens for non-English scripts like Arabic compared to English, and how does that affect context windows and chunk sizes?',
    'Name two standard Arabic text normalizations needed before lexical BM25 indexing so equivalent spellings match.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Once your RAG assistant moves from ten internal testers to real customer traffic, unit economics and tail latency quickly become top priorities. Users ask the same onboarding questions hundreds of times a day (*"How do I reset MFA?"* vs *"Where do I reset multi-factor auth?"*), while a single long-context prompt sent blindly to the largest frontier model for trivial yes/no routing wastes both money and seconds.',
        'At the same time, real-world companies operate globally across languages—frequently serving Arabic, French, Spanish, or mixed English/Arabic customer support tickets (`"كيف أعمل reset للباسورد؟"`). Engineers who assume every user writes ASCII English hit sneaky production failures: mismatched Unicode forms breaking BM25, BPE token counts exploding past chunk budgets, and right-to-left (RTL) text reversing `[chunk_1]` citations or breaking UI layouts. Building **tenant-safe caching**, **tier routing**, and **multilingual/RTL hygiene** rounds out production LLM engineering.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Two-Door Memory (`Exact` + `Semantic`), Triage Desks & Unicode Hygiene',
      paragraphs: [
        'Picture **LLM Caching** as two fast reception doors sitting in front of your expensive LLM kitchen. Door 1 is an **Exact Canonical Cache**: lowercase/collapse whitespace on the prompt, hash `(prompt_version, model, tenant_id, canonical_query)` into Redis or SQLite, and return cached JSON in `<2 ms` with zero embedding cost! Door 2 is a **Semantic Similarity Cache**: embed the query vector and scan recent cached entries *for that same `tenant_id` and `prompt_version`*. Only if cosine similarity clears a strict high threshold—typically `>= 0.94`–`0.96`—do you reuse the cached reply! Setting `min_sim = 0.75` would falsely treat *"How do I upgrade?"* and *"How do I cancel?"* as identical—a classic cache-poisoning bug.',
        'Pair caching with **Model Routing (Cascading)**: classify incoming queries by complexity (length, tool requirements, or a fast classifier) and dispatch straightforward FAQ extractions to a small fast low-cost model while escalating subtle multi-hop synthesis to a frontier model. Logging `cache_hit` (`exact` / `semantic` / `miss`) and `routed_tier` makes cost savings measurable.',
        'Finally, understand **Multilingual & Arabic/RTL** mechanics carefully. First, **Unicode & Orthography**: Arabic text frequently mixes presentation forms, optional short vowel diacritics (**Tashkeel** like `َ ُ ِ`), and spelling variants (`أ / إ / آ` vs bare `ا`, `ى` vs `ي`, `ة` vs `ه`). Applying Unicode `NFKC` normalization and optional Alef/diacritic stripping during **lexical BM25 indexing** (while keeping original text intact for display!) rescues recall without distorting embeddings. Second, **Token Expansion**: English BPE tokenizers trained predominantly on Latin text often split Arabic words into 2×–4× more tokens per word—meaning a `500`-word Arabic passage can consume far more tokens than `500` words in English! Always chunk and measure budgets by **actual token count**, not character heuristics. Third, isolate mixed **RTL + LTR spans** (`[doc_12]`, URLs, SQL error codes) using Unicode Bidirectional isolates or `dir="auto"` containers so citation numbers never flip visually.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Tenant-Safe Two-Tier Cache Lookup (Exact + Semantic)',
      paragraphs: [
        'Trace a complete cache lookup cleanly. Notice the two non-negotiable security and correctness invariants: 1) **Namespace isolation (`(tenant_id, prompt_version)`)**: Tenant B must *never* receive a cached answer generated from Tenant A\'s private docs even on identical query strings! 2) **Strict semantic threshold (`min_sim >= 0.95`)** plus **TTL expiration**: stale cached answers about pricing must expire or invalidate whenever underlying documents re-index.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Exact + Tenant-Scoped Semantic Cache Lookup',
      language: 'python',
      code: `import hashlib
import numpy as np

def canonical_key(tenant_id: str, prompt_version: str, query: str) -> str:
    clean = " ".join(query.lower().split())
    raw = f"{tenant_id}|{prompt_version}|{clean}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

def semantic_lookup(
    tenant_id: str,
    prompt_version: str,
    q_vec: np.ndarray,
    cache_entries: list[dict],
    min_sim: float = 0.95,
) -> dict | None:
    qn = float(np.linalg.norm(q_vec)) + 1e-9
    best_entry, best_sim = None, -1.0
    for item in cache_entries:
        if item["tenant_id"] != tenant_id or item["prompt_version"] != prompt_version:
            continue
        ev = item["vec"]
        sim = float((ev @ q_vec) / ((float(np.linalg.norm(ev)) + 1e-9) * qn))
        if sim >= min_sim and sim > best_sim:
            best_sim, best_entry = sim, item
    return best_entry

entries = [
    {"tenant_id": "acme", "prompt_version": "v1", "vec": np.array([1.0, 0.0]), "answer": "Acme reset"},
    {"tenant_id": "beta", "prompt_version": "v1", "vec": np.array([1.0, 0.0]), "answer": "Beta secret"},
]
hit = semantic_lookup("acme", "v1", np.array([0.99, 0.05]), entries, min_sim=0.95)
print("Cache hit:", hit["answer"] if hit else None)`,
      caption: 'Explained output: `Cache hit: Acme reset`. Notice `beta` had an exact `1.0` match on vector `[1.0, 0.0]`, yet was skipped strictly because `tenant_id != "acme"`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Arabic Unicode Normalization, Multilingual Tokenizers & Mixed RTL/LTR Safety',
      paragraphs: [
        'Inspect how deterministic Arabic lexical normalization works before BM25 tokenization without relying on external libraries: normalize Unicode (`unicodedata.normalize("NFKC", text)`), remove combining diacritical marks (`unicodedata.category(ch) == "Mn"` or Arabic diacritic range `\\u064b-\\u065f`, plus Tatweel elongation `ـ` `\\u0640`), map `أ`, `إ`, `آ` to `ا`, and normalize final `ى` -> `ي`. Notice how `"الإعدادات"` and `"الاعدادات"` both map cleanly to `"الاعدادات"`, letting BM25 match user queries regardless of hamza style!',
        'Meanwhile, remember that **display rendering** and **embedding models** have distinct requirements from BM25 indexing. For retrieval vectors across Arabic, English, French, or code-switched text (*"كيف أعمل reset للباسورد؟"*), choose a genuine multilingual embedding encoder (such as `bge-m3` or multilingual `text-embedding-3`) trained on cross-lingual pairs so queries in Arabic match English policy chunks and vice versa. In your UI, render chat bubbles using `dir="auto"` on paragraph blocks and wrap embedded technical tokens (`[doc_12]`, `ERR_4092`, file paths, or URLs) inside isolated `<bdi>` spans so the browser Bidirectional Algorithm never reverses brackets or scrambles punctuation order.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Pure-Python Arabic Lexical Normalizer + Explained Output',
      language: 'python',
      code: `import unicodedata

ARABIC_MAP = str.maketrans({
    "\\u0623": "\\u0627",  # Alef with Hamza above -> Alef
    "\\u0625": "\\u0627",  # Alef with Hamza below -> Alef
    "\\u0622": "\\u0627",  # Alef Madda -> Alef
    "\\u0649": "\\u064a",  # Alef Maksura -> Ya
})

def normalize_arabic_for_search(text: str) -> str:
    nfkc = unicodedata.normalize("NFKC", text)
    no_marks = "".join(
        ch for ch in nfkc
        if unicodedata.category(ch) != "Mn" and ch != "\\u0640"
    )
    return " ".join(no_marks.translate(ARABIC_MAP).lower().split())

q_user = "اعدادات الفاتورة ERR_42"
doc_kw = "الإِعْدَادَاتُ — الفاتورة ERR_42"
print("Query norm:", normalize_arabic_for_search(q_user))
print("Doc norm  :", normalize_arabic_for_search(doc_kw))`,
      caption: 'Explained output: both print identical normalized tokens (`اعدادات الفاتورة err_42`), ensuring diacritics, Alef hamza differences, and uppercase Latin codes match seamlessly in BM25 search!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Cache Invalidation, TTLs & Bypassing Caching on Non-Idempotent Turns',
      paragraphs: [
        'Caching only helps when cached answers remain **fresh and accurate**. Pair Redis/SQLite entries with two lifecycle controls: a **Time-to-Live (TTL)** matching content volatility (for example 24 hours on static API documentation versus 5 minutes on billing status summaries), AND an **`index_version` tag inside every cache key**. The moment a customer uploads an updated policy PDF, bumping `index_version` for that tenant invalidates stale answers instantaneously in $O(1)$ without scanning or deleting millions of keys.',
        'Just as importantly, **bypass caching completely** when a turn invokes live write tools (`create_ticket`, `check_live_inventory`), carries `temperature > 0.4` creative requests, or references personal session state (*"What was the second item I just mentioned?"*). Disciplined cache scoping delivers consistent savings without ever returning stale or misrouted answers.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Sharing semantic caches globally across tenants or prompt versions:** Cross-tenant cache hits leak confidential customer answers directly! Always require `(tenant_id, prompt_version)` exact equality before checking cosine similarity.',
        '**Mistake 2 — Setting semantic cache `min_sim` below `~0.92`:** Semantically related opposites (*"enable 2FA"* vs *"disable 2FA"*, or *"upgrade plan"* vs *"cancel plan"*) frequently score `0.82–0.88` cosine similarity! Keep thresholds conservative (`>= 0.95`) and skip semantic caching on sensitive write/policy queries.',
        '**Mistake 3 — Character-based chunk limits (`text[:2000]`) on multilingual docs:** A 2,000-character chunk in English might be `~450` tokens, while 2,000 characters in Arabic or CJK under a Latin-centric tokenizer can blow past `1,500+` tokens! Measure chunk lengths with your real model tokenizer.',
        '**Mistake 4 — Destroying original display text when normalizing for search:** Store normalized Arabic purely inside the search/index field while returning pristine original accented/hamza text to the generator and user interface.',
        '**Mistake 5 — Breaking provider-level KV Prefix Caching with dynamic timestamps at the top of `system`:** Many model APIs cache the attention Key-Value states of shared `system` prefixes automatically for huge input discounts, *only* when prefix tokens are byte-for-byte identical! Putting `Current time: 14:03:22` or dynamic request IDs at line 1 busts prefix caching on every request—move changing dates/user state to the bottom after static instructions.',
        '**Mistake 6 — Translating user queries into English silently before search when domain terms stay Arabic/local:** Lossy machine translation mangles legal titles, product names, and dialect phrases; prefer native multilingual retrieval models first.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Layer Exact + Semantic Caches:** Catch identical normalized prompts in `<2 ms` first, then match paraphrases only above strict cosine thresholds (`>= 0.95`).',
        '2. **Scope caches strictly by tenant & version:** Never match cache entries across different `tenant_id`s or `prompt_version`s.',
        '3. **Route by task difficulty:** Reserve large frontier models for hard reasoning; route routine classification/extraction to fast small tiers.',
        '4. **Normalize multilingual text for indexing only:** Use `NFKC`, strip diacritics/Tatweel, and unify Alef variants before BM25 matching while preserving display text.',
        '5. **Budget multilingual pipelines by tokens, not characters:** Non-English scripts often expand 2×–4× in BPE tokenizers.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-5-1',
      difficulty: 'guided',
      requires: ['llm-caching'],
      title: 'Lab 6.5.1 (Guided): Two-Tier Tenant-Safe Cache (Exact + Semantic)',
      prompt:
        'Implement `lookup_cache(tenant_id, prompt_version, query, q_vec, exact_store, semantic_store, min_sim=0.95)` returning `{"hit": "exact"|"semantic"|"miss", "answer": str | None}`. Step 1: Build exact canonical key `(tenant_id, prompt_version, " ".join(query.lower().split()))`. If found in `exact_store`, return `{"hit": "exact", "answer": exact_store[key]}`. Step 2: Otherwise scan `semantic_store` entries matching BOTH `tenant_id` and `prompt_version`; pick highest cosine `>= min_sim`, else return `{"hit": "miss", "answer": None}`.',
      starterCode: `import numpy as np

def lookup_cache(
    tenant_id: str,
    prompt_version: str,
    query: str,
    q_vec: np.ndarray,
    exact_store: dict,
    semantic_store: list[dict],
    min_sim: float = 0.95,
) -> dict:
    # 1. Exact check on (tenant_id, prompt_version, canonical_query)
    # 2. Tenant + version scoped cosine similarity >= min_sim
    # 3. Miss fallback
    pass`,
      testCode: `import numpy as np
exact = {("acme", "v2", "reset mfa"): "Use settings -> MFA."}
sem = [
    {"tenant_id": "beta", "prompt_version": "v2", "vec": np.array([1.0, 0.0]), "answer": "BETA SECRET"},
    {"tenant_id": "acme", "prompt_version": "v1", "vec": np.array([1.0, 0.0]), "answer": "OLD V1"},
    {"tenant_id": "acme", "prompt_version": "v2", "vec": np.array([1.0, 0.0]), "answer": "ACME V2"},
]
r1 = lookup_cache("acme", "v2", "  Reset   MFA ", np.array([0.0, 1.0]), exact, sem)
assert r1 == {"hit": "exact", "answer": "Use settings -> MFA."}

r2 = lookup_cache("acme", "v2", "How do I reset MFA?", np.array([0.99, 0.05]), exact, sem, min_sim=0.95)
assert r2 == {"hit": "semantic", "answer": "ACME V2"}, f"Got {r2}"

r3 = lookup_cache("acme", "v2", "Different", np.array([0.5, 0.86]), exact, sem, min_sim=0.95)
assert r3 == {"hit": "miss", "answer": None}
print("PASS: Lab 6.5.1 Tenant & version scoped two-tier cache passed!")`,
      solutionCode: `import numpy as np

def lookup_cache(
    tenant_id: str,
    prompt_version: str,
    query: str,
    q_vec: np.ndarray,
    exact_store: dict,
    semantic_store: list[dict],
    min_sim: float = 0.95,
) -> dict:
    key = (tenant_id, prompt_version, " ".join(query.lower().split()))
    if key in exact_store:
        return {"hit": "exact", "answer": exact_store[key]}
    qn = float(np.linalg.norm(q_vec)) + 1e-9
    best_ans, best_sim = None, -1.0
    for item in semantic_store:
        if item["tenant_id"] != tenant_id or item["prompt_version"] != prompt_version:
            continue
        ev = item["vec"]
        sim = float((ev @ q_vec) / ((float(np.linalg.norm(ev)) + 1e-9) * qn))
        if sim >= min_sim and sim > best_sim:
            best_sim, best_ans = sim, item["answer"]
    if best_ans is not None:
        return {"hit": "semantic", "answer": best_ans}
    return {"hit": "miss", "answer": None}`,
      hint: 'Check `(tenant_id, prompt_version, " ".join(query.lower().split())) in exact_store` first, then filter `semantic_store` strictly by `tenant_id` and `prompt_version` before cosine scoring.',
      hints: [
        'Canonicalize `query` using `" ".join(query.lower().split())` so extra spaces/casing hit exact cache.',
        'Skip every `semantic_store` entry unless BOTH `tenant_id` AND `prompt_version` match.',
        'Compute cosine similarity safely with `+ 1e-9` and return `"semantic"` only if `best_sim >= min_sim`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-5-2',
      difficulty: 'spec',
      requires: ['model-routing', 'llm-caching'],
      title: 'Lab 6.5.2 (From Spec): Complexity-Based Model Router & Savings Estimator',
      prompt:
        'Implement `route_and_cost(requests)` where each request dict has `{"tokens_in": int, "tokens_out": int, "needs_tools": bool, "complexity": "low"|"high"}`. Route to `"small"` (`$0.15/1M` in, `$0.60/1M` out) ONLY when `complexity == "low"` AND `not needs_tools` AND `tokens_in <= 1000`; otherwise route to `"frontier"` (`$3.00/1M` in, `$15.00/1M` out). Return `{"small_count": int, "frontier_count": int, "routed_usd": float, "all_frontier_usd": float}` (rounded to 6 decimals).',
      starterCode: `def route_and_cost(requests: list[dict]) -> dict:
    # Return {"small_count": int, "frontier_count": int, "routed_usd": float, "all_frontier_usd": float}
    pass`,
      testCode: `reqs = [
    {"tokens_in": 400, "tokens_out": 100, "needs_tools": False, "complexity": "low"},
    {"tokens_in": 1500, "tokens_out": 100, "needs_tools": False, "complexity": "low"},
    {"tokens_in": 300, "tokens_out": 100, "needs_tools": True, "complexity": "low"},
    {"tokens_in": 500, "tokens_out": 200, "needs_tools": False, "complexity": "high"},
]
res = route_and_cost(reqs)
assert res["small_count"] == 1 and res["frontier_count"] == 3, f"Got {res}"
assert res["routed_usd"] < res["all_frontier_usd"]
small_1 = (400 / 1e6) * 0.15 + (100 / 1e6) * 0.60
front_3 = ((1500 + 300 + 500) / 1e6) * 3.00 + ((100 + 100 + 200) / 1e6) * 15.00
assert abs(res["routed_usd"] - (small_1 + front_3)) < 1e-8
print("PASS: Lab 6.5.2 Complexity router & USD cost tracker passed!")`,
      solutionCode: `def route_and_cost(requests: list[dict]) -> dict:
    small_count, frontier_count = 0, 0
    routed_usd, all_frontier_usd = 0.0, 0.0
    for r in requests:
        tin, tout = r["tokens_in"], r["tokens_out"]
        f_cost = (tin / 1_000_000) * 3.00 + (tout / 1_000_000) * 15.00
        all_frontier_usd += f_cost
        if r["complexity"] == "low" and not r["needs_tools"] and tin <= 1000:
            small_count += 1
            routed_usd += (tin / 1_000_000) * 0.15 + (tout / 1_000_000) * 0.60
        else:
            frontier_count += 1
            routed_usd += f_cost
    return {
        "small_count": small_count,
        "frontier_count": frontier_count,
        "routed_usd": round(routed_usd, 6),
        "all_frontier_usd": round(all_frontier_usd, 6),
    }`,
      hint: 'Check `r["complexity"] == "low" and not r["needs_tools"] and r["tokens_in"] <= 1000` for small tier; compute both `routed_usd` and baseline `all_frontier_usd`.',
      hints: [
        'Use `1_000_000` denominator for per-1M token prices.',
        'Compute `f_cost` for every request toward `all_frontier_usd`.',
        'Increment `small_count` only when all three routing conditions hold.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-5-3',
      difficulty: 'debug',
      requires: ['multilingual-rtl'],
      title: 'Lab 6.5.3 (Debug Buggy Code): Fix Arabic Normalizer & Token-Budget Chunker',
      prompt:
        'A broken bilingual preprocessor has TWO bugs: 1) `normalize_bilingual(text)` forgets to strip Arabic diacritics (`Mn` category) and unify Alef variants (`أ/إ/آ -> ا`), causing `"الإِعْدَاد"` vs `"الاعداد"` searches to miss! 2) `needs_split(tokens, max_tokens)` mistakenly checks character length `len(text) > max_tokens` instead of `len(tokens) > max_tokens`, truncating Arabic prompts too late! Fix both helpers.',
      starterCode: `import unicodedata

ARABIC_ALEF_MAP = str.maketrans({"\\u0623": "\\u0627", "\\u0625": "\\u0627", "\\u0622": "\\u0627", "\\u0649": "\\u064a"})

def normalize_bilingual(text: str) -> str:
    # Bug 1: only calls .lower().strip() without NFKC, diacritic stripping, or ALEF mapping!
    return text.lower().strip()

def needs_split(text: str, token_ids: list[int], max_tokens: int) -> bool:
    # Bug 2: checks character count instead of actual token count!
    return len(text) > max_tokens`,
      testCode: `a = normalize_bilingual("  الإِعْدَادُ  ")
b = normalize_bilingual("الاعداد")
assert a == b == "الاعداد", f"Expected identical normalized Arabic, got {a!r} vs {b!r}"
assert normalize_bilingual("مستشفى") == normalize_bilingual("مستشفي")

assert needs_split("short", [1, 2, 3, 4, 5], max_tokens=4) is True, "Must trigger on token count > max_tokens!"
assert needs_split("many_chars_few_tokens", [1, 2], max_tokens=4) is False
print("PASS: Lab 6.5.3 Multilingual Arabic normalization & token budget fixed!")`,
      solutionCode: `import unicodedata

ARABIC_ALEF_MAP = str.maketrans({"\\u0623": "\\u0627", "\\u0625": "\\u0627", "\\u0622": "\\u0627", "\\u0649": "\\u064a"})

def normalize_bilingual(text: str) -> str:
    nfkc = unicodedata.normalize("NFKC", text)
    stripped = "".join(ch for ch in nfkc if unicodedata.category(ch) != "Mn" and ch != "\\u0640")
    return " ".join(stripped.translate(ARABIC_ALEF_MAP).lower().split())

def needs_split(text: str, token_ids: list[int], max_tokens: int) -> bool:
    return len(token_ids) > max_tokens`,
      hint: 'Normalize with `unicodedata.normalize("NFKC", text)`, drop `Mn` combining marks & Tatweel `\\u0640`, apply `.translate(ARABIC_ALEF_MAP)`, and check `len(token_ids) > max_tokens`.',
      hints: [
        'Use `unicodedata.category(ch) != "Mn"` to strip Arabic diacritics cleanly.',
        'Call `.translate(ARABIC_ALEF_MAP)` to normalize Alef hamzas and Alef Maksura.',
        'Inside `needs_split`, compare `len(token_ids) > max_tokens`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q6-5-1',
      type: 'multiple-choice',
      question: 'Why must every semantic cache entry be scoped strictly by `tenant_id` and `prompt_version`?',
      options: [
        'Because Redis refuses storing dense vector embeddings unless string keys contain pipe delimiters',
        'Global caches leak private tenant answers or serve outdated prompt schemas',
        'Because adding `tenant_id` shrinks embedding dimension automatically from `1536` down to `256`',
        'Because semantic caches disable exact hash collisions unless prompt versions rotate hourly',
      ],
      correctIndex: 1,
      explanation: 'Sharing a global cache leaks private multi-tenant answers across customers and returns outdated formats after prompt updates.',
    },
    {
      id: 'q6-5-2',
      type: 'spot-bug',
      code: `hit = semantic_cache.find(query_vec, min_sim=0.72)
# Query A: "How do I upgrade to Pro?"
# Query B: "How do I cancel Pro?" -> sim = 0.84`,
      question: 'What bug happens in production with `min_sim = 0.72`?',
      options: [
        'Cosine similarity overflows float32 whenever vectors exceed unit L2 length cleanly',
        'Opposites ("upgrade" vs "cancel") score ~0.84 and serve wrong answers',
        'Exact identical query strings fail to match because `0.72` rejects `1.0` matches',
        'Vector databases throw `ZeroDivisionError` unless `min_sim` equals `0.50`',
      ],
      correctIndex: 1,
      explanation: 'Topically related opposites share strong embedding overlap (`0.80–0.88`). Keep semantic cache thresholds tight (`>= 0.94–0.96`).',
    },
    {
      id: 'q6-5-3',
      type: 'numeric',
      question: 'A query hits an exact cache (`$0` LLM cost) 40% of the time; the remaining 60% call an LLM costing `1.0` cent per call. On `1,000` requests, what is total spend in USD dollars?',
      options: [],
      correctIndex: 0,
      correctNumber: 6.0,
      tolerance: 0.01,
      unit: 'USD',
      explanation: 'Only `600` requests hit the LLM at `$0.01` each: `600 * 0.01 = $6.00`.',
    },
    {
      id: 'q6-5-4',
      type: 'multiple-choice',
      question: 'Why does Arabic text often consume 2×–4× more tokens than equivalent English text inside typical BPE tokenizers?',
      options: [
        'Arabic strings automatically embed invisible HTML tags inside raw UTF-8 byte streams',
        'English-heavy BPE tables split Arabic words into shorter sub-tokens',
        'Unicode `NFKC` duplicates every right-to-left letter twice prior to neural tokenization',
        'Transformers pad right-to-left sequences with extra zero tokens at inference time',
      ],
      correctIndex: 1,
      explanation: 'When a BPE merge table was trained heavily on English text, non-Latin scripts fall back to shorter character/byte merges—increasing token count per word.',
    },
    {
      id: 'q6-5-5',
      type: 'multi-select',
      question: 'Which TWO practices keep multilingual Arabic/English RAG systems reliable?',
      options: [
        'Applying `NFKC`, diacritic removal, and Alef normalization (`أ/إ/آ -> ا`) inside the lexical search field only',
        'Sizing chunk limits and context budgets strictly by actual tokenizer count rather than character length',
        'Permanently stripping diacritics from displayed source documents shown to end users',
        'Reusing English-only ASCII regexes (`[a-z]+`) to tokenize Arabic keywords',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Normalize inside the search index while keeping original text intact for display, and measure context budgets in real tokens.',
    },
    {
      id: 'q6-5-6',
      type: 'predict-output',
      code: `def route(tier_low, tools):
    return "small" if (tier_low and not tools) else "frontier"

print(route(True, False), route(True, True))`,
      question: 'What exact output is printed?',
      options: [
        '`small small`',
        '`frontier small`',
        '`frontier frontier`',
        '`small frontier`',
      ],
      correctIndex: 3,
      explanation: 'The first call satisfies `(True and not False)` -> `"small"`; the second requires tools -> `"frontier"`.',
    },
    {
      id: 'q6-5-7',
      type: 'ordering',
      question: 'Order the request flow through a two-tier cached & routed LLM gateway:',
      options: [],
      items: [
        'Canonicalize prompt and check Exact Cache scoped by tenant + prompt_version',
        'Check tenant-scoped Semantic Cache only above strict similarity threshold (e.g. >= 0.95)',
        'Route cache misses by complexity/tools to Small or Frontier model tier',
        'Log cache_hit status, token usage, and USD cost before returning response',
      ],
      correctIndex: 0,
      explanation: 'Fastest exact lookup -> strict tenant-scoped semantic check -> complexity routing on misses -> cost/hit telemetry.',
    },
    {
      id: 'q6-5-8',
      type: 'multiple-choice',
      question: 'When rendering Arabic answers containing inline English citation IDs like `[doc_14]` or error codes `ERR_4092`, how do UIs prevent visually scrambled characters?',
      options: [
        'Wrap LTR IDs cleanly using `dir="auto"` or `<bdi>` spans',
        'Convert all ASCII digits and Latin document identifiers cleanly into uppercase Roman numerals',
        'Reverse the raw Python string slice (`[::-1]`) before sending JSON from FastAPI',
        'Strip all Latin letters completely out of retrieved chunks prior to LLM generation',
      ],
      correctIndex: 0,
      explanation: 'Using proper bidirectional isolation (`dir="auto"` / `<bdi>`) lets browsers render RTL Arabic prose cleanly around embedded LTR IDs and code spans.',
    },
    {
      id: 'q6-5-9',
      type: 'multiple-choice',
      question: 'What should happen to cached LLM responses whenever your company re-indexes updated policy documents?',
      options: [
        'Lower the semantic similarity cutoff down to `0.50` so older answers remain reusable',
        'Keep serving all cached answers indefinitely regardless of underlying document updates',
        'Bump `index_version` / invalidate affected tenant keys so stale answers stop',
        'Switch the exact cache from SHA-256 hashing over to random UUIDs per user session',
      ],
      correctIndex: 2,
      explanation: 'Including `index_version` or invalidating tenant cache namespaces on document re-ingestion guarantees updated facts take effect immediately.',
    },
  ],
};
