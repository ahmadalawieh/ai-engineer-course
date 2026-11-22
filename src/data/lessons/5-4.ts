import type { Lesson } from '@/types/course';

export const lesson5_4: Lesson = {
  id: '5-4',
  moduleId: 'mod-5',
  number: '5.4',
  title: 'Post-Training: SFT, RLHF, DPO, Reasoning RL & Decoding Controls',
  subtitle: 'Turn raw next-token autocomplete into reliable assistants via masked SFT, DPO alignment, verifiable reasoning RL, and calibrated Temperature/Top-k/Top-p decoding.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['5.3', '1.6'],
  requires: ['vram-budgeting-inference-training', 'softmax', 'cross-entropy'],
  teaches: [
    'sft-loss-masking',
    'rlhf-ppo-vs-dpo',
    'reasoning-rl-grpo',
    'decoding-temp-topp',
  ],
  objectives: [
    'Explain the 3-stage LLM post-training pipeline: Pretraining -> Supervised Fine-Tuning (SFT) -> Preference / Verifiable-Reward RL.',
    'Implement assistant-only SFT loss masking (`labels = -100` on user prompt and padding tokens) cleanly.',
    'Contrast RLHF (separate Reward Model + PPO) vs DPO (reference log-prob binary classification) vs Reasoning RL (GRPO on verifiable tests).',
    'Compute Temperature-scaled Softmax probabilities and Top-p (Nucleus) filtering numerically by hand and in NumPy.',
  ],
  checkWithoutNotes: [
    'Why does a raw pretrained base model answer `"What is the capital of France?"` with `"What is the capital of Germany?"` instead of `"Paris"`?',
    'In SFT training on chat `(user, assistant)` turns, why must loss labels on user prompt tokens be masked to `-100`?',
    'Contrast DPO against classic PPO-based RLHF in terms of model copies in VRAM and training stability.',
    'Explain mathematically why **Top-p (Nucleus) sampling** adapts more safely than fixed **Top-k** across confident vs uncertain next-token steps.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Pretrained Base Models Are Not Ready Assistants Yet',
      paragraphs: [
        'Pretraining on trillions of web pages creates an extraordinary world-knowledge autocomplete engine—NOT a helpful, safe assistant. Ask a raw base model *"Summarize our refund policy in three bullets"* and it might continue with *"and send feedback to..."* or hallucinate a second question `"2. How do I cancel?"` because internet forums frequently list questions one after another.',
        '**Post-Training** turns raw autocomplete into reliable product behavior across three stages: **Supervised Fine-Tuning (SFT)** teaches chat structure, refusal boundaries, and tool/JSON formatting; **Preference Alignment (RLHF / DPO)** shapes style, truthfulness, and helpfulness using ranked human/AI comparisons; and **Verifiable-Reward RL (GRPO / reasoning models)** teaches models to spend test-time thinking tokens planning, checking, and backtracking on coding and math tasks before answering.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Grammar School (Pretraining) -> Roleplay Script (SFT) -> Coach Feedback (RL/DPO)',
      frontendConcept: 'Reading the entire MDN web docs (knowledge) vs practicing exact API response formats vs A/B rating which UI draft users preferred',
      aiConcept: '3-Stage Alignment: Pretraining -> Masked SFT -> DPO / Verifiable RL + Decoding',
      explanation:
        'Think of Pretraining as reading every book in the library. **SFT** hands the graduate 50,000 examples of exact customer-service roleplay scripts (`"When asked X, reply politely in valid JSON"`). **DPO / RL** then shows pairs (`Answer A` vs `Answer B`) and teaches preferences (*"Reward accurate concise answers, penalize confident hallucinations"*), while **Temperature & Top-p** act as the final throttle knob at serving time!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Assistant-Only SFT Loss Masking & DPO Objective Math',
      paragraphs: [
        'During **SFT**, every training conversation packs special tokens like `<|user|> What is 2+2? <|assistant|> 4 <|eos|>`. Remember how PyTorch `nn.CrossEntropyLoss(ignore_index=-100)` works: if you compute loss across ALL tokens, the model wastes capacity memorizing random user phrasing ("pls help urgent!!"). Instead, set `labels[t] = -100` for every **user prompt token** and **padding token**, leaving positive integer token IDs strictly on the **assistant response + `<|eos|>`**! That focuses 100% of gradient updates on generating crisp assistant answers and stopping cleanly at `<|eos|>`.',
        'Next compare **PPO RLHF** against **DPO (Direct Preference Optimization)**. Classic PPO requires holding up to 4 giant models in memory/compute simultaneously (Active Policy, Frozen Reference Policy, Learned Reward Model, Critic Value Model) and tuning fragile RL clipping loops. **DPO** proves mathematically that the optimal RLHF reward matches a closed-form log-probability ratio between your trainable policy `pi_theta` and frozen reference `pi_ref`. Training reduces cleanly to one binary preference loss on `(chosen, rejected)` pairs: push `log pi_theta(y_win | x) - log pi_ref(y_win | x)` **higher** than `log pi_theta(y_lose | x) - log pi_ref(y_lose | x)` scaled by `beta` and passed through `-log(sigmoid(...))`! Meanwhile, **Reasoning RL (o1 / DeepSeek-R1 / GRPO)** skips noisy human preference pairs on coding/math and instead grades rollouts automatically using unit tests or exact math verifiers (`+1` pass, `0` fail), letting models discover step-by-step verification naturally inside `<think>` tags.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Decoding Math by Hand (`Temperature`, `Top-k`, `Top-p` Nucleus)',
      paragraphs: [
        'Every LLM forward pass emits raw unnormalized `logits` across the entire vocabulary before choosing the next token. Suppose for a Python completion only three tokens hold non-negligible logits: `["return": 4.0, "yield": 2.0, "banana": 0.0]`. Watch how **Temperature `T`** scales logits (`logits / T`) BEFORE Softmax:',
        'At **`T = 1.0`**: `exp([4, 2, 0]) = [54.60, 7.39, 1.0]` (`sum = 62.99`), giving `[86.7%, 11.7%, 1.6%]`. At **`T = 0.25`** (low temperature): dividing by `0.25` multiplies logits by `4x` (`[16, 8, 0]`)! Now `exp(16) = 8.89e6` vs `exp(8) = 2981`, concentrating `99.97%` probability onto `"return"` (near deterministic `T = 0` greedy argmax). At **`T = 2.0`** (high temperature): logits flatten to `[2.0, 1.0, 0.0]`, giving `[66.5%, 24.5%, 9.0%]`—boosting diversity while risking nonsense tail words (`"banana"` = 9%!).',
        'This is why **Top-p (Nucleus) Sampling** beats fixed **Top-k**: fixed `Top-k = 40` forces 40 candidate tokens even when `"Paris"` already holds `99%` certainty (letting 39 junk tokens compete!), and cuts off valid options when a brainstorm prompt spreads evenly across 80 reasonable adjectives. Sorting probabilities descending and keeping the smallest prefix whose cumulative probability reaches `p` (`e.g. 0.90`) automatically keeps **1 token** when certain (`86.7%` -> adding `11.7%` hits `98.4% >= 90%`, discarding `"banana"`!) and widens smoothly whenever genuine creative uncertainty exists.',
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'sampling-lab',
      title: 'Interactive Lab: Temperature, Top-k & Top-p (Nucleus) Sampling Explorer',
      description:
        'Adjust Temperature ($T$), Top-$k$, and Top-$p$ on live token logit distributions to observe probability sharpening, nucleus cutoffs, and entropy shifts.',
    },
    {
      type: 'table',
      title: 'Recommended Decoding Presets by Production Task',
      headers: ['Production Task', 'Temperature', 'Top-p', 'Why It Works'],
      rows: [
        ['Structured JSON extraction / Classification / SQL', '`0.0` – `0.1`', '`1.0`', 'Near-deterministic greedy decoding maximizes schema validity and reproducibility'],
        ['Code generation / Grounded RAG QA', '`0.1` – `0.3`', '`0.9`', 'High factual/syntactic precision with gentle tie-breaking flexibility'],
        ['Copywriting / Creative brainstorming', '`0.7` – `0.9`', '`0.95`', 'Rich lexical variety while Top-p chops bizarre low-probability tail tokens'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common Post-Training & Decoding Mistakes & How to Debug Them',
      paragraphs: [
        '1) Training SFT on unmasked conversations without `ignore_index=-100` on user prompts: models memorize noisy user phrasing patterns and suffer worse validation perplexity on real assistant turns. Print `decoded_tokens` alongside `labels != -100` on 3 batches before kicking off any training job!',
        '2) Applying high `temperature = 0.9` onto strict JSON extraction or function-calling endpoints: occasional creative tokens break closing braces or invent fake enum keys, failing schema parsers unnecessarily. Always run structured extraction and tool routing at `temperature = 0.0` alongside JSON Schema / constrained decoding.',
        '3) Training DPO without a frozen reference model KL anchor (`pi_ref`) or setting `beta` too small (`0.001`): the policy exploits length bias cleanly—generating 900-word rambling sycophantic replies that maximize raw preference logits while drifting far from coherent fluent language ("reward hacking").',
        '4) Expecting a non-reasoning model or short `max_tokens` cap (`200` tokens) to work on `<think>` reasoning models: if a model spends 350 tokens thinking inside `<think>...</think>` and gets truncated at token `200`, your parser receives zero final answer! Budget sufficient `max_tokens` headroom cleanly.',
        '5) Applying the wrong chat template during local SFT or vLLM serving (for instance feeding ChatML `<|im_start|>` tokens to a Llama-3 model trained strictly on `<|begin_of_text|><|start_header_id|>`): mismatched special tokens confuse stop detection immediately, causing endless garbled repetitions until `max_tokens` expires.',
        '6) Skipping **Constrained / Structured Decoding** (`Outlines`, `xgrammar`, or `response_format` JSON Schema) when strict schema adherence is non-negotiable: constrained finite-state token masking zeroes out logits for syntax-breaking characters at each decode step, guaranteeing `100%` parseable JSON structure without sacrificing underlying semantic accuracy.',
        '7) Confusing **Top-k**, **Top-p**, and **Min-p** sampling during low-temperature creative tasks: when logits spread gently, setting fixed `Top-k=50` still lets weak junk tokens sneak through occasionally; `Top-p` (`0.90–0.95`) or **Min-p** (dropping tokens below `p_min * max_prob`) preserves creative diversity cleanly without coherent derailments.',
        '8) Assuming single-shot greedy generation is your ceiling on tough verifiable tasks: generating `N = 4` candidate code patches at `temperature = 0.6` and picking whichever passes automated `pytest` verification (**Best-of-N / test-time verification**) routinely lifts pass rates sharply without retraining weights.',
        '9) Forgetting that `temperature = 0` still shows minor non-determinism across distributed Mixture-of-Experts routers or parallel GPU floating-point reduction orders: if your product requires reproducible classification confidence scores or routing logs, inspect token `logprobs` alongside deterministic fallback checks rather than relying solely on greedy text equality.',
        '10) Training SFT or DPO on synthetic teacher completions that contain leaked benchmark answers or verbose boilerplate refusals: models absorb formatting and tone flaws just as quickly as factual errors—auditing 100 random training and preference pairs manually across edge domains before running training catches noisy synthetic labels before they ruin your alignment checkpoint.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 5.4 Recap: Alignment & Sampling Craft',
      body: '- Pretraining teaches language distribution; SFT teaches assistant format; DPO/RL teaches preference and verified reasoning.\n- Mask user prompts and padding tokens with `-100` during SFT so loss optimizes solely assistant tokens + `<eos>`.\n- DPO replaces PPO’s separate Reward & Critic models with a stable reference-relative binary classification loss.\n- Temperature scales pre-softmax logits (`T -> 0` approaches greedy argmax); Top-p trims tail noise adaptively.\n- Lock JSON/tool-calling workflows to `T = 0.0..0.1`, saving high temperatures for creative ideation.',
    },
    {
      type: 'python-lab',
      labId: 'lab-5-4-decode',
      difficulty: 'guided',
      requires: ['softmax', 'decoding-temp-topp'],
      title: 'Lab 5.4A: Temperature Scaling & Top-p (Nucleus) Token Probability Filter',
      prompt:
        'Implement `sample_probs_top_p(logits: np.ndarray, temperature: float = 1.0, top_p: float = 0.9) -> np.ndarray`: (1) if `temperature <= 1e-6`, return a one-hot array with `1.0` at `argmax(logits)`; (2) otherwise divide `logits / temperature`, compute stable Softmax probs `p`; (3) sort descending, keep the **smallest prefix whose cumulative sum `>= top_p`** (always keeping at least the #1 top token!), zero out excluded tail tokens, and renormalize surviving probabilities to sum to `1.0`.',
      starterCode: `import numpy as np

def sample_probs_top_p(logits: np.ndarray, temperature: float = 1.0, top_p: float = 0.9) -> np.ndarray:
    logits = np.asarray(logits, dtype=float)
    if temperature <= 1e-6:
        out = np.zeros_like(logits)
        out[int(np.argmax(logits))] = 1.0
        return out
    # 1. Scale logits / temperature and compute max-shifted softmax
    # 2. Sort indices descending, find cumulative probs, zero tail past top_p, renormalize
    pass`,
      testCode: `import numpy as np
logits = np.array([4.0, 2.0, 0.0, -5.0])  # T=1 probs ~ [0.861, 0.117, 0.016, 0.0001]
p_greedy = sample_probs_top_p(logits, temperature=0.0, top_p=0.9)
assert np.allclose(p_greedy, [1.0, 0.0, 0.0, 0.0])
p_nuc = sample_probs_top_p(logits, temperature=1.0, top_p=0.90)
# Sorted cumsum: 0.861 (<0.90 -> keep), 0.861+0.117=0.978 (>=0.90 -> cutoff after idx 1!)
assert p_nuc[0] > 0.85 and p_nuc[1] > 0.10
assert p_nuc[2] == 0.0 and p_nuc[3] == 0.0, f"Tail tokens 2 & 3 must be zeroed! Got {p_nuc}"
assert abs(np.sum(p_nuc) - 1.0) < 1e-6
print("PASS: Temperature + Top-p Nucleus filtering sharpened and pruned tail tokens cleanly!")`,
      solutionCode: `import numpy as np

def sample_probs_top_p(logits: np.ndarray, temperature: float = 1.0, top_p: float = 0.9) -> np.ndarray:
    logits = np.asarray(logits, dtype=float)
    if temperature <= 1e-6:
        out = np.zeros_like(logits)
        out[int(np.argmax(logits))] = 1.0
        return out
    scaled = logits / float(temperature)
    shifted = scaled - np.max(scaled)
    probs = np.exp(shifted)
    probs = probs / np.sum(probs)

    order = np.argsort(-probs)
    sorted_p = probs[order]
    cum_p = np.cumsum(sorted_p)
    # Keep first token plus tokens before cumsum previously exceeded top_p
    keep_sorted = np.ones_like(sorted_p, dtype=bool)
    keep_sorted[1:] = cum_p[:-1] < float(top_p)

    filtered = np.zeros_like(probs)
    kept_indices = order[keep_sorted]
    filtered[kept_indices] = probs[kept_indices]
    filtered /= np.sum(filtered)
    return filtered`,
      hint: 'Check `cum_p[:-1] < top_p` for indices `[1:]` while always keeping index `0` (`keep_sorted[0] = True`), then renormalize.',
      hints: [
        'Sort descending with `order = np.argsort(-probs)` and take `cum_p = np.cumsum(probs[order])`.',
        'Setting `keep_sorted[1:] = cum_p[:-1] < top_p` includes the first crossing token (`>= top_p`) and drops everything afterward!',
        'Map surviving probabilities back via `filtered[order[keep_sorted]] = probs[order[keep_sorted]]` and divide by `np.sum(filtered)`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-5-4-sft-mask',
      difficulty: 'spec',
      requires: ['sft-loss-masking'],
      title: 'Lab 5.4B: Assistant-Only SFT Label Masking (`ignore_index = -100`)',
      prompt:
        'Implement `build_sft_labels(input_ids: list[int], prompt_len: int, pad_token_id: int = 0) -> list[int]` returning target label IDs where: (1) indices `< prompt_len` (user prompt tokens) become `-100`; (2) any token equal to `pad_token_id` becomes `-100`; (3) genuine assistant + `<eos>` tokens retain their exact token ID from `input_ids`.',
      starterCode: `def build_sft_labels(input_ids: list[int], prompt_len: int, pad_token_id: int = 0) -> list[int]:
    # Return list same length as input_ids masking prompt (< prompt_len) and pad tokens with -100
    pass`,
      testCode: `ids = [101, 2054, 2003, 99, 42, 43, 2, 0, 0]  # 3 prompt tokens, assistant=[99,42,43,2], 2 pads
labels = build_sft_labels(ids, prompt_len=3, pad_token_id=0)
assert labels == [-100, -100, -100, 99, 42, 43, 2, -100, -100], f"Got {labels}"
print("PASS: SFT label masking excluded user prompt and padding tokens cleanly!")`,
      solutionCode: `def build_sft_labels(input_ids: list[int], prompt_len: int, pad_token_id: int = 0) -> list[int]:
    return [
        -100 if (idx < prompt_len or tok == pad_token_id) else tok
        for idx, tok in enumerate(input_ids)
    ]`,
      hint: 'Use a list comprehension checking `idx < prompt_len or tok == pad_token_id` for `-100`.',
      hints: [
        'Enumerate `input_ids` with `for idx, tok in enumerate(input_ids):`.',
        'Emit `-100` whenever `idx < prompt_len` OR `tok == pad_token_id`.',
        'Preserve `tok` unmodified for every assistant response and `<eos>` index.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-5-4-dpo',
      difficulty: 'debug',
      requires: ['rlhf-ppo-vs-dpo'],
      title: 'Lab 5.4C: Fix Broken DPO Loss Missing Reference Model Anchor',
      prompt:
        'A broken DPO implementation forgot to subtract the frozen reference model log-probs `(pi_ref_win - pi_ref_lose)` inside the preference margin, allowing unbounded policy drift! Fix `dpo_loss(logp_policy_win, logp_policy_lose, logp_ref_win, logp_ref_lose, beta=0.1) -> float` computing exact `margin = beta * ((logp_policy_win - logp_ref_win) - (logp_policy_lose - logp_ref_lose))` and returning `-log(1 / (1 + exp(-margin)))` (using numerically stable `np.logaddexp(0.0, -margin)`).',
      starterCode: `import numpy as np

def dpo_loss(logp_policy_win: float, logp_policy_lose: float, logp_ref_win: float, logp_ref_lose: float, beta: float = 0.1) -> float:
    # BUG: completely ignores logp_ref_win and logp_ref_lose!
    margin = beta * (logp_policy_win - logp_policy_lose)
    return float(np.logaddexp(0.0, -margin))`,
      testCode: `import numpy as np
# Policy improved chosen relative to ref (+2.0) while ref actually liked lose (-1 vs -5)!
loss = dpo_loss(-3.0, -6.0, -5.0, -1.0, beta=0.1)
# win_ratio = (-3) - (-5) = +2.0; lose_ratio = (-6) - (-1) = -5.0 -> margin = 0.1*(2 - (-5)) = 0.7 -> log(1+e^-0.7)=0.403186
assert abs(loss - float(np.logaddexp(0.0, -0.7))) < 1e-6, f"Expected ~0.4032, got {loss}"
print("PASS: Reference-anchored DPO loss penalizes relative drift properly!")`,
      solutionCode: `import numpy as np

def dpo_loss(logp_policy_win: float, logp_policy_lose: float, logp_ref_win: float, logp_ref_lose: float, beta: float = 0.1) -> float:
    win_ratio = float(logp_policy_win) - float(logp_ref_win)
    lose_ratio = float(logp_policy_lose) - float(logp_ref_lose)
    margin = float(beta) * (win_ratio - lose_ratio)
    return float(np.logaddexp(0.0, -margin))`,
      hint: 'Compute `win_ratio = logp_policy_win - logp_ref_win` and `lose_ratio = logp_policy_lose - logp_ref_lose`, then `margin = beta * (win_ratio - lose_ratio)`.',
      hints: [
        'Subtract reference log-probs first: `win_ratio = logp_policy_win - logp_ref_win`.',
        'Compute `lose_ratio = logp_policy_lose - logp_ref_lose` and `margin = beta * (win_ratio - lose_ratio)`.',
        'Return `float(np.logaddexp(0.0, -margin))`, which equals `-log(sigmoid(margin))` cleanly without overflow.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q5-4-1',
      type: 'multiple-choice',
      question: 'What happens when you set `temperature = 0` during LLM decoding?',
      options: [
        'The model samples uniformly at random across every vocabulary ID regardless of logit magnitude',
        'The model doubles its context limit by compressing two tokens inside every output slot',
        'The engine clears its KV Cache automatically after generating every ten response tokens',
        'Dividing logits by `T -> 0` produces deterministic greedy argmax decoding',
      ],
      correctIndex: 3,
      explanation: 'As `T -> 0+`, Softmax concentrates 100% mass on the single highest-logit token (deterministic greedy decoding).',
    },
    {
      id: 'q5-4-2',
      type: 'multiple-choice',
      question: 'How does **Top-p (Nucleus) sampling** improve over fixed **Top-k**?',
      options: [
        'Top-p dynamically shrinks or widens the candidate pool by cumulative probability mass',
        'Top-p guarantees keeping fifty equally weighted tokens regardless of certainty across steps',
        'Top-p executes inside BPE tokenizers before any Transformer layers run forward passes',
        'Top-p disables Softmax probability normalization completely so raw logits sample directly',
      ],
      correctIndex: 0,
      explanation: 'Top-p keeps 1–2 tokens when confident and widens cleanly when many valid words tie, preventing fixed-k junk sampling.',
    },
    {
      id: 'q5-4-3',
      type: 'multiple-choice',
      question: 'What advantage does **DPO (Direct Preference Optimization)** offer compared to PPO-based RLHF?',
      options: [
        'DPO requires no preference comparison data pairs or frozen reference checkpoints whatsoever',
        'DPO operates solely on convolutional image classifiers rather than autoregressive text models',
        'DPO doubles the number of active neural networks required simultaneously inside GPU VRAM',
        'DPO skips Reward Model + PPO training, reducing alignment to a binary preference loss',
      ],
      correctIndex: 3,
      explanation: 'DPO expresses the optimal RL reward analytically via policy vs reference log-probs, eliminating Reward Models and fragile PPO rollouts.',
    },
    {
      id: 'q5-4-4',
      type: 'numeric',
      question: 'An SFT training sequence has length `10`, where the first `4` tokens are `<|user|> prompt` and the last `2` tokens are `<PAD>`. How many assistant tokens receive non-`-100` training loss?',
      options: [],
      correctIndex: 0,
      correctNumber: 4,
      tolerance: 0,
      unit: 'tokens',
      explanation: '`10 total - 4 prompt tokens - 2 padding tokens = 4` active assistant loss tokens.',
    },
    {
      id: 'q5-4-5',
      type: 'spot-bug',
      question: 'A JSON extraction API randomly fails schema parsing 10% of the time with hallucinated keys because of this config:',
      code: `client.chat(messages=msgs, temperature=0.85, top_p=0.98)`,
      options: [
        'Passing `messages=msgs` requires setting `temperature >= 1.2` for strict JSON mode compatibility',
        'The client omitted an explicit `kv_cache=True` boolean argument inside the HTTP request',
        'JSON extraction endpoints crash unless `top_p` is strictly less than `0.10` alongside `temperature=1.0`',
        'High `temperature=0.85` injects random tail sampling; use `0.0–0.1` for JSON',
      ],
      correctIndex: 3,
      explanation: 'Structured extraction, SQL, and tool calls need deterministic `temperature = 0.0`–`0.1` rather than high-entropy creative sampling.',
    },
    {
      id: 'q5-4-6',
      type: 'predict-output',
      question: 'Sorted descending token probabilities are `[0.85, 0.10, 0.04, 0.01]` and `top_p = 0.90`. Which tokens survive Nucleus filtering?',
      options: [
        'Only index 0 (`0.85`), dropping the remaining tokens immediately before reaching `0.90`',
        'Indices 0 and 1 (`0.85 + 0.10 = 0.95 >= 0.90`)',
        'Indices 0, 1, and 2 (`0.99`) because Nucleus sampling always preserves at least three candidates',
        'All four tokens (`1.00`) because zeroing `0.01` violates Softmax conservation laws',
      ],
      correctIndex: 1,
      explanation: 'Token 0 (`0.85`) is still `< 0.90`, so we include Token 1 (`0.85 + 0.10 = 0.95 >= 0.90`) and prune `[0.04, 0.01]`.',
    },
    {
      id: 'q5-4-7',
      type: 'multi-select',
      question: 'Which two choices correctly describe **Verifiable-Reward RL (Reasoning / GRPO)** vs human-ranked SFT/DPO?',
      options: [
        'Models receive deterministic automated rewards (`+1`/`0`) from unit tests or math verifiers rather than subjective human style ratings',
        'Models organically learn to allocate test-time compute inside `<think>` steps to check and backtrack before answering',
        'Verifiable RL works without any ground-truth grader by maximizing output character length blindly',
        'Reasoning RL disables autoregressive decoding and predicts all tokens in one unmasked step',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Automated verifiable checkers (`unit tests`, `exact answers`) reward accurate step-by-step reasoning chains without sycophantic length bias.',
    },
    {
      id: 'q5-4-8',
      type: 'multiple-choice',
      question: 'Why must SFT chat training ALWAYS include an explicit end-of-turn `<|eos|>` token inside unmasked assistant labels?',
      options: [
        'Because without seeing `<|eos|>` in loss targets, the model never learns when to stop generating',
        'Because PyTorch tokenizers refuse to read JSONL datasets missing `<|eos|>` headers on row zero',
        'Because `<|eos|>` acts as the Rotary Positional Embedding offset separator between batch rows',
        'Because `<|eos|>` resets AdamW momentum states cleanly after each assistant message finishes',
      ],
      correctIndex: 0,
      explanation: 'Including `<|eos|>` inside supervised target labels trains the assistant to emit a clean stop token once its reply concludes.',
    },
    {
      id: 'q5-4-9',
      type: 'ordering',
      question: 'Order the modern three-stage training pipeline that turns random weights into a frontier reasoning assistant:',
      items: [
        'Self-supervised Pretraining on trillions of raw tokens (teaches world facts and syntax)',
        'Masked SFT on clean `(user, assistant + <eos>)` demonstrations (teaches chat & JSON structure)',
        'Preference Alignment via DPO or RLHF (refines helpfulness, honesty, and refusal behavior)',
        'Verifiable-Reward RL (`GRPO` on code tests / math graders) to train test-time verification',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Pretraining -> Masked SFT -> Preference Alignment (DPO/RLHF) -> Verifiable-Reward Reasoning RL.',
    },
  ],
};
