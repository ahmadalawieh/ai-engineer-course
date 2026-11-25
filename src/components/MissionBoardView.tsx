'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, ChevronDown, ChevronUp, Circle, Rocket } from 'lucide-react';
import { STUDIO_PHASES, STUDIO_TICKETS, getTicketsByPhase } from '@/data/studioCurriculum';
import type { PhaseId, StudioTicket } from '@/types/studio';
import { useCourseApp } from './ThemeProgressProvider';

export function MissionBoardView({
  selectedPhaseId,
  onSelectPhase,
  onOpenTicket,
  onOpenShipVerify,
}: {
  selectedPhaseId: PhaseId;
  onSelectPhase: (phaseId: PhaseId) => void;
  onOpenTicket: (ticketId: string) => void;
  onOpenShipVerify: (phaseId: PhaseId) => void;
}) {
  const { progress } = useCourseApp();
  const [showAllTickets, setShowAllTickets] = useState(false);

  const completedIds = useMemo(() => new Set(progress.completedTickets || []), [progress.completedTickets]);

  const phaseTickets = useMemo(() => getTicketsByPhase(selectedPhaseId), [selectedPhaseId]);
  const selectedPhase = useMemo(
    () => STUDIO_PHASES.find((p) => p.id === selectedPhaseId) || STUDIO_PHASES[0],
    [selectedPhaseId]
  );

  const activeTicket: StudioTicket = useMemo(() => {
    return phaseTickets.find((t) => !completedIds.has(t.id)) || phaseTickets[0];
  }, [phaseTickets, completedIds]);

  const allPhaseTicketsDone = useMemo(
    () => phaseTickets.length > 0 && phaseTickets.every((t) => completedIds.has(t.id)),
    [phaseTickets, completedIds]
  );

  const repoVerified = Boolean(
    selectedPhase.repo && progress.capstoneEvidence?.[selectedPhase.repo.repoId]?.parsedSummary?.passed
  );

  return (
    <main className="studio-board-wrap">
      {/* 5-Node Horizontal Phase Stepper */}
      <nav className="studio-stepper" aria-label="Engineering phases">
        {STUDIO_PHASES.map((phase, index) => {
          const tickets = STUDIO_TICKETS.filter((t) => t.phaseId === phase.id);
          const doneCount = tickets.filter((t) => completedIds.has(t.id)).length;
          const phaseDone = doneCount === tickets.length && tickets.length > 0;
          const isCurrent = phase.id === selectedPhaseId;

          return (
            <React.Fragment key={phase.id}>
              {index > 0 && (
                <div className={`studio-step-line ${phaseDone || isCurrent ? 'lit' : ''}`} aria-hidden="true" />
              )}
              <button
                type="button"
                className={`studio-step-node ${isCurrent ? 'active' : ''} ${phaseDone ? 'done' : ''}`}
                onClick={() => {
                  onSelectPhase(phase.id);
                  setShowAllTickets(false);
                }}
              >
                <span className="studio-step-dot">
                  {phaseDone ? <Check size={13} strokeWidth={3} /> : isCurrent ? <span className="studio-step-core" /> : null}
                </span>
                <span className="studio-step-label">{phase.shortLabel}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Single Centered Active Ticket Card */}
      <section className="studio-ticket-focus-card" aria-label="Active engineering ticket">
        <div className="studio-ticket-eyebrow">
          <span>
            {activeTicket.code} · {activeTicket.roleContext}
          </span>
          {completedIds.has(activeTicket.id) && (
            <span className="studio-done-pill">
              <CheckCircle2 size={12} /> Passed
            </span>
          )}
        </div>

        <h1 className="studio-ticket-title">{activeTicket.title}</h1>

        <blockquote className="studio-lead-quote">{activeTicket.leadQuote}</blockquote>

        <div className="studio-tag-row">
          <span className="studio-meta-tag">{activeTicket.timeMinutes} min Interactive Drill</span>
          <span className="studio-meta-tag">{activeTicket.stackTag}</span>
          <span className="studio-xp-tag">+{activeTicket.xp} XP</span>
        </div>

        <button
          type="button"
          className="studio-primary-cta"
          onClick={() => onOpenTicket(activeTicket.id)}
        >
          <span>Open Ticket Workspace</span>
          <ArrowRight size={17} />
        </button>

        {allPhaseTicketsDone && selectedPhase.repo && (
          <button
            type="button"
            className="studio-ship-banner-btn"
            onClick={() => onOpenShipVerify(selectedPhase.id)}
          >
            <Rocket size={15} />
            <span>
              {repoVerified
                ? `${selectedPhase.repo.title} Verified ✓ — View Portfolio Proof`
                : `All 4 Drills Done — Ship Local Repo (${selectedPhase.repo.title}) →`}
            </span>
          </button>
        )}
      </section>

      {/* Subtle Collapsed Phase Ticket List */}
      <div className="studio-drawer-wrap">
        <button
          type="button"
          className="studio-drawer-toggle"
          onClick={() => setShowAllTickets((prev) => !prev)}
        >
          <span>
            View all {phaseTickets.length} tickets in {selectedPhase.shortLabel}
          </span>
          {showAllTickets ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAllTickets && (
          <div className="studio-drawer-list">
            {phaseTickets.map((t) => {
              const isDone = completedIds.has(t.id);
              const isSelected = t.id === activeTicket.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`studio-drawer-row ${isSelected ? 'current' : ''}`}
                  onClick={() => onOpenTicket(t.id)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {isDone ? (
                      <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0 }} />
                    ) : (
                      <Circle size={15} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
                    )}
                    <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                      {t.id}
                    </span>
                    <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </span>
                  </span>
                  <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', flexShrink: 0 }}>
                    {t.timeMinutes}m
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
