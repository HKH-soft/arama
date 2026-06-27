"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <>
      <div className="container mx-auto px-4 max-w-5xl py-8 md:py-16">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            با ما در تماس باشید
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            پاسخگوی سوالات، پیشنهادات و انتقادات شما هستیم
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">ایمیل</h3>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    support@arama.ai
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">تلفن</h3>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    ۰۲۱-۱۲۳۴۵۶۷۸
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">آدرس</h3>
                  <p className="text-sm text-muted-foreground">
                    تهران، پارک فناوری پردیس، ساختمان نوآوری، واحد ۴۲
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-primary/10 to-secondary/10 p-6 rounded-2xl border border-primary/20">
              <h3 className="font-bold text-foreground mb-2">زمان پاسخگویی</h3>
              <p className="text-sm text-muted-foreground mb-0">
                تیم پشتیبانی ما شنبه تا چهارشنبه از ساعت ۹ صبح تا ۱۷ عصر پاسخگوی
                شما عزیزان است.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-sm">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    نام و نام خانوادگی
                  </label>
                  <Input
                    placeholder="مثلا: سارا محمدی"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    ایمیل
                  </label>
                  <Input
                    type="email"
                    placeholder="example@domain.com"
                    className="bg-background text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  موضوع
                </label>
                <Input placeholder="موضوع پیام شما" className="bg-background" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  پیام
                </label>
                <Textarea
                  placeholder="پیام خود را اینجا بنویسید..."
                  className="min-h-[150px] bg-background"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-md bg-primary hover:bg-primary/90"
              >
                ارسال پیام
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
