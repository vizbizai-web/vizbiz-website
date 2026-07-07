import { NextResponse } from 'next/server';
import { getLeadByLeadId } from '@/lib/google-sheets';
import { buildFixKitInputFromLead } from '@/lib/fix-kit-input';
import { generateFixKit } from '@/lib/fix-kit-generator';
import { getFixKit, saveFixKit, approveAllFixKitArtifacts } from '@/lib/fix-kit-store';
import { recordActionAudit, requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';

export async function GET(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { leadId } = await params;
    const kit = await getFixKit(leadId);
    return NextResponse.json({ success: true, fixKit: kit });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Fix Kit lookup failed' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { leadId } = await params;
    const body = await request.json().catch(() => ({}));
    if (body.action === 'approve_all') {
      const kit = await approveAllFixKitArtifacts(leadId);
      await recordActionAudit({ leadId, action: "fix_kit_approve_all", channel: "mission_control" });
      return NextResponse.json({ success: true, fixKit: kit });
    }
    const lead = await getLeadByLeadId(leadId);
    if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    if (!['paid_intake_submitted','paid_report_ready_for_review','paid_report_delivered'].includes(lead.status)) {
      return NextResponse.json({ success: false, error: 'Fix Kit generation requires a paid lead with submitted paid intake / paid report review status.', status: lead.status }, { status: 409 });
    }
    const input = buildFixKitInputFromLead(lead);
    if (Array.isArray(body.forceValidationFailureFor)) input.forceValidationFailureFor = body.forceValidationFailureFor;
    const generated = await generateFixKit(input);
    const fixKit = await saveFixKit(generated);
    return NextResponse.json({ success: true, fixKit });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Fix Kit generation failed' }, { status: 500 });
  }
}
