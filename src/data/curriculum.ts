import { module1 } from './modules/module1';
import { module2 } from './modules/module2';
import { module3 } from './modules/module3';
import { module4 } from './modules/module4';
import { module5 } from './modules/module5';
import { module6 } from './modules/module6';
import { module7 } from './modules/module7';
import { module8 } from './modules/module8';
import type { CourseModule, Lesson } from '@/types/course';

export const COURSE_MODULES: CourseModule[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8,
];

export const ALL_LESSONS: Lesson[] = COURSE_MODULES.flatMap((m) => m.lessons);

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getModuleById(id: string): CourseModule | undefined {
  return COURSE_MODULES.find((m) => m.id === id);
}

export function getAdjacentLessons(id: string): { prev?: Lesson; next?: Lesson } {
  const idx = ALL_LESSONS.findIndex((l) => l.id === id);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? ALL_LESSONS[idx - 1] : undefined,
    next: idx < ALL_LESSONS.length - 1 ? ALL_LESSONS[idx + 1] : undefined,
  };
}

export function getTotalCourseMinutes(): number {
  return ALL_LESSONS.reduce((acc, l) => acc + l.durationMinutes, 0);
}
