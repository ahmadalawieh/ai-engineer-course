import type { ModelCatalogEntry } from '@/types/course';

export const MODEL_CATALOG_REVIEWED = '2026-11-22';

/**
 * Single source of truth for model roles and dated real-world examples.
 * Lessons reference abstract roles (e.g. "small-fast-model", "frontier-reasoning")
 * and link to this catalog so content stays valid as provider versions evolve.
 */
export const MODEL_CATALOG: ModelCatalogEntry[] = [
  {
    roleId: 'small-fast',
    roleLabel: 'Small Fast Model (Router / Classifier / Extraction)',
    lastReviewed: MODEL_CATALOG_REVIEWED,
    currentExamples: [
      'OpenAI GPT-4.1 mini / GPT-4o mini (2025–2026)',
      'Anthropic Claude Haiku 3.5 / 4.x',
      'Google Gemini 2.5 Flash',
      'Qwen 2.5 7B / Llama 3.1 8B (local Ollama / vLLM)',
    ],
    typicalContext: '128K–1M tokens',
    useWhen: 'High-volume intent routing, structured extraction, moderation, or draft generation under strict <500ms latency and <$0.001/request budgets.',
    avoidWhen: 'Ambiguous multi-hop planning or complex codebase refactoring where small models miss subtle edge constraints.',
  },
  {
    roleId: 'frontier-reasoning',
    roleLabel: 'Frontier / Reasoning Model (Complex Synthesis & Planning)',
    lastReviewed: MODEL_CATALOG_REVIEWED,
    currentExamples: [
      'OpenAI GPT-4.1 / o3 / GPT-5 tier',
      'Anthropic Claude Sonnet 4 / Opus tier',
      'Google Gemini 2.5 Pro',
    ],
    typicalContext: '128K–2M tokens',
    useWhen: 'Multi-step tool orchestration, nuanced legal/code synthesis, complex SQL planning, and offline golden-eval judge baselines.',
    avoidWhen: 'Simple classification, FAQ lookups, or uncached repetitive tasks better handled by a small-fast model cascade.',
  },
  {
    roleId: 'embedding',
    roleLabel: 'Dense Embedding Model (Semantic Retrieval)',
    lastReviewed: MODEL_CATALOG_REVIEWED,
    currentExamples: [
      'OpenAI text-embedding-3-small / large (Matryoshka dims)',
      'BAAI bge-m3 / bge-small-en-v1.5 (local HuggingFace / Ollama)',
      'Cohere embed-v4 (multilingual)',
    ],
    typicalContext: '512–8,192 tokens per chunk',
    useWhen: 'Bi-encoder first-stage semantic retrieval in hybrid BM25 + HNSW pipelines (pair with multilingual encoders for Arabic/EN).',
    avoidWhen: 'Exact SKU/error-code matching without sparse BM25 backup, or mixing vectors across incompatible encoder models.',
  },
  {
    roleId: 'reranker',
    roleLabel: 'Stage-2 Cross-Encoder Reranker',
    lastReviewed: MODEL_CATALOG_REVIEWED,
    currentExamples: [
      'Cohere Rerank 3.5 / v3',
      'BAAI bge-reranker-v2-m3 (open-weights multilingual)',
    ],
    typicalContext: '512–4,096 tokens per (query, doc) pair',
    useWhen: 'Rescoring top 30–100 hybrid candidates down to top 5 sharpest passages before generation.',
    avoidWhen: 'Running directly over millions of documents (Cross-Encoders are O(N) per query and belong strictly at Stage 2).',
  },
  {
    roleId: 'multimodal-vision',
    roleLabel: 'Multimodal Vision-Language / Document OCR Model',
    lastReviewed: MODEL_CATALOG_REVIEWED,
    currentExamples: [
      'Frontier Vision LLMs (GPT-4.1 / Claude Sonnet / Gemini 2.5 Flash)',
      'Open-weights Qwen2.5-VL 7B / Docling + layout OCR pipelines',
    ],
    typicalContext: '128K+ tokens (image tiles + text)',
    useWhen: 'Parsing scanned PDFs, invoices, complex nested charts/tables, and UI screenshots where plain PDF text extractors scramble layout.',
    avoidWhen: 'Clean digital text/Markdown files where cheap deterministic parsers (`pypdf`/`markdown`) extract exact text at 100x lower cost.',
  },
  {
    roleId: 'speech-audio',
    roleLabel: 'Speech-to-Text (ASR) & Text-to-Speech (TTS)',
    lastReviewed: MODEL_CATALOG_REVIEWED,
    currentExamples: [
      'OpenAI Whisper large-v3 / gpt-4o-transcribe',
      'Deepgram Nova-2 / faster-whisper (local GPU)',
    ],
    typicalContext: 'Chunked 30s audio windows / real-time WebSocket streams',
    useWhen: 'Voice support agents, meeting/call-center transcription + RAG indexing, and multilingual audio ingestion.',
    avoidWhen: 'Passing raw binary audio files directly into text-only LLMs without timestamped transcription and diarization.',
  },
  {
    roleId: 'local-open-weights',
    roleLabel: 'Self-Hosted / Local Open-Weights (Ollama / vLLM)',
    lastReviewed: MODEL_CATALOG_REVIEWED,
    currentExamples: [
      'Qwen 2.5 / Qwen 3 (7B–32B)',
      'Llama 3.x / Mistral / Gemma 3 (4B–27B)',
    ],
    typicalContext: '32K–128K tokens (VRAM-bounded KV cache)',
    useWhen: 'Zero-cost local capstone development (Ollama), strict VPC/HIPAA data residency, or steady high-QPS workloads on dedicated GPUs.',
    avoidWhen: 'Low-traffic prototypes running on tiny 512 MB free-tier containers without GPU acceleration.',
  },
];

export function getModelRole(roleId: ModelCatalogEntry['roleId']): ModelCatalogEntry {
  return MODEL_CATALOG.find((m) => m.roleId === roleId) || MODEL_CATALOG[0];
}
