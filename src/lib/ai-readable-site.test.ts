import { describe, expect, it } from "vitest";
import { aiReadableSite } from "./ai-readable-site";

describe("aiReadableSite", () => {
  it("describes VizBiz as a local-business AI visibility product without dealership-only positioning", () => {
    const text = JSON.stringify(aiReadableSite);

    expect(aiReadableSite.organization.description).toContain("small and local businesses");
    expect(aiReadableSite.organization.knowsAbout).toContain("AI visibility for local businesses");
    expect(text).toContain("dentists");
    expect(text).toContain("roofers");
    expect(text).toContain("Local Community Domination");
    expect(text).toContain("service/city pages");
    expect(text).toContain("review syndication");
    expect(text).toContain("brand-search protection");
    expect(text).not.toContain("car dealerships");
    expect(text).not.toContain("your dealership");
  });

  it("exports llms.txt content for AI crawlers with offer, audience, and contact details", () => {
    expect(aiReadableSite.llmsTxt).toContain("# VizBiz.ai");
    expect(aiReadableSite.llmsTxt).toContain("local AI visibility reports for small and local businesses");
    expect(aiReadableSite.llmsTxt).toContain("Free local AI visibility mini report");
    expect(aiReadableSite.llmsTxt).toContain("hello@vizbiz.ai");
  });

  it("exports sitemap urls including the homepage and AI-readable files", () => {
    expect(aiReadableSite.sitemapUrls).toEqual(
      expect.arrayContaining(["https://vizbiz.ai/", "https://vizbiz.ai/llms.txt", "https://vizbiz.ai/sitemap.xml"]),
    );
  });
});
