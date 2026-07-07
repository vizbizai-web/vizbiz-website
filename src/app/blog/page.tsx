import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Blog — VizBiz AI Visibility Insights",
  description:
    "Practical guides on how local businesses can improve visibility in AI-powered search tools like ChatGPT, Gemini, and Perplexity.",
  alternates: {
    canonical: "https://vizbiz.ai/blog/",
  },
};

const posts: Array<{ slug: string; title: string; description: string; date: string }> = [
  {
    slug: "geo-is-the-new-playbook-car-dealerships",
    title: "Why GEO Is the New Playbook for Car Dealerships in 2026",
    description:
      "A practical guide to generative engine optimization and dealership recommendation readiness.",
    date: "2026-05-11",
  },
  {
    slug: "how-to-show-up-in-chatgpt-recommendations",
    title: "How to Show Up in ChatGPT Recommendations",
    description:
      "The trust signals, entity clarity, and content patterns that make a business easier for AI assistants to understand and recommend.",
    date: "2026-05-07",
  },
  {
    slug: "ai-visibility-audit-what-it-measures-dealership",
    title: "AI Visibility Audit for Dealerships: What It Measures",
    description:
      "A practical guide to the dealership signals an AI visibility audit should inspect.",
    date: "2026-04-24",
  },
  {
    slug: "ai-visibility-audit-what-it-measures",
    title: "AI Visibility Audit: What It Measures",
    description:
      "A business-friendly breakdown of the signals that affect whether AI systems can understand, verify, and recommend a local business.",
    date: "2026-04-24",
  },
  {
    slug: "what-is-ai-visibility-car-dealerships",
    title: "What Is AI Visibility for Car Dealerships?",
    description:
      "AI visibility is the new discovery layer. This guide explains what it is, why it matters, and how to check your score for free.",
    date: "2026-04-24",
  },
  {
    slug: "generative-engine-optimization-car-dealerships",
    title: "Generative Engine Optimization (GEO) for Car Dealerships",
    description:
      "A practical guide to GEO for dealerships — how to optimize for ChatGPT, Gemini, Perplexity, and AI-powered search.",
    date: "2026-04-22",
  },
  {
    slug: "how-to-get-dealership-recommended-by-chatgpt",
    title: "How to Get Your Car Dealership Recommended by ChatGPT in 2026",
    description:
      "Step-by-step guidance to make your dealership easier for AI systems to understand and recommend.",
    date: "2026-04-22",
  },
];

export default function BlogIndex() {
  return (
    <main style={{ backgroundColor: "#02091F", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: "#fff" }}>
          VizBiz Blog
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#94a3b8", maxWidth: 600, margin: "0 auto" }}>
          Practical guides on AI visibility, trust signals, and recommendation readiness for local businesses.
        </p>
      </section>

      {/* Post Grid */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: "block",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                padding: 28,
                textDecoration: "none",
              }}
            >
              <time style={{ fontSize: "0.8rem", color: "#64748b" }}>{post.date}</time>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#fff", margin: "8px 0", lineHeight: 1.3 }}>
                {post.title}
              </h2>
              <p style={{ fontSize: "0.93rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
