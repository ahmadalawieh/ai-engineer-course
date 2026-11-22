import LZString from 'lz-string';
import type { CourseProgress, SyncConfig } from '@/types/course';

const PROGRESS_STORAGE_KEY = 'ai_mastery_progress_v1';
const SYNC_CONFIG_STORAGE_KEY = 'ai_mastery_sync_config_v1';

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const CURRENT_PROGRESS_VERSION = 3;

export function generateQuizSeed(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return 'default-learner-seed';
}

export function createInitialProgress(): CourseProgress {
  return {
    version: CURRENT_PROGRESS_VERSION,
    learnerName: 'AI Engineer',
    quizSeed: 'default-learner-seed',
    targetLevel: 'junior',
    learningTrack: 'ai-eng-full',
    fastTrackUnlocked: false,
    moduleExamScores: {},
    projectJournals: {},
    capstoneEvidence: {},
    scenarioScores: {},
    completedLessons: [],
    completedLabs: [],
    completedPuzzles: [],
    completedTickets: [],
    completedPrReviews: [],
    completedSetupSteps: [],
    completedProjectSteps: [],
    labDrafts: {},
    quizScores: {},
    notes: {},
    bookmarks: [],
    flashcardSRS: {},
    interviewCompleted: [],
    xp: 0,
    streakDays: 1,
    lastActiveDate: '',
    lastVisitedLessonId: '0-1',
    updatedAt: 0,
  };
}

export function migrateProgress(raw: unknown): CourseProgress {
  const base = createInitialProgress();
  if (!raw || typeof raw !== 'object') return base;
  const parsed = raw as Partial<CourseProgress>;
  const validLevel = parsed.targetLevel === 'junior' || parsed.targetLevel === 'mid' || parsed.targetLevel === 'senior'
    ? parsed.targetLevel
    : base.targetLevel;
  const validTrack =
    parsed.learningTrack === 'ai-eng-fast' ||
    parsed.learningTrack === 'ai-eng-full' ||
    parsed.learningTrack === 'dual-ml-ai'
      ? parsed.learningTrack
      : parsed.fastTrackUnlocked
        ? 'ai-eng-fast'
        : base.learningTrack;

  return {
    ...base,
    ...parsed,
    version: CURRENT_PROGRESS_VERSION,
    learnerName: typeof parsed.learnerName === 'string' && parsed.learnerName ? parsed.learnerName : base.learnerName,
    quizSeed: typeof parsed.quizSeed === 'string' && parsed.quizSeed ? parsed.quizSeed : base.quizSeed,
    targetLevel: validLevel,
    learningTrack: validTrack,
    fastTrackUnlocked: Boolean(parsed.fastTrackUnlocked),
    moduleExamScores:
      parsed.moduleExamScores && typeof parsed.moduleExamScores === 'object' ? parsed.moduleExamScores : {},
    projectJournals:
      parsed.projectJournals && typeof parsed.projectJournals === 'object' ? parsed.projectJournals : {},
    capstoneEvidence:
      parsed.capstoneEvidence && typeof parsed.capstoneEvidence === 'object' ? parsed.capstoneEvidence : {},
    scenarioScores:
      parsed.scenarioScores && typeof parsed.scenarioScores === 'object' ? parsed.scenarioScores : {},
    completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
    completedLabs: Array.isArray(parsed.completedLabs) ? parsed.completedLabs : [],
    completedPuzzles: Array.isArray(parsed.completedPuzzles) ? parsed.completedPuzzles : [],
    completedTickets: Array.isArray(parsed.completedTickets) ? parsed.completedTickets : [],
    completedPrReviews: Array.isArray(parsed.completedPrReviews) ? parsed.completedPrReviews : [],
    completedSetupSteps: Array.isArray(parsed.completedSetupSteps) ? parsed.completedSetupSteps : [],
    completedProjectSteps: Array.isArray(parsed.completedProjectSteps) ? parsed.completedProjectSteps : [],
    labDrafts: parsed.labDrafts && typeof parsed.labDrafts === 'object' ? parsed.labDrafts : {},
    quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
    notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
    flashcardSRS:
      parsed.flashcardSRS && typeof parsed.flashcardSRS === 'object' ? parsed.flashcardSRS : {},
    interviewCompleted: Array.isArray(parsed.interviewCompleted) ? parsed.interviewCompleted : [],
    xp: typeof parsed.xp === 'number' && Number.isFinite(parsed.xp) ? parsed.xp : 0,
    streakDays: typeof parsed.streakDays === 'number' && parsed.streakDays >= 1 ? parsed.streakDays : 1,
    lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : '',
    lastVisitedLessonId:
      typeof parsed.lastVisitedLessonId === 'string' && parsed.lastVisitedLessonId
        ? parsed.lastVisitedLessonId
        : base.lastVisitedLessonId,
    updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
  };
}

