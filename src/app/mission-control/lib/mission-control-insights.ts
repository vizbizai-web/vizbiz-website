import type { MiniLeadRecord, MiniLeadStatus, PaidProduct } from "@/lib/lead-pipeline";

export type LeadTemperature = "New" | "Warm" | "Hot" | "Won" | "Review";

export interface MissionControlMetric {
  label: string;
  value: number;
  helper: string;
  icon: string;
  tone: "cyan" | "emerald" | "amber" | "violet" | "rose" | "slate";
}

export interface MissionControlPriority {
  title: string;
  description: string;
  href: string;
  cta: string;
  tone: "cyan" | "emerald" | "amber" | "violet" | "rose";
}

export interface MissionControlLeadSummary {
  id: string;
  name: string;
  email: string;
  city: string;
  service: string;
  status: MiniLeadStatus;
  temperature: LeadTemperature;
  reportSlug: string;
  reportViewedAt: string | null;
  ctaClicks: number;
  lastProduct: PaidProduct | null;
  createdAt: string;
  updatedAt: string;
}

export interface MissionControlSnapshot {
  metrics: {
    totalLeads: number;
    newToday: number;
    emailPreparedOrSent: number;
    reportViews: number;
    ctaClicks: number;
    fixPackageClicks: number;
    monthlyPlanClicks: number;
    paidConversions: number;
    followUpsDue: number;
  };
  metricCards: MissionControlMetric[];
  priorities: MissionControlPriority[];
  hotLeads: MissionControlLeadSummary[];
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    at: string;
    tone: "cyan" | "emerald" | "amber" | "violet" | "rose" | "slate";
  }>;
  launchChecklist: Array<{
    title: string;
    done: boolean;
    helper: string;
  }>;
}

export function clientDisplayName(client: unknown): string {
  if (isRecord(client) && typeof client.name === "string" && client.name.trim()) return client.name.trim();
  return "Unknown business";
}

export function clientCity(client: unknown): string {
  if (isRecord(client) && typeof client.city === "string" && client.city.trim()) return client.city.trim();
  return "Market unknown";
}

export function clientService(client: unknown): string {
  if (isRecord(client)) {
    const service = client.primaryService ?? client.service ?? client.niche;
    if (typeof service === "string" && service.trim()) return service.trim();
  }
  return "Niche pending";
}

export function competitorDisplayName(competitor: unknown): string {
  if (!isRecord(competitor)) return "Unknown competitor";
  if (typeof competitor.name === "string" && competitor.name.trim()) return competitor.name.trim();
  if (typeof competitor.websiteUrl === "string" && competitor.websiteUrl.trim()) return hostname(competitor.websiteUrl);
  if (typeof competitor.url === "string" && competitor.url.trim()) return hostname(competitor.url);
  return "Unknown competitor";
}

export function leadTemperature(lead: MiniLeadRecord): LeadTemperature {
  if (lead.status === "paid_conversion") return "Won";
  if ((lead.ctaClicks?.length ?? 0) > 0 || lead.status === "cta_clicked" || lead.status === "report_viewed" || Boolean(lead.reportViewedAt)) return "Hot";
  if (lead.status === "email_prepared" || lead.status === "email_sent" || lead.status === "scan_complete") return "Warm";
  if (lead.status === "submitted") return "New";
  return "Review";
}

