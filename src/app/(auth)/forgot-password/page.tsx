"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setSent(true);
    } catch {
      setError("خطا در اتصال به سرور");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <img src="/logo.svg" alt="آراما" className="w-10 h-10" />
          <span className="font-bold text-2xl tracking-tight text-foreground">
            آراما
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">فراموشی رمز عبور</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          ایمیل خود را وارد کنید تا لینک بازنشانی برایتان ارسال شود.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-foreground">
              لینک بازنشانی رمز عبور به ایمیل شما ارسال شد.
            </p>
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 text-sm inline-flex items-center gap-1"
            >
              <ArrowRight className="w-3 h-3" /> بازگشت به صفحه ورود
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ایمیل
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="example@domain.com"
                    className="pr-10 bg-background text-left"
                    dir="ltr"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isLoading ? "در حال ارسال..." : "ارسال لینک بازنشانی"}
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link
          href="/login"
          className="text-primary font-medium hover:text-primary/80 inline-flex items-center gap-1"
        >
          <ArrowRight className="w-3 h-3" /> بازگشت به صفحه ورود
        </Link>
      </p>
    </motion.div>
  );
}
