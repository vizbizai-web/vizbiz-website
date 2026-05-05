// Authentication middleware for Mission Control
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect mission-control routes
  if (!request.nextUrl.pathname.startsWith('/mission-control')) {
    return NextResponse.next();
  }

  // Skip auth for login page and API routes
  if (request.nextUrl.pathname === '/mission-control/login' ||
      request.nextUrl.pathname.startsWith('/mission-control/api')) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get('mc_session')?.value;
  
  if (!session) {
    // Redirect to login
    const loginUrl = new URL('/mission-control/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/mission-control/:path*']
};
