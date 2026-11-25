'use client';

import React from 'react';
import {
  Award,
  BookOpen,
  Briefcase,
  Cloud,
  FileCheck2,
  FolderGit2,
  Home,
  Moon,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useCourseApp } from './ThemeProgressProvider';
import { ALL_LESSONS } from '@/data/curriculum';
import type { LevelId } from '@/types/course';

export type AppView = 'home' | 'lesson' | 'work' | 'arena';

export function TopNav({
  activeView,
  activeSection,
  onNavigate,
  onOpenModules,
  onOpenEvidence,
}: {
  activeView: AppView;
  activeSection?: 'overview' | 'modules' | 'evidence';
  onNavigate: (view: AppView) => void;
  onOpenModules: () => void;
  onOpenEvidence: () => void;
}) {
  const { progress, setTargetLevel } = useCourseApp();
  const activeLevel: LevelId = progress.targetLevel || 'junior';

  const mobileNavItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Overview', icon: <Home size={16} /> },
    { id: 'lesson', label: 'Labs', icon: <BookOpen size={16} /> },
    { id: 'work', label: 'Capstones', icon: <Briefcase size={16} /> },
    { id: 'arena', label: 'Arena', icon: <Award size={16} /> },
  ];

  const levelIdx = activeLevel === 'junior' ? 1 : activeLevel === 'mid' ? 2 : 3;

  return (
    <>
      <aside className="dev-sidebar" aria-label="Primary sidebar">
        <div>
          <button type="button" className="dev-sidebar-brand" onClick={() => onNavigate('home')}>
            <div className="brand-mark">
              <Sparkles size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <span className="brand-title">AI Mastery Studio</span>
              <span className="brand-sub">ML &amp; AI Engineer</span>
            </div>
          </button>

          <nav className="dev-sidebar-nav" aria-label="Sidebar navigation">
            <button
              type="button"
              className={`dev-sidebar-item ${activeView === 'home' && activeSection !== 'modules' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              <Home size={16} />
              <span>Overview</span>
            </button>
            <button
              type="button"
              className={`dev-sidebar-item ${activeView === 'home' && activeSection === 'modules' ? 'active' : ''}`}
              onClick={onOpenModules}
            >
              <FolderGit2 size={16} />
              <span>12 Modules</span>
            </button>
            <button
              type="button"
              className={`dev-sidebar-item ${activeView === 'lesson' ? 'active' : ''}`}
              onClick={() => onNavigate('lesson')}
            >
              <BookOpen size={16} />
              <span>Python &amp; SQL Labs</span>
            </button>
            <button
              type="button"
              className={`dev-sidebar-item ${activeView === 'arena' && activeSection !== 'evidence' ? 'active' : ''}`}
              onClick={() => onNavigate('arena')}
            >
              <Award size={16} />
              <span>Practice Arena</span>
            </button>
            <button
              type="button"
              className={`dev-sidebar-item ${activeView === 'work' ? 'active' : ''}`}
              onClick={() => onNavigate('work')}
            >
              <Briefcase size={16} />
              <span>Capstones</span>
            </button>
            <button
              type="button"
              className={`dev-sidebar-item ${activeView === 'arena' && activeSection === 'evidence' ? 'active' : ''}`}
              onClick={onOpenEvidence}
            >
              <FileCheck2 size={16} />
              <span>Evidence Pack</span>
            </button>
          </nav>
        </div>

        <div className="dev-sidebar-level" aria-label="Target level quick switcher">
          <div className="dev-level-steps">
            <span className={activeLevel === 'junior' ? 'active' : ''}>Junior</span>
            <span>→</span>
            <span className={activeLevel === 'mid' ? 'active' : ''}>Mid</span>
            <span>→</span>
            <span className={activeLevel === 'senior' ? 'active' : ''}>Senior</span>
          </div>
          <div className="dev-level-bar">
            <button
              type="button"
              className={`dev-level-seg ${levelIdx >= 1 ? 'filled' : ''}`}
              onClick={() => setTargetLevel('junior')}
              aria-label="Set target level to Junior"
              title="Junior AI Engineer"
            />
            <button
              type="button"
              className={`dev-level-seg ${levelIdx >= 2 ? 'filled' : ''}`}
              onClick={() => setTargetLevel('mid')}
              aria-label="Set target level to Mid-Level"
              title="Mid-Level AI Engineer"
            />
            <button
              type="button"
              className={`dev-level-seg ${levelIdx >= 3 ? 'filled' : ''}`}
              onClick={() => setTargetLevel('senior')}
              aria-label="Set target level to Senior"
              title="Senior AI Engineer"
            />
          </div>
        </div>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobileNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-tab ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export function TopCommandBar({
  onOpenSearch,
  onOpenSync,
}: {
  onOpenSearch: () => void;
  onOpenSync: () => void;
}) {
  const { theme, toggleTheme, progress, syncConfig, syncStatus, authUser, setLearningTrack } = useCourseApp();
  const isConnected = Boolean(authUser) || syncConfig.mode !== 'none' || syncStatus === 'synced';
  const activeLearningTrack = progress.learningTrack || 'ai-eng-full';

  const syncLabel = authUser
    ? authUser.name.split(' ')[0]
    : syncConfig.mode !== 'none'
      ? 'Synced'
      : 'Sync';

  return (
    <header className="dev-topbar">
      <button type="button" className="dev-search-bar" onClick={onOpenSearch}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Search size={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Search {ALL_LESSONS.length} lessons, 231 glossary terms...
          </span>
        </span>
        <span className="kbd">⌘K</span>
      </button>

      <div className="dev-topbar-right">
        <div className="dev-track-pill hide-mobile" role="group" aria-label="Quick track switcher">
          <button
            type="button"
            className={`dev-track-btn ${activeLearningTrack === 'ai-eng-full' ? 'active' : ''}`}
            onClick={() => setLearningTrack('ai-eng-full')}
          >
            Zero-to-Hire
          </button>
          <button
            type="button"
            className={`dev-track-btn ${activeLearningTrack === 'ai-eng-fast' ? 'active' : ''}`}
            onClick={() => setLearningTrack('ai-eng-fast')}
          >
            Fast Track
          </button>
          <button
            type="button"
            className={`dev-track-btn ${activeLearningTrack === 'dual-ml-ai' ? 'active' : ''}`}
            onClick={() => setLearningTrack('dual-ml-ai')}
          >
            Dual-Track
          </button>
        </div>

        <button
          type="button"
          className="sync-pill"
          onClick={onOpenSync}
          aria-label="Sign in or sync progress across devices"
          title="Sign in or sync progress across devices"
        >
          <span
            className={`sync-dot ${
              syncStatus === 'syncing' ? 'syncing' : isConnected ? 'connected' : ''
            }`}
          />
          <Cloud size={14} />
          <span>{syncLabel}</span>
        </button>

        <button
          type="button"
          className="theme-pill"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          <span className="hide-xs">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </header>
  );
}
