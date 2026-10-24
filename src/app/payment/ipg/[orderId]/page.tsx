"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  HelpCircle,
  KeyRound,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function detectBank(cardNumber: string) {
  const clean = cardNumber.replace(/\D/g, "");
  if (clean.startsWith("603799") || clean.startsWith("170019"))
    return { name: "بانک ملی ایران", color: "from-blue-600 to-blue-800" };
  if (clean.startsWith("610433") || clean.startsWith("991975"))
    return { name: "بانک ملت", color: "from-red-600 to-red-800" };
  if (clean.startsWith("621986"))
    return { name: "بانک سامان", color: "from-sky-600 to-sky-800" };
  if (clean.startsWith("502229") || clean.startsWith("639347"))
    return { name: "بانک پاسارگاد", color: "from-amber-500 to-amber-700" };
  if (clean.startsWith("627412"))
    return { name: "بانک اقتصاد نوین", color: "from-purple-600 to-purple-800" };
  if (clean.startsWith("589210"))
    return { name: "بانک سپه", color: "from-emerald-600 to-emerald-800" };
  if (clean.startsWith("603769"))
    return { name: "بانک صادرات", color: "from-blue-700 to-indigo-900" };
  if (clean.startsWith("628023"))
    return { name: "بانک مسکن", color: "from-orange-500 to-orange-700" };
  if (clean.startsWith("504706"))
    return { name: "بانک شهر", color: "from-rose-600 to-rose-800" };
  if (clean.startsWith("627760"))
    return { name: "پست بانک ایران", color: "from-green-600 to-green-800" };
  if (clean.startsWith("505785"))
    return { name: "بانک ایران زمین", color: "from-indigo-600 to-indigo-800" };
  if (clean.length >= 6)
    return { name: "کارت بانکی عضو شتاب", color: "from-slate-700 to-slate-900" };
  return null;
}

