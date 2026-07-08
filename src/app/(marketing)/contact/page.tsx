"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { contactSchema } from "@/lib/validators/contact";

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<FormState>({ status: "idle" });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "submitting" });

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      setState({ status: "idle" });
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          message: data.error || "خطا در ارسال پیام",
        });
        return;
      }

      setState({ status: "success" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setState({ status: "error", message: "خطا در اتصال به سرور" });
    }
  }

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
            <AnimatePresence mode="wait">
              {state.status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 space-y-4"
                >
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h3 className="text-xl font-bold text-foreground">
                    پیام شما ارسال شد!
                  </h3>
                  <p className="text-muted-foreground text-center">
                    به زودی با شما تماس خواهیم گرفت.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setState({ status: "idle" })}
                  >
                    ارسال پیام جدید
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                  onSubmit={handleSubmit}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        نام و نام خانوادگی
                      </label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="مثلا: سارا محمدی"
                        className="bg-background"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        ایمیل
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="example@domain.com"
                        className="bg-background text-left"
                        dir="ltr"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      موضوع
                    </label>
                    <Input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="موضوع پیام شما"
                      className="bg-background"
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      پیام
                    </label>
                    <Textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="پیام خود را اینجا بنویسید..."
                      className="min-h-[150px] bg-background"
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {state.status === "error" && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {state.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={state.status === "submitting"}
                    className="w-full h-12 text-md bg-primary hover:bg-primary/90"
                  >
                    {state.status === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        در حال ارسال...
                      </>
                    ) : (
                      "ارسال پیام"
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
