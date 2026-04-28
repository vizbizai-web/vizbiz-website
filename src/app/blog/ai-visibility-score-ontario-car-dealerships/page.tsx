export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'We Scored 50 Ontario Dealerships on AI Visibility — The Results Were Brutal',
  description: 'We ran 84 buyer-intent prompts across ChatGPT, Gemini, and Perplexity for 50 Ontario dealerships. The average score was 11 out of 100.',
  openGraph: {
    title: 'We Scored 50 Ontario Dealerships on AI Visibility — The Results Were Brutal',
    description: 'We ran 84 buyer-intent prompts across ChatGPT, Gemini, and Perplexity for 50 Ontario dealerships. The average score was 11 out of 100.',
  },
  alternates: {
    canonical: "https://vizbiz.ai/blog/ai-visibility-score-ontario-car-dealerships",
  },
};

export default function OntarioDealershipScores() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'We Scored 50 Ontario Dealerships on AI Visibility — The Results Were Brutal',
    description: 'We ran 84 buyer-intent prompts across ChatGPT, Gemini, and Perplexity for 50 Ontario dealerships. The average score was 11 out of 100.',
    author: { '@type': 'Organization', name: 'VizBiz' },
    publisher: { '@type': 'Organization', name: 'VizBiz', url: 'https://vizbiz.ai' },
    datePublished: '2026-04-21',
    url: 'https://vizbiz.ai/blog/ai-visibility-score-ontario-car-dealerships',
  };

  return (
    <main style={{ backgroundColor: '#07090f', minHeight: '100vh', color: '#e2e8f0' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section style={{ padding: '80px 24px 50px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 20, color: '#fff' }}>
          We Scored 50 Ontario Dealerships on AI Visibility — The Results Were Brutal
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: 660, margin: '0 auto' }}>
          84 prompts. 3 AI engines. 50 dealerships. The average AI Visibility Index score: 11 out of 100. Here's what that means and what to do about it.
        </p>
      </section>

      {/* Key Takeaways */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 18, padding: 28 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#3b82f6', marginBottom: 16 }}>Key Takeaways</h2>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}>The average Ontario dealership scored 11/100 on AI visibility — meaning they're nearly invisible in AI-generated answers.</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}>The top 3 scorers all shared specific traits: structured data, 150+ reviews on 4+ platforms, and detailed website content.</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}>Discovery and trust signals were the weakest categories — most dealerships aren't cited when buyers ask AI for recommendations.</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}>The gap between the top scorers and everyone else is enormous — and it's growing.</li>
          </ul>
        </div>
      </section>

      {/* Methodology */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          How We Scored Them
        </h2>
        <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 20, padding: 32 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
            We selected 50 Ontario dealerships across the GTA, Ottawa, Hamilton, London, and Kitchener-Waterloo — a mix of new-car franchises and independent used-car dealers.
          </p>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
            For each dealership, we ran <strong style={{ color: '#e2e8f0' }}>84 buyer-intent prompts</strong> across three AI engines: ChatGPT, Google Gemini, and Perplexity. Prompts covered the full buyer journey — from "best car dealership near me" to "where can I get my Honda financed with bad credit in Mississauga."
          </p>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
            Each response was scored using the <strong style={{ color: '#e2e8f0' }}>AVI (AI Visibility Index) formula</strong>, which measures five pillars:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li style={{ color: '#cbd5e1', lineHeight: 1.5 }}><strong style={{ color: '#e2e8f0' }}>Discovery</strong> — Is the dealership named in response to discovery queries?</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.5 }}><strong style={{ color: '#e2e8f0' }}>Trust</strong> — Do AI answers portray the dealership positively (reviews, ratings, reputation)?</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.5 }}><strong style={{ color: '#e2e8f0' }}>Service</strong> — Are specific services (oil change, financing, trade-in) attributed accurately?</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.5 }}><strong style={{ color: '#e2e8f0' }}>Inventory</strong> — Does the AI know what makes/models the dealership carries?</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.5 }}><strong style={{ color: '#e2e8f0' }}>Finance</strong> — Is the dealership cited for financing and lease-related queries?</li>
          </ul>
        </div>
      </section>

      {/* The Score */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 48 }}>
          <div style={{ fontSize: '4rem', fontWeight: 800, color: '#3b82f6', lineHeight: 1, marginBottom: 12 }}>11 / 100</div>
          <div style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: 500, margin: '0 auto' }}>
            Average AI Visibility Index score across 50 Ontario dealerships. That means the typical dealership is cited in roughly 1 out of every 9 relevant AI-generated answers.
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Breakdown by Category
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { cat: 'Discovery', score: '8/100', pct: 8, desc: 'When buyers ask "best dealership near me" or "where should I buy a used car in [city]", only 4% of dealerships were consistently named. Most AI answers defaulted to the same 2–3 dealerships per city.' },
            { cat: 'Trust', score: '14/100', pct: 14, desc: 'AI answers rarely included review summaries or star ratings. Most dealerships don\'t have enough review volume or platform diversity for AI models to surface reputation data confidently.' },
            { cat: 'Service', score: '18/100', pct: 18, desc: 'Slightly better. Some dealerships were cited for specific services, but only when their website had detailed service pages. The majority had thin or generic service descriptions.' },
            { cat: 'Inventory', score: '12/100', pct: 12, desc: 'AI engines struggled to match dealerships to specific makes and models. Most dealership websites feed inventory through iframes or third-party tools that AI crawlers can\'t parse.' },
            { cat: 'Finance', score: '5/100', pct: 5, desc: 'The weakest category. Almost no dealerships were recommended for financing queries, even though "bad credit car loan" and "lease deals" are among the highest-intent keywords in automotive.' },
          ].map((item) => (
            <div key={item.cat} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0 }}>{item.cat}</h3>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>{item.score}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 8, marginBottom: 12 }}>
                <div style={{ background: '#3b82f6', borderRadius: 6, height: 8, width: `${item.pct}%` }} />
              </div>
              <p style={{ color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top 3 */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          The Top 3 Scorers and What They Did Differently
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { rank: '1', score: '47/100', traits: ['200+ Google reviews, 4.7★ average', 'Active on Cars.com, DealerRater, Yelp, and Facebook', 'Detailed make/model pages with 500+ words each', 'Complete LocalBusiness + AutomotiveDealer schema', 'Monthly blog publishing for 12+ months'] },
            { rank: '2', score: '41/100', traits: ['180+ reviews across 5 platforms', 'Comprehensive FAQ page (25+ questions)', 'Dedicated financing page with specific programs listed', 'Consistent NAP across 12+ citation sources', 'Active GBP with weekly posts and photo updates'] },
            { rank: '3', score: '36/100', traits: ['150+ Google reviews, strong DealerRater presence', 'Service pages with pricing and process descriptions', 'Structured data on every page (not just homepage)', 'Local community sponsorships generating online citations', 'Video content on YouTube that AI models reference'] },
          ].map((item) => (
            <div key={item.rank} style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 18, padding: 28 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ minWidth: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 800, fontSize: '1.2rem' }}>#{item.rank}</div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Score: {item.score}</div>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {item.traits.map((t, i) => (
                  <li key={i} style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.93rem' }}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p style={{ color: '#94a3b8', lineHeight: 1.7, marginTop: 20 }}>
          Notice: even the top scorer only reached 47/100. Nobody has this fully figured out yet — which is exactly why acting now creates such a strong advantage.
        </p>
      </section>

      {/* What to Fix First */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          What Every Ontario Dealership Should Fix First
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { step: '1', title: 'Run an AI visibility audit', body: 'You need a baseline. Find out exactly which AI engines cite you and which don\'t. Identify your weakest categories.' },
            { step: '2', title: 'Add structured data to your website', body: 'LocalBusiness + AutomotiveDealer schema. This is the single highest-impact fix for the lowest effort. Takes a developer 2–4 hours.' },
            { step: '3', title: 'Complete your Google Business Profile', body: 'Every field. Detailed description. All categories. Monthly posts. This is the #1 data source for AI recommendations.' },
            { step: '4', title: 'Start a review acceleration campaign', body: 'Target 100+ Google reviews. Then expand to Cars.com and DealerRater. Systematic follow-ups after every sale and service visit.' },
            { step: '5', title: 'Build a financing page', body: 'The weakest category across all 50 dealerships. A single detailed page covering your financing options, partners, and programs can move your Finance score from 5 to 30+ in weeks.' },
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <div style={{ minWidth: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 700, fontSize: '1.1rem' }}>{item.step}</div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: 48 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            Get Your Dealership Scored — Free
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
            We'll run the same 84-prompt audit for your dealership and show you exactly where you stand — and what to fix first.
          </p>
          <a href="/" style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', padding: '14px 36px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
            Get Your Free AI Visibility Score →
          </a>
        </div>
      </section>
    </main>
  );
}
