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
  businessDisplayName: string;
  primaryLocation: string;
  country: string;
  confirmedNiche: string;
  googleBusinessProfileUrl: string;
  socialProfiles: string[];
  topServicesToWin: string[];
  highestValueService: string;
  averageCustomerValue: string;
  primaryConversionAction: string;
  primaryPhone: string;
  competitor1Name: string;
  competitor1Website: string;
  competitor1GoogleUrl: string;
  competitor1Reason: string;
  competitor2Name: string;
  competitor2Website: string;
  competitor2GoogleUrl: string;
  competitor2Reason: string;
  additionalCompetitors: string[];
  additionalResearchPermission: boolean;
  websitePlatform: string;
  websiteEditor: string;
  implementationPermission: string;
  googleBusinessProfileAccess: string;
  analyticsAccess: string;
  bookingCrmPlatform: string;
  schemaTools: string;
  approvalConstraints: string;
  customerTypes: string;
  commonQuestions: string[];
  commonObjections: string[];
  differentiators: string[];
  reviewLinks: string[];
  proofLinks: string[];
  existingFaqs: string[];
  seasonalPriorities: string;
  languagesServed: string[];
  knownAiSearchIssues: string;
  deadline: string;
  monthlyMonitoringMarkets: string[];
  monthlyUpdatePreference: string;
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
  reportJobId?: string | null;
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

export function normalizePaidIntake(input: Record<string, unknown>): PaidIntakeDetails {
  return {
    contactName: clean(input.contactName),
    role: clean(input.role),
    businessDisplayName: clean(input.businessDisplayName),
    primaryLocation: clean(input.primaryLocation),
    country: clean(input.country),
    confirmedNiche: clean(input.confirmedNiche),
    googleBusinessProfileUrl: normalizeUrl(clean(input.googleBusinessProfileUrl)),
    socialProfiles: splitLines(input.socialProfiles).map(normalizeUrl).filter(Boolean),
    topServicesToWin: splitLines(input.topServicesToWin),
    highestValueService: clean(input.highestValueService),
    averageCustomerValue: clean(input.averageCustomerValue),
    primaryConversionAction: clean(input.primaryConversionAction),
    primaryPhone: clean(input.primaryPhone),
    competitor1Name: clean(input.competitor1Name),
    competitor1Website: normalizeUrl(clean(input.competitor1Website)),
    competitor1GoogleUrl: normalizeUrl(clean(input.competitor1GoogleUrl)),
    competitor1Reason: clean(input.competitor1Reason),
    competitor2Name: clean(input.competitor2Name),
    competitor2Website: normalizeUrl(clean(input.competitor2Website)),
    competitor2GoogleUrl: normalizeUrl(clean(input.competitor2GoogleUrl)),
    competitor2Reason: clean(input.competitor2Reason),
    additionalCompetitors: splitLines(input.additionalCompetitors),
    additionalResearchPermission: normalizeBoolean(input.additionalResearchPermission),
    websitePlatform: clean(input.websitePlatform),
    websiteEditor: clean(input.websiteEditor),
    implementationPermission: clean(input.implementationPermission),
    googleBusinessProfileAccess: clean(input.googleBusinessProfileAccess),
    analyticsAccess: clean(input.analyticsAccess),
    bookingCrmPlatform: clean(input.bookingCrmPlatform),
    schemaTools: clean(input.schemaTools),
    approvalConstraints: clean(input.approvalConstraints),
    customerTypes: clean(input.customerTypes),
    commonQuestions: splitLines(input.commonQuestions),
    commonObjections: splitLines(input.commonObjections),
    differentiators: splitLines(input.differentiators),
    reviewLinks: splitLines(input.reviewLinks).map(normalizeUrl).filter(Boolean),
    proofLinks: splitLines(input.proofLinks).map(normalizeUrl).filter(Boolean),
    existingFaqs: splitLines(input.existingFaqs),
    seasonalPriorities: clean(input.seasonalPriorities),
    languagesServed: splitLines(input.languagesServed),
    knownAiSearchIssues: clean(input.knownAiSearchIssues),
    deadline: clean(input.deadline),
    monthlyMonitoringMarkets: splitLines(input.monthlyMonitoringMarkets),
    monthlyUpdatePreference: clean(input.monthlyUpdatePreference),
    priorityServices: clean(input.priorityServices),
    urgentGoal: clean(input.urgentGoal),
    notes: clean(input.notes),
  };
}

export function attachPaidIntake(order: PaidOrderRecord, intake: PaidIntakeDetails, now = new Date().toISOString(), reportJobId?: string): PaidOrderRecord {
  return {
    ...order,
    status: "queued",
    intake: { ...intake, submittedAt: now },
    reportJobId: reportJobId ?? order.reportJobId ?? null,
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

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  const cleaned = clean(value).toLowerCase();
  return ["1", "true", "yes", "y", "on"].includes(cleaned);
}
