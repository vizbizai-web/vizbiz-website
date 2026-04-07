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
  title: "VizBiz.ai | AI Visibility Intelligence for Car Dealerships",
  description:
    "VizBiz helps car dealerships understand how they appear in AI-driven search, compare local visibility, and improve the signals that influence ChatGPT, Google AI Overviews, Gemini, and Perplexity.",
  keywords:
    "AI visibility for car dealerships, dealership AI search visibility, ChatGPT visibility, Google AI Overviews, Gemini, Perplexity, dealership marketing, automotive retail AI",
  openGraph: {
    title: "VizBiz.ai | AI Visibility Intelligence for Car Dealerships",
    description:
      "Understand how your dealership shows up in AI-driven search, compare local visibility, and improve the signals that shape AI recommendations.",
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
