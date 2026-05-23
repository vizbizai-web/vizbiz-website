import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSeoSiteIntelligence } from "./site-intelligence";

const targetHtml = `<!doctype html>
<html><head>
<title>Oakville Toyota Dealer and Service Centre</title>
<meta name="description" content="Oakville Toyota helps local drivers buy, finance, and service Toyota vehicles with transparent advice and trusted support.">
<link rel="canonical" href="https://oakvilletoyota.example/">
<script type="application/ld+json">{"@type":"AutoDealer","name":"Oakville Toyota"}</script>
</head><body>
<h1>Toyota dealer in Oakville</h1>
<h2>New Toyota inventory</h2>
<h2>Toyota service appointments</h2>
<a href="/contact">Contact us</a>
<a href="https://www.facebook.com/oakvilletoyota">Facebook</a>
<a href="https://www.instagram.com/oakvilletoyota/">Instagram</a>
<section><h2>Frequently asked questions</h2><p>How do I book Toyota service? Call our team.</p></section>
${"Oakville Toyota serves Oakville drivers with Toyota sales service financing reviews and local support. ".repeat(80)}
</body></html>`;

const competitorHtml = `<!doctype html><html><head><title>Burlington Toyota Dealer</title></head><body>
<h1>Burlington Toyota</h1>
<h2>Hybrid Toyota models</h2>
<h2>Certified pre-owned Toyota warranty</h2>
${"Burlington Toyota has detailed pages for hybrid inventory certified pre-owned warranty and service. ".repeat(70)}
</body></html>`;

describe("buildSeoSiteIntelligence", () => {
  afterEach(() => vi.restoreAllMocks());

  it("builds deterministic SEO, content, competitor, and automation intelligence", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("robots.txt") || url.includes("sitemap.xml")) return new Response("ok", { status: 200 });
      if (url.includes("burlington")) return new Response(competitorHtml, { status: 200 });
      return new Response(targetHtml, { status: 200 });
    }));

    const result = await buildSeoSiteIntelligence({
      name: "Oakville Toyota",
      city: "Oakville",
      websiteUrl: "https://oakvilletoyota.example",
      businessType: "auto_dealer",
      primaryService: "Toyota service",
      competitors: [{ name: "Burlington Toyota", websiteUrl: "https://burlington.example", aviScore: 70 }],
    });

    expect(result.score).toBeGreaterThan(70);
    expect(result.target?.schemaTypes).toContain("AutoDealer");
    expect(result.target?.socialProfiles).toEqual(["facebook", "instagram"]);
    expect(result.technicalChecks.find((check) => check.key === "sitemap")?.passed).toBe(true);
    expect(result.contentBriefs.map((brief) => brief.source)).toContain("competitor-analysis");
    expect(result.competitorFindings[0].competitor).toBe("Burlington Toyota");
    expect(result.automation.map((step) => step.tool)).toContain("Playwright");
    expect(result.automation.map((step) => step.tool)).toContain("Scrapling / stealth browser");
  });

  it("returns a safe empty intelligence object without a website", async () => {
    const result = await buildSeoSiteIntelligence({ name: "No Site Co", city: "Oakville" });

    expect(result.crawlSource).toBe("none");
    expect(result.target).toBeNull();
    expect(result.technicalChecks[0].label).toBe("Website input");
  });
});
