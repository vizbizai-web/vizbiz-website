export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The AI Visibility Tool Built for Car Dealerships | VizBiz',
  description: 'The AI visibility tool for car dealerships. Measure, track, and improve how your dealership appears in ChatGPT, Google AI Overviews, and AI-powered search results.',
  openGraph: {
    title: 'The AI Visibility Tool Built for Car Dealerships',
    description: 'Measure, track, and improve how your dealership appears in ChatGPT, Google AI Overviews, and AI-powered search results.',
  },
};

export default function AIVisibilityTool() {
  return (
    <main style={{ backgroundColor: '#07090f', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Hero */}
      <section style={{ padding: '100px 24px 80px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15, marginBottom: 24, color: '#fff' }}>
          The AI Visibility Tool Built for Car Dealerships
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Measure, track, and improve how your dealership appears in ChatGPT, Google AI Overviews, Perplexity, and every AI-powered search result your buyers use.
        </p>
        <a href="/" style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', padding: '16px 40px', borderRadius: 14, fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none' }}>
          Start Your Free Audit →
        </a>
      </section>

      {/* What It Does */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 36, color: '#fff', textAlign: 'center' }}>
          What VizBiz Does
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { icon: '🔍', title: 'AI Presence Detection', desc: 'Find out exactly which AI platforms mention your dealership — and which ones don\'t.' },
            { icon: '📊', title: 'AVI Score Tracking', desc: 'Your AI Visibility Index score shows where you stand vs competitors across all AI platforms.' },
            { icon: '🏆', title: 'Competitive Intelligence', desc: 'See which dealerships AI recommends for your target keywords and why they\'re winning.' },
            { icon: '📋', title: 'Action Reports', desc: 'Get specific, prioritized recommendations to improve your AI visibility — no guesswork.' },
            { icon: '📈', title: 'Weekly Monitoring', desc: 'AI results change constantly. Track your visibility over time and catch drops before they hurt.' },
            { icon: '🎯', title: 'Keyword Coverage Map', desc: 'See which buyer-intent keywords trigger AI answers about your market — and your share of them.' },
          ].map((card, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 30 }}>
              <div style={{ fontSize: '2rem', marginBottom: 14 }}>{card.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 10 }}>{card.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0, fontSize: '0.93rem' }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 36, color: '#fff', textAlign: 'center' }}>
          How It Works
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { step: '1', title: 'Enter your dealership', desc: 'Provide your dealership name and location. We handle the rest.' },
            { step: '2', title: 'AI-powered scan', desc: 'We query ChatGPT, Google AI Overviews, Perplexity, and other AI platforms with real buyer-intent keywords for your market.' },
            { step: '3', title: 'Get your AVI score', desc: 'Your AI Visibility Index score (0–100) shows exactly how visible you are across AI search results.' },
            { step: '4', title: 'Follow the action plan', desc: 'Prioritized, dealership-specific recommendations tell you exactly what to fix for maximum impact.' },
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 16, padding: 28 }}>
              <div style={{ minWidth: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 800, fontSize: '1.2rem' }}>{item.step}</div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AVI Scoring Breakdown */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 36, color: '#fff', textAlign: 'center' }}>
          AVI Score Breakdown
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { pillar: 'AI Presence', weight: '25%', desc: 'Are you mentioned in AI-generated answers for buyer-intent keywords in your market?', color: '#3b82f6' },
            { pillar: 'Content Quality', weight: '20%', desc: 'When AI does mention you, is the information accurate, complete, and favorable?', color: '#8b5cf6' },
            { pillar: 'Competitive Position', weight: '20%', desc: 'How do you rank vs other dealerships in your area for the same AI queries?', color: '#06b6d4' },
            { pillar: 'Consistency', weight: '20%', desc: 'Are you cited across multiple AI platforms — or only one?', color: '#10b981' },
            { pillar: 'Momentum', weight: '15%', desc: 'Is your AI visibility growing, stable, or declining over time?', color: '#f59e0b' },
          ].map((item) => (
            <div key={item.pillar} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0 }}>{item.pillar}</h3>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.color }}>{item.weight}</span>
              </div>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0, fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison vs Manual */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 36, color: '#fff', textAlign: 'center' }}>
          VizBiz vs Manual Checks
        </h2>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 36, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#3b82f6', fontWeight: 600 }}>VizBiz</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Manual</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['AI platforms checked', '8+', '1–2'],
                ['Keywords analyzed', '50+', '5–10'],
                ['Competitors compared', 'Top 10', 'None'],
                ['Time to complete', '< 5 minutes', '4+ hours'],
                ['Repeats weekly', 'Automated', 'No'],
                ['Scores & benchmarks', 'Yes', 'No'],
                ['Action recommendations', 'Prioritized', 'Guesswork'],
                ['Tracks changes over time', 'Yes', 'No'],
              ].map(([feature, vizbiz, manual], i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{feature}</td>
                  <td style={{ textAlign: 'center', padding: '14px 16px', color: '#3b82f6', fontWeight: 600 }}>{vizbiz}</td>
                  <td style={{ textAlign: 'center', padding: '14px 16px', color: '#64748b' }}>{manual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 20, color: '#fff' }}>
          Your Buyers Are Already Asking AI About You
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: 36, lineHeight: 1.6 }}>
          The question is whether AI is recommending you — or your competitor. Find out in 5 minutes.
        </p>
        <a href="/" style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', padding: '16px 44px', borderRadius: 14, fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none' }}>
          Run Your Free AI Visibility Audit →
        </a>
      </section>
    </main>
  );
}
