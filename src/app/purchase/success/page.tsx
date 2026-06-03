import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import VizBizLogo from "@/components/VizBizLogo";
import { listJson, readJson, saveJsonWithKey } from "@/lib/file-store";
import { appendStatus, type MiniLeadRecord, type PaidProduct } from "@/lib/lead-pipeline";
import { buildPaidOrder, buildPaidSuccessExperience, type PaidOrderRecord } from "@/lib/paid-fulfillment";

export default async function PurchaseSuccessPage({ searchParams }: { searchParams: Promise<{ slug?: string; product?: string; payment_id?: string; session_id?: string; intake?: string }> }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const slug = params.slug ?? cookieStore.get("vizbiz_purchase_slug")?.value;
  const product = (params.product ?? cookieStore.get("vizbiz_purchase_product")?.value) as PaidProduct | undefined;
  if (!slug || (product !== "fix_package" && product !== "monthly_plan")) notFound();

  const { lead, order } = await confirmPaidOrder({ slug, product, paymentId: params.payment_id ?? params.session_id ?? null });
  const experience = buildPaidSuccessExperience(order);
  const intakeReceived = params.intake === "received" || Boolean(order.intake);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.20),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(6,182,212,0.12),transparent_28%),linear-gradient(180deg,#020617,#0F172A_58%,#020617)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <VizBizLogo variant="dark" size="md" />
            <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
              <Link href={`/mini-report/${order.reportSlug}/`} className="rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 hover:bg-white/10">View mini report</Link>
              <Link href="/" className="rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 hover:bg-white/10">Back home</Link>
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">Payment confirmed</p>
              <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">{order.promise.headline}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{order.promise.subheadline}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <StatusMetric label="Client" value={order.clientName} />
                <StatusMetric label="Status" value={intakeReceived ? "Queued" : "Intake needed"} />
                <StatusMetric label="Delivery" value={order.promise.deliveryWindow} />
              </div>

              <div className="mt-6 rounded-3xl border border-cyan-200/20 bg-cyan-300/10 p-5 text-cyan-50">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-cyan-100" />
                  <div>
                    <p className="font-bold">What started immediately</p>
                    <p className="mt-1 text-sm leading-6 text-cyan-50/90">{`${experience.whatStarted} ${experience.reassurance}`}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.38)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Next best step</p>
                  <h2 className="mt-2 font-serif text-3xl">{experience.primaryCta}</h2>
                </div>
                <Sparkles className="h-7 w-7 text-cyan-200" />
              </div>

              {intakeReceived ? (
                <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                  <CheckCircle2 className="mb-3 h-6 w-6 text-emerald-200" />
                  <p className="font-bold text-emerald-50">Intake received.</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/85">Your project is queued. We’ll use these details to sharpen the paid report and next recommendations.</p>
                </div>
              ) : (
                <PaidIntakeForm order={order} lead={lead} />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="inline-flex rounded-full border border-cyan-200/20 bg-white/[0.05] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-cyan-100">Fulfillment timeline</p>
            <div className="mt-6 grid gap-4">
              {order.timeline.map((item) => (
                <div key={item.label} className="flex gap-4 rounded-2xl border border-white/10 bg-[#0F172A] p-4">
                  <TimelineDot status={item.status} />
                  <div>
                    <p className="font-bold text-white">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="inline-flex rounded-full border border-cyan-200/20 bg-white/[0.05] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-cyan-100">What happens now</p>
            <div className="mt-6 grid gap-3">
              {order.nextSteps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-sm leading-6 text-slate-200">
                  <span className="mr-2 font-black text-cyan-200">{index + 1}.</span>{" "}{step}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">
              <p className="font-bold">Need help?</p>
              <p className="mt-1">Reply to your VizBiz email with any context or urgent deadline. Your mini report stays available while the paid work is prepared.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

async function confirmPaidOrder(input: { slug: string; product: PaidProduct; paymentId: string | null }) {
  const leads = await listJson<MiniLeadRecord>("mini-leads");
  const lead = leads.find((record) => record.reportSlug === input.slug);
  if (!lead) notFound();

  const now = new Date().toISOString();
  const existingOrder = await readJson<PaidOrderRecord>("paid-orders", `paid_${input.slug}_${input.product}`);
  const order = existingOrder ?? buildPaidOrder({ lead, product: input.product, paymentId: input.paymentId, now });

  await saveJsonWithKey("paid-orders", order.id, order);
  await saveJsonWithKey("mini-leads", lead.id, appendStatus(lead, "paid_conversion", `${input.product} paid`, now));

  return { lead, order };
}

function PaidIntakeForm({ order, lead }: { order: PaidOrderRecord; lead: MiniLeadRecord }) {
  const client = lead.client as { name?: string; websiteUrl?: string; city?: string } | null;
  return (
    <form action="/api/purchase/intake" method="post" className="mt-6 grid max-h-[68vh] gap-4 overflow-y-auto pr-1">
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="slug" value={order.reportSlug} />
      <input type="hidden" name="product" value={order.product} />

      <FormSection title="Business confirmation">
        <Field label="Best contact name" name="contactName" placeholder="Alex Cadena" required />
        <Field label="Your role" name="role" placeholder="Owner, marketing manager, office manager..." />
        <Field label="Business display name" name="businessDisplayName" placeholder={client?.name ?? order.clientName} />
        <Field label="Primary location" name="primaryLocation" placeholder={client?.city ?? "City, state/province"} />
        <Field label="Country" name="country" placeholder="United States, Canada, UK..." />
        <Field label="Confirmed niche/category" name="confirmedNiche" placeholder="Family dentist, med spa, roofer..." />
        <Field label="Google Business Profile URL" name="googleBusinessProfileUrl" placeholder="https://business.google.com/..." />
        <TextArea label="Social profile links" name="socialProfiles" placeholder="Instagram, Facebook, LinkedIn, TikTok — one per line" />
      </FormSection>

      <FormSection title="Competitor confirmation">
        <Field label="Competitor 1 name" name="competitor1Name" placeholder="Main competitor" />
        <Field label="Competitor 1 website" name="competitor1Website" placeholder="https://competitor.com" />
        <Field label="Competitor 1 Google/Maps URL" name="competitor1GoogleUrl" placeholder="https://maps.google.com/..." />
        <Field label="Why this competitor matters" name="competitor1Reason" placeholder="Outranks us, wins premium jobs..." />
        <Field label="Competitor 2 name" name="competitor2Name" placeholder="Second competitor" />
        <Field label="Competitor 2 website" name="competitor2Website" placeholder="https://competitor.com" />
        <Field label="Competitor 2 Google/Maps URL" name="competitor2GoogleUrl" placeholder="https://maps.google.com/..." />
        <Field label="Why this competitor matters" name="competitor2Reason" placeholder="Visible in AI, more reviews..." />
        <TextArea label="Additional competitors" name="additionalCompetitors" placeholder="One competitor per line" />
        <Checkbox label="VizBiz may research additional local competitors if needed" name="additionalResearchPermission" />
      </FormSection>

      <FormSection title="Services/products to win">
        <TextArea label="Top services/products to win" name="topServicesToWin" placeholder="One per line: emergency dental, implants, Invisalign..." />
        <Field label="Highest-value service" name="highestValueService" placeholder="Dental implants, roof replacement..." />
        <Field label="Average customer value" name="averageCustomerValue" placeholder="$500, $2,500, $10k+..." />
        <Field label="Primary conversion action" name="primaryConversionAction" placeholder="Phone call, booking form, quote request..." />
        <Field label="Primary phone" name="primaryPhone" placeholder="Best public tracking/booking phone" />
        <Field label="Customer types" name="customerTypes" placeholder="Families, homeowners, commercial buyers..." />
      </FormSection>

      <FormSection title="Fix/access details">
        <Field label="Website platform" name="websitePlatform" placeholder="WordPress, Squarespace, Shopify, custom..." />
        <Field label="Who edits the website?" name="websiteEditor" placeholder="You, agency, developer, unknown..." />
        <Field label="Implementation permission" name="implementationPermission" placeholder="Recommend only, can edit with approval, full access..." />
        <Field label="Google Business Profile access" name="googleBusinessProfileAccess" placeholder="Owner, manager, can invite, no access..." />
        <Field label="Analytics/Search Console access" name="analyticsAccess" placeholder="GA4/GSC available, not sure, no access..." />
        <Field label="Booking/CRM platform" name="bookingCrmPlatform" placeholder="Calendly, Jane, HubSpot, ServiceTitan..." />
        <Field label="Schema/SEO tools already installed" name="schemaTools" placeholder="Yoast, RankMath, LocalBusiness schema..." />
      </FormSection>

      <FormSection title="Proof/reviews/content">
        <TextArea label="Common questions customers ask" name="commonQuestions" placeholder="One question per line" />
        <TextArea label="Common objections" name="commonObjections" placeholder="Price, timing, trust, insurance..." />
        <TextArea label="Differentiators/proof points" name="differentiators" placeholder="Awards, guarantees, years in business, specialties..." />
        <TextArea label="Review links" name="reviewLinks" placeholder="Google, Yelp, Trustpilot — one per line" />
        <TextArea label="Proof/case study links" name="proofLinks" placeholder="Before/after, testimonials, case studies — one per line" />
        <TextArea label="Existing FAQs" name="existingFaqs" placeholder="Paste FAQs or link to FAQ pages" />
        <TextArea label="Languages served" name="languagesServed" placeholder="English, Spanish, French..." rows={2} />
      </FormSection>

      <FormSection title="Urgency/approval constraints">
        <TextArea label="What do you want fixed first?" name="urgentGoal" placeholder="Most important visibility goal or urgent problem." />
        <Field label="Deadline or launch date" name="deadline" placeholder="No rush, before June 15, this week..." />
        <Field label="Seasonal priorities" name="seasonalPriorities" placeholder="Summer rush, tax season, back-to-school..." />
        <TextArea label="Known AI search issues" name="knownAiSearchIssues" placeholder="ChatGPT names competitors, wrong address, missing services..." />
        <TextArea label="Approval/legal/brand constraints" name="approvalConstraints" placeholder="Claims to avoid, review process, compliance notes..." />
        <TextArea label="Monthly monitoring markets" name="monthlyMonitoringMarkets" placeholder="For monthly plan: one city/neighborhood per line" />
        <Field label="Monthly update preference" name="monthlyUpdatePreference" placeholder="Email summary, call, Loom walkthrough..." />
        <Field label="Legacy priority services" name="priorityServices" placeholder="Optional: services from earlier checkout notes" />
        <Field label="Anything else we should know?" name="notes" placeholder={`Best contact email: ${lead.email}. Website: ${client?.websiteUrl ?? ""}`} />
      </FormSection>

      <button className="sticky bottom-0 mt-2 rounded-2xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-5 py-4 font-black text-[#020617] shadow-[0_0_32px_rgba(34,211,238,0.22)]" type="submit">
        Send Intake & Queue My Work
      </button>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-3 rounded-3xl border border-white/10 bg-[#020617]/45 p-4">
      <legend className="px-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, name, placeholder, required = false }: { label: string; name: string; placeholder: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-cyan-50">
      {label}
      <input required={required} name={name} placeholder={placeholder} className="rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm font-normal text-white outline-none ring-cyan-300/30 placeholder:text-slate-500 focus:ring-2" />
    </label>
  );
}

function TextArea({ label, name, placeholder, rows = 3 }: { label: string; name: string; placeholder: string; rows?: number }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-cyan-50">
      {label}
      <textarea name={name} rows={rows} placeholder={placeholder} className="rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm font-normal text-white outline-none ring-cyan-300/30 placeholder:text-slate-500 focus:ring-2" />
    </label>
  );
}

function Checkbox({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm font-bold text-cyan-50">
      <input type="checkbox" name={name} className="mt-1 h-4 w-4 rounded border-white/20 bg-[#020617] accent-cyan-300" />
      <span>{label}</span>
    </label>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function TimelineDot({ status }: { status: "active" | "pending" | "complete" }) {
  const className = status === "complete" ? "bg-emerald-300" : status === "active" ? "bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.45)]" : "bg-slate-600";
  return <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${className}`} />;
}
