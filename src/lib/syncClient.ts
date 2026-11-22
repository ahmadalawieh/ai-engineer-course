import type { CourseProgress, SyncConfig } from '@/types/course';
import { createInitialProgress, mergeProgress } from './progress';

export interface SyncResult {
  ok: boolean;
  progress?: CourseProgress;
  gistId?: string;
  message: string;
}

const GIST_FILENAME = 'ai-engineer-course-progress.json';

function normalizeSyncKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .slice(0, 64);
}

export function generateSyncKey(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const len = 20;
  let randomPart = '';
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < len; i++) {
      randomPart += alphabet[bytes[i] % alphabet.length];
    }
  } else {
    for (let i = 0; i < len; i++) {
      randomPart += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return `aimc-${randomPart.slice(0, 5)}-${randomPart.slice(5, 10)}-${randomPart.slice(10, 15)}-${randomPart.slice(15, 20)}`;
}

export async function pushToCloudKV(syncKey: string, progress: CourseProgress): Promise<SyncResult> {
  const cleanKey = normalizeSyncKey(syncKey);
  if (cleanKey.length < 16) {
    return { ok: false, message: 'Sync key must be at least 16 characters (click Random to generate a secure key).' };
  }

  try {
    const pullRes = await fetch(`/api/sync?key=${encodeURIComponent(cleanKey)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    let merged = progress;
    if (pullRes.ok) {
      const data = await pullRes.json();
      if (data?.progress) {
        merged = mergeProgress(progress, { ...createInitialProgress(), ...data.progress });
      }
    } else if (pullRes.status === 501) {
      const err = await pullRes.json().catch(() => ({}));
      return {
        ok: false,
        message:
          err.message ||
          'Cloud KV is not configured on this deployment yet. Add Upstash/Vercel KV env vars or use GitHub Gist Sync / Portable Sync Token.',
      };
    }

    const pushRes = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: cleanKey, progress: merged }),
    });

    if (!pushRes.ok) {
      const err = await pushRes.json().catch(() => ({}));
      return { ok: false, message: err.message || `Cloud sync failed (${pushRes.status}).` };
    }

    return { ok: true, progress: merged, message: 'Synced with Cloud KV.' };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Network error during Cloud KV sync.',
    };
  }
}

export async function pullFromCloudKV(
  syncKey: string,
  localProgress: CourseProgress
): Promise<SyncResult> {
  const cleanKey = normalizeSyncKey(syncKey);
  if (cleanKey.length < 16) {
    return { ok: false, message: 'Sync key must be at least 16 characters.' };
  }

  try {
    const res = await fetch(`/api/sync?key=${encodeURIComponent(cleanKey)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (res.status === 501) {
      const err = await res.json().catch(() => ({}));
      return {
        ok: false,
        message:
          err.message ||
          'Cloud KV is not configured on this deployment yet. Use GitHub Gist Sync or Portable Sync Token.',
      };
    }

    if (res.status === 404) {
      return {
        ok: false,
        message: 'No saved progress found for this Sync Key yet. Click "Push Local" first.',
      };
    }

    if (!res.ok) {
      return { ok: false, message: `Failed to fetch Cloud KV (${res.status}).` };
    }

    const data = await res.json();
    if (!data?.progress) {
      return { ok: false, message: 'Remote Cloud KV record was empty.' };
    }

    const merged = mergeProgress(localProgress, { ...createInitialProgress(), ...data.progress });
    return { ok: true, progress: merged, message: 'Pulled & merged progress from Cloud KV.' };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Network error while pulling Cloud KV.',
    };
  }
}

async function findExistingCourseGist(token: string): Promise<string | undefined> {
  const res = await fetch('https://api.github.com/gists?per_page=30', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) return undefined;
  const gists = (await res.json()) as Array<{
    id: string;
    files?: Record<string, unknown>;
  }>;
  const found = gists.find((g) => g.files && GIST_FILENAME in g.files);
  return found?.id;
}

export async function syncWithGitHubGist(
  config: SyncConfig,
  localProgress: CourseProgress
): Promise<SyncResult> {
  const token = config.gistToken?.trim();
  if (!token) {
    return { ok: false, message: 'GitHub Personal Access Token (gist scope) is required.' };
  }

  try {
    let gistId = config.gistId?.trim();
    if (!gistId) {
      gistId = await findExistingCourseGist(token);
    }

    let merged = localProgress;

    if (gistId) {
      const getRes = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
        cache: 'no-store',
      });
      if (getRes.ok) {
        const gist = await getRes.json();
        const raw = gist?.files?.[GIST_FILENAME]?.content;
        if (raw) {
          try {
            const remote = JSON.parse(raw) as CourseProgress;
            merged = mergeProgress(localProgress, { ...createInitialProgress(), ...remote });
          } catch {
            // Keep local if remote malformed
          }
        }
      } else if (getRes.status === 401) {
        return { ok: false, message: 'Invalid or expired GitHub token (HTTP 401).' };
      } else if (getRes.status === 404) {
        gistId = undefined;
      }
    }

    if (gistId) {
      const patchRes = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'AI Engineer & Data Science Mastery Course Progress',
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(merged, null, 2),
            },
          },
        }),
      });
      if (!patchRes.ok) {
        return { ok: false, message: `Failed to update Gist (${patchRes.status}).` };
      }
      return { ok: true, progress: merged, gistId, message: 'Synced with private GitHub Gist.' };
    }

    const createRes = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'AI Engineer & Data Science Mastery Course Progress',
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(merged, null, 2),
          },
        },
      }),
    });

    if (!createRes.ok) {
      return {
        ok: false,
        message: `Failed to create GitHub Gist (${createRes.status}). Ensure token has "gist" scope.`,
      };
    }

    const created = await createRes.json();
    return {
      ok: true,
      progress: merged,
      gistId: created.id,
      message: 'Created private GitHub Gist & synced progress.',
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Network error during GitHub Gist sync.',
    };
  }
}

