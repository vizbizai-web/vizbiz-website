import { aiReadableSite } from "@/lib/ai-readable-site";

export const dynamic = "force-static";

export function GET() {
  return new Response(aiReadableSite.llmsTxt, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
