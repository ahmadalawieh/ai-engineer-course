'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type {
  CapstoneEvidence,
  CourseProgress,
  FlashcardReviewState,
  LevelId,
  ScenarioScoreRecord,
  SyncConfig,
} from '@/types/course';
import {
  createInitialProgress,
  decodePortableToken,
  generateQuizSeed,
  loadLocalProgress,
  loadSyncConfig,
  mergeProgress,
  saveLocalProgress,
  saveSyncConfig,
  updateStreak,
} from '@/lib/progress';
import {
  fetchAuthSession,
  logoutGoogleSession,
  pullFromCloudKV,
  pushToCloudKV,
  syncWithGitHubGist,
  syncWithGoogleCloud,
  type ClientAuthUser,
} from '@/lib/syncClient';

type ThemeMode = 'light' | 'dark';

interface AuthEnvInfo {
  googleConfigured: boolean;
  kvConfigured: boolean;
}

interface AppContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  progress: CourseProgress;
  syncConfig: SyncConfig;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncMessage: string;
  authUser: ClientAuthUser | null;
  authEnv: AuthEnvInfo;
  authNotice: string;
  signOutGoogle: () => Promise<void>;
  markLessonComplete: (lessonId: string) => void;
  markLabComplete: (labId: string) => void;
  markPuzzleComplete: (puzzleId: string) => void;
  markTicketComplete: (ticketId: string) => void;
  markPrReviewComplete: (prId: string) => void;
  toggleSetupStep: (stepId: string) => void;
  toggleProjectStep: (stepId: string) => void;
  saveLabDraft: (labId: string, code: string) => void;
  clearLabDraft: (labId: string) => void;
  recordQuizScore: (lessonId: string, score: number, total: number) => void;
  saveLessonNote: (lessonId: string, text: string) => void;
  toggleBookmark: (lessonId: string) => void;
  setLastVisitedLesson: (lessonId: string) => void;
  setLearnerName: (name: string) => void;
  unlockFastTrack: (score: number, total: number) => void;
  recordModuleExamScore: (moduleId: string, score: number, total: number) => void;
  saveProjectJournal: (projectId: string, text: string) => void;
  setTargetLevel: (level: LevelId) => void;
  setLearningTrack: (track: 'ai-eng-fast' | 'ai-eng-full' | 'dual-ml-ai') => void;
  saveCapstoneEvidence: (projectId: string, evidence: CapstoneEvidence) => void;
  recordScenarioAssessment: (record: ScenarioScoreRecord) => void;
  reviewFlashcard: (cardId: string, quality: 1 | 2 | 3 | 4) => void;
  markInterviewComplete: (questionId: string) => void;
  updateSyncConfig: (next: SyncConfig) => void;
  runSyncNow: (overrideConfig?: SyncConfig) => Promise<{ ok: boolean; message: string }>;
  pullSyncNow: (overrideConfig?: SyncConfig) => Promise<{ ok: boolean; message: string }>;
  importProgressObject: (incoming: CourseProgress) => void;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function extractSyncParamFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  const searchParams = new URLSearchParams(window.location.search);
  const fromQuery = searchParams.get('sync');
  if (fromQuery) return fromQuery;

  const hash = window.location.hash;
  if (hash && hash.includes('sync=')) {
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    return hashParams.get('sync');
  }
  return null;
}

function clearSyncParamFromLocation(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.delete('sync');
  params.delete('google_auth');
  params.delete('sync_notice');
  let cleanHash = window.location.hash;
  if (cleanHash && cleanHash.includes('sync=')) {
    const hashParams = new URLSearchParams(cleanHash.startsWith('#') ? cleanHash.slice(1) : cleanHash);
    hashParams.delete('sync');
    cleanHash = hashParams.toString() ? '#' + hashParams.toString() : '';
  }
  const cleanUrl =
    window.location.pathname + (params.toString() ? '?' + params.toString() : '') + cleanHash;
  window.history.replaceState({}, '', cleanUrl);
}

