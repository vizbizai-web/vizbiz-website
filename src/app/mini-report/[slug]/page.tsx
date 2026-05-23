import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, DollarSign, FileText, Lock, Mail, Search, Share2, ShieldCheck, TrendingUp, Trophy } from "lucide-react";
import type { MiniAuditReport } from "@/engines/research/mini-audit";
import { listJson, readJson, saveJsonWithKey } from "@/lib/file-store";
import { appendStatus, type MiniLeadRecord } from "@/lib/lead-pipeline";
import VizBizLogo from "@/components/VizBizLogo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MiniReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await readJson<MiniAuditReport>("mini-reports", slug);
  if (!report) notFound();
  await markReportViewed(slug);

  const share = report.aiRecommendationShare == null ? "Pending" : `${Math.round(report.aiRecommendationShare * 100)}%`;
  const annualGap = report.revenueOpportunityGap?.annualGapVsTopTwoAverage;
  const categoryLabels = report.categoryLabels ?? {
    discovery: "Discovery Visibility",
    trust: "Trust & Review Signals",
    service: "Service Visibility",
    inventory: "Offer Visibility",
    finance: "Value & Pricing Visibility",
  };
  const missedPrompts = report.buyerQuestionTest.prompts
    .filter((prompt) => prompt.outcome === "missed" || prompt.competitorMentioned)
    .slice(0, 3);
  const promptPreview = missedPrompts.length ? missedPrompts : report.buyerQuestionTest.prompts.slice(0, 3);
  const competitorSnapshot = report.leaderboard.slice(0, 3);
  const topGap = report.topVisibilityGaps[0];
  const revenueLeakSnapshot = report.revenueLeakSnapshot?.length ? report.revenueLeakSnapshot : createRevenueLeakFallback(report, categoryLabels);
  const evidenceCards = report.evidenceCards?.length ? report.evidenceCards : createEvidenceFallback(report);
  const socialProofScore = report.socialProofScore ?? createSocialProofFallback(report);
  const localDominationPlan = report.localDominationPlan ?? createLocalDominationFallback(report);
  const revenueScenarios = report.revenueScenarios ? [report.revenueScenarios.conservative, report.revenueScenarios.likely, report.revenueScenarios.aggressive] : [];
  const isProductBrand = report.businessProfile?.serviceAreaType === "national" || report.businessProfile?.niche.includes("ecommerce") || report.businessProfile?.niche.includes("skincare");
  const isSpanishReport = report.language === "es";
  const reportHeadline = isSpanishReport
    ? `${report.client.name} aparece poco en recomendaciones populares de IA.`
    : `${report.client.name} is ${report.band.toLowerCase()} in popular AI recommendations.`;

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_34%),linear-gradient(180deg,#020617,#0F172A)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <VizBizLogo variant="dark" size="md" />
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
              <Link href="/" className="rounded-full border border-cyan-200/20 bg-white/5 px-3 py-2 hover:bg-white/10">← Back home</Link>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-2">Client preview report</span>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#22D3EE]">{isSpanishReport ? "Mini reporte AVI gratuito" : "Free AVI mini report"}</p>
              <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{reportHeadline}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                {isSpanishReport
                  ? "Lee esto en orden: primero el puntaje, luego las brechas de visibilidad, señales de confianza del producto, contexto competitivo, evidencia y siguiente paso."
                  : isProductBrand
                    ? "Read this in order: score first, then the visibility gaps, product trust signals, competitor context, evidence preview, and next step."
                    : "Read this in order: score first, then the visibility gaps, local trust signals, competitor context, evidence preview, and next step."}
              </p>
              {report.leadEmail && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-sm text-cyan-100">
                  <Mail className="h-4 w-4" /> {isSpanishReport ? "Resumen preparado para" : "Summary prepared for"} {report.leadEmail}
                </p>
              )}
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="font-serif text-2xl">{report.instantPreview.headline}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{report.instantPreview.subheadline}</p>
                <div className="mt-4 grid gap-2">
                  {report.instantPreview.checklist.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm text-slate-200">
                      <CheckCircle2 className={item.status === "complete" ? "h-4 w-4 text-cyan-200" : "h-4 w-4 text-slate-500"} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {report.businessProfile && (
                <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{isSpanishReport ? "Nicho detectado" : "Detected niche"}</span>
                    <span className="mt-1 block font-semibold text-white">{report.businessProfile.niche.replaceAll("_", " ")}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{isSpanishReport ? "Productos principales" : "Primary services"}</span>
                    <span className="mt-1 block font-semibold text-white">{report.businessProfile.primaryServices.slice(0, 2).join(", ")}</span>
                  </div>
                </div>
              )}
              <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50">
                {report.competitorNote ?? "Add two competitors to make the competitor gap and local visibility opportunity estimate more accurate."}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#E0F7FA] via-[#D7FBFF] to-[#CFFAFE] p-6 text-[#0F172A] shadow-[0_0_60px_rgba(34,211,238,0.22)] sm:p-8">
              <div className="pointer-events-none absolute -right-24 top-28 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.34))]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">{isSpanishReport ? "Puntaje AVI" : "AVI Score"}</p>
                  <p className="rounded-full border border-cyan-200/20 bg-[#0F172A] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.16)]">{isSpanishReport ? "1 · Empieza aquí" : "1 · Start here"}</p>
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-7xl font-bold tracking-tight">{report.aviScore}</span>
                  <span className="pb-3 text-2xl font-semibold text-slate-600">/100</span>
                </div>
                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/80 shadow-inner">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#22D3EE] to-[#06B6D4]" style={{ width: `${Math.min(report.aviScore, 100)}%` }} />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  <Metric label={isSpanishReport ? "Apariciones en IA" : "AI appearances"} value={`${report.promptsAppeared}/${report.promptsTotal}`} />
                  <Metric label={isSpanishReport ? "Ranking" : "Market rank"} value={report.competitiveRank ? `#${report.competitiveRank}` : isSpanishReport ? "Pendiente" : "Pending"} />
                  <Metric label={isSpanishReport ? "Share IA" : "AI share"} value={share} />
                  <Metric label={isSpanishReport ? "Prueba social" : "Social proof"} value={`${socialProofScore.score}/100`} />
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
                  <div className="min-w-0 rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-500">Why this score is low</p>
                        <h3 className="mt-1 text-lg font-black text-slate-950">{isSpanishReport ? "Desglose de visibilidad" : "Visibility breakdown"}</h3>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-[#06B6D4]" />
                    </div>
                    <div className="grid gap-2.5">
                      <DiagnosticRow label="AI answer presence" value={report.promptsAppeared > 0 ? "Partial" : "Not found"} tone={report.promptsAppeared > 0 ? "warn" : "danger"} />
                      <DiagnosticRow label="AI recommendation coverage" value={`${report.promptsTotal - report.promptsAppeared} missed`} tone={report.promptsAppeared === report.promptsTotal ? "good" : "danger"} />
                      <DiagnosticRow label="Competitor citation risk" value={report.competitorCount > 0 ? "Active" : "Needs benchmark"} tone={report.competitorCount > 0 ? "warn" : "muted"} />
                      <DiagnosticRow label={topGap ? categoryLabels[topGap.category] : "Top visibility gap"} value={topGap ? `${topGap.score}/100` : "Pending"} tone={topGap && topGap.score > 50 ? "warn" : "danger"} />
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-4">
                    <div className="min-w-0 rounded-3xl border border-white/70 bg-[#0F172A] p-4 text-white shadow-[0_18px_44px_rgba(15,23,42,0.14)]">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-cyan-200">{isProductBrand ? "Product benchmark" : "Local benchmark"}</p>
                          <h3 className="mt-1 text-lg font-black">{report.leaderboard.some((row) => row.kind === "competitor") ? "Who AI may trust first" : "Current validated business"}</h3>
                        </div>
                        <Trophy className="h-5 w-5 text-cyan-200" />
                      </div>
                      <div className="grid gap-2">
                        {competitorSnapshot.map((row) => (
                          <MiniRankRow key={`${row.kind}-${row.name}`} row={row} />
                        ))}
                      </div>
                    </div>

                    <div className="min-w-0 rounded-3xl border border-white/70 bg-white/55 p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur">
                      <div className="mb-3 flex items-center gap-2">
                        <Search className="h-4 w-4 text-[#06B6D4]" />
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-500">Top missed prompts</p>
                      </div>
                      <div className="grid gap-2">
                        {promptPreview.map((prompt, index) => (
                          <PromptPreview key={`${prompt.category}-${index}`} question={prompt.question} outcome={prompt.outcome} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="px-4 py-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 8%, rgba(34, 211, 238, 0.12), transparent 32%), radial-gradient(circle at 88% 22%, rgba(6, 182, 212, 0.08), transparent 28%), repeating-linear-gradient(0deg, rgba(34, 211, 238, 0.035) 0, rgba(34, 211, 238, 0.035) 1px, transparent 1px, transparent 42px), repeating-linear-gradient(90deg, rgba(34, 211, 238, 0.028) 0, rgba(34, 211, 238, 0.028) 1px, transparent 1px, transparent 42px), linear-gradient(180deg, #020617 0%, #08111f 52%, #020617 100%)",
        }}
      >
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="rounded-3xl border border-cyan-200/20 bg-gradient-to-br from-white/[0.08] via-white/[0.045] to-cyan-300/[0.055] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.32)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">{isSpanishReport ? "2 · Brechas de visibilidad" : "2 · Visibility leak snapshot"}</p>
                <h2 className="mt-2 font-serif text-3xl">{isSpanishReport ? "Dónde las brechas de IA pueden costar descubrimiento de producto" : isProductBrand ? "Where AI visibility gaps may become lost product discovery" : "Where AI visibility gaps may become lost local attention"}</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-slate-200">
                {isSpanishReport ? "Traducimos el puntaje a lenguaje de negocio: qué visibilidad se pierde, por qué importa y cuál es el primer fix." : "This reframes the score into business-owner language: what may be leaking leads, why it matters, and the first fix to make."}
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {revenueLeakSnapshot.map((leak) => (
                <RevenueLeakCard key={`${leak.leakType}-${leak.title}`} leak={leak} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-[#0F172A] p-6">
            <p className="mb-3 inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">{isSpanishReport ? "3 · Confianza de producto" : isProductBrand ? "3 · Product trust context" : "3 · Local trust context"}</p>
            <h2 className="font-serif text-3xl">{isSpanishReport ? "Lo que este snapshot gratuito puede verificar con seguridad" : "What the free snapshot can verify safely"}</h2>
            {annualGap ? (
              <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-5 text-[#0F172A]">
                <TrendingUp className="mb-3 h-6 w-6 text-[#06B6D4]" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Annual visibility opportunity vs top-two avg</p>
                <p className="mt-2 text-4xl font-bold">${annualGap.toLocaleString()}</p>
                <p className="mt-2 text-sm text-slate-700">Directional estimate, not a guarantee.</p>
              </div>
            ) : (
              <p className="mt-4 text-slate-300">{isSpanishReport ? "Para este snapshot gratuito de marca ecommerce, no mostramos una estimación en dólares. Las señales confiables aquí son presencia en respuestas de IA, prueba de producto/marca, competidores nombrados y preparación del sitio para lectura por máquinas." : isProductBrand ? "For this free product-brand snapshot, we are not showing a dollar-gap estimate. The reliable signals here are AI answer presence, product/brand trust proof, named-competitor context, and website machine-readiness." : "For this free restaurant snapshot, we are not showing a dollar-gap estimate. The reliable signals here are AI answer presence, Google profile trust, named-competitor validation, and website machine-readiness."}</p>
            )}
            {revenueScenarios.length > 0 && (
              <div className="mt-5 grid gap-2">
                {revenueScenarios.map((scenario) => (
                  <ScenarioRow key={scenario.label} scenario={scenario} />
                ))}
              </div>
            )}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
              <p className="font-bold text-white">What this means</p>
              <p className="mt-1">{isProductBrand ? "This snapshot is intentionally conservative: it shows the real AI-answer misses and product trust signals without inventing a revenue number for this free preview." : "This snapshot is intentionally conservative: it shows the real AI-answer misses and verified local trust signals without inventing a revenue number for a restaurant lead."}</p>
            </div>
            <SocialProofCard socialProof={socialProofScore} />
            {report.llmReadiness && <LlmReadinessCard readiness={report.llmReadiness} />}
          </div>
        </div>
      </section>

      <section
        className="px-4 pb-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.10), transparent 30%), repeating-linear-gradient(0deg, rgba(34, 211, 238, 0.025) 0, rgba(34, 211, 238, 0.025) 1px, transparent 1px, transparent 42px), repeating-linear-gradient(90deg, rgba(34, 211, 238, 0.02) 0, rgba(34, 211, 238, 0.02) 1px, transparent 1px, transparent 42px), linear-gradient(180deg, #020617 0%, #08111f 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.10] via-white/[0.045] to-white/[0.025] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.28)]">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">{isProductBrand ? "4 · Product discovery growth" : "4 · Local community domination"}</p>
              <h2 className="mt-3 font-serif text-3xl">{localDominationPlan.title}</h2>
              <p className="mt-3 text-base leading-7 text-slate-200">{localDominationPlan.thesis}</p>
              <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-[#020617]/60 p-4 text-sm leading-6 text-cyan-50">{localDominationPlan.queryFanOutBrief}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <DominationList icon="search" title={isSpanishReport ? "Páginas de producto/uso a dominar" : isProductBrand ? "Product/use-case pages to own" : "Service/city pages to own"} items={localDominationPlan.recommendedPages.slice(0, 4)} />
              <DominationList icon="faq" title={isSpanishReport ? "Preguntas de recomendación a responder" : "Recommendation questions to answer"} items={localDominationPlan.faqOpportunities.slice(0, 4)} />
              <DominationList icon="share" title={isSpanishReport ? "Distribución de prueba social" : "Review proof distribution"} items={localDominationPlan.reviewSyndicationActions.slice(0, 3)} />
              <DominationList icon="shield" title={isSpanishReport ? "Protección de búsquedas de marca" : "Brand-search protection"} items={localDominationPlan.brandDefensePrompts.slice(0, 4)} />
            </div>
          </div>
        </div>
      </section>

      <section
        className="px-4 pb-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "radial-gradient(circle at 82% 12%, rgba(34, 211, 238, 0.08), transparent 30%), repeating-linear-gradient(0deg, rgba(34, 211, 238, 0.025) 0, rgba(34, 211, 238, 0.025) 1px, transparent 1px, transparent 42px), repeating-linear-gradient(90deg, rgba(34, 211, 238, 0.02) 0, rgba(34, 211, 238, 0.02) 1px, transparent 1px, transparent 42px), linear-gradient(180deg, #08111f 0%, #020617 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.24)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">5 · Evidence preview</p>
              <h2 className="mt-2 font-serif text-3xl">{isSpanishReport ? "Por qué creemos que estas brechas existen" : "Why we believe these leaks exist"}</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-300">{isSpanishReport ? "El reporte completo expande esto con capturas, URLs, evidencia de respuestas de IA y activos de implementación." : "The paid report expands this into screenshots, URLs, AI-answer evidence, and implementation assets."}</p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {evidenceCards.map((card) => (
              <EvidenceCard key={card.finding} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="px-4 pb-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "radial-gradient(circle at 14% 30%, rgba(34, 211, 238, 0.07), transparent 28%), repeating-linear-gradient(0deg, rgba(34, 211, 238, 0.025) 0, rgba(34, 211, 238, 0.025) 1px, transparent 1px, transparent 42px), repeating-linear-gradient(90deg, rgba(34, 211, 238, 0.02) 0, rgba(34, 211, 238, 0.02) 1px, transparent 1px, transparent 42px), linear-gradient(180deg, #020617 0%, #020617 100%)",
        }}
      >
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="mb-3 inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">6 · Competitor context</p>
            <h2 className="font-serif text-3xl">{isSpanishReport ? "Validación de competidores nombrados" : "Named competitor validation"}</h2>
            <p className="mt-2 text-sm text-slate-300">{isSpanishReport ? "Este snapshot gratuito confirma los dos competidores de la captura. El reporte completo puede agregar evidencia por competidor, por plataforma de IA y detalles de fixes." : "This free snapshot confirms the two competitors from the intake. The full report can add competitor-by-competitor AI-answer evidence and fix details."}</p>
            <div className="mt-6 grid gap-3">
              {report.leaderboard.map((row) => (
                <div key={`${row.kind}-${row.name}`} className="rounded-2xl border border-white/10 bg-[#0F172A] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">#{row.rank} {row.name}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{row.kind === "client" ? isSpanishReport ? "Tu negocio" : "Your business" : "Competitor"}</p>
                    </div>
                    <p className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">{row.aviScore}/100</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="mb-3 inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">7 · AI recommendation preview</p>
            <h2 className="font-serif text-3xl">{report.buyerQuestionTest.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{isSpanishReport ? `Vista previa de ${Math.min(6, report.buyerQuestionTest.prompts.length)} de ${report.buyerQuestionTest.prompts.length} momentos de recomendación en IA. El reporte completo desbloquea evidencia por plataforma y prioridades de fix.` : `Preview showing ${Math.min(6, report.buyerQuestionTest.prompts.length)} of ${report.buyerQuestionTest.prompts.length} AI recommendation moments. The full report unlocks platform-by-platform evidence and fix priorities.`}</p>
            <div className="mt-6 grid gap-3">
              {report.buyerQuestionTest.prompts.slice(0, 6).map((prompt, index) => (
                <div key={`${prompt.category}-${index}`} className="rounded-2xl border border-white/10 bg-[#0F172A] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{prompt.question}</p>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold capitalize text-cyan-200">{prompt.outcome}</span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">{categoryLabels[prompt.category]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="px-4 pb-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "radial-gradient(circle at 82% 18%, rgba(34, 211, 238, 0.07), transparent 28%), repeating-linear-gradient(0deg, rgba(34, 211, 238, 0.022) 0, rgba(34, 211, 238, 0.022) 1px, transparent 1px, transparent 42px), repeating-linear-gradient(90deg, rgba(34, 211, 238, 0.018) 0, rgba(34, 211, 238, 0.018) 1px, transparent 1px, transparent 42px), linear-gradient(180deg, #020617 0%, #020617 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl rounded-3xl border border-cyan-300/20 bg-[#0F172A] p-6">
          <p className="inline-flex rounded-full border border-cyan-200/20 bg-white/[0.05] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-cyan-100">Email mini report preview</p>
          <h2 className="mt-3 font-serif text-3xl">{report.emailMiniReport.subject}</h2>
          <p className="mt-2 text-slate-300">{report.emailMiniReport.previewText}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {report.emailMiniReport.bullets.map((bullet) => (
              <div key={bullet} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
                {bullet}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#FAF7F2] to-[#F2EDE4] px-4 py-14 text-[#0F172A] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-cyan-500/20 bg-cyan-100 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-[#0891B2] shadow-sm">{isSpanishReport ? "8 · Qué desbloquea el plan pagado" : "8 · What the paid plan unlocks"}</p>
            <h2 className="font-serif text-4xl">{isSpanishReport ? "Qué se desbloquea en el reporte completo" : "What unlocks in the full report"}</h2>
            <div className="mt-6 grid gap-3">
              {report.lockedSections.map((section) => (
                <div key={section} className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
                  <Lock className="h-5 w-5 text-[#06B6D4]" />
                  <span className="font-semibold">{section}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#020617] p-6 text-white shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">{isSpanishReport ? "Siguiente paso recomendado" : "Recommended next step"}</p>
            <h3 className="mt-3 font-serif text-3xl">{isSpanishReport ? "Convertir este puntaje en citas de IA." : "Turn this score into citations."}</h3>
            <p className="mt-4 text-slate-300">{isSpanishReport ? "Compra el reporte completo + fix de $88 una vez, o el plan de crecimiento de $188/mes para monitoreo mensual y movimiento competitivo." : "Buy the $88 full report + fix once, or subscribe to the $188/month growth plan for monthly monitoring and local competitor movement updates."}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-semibold text-white">{report.paidDeliverables.oneTimeFix.title}</p>
                <p className="mt-1">{report.paidDeliverables.oneTimeFix.description}</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                <p className="font-semibold text-white">{report.paidDeliverables.monthlyGrowthPlan.title}</p>
                <p className="mt-1">$188/month for 30 / 60 / 90 day monitoring, local competitor movement, and action planning beyond the first fix.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <Link href={`/api/mini-audit/cta?slug=${encodeURIComponent(report.slug)}&product=fix_package`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-5 py-4 font-bold text-[#020617]">
                {report.ctas.fullReport.label} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href={`/api/mini-audit/cta?slug=${encodeURIComponent(report.slug)}&product=monthly_plan`} className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-4 font-bold text-white">
                {report.ctas.monthlyMonitoring.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

async function markReportViewed(slug: string) {
  const leads = await listJson<MiniLeadRecord>("mini-leads");
  const lead = leads.find((record) => record.reportSlug === slug);
  if (!lead) return;
  await saveJsonWithKey("mini-leads", lead.id, appendStatus(lead, "report_viewed"));
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function DiagnosticRow({ label, value, tone }: { label: string; value: string; tone: "danger" | "warn" | "good" | "muted" }) {
  const toneClass = {
    danger: "bg-rose-500/12 text-rose-700 ring-rose-400/25",
    warn: "bg-amber-400/16 text-amber-700 ring-amber-400/30",
    good: "bg-emerald-400/16 text-emerald-700 ring-emerald-400/30",
    muted: "bg-slate-500/10 text-slate-600 ring-slate-400/25",
  }[tone];

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-3.5 py-3">
      <span className="text-sm font-semibold leading-tight text-slate-700">{label}</span>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-[0.08em] ring-1 ${toneClass}`}>{value}</span>
    </div>
  );
}

function MiniRankRow({ row }: { row: MiniAuditReport["leaderboard"][number] }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3">
      <div className="min-w-0">
        <p className="whitespace-normal text-sm font-bold leading-snug text-white">#{row.rank} {row.name}</p>
        <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-slate-400">{row.kind === "client" ? "Your business" : "Competitor"}</p>
      </div>
      <span className={row.kind === "client" ? "rounded-full bg-cyan-300/12 px-2.5 py-1 text-sm font-black text-cyan-100" : "rounded-full bg-white/10 px-2.5 py-1 text-sm font-black text-white"}>
        {row.aviScore}
      </span>
    </div>
  );
}

function PromptPreview({ question, outcome }: { question: string; outcome: "found" | "missed" | "pending" }) {
  const label = outcome === "found" ? "Appeared" : outcome === "pending" ? "Testing" : "Missed";
  return (
    <div className="rounded-2xl bg-white/65 px-3.5 py-3">
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">“{question}”</p>
      <p className="mt-1 text-[0.64rem] font-black uppercase tracking-[0.14em] text-[#0891B2]">{label}</p>
    </div>
  );
}

function RevenueLeakCard({ leak }: { leak: MiniAuditReport["revenueLeakSnapshot"][number] }) {
  const icon = leak.leakType === "Trust proof" ? <ShieldCheck className="h-5 w-5" /> : leak.leakType === "AI visibility" ? <Search className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#142033] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_36px_rgba(2,6,23,0.22)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#22D3EE] via-cyan-100 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-cyan-300/12 p-2 text-cyan-100">{icon}</div>
        <span className="rounded-full border border-cyan-200/25 bg-cyan-300/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-cyan-100">{leak.impact} impact</span>
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{leak.leakType}</p>
      <h3 className="mt-1 text-lg font-bold leading-snug text-white">{leak.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{leak.summary}</p>
      <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-200"><span className="font-bold text-cyan-100">First fix —</span>{" "}{leak.fix}</p>
    </div>
  );
}

function ScenarioRow({ scenario }: { scenario: NonNullable<MiniAuditReport["revenueScenarios"]>[keyof NonNullable<MiniAuditReport["revenueScenarios"]>] }) {
  return (
    <div className={scenario.label === "Likely" ? "flex items-center justify-between gap-3 rounded-2xl border border-cyan-200/35 bg-cyan-300/10 px-4 py-3 shadow-[0_0_26px_rgba(34,211,238,0.12)]" : "flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"}>
      <div>
        <p className="text-sm font-bold text-white">{scenario.label}</p>
        <p className="text-xs text-slate-400">{Math.round(scenario.aiInfluencedBuyerShare * 100)}% AI/search-influenced buyer share</p>
      </div>
      <p className="text-right text-sm font-black text-cyan-100">${scenario.monthlyGapVsTopTwoAverage.toLocaleString()}<span className="block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-400">/mo</span></p>
    </div>
  );
}

function SocialProofCard({ socialProof }: { socialProof: MiniAuditReport["socialProofScore"] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-300/12 via-white/[0.055] to-white/[0.03] p-4 shadow-[0_18px_46px_rgba(2,6,23,0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">3b · Level playing field</p>
          <h3 className="mt-1 font-serif text-2xl text-white">{socialProof.title}</h3>
        </div>
        <div className="shrink-0 rounded-2xl bg-cyan-300/12 p-2 text-cyan-100"><Share2 className="h-5 w-5" /></div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-5xl font-black tracking-tight text-cyan-100">{socialProof.score}</span>
        <span className="pb-2 text-lg font-bold text-slate-400">/100 · {socialProof.band}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-200">{socialProof.summary}</p>
      <div className="mt-4 grid gap-3">
        {socialProof.signals.slice(0, 2).map((signal) => (
          <p key={signal} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-200"><span className="font-bold text-cyan-100">Signal:</span> {signal}</p>
        ))}
        {socialProof.opportunities.slice(0, 2).map((opportunity) => (
          <p key={opportunity} className="rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50"><span className="font-bold">Next fix:</span> {opportunity}</p>
        ))}
      </div>
    </div>
  );
}

function LlmReadinessCard({ readiness }: { readiness: MiniAuditReport["llmReadiness"] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-4 text-[#0F172A] shadow-[0_18px_46px_rgba(34,211,238,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full bg-[#0F172A] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-cyan-100">3c · AI readability</p>
          <h3 className="mt-2 font-serif text-2xl text-slate-950">LLM / Agent Readiness</h3>
        </div>
        <div className="shrink-0 rounded-2xl bg-white/70 px-3 py-2 text-right">
          <p className="text-3xl font-black text-slate-950">{readiness.score}</p>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-slate-600">/100 · {readiness.band}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{readiness.summary}</p>
      <div className="mt-4 grid gap-3">
        {readiness.strengths.slice(0, 3).map((signal) => (
          <p key={signal} className="rounded-2xl bg-white/70 p-3 text-sm leading-6 text-slate-800"><span className="font-bold text-slate-950">Readable signal:</span> {signal}</p>
        ))}
        {readiness.opportunities.slice(0, 2).map((opportunity) => (
          <p key={opportunity} className="rounded-2xl border border-[#0F172A]/10 bg-[#0F172A]/8 p-3 text-sm leading-6 text-slate-800"><span className="font-bold text-slate-950">Paid fix opportunity:</span> {opportunity}</p>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-[#0F172A] p-3 text-sm leading-6 text-cyan-50">
        The paid report turns this into an implementation checklist: llms.txt / agents.md guidance, product and brand schema, FAQ blocks, sitemap improvements, and proof assets that help AI systems understand and cite the business.
      </p>
    </div>
  );
}

function DominationList({ icon, title, items }: { icon: "search" | "faq" | "share" | "shield"; title: string; items: string[] }) {
  const Icon = icon === "share" ? Share2 : icon === "shield" ? ShieldCheck : icon === "faq" ? FileText : Search;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-300/10 p-2 text-cyan-100"><Icon className="h-5 w-5" /></div>
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>
      <div className="grid gap-2">
        {items.map((item) => (
          <p key={item} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-6 text-slate-200 [overflow-wrap:anywhere]">{item}</p>
        ))}
      </div>
    </div>
  );
}

function EvidenceCard({ card }: { card: MiniAuditReport["evidenceCards"][number] }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-cyan-300/10 p-2 text-cyan-100"><FileText className="h-5 w-5" /></div>
        <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-cyan-100">{card.confidence}</span>
      </div>
      <h3 className="break-words text-lg font-bold leading-snug text-white">{card.finding}</h3>
      <div className="mt-4 grid min-w-0 gap-3 text-sm leading-6 [overflow-wrap:anywhere]">
        <p className="min-w-0 text-slate-300"><span className="font-bold text-cyan-100">Evidence —</span>{" "}{card.evidence}</p>
        <p className="min-w-0 text-slate-300"><span className="font-bold text-cyan-100">Why it matters —</span>{" "}{card.whyItMatters}</p>
        <p className="min-w-0 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-3 text-cyan-50"><span className="font-bold">Recommended fix —</span>{" "}{card.recommendedFix}</p>
      </div>
    </div>
  );
}

function createRevenueLeakFallback(report: MiniAuditReport, categoryLabels: Record<string, string>): MiniAuditReport["revenueLeakSnapshot"] {
  const missed = Math.max(0, report.promptsTotal - report.promptsAppeared);
  const topGap = report.topVisibilityGaps[0];
  return [
    {
      title: `${missed} AI recommendation moments did not surface the business`,
      impact: report.promptsAppeared === 0 ? "High" : "Medium",
      leakType: "AI visibility",
      summary: "AI/search answer visibility is the first leak: buyers can shortlist competitors before they ever reach the website.",
      fix: "Build answer-ready service pages, FAQs, schema, and proof assets around the missed recommendation moments.",
    },
    {
      title: topGap ? `${categoryLabels[topGap.category]} is the weakest path` : "Weakest revenue path needs diagnosis",
      impact: topGap && topGap.score < 35 ? "High" : "Medium",
      leakType: topGap?.category === "trust" ? "Trust proof" : topGap?.category === "service" ? "Service pages" : "Conversion path",
      summary: topGap?.label ?? "The free report found a category that needs deeper prompt and website evidence in the paid report.",
      fix: "Turn the weakest category into a focused fix sprint with page copy, proof blocks, FAQs, and stronger CTAs.",
    },
    {
      title: "Trust proof needs to sit closer to conversion points",
      impact: "Medium",
      leakType: "Trust proof",
      summary: "Reviews, credentials, guarantees, and local proof should be visible where buyers decide to call or book.",
      fix: "Move trust proof onto service and booking paths, not only About or testimonial pages.",
    },
  ];
}

function createSocialProofFallback(report: MiniAuditReport): MiniAuditReport["socialProofScore"] {
  return {
    title: "AI Social Proof Score",
    score: Math.max(25, Math.min(70, Math.round((report.aviScore + 50) / 2))),
    band: report.aviScore >= 70 ? "Strong" : report.aviScore >= 40 ? "Building" : "Thin",
    summary: "This is not follower count. AI visibility is the level playing field: small local businesses can win when their website, profiles, reviews, proof, and service signals are consistent and easy to verify.",
    signals: ["The free report can score social proof once profile links, reviews, schema, and trust signals are visible in the scan."],
    opportunities: ["Connect active social profiles from the website and use posts as proof assets, not popularity contests."],
  };
}

function createLocalDominationFallback(report: MiniAuditReport): MiniAuditReport["localDominationPlan"] {
  const market = report.client.market ?? report.client.city;
  const service = report.businessProfile?.primaryServices?.[0] ?? report.client.primaryMake ?? "local service";
  return {
    title: "Local Community Domination Plan",
    thesis: `You do not need to beat national corporations first. ${report.client.name} needs to become the most obvious local answer in ${market} when buyers ask AI/search who to trust nearby.`,
    queryFanOutBrief: "AI does not just know who to recommend. For current local recommendations it often searches for service, city, review, comparison, and proof signals — then cites the business with the clearest evidence.",
    recommendedPages: [`/services/${slugifyDisplay(service)}-${slugifyDisplay(market)}`, `/faq/${slugifyDisplay(service)}-${slugifyDisplay(market)}`],
    faqOpportunities: [`What should buyers know before choosing ${service} in ${market}?`, `How do I compare ${service} providers near ${market}?`],
    reviewSyndicationActions: ["Turn one strong review into a website proof block, Google Business Profile response, social post, short video, and FAQ proof snippet."],
    brandDefensePrompts: [`${report.client.name} reviews`, `${report.client.name} legit`, `${report.client.name} ${market}`],
    monthlyActions: ["Refresh search-backed and conversational AI recommendation prompts, service/city pages, review proof, and competitor movement every month."],
  };
}

function slugifyDisplay(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "local";
}

function createEvidenceFallback(report: MiniAuditReport): MiniAuditReport["evidenceCards"] {
  return [
    {
      finding: "AI answer visibility is not reliable yet",
      evidence: `${report.promptsAppeared}/${report.promptsTotal} tested AI recommendation moments surfaced the business in the free preview model.`,
      whyItMatters: "If the business is absent from answer engines at the recommendation moment, buyers may shortlist competitors first.",
      recommendedFix: "Create answer-ready pages, FAQs, schema, and proof blocks mapped to the missed recommendation moments.",
      confidence: "Directional",
    },
    {
      finding: "Competitor benchmark shows the market context",
      evidence: report.competitiveRank ? `Current market rank in the mini benchmark: #${report.competitiveRank}.` : "Competitor data is needed for a sharper benchmark.",
      whyItMatters: "Competitor comparison makes the opportunity more concrete than a generic website audit.",
      recommendedFix: "Use the full report to compare AI-answer evidence, website signals, and fix priorities competitor-by-competitor.",
      confidence: report.competitiveRank ? "Medium" : "Directional",
    },
    {
      finding: "Revenue estimate remains directional",
      evidence: report.revenueOpportunityGap ? `Annual gap vs top-two average: $${report.revenueOpportunityGap.annualGapVsTopTwoAverage.toLocaleString()}.` : "Revenue model unlocks when competitor and assumption data are available.",
      whyItMatters: "Assumption-based ranges are more credible than pretending one exact revenue number is guaranteed.",
      recommendedFix: "Show conservative, likely, and aggressive scenarios in the paid report and let assumptions be adjusted.",
      confidence: "Directional",
    },
  ];
}
