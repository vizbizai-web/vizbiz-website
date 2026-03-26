// Authentication middleware for Mission Control
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Serve Google Search Console verification file
  if (request.nextUrl.pathname === '/googlefffa2894f075b012.html') {
    return new NextResponse('google-site-verification: googlefffa2894f075b012', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Disable Mission Control auth in local development.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  // Only protect mission-control routes
  if (!request.nextUrl.pathname.startsWith('/mission-control')) {
    return NextResponse.next();
  }

  // Skip auth for login page and API routes
  // Next may normalize routes with a trailing slash in dev, so allow both
  // /mission-control/login and /mission-control/login/.
  if (request.nextUrl.pathname.startsWith('/mission-control/login') ||
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
  matcher: ['/mission-control/:path*', '/googlefffa2894f075b012.html']
};
