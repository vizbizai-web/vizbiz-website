import type { MiniLeadRecord, PaidProduct } from "./lead-pipeline";

export type PaidFulfillmentStatus = "intake_pending" | "queued" | "in_progress" | "delivered";

export interface PaidFulfillmentTimelineItem {
  label: string;
  description: string;
  status: "active" | "pending" | "complete";
}

export interface PaidFulfillmentPromise {
  headline: string;
  subheadline: string;
  deliveryWindow: string;
}

export interface PaidIntakeDetails {
  contactName: string;
  role: string;
  googleBusinessProfileUrl: string;
  socialProfiles: string[];
  priorityServices: string;
  urgentGoal: string;
  notes: string;
  submittedAt?: string;
}

export interface PaidOrderRecord {
  id: string;
  leadId: string;
  auditId: string;
  reportSlug: string;
  email: string;
  clientName: string;
  product: PaidProduct;
  paymentId: string | null;
  status: PaidFulfillmentStatus;
  promise: PaidFulfillmentPromise;
  nextSteps: string[];
  timeline: PaidFulfillmentTimelineItem[];
  intake: PaidIntakeDetails | null;
  createdAt: string;
  updatedAt: string;
}

export function buildPaidOrder(input: {
  lead: MiniLeadRecord;
  product: PaidProduct;
  paymentId?: string | null;
  now?: string;
}): PaidOrderRecord {
  const now = input.now ?? new Date().toISOString();
  const client = clientFromLead(input.lead);
  const promise = promiseFor(input.product);

  return {
    id: `paid_${input.lead.reportSlug}_${input.product}`,
    leadId: input.lead.id,
    auditId: input.lead.auditId,
    reportSlug: input.lead.reportSlug,
    email: input.lead.email,
    clientName: client.name,
    product: input.product,
    paymentId: input.paymentId ?? null,
    status: "intake_pending",
    promise,
    nextSteps: nextStepsFor(input.product),
    timeline: timelineFor(input.product),
    intake: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildPaidSuccessExperience(order: PaidOrderRecord) {
  const isMonthly = order.product === "monthly_plan";
  return {
    eyebrow: isMonthly ? "$188 Monthly Growth Plan activated" : "$88 Full Report + Fix purchased",
    primaryCta: isMonthly ? "Complete Monthly Growth Intake" : "Complete My Full Report Intake",
    whatStarted: isMonthly
      ? "Your baseline audit and monthly local competitor monitoring are now queued."
      : "Your expanded audit and one-time Full Report + Fix are now queued.",
    reassurance: "You do not need to chase us — this page confirms the project is in the system and gives you the fastest next step.",
  };
}

export function normalizePaidIntake(input: Partial<Record<keyof PaidIntakeDetails, string>> & { socialProfiles?: string }): PaidIntakeDetails {
  return {
    contactName: clean(input.contactName),
    role: clean(input.role),
    googleBusinessProfileUrl: normalizeUrl(clean(input.googleBusinessProfileUrl)),
    socialProfiles: splitLines(input.socialProfiles).map(normalizeUrl).filter(Boolean),
    priorityServices: clean(input.priorityServices),
    urgentGoal: clean(input.urgentGoal),
    notes: clean(input.notes),
  };
}

export function attachPaidIntake(order: PaidOrderRecord, intake: PaidIntakeDetails, now = new Date().toISOString()): PaidOrderRecord {
  return {
    ...order,
    status: "queued",
    intake: { ...intake, submittedAt: now },
    timeline: order.timeline.map((item) => item.label === "Paid intake" ? { ...item, status: "complete" } : item.label === "Full audit queued" || item.label === "Baseline audit queued" ? { ...item, status: "active" } : item),
    updatedAt: now,
  };
}

function promiseFor(product: PaidProduct): PaidFulfillmentPromise {
  if (product === "monthly_plan") {
    return {
      headline: "Your Monthly Full Report Growth Plan is active",
      subheadline: "We’re setting your baseline, confirming competitors, and preparing the first 30-day action plan.",
      deliveryWindow: "First baseline within 2–3 business days",
    };
  }

  return {
    headline: "Your One-Time Full Report + Fix is now underway",
    subheadline: "We’re expanding your free mini report into a full local AI visibility report with priority fixes, competitor gaps, and implementation guidance.",
    deliveryWindow: "2–3 business days",
  };
}

function nextStepsFor(product: PaidProduct) {
  if (product === "monthly_plan") {
    return [
      "Complete the paid intake so we can confirm your services, competitors, and monitoring priorities.",
      "We will prepare your baseline AI Visibility report and first 30-day action plan.",
      "Monthly local competitor movement and visibility updates begin after the baseline is set.",
    ];
  }

  return [
    "Complete the paid intake so we can make the fix plan more accurate.",
    "We will expand the audit beyond the free preview with deeper prompt, competitor, website, schema, and AI Social Proof checks.",
    "Your full report and implementation roadmap will be prepared within the delivery window.",
  ];
}

function timelineFor(product: PaidProduct): PaidFulfillmentTimelineItem[] {
  if (product === "monthly_plan") {
    return [
      { label: "Payment confirmed", description: "Your monthly plan is active.", status: "complete" },
      { label: "Paid intake", description: "Send the details that make monitoring accurate.", status: "active" },
      { label: "Baseline audit queued", description: "We establish your starting AI Visibility benchmark.", status: "pending" },
      { label: "First 30-day plan", description: "You receive priority actions and monthly tracking begins.", status: "pending" },
    ];
  }

  return [
    { label: "Payment confirmed", description: "Your $88 one-time Full Report + Fix is in the system.", status: "complete" },
    { label: "Paid intake", description: "Send the details that make your report more accurate.", status: "active" },
    { label: "Full audit queued", description: "We expand the mini report into a full paid analysis.", status: "pending" },
    { label: "Full report delivery", description: "You receive the fix plan, roadmap, and implementation priorities.", status: "pending" },
  ];
}

function clientFromLead(lead: MiniLeadRecord) {
  const client = lead.client as { name?: string } | null;
  return { name: client?.name ?? "Your business" };
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function splitLines(value: unknown) {
  return clean(value).split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
}

function normalizeUrl(value: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
