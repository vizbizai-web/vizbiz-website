import { NextResponse } from 'next/server';
import { createSession, setSessionCookie, verifyPassword } from '../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { password?: string };

    if (!body.password || !verifyPassword(body.password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const sessionId = createSession();
    await setSessionCookie(sessionId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
  }
}
