import type { Lesson } from '@/types/course';

export const lesson5_3: Lesson = {
  id: '5-3',
  moduleId: 'mod-5',
  number: '5.3',
  title: 'Pretraining, Scaling Laws, MoE, FlashAttention & GPU VRAM Math',
  subtitle: 'Budget exact GPU VRAM for inference vs full training, understand Chinchilla vs inference-optimal overtraining, Sparse MoE routing, and SRAM-tiled FlashAttention.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['4.2', '5.2'],
  requires: ['bf16-mixed-precision', 'kv-cache', 'multi-head-gqa'],
  teaches: [
    'vram-budgeting-inference-training',
    'chinchilla-inference-scaling',
    'sparse-moe-routing',
    'flash-attention-io',
  ],
  competencies: ['mid-observability-cost', 'sr-sys-architecture'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Compute exact GPU VRAM needed for model weights (`FP32`, `BF16`, `INT8`, `INT4`), KV cache, and AdamW optimizer training states.',
    'Explain Chinchilla compute-optimal pretraining (`~20 tokens/param`) vs inference-optimal overtraining (`Local Open-Weights` 8B class trained on `15T` tokens).',
    'Implement Sparse Mixture-of-Experts (MoE) top-k gating and quantify active vs total parameter trade-offs.',
    'Explain how IO-aware FlashAttention tiling keeps Softmax in fast SRAM to cut HBM memory reads from `O(N^2)` down to `O(N)`.',
  ],
  checkWithoutNotes: [
    'Add up the exact 16 bytes per parameter required during full `BF16` mixed-precision AdamW training (`weights + gradients + FP32 optimizer states`).',
    'Why does a 70B `INT4`-quantized checkpoint (`~35 GB` weights) still risk running out of memory on a single 40 GB GPU once batch size and 32k context KV cache grow?',
    'Contrast Chinchilla pretraining (`~20 tokens per param`) with inference-optimal overtraining—why did compact `8B` `local-open-weights` models train on 15 trillion tokens instead of 160 billion?',
    'In a `8 x 7B` Mixtral-style MoE activating Top-2 experts per token, why does VRAM scale with TOTAL parameters while per-token latency/FLOPs scale with ACTIVE parameters?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Every AI Engineer Needs Back-of-the-Envelope Hardware & Cost Math',
      paragraphs: [
        'In interviews and architecture reviews, engineers are handed concrete constraints constantly: *"Can we self-host a 70B open-weights model with 16k context for 20 concurrent users on two 48 GB GPUs, or should we quantize to 4-bit, switch to an 8B overtrained model, or route to a Sparse MoE?"* Without crisp VRAM and compute arithmetic, teams either overpay by tens of thousands of dollars on oversized GPU nodes or crash production clusters mid-launch with `CUDA OutOfMemoryError`.',
        'Equally vital is distinguishing **weight loading** from **full training** and **runtime KV cache**. Loading weights is just the opening floor; full backpropagation + AdamW multiplies memory footprint cleanly by **8x** (`16 bytes/param` vs `2 bytes/param`), and long-context multi-user serving adds gigabytes of dynamic KV cache.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Warehouse Floor Space (VRAM) vs Truck Dock Speed (Memory Bandwidth)',
      frontendConcept: 'Checking whether a static JS bundle fits in browser RAM versus measuring disk/cache read speed when rendering 60 frames per second',
      aiConcept: 'GPU HBM Capacity (`Weights + KV Cache + States`) vs SRAM Tiling (`FlashAttention`)',
      explanation:
        'A GPU resembles a giant warehouse (`HBM VRAM`: 24 GB–80 GB) connected by a narrow loading dock to tiny super-fast workbench counters (`on-chip SRAM`: ~20 MB). **VRAM sizing** asks whether all your weights, optimizer boxes, and KV-cache crates fit inside the warehouse without overflowing. **FlashAttention** keeps small active chunks on the super-fast workbench instead of hauling an enormous `N x N` attention matrix back and forth across the slow dock!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Exact VRAM Arithmetic for Weights, AdamW States & Serving',
      paragraphs: [
        'Calculate VRAM for an **8B parameter** (`8 * 10^9` parameters) dense LLM step by step. Stored in `BF16` (`2 bytes/param`), raw weights occupy `8e9 * 2 bytes = 16 GB` (`~14.9 GiB`). Quantized cleanly to `INT8` (`1 byte/param`), weights shrink to `8 GB`; quantized to `INT4` (`0.5 bytes/param`, plus small group scale overhead), weights fit in `~4.5 GB`, leaving plenty of headroom inside a single 24 GB GPU for KV cache! By contrast, a **70B model** in `BF16` needs `70e9 * 2 = 140 GB` (requiring two 80 GB H100s or four 48 GB L40Ss), while `INT4` brings weights down to `~38 GB`, fitting across one 48 GB or two 24 GB cards (with small context).',
        'Now trace **full pretraining or full fine-tuning** in `BF16 + AdamW` mixed precision: `2 bytes` (`BF16` model weights) + `2 bytes` (`BF16` gradients) + `4 bytes` (`FP32` master weight copy) + `4 bytes` (Adam first momentum `m`) + `4 bytes` (Adam second variance `v`) = **16 bytes per parameter** BEFORE counting activation checkpoints! For a 7B model, `7e9 * 16 = 112 GB` minimum—proving immediately why single-GPU fine-tuning uses **LoRA / QLoRA** (freezing quantized `INT4` base weights and maintaining AdamW states strictly on tiny `0.5%` adapter weights!).',
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'llm-vram',
      title: 'Interactive Lab: LLM VRAM, KV Cache & Quantization Calculator',
      description:
        'Pick parameter count (`7B` to `405B`), quantization (`FP32/BF16/INT8/INT4`), context length, batch size, and GQA ratio to inspect exact GPU VRAM breakdowns and node sizing.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Sparse Mixture-of-Experts (MoE) & FlashAttention IO Tiling',
      paragraphs: [
        'Look at how **Mixture-of-Experts (MoE)** models (such as Mixtral or DeepSeek-V3) decouple capacity from per-token FLOPs. Inside a standard dense Transformer block, every token passes through one giant Feed-Forward Network (`FFN`). An MoE layer replaces that single FFN with, say, `8` specialized expert FFNs (`E_0..E_7`) plus a lightweight linear router (`x @ W_router -> softmax`). For each token, the router picks only the **Top-2** highest-scoring experts, normalizes their two gating weights to sum to `1.0`, and blends solely those two experts (`y = w_a * E_a(x) + w_b * E_b(x)`).',
        'Notice the exact hardware implication: ALL `8` experts must stay resident in GPU VRAM (because the router can pick any expert on the next token!), yet per-token matrix multiplication FLOPs scale only with the `2` active experts! Meanwhile, **FlashAttention** solves the quadratic HBM bottleneck of attention without changing a single mathematical bit: instead of writing an enormous `(N, N)` attention matrix (`4096 x 4096 x 2 = 32 MB` per head * 32 heads = `1 GB` per layer!) back and forth to slow HBM VRAM, FlashAttention tiles small `(B_r, B_c)` blocks of `Q, K, V` inside fast on-chip SRAM, computes online rescaled Softmax statistics across tiles in one fused pass, and drops intermediate attention memory from `O(N^2)` down to `O(N)`.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Chinchilla vs Inference-Optimal Overtraining',
      body: 'DeepMind’s Chinchilla scaling law established that for a fixed **training compute budget**, optimal pretraining feeds roughly **~20 tokens per parameter** (`1.4T` tokens for `70B`, `160B` tokens for `8B`). However, **inference runs millions of times per day!** Modern `local-open-weights` 8B families trained on `15 trillion` tokens (nearly `1,875` tokens per parameter!) intentionally pay higher one-time training FLOPs so a small, fast `8B` checkpoint achieves accuracy previously reserved for giant slow models.',
    },
    {
      type: 'prose',
      heading: 'Common Hardware Sizing & Scaling Mistakes & How to Debug Them',
      paragraphs: [
        '1) Sizing GPU memory purely from raw parameter weight GB (`70B * 2 = 140 GB`) and crashing under real traffic: always add a **KV-cache concurrency allowance**, PyTorch CUDA context overhead (`~1–2 GB` per GPU), activation workspace buffers during prefill, and fragmentation headroom (`~15–20%` buffer).',
        '2) Assuming an MoE model with `47B` total / `13B` active parameters fits inside a `16 GB` GPU because "only 13B parameters run": every inactive expert weight still lives inside VRAM continuously unless swapped slowly over PCIe, so VRAM sizing tracks **total parameters**, while **decode latency/FLOPs** track active parameters.',
        '3) Training a naive `FP32` master model without gradient checkpointing when activations explode on 8k sequences: **activation checkpointing** discards intermediate layer outputs during forward pass and recomputes them cleanly inside backward pass, trading minor extra compute to cut activation VRAM dramatically.',
        '4) Picking an oversized 70B `BF16` checkpoint for simple classification or structured extraction when an `8B` inference-overtrained model with clear schema instructions hits identical quality at `8x` lower serving cost and crisp latency.',
        '5) Quantizing fragile tiny models (`1B–3B`) aggressively to `INT4` without running an accuracy regression check first: larger models (`32B–70B`) retain most reasoning accuracy under well-calibrated 4-bit AWQ/GPTQ group quantization, whereas sub-3B checkpoints often lose coding/JSON reliability—always check your golden CI benchmark before shipping `INT4`!',
        '6) Serving concurrent users with naive static batching (waiting for a 500-token response to finish before releasing the 20-token slot in the same batch): production engines (**vLLM**, **TGI**, **TensorRT-LLM**) use **continuous iteration-level batching**, swapping finished sequences out immediately at every single token step to keep GPU utilization high.',
        '7) Ignoring router load-balancing penalties when training Sparse MoE layers: without an auxiliary load-balancing loss encouraging uniform token distribution across experts, the router collapses onto two favorite experts and leaves 90% of parameter capacity idle ("routing collapse").',
        '8) Assuming decode latency depends solely on FLOP count rather than GPU memory bandwidth: reading `140 GB` of `BF16` weights per generated token means decode sits memory-bandwidth bound, which explains why `INT4` quantization and draft-model Speculative Decoding cut token latency sharply even on fast H100 cards.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Model Precision, Training & Serving Choices',
      headers: ['Choice', 'Memory per Param', 'Speed & Accuracy Impact', 'When to Choose'],
      rows: [
        ['Full BF16 + AdamW Training', '~16 bytes/param (incl. FP32 master)', 'Highest weight fidelity; multi-GPU cluster needed', 'Pretraining or full-parameter continual training'],
        ['QLoRA (NF4 base + BF16 LoRA)', '~0.55 bytes base + <1% adapters', 'Single-GPU friendly; matches full SFT on style/format', 'Task specialization without giant GPU clusters'],
        ['Dense Model Inference (FP8/BF16)', '1-2 bytes/param + KV cache', 'Predictable latency; simpler serving topology', 'Sub-10B fast tiers or high-throughput batch APIs'],
        ['Sparse MoE (e.g., 47B / 13B active)', 'All 47B weights must fit in VRAM', '13B active decode speed; needs higher total GPU RAM', 'Higher capability per decode FLOP when VRAM is available'],
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 5.3 Recap: Hardware Sizing, MoE & Scaling',
      body: '- Inference weight VRAM scales cleanly via `params * bytes_per_weight` (`2B` BF16, `1B` INT8, `0.5B` INT4) plus KV cache and runtime overhead.\n- Full `BF16 + AdamW` training needs `16 bytes/param` (`weights + grads + FP32 master + m + v`), motivating QLoRA on single GPUs.\n- Sparse MoE decouples total knowledge capacity (`VRAM`) from active per-token FLOPs/latency (`Top-k` experts).\n- FlashAttention tiles Q/K/V in fast SRAM to cut attention memory from `O(N^2)` down to `O(N)` with exact Softmax outputs.\n- Chinchilla (`20 tokens/param`) optimizes training compute; modern models overtrain smaller weights (`8B` on `15T` tokens) for cheap serving.',
    },
    {
      type: 'python-lab',
      labId: 'lab-5-3-vram',
      difficulty: 'guided',
      requires: ['vram-budgeting-inference-training'],
      title: 'Lab 5.3A: GPU VRAM Budgeter & Minimum GPU Counter',
      prompt:
        'Implement `estimate_vram_and_gpus(params_billions: float, mode: str, bytes_per_weight: float, kv_cache_gb: float, gpu_vram_gb: float)` where: if `mode == "inference"`, `total_gb = params_billions * bytes_per_weight + kv_cache_gb + 2.0` (overhead); if `mode == "full_train"`, `total_gb = params_billions * 16.0 + kv_cache_gb + 4.0`. Return `(round(total_gb, 2), math.ceil(total_gb / gpu_vram_gb))`.',
      starterCode: `import math

def estimate_vram_and_gpus(
    params_billions: float,
    mode: str,
    bytes_per_weight: float = 2.0,
    kv_cache_gb: float = 4.0,
    gpu_vram_gb: float = 24.0,
) -> tuple[float, int]:
    # Compute total_gb for "inference" vs "full_train", then math.ceil(total_gb / gpu_vram_gb)
    pass`,
      testCode: `gb_inf, n_inf = estimate_vram_and_gpus(8.0, "inference", bytes_per_weight=0.5, kv_cache_gb=6.0, gpu_vram_gb=24.0)
assert abs(gb_inf - 12.0) < 1e-6 and n_inf == 1, f"INT4 8B + 6GB KV + 2GB overhead = 12GB (1 GPU), got {(gb_inf, n_inf)}"
gb_tr, n_tr = estimate_vram_and_gpus(7.0, "full_train", kv_cache_gb=0.0, gpu_vram_gb=80.0)
assert abs(gb_tr - 116.0) < 1e-6 and n_tr == 2, f"7B full train = 116GB (2x 80GB GPUs), got {(gb_tr, n_tr)}"
print("PASS: Inference vs AdamW full-training VRAM budgets match exact hardware sizing!")`,
      solutionCode: `import math

def estimate_vram_and_gpus(
    params_billions: float,
    mode: str,
    bytes_per_weight: float = 2.0,
    kv_cache_gb: float = 4.0,
    gpu_vram_gb: float = 24.0,
) -> tuple[float, int]:
    if mode == "inference":
        total_gb = params_billions * bytes_per_weight + kv_cache_gb + 2.0
    elif mode == "full_train":
        total_gb = params_billions * 16.0 + kv_cache_gb + 4.0
    else:
        raise ValueError(f"Unknown mode: {mode}")
    return round(float(total_gb), 2), int(math.ceil(total_gb / gpu_vram_gb))`,
      hint: 'Use `16.0` bytes per billion parameters for `full_train` (plus `4.0` GB overhead) and `bytes_per_weight` (plus `2.0` GB overhead) for `inference`.',
      hints: [
        'Note that `1 billion * 1 byte = 1 GB` cleanly when multiplying `params_billions * bytes_per_param`.',
        'Use `16.0` bytes/param for `full_train` (`4.0 GB` overhead) and `bytes_per_weight` (`2.0 GB` overhead) for `inference`.',
        'Add `kv_cache_gb` and overhead before dividing by `gpu_vram_gb` with `math.ceil`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-5-3-moe',
      difficulty: 'spec',
      requires: ['sparse-moe-routing', 'softmax', 'numpy-arrays'],
      title: 'Lab 5.3B: Implement Top-2 Sparse Mixture-of-Experts Router in NumPy',
      prompt:
        'Implement `moe_top2_forward(x: np.ndarray, router_w: np.ndarray, expert_outputs: np.ndarray) -> tuple[np.ndarray, np.ndarray]`: given single token vector `x` `(d,)`, router matrix `router_w` `(d, n_experts)`, and precomputed candidate outputs `expert_outputs` `(n_experts, d)`, compute logits `x @ router_w`, pick the **Top-2** expert indices (`np.argsort(logits)[-2:][::-1]`), compute normalized softmax weights strictly across ONLY those Top-2 logits, blend `w0 * expert_outputs[i0] + w1 * expert_outputs[i1]`, and return `(blended_vec, top2_indices)`.',
      starterCode: `import numpy as np

def moe_top2_forward(x: np.ndarray, router_w: np.ndarray, expert_outputs: np.ndarray):
    # 1. Compute router_logits = x @ router_w
    # 2. Pick top2_idx = np.argsort(router_logits)[-2:][::-1]
    # 3. Softmax ONLY over router_logits[top2_idx] -> top2_weights
    # 4. Return weighted sum over expert_outputs[top2_idx] and top2_idx
    pass`,
      testCode: `import numpy as np
x = np.array([1.0, 0.0])
router_w = np.array([[0.1, 3.0, 1.0, 2.0], [0.0, 0.0, 0.0, 0.0]])  # logits=[0.1, 3.0, 1.0, 2.0] -> top2=[1, 3]
exp_out = np.array([[999., 999.], [10., 0.], [555., 555.], [0., 10.]])
out, idx = moe_top2_forward(x, router_w, exp_out)
assert idx.tolist() == [1, 3], f"Expected top-2 experts [1, 3], got {idx}"
# Softmax([3.0, 2.0]) -> [0.73105858, 0.26894142]
assert np.allclose(out, [7.310586, 2.689414], atol=1e-4), f"Inactive experts 0 and 2 must NOT contribute! Got {out}"
print("PASS: Top-2 MoE router gated strictly active experts cleanly!")`,
      solutionCode: `import numpy as np

def moe_top2_forward(x: np.ndarray, router_w: np.ndarray, expert_outputs: np.ndarray):
    logits = x @ router_w
    top2_idx = np.argsort(logits)[-2:][::-1]
    top2_logits = logits[top2_idx]
    shifted = top2_logits - np.max(top2_logits)
    exps = np.exp(shifted)
    weights = exps / np.sum(exps)
    blended = np.sum(weights[:, None] * expert_outputs[top2_idx], axis=0)
    return blended, top2_idx`,
      hint: 'Slice `top2_logits = logits[top2_idx]` BEFORE taking Softmax so weights sum strictly to `1.0` across the active pair.',
      hints: [
        'Use `top2_idx = np.argsort(logits)[-2:][::-1]` to order the top-2 indices descending.',
        'Compute `exps = np.exp(top2_logits - np.max(top2_logits))` and normalize `weights = exps / np.sum(exps)`.',
        'Combine via `np.sum(weights[:, None] * expert_outputs[top2_idx], axis=0)`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-5-3-chinchilla',
      difficulty: 'debug',
      requires: ['chinchilla-inference-scaling'],
      title: 'Lab 5.3C: Fix Chinchilla vs High-Volume Inference Model Selector',
      prompt:
        'A naive estimator picks model size strictly by Chinchilla ratio (`tokens / 20`) ignoring massive recurring inference volume! Fix `recommend_training_config(pretrain_tokens_trillions: float, expected_monthly_inference_requests_millions: float)` so: (1) Chinchilla parameter size is `round((pretrain_tokens_trillions * 1e12 / 20) / 1e9, 1)` billion params; (2) if `expected_monthly_inference_requests_millions >= 50.0`, return `"overtrain_compact_8B"` (favoring high token/param ratio like modern `local-open-weights` 8B decoders for serving economics) else return `"chinchilla_balanced"`. Return `{"chinchilla_params_b": ..., "strategy": ...}`.',
      starterCode: `def recommend_training_config(pretrain_tokens_trillions: float, expected_monthly_inference_requests_millions: float) -> dict:
    # BUG: divides by 2 only instead of 20 tokens/param, and always returns chinchilla_balanced!
    params_b = round((pretrain_tokens_trillions * 1e12 / 2.0) / 1e9, 1)
    return {"chinchilla_params_b": params_b, "strategy": "chinchilla_balanced"}`,
      testCode: `r1 = recommend_training_config(1.4, 5.0)
assert abs(r1["chinchilla_params_b"] - 70.0) < 1e-6 and r1["strategy"] == "chinchilla_balanced"
r2 = recommend_training_config(15.0, 200.0)
assert abs(r2["chinchilla_params_b"] - 750.0) < 1e-6 and r2["strategy"] == "overtrain_compact_8B"
print("PASS: Scaling decision weighed pretraining optimality against downstream inference traffic!")`,
      solutionCode: `def recommend_training_config(pretrain_tokens_trillions: float, expected_monthly_inference_requests_millions: float) -> dict:
    params_b = round((pretrain_tokens_trillions * 1e12 / 20.0) / 1e9, 1)
    strategy = "overtrain_compact_8B" if expected_monthly_inference_requests_millions >= 50.0 else "chinchilla_balanced"
    return {"chinchilla_params_b": params_b, "strategy": strategy}`,
      hint: 'Divide `pretrain_tokens_trillions * 1000` by `20.0` for billion parameters, and switch strategy when monthly traffic `>= 50.0` million.',
      hints: [
        'Chinchilla compute optimality feeds ~20 training tokens per parameter.',
        'One trillion divided by `20` equals `50 billion` parameters per trillion tokens (`round((pretrain_tokens_trillions * 1e12 / 20.0) / 1e9, 1)`).',
        'Select `"overtrain_compact_8B"` whenever `expected_monthly_inference_requests_millions >= 50.0` else `"chinchilla_balanced"`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q5-3-1',
      type: 'multiple-choice',
      question: 'Roughly how much GPU VRAM is needed just to load an **8B parameter** LLM’s weights in **BF16** (before KV cache)?',
      options: [
        '4 GB because `BF16` compresses weights using half-byte 4-bit integer packing',
        '8 GB because `BF16` allocates one byte per parameter on NVIDIA GPUs',
        '16 GB (`8B * 2 bytes per parameter`)',
        '64 GB because PyTorch allocates full AdamW states automatically during model loading',
      ],
      correctIndex: 2,
      explanation: '`BF16` uses 2 bytes per parameter: `8 * 10^9 * 2 bytes = 16 GB` (~`14.9 GiB`).',
    },
    {
      id: 'q5-3-2',
      type: 'multiple-choice',
      question: 'What is the core benefit of a Sparse Mixture-of-Experts (MoE) architecture over a dense LLM of identical total parameter count?',
      options: [
        'MoE stores only the active expert subsets in GPU VRAM while spilling remaining weights cleanly to free browser storage',
        'MoE requires zero learned routing projections because every token calls experts uniformly in round-robin order',
        'MoE eliminates subword tokenization completely by reading UTF-8 raw bytes directly inside gating routers',
        'Only top-k experts activate per token, slashing per-token compute FLOPs',
      ],
      correctIndex: 3,
      explanation: 'While all expert weights still occupy VRAM, gating activates only e.g. 2 of 8 experts per token, cutting inference compute significantly.',
    },
    {
      id: 'q5-3-3',
      type: 'multiple-choice',
      question: 'Why does **FlashAttention** speed up Transformers dramatically without changing mathematical outputs at all?',
      options: [
        'It replaces Softmax inside Self-Attention with fast element-wise ReLU approximations',
        'It executes matrix dot products asynchronously on host CPU threads rather than GPU cores',
        'It deletes half of the Query/Key attention heads automatically whenever prompt length passes 4,096 tokens',
        'It tiles Q, K, V in SRAM to avoid writing `N x N` matrices to slow HBM',
      ],
      correctIndex: 3,
      explanation: 'FlashAttention is exact and IO-aware: keeping online Softmax tiling inside fast on-chip SRAM cuts HBM bandwidth transfers and lowers attention memory from `O(N^2)` to `O(N)`.',
    },
    {
      id: 'q5-3-4',
      type: 'numeric',
      question: 'How many bytes per parameter does standard `BF16` mixed-precision **AdamW training** require for weights (`2B`) + gradients (`2B`) + `FP32` master weights (`4B`) + Adam momentum (`4B`) + Adam variance (`4B`)?',
      options: [],
      correctIndex: 0,
      correctNumber: 16,
      tolerance: 0,
      unit: 'bytes/param',
      explanation: '`2 + 2 + 4 + 4 + 4 = 16 bytes` per trainable parameter before activations!',
    },
    {
      id: 'q5-3-5',
      type: 'spot-bug',
      question: 'An engineer buys one `16 GB` GPU expecting to serve a `47B total / 13B active` Sparse MoE model in `BF16` because "only 13B active params execute per token." What fails immediately?',
      options: [
        'The router can choose any of the 47B experts per token, so all `~94 GB` must stay in VRAM',
        'Sparse MoE models refuse to execute on fewer than eight GPUs unless INT8 quantization is disabled',
        'Active parameter FLOPs double automatically whenever batch size drops from 32 down to 1',
        'Rotary Positional Embeddings require storing an extra copy of `47B` weights per sequence length',
      ],
      correctIndex: 0,
      explanation: 'Active parameters control FLOPs/latency, whereas **total parameters** dictate minimum VRAM capacity (`47B * 2 = 94 GB` in BF16)!',
    },
    {
      id: 'q5-3-6',
      type: 'predict-output',
      question: 'Under DeepMind’s Chinchilla training-compute rule (`~20 tokens per parameter`), why did compact `8B` `local-open-weights` models intentionally train on `15 trillion` tokens instead of `160 billion`?',
      options: [
        'Because tokenizer errors dropped 14.8 trillion tokens during pre-cleaning before gradient steps started',
        'To intentionally overfit benchmark test answers inside the 8B embedding lookup matrix',
        'Because Chinchilla scaling laws break down completely whenever parameter counts stay below 20 billion',
        'To pack huge intelligence into a small, fast `8B` model for cheap inference',
      ],
      correctIndex: 3,
      explanation: 'Chinchilla minimizes *training* compute; overtraining an 8B model pays higher pretraining cost once so millions of live inference queries run cheaply.',
    },
    {
      id: 'q5-3-7',
      type: 'multi-select',
      question: 'Which two techniques directly cut GPU VRAM bottlenecks during fine-tuning or long-context inference?',
      options: [
        'Using **QLoRA** (`INT4` frozen base weights + tiny trainable adapter matrices) instead of 16-bytes/param full AdamW',
        'Enabling **activation checkpointing** (recomputing intermediate forward tensors during backward pass)',
        'Storing full `FP32` copies of gradients, weights, and optimizer states across every layer simultaneously',
        'Replacing GQA KV heads with duplicate full MHA copies per Query head',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'QLoRA slashes static weight/optimizer state VRAM, while activation checkpointing trades tiny recompute for huge activation RAM savings.',
    },
    {
      id: 'q5-3-8',
      type: 'multiple-choice',
      question: 'How many GPUs (`24 GB` each) are the minimum required simply to hold `70B` weights quantized to `INT4` (`0.5 bytes/param`, `~35 GB` weights + overhead)?',
      options: [
        '1 GPU (`24 GB` fits `35 GB` because PyTorch compresses INT4 weights automatically by 50% at load time)',
        '2 GPUs (`48 GB` combined VRAM)',
        '8 GPUs (`192 GB` because INT4 requires full `FP32` AdamW optimizer buffers even during inference)',
        '16 GPUs (`384 GB` because KV cache always occupies `300 GB` for a single request)',
      ],
      correctIndex: 1,
      explanation: '`35 GB` weights plus KV cache/overhead exceeds 1x `24 GB` GPU (`24 < 35`) and fits cleanly across 2x `24 GB = 48 GB`.',
    },
    {
      id: 'q5-3-9',
      type: 'ordering',
      question: 'Order how to properly size GPU hardware for self-hosting an open-weights LLM:',
      items: [
        'Pick model parameter count (`P`) and weight precision (`BF16 = 2B`, `INT8 = 1B`, `INT4 = 0.5B`)',
        'Compute static weight VRAM (`P * bytes_per_weight`)',
        'Add dynamic KV-cache VRAM across expected max concurrency (`batch * seq_len * kv_per_token`)',
        'Add CUDA runtime + activation headroom (`~15–20%`) before selecting GPU count and memory tier',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Choose checkpoint/quantization -> compute weight GB -> add peak multi-user KV cache -> pad with runtime/activation headroom.',
    },
  ],
};