export function ThemeProgressProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [progress, setProgress] = useState<CourseProgress>(() => createInitialProgress());
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({ mode: 'none', autoSync: true });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('Local only');
  const [authUser, setAuthUser] = useState<ClientAuthUser | null>(null);
  const [authEnv, setAuthEnv] = useState<AuthEnvInfo>({ googleConfigured: false, kvConfigured: false });
  const [authNotice, setAuthNotice] = useState<string>('');
  const [hydrated, setHydrated] = useState(false);

  const autoSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let active = true;
    const rafId = requestAnimationFrame(() => {
      const savedTheme = (window.localStorage.getItem('ai_mastery_theme') as ThemeMode) || 'dark';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);

      let local = updateStreak(loadLocalProgress());
      if (!local.quizSeed || local.quizSeed === 'default-learner-seed') {
        local = { ...local, quizSeed: generateQuizSeed() };
      }
      const cfg = loadSyncConfig();
      setSyncConfig(cfg);

      const urlParams = new URLSearchParams(window.location.search);
      const notice = urlParams.get('sync_notice');
      if (notice === 'google_not_configured') {
        setAuthNotice('Google Login is not configured on Vercel yet—add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET first.');
      } else if (notice === 'google_auth_failed') {
        setAuthNotice('Google sign-in could not be completed. Please try again.');
      }

      // Support instant cross-device import via ?sync=AIMC1_... or #sync=AIMC1_...
      const syncToken = extractSyncParamFromLocation();
      if (syncToken) {
        const decoded = decodePortableToken(syncToken);
        if (decoded) {
          local = mergeProgress(local, decoded);
          setSyncMessage('Imported & merged from Direct Sync Link');
          setSyncStatus('synced');
        }
      }

      if (syncToken || notice || urlParams.get('google_auth')) {
        clearSyncParamFromLocation();
      }

      saveLocalProgress(local);
      setProgress(local);
      setHydrated(true);

      if (cfg.mode !== 'none' && !syncToken) {
        setSyncStatus('synced');
        setSyncMessage(cfg.mode === 'cloud-kv' ? `Cloud Key: ${cfg.syncKey}` : 'GitHub Gist Connected');
      }

      void fetchAuthSession().then(async (session) => {
        if (!active) return;
        setAuthEnv({
          googleConfigured: session.googleConfigured,
          kvConfigured: session.kvConfigured,
        });
        if (session.user) {
          setAuthUser(session.user);
          let nextLocal = local;
          if (nextLocal.learnerName === 'AI Engineer' && session.user.name) {
            nextLocal = { ...nextLocal, learnerName: session.user.name };
            saveLocalProgress(nextLocal);
            setProgress(nextLocal);
          }
          setSyncStatus('syncing');
          setSyncMessage(`Syncing as ${session.user.email}...`);
          const res = await syncWithGoogleCloud(nextLocal);
          if (!active) return;
          if (res.ok && res.progress) {
            saveLocalProgress(res.progress);
            setProgress(res.progress);
            setSyncStatus('synced');
            setSyncMessage(`Google Sync (${session.user.email})`);
          } else {
            setSyncStatus('error');
            setSyncMessage(res.message);
          }
        }
      });
    });

    // Live cross-tab sync within the same browser
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('ai_mastery_progress_sync');
      channelRef.current = bc;
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'progress-update' && ev.data.progress) {
          setProgress((prev) => mergeProgress(prev, ev.data.progress));
        }
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ai_mastery_progress_v1' && e.newValue) {
        try {
          const incoming = JSON.parse(e.newValue) as CourseProgress;
          setProgress((prev) => mergeProgress(prev, incoming));
        } catch {
          // Ignore invalid JSON
        }
      }
    };

    const onHashChange = () => {
      const token = extractSyncParamFromLocation();
      if (!token) return;
      const decoded = decodePortableToken(token);
      if (decoded) {
        setProgress((prev) => {
          const merged = mergeProgress(prev, decoded);
          saveLocalProgress(merged);
          return merged;
        });
        setSyncStatus('synced');
        setSyncMessage('Merged from Direct Sync Link');
      }
      clearSyncParamFromLocation();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hashchange', onHashChange);
      bc?.close();
      channelRef.current = null;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      window.localStorage.setItem('ai_mastery_theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  const signOutGoogle = useCallback(async () => {
    await logoutGoogleSession();
    setAuthUser(null);
    setSyncStatus(syncConfig.mode !== 'none' ? 'synced' : 'idle');
    setSyncMessage(syncConfig.mode !== 'none' ? 'Local + manual sync' : 'Local only');
  }, [syncConfig.mode]);

  const runSyncNow = useCallback(
    async (overrideConfig?: SyncConfig): Promise<{ ok: boolean; message: string }> => {
      const cfg = overrideConfig || syncConfig;

      if (!overrideConfig && authUser) {
        setSyncStatus('syncing');
        setSyncMessage(`Syncing as ${authUser.email}...`);
        const res = await syncWithGoogleCloud(progress);
        if (res.ok && res.progress) {
          setProgress(res.progress);
          saveLocalProgress(res.progress);
          setSyncStatus('synced');
          setSyncMessage(`Google Sync (${authUser.email})`);
          return { ok: true, message: res.message };
        }
        setSyncStatus('error');
        setSyncMessage(res.message);
        return { ok: false, message: res.message };
      }

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
    [authUser, progress, syncConfig]
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
        channelRef.current?.postMessage({ type: 'progress-update', progress: next });
        return next;
      });
    },
    []
  );

  // Debounced background auto-sync when progress updates (Google session OR configured key/gist)
  useEffect(() => {
    const canAutoSync = Boolean(authUser) || (syncConfig.mode !== 'none' && syncConfig.autoSync);
    if (!hydrated || !canAutoSync) return;
    if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
    autoSyncTimer.current = setTimeout(() => {
      void runSyncNow();
    }, 2000);
    return () => {
      if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.updatedAt, hydrated, authUser, syncConfig.mode, syncConfig.autoSync]);

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

  const markPuzzleComplete = useCallback(
    (puzzleId: string) => {
      commitProgress((prev) => {
        const existing = prev.completedPuzzles || [];
        if (existing.includes(puzzleId)) return prev;
        return {
          ...prev,
          completedPuzzles: [...existing, puzzleId],
          xp: prev.xp + 25,
        };
      });
    },
    [commitProgress]
  );

  const markTicketComplete = useCallback(
    (ticketId: string) => {
      commitProgress((prev) => {
        const existing = prev.completedTickets || [];
        if (existing.includes(ticketId)) return prev;
        return {
          ...prev,
          completedTickets: [...existing, ticketId],
          xp: prev.xp + 80,
        };
      });
    },
    [commitProgress]
  );

  const markPrReviewComplete = useCallback(
    (prId: string) => {
      commitProgress((prev) => {
        const existing = prev.completedPrReviews || [];
        if (existing.includes(prId)) return prev;
        return {
          ...prev,
          completedPrReviews: [...existing, prId],
          xp: prev.xp + 45,
        };
      });
    },
    [commitProgress]
  );

  const toggleSetupStep = useCallback(
    (stepId: string) => {
      commitProgress((prev) => {
        const existing = prev.completedSetupSteps || [];
        const has = existing.includes(stepId);
        return {
          ...prev,
          completedSetupSteps: has ? existing.filter((s) => s !== stepId) : [...existing, stepId],
          xp: has ? prev.xp : prev.xp + 15,
        };
      });
    },
    [commitProgress]
  );

  const toggleProjectStep = useCallback(
    (stepId: string) => {
      commitProgress((prev) => {
        const existing = prev.completedProjectSteps || [];
        const has = existing.includes(stepId);
        return {
          ...prev,
          completedProjectSteps: has ? existing.filter((s) => s !== stepId) : [...existing, stepId],
          xp: has ? prev.xp : prev.xp + 20,
        };
      });
    },
    [commitProgress]
  );

  const saveLabDraft = useCallback(
    (labId: string, code: string) => {
      commitProgress((prev) => ({
        ...prev,
        labDrafts: { ...(prev.labDrafts || {}), [labId]: code },
      }));
    },
    [commitProgress]
  );

  const clearLabDraft = useCallback(
    (labId: string) => {
      commitProgress((prev) => {
        const nextDrafts = { ...(prev.labDrafts || {}) };
        delete nextDrafts[labId];
        return { ...prev, labDrafts: nextDrafts };
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

  const unlockFastTrack = useCallback(
    (score: number, total: number) => {
      commitProgress((prev) => ({
        ...prev,
        fastTrackUnlocked: score >= Math.ceil(total * 0.8),
        placementScore: { score, total },
        xp: prev.xp + (prev.placementScore ? 0 : 150),
      }));
    },
    [commitProgress]
  );

  const recordModuleExamScore = useCallback(
    (moduleId: string, score: number, total: number) => {
      commitProgress((prev) => {
        const cur = prev.moduleExamScores?.[moduleId];
        const prevBest = cur?.bestScore || 0;
        return {
          ...prev,
          moduleExamScores: {
            ...(prev.moduleExamScores || {}),
            [moduleId]: {
              score,
              total,
              bestScore: Math.max(prevBest, score),
            },
          },
          xp: prev.xp + (score > prevBest ? (score - prevBest) * 25 : 0),
        };
      });
    },
    [commitProgress]
  );

  const saveProjectJournal = useCallback(
    (projectId: string, text: string) => {
      commitProgress((prev) => ({
        ...prev,
        projectJournals: {
          ...(prev.projectJournals || {}),
          [projectId]: text,
        },
      }));
    },
    [commitProgress]
  );

  const setTargetLevel = useCallback(
    (level: LevelId) => {
      commitProgress((prev) => ({ ...prev, targetLevel: level }));
    },
    [commitProgress]
  );

  const setLearningTrack = useCallback(
    (track: 'ai-eng-fast' | 'ai-eng-full' | 'dual-ml-ai') => {
      commitProgress((prev) => ({ ...prev, learningTrack: track }));
    },
    [commitProgress]
  );

  const saveCapstoneEvidence = useCallback(
    (projectId: string, evidence: CapstoneEvidence) => {
      commitProgress((prev) => ({
        ...prev,
        capstoneEvidence: {
          ...(prev.capstoneEvidence || {}),
          [projectId]: evidence,
        },
      }));
    },
    [commitProgress]
  );

  const recordScenarioAssessment = useCallback(
    (record: ScenarioScoreRecord) => {
      commitProgress((prev) => {
        const had = Boolean(prev.scenarioScores?.[record.scenarioId]);
        return {
          ...prev,
          scenarioScores: {
            ...(prev.scenarioScores || {}),
            [record.scenarioId]: record,
          },
          xp: prev.xp + (had ? 0 : 120),
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
      channelRef.current?.postMessage({ type: 'progress-update', progress: merged });
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
        authUser,
        authEnv,
        authNotice,
        signOutGoogle,
        markLessonComplete,
        markLabComplete,
        markPuzzleComplete,
        markTicketComplete,
        markPrReviewComplete,
        toggleSetupStep,
        toggleProjectStep,
        saveLabDraft,
        clearLabDraft,
        recordQuizScore,
        saveLessonNote,
        toggleBookmark,
        setLastVisitedLesson,
        setLearnerName,
        unlockFastTrack,
        recordModuleExamScore,
        saveProjectJournal,
        setTargetLevel,
        setLearningTrack,
        saveCapstoneEvidence,
        recordScenarioAssessment,
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
