import type { CourseModule } from '@/types/course';
import { lesson10_1 } from '../lessons/10-1';
import { lesson10_2 } from '../lessons/10-2';
import { lesson10_3 } from '../lessons/10-3';
import { lesson10_4 } from '../lessons/10-4';
import { lesson10_5 } from '../lessons/10-5';
import { lesson10_6 } from '../lessons/10-6';

export const module10: CourseModule = {
  id: 'mod-10',
  number: 10,
  title: 'Applied AI Engineering: FinOps, Tooling, MCP & Multimodal',
  subtitle: 'Engineer cost-efficient, extensible AI systems with prompt prefix caching, Batch APIs, resilient tool calling, MCP servers, checkpointed agent memory, GraphRAG/Text-to-SQL, and multimodal pipelines.',
  track: 'ai-eng',
  recommendedPath: 'ai-eng',
  estimatedHours: 7.8,
  capstoneDeliverable: 'Ship cost-governed, MCP-enabled multimodal RAG and WooCommerce tool-calling services backed by validator evidence.json.',
  lessons: [
    lesson10_1,
    lesson10_2,
    lesson10_3,
    lesson10_4,
    lesson10_5,
    lesson10_6,
  ],
};
