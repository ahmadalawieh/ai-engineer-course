import { NextRequest, NextResponse } from 'next/server';
import {
  isGoogleConfigured,
  SESSION_COOKIE,
  signToken,
  STATE_COOKIE,
  type AuthUser,
} from '@/lib/auth';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const expectedState = req.cookies.get(STATE_COOKIE)?.value;

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(`${origin}/?sync_notice=google_not_configured`);
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/?sync_notice=google_auth_failed`);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${origin}/?sync_notice=google_auth_failed`);
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return NextResponse.redirect(`${origin}/?sync_notice=google_auth_failed`);
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${origin}/?sync_notice=google_auth_failed`);
    }

    const profile = (await userRes.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    if (!profile.sub || !profile.email) {
      return NextResponse.redirect(`${origin}/?sync_notice=google_auth_failed`);
    }

    const sessionUser: AuthUser = {
      sub: profile.sub,
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      picture: profile.picture,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };

    const signed = signToken(sessionUser);
    if (!signed) {
      return NextResponse.redirect(`${origin}/?sync_notice=google_auth_failed`);
    }

    const res = NextResponse.redirect(`${origin}/?google_auth=ok`);
    res.cookies.set(SESSION_COOKIE, signed, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    res.cookies.set(STATE_COOKIE, '', { maxAge: 0, path: '/' });
    return res;
  } catch {
    return NextResponse.redirect(`${origin}/?sync_notice=google_auth_failed`);
  }
}
