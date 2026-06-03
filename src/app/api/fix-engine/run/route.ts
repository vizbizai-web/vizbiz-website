import { NextResponse } from "next/server";

const DEPRECATED_FIX_RUN_RESPONSE = {
  status: "deprecated",
  code: "sync_fix_route_deprecated",
  message: "The synchronous fix generator is archived and is no longer a production fulfillment path. Use paid intake jobs and the report worker/operator review queue instead.",
  replacement: "paid intake queue + report worker",
  intakeEndpoint: "/api/purchase/intake",
  workerCommand: "npm run worker:reports -- --limit=3",
};

export async function POST(_request: Request) {
  return NextResponse.json(DEPRECATED_FIX_RUN_RESPONSE, { status: 410 });
}
