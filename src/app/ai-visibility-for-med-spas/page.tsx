import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const pageUrl = "https://vizbiz.ai/ai-visibility-for-med-spas/";

export const metadata: Metadata = {
  title: "AI Visibility for Med Spas | Become the Med Spa AI Recommends | VizBiz",
  description:
    "Learn how med spas can improve visibility in ChatGPT, Google AI, Gemini, Claude, Perplexity, maps, reviews, and answer engines when clients ask who to trust nearby.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "AI Visibility for Med Spas | VizBiz",
    description:
      "A practical guide for med spas that want stronger AI recommendation readiness, review trust, service clarity, schema, and local discovery signals.",
    url: pageUrl,
    siteName: "VizBiz.ai",
    type: "article",
  },
};

const buyerQuestions = [
  "Which med spa near me is trusted for Botox or fillers?",
  "Where should I go for laser hair removal with good reviews?",
  "What med spa explains pricing, safety, and before-and-after results clearly?",
  "Which clinic is best for microneedling, facials, or skin rejuvenation in my city?",
];

const visibilitySignals = [
  {
    title: "Service clarity",
    body: "Botox, fillers, laser hair removal, facials, microneedling, skin rejuvenation, and membership offers are explained in plain language.",
  },
  {
    title: "Trust proof",
    body: "Reviews, practitioner credentials, before-and-after proof, safety notes, and consultation policies are visible and consistent.",
  },
  {
    title: "Local entity strength",
    body: "Name, address, phone, service area, booking paths, and Google profile details match across the web.",
  },
  {
    title: "Answer-ready content",
    body: "The site answers real client questions about pricing, suitability, downtime, risks, prep, aftercare, and expected results.",
  },
  {
    title: "Machine readability",
    body: "Schema, sitemap, crawlable service pages, FAQs, and llms.txt make the business easier for AI systems to understand.",
  },
];

const auditAreas = [
  "Whether the med spa appears when buyers ask AI assistants for nearby recommendations",
  "Which local competitors have stronger review, content, service, or entity signals",
  "Whether service pages are specific enough for treatment-level discovery",
  "Whether trust proof is easy for AI systems and customers to verify",
  "Which website, schema, FAQ, review, and profile fixes should be prioritized first",
];

const faqItems = [
  {
    question: "What is AI visibility for med spas?",
    answer:
      "AI visibility is how often a med spa is understood, cited, or recommended when people ask AI assistants and AI-powered search tools for local treatment recommendations, pricing guidance, trust signals, or provider comparisons.",
  },
  {
    question: "Does med spa AI visibility replace SEO?",
    answer:
      "No. SEO still matters. AI visibility builds on SEO by improving the structured, trustworthy, answer-ready signals that AI systems use when summarizing options and deciding which businesses are safe to recommend.",
  },
  {
    question: "What makes a med spa more recommendable to AI systems?",
    answer:
      "Clear treatment pages, consistent business information, detailed reviews, practitioner trust proof, before-and-after context, safety information, FAQ answers, local citations, schema markup, and easy booking paths all help.",
  },
  {
    question: "Can VizBiz check competitors too?",
    answer:
      "Yes. VizBiz compares a med spa against two named local competitors so the report can show where trust, treatment visibility, entity clarity, and machine-readiness signals are stronger or weaker.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "AI Visibility for Med Spas",
    description:
      "A practical guide to AI visibility, answer-engine readiness, local trust signals, and recommendation readiness for med spas.",
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    author: { "@type": "Organization", name: "VizBiz", url: "https://vizbiz.ai" },
    publisher: { "@type": "Organization", name: "VizBiz", url: "https://vizbiz.ai" },
    about: ["AI visibility", "med spa marketing", "local SEO", "answer engine optimization", "GEO"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI Visibility Audit for Med Spas",
    serviceType: "AI visibility audit and recommendation-readiness improvement for med spas",
    provider: { "@type": "Organization", name: "VizBiz.ai", url: "https://vizbiz.ai" },
    areaServed: "Worldwide",
    audience: { "@type": "Audience", audienceType: "Med spa owners and local aesthetic clinics" },
    description:
      "VizBiz checks whether med spas are legible, trusted, and recommendable across AI assistants, AI search, maps, reviews, website content, schema, and competitor comparison signals.",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vizbiz.ai/" },
      { "@type": "ListItem", position: 2, name: "AI Visibility for Med Spas", item: pageUrl },
    ],
  },
];

export default function AiVisibilityForMedSpasPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader ctaLabel="Run Free Report" />

      <section className="section-shell px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="section-kicker">AI visibility guide for med spas</div>
          <h1 className="display-font mt-6 max-w-4xl text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            Become the med spa AI recommends.
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
            When someone asks ChatGPT, Google AI, Gemini, Claude, or Perplexity which med spa to trust nearby, the answer is shaped by more than a pretty website. AI systems look for clear treatments, credible proof, consistent local signals, reviews, safety context, and crawlable answers.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="glass-card rounded-[2rem] p-6 sm:p-8">
              <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em]">The buyer questions AI is answering</h2>
              <ul className="mt-6 space-y-3 text-base leading-8 text-[var(--text-secondary)]">
                {buyerQuestions.map((question) => (
                  <li key={question} className="flex items-start gap-3">
                    <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                    <span>“{question}”</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-cyan-200/20 bg-gradient-to-br from-cyan-300/15 via-slate-900/80 to-slate-950 p-6 shadow-[0_0_60px_rgba(34,211,238,0.14)] sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Why it matters</div>
              <p className="mt-4 text-2xl font-semibold leading-tight text-white">
                A med spa can be excellent and still be invisible if AI cannot verify why it deserves the recommendation.
              </p>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                VizBiz turns scattered trust signals into a clear visibility plan: what AI can already understand, what competitors explain better, and what to fix first so your clinic becomes easier to find, trust, and choose.
              </p>
              <Link
                href="/intake/?utm_source=site&utm_medium=cta-button&utm_campaign=med-spa-ai-visibility"
                className="mt-7 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-6 py-3 text-sm font-bold text-[#020617] shadow-[0_0_28px_rgba(34,211,238,0.26)] transition hover:scale-[1.01]"
              >
                Run my free med spa visibility report
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What affects AI visibility for med spas?
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI recommendation readiness comes from a mix of content, proof, local trust, and technical clarity. The move is not “write more blogs.” That is the marketing equivalent of putting glitter on a filing cabinet. Useful, but only if the cabinet has files.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {visibilitySignals.map((signal) => (
                <div key={signal.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold text-white">{signal.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{signal.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="what-you-get" className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What a VizBiz med spa audit checks
            </h2>
            <ul className="mt-6 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {auditAreas.map((area) => (
                <li key={area} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="glass-card rounded-[2rem] p-6 sm:p-8">
              <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em]">Common gaps</h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                <li>• Treatment pages exist, but they do not answer real suitability, price, safety, or aftercare questions.</li>
                <li>• Reviews are strong, but the website does not summarize why clients trust the clinic.</li>
                <li>• Booking paths are visible to humans but not clearly connected to services for AI crawlers.</li>
                <li>• Schema, sitemap, FAQ, and llms.txt signals are missing or too generic.</li>
              </ul>
            </div>
            <div className="glass-card rounded-[2rem] p-6 sm:p-8">
              <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em]">Better outcome</h2>
              <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
                The goal is simple: when AI systems compare nearby aesthetic clinics, your med spa has the clearest service pages, strongest verified proof, most consistent entity signals, and easiest next step for the customer.
              </p>
              <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
                No ranking guarantees. No magic AI fairy dust. Just cleaner digital trust infrastructure that helps real customers choose with more confidence.
              </p>
            </div>
          </div>

          <div id="faq" className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Med spa AI visibility FAQ
            </h2>
            <div className="mt-6 space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="pricing" className="rounded-[2rem] border border-cyan-200/20 bg-cyan-300/10 p-6 text-center sm:p-8">
            <h2 className="display-font text-[2.2rem] font-semibold tracking-[-0.04em] text-white">See what AI can understand about your med spa.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Run the free mini report, add two nearby competitors, and see which signals need work before buyers ask AI who to book.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/intake/?utm_source=site&utm_medium=cta-button&utm_campaign=med-spa-final-cta" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-7 py-3 text-sm font-bold text-[#020617]">
                Run my free local AI visibility report
              </Link>
              <Link href="/pricing/" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10">
                View paid options
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
