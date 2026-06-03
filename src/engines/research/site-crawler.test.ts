import { describe, expect, it, vi } from "vitest";
import { crawlWebsiteEvidence, parseHtmlPage } from "./site-crawler";

const homeHtml = `<!doctype html><html><head><title>Green Oak Landscaping</title><meta name="description" content="Landscaping, lawn care, garden design, and snow removal in Oakville."></head><body>
<h1>Landscaping services in Oakville</h1>
<nav><a href="/about-us">About</a><a href="/landscaping-services">Services</a><a href="/faq">FAQ</a><a href="/contact">Contact</a></nav>
<p>Our landscaping team helps homeowners with lawn care and garden design.</p>
</body></html>`;

const servicesHtml = `<!doctype html><html><head><title>Lawn Care and Garden Design</title><script type="application/ld+json">{"@type":"LocalBusiness"}</script></head><body>
<h1>Lawn care, sod installation, and garden design</h1><h2>Snow removal</h2><p>We provide landscaping services for homeowners.</p></body></html>`;

const faqHtml = `<!doctype html><html><head><title>Landscaping FAQ</title></head><body><h1>FAQ</h1><h2>How much does lawn care cost?</h2><p>Contact us for a quote.</p></body></html>`;

describe("site crawler", () => {
  it("extracts service evidence from parsed pages", () => {
    const page = parseHtmlPage("https://greenoak.example/landscaping-services", servicesHtml);
    expect(page.schemaTypes).toContain("LocalBusiness");
    expect(page.servicePhrases.map((term) => term.term)).toContain("lawn care");
    expect(page.servicePhrases.map((term) => term.term)).not.toContain("services");
  });

  it("crawls homepage plus prioritized nav/common service and FAQ pages", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("landscaping-services") || url.endsWith("/services")) return new Response(servicesHtml, { status: 200 });
      if (url.includes("faq")) return new Response(faqHtml, { status: 200 });
      if (url.includes("about") || url.includes("contact")) return new Response("<html><body><h1>About Green Oak</h1></body></html>", { status: 200 });
      return new Response(homeHtml, { status: 200 });
    }) as typeof fetch;

    const crawl = await crawlWebsiteEvidence("https://greenoak.example", { fetchImpl: fetchMock, maxPages: 6, timeoutMs: 500 });

    expect(crawl.pages.map((page) => page.url)).toEqual(expect.arrayContaining([
      "https://greenoak.example/landscaping-services",
      "https://greenoak.example/faq",
    ]));
    expect(crawl.extractedServices.map((term) => term.term)).toEqual(expect.arrayContaining(["landscaping", "lawn care", "garden design"]));
    expect(crawl.faqQuestions).toContain("How much does lawn care cost?");
    expect(crawl.confidence).toBeGreaterThan(50);
  });
});
