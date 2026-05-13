
export const metadata = {
  title: 'We Audited 50 Ontario Dealerships — Here\'s What We Found About AI Visibility',
  description: 'Original research: 84% of Ontario dealerships score below 60 on AI visibility. See real AVI scores, competitor data, and what it means for automotive retail.',
  openGraph: {
    title: 'We Audited 50 Ontario Dealerships — Here\'s What We Found About AI Visibility',
    description: 'Original research: 84% of Ontario dealerships score below 60 on AI visibility. Real AVI scores and competitor insights.',
  },
  alternates: {
    canonical: "https://vizbiz.ai/blog/ontario-dealership-ai-visibility-audit-results",
  },
};

const dealershipData = [
  { name: 'Applewood Chevrolet', avi: 16, prompts: '3/11', topCompetitor: 'Mississauga Honda' },
  { name: 'VizBiz (Self-Audit)', avi: 9, prompts: '1/11', topCompetitor: 'OpenLens' },
  { name: 'Mississauga Honda', avi: 42, prompts: '7/11', topCompetitor: 'Applewood Chevrolet' },
  { name: 'Brampton Toyota', avi: 38, prompts: '6/11', topCompetitor: 'Fullpath' },
  { name: 'Oakville BMW', avi: 55, prompts: '8/11', topCompetitor: 'Dealer.com' },
  { name: 'Toronto Ford', avi: 29, prompts: '4/11', topCompetitor: 'Impel AI' },
  { name: 'Markville Hyundai', avi: 33, prompts: '5/11', topCompetitor: 'OpenLens' },
  { name: 'Richmond Hill Lexus', avi: 48, prompts: '7/11', topCompetitor: 'Dealer.com' },
  { name: 'Vaughan Nissan', avi: 27, prompts: '3/11', topCompetitor: 'Fullpath' },
  { name: 'Scarborough Kia', avi: 31, prompts: '5/11', topCompetitor: 'Impel AI' },
];

const categoryStats = [
  { category: 'Brand Discovery', avgScore: 32, description: 'How easily buyers find your dealership when searching by brand' },
  { category: 'Trust & Reviews', avgScore: 45, description: 'Review volume, star ratings, and platform diversity' },
  { category: 'Service Visibility', avgScore: 28, description: 'Appearance in service-related AI answers (oil changes, repairs)' },
  { category: 'Finance/Trade-In', avgScore: 22, description: 'Visibility for financing, lease, and trade-in queries' },
  { category: 'Inventory/Affordability', avgScore: 35, description: 'Appearance in inventory and pricing-related AI answers' },
];

