'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Moon, Sparkles, Sun } from 'lucide-react';
import { STUDIO_PHASES, STUDIO_TICKETS, getTicketById } from '@/data/studioCurriculum';
import type { PhaseId } from '@/types/studio';
import { MissionBoardView } from './MissionBoardView';
import { TicketWorkspaceView } from './TicketWorkspaceView';
import { ShipVerifyView } from './ShipVerifyView';
import { SyncModal } from './SyncModal';
import { useCourseApp } from './ThemeProgressProvider';

export type StudioScreen = 'board' | 'workspace' | 'ship';

export function CourseAppShell() {
  const { theme, toggleTheme, progress, syncConfig, syncStatus, authUser } = useCourseApp();

  const completedSet = useMemo(() => new Set(progress.completedTickets || []), [progress.completedTickets]);

  const firstOpenTicket = useMemo(
    () => STUDIO_TICKETS.find((t) => !completedSet.has(t.id)) || STUDIO_TICKETS[0],
    [completedSet]
  );

  const [screen, setScreen] = useState<StudioScreen>('board');
  const [selectedPhaseId, setSelectedPhaseId] = useState<PhaseId>('phase-0');
  const [activeTicketId, setActiveTicketId] = useState<string>('P0-1');
  const [syncOpen, setSyncOpen] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('ticket');
      const s = params.get('screen');
      if (t) {
        const found = getTicketById(t);
        if (found) {
          setActiveTicketId(found.id);
          setSelectedPhaseId(found.phaseId);
          setScreen('workspace');
          return;
        }
      }
      if (s === 'ship') {
        setScreen('ship');
        return;
      }
      setActiveTicketId(firstOpenTicket.id);
      setSelectedPhaseId(firstOpenTicket.phaseId);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSynced = Boolean(authUser) || syncConfig.mode !== 'none' || syncStatus === 'synced';
  const phaseIndex = STUDIO_PHASES.findIndex((p) => p.id === selectedPhaseId);
  const sprintLabel = phaseIndex <= 0 ? 'Phase 0' : `Sprint ${phaseIndex}`;
  const doneCount = STUDIO_TICKETS.filter((t) => completedSet.has(t.id)).length;

  return (
    <div className="studio-app">
      <header className="studio-header">
        <button
          type="button"
          className="studio-brand"
          onClick={() => setScreen('board')}
        >
          <span className="studio-brand-icon">
            <Sparkles size={15} />
          </span>
          <span className="studio-brand-text">AI Engineer Studio</span>
        </button>

        <nav className="studio-nav-tabs" aria-label="Primary studio screens">
          <button
            type="button"
            className={`studio-nav-tab ${screen === 'board' ? 'active' : ''}`}
            onClick={() => setScreen('board')}
          >
            1. Mission Board
          </button>
          <button
            type="button"
            className={`studio-nav-tab ${screen === 'workspace' ? 'active' : ''}`}
            onClick={() => setScreen('workspace')}
          >
            2. Workspace
          </button>
          <button
            type="button"
            className={`studio-nav-tab ${screen === 'ship' ? 'active' : ''}`}
            onClick={() => setScreen('ship')}
          >
            3. Ship &amp; Verify
          </button>
        </nav>

        <div className="studio-header-right">
          <button
            type="button"
            className="studio-sync-pill"
            onClick={() => setSyncOpen(true)}
            title="Sync progress across devices"
          >
            <span>
              {sprintLabel} · {doneCount}/{STUDIO_TICKETS.length} · {isSynced ? 'Synced' : 'Sync'}
            </span>
            <span className={`studio-sync-dot ${isSynced ? 'on' : ''}`} />
          </button>

          <button
            type="button"
            className="studio-icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </header>

      {screen === 'board' && (
        <MissionBoardView
          selectedPhaseId={selectedPhaseId}
          onSelectPhase={(pid) => setSelectedPhaseId(pid)}
          onOpenTicket={(tid) => {
            const found = getTicketById(tid);
            if (found) setSelectedPhaseId(found.phaseId);
            setActiveTicketId(tid);
            setScreen('workspace');
          }}
          onOpenShipVerify={(pid) => {
            setSelectedPhaseId(pid);
            setScreen('ship');
          }}
        />
      )}

      {screen === 'workspace' && (
        <TicketWorkspaceView
          key={activeTicketId}
          ticketId={activeTicketId}
          onBackBoard={() => setScreen('board')}
          onSelectTicket={(nextId) => {
            const found = getTicketById(nextId);
            if (found) setSelectedPhaseId(found.phaseId);
            setActiveTicketId(nextId);
          }}
          onOpenShipVerify={(pid) => {
            setSelectedPhaseId(pid);
            setScreen('ship');
          }}
        />
      )}

      {screen === 'ship' && <ShipVerifyView initialPhaseId={selectedPhaseId} />}

      <SyncModal open={syncOpen} onClose={() => setSyncOpen(false)} />
    </div>
  );
}
