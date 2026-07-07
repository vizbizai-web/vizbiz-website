import { NextResponse } from 'next/server';
import { getLeadByLeadId } from '@/lib/google-sheets';
import { getFixKit } from '@/lib/fix-kit-store';
import { buildFixKitZip } from '@/lib/fix-kit-zip';
import { recordActionAudit, requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';

export async function GET(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { leadId } = await params;
    const lead = await getLeadByLeadId(leadId);
    const kit = await getFixKit(leadId);
    if (!lead || !kit) return NextResponse.json({ success:false, error:'Fix Kit not found' }, { status:404 });
    if (kit.status !== 'approved' && kit.status !== 'delivered') return NextResponse.json({ success:false, error:'Download blocked until all artifacts are approved' }, { status:403 });
    const zip = buildFixKitZip(kit.artifacts);
    return new NextResponse(new Uint8Array(zip), { headers: { 'Content-Type':'application/zip', 'Content-Disposition': `attachment; filename="${(lead.dealershipName || 'vizbiz').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-fix-kit.zip"` } });
  } catch (error) {
    return NextResponse.json({ success:false, error:error instanceof Error ? error.message : 'Download failed' }, { status:500 });
  }
}
