import type { Lesson } from '@/types/course';

export const lesson5_2: Lesson = {
  id: '5-2',
  moduleId: 'mod-5',
  number: '5.2',
  title: 'Self-Attention, Causal Masking, GQA & KV Caching',
  subtitle: 'Walk through Scaled Dot-Product Attention numerically by hand, master Multi-Head vs Grouped-Query Attention (GQA), and prevent O(N^2) decode recomputation via KV caching.',
  durationMinutes: 85,
  track: 'ai-eng',
  prerequisites: ['5.1', '1.4'],
  requires: ['rope-positional-encoding', 'matrices', 'softmax'],
  teaches: [
    'scaled-dot-product-attention',
    'causal-masking',
    'multi-head-gqa',
    'kv-cache',
  ],
  competencies: ['jr-llm-client', 'mid-observability-cost'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Trace `softmax((Q @ K.T) / sqrt(d_k) + M_causal) @ V` numerically by hand and implement it cleanly in NumPy.',
    'Explain mathematically why dividing by `sqrt(d_k)` prevents Softmax gradient saturation on wide head dimensions.',
    'Compare Multi-Head Attention (MHA), Multi-Query Attention (MQA), and Grouped-Query Attention (GQA) KV-cache memory savings.',
    'Implement incremental `(K_cache, V_cache)` autoregressive decoding and quantify exact memory scaling across layers and sequence lengths.',
  ],
  checkWithoutNotes: [
    'Given `Q`, `K`, and `V` of shape `(seq_len, d_k)` where `d_k = 64`, why do we divide `Q @ K.T` by `8` before Softmax?',
    'Explain what setting the strict upper triangle (`k = 1`) to `-1e9` (`-inf`) guarantees for token `i` during causal language modeling.',
    'If a Llama-style model has `32` Query heads, `8` Key/Value heads (`GQA`), `32` layers, `d_head = 128`, and `BF16` (`2` bytes), how many KV-cache bytes does 1 token consume across all layers?',
    'Contrast the **prefill** phase (`processing 2,000 prompt tokens at once`) vs the **decode** phase (`generating 1 token at a time using KV cache`) in terms of compute vs memory bandwidth.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Inside the Engine of Every Modern Large Language Model',
      paragraphs: [
        'Every capability we associate with modern AI—resolving ambiguous pronouns across ten paragraphs, pulling exact constraints from a system prompt while writing Python, or following multi-hop reasoning inside a tool loop—depends on one repeating matrix primitive: **Scaled Dot-Product Self-Attention**.',
        'Understanding Attention inside out is directly practical for engineering work. When long prompts trigger out-of-memory errors mid-request, when latency dashboards separate slow Time-To-First-Token (**TTFT**) from fast Time-Per-Output-Token (**TPOT**), or when choosing between a `32B` GQA model and an older `MHA` checkpoint on a single 24 GB GPU, every engineering decision reduces straight back to Query-Key-Value shapes, causal masking, and **KV-Cache** memory bandwidth.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Attention Is a Smart, Differentiable Hash-Map Lookup (Beyond Ctrl+F)',
      frontendConcept: 'Exact `Ctrl+F` string search or JavaScript `dict[key]` lookup: either exact literal key match or `undefined`',
      aiConcept: 'Soft Attention: compare `Query` against every token’s `Key`, convert scores with Softmax, and blend `Values`',
      explanation:
        'Normal `Ctrl+F` matches literal strings only. Inside Self-Attention, the word `"it"` broadcasts a **Query** (*"which earlier noun am I referring to?"*), every earlier token advertises a **Key** (*"I am a singular hardware node: server"*), dot products measure semantic compatibility smoothly across all prior tokens, and Softmax converts those scores into percentages that blend each token’s **Value** vector into `"it"`’s updated representation.',
    },
    {
      type: 'math',
      title: 'Scaled Dot-Product Causal Self-Attention',
      latex: '\\text{Attention}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{Q K^T}{\\sqrt{d_k}} + M_{\\text{causal}}\\right) V',
      breakdown: [
        { symbol: 'Q K^T', meaning: 'All-pairs compatibility scores of shape `(seq_len, seq_len)` comparing every Query row against every Key row' },
        { symbol: '\\frac{1}{\\sqrt{d_k}}', meaning: 'Variance normalization: keeps dot-product variance near `1` as $d_k$ grows so Softmax gradients never saturate' },
        { symbol: 'M_{\\text{causal}}', meaning: 'Strict upper triangle ($j > i$) set to $-\\infty$ so token $i$ cannot cheat by reading future tokens' },
      ],
      intuition:
        '**Multi-Head Attention** runs $h$ parallel subspaces (`d_head = d_model / h`) so Head 1 tracks syntax, Head 2 tracks pronouns, and Head 3 matches code brackets. **GQA (Grouped-Query Attention)** lets groups of Query heads share fewer Key/Value heads—slashing KV-cache VRAM and memory traffic cleanly (`4x–8x`) inside modern `local-open-weights` decoders!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Complete Numeric Causal Self-Attention Trace by Hand',
      paragraphs: [
        'Trace every scalar on a 3-token sequence (`d_k = 4`, so `sqrt(d_k) = 2.0`): `Q = [[2, 0, 0, 0], [0, 2, 0, 0], [2, 2, 0, 0]]`, `K = Q`, and `V = [[10, 0], [0, 20], [5, 5]]`. First multiply `Q @ K.T` and divide by `2.0`: Row 0 gives `[4/2, 0, 4/2] = [2.0, 0.0, 2.0]`; Row 1 gives `[0.0, 2.0, 2.0]`; Row 2 gives `[2.0, 2.0, 4.0]`.',
        'Now apply the **causal mask** (`j > i` set to `-inf`): Row 0 (`token 0`) can ONLY see `j <= 0`, becoming `[2.0, -inf, -inf]`. Row 1 (`token 1`) sees `j <= 1`, becoming `[0.0, 2.0, -inf]`. Row 2 (`token 2`) sees all three `[2.0, 2.0, 4.0]`. Take row-wise Softmax! For Row 0, `exp(-inf) = 0`, leaving `[1.0, 0.0, 0.0]`—token 0 attends 100% to itself, returning `V[0] = [10.0, 0.0]`. For Row 1, `exp([0, 2]) / sum = [1 / (1 + 7.389), 7.389 / 8.389] = [0.119, 0.881, 0.0]`, blending `0.119*[10,0] + 0.881*[0,20] = [1.19, 17.62]`. Notice why dividing by `sqrt(d_k)` matters: if `d_k = 100` without `1/sqrt(100)`, dot products reach `+30` vs `+20`, pushing Softmax onto a flat `0.99995` cliff with near-zero gradients!',
      ],
    },
    {
      type: 'visual-diagram',
      diagramId: 'transformer-attention',
      title: 'Inside One Transformer Block: BPE -> Q/K/V Attention + KV Cache -> Next Token',
      caption: 'Every modern autoregressive LLM repeats this Pre-Norm Residual Attention + FFN block dozens of times per forward pass.',
    },
    {
      type: 'concept-reel',
      reelId: 'attention-reel',
      title: 'Animated Walkthrough: How "it" Resolves to "animal" Using Q, K, and V',
      description: 'Step through Query-Key compatibility scoring, causal masking, and weighted Value blending across four concrete scenes.',
    },
    {
      type: 'simulator',
      simulatorId: 'attention-map',
      title: 'Interactive Lab: Self-Attention Heatmap & Causal Mask Inspector',
      description:
        'Click words in a sentence (including pronouns like *"it"*), switch between Syntactic and Coreference attention heads, and toggle Causal Masking to watch attention weights redistribute.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: KV Cache Arithmetic & Grouped-Query Attention (GQA)',
      paragraphs: [
        'Without **KV Caching**, generating token `1,001` requires passing all `1,001` tokens back through every Query, Key, Value projection and computing a full `1001 x 1001` matrix—even though tokens `1..1000` already produced identical `K` and `V` vectors one step earlier! With KV caching, during **decode**, only the **single newest token** `x_t` enters projections to produce `q_t, k_t, v_t` of shape `(1, d_head)`. We append `k_t, v_t` onto cached `K_cache, V_cache` `(t, d_head)` in VRAM and attend strictly `(1, d_head) @ (d_head, t)`—turning `O(N^2)` per step down to `O(N)`!',
        'Look at the exact VRAM math for KV Cache: every cached token stores **2 tensors (`K` and `V`)** across every layer and every KV head. Under classic **MHA** (`32` Query heads = `32` KV heads, `32` layers, `d_head = 128`, `BF16 = 2 bytes`), 1 token costs `2 * 32 * 32 * 128 * 2 = 524,288 bytes = 0.5 MB`! At `8,192` tokens across `16` concurrent users, KV cache alone consumes `8192 * 16 * 0.5 MB = 64 GB`! Switching to **GQA** (`32` Query heads sharing `8` KV heads — group size 4) cuts KV cache cleanly by **4x** (`128 KB/token -> 16 GB` total), which is why virtually all modern `local-open-weights` serving models adopt GQA.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Multi-Head Projections, MQA vs GQA & Prefix KV Caching',
      paragraphs: [
        'Why do LLMs split a 4,096-dimensional model into, say, `32` separate `128`-dimensional heads (`32 * 128 = 4,096`) instead of computing one giant 4,096-dim attention matrix? Because a single Softmax head can focus on only one weighted pattern per row! Running `32` independent heads lets Head 3 attend backward to matching open curly braces `{`, Head 11 track subject-verb agreement across clauses, and Head 24 copy exact API variable names verbatim—all simultaneously in parallel tensor slices, concatenated back together and mixed through output projection matrix `W_O` (`(4096, 4096)`).',
        'Observe how **Multi-Head Attention (MHA)**, **Multi-Query Attention (MQA)**, and **Grouped-Query Attention (GQA)** sit along one clean hardware continuum. MHA assigns 1 private `(K, V)` head to every `Q` head (`32 Q`, `32 KV` — rich capacity, huge VRAM). MQA forces all `32` Query heads to share a single `(K, V)` head (`32 Q`, `1 KV` — tiny VRAM, slight quality dip on complex reasoning). GQA splits the difference cleanly (`32 Q` heads grouped in fours sharing `8 KV` heads), cutting KV VRAM by `4x` with virtually zero accuracy drop! Moreover, modern inference servers (**vLLM**, **SGLang**, and hosted prompt caches) reuse **Prefix KV Caching**: if 500 user requests share the exact same 2,500-token system prompt + tool schemas at prefix index `0`, those `K, V` cache pages are computed ONCE and shared read-only across concurrent sessions, slashing Time-To-First-Token (`TTFT`) and prefill cost dramatically.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Attention & KV-Cache Mistakes & How to Debug Them',
      paragraphs: [
        '1) Masking the diagonal (`k=0` instead of `k=1` in `np.triu`) or masking with `0.0` instead of `-inf` (`-1e9`): masking `k=0` blocks token 0 completely, causing `exp(-inf) / 0.0 -> NaN` on row 0! Masking with `0.0` leaves `exp(0) = 1.0`, leaking future words directly into current representations.',
        '2) Applying Rotary Positional Embeddings (`RoPE`) AFTER concatenating cached `K` or forgetting to offset position index `pos` by `cache_len`: during step-by-step decoding at token `500`, `q_new` and `k_new` MUST rotate by `pos = 500`, NOT `pos = 0`—otherwise every generated word gets treated as sitting at position zero!',
        '3) Omitting **KV Cache quantization or PagedAttention** when serving concurrent requests: naive contiguous KV buffers pre-allocate maximum context length (`8,192` slots) per request even for a 20-token query, wasting huge VRAM blocks until **vLLM / PagedAttention** allocates fixed small memory pages dynamically like OS virtual memory.',
        '4) Confusing bidirectional **Encoder** attention (`BERT` embeddings where every token sees all tokens without causal mask) with causal **Decoder** attention (`GPT`, `Llama`, `Claude`): embedding models intentionally allow left-and-right context mixing, whereas generative LLMs forbid peeking ahead.',
        '5) Ignoring batch-padding masks alongside the causal mask during batched prefill: when packing a 5-token prompt and a 20-token prompt in the same batch, add `-inf` onto `<PAD>` columns too so real words never attend to meaningless pad embeddings!',
        '6) Breaking Prefix KV Caching accidentally by placing dynamic timestamps (`"Current time: 2026-11-21T20:30:01Z"`) or per-user IDs at line 1 of a system prompt: mutating byte 1 invalidates the entire 3,000-token prefix hash! Always keep static system instructions, tool JSON schemas, and shared few-shot examples strictly at the very top of your messages list, appending volatile session dates and user queries at the very end.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Attention Variants & KV Caching',
      headers: ['Architecture', 'KV Heads per 32 Q Heads', 'KV VRAM Footprint', 'Quality & Serving Fit'],
      rows: [
        ['MHA (Multi-Head)', '32 KV heads', 'Highest (1.0x baseline)', 'Rich capacity; hits VRAM limits fast at high concurrency'],
        ['GQA (Grouped-Query)', '4-8 KV heads', '4x-8x smaller KV cache', 'Default production sweet spot with near-zero quality drop'],
        ['MQA (Multi-Query)', '1 shared KV head', '32x smaller KV cache', 'Maximum batch concurrency; slight drop on dense reasoning'],
        ['Prefix KV Cache (vLLM/API)', 'Shared read-only prefix blocks', 'Reuses prompt prefix once across traffic', 'Requires static system/tool prefix placed strictly at line 1'],
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 5.2 Recap: Attention, GQA & KV Caching',
      body: '- Divide `Q @ K.T` by `sqrt(d_k)` so dot-product variance stays near `1` and Softmax gradients stay alive.\n- Apply `np.triu(..., k=1)` with `-inf` (`-1e9`) so token `i` attends strictly to past/self positions `<= i`.\n- KV caching appends `(k_t, v_t)` once per decode step, eliminating `O(N^2)` recomputation during generation.\n- Grouped-Query Attention (GQA) shares fewer KV heads across Q heads, cutting KV-cache VRAM 4x–8x cleanly.\n- Always apply padding masks alongside causal masks and increment RoPE positions across decode steps.',
    },
    {
      type: 'python-lab',
      labId: 'lab-5-2',
      difficulty: 'guided',
      requires: ['scaled-dot-product-attention', 'softmax'],
      title: 'Lab 5.2A: Causal Self-Attention From Scratch in NumPy',
      prompt:
        'Implement `causal_attention(Q, K, V)` where `Q, K, V` have shape `(seq_len, d_k)`. Compute `(Q @ K.T) / np.sqrt(d_k)`, mask upper-triangular future offsets (`k = 1`) with `-1e9`, apply row-wise Softmax (`softmax_rows`), and multiply by `V`.',
      starterCode: `import numpy as np

def softmax_rows(x: np.ndarray) -> np.ndarray:
    shifted = x - np.max(x, axis=-1, keepdims=True)
    exps = np.exp(shifted)
    return exps / np.sum(exps, axis=-1, keepdims=True)

def causal_attention(Q: np.ndarray, K: np.ndarray, V: np.ndarray) -> np.ndarray:
    seq_len, d_k = Q.shape
    # 1. scores = (Q @ K.T) / np.sqrt(d_k)
    # 2. Apply upper-triangular mask (k=1) set to -1e9
    # 3. weights = softmax_rows(scores)
    # 4. return weights @ V
    pass

rng = np.random.default_rng(0)
Q = rng.normal(size=(4, 8))
K = rng.normal(size=(4, 8))
V = np.eye(4, 8)
print(np.round(causal_attention(Q, K, V), 3))`,
      testCode: `import numpy as np
Q = np.array([[1., 0.], [0., 1.], [1., 1.]])
K = np.array([[1., 0.], [0., 1.], [1., 1.]])
V = np.array([[10., 0.], [0., 20.], [0., 0.]])
out = causal_attention(Q, K, V)
assert out.shape == (3, 2), f"Expected (3, 2), got {out.shape}"
assert np.allclose(out[0], [10.0, 0.0]), f"Token 0 can only attend to itself! Got {out[0]}"
assert out[1, 1] > out[1, 0], "Token 1 should attend strongly to token 1 over token 0"
print("PASS: Causal Self-Attention matches exact Transformer behavior!")`,
      solutionCode: `import numpy as np

def softmax_rows(x: np.ndarray) -> np.ndarray:
    shifted = x - np.max(x, axis=-1, keepdims=True)
    exps = np.exp(shifted)
    return exps / np.sum(exps, axis=-1, keepdims=True)

def causal_attention(Q: np.ndarray, K: np.ndarray, V: np.ndarray) -> np.ndarray:
    seq_len, d_k = Q.shape
    scores = (Q @ K.T) / np.sqrt(d_k)
    mask = np.triu(np.ones((seq_len, seq_len), dtype=bool), k=1)
    scores = np.where(mask, -1e9, scores)
    weights = softmax_rows(scores)
    return weights @ V`,
      hint: 'Use `np.triu(np.ones((seq_len, seq_len), dtype=bool), k=1)` so token `i` attends solely to `j <= i` (`k=1` preserves the diagonal).',
      hints: [
        'Compute `scores = (Q @ K.T) / np.sqrt(d_k)`.',
        'Create upper-triangular boolean mask with `np.triu(np.ones((seq_len, seq_len), dtype=bool), k=1)` and replace masked scores with `-1e9`.',
        'Return `softmax_rows(scores) @ V`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-5-2-gqa',
      difficulty: 'spec',
      requires: ['multi-head-gqa', 'kv-cache'],
      title: 'Lab 5.2B: GQA KV-Cache Memory Calculator (GB)',
      prompt:
        'Implement `kv_cache_gb(n_layers: int, n_kv_heads: int, d_head: int, seq_len: int, batch_size: int, bytes_per_elem: int = 2) -> float` computing exact KV cache memory across K and V tensors in binary gigabytes (`1024 ** 3`). Compare 32 MHA heads vs 8 GQA KV heads.',
      starterCode: `def kv_cache_gb(
    n_layers: int,
    n_kv_heads: int,
    d_head: int,
    seq_len: int,
    batch_size: int,
    bytes_per_elem: int = 2,
) -> float:
    # Multiply 2 (K and V) * n_layers * n_kv_heads * d_head * seq_len * batch_size * bytes_per_elem
    # Divide by (1024 ** 3)
    pass`,
      testCode: `mha = kv_cache_gb(32, 32, 128, 8192, 16, bytes_per_elem=2)
gqa = kv_cache_gb(32, 8, 128, 8192, 16, bytes_per_elem=2)
assert abs(mha - 64.0) < 1e-6, f"Expected 64.0 GiB for MHA, got {mha}"
assert abs(gqa - 16.0) < 1e-6, f"Expected 16.0 GiB for 4x-grouped GQA, got {gqa}"
print("PASS: Exact KV cache formula verified 4x GQA memory reduction (64 GiB -> 16 GiB)!")`,
      solutionCode: `def kv_cache_gb(
    n_layers: int,
    n_kv_heads: int,
    d_head: int,
    seq_len: int,
    batch_size: int,
    bytes_per_elem: int = 2,
) -> float:
    total_bytes = 2 * n_layers * n_kv_heads * d_head * seq_len * batch_size * bytes_per_elem
    return float(total_bytes / (1024 ** 3))`,
      hint: 'Multiply `2 * n_layers * n_kv_heads * d_head * seq_len * batch_size * bytes_per_elem` and divide by `1024 ** 3`.',
      hints: [
        'Factor `2` accounts for storing BOTH Key and Value tensors per token.',
        'Multiply across `n_layers * n_kv_heads * d_head * seq_len * batch_size * bytes_per_elem`.',
        'Divide total bytes by `1024 ** 3` to convert cleanly into GiB.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-5-2-kvcache',
      difficulty: 'debug',
      requires: ['kv-cache', 'numpy-arrays'],
      title: 'Lab 5.2C: Fix Broken Incremental KV-Cache Decode Step',
      prompt:
        'A broken decoder overwrites `K_cache` with ONLY the latest `k_new` instead of concatenating onto prior cached steps, losing all context memory! Fix `decode_step_with_cache(q_new, k_new, v_new, K_cache, V_cache)` so it appends `(k_new, v_new)` along `axis=0` (or initializes if `None`), runs scaled attention `(q_new @ updated_K.T) / sqrt(d_k)` -> softmax -> `@ updated_V`, and returns `(attn_out, updated_K, updated_V)`.',
      starterCode: `import numpy as np

def _sm(x):
    s = x - np.max(x, axis=-1, keepdims=True)
    e = np.exp(s)
    return e / np.sum(e, axis=-1, keepdims=True)

def decode_step_with_cache(q_new: np.ndarray, k_new: np.ndarray, v_new: np.ndarray, K_cache=None, V_cache=None):
    # BUG: overwrites cache instead of concatenating along axis=0!
    updated_K = k_new
    updated_V = v_new
    d_k = q_new.shape[-1]
    weights = _sm((q_new @ updated_K.T) / np.sqrt(d_k))
    return weights @ updated_V, updated_K, updated_V`,
      testCode: `import numpy as np
k0, v0 = np.array([[10., 0.]]), np.array([[100., 0.]])
k1, v1 = np.array([[0., 1.]]),  np.array([[0., 5.]])
# q1 matches k0 strongly! Without appending k0 in cache, q1 cannot see v0=100!
q1 = np.array([[10., 0.]])
out0, K_c, V_c = decode_step_with_cache(np.array([[1., 0.]]), k0, v0, None, None)
out1, K_c, V_c = decode_step_with_cache(q1, k1, v1, K_c, V_c)
assert K_c.shape == (2, 2) and V_c.shape == (2, 2)
assert out1[0, 0] > 99.0, f"Query matching cached k0 must attend to v0=100, got {out1}"
print("PASS: Incremental KV-cache concatenation preserved past context during O(N) decoding!")`,
      solutionCode: `import numpy as np

def _sm(x):
    s = x - np.max(x, axis=-1, keepdims=True)
    e = np.exp(s)
    return e / np.sum(e, axis=-1, keepdims=True)

def decode_step_with_cache(q_new: np.ndarray, k_new: np.ndarray, v_new: np.ndarray, K_cache=None, V_cache=None):
    updated_K = k_new if K_cache is None else np.concatenate([K_cache, k_new], axis=0)
    updated_V = v_new if V_cache is None else np.concatenate([V_cache, v_new], axis=0)
    d_k = q_new.shape[-1]
    weights = _sm((q_new @ updated_K.T) / np.sqrt(d_k))
    return weights @ updated_V, updated_K, updated_V`,
      hint: 'Check `if K_cache is None` first; otherwise concatenate `[K_cache, k_new]` and `[V_cache, v_new]` along `axis=0`.',
      hints: [
        'Handle initial decode step with `k_new if K_cache is None else np.concatenate([K_cache, k_new], axis=0)`.',
        'Do the exact same `axis=0` append for `V_cache` and `v_new`.',
        'Notice single-token query `q_new` needs NO causal mask because every entry in `K_cache` came strictly from past or current positions `<= t`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q5-2-1',
      type: 'multiple-choice',
      question: 'Why do we divide `Q @ K.T` by `sqrt(d_k)` before Softmax inside Self-Attention?',
      options: [
        'To force rectangular non-square sequence matrices into matching square dimensions before transposition',
        'Dot product variance grows with `d_k`, so scaling prevents Softmax saturation',
        'To prevent early tokens inside causal language models from peeking at future prompt tokens',
        'To double gradient step magnitudes whenever Transformer widths grow beyond 1,024 dimensions',
      ],
      correctIndex: 1,
      explanation: 'When `q` and `k` have unit variance across `d_k` elements, `q · k` has variance `d_k` (std `sqrt(d_k)`). Dividing restores unit scale before `exp()`.',
    },
    {
      id: 'q5-2-2',
      type: 'multiple-choice',
      question: 'What redundant computation does **KV Caching** eliminate during autoregressive LLM decoding?',
      options: [
        'Recomputing Keys and Values for all previously generated tokens at every step',
        'Loading pretrained Transformer MLP weights from GPU global memory during prefill evaluation',
        'Running row-wise Softmax normalization over vocabulary logits in the final language modeling head',
        'Tokenizing incoming user UTF-8 prompt strings into integer IDs before embedding lookups',
      ],
      correctIndex: 0,
      explanation: 'Prior tokens produce identical K and V vectors regardless of newer tokens; caching them shrinks per-token decode work from `O(N^2)` recomputation down to `O(N)`.',
    },
    {
      id: 'q5-2-3',
      type: 'multiple-choice',
      question: 'Why do modern `local-open-weights` LLMs adopt Grouped-Query Attention (GQA) instead of full Multi-Head Attention (MHA)?',
      options: [
        'GQA shares fewer KV heads across Q heads, cutting KV-cache VRAM and bandwidth',
        'Because GQA eliminates Query projections completely, turning every layer into a linear feed-forward block',
        'Because GQA disables Rotary Positional Embeddings whenever sequence context lengths exceed 4,096',
        'Because GQA doubles total embedding parameter counts automatically during post-training alignment',
      ],
      correctIndex: 0,
      explanation: 'Sharing 1 KV head per 4–8 Query heads shrinks KV-cache memory size and HBM bandwidth reads 4x–8x with nearly identical quality.',
    },
    {
      id: 'q5-2-4',
      type: 'numeric',
      question: 'In Causal Self-Attention with `d_k = 64`, what constant scalar divides `Q @ K.T` before masking and Softmax?',
      options: [],
      correctIndex: 0,
      correctNumber: 8,
      tolerance: 0,
      unit: '',
      explanation: '`sqrt(64) = 8`.',
    },
    {
      id: 'q5-2-5',
      type: 'spot-bug',
      question: 'Why does replacing `-1e9` with `0.0` in the upper triangle of causal attention break language modeling?',
      code: `mask = np.triu(np.ones((n, n), dtype=bool), k=1)
scores = np.where(mask, 0.0, raw_scores)  # BUG: used 0.0 instead of -inf!
weights = softmax_rows(scores)`,
      options: [
        'Replacing upper-triangular entries with `0.0` causes NumPy `np.exp()` to return `NaN` immediately',
        '`exp(0.0) = 1.0`, so every token still leaks future tokens instead of receiving zero weight',
        'Masking with `0.0` skips all diagonal self-attention entries (`i == j`) during prefill passes',
        'Row-wise Softmax ignores negative scores completely unless masked positions contain `0.0`',
      ],
      correctIndex: 1,
      explanation: 'Because `exp(0.0) = 1.0`, masked future tokens still receive large non-zero attention probability! Only `-inf` (or `-1e9`) sends `exp(-inf) -> 0.0`.',
    },
    {
      id: 'q5-2-6',
      type: 'predict-output',
      question: 'For token `0` in Causal Self-Attention over a 5-token prompt (`V` shape `(5, d_v)`), what vector does token `0` always output after masking and Softmax?',
      options: [
        'Zero vector `[0, 0, ..., 0]` because token `0` has no preceding context tokens to attend backward onto',
        'Uniform average of all 5 value vectors `[V[0]..V[4]] / 5` regardless of Query/Key similarity scores',
        '`V[0]` (`100%` self-attention, since `j > 0` are masked to zero weight)',
        '`V[4]` because causal masks shift every row output forward by one position',
      ],
      correctIndex: 2,
      explanation: 'Token `0` can attend only to `j <= 0`, leaving a single unmasked entry `[score_00, -inf, -inf, ...]` whose Softmax is `[1.0, 0, 0, ...]`, returning `1.0 * V[0]`.',
    },
    {
      id: 'q5-2-7',
      type: 'multi-select',
      question: 'Which two statements accurately contrast **Prefill** vs **Decode** in LLM inference?',
      options: [
        'Prefill processes all user prompt tokens together in parallel matrix multiplies (compute-bound, drives **TTFT**)',
        'Decode generates one output token per step reading the full KV cache from HBM (memory-bandwidth bound, drives **TPOT**)',
        'Prefill generates outputs strictly one token per step without utilizing GPU tensor cores',
        'Decode requires no access to previously cached Key and Value tensors',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Prefill saturates parallel compute across prompt tokens (affecting TTFT); decode streams 1 token at a time bottlenecked by reading weights and KV cache (TPOT).',
    },
    {
      id: 'q5-2-8',
      type: 'multiple-choice',
      question: 'Why does an incremental decode step (`q_new` shape `(1, d_k)` against `K_cache` shape `(t, d_k)`) NOT need an upper-triangular causal mask?',
      options: [
        'Because `q_new` represents the newest token `t`, and every entry in `K_cache` sits at past positions `<= t`',
        'Because `softmax` automatically ignores Keys whose norms are smaller than the newest Query',
        'Because Grouped-Query Attention shares causal masks globally across all batch items without recomputing',
        'Because decoding steps run attention weights strictly through ReLU instead of row-wise Softmax',
      ],
      correctIndex: 0,
      explanation: 'Future tokens `> t` do not exist in `K_cache` yet, so token `t` is allowed to attend to every cached token `0..t`.',
    },
    {
      id: 'q5-2-9',
      type: 'ordering',
      question: 'Order one forward execution of Causal Self-Attention for a prompt during Prefill:',
      items: [
        'Project hidden states `X` into Query, Key, and Value tensors (`Q`, `K`, `V`)',
        'Compute pairwise dot products `Q @ K.T` and divide by `sqrt(d_k)`',
        'Add upper-triangular `-inf` mask (`j > i`) blocking future token visibility',
        'Normalize each row via `softmax` to obtain attention probability weights',
        'Multiply weights by `V` to produce context-aware token representations',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Project Q/K/V -> scale `QK^T / sqrt(d_k)` -> causal mask -> row Softmax -> blend `V`.',
    },
  ],
};
