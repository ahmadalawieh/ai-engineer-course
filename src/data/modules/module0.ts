import type { CourseModule } from '@/types/course';
import { lesson0_1 } from '../lessons/0-1';
import { lesson0_2 } from '../lessons/0-2';
import { lesson0_3 } from '../lessons/0-3';

export const module0: CourseModule = {
  id: 'mod-0',
  number: 0,
  title: 'Your Computer, Terminal & Developer Tools',
  subtitle: 'Set up your machine like a working engineer: terminal paths, Python virtual environments, Git/GitHub workflows, tracebacks, and reproducible notebooks.',
  track: 'core',
  recommendedPath: 'foundation',
  estimatedHours: 3,
  capstoneDeliverable: 'Configure a reproducible Python workspace with pinned dependencies, clean Git branch history, secret-safe .env config, and structured error diagnosis.',
  lessons: [lesson0_1, lesson0_2, lesson0_3],
};
