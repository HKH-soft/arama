"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = "ایمیل الزامی است";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "فرمت ایمیل نامعتبر است";
      isValid = false;
    }

    if (!password) {
      errors.password = "رمز عبور الزامی است";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const getErrorMessage = (errorCode: string): string => {
    const errorMap: Record<string, string> = {
      "CredentialsSignin": "ایمیل یا رمز عبور اشتباه است",
      "invalid_credentials": "ایمیل یا رمز عبور اشتباه است",
      "user_not_found": "کاربری با این ایمیل یافت نشد",
      "account_disabled": "حساب کاربری شما غیرفعال شده است. لطفاً با پشتیبانی تماس بگیرید",
    };
    return errorMap[errorCode] || "خطا در ورود به سیستم. لطفاً دوباره تلاش کنید";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signInError } = await signIn.email({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(getErrorMessage(signInError.code || "CredentialsSignin"));
        return;
      }
      router.push(callbackUrl);
      router.refresh();
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
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/20">
            آ
          </div>
          <span className="font-bold text-2xl tracking-tight text-foreground">آراما</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">ورود به حساب</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          خوش آمدید! لطفاً وارد حساب کاربری خود شوید.
        </p>
      </div>

      {/* Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">ایمیل</label>
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
            {fieldErrors.email && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10 pl-10 bg-background text-left"
                dir="ltr"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                مرا به خاطر بسپار
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              فراموشی رمز عبور
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>در حال ورود...</span>
              </div>
            ) : (
              "ورود"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">یا ورود با</span>
          <Separator className="flex-1" />
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            className="h-11 gap-2"
            type="button"
            onClick={() => signIn.social({ provider: "google", callbackURL: callbackUrl })}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm">ورود با گوگل</span>
          </Button>
        </div>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        حساب کاربری ندارید؟{" "}
        <Link href="/signup" className="text-primary font-medium hover:text-primary/80 transition-colors">
          ثبت‌نام کنید
          <ArrowLeft className="inline w-3 h-3 mr-1" />
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center px-6"><Skeleton className="h-80 w-full max-w-md rounded-3xl" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
