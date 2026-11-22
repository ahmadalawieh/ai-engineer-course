import type { CourseModule } from '@/types/course';
import { lesson6_0 } from '../lessons/6-0';
import { lesson6_1 } from '../lessons/6-1';
import { lesson6_2 } from '../lessons/6-2';
import { lesson6_3 } from '../lessons/6-3';
import { lesson6_4 } from '../lessons/6-4';
import { lesson6_5 } from '../lessons/6-5';

export const module6: CourseModule = {
  id: 'mod-6',
  number: 6,
  title: 'Applied AI Engineering: LLM APIs, RAG, Caching & Fine-Tuning',
  subtitle: 'Build reliable LLM API wrappers, typed tool-calling loops, hybrid vector RAG pipelines, tenant-safe caches, multilingual RTL workflows, and LoRA/QLoRA fine-tuning.',
  track: 'ai-eng',
  estimatedHours: 7.5,
  capstoneDeliverable: 'Build a streaming/retry LLM adapter, multi-tenant Hybrid RRF + Cross-Encoder RAG pipeline, semantic cache, and QLoRA weight merger.',
  lessons: [
    lesson6_0,
    lesson6_1,
    lesson6_2,
    lesson6_3,
    lesson6_4,
    lesson6_5,
  ],
};
