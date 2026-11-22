import type { Lesson } from '@/types/course';

export const lesson11_2: Lesson = {
  id: '11-2',
  moduleId: 'mod-11',
  number: '11.2',
  title: 'Deep Evals: Prod Logs, Synthetic Data, Trajectories & Statistics',
  subtitle: 'Turn real production failures into golden tests, grade multi-step agent trajectories, generate non-trivial synthetic edge cases, and test significance against noisy evals.',
  durationMinutes: 85,
  track: 'ai-eng',
  prerequisites: ['7.2', '11.1'],
  requires: ['golden-datasets', 'ci-regression-gates', 'confidence-intervals', 'otel-genai-tracing'],
  teaches: ['prod-log-eval-mining', 'agent-trajectory-evals', 'eval-statistical-significance'],
  competencies: ['jr-basic-evals', 'mid-eval-gates', 'sr-org-evals'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Build a clean pipeline promoting thumbs-down production traces into redacted, reproducible golden regression cases.',
    'Generate targeted synthetic edge-case eval sets safely while guarding against circular "same-model bias" and trivial inputs.',
    'Evaluate multi-step agents cleanly using **Trajectory Evals** (required tool sequence + final world state) rather than fragile surface phrasing.',
    'Control evaluation variance (`temperature=0`, repeated trials, paired bootstrap CIs) so you never ship fake 2% noise improvements.',
  ],
  checkWithoutNotes: [
    'Why do production-mined failure traces beat purely hand-written starter eval datasets after launch?',
    'Contrast final-answer string matching against Agent Trajectory Evaluation—when does checking intermediate tool calls catch hidden failures?',
    'How do you avoid circular self-grading bias when generating synthetic eval queries?',
    'Suppose prompt B beats prompt A by +3% on a 40-case golden set, with 95% paired bootstrap CI `[-4%, +10%]`. Should you declare prompt B strictly better?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Static 30-Case Starter Golden Sets Go Stale Fast',
      paragraphs: [
        'On launch week, a 30-case curated golden dataset feels great. Three months later, real users ask abbreviated Slack slang, paste mangled PDF fragments, mix Arabic and English SKUs, and trigger edge cases nobody imagined in week one.',
        'Mature AI engineering teams build a continuous **Eval Flywheel**: every production error, hallucinated citation, or human agent override is scrubbed of PII, tagged by failure mode, and promoted directly into the permanent CI regression suite.',
        'The mental model is aircraft black-box aviation engineering. Every minor near-miss in flight updates simulator training and pre-flight checklists permanently so the exact same failure never takes down a second flight.',
      ],
    },
    {
      type: 'prose',
      heading: 'Trajectory Evaluation, Synthetic Coverage & Statistical Discipline',
      paragraphs: [
        'Grading an agent strictly by its final text sentence misses silent disasters: an agent might guess the right answer while calling an unauthorized billing endpoint, spinning through 9 redundant searches, or ignoring a broken tool warning. **Trajectory Evaluation** verifies BOTH tool path constraints (required lookup before refund, allowed set membership, max step count) AND final state invariants.',
        'Synthetic data generation accelerates coverage on rare error cases (adversarial injections, conflicting policies, edge locales). Keep synthetic sets honest: seed generation from real error taxonomy buckets, verify human-spot-check realism on 15% of rows, and use a distinct held-out model or deterministic code checks rather than grading with the identical prompt that wrote the test.',
        'Finally, LLM evals are inherently noisy. Pin decoding (`temperature=0`, fixed seeds where supported), measure multi-run agreement for non-deterministic judges, and compute **paired bootstrap 95% confidence intervals** on metric deltas (`candidate - baseline`). Only celebrate improvements whose lower CI bound stays safely positive (or zero-regression for parity changes).',
      ],
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: The Noisy "+4% Improvement" Mirage',
      paragraphs: [
        'A search team tweaked system-prompt formatting and ran a single `temperature=0.7` pass over 50 queries. Seeing accuracy rise from 76% to 80% (+2 queries), they merged Friday afternoon. Monday morning telemetry revealed user satisfaction actually dipped 5%—the +4% bump was pure sampling variance whose bootstrap CI spanned `[-7%, +15%]`.',
        'Pinning `temperature=0`, expanding the regression set cleanly to 180 production-mined queries, and requiring paired bootstrap lower-bound confirmation stopped phantom prompt churn completely.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Evaluation Methodology Layers',
      headers: ['Eval Layer', 'What It Catches', 'Noise / Cost', 'Role in CI Gate'],
      rows: [
        ['Deterministic Assertions', 'Broken JSON, invalid citations, ACL leaks', 'Zero noise, pennies', 'Hard Merge Blocker (100% pass)'],
        ['Agent Trajectory Checks', 'Forbidden tools, skipped verification, step bloat', 'Zero noise on recorded runs', 'Hard Blocker on agent repos'],
        ['Production-Mined Golden Set', 'Real user phrasing & prior bugs', 'Low noise at T=0', 'Core regression floor'],
        ['Paired Bootstrap + Debiased Judge', 'Nuance & style regressions cleanly', 'Controlled via 95% CI', 'Release sign-off on ambiguous tasks'],
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-11-2-mine',
      title: 'Lab 11.2a: Production Trace -> Redacted Golden Eval Exporter',
      prompt: 'Implement `promote_failures_to_golden(traces: list[dict]) -> list[dict]`: select ONLY traces where `thumbs_down is True` or `cited_ok is False`, strip email addresses (`[EMAIL]`), and output golden test records `{"case_id": t["trace_id"], "query": clean_q, "failure_tag": "citation_error" if not t["cited_ok"] else "user_thumbs_down"}`.',
      difficulty: 'guided',
      starterCode: `import re

def promote_failures_to_golden(traces: list[dict]) -> list[dict]:
    # Filter negative/invalid traces, redact emails, emit clean golden case dicts
    return []`,
      testCode: `TRACES = [
    {"trace_id": "tr1", "query": "Help nadia@acme.io", "thumbs_down": True, "cited_ok": True},
    {"trace_id": "tr2", "query": "Great answer", "thumbs_down": False, "cited_ok": True},
    {"trace_id": "tr3", "query": "Refund SKU-9", "thumbs_down": False, "cited_ok": False},
]
g = promote_failures_to_golden(TRACES)
assert len(g) == 2
assert g[0]["case_id"] == "tr1" and "nadia@acme.io" not in g[0]["query"] and g[0]["failure_tag"] == "user_thumbs_down"
assert g[1]["case_id"] == "tr3" and g[1]["failure_tag"] == "citation_error"
print("PASS: Lab 11.2a production-log golden flywheel verified!")`,
      solutionCode: `import re

def promote_failures_to_golden(traces: list[dict]) -> list[dict]:
    out = []
    for t in traces:
        bad_cite = not bool(t.get("cited_ok", True))
        neg = bool(t.get("thumbs_down", False))
        if not (bad_cite or neg):
            continue
        clean_q = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", "[EMAIL]", str(t.get("query", "")))
        out.append({
            "case_id": t["trace_id"],
            "query": clean_q,
            "failure_tag": "citation_error" if bad_cite else "user_thumbs_down",
        })
    return out`,
      hint: 'Check `not t.get("cited_ok", True) or t.get("thumbs_down", False)` and scrub emails via regex.',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-2-traj',
      title: 'Lab 11.2b: Agent Tool Trajectory Grader',
      prompt: 'Implement `grade_trajectory(tool_calls: list[str], required_order: list[str], forbidden: set[str], max_steps: int) -> tuple[bool, str]`: reject if `len(tool_calls) > max_steps`, if any call is in `forbidden`, or if `required_order` fails to appear as an in-order subsequence inside `tool_calls`.',
      difficulty: 'spec',
      starterCode: `def grade_trajectory(tool_calls: list[str], required_order: list[str], forbidden: set[str], max_steps: int) -> tuple[bool, str]:
    # Enforce max_steps, zero forbidden tools, and required_order subsequence
    return False, "unimplemented"`,
      testCode: `assert grade_trajectory(["get_order", "calc_policy", "propose_refund"], ["get_order", "propose_refund"], {"drop_db"}, 5)[0] is True
assert grade_trajectory(["propose_refund", "get_order"], ["get_order", "propose_refund"], {"drop_db"}, 5)[0] is False
assert grade_trajectory(["get_order", "drop_db", "propose_refund"], ["get_order", "propose_refund"], {"drop_db"}, 5)[0] is False
assert grade_trajectory(["a", "b", "c", "d"], ["a"], set(), 3)[0] is False
print("PASS: Lab 11.2b agent trajectory grader verified!")`,
      solutionCode: `def grade_trajectory(tool_calls: list[str], required_order: list[str], forbidden: set[str], max_steps: int) -> tuple[bool, str]:
    if len(tool_calls) > max_steps:
        return False, "exceeded_max_steps"
    if any(t in forbidden for t in tool_calls):
        return False, "forbidden_tool_called"
    idx = 0
    for t in tool_calls:
        if idx < len(required_order) and t == required_order[idx]:
            idx += 1
    if idx < len(required_order):
        return False, "missing_or_out_of_order"
    return True, "ok"`,
      hint: 'Advance pointer `idx` over `required_order` while scanning `tool_calls` sequentially; verify `idx == len(required_order)`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-11-2-ci',
      title: 'Lab 11.2c: Statistical Significance Eval Gate (Fix Flaky Promotion)',
      prompt: 'Fix `should_promote_candidate(base_scores: list[float], cand_scores: list[float], seed: int = 42) -> tuple[bool, float, float]` using paired bootstrap resampling (`400` samples): return `(lo_95 > 0.0, lo_95, hi_95)` so candidate ONLY promotes when the 95% lower bound strictly exceeds `0.0`.',
      difficulty: 'debug',
      starterCode: `import random

def should_promote_candidate(base_scores: list[float], cand_scores: list[float], seed: int = 42) -> tuple[bool, float, float]:
    # BUG: promotes whenever raw average is slightly higher, ignoring confidence interval!
    mean_delta = sum(c - b for b, c in zip(base_scores, cand_scores)) / max(1, len(base_scores))
    return (mean_delta > 0.0, mean_delta, mean_delta)`,
      testCode: `import random
rng = random.Random(7)
noisy_b = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0]
noisy_c = [0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0] # +12.5% raw noise crossing zero!
promote_noisy, lo1, hi1 = should_promote_candidate(noisy_b, noisy_c)
assert promote_noisy is False and lo1 <= 0.0, f"Should reject crossing zero: {(promote_noisy, lo1, hi1)}"

real_b = [0.0] * 20
real_c = [1.0] * 18 + [0.0, 0.0]
promote_real, lo2, hi2 = should_promote_candidate(real_b, real_c)
assert promote_real is True and lo2 > 0.7, f"Should promote genuine lift: {(promote_real, lo2, hi2)}"
print("PASS: Lab 11.2c paired bootstrap significance gate verified!")`,
      solutionCode: `import random

def should_promote_candidate(base_scores: list[float], cand_scores: list[float], seed: int = 42) -> tuple[bool, float, float]:
    n = min(len(base_scores), len(cand_scores))
    if n == 0:
        return False, 0.0, 0.0
    deltas = [cand_scores[i] - base_scores[i] for i in range(n)]
    rng = random.Random(seed)
    means = []
    for _ in range(400):
        s = [deltas[rng.randrange(n)] for _ in range(n)]
        means.append(sum(s) / n)
    means.sort()
    lo = round(means[int(0.025 * 400)], 4)
    hi = round(means[int(0.975 * 400)], 4)
    return (lo > 0.0, lo, hi)`,
      hint: 'Resample indices `[deltas[rng.randrange(n)] for _ in range(n)]` 400 times, sort `means`, and check `means[10] > 0.0`.',
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & Worked Eval Stabilization Playbook',
      paragraphs: [
        'Even dedicated AI engineering teams frequently sabotage their evaluation pipelines with three subtle mistakes. First, **allowing benchmark leakage into few-shot prompts**: copying three examples out of your 60-case golden set directly into the system prompt inflates CI pass rates artificially while generalization drops silently on unseen users. Keep strict train/prompt-example vs held-out golden eval separation just like classical ML.',
        'Second, **ignoring flaky judge tie-breaking and temperature variance**: running a judge at `temperature=0.7` flips borderline ratings across consecutive GitHub Actions runs, teaching developers to click "Re-run failed jobs" blindly whenever a PR fails. Pin `temperature=0.0`, run deterministic JSON/citation/tool-trajectory checks ahead of LLM judging, and flag inconsistent swapped `(A, B)/(B, A)` pairs cleanly as `TIE`.',
        'Third, **forgetting failure taxonomy balancing**: if 85% of your dataset tests happy-path FAQs while only 5 cases test missing-evidence abstention and indirect prompt injection, a regression breaking refusal gates only dents total average accuracy by 2%. Slice CI thresholds cleanly per tag (`citation_validity == 100%`, `refusal_pass >= 95%`, `overall >= 88%`) so critical invariants never hide inside blended averages.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked End-to-End Example: Catching a Subtle Agent PR Regression in CI',
      paragraphs: [
        'Trace a pull request attempting to reduce average refund agent latency by removing a policy verification tool call on small requests. Locally on 5 manual test queries, everything looks snappy and persuasive. Once pushed to GitHub, the automated CI harness runs the 160-case golden + trajectory suite mined from past production tickets (`temperature=0.0`).',
        'Deterministic schema checks pass 100%, yet two high-severity slices light up red immediately: `grade_trajectory` flags 9 canceled orders where `propose_refund` executed without running `lookup_order` first (`missing_or_out_of_order`), and paired bootstrap analysis over the ambiguous subset gives delta `[-0.08, -0.01]`, proving a statistically genuine drop rather than noise. The PR blocks safely before a single customer receives an unverified refund.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'Continuously scrub and promote real production failures into golden regression tests so evals stay anchored to actual user traffic.',
        'Evaluate agents on full tool-call trajectories and end-state invariants, never only final chat text.',
        'Control eval noise with `temperature=0`, sufficient sample size, and paired bootstrap confidence intervals.',
        'Slice regression gates across safety refusal, citation validity, tool ordering, and edge-case segments separately so high-volume happy queries never hide critical breakages inside blended pass rates.',
        'Keep a small blind holdout slice rotated quarterly from scrubbed customer tickets outside everyday prompt-tuning iteration, preventing engineers from accidentally overfitting instructions solely to memorized CI benchmark phrases while keeping long-term production generalization trustworthy across shifting user intents, seasonal support spikes, and evolving tool schemas.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q11-2-1',
      question: 'Why must production trace failures pass through an automated PII scrubber BEFORE entering Git-committed golden eval suites?',
      options: [
        'To reduce YAML fixture size below one kilobyte for faster local parsing',
        'Because raw logs often contain customer emails, tokens, or secrets',
        'Because Python pytest test runners skip golden rows containing email symbols',
        'To automatically normalize Arabic Tashkeel diacritics ahead of indexing',
      ],
      correctIndex: 1,
      explanation: 'Committed test fixtures are widely readable in GitHub; scrub customer PII and auth secrets first.',
    },
    {
      id: 'q11-2-2',
      question: 'What bug can an Agent Trajectory Eval catch that a final-answer text check completely misses?',
      options: [
        'Minor punctuation typos inside Markdown response bullet headings',
        'Guessing the answer after calling a forbidden tool or skipping lookup',
        'Contrast ratio rendering bugs inside frontend dark-mode CSS styling',
        'Slow authoritative DNS resolution latency across third-party static CDNs',
      ],
      correctIndex: 1,
      explanation: 'Trajectory checks validate intermediate tool ordering, step caps, and policy compliance.',
    },
    {
      id: 'q11-2-3',
      type: 'predict-output',
      question: 'If a paired bootstrap 95% confidence interval for `(candidate - baseline)` pass rate spans `[-0.03, +0.09]`, what should the release check conclude?',
      code: `promote, lo, hi = should_promote_candidate(base, cand) # (-0.03, +0.09)`,
      options: [
        'Promote immediately to production as a verified guaranteed three percent lift',
        'Delete the legacy golden baseline file completely so CI runs faster next sprint',
        'Do not claim a reliable improvement since the interval crosses zero',
        'Raise decoding temperature cleanly to 1.2 to magnify pass-rate differences',
      ],
      correctIndex: 2,
      explanation: 'When a 95% confidence interval includes negative and positive deltas around zero, evidence is inconclusive.',
    },
    {
      id: 'q11-2-4',
      type: 'spot-bug',
      question: 'Spot the flaw in using the exact same prompt template that generates answers to also generate and score 100% of synthetic test cases.',
      options: [
        'Synthetic datasets must always serialize using raw comma-separated CSV files',
        'Evaluated cosine similarity vectors lose unit normalization under synthetic queries',
        'Deterministic Python random seeds raise serialization errors on nested JSON lists',
        'Circular generation copies model blind spots while missing diverse real traffic',
      ],
      correctIndex: 3,
      explanation: 'Self-generated evals mirror model blind spots; pair synthetic taxonomy edge cases with real production logs.',
    },
    {
      id: 'q11-2-5',
      type: 'multi-select',
      question: 'Which practices cut variance and flakiness in automated CI evaluation suites?',
      options: [
        'Pinning temperature=0 on evaluation runs',
        'Checking deterministic JSON schema & citations before calling judges',
        'Comparing prompt candidates on paired identical golden items',
        'Setting temperature=1.0 so CI tests explore random creativity',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 2],
      explanation: 'Deterministic checks, `temperature=0`, and paired golden datasets isolate true model/prompt deltas cleanly.',
    },
    {
      id: 'q11-2-6',
      type: 'ordering',
      question: 'Order the production-log eval flywheel lifecycle cleanly:',
      options: [],
      items: [
        'Detect user thumbs-down or citation failure in traces',
        'Scrub PII & secrets from input/context',
        'Label failure taxonomy & append to golden dataset',
        'Gate every subsequent PR in CI against the expanded suite',
      ],
      correctIndex: 0,
      explanation: 'Capture failure -> scrub PII -> label golden case -> enforce permanently in CI.',
    },
    {
      id: 'q11-2-7',
      type: 'numeric',
      question: 'If `grade_trajectory` enforces `max_steps=4`, and an agent runs `[search, search, lookup, search, answer]` (5 calls), by how many steps did it exceed `max_steps`?',
      options: [],
      correctIndex: 0,
      correctNumber: 1,
      tolerance: 0,
      unit: 'step',
      explanation: '5 calls - 4 max_steps = 1 step over limit.',
    },
    {
      id: 'q11-2-8',
      question: 'When evaluating RAG retrieval vs final generation separately, why track Recall@k independently of LLM judge scores?',
      options: [
        'Pinpoints missing documents even when the generator hides gaps',
        'Eliminates the need for structure-aware Markdown document chunking completely',
        'OpenTelemetry trace spans disallow exporting aggregate numerical LLM judge scores',
        'Pairwise automated LLM judges systematically prefer shorter top-k chunks',
      ],
      correctIndex: 0,
      explanation: 'Evaluating retrieval separately isolates index/chunking bugs from prompt/generation errors.',
    },
  ],
};
