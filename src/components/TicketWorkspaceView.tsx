'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Eye,
  Play,
  Rocket,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { STUDIO_PHASES, STUDIO_TICKETS, getTicketById, getTicketsByPhase } from '@/data/studioCurriculum';
import { runPythonCode } from '@/lib/pyodideRunner';
import type { PhaseId } from '@/types/studio';
import { useCourseApp } from './ThemeProgressProvider';

interface StagingCaseResult {
  passed: boolean;
  label: string;
  detail: string;
}

function buildSqlRunnerScript(userSql: string, setupCode?: string): string {
  const encodedSql = JSON.stringify(userSql);
  return `import sqlite3
conn = sqlite3.connect(":memory:")
${setupCode || ''}
user_sql = ${encodedSql}
cur = conn.cursor()
cur.execute(user_sql)
rows = cur.fetchall()
`;
}

export function TicketWorkspaceView({
  ticketId,
  onBackBoard,
  onSelectTicket,
  onOpenShipVerify,
}: {
  ticketId: string;
  onBackBoard: () => void;
  onSelectTicket: (nextId: string) => void;
  onOpenShipVerify: (phaseId: PhaseId) => void;
}) {
  const { progress, markTicketComplete, saveLabDraft, clearLabDraft } = useCourseApp();
  const ticket = useMemo(() => getTicketById(ticketId) || STUDIO_TICKETS[0], [ticketId]);
  const phase = useMemo(
    () => STUDIO_PHASES.find((p) => p.id === ticket.phaseId) || STUDIO_PHASES[0],
    [ticket.phaseId]
  );
  const phaseTickets = useMemo(() => getTicketsByPhase(ticket.phaseId), [ticket.phaseId]);

  const currentIdx = STUDIO_TICKETS.findIndex((t) => t.id === ticket.id);
  const nextTicket = currentIdx >= 0 && currentIdx < STUDIO_TICKETS.length - 1 ? STUDIO_TICKETS[currentIdx + 1] : null;
  const isLastInPhase = phaseTickets[phaseTickets.length - 1]?.id === ticket.id;

  const draftKey = `studio_${ticket.id}`;
  const isCompleted = (progress.completedTickets || []).includes(ticket.id);

  const [localCode, setLocalCode] = useState<string | null>(null);
  const code = localCode ?? progress.labDrafts?.[draftKey] ?? ticket.starterCode;

  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [running, setRunning] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [stagingCases, setStagingCases] = useState<StagingCaseResult[]>([]);
  const [rawError, setRawError] = useState<string>('');
  const [justPassed, setJustPassed] = useState(false);

  const updateCode = (val: string) => {
    setLocalCode(val);
    saveLabDraft(draftKey, val);
  };

  const runStagingCheck = async () => {
    setRunning(true);
    setRawError('');
    setStagingCases([]);
    setJustPassed(false);

    const execCode =
      ticket.language === 'sql' ? buildSqlRunnerScript(code, ticket.setupCode) : code;

    const res = await runPythonCode(execCode, ticket.testCode, [], (msg) => setStatusText(msg));
    setRunning(false);
    setStatusText('');

    const lines = (res.stdout || '').split('\n');
    const parsedCases: StagingCaseResult[] = [];
    for (const line of lines) {
      if (line.startsWith('STAGING_CASE|')) {
        const [, status, label, detail] = line.split('|');
        parsedCases.push({
          passed: status === 'PASS',
          label: label || 'Staging Check',
          detail: detail || '',
        });
      }
    }
    setStagingCases(parsedCases);

    if (res.ok && res.passedTests) {
      setJustPassed(true);
      markTicketComplete(ticket.id);
    } else {
      const errLines = (res.stderr || res.stdout || 'Staging check failed.')
        .split('\n')
        .filter((l) => !l.startsWith('STAGING_CASE|'))
        .slice(-6)
        .join('\n');
      setRawError(errLines || 'Assertion failed—check Acceptance Criteria on the left.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void runStagingCheck();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const next = code.substring(0, start) + '    ' + code.substring(end);
      updateCode(next);
      const target = e.currentTarget;
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  };

  const passedState = isCompleted || justPassed;

  return (
    <div className="studio-workspace-shell">
      {/* Slim Workspace Action Header */}
      <div className="studio-ws-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onBackBoard}>
            <ArrowLeft size={14} /> Board
          </button>
          <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--accent)', flexShrink: 0 }}>
            {ticket.id}
          </span>
          <span className="studio-ws-title">{ticket.title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => updateCode(ticket.solutionCode)}
            title="Load reference production solution"
          >
            <Eye size={13} /> Solution
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary btn-glow"
            disabled={running}
            onClick={() => void runStagingCheck()}
          >
            <Play size={13} />
            {running ? statusText || 'Running...' : 'Run Staging Check'}
          </button>
        </div>
      </div>

      {/* 2-Column Distraction-Free Split Grid */}
      <div className="studio-ws-grid">
        {/* Left Pane: Concise Brief, Acceptance Criteria & Visual Flow */}
        <aside className="studio-ws-left">
          <div className="studio-ticket-eyebrow" style={{ marginBottom: 6 }}>
            <span>
              {phase.shortLabel} · {ticket.stackTag}
            </span>
          </div>
          <p className="studio-ws-quote">{ticket.leadQuote}</p>

          <div className="studio-section-label">Acceptance Criteria</div>
          <ul className="studio-criteria-list">
            {ticket.acceptanceCriteria.map((item, idx) => (
              <li key={idx} className="studio-criteria-item">
                {passedState ? (
                  <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                ) : (
                  <Circle size={15} color="var(--ink-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="studio-section-label">Architecture Flow</div>
          <div className="studio-flow-box" aria-label="Pipeline flow">
            {ticket.flowSteps.map((step, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="studio-flow-arrow">→</span>}
                <span className="studio-flow-node">{step}</span>
              </React.Fragment>
            ))}
          </div>

          <div className="studio-cheat-wrap">
            <button
              type="button"
              className="studio-cheat-toggle"
              onClick={() => setShowCheatSheet((prev) => !prev)}
            >
              <span>60-Second Syntax Cheat Sheet</span>
              {showCheatSheet ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showCheatSheet && (
              <div className="studio-cheat-body">
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                  {ticket.cheatSheet.title}
                </div>
                <pre className="studio-cheat-pre">
                  <code>{ticket.cheatSheet.code}</code>
                </pre>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: 8, lineHeight: 1.45 }}>
                  {ticket.cheatSheet.tip}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Pane: Code Sandbox + Live Staging Simulator */}
        <section className="studio-ws-right">
          <div className="studio-editor-card">
            <div className="studio-editor-header">
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                {ticket.language === 'sql' ? 'query.sql (SQLite / Postgres)' : 'handler.py (Python 3.11)'}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                onClick={() => {
                  setLocalCode(ticket.starterCode);
                  clearLabDraft(draftKey);
                  setStagingCases([]);
                  setRawError('');
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <textarea
              className="studio-code-textarea"
              value={code}
              onChange={(e) => updateCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              aria-label="Ticket code editor"
            />
          </div>

          <div className="studio-staging-drawer" aria-live="polite">
            <div className="studio-staging-header">
              <span className="mono" style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Staging Simulator
              </span>
              {passedState && (
                <span className="studio-done-pill">
                  <CheckCircle2 size={12} /> Merged to Staging (+{ticket.xp} XP)
                </span>
              )}
            </div>

            {stagingCases.length === 0 && !rawError && (
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                Click <strong>Run Staging Check</strong> (or press <kbd className="kbd">⌘/Ctrl + Enter</kbd>) to replay real client payloads against your code.
              </p>
            )}

            {stagingCases.length > 0 && (
              <div className="studio-case-list">
                {stagingCases.map((c, idx) => (
                  <div key={idx} className="studio-case-row">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                      {c.passed ? (
                        <CheckCircle2 size={14} color="var(--success)" />
                      ) : (
                        <XCircle size={14} color="var(--danger)" />
                      )}
                      <span>{c.label}</span>
                    </span>
                    <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                      {c.detail}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {rawError && (
              <pre className="studio-error-pre">
                <code>{rawError}</code>
              </pre>
            )}

            {passedState && (
              <div className="studio-next-bar">
                {isLastInPhase && phase.repo ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => onOpenShipVerify(phase.id)}
                  >
                    <Rocket size={14} /> Ship Local Repo: {phase.repo.title} <ArrowRight size={14} />
                  </button>
                ) : nextTicket ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setLocalCode(null);
                      setStagingCases([]);
                      setRawError('');
                      setJustPassed(false);
                      onSelectTicket(nextTicket.id);
                    }}
                  >
                    Next Ticket: {nextTicket.id} <ArrowRight size={14} />
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
