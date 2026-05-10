import type { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'VizBiz — AI Visibility for Car Dealerships & Local Business',
  description:
    'VizBiz helps dealerships measure AI visibility across ChatGPT, Google AI Overviews, Perplexity. Get your free AI visibility audit and score.',
  alternates: {
    canonical: "https://vizbiz.ai",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
