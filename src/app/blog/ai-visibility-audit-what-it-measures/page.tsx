import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Visibility Audit: What It Measures | VizBiz",
  description: "A practical, non-hyped guide to the signals an AI visibility audit should inspect for a local business.",
  alternates: { canonical: "https://vizbiz.ai/blog/ai-visibility-audit-what-it-measures/" },
};

const sections = [
  {
    title: "1. Entity clarity",
    body: "AI systems need to understand what the business is, what it offers, where it operates, and which customers it serves. A good audit checks whether those facts are clear on the website, listings, schema, and public profiles.",
  },
  {
    title: "2. Service and location evidence",
    body: "A business is easier to recommend when its core services, service areas, hours, contact paths, and proof points are visible in plain language. Thin pages and vague category labels make confident recommendations harder.",
  },
  {
    title: "3. Trust signals",
    body: "Reviews, testimonials, credentials, case examples, photos, citations, and consistent business details all help discovery systems verify that a business is real, active, and relevant.",
  },
  {
    title: "4. Machine-readable structure",
    body: "Schema markup, crawlable pages, clean headings, FAQ blocks, internal links, robots.txt, sitemap, and llms.txt can help search and AI crawlers interpret the site more accurately.",
  },
  {
    title: "5. Recommendation readiness",
    body: "The audit should translate findings into practical next steps: which pages to clarify, which proof signals to strengthen, which listings to align, and which customer questions the site should answer better.",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <article className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">AI visibility guide</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">AI Visibility Audit: What It Measures</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          An AI visibility audit should not be a magic score or a vague SEO report with AI branding. It should show whether a local business is clear, verifiable, and easy for AI-powered discovery systems to recommend.
        </p>
        <div className="mt-10 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 leading-7 text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>
        <section className="mt-10 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-6">
          <h2 className="text-xl font-semibold text-white">How to use an audit responsibly</h2>
          <p className="mt-3 leading-7 text-slate-300">
            Treat the audit as a visibility diagnosis, not a guarantee. The useful output is a prioritized fix list that improves clarity, trust, and discoverability across the website and public profiles.
          </p>
        </section>
        <p className="mt-10 text-slate-300">
          Want a practical snapshot for your business? <Link href="/intake/" className="text-cyan-300 underline underline-offset-4">Run the free AI visibility snapshot</Link>.
        </p>
      </article>
    </main>
  );
}
