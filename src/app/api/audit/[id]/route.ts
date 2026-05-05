import { NextResponse } from "next/server";
import type { AuditReport } from "@/engines/research/types";
import { readJson } from "@/lib/file-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await readJson<AuditReport>("audits", id);
  if (!audit) return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  return NextResponse.json(audit);
}