export function loadLocalProgress(): CourseProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return createInitialProgress();
    return migrateProgress(JSON.parse(raw));
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
 * - Unions completed lessons, labs, puzzles, tickets, PR reviews, setup/project steps, bookmarks, and interview questions
 * - Keeps highest bestScore for quizzes & module exams
 * - Takes newer notes/labDrafts/SRS/journals by updatedAt (while preserving keys only present on one device)
 */
export function mergeProgress(localRaw: CourseProgress, remoteRaw: CourseProgress): CourseProgress {
  const local = migrateProgress(localRaw);
  const remote = migrateProgress(remoteRaw);
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

  const mergedExams: NonNullable<CourseProgress['moduleExamScores']> = { ...(older.moduleExamScores || {}) };
  for (const [modId, ex] of Object.entries(newer.moduleExamScores || {})) {
    const prev = mergedExams[modId];
    mergedExams[modId] = prev
      ? { score: ex.score, total: Math.max(prev.total, ex.total), bestScore: Math.max(prev.bestScore, ex.bestScore) }
      : ex;
  }

  const completedLessons = union(local.completedLessons, remote.completedLessons);
  const completedLabs = union(local.completedLabs, remote.completedLabs);
  const completedPuzzles = union(local.completedPuzzles || [], remote.completedPuzzles || []);
  const completedTickets = union(local.completedTickets || [], remote.completedTickets || []);
  const completedPrReviews = union(local.completedPrReviews || [], remote.completedPrReviews || []);
  const completedSetupSteps = union(local.completedSetupSteps || [], remote.completedSetupSteps || []);
  const completedProjectSteps = union(local.completedProjectSteps || [], remote.completedProjectSteps || []);
  const interviewCompleted = union(local.interviewCompleted, remote.interviewCompleted);

  const mergedXp = Math.max(
    local.xp,
    remote.xp,
    completedLessons.length * 100 +
      completedLabs.length * 60 +
      completedPuzzles.length * 25 +
      completedTickets.length * 80 +
      completedPrReviews.length * 45 +
      completedSetupSteps.length * 15 +
      completedProjectSteps.length * 20 +
      interviewCompleted.length * 40
  );

  return {
    version: CURRENT_PROGRESS_VERSION,
    learnerName: newer.learnerName || older.learnerName || 'AI Engineer',
    quizSeed:
      (local.quizSeed && local.quizSeed !== 'default-learner-seed' ? local.quizSeed : remote.quizSeed) ||
      'default-learner-seed',
    fastTrackUnlocked: Boolean(local.fastTrackUnlocked || remote.fastTrackUnlocked),
    targetLevel: newer.targetLevel || older.targetLevel || 'junior',
    learningTrack: newer.learningTrack || older.learningTrack || 'ai-eng-full',
    placementScore: newer.placementScore || older.placementScore,
    moduleExamScores: mergedExams,
    projectJournals: { ...(older.projectJournals || {}), ...(newer.projectJournals || {}) },
    capstoneEvidence: { ...(older.capstoneEvidence || {}), ...(newer.capstoneEvidence || {}) },
    scenarioScores: { ...(older.scenarioScores || {}), ...(newer.scenarioScores || {}) },
    completedLessons,
    completedLabs,
    completedPuzzles,
    completedTickets,
    completedPrReviews,
    completedSetupSteps,
    completedProjectSteps,
    labDrafts: { ...(older.labDrafts || {}), ...(newer.labDrafts || {}) },
    quizScores: mergedQuizzes,
    notes: { ...older.notes, ...newer.notes },
    bookmarks: union(local.bookmarks, remote.bookmarks),
    flashcardSRS: { ...older.flashcardSRS, ...newer.flashcardSRS },
    interviewCompleted,
    xp: mergedXp,
    streakDays: Math.max(local.streakDays, remote.streakDays),
    lastActiveDate:
      local.lastActiveDate > remote.lastActiveDate ? local.lastActiveDate : remote.lastActiveDate,
    lastVisitedLessonId: newer.lastVisitedLessonId || older.lastVisitedLessonId || '1-0',
    updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0, Date.now()),
  };
}

export function encodePortableToken(progress: CourseProgress): string {
  const json = JSON.stringify(progress);
  return 'AIMC1_' + LZString.compressToEncodedURIComponent(json);
}

export function extractSyncTokenFromString(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.includes('sync=')) {
    const raw = trimmed.split('sync=')[1].split('&')[0].split('#')[0];
    return decodeURIComponent(raw);
  }
  return trimmed;
}

export function decodePortableToken(token: string): CourseProgress | null {
  try {
    const extracted = extractSyncTokenFromString(token);
    if (!extracted) return null;
    const payload = extracted.startsWith('AIMC1_') ? extracted.slice(6) : extracted;
    const json = LZString.decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<CourseProgress>;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.completedLessons)) {
      return null;
    }
    return migrateProgress(parsed);
  } catch {
    return null;
  }
}
