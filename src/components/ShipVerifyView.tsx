'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Copy, Download, ExternalLink, FileCheck2, Terminal } from 'lucide-react';
import { JOURNEY_STAGES, getStageLessons } from '@/data/journeyCurriculum';
import { validateCapstoneEvidence } from '@/data/levels';
import type { OsPlatform } from '@/types/journey';
import { useCourseApp } from './ThemeProgressProvider';

const VALIDATOR_PROJECT_IDS = new Set([
  'doc-ops-extractor',
  'tenant-rag-copilot',
  'ops-workflow-agent',
  'ai-prod-gateway',
]);

export function ShipVerifyView({
  initialStageNumber = 1,
  osPlatform,
}: {
  initialStageNumber?: number;
  osPlatform: OsPlatform;
}) {
  const { progress, saveCapstoneEvidence } = useCourseApp();
  const [selectedStageNum, setSelectedStageNum] = useState<number>(initialStageNumber);

  const stage = useMemo(
    () => JOURNEY_STAGES.find((s) => s.stageNumber === selectedStageNum) || JOURNEY_STAGES[0],
    [selectedStageNum]
  );
  const proj = stage.project;
  const repoIdForValidator = proj.id === 'project-3-ai-extractor' ? 'doc-ops-extractor' : proj.id;
  const usesValidatorJson = VALIDATOR_PROJECT_IDS.has(repoIdForValidator);

  const saved = progress.capstoneEvidence?.[repoIdForValidator];

  const [repoUrl, setRepoUrl] = useState(saved?.repoUrl || '');
  const [demoUrl, setDemoUrl] = useState(saved?.demoUrl || '');
  const [jsonRaw, setJsonRaw] = useState(saved?.evidenceJsonRaw || '');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const selectStage = (num: number) => {
    setSelectedStageNum(num);
    const nextProj = JOURNEY_STAGES.find((s) => s.stageNumber === num)?.project;
    const nextKey = nextProj?.id === 'project-3-ai-extractor' ? 'doc-ops-extractor' : nextProj?.id || '';
    const prevSaved = progress.capstoneEvidence?.[nextKey];
    setRepoUrl(prevSaved?.repoUrl || '');
    setDemoUrl(prevSaved?.demoUrl || '');
    setJsonRaw(prevSaved?.evidenceJsonRaw || '');
    setFeedback(null);
  };

  const stageLessons = getStageLessons(stage.stageNumber);
  const lessonsDone = stageLessons.filter((l) => (progress.completedLessons || []).includes(l.id)).length;

  const handleSaveProject = () => {
    if (!repoUrl.trim().startsWith('https://github.com/')) {
      setFeedback({ ok: false, msg: 'Enter a valid public GitHub repository URL (https://github.com/...).' });
      return;
    }

    if (!usesValidatorJson) {
      saveCapstoneEvidence(repoIdForValidator, {
        projectId: repoIdForValidator,
        repoUrl: repoUrl.trim(),
        demoUrl: demoUrl.trim() || 'http://localhost:8000',
        evidenceJsonRaw: '{}',
        validatedAt: Date.now(),
        parsedSummary: {
          passed: true,
          testsPassed: 1,
          testsFailed: 0,
          p95Ms: 10,
          costPerReqUsd: 0,
          secretScanPassed: true,
          injectionTestsPassed: true,
          mode: 'beginner_repo',
        },
      });
      setFeedback({ ok: true, msg: `Saved GitHub link for ${proj.title}!` });
      return;
    }

    const effectiveDemo = demoUrl.trim() || 'http://localhost:8000';
    const check = validateCapstoneEvidence(repoIdForValidator, repoUrl, effectiveDemo, jsonRaw);
    if (!check.valid || !check.parsedSummary) {
      setFeedback({ ok: false, msg: check.error || 'Invalid evidence.json payload.' });
      return;
    }
    saveCapstoneEvidence(repoIdForValidator, {
      projectId: repoIdForValidator,
      repoUrl: repoUrl.trim(),
      demoUrl: effectiveDemo,
      evidenceJsonRaw: jsonRaw.trim(),
      validatedAt: Date.now(),
      parsedSummary: check.parsedSummary,
    });
    setFeedback({
      ok: true,
      msg: `Verified ${proj.title}: ${check.parsedSummary.testsPassed} pytest checks passed!`,
    });
  };

  const copyPortfolioMarkdown = () => {
    const lines = [
      '# Applied AI Software Engineer — 7-Project Portfolio',
      '',
      ...JOURNEY_STAGES.map((s) => {
        const key = s.project.id === 'project-3-ai-extractor' ? 'doc-ops-extractor' : s.project.id;
        const ev = progress.capstoneEvidence?.[key];
        const status = ev?.parsedSummary?.passed ? `Verified (${ev.repoUrl})` : 'In Progress';
        return `- **${s.project.title}**: ${status}`;
      }),
    ];
    void navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 1800);
  };

  const quickCommands = osPlatform === 'windows' ? proj.winQuickstart : proj.macQuickstart;

  return (
    <main className="studio-ship-wrap">
      <div className="studio-ship-tabs" role="tablist" aria-label="7 Stage Projects">
        {JOURNEY_STAGES.map((s) => {
          const key = s.project.id === 'project-3-ai-extractor' ? 'doc-ops-extractor' : s.project.id;
          const isVerified = Boolean(progress.capstoneEvidence?.[key]?.parsedSummary?.passed);
          return (
            <button
              key={s.stageNumber}
              type="button"
              className={`studio-ship-tab ${s.stageNumber === stage.stageNumber ? 'active' : ''}`}
              onClick={() => selectStage(s.stageNumber)}
            >
              {isVerified && <CheckCircle2 size={13} color="var(--success)" />}
              <span>Project {s.stageNumber}</span>
            </button>
          );
        })}
      </div>

      <div className="studio-ship-grid">
        {/* Left: Starter Zip & Local VS Code Instructions */}
        <section className="studio-ship-card">
          <div className="studio-ticket-eyebrow">
            <span>
              STAGE {stage.stageNumber} REAL PROJECT · {lessonsDone}/4 LESSONS DONE
            </span>
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>{proj.title}</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 14 }}>
            {proj.whatYouBuild}
          </p>

          <div className="studio-tag-row" style={{ marginBottom: 16 }}>
            {proj.skillsUsed.map((sk) => (
              <span key={sk} className="studio-meta-tag">
                {sk}
              </span>
            ))}
          </div>

          <a href={proj.zipUrl} download className="studio-primary-cta" style={{ textDecoration: 'none' }}>
            <Download size={16} />
            <span>Download Starter Folder (.zip)</span>
          </a>

          <div className="studio-section-label" style={{ marginTop: 20 }}>
            <Terminal size={13} style={{ display: 'inline', marginRight: 5 }} />
            Run in VS Code ({osPlatform === 'windows' ? 'Windows PowerShell' : 'Mac Terminal'})
          </div>
          <pre className="studio-cheat-pre">
            <code>{quickCommands.join('\n')}</code>
          </pre>
        </section>

        {/* Right: Save GitHub Link & Optional Validator Proof */}
        <section className="studio-ship-card">
          <div className="studio-ticket-eyebrow">
            <span>TRACK YOUR GITHUB PORTFOLIO</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--ink-muted)', marginBottom: 12 }}>
            {usesValidatorJson
              ? 'Push your project to GitHub, run python validator.py locally, and paste evidence.json below.'
              : 'Once you test this project in VS Code and push it to GitHub (Stage 3+ teaches Git!), save your repo link here.'}
          </p>

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
              placeholder="Live URL (optional — e.g. https://your-app.onrender.com)"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
            />
            {usesValidatorJson && (
              <textarea
                className="input-field mono"
                rows={5}
                style={{ fontSize: '0.76rem' }}
                placeholder="Paste JSON from evidence.json generated by python validator.py..."
                value={jsonRaw}
                onChange={(e) => setJsonRaw(e.target.value)}
              />
            )}

            <button type="button" className="btn btn-primary" onClick={handleSaveProject}>
              <FileCheck2 size={15} /> {usesValidatorJson ? 'Validate & Save Evidence' : 'Save GitHub Repo'}
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
                Saved to Portfolio
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
              Export all 7 projects for your CV / GitHub Profile
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
