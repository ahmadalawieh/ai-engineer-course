# AI Mastery Studio — Program Upgrade Report (Junior → Mid → Senior AI Engineer)

**Date Reviewed / Upgraded:** `2026-11-22`  
**Repository:** `/home/antigravity/ai-engineer-course` (`Next.js 16.4.6` + `React 19` + `TypeScript` + `Pyodide`)

## 1. Executive Summary

AI Mastery Studio was upgraded from a concept-oriented 10-module ML/AI roadmap into a **verifiable, multi-track Junior → Mid → Senior AI Engineering program**. Every level now maps concrete competencies to required lessons, automated timed module exams, runnable real-world capstone starter repositories producing schema-validated `evidence.json` proof artifacts, and rubric-graded engineering scenario/ADR assessments—explicitly paired with honest disclosures explaining that employers grant job titles, not online courses.

## 2. Verified Program Inventory

| Metric | Before Upgrade | Current Verified Total |
| :--- | :---: | :---: |
| Curriculum Modules | 10 (`mod-8`/`mod-9` swapped) | **12** (`mod-0..mod-11`, ordered `0..11`) |
| Total Lessons | 47 | **59** |
| Total Lesson Study Time | ~59.8 hours | **75.3 hours** (`4,520` min prose/lab path; **120–160h** Junior track w/ capstones) |
| Auto-Verified Labs | 145 (`141` Python + `4` SQL) | **194** (`181` lesson labs + `6` job ticket labs + `7` capstone live labs; Python + SQLite SQL) |
| Lesson Quiz Questions | 424 | **520** (`longest=24.3%` across all 59 lessons; deterministic seeded shuffle) |
| Mock Technical Interviews | 64 (`44` Core / `18` Senior / `2` Staff) | **94** (`44` Core / `38` Senior / `12` Staff) |
| Visual Simulators | 19 | **20** (added `CostCalculatorSim`) |
| Capstone Starter Repositories | 6 (self-graded only) | **7** (offline + live adapters + `validator.py` -> `evidence.json`) |
| Flashcards / Glossary | 306 / 207 | **342** flashcards / **231** glossary terms |

## 3. Junior → Mid → Senior Competency Matrix & Honest Bar

| Level | Required Bar | Verified Proof Artifacts | Honest Scope Disclosure |
| :--- | :--- | :--- | :--- |
| **Junior AI Engineer** | Terminal/Git/Python foundations, HTTP/LLM client retries, Hybrid RAG w/ citations, Basic evals (`Recall@k`), FastAPI/Docker packaging (`>=60%` labs, required timed exams `>=70%`) | `proj-churn`, `proj-rag`, `proj-fastapi-docker`, `proj-eval-harness` `evidence.json` + Junior Scenario Review | Realistic timeline: `120–160h` for beginners (`60–90h` for prior software devs). Self-reported checkboxes live locally; external proof comes from public repos + validator outputs. |
| **Mid-Level AI Engineer** | Production Hybrid RAG + ACL pre-filtering, Checkpointed Agents/HITL/MCP, CI regression & judge calibration, OpenTelemetry spans & unit economics, Arabic/multilingual RTL (`>=70%` labs, required exams `>=70%`) | 6 capstones including `proj-agent`, `proj-bilingual`, and `proj-woocommerce-bilingual` `evidence.json` + Mid Scenario ADRs | Exercises realistic production trade-offs and CI evals, preparing engineers for Mid-Level loops while noting employer interviews verify judgment live. |
| **Senior AI Engineer** | Multi-tenant isolation, Cloud VPC/IAM/DLQ queues, Org-wide eval governance & red-teaming, TCO modeling & SLO error budgets, Incident response/postmortems (`>=80%` labs, all 12 exams + 25Q Final `>=70%`) | All **7** capstones `evidence.json` + Senior/Staff Incident & Architecture ADR reviews | **Honest limitation:** No course or automated sandbox replaces real multi-year production ownership, live outage navigation, or cross-team technical leadership. |

## 4. Major Upgrades Completed Across Workstreams

