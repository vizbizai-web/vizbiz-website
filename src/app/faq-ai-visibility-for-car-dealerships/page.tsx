import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import FAQAccordion from "@/components/ui/FAQAccordion";

export const metadata: Metadata = {
  title: "AI Visibility FAQ for Car Dealerships | ChatGPT, Gemini & AI Search | VizBiz",
  description:
    "Common questions about AI visibility for car dealerships — how ChatGPT recommends dealers, what affects your score, and how to improve.",
  alternates: {
    canonical: "https://vizbiz.ai/faq-ai-visibility-for-car-dealerships/",
  },
};

const faqItems = [
  { question: "What is VizBiz?", answer: "VizBiz helps local businesses understand how visible they are in AI-driven answers and recommendations. We show where competitors are appearing more often, what is holding visibility back, and what to improve next." },
  { question: "What is AI visibility?", answer: "AI visibility is how often your business appears when people use tools like ChatGPT, Google AI, Perplexity, and similar systems to ask questions, compare options, and look for recommendations." },
  { question: "Why does AI visibility matter for local businesses?", answer: "More people use AI tools before visiting a website or submitting an inquiry. If your business isn't being surfaced, you may be missing demand before it reaches you." },
  { question: "What does VizBiz actually measure?", answer: "We measure how often your business appears, how competitors compare, which visibility categories are strong or weak, and where trust, content, authority, or technical issues may be affecting results." },
  { question: "What is the snapshot?", answer: "The snapshot is the first view — an early look at where your business may be visible, where competitors may be stronger, and the clearest opportunities right now." },
  { question: "What is the audit?", answer: "The audit is a deeper analysis that gives a baseline visibility view, category breakdown, competitor gap summary, and a practical first action list." },
  { question: "What happens after I submit my information?", answer: "We organize your business details, prepare the visibility context, and generate the first useful view of where you stand. From there you can book a conversation or move into a deeper audit." },
  { question: "What happens on the review call?", answer: "We review your business type, market, goals, current weak spots, and whether VizBiz is the right fit. The goal is to decide if it makes sense to move into the audit and ongoing support." },
  { question: "What do I receive in the audit?", answer: "You typically receive a baseline visibility view, category breakdown, competitor comparison, top recommendations, and a practical first action list." },
  { question: "What does monthly support look like?", answer: "Monthly support includes ongoing visibility tracking, competitor monitoring, recurring recommendations, and implementation-ready materials to help you improve steadily over time." },
  { question: "What kinds of recommendations does VizBiz provide?", answer: "Recommendations may include content ideas, FAQ blocks, schema suggestions, page improvements, service visibility fixes, trust improvements, citation cleanup guidance, and authority-layer actions where relevant." },
  { question: "Do you only give advice, or do you provide usable materials too?", answer: "VizBiz provides practical outputs and, when appropriate, implementation-ready materials your team or webmaster can use." },
  { question: "What does my webmaster receive?", answer: "Your webmaster can receive page-specific implementation guidance such as content blocks, FAQ blocks, schema snippets, metadata suggestions, page/location instructions, and verification checklists." },
  { question: "What is AVI?", answer: "AVI stands for AI Visibility Index — the client-facing score that shows how visible your business is across key AI-driven categories and how that changes over time." },
  { question: "What is RRF?", answer: "RRF is the internal ranking logic VizBiz uses to track how consistently your business appears across prompt variations and platforms, helping us understand recommendation strength and movement over time." },
  { question: "What is the authority layer?", answer: "The authority layer is the broader trust, citation, and credibility footprint around your business — citations, local trust signals, reviews, reputation, and other off-site signals." },
  { question: "Is the authority layer just backlinks?", answer: "No. Backlinks can be part of it, but the authority layer includes citations, trust signals, local relevance, reputation, and third-party corroboration." },
  { question: "Do you fully automate everything?", answer: "No. We automate monitoring, detection, drafting, packaging, and tracking. Judgment-heavy work and reputation-sensitive actions are reviewed carefully so recommendations stay practical and credible." },
  { question: "How quickly can results improve?", answer: "It depends on the starting point, market, competitive gap, and how quickly recommended changes are implemented. AI visibility is an ongoing process rather than a one-time switch." },
  { question: "Do you guarantee rankings in ChatGPT or Google AI?", answer: "No. We do not promise guaranteed rankings. We focus on improving conditions that support visibility, trust, and recommendation strength over time." },
  { question: "How is this different from traditional SEO?", answer: "Traditional SEO focuses on website rankings and search traffic. VizBiz focuses on how businesses are surfaced in AI-driven answers while using useful elements of search, trust, authority, and content strategy." },
  { question: "Can VizBiz help if we already have an agency or webmaster?", answer: "Yes. VizBiz can work alongside your current team by identifying visibility gaps, prioritizing useful actions, and providing implementation-ready guidance." },
  { question: "Who is VizBiz best for?", answer: "Local businesses that want to understand how they appear in AI-driven customer journeys and want a structured way to improve visibility over time." },
  { question: "What happens if we only want the audit?", answer: "That's fine — some businesses may only want the one-time audit. If you want ongoing monitoring and recommendations, the retainer is the next step." },
  { question: "Why would a business move from the audit into a monthly retainer?", answer: "Because visibility changes over time — competitors move, prompts change, trust signals shift, and implementation takes time. The retainer helps turn the audit into ongoing improvement." },
  { question: "What do we receive over time if we stay on retainer?", answer: "Recurring visibility tracking, competitor movement insights, updated recommendations, implementation-ready materials, and a clearer picture of what's improving and what still needs work." },
  { question: "Is this only for one service area, or does it cover everything?", answer: "VizBiz covers multiple visibility categories including core services, specialties, trust signals, pricing, and other areas affecting AI-driven customer journeys." },
  { question: "What makes VizBiz different?", answer: "VizBiz is practical, structured, and improvement-focused. We measure visibility, explain it clearly, and turn it into actionable next steps rather than vague hype." },
];