export function summarizeLead(lead: MiniLeadRecord): MissionControlLeadSummary {
  const lastClick = lead.ctaClicks?.at(-1);
  return {
    id: lead.id,
    name: clientDisplayName(lead.client),
    email: lead.email,
    city: clientCity(lead.client),
    service: clientService(lead.client),
    status: lead.status,
    temperature: leadTemperature(lead),
    reportSlug: lead.reportSlug,
    reportViewedAt: lead.reportViewedAt,
    ctaClicks: lead.ctaClicks?.length ?? 0,
    lastProduct: lastClick?.product ?? null,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export function buildMissionControlSnapshot(leads: MiniLeadRecord[], now = new Date()): MissionControlSnapshot {
  const todayKey = now.toISOString().slice(0, 10);
  const sortedLeads = [...leads].sort((a, b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt));
  const newToday = leads.filter((lead) => lead.createdAt.slice(0, 10) === todayKey).length;
  const reportViews = leads.filter((lead) => lead.reportViewedAt || lead.status === "report_viewed" || lead.status === "cta_clicked" || lead.status === "paid_conversion").length;
  const allClicks = leads.flatMap((lead) => lead.ctaClicks ?? []);
  const fixPackageClicks = allClicks.filter((click) => click.product === "fix_package").length;
  const monthlyPlanClicks = allClicks.filter((click) => click.product === "monthly_plan").length;
  const paidConversions = leads.filter((lead) => lead.status === "paid_conversion").length;
  const emailPreparedOrSent = leads.filter((lead) => lead.status === "email_prepared" || lead.status === "email_sent" || lead.emailDeliveryStatus === "dry_run" || lead.emailDeliveryStatus === "sent").length;
  const followUpsDue = leads.filter((lead) => ["report_viewed", "cta_clicked"].includes(lead.status)).length;

  const metrics = {
    totalLeads: leads.length,
    newToday,
    emailPreparedOrSent,
    reportViews,
    ctaClicks: allClicks.length,
    fixPackageClicks,
    monthlyPlanClicks,
    paidConversions,
    followUpsDue,
  };

  const hotLeads = sortedLeads
    .map(summarizeLead)
    .filter((lead) => lead.temperature === "Hot" || lead.temperature === "Won")
    .slice(0, 5);

  return {
    metrics,
    metricCards: [
      { label: "New intakes today", value: metrics.newToday, helper: "Fresh AVI mini-report submissions", icon: "📥", tone: "cyan" },
      { label: "Total leads", value: metrics.totalLeads, helper: "All free mini-report records", icon: "💼", tone: "violet" },
      { label: "Report views", value: metrics.reportViews, helper: "Prospects who opened the free report", icon: "👀", tone: "emerald" },
      { label: "Paid CTA clicks", value: metrics.ctaClicks, helper: `${metrics.fixPackageClicks} fix package · ${metrics.monthlyPlanClicks} monthly`, icon: "💸", tone: metrics.ctaClicks > 0 ? "amber" : "slate" },
      { label: "Follow-ups due", value: metrics.followUpsDue, helper: "Viewed or clicked leads to contact", icon: "✅", tone: metrics.followUpsDue > 0 ? "rose" : "slate" },
      { label: "Paid conversions", value: metrics.paidConversions, helper: "Won revenue events", icon: "🏆", tone: metrics.paidConversions > 0 ? "emerald" : "slate" },
    ],
    priorities: buildPriorities(metrics),
    hotLeads,
    recentActivity: buildRecentActivity(sortedLeads),
    launchChecklist: [
      { title: "Free mini-report funnel", done: true, helper: "Homepage intake, report creation, and lead capture are wired." },
      { title: "Stripe payment links", done: metrics.ctaClicks > 0 || Boolean(process.env.STRIPE_FIX_PACKAGE_URL || process.env.STRIPE_MONTHLY_GROWTH_URL), helper: "Configure live links, then track clicks through report CTAs." },
      { title: "Email delivery", done: leads.some((lead) => lead.emailDeliveryStatus === "sent"), helper: "Dry-run works; production needs Resend sender/API key." },
      { title: "Mobile Mission Control", done: true, helper: "Dashboard and lead inbox use mobile cards and compact grids." },
    ],
  };
}

function buildPriorities(metrics: MissionControlSnapshot["metrics"]): MissionControlPriority[] {
  const priorities: MissionControlPriority[] = [];
  if (metrics.followUpsDue > 0) {
    priorities.push({
      title: "Follow up with hot leads",
      description: `${metrics.followUpsDue} lead${metrics.followUpsDue === 1 ? "" : "s"} viewed a report or clicked a paid CTA.`,
      href: "/mission-control/leads?filter=hot",
      cta: "Open hot leads",
      tone: "rose",
    });
  }
  priorities.push({
    title: "Drive traffic to the free AVI mini report",
    description: "Use X/social research and niche posts to send local operators into the intake funnel.",
    href: "/mission-control/content",
    cta: "Open Content Studio",
    tone: "cyan",
  });
  priorities.push({
    title: "Finish revenue plumbing",
    description: "Verify Stripe links, Resend email, and conversion tracking before pushing vizbiz.ai live.",
    href: "/mission-control/settings",
    cta: "Check integrations",
    tone: "amber",
  });
  return priorities.slice(0, 4);
}

function buildRecentActivity(leads: MiniLeadRecord[]): MissionControlSnapshot["recentActivity"] {
  return leads.slice(0, 8).map((lead) => {
    const summary = summarizeLead(lead);
    const lastClick = lead.ctaClicks?.at(-1);
    if (lastClick) {
      return {
        id: `${lead.id}-click-${lastClick.clickedAt}`,
        title: `${summary.name} clicked ${lastClick.product.replaceAll("_", " ")}`,
        description: `${summary.city} · ${summary.service}`,
        at: lastClick.clickedAt,
        tone: "amber" as const,
      };
    }
    if (lead.reportViewedAt) {
      return {
        id: `${lead.id}-viewed`,
        title: `${summary.name} viewed their report`,
        description: `${summary.city} · ${summary.service}`,
        at: lead.reportViewedAt,
        tone: "emerald" as const,
      };
    }
    return {
      id: lead.id,
      title: `${summary.name} submitted a mini report`,
      description: `${summary.city} · ${summary.service}`,
      at: lead.createdAt,
      tone: "cyan" as const,
    };
  });
}

function hostname(value: string): string {
  try {
    const url = value.startsWith("http") ? new URL(value) : new URL(`https://${value}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return value.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
