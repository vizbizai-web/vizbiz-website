import { NextResponse } from 'next/server';
import { requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';
import { isSupabaseRestConfigured, supabaseRest } from '@/lib/supabase-rest';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ leadId: string }> | { leadId: string } };

export async function GET(request: Request, context: RouteContext) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  const params = await context.params;
  const leadId = params.leadId;
  if (!leadId) return NextResponse.json({ success: false, error: 'leadId required' }, { status: 400 });
  if (!isSupabaseRestConfigured()) return NextResponse.json({ success: false, error: 'Supabase REST is not configured', events: [] }, { status: 503 });

  const events = await supabaseRest<any[]>(`/lead_events?select=id,lead_id,event_type,event_payload,created_at&lead_id=eq.${encodeURIComponent(leadId)}&order=created_at.desc&limit=100`);
  return NextResponse.json({ success: true, leadId, events });
}
