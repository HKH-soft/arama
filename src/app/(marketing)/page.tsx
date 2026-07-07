"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Shield,
  Brain,
  Wind,
  Sparkles,
  LineChart,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BackgroundRenderer } from "@/components/BackgroundSelector";
import TextType from "@/components/TextType";
import { useState, useEffect } from "react";
import MagneticButton from "@/components/MagneticButton";
import MagicBento from "@/components/MagicBento";
import BorderGlowCard from "@/components/BorderGlowCard";

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

export default function Landing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

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
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const formatPrice = (price: number) => {
    if (price === 0) return "۰";
    return price.toLocaleString('fa-IR');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden -mt-20 pt-0 pb-32 lg:pb-40">
        {/* Dynamic Background — extends behind navbar */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <BackgroundRenderer />
        </div>
        {/* Smooth fade at bottom to blend with page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-b from-transparent via-card to-card -z-[5] pointer-events-none" />

        {/* Foreground Content Wrapper */}
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
                آراما دستیار هوشمند سلامت روان که همیشه در کنار توست. در هر ساعت
                از شبانه‌روز، آماده شنیدن و همراهی است.
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
                      می‌فهمم که روز سختی رو می‌گذرونی. طبیعیه که گاهی این حس رو
                      داشته باشیم. می‌خوای اول چند تا نفس عمیق با هم بکشیم تا
                      یکم آروم بشی؟
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

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              آراما چه می‌کند؟
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              امکانات پیشرفته هوش مصنوعی در خدمت آرامش شما
            </p>
          </motion.div>

          <MagicBento
            cards={[
              {
                title: "تحلیل احساسات متن",
                description:
                  "تشخیص دقیق احساسات پنهان در پیام‌های شما با استفاده از هوش مصنوعی",
                label: "هوش مصنوعی",
                icon: <MessageCircle className="w-5 h-5" />,
              },
              {
                title: "تحلیل احساسات صوت",
                description:
                  "درک لحن و احساس صدا برای ارتباطی عمیق‌تر و انسانی‌تر",
                label: "صوتی",
                icon: <Activity className="w-5 h-5" />,
              },
              {
                title: "گفتگوی همدلانه",
                description:
                  "پاسخ‌های طراحی شده بر اساس اصول روانشناسی برای حمایت عاطفی",
                label: "همدلی",
                icon: <Heart className="w-5 h-5" />,
              },
              {
                title: "مدیتیشن و آرام‌سازی",
                description:
                  "ارائه تمرین‌های تنفسی و مدیتیشن متناسب با وضعیت فعلی شما",
                label: "آرامش",
                icon: <Wind className="w-5 h-5" />,
              },
              {
                title: "محتوای شخصی‌سازی شده",
                description:
                  "پادکست‌ها و مقالات پیشنهادی بر اساس نیازهای روانی شما",
                label: "شخصی‌سازی",
                icon: <Brain className="w-5 h-5" />,
              },
              {
                title: "گزارش پیشرفت روانی",
                description: "نمودارها و تحلیل‌های دوره‌ای از تغییرات خلقی شما",
                label: "تحلیل",
                icon: <LineChart className="w-5 h-5" />,
              },
            ]}
            glowColor="95, 165, 145"
          />
        </div>
      </section>

      {/* How It Works — Full-Screen Scroll Stack */}
      <section className="relative">
        {/* Section header */}
        <div className="bg-muted/30 py-16 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              چطور کار می‌کند؟
            </h2>
            <p className="text-muted-foreground text-lg">ساده، سریع و موثر</p>
          </motion.div>
        </div>

        {/* Stack container */}
        <div className="relative">
          {[
            {
              step: 1,
              title: "احساست را بنویس",
              desc: "هر چه در دل داری بنویس. آراما با صبر و بدون قضاوت گوش می‌دهد. هیچ محدودیتی نیست.",
              icon: MessageCircle,
              bg: "from-primary/10 to-secondary/5",
              accent: "bg-primary/10",
            },
            {
              step: 2,
              title: "آراما تحلیل می‌کند",
              desc: "هوش مصنوعی احساسات پنهان و نیازهای واقعی تو را شناسایی می‌کند و الگوهای رفتاری را درک می‌کند.",
              icon: Brain,
              bg: "from-accent/10 to-primary/5",
              accent: "bg-accent/10",
            },
            {
              step: 3,
              title: "پاسخ همدلانه دریافت کن",
              desc: "پاسخ‌هایی بر اساس اصول روانشناسی، شخصی‌سازی شده برای تو. هر پاسخ مخصوص توست.",
              icon: Heart,
              bg: "from-secondary/10 to-accent/5",
              accent: "bg-secondary/10",
            },
            {
              step: 4,
              title: "تمرین مناسب دریافت کن",
              desc: "مدیتیشن، تنفس عمیق یا محتوای پیشنهادی متناسب با حالت فعلی‌ات. همه چیز در لحظه آماده است.",
              icon: Wind,
              bg: "from-primary/10 to-accent/5",
              accent: "bg-primary/10",
            },
            {
              step: 5,
              title: "پیشرفتت را مشاهده کن",
              desc: "نمودارها و تحلیل‌های دوره‌ای برای دیدن مسیر رشد و آرامش. قدم به قدم به جلو.",
              icon: LineChart,
              bg: "from-accent/10 to-secondary/5",
              accent: "bg-accent/10",
            },
          ].map((item, i) => {
            const textRight = i % 2 === 0;
            return (
              <div
                key={i}
                className="sticky top-20 h-[calc(100vh-5rem)] overflow-hidden"
                style={{ zIndex: i + 1 }}
              >
                <div
                  className={`w-full h-full bg-linear-to-br ${item.bg} bg-card`}
                >
                  <div className="w-full h-full flex flex-col md:flex-row items-center">
                    {/* Text half */}
                    <div
                      className={`w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12 md:py-0 ${textRight ? "md:order-2" : "md:order-1"
                        }`}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: textRight ? 40 : -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                      >
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-5 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                          {item.desc}
                        </p>
                      </motion.div>
                    </div>

                    {/* Graphic half */}
                    <div
                      className={`w-full md:w-1/2 flex items-center justify-center py-8 md:py-0 ${textRight ? "md:order-1" : "md:order-2"
                        }`}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96"
                      >
                        {/* Decorative rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-[spin_20s_linear_infinite]" />
                        <div className="absolute inset-4 rounded-full border border-secondary/15 animate-[spin_15s_linear_infinite_reverse]" />
                        <div className="absolute inset-10 rounded-full border border-primary/10 animate-[spin_25s_linear_infinite]" />

                        {/* Glow blobs */}
                        <div
                          className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${item.accent} blur-2xl`}
                        />
                        <div
                          className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-full ${item.accent} blur-xl`}
                        />

                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-3xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
                            <item.icon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary-foreground" />
                          </div>
                        </div>

                        {/* Floating dots */}
                        {[...Array(6)].map((_, d) => {
                          const angle = (d / 6) * Math.PI * 2;
                          const radius = 45;
                          return (
                            <div
                              key={d}
                              className="absolute w-2 h-2 rounded-full bg-primary/40"
                              style={{
                                top: `${(50 + radius * Math.sin(angle)).toFixed(4)}%`,
                                left: `${(50 + radius * Math.cos(angle)).toFixed(4)}%`,
                                animationDelay: `${(d * 0.3).toFixed(1)}s`,
                              }}
                            />
                          );
                        })}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              چرا آراما؟
            </h2>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 font-medium text-muted-foreground w-1/4">
                    ویژگی‌ها
                  </th>
                  <th className="p-4 text-center text-foreground font-bold w-1/4">
                    مشاوره سنتی
                  </th>
                  <th className="p-4 text-center text-foreground font-bold w-1/4">
                    چت‌بات‌های معمولی
                  </th>
                  <th className="p-4 text-center font-bold text-primary w-1/4 bg-primary/5 rounded-t-xl">
                    آراما
                  </th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  { label: "دسترسی ۲۴/۷", trad: false, bot: true, arama: true },
                  {
                    label: "بدون قضاوت",
                    trad: "متغیر",
                    bot: true,
                    arama: true,
                  },
                  { label: "درک احساسات", trad: true, bot: false, arama: true },
                  { label: "محتوای شخصی", trad: true, bot: false, arama: true },
                  { label: "زبان فارسی", trad: true, bot: false, arama: true },
                  {
                    label: "هزینه",
                    trad: "بالا",
                    bot: "پایین",
                    arama: "بسیار مناسب",
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-4 font-medium">{row.label}</td>
                    <td className="p-4 text-center text-muted-foreground">
                      {typeof row.trad === "boolean" ? (
                        row.trad ? (
                          <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 mx-auto text-muted-foreground/50" />
                        )
                      ) : (
                        row.trad
                      )}
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {typeof row.bot === "boolean" ? (
                        row.bot ? (
                          <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 mx-auto text-muted-foreground/50" />
                        )
                      ) : (
                        row.bot
                      )}
                    </td>
                    <td className="p-4 text-center font-medium bg-primary/5 first:rounded-b-xl">
                      {typeof row.arama === "boolean" ? (
                        row.arama ? (
                          <CheckCircle2 className="w-5 h-5 mx-auto text-primary" />
                        ) : (
                          <XCircle className="w-5 h-5 mx-auto text-muted-foreground/50" />
                        )
                      ) : (
                        <span className="text-primary">{row.arama}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              انتخاب پلن مناسب
            </h2>
            <p className="text-muted-foreground text-lg">
              سرمایه‌گذاری روی سلامت روان شما
            </p>
          </motion.div>

          <div className={`grid grid-cols-1 gap-8 ${plans.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            {loadingPlans ? (
              <div className="md:col-span-3 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : plans.length > 0 ? (
              plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`relative bg-card border rounded-3xl p-8 shadow-sm flex h-full flex-col ${index === 1 ? "border-2 border-primary transform md:-translate-y-4 shadow-lg" : "border-border"
                    }`}
                >
                  {index === 1 && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                      محبوب‌ترین
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.displayName}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {plan.description}
                  </p>
                  <div className="mb-8">
                    <span className="text-4xl font-black text-foreground">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-muted-foreground mr-1">
                      {plan.price === 0 ? "تومان" : `تومان / ${plan.durationDays === 30 ? "ماه" : plan.durationDays === 365 ? "سال" : ""}`}
                    </span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {(plan.features || []).map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-auto ${index === 1 ? "bg-primary hover:bg-primary/90" : ""}`}
                    variant={index === 1 ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/dashboard">
                      {plan.price === 0 ? "شروع رایگان" : "خرید اشتراک"}
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="md:col-span-3 text-center text-muted-foreground">
                پلنی یافت نشد
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground">
              سوالات متداول
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              {
                q: "آیا اطلاعاتم محرمانه است؟",
                a: "بله، تمام گفتگوهای شما با آراما کاملاً رمزنگاری شده است و هیچ انسانی به آنها دسترسی ندارد.",
              },
              {
                q: "آیا آراما جایگزین روانپزشک می‌شود؟",
                a: "خیر، آراما یک دستیار حمایت عاطفی است و در موارد بالینی جدی، جایگزین درمان دارویی یا تراپی حرفه‌ای نمی‌شود.",
              },
              {
                q: "آیا برای بحران‌های جدی مناسب است؟",
                a: "در صورت وجود افکار آسیب به خود، آراما شما را فوراً به خطوط بحران و اورژانس اجتماعی متصل می‌کند.",
              },
              {
                q: "چطور می‌توانم اشتراک بگیرم؟",
                a: "پس از ثبت‌نام، از طریق بخش ارتقا حساب کاربری در داشبورد می‌توانید با کارت‌های بانکی عضو شتاب پرداخت کنید.",
              },
            ].map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-6"
              >
                <AccordionTrigger className="text-right py-4 font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-card to-card -z-10" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
              تو قرار نیست همه چیز را به تنهایی تحمل کنی
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              آراما همین الان آماده شنیدن حرف‌های توست.
            </p>
            <MagneticButton>
              <Button
                size="lg"
                className="h-16 px-10 text-lg bg-primary hover:bg-primary/90 rounded-full"
                asChild
              >
                <Link href="/dashboard">شروع گفتگو با آراما</Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </div>
      </section>
    </>
  );
}