'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Copy, Download, ExternalLink, FileCheck2, Terminal } from 'lucide-react';
import { STUDIO_PHASES, getTicketsByPhase } from '@/data/studioCurriculum';
import { validateCapstoneEvidence } from '@/data/levels';
import type { PhaseId } from '@/types/studio';
import { useCourseApp } from './ThemeProgressProvider';

const REPO_PHASES = STUDIO_PHASES.filter((p) => Boolean(p.repo));

export function ShipVerifyView({
  initialPhaseId = 'system-1',
}: {
  initialPhaseId?: PhaseId;
}) {
  const { progress, saveCapstoneEvidence } = useCourseApp();
  const [selectedPhaseId, setSelectedPhaseId] = useState<PhaseId>(
    initialPhaseId === 'phase-0' ? 'system-1' : initialPhaseId
  );

  const phase = useMemo(
    () => REPO_PHASES.find((p) => p.id === selectedPhaseId) || REPO_PHASES[0],
    [selectedPhaseId]
  );
  const repo = phase.repo!;
  const saved = progress.capstoneEvidence?.[repo.repoId];

  const [repoUrl, setRepoUrl] = useState(saved?.repoUrl || '');
  const [demoUrl, setDemoUrl] = useState(saved?.demoUrl || '');
  const [jsonRaw, setJsonRaw] = useState(saved?.evidenceJsonRaw || '');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const selectSystem = (nextPhaseId: PhaseId) => {
    setSelectedPhaseId(nextPhaseId);
    const nextRepo = REPO_PHASES.find((p) => p.id === nextPhaseId)?.repo;
    const prevSaved = nextRepo ? progress.capstoneEvidence?.[nextRepo.repoId] : undefined;
    setRepoUrl(prevSaved?.repoUrl || '');
    setDemoUrl(prevSaved?.demoUrl || '');
    setJsonRaw(prevSaved?.evidenceJsonRaw || '');
    setFeedback(null);
  };

  const phaseTickets = getTicketsByPhase(phase.id);
  const drillsDone = phaseTickets.filter((t) => (progress.completedTickets || []).includes(t.id)).length;

  const handleVerify = () => {
    if (!repoUrl.trim().startsWith('https://github.com/')) {
      setFeedback({ ok: false, msg: 'Enter a valid public GitHub repository URL (https://github.com/...).' });
      return;
    }
    const effectiveDemo = demoUrl.trim() || 'http://localhost:8000';
    const check = validateCapstoneEvidence(repo.repoId, repoUrl, effectiveDemo, jsonRaw);
    if (!check.valid || !check.parsedSummary) {
      setFeedback({ ok: false, msg: check.error || 'Invalid evidence.json payload.' });
      return;
    }
    saveCapstoneEvidence(repo.repoId, {
      projectId: repo.repoId,
      repoUrl: repoUrl.trim(),
      demoUrl: effectiveDemo,
      evidenceJsonRaw: jsonRaw.trim(),
      validatedAt: Date.now(),
      parsedSummary: check.parsedSummary,
    });
    setFeedback({
      ok: true,
      msg: `Verified ${repo.title}: ${check.parsedSummary.testsPassed} pytest checks passed (p95 ${check.parsedSummary.p95Ms}ms).`,
    });
  };

  const verifiedCount = REPO_PHASES.filter(
    (p) => p.repo && progress.capstoneEvidence?.[p.repo.repoId]?.parsedSummary?.passed
  ).length;

  const copyPortfolioMarkdown = () => {
    const lines = [
      '# Applied AI Software Engineer — Verified Systems Portfolio',
      '',
      ...REPO_PHASES.map((p) => {
        const r = p.repo!;
        const ev = progress.capstoneEvidence?.[r.repoId];
        const status = ev?.parsedSummary?.passed ? `Verified (${ev.repoUrl})` : 'In Progress';
        return `- **${r.title}** (${r.stack}): ${status}`;
      }),
    ];
    void navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 1800);
  };

  return (
    <main className="studio-ship-wrap">
      {/* System Selector Pills */}
      <div className="studio-ship-tabs" role="tablist" aria-label="Production repositories">
        {REPO_PHASES.map((p) => {
          const r = p.repo!;
          const isVerified = Boolean(progress.capstoneEvidence?.[r.repoId]?.parsedSummary?.passed);
          return (
            <button
              key={p.id}
              type="button"
              className={`studio-ship-tab ${p.id === phase.id ? 'active' : ''}`}
              onClick={() => selectSystem(p.id)}
            >
              {isVerified && <CheckCircle2 size={13} color="var(--success)" />}
              <span>{p.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="studio-ship-grid">
        {/* Left: Download & Real Local IDE Workflow */}
        <section className="studio-ship-card">
          <div className="studio-ticket-eyebrow">
            <span>REAL COMPANY / FREELANCE REPO · {drillsDone}/4 DRILLS DONE</span>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 8 }}>{repo.title}</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 14 }}>
            {repo.clientScenario}
          </p>

          <div className="studio-tag-row" style={{ marginBottom: 16 }}>
            <span className="studio-meta-tag">{repo.stack}</span>
          </div>

          <a href={repo.zipUrl} download className="studio-primary-cta" style={{ textDecoration: 'none' }}>
            <Download size={16} />
            <span>Download Starter Repo ({repo.title}.zip)</span>
          </a>

          <div className="studio-section-label" style={{ marginTop: 20 }}>
            <Terminal size={13} style={{ display: 'inline', marginRight: 5 }} />
            Run Locally in Your IDE
          </div>
          <pre className="studio-cheat-pre">
            <code>{repo.localCommands.join('\n')}</code>
          </pre>

          <div className="studio-section-label" style={{ marginTop: 16 }}>
            Deliverables Checked by validator.py
          </div>
          <ul className="studio-criteria-list">
            {repo.deliverables.map((d, i) => (
              <li key={i} className="studio-criteria-item">
                <CheckCircle2 size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 3 }} />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Right: Verify GitHub Repo & evidence.json */}
        <section className="studio-ship-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="studio-ticket-eyebrow" style={{ marginBottom: 0 }}>
              <span>VERIFY DEPLOYMENT &amp; EVIDENCE</span>
            </div>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
              {verifiedCount}/4 Repos Verified
            </span>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <input
              type="url"
              className="input-field"
              placeholder="Public GitHub repo URL (https://github.com/you/...)"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <input
              type="url"
              className="input-field"
              placeholder="Live deployed URL (optional — Railway / Fly / Render)"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
            />
            <textarea
              className="input-field mono"
              rows={6}
              style={{ fontSize: '0.76rem' }}
              placeholder={`Paste JSON from evidence.json generated by python validator.py...`}
              value={jsonRaw}
              onChange={(e) => setJsonRaw(e.target.value)}
            />

            <button type="button" className="btn btn-primary" onClick={handleVerify}>
              <FileCheck2 size={15} /> Validate &amp; Save Evidence
            </button>
          </div>

          {feedback && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: '0.82rem',
                background: feedback.ok ? 'var(--success-soft)' : 'var(--danger-soft)',
                color: feedback.ok ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {feedback.msg}
            </div>
          )}

          {saved?.parsedSummary?.passed && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
              }}
            >
              <span>
                <CheckCircle2 size={14} color="var(--success)" style={{ display: 'inline', marginRight: 6 }} />
                Verified ({saved.parsedSummary.testsPassed} tests passed)
              </span>
              <a
                href={saved.repoUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                GitHub <ExternalLink size={12} />
              </a>
            </div>
          )}

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              Export verified repos for your CV / freelance proposals
            </span>
            <button type="button" className="btn btn-sm" onClick={copyPortfolioMarkdown}>
              <Copy size={13} /> {copiedSummary ? 'Copied!' : 'Copy Portfolio MD'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
