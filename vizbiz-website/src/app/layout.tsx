import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VizBiz.ai - AI Visibility Intelligence for Car Dealerships",
  description: "Discover your dealership's AI Visibility Intelligence (AVI) Score. See how you rank in AI search vs competitors. Free 30-minute assessment for dealerships in Oakville, Mississauga, Burlington & Hamilton.",
  keywords: "AI visibility, car dealerships, AVI score, AI search optimization, ChatGPT, Google AI, automotive marketing",
  openGraph: {
    title: "VizBiz.ai - AI Visibility Intelligence for Car Dealerships",
    description: "Discover your dealership's AI Visibility Intelligence (AVI) Score. Free 30-minute assessment.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
