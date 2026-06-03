import Link from "next/link";
import { ArrowRight, Eye, FileText, LockKeyhole, TrendingUp } from "lucide-react";

const journey = [
  {
    step: "01",
    title: "Submit the free intake",
    body: "Share your website, town/city, email, and two nearby competitors. We capture the lead, prepare the snapshot, and email the report link instead of dumping the report immediately after the form.",
  },
  {
    step: "02",
    title: "Open the emailed report link",
    body: "The free report shows your score, realistic AI recommendation moments, and whether the competitors you named look easier for popular AI assistants to trust and recommend.",
  },
  {
    step: "03",
    title: "Build the AI reputation layer early",
    body: "The full report turns the preview into a prioritized fix list: service pages, schema, FAQs, local entity signals, reviews, and monitoring. Early businesses can build trust signals before the AI search wave gets crowded.",
  },
];

const benefits = [
  "Know if popular AI assistants can understand and recommend your business when local buyers ask who to choose",
  "Find the human-style recommendation moments where your website, reviews, or trust signals are weakest",
  "Start building AI-readable reputation before local competitors treat AI search as a serious channel",
  "Move from a free emailed snapshot to a full report, fix package, or monthly monitoring",
];

export default function MiniReportJourney() {
  return (
    <section className="bg-gradient-to-br from-[#FAF7F2] to-[#F2EDE4] px-4 py-16 text-[#0F172A] sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#06B6D4]">From intake to emailed report</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
                The free snapshot starts the AI reputation conversation.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                The intake captures the lead, the email delivers the private report link, and the report page proves the problem. The paid founder report expands that snapshot into platform-by-platform evidence, competitor reasoning, exact fixes, and a prioritized local AI reputation plan.
              </p>
            <div className="mt-8 grid gap-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
                  <Eye className="mt-0.5 h-5 w-5 flex-none text-[#06B6D4]" />
                  <span className="font-semibold">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#0F172A]/10 bg-white/75 p-4 shadow-2xl backdrop-blur sm:p-6">
            <div className="rounded-[1.5rem] bg-[#020617] p-5 text-white sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Mini report flow</p>
                  <h3 className="mt-2 font-serif text-3xl">Simple enough to start. Specific enough to show what your local market is missing.</h3>
                </div>
                <div className="hidden rounded-2xl bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-4 text-[#0F172A] sm:block">
                  <FileText className="h-7 w-7 text-[#06B6D4]" />
                </div>
              </div>

              <div className="grid gap-4">
                {journey.map((item) => (
                  <div key={item.step} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-start gap-4">
                      <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">{item.step}</span>
                      <div>
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-5 text-[#0F172A]">
                  <TrendingUp className="mb-3 h-6 w-6 text-[#06B6D4]" />
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-600">CTA path</p>
                  <p className="mt-2 font-semibold">Free report first. Full report and fix package next. Monitoring when they want to track local competitor movement.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <LockKeyhole className="mb-3 h-6 w-6 text-cyan-200" />
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Locked value</p>
                  <p className="mt-2 text-sm text-slate-300">Prompt evidence, raw results, competitor breakdowns, and fixes your site can use.</p>
                </div>
              </div>

              <Link href="#free-mini-report" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-6 py-4 font-bold text-[#020617]">
                Email me my free AI visibility snapshot <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
