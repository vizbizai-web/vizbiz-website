import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SchemaMarkup from "@/components/SchemaMarkup";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  verification: {
    google: "UsciMz9QyGJczouaUP3mPrVVWUlGnTLQkU9EOQiMDF8",
  },
  title: "VizBiz — AI Visibility Intelligence for Car Dealerships",
  description:
    "VizBiz helps car dealerships measure and improve how often they appear in AI-powered search results like ChatGPT, Google AI Overviews, and Gemini. Get your free AI visibility audit.",
  keywords:
    "AI visibility for car dealerships, dealership AI search visibility, ChatGPT visibility, Google AI Overviews, Gemini, Perplexity, dealership marketing, automotive retail AI",
  alternates: {
    canonical: "https://vizbiz.ai",
  },
  openGraph: {
    title: "VizBiz — AI Visibility Intelligence for Car Dealerships",
    description:
      "VizBiz helps car dealerships measure and improve how often they appear in AI-powered search results like ChatGPT, Google AI Overviews, and Gemini. Get your free AI visibility audit.",
    type: "website",
    url: "https://vizbiz.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <SchemaMarkup />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
