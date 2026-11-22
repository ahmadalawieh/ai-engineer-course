import type { CourseModule } from '@/types/course';
import { lesson7_1 } from '../lessons/7-1';
import { lesson7_2 } from '../lessons/7-2';
import { lesson7_3 } from '../lessons/7-3';
import { lesson7_4 } from '../lessons/7-4';

export const module7: CourseModule = {
  id: 'mod-7',
  number: 7,
  title: 'AI Agents, Golden Evals & Production MLOps',
  subtitle: 'Harden ReAct agents with HITL and budgets, automate CI evaluation gates, optimize vLLM latency and span traces, and monitor production drift safely.',
  track: 'ai-eng',
  recommendedPath: 'ai-eng',
  estimatedHours: 5,
  capstoneDeliverable: 'Build a budget-guarded agent with HITL policies, debias LLM-as-a-Judge in CI, trace spans, and automate PSI/canary rollback.',
  lessons: [
    lesson7_1,
    lesson7_2,
    lesson7_3,
    lesson7_4,
  ],
};
