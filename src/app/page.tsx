import type { Metadata } from "next";
import { BlogPreview } from "@/components/blog-preview";

export const metadata: Metadata = {
  title: "آراما — همراه هوشمند سلامت روان و تراپی آنلاین فارسی",
  description:
    "آراما (Arama) پلتفرم هوشمند سلامت روان و تراپی آنلاین در ایران است؛ گفتگوی ۲۴ ساعته با هوش مصنوعی، مدیتیشن‌های آرامش‌بخش، تمرین‌های تنفس و کنترل اضطراب در فضایی امن و بدون قضاوت.",
  alternates: {
    canonical: "https://arama.life",
  },
  keywords: [
    "آراما",
    "تراپی آنلاین",
    "تراپی آنلاین هوش مصنوعی",
    "سلامت روان",
    "مشاوره روانشناسی آنلاین",
    "مدیتیشن صوتی",
    "کاهش اضطراب و استرس",
    "aramaho",
    "arama.life",
  ],
};
import { Cta } from "@/components/cta";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { QuickCalmWidget } from "@/components/quick-calm-widget";
import { HowItWorks } from "@/components/how-it-works";
import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { Testimonials } from "@/components/testimonials";
import { StickyMobileCta } from "@/components/sticky-mobile-cta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <QuickCalmWidget />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <BlogPreview />
        <Cta />
      </main>
      <StickyMobileCta />
      <Footer />
    </>
  );
}
