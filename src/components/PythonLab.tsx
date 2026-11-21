'use client';

import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, Play, RotateCcw, Terminal, Eye } from 'lucide-react';
import { runPythonCode } from '@/lib/pyodideRunner';
import { useCourseApp } from './ThemeProgressProvider';
import { RichText } from './MathAndProse';

interface PythonLabProps {
  labId: string;
  title: string;
  prompt: string;
  starterCode: string;
  testCode: string;
  solutionCode: string;
  hint: string;
  packages?: string[];
}

export function PythonLab({
  labId,
  title,
  prompt,
  starterCode,
  testCode,
  solutionCode,
  hint,
  packages = ['numpy'],
}: PythonLabProps) {
  const { progress, markLabComplete } = useCourseApp();
  const isCompleted = progress.completedLabs.includes(labId);

  const [code, setCode] = useState(starterCode);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [passed, setPassed] = useState(isCompleted);
  const [showHint, setShowHint] = useState(false);

  const handleRun = async (withTests: boolean) => {
    setRunning(true);
    setHasError(false);
    setOutput('');
    const res = await runPythonCode(
      code,
      withTests ? testCode : undefined,
      packages,
      (msg) => setStatusMsg(msg)
    );
    setRunning(false);
    setStatusMsg('');

    const combined = [res.stdout, res.stderr].filter(Boolean).join('\n');
    setOutput(combined || (res.ok ? '(Executed with no printed output)' : 'Error running code.'));
    setHasError(!res.ok);

    if (withTests && res.ok && res.passedTests) {
      setPassed(true);
      markLabComplete(labId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleRun(true);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = code.slice(0, start) + '    ' + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div className="lab-card block" id={`lab-${labId}`}>
      <div className="lab-header">
        <div>
          <span className="lab-badge">
            <Terminal size={12} style={{ display: 'inline', marginRight: 5 }} />
            In-Browser Python + {packages.length ? packages.join(', ') : 'Stdlib'} Lab
          </span>
          <h3 style={{ fontSize: '1.08rem', marginTop: 2 }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(passed || isCompleted) && (
            <span
              className="track-badge"
              style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
            >
              <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Passed (+60 XP)
            </span>
          )}
        </div>
      </div>

      <div className="lab-body">
        <p style={{ fontSize: '0.92rem', color: 'var(--ink-2)', marginBottom: 12 }}>
          <RichText text={prompt} />
        </p>

        <textarea
          aria-label={title}
          className="python-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => void handleRun(true)}
              disabled={running}
              id={`check-${labId}`}
            >
              <Play size={13} />
              {running ? 'Running...' : 'Check Solution (Ctrl+Enter)'}
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => void handleRun(false)}
              disabled={running}
              id={`run-${labId}`}
            >
              Run Scratchpad
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowHint((v) => !v)}
            >
              <HelpCircle size={13} />
              {showHint ? 'Hide Hint' : 'Hint'}
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setCode(solutionCode)}
            >
              <Eye size={13} />
              Solution
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setCode(starterCode);
                setOutput('');
                setHasError(false);
              }}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
          {statusMsg && (
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{statusMsg}</span>
          )}
        </div>

        {showHint && (
          <div
            style={{
              marginTop: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-2)',
              fontSize: '0.86rem',
              color: 'var(--ink-2)',
            }}
          >
            <strong>Hint:</strong> <RichText text={hint} />
          </div>
        )}

        {output && (
          <pre className={`lab-console ${hasError ? 'error' : ''}`}>{output}</pre>
        )}
      </div>
    </div>
  );
}
