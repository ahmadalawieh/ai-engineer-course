'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { ALL_JOURNEY_LESSONS, getJourneyLessonById } from '@/data/journeyCurriculum';
import { runPythonCode } from '@/lib/pyodideRunner';
import type { OsPlatform } from '@/types/journey';
import { useCourseApp } from './ThemeProgressProvider';

type StepIndex = 1 | 2 | 3 | 4;

function buildSqlRunner(userSql: string, setupCode?: string): string {
  const encodedSql = JSON.stringify(userSql);
  return `import sqlite3
conn = sqlite3.connect(":memory:")
${setupCode || ''}
user_sql = ${encodedSql}
cur = conn.cursor()
cur.execute(user_sql)
rows = cur.fetchall()
for r in rows:
    print(" | ".join(str(v) for v in r))
`;
}

export function StepLessonPlayerView({
  lessonId,
  osPlatform,
  onChangeOs,
  onBackPath,
  onSelectLesson,
  onOpenProject,
}: {
  lessonId: string;
  osPlatform: OsPlatform;
  onChangeOs: (os: OsPlatform) => void;
  onBackPath: () => void;
  onSelectLesson: (nextId: string) => void;
  onOpenProject: (stageNum: number) => void;
}) {
  const { progress, markLessonComplete, saveLabDraft, clearLabDraft } = useCourseApp();

  const lesson = useMemo(() => getJourneyLessonById(lessonId) || ALL_JOURNEY_LESSONS[0], [lessonId]);
  const lessonIdx = ALL_JOURNEY_LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson =
    lessonIdx >= 0 && lessonIdx < ALL_JOURNEY_LESSONS.length - 1 ? ALL_JOURNEY_LESSONS[lessonIdx + 1] : null;
  const endsStage = !nextLesson || nextLesson.stageNumber !== lesson.stageNumber;

  const [step, setStep] = useState<StepIndex>(1);
  const [checkedSetup, setCheckedSetup] = useState<Record<number, boolean>>({});
  const [showFix, setShowFix] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedProj, setCopiedProj] = useState(false);

  // Practice Step state
  const draftKey = `journey_${lesson.id}`;
  const isLessonDone = (progress.completedLessons || []).includes(lesson.id);

  const [showWarmUp, setShowWarmUp] = useState(false);
  const [warmUpOutput, setWarmUpOutput] = useState<string>('');
  const [localCode, setLocalCode] = useState<string | null>(null);
  const code = localCode ?? progress.labDrafts?.[draftKey] ?? lesson.practice.starterCode;

  const [hintCount, setHintCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [hasError, setHasError] = useState(false);

  const updateCode = (val: string) => {
    setLocalCode(val);
    saveLabDraft(draftKey, val);
  };

  const runWarmUp = async () => {
    const exec =
      lesson.practice.language === 'sql'
        ? buildSqlRunner(lesson.practice.warmUpCode, lesson.practice.setupCode)
        : lesson.practice.warmUpCode;
    const res = await runPythonCode(exec, undefined, []);
    setWarmUpOutput((res.stdout || res.stderr || 'Ran cleanly!').trim());
  };

  const runPractice = async () => {
    setRunning(true);
    setHasError(false);
    setOutput('');
    setPassMsg('');

    const exec =
      lesson.practice.language === 'sql'
        ? buildSqlRunner(code, lesson.practice.setupCode)
        : code;

    const res = await runPythonCode(exec, lesson.practice.testCode, []);
    setRunning(false);

    const lines = (res.stdout || '').split('\n');
    const cleanOut: string[] = [];
    let foundPass = '';
    for (const line of lines) {
      if (line.startsWith('CHECK_PASS|')) {
        foundPass = line.replace('CHECK_PASS|', '');
      } else if (line.trim()) {
        cleanOut.push(line);
      }
    }

    if (res.ok && res.passedTests) {
      setPassMsg(foundPass || 'Practice passed!');
      setOutput(cleanOut.join('\n'));
    } else {
      setHasError(true);
      const errText = (res.stderr || cleanOut.join('\n') || 'Check the hint below and try again.')
        .split('\n')
        .slice(-5)
        .join('\n');
      setOutput(errText);
    }
  };

  const osGuide = osPlatform === 'windows' ? lesson.pcSetup.windows : lesson.pcSetup.mac;

  const stepLabels: { n: StepIndex; label: string }[] = [
    { n: 1, label: '1. Plain-English Idea' },
    { n: 2, label: '2. On Your PC' },
    { n: 3, label: '3. Try It Here' },
    { n: 4, label: '4. Real Project' },
  ];

  return (
    <main className="player-wrap">
      {/* Compact Lesson Top Bar */}
      <div className="player-topbar">
        <button type="button" className="btn btn-sm btn-ghost" onClick={onBackPath}>
          <ArrowLeft size={14} /> My Path
        </button>

        <div className="player-lesson-title">
          <span className="mono" style={{ color: 'var(--accent)', marginRight: 8 }}>
            {lesson.lessonNumber}
          </span>
          <span>{lesson.title}</span>
        </div>

        <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
          Step {step} of 4
        </span>
      </div>

      {/* 4-Step Single-Card Switcher */}
      <div className="player-step-pills" role="tablist" aria-label="Lesson steps">
        {stepLabels.map((s) => (
          <button
            key={s.n}
            type="button"
            role="tab"
            aria-selected={step === s.n}
            className={`player-step-pill ${step === s.n ? 'active' : ''}`}
            onClick={() => setStep(s.n)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* =========================================================
          STEP 1 CARD: PLAIN-ENGLISH IDEA
         ========================================================= */}
      {step === 1 && (
        <section className="player-card" aria-label="Step 1: Plain-English Idea">
          <div className="studio-ticket-eyebrow">
            <span>STEP 1 OF 4 · PLAIN-ENGLISH IDEA</span>
          </div>
          <h1 className="player-card-h1">{lesson.concept.headline}</h1>

          <div className="player-prose">
            {lesson.concept.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="player-analogy-box">
            <div className="player-analogy-title">
              <Lightbulb size={15} color="var(--accent)" />
              <span>Connects to What You Already Know: {lesson.concept.analogy.fromKnown}</span>
            </div>
            <p>{lesson.concept.analogy.explanation}</p>
          </div>

          <div className="studio-flow-box" style={{ justifyContent: 'center', marginTop: 18 }}>
            {lesson.concept.visualFlow.map((node, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="studio-flow-arrow">→</span>}
                <span className="studio-flow-node">{node}</span>
              </React.Fragment>
            ))}
          </div>

          {lesson.concept.proTerm && (
            <div className="player-proterm">
              <span className="mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                Resume Word — {lesson.concept.proTerm.term}:
              </span>{' '}
              <span>{lesson.concept.proTerm.plainMeaning}</span>
            </div>
          )}

          <div className="player-card-footer">
            <span />
            <button type="button" className="btn btn-primary btn-glow" onClick={() => setStep(2)}>
              Next: On Your PC <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================
          STEP 2 CARD: ON YOUR PC (WINDOWS / MAC)
         ========================================================= */}
      {step === 2 && (
        <section className="player-card" aria-label="Step 2: On Your PC">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <div className="studio-ticket-eyebrow" style={{ marginBottom: 0 }}>
              <span>STEP 2 OF 4 · ON YOUR COMPUTER</span>
            </div>

            <div className="dev-track-pill" role="group" aria-label="Operating system">
              <button
                type="button"
                className={`dev-track-btn ${osPlatform === 'windows' ? 'active' : ''}`}
                onClick={() => onChangeOs('windows')}
              >
                Windows (PowerShell)
              </button>
              <button
                type="button"
                className={`dev-track-btn ${osPlatform === 'mac' ? 'active' : ''}`}
                onClick={() => onChangeOs('mac')}
              >
                Mac (Terminal)
              </button>
            </div>
          </div>

          <h2 className="player-card-h1">{lesson.pcSetup.title}</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--ink-2)', marginBottom: 16 }}>
            {lesson.pcSetup.summary}
          </p>

          {lesson.pcSetup.checklist && (
            <div className="player-checklist">
              {lesson.pcSetup.checklist.map((item, idx) => (
                <label key={idx} className="player-check-row">
                  <input
                    type="checkbox"
                    checked={Boolean(checkedSetup[idx])}
                    onChange={(e) => setCheckedSetup((prev) => ({ ...prev, [idx]: e.target.checked }))}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          )}

          <div className="studio-editor-card" style={{ marginTop: 14 }}>
            <div className="studio-editor-header">
              <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                <Terminal size={12} style={{ display: 'inline', marginRight: 5 }} />
                {osPlatform === 'windows' ? 'Windows PowerShell' : 'macOS Terminal'}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                onClick={() => {
                  void navigator.clipboard.writeText(osGuide.commands.join('\n'));
                  setCopiedCmd(true);
                  setTimeout(() => setCopiedCmd(false), 1600);
                }}
              >
                {copiedCmd ? <Check size={12} /> : <Copy size={12} />}
                {copiedCmd ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="studio-cheat-pre" style={{ border: 'none', borderRadius: 0 }}>
              <code>{osGuide.commands.join('\n')}</code>
            </pre>
          </div>

          <div className="player-what-you-see">
            <strong>What you should see:</strong> {osGuide.whatYouSee}
          </div>

          <button
            type="button"
            className="studio-cheat-toggle"
            style={{ marginTop: 12 }}
            onClick={() => setShowFix((prev) => !prev)}
          >
            <span>Got an error on your PC? Common 10-second fix</span>
            {showFix ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showFix && (
            <p style={{ fontSize: '0.84rem', color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.5 }}>
              {osGuide.commonFix}
            </p>
          )}

          <div className="player-card-footer">
            <button type="button" className="btn" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> Back
            </button>
            <button type="button" className="btn btn-primary btn-glow" onClick={() => setStep(3)}>
              Next: Try It Here <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================
          STEP 3 CARD: GUIDED PRACTICE PLAYGROUND
         ========================================================= */}
      {step === 3 && (
        <section className="player-card" aria-label="Step 3: Try It Here">
          <div className="studio-ticket-eyebrow">
            <span>STEP 3 OF 4 · INTERACTIVE PRACTICE</span>
            {(Boolean(passMsg) || isLessonDone) && (
              <span className="studio-done-pill">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
          </div>

          {/* Optional Zero-Panic Warm-Up Example */}
          <div className="player-warmup-box">
            <button
              type="button"
              className="studio-cheat-toggle"
              onClick={() => setShowWarmUp((prev) => !prev)}
            >
              <span>Want to watch a tiny working example first?</span>
              {showWarmUp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showWarmUp && (
              <div style={{ marginTop: 10 }}>
                <pre className="studio-cheat-pre">
                  <code>{lesson.practice.warmUpCode}</code>
                </pre>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{lesson.practice.warmUpNote}</span>
                  <button type="button" className="btn btn-sm" onClick={() => void runWarmUp()}>
                    <Play size={12} /> Run Example
                  </button>
                </div>
                {warmUpOutput && (
                  <pre className="studio-cheat-pre" style={{ marginTop: 8 }}>
                    <code>Output: {warmUpOutput}</code>
                  </pre>
                )}
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--ink)', fontWeight: 500, margin: '16px 0 12px', lineHeight: 1.55 }}>
            {lesson.practice.taskPrompt}
          </p>

          <div className="studio-editor-card">
            <div className="studio-editor-header">
              <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                {lesson.practice.language === 'sql' ? 'SQLite Playground' : 'Python 3.12 Playground'}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                  onClick={() => setHintCount((c) => Math.min(2, c + 1))}
                >
                  <HelpCircle size={12} /> Hint {hintCount > 0 ? `(${hintCount}/2)` : ''}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                  onClick={() => updateCode(lesson.practice.solutionCode)}
                >
                  <Eye size={12} /> Solution
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                  onClick={() => {
                    setLocalCode(lesson.practice.starterCode);
                    clearLabDraft(draftKey);
                    setOutput('');
                    setPassMsg('');
                    setHasError(false);
                  }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            </div>

            <textarea
              className="studio-code-textarea"
              style={{ minHeight: 190 }}
              value={code}
              onChange={(e) => updateCode(e.target.value)}
              spellCheck={false}
              aria-label="Interactive practice editor"
            />
          </div>

          {hintCount > 0 && (
            <div className="player-analogy-box" style={{ marginTop: 12 }}>
              {lesson.practice.hints.slice(0, hintCount).map((h, idx) => (
                <p key={idx} style={{ marginTop: idx > 0 ? 6 : 0 }}>
                  <strong>Hint {idx + 1}:</strong> {h}
                </p>
              ))}
            </div>
          )}

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-glow"
              disabled={running}
              onClick={() => void runPractice()}
            >
              <Play size={14} /> {running ? 'Running...' : 'Run Practice'}
            </button>

            {passMsg && (
              <span className="studio-done-pill" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <CheckCircle2 size={14} /> {passMsg}
              </span>
            )}
          </div>

          {output && (
            <pre className={hasError ? 'studio-error-pre' : 'studio-cheat-pre'} style={{ marginTop: 12 }}>
              <code>{output}</code>
            </pre>
          )}

          <div className="player-card-footer">
            <button type="button" className="btn" onClick={() => setStep(2)}>
              <ArrowLeft size={14} /> Back
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(4)}>
              Next: Add to Real Project <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================
          STEP 4 CARD: ADD TO YOUR REAL PROJECT
         ========================================================= */}
      {step === 4 && (
        <section className="player-card" aria-label="Step 4: Add to Your Real Project">
          <div className="studio-ticket-eyebrow">
            <span>STEP 4 OF 4 · {lesson.projectStep.projectTitle}</span>
          </div>
          <h2 className="player-card-h1">Save &amp; Run on Your Computer</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--ink-2)', marginBottom: 14 }}>
            {lesson.projectStep.summary}
          </p>

          <div className="studio-editor-card">
            <div className="studio-editor-header">
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                {lesson.projectStep.fileName}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                onClick={() => {
                  void navigator.clipboard.writeText(lesson.projectStep.codeSnippet);
                  setCopiedProj(true);
                  setTimeout(() => setCopiedProj(false), 1600);
                }}
              >
                {copiedProj ? <Check size={12} /> : <Copy size={12} />}
                {copiedProj ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="studio-cheat-pre" style={{ border: 'none', borderRadius: 0 }}>
              <code>{lesson.projectStep.codeSnippet}</code>
            </pre>
          </div>

          <div className="player-what-you-see" style={{ marginTop: 14 }}>
            <strong>Run in terminal:</strong>{' '}
            <code className="mono">
              {osPlatform === 'windows' ? lesson.projectStep.runCommandWin : lesson.projectStep.runCommandMac}
            </code>
          </div>

          <div className="player-card-footer">
            <button type="button" className="btn" onClick={() => setStep(3)}>
              <ArrowLeft size={14} /> Back
            </button>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {endsStage && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    markLessonComplete(lesson.id);
                    onOpenProject(lesson.stageNumber);
                  }}
                >
                  Open Stage {lesson.stageNumber} Starter Zip
                </button>
              )}

              <button
                type="button"
                className="btn btn-primary btn-glow"
                onClick={() => {
                  markLessonComplete(lesson.id);
                  if (nextLesson) {
                    setStep(1);
                    onSelectLesson(nextLesson.id);
                  } else {
                    onOpenProject(7);
                  }
                }}
              >
                <CheckCircle2 size={15} />
                {nextLesson
                  ? `Complete & Next: ${nextLesson.lessonNumber}`
                  : 'Finish Course & Open Capstone'}
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
