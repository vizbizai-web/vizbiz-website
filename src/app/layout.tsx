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
  title: "VizBiz.ai - AI Visibility Snapshot for Car Dealerships",
  description:
    "Check how your dealership appears in AI-driven search, see where nearby competitors may be beating you, and book a 15-minute review call.",
  keywords:
    "AI visibility snapshot, car dealerships, AI-driven search, dealership marketing, ChatGPT, Gemini, Perplexity, competitor visibility",
  openGraph: {
    title: "VizBiz.ai - AI Visibility Snapshot for Car Dealerships",
    description:
      "Check your AI visibility, submit your dealership details, and move straight into a 15-minute review call.",
    type: "website",
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
