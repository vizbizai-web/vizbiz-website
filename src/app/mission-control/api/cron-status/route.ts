import { NextRequest, NextResponse } from 'next/server';


export async function GET(_req: NextRequest) {
  // TODO: Replace with real cron status integration
  return NextResponse.json({
    crons: [
      {
        name: 'Dogfood Audit',
        schedule: 'Mon/Thu 2:00 PM',
        lastRun: null,
        status: 'scheduled',
      },
    ],
    followUps: [],
    content: [],
  });
}
