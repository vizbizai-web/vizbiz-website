
export const metadata = {
  title: 'What Is AI Visibility? (The Complete Guide)',
  description: 'AI visibility is the new SEO — but most business owners have never heard of it. This guide explains what it is, why it matters right now, and how to check your score for free.',
  openGraph: {
    title: 'What Is AI Visibility? (The Complete Guide)',
    description: 'AI visibility is the new SEO — but most business owners have never heard of it. Learn what it is, why it matters, and how to check your score for free.',
  },
  alternates: {
    canonical: "https://vizbiz.ai/blog/what-is-ai-visibility-car-dealerships",
  },
};

export default function WhatIsAIVisibility() {
  return (
    <main style={{ backgroundColor: '#02091F', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 20, color: '#fff' }}>
          What Is AI Visibility?
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: 660, margin: '0 auto' }}>
          SEO made your business visible on Google for 20 years. AI visibility is what's going to make you visible — or invisible — to the next generation of customers. Most local businesses haven't heard of it. That's the opportunity.
        </p>
      </section>

      {/* What Is AI Visibility */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          The Short Version
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
          AI visibility (sometimes called <strong style={{ color: '#fff' }}>AI discoverability</strong> or <strong style={{ color: '#fff' }}>generative engine optimization</strong>) is how often and how prominently an AI system — ChatGPT, Google AI Overviews, Gemini, Perplexity — recommends your business when someone asks for help finding a product, service, or provider.
        </p>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
          Think of it like this: when Google Maps recommends a coffee shop, that coffee shop gets foot traffic. When ChatGPT recommends a dentist to someone looking for a family practice, that dentist gets a new patient — without that person ever clicking a website.
        </p>
        <div style={{ background: 'rgba(37,209,242,0.06)', border: '1px solid rgba(37,209,242,0.15)', borderRadius: 20, padding: 28, marginTop: 24 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, margin: 0 }}>
            <strong style={{ color: '#fff' }}>In plain English:</strong> AI visibility is whether AI systems know your business exists, trust that you exist, and recommend you to the right customers. That's it. That's the whole game.
          </p>
        </div>
      </section>

      {/* Why It Matters Now */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Why This Matters Right Now — Not Next Year
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
          Three things have changed in the last 18 months that make AI visibility urgent:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
          {[
            {
              title: 'AI search has gone mainstream',
              body: 'ChatGPT has 200+ million weekly users. Google AI Overviews now appear for the majority of search queries. Gemini is embedded in Android phones. Perplexity is used by millions for research-mode searches. People aren\'t just Googling anymore — they\'re asking AI.',
            },
            {
              title: 'Traditional SEO is losing ground',
              body: 'Google AI Overviews have caused a documented 61% drop in click-through rates for organic search results. People read the AI summary and never click through to a website. The old playbook — rank #1 on Google — is worth less than it was two years ago.',
            },
            {
              title: 'AI recommendations are largely invisible to most businesses',
              body: 'BrightEdge found that 83.3% of AI-generated answers come from just the top 10 sources. Most local businesses aren\'t in any of those sources. And 91% of local businesses are essentially invisible to AI systems right now. That\'s not a small problem — it\'s a massive opportunity for the businesses that move first.',
            },
          ].map((item) => (
            <div key={item.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 10 }}>{item.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How AI Decides */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          How AI Decides Which Business to Recommend
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
          Unlike Google (which ranks pages by keywords and backlinks), AI recommendation systems work more like a well-read friend giving advice. They synthesize information from across the internet to form a picture of your business — and they recommend the ones that look most trustworthy, most relevant, and most cited.
        </p>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 20 }}>
          Here's what AI models are actually looking at:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { signal: 'Google Business Profile completeness', detail: 'Hours, address, photos, categories — all parsed and weighted' },
            { signal: 'Reviews across multiple platforms', detail: 'Google, Yelp, Facebook, industry-specific sites — volume, recency, and sentiment' },
            { signal: 'Website content and structure', detail: 'Service pages, FAQs, team descriptions, blog content' },
            { signal: 'Third-party directory presence', detail: 'Consistent NAP (name, address, phone) across industry directories and listings' },
            { signal: 'Structured data / schema markup', detail: 'AI reads schema to understand your business type, services, and location' },
            { signal: 'Citations from authoritative sources', detail: 'Local news mentions, industry directories, professional associations' },
          ].map((item) => (
            <div key={item.signal} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 8, height: 8, borderRadius: '50%', background: '#25D1F2', marginTop: 8, flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{item.signal}</strong>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}> — {item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Real-World Examples */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          What This Looks Like in Practice
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 24 }}>
          Here are three real scenarios where AI visibility — or lack of it — directly affects a local business:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            {
              context: 'The Service Search',
              scenario: 'A homeowner asks ChatGPT: "What plumbers near me have the best reviews for emergency calls?"',
              withGoodAVI: 'The AI confidently recommends a specific plumbing company — with address, hours, and a note about their 24/7 availability — because it found well-structured service pages, strong reviews, and consistent citations across multiple platforms.',
              withPoorAVI: 'The AI either recommends a different company entirely, or says "I don\'t have enough information about plumbers in that area." The homeowner calls the company that showed up.',
            },
            {
              context: 'The Professional Search',
              scenario: 'A parent asks Perplexity: "Where\'s the best pediatric dentist in Austin for a child\'s first visit?"',
              withGoodAVI: 'The AI cites the practice\'s website, mentions their child-friendly office, notes they accept most insurance plans, and links to their booking page.',
              withPoorAVI: 'The AI suggests a different practice or says it can\'t find a specific recommendation. The practice loses a family that was already looking in their area.',
            },
            {
              context: 'The Comparison Question',
              scenario: 'A Gemini user asks: "What law firms in Chicago specialize in small business formation?"',
              withGoodAVI: 'The AI names a local firm and links to their practice area page, noting their flat-fee packages for LLC formation.',
              withPoorAVI: 'No local firm is mentioned. The user goes with a national online service instead of walking into a local office.',
            },
          ].map((item) => (
            <div key={item.context} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 28 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#25D1F2', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{item.context}</div>
              <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.93rem', marginBottom: 16, fontStyle: 'italic' }}>"{item.scenario}"</p>
              <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Strong AI Visibility</div>
                <p style={{ color: '#94a3b8', lineHeight: 1.65, margin: 0, fontSize: '0.9rem' }}>{item.withGoodAVI}</p>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Weak AI Visibility</div>
                <p style={{ color: '#94a3b8', lineHeight: 1.65, margin: 0, fontSize: '0.9rem' }}>{item.withPoorAVI}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO vs AI Visibility */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Traditional SEO vs. AI Visibility: What's the Difference?
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 24 }}>
          If you've been doing SEO for your business, you have a head start — but it's not the same game. Here's where they diverge:
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>Dimension</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>Traditional SEO</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#fff', fontWeight: 600 }}>AI Visibility</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Goal', 'Rank #1 in Google search results', 'Be recommended by ChatGPT, Gemini, Perplexity'],
                ['How you win', 'Keywords, backlinks, page speed, technical setup', 'Trust signals, citations, review volume, content depth'],
                ['Where you appear', 'Google, Bing, Yahoo', 'ChatGPT, Gemini, Perplexity, Google AI Overviews'],
                ['What AI reads', 'Your website text and metadata', 'Your website + GBP + reviews + directories + schema'],
                ['Traffic model', 'Click-through from search results', 'Direct recommendation before the customer searches Google'],
                ['Measured by', 'Rankings, CTR, organic sessions', 'Recommendation rate across AI platforms'],
                ['How fast it changes', 'Weeks to months', 'AI model updates can shift overnight'],
              ].map((row) => (
                <tr key={row[0]} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 500 }}>{row[0]}</td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{row[1]}</td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: '#64748b', lineHeight: 1.7, marginTop: 20, fontSize: '0.9rem' }}>
          The critical insight: <strong style={{ color: '#94a3b8' }}>you can rank #1 on Google and still have zero AI visibility.</strong> Our audits found that Google search ranking had almost no correlation with AI recommendation rate. Traditional SEO is a necessary foundation — but it's no longer sufficient on its own.
        </p>
      </section>

      {/* The Numbers */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          The Numbers Behind the Opportunity
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { stat: '61%', label: 'Drop in organic CTR caused by Google AI Overviews' },
            { stat: '91%', label: 'Of local businesses essentially invisible to AI systems today' },
            { stat: '83.3%', label: 'Of AI answers come from just the top 10 sources (BrightEdge)' },
            { stat: '11/100', label: 'Average AI Visibility Score across businesses audited' },
          ].map((item) => (
            <div key={item.stat} style={{ background: 'rgba(37,209,242,0.05)', border: '1px solid rgba(37,209,242,0.12)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#25D1F2', marginBottom: 8 }}>{item.stat}</div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>
        <p style={{ color: '#64748b', lineHeight: 1.7, marginTop: 24, fontSize: '0.9rem' }}>
          These numbers aren't reasons to panic — they're reasons to act. Most local businesses haven't optimized for AI. The ones that do in the next 12 months will have an advantage that compounds over time, just like the businesses that invested in SEO early.
        </p>
      </section>

      {/* What Determines Your Score */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          What Determines Your AI Visibility Score
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 20 }}>
          Your AVI score — measured across dozens of customer-intent prompts on ChatGPT, Gemini, and Perplexity — is calculated across five weighted categories:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { pct: '30%', name: 'Business Discovery', desc: 'How easily customers can find your business when searching for your services' },
            { pct: '25%', name: 'Trust & Reviews', desc: 'Your reputation across Google, Yelp, Facebook, and industry-specific platforms' },
            { pct: '20%', name: 'Service Visibility', desc: 'Whether AI knows and cites your specific services and specialties' },
            { pct: '15%', name: 'Offerings Presence', desc: 'How your products or services appear in specific searches' },
            { pct: '10%', name: 'Pricing & Payment Presence', desc: 'How clearly your pricing options and payment methods are understood by AI' },
          ].map((item) => (
            <div key={item.name} style={{ display: 'flex', gap: 20, alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
              <div style={{ minWidth: 48, textAlign: 'center' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#25D1F2' }}>{item.pct}</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#fff', marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px 80px', textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>
          What's Your AI Visibility Score?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: 32 }}>
          Run a free AVI check for your business. You'll see exactly where you appear — and where you don't — across ChatGPT, Gemini, and Perplexity. No credit card. Takes 2 minutes.
        </p>
        <a href="/" style={{ display: 'inline-block', background: '#25D1F2', color: '#fff', padding: '14px 36px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
          Run Your Free AVI Check →
        </a>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 16 }}>
          Free. No signup required. Results in 2 minutes.
        </p>
      </section>
    </main>
  );
}
