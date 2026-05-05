import { NextResponse } from "next/server";
import { generateFixPackage } from "@/engines/fix/pipeline";
import type { AuditReport } from "@/engines/research/types";
import { readJson, saveJson } from "@/lib/file-store";

export async function POST(request: Request) {
  const body = await request.json() as { auditId?: string; audit?: AuditReport };
  const audit = body.audit ?? (body.auditId ? await readJson<AuditReport>("audits", body.auditId) : null);
  if (!audit) return NextResponse.json({ error: "auditId or audit payload is required" }, { status: 400 });

  const fixPackage = generateFixPackage(audit);
  await saveJson("fix-packages", fixPackage);
  return NextResponse.json(fixPackage, { status: 201 });
}
