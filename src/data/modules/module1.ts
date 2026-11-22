import type { CourseModule } from '@/types/course';
import { lesson1_0 } from '../lessons/1-0';
import { lesson1_1 } from '../lessons/1-1';
import { lesson1_2 } from '../lessons/1-2';
import { lesson1_3 } from '../lessons/1-3';
import { lesson1_4 } from '../lessons/1-4';
import { lesson1_5 } from '../lessons/1-5';
import { lesson1_6 } from '../lessons/1-6';

export const module1: CourseModule = {
  id: 'mod-1',
  number: 1,
  title: 'Python for Real Work, Linear Algebra & Statistics',
  subtitle: 'Master production Python (files, JSON, dataclasses, pytest, REST APIs, async), NumPy vectorization, linear algebra, gradients, and statistical evaluation.',
  track: 'core',
  recommendedPath: 'foundation',
  estimatedHours: 8.5,
  capstoneDeliverable: 'Build typed JSONL parsers, concurrent mock REST clients, batch cosine search, finite-diff verified gradient descent, and A/B statistical eval helpers.',
  lessons: [
    lesson1_0,
    lesson1_1,
    lesson1_2,
    lesson1_3,
    lesson1_4,
    lesson1_5,
    lesson1_6,
  ],
};
