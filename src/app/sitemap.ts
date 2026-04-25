import type { MetadataRoute } from "next";

const BASE_URL = "https://vizbiz.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/ai-visibility-for-car-dealerships/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ai-visibility-audit-for-car-dealerships/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/how-dealerships-show-up-in-ai-search/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sample-ai-visibility-report-for-car-dealerships/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq-ai-visibility-for-car-dealerships/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/cheap-used-car-near-me-ai-visibility-for-dealerships/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/book-call/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // Blog posts
    {
      url: `${BASE_URL}/blog/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog/why-car-dealership-not-showing-up-chatgpt/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/ai-visibility-statistics-car-dealerships/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog/how-to-get-dealership-recommended-by-chatgpt/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog/generative-engine-optimization-car-dealerships/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog/ai-visibility-score-ontario-car-dealerships/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // Tool landing pages
    {
      url: `${BASE_URL}/ai-visibility-tool-car-dealerships/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // About and Insights
    {
      url: `${BASE_URL}/about/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/insights/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
