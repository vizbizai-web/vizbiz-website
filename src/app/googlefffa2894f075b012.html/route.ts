import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("google-site-verification: googlefffa2894f075b012", {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