const relatedPages = [
  {
    title: "AI Visibility for Local Businesses",
    href: "/ai-visibility-for-car-dealerships",
    description: "Definition page explaining what AI visibility means for local businesses.",
  },
  {
    title: "How Local Businesses Show Up in AI Search",
    href: "/how-dealerships-show-up-in-ai-search",
    description: "Explains the signals AI systems use when choosing which businesses to mention.",
  },
  {
    title: "AI Visibility Audit for Local Businesses",
    href: "/intake/?utm_source=site&utm_medium=faq-link&utm_campaign=conversion",
    description: "Shows what the audit includes and how competitor gaps are revealed.",
  },
  {
    title: "What Is GEO (Generative Engine Optimization)?",
    href: "/what-is-geo-generative-engine-optimization-dealerships",
    description: "Complete guide to GEO — what it is, how it differs from SEO, and how to get started.",
  },
  {
    title: "Sample AI Visibility Report for Local Businesses",
    href: "/sample-ai-visibility-report-for-car-dealerships",
    description: "Shows what a business actually receives from a sample report and recommendation set.",
  },
];

export default function FaqAiVisibilityForLocalBusinessesPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "FAQ: AI Visibility for Local Businesses",
    "description": "Answers to common questions about AI visibility, reviews, services, competitor comparisons, and audits for local businesses.",
    "datePublished": "2026-04-01",
    "dateModified": "2026-04-12",
    "author": { "@type": "Organization", "name": "VizBiz", "url": "https://vizbiz.ai" },
    "publisher": { "@type": "Organization", "name": "VizBiz", "url": "https://vizbiz.ai" },
    "mainEntityOfPage": "https://vizbiz.ai/faq-ai-visibility-for-car-dealerships/",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">FAQ hub</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            FAQ: AI Visibility for Local Businesses
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              This page answers the questions local businesses are most likely to ask about AI visibility, AI-driven search inclusion, competitor visibility, and audit value.
            </p>
            <div className="mt-8 rounded-[1.5rem] border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[var(--neon-cyan)]">Key Takeaways</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>VizBiz measures how often your business appears in AI answers vs. competitors</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>Two offerings: <strong className="text-white">Snapshot</strong> (quick first look) and <strong className="text-white">Audit</strong> (deep analysis with action plan)</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>GEO is complementary to SEO — same trust signals, different optimization targets</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>VizBiz provides implementation-ready materials your webmaster can use directly</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FAQAccordion items={faqItems} />
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
            Related pages
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {relatedPages.map((page) => (
              <Link key={page.href} href={page.href} className="metric-row rounded-2xl p-5 transition hover:border-[var(--border-subtle)] hover:bg-white/6">
                <h3 className="text-lg font-semibold">{page.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{page.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Get your snapshot</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              Get Your AI Visibility Snapshot
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              See how your business appears in AI-driven search, where competitors are showing up more often today, and what to improve first.
            </p>
            <div className="mt-8">
              <Link href="/intake/?utm_source=site&utm_medium=cta-button&utm_campaign=faq-dealerships" className="premium-button rounded-2xl px-6 py-3.5 text-sm font-semibold">
                Get My AI Visibility Snapshot
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
