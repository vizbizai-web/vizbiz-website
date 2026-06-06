import { initializeSheet } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeSheet();
    return NextResponse.json({
      success: true,
      message: "CRM initialized. Supabase is the live source of truth; Google Sheets is legacy fallback only.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
