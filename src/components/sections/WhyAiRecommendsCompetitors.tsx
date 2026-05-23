import { Bot, Braces, Building2, MessageSquareQuote, SearchCheck, Star } from "lucide-react";

const signals = [
  {
    icon: Building2,
    title: "The business is easy to identify",
    body: "AI tools need a clean entity trail: business name, city, service area, contact details, Google profile, and consistent listings. If that trail is messy, a nearby competitor can look safer to recommend.",
  },
  {
    icon: SearchCheck,
    title: "The services match the buyer's question",
    body: "A page that says ‘we do dental care’ is weaker than a page that clearly answers ‘emergency dentist in Oakville’ or ‘Invisalign for adults.’ Specific pages give AI something useful to cite.",
  },
  {
    icon: Star,
    title: "Reviews use the language buyers use",
    body: "Stars help, but the words matter too. Reviews that mention speed, trust, price, pain relief, results, bedside manner, or service quality give AI systems more evidence than generic praise.",
  },
  {
    icon: Braces,
    title: "The website is machine-readable",
    body: "Schema, FAQs, service pages, headings, internal links, robots.txt, sitemap, and llms.txt all help crawlers understand what the business does and where it operates.",
  },
  {
    icon: MessageSquareQuote,
    title: "Other sites confirm the story",
    body: "AI systems do not only trust your homepage. They compare your website against directories, local profiles, category pages, reviews, articles, and competitor mentions.",
  },
  {
    icon: Bot,
    title: "Competitors create the benchmark",
    body: "A score by itself is not enough. VizBiz compares you with the two businesses customers already consider, then shows which signals they have that you do not.",
  },
];

export default function WhyAiRecommendsCompetitors() {
  return (
    <section id="what-you-get" className="bg-[#020617] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22D3EE]">Why AI recommends nearby competitors</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            AI does not guess who owns the local market. It looks for evidence.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            When someone asks ChatGPT, Gemini, Claude, Perplexity, or Google AI for a local recommendation, your website is only one signal. The answer usually comes from a pattern: clear services, clean local data, reviews, schema, and third-party mentions that all point to the same business in the same town, city, ZIP code, or postal code.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <article key={signal.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_50px_rgba(15,23,42,0.35)]">
                <div className="mb-5 inline-flex rounded-2xl bg-cyan-300/10 p-3 text-[#22D3EE]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{signal.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{signal.body}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-6 text-[#0F172A] shadow-[0_0_60px_rgba(34,211,238,0.18)] sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-600">What the free report checks first</p>
          <p className="mt-3 max-w-4xl font-serif text-2xl leading-snug sm:text-3xl">
            Enter your website and two nearby competitors. VizBiz shows whether AI is more likely to recommend you, where your local evidence breaks down, and which fixes should come first.
          </p>
        </div>
      </div>
    </section>
  );
}
