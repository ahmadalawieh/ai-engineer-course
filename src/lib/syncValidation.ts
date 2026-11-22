import type { CourseProgress } from '@/types/course';

export const MAX_SYNC_PAYLOAD_BYTES = 220_000;

export function normalizeAndValidateSyncKey(rawKey: unknown): string | null {
  if (typeof rawKey !== 'string') return null;
  const cleaned = rawKey
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .slice(0, 64);
  if (cleaned.length < 16) return null;
  return cleaned;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
}

function isBoundedStringArray(val: unknown, maxItems = 300, maxLen = 96): val is string[] {
  if (!Array.isArray(val) || val.length > maxItems) return false;
  return val.every((item) => typeof item === 'string' && item.length <= maxLen);
}

function isBoundedStringMap(val: unknown, maxKeys: number, maxValLen: number): boolean {
  if (!isPlainObject(val)) return false;
  const entries = Object.entries(val);
  if (entries.length > maxKeys) return false;
  return entries.every(
    ([k, v]) => typeof k === 'string' && k.length <= 96 && typeof v === 'string' && v.length <= maxValLen
  );
}

function isFiniteNonNegInt(val: unknown, max = 10_000_000): boolean {
  return typeof val === 'number' && Number.isFinite(val) && val >= 0 && val <= max;
}

export interface SyncValidationResult {
  ok: boolean;
  error?: string;
}

const ALLOWED_TOP_LEVEL_KEYS = new Set([
  'version',
  'learnerName',
  'quizSeed',
  'targetLevel',
  'learningTrack',
  'fastTrackUnlocked',
  'placementScore',
  'moduleExamScores',
  'projectJournals',
  'capstoneEvidence',
  'scenarioScores',
  'completedLessons',
  'completedLabs',
  'completedPuzzles',
  'completedTickets',
  'completedPrReviews',
  'completedSetupSteps',
  'completedProjectSteps',
  'labDrafts',
  'quizScores',
  'notes',
  'bookmarks',
  'flashcardSRS',
  'interviewCompleted',
  'xp',
  'streakDays',
  'lastActiveDate',
  'lastVisitedLessonId',
  'updatedAt',
]);

