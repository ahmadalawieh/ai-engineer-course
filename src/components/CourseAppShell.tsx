'use client';

import React, { useEffect, useState } from 'react';
import { TopNav, type AppView } from './TopNav';
import { HomeView } from './HomeView';
import { LessonView } from './LessonView';
import { PracticeArena } from './PracticeArena';
import { SearchModal } from './SearchModal';
import { SyncModal } from './SyncModal';
import { useCourseApp } from './ThemeProgressProvider';

export function CourseAppShell() {
  const { progress } = useCourseApp();
  const [view, setView] = useState<AppView>('home');
  const [activeLessonId, setActiveLessonId] = useState<string>('1-1');
  const [arenaTab, setArenaTab] = useState<'flashcards' | 'interview' | 'glossary' | 'certificate'>('flashcards');
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
    <>
      <TopNav
        activeView={view}
        onNavigate={(nextView) => {
          if (nextView === 'lesson' && !activeLessonId) {
            setActiveLessonId(progress.lastVisitedLessonId || '1-1');
          }
          setView(nextView);
        }}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSync={() => setSyncOpen(true)}
      />

      {view === 'home' && (
        <HomeView
          onSelectLesson={openLesson}
          onOpenArena={() => {
            setArenaTab('flashcards');
            setView('arena');
          }}
        />
      )}

      {view === 'lesson' && (
        <LessonView
          lessonId={activeLessonId}
          onSelectLesson={openLesson}
          onBackHome={() => setView('home')}
        />
      )}

      {view === 'arena' && <PracticeArena key={arenaTab} initialTab={arenaTab} />}

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
    </>
  );
}
