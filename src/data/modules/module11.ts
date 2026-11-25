import type { CourseModule } from '@/types/course';
import { lesson11_1 } from '../lessons/11-1';
import { lesson11_2 } from '../lessons/11-2';
import { lesson11_3 } from '../lessons/11-3';
import { lesson11_4 } from '../lessons/11-4';
import { lesson11_5 } from '../lessons/11-5';
import { lesson11_6 } from '../lessons/11-6';
import { lesson11_7 } from '../lessons/11-7';
import { lesson11_8 } from '../lessons/11-8';

export const module11: CourseModule = {
  id: 'mod-11',
  number: 11,
  title: 'Production LLMOps, Deep Evals, Cloud Platforms & Engineering Judgment',
  subtitle: 'Operate reliable enterprise AI with OpenTelemetry GenAI spans, production-mined trajectory & statistical evals, threat modeling & red-teaming, managed cloud platforms/DLQs, ADRs, and dated capability-role catalogs.',
  track: 'ai-eng',
  recommendedPath: 'ai-eng',
  estimatedHours: 10.0,
  capstoneDeliverable: 'Produce audit-ready OpenTelemetry traces, CI regression & red-team suites, SLO policies, and Architecture Decision Records.',
  lessons: [
    lesson11_1,
    lesson11_2,
    lesson11_3,
    lesson11_4,
    lesson11_5,
    lesson11_6,
    lesson11_7,
    lesson11_8,
  ],
};
