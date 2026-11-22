'use client';

import React from 'react';
import { Award, BookOpen, Briefcase, Cloud, Compass, Moon, Search, Sun } from 'lucide-react';
import { useCourseApp } from './ThemeProgressProvider';
import { ALL_LESSONS } from '@/data/curriculum';

export type AppView = 'home' | 'lesson' | 'work' | 'arena';

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
  const { theme, toggleTheme, progress, syncConfig, syncStatus, authUser } = useCourseApp();
  const isConnected = Boolean(authUser) || syncConfig.mode !== 'none' || syncStatus === 'synced';

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Roadmap', icon: <Compass size={16} /> },
    { id: 'lesson', label: 'Study', icon: <BookOpen size={16} /> },
    { id: 'work', label: 'Real Work', icon: <Briefcase size={16} /> },
    { id: 'arena', label: 'Arena', icon: <Award size={16} /> },
  ];

  const syncLabel = authUser
    ? authUser.name.split(' ')[0]
    : syncConfig.mode !== 'none'
      ? 'Synced'
      : 'Sync';

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <button type="button" className="brand-btn" onClick={() => onNavigate('home')}>
            <div className="brand-mark">AI</div>
            <div style={{ minWidth: 0 }}>
              <span className="brand-title">
                AI Mastery <span className="hide-xs">Studio</span>
              </span>
              <span className="brand-sub">Basic to Advanced ML &amp; AI Engineer</span>
            </div>
          </button>

          <nav className="nav-links" aria-label="Primary navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-tab ${activeView === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="nav-actions">
            <button type="button" className="search-trigger hide-mobile" onClick={onOpenSearch}>
              <Search size={14} />
              <span>Search</span>
              <span className="kbd">⌘K</span>
            </button>

            <button
              type="button"
              className="btn btn-sm btn-ghost mobile-only topbar-icon-btn"
              onClick={onOpenSearch}
              aria-label="Search lessons and glossary"
              title="Search"
            >
              <Search size={16} />
            </button>

            <span className="mono hide-mobile" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              {progress.completedLessons.length}/{ALL_LESSONS.length} · {progress.xp} XP
            </span>

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
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
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
