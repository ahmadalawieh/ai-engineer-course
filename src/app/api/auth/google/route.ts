import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isGoogleConfigured, STATE_COOKIE } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(`${origin}/?sync_notice=google_not_configured`);
  }

  const state = crypto.randomBytes(24).toString('base64url');
  const redirectUri = `${origin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
  });
  return res;
}
