import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  // TODO: Replace with real CRM integration
  return NextResponse.json({
    stats: {
      total: 0,
      new: 0,
      researching: 0,
      pending_review: 0,
      approved: 0,
      email_drafted: 0,
      contacted: 0,
      closed_won: 0,
      closed_lost: 0,
    },
    pipeline: {},
    leads: [],
  });
}
