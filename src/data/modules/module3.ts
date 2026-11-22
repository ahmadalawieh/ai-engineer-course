import type { CourseModule } from '@/types/course';
import { lesson3_1 } from '../lessons/3-1';
import { lesson3_2 } from '../lessons/3-2';
import { lesson3_3 } from '../lessons/3-3';
import { lesson3_4 } from '../lessons/3-4';
import { lesson3_5 } from '../lessons/3-5';

export const module3: CourseModule = {
  id: 'mod-3',
  number: 3,
  title: 'Classical Machine Learning Mastery',
  subtitle: 'Linear baselines, regularization, bias-variance tradeoff, XGBoost/GBDTs, unsupervised clustering/PCA, production CV/SHAP workflows, and when NOT to use ML.',
  track: 'ds',
  recommendedPath: 'ml-depth',
  estimatedHours: 6.4,
  capstoneDeliverable: 'Train, cross-validate, calibrate, slice errors on, and ROI-justify a tabular ML pipeline against a deterministic rule baseline.',
  lessons: [
    lesson3_1,
    lesson3_2,
    lesson3_3,
    lesson3_4,
    lesson3_5,
  ],
};
