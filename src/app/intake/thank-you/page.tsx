import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Mail, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import VizBizLogo from "@/components/VizBizLogo";

export const metadata = {
  title: "Your VizBiz AI Visibility Snapshot Is Being Prepared",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function IntakeThankYouPage({ searchParams }: { searchParams: Promise<{ email?: string; report?: string; delivery?: string }> }) {
  const params = await searchParams;
  const email = params.email?.trim();
  const delivery = params.delivery;
  const emailSent = delivery === "sent";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <section className="bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_32%),linear-gradient(180deg,#020617,#0F172A_62%,#020617)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <VizBizLogo variant="dark" size="md" />
            <Link href="/" className="rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100 hover:bg-white/10">Back home</Link>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
                <CheckCircle2 className="h-4 w-4" /> Intake received
              </p>
              <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Your AI visibility snapshot is being prepared.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Search is changing. Customers are not only typing keywords into Google anymore — they are asking popular AI assistants and AI-powered search tools who to trust, where to go, and which local business to choose.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-50">
                {emailSent
                  ? <>We emailed your free report link{email ? <> to <span className="font-bold text-white">{email}</span></> : null}. If you do not see it, check spam or promotions.</>
                  : <>Your report link will be emailed shortly{email ? <> to <span className="font-bold text-white">{email}</span></> : null}. If the email takes a moment, we are still preparing the snapshot and saving the lead.</>}
              </p>
              <div className="mt-7 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">
                <p className="font-black text-white">Next step: check your inbox.</p>
                <p className="mt-1">The report link is delivered by email so you have it saved, can forward it to your team, and can return when you are ready to review the paid fix options.</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-white/[0.09] to-cyan-300/[0.06] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.32)] sm:p-7">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-6 text-[#0F172A]">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0891B2]">Why this matters now</p>
                <h2 className="mt-3 font-serif text-3xl leading-tight">Build your AI reputation before competitors do.</h2>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  Google still matters. But AI is becoming a new recommendation layer between buyers and businesses. The businesses that organize their services, reviews, FAQs, schema, and local proof early may become easier for AI systems to understand and recommend later.
                </p>
                <div className="mt-5 grid gap-3">
                  <NextStep icon={<Search className="h-5 w-5" />} title="We test realistic recommendation moments" body="Questions like: “I’m nearby and need this service. Who should I consider?” — not just keyword strings." />
                  <NextStep icon={<ShieldCheck className="h-5 w-5" />} title="We look for AI-readable trust signals" body="Website clarity, reviews, local proof, service pages, schema, and consistent business details." />
                  <NextStep icon={<TrendingUp className="h-5 w-5" />} title="The full report turns the snapshot into a fix plan" body="Exact page map, FAQ blocks, schema recommendations, competitor evidence, and priority order stay in the paid report." />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <InfoCard icon={<Mail className="h-5 w-5" />} title="Check your inbox" body="Your email contains the private report link and a quick explanation of what we found." />
            <InfoCard icon={<Sparkles className="h-5 w-5" />} title="Read the score first" body="The free report shows whether your business appeared in the first AI recommendation snapshot." />
            <InfoCard icon={<ArrowRight className="h-5 w-5" />} title="Choose the next step" body="If the snapshot reveals gaps, the $88 Full Report + Fix turns it into a prioritized action plan." />
          </div>
        </div>
      </section>
    </main>
  );
}

function NextStep({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/70 p-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-cyan-200">{icon}</div>
      <div>
        <p className="font-black text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{body}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_52px_rgba(2,6,23,0.18)]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">{icon}</div>
      <h3 className="font-serif text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}
