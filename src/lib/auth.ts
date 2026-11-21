import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'ai_mastery_session';
export const STATE_COOKIE = 'ai_mastery_oauth_state';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  exp: number;
}

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function isKvConfigured(): boolean {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(url && token);
}

function getSigningSecret(): string | null {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.GOOGLE_CLIENT_SECRET) {
    return crypto
      .createHash('sha256')
      .update(`ai_mastery_auth:${process.env.GOOGLE_CLIENT_SECRET}`)
      .digest('hex');
  }
  if (process.env.NODE_ENV === 'development') {
    return 'dev-only-insecure-secret-change-in-prod';
  }
  return null;
}

export function signToken(payload: object): string | null {
  const secret = getSigningSecret();
  if (!secret) return null;
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken<T>(token: string | undefined): T | null {
  if (!token) return null;
  const secret = getSigningSecret();
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): AuthUser | null {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const parsed = verifyToken<AuthUser>(raw);
  if (!parsed || !parsed.sub || !parsed.exp || parsed.exp < Date.now()) {
    return null;
  }
  return parsed;
}
