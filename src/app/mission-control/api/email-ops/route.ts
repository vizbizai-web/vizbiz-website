import { NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/google-sheets';
import { buildEmailOpsSummary, fetchEmailOpsEvents } from '@/lib/email-ops';

export const revalidate = 0;

export async function GET() {
  try {
    const [events, leads] = await Promise.all([fetchEmailOpsEvents(), getAllLeads()]);
    return NextResponse.json(buildEmailOpsSummary(events, leads));
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Email Ops unavailable' }, { status: 500 });
  }
}
