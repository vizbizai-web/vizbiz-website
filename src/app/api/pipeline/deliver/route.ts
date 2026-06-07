/**
 * Archived legacy delivery route.
 *
 * The previous implementation sent an older snapshot email template directly to
 * a lead. It did not prove the report CTA rendered real report content before
 * sending. That is now forbidden for VizBiz launch safety.
 *
 * Use Mission Control /api/lead-actions approve_and_send, which calls
 * /api/send-report-email and must pass verified-report CTA gates first.
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      archivedLegacyRoute: true,
      error: "Legacy direct delivery is disabled. Use /api/lead-actions approve_and_send so report CTA verification runs before Resend sends.",
      replacement: "/api/lead-actions approve_and_send -> /api/send-report-email",
    },
    { status: 410 }
  );
}