export interface ClientAuthUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthSessionResponse {
  user: ClientAuthUser | null;
  googleConfigured: boolean;
  kvConfigured: boolean;
}

export async function fetchAuthSession(): Promise<AuthSessionResponse> {
  try {
    const res = await fetch('/api/auth/session', { cache: 'no-store' });
    if (!res.ok) {
      return { user: null, googleConfigured: false, kvConfigured: false };
    }
    return (await res.json()) as AuthSessionResponse;
  } catch {
    return { user: null, googleConfigured: false, kvConfigured: false };
  }
}

export async function logoutGoogleSession(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
}

export async function syncWithGoogleCloud(localProgress: CourseProgress): Promise<SyncResult> {
  try {
    const pullRes = await fetch('/api/sync?mode=google', {
      method: 'GET',
      cache: 'no-store',
    });

    let merged = localProgress;
    if (pullRes.ok) {
      const data = await pullRes.json();
      if (data?.progress) {
        merged = mergeProgress(localProgress, { ...createInitialProgress(), ...data.progress });
      }
    } else if (pullRes.status === 501) {
      const err = await pullRes.json().catch(() => ({}));
      return {
        ok: false,
        message:
          err.message ||
          'Signed in with Google, but Cloud KV (Upstash Redis) is not configured on Vercel yet.',
      };
    } else if (pullRes.status === 401) {
      return { ok: false, message: 'Google session expired. Please sign in again.' };
    }

    const pushRes = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'google', progress: merged }),
    });

    if (!pushRes.ok) {
      const err = await pushRes.json().catch(() => ({}));
      return { ok: false, message: err.message || `Google Cloud sync failed (${pushRes.status}).` };
    }

    return { ok: true, progress: merged, message: 'Synced with your Google account.' };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Network error during Google Cloud sync.',
    };
  }
}
