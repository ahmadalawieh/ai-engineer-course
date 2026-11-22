import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  MAX_SYNC_PAYLOAD_BYTES,
  SlidingWindowLimiter,
  normalizeAndValidateSyncKey,
  validateCourseProgressPayload,
} from '@/lib/syncValidation';

const KEY_PREFIX = 'ai_mastery_sync:';
const USER_PREFIX = 'ai_mastery_user:';

// Ephemeral in-memory fallback used only in local development when KV env vars aren't set
const devMemoryStore = new Map<string, string>();
const ipLimiter = new SlidingWindowLimiter(45, 60_000);
const bucketLimiter = new SlidingWindowLimiter(30, 60_000);

function getKvCredentials(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url: url.replace(/\/$/, ''), token };
  return null;
}

export function sanitizeKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  if (cleaned.length < 16 || cleaned.length > 64) return null;
  return normalizeAndValidateSyncKey(cleaned);
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim().slice(0, 64);
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || 'local';
}

function rateLimitExceeded(retryAfterSec: number) {
  return NextResponse.json(
    { message: 'Too many sync requests. Please wait a moment and try again.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'Cache-Control': 'no-store',
      },
    }
  );
}

export async function GET(req: NextRequest) {
  const ipCheck = ipLimiter.check(`ip:${getClientIp(req)}`);
  if (!ipCheck.allowed) {
    return rateLimitExceeded(ipCheck.retryAfterSec);
  }

  const mode = req.nextUrl.searchParams.get('mode');
  if (req.nextUrl.searchParams.has('key') && !req.headers.get('x-sync-key')) {
    return NextResponse.json(
      { message: 'Pass sync keys via the x-sync-key request header instead of URL query parameters.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const sessionUser = getSessionFromRequest(req);
  let fullKey: string | null = null;
  if (mode === 'google') {
    if (!sessionUser) {
      return NextResponse.json({ message: 'Google session required.' }, { status: 401 });
    }
    fullKey = `${USER_PREFIX}${sessionUser.sub}`;
  } else {
    const key = sanitizeKey(req.headers.get('x-sync-key'));
    if (!key) {
      return NextResponse.json(
        { error: 'Invalid sync key. Must send 16-64 random alphanumeric/dash characters in x-sync-key header, or sign in with Google.' },
        { status: 400 }
      );
    }
    fullKey = `${KEY_PREFIX}${key}`;
  }

  const keyCheck = bucketLimiter.check(`get:${fullKey}`);
  if (!keyCheck.allowed) {
    return rateLimitExceeded(keyCheck.retryAfterSec);
  }

  const kv = getKvCredentials();
  const responseHeaders = {
    'Cache-Control': 'no-store',
    Vary: 'x-sync-key, Cookie',
  };

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
        return NextResponse.json({ message: 'No progress saved yet.' }, { status: 404 });
      }
      const progress = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      return NextResponse.json({ progress, storage: 'cloud-kv' }, { headers: responseHeaders });
    } catch {
      return NextResponse.json({ message: 'Error contacting Cloud KV.' }, { status: 502 });
    }
  }

  if (process.env.NODE_ENV === 'development' || process.env.SYNC_TEST_MODE === '1') {
    const stored = devMemoryStore.get(fullKey);
    if (!stored) {
      return NextResponse.json({ message: 'No progress saved yet.' }, { status: 404, headers: responseHeaders });
    }
    return NextResponse.json({ progress: JSON.parse(stored), storage: 'dev-memory' }, { headers: responseHeaders });
  }

  return NextResponse.json(
    {
      mode: 'unconfigured',
      message:
        'Cloud KV is not configured on this Vercel deployment. Add UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN (or Vercel KV) in Vercel Project Settings.',
    },
    { status: 501, headers: responseHeaders }
  );
}

export async function POST(req: NextRequest) {
  const ipCheck = ipLimiter.check(`ip:${getClientIp(req)}`);
  if (!ipCheck.allowed) {
    return rateLimitExceeded(ipCheck.retryAfterSec);
  }

  const contentLen = Number(req.headers.get('content-length') || 0);
  if (Number.isFinite(contentLen) && contentLen > MAX_SYNC_PAYLOAD_BYTES + 4096) {
    return NextResponse.json({ message: 'Progress payload exceeds byte limit.' }, { status: 413 });
  }

  let rawBodyText: string;
  try {
    rawBodyText = await req.text();
  } catch {
    return NextResponse.json({ message: 'Failed to read request body.' }, { status: 400 });
  }

  if (Buffer.byteLength(rawBodyText, 'utf8') > MAX_SYNC_PAYLOAD_BYTES + 4096) {
    return NextResponse.json({ message: 'Progress payload exceeds byte limit.' }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBodyText) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON request body.' }, { status: 400 });
  }

  const mode = body?.mode;
  const progress = body?.progress;
  const validation = validateCourseProgressPayload(progress);
  if (!validation.ok) {
    return NextResponse.json({ message: validation.error || 'Invalid progress payload.' }, { status: 400 });
  }

  const sessionUser = getSessionFromRequest(req);
  let fullKey: string | null = null;
  if (mode === 'google') {
    if (!sessionUser) {
      return NextResponse.json({ message: 'Google session required.' }, { status: 401 });
    }
    fullKey = `${USER_PREFIX}${sessionUser.sub}`;
  } else {
    const headerKey = req.headers.get('x-sync-key');
    const bodyKey = typeof body?.key === 'string' ? body.key : null;
    const key = sanitizeKey(headerKey || bodyKey);
    if (!key) {
      return NextResponse.json({ message: 'Invalid sync key or progress payload.' }, { status: 400 });
    }
    fullKey = `${KEY_PREFIX}${key}`;
  }

  const keyCheck = bucketLimiter.check(`post:${fullKey}`);
  if (!keyCheck.allowed) {
    return rateLimitExceeded(keyCheck.retryAfterSec);
  }

  const serialized = JSON.stringify(progress);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_SYNC_PAYLOAD_BYTES) {
    return NextResponse.json({ message: 'Progress payload too large.' }, { status: 413 });
  }

  const kv = getKvCredentials();

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
    return NextResponse.json({ ok: true, storage: 'cloud-kv' }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (process.env.NODE_ENV === 'development' || process.env.SYNC_TEST_MODE === '1') {
    devMemoryStore.set(fullKey, serialized);
    return NextResponse.json({ ok: true, storage: 'dev-memory' }, { headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json(
    {
      mode: 'unconfigured',
      message:
        'Cloud KV is not configured on this deployment. Add Upstash/Vercel KV env vars.',
    },
    { status: 501, headers: { 'Cache-Control': 'no-store' } }
  );
}
