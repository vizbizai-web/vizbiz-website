import { Bot, Compass, FileSearch, Gauge, Map, MessageCircleQuestion, SearchCheck, ShieldCheck, Target, TrendingUp } from "lucide-react";

const agents = [
  {
    name: "Scout",
    role: "Understands your business",
    body: "Reads your website, city, services, offers, and local positioning so the report starts from what you actually sell.",
    icon: Compass,
  },
  {
    name: "Local Analyst",
    role: "Builds buyer-intent context",
    body: "Maps your niche into discovery, trust, service, urgent, comparison, and nearby-market questions buyers ask AI.",
    icon: Map,
  },
  {
    name: "Competitor Finder",
    role: "Benchmarks the two names that matter",
    body: "Uses your supplied competitors first, then flags when AI/search evidence suggests another local business is winning attention.",
    icon: Target,
  },
  {
    name: "Prompt Tester",
    role: "Runs the AI visibility checks",
    body: "Tests real buyer questions and records whether AI recommends you, ignores you, or points customers toward a competitor.",
    icon: MessageCircleQuestion,
  },
  {
    name: "Citation Analyst",
    role: "Finds why AI trusts the winner",
    body: "Looks for the sources, reviews, service pages, schema, directories, and third-party proof AI systems can cite.",
    icon: SearchCheck,
  },
  {
    name: "Entity Auditor",
    role: "Checks machine-readable trust signals",
    body: "Audits schema, sitemap, robots.txt, llms.txt, headings, service clarity, local identity, and review-language gaps.",
    icon: ShieldCheck,
  },
  {
    name: "Gap Mapper",
    role: "Turns findings into fixes",
    body: "Connects each visibility weakness to a practical fix: service page, FAQ block, proof copy, GBP update, schema, or citation gap.",
    icon: FileSearch,
  },
  {
    name: "Revenue Prioritizer",
    role: "Ranks the fixes by commercial intent",
    body: "Separates interesting SEO ideas from the buyer questions most likely to influence calls, bookings, and consultations.",
    icon: Gauge,
  },
  {
    name: "Growth Monitor",
    role: "Tracks movement after the first fix",
    body: "Monthly plans keep watching prompt performance, competitor changes, and new content opportunities as AI answers shift.",
    icon: TrendingUp,
  },
];

export default function AiVisibilityTeam() {
  return (
    <section className="bg-[#020617] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              <Bot className="h-4 w-4 text-[#22D3EE]" />
              Your AI visibility team
            </div>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">
              Not one generic audit. A focused workflow for local AI recommendations.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              VizBiz packages the work like a specialist team: understand your business, test real buyer questions, compare competitors, find the proof AI trusts, and turn the gaps into a fix plan.
            </p>
            <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-white/[0.04] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Claims discipline</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                AI answers vary by platform, date, and user context. VizBiz measures repeatable recommendation patterns and gives you concrete visibility gaps — not guaranteed ChatGPT rankings.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              return (
                <article key={agent.name} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(15,23,42,0.28)]">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="rounded-2xl bg-cyan-300/10 p-3 text-[#22D3EE]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">{agent.name}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{agent.role}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{agent.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
