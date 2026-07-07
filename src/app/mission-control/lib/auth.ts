import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';

const SESSION_COOKIE = 'mc_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

// Only treat as static export when explicitly flagged
const isStaticExport = process.env.NEXT_EXPORT === 'true';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + (process.env.MISSION_CONTROL_SECRET_SALT || 'vizbiz-salt')).digest('hex');
}

export function verifyPassword(inputPassword: string): boolean {
  // Demo password for static export mode
  if (isStaticExport) {
    return inputPassword === 'vizbiz2026';
  }
  
  const expectedPassword = process.env.MISSION_CONTROL_PASSWORD;
  if (!expectedPassword) {
    console.error('MISSION_CONTROL_PASSWORD not set');
    return false;
  }
  
  const inputHash = hashPassword(inputPassword);
  const expectedHash = hashPassword(expectedPassword);
  
  try {
    return timingSafeEqual(Buffer.from(inputHash), Buffer.from(expectedHash));
  } catch {
    return false;
  }
}

export function createSession(): string {
  const expires = Date.now() + SESSION_DURATION;
  const nonce = createHash('sha256')
    .update(Date.now().toString() + Math.random().toString())
    .digest('hex')
    .slice(0, 24);
  const secret = process.env.MISSION_CONTROL_PASSWORD || '';
  const salt = process.env.MISSION_CONTROL_SECRET_SALT || 'vizbiz-salt';
  const signature = createHash('sha256').update(`${expires}:${nonce}:${secret}:${salt}`).digest('hex');
  return `${expires}.${nonce}.${signature}`;
}

export function verifySessionToken(sessionId?: string | null): boolean {
  if (!sessionId || typeof sessionId !== 'string') return false;
  const [expiresRaw, nonce, signature] = sessionId.split('.');
  const expires = Number(expiresRaw);
  if (!expires || !nonce || !signature || Date.now() > expires) return false;
  const secret = process.env.MISSION_CONTROL_PASSWORD || '';
  if (!secret) return false;
  const salt = process.env.MISSION_CONTROL_SECRET_SALT || 'vizbiz-salt';
  const expected = createHash('sha256').update(`${expires}:${nonce}:${secret}:${salt}`).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function setSessionCookie(sessionId: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION / 1000,
      // Path is deliberately site-wide so Mission Control client-side calls to
      // protected /api/* action endpoints carry the same authenticated session.
      path: '/'
    });
  } catch (error) {
    // Cookie operations may fail in static export mode
    console.warn('Cookie operation failed:', error);
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
  } catch (error) {
    console.warn('Cookie operation failed:', error);
  }
}

export async function getSessionId(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE)?.value;
  } catch (error) {
    return undefined;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  if (isStaticExport) {
    // In static export, we'll rely on client-side auth state
    return true; // Let the client handle auth
  }
  const sessionId = await getSessionId();
  return verifySessionToken(sessionId);
}
