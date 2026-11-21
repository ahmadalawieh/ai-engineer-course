# AI Mastery Studio — Zero to ML & AI Engineer

A self-contained, interactive course website designed for **complete coding beginners** (requiring only general tech familiarity and basic HTML/CSS)—taking you step-by-step from your first Python loops through Linear Algebra, Interactive SQL, `scikit-learn` & XGBoost, Deep Learning, Transformers/LLMs, Hybrid RAG, Agents, Evals, and Production System Design.

**Live Demo:** https://ai-engineer-course-one.vercel.app/

## Key Features
- **8 Modules · 33 Distilled Lessons**: Zero prior programming required—plain-English explanations bridging from everyday tech and basic HTML/CSS directly to Python and ML/AI mastery, plus a **Plain-English / Formal Math** toggle on every equation.
- **Tap-to-Order Code Puzzles & Auto-Saved Labs**: Mobile-friendly code-order puzzles plus **16 In-Browser Python, `scikit-learn` & Interactive SQL (SQLite) Labs** powered by Pyodide WebAssembly with automatic draft saving.
- **19 Interactive Visual Simulators**: Live matrix transforms, Gradient Descent race, Bayes/Entropy explorer, A/B Test power planner, ROC/cost optimizer, Polynomial Regularization, K-Means, Neural Net decision boundary trainer, 2D Convolution explorer, BPE tokenizer, Attention heatmap, LLM VRAM calculator, Sampling lab, Prompt Injection Red-Team game, Hybrid Search RRF, LoRA savings, ReAct Agent tracer, Unit Economics, and PSI Drift monitor.
- **Practice Arena**: SM-2 spaced-repetition flashcards, Staff-level Mock Technical Interviews with grading rubrics, searchable glossary, and printable Mastery Certificate.
- **Direct & Cloud Cross-Device Sync**:
  1. **Direct Sync (1-Click, Zero Config)** — Instant `#sync=` Direct Sync Link, QR Code, `AIMC1_` Sync Code, JSON backup, plus automatic same-browser cross-tab sync.
  2. **Cloud Sync Key (`/api/sync`)** — Works automatically on Vercel when connected to **Upstash Redis / Vercel KV** (`UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_URL` & `KV_REST_API_TOKEN`).
  3. **Private GitHub Gist Sync** — Zero-server setup using a GitHub Personal Access Token (`gist` scope).

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploying on Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new) (Framework Preset: **Next.js** — zero build config needed).
3. *(Optional for Cloud Sync Key)* In Vercel Project Settings → **Storage / Marketplace**, connect **Upstash Redis** (or add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars) and redeploy. Even without Redis, **GitHub Gist Sync** and **QR / Sync Link** work immediately out of the box.
