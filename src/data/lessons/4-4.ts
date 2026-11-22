import type { Lesson } from '@/types/course';

export const lesson4_4: Lesson = {
  id: '4-4',
  moduleId: 'mod-4',
  number: '4.4',
  title: 'Sequence Models (RNNs/LSTMs), Attention Shift & AI Engineer vs Researcher',
  subtitle: 'Trace recurrent gradient decay numerically, see why Transformers won sequence scaling, and calibrate what a working AI Engineer must master versus a Researcher.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['4.1', '4.2'],
  requires: ['backpropagation-chain-rule', 'pytorch-nn-module-loops', 'residual-skip-connections'],
  teaches: [
    'rnn-sequential-bottleneck',
    'lstm-gated-memory',
    'transformer-parallelism-tradeoff',
    'ai-engineer-vs-researcher',
  ],
  objectives: [
    'Trace RNN hidden-state recurrence and prove numerically why backpropagating through 20+ time steps causes vanishing or exploding gradients.',
    'Explain how LSTM additive cell-state highways (`c_t = f_t * c_{t-1} + i_t * g_t`) bridge longer time gaps than vanilla RNNs.',
    'Contrast sequential `O(N)` RNN training vs `O(1)`-depth parallel Self-Attention training alongside `O(N)` KV-cache inference tradeoffs.',
    'Scope day-to-day job responsibilities clearly between an **AI Engineer** (shipping reliable RAG, agents, evals, fine-tunes, and serving) and an **ML Researcher**.',
  ],
  checkWithoutNotes: [
    'Explain the two architectural walls that prevented RNNs/LSTMs from scaling cleanly to trillion-token LLM pretraining.',
    'If an RNN recurrent Jacobian eigenvalue sits at `0.5` at every step, what happens to gradient signal traveling back across `20` tokens (`0.5^20`)?',
    'Why are hybrid recurrent / state-space models (Mamba, linear attention) returning in long-context LLM architectures despite Self-Attention winning training parallelism?',
    'Contrast three daily skills required of an applied AI Engineer versus topics belonging mainly to frontier pretraining Researchers.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'The Sequence Bottleneck That Sparked Modern Large Language Models',
      paragraphs: [
        'Before 2017, natural language processing ran almost entirely on **Recurrent Neural Networks (RNNs)** and **Long Short-Term Memory networks (LSTMs)**. An RNN reads token 1 (`"The"`) and updates hidden state `h_1`; reads token 2 (`"server"`) alongside `h_1` to produce `h_2`; and marches step by step to token `N`. That architecture seemed natural for reading text left to right—yet it hit two impassable scaling walls.',
        'First was **Zero Parallelism Across Tokens**: because `h_1000` depends mathematically on `h_999`, which depends on `h_998`, a GPU cluster cannot compute token 1,000 until all 999 earlier steps finish sequentially! Training on trillions of web tokens crawled impossibly slowly. Second was the **Fixed-State Information Bottleneck & Vanishing Gradients**: squeezing an entire 3,000-word contract into one 512-dimensional hidden vector causes early nouns to fade away, and multiplying recurrent weight matrices through dozens of time steps shrinks gradients exponentially (`0.5^20 = 0.00000095`). The 2017 Transformer deleted recurrence completely so every token looks directly at all prior tokens in parallel in **1 matrix step**.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Telephone Relay vs Shared Whiteboard',
      frontendConcept: 'Passing a 20-line JSON config verbally down a line of 50 people vs letting everyone read a shared whiteboard simultaneously',
      aiConcept: 'Sequential RNN Hidden State vs Parallel Self-Attention Lookup',
      explanation:
        'An RNN works like the game of Telephone: Person 1 whispers a summary to Person 2, who edits it and whispers to Person 3—by Person 50, early details fade or distort (`vanishing gradients`), and nobody down the line can start working until Person 49 finishes speaking! Self-Attention puts every word onto one shared whiteboard so token 50 glances straight back at token 2 directly in a single parallel hardware pass.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Numeric Vanishing Gradient Decay (`0.5^T`) vs LSTM Cell Highway',
      paragraphs: [
        'Verify recurrent gradient collapse with concrete numbers. Suppose a 1D vanilla RNN computes `h_t = tanh(w * h_{t-1} + u * x_t)` with recurrent multiplier `w = 0.5` and local `tanh\'(z) <= 1.0`. Even assuming `tanh` never saturates (`tanh\' = 0.8`), passing gradient back one step multiplies by `0.5 * 0.8 = 0.4`. After just **10 tokens**, `dh_10 / dh_0 = 0.4^10 = 0.000105` (over 9,500x smaller!); after **20 tokens**, `0.4^20 = 1.1e-8`—vanished into floating-point dust! Conversely, setting `w = 2.0` gives `2.0^20 = 1,048,576`, exploding immediately to `NaN` unless clamped via `clip_grad_norm_`.',
        'LSTMs improved over vanilla RNNs by introducing an **additive cell state highway** `c_t = f_t * c_{t-1} + i_t * g_t`, where `f_t` (`sigmoid` forget gate in `(0, 1)`) decides how much old memory stays intact, `i_t` controls new candidate writes `g_t`, and addition creates a gradient path just like Residual Skip Connections! When the network sets `f_t ~ 0.98`, memory survives across dozens of steps (`0.98^20 = 0.67`). Yet even LSTMs remain trapped in `O(N)` sequential step-by-step execution during training.',
      ],
    },
    {
      type: 'table',
      title: 'RNN / LSTM vs Transformer (Self-Attention) Scaling Tradeoffs',
      headers: ['Engineering Property', 'RNN / LSTM', 'Transformer (Self-Attention)'],
      rows: [
        ['Training parallelism across `N` tokens', 'Sequential `O(N)` steps — leaves tensor cores starving', 'Fully parallel `O(1)` sequential depth across all `N` tokens'],
        ['Path length from token 1 to token 1000', '`1,000` multiplicative/gated hops (signal fades)', '`1` direct Query-Key dot-product hop'],
        ['Memory per generated token at inference', 'Constant `O(1)` fixed hidden state `h_t`', 'Growing `O(N)` **KV Cache** storing Keys/Values for every token'],
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Why State-Space & Hybrid Models (Mamba / Linear Attention) Are Re-Emerging',
      body: 'Look carefully at Row 3 above! Transformers scale training effortlessly, yet pay `O(N^2)` prefill compute and `O(N)` KV-cache VRAM during long-context generation (`128k–1M` tokens). Modern hybrid architectures (such as Jamba and Qwen linear-attention hybrids) blend fast constant-state recurrent/SSM layers with periodic sparse Self-Attention layers—combining fast parallel scans during training with bounded long-context inference memory.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: What an AI Engineer Must Know vs an ML Researcher',
      paragraphs: [
        'Many beginners burn six months memorizing obscure differential geometry proofs or trying to write custom CUDA pretraining kernels from scratch—only to discover in interviews that applied **AI Engineer** teams rarely pretrain 70B foundation models! Honest career scoping saves you hundreds of wasted hours and focuses your energy directly on what hiring managers pay junior-to-senior AI Engineers to ship.',
        'An **ML / Frontier Researcher** pushes base model capability: deriving novel attention variants, tuning custom distributed all-reduce GPU collectives across 4,096 H100s, writing Triton/CUDA fused kernels, inventing RL objective formulations, and studying trillion-token Chinchilla scaling curves. An **Applied AI Engineer** turns existing foundation models, classical ML models, and clean software into reliable business products: designing structured LLM tool/API wrappers with retries and cost budgets, building hybrid vector+BM25 RAG with tenant isolation and citations, writing golden CI eval harnesses + LLM-as-judge calibration, fine-tuning small LoRA adapters cleanly when prompting plateaus, deploying FastAPI + Docker services with monitoring/rollback runbooks, and profiling VRAM/TTFT/TPOT latency economics.',
      ],
    },
    {
      type: 'table',
      title: 'Honest Career Scoping: Applied AI Engineer vs Frontier ML Researcher',
      headers: ['Topic / Skill', 'Applied AI Engineer (Must Master)', 'Frontier Researcher (Conceptual Intuition Suffices)'],
      rows: [
        ['Deep learning core (`PyTorch`, backprop, `eval()`, `BF16`, shapes)', '**Deep fluency** (debug training/LoRA/embedding scripts confidently)', 'Deep fluency + custom autograd/C++ extensions'],
        ['LLM APIs, RAG, Agents, Evals, FastAPI, Docker, CI', '**Core daily craft** (4–6 deployed end-to-end systems)', 'Often light or secondary to paper benchmarks'],
        ['VRAM sizing, quantization (`INT4`/`BF16`), KV cache, TTFT/TPOT', '**Must calculate** to pick GPUs & control serving bills', 'Designs multi-node tensor/pipeline parallelism topologies'],
        ['Custom CUDA/Triton kernels & pretraining 100B+ from scratch', 'High-level intuition only (`FlashAttention` saves HBM IO)', '**Daily research focus** across huge GPU clusters'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common Sequence & Scoping Mistakes & How to Debug Them',
      paragraphs: [
        '1) Padding variable-length sequences with `0`s and averaging EVERY position (`mean(axis=1)`) without masking out pad tokens: an input `"hi"` padded to length `64` gets diluted 32x by sixty-two zero vectors! Always multiply hidden outputs by an explicit `attention_mask` (`1` for real tokens, `0` for padding) and divide strictly by `mask.sum()`, never `seq_len`.',
        '2) Applying RNN or LSTM layers without `torch.nn.utils.clip_grad_norm_(..., 1.0)`: even gated LSTMs experience sudden steep loss cliffs on sharp outlier batches; gradient clipping keeps updates smooth.',
        '3) Feeding future tokens into a bidirectional RNN (`bidirectional=True`) or non-causal encoder during autoregressive next-token forecasting: bidirectional hidden states read backward from token `t + 1` straight into `t`, creating 100% validation leakage that collapses during live step-by-step generation!',
        '4) Confusing "knowing how Transformers work conceptually" with spending months rewriting custom pretraining clusters before shipping one working RAG + eval + FastAPI project: employers hire AI Engineers for proven shipped software reliability, measurable evals, and solid debugging instincts.',
        '5) Using **teacher forcing** exclusively during sequence training without testing free-running autoregressive rollouts (**exposure bias**): during training the model receives clean ground-truth previous tokens; at live inference it conditions on its own slightly imperfect prior outputs, which can drift exponentially on long code or multi-step plans unless decoding constraints and verification checks stay tight.',
        '6) Truncating long documents carelessly at the front instead of preserving instructions or recent turns: when a 6,000-token log hits a 4,096-token sequence cap, naive `tokens[:4096]` slices away the user’s final question at the bottom! Always pin system instructions + latest user question first, trimming stale middle context cleanly.',
        '7) Misreading **Receptive Field vs Sequence Horizon** when comparing LSTMs and Attention: even if an LSTM forget gate stays at `0.98`, compressing diverse facts ("user lives in Cairo", "allergic to peanuts", "order #4819 failed") through one fixed `h_t` vector forces competing details to overwrite one another—whereas Self-Attention keeps every prior token directly addressable in its own Key/Value slot!',
        '8) Neglecting classical software engineering fundamentals while chasing frontier ML papers: in applied AI interviews, failing to write clean unit-tested Python, handle HTTP `429` retries, isolate multi-tenant RAG queries, or package a FastAPI + Docker service eliminates far more candidates than forgetting an obscure research regularizer.',
        '9) Confusing when to pick a small encoder model (`DeBERTa` / `BGE-Reranker`) versus an autoregressive decoder LLM: fast bidirectional encoders score classifications, NER tags, and search reranking pairs in milliseconds for fractions of a cent without generating chat prose—knowing when NOT to call a giant generative LLM is a core Applied AI Engineering instinct.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 4.4 Recap: Sequence Evolution & AI Engineer Focus',
      body: '- Vanilla RNNs suffer sequential `O(N)` training locks and exponential `w^T` gradient decay across long horizons.\n- LSTMs add a gated cell-state highway (`c_t = f*c_{t-1} + i*g`), easing gradient decay while remaining sequential `O(N)`.\n- Transformers unlock parallel `O(1)`-depth training across tokens, trading fixed `O(1)` inference memory for growing `O(N)` KV cache.\n- Always mask `<PAD>` indices before sequence pooling and avoid bidirectional leakage on causal generation.\n- Focus 80% of engineering mastery on applied AI systems (APIs, RAG, agents, evals, PyTorch debugging, FastAPI/Docker) while keeping clean conceptual grounding in research fundamentals.',
    },
    {
      type: 'python-lab',
      labId: 'lab-4-4-rnn',
      difficulty: 'guided',
      requires: ['numpy-arrays', 'chain-rule'],
      title: 'Lab 4.4A: Measure Recurrent Vanishing vs Exploding Gradients Across Horizon `T`',
      prompt:
        'Implement `rnn_gradient_norm_ratio(w_rec: float, tanh_derivs: np.ndarray) -> float` computing the exact scalar backpropagated gradient scaling factor `prod(|w_rec * d| for d in tanh_derivs)` across `T` steps, showing directly how `|w_rec * d| < 1` decays toward zero while `> 1` explodes.',
      starterCode: `import numpy as np

def rnn_gradient_norm_ratio(w_rec: float, tanh_derivs: np.ndarray) -> float:
    # Multiply abs(w_rec * tanh_derivs) cleanly across all steps using np.prod
    pass`,
      testCode: `import numpy as np
decay = rnn_gradient_norm_ratio(0.5, np.full(20, 0.8))
assert abs(decay - (0.4 ** 20)) < 1e-12 and decay < 1e-7, f"20 steps at 0.4 must vanish, got {decay}"
explode = rnn_gradient_norm_ratio(2.0, np.full(20, 0.8))
assert explode > 10000.0, f"20 steps at 1.6 must explode >10k, got {explode}"
print("PASS: Exact multiplicative recurrence explains RNN vanishing/exploding instability!")`,
      solutionCode: `import numpy as np

def rnn_gradient_norm_ratio(w_rec: float, tanh_derivs: np.ndarray) -> float:
    factors = np.abs(float(w_rec) * np.asarray(tanh_derivs, dtype=float))
    return float(np.prod(factors))`,
      hint: 'Multiply each step’s `abs(w_rec * tanh_deriv)` using `np.prod(...)`.',
      hints: [
        'Each step multiplies incoming backprop gradient by `abs(w_rec * tanh_deriv)`.',
        'Create array `factors = np.abs(float(w_rec) * np.asarray(tanh_derivs, dtype=float))`.',
        'Return `float(np.prod(factors))` to get total end-to-end scaling factor.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-4-4-lstm-gate',
      difficulty: 'spec',
      requires: ['rnn-sequential-bottleneck'],
      title: 'Lab 4.4B: Implement an LSTM Additive Cell-State Step & Trace Memory Retention',
      prompt:
        'Implement `run_lstm_cell_memory(c_init: float, forget_gates: list[float], input_gates: list[float], candidates: list[float]) -> list[float]` iterating `c = f * c + i * g` at every step and returning the list of cell values `[c_1, c_2, ...]`. Observe how `f = 0.98, i = 0.0` retains `>65%` signal across 20 empty noise steps.',
      starterCode: `def run_lstm_cell_memory(
    c_init: float,
    forget_gates: list[float],
    input_gates: list[float],
    candidates: list[float],
) -> list[float]:
    # Update c = f * c + i * g per step and append to trace
    pass`,
      testCode: `trace_keep = run_lstm_cell_memory(1.0, [0.98]*20, [0.0]*20, [0.0]*20)
assert len(trace_keep) == 20 and trace_keep[-1] > 0.66, f"Expected >0.66 retained after 20 steps, got {trace_keep[-1]}"
trace_forget = run_lstm_cell_memory(1.0, [0.1, 0.5], [0.9, 0.5], [2.0, 4.0])
# Step 1: 0.1*1 + 0.9*2 = 1.9; Step 2: 0.5*1.9 + 0.5*4 = 0.95 + 2.0 = 2.95
assert abs(trace_forget[0] - 1.9) < 1e-6 and abs(trace_forget[1] - 2.95) < 1e-6
print("PASS: LSTM additive cell highway retained long-range memory cleanly!")`,
      solutionCode: `def run_lstm_cell_memory(
    c_init: float,
    forget_gates: list[float],
    input_gates: list[float],
    candidates: list[float],
) -> list[float]:
    c = float(c_init)
    trace = []
    for f, i, g in zip(forget_gates, input_gates, candidates):
        c = float(f) * c + float(i) * float(g)
        trace.append(c)
    return trace`,
      hint: 'Loop over `zip(forget_gates, input_gates, candidates)` updating `c = f * c + i * g` and appending `c`.',
      hints: [
        'Initialize `c = float(c_init)` and `trace = []`.',
        'At each step compute `c = float(f) * c + float(i) * float(g)`.',
        'Append updated `c` into `trace` and return `trace` at the end.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-4-4-scope',
      difficulty: 'debug',
      requires: ['numpy-arrays'],
      title: 'Lab 4.4C: Fix Sequence Padding Dilution in Masked Mean Pooling',
      prompt:
        'A sequence classifier pools `(batch, seq_len, d)` hidden states using naive `np.mean(hidden, axis=1)`, letting trailing `<PAD>` zeros dilute short messages by 4x! Fix `masked_mean_pool(hidden: np.ndarray, mask: np.ndarray) -> np.ndarray` (`mask` shape `(batch, seq_len)` with `1` real / `0` pad) so only real unpadded tokens contribute (`np.maximum(mask_sum, 1e-9)` guards empty sequences).',
      starterCode: `import numpy as np

def masked_mean_pool(hidden: np.ndarray, mask: np.ndarray) -> np.ndarray:
    # BUG: divides sum across ALL seq_len positions including padding zeros!
    return np.mean(hidden, axis=1)`,
      testCode: `import numpy as np
# Batch 0 has 1 real token [10, 20] + 3 padding junk vectors [999, 999] masked out!
H = np.array([
    [[10., 20.], [999., 999.], [999., 999.], [999., 999.]],
    [[2.,  4.],  [6.,   8.],   [0.,   0.],   [0.,   0.]],
])
M = np.array([
    [1., 0., 0., 0.],
    [1., 1., 0., 0.],
])
pooled = masked_mean_pool(H, M)
assert pooled.shape == (2, 2)
assert np.allclose(pooled[0], [10.0, 20.0]), f"Padding junk leaked into pooled[0]! Got {pooled[0]}"
assert np.allclose(pooled[1], [4.0, 6.0]), f"Expected [4, 6] for 2 valid tokens, got {pooled[1]}"
print("PASS: Attention mask isolated valid sequence tokens from padding artifacts!")`,
      solutionCode: `import numpy as np

def masked_mean_pool(hidden: np.ndarray, mask: np.ndarray) -> np.ndarray:
    m = mask[:, :, None].astype(float)
    summed = np.sum(hidden * m, axis=1)
    denom = np.maximum(np.sum(m, axis=1), 1e-9)
    return summed / denom`,
      hint: 'Expand `mask` to `(batch, seq_len, 1)` via `mask[:, :, None]`, multiply `hidden * m`, sum over `axis=1`, and divide by `np.maximum(np.sum(m, axis=1), 1e-9)`.',
      hints: [
        'Broadcast mask over feature axis `d` with `m = mask[:, :, None].astype(float)`.',
        'Zero out pad positions cleanly via `hidden * m` BEFORE summing along `axis=1`.',
        'Divide by token counts `np.maximum(np.sum(m, axis=1), 1e-9)` rather than `hidden.shape[1]`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q4-4-1',
      type: 'multiple-choice',
      question: 'What was the #1 architectural reason Transformers scaled across trillion-token datasets dramatically faster than LSTMs?',
      options: [
        'Transformers contain fewer total trainable weight matrices inside each decoder layer',
        'Self-Attention processes every sequence token in parallel matrix multiplications',
        'LSTMs cannot represent English punctuation or variable-length UTF-8 characters',
        'Transformers avoid backpropagation completely by solving linear equations in closed form',
      ],
      correctIndex: 1,
      explanation: 'Eliminating sequential `t-1 -> t` token loops enabled GPUs to process entire context windows in parallel during training.',
    },
    {
      id: 'q4-4-2',
      type: 'multiple-choice',
      question: 'During autoregressive token-by-token **inference**, what is the key memory tradeoff of Transformers compared to RNNs?',
      options: [
        'Transformers grow an `O(N)` KV Cache with context length; RNNs stay `O(1)`',
        'RNNs allocate a much larger quadratic KV Cache tensor proportional to context length squared',
        'Transformers consume zero GPU memory during generation once the prompt finishes encoding',
        'Both architectures store identical `O(N^2)` attention matrices throughout greedy decoding',
      ],
      correctIndex: 0,
      explanation: 'Caching previous Keys/Values avoids recomputing earlier tokens at `O(N)` VRAM cost, whereas RNNs compress history into fixed-size `O(1)` state.',
    },
    {
      id: 'q4-4-3',
      type: 'multiple-choice',
      question: 'How did LSTMs partially mitigate vanishing gradients compared to vanilla RNNs?',
      options: [
        'By replacing matrix multiplications completely with boosted decision stumps inside each cell',
        'Via an additive cell-state highway controlled by learned forget and input gates',
        'By reversing every sentence backward before passing words into the output softmax layer',
        'By removing all activation non-linearities between consecutive recurrent time steps',
      ],
      correctIndex: 1,
      explanation: 'Additive cell updates (`c_t = f_t * c_{t-1} + ...`) act like a gated residual highway across steps, preserving gradients far longer than pure matrix products.',
    },
    {
      id: 'q4-4-4',
      type: 'numeric',
      question: 'In a vanilla RNN where every step scales gradients by `0.5`, what percentage (`0` to `100`) of original gradient magnitude remains after `4` steps (`0.5^4 * 100`)?',
      options: [],
      correctIndex: 0,
      correctNumber: 6.25,
      tolerance: 0.05,
      unit: '%',
      explanation: '`0.5^4 = 0.0625 = 6.25%` — after just 4 steps, over 93% of the gradient signal vanished!',
    },
    {
      id: 'q4-4-5',
      type: 'spot-bug',
      question: 'Why does a short 2-token query padded inside a 128-token batch lose nearly all signal under `pooled = hidden.mean(axis=1)`?',
      options: [
        'Averaging across all 128 indices mixes 126 `<PAD>` entries into the mean, diluting real tokens 64x',
        'NumPy `mean(axis=1)` removes hidden dimensions whenever tensor rank exceeds two axes',
        'PyTorch automatically turns `<PAD>` tokens into `-inf` floats before mean pooling runs',
        'Short sequences require running K-Means clustering across `axis=2` before classification',
      ],
      correctIndex: 0,
      explanation: 'Without multiplying by `attention_mask` and dividing by `mask.sum()`, padding slots corrupt pooled sequence vectors completely.',
    },
    {
      id: 'q4-4-6',
      type: 'predict-output',
      question: 'In an LSTM cell starting at `c_0 = 10.0` with `forget_gate = 0.9`, `input_gate = 0.0`, and `candidate = 5.0`, what is `c_1`?',
      options: [
        '`14.0` because `candidate = 5.0` adds unconditionally regardless of `input_gate = 0.0`',
        '`9.0` (`0.9 * 10.0 + 0.0 * 5.0`)',
        '`5.0` because a closed input gate resets existing cell memory straight to `candidate`',
        '`0.0` because multiplying by zero `input_gate` wipes the entire cell state cleanly',
      ],
      correctIndex: 1,
      explanation: '`c_1 = 0.9 * 10.0 + 0.0 * 5.0 = 9.0` — a zero input gate protects existing cell memory from noisy irrelevant writes.',
    },
    {
      id: 'q4-4-7',
      type: 'multi-select',
      question: 'Which two responsibilities belong directly to an **Applied AI Engineer** (rather than exclusively to frontier pretraining Researchers)?',
      options: [
        'Building hybrid RAG pipelines, golden CI eval suites, tool-using agents, and deployed FastAPI services',
        'Calculating `BF16`/`INT4` VRAM and KV-cache budgets to pick right-sized GPUs and hit latency SLAs',
        'Writing custom distributed CUDA all-reduce kernels for 4,096-GPU trillion-token pretraining runs',
        'Inventing novel non-Euclidean differential geometry loss functions for multi-month base training',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Applied AI Engineers excel at production LLM engineering, evals, RAG/agents, serving APIs, and VRAM/latency economics.',
    },
    {
      id: 'q4-4-8',
      type: 'multiple-choice',
      question: 'Why must autoregressive next-token forecasting NEVER use a `bidirectional=True` RNN over the full sequence?',
      options: [
        'Because bidirectional layers consume twice as many parameters per layer than unidirectional Transformers',
        'Because PyTorch forbids saving bidirectional checkpoints inside `state_dict` files on Linux',
        'Because backward hidden states peek straight at future tokens `t+1..N`, causing 100% leakage',
        'Because bidirectional LSTMs require integer labels normalized to unit Gaussian variance first',
      ],
      correctIndex: 2,
      explanation: 'A backward pass over future tokens exposes the answer token `t+1` directly while predicting `t`, invalidating causal generation completely.',
    },
    {
      id: 'q4-4-9',
      type: 'ordering',
      question: 'Order how sequence modeling evolved to resolve training bottlenecks and long-range memory limits:',
      items: [
        'Vanilla RNNs passed a single multiplicative hidden state sequentially (`O(N)` depth, sharp gradient decay)',
        'LSTMs added gated additive cell highways (`c_t`) preserving memory longer, still stuck in sequential `O(N)` steps',
        'Transformers removed recurrence via Self-Attention (`O(1)` parallel depth, `O(N)` KV cache)',
        'Modern Hybrid/SSM models combine fast recurrent state scans with periodic Self-Attention for ultra-long contexts',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Vanilla RNN -> Gated LSTM -> Parallel Self-Attention Transformer -> Hybrid SSM + Attention.',
    },
  ],
};
