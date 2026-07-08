"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Shield,
  Wind,
  Sparkles,
  LineChart,
  Activity,
} from "lucide-react";
import { BackgroundRenderer } from "@/components/BackgroundSelector";
import TextType from "@/components/TextType";
import { useState, useEffect } from "react";
import MagneticButton from "@/components/MagneticButton";
import BorderGlowCard from "@/components/BorderGlowCard";
import { Footer } from "@/components/Footer";
import dynamic from "next/dynamic";

const HomeBelowFold = dynamic(() => import("./HomeBelowFold"), {
  loading: () => (
    <div className="py-24 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  ),
  ssr: false,
});

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export default function HomeClient() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (res.ok) {
          const data = await res.json();
          setPlans(data);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden -mt-20 pt-0 pb-32 lg:pb-40">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <BackgroundRenderer />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-b from-transparent via-card to-card -z-[5] pointer-events-none" />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
              <motion.div
                className="lg:w-1/2 text-center lg:text-right"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>نسل جدید سلامت روان</span>
                </motion.div>
                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.2] mb-6"
                >
                  گاهی فقط نیاز داری کسی
                  <br />
                  <span className="inline-block text-transparent bg-clip-text bg-primary min-w-[8ch]">
                    <TextType
                      text={[
                        "بدون قضاوت",
                        "با همدلی",
                        "با مهربانی",
                        "با صبر",
                        "با درک عمیق",
                        "با آرامش",
                      ]}
                      typingSpeed={100}
                      deletingSpeed={100}
                      pauseDuration={2500}
                      loop={true}
                      showCursor={true}
                      cursorCharacter="|"
                    />
                  </span>
                  <br />
                  به حرف‌هایت گوش بدهد
                </motion.h1>
                <motion.p
                  variants={fadeInUp}
                  className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                >
                  آراما دستیار هوشمند سلامت روان که همیشه در کنار توست. در هر
                  ساعت از شبانه‌روز، آماده شنیدن و همراهی است.
                </motion.p>
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                >
                  <MagneticButton>
                    <Button
                      size="lg"
                      className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 rounded-full"
                      asChild
                    >
                      <Link href="/dashboard">شروع رایگان</Link>
                    </Button>
                  </MagneticButton>
                  <MagneticButton>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto text-lg h-14 px-8 border-border rounded-full"
                      asChild
                    >
                      <Link href="/#features">مشاهده امکانات</Link>
                    </Button>
                  </MagneticButton>
                </motion.div>
              </motion.div>

              <motion.div
                className="lg:w-1/2 relative w-full max-w-lg mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative rounded-2xl border border-border/50 bg-card/50 transform-gpu backdrop-blur-xl shadow-2xl overflow-hidden z-10">
                  <div className="flex items-center gap-2 p-4 border-b border-border/50 bg-card">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <div className="flex-1 text-center text-sm font-medium text-muted-foreground mr-4">
                      arama.ai/chat
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                        شما
                      </div>
                      <div className="bg-primary/10 text-foreground p-3 rounded-2xl rounded-tl-sm text-sm max-w-[80%] text-right">
                        امروز خیلی استرس دارم. حس می‌کنم هیچ‌کاری خوب پیش نمیره.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        آ
                      </div>
                      <div className="bg-card border border-border p-3 rounded-2xl rounded-tr-sm text-sm max-w-[80%] text-right shadow-sm">
                        می‌فهمم که روز سختی رو می‌گذرونی. طبیعیه که گاهی این حس
                        رو داشته باشیم. می‌خوای اول چند تا نفس عمیق با هم بکشیم
                        تا یکم آروم بشی؟
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                روزهای سختی که همه می‌شناسیم
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                مسائلی که آراما می‌تواند در مواجهه با آن‌ها به شما کمک کند
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
            >
              {[
                {
                  icon: Wind,
                  title: "اضطراب",
                  desc: "نگرانی‌های مداوم و تپش قلب",
                },
                { icon: Activity, title: "استرس", desc: "فشار کاری و روزمره" },
                { icon: Heart, title: "تنهایی", desc: "نیاز به هم‌صحبتی امن" },
                {
                  icon: Shield,
                  title: "ترس از قضاوت",
                  desc: "فضایی کاملاً محرمانه",
                },
                {
                  icon: LineChart,
                  title: "هزینه مشاوره",
                  desc: "دسترسی با هزینه مناسب",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <BorderGlowCard
                    className="p-6 text-center"
                    colors={[
                      "hsl(195 42% 52%)",
                      "hsl(170 35% 55%)",
                      "hsl(215 22% 72%)",
                    ]}
                  >
                    <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </BorderGlowCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Below-fold content (dynamically loaded) */}
        <HomeBelowFold plans={plans} />
      </main>
      <Footer />
    </div>
  );
}
