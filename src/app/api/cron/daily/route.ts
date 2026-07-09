import { NextResponse } from 'next/server';
import { authorizeCronRequest, recordCronHeartbeat } from '@/lib/cron-heartbeats';

export const runtime = 'nodejs';
export const maxDuration = 300;

type StepResult = { step: string; status: number; ok: boolean; body: unknown };

async function capture(step: string, request: Request, path: string): Promise<StepResult> {
  try {
    const source = new URL(request.url);
    const target = new URL(path, source.origin);
    const headers = new Headers();
    const auth = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    if (auth) headers.set('authorization', auth);
    if (cronSecret) headers.set('x-cron-secret', cronSecret);
    const response = await fetch(target.toString(), { method: 'GET', headers, cache: 'no-store' });
    const text = await response.text();
    let body: unknown = text;
    try { body = text ? JSON.parse(text) : null; } catch {}
    return { step, status: response.status, ok: response.ok, body };
  } catch (error) {
    return { step, status: 500, ok: false, body: { success: false, error: error instanceof Error ? error.message : String(error) } };
  }
}

export async function GET(request: Request) {
  const auth = authorizeCronRequest(request);
  if (!auth.authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  await recordCronHeartbeat(request, '/api/cron/daily/', auth.authMethod);

  const steps: StepResult[] = [];
  steps.push(await capture('email-suite', request, '/api/cron/email-suite/'));
  steps.push(await capture('client-zero', request, '/api/cron/client-zero/'));
  steps.push(await capture('process-reruns', request, '/api/cron/process-reruns/'));
  const ok = steps.every((step) => step.ok);
  return NextResponse.json({ success: ok, master: true, steps }, { status: ok ? 200 : 500 });
}

export async function POST(request: Request) {
  return GET(request);
}
