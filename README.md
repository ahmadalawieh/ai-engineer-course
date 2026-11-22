# AI Mastery Studio — Junior → Mid → Senior AI Engineer Program

An interactive, self-contained **12-module AI Engineering & Machine Learning curriculum** taking learners from absolute zero (terminal, Git, Python, virtual environments) to production **Hybrid RAG**, **Tool-Using & Checkpointed Agents**, **Automated Evals & CI Regression Gates**, **Observability/FinOps**, **Cloud Security & Governance**, and **Evidence-Backed Capstone Repositories**.

## Verified Program Inventory

- **12 Modules · 59 Lessons (~75.3h Lesson Content; ~120–160h Junior Track w/ Capstones)**:
  - **Foundation (`mod-0`, `mod-1`)**: Terminal, Git, Python, JSON, Testing, HTTP & Environment Setup
  - **Optional ML Depth (`mod-2`–`mod-4`)**: SQL, Pandas, A/B Experimentation, Classical ML & PyTorch Neural Networks
  - **Core Applied AI Engineering (`mod-5`–`mod-7`, `mod-9`, `mod-10`, `mod-11`)**: Transformers, Prompting & Structured Outputs, Hybrid RAG + Cross-Encoder Reranking, LoRA/QLoRA, Caching & Arabic/RTL, Checkpointed Agents & MCP, Prompt Prefix Caching & Batch APIs, GraphRAG & Text-to-SQL, Multimodal Vision/OCR/Speech, OpenTelemetry GenAI Spans, Automated Eval Flywheels, Security/OWASP LLM & Threat Modeling, Cloud AI & Queues, SLOs/TCO/ADRs, and Dated `MODEL_CATALOG` Governance
  - **Career & Systems Prep (`mod-8`)**: DSA Patterns, System Design, Behavioral & Interview Communication
- **194 Auto-Verified Labs** (`181` lesson labs across Python + Pyodide `numpy`/`pandas`/`scipy`/`scikit-learn` + SQLite SQL, plus `6` workplace ticket labs and `7` capstone live labs — all executed in CI with `solutionCode` passing and `starterCode` failing)
- **520 Mixed-Type Quiz Questions** (predict-output, spot-bug, multi-select, ordering, numeric, multiple-choice — runtime seeded shuffle)
- **94 Mock Technical Interviews** (`44` Core, `38` Senior, `12` Staff) with structured grading rubrics and follow-up probes
- **342 SM-2 Flashcards · 231 Searchable Glossary Terms · 20 Interactive Simulators** (including `CostCalculatorSim` & unit economics)
- **7 Downloadable Real Build Track Capstone Starter Repos** (`public/capstones/*.zip`), each containing real OpenAI-compatible + local Ollama adapters, offline golden recorded fixtures, unit/smoke tests (`make test`), and an automated validator (`make check`) emitting schema-valid `evidence.json`

## Learning Tracks & Level Readiness

Switch tracks anytime on the home page:
1. **AI Engineer Fast Track**: Skips Foundation (`mod-0`–`mod-1`) via placement or preference and marks Classical ML (`mod-2`–`mod-4`) as *Optional ML Depth*.
2. **AI Engineer Zero-to-Hire**: Complete path from terminal basics through Core Applied AI Engineering.
3. **Full Dual-Track (ML + AI)**: Covers all 12 modules across Classical ML, Deep Learning, and Applied AI Engineering.

Switch target readiness bars anytime:
- **Junior AI Engineer**: Core lessons, >=60% lab completion, required timed module exams (>=70%), foundational deployed capstones (`evidence.json`), and junior scenario review.
- **Mid-Level AI Engineer**: Production RAG, agents/guardrails, CI evals, observability/cost, all core capstones + WooCommerce bilingual assistant, and Mid scenario ADRs.
- **Senior AI Engineer**: Multi-tenant architecture, org-wide eval governance, security/red-teaming, FinOps/TCO, leadership/incidents, all 7 capstones + Staff scenarios (**note:** Senior readiness also requires real-world production engineering and leadership experience outside any course).

## Real Build Track Setup (Local Capstone Verification)

Download any capstone starter zip from **Real Work & Capstones** (or build zips locally with `npm run build:zips`), then verify locally:

```bash
cd proj-<name>
make test          # Runs offline deterministic unit & contract tests
make check         # Runs validator.py and writes evidence.json
# Optional live API verification (with OPENAI_API_KEY or local Ollama):
make live
```

Upload your GitHub repo link and `evidence.json` inside **Practice Arena -> Evidence Pack** to unlock your target **Level Readiness Report** (exported as Markdown).

## What This Course Can and Cannot Give You

- **What this program provides**: Complete technical foundations, runnable Python/SQL drills, real locally runnable capstone starter kits with automated `evidence.json` validators, scenario/ADR practice, and a structured checklist to organize your public portfolio.
- **Honest scope disclosure**: No course grants a job title — job titles come from employers. Browser progress is saved locally (`localStorage`) or via optional sync, so self-reported lesson checkboxes are never tamper-proof credentials on their own; your credible external proof is your public GitHub repositories, live demos, passing CI tests, and validator `evidence.json` artifacts.

## Local Development & Automated Quality Gates

```bash
npm install
npm run dev          # http://localhost:3000
npm run build:zips   # Rebuild public/capstones/*.zip
npm run audit        # Execute 194 labs, DAG check, URL check, 7/7 capstone zips
npm run audit:ci     # Full strict quality audit
npx tsc --noEmit && npx eslint
```

## Deploying on Vercel

1. Push this repository to GitHub and import it in Vercel (Framework Preset: **Next.js**).
2. *(Optional for Cloud / Google Sync)* Connect **Upstash Redis** (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) and configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `AUTH_SECRET` with callback `https://<your-vercel-domain>/api/auth/google/callback`. Even with zero env vars, Link/QR portable sync codes and GitHub Gist sync work out of the box.
