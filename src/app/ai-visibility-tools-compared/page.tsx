import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { aiVisibilityTools, comparisonFaqs, methodologyCriteria, SOURCE_DATE } from "@/content/ai-visibility-tools";

const pageUrl = "https://vizbiz.ai/ai-visibility-tools-compared/";
const title = "AI Visibility Tools Compared: Best Options for Local Businesses in 2026";
const description = "Compare VizBiz, OtterlyAI, Peec AI, Profound, Scrunch AI, AthenaHQ, and BrightLocal for AI visibility, GEO, AEO, local SEO, pricing, and fit.";

export const metadata: Metadata = {
  title: `${title} | VizBiz`,
  description,
  alternates: { canonical: pageUrl },
  openGraph: { title: `${title} | VizBiz`, description, url: pageUrl, siteName: "VizBiz", type: "article" },
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function AIVisibilityToolsComparedPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: "2026-04-23",
    dateModified: "2026-07-09",
    author: { "@type": "Person", name: "Alex Vizireanu", url: "https://vizbiz.ai/about/" },
    publisher: { "@type": "Organization", name: "VizBiz", url: "https://vizbiz.ai" },
    mainEntityOfPage: pageUrl,
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI visibility tools compared",
    itemListElement: aiVisibilityTools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `${pageUrl}#${tool.slug}`,
      description: `${tool.bestFor}. Strength: ${tool.strength} Limit: ${tool.limit}`,
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
        <SiteHeader ctaLabel="Get My Snapshot" />

        <section className="section-shell px-4 pb-14 pt-12 sm:px-6 sm:pb-18 sm:pt-16 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="section-kicker">Citable comparison · Last updated July 9, 2026</div>
            <h1 className="display-font mt-6 max-w-4xl text-[2.6rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4.5rem]">
              AI visibility tools compared for local businesses in 2026
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
              A buyer-friendly comparison of AI visibility, GEO, AEO, and local SEO tools. Every competitor feature and pricing note below is tied to a public vendor page, accessed on {SOURCE_DATE}.
            </p>
          </div>
        </section>

        <section className="section-shell px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[var(--neon-cyan)]/20 bg-[var(--neon-cyan)]/8 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--neon-cyan)]">Quick answer: which AI visibility tool should you shortlist?</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {aiVisibilityTools.map((tool) => (
                <a key={tool.slug} href={`#${tool.slug}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-[var(--neon-cyan)]/40">
                  <div className="text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">Best for: {tool.bestFor}</div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{tool.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{tool.quickWhy}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="section-kicker">Methodology</div>
              <h2 className="display-font mt-4 text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.7rem]">How this comparison is maintained</h2>
              <p className="mt-5 text-base leading-8 text-[var(--text-secondary)]">
                Author: Alex Vizireanu, founder of VizBiz. Last updated: {SOURCE_DATE}. This page is maintained for local business owners comparing AI visibility tools, not for enterprise procurement teams buying brand intelligence suites.
              </p>
            </div>
            <div className="glass-card rounded-[2rem] p-6 sm:p-8">
              <p className="font-semibold text-white">Criteria used</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                {methodologyCriteria.map((criterion) => <li key={criterion}>• {criterion}</li>)}
              </ul>
              <p className="mt-5 text-sm leading-6 text-[var(--text-muted)]">
                Sources are public vendor-owned product or pricing pages. Pricing and feature language can change; confirm final terms with each vendor before purchase.
              </p>
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
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.7rem]">Per-vendor notes and tradeoffs</h2>
            {aiVisibilityTools.map((tool, index) => (
              <article id={tool.slug} key={tool.slug} className="glass-card scroll-mt-24 rounded-[2rem] p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="section-kicker">#{index + 1} · {tool.name}</div>
                    <h3 className="mt-3 text-2xl font-semibold text-white">{tool.name}</h3>
                  </div>
                  <a className="rounded-full border border-white/10 px-4 py-2 text-xs text-[var(--text-secondary)] hover:border-[var(--neon-cyan)]/40" href={tool.sourceUrl} rel="nofollow noopener noreferrer" target="_blank">
                    Source: {tool.sourceLabel}
                  </a>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--neon-cyan)]">Strength</p>
                    <p className="mt-2 leading-7 text-[var(--text-secondary)]">{tool.strength}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">Limit</p>
                    <p className="mt-2 leading-7 text-[var(--text-secondary)]">{tool.limit}</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {tool.facts.map((fact) => <li key={fact}>• {fact}</li>)}
                </ul>
                <p className="mt-5 text-xs text-[var(--text-muted)]">Source checked: {tool.sourceLabel}, accessed {tool.sourceDate}. Pricing shown as published or described on the source page at time of review.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.7rem]">Decision framework</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {aiVisibilityTools.slice(0, 6).map((tool) => (
                <div key={tool.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-semibold text-white">Choose {tool.name} if</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{tool.chooseIf}</p>
                  <p className="mt-4 text-sm font-semibold text-amber-200">Avoid if</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{tool.avoidIf}</p>
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
              <h2 className="text-xl font-semibold text-white">Want the local-business version of this analysis for your company?</h2>
              <p className="mt-3 leading-7 text-[var(--text-secondary)]">VizBiz checks whether AI assistants can understand, trust, and recommend your business in your market.</p>
              <Link href="/intake/" className="mt-5 inline-flex rounded-full bg-[var(--neon-cyan)] px-5 py-3 text-sm font-semibold text-slate-950">Get a free AI visibility snapshot</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
