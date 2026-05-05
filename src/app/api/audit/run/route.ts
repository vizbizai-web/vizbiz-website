import { NextResponse } from "next/server";
import { runAudit } from "@/engines/research/runner";
import { saveJson } from "@/lib/file-store";
import type { ClientInput } from "@/engines/research/types";

export async function POST(request: Request) {
  const input = await request.json() as ClientInput;
  if (!input.name || !input.city) {
    return NextResponse.json({ error: "name and city are required" }, { status: 400 });
  }

  const audit = await runAudit(input);
  await saveJson("audits", audit);
  return NextResponse.json(audit, { status: 201 });
}
