/**
 * Full Report Page — Payment Gated Implementation Packet
 *
 * Displays the full implementation packet after payment verification.
 * If not paid, shows payment options.
 */

import { getLeadByLeadId, isSheetsConfigured } from "@/lib/google-sheets";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface DeliveryData {
  deliveredAt: string;
  tier: string;
  outputDir: string;
  files: string[];
  copyOptimized?: boolean;
}

interface PaymentData {
  amount: number;
  tier: string;
  paidAt: string;
  sessionId: string;
}

function parseDeliveryData(notes: string): DeliveryData | null {
  const marker = "DELIVERY:";
  const idx = notes.indexOf(marker);
  if (idx < 0) return null;
  try {
    return JSON.parse(notes.slice(idx + marker.length));
  } catch {
    return null;
  }
}

function parsePaymentData(notes: string): PaymentData | null {
  const marker = "PAYMENT:";
  const idx = notes.indexOf(marker);
  if (idx < 0) return null;
  try {
    return JSON.parse(notes.slice(idx + marker.length));
  } catch {
    return null;
  }
}

function getOutputDir(leadId: string): string {
  return join(process.cwd(), "..", "..", "..", "..", "fix-engine", "output", leadId);
}

function readFileSafe(dir: string, filename: string): string | null {
  try {
    const path = join(dir, filename);
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

export default async function FullReportPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  // Load lead
  let lead = null;
  if (isSheetsConfigured()) {
    try {
      lead = await getLeadByLeadId(leadId);
    } catch (err) {
      console.error("[full-report] Failed to load lead:", err);
    }
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
          <p className="text-slate-400 mb-6">This report ID doesn't exist or has expired.</p>
          <Link href="/" className="text-sky-400 hover:text-sky-300">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const paymentData = parsePaymentData(lead.notes || "");
  const deliveryData = parseDeliveryData(lead.notes || "");

  // Payment gate: show payment options if not paid
  if (!paymentData && !deliveryData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-sm font-medium mb-6">
              🎯 Full Implementation Packet
            </div>
            <h1 className="text-4xl font-bold mb-4">{lead.dealershipName}</h1>
            <p className="text-slate-400 text-lg">{lead.city}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* One-time payment */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-sm text-slate-400 mb-2">One-Time Audit</div>
              <div className="text-3xl font-bold text-white mb-4">$299</div>
              <ul className="space-y-3 text-sm text-slate-300 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  Full schema markup packet
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  llms.txt + implementation guide
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  FAQ content for invisible queries
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  Technical fixes (robots.txt, meta, sitemap)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  Revenue impact analysis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  AI copy optimization
                </li>
              </ul>
              <Link
                href={`/checkout?leadId=${leadId}&tier=full&price=29900`}
                className="block w-full text-center bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Get Full Audit — $299
              </Link>
            </div>

            {/* Monthly monitoring */}
            <div className="bg-slate-900/50 border border-sky-500/30 rounded-xl p-6 relative">
              <div className="absolute top-0 right-0 bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                Recommended
              </div>
              <div className="text-sm text-slate-400 mb-2">Monthly Monitoring</div>
              <div className="text-3xl font-bold text-white mb-4">$499<span className="text-base font-normal text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-sm text-slate-300 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  Everything in Full Audit
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  Monthly AVI re-score
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  New content targeting remaining gaps
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  Competitor movement tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  Priority fix recommendations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  Implementation verification
                </li>
              </ul>
              <Link
                href={`/checkout?leadId=${leadId}&tier=monitor&price=49900`}
                className="block w-full text-center bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Start Monitoring — $499/mo
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`/report/${leadId}`}
              className="text-slate-400 hover:text-white text-sm"
            >
              ← Back to snapshot report
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Paid — show full implementation packet
  const outputDir = getOutputDir(leadId);

  const schemaContent = readFileSafe(outputDir, "schema-markup.md");
  const faqContent = readFileSafe(outputDir, "faq.md");
  const techContent = readFileSafe(outputDir, "technical-fixes.md");
  const revenueContent = readFileSafe(outputDir, "revenue-impact.md");
  const llmstxtContent = readFileSafe(outputDir, "llmstxt-packet.md");
  const copyOptContent = readFileSafe(outputDir, "copy-optimization.md");
  const implPacket = readFileSafe(outputDir, "implementation-packet.md");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                ✓ Paid — {paymentData?.tier === "monitor" ? "Monthly Monitoring" : "Full Audit"}
              </div>
              {deliveryData?.copyOptimized && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium">
                  AI-Optimized Copy
                </div>
              )}
            </div>
            <a
              href={`/api/download-pack?leadId=${leadId}`}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              📦 Download ZIP
            </a>
          </div>
          <h1 className="text-3xl font-bold">{lead.dealershipName} — Implementation Packet</h1>
          <p className="text-slate-400 mt-1">{lead.city} • Generated {deliveryData?.deliveredAt ? new Date(deliveryData.deliveredAt).toLocaleDateString() : "Recently"}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Current AVI</div>
            <div className="text-2xl font-bold text-white">{lead.snapshotAppeared || "N/A"}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Files Generated</div>
            <div className="text-2xl font-bold text-white">{deliveryData?.files?.length || 0}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Tier</div>
            <div className="text-2xl font-bold text-white capitalize">{paymentData?.tier || deliveryData?.tier || "full"}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Paid</div>
            <div className="text-2xl font-bold text-green-400">{paymentData ? `$${(paymentData.amount / 100).toFixed(0)}` : "N/A"}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-800 mb-6">
          <nav className="flex gap-6 overflow-x-auto">
            <a href="#overview" className="text-sm font-medium text-sky-400 border-b-2 border-sky-400 pb-3 whitespace-nowrap">Overview</a>
            <a href="#schema" className="text-sm font-medium text-slate-400 hover:text-white pb-3 whitespace-nowrap">Schema</a>
            <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white pb-3 whitespace-nowrap">FAQ</a>
            <a href="#technical" className="text-sm font-medium text-slate-400 hover:text-white pb-3 whitespace-nowrap">Technical</a>
            <a href="#revenue" className="text-sm font-medium text-slate-400 hover:text-white pb-3 whitespace-nowrap">Revenue</a>
            <a href="#llmstxt" className="text-sm font-medium text-slate-400 hover:text-white pb-3 whitespace-nowrap">llms.txt</a>
            {copyOptContent && (
              <a href="#copy" className="text-sm font-medium text-slate-400 hover:text-white pb-3 whitespace-nowrap">Copy</a>
            )}
          </nav>
        </div>

        {/* Overview */}
        <section id="overview" className="mb-12">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Implementation Overview</h2>
            {implPacket ? (
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {implPacket}
              </pre>
            ) : (
              <p className="text-slate-400">Overview document not yet generated. Files are still processing.</p>
            )}
          </div>
        </section>

        {/* Schema Markup */}
        <section id="schema" className="mb-12">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Schema Markup</h2>
              <a
                href={`/api/download-pack?leadId=${leadId}`}
                className="text-sm text-sky-400 hover:text-sky-300"
              >
                Download schema.json
              </a>
            </div>
            {schemaContent ? (
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {schemaContent}
              </pre>
            ) : (
              <p className="text-slate-400">Schema markup not yet generated.</p>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">FAQ Content</h2>
              <a
                href={`/api/download-pack?leadId=${leadId}`}
                className="text-sm text-sky-400 hover:text-sky-300"
              >
                Download faq.html
              </a>
            </div>
            {faqContent ? (
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {faqContent}
              </pre>
            ) : (
              <p className="text-slate-400">FAQ content not yet generated.</p>
            )}
          </div>
        </section>

        {/* Technical Fixes */}
        <section id="technical" className="mb-12">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Technical Fixes</h2>
              <a
                href={`/api/download-pack?leadId=${leadId}`}
                className="text-sm text-sky-400 hover:text-sky-300"
              >
                Download robots.txt
              </a>
            </div>
            {techContent ? (
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {techContent}
              </pre>
            ) : (
              <p className="text-slate-400">Technical fixes not yet generated.</p>
            )}
          </div>
        </section>

        {/* Revenue Impact */}
        <section id="revenue" className="mb-12">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Revenue Impact Analysis</h2>
              <a
                href={`/api/download-pack?leadId=${leadId}`}
                className="text-sm text-sky-400 hover:text-sky-300"
              >
                Download revenue-impact.md
              </a>
            </div>
            {revenueContent ? (
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {revenueContent}
              </pre>
            ) : (
              <p className="text-slate-400">Revenue impact analysis not yet generated.</p>
            )}
          </div>
        </section>

        {/* llms.txt */}
        <section id="llmstxt" className="mb-12">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">llms.txt</h2>
              <a
                href={`/api/download-pack?leadId=${leadId}`}
                className="text-sm text-sky-400 hover:text-sky-300"
              >
                Download llms.txt
              </a>
            </div>
            {llmstxtContent ? (
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {llmstxtContent}
              </pre>
            ) : (
              <p className="text-slate-400">llms.txt not yet generated.</p>
            )}
          </div>
        </section>

        {/* Copy Optimization */}
        {copyOptContent && (
          <section id="copy" className="mb-12">
            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Copy Optimization (Adversarial AI)</h2>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {copyOptContent}
              </pre>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="border-t border-slate-800 pt-8 mt-12">
          <div className="flex items-center justify-between">
            <Link
              href={`/report/${leadId}`}
              className="text-slate-400 hover:text-white text-sm"
            >
              ← Back to snapshot report
            </Link>
            <a
              href={`/api/download-pack?leadId=${leadId}`}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              📦 Download All Files (ZIP)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
