import type { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'VizBiz — AI Visibility Intelligence for Car Dealerships',
  description:
    'VizBiz helps car dealerships measure and improve how often they appear in AI-powered search results like ChatGPT, Google AI Overviews, and Gemini. Get your free AI visibility audit.',
  alternates: {
    canonical: "https://vizbiz.ai",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
