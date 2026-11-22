import type { CourseModule } from '@/types/course';
import { lesson9_1 } from '../lessons/9-1';
import { lesson9_2 } from '../lessons/9-2';
import { lesson9_3 } from '../lessons/9-3';
import { lesson9_4 } from '../lessons/9-4';

export const module9: CourseModule = {
  id: 'mod-9',
  number: 8,
  title: 'Software Engineering for AI Systems',
  subtitle: 'Package AI workloads into typed FastAPI services, hardened Docker containers, GitHub Actions CI, OWASP-resilient security controls, and free-tier live deployments.',
  track: 'ai-eng',
  estimatedHours: 5.4,
  capstoneDeliverable: 'Ship a containerized FastAPI AI service with auth, cost budgets, CI eval gates, live cloud deployment, README, and incident runbook.',
  lessons: [
    lesson9_1,
    lesson9_2,
    lesson9_3,
    lesson9_4,
  ],
};
