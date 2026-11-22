import type { QuizQuestion } from '@/types/course';

export function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically permutes indices [0 .. length-1] for a given seed string.
 */
export function getShuffledIndices(length: number, seedStr: string): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  if (length <= 1) return arr;
  const rng = mulberry32(fnv1a32(seedStr));
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface QuizUserAnswer {
  single?: number; // original option index chosen
  multi?: number[]; // original option indices chosen
  ordered?: number[]; // sequence of original item indices
  numeric?: string; // raw typed string
}

export function isQuestionAnswered(q: QuizQuestion, ans?: QuizUserAnswer): boolean {
  if (!ans) return false;
  const qType = q.type || 'multiple-choice';
  if (qType === 'multi-select') {
    return Array.isArray(ans.multi) && ans.multi.length > 0;
  }
  if (qType === 'ordering') {
    const targetLen = q.items?.length ?? 0;
    return Array.isArray(ans.ordered) && ans.ordered.length === targetLen;
  }
  if (qType === 'numeric') {
    const raw = (ans.numeric ?? '').trim();
    return raw.length > 0 && !Number.isNaN(Number(raw));
  }
  return typeof ans.single === 'number';
}

export function isQuestionCorrect(q: QuizQuestion, ans?: QuizUserAnswer): boolean {
  if (!ans) return false;
  const qType = q.type || 'multiple-choice';
  if (qType === 'multi-select') {
    const expected = [...(q.correctIndices || [])].sort((a, b) => a - b);
    const picked = [...(ans.multi || [])].sort((a, b) => a - b);
    return (
      expected.length > 0 &&
      expected.length === picked.length &&
      expected.every((v, idx) => v === picked[idx])
    );
  }
  if (qType === 'ordering') {
    const targetLen = q.items?.length ?? 0;
    if (!ans.ordered || ans.ordered.length !== targetLen) return false;
    return ans.ordered.every((origIdx, pos) => origIdx === pos);
  }
  if (qType === 'numeric') {
    if (typeof q.correctNumber !== 'number') return false;
    const raw = (ans.numeric ?? '').trim();
    if (!raw) return false;
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return false;
    const tol = q.tolerance ?? 0.01;
    return Math.abs(parsed - q.correctNumber) <= tol;
  }
  return ans.single === q.correctIndex;
}
