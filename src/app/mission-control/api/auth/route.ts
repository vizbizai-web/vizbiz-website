import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSession, setSessionCookie } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const sessionId = createSession();
    await setSessionCookie(sessionId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}
