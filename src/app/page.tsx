import { BlogPreview } from "@/components/blog-preview";
import { Cta } from "@/components/cta";
import { Features } from "@/components/features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Navbar } from "@/components/Navbar";
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <BlogPreview />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
