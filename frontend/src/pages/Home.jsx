import Navbar from "../components/homePage/Navbar";
import Hero from "../components/homePage/Hero";
import Features from "../components/homePage/Features";
import HowItWorks from "../components/homePage/HowItWorks";
import AISection from "../components/homePage/AISection";
import JobAnalyzer from "../components/homePage/JobAnalyzer";
import Testimonials from "../components/homePage/Testimonials";
import CTA from "../components/homePage/CTA";
import Footer from "../components/homePage/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <AISection />
        <JobAnalyzer />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
