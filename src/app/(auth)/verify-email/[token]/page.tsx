"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params?.token as string | undefined;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    fetch(`/api/auth/verify-email/${token}`)
      .then((res) => setStatus(res.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/20">آ</div>
          <span className="font-bold text-2xl tracking-tight text-foreground">آراما</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">تأیید ایمیل</h1>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-foreground">در حال تأیید ایمیل...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-foreground">ایمیل شما با موفقیت تأیید شد!</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-foreground">لینک تأیید نامعتبر یا منقضی شده است.</p>
          </>
        )}
        <Link href="/login" className="text-primary font-medium hover:text-primary/80 text-sm inline-flex items-center gap-1">
          <ArrowRight className="w-3 h-3" /> رفتن به صفحه ورود
        </Link>
      </div>
    </motion.div>
  );
}
