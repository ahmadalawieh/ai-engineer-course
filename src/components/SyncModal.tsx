'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Cloud, Copy, Download, GitBranch, LogOut, QrCode, RefreshCw, Upload, X } from 'lucide-react';
import { useCourseApp } from './ThemeProgressProvider';
import { decodePortableToken, encodePortableToken } from '@/lib/progress';
import { generateSyncKey } from '@/lib/syncClient';

function GoogleLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

export function SyncModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    progress,
    syncConfig,
    syncStatus,
    syncMessage,
    authUser,
    authEnv,
    authNotice,
    signOutGoogle,
    updateSyncConfig,
    runSyncNow,
    pullSyncNow,
    importProgressObject,
    setLearnerName,
  } = useCourseApp();

  const [tab, setTab] = useState<'google' | 'direct' | 'cloud' | 'gist'>(
    syncConfig.mode === 'github-gist' ? 'gist' : syncConfig.mode === 'cloud-kv' ? 'cloud' : 'google'
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
  const callbackUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/google/callback`
      : 'https://ai-engineer-course-one.vercel.app/api/auth/google/callback';

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
              Status: <strong>{syncStatus === 'synced' ? syncMessage : 'Auto-saved in browser + ready to sync'}</strong>
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
            className={`pill-tab ${tab === 'google' ? 'active' : ''}`}
            style={{ flex: '1 1 115px' }}
            onClick={() => setTab('google')}
          >
            <GoogleLogo />
            <span style={{ marginLeft: 5 }}>Google Sync</span>
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'direct' ? 'active' : ''}`}
            style={{ flex: '1 1 110px' }}
            onClick={() => setTab('direct')}
          >
            <QrCode size={13} style={{ display: 'inline', marginRight: 5 }} />
            Link / QR
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'cloud' ? 'active' : ''}`}
            style={{ flex: '1 1 100px' }}
            onClick={() => setTab('cloud')}
          >
            <Cloud size={13} style={{ display: 'inline', marginRight: 5 }} />
            Sync Key
          </button>
          <button
            type="button"
            className={`pill-tab ${tab === 'gist' ? 'active' : ''}`}
            style={{ flex: '1 1 95px' }}
            onClick={() => setTab('gist')}
          >
            <GitBranch size={13} style={{ display: 'inline', marginRight: 5 }} />
            Gist
          </button>
        </div>

        {tab === 'google' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {authUser ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{authUser.name}</div>
                  <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                    {authUser.email}
                  </div>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink-2)' }}>
                  Signed in with Google. Every lesson, lab draft, quiz score, and flashcard automatically syncs across
                  your devices whenever you sign in with this Google account.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      const res = await runSyncNow();
                      setFeedback(res.message);
                    }}
                  >
                    <RefreshCw size={13} /> Sync Now
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={async () => {
                      await signOutGoogle();
                      setFeedback('Signed out of Google. Local progress remains saved.');
                    }}
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
                  Sign in once with Google on your laptop and phone—your lessons, Python/SQL lab drafts, and XP stay in
                  sync automatically with no codes or links to copy.
                </p>

                {authNotice && (
                  <div
                    style={{
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--warning-soft)',
                      color: 'var(--warning)',
                      fontSize: '0.82rem',
                    }}
                  >
                    {authNotice}
                  </div>
                )}

                {authEnv.googleConfigured && authEnv.kvConfigured ? (
                  <div>
                    <a href="/api/auth/google" className="btn btn-primary" style={{ width: '100%' }}>
                      <GoogleLogo />
                      <span>Continue with Google</span>
                    </a>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      fontSize: '0.83rem',
                      color: 'var(--ink-2)',
                    }}
                  >
                    <strong>1-Time Vercel Setup to Enable Google Sign-In:</strong>
                    <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <li>
                        In Google Cloud Console → OAuth Client (Web), add Authorized Redirect URI:{' '}
                        <code className="inline-code">{callbackUrl}</code>
                      </li>
                      <li>
                        In Vercel Project Settings → Environment Variables, add{' '}
                        <code className="inline-code">GOOGLE_CLIENT_ID</code>,{' '}
                        <code className="inline-code">GOOGLE_CLIENT_SECRET</code>, and{' '}
                        <code className="inline-code">AUTH_SECRET</code>
                      </li>
                      <li>
                        Connect <strong>Upstash Redis</strong> (or add{' '}
                        <code className="inline-code">UPSTASH_REDIS_REST_URL</code> &amp;{' '}
                        <code className="inline-code">UPSTASH_REDIS_REST_TOKEN</code>) and redeploy.
                      </li>
                    </ol>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setTab('direct')}>
                        <QrCode size={13} /> Use Instant Link / QR Sync Now
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'direct' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)' }}>
              <strong>Zero-setup transfer:</strong> scan the QR code on your phone, send yourself the Direct Sync
              Link, or copy your Sync Code below.
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
              Auto-syncs without Google using a personal Sync Key backed by Vercel KV / Upstash Redis (requires{' '}
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
