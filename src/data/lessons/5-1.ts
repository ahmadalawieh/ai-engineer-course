import type { Lesson } from '@/types/course';

export const lesson5_1: Lesson = {
  id: '5-1',
  moduleId: 'mod-5',
  number: '5.1',
  title: 'Tokenization (BPE), Embeddings & Rotary Positions (RoPE)',
  subtitle: 'Trace Byte-Pair Encoding merges step by step, understand why LLMs stumble on letter counting and trailing spaces, and implement Rotary Positional Embeddings.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['4.4', '1.4'],
  requires: ['python-dicts', 'vectors', 'transformer-parallelism-tradeoff'],
  teaches: [
    'bpe-tokenization',
    'embedding-lookup-tables',
    'rope-positional-encoding',
    'token-budget-hygiene',
  ],
  competencies: ['jr-llm-client'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Trace Byte-Pair Encoding (BPE) pair counting and iterative subword merges from UTF-8 bytes up to modern 50k–128k vocabularies.',
    'Explain tokenization failure modes: letter-counting blind spots, inconsistent number splitting, non-English token inflation, and trailing-space prompt bugs.',
    'Implement Rotary Positional Embeddings (RoPE) rotating 2D Query/Key pairs so dot products depend strictly on relative token distance `(m - n)`.',
    'Sanitize prompt templates and verify subword token budgets reliably before sending LLM API payloads.',
  ],
  checkWithoutNotes: [
    'Why do modern LLMs prefer Byte-level BPE over character-level or whole-word vocabularies?',
    'Explain why an LLM easily answers history trivia yet miscounts the `"r"`s in `"strawberry"` when tokenized into `["str", "aw", "berry"]`.',
    'Why should prompt templates NEVER end with a trailing space (`"Answer: "`) before calling completion models?',
    'What mathematical property makes RoPE (`R_m q · R_n k`) generalize cleanly across sequence distances compared to fixed early sinusoidal additions?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'LLMs Never See Letters or Words—Only Integer Token IDs',
      paragraphs: [
        'Neural networks multiply floating-point matrices; they cannot compute dot products directly on raw UTF-8 strings. Every input prompt—whether English prose, Python code, Arabic text, or JSON schemas—must first convert into a sequence of integer token IDs (`[15339, 995, 13]`) that index rows inside an embedding lookup matrix `E` of shape `(vocab_size, d_model)`.',
        'Picking the right subword granularity sits directly behind real-world API speed, context limits, and prompt bugs. Character-level tokenization produces overly long sequences that blow up quadratic attention cost (`4,000` characters vs `1,000` subwords). Whole-word vocabularies swell to millions of rare entries and fail completely with `<UNK>` whenever a user mistypes a word or writes a fresh variable name (`user_retry_v2`). **Byte-Pair Encoding (BPE)** strikes the balance: start with the 256 raw UTF-8 bytes (`zero <UNK> errors ever!`) and iteratively merge the single most frequent adjacent token pair into a new vocabulary entry until reaching `50k–128k` subword pieces.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Zip Dictionary Compression + Clock-Hand Order',
      frontendConcept: 'Replacing frequent HTML class prefixes with short CSS bundle tokens plus array indices tracking DOM sibling order',
      aiConcept: 'Byte-Pair Encoding (BPE) Subword Merges & Rotary Positional Embeddings (RoPE)',
      explanation:
        'BPE operates just like lossless data compression: common patterns (`"ing"`, `"function"`, `"    "`) condense into single token IDs while rare words fall back cleanly to shorter syllables or raw bytes. Because Self-Attention compares every token against every other token symmetrically like a bag of words, **RoPE** rotates each word’s vector pair on a 2D clock face by its sequence position `m`—turning the relative offset `(m - n)` straight into the angle between two clock hands!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Tracing BPE Merge Steps by Hand',
      paragraphs: [
        'Suppose our toy training corpus contains `"low "` 5 times, `"lower "` 2 times, and `"newest "` 6 times. Split into characters first: `"l o w _" (x5)`, `"l o w e r _" (x2)`, `"n e w e s t _" (x6)`. Scan all adjacent bigrams and add word frequencies: `"l"+"o"` appears `5 + 2 = 7` times; `"o"+"w"` appears `5 + 2 = 7` times; `"e"+"s"` appears `6` times; `"s"+"t"` appears `6` times; `"n"+"e"` appears `6` times. Suppose tie-breaking picks `("l", "o") -> "lo"`. Replace every `"l" + "o"` immediately to get `"lo w _"` (`5`), `"lo w e r _"` (`2`).',
        'Next pass scans `"lo"+"w"` (`7` occurrences!) vs `"e"+"s"` (`6`) -> merges `("lo", "w") -> "low"`! Notice what emerges naturally: high-frequency English stems (`"low"`) become 1 single token while rarer suffixes (`"er"`) remain modular subwords. Look closely at why LLMs stumble on character puzzles too: `"strawberry"` frequently tokenizes into three integer IDs `["str", "aw", "berry"]`—the Transformer sees integer `[496, 675, 19772]`, not 10 separate characters! Similarly, `"123456"` splits inconsistently into `["123", "456"]` or `["12", "34", "56"]`, explaining why multi-digit math improves dramatically when models output digit-by-digit spacing or invoke a Python tool.',
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'bpe-tokenizer',
      title: 'Interactive Lab: Subword Tokenizer & Token Economics Explorer',
      description:
        'Type prompts, Python snippets, JSON, or multilingual text to inspect subword merges, leading-space token differences, and estimated token budgets.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Rotary Positional Embeddings (`RoPE`) Dot-Product Geometry',
      paragraphs: [
        'Suppose Query and Key embeddings have `d = 2` dimensions (real LLMs apply identical 2D rotations independently to every pair `[2i, 2i+1]` at staggered frequencies `theta_i = 10000^(-2i/d)`). Place vector `q = [1.0, 0.0]` at position `m = 2` with base frequency `theta = 0.5 rad`, and `k = [1.0, 0.0]` at position `n = 1`. RoPE rotates `q` by `m * theta = 1.0 rad`: `q_rot = [cos(1.0), sin(1.0)] = [0.5403, 0.8415]`. It rotates `k` by `n * theta = 0.5 rad`: `k_rot = [cos(0.5), sin(0.5)] = [0.8776, 0.4794]`.',
        'Now compute their dot product: `0.5403 * 0.8776 + 0.8415 * 0.4794 = 0.4742 + 0.4034 = 0.8776 = cos(0.5)` (`cos((2 - 1) * 0.5)`)! Shift BOTH tokens ten positions forward to `m = 12, n = 11`: the dot product remains **identically `0.8776`** because trigonometric identity `R(m)^T R(n) = R(n - m)` depends **strictly on relative distance `(m - n)`**, never absolute coordinates! Moreover, note Embedding Matrix math: looking up `token_id = 42` in `E` `(vocab, d)` gives row `E[42]` identically to one-hot dot product—and many efficient models (**tied embeddings**) reuse `E.T` as the final output linear head mapping `(d_model -> vocab_size)`, saving hundreds of millions of parameters!',
      ],
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'The Trailing-Space Bug & Leading-Space Tokenization in Prompts',
      body: 'In BPE vocabularies, `"apple"` and `" apple"` (with a leading space attached!) are **completely distinct integer token IDs**! Ending a prompt template with a trailing space (`"Sentiment: "`) forces the model to start generating tokens WITHOUT normal leading spaces—jumping into low-probability weird fragments instead of `" positive"`. Always `.rstrip()` prompt suffixes before sending completion requests.',
    },
    {
      type: 'prose',
      heading: 'Common Tokenization & Positioning Mistakes & How to Debug Them',
      paragraphs: [
        '1) Counting words (`len(text.split())`) or fixed `chars / 4` blindly across code, JSON, or non-English scripts: English prose averages ~4 characters per token, whereas minified JSON symbols, Arabic/CJK text, or noisy log hashes can tokenize at 1.5–2.5 characters per token—nearly doubling token bills and blowing past `max_context` limits! Measure actual tokenizer counts directly before batching.',
        '2) Splitting raw UTF-8 strings mid-character (`text[:500]`) across multi-byte scripts or emoji: slicing raw bytes breaks UTF-8 codepoints (`UnicodeDecodeError`), and even slicing string slices inside long RAG chunks should align cleanly on paragraph/sentence boundaries rather than breaking tokens mid-word.',
        '3) Feeding raw token IDs into linear regression or treating token ID `9000` as numerically "greater than" ID `45`: token IDs are arbitrary categorical indices into the embedding lookup matrix `E`, never ordered scalars.',
        '4) Training or evaluating longer sequences (`32k`) than the RoPE base frequency (`theta = 10,000`) was calibrated for without YaRN/NTK frequency scaling: high-frequency rotation dimensions wrap chaotically past untrained context lengths, collapsing long-range retrieval accuracy unless RoPE base frequency is increased cleanly (`e.g. 500,000`).',
        '5) Ignoring special control tokens (`<|im_start|>`, `<|eot_id|>`, `<BOS>`, `<EOS>`) when building custom fine-tuning datasets: missing end-of-turn `<EOS>` tokens teach the model to ramble forever without stopping at inference!',
        '6) Splitting numbers with arbitrary grouping across prompts ("12345" vs "123456"): because BPE merges frequent integer chunks (`"12"`, `"345"`, `"2024"`), changing formatting slightly shifts arithmetic token boundaries—formatting structured tables or invoking a calculator tool prevents subword boundary drift completely.',
        '7) Forgetting that embedding vocabularies grow slowly on multilingual or domain jargon: technical medical terms (`"electrocardiogram"` -> 4–5 pieces) and non-Latin UTF-8 scripts consume 2x–3x more context window tokens per sentence than everyday English, raising latency and shrinking effective RAG document budget unless measured directly.',
        '8) Assuming `max_tokens` inside LLM API requests measures total context size: `max_tokens` caps ONLY the generated output completion, while `input_tokens + max_tokens` must fit inside the model’s combined context window or the server rejects the payload with HTTP 400.',
        '9) Mixing tokenizer files (`tokenizer.json`) across model versions when exporting local weights: even two checkpoints from the exact same model family occasionally revise reserved chat tokens or vocabulary sizes (`128,000 -> 128,256`), shifting every downstream embedding row index unless model weights, config files, and matching `tokenizer` artifacts stay pinned together.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Subword Schemes & Positional Encodings',
      headers: ['Choice', 'Mechanism', 'Key Advantage', 'Main Limitation'],
      rows: [
        ['Byte-Level BPE', 'Merges frequent UTF-8 byte pairs bottom-up', 'Zero <UNK> tokens on arbitrary text or code', '2x-4x more tokens on non-Latin scripts than English'],
        ['Word / Character Split', 'Whitespace words or raw characters', 'Tiny vocab (chars) or intuitive split (words)', 'Giant OOV tables (words) or huge seq length (chars)'],
        ['Sinusoidal / Learned Abs', 'Adds fixed/learned vector per index m', 'Simple vector addition at layer 0', 'Fails cleanly when extrapolating past training length'],
        ['RoPE (Rotary)', 'Rotates Q, K pairs by angle m * theta', 'Dot product depends strictly on relative offset (m - n)', 'Needs NTK/YaRN base scaling for 10x context extension'],
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 5.1 Recap: Tokens, Embeddings & Relative Order',
      body: '- Byte-level BPE starts from 256 UTF-8 bytes and merges frequent pairs iteratively, eliminating `<UNK>` errors.\n- Tokenization splits explain spelling/character blind spots (`"str"+"aw"+"berry"`) and trailing-space prompt degradations.\n- Embeddings map categorical token IDs into dense vector rows `E[id]` (`O(1)` lookup, often weight-tied to the output head).\n- RoPE rotates Query and Key pairs by `m * theta` so `Q · K` depends strictly on relative distance `(m - n)`.\n- Budget non-English, code, and JSON payloads with real tokenizers rather than guessing `chars / 4`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-5-1-bpe',
      difficulty: 'guided',
      requires: ['python-dicts', 'bpe-tokenization'],
      title: 'Lab 5.1A: Implement One Byte-Pair Encoding (BPE) Pair Merge Step',
      prompt:
        'Implement `bpe_single_merge(word_freqs: dict[tuple[str, ...], int])` that counts all adjacent symbol pairs weighted by word frequency, picks the most frequent pair (breaking ties lexicographically with `min` on `(-count, pair)`), merges every occurrence of that winning pair into concatenated `pair[0] + pair[1]`, and returns `(winning_pair, updated_word_freqs)`.',
      starterCode: `def bpe_single_merge(word_freqs: dict):
    # 1. Count weighted adjacent pairs (sym[i], sym[i+1]) across word_freqs
    # 2. Pick pair maximizing count (tie-break: min pair tuple lexicographically)
    # 3. Replace occurrences of winning pair inside each word tuple and return (best_pair, new_freqs)
    pass`,
      testCode: `corpus = {
    ("l", "o", "w", "_"): 6,
    ("l", "o", "w", "e", "r", "_"): 2,
    ("n", "e", "w", "e", "s", "t", "_"): 3,
}
pair1, c1 = bpe_single_merge(corpus)
assert pair1 == ("l", "o"), f"First tie at count 8 between ('l','o') and ('o','w') picks ('l','o'), got {pair1}"
assert ("lo", "w", "_") in c1 and c1[("lo", "w", "_")] == 6
pair2, c2 = bpe_single_merge(c1)
assert pair2 == ("lo", "w")
assert ("low", "_") in c2 and ("low", "e", "r", "_") in c2
print("PASS: Iterative BPE pair counting and symbol merging matches exact spec!")`,
      solutionCode: `def bpe_single_merge(word_freqs: dict):
    pair_counts = {}
    for word, freq in word_freqs.items():
        for i in range(len(word) - 1):
            pair = (word[i], word[i + 1])
            pair_counts[pair] = pair_counts.get(pair, 0) + freq
    best_pair = min(pair_counts.keys(), key=lambda p: (-pair_counts[p], p))
    merged_sym = best_pair[0] + best_pair[1]
    new_freqs = {}
    for word, freq in word_freqs.items():
        out = []
        i = 0
        while i < len(word):
            if i < len(word) - 1 and word[i] == best_pair[0] and word[i + 1] == best_pair[1]:
                out.append(merged_sym)
                i += 2
            else:
                out.append(word[i])
                i += 1
        new_freqs[tuple(out)] = freq
    return best_pair, new_freqs`,
      hint: 'Use a `while i < len(word)` loop when replacing `best_pair` so two merged tokens advance `i += 2` cleanly without overlapping.',
      hints: [
        'Accumulate `(word[i], word[i + 1])` counts weighted by `freq`.',
        'Select `best_pair = min(pair_counts, key=lambda p: (-pair_counts[p], p))` for deterministic tie-breaking.',
        'Scan each `word` with `while i < len(word):`: match `word[i:i+2] == best_pair` -> append concatenated symbol and increment `i += 2`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-5-1-rope',
      difficulty: 'spec',
      requires: ['vectors', 'rope-positional-encoding'],
      title: 'Lab 5.1B: Implement 2D Rotary Positional Embedding (RoPE) & Shift Check',
      prompt:
        'Implement `apply_rope_2d(vec: np.ndarray, pos: int, theta: float = 0.5) -> np.ndarray` rotating pairs `[x0, x1]` by `angle = pos * theta` (`[x0*cos - x1*sin, x0*sin + x1*cos]`) across even/odd coordinate pairs `[2i, 2i+1]`. Verify numerically that `dot(rope(q, m), rope(k, n)) == dot(rope(q, m+10), rope(k, n+10))`.',
      starterCode: `import numpy as np

def apply_rope_2d(vec: np.ndarray, pos: int, theta: float = 0.5) -> np.ndarray:
    # Rotate pairs (vec[0::2], vec[1::2]) by angle = pos * theta
    pass`,
      testCode: `import numpy as np
q = np.array([1.2, -0.7, 0.4, 1.8])
k = np.array([-0.5, 1.1, 0.9, -0.3])
dot_a = float(np.dot(apply_rope_2d(q, 2), apply_rope_2d(k, 5)))
dot_b = float(np.dot(apply_rope_2d(q, 12), apply_rope_2d(k, 15)))
assert abs(dot_a - dot_b) < 1e-6, f"RoPE dot product must depend solely on (m - n)! {dot_a} vs {dot_b}"
assert abs(np.linalg.norm(apply_rope_2d(q, 7)) - np.linalg.norm(q)) < 1e-6, "Rotation must preserve norm"
print("PASS: RoPE rotation preserved norms and exact relative-offset dot products!")`,
      solutionCode: `import numpy as np

def apply_rope_2d(vec: np.ndarray, pos: int, theta: float = 0.5) -> np.ndarray:
    v = np.asarray(vec, dtype=float)
    angle = float(pos) * float(theta)
    c, s = np.cos(angle), np.sin(angle)
    out = np.empty_like(v)
    x0 = v[0::2]
    x1 = v[1::2]
    out[0::2] = x0 * c - x1 * s
    out[1::2] = x0 * s + x1 * c
    return out`,
      hint: 'Slice even indices `v[0::2]` and odd indices `v[1::2]`, apply `[x0*c - x1*s, x0*s + x1*c]`, and assign back to `out`.',
      hints: [
        'Compute `c, s = np.cos(pos * theta), np.sin(pos * theta)`.',
        'Extract `x0 = v[0::2]` and `x1 = v[1::2]`.',
        'Set `out[0::2] = x0 * c - x1 * s` and `out[1::2] = x0 * s + x1 * c`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-5-1-space',
      difficulty: 'debug',
      requires: ['token-budget-hygiene'],
      title: 'Lab 5.1C: Fix Trailing-Whitespace Prompt Bug & Token Budget Clamper',
      prompt:
        'A completion helper leaves trailing spaces on prompt suffixes (`"Label: "`) AND truncates text by splitting blindly mid-token count without leaving room for `reserve_output_tokens`! Fix `prepare_completion_prompt(prompt: str, max_context: int, reserve_output: int, tokenize_fn)` so it `.rstrip()`s trailing whitespace, encodes via `tokenize_fn`, keeps at most `max_context - reserve_output` tokens, and returns `(cleaned_prompt_suffix_free, allowed_token_ids)`.',
      starterCode: `def prepare_completion_prompt(prompt: str, max_context: int, reserve_output: int, tokenize_fn):
    # BUG 1: preserves trailing whitespace in prompt!
    # BUG 2: allows full max_context without subtracting reserve_output!
    ids = tokenize_fn(prompt)[:max_context]
    return prompt, ids`,
      testCode: `tok = lambda s: [ord(c) for c in s]
cleaned, ids = prepare_completion_prompt("Classify: urgent!   \\n", max_context=20, reserve_output=5, tokenize_fn=tok)
assert not cleaned.endswith(" ") and not cleaned.endswith("\\n"), f"Must rstrip trailing whitespace: {cleaned!r}"
assert len(ids) == 15, f"Expected 20 - 5 = 15 tokens max, got {len(ids)}"
print("PASS: Prompt trailing space stripped and output token budget reserved cleanly!")`,
      solutionCode: `def prepare_completion_prompt(prompt: str, max_context: int, reserve_output: int, tokenize_fn):
    cleaned = prompt.rstrip()
    budget = max(max_context - reserve_output, 0)
    ids = list(tokenize_fn(cleaned))[:budget]
    return cleaned, ids`,
      hint: 'Call `cleaned = prompt.rstrip()` before tokenizing, and slice `[:max(max_context - reserve_output, 0)]`.',
      hints: [
        'BPE merges leading spaces onto words, so trailing whitespace breaks completion boundaries.',
        'Strip trailing whitespace via `cleaned = prompt.rstrip()`.',
        'Compute `budget = max(max_context - reserve_output, 0)` and slice `list(tokenize_fn(cleaned))[:budget]`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q5-1-1',
      type: 'multiple-choice',
      question: 'Why did modern LLMs adopt Byte-level BPE instead of whole-word vocabularies?',
      options: [
        'Whole-word vocabularies emit `<UNK>` on typos or rare code; BBPE handles any UTF-8 byte',
        'Because Byte-level BPE shrinks embedding matrices permanently down to exactly 256 rows total',
        'Because whole-word dictionaries only parse lowercase ASCII English text inside Python tokenizers',
        'Because Byte-level BPE removes the need for floating-point token embedding lookup tables completely',
      ],
      correctIndex: 0,
      explanation: 'Starting from all 256 UTF-8 bytes ensures any string (typos, Python identifiers, Arabic, emojis) encodes losslessly without `<UNK>`.',
    },
    {
      id: 'q5-1-2',
      type: 'multiple-choice',
      question: 'Why does a Transformer require positional encodings such as RoPE?',
      options: [
        'To quantize attention Query and Key weights down from 16-bit floats to 4-bit integer bins',
        'Pure Self-Attention is permutation-invariant, treating swapped word orders identically',
        'To replace row-wise Softmax normalization inside multi-head attention dot products completely',
        'Because modern GPU tensor cores crash whenever embedding vectors lack strictly ascending coordinates',
      ],
      correctIndex: 1,
      explanation: 'Without positional signals, `"dog bit man"` and `"man bit dog"` form identical token sets and produce identical unordered attention outputs.',
    },
    {
      id: 'q5-1-3',
      type: 'multiple-choice',
      question: 'What geometric property makes RoPE superior to early fixed sinusoidal additions?',
      options: [
        'RoPE rotates Q and K so their dot product encodes relative distance `(m - n)`',
        'RoPE deletes Query projection weight matrices to cut Self-Attention VRAM in half automatically',
        'RoPE limits positional attention strictly to the first ten tokens inside any prompt context',
        'RoPE shifts positional indices onto CPU integer arrays rather than running inside GPU attention blocks',
      ],
      correctIndex: 0,
      explanation: 'Rotating Q by `m * theta` and K by `n * theta` makes `R_m q · R_n k` depend solely on `(m - n)`, aiding relative-distance generalization.',
    },
    {
      id: 'q5-1-4',
      type: 'spot-bug',
      question: 'Why does ending a completion prompt template with a trailing space (`"Country: "`) degrade LLM generation quality?',
      options: [
        'JSON HTTP serializers strip trailing spaces silently before API servers ever read the request body',
        'In BPE, `"France"` and `" France"` are different token IDs; trailing space forces rare fragments',
        'Trailing spaces trigger Python `SyntaxError` inside standard UTF-8 Byte-Pair Encoding vocabularies',
        'Ending a prompt with whitespace zeroes out every Rotary Positional Embedding frequency angle',
      ],
      correctIndex: 1,
      explanation: 'Most common words begin with a leading space in BPE (`" France"`). Leaving `" "` at the prompt end breaks token boundary alignment.',
    },
    {
      id: 'q5-1-5',
      type: 'predict-output',
      question: 'What happens if an LLM receives `"strawberry"` tokenized as `["str", "aw", "berry"]` and you ask `"How many letter r’s appear?"` without Python tools?',
      options: [
        'It counts exact characters reliably because BPE preserves every UTF-8 character index explicitly inside logits',
        'It may miscount because it only sees 3 subword token IDs, not individual letters',
        'It raises a `TokenizationError` whenever any single English word splits into three subwords',
        'It automatically converts `"strawberry"` into ten individual single-character tokens prior to attention',
      ],
      correctIndex: 1,
      explanation: 'The Transformer operates on integer IDs representing multi-letter chunks (`"str"`, `"aw"`, `"berry"`), making fine character counting brittle unless guided step-by-step or via code.',
    },
    {
      id: 'q5-1-6',
      type: 'multi-select',
      question: 'Which two assumptions about token counting cause subtle production failures?',
      options: [
        'Assuming `chars / 4` holds equally for minified JSON symbols, stack traces, or Arabic/CJK text',
        'Treating token integer IDs (`15339 > 42`) as ordered numeric values rather than categorical lookup indices',
        'Counting exact tokens using the target model’s tokenizer while subtracting `max_output_tokens` headroom',
        'Stripping trailing spaces from completion prompt prefixes before calling the API',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Non-English text and punctuation-dense code split into many more tokens per character than English prose, and token IDs are unordered lookup indices.',
    },
    {
      id: 'q5-1-7',
      type: 'numeric',
      question: 'Suppose a model has `8,192` token total context limit and you request up to `1,200` generated output tokens. What is the maximum safe prompt input token budget?',
      options: [],
      correctIndex: 0,
      correctNumber: 6992,
      tolerance: 0,
      unit: 'tokens',
      explanation: '`8192 - 1200 = 6992` input tokens maximum so input + output fit inside the context window.',
    },
    {
      id: 'q5-1-8',
      type: 'multiple-choice',
      question: 'How does **weight tying** between the input embedding matrix `E` and the final LM vocabulary head save memory?',
      options: [
        'It freezes the embedding layer permanently at random Xavier initialization throughout pretraining',
        'It replaces Softmax outputs across 100k vocabulary tokens with binary logistic Sigmoid checks',
        'It reuses `E.T` (`(d_model, vocab_size)`) as the output projection matrix directly',
        'It merges all multi-byte UTF-8 emojis into a single shared placeholder token index',
      ],
      correctIndex: 2,
      explanation: 'Reusing the `(vocab_size, d_model)` embedding matrix transposed for output logits eliminates a second giant parameter matrix cleanly.',
    },
    {
      id: 'q5-1-9',
      type: 'ordering',
      question: 'Order how Byte-Pair Encoding (BPE) constructs a subword tokenizer from raw text:',
      items: [
        'Initialize base vocabulary from all 256 UTF-8 byte tokens',
        'Split training text words into initial byte/character symbol sequences',
        'Count every adjacent symbol pair across the weighted corpus',
        'Merge the single highest-frequency adjacent pair into a new token ID',
        'Repeat counting and merging until reaching target vocabulary size (e.g., 100k)',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Base 256 bytes -> initial split -> count adjacent bigrams -> merge top pair -> repeat up to target vocab.',
    },
  ],
};
