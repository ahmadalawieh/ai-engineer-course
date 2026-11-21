'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Copy,
  Lightbulb,
  Menu,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { COURSE_MODULES, getAdjacentLessons, getLessonById, getModuleById } from '@/data/curriculum';
import { useCourseApp } from './ThemeProgressProvider';
import { MathFormula, RichText } from './MathAndProse';
import { InteractiveSimulatorCard } from './InteractiveSimulators';
import { PythonLab } from './PythonLab';
import { LessonQuiz } from './LessonQuiz';
import type { ContentBlock } from '@/types/course';

function CodeBlockCard({
  title,
  language,
  code,
  caption,
}: {
  title?: string;
  language: string;
  code: string;
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="block">
      <div className="code-card">
        <div className="code-header">
          <span>{title || language.toUpperCase()}</span>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            style={{ color: '#d4d0c5', padding: '2px 7px' }}
            onClick={() => {
              void navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="code-pre">
          <code>{code}</code>
        </pre>
      </div>
      {caption && (
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: 6 }}>
          <RichText text={caption} />
        </p>
      )}
    </div>
  );
}

function renderContentBlock(block: ContentBlock, idx: number) {
  switch (block.type) {
    case 'prose':
      return (
        <section key={idx} className="block prose">
          {block.heading && <h2>{block.heading}</h2>}
          {block.paragraphs.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
        </section>
      );

    case 'frontend-bridge':
      return (
        <section key={idx} className="block bridge-card">
          <div className="lab-badge" style={{ marginBottom: 4 }}>
            Frontend → AI Mental Model Bridge
          </div>
          <h3 style={{ fontSize: '1.12rem' }}>{block.title}</h3>
          <div className="bridge-cols">
            <div className="bridge-col">
              <span className="bridge-label">What You Already Know (Frontend)</span>
              <RichText text={block.frontendConcept} />
            </div>
            <div className="bridge-col">
              <span className="bridge-label">How It Maps To AI / Data</span>
              <RichText text={block.aiConcept} />
            </div>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--ink-2)' }}>
            <RichText text={block.explanation} />
          </p>
        </section>
      );

    case 'math':
      return (
        <section key={idx} className="block math-card">
          <div className="lab-badge" style={{ marginBottom: 3 }}>Core Equation</div>
          <h3 style={{ fontSize: '1.1rem' }}>{block.title}</h3>
          <div className="math-display">
            <MathFormula latex={block.latex} displayMode />
          </div>
          <div className="math-breakdown">
            {block.breakdown.map((b, i) => (
              <div key={i} className="math-row">
                <span className="math-sym">
                  <MathFormula latex={b.symbol} />
                </span>
                <span style={{ color: 'var(--ink-2)' }}>
                  <RichText text={b.meaning} />
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <strong>Intuition:</strong> <RichText text={block.intuition} />
          </p>
        </section>
      );

    case 'code-compare':
      return (
        <section key={idx} className="block">
          <h3 style={{ fontSize: '1.12rem', marginBottom: 10 }}>{block.title}</h3>
          <div className="code-compare-grid">
            <div className="code-card">
              <div className="code-header">
                <span>{block.jsLabel || 'JavaScript'}</span>
              </div>
              <pre className="code-pre">
                <code>{block.jsCode}</code>
              </pre>
            </div>
            <div className="code-card">
              <div className="code-header">
                <span>{block.pyLabel || 'Python'}</span>
              </div>
              <pre className="code-pre">
                <code>{block.pyCode}</code>
              </pre>
            </div>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)', marginTop: 8 }}>
            <strong>Key takeaway:</strong> <RichText text={block.takeaway} />
          </p>
        </section>
      );

    case 'code':
      return (
        <CodeBlockCard
          key={idx}
          title={block.title}
          language={block.language}
          code={block.code}
          caption={block.caption}
        />
      );

    case 'callout': {
      const Icon =
        block.variant === 'warning'
          ? AlertTriangle
          : block.variant === 'interview'
            ? Target
            : block.variant === 'key-takeaway'
              ? Sparkles
              : Lightbulb;
      return (
        <aside key={idx} className={`block callout callout-${block.variant}`}>
          <div className="callout-title">
            <Icon size={16} />
            <span>{block.title}</span>
          </div>
          <p style={{ fontSize: '0.91rem', color: 'var(--ink-2)' }}>
            <RichText text={block.body} />
          </p>
        </aside>
      );
    }

    case 'table':
      return (
        <section key={idx} className="block">
          {block.title && <h3 style={{ fontSize: '1.08rem', marginBottom: 10 }}>{block.title}</h3>}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i}>
                      <RichText text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>
                        <RichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );

    case 'simulator':
      return (
        <InteractiveSimulatorCard
          key={idx}
          simulatorId={block.simulatorId}
          title={block.title}
          description={block.description}
        />
      );

    case 'python-lab':
      return (
        <PythonLab
          key={block.labId}
          labId={block.labId}
          title={block.title}
          prompt={block.prompt}
          starterCode={block.starterCode}
          testCode={block.testCode}
          solutionCode={block.solutionCode}
          hint={block.hint}
          packages={block.packages}
        />
      );
  }
}

export function LessonView({
  lessonId,
  onSelectLesson,
  onBackHome,
}: {
  lessonId: string;
  onSelectLesson: (id: string) => void;
  onBackHome: () => void;
}) {
  const {
    progress,
    markLessonComplete,
    saveLessonNote,
    toggleBookmark,
    setLastVisitedLesson,
  } = useCourseApp();

  const lesson = getLessonById(lessonId) || COURSE_MODULES[0].lessons[0];
  const currentModule = getModuleById(lesson.moduleId);
  const { prev, next } = getAdjacentLessons(lesson.id);

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setLastVisitedLesson(lesson.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lesson.id, setLastVisitedLesson]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const isDone = progress.completedLessons.includes(lesson.id);
  const isBookmarked = progress.bookmarks.includes(lesson.id);
  const noteText = progress.notes[lesson.id] || '';

  return (
    <div className="workspace">
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Course curriculum navigation">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 6px', gap: 8 }}>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onBackHome}>
            <ArrowLeft size={14} /> Roadmap
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="mono" style={{ fontSize: '0.73rem', color: 'var(--ink-muted)' }}>
              {progress.completedLessons.length}/32
            </span>
            <button
              type="button"
              className="btn btn-sm btn-ghost mobile-only"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close lessons drawer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {COURSE_MODULES.map((mod) => {
          const open = expandedModules[mod.id] ?? mod.id === lesson.moduleId;
          return (
            <div key={mod.id} className="sidebar-module">
              <button
                type="button"
                className="sidebar-mod-btn"
                onClick={() =>
                  setExpandedModules((prevMap) => ({ ...prevMap, [mod.id]: !open }))
                }
              >
                <span>
                  {mod.number}. {mod.title}
                </span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {open && (
                <div className="sidebar-lessons">
                  {mod.lessons.map((l) => {
                    const done = progress.completedLessons.includes(l.id);
                    const active = l.id === lesson.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        className={`sidebar-lesson-btn ${active ? 'active' : ''}`}
                        onClick={() => {
                          onSelectLesson(l.id);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {done ? (
                          <CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                        ) : (
                          <Circle size={14} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.number} {l.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </aside>

      <main className="lesson-main">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <button
              type="button"
              className="btn btn-sm mobile-only"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              <Menu size={14} /> Lessons
            </button>
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Module {currentModule?.number}: {currentModule?.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => toggleBookmark(lesson.id)}
            >
              <Bookmark
                size={13}
                fill={isBookmarked ? 'currentColor' : 'none'}
                color={isBookmarked ? 'var(--accent-warm)' : 'currentColor'}
              />
              {isBookmarked ? 'Saved' : 'Bookmark'}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isDone ? '' : 'btn-primary'}`}
              onClick={() => markLessonComplete(lesson.id)}
            >
              <CheckCircle2 size={13} />
              {isDone ? 'Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>

        <header className="lesson-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className={`track-badge track-${lesson.track}`}>
              Lesson {lesson.number}
            </span>
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              ~{lesson.durationMinutes} min study
            </span>
          </div>
          <h1>{lesson.title}</h1>
          <p className="lesson-subtitle">{lesson.subtitle}</p>

          <div className="objectives-box">
            <h4>What You Will Master</h4>
            <ul>
              {lesson.objectives.map((obj, i) => (
                <li key={i}>
                  <RichText text={obj} />
                </li>
              ))}
            </ul>
          </div>
        </header>

        {lesson.blocks.map((block, idx) => renderContentBlock(block, idx))}

        <LessonQuiz key={lesson.id} lessonId={lesson.id} questions={lesson.quiz} />

        <section className="block" style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Personal Study Notes (Auto-Synced)</h3>
          <textarea
            className="input"
            rows={4}
            value={noteText}
            onChange={(e) => saveLessonNote(lesson.id, e.target.value)}
            placeholder="Jot down mental models, tricky edge cases, or interview talking points for this lesson..."
          />
        </section>

        <nav className="lesson-pagination" aria-label="Lesson pagination">
          {prev ? (
            <button type="button" className="btn" onClick={() => onSelectLesson(prev.id)}>
              <ArrowLeft size={15} style={{ flexShrink: 0 }} />
              <span>
                {prev.number} {prev.title}
              </span>
            </button>
          ) : (
            <span className="hide-mobile" />
          )}

          {next && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                markLessonComplete(lesson.id);
                onSelectLesson(next.id);
              }}
            >
              <span>
                Complete &amp; Next: {next.number} {next.title}
              </span>
              <ArrowRight size={15} style={{ flexShrink: 0 }} />
            </button>
          )}
        </nav>
      </main>
    </div>
  );
}
