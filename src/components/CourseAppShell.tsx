'use client';

import React, { useEffect, useState } from 'react';
import { TopCommandBar, TopNav, type AppView } from './TopNav';
import { HomeView } from './HomeView';
import { LessonView } from './LessonView';
import { PracticeArena, type ArenaTab } from './PracticeArena';
import { JobWorkBench } from './JobWorkBench';
import { SearchModal } from './SearchModal';
import { SyncModal } from './SyncModal';
import { useCourseApp } from './ThemeProgressProvider';

export function CourseAppShell() {
  const { progress } = useCourseApp();
  const [view, setView] = useState<AppView>('home');
  const [activeSection, setActiveSection] = useState<'overview' | 'modules' | 'evidence'>('overview');
  const [activeLessonId, setActiveLessonId] = useState<string>('1-0');
  const [arenaTab, setArenaTab] = useState<ArenaTab>('flashcards');
  const [searchOpen, setSearchOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const l = params.get('lesson');
      const v = params.get('view');
      if (l) {
        setActiveLessonId(l);
        setView('lesson');
      } else if (v === 'arena') {
        setView('arena');
      } else if (v === 'work') {
        setView('work');
      } else if (progress.lastVisitedLessonId) {
        setActiveLessonId(progress.lastVisitedLessonId);
      }
    });

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLesson = (id: string) => {
    setActiveLessonId(id);
    setView('lesson');
  };

  return (
    <div className="dev-shell">
      <TopNav
        activeView={view}
        activeSection={activeSection}
        onNavigate={(nextView) => {
          if (nextView === 'lesson' && !activeLessonId) {
            setActiveLessonId(progress.lastVisitedLessonId || '1-0');
          }
          if (nextView === 'arena') {
            setArenaTab('flashcards');
          }
          setActiveSection('overview');
          setView(nextView);
        }}
        onOpenModules={() => {
          setActiveSection('modules');
          setView('home');
          requestAnimationFrame(() => {
            document.getElementById('curriculum-heading')?.scrollIntoView({ behavior: 'smooth' });
          });
        }}
        onOpenEvidence={() => {
          setActiveSection('evidence');
          setArenaTab('evidence');
          setView('arena');
        }}
      />

      <div className="dev-main-wrap">
        <TopCommandBar onOpenSearch={() => setSearchOpen(true)} onOpenSync={() => setSyncOpen(true)} />

        {view === 'home' && (
          <HomeView
            onSelectLesson={openLesson}
            onOpenWork={() => setView('work')}
            onOpenArena={() => {
              setActiveSection('overview');
              setArenaTab('flashcards');
              setView('arena');
            }}
            onOpenSync={() => setSyncOpen(true)}
          />
        )}

        {view === 'lesson' && (
          <LessonView
            lessonId={activeLessonId}
            onSelectLesson={openLesson}
            onBackHome={() => {
              setActiveSection('overview');
              setView('home');
            }}
          />
        )}

        {view === 'work' && <JobWorkBench />}

        {view === 'arena' && <PracticeArena key={arenaTab} initialTab={arenaTab} onSelectLesson={openLesson} />}
      </div>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectLesson={openLesson}
        onOpenGlossary={() => {
          setArenaTab('glossary');
          setView('arena');
        }}
      />

      <SyncModal open={syncOpen} onClose={() => setSyncOpen(false)} />
    </div>
  );
}
