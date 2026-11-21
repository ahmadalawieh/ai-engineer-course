'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Cloud, Copy, Download, GitBranch, QrCode, RefreshCw, Upload, X } from 'lucide-react';
import { useCourseApp } from './ThemeProgressProvider';
import { decodePortableToken, encodePortableToken } from '@/lib/progress';
import { generateSyncKey } from '@/lib/syncClient';

export function SyncModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    progress,
    syncConfig,
    syncStatus,
    syncMessage,
    updateSyncConfig,
    runSyncNow,
    pullSyncNow,
    importProgressObject,
    setLearnerName,
  } = useCourseApp();

  const [tab, setTab] = useState<'cloud' | 'gist' | 'portable'>(
    syncConfig.mode === 'github-gist' ? 'gist' : 'cloud'
  );
  const [syncKeyInput, setSyncKeyInput] = useState(syncConfig.syncKey || 'tensor-atlas-4092');
  const [gistTokenInput, setGistTokenInput] = useState(syncConfig.gistToken || '');
  const [gistIdInput, setGistIdInput] = useState(syncConfig.gistId || '');
  const [pasteToken, setPasteToken] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [nameInput, setNameInput] = useState<string | null>(null);
  const effectiveName = nameInput ?? progress.learnerName;

  const portableToken = encodePortableToken(progress);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?sync=${encodeURIComponent(portableToken)}`
      : '';

  useEffect(() => {
    if (!open || tab !== 'portable' || !shareUrl || !qrCanvasRef.current) return;
    QRCode.toCanvas(qrCanvasRef.current, shareUrl, { width: 150, margin: 1 }).catch(() => {});
  }, [open, tab, shareUrl]);

  if (!open) return null;

  const handleConnectCloud = async (action: 'push' | 'pull') => {
    const nextCfg = {
      ...syncConfig,
      mode: 'cloud-kv' as const,
      syncKey: syncKeyInput.trim(),
      autoSync: true,
    };
    updateSyncConfig(nextCfg);
    const res = action === 'push' ? await runSyncNow(nextCfg) : await pullSyncNow(nextCfg);
    setFeedback(res.message);
  };

  const handleConnectGist = async () => {
    const nextCfg = {
      ...syncConfig,
      mode: 'github-gist' as const,
      gistToken: gistTokenInput.trim(),
      gistId: gistIdInput.trim() || undefined,
      autoSync: true,
    };
    updateSyncConfig(nextCfg);
    const res = await runSyncNow(nextCfg);
    setFeedback(res.message);
  };

  const handleImportToken = () => {
    const raw = pasteToken.includes('sync=')
      ? decodeURIComponent(pasteToken.split('sync=')[1].split('&')[0])
      : pasteToken;
    const decoded = decodePortableToken(raw);
    if (!decoded) {
      setFeedback('Invalid sync code or link.');
      return;
    }
    importProgressObject(decoded);
    setPasteToken('');
    setFeedback('Progress merged successfully from Sync Token!');
  };

  const handleJsonDownload = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-mastery-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed.completedLessons)) {
          importProgressObject(parsed);
          setFeedback('Imported & merged JSON backup!');
        } else {
          setFeedback('Invalid progress JSON file.');
        }
      } catch {
        setFeedback('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Sync Progress Across Devices">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Cross-Device Progress Sync</h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
              Status: <strong>{syncStatus === 'synced' ? syncMessage : 'Saved locally in browser'}</strong>
            </p>
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <input
            className="input"
            style={{ flex: '1 1 180px', minWidth: 0 }}
            value={effectiveName}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your Name (for Certificate)"
            aria-label="Learner Name"
          />
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setLearnerName(effectiveName);
              setFeedback('Saved learner name.');
            }}
          >
            Save Name
          </button>
        </div>

        <div className="pill-tabs" style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            type="button"
            className={`pill-tab ${tab === 'cloud' ? 'active' : ''}`}
            style={{ flex: '1 1 110px' }}
            onClick={() => setTab('cloud')}
          >
            <Cloud size={13} style={{ display: 'inline', marginRight: 5 }} />
            Cloud Sync Key
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'gist' ? 'active' : ''}`}
            style={{ flex: '1 1 100px' }}
            onClick={() => setTab('gist')}
          >
            <GitBranch size={13} style={{ display: 'inline', marginRight: 5 }} />
            GitHub Gist
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'portable' ? 'active' : ''}`}
            style={{ flex: '1 1 110px' }}
            onClick={() => setTab('portable')}
          >
            <QrCode size={13} style={{ display: 'inline', marginRight: 5 }} />
            QR / Sync Link
          </button>
        </div>

        {tab === 'cloud' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)' }}>
              Sync seamlessly across devices using a personal Sync Key backed by Vercel KV / Upstash Redis (requires{' '}
              <code className="inline-code">UPSTASH_REDIS_REST_URL</code> &amp;{' '}
              <code className="inline-code">UPSTASH_REDIS_REST_TOKEN</code> env vars on Vercel).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <input
                className="input mono"
                style={{ flex: '1 1 180px', minWidth: 0 }}
                value={syncKeyInput}
                onChange={(e) => setSyncKeyInput(e.target.value)}
                placeholder="e.g. tensor-atlas-4912"
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setSyncKeyInput(generateSyncKey())}
              >
                Random
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleConnectCloud('push')}>
                <RefreshCw size={13} /> Connect &amp; Push
              </button>
              <button type="button" className="btn btn-sm" onClick={() => void handleConnectCloud('pull')}>
                Pull &amp; Merge From Key
              </button>
              {syncConfig.mode !== 'none' && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => updateSyncConfig({ mode: 'none', autoSync: false })}
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        )}

        {tab === 'gist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)' }}>
              Zero-server sync: stores your progress inside a private GitHub Gist directly from your browser. Create a
              classic GitHub token with only the <code className="inline-code">gist</code> scope.
            </p>
            <input
              type="password"
              className="input mono"
              value={gistTokenInput}
              onChange={(e) => setGistTokenInput(e.target.value)}
              placeholder="ghp_... (GitHub PAT with gist scope)"
            />
            <input
              className="input mono"
              value={gistIdInput}
              onChange={(e) => setGistIdInput(e.target.value)}
              placeholder="Optional existing Gist ID (auto-detected if blank)"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleConnectGist()}>
                <GitBranch size={13} /> Sync Private Gist
              </button>
            </div>
          </div>
        )}

        {tab === 'portable' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)' }}>
              Instant zero-setup transfer: scan this QR code on your phone or copy the Sync Link to merge all completed
              lessons, quiz scores, notes, and flashcards onto another device.
            </p>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <canvas
                ref={qrCanvasRef}
                width={150}
                height={150}
                style={{ borderRadius: 8, border: '1px solid var(--border)', background: '#fff', padding: 6 }}
              />
              <div style={{ flex: 1, minWidth: 'min(220px, 100%)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied Sync Link!' : 'Copy Sync Link'}
                </button>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button type="button" className="btn btn-sm" onClick={handleJsonDownload}>
                    <Download size={13} /> Export JSON
                  </button>
                  <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={13} /> Import JSON
                    <input type="file" accept="application/json" hidden onChange={handleJsonUpload} />
                  </label>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <input
                className="input mono"
                style={{ flex: '1 1 180px', minWidth: 0 }}
                value={pasteToken}
                onChange={(e) => setPasteToken(e.target.value)}
                placeholder="Paste Sync Link or AIMC1_... token from another device"
              />
              <button type="button" className="btn btn-sm" onClick={handleImportToken}>
                Merge
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <div
            style={{
              marginTop: 14,
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-2)',
              fontSize: '0.84rem',
            }}
          >
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
