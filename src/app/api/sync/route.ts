import { NextRequest, NextResponse } from 'next/server';

const KEY_PREFIX = 'ai_mastery_sync:';

// Ephemeral in-memory fallback used only in local development when KV env vars aren't set
const devMemoryStore = new Map<string, string>();

function getKvCredentials(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url: url.replace(/\/$/, ''), token };
  return null;
}

function sanitizeKey(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  if (cleaned.length < 4 || cleaned.length > 64) return null;
  return cleaned;
}

export async function GET(req: NextRequest) {
  const key = sanitizeKey(req.nextUrl.searchParams.get('key'));
  if (!key) {
    return NextResponse.json(
      { error: 'Invalid sync key. Must be 4-64 alphanumeric/dash characters.' },
      { status: 400 }
    );
  }

  const kv = getKvCredentials();
  const fullKey = `${KEY_PREFIX}${key}`;

  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/${encodeURIComponent(fullKey)}`, {
        headers: { Authorization: `Bearer ${kv.token}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        return NextResponse.json({ message: 'Failed to read from Cloud KV.' }, { status: 502 });
      }
      const data = await res.json();
      if (!data?.result) {
        return NextResponse.json({ message: 'No progress saved under this key.' }, { status: 404 });
      }
      const progress = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      return NextResponse.json({ progress, storage: 'cloud-kv' });
    } catch {
      return NextResponse.json({ message: 'Error contacting Cloud KV.' }, { status: 502 });
    }
  }

  if (process.env.NODE_ENV === 'development') {
    const stored = devMemoryStore.get(fullKey);
    if (!stored) {
      return NextResponse.json({ message: 'No progress saved under this key yet.' }, { status: 404 });
    }
    return NextResponse.json({ progress: JSON.parse(stored), storage: 'dev-memory' });
  }

  return NextResponse.json(
    {
      mode: 'unconfigured',
      message:
        'Cloud KV is not configured on this Vercel deployment. Add UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN (or Vercel KV) in Vercel Project Settings, or use GitHub Gist Sync / Portable Sync Token.',
    },
    { status: 501 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const key = sanitizeKey(body?.key);
    const progress = body?.progress;

    if (!key || !progress || typeof progress !== 'object') {
      return NextResponse.json({ message: 'Invalid key or progress payload.' }, { status: 400 });
    }

    const serialized = JSON.stringify(progress);
    if (serialized.length > 250_000) {
      return NextResponse.json({ message: 'Progress payload too large.' }, { status: 413 });
    }

    const kv = getKvCredentials();
    const fullKey = `${KEY_PREFIX}${key}`;

    if (kv) {
      const res = await fetch(`${kv.url}/set/${encodeURIComponent(fullKey)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kv.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serialized),
      });
      if (!res.ok) {
        return NextResponse.json({ message: 'Failed to save to Cloud KV.' }, { status: 502 });
      }
      return NextResponse.json({ ok: true, storage: 'cloud-kv' });
    }

    if (process.env.NODE_ENV === 'development') {
      devMemoryStore.set(fullKey, serialized);
      return NextResponse.json({ ok: true, storage: 'dev-memory' });
    }

    return NextResponse.json(
      {
        mode: 'unconfigured',
        message:
          'Cloud KV is not configured on this deployment. Add Upstash/Vercel KV env vars or use GitHub Gist Sync.',
      },
      { status: 501 }
    );
  } catch {
    return NextResponse.json({ message: 'Invalid JSON request body.' }, { status: 400 });
  }
}
