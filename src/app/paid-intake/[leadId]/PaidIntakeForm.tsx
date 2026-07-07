'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { LeadRow } from '@/lib/google-sheets';
import type { PaidPlan, PaidIntakePrefill } from '@/lib/paid-intake-logic';

const fieldClass = 'mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-base text-white outline-none transition focus:border-[#22D3EE]/70 focus:ring-2 focus:ring-[#22D3EE]/20 placeholder:text-slate-500';
const labelClass = 'block text-sm font-semibold text-white';
const helpClass = 'mt-1 text-xs leading-5 text-slate-400';

function competitorLines(value: string): string {
  return value || '';
}

export default function PaidIntakeForm({ lead, paidPlan, prefill }: { lead: LeadRow; paidPlan: PaidPlan; prefill: PaidIntakePrefill }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultPriority = useMemo(() => prefill.services.split(',')[0]?.trim() || '', [prefill.services]);

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

      <div className="rounded-3xl border border-[#22D3EE]/20 bg-[#22D3EE]/8 p-4 text-sm leading-7 text-slate-200">
        <strong className="text-white">We already did the heavy lift.</strong> Confirm what we found, correct anything that is wrong, then add the few details only you can know. The plan comes from Stripe — not this form.
      </div>

      {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#67E8F9]">Confirm or correct</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Resolved business profile</h2>
          <p className={helpClass}>These fields are pre-filled from your resolved profile and local evidence. If you correct one, we treat your correction as client-verified evidence.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="confirmedBusinessCategory">Business category *</label>
            <input id="confirmedBusinessCategory" name="confirmedBusinessCategory" required className={fieldClass} defaultValue={prefill.businessCategory} placeholder="Example: med spa, tax lawyer, dealership" />
          </div>
          <div>
            <label className={labelClass} htmlFor="confirmedLocation">Location / market *</label>
            <input id="confirmedLocation" name="confirmedLocation" required className={fieldClass} defaultValue={prefill.location} placeholder="Example: Oakville, Ontario" />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass} htmlFor="confirmedServices">Services we should understand *</label>
          <textarea id="confirmedServices" name="confirmedServices" required rows={3} className={fieldClass} defaultValue={prefill.services} placeholder="Confirm or correct the services customers should find you for." />
        </div>
        <div className="mt-4">
          <label className={labelClass} htmlFor="confirmedCompetitors">Competitors / alternatives to compare *</label>
          <p className={helpClass}>One per line. Add a website after a pipe if useful: Competitor Name | competitor.com</p>
          <textarea id="confirmedCompetitors" name="confirmedCompetitors" required rows={3} className={fieldClass} defaultValue={competitorLines(prefill.competitors)} placeholder={'Competitor One\nCompetitor Two'} />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#67E8F9]">Only-you-know details</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Make the paid report sharper</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="contactPersonName">Contact person name *</label>
            <input id="contactPersonName" name="contactPersonName" required className={fieldClass} defaultValue={lead.contactName || ''} placeholder="Who should we address?" />
          </div>
          <div>
            <label className={labelClass} htmlFor="priorityService">Single priority service *</label>
            <input id="priorityService" name="priorityService" required className={fieldClass} defaultValue={defaultPriority} placeholder="The one service you most want to win" />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="customerQuestions">Customer questions you actually get *</label>
          <p className={helpClass}>Minimum 1, up to 5. We use these to seed buyer prompts and the FAQ artifact.</p>
          <textarea id="customerQuestions" name="customerQuestions" required rows={5} className={fieldClass} placeholder={'Do you offer same-day service?\nHow much does this usually cost?\nAre you licensed and insured?'} />
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="proofAssets">Proof assets</label>
          <p className={helpClass}>Certifications, years in business, awards, associations, guarantees, review milestones — anything we should trace before using as a claim.</p>
          <textarea id="proofAssets" name="proofAssets" rows={3} className={fieldClass} placeholder="Example: 12 years in business; licensed technicians; 4.8-star Google rating; local award winner" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="gbpAccessStatus">Google Business Profile access *</label>
            <select id="gbpAccessStatus" name="gbpAccessStatus" required className={fieldClass} defaultValue="">
              <option value="" disabled>Choose one</option>
              <option>We have owner/admin access</option>
              <option>Agency or web vendor has access</option>
              <option>Not sure who has access</option>
              <option>We do not have access yet</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="webVendorEmail">Web vendor email</label>
            <input id="webVendorEmail" name="webVendorEmail" type="email" className={fieldClass} placeholder="Optional — person who can edit the website" />
          </div>
        </div>
      </section>

      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-7 text-slate-300">
        <p><strong className="text-white">After this:</strong> we use your confirmed profile, real customer questions, and proof assets to prepare the paid report. If something looks risky, we flag it before it becomes client-facing copy.</p>
        {paidPlan === 'monthly_growth' && <p className="mt-2 text-[#67E8F9]">Your monthly plan will use this profile as the baseline for future comparisons.</p>}
      </div>

      <button disabled={isSubmitting} className="premium-button min-h-13 w-full rounded-2xl px-6 py-4 text-base font-semibold">
        {isSubmitting ? 'Saving verified profile...' : 'Confirm profile and send details'}
      </button>

      <p className="text-center text-xs text-slate-500">Corrections here outrank automated guesses. Robots are useful; clients still get veto power. Civilization survives another day.</p>
    </form>
  );
}
