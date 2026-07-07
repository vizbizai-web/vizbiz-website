import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLeadByLeadId } from '@/lib/google-sheets';
import { getFixKit } from '@/lib/fix-kit-store';

export const dynamic = 'force-dynamic';

export default async function ClientFixKitPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  const [lead, kit] = await Promise.all([getLeadByLeadId(leadId), getFixKit(leadId).catch(() => null)]);
  if (!lead || !kit) return notFound();
  const allowed = kit.status === 'approved' || kit.status === 'delivered';

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href={`/report/${leadId}/full/`} className="text-sm text-cyan-300 hover:text-cyan-200">← Back to full report</Link>
        <header className="mt-8 mb-8 rounded-3xl border border-cyan-400/20 bg-slate-900/60 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">VizBiz Fix Kit</p>
          <h1 className="mt-3 text-3xl font-bold text-white">{lead.dealershipName}: AI visibility implementation pack</h1>
          <p className="mt-3 max-w-3xl text-slate-300">Copy-ready assets for your website and Google Business Profile. These are the practical fixes to forward to your web person or apply yourself.</p>
          {!allowed && <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">This Fix Kit is still waiting for operator approval. Delivery and downloads are blocked until every artifact is approved.</div>}
          {allowed && <a href={`/api/fix-kits/${leadId}/download/`} className="mt-5 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Download everything (.zip)</a>}
        </header>

        <section className="grid gap-5">
          {kit.artifacts.map((artifact) => (
            <article key={artifact.key} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{artifact.title}</h2>
                  <p className="text-sm text-slate-500">{artifact.filename}</p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">{artifact.status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{artifact.instruction}</p>
              <pre className="mt-4 max-h-[460px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-black/40 p-4 text-sm text-slate-200">{artifact.content}</pre>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
