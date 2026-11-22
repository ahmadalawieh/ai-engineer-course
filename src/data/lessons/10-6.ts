import type { Lesson } from '@/types/course';

export const lesson10_6: Lesson = {
  id: '10-6',
  moduleId: 'mod-10',
  number: '10.6',
  title: 'Multimodal Pipelines: Vision Docs, Speech ASR & Video Sampling',
  subtitle: 'Architect reliable document-vision, voice/speech-to-text, and video-understanding pipelines with explicit resolution token budgets and quality metrics.',
  durationMinutes: 75,
  track: 'ai-eng',
  prerequisites: ['6.5', '10.5'],
  requires: ['multilingual-rtl', 'llm-caching'],
  teaches: ['multimodal-vision-tiling', 'speech-asr-wer', 'video-keyframe-sampling'],
  competencies: ['jr-llm-client', 'mid-observability-cost'],
  lastReviewed: '2026-11-22',
  objectives: [
    'Calculate Multimodal Vision tier image token budgets across low-detail previews vs tiled high-resolution document scans.',
    'Decide cleanly between classical layout OCR + Small-Fast text extraction vs direct Multimodal Vision parsing on receipts and charts.',
    'Design speech pipelines combining Voice Activity Detection (VAD), chunked Speech-Audio transcription, diarization, and Word Error Rate (`WER`) testing.',
    'Control video inference costs via adaptive keyframe deduplication rather than sending raw 30-FPS frame streams.',
  ],
  checkWithoutNotes: [
    'Why does sending a tiny 6px receipt font at low-resolution detail fail vision extraction, whereas high-detail tiling multiplies token bills?',
    'Contrast `OCR -> Small-Fast JSON` vs direct `Multimodal Vision` on messy scanned forms vs clean digital PDFs.',
    'What does Word Error Rate (`WER`) measure, and why can an ASR transcript score low WER while still breaking downstream domain lookups?',
    'Why do video pipelines extract scene-change keyframes instead of uniform 10-FPS sampling?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Beyond Text-Only AI: Documents, Voice & Visual Streams',
      paragraphs: [
        'Enterprise knowledge rarely arrives as clean UTF-8 Markdown. Customer support tickets attach phone screenshots of error dialogs, logistics teams upload crooked scanned bills of lading, and sales teams need searchable transcripts and action items from recorded Arabic and English calls.',
        'Handling multimodal inputs carelessly explodes latency and cloud bills faster than plain text: a single unresized 4K photo sliced into high-detail visual tiles consumes over 1,000 input tokens, and naive frame-by-frame video ingestion burns hundreds of thousands of tokens per minute.',
        'The mental model is a hospital radiology triage desk. You do not put every patient straight into a full-body MRI when a quick digital X-ray or vital-sign check resolves 80% of cases cleanly.',
      ],
    },
    {
      type: 'prose',
      heading: 'Vision Token Budgeting & OCR vs Multimodal Vision Tier',
      paragraphs: [
        'Vision encoders slice high-resolution images into fixed-size square patches (often 512×512 tiles) plus one low-resolution overview tile. Each tile translates into dozens or hundreds of visual tokens.',
        'For clean digital PDFs with selectable text, native layout extraction + Small-Fast JSON parsing costs roughly 10× less than converting pages into images for a Multimodal Vision model. Reserve **Multimodal Vision tier** models specifically for scanned handwriting, rotated receipts, UI bug screenshots, architecture diagrams, and dense multi-column charts.',
        'Always cap max dimensions before upload (for instance longest side `<= 1568px` or `2048px`), strip EXIF GPS metadata for user privacy, and measure field extraction accuracy directly against golden annotated images.',
      ],
    },
    {
      type: 'prose',
      heading: 'Speech-Audio Pipelines (VAD, WER) & Video Keyframe Sampling',
      paragraphs: [
        'Production speech systems run a four-stage chain: **Voice Activity Detection (VAD)** trims dead silence before API upload, long audio splits cleanly along natural pauses with brief overlap, the **Speech-Audio tier** transcribes and optionally diarizes speakers, and domain post-processing normalizes SKUs/acronyms.',
        'Evaluate Speech-to-Text quantitatively via **Word Error Rate (WER)** = `(Substitutions + Deletions + Insertions) / Reference_Words`. Crucially, measure **Entity WER** on critical SKUs, numbers, and brand names—getting 95% overall WER while mangling `"SKU-402"` into `"skew four two"` still breaks downstream search!',
        'For video workflows, extracting every frame wastes >95% budget on near-identical backgrounds. Sample candidate frames at 1 FPS, discard visually redundant frames whose normalized pixel or histogram delta stays below a threshold, and feed only true scene keyframes alongside audio transcript timestamps.',
      ],
    },
    {
      type: 'prose',
      heading: 'Real-World Failure Case: The Unbounded 4K Screenshot Token Explosion',
      paragraphs: [
        'A QA helper bot accepted customer bug screenshots directly via base64 upload at full retina resolution (`3840×2160`) with `detail="high"`. When a batch test replayed 4,000 screenshots, token consumption jumped 9× above forecast and browser upload payloads routinely exceeded reverse-proxy 4MB limits.',
        'Adding server-side image downscaling (longest edge `<= 1568px`), stripping EXIF blobs, routing simple classification checks to low-detail mode, and using high-detail tiling strictly when small error-code crops failed extraction cut vision spend by 68% while preserving full OCR accuracy.',
      ],
    },
    {
      type: 'table',
      title: 'Trade-Off Comparison: Multimodal Document & Media Strategies',
      headers: ['Pipeline Option', 'Unit Cost', 'Accuracy Strength', 'Best Fit'],
      rows: [
        ['PDF Text/Layout Extractor + Small-Fast', 'Lowest (~1x)', 'Crisp on native digital PDFs/tables', 'Clean digital invoices & contracts'],
        ['Direct Multimodal Vision (High Detail)', 'High (~8x–15x)', 'Reads crooked scans, handwriting, UI charts', 'Scanned receipts, bug screenshots, diagrams'],
        ['VAD + Speech-Audio Tier', 'Moderate/min', 'Handles noisy bilingual calls cleanly', 'Call summaries, voice notes, meetings'],
        ['Diff-Based Video Keyframes + Transcript', 'Bounded by scenes', 'Captures visual slides + spoken detail', 'Product demos, training videos'],
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-10-6-tiles',
      title: 'Lab 10.6a: Vision Image Tiling & Token Budget Calculator',
      prompt: 'Implement `estimate_vision_tokens(width: int, height: int, detail: str = "high") -> int`: if `detail == "low"`, return `85`. For `"high"`, scale the image down proportionally so the longest side is `<= 2048` and shortest side `<= 768` (if larger than 768), count 512×512 tiles (`ceil(w/512) * ceil(h/512)`), and return `85 + 170 * tiles`.',
      difficulty: 'guided',
      starterCode: `import math

def estimate_vision_tokens(width: int, height: int, detail: str = "high") -> int:
    # Return 85 for low; else scale bounds and compute 85 + 170 * num_512_tiles
    return 0`,
      testCode: `assert estimate_vision_tokens(4000, 3000, detail="low") == 85
t1 = estimate_vision_tokens(1024, 1024, detail="high")
assert t1 == 85 + 170 * 4, f"Expected 765, got {t1}"
t2 = estimate_vision_tokens(3840, 2160, detail="high")
assert t2 == 85 + 170 * 6, f"Expected 1105 after short-side=768 resize (1365x768 -> 3x2 tiles), got {t2}"
print("PASS: Lab 10.6a vision token tiling verified!")`,
      solutionCode: `import math

def estimate_vision_tokens(width: int, height: int, detail: str = "high") -> int:
    if detail == "low":
        return 85
    w, h = float(width), float(height)
    if max(w, h) > 2048:
        scale = 2048.0 / max(w, h)
        w, h = w * scale, h * scale
    if min(w, h) > 768:
        scale = 768.0 / min(w, h)
        w, h = w * scale, h * scale
    tiles = math.ceil(w / 512.0) * math.ceil(h / 512.0)
    return 85 + 170 * tiles`,
      hint: 'First clamp longest side to `2048`, then clamp shortest side to `768`, then multiply `math.ceil(w / 512) * math.ceil(h / 512)`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-6-wer',
      title: 'Lab 10.6b: Speech ASR Word Error Rate (WER) Evaluator',
      prompt: 'Implement `compute_wer(reference: str, hypothesis: str) -> float` computing exact word-level Levenshtein edit distance `(S + D + I) / len(ref_words)` rounded to 4 decimals (`0.0` if reference is empty). Normalize case and split on whitespace.',
      difficulty: 'spec',
      starterCode: `def compute_wer(reference: str, hypothesis: str) -> float:
    # Compute word-level Levenshtein distance divided by number of reference words
    return 0.0`,
      testCode: `assert compute_wer("reset password now", "reset password now") == 0.0
assert compute_wer("one two three four", "one two nine four") == 0.25
assert compute_wer("check order 402", "check 402") == round(1 / 3, 4)
assert compute_wer("hi", "hi there") == 1.0
print("PASS: Lab 10.6b WER evaluation metric verified!")`,
      solutionCode: `def compute_wer(reference: str, hypothesis: str) -> float:
    ref = reference.lower().split()
    hyp = hypothesis.lower().split()
    if not ref:
        return 0.0 if not hyp else 1.0
    dp = [[0] * (len(hyp) + 1) for _ in range(len(ref) + 1)]
    for i in range(len(ref) + 1):
        dp[i][0] = i
    for j in range(len(hyp) + 1):
        dp[0][j] = j
    for i in range(1, len(ref) + 1):
        for j in range(1, len(hyp) + 1):
            cost = 0 if ref[i - 1] == hyp[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return round(dp[-1][-1] / len(ref), 4)`,
      hint: 'Build an `(len(ref)+1) x (len(hyp)+1)` dynamic programming matrix over word lists `ref` and `hyp`.',
    },
    {
      type: 'python-lab',
      labId: 'lab-10-6-keyframes',
      title: 'Lab 10.6c: Adaptive Video Keyframe Selector (Debug Duplicate Spam)',
      prompt: 'Fix `select_keyframes(frames: list[tuple[float, list[float]]], min_delta: float = 0.20) -> list[float]` so it always keeps the first timestamp and appends subsequent frame timestamps ONLY when the mean absolute difference from the PREVIOUS KEPT keyframe exceeds `min_delta`.',
      difficulty: 'debug',
      starterCode: `def select_keyframes(frames: list[tuple[float, list[float]]], min_delta: float = 0.20) -> list[float]:
    # BUG: returns every single frame without comparing against last kept keyframe!
    return [ts for ts, _ in frames]`,
      testCode: `FRAMES = [
    (0.0, [0.1, 0.1, 0.1]),
    (1.0, [0.12, 0.11, 0.10]),  # near duplicate -> skip
    (2.0, [0.8, 0.8, 0.8]),     # scene cut -> keep
    (3.0, [0.82, 0.79, 0.80]),  # near duplicate -> skip
]
kept = select_keyframes(FRAMES, min_delta=0.20)
assert kept == [0.0, 2.0], f"Expected [0.0, 2.0], got {kept}"
print("PASS: Lab 10.6c video keyframe deduplication verified!")`,
      solutionCode: `def select_keyframes(frames: list[tuple[float, list[float]]], min_delta: float = 0.20) -> list[float]:
    if not frames:
        return []
    kept_ts = [frames[0][0]]
    last_vec = frames[0][1]
    for ts, vec in frames[1:]:
        mad = sum(abs(a - b) for a, b in zip(last_vec, vec)) / max(1, len(vec))
        if mad > min_delta:
            kept_ts.append(ts)
            last_vec = vec
    return kept_ts`,
      hint: 'Compare `sum(abs(a - b) ...)/len(vec) > min_delta` against `last_vec`, updating `last_vec` only when keeping a new keyframe.',
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & Debugging Multimodal Pipelines',
      paragraphs: [
        'Multimodal architectures fail quietly in ways pure-text metrics never catch. First, **sending tiny unreadable crops at low detail**: setting `detail="low"` shrinks a dense 10-line shipping invoice down into one blurred 512×512 thumbnail where 6-point serial numbers turn into hallucinated digits. Inspect sample crops directly and escalate strictly dense tables or small text regions to tiled high detail.',
        'Second, **ignoring domain vocabulary in Speech-to-Text evaluation**: reporting 3.5% average Word Error Rate across friendly call greetings hides catastrophic 40% failure rates on product SKU codes (`E-402`), customer surnames, and bilingual code-switched Arabic/English phrases. Add a dedicated Entity WER slice inside your eval CI alongside SKU-vocabulary post-normalization.',
        'Third, **forgetting upload privacy & size limits**: resize incoming customer photos on upload cleanly below 2,048px longest edge, strip EXIF camera/GPS headers ahead of disk or trace persistence, and align video scene keyframes with timestamped ASR dialogue chunks so vision budgets stay predictable under real traffic spikes.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked End-to-End Example: Hybrid Receipt OCR + Voice Dispute Triage',
      paragraphs: [
        'Walk through a real logistics claims intake pipeline processing both scanned shipping receipts and 4-minute customer voice notes. First, uploaded JPEGs run a fast selectable-text & orientation check: clean digital PDFs extract directly via layout text (`~12ms`, zero vision tokens), while crumpled smartphone photos resize down to `<= 1568px`, strip EXIF location blocks, and call Multimodal Vision tier (`detail="high"`) for line-item JSON extraction.',
        'Simultaneously, the customer audio message runs client/edge VAD to trim 75 seconds of dead pause silence down to 165 active spoken seconds, transcribes over Speech-Audio tier, normalizes spoken SKU codes (`"skew four oh two" -> "SKU-402"`), and verifies Entity WER against a golden test fixture before pairing image + transcript context cleanly.',
      ],
    },
    {
      type: 'prose',
      heading: 'Recap',
      paragraphs: [
        'Keep digital PDFs on layout-aware text extraction; route scans, screenshots, and diagrams to Multimodal Vision tier models cleanly resized.',
        'Trim silence with VAD ahead of Speech-Audio transcription and track both overall WER and critical Entity WER.',
        'Deduplicate video frames via visual-change deltas so you never pay multimodal tokens for static background frames.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q10-6-1',
      question: 'When should a document pipeline choose layout-aware text extraction over converting every page into PNGs for Multimodal Vision?',
      options: [
        'When processing clean digital PDFs with selectable text tables',
        'When deciphering faint handwritten medical prescriptions snapped on smartphone cameras',
        'When diagnosing misaligned CSS modals inside customer-uploaded application screenshots',
        'When extracting labeled electrical nodes from scanned engineering schematics',
      ],
      correctIndex: 0,
      explanation: 'Digital PDF text extraction runs ~10x cheaper and faster without risking visual OCR misreads.',
    },
    {
      id: 'q10-6-2',
      question: 'Why does low overall Word Error Rate (WER = 4%) still break production voice customer service bots?',
      options: [
        'Because JSON serialization encoders raise float precision faults below 0.1',
        'Because garbled SKU codes or dollar digits break downstream lookups',
        'Because standard WER calculations measure only punctuation marks and pauses',
        'Because multi-speaker diarization requires removing zero silence windows ahead',
      ],
      correctIndex: 1,
      explanation: 'Entity-level errors on order IDs, names, or digits hurt task completion even when filler words look clean.',
    },
    {
      id: 'q10-6-3',
      type: 'predict-output',
      question: 'What does `estimate_vision_tokens(2000, 1500, detail="low")` return?',
      code: `tokens = estimate_vision_tokens(2000, 1500, detail="low")`,
      options: [
        '765 tokens (4 tiles + base)',
        '255 tokens (1 tile + base)',
        '85 tokens fixed overview',
        '1105 tokens (6 tiles + base)',
      ],
      correctIndex: 2,
      explanation: 'Low-detail mode uses a fixed overview budget (85 tokens) regardless of source pixel dimensions.',
    },
    {
      id: 'q10-6-4',
      type: 'spot-bug',
      question: 'Spot the hidden risk in storing raw customer-uploaded photos directly without stripping EXIF metadata.',
      options: [
        'EXIF metadata headers trigger UTF-8 decoding errors inside base64 image envelopes',
        'Smartphone EXIF headers leak exact GPS locations and device IDs',
        'Standard PNG renderers drop transparency channels whenever EXIF tags are preserved',
        'EXIF tags automatically multiply vision encoder tile pricing inside cloud APIs',
      ],
      correctIndex: 1,
      explanation: 'Phone photos embed GPS latitude/longitude and camera info in EXIF headers unless stripped at ingest.',
    },
    {
      id: 'q10-6-5',
      type: 'multi-select',
      question: 'Which techniques control cost and preserve privacy in multimodal pipelines?',
      options: [
        'Downscaling huge screenshots to bounded max edges before model calls',
        'Stripping EXIF GPS metadata on image upload',
        'Using Voice Activity Detection to remove dead silence ahead of ASR',
        'Sampling static CCTV feeds at raw 60 FPS directly into Vision LLMs',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 2],
      explanation: 'Bounding image size, stripping EXIF, and VAD silence trimming cut cost and exposure; 60 FPS wastes massive budget.',
    },
    {
      id: 'q10-6-6',
      type: 'ordering',
      question: 'Order the production voice-support processing pipeline cleanly:',
      options: [],
      items: [
        'Trim silence & split pauses via VAD',
        'Transcribe & diarize speakers via Speech-Audio tier',
        'Normalize domain SKUs & numeric codes',
        'Score transcript + run redacted downstream tool lookup',
      ],
      correctIndex: 0,
      explanation: 'VAD strips silence first, ASR transcribes, domain normalization fixes SKUs, then downstream logic runs.',
    },
    {
      id: 'q10-6-7',
      type: 'numeric',
      question: 'If a high-resolution image fits cleanly inside `2 x 2 = 4` tiles of 512px (`85 + 170 * 4`), how many total vision tokens does it consume?',
      options: [],
      correctIndex: 0,
      correctNumber: 765,
      tolerance: 0,
      unit: 'tokens',
      explanation: '85 base + (4 * 170) = 765 tokens.',
    },
    {
      id: 'q10-6-8',
      question: 'How should video QA pipelines combine visual keyframes and spoken audio?',
      options: [
        'Drop audio waveforms entirely so visual frames operate independently in isolation',
        'Embed uncompressed raw RGB pixel arrays inside static JSON system instructions',
        'Convert MP4 audio channels directly into base64 tiled 512px PNG sheets',
        'Pair deduplicated keyframes with timestamped speech transcript chunks',
      ],
      correctIndex: 3,
      explanation: 'Combining timestamped ASR text with changed visual keyframes captures both slides and spoken explanations cheaply.',
    },
  ],
};
