'use client';

import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import type { QuizQuestion } from '@/types/course';
import { useCourseApp } from './ThemeProgressProvider';
import { RichText } from './MathAndProse';
import {
  getShuffledIndices,
  isQuestionAnswered,
  isQuestionCorrect,
  type QuizUserAnswer,
} from '@/lib/quizUtils';

export function LessonQuiz({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: QuizQuestion[];
}) {
  const { progress, recordQuizScore } = useCourseApp();
  const prevBest = progress.quizScores[lessonId];
  const quizSeed = progress.quizSeed || 'default-learner-seed';

  const [answers, setAnswers] = useState<Record<string, QuizUserAnswer>>({});
  const [submitted, setSubmitted] = useState(false);

  const permutations = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const q of questions) {
      const qType = q.type || 'multiple-choice';
      if (qType === 'ordering') {
        map[q.id] = getShuffledIndices(q.items?.length ?? 0, `${quizSeed}:${lessonId}:${q.id}:order`);
      } else {
        map[q.id] = getShuffledIndices(q.options.length, `${quizSeed}:${lessonId}:${q.id}`);
      }
    }
    return map;
  }, [questions, quizSeed, lessonId]);

  const allAnswered = questions.every((q) => isQuestionAnswered(q, answers[q.id]));
  const score = questions.reduce(
    (acc, q) => acc + (isQuestionCorrect(q, answers[q.id]) ? 1 : 0),
    0
  );

  const handleSubmit = () => {
    setSubmitted(true);
    recordQuizScore(lessonId, score, questions.length);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <section className="quiz-card" id={`quiz-${lessonId}`}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <div>
          <span className="lab-badge">Mastery Check</span>
          <h2 style={{ fontSize: '1.4rem', marginTop: 2 }}>Lesson Quiz ({questions.length} Questions)</h2>
        </div>
        {prevBest && (
          <span className="track-badge track-core">
            <Award size={12} style={{ marginRight: 4 }} />
            Best: {prevBest.bestScore}/{prevBest.total}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {questions.map((q, qIdx) => {
          const qType = q.type || 'multiple-choice';
          const userAns = answers[q.id];
          const isCorrect = isQuestionCorrect(q, userAns);
          const perm = permutations[q.id] || [];

          const typeLabel =
            qType === 'predict-output'
              ? 'Predict Output'
              : qType === 'spot-bug'
                ? 'Spot the Bug'
                : qType === 'multi-select'
                  ? 'Select All That Apply'
                  : qType === 'ordering'
                    ? 'Tap in Order'
                    : qType === 'numeric'
                      ? 'Numeric Answer'
                      : null;

          return (
            <div key={q.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {typeLabel && (
                  <span className="track-badge" style={{ fontSize: '0.68rem' }}>
                    {typeLabel}
                  </span>
                )}
                <p style={{ fontWeight: 600, fontSize: '0.96rem', margin: 0 }}>
                  {qIdx + 1}. <RichText text={q.question} />
                </p>
              </div>

              {q.code && (
                <pre className="code-pre" style={{ borderRadius: 'var(--radius-sm)', background: 'var(--code-bg)', color: 'var(--code-ink)', marginBottom: 10 }}>
                  <code>{q.code}</code>
                </pre>
              )}

              {(qType === 'multiple-choice' || qType === 'predict-output' || qType === 'spot-bug') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }} role="radiogroup" aria-label={`Question ${qIdx + 1}`}>
                  {perm.map((origIdx, dispIdx) => {
                    const opt = q.options[origIdx];
                    const pickedOrig = userAns?.single;
                    let cls = 'quiz-option';
                    if (submitted) {
                      if (origIdx === q.correctIndex) cls += ' correct';
                      else if (pickedOrig === origIdx) cls += ' wrong';
                    } else if (pickedOrig === origIdx) {
                      cls += ' selected';
                    }

                    return (
                      <button
                        key={origIdx}
                        type="button"
                        role="radio"
                        aria-checked={pickedOrig === origIdx}
                        className={cls}
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: { single: origIdx } }))}
                      >
                        <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-muted)', marginTop: 1 }}>
                          {String.fromCharCode(65 + dispIdx)}.
                        </span>
                        <span style={{ flex: 1 }}>
                          <RichText text={opt} />
                        </span>
                        {submitted && origIdx === q.correctIndex && <CheckCircle2 size={16} color="var(--success)" />}
                        {submitted && pickedOrig === origIdx && origIdx !== q.correctIndex && <XCircle size={16} color="var(--danger)" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {qType === 'multi-select' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }} role="group" aria-label={`Question ${qIdx + 1}`}>
                  {perm.map((origIdx, dispIdx) => {
                    const opt = q.options[origIdx];
                    const pickedList = userAns?.multi || [];
                    const isPicked = pickedList.includes(origIdx);
                    const shouldPick = (q.correctIndices || []).includes(origIdx);
                    let cls = 'quiz-option';
                    if (submitted) {
                      if (shouldPick && isPicked) cls += ' correct';
                      else if (!shouldPick && isPicked) cls += ' wrong';
                      else if (shouldPick && !isPicked) cls += ' wrong';
                    } else if (isPicked) {
                      cls += ' selected';
                    }
                    return (
                      <button
                        key={origIdx}
                        type="button"
                        className={cls}
                        disabled={submitted}
                        onClick={() =>
                          setAnswers((prev) => {
                            const cur = prev[q.id]?.multi || [];
                            const next = cur.includes(origIdx)
                              ? cur.filter((x) => x !== origIdx)
                              : [...cur, origIdx];
                            return { ...prev, [q.id]: { multi: next } };
                          })
                        }
                      >
                        <input type="checkbox" readOnly checked={isPicked} style={{ marginTop: 3 }} aria-hidden="true" />
                        <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-muted)', marginTop: 1 }}>
                          {String.fromCharCode(65 + dispIdx)}.
                        </span>
                        <span style={{ flex: 1 }}>
                          <RichText text={opt} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {qType === 'ordering' && q.items && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                    {(userAns?.ordered || []).length === 0 ? (
                      <div className="mono" style={{ padding: 10, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                        Tap steps below in sequence from first to last...
                      </div>
                    ) : (
                      (userAns?.ordered || []).map((origIdx, pos) => (
                        <button
                          key={origIdx}
                          type="button"
                          disabled={submitted}
                          className={`quiz-option ${submitted ? (origIdx === pos ? 'correct' : 'wrong') : 'selected'}`}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: { ordered: (prev[q.id]?.ordered || []).filter((_, p) => p !== pos) },
                            }))
                          }
                        >
                          <span className="mono" style={{ fontWeight: 700 }}>{pos + 1}.</span>
                          <span style={{ flex: 1 }}><RichText text={q.items![origIdx]} /></span>
                          {!submitted && <span style={{ fontSize: '0.74rem', opacity: 0.7 }}>Remove</span>}
                        </button>
                      ))
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {perm
                      .filter((origIdx) => !(userAns?.ordered || []).includes(origIdx))
                      .map((origIdx) => (
                        <button
                          key={origIdx}
                          type="button"
                          disabled={submitted}
                          className="btn btn-sm"
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: { ordered: [...(prev[q.id]?.ordered || []), origIdx] },
                            }))
                          }
                        >
                          + <RichText text={q.items![origIdx]} />
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {qType === 'numeric' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    step="any"
                    disabled={submitted}
                    className="input mono"
                    style={{ maxWidth: 200 }}
                    aria-label={`Numeric answer for question ${qIdx + 1}`}
                    value={userAns?.numeric ?? ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: { numeric: e.target.value } }))}
                    placeholder="Enter number..."
                  />
                  {q.unit && (
                    <span className="mono" style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
                      {q.unit}
                    </span>
                  )}
                </div>
              )}

              {submitted && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isCorrect ? 'var(--success-soft)' : 'var(--surface-2)',
                    fontSize: '0.85rem',
                    color: 'var(--ink-2)',
                  }}
                >
                  <strong>{isCorrect ? 'Correct:' : 'Explanation:'}</strong>{' '}
                  <RichText text={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 22,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        {!submitted ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!allAnswered}
            onClick={handleSubmit}
            id={`submit-quiz-${lessonId}`}
          >
            Submit Answers
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.96rem' }}>
              Score: {score} / {questions.length}{' '}
              {score >= Math.ceil(questions.length * 0.66)
                ? '— Lesson Mastered!'
                : '— Review explanations & retry'}
            </span>
            <button type="button" className="btn btn-sm" onClick={handleReset}>
              <RotateCcw size={13} /> Retake Quiz
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
