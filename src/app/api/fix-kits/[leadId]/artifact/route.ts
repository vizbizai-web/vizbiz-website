import { NextResponse } from 'next/server';
import { updateFixKitArtifact } from '@/lib/fix-kit-store';
import type { FixKitArtifactStatus } from '@/lib/fix-kit-generator';
import { recordActionAudit, requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';

export async function POST(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { leadId } = await params;
    const body = await request.json();
    const artifactKey = String(body.artifactKey || '');
    const action = String(body.action || '');
    if (!artifactKey) return NextResponse.json({ success:false, error:'artifactKey required' }, { status:400 });
    let status: FixKitArtifactStatus | undefined;
    let content: string | undefined;
    let validationErrors: string[] | undefined;
    if (action === 'approve') { status = 'approved'; validationErrors = []; }
    else if (action === 'edit') { content = String(body.content || ''); status = 'generated'; validationErrors = []; if (!content.trim()) return NextResponse.json({ success:false, error:'Edited content required' }, { status:400 }); }
    else if (action === 'needs_operator_edit') { status = 'needs_operator_edit'; validationErrors = [String(body.reason || 'operator edit requested')]; }
    else return NextResponse.json({ success:false, error:'Unsupported artifact action' }, { status:400 });
    const fixKit = await updateFixKitArtifact(leadId, artifactKey, { content, status, validationErrors });
    await recordActionAudit({ leadId, action: `fix_kit_artifact_${action}`, channel: "mission_control", metadata: { artifactKey, status } });
    return NextResponse.json({ success:true, fixKit });
  } catch (error) {
    return NextResponse.json({ success:false, error:error instanceof Error ? error.message : 'Artifact update failed' }, { status:500 });
  }
}
