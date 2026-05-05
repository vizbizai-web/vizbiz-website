import { NextResponse } from "next/server";
import type { FixPackage } from "@/engines/fix/pipeline";
import { readJson } from "@/lib/file-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fixPackage = await readJson<FixPackage>("fix-packages", id);
  if (!fixPackage) return NextResponse.json({ error: "Fix package not found" }, { status: 404 });
  return NextResponse.json(fixPackage);
}
