'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Award, CheckCircle2, Clock, RotateCcw, Sparkles, X, XCircle } from 'lucide-react';
import type { TimedExamSpec } from '@/data/exams';
import { useCourseApp } from './ThemeProgressProvider';
import { RichText } from './MathAndProse';
import {
  getShuffledIndices,
  isQuestionAnswered,
  isQuestionCorrect,
  type QuizUserAnswer,
} from '@/lib/quizUtils';

export function TimedExamModal({
  exam,
  onClose,
}: {
  exam: TimedExamSpec;
  onClose: () => void;
}) {
  const { progress, unlockFastTrack, recordModuleExamScore } = useCourseApp();
  const quizSeed = progress.quizSeed || 'default-learner-seed';

  const [answers, setAnswers] = useState<Record<string, QuizUserAnswer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(exam.durationMinutes * 60);

  const permutations = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const q of exam.questions) {
      const qType = q.type || 'multiple-choice';
      if (qType === 'ordering') {
        map[q.id] = getShuffledIndices(q.items?.length ?? 0, `${quizSeed}:${exam.id}:${q.id}:order`);
      } else {
        map[q.id] = getShuffledIndices(q.options.length, `${quizSeed}:${exam.id}:${q.id}`);
      }
    }
    return map;
  }, [exam, quizSeed]);

  const score = useMemo(
    () => exam.questions.reduce((acc, q) => acc + (isQuestionCorrect(q, answers[q.id]) ? 1 : 0), 0),
    [exam.questions, answers]
  );

  useEffect(() => {
    if (submitted) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setSubmitted(true);
          if (exam.id === 'placement-fast-track') {
            unlockFastTrack(score, exam.questions.length);
          } else {
            recordModuleExamScore(exam.id, score, exam.questions.length);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [submitted, exam.id, exam.questions.length, score, unlockFastTrack, recordModuleExamScore]);

  const handleSubmit = () => {
    setSubmitted(true);
    if (exam.id === 'placement-fast-track') {
      unlockFastTrack(score, exam.questions.length);
    } else {
      recordModuleExamScore(exam.id, score, exam.questions.length);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(exam.durationMinutes * 60);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const answeredCount = exam.questions.filter((q) => isQuestionAnswered(q, answers[q.id])).length;
  const passed = score >= exam.passScore;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={exam.title}
      style={{ alignItems: 'flex-start', paddingTop: 28, overflowY: 'auto' }}
    >
      <div
        className="modal-panel"
        style={{ maxWidth: 820, width: '96%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            <span className="lab-badge" style={{ marginBottom: 4 }}>
              Timed Assessment · Pass {exam.passScore}/{exam.questions.length}
            </span>
            <h2 style={{ fontSize: '1.25rem', marginTop: 2 }}>{exam.title}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-2)', marginTop: 2 }}>{exam.subtitle}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span
              className="mono"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: 999,
                background: secondsLeft < 120 && !submitted ? 'var(--error-soft)' : 'var(--surface-2)',
                color: secondsLeft < 120 && !submitted ? 'var(--error)' : 'var(--ink)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Clock size={14} /> {mins}:{secs}
            </span>
            <button type="button" className="btn btn-sm btn-ghost" onClick={onClose} aria-label="Close exam">
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 2px', display: 'grid', gap: 20 }}>
          {submitted && (
            <div
              className="callout"
              style={{
                borderColor: passed ? 'var(--success)' : 'var(--accent-warm)',
                background: passed ? 'var(--success-soft)' : 'var(--surface-2)',
              }}
            >
              <div className="callout-title">
                {passed ? <Sparkles size={16} color="var(--success)" /> : <Award size={16} />}
                <span>
                  Score: {score} / {exam.questions.length} ({Math.round((score / exam.questions.length) * 100)}%) —{' '}
                  {passed ? 'PASSED!' : `Need ${exam.passScore} to pass`}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
                {exam.id === 'placement-fast-track'
                  ? passed
                    ? 'Fast Track for Developers unlocked! Beginner Module 0 & foundational Python prerequisites are auto-cleared so you can jump straight into Math, pandas/SQL, ML, LLMs, Software Engineering, and Interviews.'
                    : 'Keep practicing! Module 0 and Module 1 build every foundational habit step by step.'
                  : passed
                    ? 'Module exam mastery saved to your synced profile!'
                    : 'Review the explanations below, revisit highlighted lessons, and retake whenever ready.'}
              </p>
            </div>
          )}

          {exam.questions.map((q, qIdx) => {
            const qType = q.type || 'multiple-choice';
            const userAns = answers[q.id];
            const isCorrect = isQuestionCorrect(q, userAns);
            const perm = permutations[q.id] || [];

            return (
              <div
                key={q.id}
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--accent)' }}>
                    Q{qIdx + 1} · {qType.toUpperCase()}
                  </span>
                  {submitted && (
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        color: isCorrect ? 'var(--success)' : 'var(--error)',
                      }}
                    >
                      {isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  )}
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.94rem', marginBottom: 10 }}>
                  <RichText text={q.question} />
                </p>

                {q.code && (
                  <pre className="code-pre" style={{ marginBottom: 10, borderRadius: 6 }}>
                    <code>{q.code}</code>
                  </pre>
                )}

                {(qType === 'multiple-choice' || qType === 'predict-output' || qType === 'spot-bug') && (
                  <div className="quiz-options">
                    {perm.map((origIdx, dispIdx) => {
                      const opt = q.options[origIdx];
                      const picked = userAns?.single === origIdx;
                      const showRight = submitted && origIdx === q.correctIndex;
                      const showWrong = submitted && picked && origIdx !== q.correctIndex;
                      return (
                        <button
                          key={origIdx}
                          type="button"
                          disabled={submitted}
                          className={`quiz-opt ${picked ? 'selected' : ''} ${showRight ? 'correct' : ''} ${
                            showWrong ? 'wrong' : ''
                          }`}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: { single: origIdx } }))
                          }
                        >
                          <span className="mono" style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                            {String.fromCharCode(65 + dispIdx)}.
                          </span>
                          <span style={{ flex: 1, textAlign: 'left' }}>
                            <RichText text={opt} />
                          </span>
                          {showRight && <CheckCircle2 size={15} color="var(--success)" />}
                          {showWrong && <XCircle size={15} color="var(--error)" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {qType === 'multi-select' && (
                  <div className="quiz-options">
                    {perm.map((origIdx, dispIdx) => {
                      const opt = q.options[origIdx];
                      const chosen = userAns?.multi || [];
                      const picked = chosen.includes(origIdx);
                      const isRightOpt = (q.correctIndices || []).includes(origIdx);
                      const showRight = submitted && isRightOpt;
                      const showWrong = submitted && picked && !isRightOpt;
                      return (
                        <button
                          key={origIdx}
                          type="button"
                          disabled={submitted}
                          className={`quiz-opt ${picked ? 'selected' : ''} ${showRight ? 'correct' : ''} ${
                            showWrong ? 'wrong' : ''
                          }`}
                          onClick={() => {
                            const next = picked ? chosen.filter((x) => x !== origIdx) : [...chosen, origIdx];
                            setAnswers((prev) => ({ ...prev, [q.id]: { multi: next } }));
                          }}
                        >
                          <span className="mono" style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                            {picked ? '[x]' : '[ ]'} {String.fromCharCode(65 + dispIdx)}.
                          </span>
                          <span style={{ flex: 1, textAlign: 'left' }}>
                            <RichText text={opt} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {qType === 'numeric' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="text"
                      className="input mono"
                      style={{ maxWidth: 200 }}
                      disabled={submitted}
                      placeholder="Enter numeric value..."
                      value={userAns?.numeric || ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: { numeric: e.target.value } }))
                      }
                    />
                    {q.unit && <span className="mono" style={{ fontSize: '0.82rem' }}>{q.unit}</span>}
                    {submitted && (
                      <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                        Expected: {q.correctNumber}
                      </span>
                    )}
                  </div>
                )}

                {qType === 'ordering' && (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {perm.map((origIdx) => {
                        const already = (userAns?.ordered || []).includes(origIdx);
                        return (
                          <button
                            key={origIdx}
                            type="button"
                            disabled={submitted || already}
                            className="btn btn-sm"
                            style={{ opacity: already ? 0.45 : 1, textAlign: 'left' }}
                            onClick={() => {
                              const cur = userAns?.ordered || [];
                              setAnswers((prev) => ({ ...prev, [q.id]: { ordered: [...cur, origIdx] } }));
                            }}
                          >
                            + {(q.items || [])[origIdx]}
                          </button>
                        );
                      })}
                      {!submitted && (userAns?.ordered || []).length > 0 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: { ordered: [] } }))}
                        >
                          Clear Order
                        </button>
                      )}
                    </div>
                    {(userAns?.ordered || []).length > 0 && (
                      <ol style={{ paddingLeft: 20, fontSize: '0.86rem', color: 'var(--ink-2)' }}>
                        {(userAns?.ordered || []).map((origIdx, pos) => (
                          <li key={`${origIdx}-${pos}`}>{(q.items || [])[origIdx]}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                {submitted && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: 'var(--surface)',
                      fontSize: '0.84rem',
                      color: 'var(--ink-2)',
                    }}
                  >
                    <strong>Explanation:</strong> <RichText text={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
            Answered {answeredCount} / {exam.questions.length}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {submitted ? (
              <>
                <button type="button" className="btn" onClick={handleReset}>
                  <RotateCcw size={14} /> Retake Exam
                </button>
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Done
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Submit &amp; Grade ({answeredCount}/{exam.questions.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
