import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      source: 'not-configured',
      status: 'unavailable',
      message: 'Mission Control cron/task status is not wired to an approved VizBiz scheduling source yet.',
      missingIntegration: 'approved-task-or-calendar-store',
      crons: [],
      followUps: [],
      content: [],
    },
    { status: 503 }
  );
}
