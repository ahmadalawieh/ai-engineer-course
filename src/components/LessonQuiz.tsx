'use client';

import React, { useState } from 'react';
import { Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import type { QuizQuestion } from '@/types/course';
import { useCourseApp } from './ThemeProgressProvider';
import { RichText } from './MathAndProse';

export function LessonQuiz({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: QuizQuestion[];
}) {
  const { progress, recordQuizScore } = useCourseApp();
  const prevBest = progress.quizScores[lessonId];

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => typeof answers[q.id] === 'number');
  const score = questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0),
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {questions.map((q, qIdx) => {
          const picked = answers[q.id];
          const isCorrect = picked === q.correctIndex;

          return (
            <div key={q.id}>
              <p style={{ fontWeight: 600, fontSize: '0.96rem', marginBottom: 10 }}>
                {qIdx + 1}. <RichText text={q.question} />
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {q.options.map((opt, optIdx) => {
                  let cls = 'quiz-option';
                  if (submitted) {
                    if (optIdx === q.correctIndex) cls += ' correct';
                    else if (picked === optIdx) cls += ' wrong';
                  } else if (picked === optIdx) {
                    cls += ' selected';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      className={cls}
                      disabled={submitted}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                    >
                      <span
                        className="mono"
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--ink-muted)',
                          marginTop: 1,
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span style={{ flex: 1 }}>
                        <RichText text={opt} />
                      </span>
                      {submitted && optIdx === q.correctIndex && (
                        <CheckCircle2 size={16} color="var(--success)" />
                      )}
                      {submitted && picked === optIdx && optIdx !== q.correctIndex && (
                        <XCircle size={16} color="var(--danger)" />
                      )}
                    </button>
                  );
                })}
              </div>

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
