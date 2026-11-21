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

  const [tab, setTab] = useState<'direct' | 'cloud' | 'gist'>(
    syncConfig.mode === 'github-gist' ? 'gist' : syncConfig.mode === 'cloud-kv' ? 'cloud' : 'direct'
  );
  const [syncKeyInput, setSyncKeyInput] = useState(syncConfig.syncKey || 'tensor-atlas-4092');
  const [gistTokenInput, setGistTokenInput] = useState(syncConfig.gistToken || '');
  const [gistIdInput, setGistIdInput] = useState(syncConfig.gistId || '');
  const [pasteToken, setPasteToken] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const qrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [nameInput, setNameInput] = useState<string | null>(null);
  const effectiveName = nameInput ?? progress.learnerName;

  const portableToken = encodePortableToken(progress);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}#sync=${encodeURIComponent(portableToken)}`
      : '';

  useEffect(() => {
    if (!open || tab !== 'direct' || !shareUrl || !qrCanvasRef.current) return;
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
    const decoded = decodePortableToken(pasteToken);
    if (!decoded) {
      setFeedback('Invalid sync code or link. Paste an AIMC1_... code or full Direct Sync Link.');
      return;
    }
    importProgressObject(decoded);
    setPasteToken('');
    setFeedback('Progress merged successfully! Both devices are now up to date.');
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
            <h2 style={{ fontSize: '1.35rem' }}>Sync Progress Across Devices</h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
              Status: <strong>{syncStatus === 'synced' ? syncMessage : 'Auto-saved in browser + ready to transfer'}</strong>
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
            className={`pill-tab ${tab === 'direct' ? 'active' : ''}`}
            style={{ flex: '1 1 110px' }}
            onClick={() => setTab('direct')}
          >
            <QrCode size={13} style={{ display: 'inline', marginRight: 5 }} />
            Direct Sync (1-Click)
          </button>
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
        </div>

        {tab === 'direct' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)' }}>
              <strong>Zero-setup direct sync:</strong> scan the QR code on your phone, send yourself the Direct Sync
              Link, or copy your Sync Code below. Opening it on another device merges all lessons, lab drafts, quizzes,
              notes, and flashcards automatically.
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
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                >
                  {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                  {copiedLink ? 'Copied Direct Sync Link!' : 'Copy Direct Sync Link'}
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(portableToken);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  {copiedCode ? 'Copied Sync Code!' : 'Copy Sync Code (AIMC1_...)'}
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
                placeholder="Paste Direct Sync Link or AIMC1_... code to merge"
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={handleImportToken}>
                Merge Now
              </button>
            </div>
          </div>
        )}

        {tab === 'cloud' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)' }}>
              Auto-syncs in the background using a personal Sync Key backed by Vercel KV / Upstash Redis (requires{' '}
              <code className="inline-code">UPSTASH_REDIS_REST_URL</code> &amp;{' '}
              <code className="inline-code">UPSTASH_REDIS_REST_TOKEN</code> env vars on Vercel). Without Redis, use the{' '}
              <strong>Direct Sync (1-Click)</strong> tab.
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
