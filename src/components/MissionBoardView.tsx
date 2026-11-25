'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, ChevronDown, ChevronUp, Circle, FolderCode } from 'lucide-react';
import { ALL_JOURNEY_LESSONS, JOURNEY_STAGES, getStageLessons } from '@/data/journeyCurriculum';
import type { JourneyLesson } from '@/types/journey';
import { useCourseApp } from './ThemeProgressProvider';

export function MissionBoardView({
  selectedStage,
  onSelectStage,
  onOpenLesson,
  onOpenProject,
}: {
  selectedStage: number;
  onSelectStage: (stageNum: number) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenProject: (stageNum: number) => void;
}) {
  const { progress } = useCourseApp();
  const [showStageLessons, setShowStageLessons] = useState(false);

  const completedSet = useMemo(() => new Set(progress.completedLessons || []), [progress.completedLessons]);

  const stageObj = useMemo(
    () => JOURNEY_STAGES.find((s) => s.stageNumber === selectedStage) || JOURNEY_STAGES[0],
    [selectedStage]
  );

  const stageLessons = useMemo(() => getStageLessons(selectedStage), [selectedStage]);

  const activeLesson: JourneyLesson = useMemo(() => {
    return stageLessons.find((l) => !completedSet.has(l.id)) || stageLessons[0];
  }, [stageLessons, completedSet]);

  const allStageDone = useMemo(
    () => stageLessons.length > 0 && stageLessons.every((l) => completedSet.has(l.id)),
    [stageLessons, completedSet]
  );

  return (
    <main className="studio-board-wrap">
      {/* 7-Stage Calm Horizontal Stepper */}
      <nav className="studio-stepper" aria-label="7-Stage Learning Path">
        {JOURNEY_STAGES.map((st, idx) => {
          const lessons = ALL_JOURNEY_LESSONS.filter((l) => l.stageNumber === st.stageNumber);
          const doneCount = lessons.filter((l) => completedSet.has(l.id)).length;
          const isDone = doneCount === lessons.length && lessons.length > 0;
          const isCurrent = st.stageNumber === selectedStage;

          return (
            <React.Fragment key={st.stageNumber}>
              {idx > 0 && (
                <div className={`studio-step-line ${isDone || isCurrent ? 'lit' : ''}`} aria-hidden="true" />
              )}
              <button
                type="button"
                className={`studio-step-node ${isCurrent ? 'active' : ''} ${isDone ? 'done' : ''}`}
                style={{ minWidth: 96 }}
                onClick={() => {
                  onSelectStage(st.stageNumber);
                  setShowStageLessons(false);
                }}
              >
                <span className="studio-step-dot">
                  {isDone ? (
                    <Check size={13} strokeWidth={3} />
                  ) : isCurrent ? (
                    <span className="studio-step-core" />
                  ) : (
                    <span className="mono" style={{ fontSize: '0.68rem' }}>
                      {st.stageNumber}
                    </span>
                  )}
                </span>
                <span className="studio-step-label">Stage {st.stageNumber}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Stage Subtitle Strip */}
      <div style={{ textAlign: 'center', maxWidth: 620, marginBottom: 22 }}>
        <div className="mono" style={{ fontSize: '0.74rem', color: 'var(--accent)', textTransform: 'uppercase' }}>
          {stageObj.shortTitle}
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginTop: 4 }}>{stageObj.goal}</p>
      </div>

      {/* Single Calm Active Lesson Card */}
      <section className="studio-ticket-focus-card" aria-label="Current lesson">
        <div className="studio-ticket-eyebrow">
          <span>
            LESSON {activeLesson.lessonNumber} · 4 SIMPLE STEPS
          </span>
          {completedSet.has(activeLesson.id) && (
            <span className="studio-done-pill">
              <CheckCircle2 size={12} /> Completed
            </span>
          )}
        </div>

        <h1 className="studio-ticket-title">{activeLesson.title}</h1>

        <blockquote className="studio-lead-quote">{activeLesson.PlainSubtitle}</blockquote>

        <div className="studio-tag-row">
          <span className="studio-meta-tag">~{activeLesson.minutes} min</span>
          <span className="studio-meta-tag">Builds: {stageObj.project.title.split(':')[0]}</span>
          <span className="studio-xp-tag">+{activeLesson.xp} XP</span>
        </div>

        <button
          type="button"
          className="studio-primary-cta"
          onClick={() => onOpenLesson(activeLesson.id)}
        >
          <span>
            {completedSet.has(activeLesson.id)
              ? `Review Lesson ${activeLesson.lessonNumber}`
              : `Start Lesson ${activeLesson.lessonNumber}`}
          </span>
          <ArrowRight size={17} />
        </button>

        {allStageDone && (
          <button
            type="button"
            className="studio-ship-banner-btn"
            onClick={() => onOpenProject(stageObj.stageNumber)}
          >
            <FolderCode size={15} />
            <span>Stage {stageObj.stageNumber} Lessons Complete — Open {stageObj.project.title} →</span>
          </button>
        )}
      </section>

      {/* Subtle Collapsed Lesson List */}
      <div className="studio-drawer-wrap">
        <button
          type="button"
          className="studio-drawer-toggle"
          onClick={() => setShowStageLessons((prev) => !prev)}
        >
          <span>
            View all {stageLessons.length} lessons in Stage {stageObj.stageNumber}
          </span>
          {showStageLessons ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showStageLessons && (
          <div className="studio-drawer-list">
            {stageLessons.map((l) => {
              const isDone = completedSet.has(l.id);
              const isSelected = l.id === activeLesson.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  className={`studio-drawer-row ${isSelected ? 'current' : ''}`}
                  onClick={() => onOpenLesson(l.id)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {isDone ? (
                      <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0 }} />
                    ) : (
                      <Circle size={15} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
                    )}
                    <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                      {l.lessonNumber}
                    </span>
                    <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.title}
                    </span>
                  </span>
                  <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', flexShrink: 0 }}>
                    {l.minutes}m
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
