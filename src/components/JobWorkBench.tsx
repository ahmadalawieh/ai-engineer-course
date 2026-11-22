'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  FileCode2,
  FolderGit2,
  GitPullRequest,
  Laptop,
  ShieldAlert,
  Sparkles,
  Terminal,
  Wrench,
} from 'lucide-react';
import {
  GUIDED_PROJECTS,
  JOB_ROLE_PROFILES,
  LOCAL_SETUP_STEPS,
  PR_REVIEW_CHALLENGES,
  TRACE_DEBUGGER_SCENARIOS,
  WORKPLACE_TICKETS,
} from '@/data/jobWorkbench';
import { useCourseApp } from './ThemeProgressProvider';
import { PythonLab } from './PythonLab';
import { RichText } from './MathAndProse';
import { VisualDiagramBlock } from './VisualDiagrams';
import { LiveProjectPlayground } from './LiveProjectPlayground';

type WorkTab = 'day-in-life' | 'tickets' | 'pr-reviews' | 'projects' | 'debugger';

export function JobWorkBench() {
  const {
    progress,
    markTicketComplete,
    markPrReviewComplete,
    toggleSetupStep,
    toggleProjectStep,
    saveProjectJournal,
  } = useCourseApp();

  const [tab, setTab] = useState<WorkTab>('day-in-life');

  // Role & Setup state
  const [activeRoleIdx, setActiveRoleIdx] = useState(0);
  const [osMode, setOsMode] = useState<'mac' | 'win'>('mac');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tickets state
  const [ticketIdx, setTicketIdx] = useState(0);
  const [triageAnswers, setTriageAnswers] = useState<Record<string, number | undefined>>({});

  // PR Reviews state
  const [prIdx, setPrIdx] = useState(0);
  const [prSelections, setPrSelections] = useState<Record<string, number[]>>({});
  const [prChecked, setPrChecked] = useState<Record<string, boolean>>({});

  // Guided Projects state
  const [projIdx, setProjIdx] = useState(0);
  const [projFileIdx, setProjFileIdx] = useState(0);

  // Trace Debugger state
  const [traceIdx, setTraceIdx] = useState(0);
  const [activeFixes, setActiveFixes] = useState<Record<string, boolean>>({});

  const copyText = (id: string, txt: string) => {
    void navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const completedTickets = progress.completedTickets || [];
  const completedPrs = progress.completedPrReviews || [];
  const completedSetup = progress.completedSetupSteps || [];
  const completedProjSteps = progress.completedProjectSteps || [];

  const activeRole = JOB_ROLE_PROFILES[activeRoleIdx] || JOB_ROLE_PROFILES[0];
  const activeTicket = WORKPLACE_TICKETS[ticketIdx] || WORKPLACE_TICKETS[0];
  const activePr = PR_REVIEW_CHALLENGES[prIdx] || PR_REVIEW_CHALLENGES[0];
  const activeProject = GUIDED_PROJECTS[projIdx] || GUIDED_PROJECTS[0];
  const activeProjectFile = activeProject.files[projFileIdx % activeProject.files.length] || activeProject.files[0];
  const activeTrace = TRACE_DEBUGGER_SCENARIOS[traceIdx] || TRACE_DEBUGGER_SCENARIOS[0];
  const traceEval = activeTrace.evaluate(activeFixes);

  return (
    <main className="container">
      {/* Workbench Header + Editorial Illustration Banner */}
      <section className="workbench-banner">
        <div className="workbench-banner-copy">
          <span className="lab-badge">Real-World Job Simulator &amp; Setup Studio</span>
          <h1 style={{ fontSize: 'clamp(1.65rem, 3.2vw, 2.25rem)', marginTop: 6 }}>
            Real Work, Setup &amp; Production Projects
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.96rem', marginTop: 8 }}>
            Learn what hired AI/ML Engineers actually do Monday–Friday: set up Python &amp; Git from zero,
            solve realistic Slack/Jira production tickets, catch bugs in Pull Requests, debug RAG traces,
            and build 6 downloadable GitHub-ready capstones with tests, deploy guides &amp; project journals.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            <span className="track-badge">
              Tickets: {completedTickets.length}/{WORKPLACE_TICKETS.length}
            </span>
            <span className="track-badge">
              PR Reviews: {completedPrs.length}/{PR_REVIEW_CHALLENGES.length}
            </span>
            <span className="track-badge">
              Setup Steps: {completedSetup.length}/{LOCAL_SETUP_STEPS.length}
            </span>
            <span className="track-badge">
              Project Tasks: {completedProjSteps.length}/
              {GUIDED_PROJECTS.reduce((acc, p) => acc + p.steps.length, 0)}
            </span>
          </div>
        </div>
        <div className="workbench-banner-img-wrap">
          <Image
            src="/images/ai-workbench-banner.jpg"
            alt="AI production pipeline and telemetry schematic illustration"
            width={960}
            height={540}
            className="workbench-banner-img"
          />
        </div>
      </section>

      {/* Sub-navigation tabs */}
      <div className="pill-tabs" style={{ marginTop: 22, marginBottom: 22 }}>
        <button
          type="button"
          className={`pill-tab ${tab === 'day-in-life' ? 'active' : ''}`}
          onClick={() => setTab('day-in-life')}
        >
          <Laptop size={13} style={{ display: 'inline', marginRight: 5 }} />
          1. Day in the Life &amp; Setup
        </button>
        <button
          type="button"
          className={`pill-tab ${tab === 'tickets' ? 'active' : ''}`}
          onClick={() => setTab('tickets')}
        >
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 5 }} />
          2. Workplace Tickets ({completedTickets.length}/{WORKPLACE_TICKETS.length})
        </button>
        <button
          type="button"
          className={`pill-tab ${tab === 'pr-reviews' ? 'active' : ''}`}
          onClick={() => setTab('pr-reviews')}
        >
          <GitPullRequest size={13} style={{ display: 'inline', marginRight: 5 }} />
          3. PR Bug Hunts ({completedPrs.length}/{PR_REVIEW_CHALLENGES.length})
        </button>
        <button
          type="button"
          className={`pill-tab ${tab === 'projects' ? 'active' : ''}`}
          onClick={() => setTab('projects')}
        >
          <FolderGit2 size={13} style={{ display: 'inline', marginRight: 5 }} />
          4. Live Projects (3)
        </button>
        <button
          type="button"
          className={`pill-tab ${tab === 'debugger' ? 'active' : ''}`}
          onClick={() => setTab('debugger')}
        >
          <Wrench size={13} style={{ display: 'inline', marginRight: 5 }} />
          5. Trace Debugger
        </button>
      </div>

      {/* TAB 1: DAY IN THE LIFE & BEGINNER SETUP */}
      {tab === 'day-in-life' && (
        <div style={{ display: 'grid', gap: 22 }}>
          <section className="lab-card">
            <div className="lab-header">
              <div>
                <span className="lab-badge">
                  <Briefcase size={12} style={{ display: 'inline', marginRight: 5 }} />
                  If You Get Hired: What You Actually Do Monday–Friday
                </span>
                <h2 style={{ fontSize: '1.25rem', marginTop: 4 }}>{activeRole.title}</h2>
              </div>
              <div className="pill-tabs">
                {JOB_ROLE_PROFILES.map((role, idx) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`pill-tab ${idx === activeRoleIdx ? 'active' : ''}`}
                    onClick={() => setActiveRoleIdx(idx)}
                  >
                    {role.title.split('/')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="lab-body">
              <p style={{ fontSize: '0.96rem', color: 'var(--ink)' }}>{activeRole.tagline}</p>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink-muted)', marginTop: 4 }}>
                {activeRole.salaryBandNote}
              </p>

              {/* Weekly Time Split */}
              <div style={{ marginTop: 18 }}>
                <div className="mono" style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 8 }}>
                  TYPICAL 40-HOUR WEEK BREAKDOWN
                </div>
                <div className="split-bar">
                  {activeRole.weeklySplit.map((s) => (
                    <div
                      key={s.label}
                      style={{ width: `${s.pct}%`, background: s.color }}
                      title={`${s.label}: ${s.pct}%`}
                    />
                  ))}
                </div>
                <div className="split-legend">
                  {activeRole.weeklySplit.map((s) => (
                    <div key={s.label} className="split-legend-item">
                      <span className="split-swatch" style={{ background: s.color }} />
                      <span>
                        <strong>{s.pct}%</strong> {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mon-Fri Schedule */}
              <div className="week-grid" style={{ marginTop: 18 }}>
                {activeRole.dailySchedule.map((d) => (
                  <div key={d.day} className="day-card">
                    <span className="mono" style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent)' }}>
                      {d.day}
                    </span>
                    <p style={{ fontSize: '0.84rem', color: 'var(--ink-2)', marginTop: 4 }}>{d.task}</p>
                  </div>
                ))}
              </div>

              {/* Tools & Beginner Truth */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                {activeRole.toolsUsedDaily.map((tool) => (
                  <span key={tool} className="track-badge">
                    {tool}
                  </span>
                ))}
              </div>

              <div className="callout tip" style={{ marginTop: 16, marginBottom: 0 }}>
                <div className="callout-title">
                  <Sparkles size={15} /> What Surprises Beginners Most
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)' }}>{activeRole.whatSurprisesBeginners}</p>
              </div>
            </div>
          </section>

          {/* Beginner Zero-to-Hired Local Setup Checklist */}
          <section className="lab-card">
            <div className="lab-header">
              <div>
                <span className="lab-badge">
                  <Terminal size={12} style={{ display: 'inline', marginRight: 5 }} />
                  Zero-Knowledge Local Setup Checklist (+15 XP per step)
                </span>
                <h2 style={{ fontSize: '1.22rem', marginTop: 4 }}>
                  Set Up Python, VS Code, Git &amp; Safe `.env` Secrets on Your Computer
                </h2>
              </div>
              <div className="pill-tabs">
                <button
                  type="button"
                  className={`pill-tab ${osMode === 'mac' ? 'active' : ''}`}
                  onClick={() => setOsMode('mac')}
                >
                  macOS / Linux
                </button>
                <button
                  type="button"
                  className={`pill-tab ${osMode === 'win' ? 'active' : ''}`}
                  onClick={() => setOsMode('win')}
                >
                  Windows PowerShell
                </button>
              </div>
            </div>

            <div className="lab-body" style={{ display: 'grid', gap: 14 }}>
              {LOCAL_SETUP_STEPS.map((step) => {
                const done = completedSetup.includes(step.id);
                const cmd = osMode === 'mac' ? step.macLinuxCmd : step.windowsCmd;
                return (
                  <div key={step.id} className={`checklist-card ${done ? 'done' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <button
                        type="button"
                        className="checklist-toggle"
                        onClick={() => toggleSetupStep(step.id)}
                      >
                        {done ? (
                          <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                        ) : (
                          <Circle size={20} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} />
                        )}
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                            Step {step.stepNumber}: {step.title}
                          </div>
                          <div style={{ fontSize: '0.84rem', color: 'var(--ink-2)', marginTop: 2 }}>
                            <RichText text={step.whyNeeded} />
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => copyText(step.id, cmd)}
                      >
                        {copiedId === step.id ? <Check size={13} /> : <Copy size={13} />}
                        {copiedId === step.id ? 'Copied' : 'Copy Cmd'}
                      </button>
                    </div>

                    <pre className="code-pre" style={{ borderRadius: 'var(--radius-sm)', marginTop: 10, padding: '10px 12px' }}>
                      <code>{cmd}</code>
                    </pre>
                    <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: 6 }}>
                      <strong>Verify:</strong> <RichText text={step.verifyHint} />
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: WORKPLACE TICKET SIMULATOR */}
      {tab === 'tickets' && (
        <div>
          <div className="ticket-selector-grid">
            {WORKPLACE_TICKETS.map((t, idx) => {
              const solved = completedTickets.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`ticket-pill ${idx === ticketIdx ? 'active' : ''}`}
                  onClick={() => setTicketIdx(idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {t.code}
                    </span>
                    {solved && <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.84rem', marginTop: 3 }}>{t.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: 3 }}>
                    {t.priority} · {t.roleTag}
                  </div>
                </button>
              );
            })}
          </div>

          <section className="lab-card" style={{ marginTop: 16 }}>
            <div className="lab-header">
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span className="ticket-priority-badge">{activeTicket.priority}</span>
                  <span className="track-badge">{activeTicket.roleTag}</span>
                  <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                    {activeTicket.reporter}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem' }}>
                  {activeTicket.code}: {activeTicket.title}
                </h2>
              </div>
              {completedTickets.includes(activeTicket.id) && (
                <span className="track-badge" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                  <CheckCircle2 size={13} style={{ marginRight: 4 }} /> Ticket Closed (+80 XP)
                </span>
              )}
            </div>

            <div className="lab-body">
              <div className="slack-quote">
                <div className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-warm)', marginBottom: 4 }}>
                  INCOMING SLACK ESCALATION
                </div>
                <p style={{ fontSize: '0.94rem', color: 'var(--ink)' }}>{activeTicket.slackMessage}</p>
              </div>

              <div style={{ marginTop: 14 }}>
                <div className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 6 }}>
                  PRODUCTION LOG / TRACE CAPTURE
                </div>
                <pre className="code-pre" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <code>{activeTicket.traceLog}</code>
                </pre>
              </div>

              {/* Root-Cause Triage Step */}
              <div className="quiz-card" style={{ marginTop: 18, padding: 16 }}>
                <div className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
                  STEP 1 · DIAGNOSE ROOT CAUSE
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 10 }}>
                  <RichText text={activeTicket.triageQuestion} />
                </p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {activeTicket.triageOptions.map((opt, oIdx) => {
                    const picked = triageAnswers[activeTicket.id];
                    const isPicked = picked === oIdx;
                    const isCorrect = picked !== undefined && oIdx === activeTicket.triageCorrectIndex;
                    const isWrong = isPicked && oIdx !== activeTicket.triageCorrectIndex;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        className={`quiz-option ${isCorrect ? 'correct' : isWrong ? 'wrong' : isPicked ? 'selected' : ''}`}
                        onClick={() =>
                          setTriageAnswers((prev) => ({ ...prev, [activeTicket.id]: oIdx }))
                        }
                      >
                        <RichText text={opt} />
                      </button>
                    );
                  })}
                </div>
                {triageAnswers[activeTicket.id] !== undefined && (
                  <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)', marginTop: 10 }}>
                    <strong>Explanation:</strong> <RichText text={activeTicket.triageExplanation} />
                  </p>
                )}
              </div>

              {/* Live Bug-Fix Coding Lab */}
              <div style={{ marginTop: 18 }}>
                <PythonLab
                  key={activeTicket.lab.labId}
                  labId={activeTicket.lab.labId}
                  title={`Step 2 · Ship the Fix: ${activeTicket.lab.title}`}
                  prompt={activeTicket.lab.prompt}
                  starterCode={activeTicket.lab.starterCode}
                  testCode={activeTicket.lab.testCode}
                  solutionCode={activeTicket.lab.solutionCode}
                  hint={activeTicket.lab.hint}
                  packages={activeTicket.lab.packages}
                  language={activeTicket.lab.language}
                  setupCode={activeTicket.lab.setupCode}
                  onPass={() => markTicketComplete(activeTicket.id)}
                  xpLabel="Ticket Closed (+80 XP)"
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: PR CODE REVIEW BUG HUNTS */}
      {tab === 'pr-reviews' && (
        <div>
          <div className="pill-tabs" style={{ marginBottom: 14 }}>
            {PR_REVIEW_CHALLENGES.map((pr, idx) => (
              <button
                key={pr.id}
                type="button"
                className={`pill-tab ${idx === prIdx ? 'active' : ''}`}
                onClick={() => setPrIdx(idx)}
              >
                {pr.prNumber}
                {completedPrs.includes(pr.id) ? ' ✓' : ''}
              </button>
            ))}
          </div>

          <section className="lab-card">
            <div className="lab-header">
              <div>
                <span className="lab-badge">
                  <GitPullRequest size={12} style={{ display: 'inline', marginRight: 5 }} />
                  {activePr.prNumber} · opened by {activePr.author}
                </span>
                <h2 style={{ fontSize: '1.22rem', marginTop: 4 }}>{activePr.title}</h2>
              </div>
              {completedPrs.includes(activePr.id) && (
                <span className="track-badge" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                  <CheckCircle2 size={13} style={{ marginRight: 4 }} /> Reviewed (+45 XP)
                </span>
              )}
            </div>

            <div className="lab-body">
              <p style={{ fontSize: '0.92rem', color: 'var(--ink-2)', marginBottom: 12 }}>
                {activePr.summary}
              </p>

              <div className="pr-diff-box mono">
                {activePr.diffLines.map((line) => (
                  <div key={line.num} className={`pr-diff-line ${line.type}`}>
                    <span className="pr-line-num">{line.num}</span>
                    <span className="pr-line-sign">
                      {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                    </span>
                    <span className="pr-line-code">{line.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18 }}>
                <p style={{ fontWeight: 700, fontSize: '0.94rem', marginBottom: 10 }}>
                  {activePr.question}
                </p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {activePr.options.map((opt, idx) => {
                    const selected = (prSelections[activePr.id] || []).includes(idx);
                    const checked = !!prChecked[activePr.id];
                    let cls = 'quiz-option';
                    if (checked) {
                      if (opt.isBug && selected) cls += ' correct';
                      else if (!opt.isBug && selected) cls += ' wrong';
                      else if (opt.isBug && !selected) cls += ' wrong';
                    } else if (selected) {
                      cls += ' selected';
                    }
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={cls}
                        onClick={() => {
                          if (checked) return;
                          setPrSelections((prev) => {
                            const cur = prev[activePr.id] || [];
                            const next = cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx];
                            return { ...prev, [activePr.id]: next };
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={selected}
                          style={{ marginRight: 8 }}
                        />
                        <RichText text={opt.label} />
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const sel = prSelections[activePr.id] || [];
                      const exactMatch = activePr.options.every((opt, i) =>
                        opt.isBug ? sel.includes(i) : !sel.includes(i)
                      );
                      setPrChecked((prev) => ({ ...prev, [activePr.id]: true }));
                      if (exactMatch) {
                        markPrReviewComplete(activePr.id);
                      }
                    }}
                  >
                    Submit PR Review
                  </button>
                  {prChecked[activePr.id] && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        setPrChecked((prev) => ({ ...prev, [activePr.id]: false }));
                        setPrSelections((prev) => ({ ...prev, [activePr.id]: [] }));
                      }}
                    >
                      Try Again
                    </button>
                  )}
                </div>

                {prChecked[activePr.id] && (
                  <div className="callout tip" style={{ marginTop: 14, marginBottom: 0 }}>
                    <div className="callout-title">Senior Engineer Review Comment &amp; Clean Fix</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', marginBottom: 8 }}>
                      <RichText text={activePr.seniorFixSummary} />
                    </p>
                    <pre className="code-pre" style={{ borderRadius: 'var(--radius-sm)' }}>
                      <code>{activePr.fixedSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: GUIDED MULTI-FILE PORTFOLIO PROJECTS */}
      {tab === 'projects' && (
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="pill-tabs">
            {GUIDED_PROJECTS.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                className={`pill-tab ${idx === projIdx ? 'active' : ''}`}
                onClick={() => {
                  setProjIdx(idx);
                  setProjFileIdx(0);
                }}
              >
                Project {p.number}: {p.level}
              </button>
            ))}
          </div>

          <section className="lab-card">
            <div className="lab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="lab-badge">
                  <FolderGit2 size={12} style={{ display: 'inline', marginRight: 5 }} />
                  Portfolio Capstone {activeProject.number} · {activeProject.level} · {activeProject.estimatedWeekendHours}
                </span>
                <h2 style={{ fontSize: '1.25rem', marginTop: 4 }}>{activeProject.title}</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', marginTop: 2 }}>{activeProject.subtitle}</p>
              </div>
              <a
                href={`/capstones/${activeProject.id}.zip`}
                download={`${activeProject.id}.zip`}
                className="btn btn-sm btn-primary"
                style={{ flexShrink: 0, textDecoration: 'none' }}
              >
                <Download size={14} /> Download Starter .zip
              </a>
            </div>

            <div className="lab-body">
              <LiveProjectPlayground key={activeProject.id} projectId={activeProject.id} />

              <PythonLab
                key={activeProject.liveLab.labId}
                labId={activeProject.liveLab.labId}
                title={activeProject.liveLab.title}
                prompt={activeProject.liveLab.prompt}
                starterCode={activeProject.liveLab.starterCode}
                testCode={activeProject.liveLab.testCode}
                solutionCode={activeProject.liveLab.solutionCode}
                hint={activeProject.liveLab.hint}
                packages={activeProject.liveLab.packages}
                xpLabel="Live Project Passed (+60 XP)"
              />

              <VisualDiagramBlock
                diagramId={activeProject.diagramId}
                title={`Architecture Blueprint: ${activeProject.title}`}
                caption="Follow this exact production module layout when building and explaining the project in interviews."
              />

              {/* Build Checklist */}
              <div style={{ marginTop: 16 }}>
                <div className="mono" style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 8 }}>
                  STEP-BY-STEP BUILD CHECKLIST (+20 XP PER MILESTONE)
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {activeProject.steps.map((s) => {
                    const done = completedProjSteps.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`checklist-card checklist-toggle ${done ? 'done' : ''}`}
                        onClick={() => toggleProjectStep(s.id)}
                      >
                        {done ? (
                          <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                        ) : (
                          <Circle size={18} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} />
                        )}
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{s.title}</div>
                          <div style={{ fontSize: '0.83rem', color: 'var(--ink-2)' }}>
                            <RichText text={s.detail} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-file explorer */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <div className="pill-tabs">
                    {activeProject.files.map((f, fIdx) => (
                      <button
                        key={f.filename}
                        type="button"
                        className={`pill-tab ${fIdx === projFileIdx % activeProject.files.length ? 'active' : ''}`}
                        onClick={() => setProjFileIdx(fIdx)}
                      >
                        <FileCode2 size={12} style={{ display: 'inline', marginRight: 5 }} />
                        {f.filename}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => copyText(activeProjectFile.filename, activeProjectFile.content)}
                  >
                    {copiedId === activeProjectFile.filename ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === activeProjectFile.filename ? 'Copied File' : `Copy ${activeProjectFile.filename}`}
                  </button>
                </div>

                <div className="code-card">
                  <div className="code-header">
                    <span>{activeProjectFile.filename}</span>
                    <span>INCLUDED IN .ZIP STARTER KIT</span>
                  </div>
                  <pre className="code-pre">
                    <code>{activeProjectFile.content}</code>
                  </pre>
                </div>
              </div>

              {/* Grading Rubric + Deployment Guide + README Template */}
              <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
                <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  <div className="mono" style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                    GRADING RUBRIC &amp; PASS STANDARDS
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Criterion</th>
                          <th>Weight</th>
                          <th>Passing Bar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeProject.gradingRubric.map((r) => (
                          <tr key={r.criterion}>
                            <td><strong>{r.criterion}</strong></td>
                            <td className="mono">{r.weight}</td>
                            <td><RichText text={r.passBar} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <span className="mono" style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--accent)' }}>
                      LOCAL RUN &amp; CLOUD DEPLOYMENT GUIDE
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => copyText(`${activeProject.id}-readme`, activeProject.readmeTemplate)}
                    >
                      {copiedId === `${activeProject.id}-readme` ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === `${activeProject.id}-readme` ? 'Copied README Template' : 'Copy README Template'}
                    </button>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.86rem', color: 'var(--ink-2)', fontFamily: 'inherit', margin: 0 }}>
                    {activeProject.deploymentGuide}
                  </pre>
                </div>

                {/* Synced Project Journal */}
                <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="mono" style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--accent)' }}>
                      <BookOpen size={13} style={{ display: 'inline', marginRight: 5 }} />
                      PROJECT JOURNAL (WHAT BROKE &amp; HOW YOU FIXED IT — AUTO-SYNCED)
                    </span>
                  </div>
                  <textarea
                    className="input mono"
                    rows={5}
                    style={{ fontSize: '0.82rem' }}
                    value={progress.projectJournals?.[activeProject.id] ?? activeProject.journalTemplate}
                    onChange={(e) => saveProjectJournal(activeProject.id, e.target.value)}
                  />
                </div>
              </div>

              {/* Resume Bullets */}
              <div className="callout interview" style={{ marginTop: 18, marginBottom: 0 }}>
                <div className="callout-title">Resume Bullets Once You Push This Repo</div>
                <ul style={{ paddingLeft: 18, fontSize: '0.88rem', color: 'var(--ink-2)' }}>
                  {activeProject.resumeBullets.map((b, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      <RichText text={b} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: INTERACTIVE PRODUCTION TRACE DEBUGGER */}
      {tab === 'debugger' && (
        <section className="lab-card">
          <div className="lab-header">
            <div>
              <span className="lab-badge">
                <ShieldAlert size={12} style={{ display: 'inline', marginRight: 5 }} />
                Interactive RAG &amp; Agent Trace Debugger
              </span>
              <h2 style={{ fontSize: '1.22rem', marginTop: 4 }}>{activeTrace.title}</h2>
            </div>
            <div className="pill-tabs">
              {TRACE_DEBUGGER_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`pill-tab ${idx === traceIdx ? 'active' : ''}`}
                  onClick={() => {
                    setTraceIdx(idx);
                    setActiveFixes({});
                  }}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="lab-body">
            <div className="slack-quote" style={{ marginBottom: 16 }}>
              <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-muted)' }}>
                INCOMING QUERY (TENANT: {activeTrace.tenant})
              </span>
              <p className="mono" style={{ fontSize: '0.88rem', marginTop: 4 }}>{activeTrace.userQuery}</p>
            </div>

            <div className="mono" style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
              TOGGLE ENGINEERING FIXES BELOW &amp; WATCH THE LIVE TRACE UPDATE:
            </div>
            <div className="fix-toggle-grid">
              {activeTrace.availableFixes.map((fix) => {
                const on = !!activeFixes[fix.id];
                return (
                  <button
                    key={fix.id}
                    type="button"
                    className={`fix-toggle-btn ${on ? 'active' : ''}`}
                    onClick={() => setActiveFixes((prev) => ({ ...prev, [fix.id]: !on }))}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{fix.label}</span>
                      <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                        {on ? 'ON ✓' : 'OFF'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--ink-2)', marginTop: 4, textAlign: 'left' }}>
                      {fix.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Live Stage Trace */}
            <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
              {traceEval.stages.map((st) => (
                <div key={st.name} className={`trace-stage-row ${st.status}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{st.name}</span>
                    <span className={`trace-status-badge ${st.status}`}>
                      {st.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--ink-2)', marginTop: 4 }}>{st.detail}</p>
                </div>
              ))}
            </div>

            {/* Metrics Bar */}
            <div className="trace-metrics-grid" style={{ marginTop: 16 }}>
              <div className="stat-box">
                <div className="stat-val" style={{ color: traceEval.passedAll ? 'var(--success)' : 'var(--danger)' }}>
                  {(traceEval.faithfulness * 100).toFixed(0)}%
                </div>
                <div className="stat-label">Safety / Faithfulness</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{traceEval.latencyMs}ms</div>
                <div className="stat-label">End-to-End Latency</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">${traceEval.costUsd.toFixed(3)}</div>
                <div className="stat-label">Cost Per Request</div>
              </div>
            </div>

            <div className={`callout ${traceEval.passedAll ? 'tip' : 'warning'}`} style={{ marginTop: 16, marginBottom: 0 }}>
              <div className="callout-title">
                {traceEval.passedAll ? 'Production Output Verified ✓' : 'Defective Output in Production'}
              </div>
              <p className="mono" style={{ fontSize: '0.84rem' }}>{traceEval.finalOutput}</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
