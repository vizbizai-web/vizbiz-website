
export const metadata = {
  title: 'AI Visibility Audit: What It Measures and Why Your Business Needs One',
  description: 'A real AI visibility audit doesn\'t just give you a score — it tells you exactly why AI recommends your competitors instead of you. Here\'s what the methodology actually measures.',
  openGraph: {
    title: 'AI Visibility Audit: What It Measures and Why Your Business Needs One',
    description: 'A real AI visibility audit tells you exactly why AI recommends your competitors instead of you. Here\'s what the methodology actually measures.',
  },
  alternates: {
    canonical: "https://vizbiz.ai/blog/ai-visibility-audit-what-it-measures-dealership",
  },
};

export default function AIVisibilityAuditGuide() {
  return (
    <main style={{ backgroundColor: '#02091F', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 20, color: '#fff' }}>
          AI Visibility Audit: What It Measures and Why Your Business Needs One
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: 660, margin: '0 auto' }}>
          A score of 34 out of 100 doesn't tell you what to fix. A real audit does. Here's exactly what VizBiz measures, how the methodology works, and what your results actually mean.
        </p>
      </section>

      {/* What Is an AVI Audit */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          What an AI Visibility Audit Actually Is
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
          Most businesses have never been "audited" for AI visibility — because most audits don't exist yet. The few that do fall into two categories:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
          {[
            {
              label: 'Surface-level audits',
              desc: 'These check whether your business name appears in ChatGPT when you ask a direct question. Useful, but binary — it tells you if you exist, not why you\'re invisible or how to fix it.',
              color: '#ef4444',
            },
            {
              label: 'Real methodology audits',
              desc: 'These test your business across dozens of customer-intent queries, measure your recommendation rate versus competitors, score specific categories (discovery, trust, services, specialties, pricing), and identify exact gaps. This is what VizBiz does.',
              color: '#10b981',
            },
          ].map((item) => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${item.color === '#ef4444' ? '239,68,68' : '16,185,129'}, 0.2)`, borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                <span style={{ fontWeight: 600, color: '#fff' }}>{item.label}</span>
              </div>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0, paddingLeft: 22 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(37,209,242,0.06)', border: '1px solid rgba(37,209,242,0.15)', borderRadius: 20, padding: 28, marginTop: 24 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, margin: 0 }}>
            <strong style={{ color: '#fff' }}>The goal isn't just a number.</strong> It's understanding exactly which signals AI is picking up on, where your competitors have an edge, and which fixes will move the needle most.
          </p>
        </div>
      </section>

      {/* The 5 Categories */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          The 5 AVI Categories — Explained
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 24 }}>
          Your AI Visibility score is calculated across five weighted categories. Here's what each one measures and why it matters:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            {
              pct: '30%',
              name: 'Business Discovery',
              what: 'How easily a customer can find your business when searching for your services in your market.',
              how: 'Queried across ChatGPT, Gemini, and Perplexity for service/location combinations that should return your business. Measures whether you appear in the first 3 recommendations and how often.',
              examples: [
                '"Emergency plumber near downtown Austin"',
                '"Best family dentist in Naperville"',
                '"Affordable roof repair in Denver"',
              ],
              weightNote: 'Highest weight because discovery is the first gate — if AI can\'t find you in relevant searches, nothing else matters.',
            },
            {
              pct: '25%',
              name: 'Trust & Reviews',
              what: 'Your reputation as AI systems understand it across the web.',
              how: 'Scans for your business on Google, Yelp, Facebook, and industry-specific platforms. Factors in review volume, recency, average rating, response rate, and sentiment.',
              examples: [
                '"Reputable mechanic in Portland"',
                '"Dentist with best patient reviews in Scottsdale"',
                '"Most trusted real estate agent in Austin"',
              ],
              weightNote: 'AI trusts consensus. A business with 300 reviews across 4 platforms looks more credible than one with 30 reviews on Google alone.',
            },
            {
              pct: '20%',
              name: 'Service Visibility',
              what: 'Whether AI knows about and recommends your specific services and specialties.',
              how: 'Tests queries about specific services and checks whether your business is cited as an option. Also measures service page content quality.',
              examples: [
                '"Same-day crown dentist [city]"',
                '"Tankless water heater installation [city]"',
                '"LLC formation attorney [city]"',
              ],
              weightNote: 'Many businesses list services vaguely — but AI needs specificity to match you to the right customer queries.',
            },
            {
              pct: '15%',
              name: 'Offerings Presence',
              what: 'How your specific products or services show up in targeted searches.',
              how: 'Tests queries like "Invisalign consultation in Boston under $5000" or "emergency HVAC repair same day Chicago" and checks whether your offerings are mentioned.',
              examples: [
                '"Teeth whitening special offer [city]"',
                '"HVAC maintenance plan [city]"',
                '"Free consultation divorce lawyer [city]"',
              ],
              weightNote: 'Specific offering visibility ties to the bottom of funnel. Customers with clear intent are most likely to book whoever AI recommends.',
            },
            {
              pct: '10%',
              name: 'Pricing & Payment Presence',
              what: 'How clearly AI understands your pricing options and payment methods.',
              how: 'Tests whether your pricing page, accepted payment types, financing options, and insurance acceptance appear in relevant queries.',
              examples: [
                '"Dentist that accepts Delta Dental [city]"',
                '"Plumber with flat-rate pricing [city]"',
                '"Law firm free initial consultation [city]"',
              ],
              weightNote: 'Pricing visibility is often overlooked but matters for customers whose decision hinges on cost transparency.',
            },
          ].map((item) => (
            <div key={item.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 28 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ minWidth: 48, textAlign: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#25D1F2' }}>{item.pct}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', margin: 0 }}>{item.name}</h3>
              </div>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 14 }}><strong style={{ color: '#cbd5e1' }}>What it measures:</strong> {item.what}</p>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 14 }}><strong style={{ color: '#cbd5e1' }}>How it works:</strong> {item.how}</p>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 12 }}><strong>Sample queries:</strong></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {item.examples.map((ex) => (
                  <div key={ex} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ minWidth: 6, height: 6, borderRadius: '50%', background: '#25D1F2', flexShrink: 0 }} />
                    <span style={{ color: '#94a3b8', fontSize: '0.88rem', fontStyle: 'italic' }}>{ex}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(37,209,242,0.05)', border: '1px solid rgba(37,209,242,0.12)', borderRadius: 10, padding: 12 }}>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}><strong style={{ color: '#fff' }}>Why it matters:</strong> {item.weightNote}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Methodology */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          The Methodology: Dozens of Prompts Across 3 AI Platforms
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
          Here's the exact process behind a VizBiz audit — so you know what's actually being measured:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
          {[
            {
              step: '1',
              title: 'Define the prompt set',
              desc: 'We curate customer-intent prompts across 5 categories (Discovery, Trust, Services, Offerings, Pricing). These aren\'t random — they\'re built from real search patterns and refined against actual AI response data. Each prompt reflects something a real customer would type.',
            },
            {
              step: '2',
              title: 'Run across ChatGPT, Gemini, and Perplexity',
              desc: 'Each prompt is submitted to all three platforms from a clean session (no prior context). We capture the full response — not just whether your business appears, but where, in what context, and what AI says about you.',
            },
            {
              step: '3',
              title: 'Score each result',
              desc: 'For each prompt, your business gets a sub-score: mentioned in top 3 (full points), mentioned but not in top 3 (partial), not mentioned (zero). Each sub-score is weighted by category. Competitors are tracked the same way.',
            },
            {
              step: '4',
              title: 'Calculate AVI score and gap analysis',
              desc: 'Sub-scores roll up into your 0-100 AVI score. Then we compare you to your competitive set — who\'s being recommended, why, and which gaps are costing you the most recommendations.',
            },
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', gap: 20 }}>
              <div style={{ minWidth: 40, height: 40, borderRadius: 12, background: 'rgba(37,209,242,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D1F2', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>{item.step}</div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(37,209,242,0.06)', border: '1px solid rgba(37,209,242,0.15)', borderRadius: 16, padding: 24, marginTop: 24 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: '#fff' }}>Why so many prompts?</strong> Research on AI recommendation behavior shows that recommendation patterns vary significantly by query type. One or two prompts can't capture the full picture — you need enough queries to see patterns in where businesses appear and where they don't. Our threshold is the minimum that produces consistent, reproducible scores.
          </p>
        </div>
      </section>

      {/* Sample Results Table */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Sample Audit Results: 5 Local Businesses
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 24 }}>
          Here's what an actual audit comparison looks like. These are anonymized results from a recent audit of local businesses:
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>Business</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>Discovery /30</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>Trust /25</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>Service /20</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>Offerings /15</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>Pricing /10</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>AVI Score</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Business A (Dental)', d: 24, t: 18, s: 12, i: 9, f: 4, total: 67 },
                { name: 'Business B (Plumbing)', d: 19, t: 15, s: 8, i: 7, f: 5, total: 54 },
                { name: 'Business C (Legal)', d: 11, t: 14, s: 6, i: 5, f: 3, total: 39 },
                { name: 'Business D (HVAC)', d: 8, t: 9, s: 5, i: 4, f: 2, total: 28 },
                { name: 'Business E (Auto Repair)', d: 5, t: 7, s: 3, i: 2, f: 1, total: 18 },
                { name: '📊 Average (50 businesses)', d: 9, t: 8, s: 5, i: 4, f: 2, total: 11 },
              ].map((row, i) => (
                <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i === 5 ? 'rgba(37,209,242,0.04)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', color: i === 5 ? '#25D1F2' : '#cbd5e1', fontWeight: i === 5 ? 600 : 400 }}>{row.name}</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8' }}>{row.d}</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8' }}>{row.t}</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8' }}>{row.s}</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8' }}>{row.i}</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8' }}>{row.f}</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 700, color: i === 5 ? '#25D1F2' : row.total >= 50 ? '#10b981' : row.total >= 30 ? '#25D1F2' : '#ef4444' }}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: '#64748b', fontSize: '0.83rem' }}>50+ Strong</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#25D1F2' }} />
            <span style={{ color: '#64748b', fontSize: '0.83rem' }}>30-49 Building</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ color: '#64748b', fontSize: '0.83rem' }}>Below 30 Invisible</span>
          </div>
        </div>
        <p style={{ color: '#64748b', lineHeight: 1.7, marginTop: 20, fontSize: '0.9rem' }}>
          <strong style={{ color: '#94a3b8' }}>Key insight:</strong> Business A scores 67 — still room to improve, but clearly in the recommended set. Business E scores 18 — nearly invisible to AI, despite being an established, operating business. A score of 11 (the average) means AI rarely mentions that business at all, even when the query should return them.
        </p>
      </section>

      {/* AVI vs SEO Audit */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          How This Compares to a Traditional SEO Audit
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 20 }}>
          If you've had an SEO audit before, you might be wondering what makes an AI visibility audit different. Here's the honest comparison:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              dimension: 'What it measures',
              seo: 'How well Google can crawl and index your site',
              avi: 'Whether AI recommends your business across multiple platforms',
            },
            {
              dimension: 'Platforms tested',
              seo: 'Google only (your website ranking)',
              avi: 'ChatGPT, Gemini, Perplexity, and Google AI Overviews',
            },
            {
              dimension: 'Key signals',
              seo: 'Backlinks, keywords, page speed, meta tags, schema',
              avi: 'Review volume, GBP completeness, directory citations, content depth, schema',
            },
            {
              dimension: 'What you get',
              seo: 'A list of technical fixes for Google rankings',
              avi: 'A prioritized action plan ranked by recommendation impact',
            },
            {
              dimension: 'How often it changes',
              seo: 'Rankings shift gradually over weeks',
              avi: 'AI model updates can shift recommendations overnight',
            },
            {
              dimension: 'What it misses',
              seo: 'AI recommendations entirely — you can rank #1 and get zero AI mentions',
              avi: 'Technical SEO issues that don\u2019t affect AI recommendation',
            },
          ].map((row) => (
            <div key={row.dimension} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(37,209,242,0.04)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#25D1F2', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>SEO Audit</div>
                <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>{row.seo}</div>
              </div>
              <div style={{ padding: '14px 16px', background: 'rgba(16,185,129,0.04)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>AVI Audit</div>
                <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>{row.avi}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 24, marginTop: 24 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: '#fff' }}>Bottom line:</strong> An SEO audit tells you how to rank better on Google. An AVI audit tells you how to get recommended by AI. You need both — but if you're only doing one, the AI audit is the one that's going to matter more in 2026 and beyond.
          </p>
        </div>
      </section>

      {/* Why You Need One */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Why Your Business Needs an AVI Audit
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              title: 'You can\'t fix what you can\'t measure',
              body: 'Most businesses have no idea whether they appear in ChatGPT, Gemini, or Perplexity. An AVI audit gives you a baseline. Without a baseline, you\'re guessing — and guessing wastes budget.',
            },
            {
              title: 'Your competitors might already be ahead',
              body: 'Audits found businesses scoring 67 alongside businesses scoring 8. That\'s not a small gap — it\'s the difference between being recommended and being invisible. If you haven\'t audited, you don\'t know which side you\'re on.',
            },
            {
              title: 'AI visibility moves faster than SEO',
              body: 'Google updates its algorithm a few times a year. AI models update constantly — and an AI model update can completely change which businesses get recommended. You need to re-audit regularly, not once every two years.',
            },
            {
              title: 'The audit itself is the action plan',
              body: 'VizBiz\'s AVI audit doesn\'t just give you a score — it tells you exactly which gaps are costing you recommendations, ranked by impact. The highest-leverage fix is immediately visible. You\'re not staring at a dashboard and wondering what to do next.',
            },
          ].map((item) => (
            <div key={item.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 10 }}>{item.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px 80px', textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>
          Get Your AI Visibility Audit
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: 32 }}>
          Find out exactly where your business stands across ChatGPT, Gemini, and Perplexity. Get your score, your category breakdown, and your top 3 gaps — free.
        </p>
        <a href="/" style={{ display: 'inline-block', background: '#25D1F2', color: '#fff', padding: '14px 36px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
          Run Your Free AVI Audit →
        </a>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 16 }}>
          Free. No credit card. Results in 2 minutes.
        </p>
      </section>
    </main>
  );
}
