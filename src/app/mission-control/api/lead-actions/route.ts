import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, action, data } = body;

    if (!leadId || !action) {
      return NextResponse.json({ error: 'leadId and action required' }, { status: 400 });
    }

    // TODO: Wire to real CRM integration
    console.log('[lead-actions]', { leadId, action, data });

    return NextResponse.json({ ok: true, leadId, action, data });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
