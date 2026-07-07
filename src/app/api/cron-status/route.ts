import { NextResponse } from "next/server";
import { requireMissionControlApiAuth } from "@/lib/mission-control-api-auth";

export async function GET(request: Request) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  return NextResponse.json(
    {
      source: "not-configured",
      status: "unavailable",
      message: "Cron/task status is not wired to an approved VizBiz scheduling source yet.",
      missingIntegration: "approved-task-or-calendar-store",
      crons: [],
      healthy: false,
    },
    { status: 503 }
  );
}