1. **Verifiable Readiness Engine & Migration v3 (Commit `8dac9be`)**
   - Added dated `MODEL_CATALOG` (`src/data/modelCatalog.ts`) indexing capability roles (`small-fast`, `frontier-reasoning`, `embedding`, `reranker`, `multimodal-vision`, `speech-audio`, `local-open-weights`) with explicit `lastReviewed` timestamps (`2026-11-22`).
   - Added `COMPETENCIES`, `LEVEL_PATHS`, `SCENARIO_ASSESSMENTS`, `validateCapstoneEvidence`, `evaluateLevelReadiness`, and `exportEvidencePackMarkdown` (`src/data/levels.ts`).
   - Upgraded `CourseProgress` (`CURRENT_PROGRESS_VERSION = 3`, `src/lib/progress.ts`) preserving existing lesson IDs (`'8-1'`, `'9-1'`, etc.) seamlessly during migration.
   - Added Target Level selector & Competency Matrix on `HomeView.tsx`, and upgraded `PracticeArena.tsx` with **Scenarios & ADRs**, **Evidence Pack**, and gated **Readiness & Report**.

2. **Real Build Track Capstone Starter Kits & 7th Capstone (Commit `dc149f3`)**
   - Built shared real-adapter starter kit (`src/data/capstoneStarterKit.ts`) shipped inside every downloadable `public/capstones/*.zip` supporting both OpenAI-compatible APIs and local Ollama (`localhost:11434`), offline deterministic recorded fixtures (`make test`), and automated `validator.py` checks (`make check`) writing schema-valid `evidence.json`.
   - Fixed `proj-churn` offline classifier fallback (`GradientBoostingClassifier` when XGBoost isn't installed) and offline-safe `proj-fastapi-docker` tests.
   - Added **Capstone 7 (`proj-woocommerce-bilingual`)**: Arabic/English RTL WooCommerce & WhatsApp Support RAG Assistant with ACL pre-filtering, structured order tool calling, and recorded evals.
   - Automated `scripts/audit/test-capstones.mjs` inside `npm run audit` verifying `7/7` generated capstone zips build and pass `make test && make check`.

3. **Applied AI Engineering Expansion & Cost Simulator (Commit `a941d4d`)**
   - Created interactive **`CostCalculatorSim`** (`src/components/simulators/LlmSimulators.tsx`) modeling prefix caching, tier routing, batch API discounts, and monthly SaaS unit economics.
   - Added **Module 10 (`mod-10`: Modern Applied AI Patterns & Multimodal Systems — 6 lessons, 7.8h)** covering Prefix Caching & Batch APIs, Cascading Model Routing, GraphRAG vs Hybrid Vector RAG, Text-to-SQL Safety & Semantic Views, Multimodal Vision/OCR/Speech Pipelines, and MCP & Checkpointed State Graphs.
   - Added **Module 11 (`mod-11`: Production Observability, Governance & Staff Architecture — 6 lessons, 7.8h)** covering OpenTelemetry GenAI Spans & PII Scrubbing, Trajectory Evals & Statistical CI Flywheels, OWASP LLM Security & Threat Modeling, Managed Cloud AI Security & Queues, SLOs/TCO/ADRs/Blameless Postmortems, and Zero-Downtime `MODEL_CATALOG` Swaps.
   - Added **+36** flashcards and **+24** glossary terms covering every newly added applied AI concept.

4. **Learning Tracks, Numbering Hygiene, Quality Audit Gates & Interview Rebalance (`cb75e14`)**
   - Added **Learning Track selector** (`AI Engineer Fast Track` hiding Foundation `mod-0..mod-1`, `AI Engineer Zero-to-Hire`, and `Full Dual-Track`) wired to `progress.learningTrack` with module badges (`Foundation`, `Optional ML Depth`, `Core AI Eng`, `Career & Prep`).
   - Corrected `mod-8` (`number: 8`, `recommendedPath: 'career'`) vs `mod-9` (`number: 9`, `recommendedPath: 'ai-eng'`) ordering and lesson display numbers without mutating underlying lesson IDs.
   - Purged all hardcoded legacy model names (`gpt-4o`, `gpt-4o-mini`, `llama-3`, `text-embedding-3`) outside `src/data/modelCatalog.ts` and added `competencies[]`, `lastReviewed`, failure analysis, and trade-off comparison tables across all `30` `ai-eng` lessons.
   - Expanded mock interviews with **+20 Senior (`iq-65..iq-84`)** and **+10 Staff (`iq-85..iq-94`)** questions across modern Applied AI architecture, FinOps, security, and eval governance.
   - Upgraded `scripts/audit/run-audit.mjs` + `scripts/audit/quality-gates.mjs` (`8` automated gates covering all 59 lessons `>=800` prose words, `>=8` quiz questions, `longest <= 30%`, `ai-eng` tables/competencies/freshness, `MODEL_CATALOG` freshness, and zero hardcoded model names).
   - Rewrote `README.md` with verified counts, Real Build Track local verification instructions, and honest scope disclosures.

5. **Sync API Hardening, E2E Smoke Suite & Final Verification**
   - Created `src/lib/syncValidation.ts` enforcing strict allowlisted keys, string/map bounds, `220 KB` byte limit (`HTTP 413`), and sliding-window IP/key rate limits (`HTTP 429` with `Retry-After`).
   - Hardened `src/app/api/sync/route.ts` + `src/lib/syncClient.ts` to transmit sync keys via `x-sync-key` header instead of URL query strings on `GET` requests, paired with `Cache-Control: no-store`.
   - Added automated Sync API test suite (`scripts/audit/test-sync-api.mjs`) and Playwright E2E smoke test (`tests/e2e/smoke.spec.ts`).

## 5. Verification Status & Known Limitations

- **Stale Knowledge Risk Mitigated (Not Eliminated):** Model snapshots and pricing evolve rapidly. `MODEL_CATALOG` and every `ai-eng` lesson enforce `lastReviewed` timestamps (`2026-11-22`, warning at `>180d`, failing CI at `>365d`) so future maintainers update model examples via a single catalog file.
- **Browser Runtime Boundaries:** In-browser Pyodide execution intentionally uses allowlisted local packages (`numpy`, `pandas`, `scipy`, `scikit-learn`, `sqlite3`, stdlib) with zero browser network calls; real LLM SDK / OpenAI-compatible / Ollama execution happens inside the 7 local Capstone Starter Repositories (`make test` / `make live` / `make check`).
- **Self-Reported Progress Notice:** Client `localStorage` and sync records can be edited locally by a user; credible public verification comes strictly from deployed GitHub repositories, CI logs, and capstone `evidence.json` artifacts.

## 6. Verification Results Executed (`2026-11-22`)

| Command / Suite | Result | Details |
| :--- | :---: | :--- |
| `npm run build:zips` | **PASS** | Built all 7 capstone starter archives (`public/capstones/*.zip`). |
| `npm run audit:ci` | **PASS** | `194/194` Python/SQL labs pass across seeds & starters fail; `0` concept DAG violations; `520` quizzes (`longest=24.3%`, index balance `[82, 111, 83, 66]`); `59/59` lessons clear `>=800` prose words & `>=8` quizzes; `0` disallowed external URLs; vendored Pyodide & sync key checks pass; `7/7` capstone zips pass `make test` + `make check -> evidence.json`; `30/30` `ai-eng` lessons & `7/7` `MODEL_CATALOG` roles pass quality/freshness/hygiene gates; `tsc`, `eslint`, and Next.js production build succeed cleanly. |
| `npx tsc --noEmit && npx eslint` | **PASS** | Zero TypeScript errors, zero ESLint errors/warnings. |
| `node scripts/audit/test-sync-api.mjs` | **PASS** | Verified sync key minimum length (`>=16`), strict `CourseProgress` schema validation (`400`), `GET ?key=` query-param rejection (`400`), oversized payload blocking (`413`), header-key round-trip (`200`), and sliding-window rate limiting (`429` with `Retry-After`). |
| `npx playwright test` | **PASS** | `1 passed (7.2s)` against live production Next.js server (`chromium` headless) testing track switching, target level toggles, Developer Placement Test, Timed Module Exam, live Pyodide Python lab execution on Lesson 1.0, invalid/valid `evidence.json` submission, and Level Readiness Report gating + honest disclosure. |

