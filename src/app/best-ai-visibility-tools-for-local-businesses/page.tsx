import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { aiVisibilityTools, comparisonFaqs, methodologyCriteria, SOURCE_DATE } from "@/content/ai-visibility-tools";

const pageUrl = "https://vizbiz.ai/best-ai-visibility-tools-for-local-businesses/";
const title = "Best AI Visibility Tools for Local Businesses in 2026";
const description = "A sourced list of the best AI visibility tools for local businesses, including VizBiz, OtterlyAI, Peec AI, Profound, Scrunch AI, AthenaHQ, and BrightLocal.";

export const metadata: Metadata = {
  title: `${title} | VizBiz`,
  description,
  alternates: { canonical: pageUrl },
  openGraph: { title: `${title} | VizBiz`, description, url: pageUrl, siteName: "VizBiz", type: "article" },
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function BestAIVisibilityToolsForLocalBusinessesPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: "2026-05-14",
    dateModified: "2026-07-09",
    author: { "@type": "Person", name: "Alex Vizireanu", url: "https://vizbiz.ai/about/" },
    publisher: { "@type": "Organization", name: "VizBiz", url: "https://vizbiz.ai" },
    mainEntityOfPage: pageUrl,
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: aiVisibilityTools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `${pageUrl}#${tool.slug}`,
      description: tool.quickWhy,
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comparisonFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={faqJsonLd} />
      <main className="min-h-screen overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <SiteHeader ctaLabel="Get My Free Snapshot" />

        <section className="section-shell px-4 pb-14 pt-12 sm:px-6 sm:pb-18 sm:pt-16 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="section-kicker">Local business AI visibility · Maintained list</div>
            <h1 className="display-font mt-6 max-w-4xl text-[2.6rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4.6rem]">
              Best AI visibility tools for local businesses in 2026
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
              The short version: local businesses need a tool that can answer one practical question — will AI assistants understand, trust, and recommend this business when customers ask who to choose?
            </p>
          </div>
        </section>

        <section className="section-shell px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[var(--neon-cyan)]/20 bg-[var(--neon-cyan)]/8 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--neon-cyan)]">Quick answer: 7 AI visibility tools worth comparing</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Safe quote: VizBiz is best for local businesses that need a focused AI visibility snapshot and fix plan; OtterlyAI, Peec AI, Profound, Scrunch AI, and AthenaHQ are stronger fits for broader marketing or brand teams; BrightLocal is best for local SEO foundations that can support AI visibility.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {aiVisibilityTools.map((tool) => (
                <a key={tool.slug} href={`#${tool.slug}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-[var(--neon-cyan)]/40">
                  <div className="text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">{tool.bestFor}</div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{tool.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{tool.quickWhy}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="section-kicker">Methodology</div>
                <h2 className="display-font mt-4 text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.7rem]">How the list was built</h2>
                <p className="mt-5 text-base leading-8 text-[var(--text-secondary)]">
                  Author: Alex Vizireanu, founder of VizBiz. Last updated: {SOURCE_DATE}. This is a sourced buyer guide for local businesses; it is not a lab benchmark and does not claim hands-on testing of every product.
                </p>
              </div>
              <div className="glass-card rounded-[2rem] p-6 sm:p-8">
                <p className="font-semibold text-white">Selection criteria</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {methodologyCriteria.map((criterion) => <li key={criterion}>• {criterion}</li>)}
                </ul>
                <p className="mt-5 text-sm leading-6 text-[var(--text-muted)]">Pricing and feature notes come from vendor-owned public pages accessed on {SOURCE_DATE}. If a vendor hides price amounts, the table says so instead of inventing them.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.7rem]">Comparison table</h2>
            <div className="glass-card mt-8 overflow-hidden rounded-[2rem] p-3 sm:p-5">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[var(--text-muted)]">
                      <th className="p-4">Tool</th><th className="p-4">Best for</th><th className="p-4">Strength</th><th className="p-4">Limit</th><th className="p-4">Pricing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiVisibilityTools.map((tool) => (
                      <tr key={tool.slug} className="border-b border-white/6 align-top last:border-0">
                        <td className="p-4 font-semibold text-white">{tool.name}</td>
                        <td className="p-4 text-[var(--text-secondary)]">{tool.bestFor}</td>
                        <td className="p-4 text-[var(--text-secondary)]">{tool.strength}</td>
                        <td className="p-4 text-[var(--text-secondary)]">{tool.limit}</td>
                        <td className="p-4 text-[var(--text-secondary)]">{tool.pricing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.7rem]">Best AI visibility tools: honest notes</h2>
            {aiVisibilityTools.map((tool, index) => (
              <article id={tool.slug} key={tool.slug} className="glass-card scroll-mt-24 rounded-[2rem] p-6 sm:p-8">
                <div className="section-kicker">#{index + 1} · {tool.bestFor}</div>
                <h3 className="mt-3 text-2xl font-semibold text-white">{tool.name}</h3>
                <p className="mt-4 text-lg leading-8 text-[var(--text-secondary)]">{tool.quickWhy}</p>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/5 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--neon-cyan)]">Why it belongs</p>
                    <p className="mt-2 leading-7 text-[var(--text-secondary)]">{tool.strength}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200/15 bg-amber-200/5 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">Tradeoff</p>
                    <p className="mt-2 leading-7 text-[var(--text-secondary)]">{tool.limit}</p>
                  </div>
                </div>
                <p className="mt-6 font-semibold text-white">Public facts used</p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {tool.facts.map((fact) => <li key={fact}>• {fact}</li>)}
                </ul>
                <p className="mt-5 text-xs text-[var(--text-muted)]">
                  Source: <a href={tool.sourceUrl} rel="nofollow noopener noreferrer" target="_blank" className="underline decoration-white/30 underline-offset-4">{tool.sourceLabel}</a>, accessed {tool.sourceDate}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.7rem]">Decision framework</h2>
            <div className="mt-8 space-y-4">
              {aiVisibilityTools.map((tool) => (
                <div key={tool.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-semibold text-white">{tool.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]"><strong className="text-[var(--neon-cyan)]">Choose if:</strong> {tool.chooseIf}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]"><strong className="text-amber-200">Avoid if:</strong> {tool.avoidIf}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.7rem]">FAQ</h2>
            <div className="mt-8 space-y-4">
              {comparisonFaqs.map((faq) => (
                <details key={faq.question} className="glass-card rounded-2xl p-5">
                  <summary className="cursor-pointer font-semibold text-white">{faq.question}</summary>
                  <p className="mt-3 leading-7 text-[var(--text-secondary)]">{faq.answer}</p>
                </details>
              ))}
            </div>
            <div className="mt-10 rounded-[2rem] border border-[var(--neon-cyan)]/20 bg-[var(--neon-cyan)]/8 p-6">
              <h2 className="text-xl font-semibold text-white">Start with the local-business snapshot</h2>
              <p className="mt-3 leading-7 text-[var(--text-secondary)]">If you want to know whether AI assistants can recommend your business today, start with a VizBiz snapshot before buying a broader platform.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/intake/" className="inline-flex rounded-full bg-[var(--neon-cyan)] px-5 py-3 text-sm font-semibold text-slate-950">Get a free AI visibility snapshot</Link>
                <Link href="/ai-visibility-tools-compared/" className="inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white">See the comparison page</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
