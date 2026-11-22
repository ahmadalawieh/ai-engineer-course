import type { Lesson } from '@/types/course';

export const lesson7_2: Lesson = {
  id: '7-2',
  moduleId: 'mod-7',
  number: '7.2',
  title: 'Evaluation & CI Regression Gates: Golden Sets, Metrics & Judge Calibration',
  subtitle: 'Replace "looks good to me" with golden datasets, deterministic assertions, Recall@k/MRR, calibrated LLM-as-a-Judge, CI regression gates, and real regression debugging.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['6.3'],
  requires: ['rag-citations', 'rag-refusal', 'confidence-intervals'],
  teaches: [
    'golden-datasets',
    'ragas-metrics',
    'llm-as-judge',
    'ci-regression-gates',
  ],
  competencies: ['jr-basic-evals', 'mid-eval-gates', 'sr-org-evals'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Structure the 3-tier eval pyramid: Level 1 deterministic code checks, Level 2 retrieval metrics (`Recall@k`, `MRR`), and Level 3 calibrated LLM-as-a-Judge.',
    'Diagnose whether a bad RAG answer came from Retrieval failure (`Context Recall`), Hallucination (`Faithfulness`), or Instruction drift (`Answer Relevance`).',
    'Neutralize LLM-as-a-Judge Position Bias and Verbosity Bias and verify alignment against human labels using agreement / Cohen’s kappa ($\\kappa$).',
    'Block regressions automatically in GitHub Actions CI and walk through isolating and fixing a real retrieval/prompt regression.',
  ],
  checkWithoutNotes: [
    'Your RAG eval reports Context Recall = 0.94 and Answer Relevance = 0.90, yet Faithfulness drops to 0.58—which pipeline stage broke?',
    'Explain why you should ALWAYS exhaust Level-1 deterministic Python checks before paying an LLM-as-a-Judge.',
    'How does running pairwise judging in both `(A, B)` and `(B, A)` orders neutralize Position Bias?',
    'Why do teams require `reasoning` BEFORE `verdict` inside an LLM-as-a-Judge JSON schema?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Changing two words in a system prompt to fix an edge-case complaint frequently breaks five existing customer workflows silently. Because LLM applications and RAG pipelines are non-deterministic and high-dimensional, eyeballing five sample outputs ("vibe checking") lets costly regressions ship straight to users every week.',
        'Professional AI teams treat **Evals as automated integration tests for probabilistic software**. Whenever someone changes a chunker, retrieval weight, embedding model, or prompt template, GitHub Actions runs a curated **Golden Dataset** (50–300 real production queries paired with expected sources, edge refusals, and rubric labels), computes deterministic + retrieval + calibrated judge metrics, compares them against `main`, and blocks merges whenever key metrics regress past strict CI tolerances.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Three-Tier Eval Pyramid & Diagnostic Isolation',
      paragraphs: [
        'Never jump straight to an expensive LLM-as-a-Judge when plain Python can prove failure faster and deterministically. Build your eval suite as a **3-Tier Pyramid**: **Tier 1 (Deterministic Code Assertions)** checks valid JSON schema compliance, refusal on out-of-scope prompts, exact tool selection, latency/token ceilings, and whether every cited `[doc_id]` genuinely appeared in retrieved context (0% hallucinated IDs!). Tier 1 executes in milliseconds at zero API cost.',
        '**Tier 2 (Retrieval Ranking Metrics)** grades the search stage *independently* from generation: **`Recall@k`** asks *"did all ground-truth documents land inside the top `k` retrieved chunks?"*, while **MRR (Mean Reciprocal Rank)** rewards placing the first relevant document at rank 1 (`1.0`) rather than rank 5 (`0.2`). **Tier 3 (Calibrated LLM-as-a-Judge)** grades nuanced semantics—such as **Faithfulness** (is every claim in the answer supported strictly by retrieved chunks?) and **Answer Relevance** (did the response actually answer the user\'s question?).',
        'Crucially, remember that **LLM judges have systematic biases**. Without calibration, judges suffer **Position Bias** (favoring Option A over Option B in side-by-side comparisons simply because it comes first) and **Verbosity Bias** (rewarding padded long paragraphs over crisp accurate answers). Fix both by swapping `(A, B)` and `(B, A)` pairs cleanly, prompting step-by-step **`reasoning` BEFORE `pass/fail`** inside structured JSON output, and measuring **Cohen’s kappa ($\\kappa$)** against ~50 human-labeled examples until judge agreement clears `>= 0.80`.',
      ],
    },
    {
      type: 'table',
      title: 'The RAGAS Evaluation Triad (Isolate Retrieval vs Generation Bugs)',
      headers: ['Metric', 'Inputs Evaluated', 'What Failure It Pinpoints'],
      rows: [
        ['**Context Precision / Recall**', 'Query vs Retrieved Chunks (+ Ground Truth IDs)', '**Retriever bug**: failed to fetch the right chunk, or buried it below noise'],
        ['**Faithfulness**', 'Retrieved Chunks vs Generated Answer', '**Hallucination bug**: generator invented numbers or claims absent from context'],
        ['**Answer Relevance**', 'Query vs Generated Answer', '**Instruction bug**: answer stayed faithful to chunks yet dodged what the user asked'],
      ],
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'Two Fatal Biases of LLM-as-a-Judge (and How to Fix Them)',
      body: '1) **Position Bias**: in A/B pairwise judging, LLMs systematically favor whichever answer appears first! Always run twice swapping `(A, B)` and `(B, A)`. 2) **Verbosity Bias**: judges prefer longer fluff unless penalized in the rubric. Always calibrate your judge against 50 human-labeled examples (aim for $> 0.80$ agreement / Cohen’s $\\kappa$).',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Finding and Fixing a Real Regression in CI',
      paragraphs: [
        'Walk through a realistic incident caught by a GitHub Actions regression gate before hitting production. On PR #142, a developer increases RAG chunk size from `400` to `1,200` tokens trying to capture fuller tables, and bumps `top_k` down from `5` to `2` to stay within the token budget. Immediately, CI prints a red gate failure:',
        'Baseline `main`: `Recall@k = 0.92`, `Citation Validity = 1.00`, `Faithfulness = 0.91`, `Unanswerable Refusal = 0.95`. PR #142: `Recall@k = 0.74` (**-18% REGRESSION!**), `Faithfulness = 0.89`, `Refusal = 0.94`. Because Tier-2 `Recall@k` isolated the search stage directly, you pinpoint the root cause in thirty seconds without blaming the LLM: oversized 1,200-token chunks diluted topic embeddings AND lowering `top_k=2` dropped multi-document facts! Fix: switch to **Small-to-Big Parent-Child retrieval** (index `300`-token child chunks at `top_k=5`, expand to deduplicated parent sections for generation), re-run the golden eval (`Recall@k -> 0.94`, `Faithfulness -> 0.93`), and merge green.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: CI Regression Diff Gate + Calibrated Pairwise Position-Swap Check',
      language: 'python',
      code: `def check_ci_gate(baseline: dict[str, float], candidate: dict[str, float], max_drop: float = 0.02) -> dict:
    regressions = {}
    for metric, base_val in baseline.items():
        cand_val = candidate.get(metric, 0.0)
        if base_val - cand_val > max_drop:
            regressions[metric] = round(cand_val - base_val, 4)
    return {"passed": len(regressions) == 0, "regressions": regressions}

base = {"recall": 0.92, "citation_valid": 1.00, "faithfulness": 0.91}
pr142 = {"recall": 0.74, "citation_valid": 1.00, "faithfulness": 0.89}
print("PR #142 Gate:", check_ci_gate(base, pr142))`,
      caption: 'Explained output: `PR #142 Gate: {\'passed\': False, \'regressions\': {\'recall\': -0.18}}`. Pinpointing the exact regressing stage (`recall`) stops broken chunking PRs before deployment.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Judge Calibration (Cohen’s $\\kappa$), Golden Set Design & Online A/B Evals',
      paragraphs: [
        'Raw percent agreement can mislead you on imbalanced evaluations: if 90% of answers pass, a lazy dummy judge that blindly outputs `"PASS"` every single time scores `90%` agreement! **Cohen’s kappa** fixes that by subtracting chance agreement $p_e$: $\\kappa = \\frac{p_o - p_e}{1 - p_e}$, where $p_o$ is observed agreement and $p_e = p_{\\text{human}} p_{\\text{judge}} + (1 - p_{\\text{human}})(1 - p_{\\text{judge}})$. A blind constant judge yields $\\kappa = 0.0$, while strong human-calibrated judges reach $\\kappa \\ge 0.80$. Always tune your judge rubric against ~50 human-annotated examples—especially on subtle edge failures—before trusting automated CI verdicts.',
        'Structure your **Golden Dataset** intentionally across four balanced buckets instead of grabbing 100 easy FAQs: `40%` core everyday user requests, `25%` tricky multi-hop or jargon/code queries testing hybrid retrieval, `20%` out-of-scope or conflicting-fact queries testing **grounded refusal**, and `15%` adversarial prompt-injection or cross-tenant ACL traps. Store inputs alongside deterministic expected IDs/rubrics in versioned `evals/golden.jsonl` reviewed via Pull Requests just like application source code.',
        'Finally, remember that offline evals cannot measure real user impatience or unseen phrasing distributions completely. Pair offline CI golden gating with **online production A/B evaluation**: split live user sessions cleanly (keeping every user pinned to one variant), track explicit feedback alongside implicit signals (follow-up rephrasing rate, escalation-to-human clicks, latency p95), and apply 95% confidence intervals (Module 1.6) before shipping winners to `100%` traffic.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Grading exclusively with LLM-as-a-Judge:** Expensive, slower, and noisy on checks that deterministic Python handles with `100%` precision (valid JSON, zero hallucinated citations, schema types, latency bounds). Always run Tier-1 checks first.',
        '**Mistake 2 — Never tuning the golden dataset as production evolves:** Real customer queries uncover weird phrasings your launch set missed. Whenever a production bug ships or fails trace inspection, promote that exact sanitized query + expectation straight into `evals/golden.jsonl` so it can never regress again.',
        '**Mistake 3 — Trusting single-order `(A, B)` pairwise wins:** LLMs routinely favor Position A on close ties. Always run swapped `(B, A)` pairs and mark order-flipping cases as `"tie"` (or inspect rubric ambiguity).',
        '**Mistake 4 — Merging PRs off aggregate average while hiding subgroup drops:** A `+4%` average gain can mask a `-25%` regression on refusal safety or Arabic queries! Gate critical slices (`refusal`, `acl_isolation`, `arabic`) separately in CI.',
        '**Mistake 5 — Using temperature > 0.0 inside automated CI judge calls:** Stochastic judge sampling introduces random +/-2% noise on identical commits, triggering flaky CI reruns! Pin `temperature = 0.0` (and seed if supported) for evaluators, run multiple repeats only on borderline human calibration studies, and track historical CI pass rates across commits.',
        '**Mistake 6 — Ignoring latency & token cost regressions in eval gates:** A new agentic prompt that nudges Faithfulness from `0.90` to `0.91` while doubling average latency and tripling USD cost per ticket is a net product regression. Always assert p95 latency and mean USD cost budgets alongside accuracy metrics inside CI!',
        '**Mistake 7 — Asking LLM judges vague 1-to-10 numeric scales:** Humans and models both drift wildly between `"6/10"` and `"7/10"`! Anchor evaluations on crisp **binary Pass/Fail** criteria (or strictly defined 1–3 / 1–5 checklists with concrete pass and fail examples embedded in the rubric) so judge outputs stay consistent across prompt revisions and team reviewers, keeping automated CI scorecards fast, reproducible across seeds, and genuinely trustworthy before releases.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Layer the Eval Pyramid:** Deterministic code assertions -> Retrieval `Recall@k`/`MRR` -> Calibrated LLM-as-a-Judge.',
        '2. **Isolate Retrieval vs Generation bugs:** Low Context Recall means fix chunking/hybrid search; high Recall + low Faithfulness means fix grounding/prompts.',
        '3. **Calibrate LLM judges rigorously:** Emit `reasoning` before `score`, run `(A, B)` + `(B, A)` swaps for Position Bias, and verify Cohen’s $\\kappa \\ge 0.80$ against human labels.',
        '4. **Enforce CI regression gates by slice:** Fail PRs whenever core metrics or safety/refusal slices drop past strict tolerance.',
        '5. **Turn production bugs into permanent golden tests:** Grow `golden.jsonl` continuously from real traced failures.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-2',
      difficulty: 'guided',
      requires: ['ragas-metrics', 'golden-datasets'],
      title: 'Lab 7.2 (Guided): Deterministic RAG Citation, Recall & MRR Scorer',
      prompt:
        'Implement `eval_rag_case(cited_ids, retrieved_ids, expected_ids)` returning `{"citations_valid": bool, "recall": float, "mrr": float}` where `citations_valid` is `True` only if every cited ID exists in `retrieved_ids`, `recall` is the fraction of `expected_ids` found in `retrieved_ids` (`1.0` if `expected_ids` is empty), and `mrr` is `1.0 / (rank_1_indexed)` of the FIRST item in `retrieved_ids` belonging to `expected_ids` (`0.0` if none found, or `1.0` if `expected_ids` is empty).',
      starterCode: `def eval_rag_case(cited_ids: list[str], retrieved_ids: list[str], expected_ids: list[str]) -> dict:
    # Return {"citations_valid": bool, "recall": float, "mrr": float}
    pass

print(eval_rag_case(["doc-1", "doc-9"], ["doc-1", "doc-2"], ["doc-1", "doc-3"]))`,
      testCode: `r1 = eval_rag_case(["doc-1", "doc-9"], ["doc-1", "doc-2"], ["doc-1", "doc-3"])
assert r1["citations_valid"] is False, "doc-9 was hallucinated!"
assert abs(r1["recall"] - 0.5) < 1e-6
assert abs(r1["mrr"] - 1.0) < 1e-6

r2 = eval_rag_case(["doc-3"], ["doc-9", "doc-2", "doc-3"], ["doc-2", "doc-3"])
assert r2["citations_valid"] is True and abs(r2["recall"] - 1.0) < 1e-6
assert abs(r2["mrr"] - 0.5) < 1e-6, f"First expected doc is at rank 2 -> MRR=0.5, got {r2['mrr']}"

r3 = eval_rag_case([], ["doc-1"], ["doc-4"])
assert abs(r3["mrr"] - 0.0) < 1e-6 and abs(r3["recall"] - 0.0) < 1e-6
print("PASS: Lab 7.2 Deterministic RAG citation, recall & MRR scorer passed!")`,
      solutionCode: `def eval_rag_case(cited_ids: list[str], retrieved_ids: list[str], expected_ids: list[str]) -> dict:
    retrieved_set = set(retrieved_ids)
    expected_set = set(expected_ids)
    citations_valid = all(cid in retrieved_set for cid in cited_ids)
    if not expected_set:
        return {"citations_valid": citations_valid, "recall": 1.0, "mrr": 1.0}
    hits = sum(1 for eid in expected_set if eid in retrieved_set)
    recall = hits / len(expected_set)
    mrr = 0.0
    for idx, rid in enumerate(retrieved_ids, start=1):
        if rid in expected_set:
            mrr = 1.0 / idx
            break
    return {"citations_valid": citations_valid, "recall": recall, "mrr": mrr}`,
      hint: 'Iterate `enumerate(retrieved_ids, start=1)` and take `1.0 / idx` at the very first `rid in expected_set` (then `break`!).',
      hints: [
        'Use `retrieved_set = set(retrieved_ids)` for fast membership checks.',
        '`citations_valid = all(cid in retrieved_set for cid in cited_ids)`.',
        'Loop `enumerate(retrieved_ids, start=1)` to set `mrr = 1.0 / idx` on the first hit.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-2-2',
      difficulty: 'spec',
      requires: ['llm-as-judge', 'ci-regression-gates'],
      title: 'Lab 7.2.2 (From Spec): Position-Bias Neutralizer & CI Slice Regression Gate',
      prompt:
        'Implement two eval harness helpers: 1) `debiased_pairwise_judge(judge_fn, ans_a, ans_b)` where `judge_fn(first, second)` returns `"first" | "second" | "tie"`. Call `judge_fn(ans_a, ans_b)` AND `judge_fn(ans_b, ans_a)`: return `"A"` only if both runs consistently pick `ans_a`, `"B"` only if both consistently pick `ans_b`, else `"tie"`. 2) `ci_slice_gate(baseline_slices, candidate_slices, max_drop=0.03)` returning `True` ONLY if `candidate_slices` has EVERY slice key in `baseline_slices` and no slice drops by strictly more than `max_drop` (`baseline - candidate <= max_drop`).',
      starterCode: `def debiased_pairwise_judge(judge_fn, ans_a: str, ans_b: str) -> str:
    # Return "A", "B", or "tie" after running both (A,B) and (B,A) orders
    pass

def ci_slice_gate(baseline_slices: dict[str, float], candidate_slices: dict[str, float], max_drop: float = 0.03) -> bool:
    pass`,
      testCode: `# Biased judge always picks whichever answer comes first!
biased = lambda first, second: "first"
assert debiased_pairwise_judge(biased, "ansA", "ansB") == "tie", "Position-biased flips must become tie!"

consistent_b = lambda first, second: "second" if first == "ansA" else "first"
assert debiased_pairwise_judge(consistent_b, "ansA", "ansB") == "B"

consistent_a = lambda first, second: "first" if first == "ansA" else "second"
assert debiased_pairwise_judge(consistent_a, "ansA", "ansB") == "A"

assert ci_slice_gate({"core": 0.90, "refusal": 0.95}, {"core": 0.89, "refusal": 0.93}, 0.03) is True
assert ci_slice_gate({"core": 0.90, "refusal": 0.95}, {"core": 0.94, "refusal": 0.88}, 0.03) is False, "Must block subgroup refusal regression even if core rose!"
print("PASS: Lab 7.2.2 Pairwise judge debiaser & CI slice gate passed!")`,
      solutionCode: `def debiased_pairwise_judge(judge_fn, ans_a: str, ans_b: str) -> str:
    r1 = judge_fn(ans_a, ans_b)
    r2 = judge_fn(ans_b, ans_a)
    if r1 == "first" and r2 == "second":
        return "A"
    if r1 == "second" and r2 == "first":
        return "B"
    return "tie"

def ci_slice_gate(baseline_slices: dict[str, float], candidate_slices: dict[str, float], max_drop: float = 0.03) -> bool:
    for k, base_v in baseline_slices.items():
        if k not in candidate_slices:
            return False
        if base_v - candidate_slices[k] > max_drop + 1e-12:
            return False
    return True`,
      hint: '`ans_a` wins consistently only when `judge_fn(ans_a, ans_b) == "first"` AND `judge_fn(ans_b, ans_a) == "second"`; vice versa for `"B"`.',
      hints: [
        'Run both `r1 = judge_fn(ans_a, ans_b)` and `r2 = judge_fn(ans_b, ans_a)`.',
        '`r1 == "first" and r2 == "second"` means A won in both slots.',
        'In `ci_slice_gate`, inspect EVERY slice independently rather than averaging across slices.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-7-2-3',
      difficulty: 'debug',
      requires: ['llm-as-judge', 'golden-datasets'],
      title: 'Lab 7.2.3 (Debug Buggy Code): Fix Judge Cohen’s Kappa Formula & Naive Agreement Bug',
      prompt:
        'A broken calibration metric tries to compute Cohen’s kappa `cohens_kappa(human_labels, judge_labels)` for binary booleans (`True`/`False`). Currently it returns raw accuracy `p_o` instead of `(p_o - p_e) / (1.0 - p_e)`, failing to penalize a constant judge that always predicts `True`! Also handle `1.0 - p_e == 0.0` safely by returning `1.0` if `p_o == 1.0` else `0.0`. Fix `cohens_kappa` cleanly.',
      starterCode: `def cohens_kappa(human_labels: list[bool], judge_labels: list[bool]) -> float:
    n = len(human_labels)
    # Bug: returns raw agreement p_o without subtracting chance agreement p_e!
    agree = sum(1 for h, j in zip(human_labels, judge_labels) if h == j)
    return agree / n`,
      testCode: `# Imbalanced dataset: 9 True, 1 False; blind always-True judge scores 90% raw agreement yet kappa == 0.0!
h = [True]*9 + [False]
always_true = [True]*10
k_blind = cohens_kappa(h, always_true)
assert abs(k_blind - 0.0) < 1e-6, f"Constant judge must have kappa == 0.0, got {k_blind}"

# Strong calibrated judge: 9 matching, 1 disagreement -> high positive kappa
j_good = [True]*8 + [False, False]  # TP=8, FN=1, FP=0, TN=1 -> po=0.9, pe=0.9*0.8 + 0.1*0.2 = 0.74 -> k=(0.16/0.26)=0.615
k_good = cohens_kappa(h, j_good)
assert abs(k_good - (0.16 / 0.26)) < 1e-5, f"Expected 0.6154, got {k_good}"
print("PASS: Lab 7.2.3 Cohen's kappa judge calibration metric fixed!")`,
      solutionCode: `def cohens_kappa(human_labels: list[bool], judge_labels: list[bool]) -> float:
    n = len(human_labels)
    if n == 0:
        return 1.0
    p_o = sum(1 for h, j in zip(human_labels, judge_labels) if h == j) / n
    p_h_true = sum(1 for h in human_labels if h) / n
    p_j_true = sum(1 for j in judge_labels if j) / n
    p_e = (p_h_true * p_j_true) + ((1.0 - p_h_true) * (1.0 - p_j_true))
    if abs(1.0 - p_e) < 1e-12:
        return 1.0 if p_o == 1.0 else 0.0
    return (p_o - p_e) / (1.0 - p_e)`,
      hint: 'Compute `p_h_true`, `p_j_true`, chance agreement `p_e = p_h_true*p_j_true + (1-p_h_true)*(1-p_j_true)`, and return `(p_o - p_e) / (1.0 - p_e)`.',
      hints: [
        'Chance agreement on binary labels is `p_h_true * p_j_true + (1 - p_h_true) * (1 - p_j_true)`.',
        'Guard against `1.0 - p_e == 0` when all labels are identical.',
        'Return `(p_o - p_e) / (1.0 - p_e)`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q7-2-1',
      type: 'multiple-choice',
      question: 'Your RAG eval reports Context Recall = `0.94` and Answer Relevance = `0.90`, yet **Faithfulness = `0.58`**. Where is the bug?',
      options: [
        'Your retriever found the right chunks, while the generator hallucinated extra unsupported claims',
        'Your vector database HNSW index failed to connect during Stage-1 top-k lookup cleanly',
        'Your BM25 tokenizer dropped stop words before ranking documents in hybrid fusion',
        'Your users asked off-topic questions completely outside the supported company domain',
      ],
      correctIndex: 0,
      explanation: 'High Context Recall proves retrieval succeeded; low Faithfulness pinpoints unsupported claims introduced during generation.',
    },
    {
      id: 'q7-2-2',
      type: 'multiple-choice',
      question: 'When building an LLM-as-a-Judge evaluator, why output `reasoning` BEFORE `score` inside JSON?',
      options: [
        'Because JSON RFC parsers reject objects unless strings appear before numeric keys',
        'Reasoning first lets the model check rubric facts before locking in the score',
        'To intentionally double output token counts so provider rate limits trigger faster',
        'To force Softmax temperature automatically down to zero without setting API parameters',
      ],
      correctIndex: 1,
      explanation: 'Generating step-by-step rubric verification prior to the verdict improves judge accuracy and human alignment substantially.',
    },
    {
      id: 'q7-2-3',
      type: 'multiple-choice',
      question: 'How do you neutralize **Position Bias** in pairwise A/B LLM judging?',
      options: [
        'Raise `temperature` up to `2.0` so random coin flips balance out favoritism',
        'Place your newly trained candidate model strictly inside Option B on every pair',
        'Judge both `(A, B)` and `(B, A)` orders and mark order-flipping pairs as `"tie"`',
        'Shorten retrieved context windows down to 100 tokens across all test queries',
      ],
      correctIndex: 2,
      explanation: 'Order-swapping consistency checks immediately catch and cancel positional favoritism.',
    },
    {
      id: 'q7-2-4',
      type: 'spot-bug',
      code: `# Aggregate accuracy rose +4% overall!
assert mean(candidate_scores) >= mean(baseline_scores)`,
      question: 'Why is gating CI strictly on one overall average score risky?',
      options: [
        'Python `mean()` raises `ZeroDivisionError` unless lists hold integers',
        'A `+4%` average gain can hide a severe `-25%` drop on safety refusals or Arabic queries',
        'Golden datasets can only store binary pass/fail labels, never floats',
        'CI runners refuse executing assertions without external paid judge APIs',
      ],
      correctIndex: 1,
      explanation: 'Aggregate averages hide dangerous regressions in smaller high-risk slices (`refusal`, `acl_isolation`, multilingual). Gate critical slices independently!',
    },
    {
      id: 'q7-2-5',
      type: 'multi-select',
      question: 'Which TWO checks belong in fast zero-cost Tier-1 Deterministic Evals before calling an LLM judge?',
      options: [
        'Validating output JSON syntax/enums and verifying every cited `[doc_id]` exists in retrieved context',
        'Checking hard refusal compliance on adversarial/out-of-scope prompts and response latency ceilings',
        'Scoring subtle stylistic empathy and tone nuance across open-ended customer essays',
        'Eyeballing three cherry-picked completions manually before opening a Pull Request',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Schema syntax, zero hallucinated citation IDs, refusal flags, and latency limits run fast and deterministically in Python.',
    },
    {
      id: 'q7-2-6',
      type: 'numeric',
      question: 'A retriever places the ONLY relevant document at rank `4` (1-indexed) inside top-5 results. What is the Reciprocal Rank (`1 / rank`) for this query?',
      options: [],
      correctIndex: 0,
      correctNumber: 0.25,
      tolerance: 0.001,
      explanation: 'Reciprocal Rank = `1 / 4 = 0.25`.',
    },
    {
      id: 'q7-2-7',
      type: 'predict-output',
      code: `base = {"recall": 0.90, "faith": 0.92}
cand = {"recall": 0.78, "faith": 0.95}
failed = [k for k in base if base[k] - cand[k] > 0.03]
print(failed)`,
      question: 'Which slice fails the CI regression check?',
      options: [
        '`[]` (passes cleanly)',
        '`["faith"]`',
        '`["recall", "faith"]`',
        '`["recall"]`',
      ],
      correctIndex: 3,
      explanation: '`0.90 - 0.78 = 0.12 > 0.03` triggers failure strictly on `["recall"]` even though `faith` improved.',
    },
    {
      id: 'q7-2-8',
      type: 'ordering',
      question: 'Order the steps to diagnose and resolve a real RAG regression caught in CI:',
      options: [],
      items: [
        'Inspect CI slice diff showing Recall@k dropped while Faithfulness held steady',
        'Compare failing queries against retrieved chunks before vs after the chunking PR',
        'Switch oversized chunks to Small-to-Big parent-child indexing to restore recall',
        'Re-run the identical golden eval suite and verify all slices clear CI thresholds',
      ],
      correctIndex: 0,
      explanation: 'Isolate stage via metrics -> inspect specific failing queries -> apply targeted retrieval fix -> re-verify full CI gate.',
    },
    {
      id: 'q7-2-9',
      type: 'multiple-choice',
      question: 'Why does Cohen’s $\\kappa$ beat raw percent agreement when calibrating an LLM judge on a 95%-passing dataset?',
      options: [
        'Cohen’s $\\kappa$ subtracts agreement expected by pure chance, exposing dummy constant judges',
        'Raw percent agreement cannot be calculated whenever boolean labels contain `False` values',
        'Cohen’s $\\kappa$ automatically swaps Option A and Option B inside pairwise prompts',
        'Cohen’s $\\kappa$ requires zero human-labeled validation examples to verify alignment',
      ],
      correctIndex: 0,
      explanation: 'On imbalanced 95%-pass sets, an always-`"PASS"` judge gets 95% raw accuracy yet `0.0` Cohen’s $\\kappa$.',
    },
  ],
};
