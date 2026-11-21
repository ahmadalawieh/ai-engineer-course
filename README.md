# AI Mastery Studio — Zero to AI Engineer & Data Scientist

A self-contained, interactive dual-track course website taking frontend developers from foundational Python, Linear Algebra, and Statistics through Classical ML, Deep Learning, Transformers/LLMs, Hybrid RAG, Agents, Evals, and Production System Design.

## Key Features
- **8 Modules · 32 Distilled Lessons**: Self-contained explanations bridging from JavaScript/TypeScript intuition directly to AI/ML mastery.
- **In-Browser Python + NumPy Labs**: Powered by Pyodide (WebAssembly) with automated unit-test assertions (`Check Solution`), hints, and solutions.
- **18 Interactive Visual Simulators**: Live matrix transforms, Gradient Descent race, Bayes/Entropy explorer, A/B Test power planner, ROC/cost optimizer, Polynomial Regularization, K-Means, Neural Net decision boundary trainer, 2D Convolution explorer, BPE tokenizer, Attention heatmap, LLM VRAM calculator, Sampling lab, Hybrid Search RRF, LoRA savings, ReAct Agent tracer, Unit Economics, and PSI Drift monitor.
- **Practice Arena**: SM-2 spaced-repetition flashcards, Staff-level Mock Technical Interviews with grading rubrics, searchable glossary, and printable Mastery Certificate.
- **Cross-Device Progress Sync**:
  1. **Cloud Sync Key (`/api/sync`)** — Works automatically on Vercel when connected to **Upstash Redis / Vercel KV** (`UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_URL` & `KV_REST_API_TOKEN`).
  2. **Private GitHub Gist Sync** — Zero-server setup using a GitHub Personal Access Token (`gist` scope).
  3. **Instant QR Code / Sync Link / JSON Backup** — Zero-config portable sync across laptop and phone.

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
