import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, isGoogleConfigured, isKvConfigured } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getSessionFromRequest(req);
  return NextResponse.json(
    {
      user: user
        ? {
            sub: user.sub,
            email: user.email,
            name: user.name,
            picture: user.picture,
          }
        : null,
      googleConfigured: isGoogleConfigured(),
      kvConfigured: isKvConfigured(),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
