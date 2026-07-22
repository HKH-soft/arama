import type { Metadata } from "next";
import { BlogPreview } from "@/components/blog-preview";

export const metadata: Metadata = {
  title: "آراما — همراه هوشمند سلامت روان و تراپی آنلاین",
  description: "آراما با هوش مصنوعی همدلانه، مدیتیشن هدایت‌شده و تمرین‌های تنفس به شما کمک می‌کند اضطراب را مدیریت کنید و به آرامش برسید.",
  alternates: {
    canonical: "https://arama.app",
  },
};
import { Cta } from "@/components/cta";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Navbar } from "@/components/navbar";
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
