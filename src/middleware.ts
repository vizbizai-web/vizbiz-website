// Authentication middleware for Mission Control
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Serve Google Search Console verification files
  const gscFiles: Record<string, string> = {
    '/googlefffa2894f075b012.html': 'google-site-verification: googlefffa2894f075b012',
    '/google151e827d1737bb24.html': 'google-site-verification: google151e827d1737bb24.html',
  };
  if (gscFiles[request.nextUrl.pathname]) {
    return new NextResponse(gscFiles[request.nextUrl.pathname] + '\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
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

  // Skip auth for login page plus auth/logout API routes only.
  // Data/action APIs under /mission-control/api must stay protected.
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname.startsWith('/mission-control/login');
  const isPublicMissionControlApi =
    pathname === '/mission-control/api/auth' ||
    pathname === '/mission-control/api/auth/' ||
    pathname === '/mission-control/api/logout' ||
    pathname === '/mission-control/api/logout/';

  if (isLoginPage || isPublicMissionControlApi) {
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
