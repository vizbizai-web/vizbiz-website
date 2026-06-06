'use client';

import { FormEvent, useState } from 'react';
import type { LeadRow } from '@/lib/google-sheets';
import { normalizePaidPlan } from '@/lib/paid-intake-logic';

const fieldClass = 'mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition focus:border-[#22D3EE]/70 focus:ring-2 focus:ring-[#22D3EE]/20 placeholder:text-slate-500';
const labelClass = 'block text-sm font-semibold text-white';

export default function PaidIntakeForm({ lead, plan }: { lead: LeadRow; plan?: string }) {
  const paidPlan = normalizePaidPlan(plan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries()) as Record<string, string>;

    try {
      const response = await fetch('/api/paid-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }
      window.location.href = data.nextUrl || `/thank-you?paid=1&lid=${encodeURIComponent(lead.leadId)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit paid intake.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="leadId" value={lead.leadId} />
      <input type="hidden" name="plan" value={paidPlan} />

      <div className="rounded-3xl border border-[#22D3EE]/20 bg-[#22D3EE]/8 p-4 text-sm leading-7 text-slate-200">
        <strong className="text-white">This should take about 5 minutes.</strong> Your answers help us understand what you sell, who you want to reach, and what customers should trust about your business.
      </div>

      {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="businessCategory">Business category *</label>
          <input id="businessCategory" name="businessCategory" required className={fieldClass} placeholder="Med spa, restaurant, dealership..." />
        </div>
        <div>
          <label className={labelClass} htmlFor="goal">Main goal *</label>
          <select id="goal" name="goal" required className={fieldClass} defaultValue="">
            <option value="" disabled>Choose the main priority</option>
            <option>Be recommended more often by AI tools</option>
            <option>Understand gaps against local competitors</option>
            <option>Improve trust signals customers can verify</option>
            <option>Know what to fix first</option>
            <option>Set up monthly visibility tracking</option>
          </select>
        </div>
      </section>

      <div>
        <label className={labelClass} htmlFor="mainServices">Main services or offers *</label>
        <textarea id="mainServices" name="mainServices" required rows={3} className={fieldClass} placeholder="List the services or products you most want people to find you for. Example: emergency plumbing, boiler repair, bathroom renovations." />
      </div>

      <div>
        <label className={labelClass} htmlFor="idealCustomer">Best-fit customer *</label>
        <input id="idealCustomer" name="idealCustomer" required className={fieldClass} placeholder="Example: homeowners, first-time car buyers, local families, brides, or commercial clients." />
      </div>

      <div>
        <label className={labelClass} htmlFor="differentiator">What should customers trust about you?</label>
        <textarea id="differentiator" name="differentiator" rows={2} className={fieldClass} placeholder="Examples: years in business, certifications, faster service, family-owned, luxury experience, warranty, specialty training, strong reviews." />
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Local competitors to compare</h2>
            <p className="mt-1 text-sm text-slate-400">Add the two businesses you are most often compared against. If you are not sure, leave one blank and we will work from the best available evidence.</p>
          </div>
          <span className="inline-flex min-w-16 shrink-0 items-center justify-center rounded-full bg-[#22D3EE]/10 px-3 py-1 text-center text-xs font-semibold leading-none text-[#67E8F9]">Up to 2</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="competitor1Name">Competitor 1</label>
            <input id="competitor1Name" name="competitor1Name" className={fieldClass} defaultValue={lead.competitor.split(',')[0]?.trim() || ''} placeholder="Competitor business name" />
            <input name="competitor1Website" className={fieldClass} placeholder="Competitor website, if known" />
          </div>
          <div>
            <label className={labelClass} htmlFor="competitor2Name">Competitor 2</label>
            <input id="competitor2Name" name="competitor2Name" className={fieldClass} defaultValue={lead.competitor.split(',')[1]?.trim() || ''} placeholder="Competitor business name" />
            <input name="competitor2Website" className={fieldClass} placeholder="Competitor website, if known" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="googleBusinessProfile">Google Business Profile link, if available</label>
          <input id="googleBusinessProfile" name="googleBusinessProfile" className={fieldClass} placeholder="Paste your Google Maps link" />
        </div>
        <div>
          <label className={labelClass} htmlFor="socialLinks">Social or review links</label>
          <input id="socialLinks" name="socialLinks" className={fieldClass} placeholder="Instagram, Facebook, Yelp, TripAdvisor, DealerRater, etc." />
        </div>
      </section>

      <div>
        <label className={labelClass} htmlFor="customerQuestions">What customers want to know before they choose</label>
        <p className="mt-1 text-xs leading-5 text-slate-400">Write the questions people already ask you, or the questions they should ask. We use these to test more natural AI searches.</p>
        <textarea id="customerQuestions" name="customerQuestions" rows={3} className={fieldClass} placeholder={'Examples:\nDo you offer emergency service?\nHow much does this usually cost?\nAre you licensed and insured?\nWhich local option has the best reviews for this?'} />
      </div>

      <div>
        <label className={labelClass} htmlFor="proofSignals">Proof customers should know about</label>
        <textarea id="proofSignals" name="proofSignals" rows={2} className={fieldClass} placeholder="Examples: 15 years in business, 4.8-star rating, licensed technicians, manufacturer certifications, awards, testimonials, before/after results." />
      </div>

      {paidPlan === 'monthly_growth' && (
        <section className="rounded-3xl border border-[#22D3EE]/20 bg-[#22D3EE]/8 p-4">
          <h2 className="text-lg font-semibold text-white">Monthly report focus</h2>
          <p className="mt-1 text-sm text-slate-300">Tell us what you want watched if you continue with monthly reporting.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="monthlyFocus">What should we track monthly?</label>
              <input id="monthlyFocus" name="monthlyFocus" className={fieldClass} placeholder="Example: service pages, target cities, seasonal offers, review movement, competitor changes." />
            </div>
            <div>
              <label className={labelClass} htmlFor="websitePlatform">Website platform</label>
              <select id="websitePlatform" name="websitePlatform" className={fieldClass} defaultValue="">
                <option value="">Not sure / choose one</option>
                <option>WordPress</option>
                <option>Shopify</option>
                <option>Webflow</option>
                <option>Wix</option>
                <option>Squarespace</option>
                <option>Dealer platform</option>
                <option>Custom website</option>
              </select>
            </div>
          </div>
        </section>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-7 text-slate-300">
        <p><strong className="text-white">After this:</strong> we use your answers to prepare the paid report and prioritized action plan. Once it is ready, you will receive your report link by email.</p>
        {paidPlan === 'full_report_fix' && (
          <p className="mt-2 text-[#67E8F9]">If you want ongoing support later, monthly reporting can track your score, competitor movement, and new recommended fixes over time.</p>
        )}
      </div>

      <button disabled={isSubmitting} className="premium-button min-h-13 w-full rounded-2xl px-6 py-4 text-sm font-semibold">
        {isSubmitting ? 'Sending details...' : paidPlan === 'monthly_growth' ? 'Send monthly report details' : 'Send report details'}
      </button>

      <p className="text-center text-xs text-slate-500">Not sure about an answer? Use your best guess. We can clarify anything important before the report is delivered.</p>
    </form>
  );
}
