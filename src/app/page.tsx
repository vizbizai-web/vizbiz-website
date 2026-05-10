import type { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'VizBiz — AI Visibility Intelligence for Local Businesses',
  description:
    'VizBiz helps local businesses measure and improve how often they appear in AI-powered search results like ChatGPT, Google AI Overviews, Gemini, and Perplexity. Get your free AI visibility mini report.',
  alternates: {
    canonical: "https://vizbiz.ai",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
