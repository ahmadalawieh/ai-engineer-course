'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Copy,
  Lightbulb,
  Lock,
  Menu,
  RotateCcw,
  Sparkles,
  Target,
  Unlock,
  X,
} from 'lucide-react';
import { ALL_LESSONS, COURSE_MODULES, getAdjacentLessons, getLessonById, getModuleById } from '@/data/curriculum';
import { getUnmetPrerequisites } from '@/lib/prerequisites';
import { useCourseApp } from './ThemeProgressProvider';
import { MathFormula, RichText } from './MathAndProse';
import { InteractiveSimulatorCard } from './InteractiveSimulators';
import { VisualDiagramBlock } from './VisualDiagrams';
import { ConceptReelPlayer } from './ConceptReelPlayer';
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

function MathCardBlock({
  title,
  latex,
  breakdown,
  intuition,
}: {
  title: string;
  latex: string;
  breakdown: { symbol: string; meaning: string }[];
  intuition: string;
}) {
  const [plainFirst, setPlainFirst] = useState(false);

  return (
    <section className="block math-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
        <div>
          <div className="lab-badge" style={{ marginBottom: 3 }}>
            {plainFirst ? 'Plain-English Intuition' : 'Core Equation'}
          </div>
          <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
        </div>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setPlainFirst((v) => !v)}
        >
          {plainFirst ? 'Show Formal Math' : 'Plain English Only'}
        </button>
      </div>

      {!plainFirst ? (
        <>
          <div className="math-display">
            <MathFormula latex={latex} displayMode />
          </div>
          <div className="math-breakdown">
            {breakdown.map((b, i) => (
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
            <strong>Intuition:</strong> <RichText text={intuition} />
          </p>
        </>
      ) : (
        <div
          style={{
            marginTop: 8,
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-2)',
            fontSize: '0.94rem',
            color: 'var(--ink-2)',
          }}
        >
          <p style={{ marginBottom: 8 }}>
            <strong>What it really means:</strong> <RichText text={intuition} />
          </p>
          <ul style={{ paddingLeft: 18, fontSize: '0.86rem' }}>
            {breakdown.map((b, i) => (
              <li key={i} style={{ marginBottom: 3 }}>
                <RichText text={b.meaning} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function CodeBuilderBlock({
  puzzleId,
  title,
  prompt,
  lines,
  explanation,
}: {
  puzzleId: string;
  title: string;
  prompt: string;
  lines: string[];
  explanation: string;
}) {
  const { progress, markPuzzleComplete } = useCourseApp();
  const isDone = (progress.completedPuzzles || []).includes(puzzleId);

  // Deterministic scramble so SSR & client match cleanly
  const scrambledIndices = React.useMemo(() => {
    const idxs = lines.map((_, i) => i);
    const out: number[] = [];
    for (let i = idxs.length - 1; i >= 0; i -= 2) out.push(idxs[i]);
    for (let i = 0; i < idxs.length; i += 2) {
      if (!out.includes(idxs[i])) out.push(idxs[i]);
    }
    if (out.every((v, i) => v === i) && out.length > 1) {
      [out[0], out[1]] = [out[1], out[0]];
    }
    return out;
  }, [lines]);

  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const remaining = scrambledIndices.filter((i) => !picked.includes(i));
  const isCorrect =
    picked.length === lines.length && picked.every((lineIdx, pos) => lineIdx === pos);

  const handleCheck = () => {
    setChecked(true);
    if (isCorrect) {
      markPuzzleComplete(puzzleId);
    }
  };

  return (
    <div className="lab-card block" id={`puzzle-${puzzleId}`}>
      <div className="lab-header">
        <div>
          <span className="lab-badge">
            <Sparkles size={12} style={{ display: 'inline', marginRight: 5 }} />
            Tap-to-Order Code Puzzle (Mobile-Friendly)
          </span>
          <h3 style={{ fontSize: '1.08rem', marginTop: 2 }}>{title}</h3>
        </div>
        {isDone && (
          <span
            className="track-badge"
            style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
          >
            <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Solved (+25 XP)
          </span>
        )}
      </div>

      <div className="lab-body">
        <p style={{ fontSize: '0.92rem', color: 'var(--ink-2)', marginBottom: 12 }}>
          <RichText text={prompt} />
        </p>

        <div style={{ marginBottom: 10 }}>
          <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginBottom: 6 }}>
            YOUR PROGRAM (TAP LINES BELOW TO BUILD IN ORDER):
          </div>
          <div
            style={{
              minHeight: 74,
              padding: 10,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--code-bg)',
              color: 'var(--code-ink)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {picked.length === 0 ? (
              <span className="mono" style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                Tap code tiles below to assemble them here...
              </span>
            ) : (
              picked.map((lineIdx, pos) => (
                <button
                  key={lineIdx}
                  type="button"
                  className="mono"
                  onClick={() => {
                    setPicked((prev) => prev.filter((_, p) => p !== pos));
                    setChecked(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '6px 10px',
                    borderRadius: 5,
                    border: '1px solid rgba(255,255,255,0.16)',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'var(--code-ink)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {pos + 1}. {lines[lineIdx]}
                </button>
              ))
            )}
          </div>
        </div>

        {remaining.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginBottom: 6 }}>
              AVAILABLE LINES (TAP TO ADD):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {remaining.map((lineIdx) => (
                <button
                  key={lineIdx}
                  type="button"
                  className="quiz-option mono"
                  style={{ fontSize: '0.82rem', padding: '8px 11px' }}
                  onClick={() => {
                    setPicked((prev) => [...prev, lineIdx]);
                    setChecked(false);
                  }}
                >
                  {lines[lineIdx]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={picked.length !== lines.length}
            onClick={handleCheck}
          >
            <Check size={13} /> Check Order
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => {
              setPicked([]);
              setChecked(false);
            }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        {checked && (
          <div
            style={{
              marginTop: 10,
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              background: isCorrect ? 'var(--success-soft)' : 'var(--warning-soft)',
              color: isCorrect ? 'var(--success)' : 'var(--warning)',
              fontSize: '0.86rem',
            }}
          >
            {isCorrect ? (
              <>
                <strong>Spot on!</strong> <RichText text={explanation} />
              </>
            ) : (
              <span>Not quite in the right order yet—tap a line in your program box to remove it and try again!</span>
            )}
          </div>
        )}
      </div>
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
            Everyday Intuition → AI Concept
          </div>
          <h3 style={{ fontSize: '1.12rem' }}>{block.title}</h3>
          <div className="bridge-cols">
            <div className="bridge-col">
              <span className="bridge-label">Everyday Mental Model</span>
              <RichText text={block.frontendConcept} />
            </div>
            <div className="bridge-col">
              <span className="bridge-label">How It Works In AI / Python</span>
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
        <MathCardBlock
          key={idx}
          title={block.title}
          latex={block.latex}
          breakdown={block.breakdown}
          intuition={block.intuition}
        />
      );

    case 'code-compare':
      return (
        <section key={idx} className="block">
          <h3 style={{ fontSize: '1.12rem', marginBottom: 10 }}>{block.title}</h3>
          <div className="code-compare-grid">
            <div className="code-card">
              <div className="code-header">
                <span>{block.jsLabel || 'Everyday Logic'}</span>
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

    case 'code-builder':
      return (
        <CodeBuilderBlock
          key={block.puzzleId}
          puzzleId={block.puzzleId}
          title={block.title}
          prompt={block.prompt}
          lines={block.lines}
          explanation={block.explanation}
        />
      );

    case 'visual-diagram':
      return (
        <VisualDiagramBlock
          key={idx}
          diagramId={block.diagramId}
          title={block.title}
          caption={block.caption}
        />
      );

    case 'concept-reel':
      return (
        <ConceptReelPlayer
          key={idx}
          reelId={block.reelId}
          title={block.title}
          description={block.description}
          externalVideos={block.externalVideos}
        />
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
          hints={block.hints}
          difficulty={block.difficulty}
          packages={block.packages}
          language={block.language}
          setupCode={block.setupCode}
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
  const lessonIndex = Math.max(0, ALL_LESSONS.findIndex((l) => l.id === lesson.id));
  const currentModule = getModuleById(lesson.moduleId);
  const { prev, next } = getAdjacentLessons(lesson.id);

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [softUnlocked, setSoftUnlocked] = useState<Record<string, boolean>>({});
  const [focusMode, setFocusMode] = useState<'all' | 'concept' | 'practice' | 'check'>('all');

  const { unmetLessons } = getUnmetPrerequisites(
    lesson.id,
    progress.completedLessons,
    Boolean(progress.fastTrackUnlocked)
  );
  const hasSoftLock = unmetLessons.length > 0 && !softUnlocked[lesson.id];

  useEffect(() => {
    setLastVisitedLesson(lesson.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lesson.id, setLastVisitedLesson]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(docH > 0 ? Math.min(100, Math.round((y / docH) * 100)) : 0);
      setShowTopBtn(y > 420);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lesson.id]);

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
              {progress.completedLessons.length}/{ALL_LESSONS.length}
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
                    const softLocked =
                      !done &&
                      getUnmetPrerequisites(
                        l.id,
                        progress.completedLessons,
                        Boolean(progress.fastTrackUnlocked)
                      ).unmetLessons.length > 0;
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
                        ) : softLocked ? (
                          <Lock size={13} color="var(--accent-warm)" style={{ flexShrink: 0 }} />
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
        <div className="reading-progress-bar" aria-label={`Reading progress ${scrollPct}%`}>
          <div className="reading-progress-fill" style={{ width: `${scrollPct}%` }} />
        </div>

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
            <span className="mono hide-mobile" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
              {lessonIndex + 1} / {ALL_LESSONS.length}
            </span>
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

        {hasSoftLock && (
          <aside className="callout warning block" role="status" aria-label="Recommended prerequisites notice">
            <div className="callout-title" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Lock size={15} /> Prerequisites Recommended Before Starting
              </span>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setSoftUnlocked((prevMap) => ({ ...prevMap, [lesson.id]: true }))}
              >
                <Unlock size={13} /> Unlock &amp; Study Anyway
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', marginBottom: 8 }}>
              This lesson builds directly on concepts taught earlier. Complete these recommended prerequisites first (or unlock immediately if you already know them):
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {unmetLessons.map((reqLesson) => (
                <button
                  key={reqLesson.id}
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onSelectLesson(reqLesson.id)}
                >
                  {reqLesson.number} {reqLesson.title} <ArrowRight size={12} />
                </button>
              ))}
            </div>
          </aside>
        )}

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

        <div className="lesson-focus-bar" role="tablist" aria-label="Lesson focus mode">
          <button
            type="button"
            className={`pill-tab ${focusMode === 'all' ? 'active' : ''}`}
            onClick={() => setFocusMode('all')}
          >
            All Sections
          </button>
          <button
            type="button"
            className={`pill-tab ${focusMode === 'concept' ? 'active' : ''}`}
            onClick={() => setFocusMode('concept')}
          >
            1. Concept
          </button>
          <button
            type="button"
            className={`pill-tab ${focusMode === 'practice' ? 'active' : ''}`}
            onClick={() => setFocusMode('practice')}
          >
            2. Labs &amp; Simulators
          </button>
          <button
            type="button"
            className={`pill-tab ${focusMode === 'check' ? 'active' : ''}`}
            onClick={() => setFocusMode('check')}
          >
            3. Quiz &amp; Check
          </button>
        </div>

        {lesson.blocks
          .filter((block) => {
            if (focusMode === 'all') return true;
            const isPractice =
              block.type === 'python-lab' || block.type === 'code-builder' || block.type === 'simulator';
            if (focusMode === 'practice') return isPractice;
            if (focusMode === 'concept') return !isPractice;
            return false;
          })
          .map((block, idx) => renderContentBlock(block, idx))}

        {(focusMode === 'all' || focusMode === 'check') &&
          lesson.checkWithoutNotes &&
          lesson.checkWithoutNotes.length > 0 && (
            <section className="callout callout-key-takeaway block" aria-label="Check yourself without notes">
              <div className="callout-title">
                <Target size={16} /> Check Yourself Without Notes
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)', marginBottom: 8 }}>
                Before taking the quiz, cover the lesson above and answer these aloud in plain words:
              </p>
              <ol style={{ paddingLeft: 20, fontSize: '0.9rem', color: 'var(--ink-2)', display: 'grid', gap: 5 }}>
                {lesson.checkWithoutNotes.map((item, idx) => (
                  <li key={idx}>
                    <RichText text={item} />
                  </li>
                ))}
              </ol>
            </section>
          )}

        {(focusMode === 'all' || focusMode === 'check') && (
          <LessonQuiz key={lesson.id} lessonId={lesson.id} questions={lesson.quiz} />
        )}

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

        {showTopBtn && (
          <button
            type="button"
            className="scroll-top-fab"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll back to top"
          >
            <ArrowUp size={15} /> Top
          </button>
        )}
      </main>
    </div>
  );
}
