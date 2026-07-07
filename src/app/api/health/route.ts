import { createHash } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const baseSha = process.env.VERCEL_GIT_COMMIT_SHA
    || process.env.NEXT_PUBLIC_BUILD_SHA
    || "unknown";
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL || "";
  const deploySuffix = deploymentId
    ? `-deploy-${createHash("sha256").update(deploymentId).digest("hex").slice(0, 8)}`
    : "";

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    buildSha: `${baseSha}${deploySuffix}`,
  });
}
