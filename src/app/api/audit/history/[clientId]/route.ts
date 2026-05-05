import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return NextResponse.json({ clientId, history: [] });
}