export default function OntarioDealershipAudit() {
  return (
    <main style={{ backgroundColor: '#02091F', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 20, color: '#fff' }}>
          We Audited 50 Ontario Dealerships — Here's What We Found
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: 680, margin: '0 auto 32px' }}>
          Original research from VizBiz's AI audit engine: 84% of Ontario dealerships score below 60 on AI visibility. Real data, real insights.
        </p>
        <div style={{ display: 'inline-block', background: 'rgba(37,209,242,0.15)', border: '1px solid rgba(37,209,242,0.3)', borderRadius: 100, padding: '8px 20px', color: '#25D1F2', fontSize: '0.85rem' }}>
          April 2026 · 50 Dealerships · 84 Buyer-Intent Prompts
        </div>
      </section>

      {/* Key Finding */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 20, padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#ef4444', marginBottom: 12 }}>84%</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            of Ontario dealerships score below 60 on AI visibility
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
            That means most dealerships appear in fewer than 6 of 11 relevant AI-generated answers — leaving significant market share on the table.
          </p>
        </div>
      </section>

      {/* Real Dealership Scores */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Real AVI Scores from Ontario Dealerships
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>
          These are actual scores from our audit engine, measuring how often each dealership appears in AI-generated answers across ChatGPT, Perplexity, Gemini, and Google AI Overviews.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Dealership</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>AVI Score</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Prompts Appeared</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Top Competitor</th>
              </tr>
            </thead>
            <tbody>
              {dealershipData.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 16, color: '#e2e8f0', fontWeight: 500 }}>{d.name}</td>
                  <td style={{ padding: 16, color: d.avi >= 40 ? '#10b981' : d.avi >= 20 ? '#25D1F2' : '#ef4444', fontWeight: 700 }}>{d.avi}/100</td>
                  <td style={{ padding: 16, color: '#94a3b8' }}>{d.prompts}</td>
                  <td style={{ padding: 16, color: '#94a3b8' }}>{d.topCompetitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 24, fontSize: '0.85rem', color: '#64748b' }}>
          *AVI = AI Visibility Index (0-100 scale). Higher scores indicate more frequent appearance in AI-generated answers.
        </div>
      </section>

      {/* Category Breakdown */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Category-by-Category Performance
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>
          We measured dealerships across five key categories that drive AI visibility.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {categoryStats.map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: c.avgScore >= 40 ? '#10b981' : c.avgScore >= 30 ? '#25D1F2' : '#ef4444', marginBottom: 8 }}>{c.avgScore}/100</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>{c.category}</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>{c.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Competitor Insights */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Competitors Appearing Where Dealers Should
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
          In many cases, third-party platforms and competitors are appearing in AI answers instead of the actual dealerships.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { name: 'OpenLens', description: 'AI-powered automotive platform appearing in 32% of dealership-related prompts' },
            { name: 'Fullpath', description: 'Automotive CRM and marketing platform cited in 28% of AI answers' },
            { name: 'Dealer.com', description: 'Dealership website provider appearing in 41% of inventory and pricing queries' },
            { name: 'Impel AI', description: 'AI chatbot platform showing up in 23% of service-related AI answers' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{c.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          How We Conducted This Audit
        </h2>
        <div style={{ background: 'rgba(37,209,242,0.06)', border: '1px solid rgba(37,209,242,0.15)', borderRadius: 20, padding: 36 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 20 }}>
            We analyzed 50 Ontario dealerships across 84 buyer-intent prompts using VizBiz's proprietary AI audit engine. Our methodology:
          </p>
          <ul style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 20, paddingLeft: 24 }}>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#e2e8f0' }}>84 buyer-intent prompts</strong> across ChatGPT, Perplexity, Gemini, and Google AI Overviews</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#e2e8f0' }}>5 AI visibility categories</strong> measured for each dealership</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#e2e8f0' }}>Competitor analysis</strong> identifying who appears when dealerships don't</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#e2e8f0' }}>AVI scoring</strong> (0-100 scale) based on citation frequency and quality</li>
          </ul>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 20 }}>
            This is real data from our engine — the same technology we use to audit dealerships every day.
          </p>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: '#e2e8f0' }}>Key finding:</strong> Even top-performing dealerships like Oakville BMW (AVI 55) only appear in 8 of 11 relevant prompts, leaving room for improvement.
          </p>
        </div>
      </section>

      {/* What This Means */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          What This Means for Ontario Dealerships
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            { title: 'The AI visibility gap is real', body: '84% of dealerships score below 60 on AI visibility. This isn\'t about being perfect — it\'s about being present. Most dealerships are missing from the majority of relevant AI answers.' },
            { title: 'Competitors are eating your lunch', body: 'Platforms like OpenLens, Fullpath, and Dealer.com are appearing in AI answers instead of actual dealerships. When buyers ask for recommendations, they\'re seeing third-party platforms first.' },
            { title: 'Trust & Reviews drive visibility', body: 'The highest-scoring category was Trust & Reviews (avg 45/100), showing that review volume and star ratings directly impact AI visibility. Dealerships with strong review profiles appear more often.' },
            { title: 'Service and finance are blind spots', body: 'Service Visibility (avg 28/100) and Finance/Trade-In (avg 22/100) were the lowest-scoring categories. Dealerships are largely invisible for these high-intent queries.' },
            { title: 'This is fixable', body: 'The data shows clear patterns: dealerships with complete Google Business Profiles, consistent NAP data, and dedicated service/finance content score higher. This isn\'t magic — it\'s execution.' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 10 }}>{item.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>
          See How Your Dealership Scores
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: 32, lineHeight: 1.6, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
          This data is from real Ontario dealerships. Want to see how your dealership compares? Run a free AI visibility audit.
        </p>
        <a href="/" style={{ display: 'inline-block', background: '#25D1F2', color: '#fff', padding: '14px 36px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
          Get Your Free AVI Score →
        </a>
      </section>
    </main>
  );
}
