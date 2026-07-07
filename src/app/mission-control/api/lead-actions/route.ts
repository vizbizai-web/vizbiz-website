import { NextResponse } from 'next/server';
import { missionControlInternalHeaders } from '@/lib/mission-control-api-auth';

export const revalidate = 0;

function canonicalUrl(request: Request, path: string) {
  return new URL(path, new URL(request.url).origin).toString();
}

async function forwardJson(request: Request, path: string, init: RequestInit = {}) {
  const response = await fetch(canonicalUrl(request, path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...missionControlInternalHeaders(),
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}

export async function GET(request: Request) {
  return forwardJson(request, '/api/lead-actions');
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
  }

  return forwardJson(request, '/api/lead-actions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
