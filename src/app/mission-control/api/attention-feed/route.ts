import { NextRequest, NextResponse } from 'next/server';


export async function GET(_req: NextRequest) {
  // TODO: Replace with real CRM integration
  return NextResponse.json({
    alerts: [],
    summary: {
      critical: 0,
      warning: 0,
      info: 0,
      total: 0,
      daysSinceLastOutreach: null,
    },
  });
}
