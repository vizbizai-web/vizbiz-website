import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Blog — VizBiz AI Visibility Insights",
  description:
    "Practical guides and insights on how car dealerships can improve their visibility in AI-powered search like ChatGPT, Google AI Overviews, and Gemini.",
};

const posts = [
  {
    slug: "ai-visibility-score-ontario-car-dealerships",
    title: "We Scored 50 Ontario Dealerships on AI Visibility — The Results Were Brutal",
    description:
      "We ran 84 buyer-intent prompts across ChatGPT, Gemini, and Perplexity for 50 Ontario dealerships. The average score was 11 out of 100.",
    date: "2026-04-22",
  },
  {
    slug: "generative-engine-optimization-car-dealerships",
    title: "Generative Engine Optimization (GEO) for Car Dealerships: The Complete Guide",
    description:
      "The complete guide to GEO for car dealerships — how to optimize for ChatGPT, Gemini, Google AI Overviews, and AI-powered search.",
    date: "2026-04-22",
  },
  {
    slug: "how-to-get-dealership-recommended-by-chatgpt",
    title: "How to Get Your Car Dealership Recommended by ChatGPT in 2026",
    description:
      "Step-by-step guide to making your car dealership appear in ChatGPT recommendations, Gemini results, and Google AI Overviews.",
    date: "2026-04-22",
  },
  {
    slug: "ai-visibility-statistics-car-dealerships",
    title: "35+ AI Visibility Statistics Every Car Dealership Needs to Know in 2026",
    description:
      "Data-driven insights on how AI search is reshaping automotive retail and what it means for your dealership.",
    date: "2026-04-21",
  },
  {
    slug: "why-car-dealership-not-showing-up-chatgpt",
    title: "Why Your Car Dealership Isn't Showing Up in ChatGPT (And How to Fix It)",
    description:
      "Learn the 5 most common reasons your dealership isn't appearing in ChatGPT and get a step-by-step fix.",
    date: "2026-04-21",
  },
];

export default function BlogIndex() {
  return (
    <main style={{ backgroundColor: "#07090f", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: "#fff" }}>
          VizBiz Blog
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#94a3b8", maxWidth: 600, margin: "0 auto" }}>
          Practical guides and data-driven insights on AI visibility for car dealerships.
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
