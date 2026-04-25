export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'What Is AI Visibility for Car Dealerships? (The Complete Guide)',
  description: 'AI visibility is the new SEO — but most dealership owners have never heard of it. This guide explains what it is, why it matters right now, and how to check your score for free.',
  openGraph: {
    title: 'What Is AI Visibility for Car Dealerships? (The Complete Guide)',
    description: 'AI visibility is the new SEO — but most dealership owners have never heard of it. Learn what it is, why it matters, and how to check your score for free.',
  },
};

export default function WhatIsAIVisibilityDealerships() {
  return (
    <main style={{ backgroundColor: '#07090f', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 20, color: '#fff' }}>
          What Is AI Visibility for Car Dealerships?
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: 660, margin: '0 auto' }}>
          SEO made your dealership visible on Google for 20 years. AI visibility is what's going to make you visible — or invisible — to the next generation of car buyers. Most dealers haven't heard of it. That's the opportunity.
        </p>
      </section>

      {/* What Is AI Visibility */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          The Short Version
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
          AI visibility (sometimes called <strong style={{ color: '#fff' }}>AI discoverability</strong> or <strong style={{ color: '#fff' }}>generative engine optimization</strong>) is how often and how prominently an AI system — ChatGPT, Google AI Overviews, Gemini, Perplexity — recommends your dealership when a buyer asks for help finding a car, a service, or a trade-in.
        </p>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
          Think of it like this: when Google Maps recommends a coffee shop, that coffee shop gets foot traffic. When ChatGPT recommends a dealership to someone looking to buy a car, that dealership gets a lead — without that buyer ever clicking a website.
        </p>
        <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 20, padding: 28, marginTop: 24 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, margin: 0 }}>
            <strong style={{ color: '#fff' }}>In plain English:</strong> AI visibility is whether AI systems know your dealership exists, trust that you exist, and recommend you to the right buyers. That's it. That's the whole game.
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
              body: 'ChatGPT has 200+ million weekly users. Google AI Overviews now appear for the majority of search queries. Gemini is embedded in Android phones. Perplexity is used by millions for research-mode searches. Buyers aren\'t just Googling anymore — they\'re asking AI.',
            },
            {
              title: 'Traditional SEO is losing ground',
              body: 'Google AI Overviews have caused a documented 61% drop in click-through rates for organic search results. Buyers read the AI summary and never click through to a website. The old playbook — rank #1 on Google — is worth less than it was two years ago.',
            },
            {
              title: 'AI recommendations are largely invisible to most dealers',
              body: 'BrightEdge found that 83.3% of AI-generated answers come from just the top 10 sources. Most dealerships aren\'t in any of those sources. And 91% of local businesses are essentially invisible to AI systems right now. That\'s not a small problem — it\'s a massive opportunity for the dealers who move first.',
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
          How AI Decides Which Dealership to Recommend
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
            { signal: 'Reviews across multiple platforms', detail: 'Google, DealerRater, Cars.com, Edmunds, Yelp — volume, recency, and sentiment' },
            { signal: 'Website content and structure', detail: 'Make/model pages, FAQs, service descriptions, blog content' },
            { signal: 'Third-party directory presence', detail: 'Consistent NAP (name, address, phone) across Cars.com, Kelley Blue Book, and others' },
            { signal: 'Structured data / schema markup', detail: 'AI reads schema to understand your business type, services, and inventory' },
            { signal: 'Citations from authoritative sources', detail: 'Local news mentions, industry directories, Wikipedia-style references' },
          ].map((item) => (
            <div key={item.signal} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 8, flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{item.signal}</strong>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}> — {item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dealership Examples */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          What This Looks Like in Practice
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 24 }}>
          Here are three real scenarios where AI visibility — or lack of it — directly affects a dealership:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            {
              context: 'The Inventory Search',
              scenario: 'A buyer asks ChatGPT: "What dealerships near Toronto have the best selection of used Honda CR-Vs under $30,000?"',
              withGoodAVI: 'The AI confidently recommends a specific dealership — with address, hours, and a note about their trade-in program — because it found well-structured inventory pages, strong reviews, and consistent citations across multiple platforms.',
              withPoorAVI: 'The AI either recommends a different dealership entirely, or says "I don\'t have enough information about dealerships in that area." The buyer moves on to the dealer that showed up.',
            },
            {
              context: 'The Service Department',
              scenario: 'A buyer asks Perplexity: "Where\'s the best place to get a 2021 Mazda CX-5 transmission serviced in Mississauga?"',
              withGoodAVI: 'The AI cites the dealership\'s service page, mentions their certified technicians, notes they use OEM parts, and links to their booking tool.',
              withPoorAVI: 'The AI suggests an independent mechanic or says it can\'t find a specific recommendation. The service department loses a customer who was already in their area.',
            },
            {
              context: 'The Trade-In Question',
              scenario: 'A Gemini user asks: "What\'s my 2018 Honda Civic worth at a dealership in Oakville?"',
              withGoodAVI: 'The AI names a local dealership and links to their trade-in valuation tool, with a caveat that they offer competitive valuations.',
              withPoorAVI: 'No dealership is mentioned. The buyer uses a standalone valuation site and shows up to your lot already anchored to a number — instead of walking in through the service lane first.',
            },
          ].map((item) => (
            <div key={item.context} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 28 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{item.context}</div>
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
          If you've been doing SEO for your dealership, you have a head start — but it's not the same game. Here's where they diverge:
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
                ['Traffic model', 'Click-through from search results', 'Direct recommendation before the buyer searches Google'],
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
          The critical insight: <strong style={{ color: '#94a3b8' }}>you can rank #1 on Google and still have zero AI visibility.</strong> Our audit of 50 Ontario dealerships found that Google search ranking had almost no correlation with AI recommendation rate. Traditional SEO is a necessary foundation — but it's no longer sufficient on its own.
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
            { stat: '11/100', label: 'Average AI Visibility Score of 50 Ontario dealerships audited' },
          ].map((item) => (
            <div key={item.stat} style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginBottom: 8 }}>{item.stat}</div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>
        <p style={{ color: '#64748b', lineHeight: 1.7, marginTop: 24, fontSize: '0.9rem' }}>
          These numbers aren't reasons to panic — they're reasons to act. Most dealerships haven't optimized for AI. The ones that do in the next 12 months will have an advantage that compounds over time, just like the dealers who invested in SEO in 2005.
        </p>
      </section>

      {/* What Determines Your Score */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          What Determines Your AI Visibility Score
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 20 }}>
          Your AVI score — measured across 84 buyer-intent prompts on ChatGPT, Gemini, and Perplexity — is calculated across five weighted categories:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { pct: '30%', name: 'Dealer Discovery', desc: 'How easily buyers can find your dealership when searching for a car' },
            { pct: '25%', name: 'Trust & Reviews', desc: 'Your reputation across Google, DealerRater, Cars.com, and Edmunds' },
            { pct: '20%', name: 'Service Visibility', desc: 'Whether AI knows and cites your service and parts department' },
            { pct: '15%', name: 'Inventory Presence', desc: 'How your vehicles appear in make/model specific searches' },
            { pct: '10%', name: 'Finance Presence', desc: 'How clearly your financing options and programs are understood by AI' },
          ].map((item) => (
            <div key={item.name} style={{ display: 'flex', gap: 20, alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
              <div style={{ minWidth: 48, textAlign: 'center' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3b82f6' }}>{item.pct}</span>
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
          Run a free AVI check for your dealership. You'll see exactly where you appear — and where you don't — across ChatGPT, Gemini, and Perplexity. No credit card. Takes 2 minutes.
        </p>
        <a href="/" style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', padding: '14px 36px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
          Run Your Free AVI Check →
        </a>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 16 }}>
          Free. No signup required. Results in 2 minutes.
        </p>
      </section>
    </main>
  );
}
