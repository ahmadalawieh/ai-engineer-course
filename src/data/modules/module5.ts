import type { CourseModule } from '@/types/course';

export const module5: CourseModule = {
  id: 'mod-5',
  number: 5,
  title: 'Transformers & LLMs Under the Hood',
  subtitle: 'BPE tokenization, scaled dot-product self-attention, KV caching, RoPE, scaling laws, MoE, and SFT/DPO/RL post-training.',
  track: 'ai-eng',
  estimatedHours: 4,
  capstoneDeliverable: 'Implement Causal Multi-Head Self-Attention in pure NumPy & size an LLM VRAM cluster.',
  lessons: [
    {
      id: '5-1',
      moduleId: 'mod-5',
      number: '5.1',
      title: 'Tokenization (BPE), Embeddings & Rotary Positions (RoPE)',
      subtitle: 'Why LLMs struggle to count letters in "strawberry", how BPE works, and how RoPE encodes relative order.',
      durationMinutes: 15,
      track: 'ai-eng',
      prerequisites: ['1.2', '4.4'],
      objectives: [
        'Trace the Byte-Pair Encoding (BPE) merge algorithm from UTF-8 bytes to subword tokens.',
        'Explain why tokenization quirks cause math, spelling, and trailing-space bugs.',
        'Understand why Transformers need positional encoding and how RoPE rotates Q/K vectors by relative distance.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'LLMs Never See Letters or Words—Only Integer Token IDs',
          paragraphs: [
            'Character-level models produce sequences that are too long; word-level vocabularies explode to millions of rare words and fail on typos. **Byte-Pair Encoding (BPE)** starts from 256 raw UTF-8 bytes and repeatedly merges the most frequent adjacent pair into a new token until reaching a vocabulary size (e.g., 50k–128k tokens).',
            'Why LLMs misspell or fail digit arithmetic: `"strawberry"` might split into `["str", "aw", "berry"]`, and `"123456"` might split into `["123", "456"]`. The model literally never saw individual letters unless taught!',
            '**Positional Information (RoPE)**: Self-attention is permutation-invariant (a bag of tokens!). **Rotary Positional Embeddings (RoPE)** rotate Query and Key vectors in 2D pairs by an angle proportional to token position $m$. When computing $q_m \\cdot k_n$, the dot product depends **only on relative offset $(m - n)$**, generalizing cleanly to long contexts.',
          ],
        },
        {
          type: 'simulator',
          simulatorId: 'bpe-tokenizer',
          title: 'Interactive Lab: Subword Tokenizer & Token Economics Explorer',
          description:
            'Type any prompt, code snippet, or non-English text to inspect how subword tokenization splits words, spaces, numbers, and JSON—plus estimated token counts and API cost.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Trailing Space Bug in Prompting',
          body: 'In BPE, `"apple"` and `" apple"` (with leading space) are **completely different token IDs**! Never end a prompt with a trailing space when expecting completions, and always strip trailing whitespace in prompt templates.',
        },
      ],
      quiz: [
        {
          id: 'q5-1-1',
          question: 'Why did modern LLMs adopt Byte-level BPE (BBPE) instead of whole-word vocabularies?',
          options: [
            'Whole-word vocabularies cannot handle unseen typos, code identifiers, or rare words without `<UNK>`, whereas BBPE falls back cleanly to raw bytes with zero `<UNK>` tokens',
            'BBPE reduces vocabulary size to 10 tokens',
            'Whole-word vocabularies only work in Python',
            'BBPE eliminates embeddings',
          ],
          correctIndex: 0,
          explanation: 'Because the base alphabet contains all 256 bytes, any UTF-8 string (emoji, Python, Arabic, typos) can be losslessly tokenized without unknown `<UNK>` tokens.',
        },
        {
          id: 'q5-1-2',
          question: 'Why does a Transformer need positional encodings like RoPE?',
          options: [
            'To compress weights to 4 bits',
            'Because pure self-attention treats input tokens as an unordered set—swapping "dog bit man" and "man bit dog" would yield identical outputs without positions',
            'To replace Softmax',
            'Because GPUs cannot sort arrays',
          ],
          correctIndex: 1,
          explanation: 'Attention dot products compare every token to every other symmetrically; positional encoding injects sequence order.',
        },
        {
          id: 'q5-1-3',
          question: 'What key property makes RoPE superior to early fixed sinusoidal positional additions?',
          options: [
            'RoPE rotates Q and K vectors so their dot product naturally encodes **relative distance** $(m - n)$ between tokens',
            'RoPE removes the need for Key matrices',
            'RoPE only encodes the first 10 tokens',
            'RoPE runs on CPUs only',
          ],
          correctIndex: 0,
          explanation: 'By rotating Q and K in 2D subspaces, $R_m q \\cdot R_n k$ depends strictly on $(m - n)$, helping length generalization.',
        },
      ],
    },
    {
      id: '5-2',
      moduleId: 'mod-5',
      number: '5.2',
      title: 'Self-Attention, Causal Masking & KV Cache',
      subtitle: 'Demystify Queries, Keys, Values as a differentiable hash-map lookup—then build it in NumPy.',
      durationMinutes: 20,
      track: 'ai-eng',
      prerequisites: ['1.2', '1.4', '5.1'],
      objectives: [
        'Explain Q, K, V matrices intuitively and compute Scaled Dot-Product Attention.',
        'Explain why we divide by $\\sqrt{d_k}$ and why decoder LLMs apply a lower-triangular causal mask.',
        'Understand Multi-Head Attention, GQA (Grouped-Query Attention), and KV Caching.',
      ],
      blocks: [
        {
          type: 'frontend-bridge',
          title: 'Attention Is a Smart, Flexible Lookup (Beyond Ctrl+F)',
          frontendConcept: 'Exact `Ctrl+F` search or dictionary lookup: matches one exact word, or returns nothing',
          aiConcept: 'Soft Attention: compare a `Query` against every word’s `Key`, score relevance, and blend their `Values`',
          explanation:
            'Regular `Ctrl+F` only finds exact word matches. In Attention, the word `"it"` sends out a **Query** (*"which earlier noun am I talking about?"*), every earlier word holds a **Key** (*"I am a singular machine: server"*), and Softmax turns those match scores into a weighted blend of their **Value** meanings.',
        },
        {
          type: 'math',
          title: 'Scaled Dot-Product Causal Attention',
          latex: '\\text{Attention}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{Q K^T}{\\sqrt{d_k}} + M_{\\text{causal}}\\right) V',
          breakdown: [
            { symbol: 'Q K^T', meaning: 'All-pairs compatibility scores of shape `(seq_len, seq_len)`' },
            { symbol: '\\frac{1}{\\sqrt{d_k}}', meaning: 'Variance scaling: stops large $d_k$ dot products from saturating Softmax into tiny gradients' },
            { symbol: 'M_{\\text{causal}}', meaning: 'Upper triangle set to $-\\infty$ so token $t$ cannot peek at future tokens $> t$' },
          ],
          intuition:
            '**Multi-Head Attention** runs $h$ parallel attention heads with smaller projections so Head 1 tracks syntax, Head 2 tracks pronouns, and Head 3 tracks code brackets. **GQA (Grouped-Query Attention)** shares Key/Value heads across groups of Query heads—slashing KV-cache VRAM by 4–8× in Llama-3 and Qwen!',
        },
        {
          type: 'simulator',
          simulatorId: 'attention-map',
          title: 'Interactive Lab: Self-Attention Heatmap & Causal Mask Inspector',
          description:
            'Click tokens in a sentence (including ambiguous pronouns like *"it"*), switch between Syntactic and Coreference heads, and toggle Causal Masking to watch attention weights redistribute.',
        },
        {
          type: 'python-lab',
          labId: 'lab-5-2',
          title: 'Lab 5.2: Causal Self-Attention From Scratch in NumPy',
          prompt:
            'Implement `causal_attention(Q, K, V)` where `Q, K, V` have shape `(seq_len, d_k)`. Apply $\\frac{QK^T}{\\sqrt{d_k}}$, mask future positions (`triu(..., k=1)`) with `-1e9`, apply row-wise Softmax, and multiply by `V`.',
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
          hint: 'Use `np.triu(np.ones((seq_len, seq_len), dtype=bool), k=1)` so position `i` only sees `j <= i` (`k=1` excludes the diagonal).',
          packages: ['numpy'],
        },
      ],
      quiz: [
        {
          id: 'q5-2-1',
          question: 'Why do we divide $Q K^T$ by $\\sqrt{d_k}$ before Softmax?',
          options: [
            'To make the matrix square',
            'Because dot product variance grows linearly with $d_k$; without scaling, huge scores push Softmax into saturation where gradients vanish',
            'To enforce causal masking',
            'To double the learning rate',
          ],
          correctIndex: 1,
          explanation: 'If $q, k$ components have unit variance, $q \\cdot k$ has variance $d_k$ (std $\\sqrt{d_k}$). Dividing restores unit variance.',
        },
        {
          id: 'q5-2-2',
          question: 'What does **KV Caching** eliminate during autoregressive token generation?',
          options: [
            'Recomputing Key and Value vectors for all previously generated tokens at every single decode step',
            'Storing model weights on disk',
            'Using Softmax in the output head',
            'Tokenizing the prompt',
          ],
          correctIndex: 0,
          explanation: 'Without KV cache, generating $N$ tokens takes $O(N^3)$ compute; caching prior $K, V$ reduces each step to $O(N)$ attention against cached tensors.',
        },
        {
          id: 'q5-2-3',
          question: 'Why do Llama-3, Mistral, and Qwen use Grouped-Query Attention (GQA) instead of standard Multi-Head Attention (MHA)?',
          options: [
            'GQA shares fewer Key/Value heads across Query heads, dramatically cutting KV-cache memory bandwidth and VRAM usage with minimal quality loss',
            'GQA removes the Query projection',
            'GQA eliminates positional embeddings',
            'GQA doubles parameter count',
          ],
          correctIndex: 0,
          explanation: 'Inference decoding is memory-bandwidth bound on reading the KV cache; GQA shrinks KV cache size by 4×–8×.',
        },
      ],
    },
    {
      id: '5-3',
      moduleId: 'mod-5',
      number: '5.3',
      title: 'Pretraining, Scaling Laws, MoE & GPU Memory Math',
      subtitle: 'Size hardware for any open-weights LLM and understand Chinchilla scaling & Mixture-of-Experts.',
      durationMinutes: 15,
      track: 'ai-eng',
      prerequisites: ['4.2', '5.2'],
      objectives: [
        'Calculate exact VRAM needed for model weights (FP16 vs INT4), AdamW optimizer states, and KV cache.',
        'Explain Chinchilla Scaling Laws (tokens vs parameters) and Inference-Time overtraining.',
        'Understand Sparse Mixture-of-Experts (MoE) routing and FlashAttention IO-awareness.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Every AI Engineer Must Know Back-of-the-Envelope VRAM Math',
          paragraphs: [
            'A **70B parameter model** in `BF16` (2 bytes/param) takes `70 × 2 = 140 GB` just to load weights! Quantized to `4-bit` (`0.5 bytes/param`), weights shrink to `~35–40 GB`—fitting on a single 48GB GPU or two 24GB GPUs.',
            'During **full training**, memory balloons to **~16–18 bytes per parameter**: 2 bytes weights (`BF16`) + 2 bytes gradients + 12 bytes AdamW optimizer states (`FP32` master copy + momentum + variance) + activations!',
            '**Mixture-of-Experts (MoE)** (e.g., Mixtral, DeepSeek-V3) replaces the dense Feed-Forward block with 8–256 smaller expert FFNs plus a lightweight router that picks only the top-2 experts per token. Result: **massive knowledge capacity (e.g. 671B total params) at tiny active inference cost (37B active params/token)!**',
          ],
        },
        {
          type: 'simulator',
          simulatorId: 'llm-vram',
          title: 'Interactive Lab: LLM VRAM, KV Cache & Quantization Calculator',
          description:
            'Select parameter count (7B to 405B), precision (FP32/BF16/INT8/INT4), context length, batch size, and GQA ratio to see exact GPU VRAM requirements and multi-GPU hardware recommendations.',
        },
        {
          type: 'callout',
          variant: 'key-takeaway',
          title: 'Chinchilla vs Inference-Optimal Scaling',
          body: 'DeepMind’s **Chinchilla** rule showed compute-optimal pretraining uses **~20 tokens per parameter** (e.g., 1.4T tokens for 70B). Modern models like Llama-3-8B intentionally "overtrain" on **15T tokens** (~1,800× params!) because inference runs millions of times—paying more training cost once makes a smaller, cheaper 8B model punch far above its weight.',
        },
      ],
      quiz: [
        {
          id: 'q5-3-1',
          question: 'Roughly how much GPU VRAM is needed just to load an **8B parameter** model’s weights in **BF16** (without KV cache)?',
          options: ['4 GB', '8 GB', '16 GB', '64 GB'],
          correctIndex: 2,
          explanation: 'BF16 uses 2 bytes per parameter: $8 \\times 10^9 \\times 2\\text{ bytes} \\approx 16\\text{ GB}$.',
        },
        {
          id: 'q5-3-2',
          question: 'What is the main advantage of a Sparse Mixture-of-Experts (MoE) LLM over a dense LLM of the same total parameter count?',
          options: [
            'MoE uses zero RAM for weights',
            'Only a small subset of experts activates per token, giving much faster inference FLOPs for a given total capacity',
            'MoE eliminates tokenization',
            'MoE requires no router',
          ],
          correctIndex: 1,
          explanation: 'You still store all expert weights in VRAM, but per-token FLOPs scale only with active parameters (e.g. 2 of 8 experts).',
        },
        {
          id: 'q5-3-3',
          question: 'Why does FlashAttention speed up Transformers 2–4× without changing mathematical outputs?',
          options: [
            'It approximates Softmax with ReLU',
            'It tiles Q, K, V in fast GPU on-chip SRAM to avoid materializing the huge $N \\times N$ attention matrix in slow HBM VRAM',
            'It deletes half the attention heads',
            'It runs attention on the CPU',
          ],
          correctIndex: 1,
          explanation: 'FlashAttention is an IO-aware exact algorithm: keeping softmax tiling in SRAM slashes HBM memory reads/writes and drops attention memory from $O(N^2)$ to $O(N)$.',
        },
      ],
    },
    {
      id: '5-4',
      moduleId: 'mod-5',
      number: '5.4',
      title: 'Post-Training: SFT, RLHF, DPO & Reasoning Models',
      subtitle: 'Turn a raw next-token predictor into a helpful assistant—and understand sampling controls (Temp, Top-p).',
      durationMinutes: 16,
      track: 'ai-eng',
      prerequisites: ['1.4', '5.3'],
      objectives: [
        'Explain the 3-stage LLM training pipeline: Pretraining $\\rightarrow$ SFT $\\rightarrow$ Preference/RL Alignment.',
        'Contrast RLHF (Reward Model + PPO) vs DPO vs Verifiable-Reward RL (GRPO for reasoning).',
        'Control generation quality precisely via Temperature, Top-k, Top-p (Nucleus Sampling), and Logprobs.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Why Base Models Aren’t Assistants Yet',
          paragraphs: [
            'A pretrained base LLM only knows how to autocomplete the internet: ask *"What is the capital of France?"* and it might continue with *"What is the capital of Germany? What is..."* because that looks like a trivia webpage.',
            '1. **Supervised Fine-Tuning (SFT)**: Train on 10k–1M high-quality `(instruction, ideal_response)` chat pairs using standard Cross-Entropy loss (masking the user prompt tokens so loss only applies to assistant tokens).',
            '2. **Preference Alignment (RLHF / DPO)**: Humans rank `(chosen, rejected)` response pairs. **PPO** trains a separate Reward Model first; **DPO (Direct Preference Optimization)** skips the reward model completely and optimizes policy log-probs directly against a frozen reference model.',
            '3. **Reasoning RL (o1 / R1 / GRPO)**: Train on verifiable math/coding tasks where an automated unit-test/verifier awards $+1$ or $0$. The model organically learns to spend **test-time compute** thinking, backtracking, and verifying inside `<think>` tokens before answering!',
          ],
        },
        {
          type: 'simulator',
          simulatorId: 'sampling-lab',
          title: 'Interactive Lab: Temperature, Top-k & Top-p (Nucleus) Sampling Explorer',
          description:
            'Adjust Temperature ($T$), Top-$k$, and Top-$p$ on real LLM logit distributions to watch probability mass sharpen onto deterministic answers or flatten into creative exploration.',
        },
        {
          type: 'table',
          title: 'Recommended Decoding Settings by Production Task',
          headers: ['Task', 'Temperature', 'Top-p', 'Why'],
          rows: [
            ['JSON extraction / SQL / Classification', '`0.0` – `0.1`', '`1.0`', 'Deterministic, maximizes schema adherence & reproducibility'],
            ['Code generation / RAG QA', '`0.1` – `0.3`', '`0.9`', 'Grounded precision with tiny tie-breaking flexibility'],
            ['Brainstorming / Creative writing', '`0.7` – `0.9`', '`0.95`', 'Diverse phrasing without sampling garbage tail tokens'],
          ],
        },
      ],
      quiz: [
        {
          id: 'q5-4-1',
          question: 'What happens when you set `temperature = 0` (or very close to 0) during LLM inference?',
          options: [
            'The model samples uniformly at random across the entire vocabulary',
            'Logits divide by ~0, concentrating 100% probability on the single highest-logit token (greedy decoding)',
            'The model stops using the KV cache',
            'The context window doubles',
          ],
          correctIndex: 1,
          explanation: 'Dividing logits by $T \\to 0^+$ makes the largest logit infinitely bigger than others after Softmax, yielding deterministic greedy argmax.',
        },
        {
          id: 'q5-4-2',
          question: 'How does **Top-p (Nucleus) sampling** improve over fixed **Top-k**?',
          options: [
            'Top-p dynamically adapts the candidate set size—picking 1–2 tokens when the model is very confident, and more tokens when uncertainty is high',
            'Top-p always selects exactly 50 tokens',
            'Top-p runs before the Transformer forward pass',
            'Top-p disables Softmax',
          ],
          correctIndex: 0,
          explanation: 'Sorting probabilities descending and stopping at cumulative mass $p$ (e.g. 0.9) adapts naturally to peaked vs flat distributions.',
        },
        {
          id: 'q5-4-3',
          question: 'What advantage does **DPO (Direct Preference Optimization)** have over classic PPO-based RLHF?',
          options: [
            'DPO works without any preference pairs',
            'DPO eliminates training a separate Reward Model and unstable RL PPO loops, reducing alignment to a simple supervised binary classification loss over `(chosen, rejected)` pairs',
            'DPO requires 4 models in memory instead of 2',
            'DPO only works on CNNs',
          ],
          correctIndex: 1,
          explanation: 'DPO analytically reparameterizes the optimal RLHF reward in terms of the policy and reference log-probabilities, stabilizing training.',
        },
      ],
    },
  ],
};
