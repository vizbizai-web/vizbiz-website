import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { getLeadByLeadId } from '@/lib/google-sheets';
import { normalizePaidPlan } from '@/lib/paid-intake-logic';
import PaidIntakeForm from './PaidIntakeForm';

const PAID_INTAKE_ALLOWED_STATUSES = new Set([
  'paid_checkout_complete',
  'paid_intake_pending',
  'paid_intake_submitted',
  'paid_report_drafting',
  'paid_report_ready_for_review',
]);

export const metadata: Metadata = {
  title: 'Paid Report Intake | VizBiz.ai',
  description: 'Share the business context VizBiz needs to prepare a sharper paid AI visibility report and action plan.',
  robots: { index: false, follow: false },
};

export default async function PaidIntakePage({
  params,
  searchParams,
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { leadId } = await params;
  const { plan } = await searchParams;
  const lead = await getLeadByLeadId(leadId);
  const paidPlan = normalizePaidPlan(plan);

  if (!lead) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-3xl font-semibold">Paid intake link not found</h1>
          <p className="mt-4 text-slate-300">If you just purchased a report, reply to your VizBiz email and we’ll resend the correct private intake link.</p>
          <Link href="/" className="premium-button mt-8 inline-flex rounded-2xl px-6 py-3 text-sm font-semibold">Back to VizBiz</Link>
        </div>
      </main>
    );
  }

  if (!PAID_INTAKE_ALLOWED_STATUSES.has(lead.status)) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-3xl font-semibold">Paid intake is not active yet</h1>
          <p className="mt-4 text-slate-300">This private intake opens after checkout is confirmed. If you already paid, reply to your VizBiz email and we’ll resend the correct link.</p>
          <Link href="/" className="premium-button mt-8 inline-flex rounded-2xl px-6 py-3 text-sm font-semibold">Back to VizBiz</Link>
        </div>
      </main>
    );
  }

  const isMonthly = paidPlan === 'monthly_growth';

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_32rem),linear-gradient(135deg,#020617_0%,#0F172A_58%,#020617_100%)] text-white">
      <header className="border-b border-white/10 bg-[#020617]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="VizBiz.ai" className="h-11 w-auto rounded-lg" />
          </Link>
          <span className="rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#67E8F9]">
            Paid report intake
          </span>
        </div>
      </header>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <aside className="lg:sticky lg:top-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#22D3EE]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#67E8F9]">
                <Sparkles className="h-3.5 w-3.5" /> {isMonthly ? 'Monthly Growth Plan' : 'Full Report + Fix Pack'}
              </div>
              <h1 className="font-serif text-4xl leading-[0.95] tracking-[-0.04em] sm:text-5xl">
                Tell us what matters most before we prepare your paid report.
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Your free snapshot gave us the starting point. These answers help us focus the paid report on the services you want known for, the local businesses you care about, and the proof customers should see before they choose you.
              </p>

              <div className="mt-7 space-y-4">
                {[
                  'A deeper read on how AI systems understand your business',
                  'A focused comparison against the two local competitors you care about most',
                  'Better AI search questions based on real buying decisions',
                  isMonthly ? 'Monthly tracking focused on your priority services and market' : 'A clear path to continue with monthly tracking after the one-time report',
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22D3EE]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <ShieldCheck className="h-5 w-5 text-[#22D3EE]" />
                  <p className="mt-3 text-sm font-semibold">Built around your market</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">Your answers help us focus the report on the services, locations, and trust signals that matter most to your customers.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <TrendingUp className="h-5 w-5 text-[#22D3EE]" />
                  <p className="mt-3 text-sm font-semibold">Monthly reporting stays available</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">If you start with the one-time report, you can still add monthly visibility tracking later. That adds score refreshes, competitor movement, and new recommendations over time.</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="rounded-[2rem] border border-white/10 bg-[#020617]/72 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
            <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Report for</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{lead.dealershipName}</h2>
              <p className="mt-1 text-sm text-slate-400">{lead.website} • {lead.city}</p>
            </div>
            <PaidIntakeForm lead={lead} plan={paidPlan} />
          </div>
        </div>
      </section>
    </main>
  );
}
