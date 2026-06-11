import { NextResponse } from "next/server";

export async function GET() {
  const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA
    || process.env.VERCEL_GIT_COMMIT_SHA
    || "unknown";

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    buildSha,
  });
}
