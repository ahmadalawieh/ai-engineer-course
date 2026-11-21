# AI Mastery Studio — Basic to Advanced ML & AI Engineer

A self-contained, interactive roadmap designed for **complete coding beginners**—taking you step-by-step from your very first Python variable through Linear Algebra, Interactive SQL, `scikit-learn` & XGBoost, Deep Learning, Transformers/LLMs, Hybrid RAG, Agents, Evals, and Production System Design.

**Live Demo:** https://ai-engineer-course-one.vercel.app/

## Key Features
- **8 Modules · 33 Distilled Lessons**: Zero prior programming required—plain-English explanations from first principles, plus a **Plain-English / Formal Math** toggle on every equation.
- **Tap-to-Order Code Puzzles & Auto-Saved Labs**: Mobile-friendly code-order puzzles plus **16 In-Browser Python, `scikit-learn` & Interactive SQL (SQLite) Labs** powered by Pyodide WebAssembly with automatic draft saving.
- **19 Interactive Visual Simulators**: Live matrix transforms, Gradient Descent race, Bayes/Entropy explorer, A/B Test power planner, ROC/cost optimizer, Polynomial Regularization, K-Means, Neural Net decision boundary trainer, 2D Convolution explorer, BPE tokenizer, Attention heatmap, LLM VRAM calculator, Sampling lab, Prompt Injection Red-Team game, Hybrid Search RRF, LoRA savings, ReAct Agent tracer, Unit Economics, and PSI Drift monitor.
- **Practice Arena**: SM-2 spaced-repetition flashcards, Staff-level Mock Technical Interviews with grading rubrics, searchable glossary, and printable Mastery Certificate.
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
