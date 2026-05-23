import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import MiniReportJourney from "@/components/sections/MiniReportJourney";
import WhyAiRecommendsCompetitors from "@/components/sections/WhyAiRecommendsCompetitors";
import LocalAiLandGrab from "@/components/sections/LocalAiLandGrab";
import AiVisibilityTeam from "@/components/sections/AiVisibilityTeam";
import OfferStack from "@/components/sections/OfferStack";
import Pricing from "@/components/sections/Pricing";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <WhyAiRecommendsCompetitors />
      <LocalAiLandGrab />
      <AiVisibilityTeam />
      <MiniReportJourney />
      <OfferStack />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
