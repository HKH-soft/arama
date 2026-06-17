"use client";

import { motion } from "framer-motion";
import { Heart, Shield, Users, Globe } from "lucide-react";

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background -z-10" />
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-6"
          >
            ما آراما هستیم
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            تیمی از متخصصان سلامت روان و مهندسان هوش مصنوعی که با یک هدف مشترک گرد هم آمده‌ایم: 
            ایجاد فضایی امن برای گفتگو در سخت‌ترین روزها.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">داستان آراما</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground space-y-6 text-justify">
            <p>
              ایده آراما در یک شب سرد زمستانی متولد شد. زمانی که یکی از بنیان‌گذاران ما در جستجوی گوش شنوایی بود، 
              اما به دلیل هزینه بالای مشاوره و ترس از قضاوت شدن، ترجیح داد احساساتش را در خود بریزد. 
              این تجربه تلخ، جرقه‌ای شد برای خلق فضایی که همیشه، همه‌جا و برای همه در دسترس باشد.
            </p>
            <p>
              ما معتقدیم سلامت روان یک کالای لوکس نیست، بلکه حقی اولیه برای هر انسان است. 
              با ترکیب دانش روز روانشناسی و قدرت هوش مصنوعی مدرن، پلتفرمی ساخته‌ایم که 
              نه تنها کلمات، بلکه احساسات پنهان پشت آن‌ها را می‌فهمد.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">ارزش‌های ما</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "حریم خصوصی مطلق", desc: "اطلاعات شما فقط متعلق به شماست." },
              { icon: Heart, title: "همدلی بی‌قید و شرط", desc: "پذیرش بدون قضاوت در هر شرایطی." },
              { icon: Users, title: "دسترس‌پذیری", desc: "سلامت روان برای همه اقشار جامعه." },
              { icon: Globe, title: "نوآوری مستمر", desc: "استفاده از به‌روزترین تکنولوژی‌ها." }
            ].map((value, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl border border-border text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">تیم ما</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "دکتر نیلوفر رضایی", role: "مدیرعامل و هم‌بنیانگذار", color: "from-blue-400 to-indigo-500" },
              { name: "امیر حسینی", role: "مدیر فنی و هم‌بنیانگذار", color: "from-emerald-400 to-teal-500" },
              { name: "دکتر لیلا کریمی", role: "متخصص روانشناسی", color: "from-purple-400 to-pink-500" },
              { name: "آرش محمدی", role: "طراح تجربه کاربری", color: "from-orange-400 to-amber-500" }
            ].map((member, i) => (
              <div key={i} className="text-center group">
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${member.color} mb-4 shadow-md transition-transform group-hover:scale-105`} />
                <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
