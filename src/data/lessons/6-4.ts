import type { Lesson } from '@/types/course';

export const lesson6_4: Lesson = {
  id: '6-4',
  moduleId: 'mod-6',
  number: '6.4',
  title: 'Fine-Tuning vs RAG vs Prompting: LoRA & QLoRA Engineering',
  subtitle: 'Know when NOT to fine-tune, design high-signal SFT datasets without eval leakage, and compute exact LoRA/QLoRA parameter and VRAM savings.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['1.4', '5.3', '6.3'],
  requires: ['matrices', 'svd-pca', 'rag-citations'],
  teaches: [
    'rag-vs-finetune',
    'lora-qlora',
    'sft-datasets',
  ],
  competencies: ['mid-hybrid-rag', 'sr-sys-architecture'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Apply the Senior Escalation Ladder to choose cleanly between Prompting, RAG, and Fine-Tuning.',
    'Derive LoRA ($W = W_0 + \\frac{\\alpha}{r} B A$) parameter counts and QLoRA (4-bit NF4 base + BF16 adapters) VRAM budgets explicitly.',
    'Prepare clean Supervised Fine-Tuning (SFT) JSONL datasets, enforce exact train/eval split deduplication, and prevent catastrophic forgetting.',
    'Merge trained LoRA adapters into base weights cleanly for zero-latency inference or hot-swap tenant adapters.',
  ],
  checkWithoutNotes: [
    'Your company updates its 4,000-page pricing manual daily—why is RAG strictly superior to LoRA fine-tuning here?',
    'When DOES fine-tuning shine over prompting or RAG (give two concrete engineering scenarios)?',
    'Compute how many trainable parameters a rank $r = 16$ LoRA adapter adds to one $4096 \\times 4096$ linear projection matrix.',
    'How does QLoRA fit large 70B-class models onto a single GPU when full 16-bit fine-tuning cannot?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'One of the costliest mistakes junior teams make is jumping straight to fine-tuning a language model before checking whether prompting or RAG already solves the problem. Fine-tuning requires collecting curated training pairs, provisioning GPU compute, running hyperparameter sweeps, guarding against regressions on general reasoning (**catastrophic forgetting**), and maintaining custom hosted endpoints instead of calling managed APIs.',
        'Yet in the *right* situations—teaching strict domain output styles, cutting inference cost and latency by distilling a slow frontier model into a small open-weights `7B–8B` model, or adapting speech/domain jargon—**LoRA** and **QLoRA** transform fine-tuning from a multi-node cluster project into a reproducible single-GPU workflow. Knowing *when* to escalate and *how* to size VRAM, rank $r$, $\\alpha$ scaling, and clean SFT datasets separates disciplined AI engineers from hype followers.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: The Escalation Ladder & Low-Rank Sticky Notes',
      paragraphs: [
        'Follow the **Escalation Ladder** strictly before touching GPU training. **Rung 1 — Prompting + Few-Shot + Evals:** Always establish a fast baseline in hours using clear instructions, JSON Schemas, and 3–5 concrete examples measured against a golden eval set. **Rung 2 — Production RAG:** When errors stem from **missing, private, or changing knowledge** (live pricing, HR policies, new API docs, verifiable citations), add hybrid RAG! Fine-tuning stores statistical associations in weights slowly and cannot cleanly erase yesterday\'s price.',
        '**Rung 3 — Supervised Fine-Tuning (LoRA / QLoRA):** Escalate to fine-tuning when your problem is **consistent behavior, ultra-strict formatting, domain tone, or distillation**. For example, suppose a large frontier model nails your JSON extraction task at 600 ms latency and high per-token cost; capturing 2,000 verified input/output traces lets you fine-tune an open `8B` model matching that accuracy locally or in dedicated serving with much lower latency and unit cost.',
        'Why does **LoRA (Low-Rank Adaptation)** train under `1%` of parameters yet match full fine-tuning on many tasks? Imagine a giant 4096×4096 textbook ($W_0$) frozen behind glass. Rather than reprinting all 16.7 million words inside Adam optimizer memory, LoRA attaches two slender translucent overlay sheets: $B \\in \\mathbb{R}^{4096 \\times r}$ and $A \\in \\mathbb{R}^{r \\times 4096}$ with tiny rank $r = 16$. Only $B$ and $A$ receive gradients and Adam moments! **QLoRA** goes one step further by compressing frozen base $W_0$ down to **4-bit NormalFloat (NF4)** (~`0.5` bytes per param instead of `2` bytes in `BF16`), dequantizing blocks on the fly while keeping gradients and adapters crisp in `BF16`.',
      ],
    },
    {
      type: 'math',
      title: 'LoRA (Low-Rank Adaptation)',
      latex: 'W = W_0 + \\Delta W = W_0 + \\frac{\\alpha}{r} B A \\qquad W_0 \\in \\mathbb{R}^{d \\times k},\\; B \\in \\mathbb{R}^{d \\times r},\\; A \\in \\mathbb{R}^{r \\times k}',
      breakdown: [
        { symbol: 'W_0', meaning: 'Frozen pretrained weights (zero optimizer states needed!)' },
        { symbol: 'r \\ll \\min(d, k)', meaning: 'Adapter rank (e.g. $r=8$ or $16$), shrinking trainable parameters by >99% per targeted layer' },
        { symbol: '\\frac{\\alpha}{r}', meaning: 'Constant adapter scaling factor so tuning $r$ preserves step magnitude' },
      ],
      intuition:
        'Initialize $A$ with small Gaussian noise and $B = 0$ so $\\Delta W = B A = 0$ at step 0—meaning training starts from the exact uncorrupted pretrained model behavior! After training, pre-computing $W_{\\text{merged}} = W_0 + \\frac{\\alpha}{r} B A$ adds **zero extra inference latency**.',
    },
    {
      type: 'simulator',
      simulatorId: 'lora-rank',
      title: 'Interactive Lab: LoRA Parameter & QLoRA VRAM Savings Explorer',
      description:
        'Adjust base model size, rank $r$, and target modules (Attention Q/V vs All Linear layers) to compare full fine-tuning vs LoRA vs QLoRA trainable parameter counts and GPU memory.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Exact Parameter & VRAM Sizing Math',
      paragraphs: [
        'Always verify memory arithmetic before renting a cloud GPU! Take a `7B` parameter model (`7e9` weights) trained in full `BF16` (`2` bytes/param): weights alone take `14 GB`, gradients take `14 GB`, and AdamW (`m`, `v`, plus FP32 master copy = `12` bytes/param) eats `84 GB`—already `112 GB` before activations! That crashes an `80 GB` A100 instantly.',
        'Switch to **QLoRA**: frozen 4-bit base weights (`0.5` bytes/param + tiny quantization metadata ≈ `0.55` bytes/param) use roughly `3.85 GB`, while training `~0.8%` (`~56M`) LoRA adapter weights in `BF16` + Adam adds well under `1 GB` for parameters/optimizer—leaving massive headroom for batch activations on a single `24 GB` consumer/workstation GPU!',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Exact LoRA Layer Parameter Count & Weight Merging Verification',
      language: 'python',
      code: `import numpy as np

d_in, d_out, r, alpha = 4096, 4096, 16, 32
base_params = d_in * d_out
lora_params = (d_in * r) + (r * d_out)
pct = 100.0 * lora_params / base_params
print(f"Base params: {base_params:,} | LoRA params (r={r}): {lora_params:,} ({pct:.2f}%)")

# Numerical check: merged inference equals unmerged forward output exactly!
rng = np.random.default_rng(7)
W0 = rng.normal(scale=0.1, size=(6, 4))
B = rng.normal(scale=0.1, size=(6, 2))
A = rng.normal(scale=0.1, size=(2, 4))
x = rng.normal(size=(3, 6))
scale = 32 / 2

y_unmerged = (x @ W0) + scale * ((x @ B) @ A)
W_merged = W0 + scale * (B @ A)
y_merged = x @ W_merged
print("Max diff unmerged vs merged:", float(np.max(np.abs(y_unmerged - y_merged))))`,
      caption: 'Explained output: `Base params: 16,777,216 | LoRA params (r=16): 131,072 (0.78%)` and `Max diff unmerged vs merged: ~1e-16` (machine precision zero!). Pre-merging yields mathematically identical predictions at zero runtime overhead.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: High-Signal SFT Data Curation, Hyperparameters & Multi-Adapter Serving',
      paragraphs: [
        'Fine-tuning fails far more often from noisy training data than suboptimal rank $r$. Every training record in Supervised Fine-Tuning (SFT) JSONL must follow clean chat-turn structure (`messages` containing `"system"`, `"user"`, and `"assistant"`), feature verified high-quality target replies, and mask Cross-Entropy loss strictly onto `"assistant"` tokens so model capacity goes purely toward accurate output generation rather than memorizing user prompts. Equally critical: **deduplicate exact and near-identical prompts across train and held-out evaluation splits** before starting GPU runs—even 5% leakage makes validation metrics look deceptively strong while hiding overfitting!',
        'When choosing practical LoRA hyperparameters, start from well-proven defaults before sweeping blindly: attach adapters to **all linear projections** (`q_proj`, `k_proj`, `v_proj`, `o_proj`, plus MLP `gate`/`up`/`down_proj`) rather than `Q/V` attention alone when matching complex formatting or reasoning; pick moderate rank **`r = 8` or `16`** with **`alpha = 2 * r`** (`16` or `32`); use small learning rates around **`1e-4` to `2e-4`** with cosine decay and `5%` warmup; and track held-out eval loss every fraction of an epoch to stop before overfitting.',
        'At deployment time, LoRA unlocks two distinct serving architectures. If you ship **one specialized distilled model**, fold $W_{\\text{merged}} = W_0 + \\frac{\\alpha}{r} B A$ offline once so runtime serving runs at full native speed with **zero adapter overhead**. Conversely, if you host 20 enterprise customers needing different tone/schema styles on one GPU, keep base $W_0$ frozen in GPU memory and hot-swap tiny `~20–80 MB` LoRA adapters dynamically per request (**multi-LoRA serving**)—serving twenty specialized models from one base GPU footprint!',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Fine-tuning to inject rapidly changing facts (inventory, daily prices, org charts):** Weights absorb static knowledge noisily and cannot easily forget stale facts when policies update. Use RAG with citations instead!',
        '**Mistake 2 — Initializing BOTH `A` and `B` to zero:** If `A = 0` AND `B = 0`, gradients on both vanish to zero (`0 * x = 0`) and training stays frozen! Initialize `A` randomly (small Gaussian) and `B = 0` so `B @ A == 0` at step 0 while gradients flow straight into `B` on step 1.',
        '**Mistake 3 — Computing loss over `"user"` prompt tokens too:** Letting Cross-Entropy score prompt tokens wastes model capacity memorizing system instructions instead of focusing purely on generating valid assistant replies.',
        '**Mistake 4 — Forgetting to mix general replay data during narrow SFT:** Training 100% on short JSON labels can degrade open-ended conversation quality unless a small fraction of diverse instruction examples stays in the training mix.',
        '**Mistake 5 — Running 10 epochs blindly when training loss hits 0.05:** Overfitting small SFT datasets memorizes exact training phrasings while hurting held-out generalization and instruction adherence! Track validation loss and downstream task accuracy every 50–100 optimizer steps, keep SFT runs short (`1–3` epochs typically), and activate **gradient checkpointing** if activation memory spikes on long contexts.',
        '**Mistake 6 — Guessing LoRA helped without running the identical golden eval suite:** Never eyeball five cherry-picked completions to declare a fine-tune successful. Evaluate the merged adapter side-by-side against your baseline prompt and RAG pipeline across the exact same held-out accuracy, latency, and USD cost benchmarks before shipping.',
        '**Mistake 7 — Confusing Supervised Fine-Tuning (SFT) with Preference Alignment (DPO):** SFT teaches *demonstrations* (prompt -> desired answer), whereas **Direct Preference Optimization (DPO)** teaches pairwise *preferences* (`chosen` answer vs `rejected` answer) to suppress subtle verbosity, unwanted refusals, or formatting quirks once an SFT checkpoint already generates strong responses. Always save immutable adapter checkpoints tagged with the exact dataset commit hash.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Prompting vs RAG vs LoRA/QLoRA Fine-Tuning',
      headers: ['Approach', 'Best Problem Fit', 'Update Speed', 'Operational Complexity'],
      rows: [
        ['Prompting + Few-Shot', 'General logic, classification, schema baseline', 'Minutes (edit string + eval)', 'Lowest (zero training or model hosting)'],
        ['Hybrid RAG + Citations', 'Private, live, or frequently changing facts', 'Seconds (re-index updated docs)', 'Medium (chunking, vector + BM25 index, evals)'],
        ['LoRA / QLoRA SFT', 'Strict style/format, domain jargon, latency distillation', 'Hours (curate JSONL + GPU run)', 'High (leak-free dataset curation, replay mix, eval gates)'],
        ['Full Fine-Tuning', 'Deep continual pretraining or heavy shift', 'Days across multi-GPU clusters', 'Highest (16 bytes/param VRAM, catastrophic forgetting risk)'],
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Follow the Escalation Ladder:** Prompt + Evals -> RAG (knowledge) -> Fine-Tuning (style, format, latency/cost distillation).',
        '2. **LoRA slashes trainable params & Adam VRAM:** Only tiny low-rank matrices $B \\in \\mathbb{R}^{d \\times r}$ and $A \\in \\mathbb{R}^{r \\times k}$ update while $W_0$ stays frozen.',
        '3. **QLoRA quantizes frozen weights to 4-bit NF4:** Shrinking base RAM ~4× unlocks large-model tuning on single GPUs.',
        '4. **Merge adapters for zero inference lag:** Precompute $W_{\\text{merged}} = W_0 + \\frac{\\alpha}{r} B A$ before serving single-adapter models.',
        '5. **Curate leak-free SFT data:** Deduplicate across train/eval splits, mask loss onto assistant replies, and include general replay data.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-4-1',
      difficulty: 'guided',
      requires: ['lora-qlora', 'matrices'],
      title: 'Lab 6.4.1 (Guided): LoRA Adapter Math & Zero-Latency Merge',
      prompt:
        'Implement two helpers for linear shape `(d_in, d_out)` (where `x` has shape `(batch, d_in)`): 1) `lora_param_stats(d_in, d_out, r)` returning `{"base": d_in*d_out, "lora": (d_in*r) + (r*d_out), "ratio": lora / base}`. 2) `merge_lora_weights(W0, B, A, alpha, r)` returning merged matrix `W0 + (alpha / r) * (B @ A)` (where `B` is `(d_in, r)` and `A` is `(r, d_out)`).',
      starterCode: `import numpy as np

def lora_param_stats(d_in: int, d_out: int, r: int) -> dict[str, float]:
    pass

def merge_lora_weights(W0: np.ndarray, B: np.ndarray, A: np.ndarray, alpha: float, r: int) -> np.ndarray:
    pass`,
      testCode: `import numpy as np
stats = lora_param_stats(4096, 4096, 16)
assert stats["base"] == 16_777_216
assert stats["lora"] == 131_072
assert abs(stats["ratio"] - (131_072 / 16_777_216)) < 1e-8

rng = np.random.default_rng(42)
W0 = rng.normal(size=(8, 4))
B = rng.normal(size=(8, 2))
A = rng.normal(size=(2, 4))
x = rng.normal(size=(5, 8))
Wm = merge_lora_weights(W0, B, A, alpha=16.0, r=2)
expected = (x @ W0) + (16.0 / 2) * ((x @ B) @ A)
assert np.allclose(x @ Wm, expected), "Merged weights mismatch unmerged output!"
print("PASS: Lab 6.4.1 LoRA param & weight merge passed!")`,
      solutionCode: `import numpy as np

def lora_param_stats(d_in: int, d_out: int, r: int) -> dict[str, float]:
    base = d_in * d_out
    lora = (d_in * r) + (r * d_out)
    return {"base": base, "lora": lora, "ratio": lora / base}

def merge_lora_weights(W0: np.ndarray, B: np.ndarray, A: np.ndarray, alpha: float, r: int) -> np.ndarray:
    return W0 + (alpha / r) * (B @ A)`,
      hint: 'Count `(d_in * r) + (r * d_out)` for LoRA and compute `W0 + (alpha / r) * (B @ A)`.',
      hints: [
        '`base` is `d_in * d_out` and `lora` is `(d_in * r) + (r * d_out)`.',
        '`B @ A` has shape `(d_in, d_out)` matching `W0`.',
        'Scale `(B @ A)` by `(alpha / r)` before adding to `W0`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-4-2',
      difficulty: 'spec',
      requires: ['sft-datasets', 'rag-vs-finetune'],
      title: 'Lab 6.4.2 (From Spec): SFT Dataset Quality & Train/Eval Leakage Auditor',
      prompt:
        'Implement `audit_sft_split(train_rows, eval_rows)` where each row is `{"messages": [{"role": "user", "content": str}, {"role": "assistant", "content": str}]}`. Return `{"valid_train": int, "dropped_empty": int, "leak_count": int}`: 1) Normalize each user prompt via `" ".join(text.lower().split())`. 2) A train row is dropped (`dropped_empty += 1`) if its `"user"` or `"assistant"` content is empty/whitespace. 3) Count how many valid normalized `"user"` prompts in `train_rows` ALSO appear in `eval_rows` (`leak_count`). Do NOT count leaked prompts inside `valid_train`! Only non-empty, non-leaked train rows count toward `valid_train`.',
      starterCode: `def audit_sft_split(train_rows: list[dict], eval_rows: list[dict]) -> dict[str, int]:
    # Return {"valid_train": int, "dropped_empty": int, "leak_count": int}
    pass`,
      testCode: `def row(u, a):
    return {"messages": [{"role": "user", "content": u}, {"role": "assistant", "content": a}]}

train = [
    row("Reset password", "Click settings -> security."),
    row("  reset   PASSWORD ", "Leaked eval duplicate!"),
    row("How to export CSV?", "   "),
    row("Refund invoice", "Visit billing portal."),
]
ev = [row("reset password", "Eval answer")]
res = audit_sft_split(train, ev)
assert res == {"valid_train": 1, "dropped_empty": 1, "leak_count": 2}, f"Got {res}"
print("PASS: Lab 6.4.2 SFT dataset leakage & quality auditor passed!")`,
      solutionCode: `def _norm(text: str) -> str:
    return " ".join(text.lower().split())

def audit_sft_split(train_rows: list[dict], eval_rows: list[dict]) -> dict[str, int]:
    eval_prompts = set()
    for r in eval_rows:
        u = next((m["content"] for m in r["messages"] if m["role"] == "user"), "")
        if u.strip():
            eval_prompts.add(_norm(u))

    valid_train, dropped_empty, leak_count = 0, 0, 0
    for r in train_rows:
        msgs = {m["role"]: m.get("content", "") for m in r.get("messages", [])}
        u = msgs.get("user", "").strip()
        a = msgs.get("assistant", "").strip()
        if not u or not a:
            dropped_empty += 1
            continue
        if _norm(u) in eval_prompts:
            leak_count += 1
            continue
        valid_train += 1
    return {"valid_train": valid_train, "dropped_empty": dropped_empty, "leak_count": leak_count}`,
      hint: 'Normalize eval user prompts into a set first (`" ".join(u.lower().split())`), skip train rows with empty user/assistant strings, then check normalized user prompt against the eval set.',
      hints: [
        'Use `" ".join(text.lower().split())` to collapse whitespace and case differences.',
        'Check `if not u or not a:` before checking leakage.',
        'Only increment `valid_train` when both fields are non-empty AND normalized user prompt is not in `eval_prompts`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-6-4-3',
      difficulty: 'debug',
      requires: ['lora-qlora'],
      title: 'Lab 6.4.3 (Debug Buggy Code): Fix Missing `alpha / r` Scaling & Dead Zero-Init Bug',
      prompt:
        'A broken LoRA adapter script has TWO bugs: 1) `lora_delta` omits the `alpha / r` scaling multiplier (`B @ A` alone!), and 2) `init_ab` sets BOTH `A` and `B` to `np.zeros(...)`, causing zero gradients on step 1! Fix `init_ab(d_in, r, d_out, rng)` so `A` is small non-zero Gaussian (`rng.normal(scale=0.02, size=(r, d_out))` or `(d_in, r)` matching `B @ A`!) wait—specifically match `B` of shape `(d_in, r)` initialized to zeros and `A` of shape `(r, d_out)` non-zero normal, AND fix `lora_delta(B, A, alpha, r)` returning `(alpha / r) * (B @ A)`.',
      starterCode: `import numpy as np

def init_ab(d_in: int, r: int, d_out: int, rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    B = np.zeros((d_in, r))
    A = np.zeros((r, d_out))   # Bug 1: A=0 too -> B @ A has ZERO gradients on step 1!
    return B, A

def lora_delta(B: np.ndarray, A: np.ndarray, alpha: float, r: int) -> np.ndarray:
    return B @ A               # Bug 2: missing (alpha / r) scale!`,
      testCode: `import numpy as np
rng = np.random.default_rng(42)
B, A = init_ab(8, 4, 6, rng)
assert B.shape == (8, 4) and A.shape == (4, 6)
assert np.allclose(B @ A, 0.0), "At step 0, delta must start at 0!"
assert np.linalg.norm(A) > 0.0, "A must be non-zero so gradients flow into B on step 1!"

B_ones = np.ones((8, 4))
delta = lora_delta(B_ones, A, alpha=16.0, r=4)
assert np.allclose(delta, 4.0 * (B_ones @ A)), f"Expected scaling by alpha/r = 4.0!"
print("PASS: Lab 6.4.3 LoRA zero-init & alpha/r scaling bugs fixed!")`,
      solutionCode: `import numpy as np

def init_ab(d_in: int, r: int, d_out: int, rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    B = np.zeros((d_in, r))
    A = rng.normal(scale=0.02, size=(r, d_out))
    return B, A

def lora_delta(B: np.ndarray, A: np.ndarray, alpha: float, r: int) -> np.ndarray:
    return (alpha / r) * (B @ A)`,
      hint: 'Keep `B = np.zeros((d_in, r))` so `B @ A == 0` initially, initialize `A = rng.normal(scale=0.02, size=(r, d_out))`, and multiply `(alpha / r) * (B @ A)`.',
      hints: [
        'Setting `B = np.zeros(...)` ensures step-0 output matches the frozen base model exactly.',
        'Initialize `A` with `rng.normal(scale=0.02, size=(r, d_out))` so backprop produces non-zero gradients for `B`.',
        'Return `(alpha / r) * (B @ A)` inside `lora_delta`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q6-4-1',
      type: 'multiple-choice',
      question: 'Your company updates its 4,000-page product pricing and policy handbook daily. Which approach belongs first?',
      options: [
        'Full model pretraining from scratch each night on historical tickets',
        'Hybrid RAG (Retrieval + Reranking + Citations), updating the index instantaneously when docs change',
        'Supervised LoRA fine-tuning without any retrieval index',
        'Training a K-Means clustering model over token counts',
      ],
      correctIndex: 1,
      explanation: 'Fine-tuning cannot easily unlearn outdated daily prices and lacks source citations, whereas RAG reflects document updates in seconds.',
    },
    {
      id: 'q6-4-2',
      type: 'multiple-choice',
      question: 'Why does LoRA add zero inference latency in single-adapter production serving?',
      options: [
        'Because LoRA merges $W_{\\text{merged}} = W_0 + \\frac{\\alpha}{r} B A$ offline before serving',
        'Because LoRA runs adapter linear layers inside client browser WebAssembly',
        'Because LoRA removes Softmax normalization across final vocabulary logits',
        'Because deployment rank $r$ is clamped strictly to zero during forward passes',
      ],
      correctIndex: 0,
      explanation: 'Because matrix addition is linear, you fold $\\frac{\\alpha}{r} B A$ straight into $W_0$ once prior to serving.',
    },
    {
      id: 'q6-4-3',
      type: 'numeric',
      question: 'In a `4096 x 4096` linear layer, how many trainable parameters are in a rank `r = 16` LoRA adapter (`B` is `4096 x 16` and `A` is `16 x 4096`)?',
      options: [],
      correctIndex: 0,
      correctNumber: 131072,
      tolerance: 0,
      explanation: '`(4096 * 16) + (16 * 4096) = 65,536 + 65,536 = 131,072` parameters (`0.78%` of `16,777,216`).',
    },
    {
      id: 'q6-4-4',
      type: 'spot-bug',
      code: `B = np.zeros((d_in, r))
A = np.zeros((r, d_out))
W = W0 + (alpha / r) * (B @ A)`,
      question: 'Why does initializing BOTH `A` and `B` to zeros ruin LoRA training?',
      options: [
        'Zero matrices trigger immediate float division-by-zero crashes inside Softmax',
        'Matrix dimensions `(d_in, r)` and `(r, d_out)` cannot multiply when filled with zeros',
        'At step 0 both gradients vanish (`0 * dB` and `dA * 0` stay zero), leaving adapters dead',
        'PyTorch skips optimizing parameters whose tensor sums equal exact zero',
      ],
      correctIndex: 2,
      explanation: 'Setting `A = 0` AND `B = 0` traps gradients symmetrically at zero (`dL/dA = B.T @ grad = 0` and `dL/dB = grad @ A.T = 0`)! Initialize `A` with Gaussian noise and `B = 0`.',
    },
    {
      id: 'q6-4-5',
      type: 'multi-select',
      question: 'Which TWO scenarios justify escalating to LoRA / QLoRA fine-tuning?',
      options: [
        'Distilling a slow expensive frontier model into a fast compact `8B` model on a narrow high-volume extraction task',
        'Teaching consistent specialized domain phrasing, JSON structure, or tone after prompting alone plateaus',
        'Memorizing rapidly changing live inventory prices without needing citations',
        'Skipping prompt design and golden evaluation dataset creation completely',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Fine-tuning excels at distilling fixed narrow tasks and enforcing consistent style/formatting—never at storing volatile real-time facts.',
    },
    {
      id: 'q6-4-6',
      type: 'multiple-choice',
      question: 'What distinct VRAM breakthrough does **QLoRA** add on top of standard `BF16` LoRA?',
      options: [
        'QLoRA removes all multi-head attention blocks from Transformer decoders',
        'QLoRA trains adapters in 1-bit integer math rather than floating point',
        'QLoRA stores frozen `W0` weights in 4-bit NormalFloat (NF4) while computing LoRA updates in `BF16`',
        'QLoRA offloads optimizer gradients automatically over HTTP to client browsers',
      ],
      correctIndex: 2,
      explanation: '4-bit NF4 compression shrinks frozen base model weights roughly 4× compared to 16-bit floats while computing forward/backward & LoRA adapters cleanly in `BF16`.',
    },
    {
      id: 'q6-4-7',
      type: 'predict-output',
      code: `alpha, r = 32, 8
print(alpha / r)`,
      question: 'What scaling multiplier is applied to `B @ A` during forward passes?',
      options: [
        '`0.25`',
        '`40.0`',
        '`256.0`',
        '`4.0`',
      ],
      correctIndex: 3,
      explanation: 'The LoRA scaling factor `alpha / r = 32 / 8 = 4.0`.',
    },
    {
      id: 'q6-4-8',
      type: 'ordering',
      question: 'Order the disciplined Escalation Ladder when building a new LLM feature:',
      options: [],
      items: [
        'Build golden eval set + strong system prompt / few-shot baseline',
        'Add Hybrid RAG when errors trace to missing or changing facts',
        'Collect verified traces and SFT fine-tune with LoRA for style or distillation',
        'Merge or serve adapters and compare strictly against the golden eval set',
      ],
      correctIndex: 0,
      explanation: 'Measure prompt baseline -> add RAG for missing facts -> escalate to LoRA fine-tuning only when format/style/latency/cost demand it -> verify against the same eval set.',
    },
    {
      id: 'q6-4-9',
      type: 'multiple-choice',
      question: 'Why should SFT datasets deduplicate user prompts across train and evaluation splits AND mix ~10–20% general replay data?',
      options: [
        'To guarantee `json.loads()` accepts Markdown fences during inference',
        'To force Softmax logits to remain negative across every token index',
        'To prevent memorized test leakage and avoid catastrophic forgetting of general reasoning',
        'To eliminate the need for tokenizing `"assistant"` message headers',
      ],
      correctIndex: 2,
      explanation: 'Deduplicating prevents inflated fake test scores from memorization, and general replay examples preserve broad capabilities alongside narrow task specialization.',
    },
  ],
};
