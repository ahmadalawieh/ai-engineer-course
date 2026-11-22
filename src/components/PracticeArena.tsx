'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  Eye,
  FileCode2,
  Layers,
  Printer,
  RotateCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { FLASHCARDS } from '@/data/flashcards';
import { GLOSSARY_ITEMS } from '@/data/glossary';
import { MOCK_INTERVIEW_QUESTIONS } from '@/data/mockInterview';
import { ALL_LESSONS, TOTAL_LABS, getLessonById } from '@/data/curriculum';
import { GUIDED_PROJECTS } from '@/data/jobWorkbench';
import {
  LEVEL_PATHS,
  SCENARIO_ASSESSMENTS,
  evaluateLevelReadiness,
  exportEvidencePackMarkdown,
  validateCapstoneEvidence,
} from '@/data/levels';
import type { LevelId } from '@/types/course';
import { useCourseApp } from './ThemeProgressProvider';
import { MathFormula, RichText } from './MathAndProse';

export type ArenaTab =
  | 'flashcards'
  | 'interview'
  | 'scenarios'
  | 'evidence'
  | 'glossary'
  | 'notes'
  | 'certificate';

const ALL_CAPSTONES = GUIDED_PROJECTS;

export function PracticeArena({
  initialTab = 'flashcards',
  onSelectLesson,
}: {
  initialTab?: ArenaTab;
  onSelectLesson?: (lessonId: string) => void;
}) {
  const {
    progress,
    reviewFlashcard,
    markInterviewComplete,
    setTargetLevel,
    saveCapstoneEvidence,
    recordScenarioAssessment,
  } = useCourseApp();
  const [tab, setTab] = useState<ArenaTab>(initialTab);

  // Flashcards state
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [nowTs, setNowTs] = useState(0);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setNowTs(Date.now()));
    return () => cancelAnimationFrame(id);
  }, []);

  const dueCards = useMemo(() => {
    const due = FLASHCARDS.filter((c) => {
      const s = progress.flashcardSRS[c.id];
      return !s || (nowTs > 0 && s.nextReviewAt <= nowTs);
    });
    return due.length > 0 ? due : FLASHCARDS;
  }, [progress.flashcardSRS, nowTs]);

  const activeCard = dueCards[cardIdx % dueCards.length];

  // Interview state
  const [roleFilter, setRoleFilter] = useState<'All' | 'AI Engineer' | 'Data Scientist' | 'Both'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Core' | 'Senior' | 'Staff'>('All');
  const [qIdx, setQIdx] = useState(0);
  const [userDraft, setUserDraft] = useState('');
  const [showSample, setShowSample] = useState(false);
  const [checkedRubric, setCheckedRubric] = useState<Record<number, boolean>>({});

  // Scenarios & ADRs state
  const [activeScenarioId, setActiveScenarioId] = useState<string>(SCENARIO_ASSESSMENTS[0].id);
  const activeScenario = useMemo(
    () => SCENARIO_ASSESSMENTS.find((s) => s.id === activeScenarioId) || SCENARIO_ASSESSMENTS[0],
    [activeScenarioId]
  );
  const [scenarioDrafts, setScenarioDrafts] = useState<Record<string, string>>({});
  const [scenarioChecks, setScenarioChecks] = useState<Record<string, Record<string, boolean>>>({});
  const [showScenarioSample, setShowScenarioSample] = useState(false);
  const [scenarioSavedNote, setScenarioSavedNote] = useState<string | null>(null);

  // Capstone Evidence Pack state
  const [evidenceInputs, setEvidenceInputs] = useState<
    Record<string, { repoUrl: string; demoUrl: string; rawJson: string }>
  >({});
  const [evidenceMessages, setEvidenceMessages] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [packCopied, setPackCopied] = useState(false);

  const filteredQuestions = useMemo(
    () =>
      MOCK_INTERVIEW_QUESTIONS.filter(
        (q) =>
          (roleFilter === 'All' || q.role === roleFilter) &&
          (difficultyFilter === 'All' || q.difficulty === difficultyFilter)
      ),
    [roleFilter, difficultyFilter]
  );
  const activeQuestion = filteredQuestions.length > 0 ? filteredQuestions[qIdx % filteredQuestions.length] : undefined;

  // Glossary state
  const [glossarySearch, setGlossarySearch] = useState('');
  const filteredGlossary = useMemo(() => {
    const q = glossarySearch.trim().toLowerCase();
    return GLOSSARY_ITEMS.filter(
      (g) =>
        !q ||
        g.term.toLowerCase().includes(q) ||
        g.definition.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [glossarySearch]);

  const savedNotesEntries = useMemo(
    () =>
      Object.entries(progress.notes)
        .filter(([, text]) => text.trim().length > 0)
        .map(([id, text]) => ({ id, text, lesson: getLessonById(id) })),
    [progress.notes]
  );

  const savedBookmarks = useMemo(
    () => progress.bookmarks.map((id) => ({ id, lesson: getLessonById(id) })),
    [progress.bookmarks]
  );

  const lessonsDone = progress.completedLessons.length;
  const labsDone = progress.completedLabs.length;
  const interviewsDone = progress.interviewCompleted.length;
  const activeLevelId: LevelId = progress.targetLevel || 'junior';
  const levelEval = useMemo(
    () => evaluateLevelReadiness(activeLevelId, progress, TOTAL_LABS),
    [activeLevelId, progress]
  );
  const isParticipationEligible = lessonsDone >= 24 && labsDone >= 8;

  const roleLabel = (r: 'All' | 'AI Engineer' | 'Data Scientist' | 'Both') =>
    r === 'AI Engineer' ? 'AI / LLM' : r === 'Data Scientist' ? 'ML / SQL' : r;

  return (
    <main className="container">
      <div className="section-header" style={{ marginTop: 8 }}>
        <div>
          <span className="lab-badge">Active Recall &amp; Verified Readiness</span>
          <h1>Practice Arena</h1>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.96rem', marginTop: 4 }}>
            Lock in concepts with spaced repetition, defend real incident &amp; architecture scenarios, submit capstone{' '}
            <code>evidence.json</code>, and generate your Level Readiness Report.
          </p>
        </div>

        <div className="pill-tabs">
          <button
            type="button"
            className={`pill-tab ${tab === 'flashcards' ? 'active' : ''}`}
            onClick={() => setTab('flashcards')}
          >
            <RotateCw size={13} style={{ display: 'inline', marginRight: 5 }} />
            Flashcards ({FLASHCARDS.length})
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'interview' ? 'active' : ''}`}
            onClick={() => setTab('interview')}
          >
            <Layers size={13} style={{ display: 'inline', marginRight: 5 }} />
            Mock Interview ({MOCK_INTERVIEW_QUESTIONS.length})
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'scenarios' ? 'active' : ''}`}
            onClick={() => setTab('scenarios')}
          >
            <ClipboardCheck size={13} style={{ display: 'inline', marginRight: 5 }} />
            Scenarios &amp; ADRs ({SCENARIO_ASSESSMENTS.length})
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'evidence' ? 'active' : ''}`}
            onClick={() => setTab('evidence')}
          >
            <FileCode2 size={13} style={{ display: 'inline', marginRight: 5 }} />
            Evidence Pack
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'glossary' ? 'active' : ''}`}
            onClick={() => setTab('glossary')}
          >
            <BookOpen size={13} style={{ display: 'inline', marginRight: 5 }} />
            Glossary ({GLOSSARY_ITEMS.length})
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'notes' ? 'active' : ''}`}
            onClick={() => setTab('notes')}
          >
            <Bookmark size={13} style={{ display: 'inline', marginRight: 5 }} />
            Saved ({savedBookmarks.length + savedNotesEntries.length})
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'certificate' ? 'active' : ''}`}
            onClick={() => setTab('certificate')}
          >
            <ShieldCheck size={13} style={{ display: 'inline', marginRight: 5 }} />
            Readiness &amp; Report
          </button>
        </div>
      </div>

      {tab === 'flashcards' && activeCard && (
        <section style={{ maxWidth: 680, margin: '24px auto 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
            <span>
              Card {(cardIdx % dueCards.length) + 1} of {dueCards.length} due
            </span>
            <span className={`track-badge track-${activeCard.track}`}>{activeCard.track}</span>
          </div>

          <div
            className="hero-card"
            style={{ minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="mono" style={{ fontSize: '0.73rem', color: 'var(--ink-muted)' }}>
              {flipped ? 'ANSWER & INTUITION' : 'PROMPT (CLICK TO FLIP)'}
            </div>

            <div style={{ padding: '20px 0' }}>
              {!flipped ? (
                <h2 style={{ fontSize: '1.45rem', lineHeight: 1.35 }}>{activeCard.front}</h2>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: '1rem', color: 'var(--ink)' }}>
                    <RichText text={activeCard.back} />
                  </p>
                  {activeCard.formula && (
                    <div className="math-display">
                      <MathFormula latex={activeCard.formula} displayMode />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {flipped ? 'Rate recall below to schedule next spaced review (+10 XP)' : 'Tap card to reveal answer'}
            </div>
          </div>

          {flipped && (
            <div className="srs-grid" style={{ marginTop: 14 }}>
              {(
                [
                  { q: 1, label: 'Again (<1d)' },
                  { q: 2, label: 'Hard (1–2d)' },
                  { q: 3, label: 'Good (4d+)' },
                  { q: 4, label: 'Easy (7d+)' },
                ] as const
              ).map((item) => (
                <button
                  key={item.q}
                  type="button"
                  className={`btn ${item.q === 3 ? 'btn-primary' : ''}`}
                  onClick={() => {
                    reviewFlashcard(activeCard.id, item.q);
                    setFlipped(false);
                    setCardIdx((i) => i + 1);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'interview' && (
        <section style={{ maxWidth: 820, margin: '18px auto 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <div className="pill-tabs">
                {(['All', 'AI Engineer', 'Data Scientist', 'Both'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`pill-tab ${roleFilter === r ? 'active' : ''}`}
                    onClick={() => {
                      setRoleFilter(r);
                      setQIdx(0);
                      setShowSample(false);
                      setCheckedRubric({});
                    }}
                  >
                    {roleLabel(r)}
                  </button>
                ))}
              </div>
              <div className="pill-tabs">
                {(['All', 'Core', 'Senior', 'Staff'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`pill-tab ${difficultyFilter === d ? 'active' : ''}`}
                    onClick={() => {
                      setDifficultyFilter(d);
                      setQIdx(0);
                      setShowSample(false);
                      setCheckedRubric({});
                    }}
                  >
                    {d === 'All' ? 'All Levels' : d === 'Core' ? 'Core / Junior' : d === 'Senior' ? 'Mid / Senior' : 'Staff'}
                  </button>
                ))}
              </div>
            </div>
            <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', alignSelf: 'center' }}>
              Practiced: {interviewsDone}/{MOCK_INTERVIEW_QUESTIONS.length}
            </span>
          </div>

          {activeQuestion ? (
            <div className="hero-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <span className="track-badge track-core">
                  {roleLabel(activeQuestion.role)} · {activeQuestion.difficulty === 'Senior' ? 'Mid / Senior' : activeQuestion.difficulty} · {activeQuestion.topic}
                </span>
                {progress.interviewCompleted.includes(activeQuestion.id) && (
                  <span className="track-badge" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                    <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Practiced
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.35rem', lineHeight: 1.35, marginBottom: 14 }}>{activeQuestion.question}</h2>

              <textarea
                className="input"
                rows={5}
                value={userDraft}
                onChange={(e) => setUserDraft(e.target.value)}
                placeholder="Draft your structured response before checking the grading rubric..."
              />

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowSample((v) => !v)}>
                  <Eye size={14} /> {showSample ? 'Hide Rubric & Sample Answer' : 'Reveal Rubric & Sample Answer'}
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    markInterviewComplete(activeQuestion.id);
                    setUserDraft('');
                    setShowSample(false);
                    setCheckedRubric({});
                    setQIdx((i) => i + 1);
                  }}
                >
                  Mark Practiced &amp; Next (+40 XP)
                </button>
              </div>

              {showSample && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>Interviewer Grading Rubric (Check what you covered):</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {activeQuestion.rubricPoints.map((pt, i) => (
                      <label key={i} style={{ display: 'flex', gap: 8, fontSize: '0.88rem', color: 'var(--ink-2)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={!!checkedRubric[i]}
                          onChange={(e) => setCheckedRubric((p) => ({ ...p, [i]: e.target.checked }))}
                        />
                        <span>{pt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                  <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
                    <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: 6 }}>Sample Strong Answer:</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)' }}>{activeQuestion.sampleAnswer}</p>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--accent)' }}>
                    <strong>Likely Follow-Up:</strong> {activeQuestion.followUp}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hero-card" style={{ textAlign: 'center', color: 'var(--ink-muted)' }}>
              No questions match that exact role + difficulty filter. Pick another filter above!
            </div>
          )}
        </section>
      )}

      {tab === 'glossary' && (
        <section style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 520, marginBottom: 18 }}>
            <Search size={17} color="var(--ink-muted)" />
            <input
              className="input"
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              placeholder="Filter glossary (e.g. RoPE, PSI, SHAP, PagedAttention)..."
            />
          </div>

          <div className="module-grid">
            {filteredGlossary.map((item) => (
              <article key={item.term} className="module-card">
                <div className="module-top">
                  <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                    {item.category}
                  </span>
                  <span className={`track-badge track-${item.track}`}>{item.track}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem' }}>{item.term}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)' }}>
                  <RichText text={item.definition} />
                </p>
                {item.formula && (
                  <div className="math-display" style={{ margin: '4px 0' }}>
                    <MathFormula latex={item.formula} displayMode />
                  </div>
                )}
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                  <strong>Example:</strong> <RichText text={item.example} />
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'notes' && (
        <section style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: 10 }}>Bookmarked Lessons ({savedBookmarks.length})</h2>
            {savedBookmarks.length === 0 ? (
              <div className="hero-card" style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                No bookmarked lessons yet. Click <strong>Bookmark</strong> inside any lesson to save it here.
              </div>
            ) : (
              <div className="module-grid">
                {savedBookmarks.map(({ id, lesson }) => (
                  <article key={id} className="module-card">
                    <div className="module-top">
                      <span className="module-num">LESSON {lesson?.number || id}</span>
                      <Bookmark size={14} color="var(--accent-warm)" fill="var(--accent-warm)" />
                    </div>
                    <h3 style={{ fontSize: '1.1rem' }}>{lesson?.title || id}</h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)' }}>{lesson?.subtitle}</p>
                    {onSelectLesson && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                        onClick={() => onSelectLesson(id)}
                      >
                        Open Lesson <ArrowRight size={13} />
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: 10 }}>Personal Study Notes ({savedNotesEntries.length})</h2>
            {savedNotesEntries.length === 0 ? (
              <div className="hero-card" style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                No study notes saved yet. Write notes at the bottom of any lesson—they auto-save and sync across devices.
              </div>
            ) : (
              <div className="module-grid">
                {savedNotesEntries.map(({ id, text, lesson }) => (
                  <article key={id} className="module-card">
                    <div className="module-top">
                      <span className="module-num">LESSON {lesson?.number || id}</span>
                    </div>
                    <h3 style={{ fontSize: '1.08rem' }}>{lesson?.title || id}</h3>
                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--ink-2)',
                        whiteSpace: 'pre-wrap',
                        background: 'var(--surface-2)',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {text}
                    </p>
                    {onSelectLesson && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                        onClick={() => onSelectLesson(id)}
                      >
                        Edit in Lesson <ArrowRight size={13} />
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'scenarios' && (
        <section style={{ marginTop: 24 }}>
          <div className="pill-tabs" style={{ marginBottom: 16 }}>
            {SCENARIO_ASSESSMENTS.map((sc) => {
              const saved = progress.scenarioScores?.[sc.id];
              const passed = saved && saved.selfScore >= sc.passPoints;
              return (
                <button
                  key={sc.id}
                  type="button"
                  className={`pill-tab ${activeScenarioId === sc.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveScenarioId(sc.id);
                    setShowScenarioSample(false);
                    setScenarioSavedNote(null);
                  }}
                >
                  {sc.minLevel.toUpperCase()} · {sc.kind === 'system-design' ? 'System Design' : sc.kind === 'incident-postmortem' ? 'Incident Postmortem' : 'ADR Review'}
                  {passed ? ' ✓' : ''}
                </button>
              );
            })}
          </div>

          <div className="hero-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <span className="track-badge track-ai-eng">
                Min Level: {activeScenario.minLevel.toUpperCase()} · Pass Bar: {activeScenario.passPoints}/
                {activeScenario.rubric.reduce((s, r) => s + r.maxPoints, 0)} pts
              </span>
              {progress.scenarioScores?.[activeScenario.id] && (
                <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 700 }}>
                  Saved Score: {progress.scenarioScores[activeScenario.id].selfScore}/
                  {progress.scenarioScores[activeScenario.id].maxScore}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>{activeScenario.title}</h2>
            <p style={{ color: 'var(--ink-2)', fontSize: '0.93rem', lineHeight: 1.55, marginBottom: 14 }}>
              {activeScenario.prompt}
            </p>

            {activeScenario.artifactContent && (
              <div style={{ marginBottom: 16 }}>
                <div className="mono" style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 6 }}>
                  {activeScenario.artifactTitle || 'Reference Artifact'}
                </div>
                <pre
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    lineHeight: 1.45,
                  }}
                >
                  {activeScenario.artifactContent}
                </pre>
              </div>
            )}

            <label
              htmlFor="scenario-response-editor"
              style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: 6 }}
            >
              Your Engineering Response (saved with your Evidence Pack)
            </label>
            <textarea
              id="scenario-response-editor"
              className="input"
              rows={8}
              placeholder="Write your architecture spec, root-cause timeline, or ADR defense (min 60 characters)..."
              value={
                scenarioDrafts[activeScenario.id] ??
                progress.scenarioScores?.[activeScenario.id]?.responseText ??
                ''
              }
              onChange={(e) =>
                setScenarioDrafts((prev) => ({ ...prev, [activeScenario.id]: e.target.value }))
              }
              style={{ width: '100%', fontFamily: 'var(--font-sans)', marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 8 }}>
                Self-Grading Rubric (check only criteria genuinely covered in your response)
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {activeScenario.rubric.map((item) => {
                  const checkedMap = scenarioChecks[activeScenario.id] || {};
                  const checked = !!checkedMap[item.id];
                  return (
                    <label
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: checked ? 'var(--success-soft)' : 'var(--surface-2)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setScenarioChecks((prev) => ({
                            ...prev,
                            [activeScenario.id]: {
                              ...(prev[activeScenario.id] || {}),
                              [item.id]: e.target.checked,
                            },
                          }))
                        }
                        style={{ marginTop: 3 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                          {item.criterion}{' '}
                          <span className="mono" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
                            (+{item.maxPoints} pts)
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: 2 }}>
                          {item.guidance}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {(() => {
              const draftText =
                scenarioDrafts[activeScenario.id] ??
                progress.scenarioScores?.[activeScenario.id]?.responseText ??
                '';
              const checkedMap = scenarioChecks[activeScenario.id] || {};
              const checkedIds = activeScenario.rubric.filter((r) => checkedMap[r.id]).map((r) => r.id);
              const selfScore = activeScenario.rubric
                .filter((r) => checkedMap[r.id])
                .reduce((acc, r) => acc + r.maxPoints, 0);
              const maxScore = activeScenario.rubric.reduce((acc, r) => acc + r.maxPoints, 0);

              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (draftText.trim().length < 60) {
                        setScenarioSavedNote('Write at least 60 characters before recording your scenario score.');
                        return;
                      }
                      recordScenarioAssessment({
                        scenarioId: activeScenario.id,
                        responseText: draftText,
                        checkedRubricIds: checkedIds,
                        selfScore,
                        maxScore,
                        completedAt: Date.now(),
                      });
                      setScenarioSavedNote(
                        `Recorded ${selfScore}/${maxScore} pts (${selfScore >= activeScenario.passPoints ? 'Meets Pass Bar' : `Need ${activeScenario.passPoints}+ to pass`}).`
                      );
                    }}
                  >
                    <CheckCircle2 size={15} /> Save Scenario &amp; Score ({selfScore}/{maxScore})
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowScenarioSample((prev) => !prev)}
                  >
                    <Eye size={15} /> {showScenarioSample ? 'Hide Example Answer' : 'View Scored Example'}
                  </button>
                  {scenarioSavedNote && (
                    <span style={{ fontSize: '0.84rem', color: 'var(--ink-2)', fontWeight: 600 }}>
                      {scenarioSavedNote}
                    </span>
                  )}
                </div>
              );
            })()}

            {showScenarioSample && (
              <pre
                style={{
                  marginTop: 14,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: '0.82rem',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5,
                }}
              >
                {activeScenario.exampleScoredAnswer}
              </pre>
            )}
          </div>
        </section>
      )}

      {tab === 'evidence' && (
        <section style={{ marginTop: 24 }}>
          <div className="hero-card" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Portfolio &amp; Capstone Evidence Pack</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
                  Run <code>make check</code> in each downloaded capstone starter repo to emit <code>evidence.json</code>, then submit your public GitHub repo URL, live demo URL, and validator output below.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    const md = exportEvidencePackMarkdown(activeLevelId, progress, TOTAL_LABS);
                    navigator.clipboard?.writeText(md);
                    setPackCopied(true);
                    setTimeout(() => setPackCopied(false), 2500);
                  }}
                >
                  <Copy size={14} /> {packCopied ? 'Copied Markdown!' : 'Copy Evidence Pack MD'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const md = exportEvidencePackMarkdown(activeLevelId, progress, TOTAL_LABS);
                    const blob = new Blob([md], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ai-engineer-evidence-${activeLevelId}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={14} /> Download Evidence Pack (.md)
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {ALL_CAPSTONES.map((proj) => {
              const saved = progress.capstoneEvidence?.[proj.id];
              const inputs = evidenceInputs[proj.id] || {
                repoUrl: saved?.repoUrl || '',
                demoUrl: saved?.demoUrl || '',
                rawJson: saved?.evidenceJsonRaw || '',
              };
              const feedback = evidenceMessages[proj.id];
              return (
                <div key={proj.id} className="hero-card">
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div>
                      <span className="track-badge track-ai-eng">{proj.id}</span>{' '}
                      <strong style={{ fontSize: '1.02rem' }}>{proj.title}</strong>
                    </div>
                    {saved?.parsedSummary?.passed ? (
                      <span className="track-badge" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                        <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Verified ({saved.parsedSummary.mode})
                      </span>
                    ) : (
                      <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        Awaiting valid evidence.json
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 10 }}>
                    <input
                      type="url"
                      className="input"
                      placeholder="Public GitHub repo URL (github.com/you/project)"
                      value={inputs.repoUrl}
                      onChange={(e) =>
                        setEvidenceInputs((prev) => ({
                          ...prev,
                          [proj.id]: { ...inputs, repoUrl: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="url"
                      className="input"
                      placeholder="Live deployed demo URL (your-app.fly.dev)"
                      value={inputs.demoUrl}
                      onChange={(e) =>
                        setEvidenceInputs((prev) => ({
                          ...prev,
                          [proj.id]: { ...inputs, demoUrl: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <textarea
                    className="input"
                    rows={4}
                    placeholder='Paste JSON from evidence.json (generated by validator.py / make check)...'
                    value={inputs.rawJson}
                    onChange={(e) =>
                      setEvidenceInputs((prev) => ({
                        ...prev,
                        [proj.id]: { ...inputs, rawJson: e.target.value },
                      }))
                    }
                    style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 10 }}
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const res = validateCapstoneEvidence(
                          proj.id,
                          inputs.repoUrl,
                          inputs.demoUrl,
                          inputs.rawJson
                        );
                        if (!res.valid || !res.parsedSummary) {
                          setEvidenceMessages((prev) => ({
                            ...prev,
                            [proj.id]: { ok: false, msg: res.error || 'Validation failed.' },
                          }));
                          return;
                        }
                        saveCapstoneEvidence(proj.id, {
                          projectId: proj.id,
                          repoUrl: inputs.repoUrl.trim(),
                          demoUrl: inputs.demoUrl.trim(),
                          evidenceJsonRaw: inputs.rawJson.trim(),
                          validatedAt: Date.now(),
                          parsedSummary: res.parsedSummary,
                        });
                        setEvidenceMessages((prev) => ({
                          ...prev,
                          [proj.id]: {
                            ok: true,
                            msg: `Saved: ${res.parsedSummary!.testsPassed} tests passed (${res.parsedSummary!.mode}), p95=${res.parsedSummary!.p95Ms}ms, $${res.parsedSummary!.costPerReqUsd}/req.`,
                          },
                        }));
                      }}
                    >
                      Validate &amp; Save Evidence
                    </button>
                    {feedback && (
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: feedback.ok ? 'var(--success)' : 'var(--danger, #c62828)',
                        }}
                      >
                        {feedback.msg}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'certificate' && (
        <section style={{ maxWidth: 820, margin: '24px auto 0', display: 'grid', gap: 18 }}>
          <div className="hero-card certificate-card">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div>
                <div className="hero-eyebrow">Gated Level Readiness Report</div>
                <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.8rem)', marginBottom: 4 }}>
                  {levelEval.level.title}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)' }}>
                  Candidate: <strong>{progress.learnerName}</strong> · Target Level Selector:
                </p>
              </div>
              <div className="pill-tabs">
                {LEVEL_PATHS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    className={`pill-tab ${activeLevelId === lvl.id ? 'active' : ''}`}
                    onClick={() => setTargetLevel(lvl.id)}
                  >
                    {lvl.id === 'junior' ? 'Junior' : lvl.id === 'mid' ? 'Mid-Level' : 'Senior Bar'}
                  </button>
                ))}
              </div>
            </div>

            <div className="stat-grid" style={{ marginBottom: 18 }}>
              <div className="stat-box">
                <div className="stat-val">{levelEval.lessonsDone}/{levelEval.lessonsTotal}</div>
                <div className="stat-label">Required Lessons</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{levelEval.labPct}% / {levelEval.level.requiredLabPct}%</div>
                <div className="stat-label">Python &amp; SQL Labs</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">
                  {levelEval.level.requiredModuleExams.length - levelEval.missingExams.length}/
                  {levelEval.level.requiredModuleExams.length}
                </div>
                <div className="stat-label">Timed Exams (&ge;70%)</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">
                  {levelEval.level.requiredCapstones.length - levelEval.missingCapstones.length}/
                  {levelEval.level.requiredCapstones.length}
                </div>
                <div className="stat-label">Verified Capstones</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">
                  {levelEval.level.requiredScenarios.length - levelEval.missingScenarios.length}/
                  {levelEval.level.requiredScenarios.length}
                </div>
                <div className="stat-label">Scenario &amp; ADR Reviews</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{progress.xp}</div>
                <div className="stat-label">Course XP</div>
              </div>
            </div>

            {levelEval.ready ? (
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <p style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 12 }}>
                  Level Readiness Report Unlocked — every required lesson, timed exam, capstone{' '}
                  <code>evidence.json</code>, and scenario review for {levelEval.level.title} is recorded.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                    <Printer size={15} /> Print Level Readiness Report
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      const md = exportEvidencePackMarkdown(activeLevelId, progress, TOTAL_LABS);
                      const blob = new Blob([md], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ai-engineer-readiness-${activeLevelId}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download size={15} /> Export Evidence Pack (.md)
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>
                  Remaining Requirements to Unlock {levelEval.level.title} Report:
                </div>
                <ul style={{ marginLeft: 18, fontSize: '0.84rem', color: 'var(--ink-2)', lineHeight: 1.55 }}>
                  {levelEval.missingLessons.length > 0 && (
                    <li>{levelEval.missingLessons.length} required lessons still incomplete</li>
                  )}
                  {!levelEval.labsPass && (
                    <li>Need at least {levelEval.level.requiredLabPct}% of labs (currently {levelEval.labPct}%)</li>
                  )}
                  {levelEval.missingExams.length > 0 && (
                    <li>Timed exams missing &ge;70%: {levelEval.missingExams.join(', ')}</li>
                  )}
                  {levelEval.missingCapstones.length > 0 && (
                    <li>
                      Missing verified capstone <code>evidence.json</code>: {levelEval.missingCapstones.join(', ')}{' '}
                      <button type="button" className="pill-tab" onClick={() => setTab('evidence')}>
                        Submit in Evidence Pack &rarr;
                      </button>
                    </li>
                  )}
                  {levelEval.missingScenarios.length > 0 && (
                    <li>
                      Missing passing scenario reviews: {levelEval.missingScenarios.join(', ')}{' '}
                      <button type="button" className="pill-tab" onClick={() => setTab('scenarios')}>
                        Open Scenarios &rarr;
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
              <strong>Tamper-Evident &amp; Employer Honesty Notice:</strong> No course grants an employer job title.
              In-browser lessons/labs/self-grades are stored in your browser/sync store and are self-reported; the
              verifiable proof is your public GitHub repositories, live deployed URLs, and validator{' '}
              <code>evidence.json</code> outputs. {levelEval.level.honestScopeNote}
            </p>
          </div>

          <div className="hero-card" style={{ textAlign: 'center' }}>
            <div className="hero-eyebrow">Self-Paced Course Participation Record</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>Certificate of Self-Paced Participation</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', marginBottom: 12 }}>
              Issued upon completing 24+ lessons and 8+ labs ({lessonsDone}/{ALL_LESSONS.length} lessons, {labsDone}/
              {TOTAL_LABS} labs completed). Records coursework participation only—not an employer credential.
            </p>
            {isParticipationEligible ? (
              <button type="button" className="btn" onClick={() => window.print()}>
                <Award size={15} /> Print Participation Record
              </button>
            ) : (
              <span style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
                Complete 24+ lessons and 8+ labs to unlock the participation record.
              </span>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
