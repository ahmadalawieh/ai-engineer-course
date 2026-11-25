'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Moon, Sparkles, Sun } from 'lucide-react';
import { ALL_JOURNEY_LESSONS, getJourneyLessonById } from '@/data/journeyCurriculum';
import type { OsPlatform } from '@/types/journey';
import { MissionBoardView } from './MissionBoardView';
import { StepLessonPlayerView } from './StepLessonPlayerView';
import { ShipVerifyView } from './ShipVerifyView';
import { SyncModal } from './SyncModal';
import { useCourseApp } from './ThemeProgressProvider';

export type StudioScreen = 'path' | 'lesson' | 'projects';

export function CourseAppShell() {
  const { theme, toggleTheme, progress, syncConfig, syncStatus, authUser } = useCourseApp();

  const completedSet = useMemo(() => new Set(progress.completedLessons || []), [progress.completedLessons]);

  const firstOpenLesson = useMemo(
    () => ALL_JOURNEY_LESSONS.find((l) => !completedSet.has(l.id)) || ALL_JOURNEY_LESSONS[0],
    [completedSet]
  );

  const [screen, setScreen] = useState<StudioScreen>('path');
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [activeLessonId, setActiveLessonId] = useState<string>('1-1');
  const [osPlatform, setOsPlatform] = useState<OsPlatform>('windows');
  const [syncOpen, setSyncOpen] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const savedOs = window.localStorage.getItem('ai_studio_os') as OsPlatform | null;
      if (savedOs === 'windows' || savedOs === 'mac') {
        setOsPlatform(savedOs);
      }

      const params = new URLSearchParams(window.location.search);
      const l = params.get('lesson');
      const s = params.get('screen');
      if (l) {
        const found = getJourneyLessonById(l);
        if (found) {
          setActiveLessonId(found.id);
          setSelectedStage(found.stageNumber);
          setScreen('lesson');
          return;
        }
      }
      if (s === 'projects') {
        setScreen('projects');
        return;
      }
      setActiveLessonId(firstOpenLesson.id);
      setSelectedStage(firstOpenLesson.stageNumber);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeOs = (next: OsPlatform) => {
    setOsPlatform(next);
    window.localStorage.setItem('ai_studio_os', next);
  };

  const isSynced = Boolean(authUser) || syncConfig.mode !== 'none' || syncStatus === 'synced';
  const doneCount = ALL_JOURNEY_LESSONS.filter((l) => completedSet.has(l.id)).length;

  return (
    <div className="studio-app">
      <header className="studio-header">
        <button
          type="button"
          className="studio-brand"
          onClick={() => setScreen('path')}
        >
          <span className="studio-brand-icon">
            <Sparkles size={15} />
          </span>
          <span className="studio-brand-text">AI Engineer Studio</span>
        </button>

        <nav className="studio-nav-tabs" aria-label="Course navigation">
          <button
            type="button"
            className={`studio-nav-tab ${screen === 'path' ? 'active' : ''}`}
            onClick={() => setScreen('path')}
          >
            1. My Path
          </button>
          <button
            type="button"
            className={`studio-nav-tab ${screen === 'lesson' ? 'active' : ''}`}
            onClick={() => setScreen('lesson')}
          >
            2. Current Lesson
          </button>
          <button
            type="button"
            className={`studio-nav-tab ${screen === 'projects' ? 'active' : ''}`}
            onClick={() => setScreen('projects')}
          >
            3. My 7 Projects
          </button>
        </nav>

        <div className="studio-header-right">
          <button
            type="button"
            className="studio-sync-pill"
            onClick={() => setSyncOpen(true)}
            title="Sync progress across devices"
          >
            <span>
              {doneCount}/{ALL_JOURNEY_LESSONS.length} Done · {isSynced ? 'Synced' : 'Sync'}
            </span>
            <span className={`studio-sync-dot ${isSynced ? 'on' : ''}`} />
          </button>

          <button
            type="button"
            className="studio-icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </header>

      {screen === 'path' && (
        <MissionBoardView
          selectedStage={selectedStage}
          onSelectStage={(num) => setSelectedStage(num)}
          onOpenLesson={(lid) => {
            const found = getJourneyLessonById(lid);
            if (found) setSelectedStage(found.stageNumber);
            setActiveLessonId(lid);
            setScreen('lesson');
          }}
          onOpenProject={(num) => {
            setSelectedStage(num);
            setScreen('projects');
          }}
        />
      )}

      {screen === 'lesson' && (
        <StepLessonPlayerView
          key={activeLessonId}
          lessonId={activeLessonId}
          osPlatform={osPlatform}
          onChangeOs={handleChangeOs}
          onBackPath={() => setScreen('path')}
          onSelectLesson={(nextId) => {
            const found = getJourneyLessonById(nextId);
            if (found) setSelectedStage(found.stageNumber);
            setActiveLessonId(nextId);
          }}
          onOpenProject={(num) => {
            setSelectedStage(num);
            setScreen('projects');
          }}
        />
      )}

      {screen === 'projects' && (
        <ShipVerifyView initialStageNumber={selectedStage} osPlatform={osPlatform} />
      )}

      <SyncModal open={syncOpen} onClose={() => setSyncOpen(false)} />
    </div>
  );
}
