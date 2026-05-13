import { NextResponse } from "next/server";



// GET /api/cron-status — list all cron jobs and their health
// This reads from the OpenClaw gateway (only works on the server side)
export async function GET() {
  try {
    // We'll expose cron data via a static JSON that gets updated by context-sync cron
    // For now, return a structured response that the MC can render
    // The actual cron data will be fetched client-side from a stored state file
    
    // Read the cron state from a file that context-sync keeps updated
    const { readFileSync, existsSync } = await import("fs");
    const { join } = await import("path");
    
    const cronStatePath = join(process.cwd(), "cron-state.json");
    
    if (!existsSync(cronStatePath)) {
      // Return default structure - will be populated by first context-sync run
      return NextResponse.json({
        crons: [],
        lastUpdated: null,
        healthy: true,
        message: "Cron state not yet initialized. Will populate after next context-sync."
      });
    }
    
    const raw = readFileSync(cronStatePath, "utf-8");
    const data = JSON.parse(raw);
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, crons: [], healthy: false },
      { status: 500 }
    );
  }
}
