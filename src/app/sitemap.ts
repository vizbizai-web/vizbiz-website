import type { MetadataRoute } from "next";

const BASE_URL = "https://vizbiz.ai";

type SitemapEntry = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

const entries: SitemapEntry[] = [
  // Core commercial / conversion routes
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/pricing/", changeFrequency: "weekly", priority: 0.95 },
  { path: "/intake/", changeFrequency: "weekly", priority: 0.85 },
  { path: "/free-ai-visibility-test/", changeFrequency: "weekly", priority: 0.85 },
  { path: "/book-call/", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact/", changeFrequency: "monthly", priority: 0.5 },

  // Authority / SEO pages
  { path: "/ai-visibility-for-car-dealerships/", changeFrequency: "weekly", priority: 0.9 },
  { path: "/ai-visibility-audit-for-car-dealerships/", changeFrequency: "weekly", priority: 0.9 },
  { path: "/ai-visibility-benchmark-report-2026/", changeFrequency: "monthly", priority: 0.9 },
  { path: "/ai-visibility-tools-compared/", changeFrequency: "weekly", priority: 0.85 },
  { path: "/best-ai-visibility-tools-for-local-businesses/", changeFrequency: "weekly", priority: 0.85 },
  { path: "/compare/vizbiz-vs-brightlocal/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/how-dealerships-show-up-in-ai-search/", changeFrequency: "weekly", priority: 0.8 },
  { path: "/sample-ai-visibility-report-for-car-dealerships/", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq-ai-visibility-for-car-dealerships/", changeFrequency: "monthly", priority: 0.7 },
  { path: "/ontario-dealership-ai-visibility-report-2026/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/what-is-ai-visibility-scoring/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/what-is-geo-generative-engine-optimization-dealerships/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/about/", changeFrequency: "monthly", priority: 0.65 },
  { path: "/insights/", changeFrequency: "weekly", priority: 0.75 },

  // Blog hub and live posts only — no deleted/stale slugs.
  { path: "/blog/", changeFrequency: "weekly", priority: 0.85 },
  { path: "/blog/geo-is-the-new-playbook-car-dealerships/", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/vizbiz-vs-metricus-vs-scope/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog/chatgpt-vs-gemini-vs-perplexity-dealerships/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog/how-to-show-up-in-chatgpt-recommendations/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog/ai-visibility-audit-what-it-measures/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog/ai-visibility-audit-what-it-measures-dealership/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog/what-is-ai-visibility-car-dealerships/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog/ai-visibility-score-ontario-car-dealerships/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog/generative-engine-optimization-car-dealerships/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog/how-to-get-dealership-recommended-by-chatgpt/", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog/ai-visibility-statistics-car-dealerships/", changeFrequency: "monthly", priority: 0.75 },

  // Legal / trust pages
  { path: "/privacy/", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms/", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return entries.map((entry) => ({
    url: `${BASE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
