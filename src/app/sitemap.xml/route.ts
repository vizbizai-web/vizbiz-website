import { aiReadableSite } from "@/lib/ai-readable-site";

export const dynamic = "force-static";

export function GET() {
  const urls = aiReadableSite.sitemapUrls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${url === "https://vizbiz.ai/" ? "1.0" : "0.6"}</priority>\n  </url>`)
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
