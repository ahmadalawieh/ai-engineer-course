import { ALL_LESSONS } from '@/data/curriculum';
import type { Lesson } from '@/types/course';

const FAST_TRACK_SKIPPED_LESSONS = new Set(['0-1', '0-2', '0-3', '1-0', '1-1', '1-2']);

export function getUnmetPrerequisites(
  lessonId: string,
  completedLessons: string[],
  fastTrackUnlocked = false
): { unmetLessons: Lesson[]; missingTags: string[] } {
  const target = ALL_LESSONS.find((l) => l.id === lessonId);
  if (!target || !target.requires || target.requires.length === 0) {
    return { unmetLessons: [], missingTags: [] };
  }

  const effectiveDone = new Set(completedLessons);
  if (fastTrackUnlocked) {
    for (const id of FAST_TRACK_SKIPPED_LESSONS) effectiveDone.add(id);
  }

  const taughtByDone = new Set<string>();
  const tagTeacher = new Map<string, Lesson>();
  for (const l of ALL_LESSONS) {
    for (const tag of l.teaches || []) {
      if (!tagTeacher.has(tag)) tagTeacher.set(tag, l);
      if (effectiveDone.has(l.id)) taughtByDone.add(tag);
    }
  }

  const missingTags: string[] = [];
  const lessonMap = new Map<string, Lesson>();
  for (const req of target.requires) {
    if (!taughtByDone.has(req)) {
      missingTags.push(req);
      const teacher = tagTeacher.get(req);
      if (teacher && teacher.id !== target.id) {
        lessonMap.set(teacher.id, teacher);
      }
    }
  }

  return {
    unmetLessons: Array.from(lessonMap.values()),
    missingTags,
  };
}
