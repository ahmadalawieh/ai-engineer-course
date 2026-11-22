import type { Lesson } from '@/types/course';

export const lesson8_5: Lesson = {
  id: '8-5',
  moduleId: 'mod-8',
  number: '9.5',
  title: 'Resume, GitHub, LinkedIn, Portfolio Strategy & Junior vs Freelance Launch',
  subtitle: 'Transform your deployed capstones into ATS-friendly resumes, 60-second GitHub profiles, targeted LinkedIn outreach, and a clear roadmap for junior full-time vs freelance AI contracts.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['8.4', '9.4'],
  requires: ['free-tier-cloud-deployment', 'oncall-incident-runbooks', 'behavioral-star-stories'],
  teaches: [
    'resume-portfolio-strategy',
    'junior-vs-freelance-launch',
  ],
  objectives: [
    'Write impact-driven AI resume bullets following **[Action Verb + Architecture] -> [Measured Eval/Business Outcome]** instead of vague duty lists.',
    'Configure GitHub pins and LinkedIn profiles to pass the 60-second recruiter & engineering-manager scan.',
    'Select and polish 4–6 deployed, evaluated portfolio capstones (with live URLs, CI evals, READMEs, and Project Journals) that stand out over toy notebooks.',
    'Navigate both **Junior Full-Time AI/ML Roles** and **Freelance / Contract AI Automation** safely (scoping pilots, pricing fixed-fee builds, and avoiding blank-check API liability).',
  ],
  checkWithoutNotes: [
    'Rewrite the weak bullet `"Built an AI RAG chatbot using LangChain and OpenAI"` using the `[Action + Architecture] -> [Measured Outcome]` formula.',
    'Explain why **4–6 deployed, evaluated capstones** outperform `25` forked Titanic/MNIST Jupyter notebooks on a GitHub profile.',
    'Identify the fatal contractual mistake new AI freelancers make when hosting API keys for small business clients.',
    'List the exact 3 steps inside a crisp **60-second GitHub Repo Impression Test** before submitting job applications.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'The Final Bridge: Turning Built Skills Into Signed Offers or Client Contracts',
      paragraphs: [
        'Completing labs and deploying strong capstones only turns into a career when hiring managers and clients actually **see** your engineering rigor in sixty seconds or less. Thousands of beginners finish great tutorials yet submit generic resumes saying *"Familiar with Python, LLMs, Machine Learning; built chatbot using OpenAI"* linking to messy GitHub profiles buried in unrun `Untitled12.ipynb` notebooks. Recruiters pass over those resumes in six seconds.',
        'Your unfair advantage after this course is concrete engineering proof: typed FastAPI services, leak-free Scikit-Learn/XGBoost cross-validation, multi-tenant RAG with CI golden evaluation gates, sandboxed guardrailed tool agents, Docker containers, live deployment links, and Project Journals documenting real failures you fixed. Presenting those artifacts crisply multiplies callback rates across BOTH **junior full-time AI engineering teams** and **independent freelance consulting**.',
        'Treat job hunting and freelance client acquisition just like an engineering funnel: measure conversion rates (applications -> screens -> loops), inspect bottlenecks weekly, tailor project highlights directly to what each team builds, and eliminate friction for anyone reviewing your code.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Landing Page Conversion Optimization for Your Engineering Career',
      frontendConcept: 'Designing an above-the-fold SaaS hero section with clear value prop, live interactive preview, and benchmark proof in 5 seconds',
      aiConcept: 'ATS Resume Bullet Formula + 60-Second GitHub Pin Inspection + Scoped Pilot Contracts',
      explanation:
        'A recruiter opening your resume or GitHub acts identically to a visitor landing on a product homepage: if they cannot spot **what you built, what tech handled scale/safety, and what measurable result improved** in the top five seconds above the fold, they bounce. Crisp metrics and clickable live demos convert attention immediately into interviews.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Rewriting Weak Resumes Into Measurable AI Engineer Bullets',
      paragraphs: [
        'Compare how hiring managers read two versions of the exact same project. **Weak Bullet:** *"Created a customer support AI chatbot with Python, RAG, and vector embeddings."* Zero scale, zero safety awareness, zero measurement! **Strong Bullet:** *"Engineered a multi-tenant hybrid RAG support service (FastAPI, Postgres `pgvector`, BM25 + Cross-Encoder) with tenant ACL pre-filtering and a 60-case golden CI eval gate, improving Recall@5 from `0.68` to `0.91` while capping p95 latency at `780 ms` via Redis caching."*',
        'Notice the exact three-part formula behind every standout bullet: **1) Active Engineering Verb** (`Engineered`, `Architected`, `Automated`, `Reduced`, `Hardened`); **2) Concrete Stack & Guardrail** (`FastAPI`, `XGBoost Stratified CV`, `idempotent DLQ worker`, `per-tenant USD circuit breaker`); **3) Measured Evaluation or Business Outcome** (`Faithfulness 0.71 -> 0.93`, `p95 latency -42%`, `ROC-AUC 0.84` verified across 5 folds, `76%` daily token cost reduction).',
        'Never invent fake employer titles or exaggerate numbers—every metric you list should come genuinely from your own capstone eval scripts, latency logs, or profit simulations so you can explain the exact methodology effortlessly during deep-dive interviews!',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: 60-Second GitHub Pin Strategy & LinkedIn Positioning',
      paragraphs: [
        'Audit your GitHub profile strictly like a hiring manager opening it on a phone between meetings. **Pin your top 4–6 deployed capstones** (never fork clutter or half-finished exercises!). For each pinned repository: write a crisp one-sentence repo description, attach topic tags (`fastapi`, `rag`, `mlops`, `scikit-learn`), place a **Live Demo URL** at the top of the README alongside an ASCII/SVG architecture diagram, include a measured **Evaluations Table**, and add a concise **Project Journal (`docs/JOURNAL.md`)** detailing two real bugs you hit and fixed.',
        'On **LinkedIn**, tune your headline away from passive labels (*"Aspiring AI Enthusiast looking for opportunities"*) toward concrete target value: **"AI Engineer | Python · FastAPI · Hybrid RAG & Evals · Docker | Building Reliable LLM & ML Systems"**. Post short bi-weekly engineering teardowns of what you actually measured in your capstones (for example: *"Benchmarking BM25 + HNSW Reranking vs Naive Chunking: why our eval Recall@5 jumped 23%"*)—concrete teardowns attract direct engineering manager messages far more reliably than reposting generic AI hype threads.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Launching via Junior Full-Time Roles vs Freelance AI Contracts',
      paragraphs: [
        'Your skills unlock two realistic career paths—know the playbook for each. **Path A — Junior / Entry-Level AI, ML, or Python Backend Engineer (Full-Time):** prioritize companies integrating AI into real SaaS workflows (B2B tooling, fintech, healthcare ops, e-commerce support) rather than chasing solely massive frontier research labs requiring PhDs. Apply with tailored resumes mirroring exact job-description keywords (`FastAPI`, `RAG evals`, `Docker`, `SQL`, `CI/CD`), send polite 4-sentence cold notes to engineering managers linking one relevant live capstone demo, and target roles titled *Junior AI Engineer, Applied ML Engineer, Data Scientist, or AI Backend Developer*.',
        '**Path B — Freelance / Contract AI Automation & Consulting:** small businesses eagerly pay `$1,500–$5,000+` for focused scoped pilots—internal document Q&A portals, automated ticket triaging, structured PDF-to-SQL extraction pipelines. Succeed safely with three strict rules: **1) Never put YOUR personal OpenAI/Anthropic API key inside a client production deployment!** Provision credentials under the client’s own billing account with hard spend caps so viral loops never drain your credit card. **2) Price fixed-fee Phase 1 Discovery/MVP Pilots (`2–3 weeks`)** with crystal-clear deliverables (`"85%+ accuracy on 30 agreed test docs"`), plus optional monthly maintenance retainers covering drift/prompt updates. **3) Bake testing, PII redaction, and handoff `RUNBOOK.md` into every contract** so clients trust your engineering professionalism completely and gladly refer future business.',
      ],
    },
    {
      type: 'table',
      title: 'Career Launch Comparison: Junior Full-Time vs Freelance Consulting',
      headers: ['Dimension', 'Junior Full-Time AI/ML Role', 'Freelance / Contract AI Pilot'],
      rows: [
        ['Best Initial Proof', '4–6 live deployed GitHub capstones + CI evals + clean coding screen', '2 niche vertical demos (e.g., legal/support Q&A) + clear ROI calculator'],
        ['How You Get Selected', 'ATS bullet fit + referrals/manager DMs + coding/system design/STAR loop', 'Warm network + discovery call diagnosing manual bottleneck -> scoped proposal'],
        ['Pricing / Compensation', 'Steady salary, mentorship from senior engineers, production scale traffic', 'Fixed-fee milestone pilot (`build_hours * rate * buffer`) + monthly retainer'],
        ['Top Risk to Avoid', 'Spraying 200 identical resumes with notebook-only links and zero evals', 'Open-ended scope creep OR hosting client workloads on your personal API card'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common Career Launch Mistakes & How to Debug Them',
      paragraphs: [
        '1) Linking bare GitHub repos filled solely with `.ipynb` notebooks lacking `README.md`, tests, or deployment instructions: turn top capstones into modular Python packages + FastAPI/Next.js demos runnable via one `docker compose up` command.',
        '2) Applying passively through automated "Easy Apply" buttons 300 times while never sending a single tailored message linking a live relevant project: pairing each top application with a concise note pointing an engineering manager to one matching deployed system dramatically raises interview callbacks.',
        '3) Listing 35 buzzword frameworks on your resume (`AutoGPT, LangChain, CrewAI, Kubernetes, Spark, PyTorch`) when you only touched half of them for ten minutes: interviewers probe the weakest item on your resume! List ONLY technologies you can debug live on a whiteboard.',
        '4) Offering freelance clients unlimited custom changes inside an open-ended fixed price (`"Build whatever AI assistant we imagine for $1,000"`): define exact document count, supported tools, target golden eval set, and out-of-scope boundaries in writing before writing line one.',
        '5) Hosting a freelance client’s production bot on your personal cloud/OpenAI billing account without written spend limits or client-owned keys: always bind client cloud & LLM billing directly under the client’s organization account with hard daily caps and billing alerts.',
        '6) Freezing applications until "every project feels 100% perfect": ship 4 solid evaluated capstones cleanly, begin applying/networking immediately, and iterate weekly based on real interview feedback.',
        '7) Under-preparing short follow-up explanations for every metric listed on your resume: hiring managers routinely pick one bullet (*"How did you compute 0.91 Recall@5 and prevent chunk leakage?"*)—keep every capstone Project Journal, validation split rationale, and eval script crystal clear in memory so you defend every number fluently under live interview questioning.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 9.5 Recap: Launch Your AI Engineering Career',
      body: '- Write every resume bullet using **[Action Verb + Concrete Architecture + Guardrail] -> [Measured Eval or Business Outcome]**.\n- Pin **4–6 deployed, tested capstones** with clickable live URLs, CI eval metrics, READMEs, and Project Journals on GitHub.\n- Target practical SaaS AI/ML/Backend engineering roles or scoped freelance pilots using tailored project evidence and manager outreach.\n- In freelance work: require client-owned LLM billing keys with hard USD caps and clear written acceptance evaluation criteria.\n- Iterate job applications like an engineering funnel—measure callback rates weekly, refine weak bottlenecks, and keep shipping.',
    },
    {
      type: 'python-lab',
      labId: 'lab-8-5-resume',
      difficulty: 'guided',
      requires: ['resume-portfolio-strategy'],
      title: 'Lab 9.5A: AI Resume Bullet Quality Linter',
      prompt:
        'Implement `lint_resume_bullet(bullet: str) -> tuple[bool, list[str]]`: verify an AI engineer bullet meets 4 concrete standards: (1) starts with a strong action verb (`"engineered"`, `"built"`, `"architected"`, `"reduced"`, `"automated"`, `"hardened"`, `"designed"`, `"deployed"` case-insensitive); (2) contains at least one quantified numeric/eval signal (regex `\\d+(\\.\\d+)?\\s*(%|ms|s|x|gb|mb|usd|\\$|auc|f1|recall|mrr|cases|folds)` case-insensitive OR `$\\d+`); (3) word count between `10` and `45` inclusive; (4) avoids weak filler phrases (`"helped with"`, `"worked on"`, `"responsible for"`). Return `(len(issues) == 0, issues)`.',
      starterCode: `import re

STRONG_VERBS = {"engineered", "built", "architected", "reduced", "automated", "hardened", "designed", "deployed"}

def lint_resume_bullet(bullet: str) -> tuple[bool, list[str]]:
    # Check action verb start, numeric metric, word count 10..45, and no weak filler phrases
    pass`,
      testCode: `good = "Engineered hybrid BM25 and pgvector RAG service with CI evals, raising Recall from 0.68 to 0.91 across 60 cases at 780 ms p95."
ok, issues = lint_resume_bullet(good)
assert ok is True and issues == [], f"Unexpected issues: {issues}"
weak = "Responsible for worked on an AI chatbot using OpenAI."
ok2, issues2 = lint_resume_bullet(weak)
assert ok2 is False and len(issues2) >= 3
print("PASS: Resume bullet linter enforced strong action verbs, metrics, conciseness, and zero filler!")`,
      solutionCode: `import re

STRONG_VERBS = {"engineered", "built", "architected", "reduced", "automated", "hardened", "designed", "deployed"}

def lint_resume_bullet(bullet: str) -> tuple[bool, list[str]]:
    issues: list[str] = []
    words = [w for w in bullet.strip().split() if w]
    first = re.sub(r"[^a-z]", "", words[0].lower()) if words else ""
    if first not in STRONG_VERBS:
        issues.append("weak_opening_verb")
    has_metric = bool(re.search(r"(\\$\\s*\\d+|\\d+(?:\\.\\d+)?\\s*(?:%|ms|s|x|gb|mb|usd|auc|f1|recall|mrr|cases|folds))", bullet, re.I))
    if not has_metric:
        issues.append("missing_quantified_metric")
    if not (10 <= len(words) <= 45):
        issues.append("bad_word_length")
    low = bullet.lower()
    for bad in ("helped with", "worked on", "responsible for"):
        if bad in low:
            issues.append(f"weak_phrase:{bad}")
            break
    return len(issues) == 0, issues`,
      hint: 'Check lowercased first word against `STRONG_VERBS`, regex-match numeric metric suffixes (`%`, `ms`, `cases`, etc.) or `$`, enforce `10 <= len(words) <= 45`, and scan forbidden filler phrases.',
      hints: [
        'Clean punctuation off `words[0].lower()` before checking `STRONG_VERBS`.',
        'Match numeric measurements such as `780 ms`, `60 cases`, `23%`, or `$0.002`.',
        'Flag bullets shorter than 10 words or longer than 45 words alongside filler phrases.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-5-freelance',
      difficulty: 'spec',
      requires: ['junior-vs-freelance-launch'],
      title: 'Lab 9.5B: Scoped Freelance AI Pilot Pricing & Client-Key Guard',
      prompt:
        'Implement `quote_freelance_pilot(dev_hours: float, hourly_rate: float, risk_buffer_pct: float, monthly_api_usd_est: float, client_owns_api_key: bool) -> dict`: raise `ValueError` if `not client_owns_api_key` (never host client production workloads on your own personal API card!) or if `dev_hours <= 0` or `hourly_rate <= 0`. Otherwise compute `pilot_fee_usd = round(dev_hours * hourly_rate * (1.0 + risk_buffer_pct / 100.0), 2)`, `recommended_daily_cap_usd = round((monthly_api_usd_est / 30.0) * 2.0, 2)` (2x daily headroom safety cap), and `monthly_retainer_usd = round(max(300.0, pilot_fee_usd * 0.15), 2)`. Return those three keys in a dict.',
      starterCode: `def quote_freelance_pilot(dev_hours: float, hourly_rate: float, risk_buffer_pct: float, monthly_api_usd_est: float, client_owns_api_key: bool) -> dict:
    # Enforce client_owns_api_key=True, compute buffered pilot_fee_usd, daily spend cap, and monthly retainer
    pass`,
      testCode: `try:
    quote_freelance_pilot(40, 75, 20, 150, client_owns_api_key=False)
    raise AssertionError("Should reject personal API key hosting!")
except ValueError:
    pass
q = quote_freelance_pilot(40, 75, 20, 150, client_owns_api_key=True)
assert q["pilot_fee_usd"] == 3600.0
assert q["recommended_daily_cap_usd"] == 10.0
assert q["monthly_retainer_usd"] == 540.0
print("PASS: Freelance pilot quoter enforced client-owned billing keys, risk buffer, and daily caps!")`,
      solutionCode: `def quote_freelance_pilot(dev_hours: float, hourly_rate: float, risk_buffer_pct: float, monthly_api_usd_est: float, client_owns_api_key: bool) -> dict:
    if not client_owns_api_key:
        raise ValueError("Client must own and fund their own upstream LLM API key")
    if dev_hours <= 0 or hourly_rate <= 0:
        raise ValueError("dev_hours and hourly_rate must be positive")
    pilot_fee = round(dev_hours * hourly_rate * (1.0 + risk_buffer_pct / 100.0), 2)
    daily_cap = round((monthly_api_usd_est / 30.0) * 2.0, 2)
    retainer = round(max(300.0, pilot_fee * 0.15), 2)
    return {
        "pilot_fee_usd": pilot_fee,
        "recommended_daily_cap_usd": daily_cap,
        "monthly_retainer_usd": retainer,
    }`,
      hint: 'Validate `client_owns_api_key` and positive rates/hours first, then compute `pilot_fee = dev_hours * hourly_rate * (1 + risk_buffer_pct / 100)`, `daily_cap`, and `retainer`.',
      hints: [
        'Raise `ValueError` immediately when `client_owns_api_key` is `False`.',
        'Buffer pilot labor hours by `(1.0 + risk_buffer_pct / 100.0)` for edge-case eval polishing and handoff docs.',
        'Compute `recommended_daily_cap_usd = round((monthly_api_usd_est / 30.0) * 2.0, 2)` and `max(300.0, pilot_fee * 0.15)`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-5-portfolio',
      difficulty: 'debug',
      requires: ['free-tier-cloud-deployment', 'oncall-incident-runbooks'],
      title: 'Lab 9.5C: Fix Toy-Notebook Trap in Portfolio Readiness Scorer',
      prompt:
        'A broken portfolio evaluator `is_portfolio_hire_ready(projects: list[dict]) -> tuple[bool, int]` approves candidates merely for having `>= 4` total repos—even if every repo is a bare Jupyter notebook lacking a live deployment, tests, evals, or README! Fix it cleanly: count ONLY projects where ALL four boolean fields (`"has_live_url"`, `"has_tests"`, `"has_eval_metrics"`, `"has_readme"`) are `True`. Return `(qualified_count >= 4, qualified_count)`.',
      starterCode: `def is_portfolio_hire_ready(projects: list[dict]) -> tuple[bool, int]:
    # BUG: counts bare notebooks without live URL, tests, evals, or README!
    count = len(projects)
    return count >= 4, count`,
      testCode: `strong = {"has_live_url": True, "has_tests": True, "has_eval_metrics": True, "has_readme": True}
notebook = {"has_live_url": False, "has_tests": False, "has_eval_metrics": False, "has_readme": True}
ok1, cnt1 = is_portfolio_hire_ready([strong]*3 + [notebook]*10)
assert ok1 is False and cnt1 == 3, f"10 notebooks shouldn't pad to ready! Got {(ok1, cnt1)}"
ok2, cnt2 = is_portfolio_hire_ready([strong]*4 + [notebook])
assert ok2 is True and cnt2 == 4
print("PASS: Portfolio readiness check rewarded 4 deployed evaluated apps over 10 notebooks!")`,
      solutionCode: `def is_portfolio_hire_ready(projects: list[dict]) -> tuple[bool, int]:
    qualified = sum(
        1
        for p in projects
        if p.get("has_live_url")
        and p.get("has_tests")
        and p.get("has_eval_metrics")
        and p.get("has_readme")
    )
    return qualified >= 4, qualified`,
      hint: 'Filter `projects` strictly requiring all four flags (`has_live_url`, `has_tests`, `has_eval_metrics`, `has_readme`) to be `True`, then check `qualified >= 4`.',
      hints: [
        'Use `sum(1 for p in projects if p.get("has_live_url") and ...)` checking all 4 production criteria.',
        'Ignore toy notebooks missing any of the 4 criteria even if total repo count is high.',
        'Return `(qualified >= 4, qualified)`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q8-5-1',
      type: 'multiple-choice',
      question: 'Which resume bullet is strongest for a Junior AI Engineer applying to B2B SaaS roles?',
      options: [
        '"Enthusiastic learner passionate about artificial intelligence and prompt magic."',
        '"Installed Python, Pandas, and OpenAI SDK inside Visual Studio Code locally."',
        '"Built hybrid BM25+pgvector RAG API with CI golden evals, lifting Recall@5 0.68->0.91"',
        '"Forked ten popular ML Kaggle notebooks including Titanic survival classification."',
      ],
      correctIndex: 2,
      explanation: 'Strong bullets pair an active engineering verb + concrete production architecture/guardrail + measurable eval or business lift.',
    },
    {
      id: 'q8-5-2',
      type: 'multiple-choice',
      question: 'Why do **4–6 deployed, evaluated GitHub capstones** outperform `25` forked Jupyter notebooks when hiring managers scan your profile?',
      options: [
        'Live demos, CI evals, and clear READMEs prove end-to-end production rigor in 60 seconds',
        'Because GitHub profiles automatically hide any repository created using Python 3.11',
        'Because hiring managers penalize candidates whose GitHub accounts have over ten stars',
        'Because Jupyter notebooks cannot legally import Pandas inside free cloud tiers',
      ],
      correctIndex: 0,
      explanation: 'Managers spend under two minutes per profile—4–6 polished, deployed, tested apps prove real job-readiness immediately.',
    },
    {
      id: 'q8-5-3',
      type: 'spot-bug',
      question: 'A new freelance AI developer deploys a document chatbot for a client using the developer’s own personal OpenAI API key inside server env vars. What critical risk did they create?',
      options: [
        'Client users cannot send prompts unless the developer commits `.env` publicly onto GitHub',
        'OpenAI models refuse JSON structured output responses whenever commercial keys run locally',
        'The developer personally pays for runaway client usage or accidental webhook loops indefinitely',
        'FastAPI CORS middleware rejects HTTP POST calls unless keys start with client company names',
      ],
      correctIndex: 2,
      explanation: 'Never put your personal API/cloud billing key in a client’s production service—always provision keys under the client’s own account with spend caps.',
    },
    {
      id: 'q8-5-4',
      type: 'numeric',
      question: 'If a freelance pilot quotes `40` dev hours at `$60/hr` with a `25%` engineering risk buffer, what is the fixed pilot fee in USD?',
      options: [],
      correctIndex: 0,
      correctNumber: 3000,
      tolerance: 1,
      unit: 'USD',
      explanation: '$40 \\times 60 \\times 1.25 = \\$2{,}400 \\times 1.25 = \\$3{,}000$.',
    },
    {
      id: 'q8-5-5',
      type: 'multi-select',
      question: 'Select the TWO high-leverage habits that turn passive job applications into real technical interview screens.',
      options: [
        'Tailoring resume bullets to match exact engineering stack + sharing a live matching capstone demo link',
        'Writing clean 60-second READMEs featuring architecture, eval metrics, and a Project Journal of real bugs fixed',
        'Listing 30 unverified buzzwords you cannot debug or explain when asked follow-ups',
        'Clicking 400 generic "Easy Apply" buttons with zero link to any deployed working software',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Evidence-backed outreach + 60-second readable deployed repos convert dramatically higher than buzzword-stuffed mass applies.',
    },
    {
      id: 'q8-5-6',
      type: 'ordering',
      question: 'Order the **4-Step Freelance AI Pilot Lifecycle** cleanly from FIRST client contact to ongoing revenue.',
      items: [
        'Run discovery call diagnosing manual bottleneck and agree on 30-doc golden test targets',
        'Require client-owned LLM API account + daily USD spend cap before building',
        'Deliver fixed-fee Phase 1 MVP with tests, CI eval score, and handoff `RUNBOOK.md`',
        'Transition smoothly into a recurring monthly maintenance & eval monitoring retainer',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Align on scoped eval acceptance -> secure client billing keys -> deliver tested pilot -> offer steady monthly retainer.',
    },
    {
      id: 'q8-5-7',
      type: 'predict-output',
      question: 'A junior candidate lists `Kubernetes` on their resume after running one tutorial command once, and an interviewer asks them to debug a `CrashLoopBackOff` probe failure. What usually happens?',
      options: [
        'The interviewer skips technical follow-ups automatically out of resume politeness',
        'Getting exposed on shallow buzzwords erodes credibility across the entire interview',
        'LinkedIn ATS algorithms grant bonus ranking points purely for unused keyword count',
        'Docker Compose silently converts all Kubernetes YAML errors into passing health probes',
      ],
      correctIndex: 1,
      explanation: 'Every skill line on your resume is fair game for deep debugging questions—keep strictly skills you have truly built and debugged.',
    },
    {
      id: 'q8-5-8',
      type: 'multiple-choice',
      question: 'Why does documenting a **Project Journal** ("what broke and how I fixed it") inside your capstone repo impress engineering managers?',
      options: [
        'Because companies prefer hiring candidates whose prototypes crash nonstop in production',
        'Because project journals replace automated `pytest` suites completely inside GitHub Actions',
        'Because long markdown essays automatically boost FastAPI HTTP throughput by 50%',
        'Real debugging tradeoffs (`leakage fixed`, `eval recall jump`) prove authentic engineering ownership',
      ],
      correctIndex: 3,
      explanation: 'Anyone can copy boilerplate code; clearly explaining real failures you diagnosed and measured proves genuine ownership.',
    },
    {
      id: 'q8-5-9',
      type: 'multiple-choice',
      question: 'Which types of full-time roles offer the smoothest entry ramp for graduates transitioning from beginner to hireable AI Engineer?',
      options: [
        'Applied AI / ML / Python Backend teams at B2B SaaS startups building product workflows',
        'Exclusively trillion-parameter pretraining kernel teams requiring PhD publication records',
        'Roles requiring zero Python coding where spreadsheets manually simulate vector embeddings',
        'Unpaid vague internships promising equity only with zero code reviews or mentorship',
      ],
      correctIndex: 0,
      explanation: 'Applied AI and SaaS product engineering teams actively hire strong Python + RAG + ML + FastAPI builders who ship reliable evaluated systems.',
    },
  ],
};
