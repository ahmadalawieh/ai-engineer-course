'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Cloud,
  Flame,
  GraduationCap,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ALL_LESSONS, COURSE_MODULES, TOTAL_LABS, getLessonById, getTotalCourseMinutes } from '@/data/curriculum';
import { COMPETENCIES, LEVEL_PATHS, evaluateLevelReadiness } from '@/data/levels';
import { WORKPLACE_TICKETS } from '@/data/jobWorkbench';
import {
  PLACEMENT_EXAM,
  buildFinalComprehensiveAssessment,
  buildModuleExam,
  type TimedExamSpec,
} from '@/data/exams';
import { getUnmetPrerequisites } from '@/lib/prerequisites';
import { TimedExamModal } from './TimedExamModal';
import { useCourseApp } from './ThemeProgressProvider';
import type { LevelId, TrackTag } from '@/types/course';

function trackLabel(track: TrackTag): string {
  if (track === 'ds') return 'SQL & Tabular ML';
  if (track === 'ai-eng') return 'LLMs, RAG & Agents';
  return 'Core ML/AI';
}

export function HomeView({
  onSelectLesson,
  onOpenWork,
  onOpenArena,
  onOpenSync,
}: {
  onSelectLesson: (lessonId: string) => void;
  onOpenWork: () => void;
  onOpenArena: () => void;
  onOpenSync: () => void;
}) {
  const { progress, authUser, setTargetLevel, setLearningTrack } = useCourseApp();
  const [trackFilter, setTrackFilter] = useState<'all' | TrackTag>('all');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [activeExam, setActiveExam] = useState<TimedExamSpec | null>(null);

  const activeLevelId: LevelId = progress.targetLevel || 'junior';
  const activeLearningTrack = progress.learningTrack || 'ai-eng-full';
  const levelEval = useMemo(
    () => evaluateLevelReadiness(activeLevelId, progress, TOTAL_LABS),
    [activeLevelId, progress]
  );
  const levelCompetencies = useMemo(
    () => COMPETENCIES.filter((c) => levelEval.level.competencyIds.includes(c.id)),
    [levelEval]
  );

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

  const resumeModule = useMemo(
    () => COURSE_MODULES.find((m) => m.lessons.some((l) => l.id === resumeLesson.id)) || COURSE_MODULES[0],
    [resumeLesson.id]
  );

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => ({
    [resumeModule.id]: true,
  }));

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const filteredModules = useMemo(() => {
    const byTrack =
      activeLearningTrack === 'ai-eng-fast'
        ? COURSE_MODULES.filter((m) => m.recommendedPath !== 'foundation')
        : COURSE_MODULES;
    const byPillar =
      trackFilter === 'all'
        ? byTrack
        : byTrack.filter((m) => m.track === trackFilter || m.lessons.some((l) => l.track === trackFilter));
    if (!hideCompleted) return byPillar;
    return byPillar.filter((m) => m.lessons.some((l) => !progress.completedLessons.includes(l.id)));
  }, [activeLearningTrack, trackFilter, hideCompleted, progress.completedLessons]);

  const examsTotal = levelEval.level.requiredModuleExams.length;
  const examsDone = examsTotal - levelEval.missingExams.length;
  const capstonesTotal = levelEval.level.requiredCapstones.length;
  const capstonesDone = capstonesTotal - levelEval.missingCapstones.length;
  const scenariosTotal = levelEval.level.requiredScenarios.length;
  const scenariosDone = scenariosTotal - levelEval.missingScenarios.length;

  const readinessPct = useMemo(() => {
    const lessonRatio = levelEval.lessonsTotal > 0 ? levelEval.lessonsDone / levelEval.lessonsTotal : 0;
    const labRatio =
      levelEval.level.requiredLabPct > 0 ? Math.min(1, levelEval.labPct / levelEval.level.requiredLabPct) : 0;
    const examRatio = examsTotal > 0 ? examsDone / examsTotal : 0;
    const capstoneRatio = capstonesTotal > 0 ? capstonesDone / capstonesTotal : 0;
    return Math.round(((lessonRatio + labRatio + examRatio + capstoneRatio) / 4) * 100);
  }, [levelEval, examsDone, examsTotal, capstonesDone, capstonesTotal]);

  const ringRadius = 50;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (readinessPct / 100) * ringCircumference;

  return (
    <main className="container">
      <section className="bento-hero-grid" aria-label="Overview and Readiness Telemetry">
        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="bento-status-pill">
              <span>{completedCount > 0 ? 'IN PROGRESS' : 'READY'}</span>
              <span>•</span>
              <span>MODULE {String(resumeModule.number).padStart(2, '0')}</span>
            </div>

            <h1 className="bento-hero-title">From Absolute Beginner to Production ML &amp; AI Engineer.</h1>
            <p style={{ fontSize: '0.94rem', color: 'var(--ink-2)', maxWidth: '60ch', lineHeight: 1.55 }}>
              {COURSE_MODULES.length} modules, <strong>{TOTAL_LABS} auto-verified Python &amp; SQL labs</strong>, and{' '}
              <strong>7 capstone repos</strong>—focused one step at a time.
            </p>

            <div className="bento-resume-banner">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--ink)' }}>
                  {completedCount === 0 ? 'Up Next:' : 'Resume:'} {resumeLesson.number} {resumeLesson.title}
                </span>
                <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  {pct}% Complete · {progress.xp} XP ·{' '}
                  <Flame size={12} style={{ display: 'inline', color: 'var(--accent-warm)', marginRight: 2 }} />
                  {progress.streakDays}d
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="hero-actions" style={{ marginTop: 4 }}>
            <button
              type="button"
              className="btn btn-primary btn-glow"
              onClick={() => onSelectLesson(resumeLesson.id)}
              id="hero-start-btn"
            >
              <PlayCircle size={17} />
              {completedCount === 0
                ? `Start Lesson ${resumeLesson.number}: ${resumeLesson.title}`
                : `Resume ${resumeLesson.number}: ${resumeLesson.title}`}
            </button>
            <button type="button" className="btn" onClick={() => setActiveExam(PLACEMENT_EXAM)}>
              <Zap size={14} color={progress.fastTrackUnlocked ? 'var(--success)' : 'var(--accent)'} />
              {progress.fastTrackUnlocked ? 'Fast Track Active ✓' : 'Developer Placement Test'}
            </button>
            <button type="button" className="btn" onClick={() => setActiveExam(buildFinalComprehensiveAssessment())}>
              <GraduationCap size={14} />
              {progress.moduleExamScores?.['final-assessment']
                ? `Final Exam: ${progress.moduleExamScores['final-assessment'].bestScore}/${progress.moduleExamScores['final-assessment'].total}`
                : 'Final Assessment (25Q)'}
            </button>
          </div>
        </div>

        <aside className="bento-card" aria-labelledby="target-level-heading">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 id="target-level-heading" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Readiness Telemetry
            </h2>
            <div className="pill-tabs" role="tablist" aria-label="Target AI Engineer Level">
              {LEVEL_PATHS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  className={`pill-tab ${activeLevelId === lvl.id ? 'active' : ''}`}
                  style={{ padding: '4px 9px', fontSize: '0.74rem' }}
                  onClick={() => setTargetLevel(lvl.id)}
                >
                  {lvl.id === 'junior' ? 'Junior' : lvl.id === 'mid' ? 'Mid-Level' : 'Senior Bar'}
                </button>
              ))}
            </div>
          </div>

          <div className="readiness-ring-wrap">
            <div className="readiness-ring-center">
              <svg className="readiness-ring-svg" viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="var(--success)" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r={ringRadius} fill="none" stroke="var(--surface-3)" strokeWidth="9" />
                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  fill="none"
                  stroke="url(#readinessGrad)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <span className="readiness-ring-pct">{readinessPct}%</span>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--ink)', marginTop: 6, textAlign: 'center' }}>
              {levelEval.level.title}: {readinessPct}%
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
              {levelEval.level.honestEffortRange}
            </div>
          </div>

          <div className="telemetry-checklist">
            <div className="telemetry-check-item">
              <span className="telemetry-check-left">
                <CheckCircle2
                  size={15}
                  color={levelEval.lessonsDone >= levelEval.lessonsTotal ? 'var(--success)' : 'var(--ink-muted)'}
                />
                <span>Core Lessons</span>
              </span>
              <span className="mono" style={{ fontSize: '0.78rem' }}>
                {levelEval.lessonsDone}/{levelEval.lessonsTotal}
              </span>
            </div>

            <div className="telemetry-check-item">
              <span className="telemetry-check-left">
                <CheckCircle2
                  size={15}
                  color={levelEval.labPct >= levelEval.level.requiredLabPct ? 'var(--success)' : 'var(--ink-muted)'}
                />
                <span>{TOTAL_LABS} Auto-Verified Labs</span>
              </span>
              <span className="mono" style={{ fontSize: '0.78rem' }}>
                {levelEval.labPct}%/{levelEval.level.requiredLabPct}%
              </span>
            </div>

            <div className="telemetry-check-item">
              <span className="telemetry-check-left">
                <CheckCircle2
                  size={15}
                  color={examsDone >= examsTotal ? 'var(--success)' : 'var(--ink-muted)'}
                />
                <span>Timed Exams (&ge;70%)</span>
              </span>
              <span className="mono" style={{ fontSize: '0.78rem' }}>
                {examsDone}/{examsTotal}
              </span>
            </div>

            <div className="telemetry-check-item">
              <span className="telemetry-check-left">
                <CheckCircle2
                  size={15}
                  color={capstonesDone >= capstonesTotal ? 'var(--success)' : 'var(--ink-muted)'}
                />
                <code>evidence.json</code>
              </span>
              <span className="mono" style={{ fontSize: '0.78rem' }}>
                {capstonesDone}/{capstonesTotal}
              </span>
            </div>

            <div className="telemetry-check-item">
              <span className="telemetry-check-left">
                <CheckCircle2
                  size={15}
                  color={scenariosDone >= scenariosTotal ? 'var(--success)' : 'var(--ink-muted)'}
                />
                <span>Scenario &amp; ADR Reviews</span>
              </span>
              <span className="mono" style={{ fontSize: '0.78rem' }}>
                {scenariosDone}/{scenariosTotal}
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.76rem',
              color: 'var(--ink-muted)',
            }}
          >
            <span>~{totalHours}h total · {WORKPLACE_TICKETS.length} tickets</span>
            <button type="button" className="btn btn-sm" onClick={onOpenSync}>
              <Cloud size={12} /> {authUser ? authUser.name.split(' ')[0] : 'Sync'}
            </button>
          </div>
        </aside>
      </section>

      <section className="focus-strip" aria-label="Today's Focus">
        <button type="button" className="focus-strip-item" onClick={() => onSelectLesson(resumeLesson.id)}>
          <Sparkles size={15} color="var(--accent)" />
          <div>
            <div className="focus-strip-label">1. Next Lesson</div>
            <div className="focus-strip-val">
              {resumeLesson.number} {resumeLesson.title}
            </div>
          </div>
          <ArrowRight size={14} className="focus-strip-arrow" />
        </button>

        <button type="button" className="focus-strip-item" onClick={onOpenArena}>
          <Award size={15} color="var(--success)" />
          <div>
            <div className="focus-strip-label">2. Daily Drill</div>
            <div className="focus-strip-val">Flashcards &amp; Mock Interviews</div>
          </div>
          <ArrowRight size={14} className="focus-strip-arrow" />
        </button>

        <button type="button" className="focus-strip-item" onClick={onOpenWork}>
          <ShieldCheck size={15} color="var(--accent-warm)" />
          <div>
            <div className="focus-strip-label">3. Proof of Work</div>
            <div className="focus-strip-val">7 Capstone Repos &amp; Tickets</div>
          </div>
          <ArrowRight size={14} className="focus-strip-arrow" />
        </button>
      </section>

      <details className="bento-card" style={{ padding: '12px 18px', marginBottom: 22 }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent)' }}>
          <ShieldCheck size={14} style={{ display: 'inline', marginRight: 6 }} />
          View {levelCompetencies.length} Required Competencies &amp; Credential Scope ({levelEval.level.title})
        </summary>
        <p style={{ fontSize: '0.84rem', color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.5 }}>
          {levelEval.level.barSummary}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 10,
            marginTop: 12,
          }}
        >
          {levelCompetencies.map((comp) => (
            <div
              key={comp.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                background: 'var(--surface-2)',
              }}
            >
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700 }}>
                {comp.level.toUpperCase()} · {comp.area}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginTop: 2 }}>{comp.title}</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: 4, lineHeight: 1.45 }}>
                {comp.description}
              </p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: 12, lineHeight: 1.5 }}>
          <strong>Honest Program Scope:</strong> No course grants a job title—titles come from employers.{' '}
          {levelEval.level.honestScopeNote}
        </p>
      </details>

      <section aria-labelledby="curriculum-heading">
        <div className="section-header" style={{ marginTop: 8 }}>
          <div>
            <h2 id="curriculum-heading">{COURSE_MODULES.length}-Module Curriculum</h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.88rem', marginTop: 4 }}>
              Expand any module to view its lessons, or jump straight into your active module below.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div className="pill-tabs" role="tablist" aria-label="Choose learning track">
              <button
                type="button"
                className={`pill-tab ${activeLearningTrack === 'ai-eng-fast' ? 'active' : ''}`}
                onClick={() => setLearningTrack('ai-eng-fast')}
                title="Skips Foundation Modules 0-1 and marks Modules 2-4 as Optional ML Depth"
              >
                AI Engineer Fast Track
              </button>
              <button
                type="button"
                className={`pill-tab ${activeLearningTrack === 'ai-eng-full' ? 'active' : ''}`}
                onClick={() => setLearningTrack('ai-eng-full')}
                title="Zero-to-hire AI Engineering path including Foundation 0-1; Modules 2-4 optional ML Depth"
              >
                AI Engineer Zero-to-Hire
              </button>
              <button
                type="button"
                className={`pill-tab ${activeLearningTrack === 'dual-ml-ai' ? 'active' : ''}`}
                onClick={() => setLearningTrack('dual-ml-ai')}
                title="All 12 modules including full Tabular ML & Deep Learning foundations"
              >
                Full Dual-Track (ML + AI)
              </button>
            </div>

            <select
              className="input-field"
              style={{ width: 'auto', minWidth: 170 }}
              aria-label="Filter by skill pillar"
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value as 'all' | TrackTag)}
            >
              <option value="all">All Pillars ({filteredModules.length})</option>
              <option value="core">Python &amp; Foundations</option>
              <option value="ds">SQL &amp; Tabular ML</option>
              <option value="ai-eng">LLMs, RAG &amp; Agents</option>
            </select>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8rem',
                color: 'var(--ink-muted)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
              />
              Hide completed
            </label>
          </div>
        </div>

        {(progress.fastTrackUnlocked || activeLearningTrack === 'ai-eng-fast') && (
          <div className="callout key-takeaway" style={{ marginBottom: 16 }}>
            <div className="callout-title">
              <Zap size={15} color="var(--success)" />{' '}
              {activeLearningTrack === 'ai-eng-fast'
                ? 'AI Engineer Fast Track Active (Modules 0–1 hidden; Modules 2–4 marked Optional ML Depth)'
                : `Fast Track for Developers Unlocked (Placement ${progress.placementScore?.score}/${progress.placementScore?.total})`}
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)' }}>
              {activeLearningTrack === 'ai-eng-fast'
                ? 'Foundation Modules 0–1 are skipped—switch back to "AI Engineer Zero-to-Hire" anytime to revisit them.'
                : 'Beginner Terminal/Git (Module 0) & Python syntax basics (`1.0–1.2`) prerequisites are auto-cleared.'}
            </p>
          </div>
        )}

        <div className="module-grid">
          {filteredModules.map((mod) => {
            const modDone = mod.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
            const modPct = Math.round((modDone / mod.lessons.length) * 100);
            const modExam = progress.moduleExamScores?.[mod.id];
            const modExamPassed = modExam && modExam.bestScore >= Math.ceil(modExam.total * 0.7);
            const statusClass =
              modDone === mod.lessons.length ? 'completed' : modDone > 0 ? 'progress' : 'upcoming';
            const statusText =
              modDone === mod.lessons.length ? 'Completed' : modDone > 0 ? 'In Progress' : 'Up Next';
            const isExpanded = Boolean(expandedModules[mod.id]);

            return (
              <article key={mod.id} className="module-card">
                <div className="module-top" style={{ gap: 6, flexWrap: 'wrap' }}>
                  <span className="module-num">
                    MODULE {String(mod.number).padStart(2, '0')} · {modDone}/{mod.lessons.length}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className={`module-status-pill ${statusClass}`}>{statusText}</span>
                    <span className={`track-badge track-${mod.track}`}>{trackLabel(mod.track)}</span>
                  </div>
                </div>

                <div>
                  <h3>{mod.title}</h3>
                  <p className="module-sub" style={{ marginTop: 4 }}>
                    {mod.subtitle}
                  </p>
                </div>

                <div className="progress-track" style={{ height: 5 }}>
                  <div className="progress-fill" style={{ width: `${modPct}%` }} />
                </div>

                {isExpanded && (
                  <div className="lesson-list">
                    {mod.lessons.map((lesson) => {
                      const done = progress.completedLessons.includes(lesson.id);
                      const qBest = progress.quizScores[lesson.id];
                      const softLocked =
                        !done &&
                        getUnmetPrerequisites(
                          lesson.id,
                          progress.completedLessons,
                          Boolean(progress.fastTrackUnlocked)
                        ).unmetLessons.length > 0;
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          className="lesson-row"
                          onClick={() => onSelectLesson(lesson.id)}
                          title={softLocked ? 'Prerequisites recommended (click to view or unlock)' : undefined}
                        >
                          <div className="lesson-row-left">
                            {done ? (
                              <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0 }} />
                            ) : softLocked ? (
                              <Lock size={14} color="var(--accent-warm)" style={{ flexShrink: 0 }} />
                            ) : (
                              <Circle size={15} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
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
                )}

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
                    flexWrap: 'wrap',
                  }}
                >
                  <span>
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />~{mod.estimatedHours}h ·{' '}
                    {mod.lessons.length} lessons
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => toggleModule(mod.id)}
                    >
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {isExpanded ? 'Hide' : 'Lessons'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        borderColor: modExamPassed ? 'var(--success)' : undefined,
                        color: modExamPassed ? 'var(--success)' : undefined,
                      }}
                      onClick={() => setActiveExam(buildModuleExam(mod))}
                    >
                      <GraduationCap size={12} />
                      {modExam ? `Exam ${modExam.bestScore}/${modExam.total}` : '20Q Exam'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--accent)' }}
                      onClick={() => onSelectLesson(mod.lessons[0].id)}
                    >
                      Open <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {activeExam && (
        <TimedExamModal exam={activeExam} onClose={() => setActiveExam(null)} />
      )}
    </main>
  );
}
