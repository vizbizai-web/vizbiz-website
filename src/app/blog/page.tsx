import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Blog — VizBiz AI Visibility Insights",
  description:
    "Practical guides and insights on how car dealerships can improve their visibility in AI-powered search like ChatGPT, Google AI Overviews, and Gemini.",
  alternates: {
    canonical: "https://vizbiz.ai/blog",
  },
};

const posts = [
  {
    slug: "geo-is-the-new-playbook-car-dealerships",
    title: "Why GEO Is the New Playbook for Car Dealerships in 2026",
    description:
      "a16z just called GEO the successor to SEO. Here's what that means for car dealerships — and why 84% of Ontario dealers are already behind.",
    date: "2026-05-11",
  },
  {
    slug: "90-day-ai-visibility-playbook-car-dealerships",
    title: "90-Day AI Visibility Playbook for Car Dealerships",
    description:
      "A step-by-step 90-day playbook to improve your dealership's AI visibility. Week-by-week actions you can implement without hiring a new team — based on data from 50 real Ontario dealerships.",
    date: "2026-05-08",
  },
  {
    slug: "ai-visibility-audit-what-it-measures-dealership",
    title: "AI Visibility Audit: What It Measures and Why Your Dealership Needs One",
    description:
      "A real AI visibility audit tells you exactly why AI recommends your competitors instead of you. Here's what the methodology actually measures.",
    date: "2026-04-24",
  },
  {
    slug: "what-is-ai-visibility-car-dealerships",
    title: "What Is AI Visibility for Car Dealerships? (The Complete Guide)",
    description:
      "AI visibility is the new SEO — but most dealership owners have never heard of it. This guide explains what it is, why it matters, and how to check your score for free.",
    date: "2026-04-24",
  },
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
    <main style={{ backgroundColor: "#02091F", minHeight: "100vh", color: "#e2e8f0" }}>
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
