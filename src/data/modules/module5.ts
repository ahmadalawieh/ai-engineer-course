import type { CourseModule } from '@/types/course';
import { lesson5_1 } from '../lessons/5-1';
import { lesson5_2 } from '../lessons/5-2';
import { lesson5_3 } from '../lessons/5-3';
import { lesson5_4 } from '../lessons/5-4';

export const module5: CourseModule = {
  id: 'mod-5',
  number: 5,
  title: 'Transformers & LLMs Under the Hood',
  subtitle: 'BPE tokenization, RoPE, Causal Self-Attention, GQA & KV caching, GPU VRAM & MoE math, FlashAttention, SFT masking, DPO, and decoding controls.',
  track: 'ai-eng',
  estimatedHours: 5.2,
  capstoneDeliverable: 'Implement BPE merging, 2D RoPE rotation, Causal Self-Attention + KV-cache decoding, Top-2 MoE routing, and Top-p Nucleus sampling in Python/NumPy.',
  lessons: [
    lesson5_1,
    lesson5_2,
    lesson5_3,
    lesson5_4,
  ],
};
