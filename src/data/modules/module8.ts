import type { CourseModule } from '@/types/course';
import { lesson8_1 } from '../lessons/8-1';
import { lesson8_2 } from '../lessons/8-2';
import { lesson8_3 } from '../lessons/8-3';
import { lesson8_4 } from '../lessons/8-4';
import { lesson8_5 } from '../lessons/8-5';

export const module8: CourseModule = {
  id: 'mod-8',
  number: 9,
  title: 'Coding Interviews, System Design & Career Launch',
  subtitle: 'Master Python coding interviews, ML & DS product case studies, 5-pillar AI System Design, STAR take-homes, and resume/portfolio launch for full-time or freelance roles.',
  track: 'core',
  estimatedHours: 6.8,
  capstoneDeliverable: 'Pass the timed coding, ML theory, and system design simulations and publish 4-6 deployed portfolio capstones.',
  lessons: [
    lesson8_1,
    lesson8_2,
    lesson8_3,
    lesson8_4,
    lesson8_5,
  ],
};
