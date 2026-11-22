import type { CourseModule } from '@/types/course';
import { lesson2_1 } from '../lessons/2-1';
import { lesson2_2 } from '../lessons/2-2';
import { lesson2_3 } from '../lessons/2-3';
import { lesson2_4 } from '../lessons/2-4';
import { lesson2_5 } from '../lessons/2-5';

export const module2: CourseModule = {
  id: 'mod-2',
  number: 2,
  title: 'Data Science Foundations & Statistical Inference',
  subtitle: 'Master analytical SQL, Pandas EDA & time series, A/B experimentation, leak-free feature pipelines, and ROI-driven evaluation metrics.',
  track: 'ds',
  estimatedHours: 6.8,
  capstoneDeliverable: 'Design a leak-free SQL + Pandas feature pipeline, run an SRM-checked A/B evaluation, and tune a cost-optimal imbalanced threshold.',
  lessons: [
    lesson2_1,
    lesson2_2,
    lesson2_3,
    lesson2_4,
    lesson2_5,
  ],
};
