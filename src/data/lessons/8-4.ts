import type { Lesson } from '@/types/course';

export const lesson8_4: Lesson = {
  id: '8-4',
  moduleId: 'mod-8',
  number: '8.4',
  title: 'Behavioral Interviews (STAR), Take-Home Simulations & Code Review',
  subtitle: 'Deliver crisp STAR ownership stories backed by real metrics, execute timed AI take-home assignments cleanly without over-engineering, and ace live code-review follow-ups.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['7.2', '8.3'],
  requires: ['golden-datasets', 'ragas-metrics', 'incident-response', 'model-data-versioning'],
  teaches: [
    'behavioral-star-stories',
    'takehome-interview-execution',
  ],
  objectives: [
    'Structure behavioral engineering answers with **STAR** (**S**ituation, **T**ask, **A**ction—what YOU built, **R**esult—metrics + lesson learned) under 2.5 minutes.',
    'Prepare 4 reusable AI-engineer stories covering a production/eval bug, an architectural tradeoff, cross-team disagreement, and tight deadline scoping.',
    'Complete a 3-to-4 hour AI engineering take-home assignment prioritizing reproducibility, tests, README clarity, and baseline-before-fancy iteration.',
    'Defend your code gracefully in live PR code-review interviews—acknowledging tradeoffs and edge cases without defensiveness.',
  ],
  checkWithoutNotes: [
    'In the **STAR** framework, which single letter should receive ~60% of your speaking time, and why do candidates fail by saying `"we"` instead of `"I"`?',
    'List the exact **first 20 minutes** vs **final 30 minutes** checklist for a 4-hour timed AI engineering take-home challenge.',
    'Explain how to handle an interviewer pointing out a real bug or scaling flaw in your submitted take-home code during a live review.',
    'Compute **Mean Reciprocal Rank (`MRR`)** and **`Recall@k`** mentally on 3 retrieval queries—two classic take-home evaluation metrics.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Behavioral & Take-Home Rounds Decide Who Gets the Final Offer',
      paragraphs: [
        'Technical competence gets you into the final loop; **trust and engineering judgment** get you the offer. Many candidates treat behavioral questions (*"Tell me about a time something broke"*) as casual small talk, rambling for six minutes without naming what they personally built or what metric changed. Meanwhile, take-home rejections overwhelmingly stem NOT from picking the wrong vector database, but from submitting broken `requirements.txt`, missing tests, hardcoded laptop file paths, or zero evaluation proof.',
        'Hiring managers use behavioral interviews to de-risk working alongside you for the next two years. They look silently for four signals: **1) Personal ownership** (can you admit a mistake honestly and fix the root process?); **2) Disagreeing constructively with evidence** (metrics over ego); **3) Pragmatic scoping** (shipping a clean tested baseline rather than half-built Kubernetes bloat); and **4) Communication clarity** under two-minute time bounds.',
        'Even if you are transitioning from another career or entering your very first AI role, your **6 course capstones and debugging war stories** count legitimately as real engineering evidence when articulated concretely through measurable metrics and clean root-cause analysis.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Writing a Blameless Postmortem & Clean Pull Request',
      frontendConcept: 'Opening a crisp GitHub PR description (problem, tradeoffs, screenshot, tests run) and defending architecture choices kindly in PR comments',
      aiConcept: 'STAR Story Pacing (`60% Action` + `Quantified Result`) & Reproducible Take-Home Submission',
      explanation:
        'A great STAR story reads just like an awesome blameless postmortem: ten seconds setting the scene (`Situation/Task`), sixty seconds explaining exact technical choices YOU implemented (`Action`), and twenty seconds stating measurable impact plus what guardrails you added (`Result`). Similarly, treat every take-home repository like a clean team Pull Request ready for immediate CI review.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Three High-Impact AI Engineer STAR Stories',
      paragraphs: [
        '**Story 1 — Catching & Fixing Silent Evaluation Failure (`"Tell me about a tough bug you solved"`):** *Situation:* My multi-tenant RAG assistant returned empty citations on legal policy queries during testing despite solid vector similarity scores. *Task:* Diagnose whether the generator prompt or retrieval filtering dropped valid chunks before launch. *Action:* I inspected trace spans stage by stage and discovered post-filtering (`top_k=5` globally, then `WHERE tenant_id = X`) caused another tenant’s dense docs to crowd out all five slots! I refactored the query index to pre-filter `tenant_id` inside SQL/index scan BEFORE ranking and added a 25-case multi-tenant CI isolation test. *Result:* Recall@5 jumped from `52%` to `92%` with zero cross-tenant leakage regressions ever since.',
        '**Story 2 — Pushing Back With Data (`"Disagreed with a teammate or stakeholder"`):** *Situation:* A product lead pushed to immediately fine-tune a `70B` open-weights model to fix hallucinated return policies. *Task:* Deliver accurate grounded replies within one week on a tight budget. *Action:* Instead of arguing theory, I spent three hours running a 40-case golden evaluation comparing fine-tuning cost/time against Hybrid BM25 + Cross-Encoder reranking + strict `enum` refusal schemas. *Result:* Hybrid RAG + citations reached `94%` faithfulness in two days at `$0.002/query`—saving three weeks of GPU setup while leaving fine-tuning cleanly documented for future tone calibration.',
        '**Story 3 — Handling Cost Spikes Calmly (`"Tight deadline or production constraint"`):** *Situation:* Beta testing revealed automated webhooks burning `$45/hour` looping against our frontier endpoint. *Task:* Stop budget bleed immediately without breaking legitimate interactive users. *Action:* I shipped a Redis per-tenant sliding-window rate limit (`429 Retry-After`), a daily USD circuit breaker, and an 8B complexity router keeping hard queries on the frontier tier. *Result:* Daily spend dropped `76%` (`$0.009 -> $0.0021/turn`) with under `3%` escalation delta on golden evals.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Acing a 4-Hour Take-Home Simulation End to End',
      paragraphs: [
        'Suppose a company sends a timed 4-hour take-home: *"Build a CLI/API document Q&A prototype with deterministic eval reporting."* Time management decides success. **Minutes 0–25 (Scope & Repo Skeleton):** initialize Git, virtual environment, `.env.example`, `pytest`, and a tiny fixed fixture dataset BEFORE writing fancy retrieval code. Write a dumb-simple working baseline (`BM25/TF-IDF + mock/structured JSON`) passing an end-to-end smoke test by Minute 60!',
        '**Minutes 60–180 (Core Quality + Guardrails):** upgrade retrieval (contextual chunking + RRF fusion or Cross-Encoder), enforce typed Pydantic validation + refusal handling when evidence is absent, and wire a reproducible `evals.py` script computing exact `MRR` and `Recall@5` across 20–30 labeled golden test queries.',
        '**Minutes 180–240 (Polish, Tests & Fresh-Clone Check):** write clean `pytest` unit tests (`zero live network keys required to run CI tests!`), polish `README.md` with exact setup commands and measured scores, and **test cloning/installing into a clean folder or Docker build** so reviewers never hit `ModuleNotFoundError` on line one.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Winning Live Code-Review & Debugging Follow-Ups',
      paragraphs: [
        'Many companies pair take-home submissions with a 30-minute live review: *"Walk me through your chunking helper—what breaks if two uploads share identical chunk text across different PDFs, or if 10,000 concurrent requests arrive?"* Beginners sometimes get defensive (*"Well, that wasn’t in the instructions!"*). Senior-minded candidates smile and say: *"Great catch—right now deduplicating by text string drops valid provenance if Doc B quotes Doc A; keying dedupe on `(doc_id, chunk_id)` fixes attribution cleanly, and adding an async Redis queue keeps HTTP latency flat under bursts."*',
        'Notice that same grace applies during live pairing bugs too: never freeze or blame the prompt. Reproduce the failing input aloud (`print` or trace values cleanly), state your mental hypothesis BEFORE editing lines, verify edge cases (`empty list`, `None`, `divide by zero`), and explain cleanly why your patch prevents similar bugs permanently.',
        'Whenever an interviewer asks *"How would you ship this prototype into production next week?"*, walk smoothly from code correctness to operational safety: wrap blocking endpoints in timeouts, isolate tenant IDs in database filters, log structured trace durations, and wire golden `MRR` checks directly into GitHub Actions so regressions block merges automatically.',
      ],
    },
    {
      type: 'table',
      title: 'Take-Home & Behavioral Execution Scorecard',
      headers: ['Dimension', 'Weak Candidate Signal', 'Standout Hire Signal'],
      rows: [
        ['STAR Story Focus', 'Vague `"we built an AI chatbot"` with 3 mins of background', '`60%` specific `"I diagnosed & coded X"` + concrete `before -> after` metrics'],
        ['Take-Home Architecture', 'Requires GPU + live paid OpenAI key just to run `pytest`', 'Clean offline mock fixture mode + optional `.env` flag for live API keys'],
        ['Validation & Metrics', 'Manual `"looks good to me"` screenshots only', 'Reproducible `evals.py` reporting `Recall@k`, `MRR`, and latency stats'],
        ['Code Review Defense', 'Defensive excuses (`"I didn’t have time"`)', 'Candid acknowledgment + immediate scoped fix + scaling tradeoff analysis'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common Behavioral & Take-Home Mistakes & How to Debug Them',
      paragraphs: [
        '1) Saying `"we"` throughout every behavioral story: interviewers literally score *your* individual contribution—if they cannot tell what lines or decisions you owned, they cannot rate you above junior/passive.',
        '2) Choosing a `"biggest weakness"` answer that sounds fake (*"I work too hard and care too much"*): name a real scoped engineering lesson (e.g., over-engineering v1 before benchmarking a baseline) paired with the concrete habit you use today (`timebox baseline in 60 mins first`).',
        '3) Submitting a take-home whose `pytest` suite fails immediately without a secret `.env` key: reviewers run `pytest` offline inside clean sandboxes—inject a deterministic mock LLM client by default and switch to real keys only when `OPENAI_API_KEY` is provided.',
        '4) Burning three of four hours tuning fancy UI gradients before verifying core retrieval/API logic works end to end: nail the working typed backend, eval script, and tests first; add clean minimal UI afterward.',
        '5) Hardcoding personal laptop file paths (`/Users/alex/Desktop/data.csv`) inside submission scripts: always resolve paths relative to `Path(__file__).parent` or explicit CLI arguments.',
        '6) Skipping git commit hygiene (pushing one giant `Initial commit` dump of 40 files): small logical commits (`feat: baseline retriever`, `test: add MRR eval + edge cases`) show authentic disciplined engineering habits.',
        '7) Treating behavioral prep as spontaneous storytelling: write concise bullet outlines for four core stories beforehand and rehearse them aloud under a strict two-minute timer so numbers and technical tradeoffs flow naturally.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 9.4 Recap: Behavioral & Take-Home Excellence',
      body: '- Spend `60%` of every STAR answer on concrete technical actions YOU took and close with measured metrics + lessons.\n- Prepare 4 versatile stories (silent bug, data-backed disagreement, cost/latency trade, deadline scoping).\n- In timed take-homes: build an offline-testable skeleton in hour 1, layer eval metrics (`MRR`, `Recall@k`) in hours 2–3, and fresh-clone verify in hour 4.\n- Make `pytest` pass cleanly with deterministic mocks so reviewers test your work zero-friction.\n- Treat live code reviews collaboratively—own edge cases calmly and propose concrete scaling fixes.',
    },
    {
      type: 'python-lab',
      labId: 'lab-8-4-takehome',
      difficulty: 'guided',
      requires: ['golden-datasets', 'incident-response'],
      title: 'Lab 8.4A: Take-Home Submission Readiness Gate',
      prompt:
        'Implement `audit_takehome_repo(checks: dict) -> tuple[bool, list[str]]`: evaluate a take-home dict with booleans `"has_readme"`, `"tests_pass_offline"`, `"has_env_example"`, `"no_hardcoded_paths"`, `"has_eval_metrics"`, plus integer `"commit_count"`. Collect clear failure strings (e.g., `"missing_readme"`, `"tests_require_network_key"`, `"missing_env_example"`, `"hardcoded_laptop_paths"`, `"missing_eval_metrics"`, `"single_dump_commit"` when `commit_count < 2`). Return `(len(issues) == 0, issues)`.',
      starterCode: `def audit_takehome_repo(checks: dict) -> tuple[bool, list[str]]:
    # Validate all 6 take-home readiness requirements cleanly
    pass`,
      testCode: `perfect = {"has_readme": True, "tests_pass_offline": True, "has_env_example": True, "no_hardcoded_paths": True, "has_eval_metrics": True, "commit_count": 5}
ok, issues = audit_takehome_repo(perfect)
assert ok is True and issues == []
weak = {"has_readme": True, "tests_pass_offline": False, "has_env_example": False, "no_hardcoded_paths": False, "has_eval_metrics": True, "commit_count": 1}
ok2, issues2 = audit_takehome_repo(weak)
assert ok2 is False and len(issues2) == 4
print("PASS: Take-home readiness checklist caught offline test failures, hardcoded paths, and dump commits!")`,
      solutionCode: `def audit_takehome_repo(checks: dict) -> tuple[bool, list[str]]:
    issues: list[str] = []
    required_flags = [
        ("has_readme", "missing_readme"),
        ("tests_pass_offline", "tests_require_network_key"),
        ("has_env_example", "missing_env_example"),
        ("no_hardcoded_paths", "hardcoded_laptop_paths"),
        ("has_eval_metrics", "missing_eval_metrics"),
    ]
    for key, msg in required_flags:
        if not checks.get(key, False):
            issues.append(msg)
    if checks.get("commit_count", 0) < 2:
        issues.append("single_dump_commit")
    return len(issues) == 0, issues`,
      hint: 'Loop over `(flag_key, error_label)` tuples verifying `checks.get(flag_key, False)` and check `checks.get("commit_count", 0) < 2`.',
      hints: [
        'Use a mapping list of the 5 boolean flags to clear diagnostic issue strings.',
        'Check `checks.get("commit_count", 0) < 2` for commit hygiene.',
        'Return `(len(issues) == 0, issues)`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-4-retrieval',
      difficulty: 'spec',
      requires: ['ragas-metrics'],
      title: 'Lab 9.4B: Mean Reciprocal Rank (MRR) & Recall@K Eval Suite',
      prompt:
        'Implement `eval_retrieval_suite(retrieved_lists: list[list[str]], relevant_docs: list[str], k: int = 5) -> dict`: for each `(retrieved, target)` pair, slice `top = retrieved[:k]`. Compute **MRR@k** (`1.0 / (top.index(target) + 1)` if `target in top` else `0.0`, averaged across queries) and **Hit/Recall@k** (`1.0` if `target in top` else `0.0`, averaged across queries). Return `{"mrr_at_k": round(mrr, 4), "recall_at_k": round(rec, 4)}` (`0.0` each if empty).',
      starterCode: `def eval_retrieval_suite(retrieved_lists: list[list[str]], relevant_docs: list[str], k: int = 5) -> dict:
    # Slice [:k], compute MRR@k and Recall@k cleanly across queries
    pass`,
      testCode: `q = [["d2", "d1", "d3"], ["d5", "d4"], ["d9", "d8", "d7", "d10"]]
t = ["d1", "d5", "d10"]
res = eval_retrieval_suite(q, t, k=3)  # d1 at rank 2 (0.5), d5 at rank 1 (1.0), d10 at idx 3 outside k=3 (0.0)
assert abs(res["mrr_at_k"] - 0.5) < 1e-4
assert abs(res["recall_at_k"] - round(2/3, 4)) < 1e-4
assert eval_retrieval_suite([], [], k=5) == {"mrr_at_k": 0.0, "recall_at_k": 0.0}
print("PASS: MRR@k and Recall@k evaluation harness verified!")`,
      solutionCode: `def eval_retrieval_suite(retrieved_lists: list[list[str]], relevant_docs: list[str], k: int = 5) -> dict:
    if not retrieved_lists or not relevant_docs:
        return {"mrr_at_k": 0.0, "recall_at_k": 0.0}
    mrr_sum, hit_sum = 0.0, 0.0
    n = len(retrieved_lists)
    for retrieved, target in zip(retrieved_lists, relevant_docs):
        top = retrieved[:k]
        if target in top:
            rank = top.index(target) + 1
            mrr_sum += 1.0 / rank
            hit_sum += 1.0
    return {"mrr_at_k": round(mrr_sum / n, 4), "recall_at_k": round(hit_sum / n, 4)}`,
      hint: 'Always slice `top = retrieved[:k]` FIRST before checking `target in top` so items ranked deeper than `k` do not inflate MRR@k or Recall@k!',
      hints: [
        'Handle empty `retrieved_lists` cleanly returning `0.0` for both metrics.',
        'Restrict search to `top = retrieved[:k]` on every query.',
        'Add `1.0 / (top.index(target) + 1)` to `mrr_sum` and `1.0` to `hit_sum` whenever `target in top`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-4-bugfix',
      difficulty: 'debug',
      requires: ['takehome-interview-execution'],
      title: 'Lab 9.4C: Debug Live Code-Review Deduplication & Input Mutation Bug',
      prompt:
        'During a live code-review interview, an engineer spots TWO bugs in `dedupe_top_chunks(chunks: list[dict], limit: int)`: (1) it mutates the caller’s `chunks` list in place via `.sort()`! (2) It deduplicates on `chunk["text"]`, accidentally dropping a cited chunk from a DIFFERENT document `(doc_id, chunk_id)` that shares an identical boilerplate line! Fix it without mutating the input list, keying deduplication strictly on `(chunk["doc_id"], chunk["chunk_id"])`, sorted by descending `score` (tie-break `(doc_id, chunk_id)`).',
      starterCode: `def dedupe_top_chunks(chunks: list[dict], limit: int) -> list[dict]:
    # BUG 1: sorts caller list in-place!
    # BUG 2: deduplicates by 'text' instead of ('doc_id', 'chunk_id')!
    chunks.sort(key=lambda c: -c["score"])
    seen = set()
    out = []
    for c in chunks:
        if c["text"] not in seen:
            seen.add(c["text"])
            out.append(c)
    return out[:limit]`,
      testCode: `orig = [
    {"doc_id": "policy_a", "chunk_id": 1, "score": 0.9, "text": "Refunds require approval."},
    {"doc_id": "policy_b", "chunk_id": 2, "score": 0.8, "text": "Refunds require approval."},
    {"doc_id": "policy_a", "chunk_id": 1, "score": 0.7, "text": "Refunds require approval."},
]
snapshot = [dict(x) for x in orig]
res = dedupe_top_chunks(orig, limit=5)
assert orig == snapshot, "Input list was mutated in-place!"
assert len(res) == 2 and res[0]["doc_id"] == "policy_a" and res[1]["doc_id"] == "policy_b"
print("PASS: Live code-review fix avoided in-place mutation and keyed dedupe by (doc_id, chunk_id)!")`,
      solutionCode: `def dedupe_top_chunks(chunks: list[dict], limit: int) -> list[dict]:
    ordered = sorted(chunks, key=lambda c: (-c["score"], c["doc_id"], c["chunk_id"]))
    seen: set[tuple[str, int]] = set()
    out: list[dict] = []
    for c in ordered:
        key = (c["doc_id"], c["chunk_id"])
        if key not in seen:
            seen.add(key)
            out.append(c)
            if len(out) == limit:
                break
    return out`,
      hint: 'Replace `chunks.sort(...)` with `sorted(chunks, ...)` to avoid mutating caller input, and track `(c["doc_id"], c["chunk_id"])` in `seen`.',
      hints: [
        'Use `sorted(chunks, key=lambda c: (-c["score"], c["doc_id"], c["chunk_id"]))` instead of in-place `.sort()`.',
        'Set `key = (c["doc_id"], c["chunk_id"])` so distinct documents sharing text keep distinct citations.',
        'Stop early once `len(out) == limit`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q8-4-1',
      type: 'numeric',
      question: 'Across 4 RAG queries (`k=5`), the ground-truth document appeared at 1-indexed ranks `[1, 2, 4, not found]`. What is the Mean Reciprocal Rank (MRR)?',
      options: [],
      correctIndex: 0,
      correctNumber: 0.4375,
      tolerance: 0.001,
      unit: 'MRR',
      explanation: '$(1/1 + 1/2 + 1/4 + 0) / 4 = 1.75 / 4 = 0.4375$.',
    },
    {
      id: 'q8-4-2',
      type: 'multiple-choice',
      question: 'In a two-minute **STAR** behavioral engineering answer, which section deserves roughly `60%` of your speaking time?',
      options: [
        'Spending ninety seconds explaining company org-chart background before mentioning code',
        'Specific technical **Actions** (`"I profiled, chose X over Y, and shipped Z"`)',
        'Listing every programming language ever installed on your personal laptop cleanly',
        'Apologizing repeatedly because the task happened during a solo portfolio sprint',
      ],
      correctIndex: 1,
      explanation: 'Interviewers hire based on YOUR technical judgment and execution—spend most time on concrete Actions + quantified Results.',
    },
    {
      id: 'q8-4-3',
      type: 'multiple-choice',
      question: 'What is the #1 operational reason reviewers fail otherwise-good **4-hour AI take-home** submissions?',
      options: [
        'Using `pytest` instead of manual browser clicks inside Jupyter notebooks',
        'Writing a `12-line` clean helper instead of creating fifteen abstract factory classes',
        'Including a crisp `.env.example` documenting environment variables cleanly',
        '`pytest` crashes immediately offline because no mock LLM client was provided',
      ],
      correctIndex: 3,
      explanation: 'Hiring engineers evaluate submissions offline or inside clean sandboxes without pasting personal OpenAI keys; deterministic mock fixtures make `pytest` run effortlessly.',
    },
    {
      id: 'q8-4-4',
      type: 'spot-bug',
      question: 'During a live code review, the interviewer spots `results.sort(...)` inside your helper function and asks what breaks for upstream callers. What is the real bug?',
      options: [
        'Calling `.sort()` in place mutates the caller’s original list unexpectedly as a side effect',
        'Python forbids `.sort()` on lists containing dictionaries with floating-point scores',
        'Calling `.sort()` uses `O(n^3)` bubble sort unless `reverse=True` is passed explicitly',
        '`.sort()` drops negative numbers automatically whenever `key=` is specified',
      ],
      correctIndex: 0,
      explanation: 'In-place `.sort()` silently mutates caller objects (often breaking outer assertions or concurrent views); `sorted(...)` keeps functions pure.',
    },
    {
      id: 'q8-4-5',
      type: 'multi-select',
      question: 'Select the TWO best responses when a code-review interviewer discovers a real scaling flaw in your take-home code.',
      options: [
        'Acknowledge the flaw candidly without defensiveness (`"Great catch—here is why it fails at scale"`)',
        'Propose a concrete architectural fix and backward-compatible test right away',
        'Argue that the take-home prompt never mentioned multi-tenancy or concurrency limits',
        'Quickly delete the file from GitHub and insist the interviewer misread line numbers',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Graceful ownership + concrete scaling follow-ups simulate real team PR reviews and strongly boost hire confidence.',
    },
    {
      id: 'q8-4-6',
      type: 'ordering',
      question: 'Order the best **4-hour Take-Home Execution Plan** chronologically from Minute 0 to Minute 240.',
      items: [
        'Set up repo skeleton, `.env.example`, offline mock fixtures, and minimal `pytest` setup',
        'Ship simple working end-to-end baseline (`BM25`/simple route) passing smoke test in hour 1',
        'Add core upgrades (hybrid retrieval, validation, refusal behavior) + `MRR`/`Recall` eval script',
        'Write concise `README.md` with eval metrics and test fresh-clone setup cleanly',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Scaffold offline-testable skeleton -> working baseline -> evaluated upgrades -> clean README & fresh-clone test.',
    },
    {
      id: 'q8-4-7',
      type: 'predict-output',
      question: 'A candidate answers *"Tell me about a time you disagreed with a technical direction"* using: `"We argued about fine-tuning vs RAG for a week and eventually did RAG."` Why does this score poorly?',
      options: [
        'Because fine-tuning always outperforms RAG on customer support documentation tasks',
        'Because engineering disagreements must never occur inside agile product teams',
        'Missing individual `"I"` actions, objective evidence/evals run, and measurable final outcome',
        'Because behavioral answers should last at least twelve uninterrupted minutes minimum',
      ],
      correctIndex: 2,
      explanation: 'Strong disagreement stories show data-driven empathy: running a quick experiment/eval (`I tested X vs Y`) and quantifying the impact.',
    },
    {
      id: 'q8-4-8',
      type: 'multiple-choice',
      question: 'Why should your behavioral story emphasize **one measurable lesson or process fix** at the end (`Result`)?',
      options: [
        'It proves you systematically eliminate repeat failures (e.g., adding a CI regression gate)',
        'Because recruiters automatically reject candidates whose projects never hit production bugs',
        'Because STAR interviews legally require every candidate to quote exact Prometheus uptime',
        'It replaces the need to show live portfolio GitHub repositories completely',
      ],
      correctIndex: 0,
      explanation: 'Closing with how you prevented the bug from recurring (CI gate, runbook, schema check) shows senior engineering maturity.',
    },
    {
      id: 'q8-4-9',
      type: 'multiple-choice',
      question: 'Which Python path habit prevents `FileNotFoundError` when a hiring manager runs your take-home repo from a different working directory?',
      options: [
        'Hardcoding `/Users/yourname/Downloads/test_docs.json` at the top of `main.py`',
        'Resolving bundled fixtures relative to `Path(__file__).resolve().parent` cleanly',
        'Asking reviewers in README Step 1 to recreate your personal macOS home username',
        'Storing JSON fixtures solely inside system `/tmp` outside Git version control',
      ],
      correctIndex: 1,
      explanation: 'Anchoring fixture paths via `Path(__file__).resolve().parent` works regardless of where the reviewer invokes `python` or `pytest`.',
    },
  ],
};
