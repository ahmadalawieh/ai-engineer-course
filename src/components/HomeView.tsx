'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Clock,
  Cloud,
  Code2,
  Flame,
  PlayCircle,
} from 'lucide-react';
import { ALL_LESSONS, COURSE_MODULES, TOTAL_LABS, getLessonById, getTotalCourseMinutes } from '@/data/curriculum';
import { useCourseApp } from './ThemeProgressProvider';
import type { TrackTag } from '@/types/course';

function trackLabel(track: TrackTag): string {
  if (track === 'ds') return 'SQL & Tabular ML';
  if (track === 'ai-eng') return 'LLMs, RAG & Agents';
  return 'Core ML/AI';
}

export function HomeView({
  onSelectLesson,
  onOpenArena,
  onOpenSync,
}: {
  onSelectLesson: (lessonId: string) => void;
  onOpenArena: () => void;
  onOpenSync: () => void;
}) {
  const { progress, authUser } = useCourseApp();
  const [trackFilter, setTrackFilter] = useState<'all' | TrackTag>('all');

  const completedCount = progress.completedLessons.length;
  const totalLessons = ALL_LESSONS.length;
  const pct = Math.round((completedCount / totalLessons) * 100);
  const totalHours = (getTotalCourseMinutes() / 60).toFixed(1);

  const resumeLesson = useMemo(() => {
    if (progress.lastVisitedLessonId) {
      const found = getLessonById(progress.lastVisitedLessonId);
      if (found) return found;
    }
    const nextUnfinished = ALL_LESSONS.find((l) => !progress.completedLessons.includes(l.id));
    return nextUnfinished || ALL_LESSONS[0];
  }, [progress.lastVisitedLessonId, progress.completedLessons]);

  const filteredModules = useMemo(() => {
    if (trackFilter === 'all') return COURSE_MODULES;
    return COURSE_MODULES.filter(
      (m) => m.track === trackFilter || m.lessons.some((l) => l.track === trackFilter)
    );
  }, [trackFilter]);

  return (
    <main className="container">
      <section className="hero">
        <div>
          <div className="hero-eyebrow">Basic to Advanced ML &amp; AI Engineer Roadmap</div>
          <h1>From Absolute Beginner to Production ML &amp; AI Engineer.</h1>
          <p className="hero-lead">
            Starting completely from scratch with zero coding experience? Every concept builds
            from first principles—guiding you step-by-step from your very first Python variable
            through interactive SQL, scikit-learn &amp; XGBoost, Deep Learning, Transformers,
            Hybrid RAG, Agents, and AI Evals with <strong>19 live visual simulators</strong>,{' '}
            <strong>code puzzles</strong>, and <strong>in-browser Python &amp; SQL labs</strong>.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSelectLesson(resumeLesson.id)}
              id="hero-start-btn"
            >
              <PlayCircle size={17} />
              {completedCount === 0
                ? `Start Lesson ${resumeLesson.number}: ${resumeLesson.title}`
                : `Resume ${resumeLesson.number}: ${resumeLesson.title}`}
            </button>
            <button type="button" className="btn" onClick={onOpenArena}>
              <Award size={16} />
              Flashcards &amp; Mock Interview
            </button>
          </div>
        </div>

        <aside className="hero-card" aria-label="Course progress summary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>
              YOUR MASTERY PROGRESS
            </span>
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              <Flame size={13} style={{ display: 'inline', marginRight: 3, color: 'var(--accent-warm)' }} />
              {progress.streakDays}d streak
            </span>
          </div>

          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-val">
                {completedCount}/{totalLessons}
              </div>
              <div className="stat-label">Lessons Mastered</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{progress.completedLabs.length}/{TOTAL_LABS}</div>
              <div className="stat-label">Python &amp; SQL Labs</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{progress.xp}</div>
              <div className="stat-label">Total XP Earned</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">~{totalHours}h</div>
              <div className="stat-label">Distilled Study Time</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
            <span style={{ color: 'var(--ink-2)' }}>Overall Readiness</span>
            <strong className="mono">{pct}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px 12px',
              fontSize: '0.8rem',
              color: 'var(--ink-muted)',
            }}
          >
            <span>
              <Code2 size={13} style={{ display: 'inline', marginRight: 4 }} />
              {COURSE_MODULES.length} Modules · {totalLessons} Lessons · {TOTAL_LABS} Labs
            </span>
            <button type="button" className="btn btn-sm" onClick={onOpenSync}>
              <Cloud size={13} /> {authUser ? `Synced (${authUser.name.split(' ')[0]})` : 'Google / Direct Sync'}
            </button>
          </div>
        </aside>
      </section>

      <section aria-labelledby="curriculum-heading">
        <div className="section-header">
          <div>
            <h2 id="curriculum-heading">Complete 8-Module ML &amp; AI Engineer Path</h2>
            <p style={{ color: 'var(--ink-2)', fontSize: '0.95rem', marginTop: 4 }}>
              Step-by-step from zero code to job-ready Python, SQL, scikit-learn, XGBoost, LLMs, RAG, and Agents.
            </p>
          </div>

          <div className="pill-tabs" role="tablist" aria-label="Filter by skill pillar">
            <button
              type="button"
              className={`pill-tab ${trackFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTrackFilter('all')}
            >
              All Modules ({COURSE_MODULES.length})
            </button>
            <button
              type="button"
              className={`pill-tab ${trackFilter === 'core' ? 'active' : ''}`}
              onClick={() => setTrackFilter('core')}
            >
              Python &amp; Foundations
            </button>
            <button
              type="button"
              className={`pill-tab ${trackFilter === 'ds' ? 'active' : ''}`}
              onClick={() => setTrackFilter('ds')}
            >
              SQL &amp; Tabular ML
            </button>
            <button
              type="button"
              className={`pill-tab ${trackFilter === 'ai-eng' ? 'active' : ''}`}
              onClick={() => setTrackFilter('ai-eng')}
            >
              LLMs, RAG &amp; Agents
            </button>
          </div>
        </div>

        <div className="module-grid">
          {filteredModules.map((mod) => {
            const modDone = mod.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
            return (
              <article key={mod.id} className="module-card">
                <div className="module-top">
                  <span className="module-num">
                    MODULE 0{mod.number} · {modDone}/{mod.lessons.length} DONE
                  </span>
                  <span className={`track-badge track-${mod.track}`}>{trackLabel(mod.track)}</span>
                </div>

                <div>
                  <h3>{mod.title}</h3>
                  <p className="module-sub" style={{ marginTop: 6 }}>
                    {mod.subtitle}
                  </p>
                </div>

                <div className="lesson-list">
                  {mod.lessons.map((lesson) => {
                    const done = progress.completedLessons.includes(lesson.id);
                    const qBest = progress.quizScores[lesson.id];
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        className="lesson-row"
                        onClick={() => onSelectLesson(lesson.id)}
                      >
                        <div className="lesson-row-left">
                          {done ? (
                            <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                          ) : (
                            <Circle size={16} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
                          )}
                          <span className="lesson-row-title">
                            {lesson.number} {lesson.title}
                          </span>
                        </div>
                        <span className="lesson-row-meta">
                          {qBest ? `${qBest.bestScore}/${qBest.total} · ` : ''}
                          {lesson.durationMinutes}m
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: 10,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--ink-muted)',
                    gap: 8,
                  }}
                >
                  <span>
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />~{mod.estimatedHours}h ·{' '}
                    {mod.capstoneDeliverable}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--accent)', flexShrink: 0 }}
                    onClick={() => onSelectLesson(mod.lessons[0].id)}
                  >
                    Open <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
