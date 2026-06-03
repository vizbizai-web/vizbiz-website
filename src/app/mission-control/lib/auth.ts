import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';

const SESSION_COOKIE = 'mc_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

// Static export cannot use secure server cookies. Normal Vercel/Next production
// must still enforce server-side Mission Control auth.
const isStaticExport = process.env.NEXT_EXPORT === 'true';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + (process.env.MISSION_CONTROL_SECRET_SALT || 'vizbiz-salt')).digest('hex');
}

export function verifyPassword(inputPassword: string): boolean {
  // Demo password for static export mode
  if (isStaticExport) {
    return inputPassword === 'vizbiz2026';
  }
  
  const expectedPassword = process.env.MISSION_CONTROL_PASSWORD ||
    (process.env.NODE_ENV !== 'production' ? 'vizbiz2026' : undefined);
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
  const sessionId = createHash('sha256')
    .update(Date.now().toString() + Math.random().toString())
    .digest('hex');
  return sessionId;
}

export async function setSessionCookie(sessionId: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION / 1000,
      path: '/mission-control'
    });
  } catch (error) {
    // Cookie operations may fail in static export mode
    console.warn('Cookie operation failed:', error);
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
  } catch (error) {
    console.warn('Cookie operation failed:', error);
  }
}

export async function getSessionId(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  if (isStaticExport) {
    // In static export, we'll rely on client-side auth state
    return true; // Let the client handle auth
  }
  const sessionId = await getSessionId();
  return !!sessionId;
}
