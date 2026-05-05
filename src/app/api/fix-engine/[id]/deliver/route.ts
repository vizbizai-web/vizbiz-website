import { NextResponse } from "next/server";
import type { FixPackage } from "@/engines/fix/pipeline";
import { readJson, saveJson } from "@/lib/file-store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fixPackage = await readJson<FixPackage>("fix-packages", id);
  if (!fixPackage) return NextResponse.json({ error: "Fix package not found" }, { status: 404 });
  const delivered = { ...fixPackage, status: "delivered", deliveredAt: new Date().toISOString() } as FixPackage & { status: "delivered"; deliveredAt: string };
  await saveJson("fix-packages", delivered);
  return NextResponse.json(delivered);
}
