# AI Mastery Studio — Basic to Advanced ML & AI Engineer

A self-contained, interactive roadmap designed for **complete coding beginners**—taking you step-by-step from your very first Python variable through Linear Algebra, Interactive SQL, `scikit-learn` & XGBoost, Deep Learning, Transformers/LLMs, Hybrid RAG, Agents, Evals, and Production System Design.

**Live Demo:** https://ai-engineer-course-one.vercel.app/

## Key Features
- **8 Modules · 33 Distilled Lessons**: Zero prior programming required—plain-English explanations from first principles (variables, lists, dictionaries/JSON, loops, SQL), plus a **Plain-English / Formal Math** toggle on every equation.
- **Visual Illustrations & Playable Animated Walkthroughs**: **6 architecture diagrams**, custom editorial hero/workbench artwork, and **5 interactive animated concept reels** (with timeline scrubbers & curated free video deep-dives).
- **6 Tap-to-Order Code Puzzles & 18 Auto-Saved Labs**: Mobile-friendly code-order puzzles plus **18 In-Browser Python, `scikit-learn` & Interactive SQL (SQLite) Labs** (`LEFT JOIN`, `ROW_NUMBER` Window Functions, leak-free ML pipelines) powered by Pyodide WebAssembly.
- **Real Work & Live Projects Workbench**: Learn what hired AI/ML Engineers do Monday–Friday, complete the **5-step Zero-to-Hired Local Setup Checklist**, solve **6 realistic Slack/Jira Workplace Tickets** in Python/SQL, spot bugs in **5 Pull-Request Code Reviews**, debug live **RAG/Agent Traces**, and run **3 Live In-Browser Projects** (interactive UI sandboxes + runnable Pyodide Python labs + multi-file GitHub starter repos).
- **19 Interactive Visual Simulators**: Live matrix transforms, Gradient Descent race, Bayes/Entropy explorer, A/B Test power planner, ROC/cost optimizer, Polynomial Regularization, K-Means, Neural Net decision boundary trainer, 2D Convolution explorer, BPE tokenizer, Attention heatmap, LLM VRAM calculator, Sampling lab, Prompt Injection Red-Team game, Hybrid Search RRF, LoRA savings, ReAct Agent tracer, Unit Economics, and PSI Drift monitor.
- **Practice Arena**: SM-2 spaced-repetition flashcards, **14 Core to Mid-Senior & Staff Mock Technical Interviews** with grading rubrics, searchable glossary, Saved Notes & Bookmarks hub, and printable Mastery Certificate.
- **Google Sign-In & Direct Cross-Device Sync**:
  1. **Google Sign-In Sync** — One-click **"Continue with Google"** OAuth backed by Upstash Redis / Vercel KV (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
  2. **Direct Link / QR / Code (Zero Config)** — Instant `#sync=` Direct Sync Link, QR Code, `AIMC1_` Sync Code, JSON backup, plus automatic same-browser cross-tab sync.
  3. **Cloud Sync Key & Private GitHub Gist** — Sync via custom key or private GitHub Gist (`gist` scope).

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploying on Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new) (Framework Preset: **Next.js** — zero build config needed).
3. *(Optional for Google Login & Cloud Sync)* Connect **Upstash Redis** (`UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`), add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `AUTH_SECRET`, and authorize `https://<your-vercel-domain>/api/auth/google/callback` in Google Cloud Console. Even without server env vars, **Link / QR Sync** and **GitHub Gist Sync** work immediately out of the box.
