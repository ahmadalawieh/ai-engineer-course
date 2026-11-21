import type { CourseModule } from '@/types/course';

export const module8: CourseModule = {
  id: 'mod-8',
  number: 8,
  title: 'System Design, Capstones & Interview Mastery',
  subtitle: 'Synthesize everything into Staff-level AI System Design, Data Science case studies, portfolio blueprints, and live interview practice.',
  track: 'core',
  estimatedHours: 3.5,
  capstoneDeliverable: 'Complete the Dual-Track Readiness Blueprint & pass the Mock Technical Interview.',
  lessons: [
    {
      id: '8-1',
      moduleId: 'mod-8',
      number: '8.1',
      title: 'End-to-End AI Engineering System Design',
      subtitle: 'Ace the 45-minute AI System Design interview by architecting scalable, evaluated, cost-bounded AI products.',
      durationMinutes: 16,
      track: 'ai-eng',
      prerequisites: ['6.3', '7.1', '7.2', '7.3'],
      objectives: [
        'Use a repeatable 5-step framework for any AI System Design prompt (Requirements $\\rightarrow$ Data/Retrieval $\\rightarrow$ Generation/Routing $\\rightarrow$ Evals/Guardrails $\\rightarrow$ Scaling/FinOps).',
        'Design an enterprise multi-tenant RAG + Agent platform handling 1M DAU within latency & cost SLAs.',
        'Articulate clear tradeoffs (build vs buy, open weights vs API, async vs streaming).',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'The 5-Step AI System Design Framework (Use This in Every Interview)',
          paragraphs: [
            'When an interviewer asks *"Design an AI Support Copilot for 10M users"*, do NOT immediately shout *"Pinecone + LangChain + GPT!"* Walk methodically through these 5 pillars:',
            '**1. Clarify Functional & Non-Functional SLAs**: Exact task (QA, triage, write actions?), p95 TTFT (`< 800ms` streaming), accuracy/hallucination tolerance, multi-tenancy/PII compliance, budget per ticket (`< $0.01`).',
            '**2. Ingestion & Hybrid Retrieval Pipeline**: Event-driven doc sync (CDC/webhooks) $\\rightarrow$ structure-aware contextual chunking $\\rightarrow$ Hybrid BM25 + HNSW dense vectors with mandatory `tenant_id` ACL pre-filter $\\rightarrow$ Stage-2 Cross-Encoder reranker.',
            '**3. Model Routing, Caching & Guardrails**: Exact + Semantic Redis cache for top FAQs $\\rightarrow$ Prompt Prefix Caching $\\rightarrow$ Fast 8B router/classifier handling 75% simple queries, escalating complex ones $\\rightarrow$ Structured Output JSON schema + HITL gate for refunds/writes.',
            '**4. Offline & Online Evals**: Golden 200-case CI eval gate (Recall@10, Faithfulness, schema validity) + Shadow/Canary rollout + Online user feedback & trace sampling.',
            '**5. Failure Modes & Fallbacks**: Provider multi-region failover, circuit breakers, graceful degradation to BM25 links if LLM times out.',
          ],
        },
        {
          type: 'table',
          title: 'Interview Tradeoff Cheat Sheet',
          headers: ['Design Choice', 'When to Pick Option A', 'When to Pick Option B'],
          rows: [
            ['Hosted Frontier API vs Self-Hosted vLLM', 'Rapid iteration, complex reasoning, variable spiky traffic', 'Strict data residency/HIPAA, steady high GPU utilization, distilled 8B–70B task'],
            ['Vector DB (`pgvector` vs dedicated Qdrant/Pinecone)', '`pgvector` (<10M vectors, transactional joins with Postgres ACLs)', 'Dedicated Vector DB (100M+ vectors, ultra-low p99, isolated scaling)'],
            ['Sync Streaming vs Async Queue', 'Interactive chat copilot (SSE streaming for perceived speed)', 'Batch document extraction, overnight evals, deep research reports'],
          ],
        },
        {
          type: 'callout',
          variant: 'interview',
          title: 'What Separates Junior vs Senior/Staff Candidates',
          body: 'Juniors focus 90% on prompts and model names. Seniors spend 70% on **data freshness, ACL security pre-filtering, latency/unit-economics math, CI eval gates, and graceful fallbacks when the LLM fails**.',
        },
      ],
      quiz: [
        {
          id: 'q8-1-1',
          question: 'Your team already runs PostgreSQL with complex relational permissions and has 1.5 million document chunks. Which vector store choice usually minimizes operational complexity?',
          options: [
            'Spin up 3 separate clusters immediately',
            '`pgvector` (with HNSW + Postgres `WHERE tenant_id = ...` transactional consistency), migrating to dedicated vector DB only if scale demands it',
            'Store vectors in CSV files on S3',
            'Use localStorage',
          ],
          correctIndex: 1,
          explanation: 'At 1.5M chunks, `pgvector` keeps relational metadata, ACID updates, and permissions in one database with zero sync drift.',
        },
        {
          id: 'q8-1-2',
          question: 'Why does streaming tokens via Server-Sent Events (SSE) dramatically improve UX even when total completion time is 4 seconds?',
          options: [
            'Because SSE shrinks model parameters',
            'Users read the first tokens within ~400ms (TTFT) instead of staring at a blank spinner for 4 seconds',
            'SSE cuts token costs by 90%',
            'SSE eliminates hallucinations',
          ],
          correctIndex: 1,
          explanation: 'Streaming reduces perceived latency from total generation time down to Time To First Token (TTFT).',
        },
        {
          id: 'q8-1-3',
          question: 'In a high-volume support copilot costing $0.04/ticket on a frontier model, how do you slash cost below $0.008/ticket without losing quality on hard cases?',
          options: [
            'Delete the system prompt',
            'Combine FAQ semantic caching + prompt prefix caching + an 8B/mini model router handling 75% simple tickets and escalating only hard cases',
            'Raise temperature to 2.0',
            'Remove evaluation tests',
          ],
          correctIndex: 1,
          explanation: 'Caching + model cascading keeps frontier quality where needed while routing routine traffic to 10× cheaper paths.',
        },
      ],
    },
    {
      id: '8-2',
      moduleId: 'mod-8',
      number: '8.2',
      title: 'End-to-End Data Science Product Case Study',
      subtitle: 'Connect SQL, EDA, feature engineering, XGBoost, threshold profit math, and A/B rollout into one cohesive narrative.',
      durationMinutes: 15,
      track: 'ds',
      prerequisites: ['2.2', '2.4', '3.2', '3.4'],
      objectives: [
        'Solve open-ended Data Science business cases ("Churn jumped 15% — what do you do?" / "Build a churn intervention model").',
        'Translate model output probabilities into incremental lift (Uplift / Treatment Effect) rather than raw risk.',
        'Design an A/B rollout proving true ROI of the ML model over a heuristic baseline.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Case Study: Subscription Churn Prediction & Retention ROI',
          paragraphs: [
            'Imagine a SaaS company asks you to reduce monthly churn. Here is how a top Data Scientist approaches it end-to-end:',
            '**Step 1 — Diagnose First (EDA + SQL)**: Before training any model, slice churn by tenure, plan, acquisition channel, and recent bugs. Is churn driven by Day-7 onboarding dropoff or Month-6 renewal shock? Often 1 SQL query finds a broken checkout flow worth more than any ML model!',
            '**Step 2 — Define Leak-Free Target & Horizon**: Predict churn *30 days ahead* (`observation_window = days -60..-1`, `target_window = days 0..+30`). Group splits by `user_id` and cut strictly by calendar date (`TimeSeriesSplit`).',
            '**Step 3 — Baseline + Tabular Model**: Benchmark a simple logistic regression + RFM (Recency, Frequency, Monetary) heuristic first; then train LightGBM/XGBoost with out-of-fold PR-AUC evaluation and SHAP explainability.',
            '**Step 4 — Business Actionability (Don’t Discount "Sure Things"!)**: Sending a 30% discount to a user who was already 95% likely to stay *loses margin*. Target the **persuadable middle**—or train an **Uplift Model** predicting incremental retention lift—and verify net LTV gain in a randomized A/B test (Control: no email vs Treatment: ML-targeted offer)!',
          ],
        },
        {
          type: 'callout',
          variant: 'key-takeaway',
          title: 'Causal Inference Bonus: When You Cannot Run an A/B Test',
          body: 'Sometimes randomization is impossible (e.g., evaluating impact of an enterprise outage or past policy). Know the core quasi-experimental toolkit: **Difference-in-Differences (DiD)** (compare treatment vs matched control trend before & after), **Propensity Score Matching**, and **Regression Discontinuity (RDD)**.',
        },
      ],
      quiz: [
        {
          id: 'q8-2-1',
          question: 'A stakeholder asks you to investigate why DAU dropped 12% yesterday. What is your FIRST step?',
          options: [
            'Train an XGBoost model immediately',
            'Verify logging/telemetry integrity first, then slice the drop by platform (iOS/Android/Web), country, app version, and new vs returning users to isolate the root cause',
            'Run a 4-week A/B test',
            'Fine-tune an LLM',
          ],
          correctIndex: 1,
          explanation: 'Always check instrumentation/logging first, then segment along key dimensions to isolate whether a bad app deploy or regional outage caused it.',
        },
        {
          id: 'q8-2-2',
          question: 'Why can sending retention discounts to the **top 10% highest churn-risk** users sometimes generate LOWER ROI than targeting medium-risk users?',
          options: [
            'Top-risk users may be "lost causes" who already switched to a competitor and ignore the coupon, whereas persuadable medium-risk users actually stay when nudged',
            'Discounts increase churn mathematically',
            'XGBoost cannot predict medium probabilities',
            'ROC-AUC prevents discounts',
          ],
          correctIndex: 0,
          explanation: 'Targeting by raw risk confuses baseline churn probability with **treatment uplift** (who actually changes behavior because of the offer).',
        },
        {
          id: 'q8-2-3',
          question: 'How do you prove in production that your ML churn model actually makes the company money compared to a simple SQL rule?',
          options: [
            'Show a high training ROC-AUC in a Jupyter notebook',
            'Run an online A/B test comparing Business KPIs (net retained LTV minus incentive cost) between ML-targeted treatment and heuristic/control groups',
            'Check that feature importance sums to 1',
            'Use L1 regularization',
          ],
          correctIndex: 1,
          explanation: 'Offline AUC measures ranking; only a randomized online experiment measures causal net business impact.',
        },
      ],
    },
    {
      id: '8-3',
      moduleId: 'mod-8',
      number: '8.3',
      title: 'Job-Winning Portfolio & Engineering Blueprint',
      subtitle: 'Turn your HTML/CSS visual sense and new Python/AI skills into real interactive products—not dusty notebooks.',
      durationMinutes: 12,
      track: 'core',
      prerequisites: ['8.1', '8.2'],
      objectives: [
        'Leverage your HTML/CSS & product design eye as an unfair hiring advantage ("Product-Minded AI Builder").',
        'Build 3 high-signal portfolio projects with live demos, automated evals, and reproducible benchmarks.',
        'Frame your resume bullets around measurable engineering & statistical impact.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Your Unfair Advantage: HTML/CSS Design Eye + AI = Product-Ready Builder',
          paragraphs: [
            'Thousands of candidates submit identical Titanic/MNIST notebooks that only work on their laptop. Even with just basic HTML/CSS and visual web sense, you understand **how real users interact with a page**—so you can wrap real ML & LLM pipelines in clean, interactive web demos with clear citations, feedback buttons, and readable dashboards!',
            'Build **these 3 flagship projects** (quality over quantity):',
            '**Project 1 — Evaluated Production RAG + Citation Studio**: Hybrid BM25 + Vector + Reranker pipeline with `tenant_id` filtering, live streaming answers with clickable citations, AND a reproducible RAGAS/Faithfulness eval script in GitHub Actions reporting exact scores (`Faithfulness: 0.92, Recall@5: 0.89`).',
            '**Project 2 — End-to-End Tabular ML + Cost-Aware Decision App**: Real public dataset (credit default, telco churn, or Airbnb pricing) using a leak-free Scikit-Learn/LightGBM CV pipeline, Optuna tuning, SHAP explanation view, and threshold profit simulator.',
            '**Project 3 — Specialized Fine-Tuned Small Model OR Tool-Calling Agent**: Either QLoRA fine-tune a 3B–8B model on a focused extraction/classification task proving it matches a frontier model at 15× lower cost, OR build a sandboxed ReAct agent with trace inspection and eval tests.',
          ],
        },
        {
          type: 'code',
          title: 'Step Out of the Browser: 5-Minute Local Setup (macOS / Linux / Windows)',
          language: 'bash',
          code: `# 1. Install Python 3.11+ (python.org) and VS Code (code.visualstudio.com)
# 2. Create an isolated project folder & virtual environment
mkdir my-ai-project && cd my-ai-project
python -m venv .venv

# 3. Activate the environment (macOS/Linux vs Windows PowerShell)
source .venv/bin/activate       # Windows: .venv\\Scripts\\Activate.ps1

# 4. Install the real-world ML/AI Engineer stack!
pip install numpy pandas scikit-learn xgboost lightgbm pydantic openai

# 5. Track your code with Git & push to GitHub for your portfolio
git init && git add . && git commit -m "Initial ML/AI project"`,
          caption: 'Once you finish the in-browser labs, run these 5 commands locally to build your GitHub portfolio projects.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Resume Bullet Formula That Passes Screeners',
          body: 'Use **[Action + Architecture] -> [Measurable Eval/Business Metric]**: *"Built hybrid BM25 + dense RAG search with Cross-Encoder reranking and automated 150-case RAGAS CI evals, lifting Faithfulness from 0.71 to 0.93 while cutting p95 latency 42% via prompt prefix caching."*',
        },
      ],
      quiz: [
        {
          id: 'q8-3-1',
          question: 'What makes an AI Engineer portfolio repo stand out immediately to hiring managers?',
          options: [
            'A single unorganized Jupyter notebook with hardcoded API keys',
            'A working end-to-end architecture with a clean README, architecture diagram, AND a reproducible evaluation benchmark proving quantitative improvements',
            'Using as many buzzword frameworks as possible',
            'Copying a tutorial word for word without tests',
          ],
          correctIndex: 1,
          explanation: 'Hiring managers look for engineering rigor: clean code, clear tradeoffs, and measured evaluation metrics rather than "vibe-checked" demos.',
        },
        {
          id: 'q8-3-2',
          question: 'How does basic HTML/CSS and web UX intuition strengthen an AI Engineering portfolio?',
          options: [
            'It doesn’t matter at all',
            'AI products need clean web interfaces—streaming answers, source citations, human-in-the-loop review buttons, and eval dashboards—turning raw models into usable demos',
            'HTML/CSS replaces Python completely',
            'Only CSS animations are tested in ML interviews',
          ],
          correctIndex: 1,
          explanation: 'Teams love builders who can turn an AI backend into a clean, intuitive interactive web demo that stakeholders and users can test right away.',
        },
        {
          id: 'q8-3-3',
          question: 'Which detail belongs prominently in a Data Science project README?',
          options: [
            'Only training accuracy',
            'Split methodology (preventing leakage), baseline comparison, chosen business metric (e.g. PR-AUC / expected profit), and error analysis',
            'Your favorite font',
            'Raw CSV files committed to git',
          ],
          correctIndex: 1,
          explanation: 'Documenting baseline lift, leak-free validation, and real error analysis demonstrates senior Data Science thinking.',
        },
      ],
    },
    {
      id: '8-4',
      moduleId: 'mod-8',
      number: '8.4',
      title: 'Final Mastery Synthesis & Mock Interview Launchpad',
      subtitle: 'Put your Python, SQL, ML, Transformer, RAG, and System Design skills to the final test.',
      durationMinutes: 14,
      track: 'core',
      prerequisites: ['8.1', '8.2', '8.3'],
      objectives: [
        'Write clean NumPy/Python interview algorithms under time pressure.',
        'Verify readiness across all 8 modules before entering the Practice Arena Mock Interview.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Final Coding Check: Put Vector Math & Evaluation Together',
          paragraphs: [
            'Before jumping into the **Practice Arena** (Full Mock Interview Simulator, Spaced-Repetition Flashcards, and Certificate), pass this final pure-NumPy coding challenge combining information retrieval and ranking evaluation (**Mean Reciprocal Rank — MRR**), a classic AI Engineering interview coding prompt!',
          ],
        },
        {
          type: 'python-lab',
          labId: 'lab-8-4',
          title: 'Final Capstone Lab: Mean Reciprocal Rank (MRR@k) Evaluator',
          prompt:
            'Implement `mean_reciprocal_rank(retrieved_lists, relevant_docs)` where `retrieved_lists` is a list of ranked doc ID lists per query, and `relevant_docs` is a list of the true relevant doc ID for each query. If the relevant doc appears at 1-indexed position `r`, its reciprocal rank is `1 / r` (else `0.0`). Return the mean across all queries.',
          starterCode: `def mean_reciprocal_rank(retrieved_lists: list[list[str]], relevant_docs: list[str]) -> float:
    # For each (retrieved, target) pair:
    # find 1-indexed rank if target in retrieved, add 1/rank else 0
    # return average across queries
    pass

queries_res = [["d2", "d1", "d3"], ["d5", "d4"], ["d9", "d8"]]
targets = ["d1", "d5", "d7"]
print("MRR:", round(mean_reciprocal_rank(queries_res, targets), 4))`,
          testCode: `q = [["d2", "d1", "d3"], ["d5", "d4"], ["d9", "d8"]]
t = ["d1", "d5", "d7"]
mrr = mean_reciprocal_rank(q, t)
expected = (0.5 + 1.0 + 0.0) / 3.0
assert abs(mrr - expected) < 1e-6, f"Expected {expected}, got {mrr}"
assert mean_reciprocal_rank([["a"]], ["a"]) == 1.0
print("PASS: MRR evaluation metric implemented cleanly! Ready for Mock Interviews!")`,
          solutionCode: `def mean_reciprocal_rank(retrieved_lists: list[list[str]], relevant_docs: list[str]) -> float:
    if not retrieved_lists:
        return 0.0
    total = 0.0
    for retrieved, target in zip(retrieved_lists, relevant_docs):
        if target in retrieved:
            rank = retrieved.index(target) + 1
            total += 1.0 / rank
    return total / len(retrieved_lists)`,
          hint: 'Use `zip(retrieved_lists, relevant_docs)` and `retrieved.index(target) + 1` whenever `target in retrieved`.',
          packages: [],
        },
        {
          type: 'callout',
          variant: 'key-takeaway',
          title: 'Next Step: Enter the Practice Arena & Generate Your Certificate',
          body: 'Head to the **Practice Arena** in the top navigation bar to run through timed/rubric-graded **Mock Technical Interviews**, drill **Spaced-Repetition Flashcards**, and claim your **AI Engineer & Data Science Mastery Certificate**!',
        },
      ],
      quiz: [
        {
          id: 'q8-4-1',
          question: 'Across 4 RAG queries, the single ground-truth document appeared at ranks `[1, 2, 4, not found]`. What is the MRR?',
          options: ['0.25', '0.4375', '0.5833', '1.75'],
          correctIndex: 1,
          explanation: '$(1/1 + 1/2 + 1/4 + 0) / 4 = 1.75 / 4 = 0.4375$.',
        },
        {
          id: 'q8-4-2',
          question: 'Which combination best describes production-ready AI Engineering?',
          options: [
            'Writing clever prompts without tests',
            'Typed contracts + Hybrid retrieval + Evals/CI gates + Cost/Latency routing + Continuous observability',
            'Training every model from scratch on 100 GPUs',
            'Replacing SQL with LLMs',
          ],
          correctIndex: 1,
          explanation: 'Production AI Engineering applies disciplined software & systems engineering to probabilistic models.',
        },
      ],
    },
  ],
};
