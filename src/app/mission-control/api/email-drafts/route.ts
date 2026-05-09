import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  // TODO: Replace with real CRM integration
  return NextResponse.json({
    drafts: [],
    total: 0,
  });
}
