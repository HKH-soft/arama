"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Heart, Shield, Brain, Wind, Sparkles, LineChart, 
  MessageCircle, Star, CheckCircle2, XCircle,
  Activity
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Landing() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
        
        {/* Floating orbs */}
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-[10%] w-80 h-80 bg-secondary/20 rounded-full blur-3xl -z-10"
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <motion.div 
              className="lg:w-1/2 text-center lg:text-right"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>نسل جدید سلامت روان</span>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.2] mb-6">
                گاهی فقط نیاز داری کسی <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">بدون قضاوت</span> به حرف‌هایت گوش بدهد
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                آراما دستیار هوشمند سلامت روان که همیشه در کنار توست. در هر ساعت از شبانه‌روز، آماده شنیدن و همراهی است.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90" asChild>
                  <Link href="/dashboard">شروع رایگان</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-border" asChild>
                  <Link href="/#features">مشاهده امکانات</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="lg:w-1/2 relative w-full max-w-lg mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden z-10">
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
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">شما</div>
                    <div className="bg-primary/10 text-foreground p-3 rounded-2xl rounded-tl-sm text-sm max-w-[80%] text-right">
                      امروز خیلی استرس دارم. حس می‌کنم هیچ‌کاری خوب پیش نمیره.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">آ</div>
                    <div className="bg-card border border-border p-3 rounded-2xl rounded-tr-sm text-sm max-w-[80%] text-right shadow-sm">
                      می‌فهمم که روز سختی رو می‌گذرونی. طبیعیه که گاهی این حس رو داشته باشیم. 
                      می‌خوای اول چند تا نفس عمیق با هم بکشیم تا یکم آروم بشی؟
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
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">روزهای سختی که همه می‌شناسیم</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              مسائلی که آراما می‌تواند در مواجهه با آن‌ها به شما کمک کند
            </p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
          >
            {[
              { icon: Wind, title: "اضطراب", desc: "نگرانی‌های مداوم و تپش قلب" },
              { icon: Activity, title: "استرس", desc: "فشار کاری و روزمره" },
              { icon: Heart, title: "تنهایی", desc: "نیاز به هم‌صحبتی امن" },
              { icon: Shield, title: "ترس از قضاوت", desc: "فضایی کاملاً محرمانه" },
              { icon: LineChart, title: "هزینه مشاوره", desc: "دسترسی با هزینه مناسب" }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">آراما چه می‌کند؟</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              امکانات پیشرفته هوش مصنوعی در خدمت آرامش شما
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "تحلیل احساسات متن", desc: "تشخیص دقیق احساسات پنهان در پیام‌های شما با استفاده از هوش مصنوعی", icon: MessageCircle },
              { title: "تحلیل احساسات صوت", desc: "درک لحن و احساس صدا برای ارتباطی عمیق‌تر و انسانی‌تر", icon: Activity },
              { title: "گفتگوی همدلانه", desc: "پاسخ‌های طراحی شده بر اساس اصول روانشناسی برای حمایت عاطفی", icon: Heart },
              { title: "مدیتیشن و آرام‌سازی", desc: "ارائه تمرین‌های تنفسی و مدیتیشن متناسب با وضعیت فعلی شما", icon: Wind },
              { title: "محتوای شخصی‌سازی شده", desc: "پادکست‌ها و مقالات پیشنهادی بر اساس نیازهای روانی شما", icon: Brain },
              { title: "گزارش پیشرفت روانی", desc: "نمودارها و تحلیل‌های دوره‌ای از تغییرات خلقی شما", icon: LineChart }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative bg-card p-8 rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">چطور کار می‌کند؟</h2>
            <p className="text-muted-foreground text-lg">ساده، سریع و موثر</p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-1/2 right-0 left-0 h-1 bg-border -translate-y-1/2 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {[
                "احساست را بنویس",
                "آراما تحلیل می‌کند",
                "پاسخ همدلانه دریافت کن",
                "تمرین مناسب دریافت کن",
                "پیشرفتت را مشاهده کن"
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-card border-2 border-primary text-primary font-bold text-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                    {i + 1}
                  </div>
                  <h3 className="font-medium text-foreground">{step}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">چرا آراما؟</h2>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 font-medium text-muted-foreground w-1/4">ویژگی‌ها</th>
                  <th className="p-4 text-center text-foreground font-bold w-1/4">مشاوره سنتی</th>
                  <th className="p-4 text-center text-foreground font-bold w-1/4">چت‌بات‌های معمولی</th>
                  <th className="p-4 text-center font-bold text-primary w-1/4 bg-primary/5 rounded-t-xl">آراما</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  { label: "دسترسی ۲۴/۷", trad: false, bot: true, arama: true },
                  { label: "بدون قضاوت", trad: "متغیر", bot: true, arama: true },
                  { label: "درک احساسات", trad: true, bot: false, arama: true },
                  { label: "محتوای شخصی", trad: true, bot: false, arama: true },
                  { label: "زبان فارسی", trad: true, bot: false, arama: true },
                  { label: "هزینه", trad: "بالا", bot: "پایین", arama: "بسیار مناسب" }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-4 font-medium">{row.label}</td>
                    <td className="p-4 text-center text-muted-foreground">
                      {typeof row.trad === 'boolean' 
                        ? row.trad ? <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" /> : <XCircle className="w-5 h-5 mx-auto text-muted-foreground/50" />
                        : row.trad}
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {typeof row.bot === 'boolean' 
                        ? row.bot ? <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" /> : <XCircle className="w-5 h-5 mx-auto text-muted-foreground/50" />
                        : row.bot}
                    </td>
                    <td className="p-4 text-center font-medium bg-primary/5 first:rounded-b-xl">
                      {typeof row.arama === 'boolean' 
                        ? row.arama ? <CheckCircle2 className="w-5 h-5 mx-auto text-primary" /> : <XCircle className="w-5 h-5 mx-auto text-muted-foreground/50" />
                        : <span className="text-primary">{row.arama}</span>}
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
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">انتخاب پلن مناسب</h2>
            <p className="text-muted-foreground text-lg">سرمایه‌گذاری روی سلامت روان شما</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-foreground mb-2">رایگان</h3>
              <p className="text-muted-foreground mb-6">برای آشنایی با آراما</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-foreground">۰</span>
                <span className="text-muted-foreground mr-1">تومان</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> گفتگوی محدود روزانه</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> تحلیل پایه احساسات</li>
                <li className="flex items-center gap-3 text-muted-foreground"><XCircle className="w-5 h-5 opacity-50" /> تحلیل صوتی</li>
              </ul>
              <Button variant="outline" className="w-full" asChild><Link href="/dashboard">شروع رایگان</Link></Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-card border-2 border-primary rounded-3xl p-8 shadow-lg relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                محبوب‌ترین
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">پریمیوم</h3>
              <p className="text-muted-foreground mb-6">دسترسی کامل به تمام امکانات</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-foreground">۱۴۹,۰۰۰</span>
                <span className="text-muted-foreground mr-1">تومان / ماه</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> گفتگوی نامحدود</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> تحلیل پیشرفته احساسات</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> ارتباط صوتی</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> گزارش‌های ماهانه</li>
              </ul>
              <Button className="w-full bg-primary hover:bg-primary/90" asChild><Link href="/dashboard">خرید اشتراک</Link></Button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-foreground mb-2">سازمانی</h3>
              <p className="text-muted-foreground mb-6">برای تیم‌ها و شرکت‌ها</p>
              <div className="mb-8">
                <span className="text-3xl font-bold text-foreground">تماس بگیرید</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> مدیریت کاربران</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> گزارش‌های تیمی</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> پشتیبانی اختصاصی</li>
              </ul>
              <Button variant="outline" className="w-full" asChild><Link href="/contact">تماس با ما</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground">سوالات متداول</h2>
          </motion.div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { q: "آیا اطلاعاتم محرمانه است؟", a: "بله، تمام گفتگوهای شما با آراما کاملاً رمزنگاری شده است و هیچ انسانی به آنها دسترسی ندارد." },
              { q: "آیا آراما جایگزین روانپزشک می‌شود؟", a: "خیر، آراما یک دستیار حمایت عاطفی است و در موارد بالینی جدی، جایگزین درمان دارویی یا تراپی حرفه‌ای نمی‌شود." },
              { q: "آیا برای بحران‌های جدی مناسب است؟", a: "در صورت وجود افکار آسیب به خود، آراما شما را فوراً به خطوط بحران و اورژانس اجتماعی متصل می‌کند." },
              { q: "چطور می‌توانم اشتراک بگیرم؟", a: "پس از ثبت‌نام، از طریق بخش ارتقا حساب کاربری در داشبورد می‌توانید با کارت‌های بانکی عضو شتاب پرداخت کنید." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-right py-4 font-semibold text-foreground hover:no-underline">{faq.q}</AccordionTrigger>
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-background -z-10" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">تو قرار نیست همه چیز را به تنهایی تحمل کنی</h2>
            <p className="text-xl text-muted-foreground mb-10">
              آراما همین الان آماده شنیدن حرف‌های توست.
            </p>
            <Button size="lg" className="h-16 px-10 text-lg bg-primary hover:bg-primary/90" asChild>
              <Link href="/dashboard">شروع گفتگو با آراما</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
