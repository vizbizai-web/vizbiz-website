import { NextResponse } from "next/server";

const DEPRECATED_AUDIT_RUN_RESPONSE = {
  status: "deprecated",
  code: "sync_audit_route_deprecated",
  message: "The synchronous audit runner is archived and is no longer a client-facing source of truth. Use the async intake queue and report worker instead.",
  replacement: "/api/mini-audit/run",
  workerCommand: "npm run worker:reports -- --limit=3",
};

export async function POST(_request: Request) {
  return NextResponse.json(DEPRECATED_AUDIT_RUN_RESPONSE, { status: 410 });
}
