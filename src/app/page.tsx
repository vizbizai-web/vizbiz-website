import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import WhatYouGet from "@/components/sections/WhatYouGet";
import HowItWorks from "@/components/sections/HowItWorks";
import Pricing from "@/components/sections/Pricing";
import SocialProof from "@/components/sections/SocialProof";
import WhyUs from "@/components/sections/WhyUs";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <WhatYouGet />
      <HowItWorks />
      <Pricing />
      <SocialProof />
      <WhyUs />
      <FAQ />
      <Contact />
      <FinalCTA />
      <Footer />
    </main>
  );
}