export function validateCourseProgressPayload(raw: unknown): SyncValidationResult {
  if (!isPlainObject(raw)) {
    return { ok: false, error: 'Progress payload must be a JSON object.' };
  }

  for (const key of Object.keys(raw)) {
    if (!ALLOWED_TOP_LEVEL_KEYS.has(key)) {
      return { ok: false, error: `Unexpected progress field: ${key}` };
    }
  }

  const p = raw as Partial<CourseProgress>;

  if (p.version !== undefined && !isFiniteNonNegInt(p.version, 100)) {
    return { ok: false, error: 'Invalid progress.version.' };
  }
  if (p.learnerName !== undefined && (typeof p.learnerName !== 'string' || p.learnerName.length > 120)) {
    return { ok: false, error: 'Invalid learnerName.' };
  }
  if (p.quizSeed !== undefined && (typeof p.quizSeed !== 'string' || p.quizSeed.length > 128)) {
    return { ok: false, error: 'Invalid quizSeed.' };
  }
  if (p.targetLevel !== undefined && p.targetLevel !== 'junior' && p.targetLevel !== 'mid' && p.targetLevel !== 'senior') {
    return { ok: false, error: 'Invalid targetLevel.' };
  }
  if (
    p.learningTrack !== undefined &&
    p.learningTrack !== 'ai-eng-fast' &&
    p.learningTrack !== 'ai-eng-full' &&
    p.learningTrack !== 'dual-ml-ai'
  ) {
    return { ok: false, error: 'Invalid learningTrack.' };
  }
  if (p.fastTrackUnlocked !== undefined && typeof p.fastTrackUnlocked !== 'boolean') {
    return { ok: false, error: 'Invalid fastTrackUnlocked flag.' };
  }

  const stringListFields: (keyof CourseProgress)[] = [
    'completedLessons',
    'completedLabs',
    'completedPuzzles',
    'completedTickets',
    'completedPrReviews',
    'completedSetupSteps',
    'completedProjectSteps',
    'bookmarks',
    'interviewCompleted',
  ];
  for (const field of stringListFields) {
    if (p[field] !== undefined && !isBoundedStringArray(p[field], 400, 96)) {
      return { ok: false, error: `Invalid string list in ${String(field)}.` };
    }
  }

  if (p.labDrafts !== undefined && !isBoundedStringMap(p.labDrafts, 300, 32_000)) {
    return { ok: false, error: 'Invalid or oversized labDrafts.' };
  }
  if (p.notes !== undefined && !isBoundedStringMap(p.notes, 150, 24_000)) {
    return { ok: false, error: 'Invalid or oversized notes.' };
  }
  if (p.projectJournals !== undefined && !isBoundedStringMap(p.projectJournals, 50, 24_000)) {
    return { ok: false, error: 'Invalid or oversized projectJournals.' };
  }

  if (p.quizScores !== undefined) {
    if (!isPlainObject(p.quizScores) || Object.keys(p.quizScores).length > 150) {
      return { ok: false, error: 'Invalid quizScores map.' };
    }
    for (const val of Object.values(p.quizScores)) {
      if (
        !isPlainObject(val) ||
        !isFiniteNonNegInt(val.score, 500) ||
        !isFiniteNonNegInt(val.total, 500) ||
        !isFiniteNonNegInt(val.bestScore, 500)
      ) {
        return { ok: false, error: 'Invalid quizScores entry.' };
      }
    }
  }

  if (p.moduleExamScores !== undefined) {
    if (!isPlainObject(p.moduleExamScores) || Object.keys(p.moduleExamScores).length > 60) {
      return { ok: false, error: 'Invalid moduleExamScores map.' };
    }
    for (const val of Object.values(p.moduleExamScores)) {
      if (!isPlainObject(val) || !isFiniteNonNegInt(val.total, 500) || !isFiniteNonNegInt(val.bestScore, 500)) {
        return { ok: false, error: 'Invalid moduleExamScores entry.' };
      }
    }
  }

  if (p.capstoneEvidence !== undefined) {
    if (!isPlainObject(p.capstoneEvidence) || Object.keys(p.capstoneEvidence).length > 30) {
      return { ok: false, error: 'Invalid capstoneEvidence map.' };
    }
    for (const ev of Object.values(p.capstoneEvidence)) {
      if (
        !isPlainObject(ev) ||
        typeof ev.projectId !== 'string' ||
        ev.projectId.length > 80 ||
        typeof ev.repoUrl !== 'string' ||
        ev.repoUrl.length > 512 ||
        typeof ev.evidenceJsonRaw !== 'string' ||
        ev.evidenceJsonRaw.length > 36_000
      ) {
        return { ok: false, error: 'Invalid capstoneEvidence entry.' };
      }
    }
  }

  if (p.scenarioScores !== undefined && (!isPlainObject(p.scenarioScores) || Object.keys(p.scenarioScores).length > 80)) {
    return { ok: false, error: 'Invalid scenarioScores.' };
  }

  if (p.flashcardSRS !== undefined && (!isPlainObject(p.flashcardSRS) || Object.keys(p.flashcardSRS).length > 1500)) {
    return { ok: false, error: 'Invalid flashcardSRS map.' };
  }

  if (p.xp !== undefined && !isFiniteNonNegInt(p.xp, 50_000_000)) {
    return { ok: false, error: 'Invalid xp.' };
  }
  if (p.streakDays !== undefined && !isFiniteNonNegInt(p.streakDays, 50_000)) {
    return { ok: false, error: 'Invalid streakDays.' };
  }
  if (p.updatedAt !== undefined && !isFiniteNonNegInt(p.updatedAt, 10_000_000_000_000)) {
    return { ok: false, error: 'Invalid updatedAt.' };
  }
  if (p.lastActiveDate !== undefined && (typeof p.lastActiveDate !== 'string' || p.lastActiveDate.length > 40)) {
    return { ok: false, error: 'Invalid lastActiveDate.' };
  }
  if (p.lastVisitedLessonId !== undefined && (typeof p.lastVisitedLessonId !== 'string' || p.lastVisitedLessonId.length > 40)) {
    return { ok: false, error: 'Invalid lastVisitedLessonId.' };
  }

  return { ok: true };
}

export interface RateBucketResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * In-memory sliding-window rate limiter per client key/IP (works in serverless & Node tests cleanly).
 */
export class SlidingWindowLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  check(bucketKey: string, nowMs = Date.now()): RateBucketResult {
    const cutoff = nowMs - this.windowMs;
    const prev = this.hits.get(bucketKey) || [];
    const active = prev.filter((ts) => ts > cutoff);
    if (active.length >= this.maxRequests) {
      const oldest = active[0];
      const retryAfterSec = Math.max(1, Math.ceil((oldest + this.windowMs - nowMs) / 1000));
      this.hits.set(bucketKey, active);
      return { allowed: false, remaining: 0, retryAfterSec };
    }
    active.push(nowMs);
    this.hits.set(bucketKey, active);
    if (this.hits.size > 5000) {
      const firstKey = this.hits.keys().next().value;
      if (firstKey) this.hits.delete(firstKey);
    }
    return { allowed: true, remaining: this.maxRequests - active.length, retryAfterSec: 0 };
  }
}
