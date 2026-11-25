import type { Lesson } from '@/types/course';
import { MODEL_CATALOG_REVIEWED } from '@/data/modelCatalog';

export const lesson11_7: Lesson = {
  id: '11-7',
  moduleId: 'mod-11',
  number: '11.7',
  title: 'Production Streaming, Backpressure & Inference Serving',
  subtitle: 'Engineer low-latency SSE streaming with client cancellation, size TTFT vs TPOT budgets, and decide when to self-host vLLM vs call managed APIs.',
  durationMinutes: 65,
  track: 'ai-eng',
  prerequisites: ['9.4', '11.1'],
  requires: ['cascading-routing'],
  teaches: ['sse-streaming-cancellation', 'ttft-tpot-slas', 'vllm-continuous-batching'],
  competencies: ['mid-observability-cost', 'mid-rag-production', 'sr-sys-architecture'],
  lastReviewed: MODEL_CATALOG_REVIEWED,
  objectives: [
    'Separate Time-to-First-Token (TTFT) from Time-Per-Output-Token (TPOT) when diagnosing perceived chat latency.',
    'Propagate client disconnect/abort signals through FastAPI/Next.js SSE streams so abandoned requests stop burning GPU or API tokens.',
    'Explain how continuous batching and PagedAttention in vLLM raise throughput without stalling short requests.',
    'Size self-hosted GPU serving vs managed serverless APIs using utilization and peak-to-average traffic ratios.',
  ],
  checkWithoutNotes: [
    'Why does a 2.5s TTFT feel broken even if total generation finishes in 4s?',
    'What happens to backend cost if an SSE endpoint does not check request disconnection while streaming 1,000 tokens?',
    'How does continuous batching differ from static batching in LLM inference servers?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'TTFT vs TPOT: What Users Actually Feel',
      paragraphs: [
        'Mid-level AI engineers are routinely asked why an assistant "feels slow." Averaging total request latency hides two distinct phases: **Time-to-First-Token (TTFT)**—how long the user stares at a blank spinner while prompt prefill and retrieval run—and **Time-Per-Output-Token (TPOT)**—the streaming cadence once tokens begin arriving.',
        'For interactive chat, keeping **TTFT under 800 ms** (via lean system prompts, prompt prefix caching, and parallel retrieval) matters far more than shaving 10% off total 20-second generation time. Conversely, background batch jobs care almost exclusively about total throughput (tokens/sec) and cost per million tokens.',
      ],
    },
    {
      type: 'prose',
      heading: 'Streaming, Backpressure & Cancellation Propagation',
      paragraphs: [
        'Returning a single buffered JSON response for a 900-token answer forces users to wait 10–15 seconds before seeing a single word. Production endpoints stream Server-Sent Events (`text/event-stream`) with heartbeats and structured delta events.',
        'The hidden trap in naive SSE handlers is **orphan generation**: if a user closes the tab or hits "Stop Generating," your backend must detect `request.is_disconnected()` (or pass an `AbortSignal`) and immediately close the upstream LLM stream. Without cancellation propagation, 15–25% of peak traffic can waste tokens and GPU slots on abandoned responses.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-11-7-sla',
      title: 'Lab 11.7: Streaming Latency & Serving Mode Evaluator',
      prompt:
        'Implement `evaluate_serving_plan(ttft_ms: float, tpot_ms: float, output_tokens: int, interactive: bool) -> dict`: compute `total_ms = round(ttft_ms + tpot_ms * output_tokens, 2)` and return `{"total_ms": total_ms, "meets_sla": bool, "mode": "sse-stream" | "batch-async"}` where interactive requests require `ttft_ms <= 800` and `tpot_ms <= 40` to meet SLA, while non-interactive requests always meet SLA if `total_ms <= 30000` and use `"batch-async"`.',
      difficulty: 'guided',
      hint: 'Check `if interactive:` first to apply the 800ms TTFT / 40ms TPOT thresholds and `"sse-stream"`, otherwise compare `total_ms <= 30000` with `"batch-async"`.',
      starterCode: `def evaluate_serving_plan(ttft_ms: float, tpot_ms: float, output_tokens: int, interactive: bool) -> dict:
    # Compute total_ms, meets_sla, and serving mode
    return {"total_ms": 0.0, "meets_sla": False, "mode": "batch-async"}`,
      testCode: `res1 = evaluate_serving_plan(550, 25, 200, True)
assert res1 == {"total_ms": 5550.0, "meets_sla": True, "mode": "sse-stream"}
res2 = evaluate_serving_plan(1200, 25, 200, True)
assert res2 == {"total_ms": 6200.0, "meets_sla": False, "mode": "sse-stream"}
res3 = evaluate_serving_plan(2000, 30, 400, False)
assert res3 == {"total_ms": 14000.0, "meets_sla": True, "mode": "batch-async"}
print("PASS: Lab 11.7 serving SLA evaluator verified!")`,
      solutionCode: `def evaluate_serving_plan(ttft_ms: float, tpot_ms: float, output_tokens: int, interactive: bool) -> dict:
    total_ms = round(ttft_ms + tpot_ms * output_tokens, 2)
    if interactive:
        meets_sla = ttft_ms <= 800 and tpot_ms <= 40
        mode = "sse-stream"
    else:
        meets_sla = total_ms <= 30000
        mode = "batch-async"
    return {"total_ms": total_ms, "meets_sla": meets_sla, "mode": mode}`,
    },
  ],
  quiz: [
    {
      id: 'q11-7-1',
      type: 'multiple-choice',
      question: 'Which metric directly measures how long a chat user waits before seeing the first word appear?',
      options: [
        'TPOT (Time Per Output Token)',
        'TTFT (Time To First Token)',
        'Batch throughput (tokens/sec)',
        'KV-cache eviction ratio',
      ],
      correctIndex: 1,
      explanation: 'TTFT measures prompt prefill + routing + retrieval latency before the first token is emitted.',
    },
    {
      id: 'q11-7-2',
      type: 'multiple-choice',
      question: 'Why must an SSE streaming endpoint propagate client disconnect / AbortSignal to the upstream LLM client?',
      options: [
        'To increase the temperature parameter dynamically',
        'To stop burning tokens and GPU slots when the user closes the tab or clicks Stop',
        'To disable JSON schema validation',
        'To force static batching on the GPU',
      ],
      correctIndex: 1,
      explanation: 'Closing the upstream stream on disconnect prevents wasted token billing and frees inference capacity immediately.',
    },
  ],
};
