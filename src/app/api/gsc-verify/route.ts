import { NextResponse } from 'next/server';

export function GET() {
  return new NextResponse('google-site-verification: google151e827d1737bb24.html\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
