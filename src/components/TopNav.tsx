'use client';

import React from 'react';
import { Award, BookOpen, Cloud, Compass, Moon, Search, Sun } from 'lucide-react';
import { useCourseApp } from './ThemeProgressProvider';
import { ALL_LESSONS } from '@/data/curriculum';

export type AppView = 'home' | 'lesson' | 'arena';

export function TopNav({
  activeView,
  onNavigate,
  onOpenSearch,
  onOpenSync,
}: {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSearch: () => void;
  onOpenSync: () => void;
}) {
  const { theme, toggleTheme, progress, syncConfig, syncStatus } = useCourseApp();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button type="button" className="brand-btn" onClick={() => onNavigate('home')}>
          <div className="brand-mark">AI</div>
          <div>
            <span className="brand-title">AI Mastery Studio</span>
            <span className="brand-sub">Zero to AI Engineer &amp; Data Scientist</span>
          </div>
        </button>

        <nav className="nav-links" aria-label="Primary navigation">
          <button
            type="button"
            className={`nav-tab ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            <Compass size={15} />
            <span>Roadmap</span>
          </button>
          <button
            type="button"
            className={`nav-tab ${activeView === 'lesson' ? 'active' : ''}`}
            onClick={() => onNavigate('lesson')}
          >
            <BookOpen size={15} />
            <span>Study</span>
          </button>
          <button
            type="button"
            className={`nav-tab ${activeView === 'arena' ? 'active' : ''}`}
            onClick={() => onNavigate('arena')}
          >
            <Award size={15} />
            <span>Practice Arena</span>
          </button>
        </nav>

        <div className="nav-actions">
          <button type="button" className="search-trigger hide-mobile" onClick={onOpenSearch}>
            <Search size={14} />
            <span>Search</span>
            <span className="kbd">⌘K</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-ghost mobile-only"
            onClick={onOpenSearch}
            aria-label="Search lessons and glossary"
            title="Search"
          >
            <Search size={16} />
          </button>

          <span className="mono hide-mobile" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
            {progress.completedLessons.length}/{ALL_LESSONS.length} · {progress.xp} XP
          </span>

          <button type="button" className="sync-pill" onClick={onOpenSync} title="Sync progress across devices">
            <span
              className={`sync-dot ${
                syncStatus === 'syncing' ? 'syncing' : syncConfig.mode !== 'none' || syncStatus === 'synced' ? 'connected' : ''
              }`}
            />
            <Cloud size={13} />
            <span className="hide-mobile">{syncConfig.mode !== 'none' ? 'Synced' : 'Sync'}</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle light/dark theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
