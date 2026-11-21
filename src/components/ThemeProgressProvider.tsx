'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { CourseProgress, FlashcardReviewState, SyncConfig } from '@/types/course';
import {
  createInitialProgress,
  decodePortableToken,
  loadLocalProgress,
  loadSyncConfig,
  mergeProgress,
  saveLocalProgress,
  saveSyncConfig,
  updateStreak,
} from '@/lib/progress';
import { pullFromCloudKV, pushToCloudKV, syncWithGitHubGist } from '@/lib/syncClient';

type ThemeMode = 'light' | 'dark';

interface AppContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  progress: CourseProgress;
  syncConfig: SyncConfig;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncMessage: string;
  markLessonComplete: (lessonId: string) => void;
  markLabComplete: (labId: string) => void;
  recordQuizScore: (lessonId: string, score: number, total: number) => void;
  saveLessonNote: (lessonId: string, text: string) => void;
  toggleBookmark: (lessonId: string) => void;
  setLastVisitedLesson: (lessonId: string) => void;
  setLearnerName: (name: string) => void;
  reviewFlashcard: (cardId: string, quality: 1 | 2 | 3 | 4) => void;
  markInterviewComplete: (questionId: string) => void;
  updateSyncConfig: (next: SyncConfig) => void;
  runSyncNow: (overrideConfig?: SyncConfig) => Promise<{ ok: boolean; message: string }>;
  pullSyncNow: (overrideConfig?: SyncConfig) => Promise<{ ok: boolean; message: string }>;
  importProgressObject: (incoming: CourseProgress) => void;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function ThemeProgressProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [progress, setProgress] = useState<CourseProgress>(() => createInitialProgress());
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({ mode: 'none', autoSync: true });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('Local only');
  const [hydrated, setHydrated] = useState(false);

  const autoSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const savedTheme = (window.localStorage.getItem('ai_mastery_theme') as ThemeMode) || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);

      let local = updateStreak(loadLocalProgress());
      const cfg = loadSyncConfig();
      setSyncConfig(cfg);

      // Support instant cross-device import via ?sync=AIMC1_...
      const params = new URLSearchParams(window.location.search);
      const syncToken = params.get('sync');
      if (syncToken) {
        const decoded = decodePortableToken(syncToken);
        if (decoded) {
          local = mergeProgress(local, decoded);
          setSyncMessage('Imported & merged from Sync Link');
          setSyncStatus('synced');
        }
        params.delete('sync');
        const cleanUrl =
          window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', cleanUrl);
      }

      saveLocalProgress(local);
      setProgress(local);
      setHydrated(true);

      if (cfg.mode !== 'none') {
        setSyncStatus('synced');
        setSyncMessage(cfg.mode === 'cloud-kv' ? `Cloud Key: ${cfg.syncKey}` : 'GitHub Gist Connected');
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      window.localStorage.setItem('ai_mastery_theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  const runSyncNow = useCallback(
    async (overrideConfig?: SyncConfig): Promise<{ ok: boolean; message: string }> => {
      const cfg = overrideConfig || syncConfig;
      if (cfg.mode === 'none') {
        return { ok: false, message: 'No remote sync method configured.' };
      }
      setSyncStatus('syncing');
      setSyncMessage('Syncing...');

      if (cfg.mode === 'cloud-kv') {
        const res = await pushToCloudKV(cfg.syncKey || '', progress);
        if (res.ok && res.progress) {
          setProgress(res.progress);
          saveLocalProgress(res.progress);
          const nextCfg = { ...cfg, lastSyncedAt: Date.now() };
          setSyncConfig(nextCfg);
          saveSyncConfig(nextCfg);
          setSyncStatus('synced');
          setSyncMessage(res.message);
          return { ok: true, message: res.message };
        }
        setSyncStatus('error');
        setSyncMessage(res.message);
        return { ok: false, message: res.message };
      }

      if (cfg.mode === 'github-gist') {
        const res = await syncWithGitHubGist(cfg, progress);
        if (res.ok && res.progress) {
          setProgress(res.progress);
          saveLocalProgress(res.progress);
          const nextCfg = {
            ...cfg,
            gistId: res.gistId || cfg.gistId,
            lastSyncedAt: Date.now(),
          };
          setSyncConfig(nextCfg);
          saveSyncConfig(nextCfg);
          setSyncStatus('synced');
          setSyncMessage(res.message);
          return { ok: true, message: res.message };
        }
        setSyncStatus('error');
        setSyncMessage(res.message);
        return { ok: false, message: res.message };
      }

      return { ok: false, message: 'Unsupported sync mode.' };
    },
    [progress, syncConfig]
  );

  const pullSyncNow = useCallback(
    async (overrideConfig?: SyncConfig): Promise<{ ok: boolean; message: string }> => {
      const cfg = overrideConfig || syncConfig;
      if (cfg.mode === 'cloud-kv') {
        setSyncStatus('syncing');
        const res = await pullFromCloudKV(cfg.syncKey || '', progress);
        if (res.ok && res.progress) {
          setProgress(res.progress);
          saveLocalProgress(res.progress);
          const nextCfg = { ...cfg, lastSyncedAt: Date.now() };
          setSyncConfig(nextCfg);
          saveSyncConfig(nextCfg);
          setSyncStatus('synced');
          setSyncMessage(res.message);
          return { ok: true, message: res.message };
        }
        setSyncStatus('error');
        setSyncMessage(res.message);
        return { ok: false, message: res.message };
      }
      return runSyncNow(cfg);
    },
    [progress, runSyncNow, syncConfig]
  );

  const commitProgress = useCallback(
    (updater: (prev: CourseProgress) => CourseProgress) => {
      setProgress((prev) => {
        const next = { ...updateStreak(updater(prev)), updatedAt: Date.now() };
        saveLocalProgress(next);
        return next;
      });
    },
    []
  );

  // Debounced background auto-sync when progress updates
  useEffect(() => {
    if (!hydrated || syncConfig.mode === 'none' || !syncConfig.autoSync) return;
    if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
    autoSyncTimer.current = setTimeout(() => {
      void runSyncNow();
    }, 2500);
    return () => {
      if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.updatedAt, hydrated, syncConfig.mode, syncConfig.autoSync]);

  const markLessonComplete = useCallback(
    (lessonId: string) => {
      commitProgress((prev) => {
        if (prev.completedLessons.includes(lessonId)) return prev;
        return {
          ...prev,
          completedLessons: [...prev.completedLessons, lessonId],
          xp: prev.xp + 100,
        };
      });
    },
    [commitProgress]
  );

  const markLabComplete = useCallback(
    (labId: string) => {
      commitProgress((prev) => {
        if (prev.completedLabs.includes(labId)) return prev;
        return {
          ...prev,
          completedLabs: [...prev.completedLabs, labId],
          xp: prev.xp + 60,
        };
      });
    },
    [commitProgress]
  );

  const recordQuizScore = useCallback(
    (lessonId: string, score: number, total: number) => {
      commitProgress((prev) => {
        const prevBest = prev.quizScores[lessonId]?.bestScore ?? 0;
        const completed =
          score >= Math.ceil(total * 0.66) && !prev.completedLessons.includes(lessonId)
            ? [...prev.completedLessons, lessonId]
            : prev.completedLessons;
        const gainedLessonXp = completed.length > prev.completedLessons.length ? 100 : 0;
        return {
          ...prev,
          completedLessons: completed,
          xp: prev.xp + gainedLessonXp + (score > prevBest ? (score - prevBest) * 20 : 0),
          quizScores: {
            ...prev.quizScores,
            [lessonId]: { score, total, bestScore: Math.max(prevBest, score) },
          },
        };
      });
    },
    [commitProgress]
  );

  const saveLessonNote = useCallback(
    (lessonId: string, text: string) => {
      commitProgress((prev) => ({
        ...prev,
        notes: { ...prev.notes, [lessonId]: text },
      }));
    },
    [commitProgress]
  );

  const toggleBookmark = useCallback(
    (lessonId: string) => {
      commitProgress((prev) => {
        const exists = prev.bookmarks.includes(lessonId);
        return {
          ...prev,
          bookmarks: exists
            ? prev.bookmarks.filter((id) => id !== lessonId)
            : [...prev.bookmarks, lessonId],
        };
      });
    },
    [commitProgress]
  );

  const setLastVisitedLesson = useCallback((lessonId: string) => {
    setProgress((prev) => {
      if (prev.lastVisitedLessonId === lessonId) return prev;
      const next = { ...prev, lastVisitedLessonId: lessonId };
      saveLocalProgress(next);
      return next;
    });
  }, []);

  const setLearnerName = useCallback(
    (name: string) => {
      commitProgress((prev) => ({ ...prev, learnerName: name.trim() || 'AI Engineer' }));
    },
    [commitProgress]
  );

  // SM-2 spaced repetition scheduling
  const reviewFlashcard = useCallback(
    (cardId: string, quality: 1 | 2 | 3 | 4) => {
      commitProgress((prev) => {
        const cur: FlashcardReviewState = prev.flashcardSRS[cardId] || {
          intervalDays: 0,
          easeFactor: 2.5,
          reps: 0,
          nextReviewAt: 0,
        };
        let reps = cur.reps;
        let intervalDays = cur.intervalDays;
        let easeFactor = cur.easeFactor;

        if (quality === 1) {
          reps = 0;
          intervalDays = 0;
        } else {
          if (reps === 0) intervalDays = 1;
          else if (reps === 1) intervalDays = 4;
          else intervalDays = Math.round(intervalDays * easeFactor * (quality === 4 ? 1.3 : quality === 2 ? 0.8 : 1));
          reps += 1;
          easeFactor = Math.max(1.3, easeFactor + (quality === 4 ? 0.15 : quality === 2 ? -0.15 : 0));
        }

        const nextReviewAt = Date.now() + intervalDays * 24 * 60 * 60 * 1000;
        return {
          ...prev,
          xp: prev.xp + 10,
          flashcardSRS: {
            ...prev.flashcardSRS,
            [cardId]: { intervalDays, easeFactor, reps, nextReviewAt },
          },
        };
      });
    },
    [commitProgress]
  );

  const markInterviewComplete = useCallback(
    (questionId: string) => {
      commitProgress((prev) => {
        if (prev.interviewCompleted.includes(questionId)) return prev;
        return {
          ...prev,
          interviewCompleted: [...prev.interviewCompleted, questionId],
          xp: prev.xp + 40,
        };
      });
    },
    [commitProgress]
  );

  const updateSyncConfig = useCallback((next: SyncConfig) => {
    setSyncConfig(next);
    saveSyncConfig(next);
    if (next.mode === 'none') {
      setSyncStatus('idle');
      setSyncMessage('Local only');
    }
  }, []);

  const importProgressObject = useCallback(
    (incoming: CourseProgress) => {
      const merged = mergeProgress(progress, incoming);
      saveLocalProgress(merged);
      setProgress(merged);
      setSyncStatus('synced');
      setSyncMessage('Merged imported progress');
    },
    [progress]
  );

  const resetProgress = useCallback(() => {
    const fresh = createInitialProgress();
    saveLocalProgress(fresh);
    setProgress(fresh);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        progress,
        syncConfig,
        syncStatus,
        syncMessage,
        markLessonComplete,
        markLabComplete,
        recordQuizScore,
        saveLessonNote,
        toggleBookmark,
        setLastVisitedLesson,
        setLearnerName,
        reviewFlashcard,
        markInterviewComplete,
        updateSyncConfig,
        runSyncNow,
        pullSyncNow,
        importProgressObject,
        resetProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useCourseApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useCourseApp must be used inside ThemeProgressProvider');
  return ctx;
}
