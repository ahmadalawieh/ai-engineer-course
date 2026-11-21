'use client';

import React, { useMemo, useState } from 'react';
import { Award, BookOpen, CheckCircle2, Eye, Layers, Printer, RotateCw, Search } from 'lucide-react';
import { FLASHCARDS } from '@/data/flashcards';
import { GLOSSARY_ITEMS } from '@/data/glossary';
import { MOCK_INTERVIEW_QUESTIONS } from '@/data/mockInterview';
import { ALL_LESSONS, TOTAL_LABS } from '@/data/curriculum';
import { useCourseApp } from './ThemeProgressProvider';
import { MathFormula, RichText } from './MathAndProse';

export function PracticeArena({ initialTab = 'flashcards' }: { initialTab?: 'flashcards' | 'interview' | 'glossary' | 'certificate' }) {
  const { progress, reviewFlashcard, markInterviewComplete } = useCourseApp();
  const [tab, setTab] = useState<'flashcards' | 'interview' | 'glossary' | 'certificate'>(initialTab);

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
  const [qIdx, setQIdx] = useState(0);
  const [userDraft, setUserDraft] = useState('');
  const [showSample, setShowSample] = useState(false);
  const [checkedRubric, setCheckedRubric] = useState<Record<number, boolean>>({});

  const filteredQuestions = useMemo(
    () =>
      MOCK_INTERVIEW_QUESTIONS.filter((q) => roleFilter === 'All' || q.role === roleFilter),
    [roleFilter]
  );
  const activeQuestion = filteredQuestions[qIdx % filteredQuestions.length];

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

  const lessonsDone = progress.completedLessons.length;
  const labsDone = progress.completedLabs.length;
  const interviewsDone = progress.interviewCompleted.length;
  const isCertified = lessonsDone >= 24 && labsDone >= 5 && interviewsDone >= 4;

  return (
    <main className="container">
      <div className="section-header" style={{ marginTop: 8 }}>
        <div>
          <span className="lab-badge">Active Recall &amp; Job Readiness</span>
          <h1>Practice Arena</h1>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.96rem', marginTop: 4 }}>
            Lock in formulas with SM-2 spaced repetition, rehearse Staff-level interviews, and verify full job readiness.
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
            className={`pill-tab ${tab === 'glossary' ? 'active' : ''}`}
            onClick={() => setTab('glossary')}
          >
            <BookOpen size={13} style={{ display: 'inline', marginRight: 5 }} />
            Glossary ({GLOSSARY_ITEMS.length})
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'certificate' ? 'active' : ''}`}
            onClick={() => setTab('certificate')}
          >
            <Award size={13} style={{ display: 'inline', marginRight: 5 }} />
            Certificate
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

      {tab === 'interview' && activeQuestion && (
        <section style={{ maxWidth: 820, margin: '18px auto 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
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
                  {r}
                </button>
              ))}
            </div>
            <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', alignSelf: 'center' }}>
              Completed: {interviewsDone}/{MOCK_INTERVIEW_QUESTIONS.length}
            </span>
          </div>

          <div className="hero-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <span className="track-badge track-core">
                {activeQuestion.role} · {activeQuestion.difficulty} · {activeQuestion.topic}
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
                  <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: 6 }}>Staff-Level Sample Answer:</strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)' }}>{activeQuestion.sampleAnswer}</p>
                </div>

                <div style={{ fontSize: '0.86rem', color: 'var(--accent)' }}>
                  <strong>Likely Follow-Up:</strong> {activeQuestion.followUp}
                </div>
              </div>
            )}
          </div>
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

      {tab === 'certificate' && (
        <section style={{ maxWidth: 760, margin: '24px auto 0' }}>
          <div className="hero-card certificate-card" style={{ textAlign: 'center' }}>
            <div className="hero-eyebrow">Verified Completion Credential</div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', marginBottom: 8 }}>
              Certificate of ML &amp; AI Engineering Mastery
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink-2)', marginBottom: 20 }}>
              Awarded to <strong style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>{progress.learnerName}</strong>
            </p>

            <div className="stat-grid" style={{ maxWidth: 540, margin: '0 auto 22px' }}>
              <div className="stat-box">
                <div className="stat-val">{lessonsDone}/{ALL_LESSONS.length}</div>
                <div className="stat-label">Lessons (Need 24+)</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{labsDone}/{TOTAL_LABS}</div>
                <div className="stat-label">Python &amp; SQL Labs (Need 5+)</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{interviewsDone}/{MOCK_INTERVIEW_QUESTIONS.length}</div>
                <div className="stat-label">Mock Interviews (Need 4+)</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{progress.xp}</div>
                <div className="stat-label">Mastery XP</div>
              </div>
            </div>

            {isCertified ? (
              <div>
                <p style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 14 }}>
                  Congratulations — you met all Mastery Milestones across Python, SQL, Classical ML, LLMs, RAG, Agents &amp; System Design!
                </p>
                <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                  <Printer size={15} /> Print / Save PDF Certificate
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.92rem' }}>
                Complete at least <strong>24 lessons</strong>, <strong>5 Python/SQL labs</strong>, and{' '}
                <strong>4 mock interviews</strong> to unlock your printable Mastery Certificate.
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
