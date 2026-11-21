import LZString from 'lz-string';
import type { CourseProgress, SyncConfig } from '@/types/course';

const PROGRESS_STORAGE_KEY = 'ai_mastery_progress_v1';
const SYNC_CONFIG_STORAGE_KEY = 'ai_mastery_sync_config_v1';

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createInitialProgress(): CourseProgress {
  return {
    version: 1,
    learnerName: 'AI Engineer',
    completedLessons: [],
    completedLabs: [],
    quizScores: {},
    notes: {},
    bookmarks: [],
    flashcardSRS: {},
    interviewCompleted: [],
    xp: 0,
    streakDays: 1,
    lastActiveDate: '',
    lastVisitedLessonId: '1-1',
    updatedAt: 0,
  };
}

export function loadLocalProgress(): CourseProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<CourseProgress>;
    return {
      ...createInitialProgress(),
      ...parsed,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      completedLabs: Array.isArray(parsed.completedLabs) ? parsed.completedLabs : [],
      quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      flashcardSRS:
        parsed.flashcardSRS && typeof parsed.flashcardSRS === 'object' ? parsed.flashcardSRS : {},
      interviewCompleted: Array.isArray(parsed.interviewCompleted) ? parsed.interviewCompleted : [],
    };
  } catch {
    return createInitialProgress();
  }
}

export function saveLocalProgress(progress: CourseProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSyncConfig(): SyncConfig {
  if (typeof window === 'undefined') {
    return { mode: 'none', autoSync: true };
  }
  try {
    const raw = window.localStorage.getItem(SYNC_CONFIG_STORAGE_KEY);
    if (!raw) return { mode: 'none', autoSync: true };
    return { mode: 'none', autoSync: true, ...JSON.parse(raw) };
  } catch {
    return { mode: 'none', autoSync: true };
  }
}

export function saveSyncConfig(config: SyncConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SYNC_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore
  }
}

export function updateStreak(progress: CourseProgress): CourseProgress {
  const today = getTodayIsoDate();
  if (!progress.lastActiveDate) {
    return { ...progress, streakDays: 1, lastActiveDate: today };
  }
  if (progress.lastActiveDate === today) return progress;
  const lastDate = new Date(progress.lastActiveDate + 'T00:00:00Z');
  const todayDate = new Date(today + 'T00:00:00Z');
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    ...progress,
    streakDays: diffDays === 1 ? progress.streakDays + 1 : 1,
    lastActiveDate: today,
  };
}

/**
 * Conflict-free merge between two devices:
 * - Unions completed lessons, labs, bookmarks, and interview questions
 * - Keeps highest bestScore for quizzes
 * - Takes newer notes/SRS by updatedAt (while preserving keys only present on one device)
 */
export function mergeProgress(local: CourseProgress, remote: CourseProgress): CourseProgress {
  const remoteIsNewer = (remote.updatedAt || 0) >= (local.updatedAt || 0);
  const older = remoteIsNewer ? local : remote;
  const newer = remoteIsNewer ? remote : local;

  const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));

  const mergedQuizzes: CourseProgress['quizScores'] = { ...older.quizScores };
  for (const [lessonId, q] of Object.entries(newer.quizScores)) {
    const prev = mergedQuizzes[lessonId];
    if (!prev) {
      mergedQuizzes[lessonId] = q;
    } else {
      mergedQuizzes[lessonId] = {
        score: q.score,
        total: Math.max(prev.total, q.total),
        bestScore: Math.max(prev.bestScore, q.bestScore),
      };
    }
  }

  const completedLessons = union(local.completedLessons, remote.completedLessons);
  const completedLabs = union(local.completedLabs, remote.completedLabs);
  const interviewCompleted = union(local.interviewCompleted, remote.interviewCompleted);

  const mergedXp = Math.max(
    local.xp,
    remote.xp,
    completedLessons.length * 100 + completedLabs.length * 60 + interviewCompleted.length * 40
  );

  return {
    version: 1,
    learnerName: newer.learnerName || older.learnerName || 'AI Engineer',
    completedLessons,
    completedLabs,
    quizScores: mergedQuizzes,
    notes: { ...older.notes, ...newer.notes },
    bookmarks: union(local.bookmarks, remote.bookmarks),
    flashcardSRS: { ...older.flashcardSRS, ...newer.flashcardSRS },
    interviewCompleted,
    xp: mergedXp,
    streakDays: Math.max(local.streakDays, remote.streakDays),
    lastActiveDate:
      local.lastActiveDate > remote.lastActiveDate ? local.lastActiveDate : remote.lastActiveDate,
    lastVisitedLessonId: newer.lastVisitedLessonId || older.lastVisitedLessonId || '1-1',
    updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0, Date.now()),
  };
}

export function encodePortableToken(progress: CourseProgress): string {
  const json = JSON.stringify(progress);
  return 'AIMC1_' + LZString.compressToEncodedURIComponent(json);
}

export function decodePortableToken(token: string): CourseProgress | null {
  try {
    const trimmed = token.trim();
    const payload = trimmed.startsWith('AIMC1_') ? trimmed.slice(6) : trimmed;
    const json = LZString.decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    const parsed = JSON.parse(json) as CourseProgress;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.completedLessons)) {
      return null;
    }
    return {
      ...createInitialProgress(),
      ...parsed,
    };
  } catch {
    return null;
  }
}
