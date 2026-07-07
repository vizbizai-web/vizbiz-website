import { NextResponse } from 'next/server';
import { getLeadByLeadId, updateLead } from '@/lib/google-sheets';
import { markFixKitDelivered } from '@/lib/fix-kit-store';
import { buildFixKitReadyEmail } from '@/lib/fix-kit-email';
import { sendVizBizEmail } from '@/lib/resend-mailer';
import { recordActionAudit, requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';
import { recordClientEmailSent } from '@/lib/client-emails';

export async function POST(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { leadId } = await params;
    const lead = await getLeadByLeadId(leadId);
    if (!lead) return NextResponse.json({ success:false, error:'Lead not found' }, { status:404 });
    if (!lead.email) return NextResponse.json({ success:false, error:'Lead email missing' }, { status:409 });
    const origin = new URL(request.url).origin;
    const fixKitUrl = `${origin}/report/${leadId}/fix-kit/`;
    const zipUrl = `${origin}/api/fix-kits/${leadId}/download/`;
    const email = buildFixKitReadyEmail({ businessName: lead.dealershipName, contactName: lead.contactName, fixKitUrl, zipUrl });
    const delivered = await markFixKitDelivered(leadId);
    const messageId = await sendVizBizEmail({ to: lead.email, subject: email.subject, html: email.html, replyTo: 'reports@vizbiz.ai' });
    await recordActionAudit({ leadId, action: "deliver_fix_kit", channel: "mission_control", metadata: { messageId } });
    await recordClientEmailSent({ leadId, templateId: 'E9_PAID_REPORT_FIX_KIT_DELIVERY', messageId, emailClass: 'transactional', automation: 'gated', to: lead.email });
    await updateLead(leadId, { status:'paid_report_delivered', emailSentAt:new Date().toISOString(), notes:`${lead.notes || ''}\n[FIX_KIT_DELIVERED ${new Date().toISOString()} messageId=${messageId} rescan_after_fix=${delivered.rescanScheduledAt}]` });
    return NextResponse.json({ success:true, leadId, messageId, rescanAfterFix: delivered.rescanScheduledAt });
  } catch (error) {
    return NextResponse.json({ success:false, error:error instanceof Error ? error.message : 'Fix Kit delivery failed' }, { status:500 });
  }
}
