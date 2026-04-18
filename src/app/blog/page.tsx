import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Blog — VizBiz AI Visibility Insights",
  description:
    "Practical guides and insights on how car dealerships can improve their visibility in AI-powered search like ChatGPT, Google AI Overviews, and Gemini.",
};

const posts = [
  {
    slug: "not-showing-up-in-chatgpt",
    title: "Not Showing Up in ChatGPT? Here's Why (And What to Do About It)",
    description:
      "Your dealership is invisible to AI search. Here are the 5 most common reasons — and practical fixes you can start on today.",
    date: "2026-04-16",
  },
];

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <h1 className="font-['Space_Grotesk'] text-4xl font-bold tracking-tight mb-4">
          VizBiz Blog
        </h1>
        <p className="text-zinc-400 text-lg mb-12">
          Practical insights on AI visibility for car dealerships.
        </p>

        <div className="space-y-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block border border-zinc-800 rounded-xl p-6 hover:border-blue-500/40 transition-colors"
            >
              <time className="text-sm text-zinc-500">{post.date}</time>
              <h2 className="font-['Space_Grotesk'] text-xl font-semibold mt-2 mb-2">
                {post.title}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