export default function DirectGatewayPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = String(params.orderId ?? "");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    id: string;
    plan: string;
    amount: number;
  } | null>(null);

  // Form Fields
  const [cardNumber, setCardNumber] = useState("");
  const [cvv2, setCvv2] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [otp, setOtp] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState("7482");

  // OTP Timer
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Gateway Session Countdown (10 minutes)
  const [sessionSeconds, setSessionSeconds] = useState(600);

  // Payment Status
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const refreshCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCaptcha(code);
  };

  useEffect(() => {
    refreshCaptcha();
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/subscription`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          // Find plan details
          setOrderDetails({
            id: orderId,
            plan: "اشتراک ویژه آراما",
            amount: 335000,
          });
        }
      } catch (err) {
        console.warn("Fetch order error:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchOrder();
  }, [orderId]);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage("زمان جلسه پرداخت منقضی شد. لطفاً به سایت بازگردید.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // OTP Countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpTimer]);

  const requestDynamicOtp = () => {
    const cleanCard = cardNumber.replace(/\D/g, "");
    if (cleanCard.length < 16) {
      setErrorMessage("ابتدا شماره ۱۶ رقمی کارت بانکی را به درستی وارد کنید.");
      return;
    }
    setOtpSent(true);
    setOtpTimer(120);
    // Simulate SMS notification
    const sampleOtp = String(Math.floor(10000 + Math.random() * 90000));
    setOtp(sampleOtp);
    setErrorMessage("");
  };

  const handleCardInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanCard = cardNumber.replace(/\D/g, "");
    if (cleanCard.length !== 16) {
      setErrorMessage("شماره کارت بانکی ۱۶ رقمی معتبر نیست.");
      return;
    }
    if (cvv2.length < 3) {
      setErrorMessage("کد CVV2 را صحیح وارد کنید.");
      return;
    }
    if (!expMonth || !expYear) {
      setErrorMessage("تاریخ انقضای کارت را مشخص کنید.");
      return;
    }
    if (!otp || otp.length < 5) {
      setErrorMessage("رمز پویا را وارد کنید (یا دکمه دریافت رمز پویا را بزنید).");
      return;
    }
    if (captcha !== generatedCaptcha) {
      setErrorMessage("کد امنیتی تصویر مطابقت ندارد.");
      refreshCaptcha();
      return;
    }

    setSubmitting(true);
    try {
      const randomRef = `SHP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await fetch("/api/payment/gateway/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          paymentId: orderId,
          refId: randomRef,
          cardNumber: cleanCard.slice(0, 6) + "******" + cleanCard.slice(-4),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "خطا در تایید تراکنش بانکی");
      }

      setPaidSuccess(true);
      setRefNumber(data.refId || randomRef);
      setTimeout(() => {
        router.push("/billing?status=success");
      }, 2500);
    } catch (payErr) {
      setErrorMessage(payErr instanceof Error ? payErr.message : "خطا در پردازش پرداخت بانکی");
    } finally {
      setSubmitting(false);
    }
  };

  const detected = detectBank(cardNumber);
  const minutes = Math.floor(sessionSeconds / 60);
  const seconds = sessionSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const amountToman = orderDetails?.amount || 335000;
  const amountRial = amountToman * 10;

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans" dir="rtl">
      {/* Top Bank / Shaparak Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md">
              شاپرک
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <span>درگاه پرداخت اینترنتی شاپرک</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> امن (SSL)
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">شبکه الکترونیکی پرداخت کارت بانکی</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-800 font-mono text-xs font-black">
              <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              <span>{timeFormatted}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {paidSuccess ? (
          <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center max-w-lg mx-auto animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-12 w-12 stroke-[2.2]" />
            </div>
            <h2 className="mt-6 text-xl font-black text-slate-800">تراکنش با موفقیت انجام شد! 🎉</h2>
            <p className="mt-2 text-xs text-slate-500 leading-6">
              پرداخت اشتراک پلتفرم <b>آراما</b> تأیید شد و حساب کاربری شما بلافاصله فعال گردید.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">کد پیگیری شاپرک:</span>
                <span className="font-mono font-bold text-slate-700">{refNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">مبلغ تراکنش:</span>
                <span className="font-bold text-emerald-600">{amountToman.toLocaleString("fa-IR")} تومان</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">پذیرنده:</span>
                <span className="font-bold text-slate-700">پلتفرم سلامت روان آراما</span>
              </div>
            </div>

            <p className="mt-6 text-[11px] text-slate-400 flex items-center justify-center gap-1">
              در حال انتقال به پنل کاربری... <Loader2 className="h-3 w-3 animate-spin" />
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            {/* Payment Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-sky-600" /> اطلاعات کارت بانکی
                </h2>
                <span className="text-xs text-slate-400">کلیه کارت‌های عضو شتاب</span>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={submitPayment} className="mt-6 space-y-5">
                {/* Card Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    شماره کارت ۱۶ رقمی
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      value={cardNumber}
                      onChange={(e) => handleCardInput(e.target.value)}
                      placeholder="____  ____  ____  ____"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 font-mono text-base tracking-widest text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition"
                      maxLength={19}
                    />
                    {detected && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                        {detected.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* CVV2 and Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      کد شناسایی دوم (CVV2)
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      value={cvv2}
                      onChange={(e) => setCvv2(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="۳ یا ۴ رقم"
                      maxLength={4}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      تاریخ انقضا (ماه / سال)
                    </label>
                    <div className="flex gap-2" dir="ltr">
                      <input
                        type="text"
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                        placeholder="ماه"
                        maxLength={2}
                        className="w-1/2 h-12 text-center rounded-xl border border-slate-200 font-mono text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition"
                      />
                      <span className="self-center text-slate-300">/</span>
                      <input
                        type="text"
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
                        placeholder="سال"
                        maxLength={2}
                        className="w-1/2 h-12 text-center rounded-xl border border-slate-200 font-mono text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Password (OTP) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">رمز اینترنتی پویا (OTP)</label>
                    <button
                      type="button"
                      onClick={requestDynamicOtp}
                      disabled={otpTimer > 0}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 disabled:text-slate-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      {otpTimer > 0 ? `دریافت مجدد (${otpTimer} ثانیه)` : "دریافت رمز پویا"}
                    </button>
                  </div>
                  <input
                    type="password"
                    dir="ltr"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="رمز پویای پیامک‌شده را وارد کنید"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition"
                  />
                  {otpSent && (
                    <p className="mt-1 text-[11px] text-emerald-600">
                      ✓ رمز پویا با موفقیت تولید و درج شد.
                    </p>
                  )}
                </div>

                {/* Captcha */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    کد امنیتی تصویر
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      dir="ltr"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value.slice(0, 6))}
                      placeholder="کد ۴ رقمی"
                      maxLength={6}
                      className="w-1/2 h-12 px-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition"
                    />
                    <div className="w-1/2 h-12 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between px-3">
                      <span className="font-mono text-lg font-black tracking-widest text-slate-700 select-none">
                        {generatedCaptcha}
                      </span>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="تغییر تصویر"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-extrabold shadow-lg shadow-emerald-600/20 hover:brightness-105 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> در حال پردازش...
                      </>
                    ) : (
                      <>پرداخت مبلغ {amountToman.toLocaleString("fa-IR")} تومان</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/billing")}
                    className="h-12 px-5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar Invoice Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">
                  خلاصه فاکتور
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">پذیرنده:</span>
                    <span className="font-bold text-slate-800">پلتفرم آراما</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">سرویس:</span>
                    <span className="font-bold text-slate-800">{orderDetails?.plan || "اشتراک آراما"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">شناسه سفارش:</span>
                    <span className="font-mono text-[11px] text-slate-600">{orderId.slice(0, 12)}...</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-slate-600 font-bold">مبلغ قابل پرداخت:</span>
                    <div className="text-left">
                      <span className="text-base font-black text-emerald-600">
                        {amountToman.toLocaleString("fa-IR")}
                      </span>{" "}
                      <span className="text-[11px] text-slate-400">تومان</span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ({amountRial.toLocaleString("fa-IR")} ریال)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-indigo-50/60 rounded-3xl p-5 border border-sky-100 text-xs space-y-2 text-slate-600">
                <div className="flex items-center gap-2 font-bold text-sky-900">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  <span>راهنمای امنیت پرداخت</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 leading-5">
                  <li>آدرس مرورگر را بررسی کنید تا در دامنه امن شاپرک باشد.</li>
                  <li>هرگز رمز کارت خود را در اختیار دیگران قرار ندهید.</li>
                  <li>در صورت بروز هرگونه مشکل، مبلغ به حسابتان بازمی‌گردد.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
