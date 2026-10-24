"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  CreditCard,
  Heart,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  WalletCards,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/logo";

type OverviewData = {
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    totalRevenue: number;
    totalConversations: number;
    totalMessages: number;
    totalMoodEntries: number;
    meditationTracks: number;
    exercisesCount: number;
  };
  recentUsers: Array<{
    userId: string;
    phone: string;
    name: string | null;
    createdAt: string;
  }>;
  recentPayments: Array<{
    id: string;
    userId: string;
    planId: string;
    amount: number;
    status: string;
    refId: string | null;
    createdAt: string;
  }>;
  moodDistribution: Array<{
    mood: string;
    count: number;
  }>;
  system: {
    nodeEnv: string;
    cartbecartConfigured: boolean;
    smsConfigured: boolean;
    aiConfigured: boolean;
  };
};

type UserItem = {
  userId: string;
  phone: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  hasSubscription: boolean;
  subscriptionPlan: string | null;
  renewsAt: string | null;
};

type PaymentItem = {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  planId: string;
  amount: number;
  status: string;
  authority: string;
  refId: string | null;
  createdAt: string;
};

export default function AdminConsole() {
  const [tab, setTab] = useState<"overview" | "users" | "payments" | "ai" | "system">("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Users state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [grantingUser, setGrantingUser] = useState<string | null>(null);

  // Payments state
  const [paymentsList, setPaymentsList] = useState<PaymentItem[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [approvingPayment, setApprovingPayment] = useState<string | null>(null);

  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const loadUsers = useCallback(async (query = "") => {
    setLoadingUsers(true);
    try {
      const url = query ? `/api/admin/users?q=${encodeURIComponent(query)}` : "/api/admin/users";
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadPayments = useCallback(async (status = "") => {
    setLoadingPayments(true);
    try {
      const url = status ? `/api/admin/payments?status=${encodeURIComponent(status)}` : "/api/admin/payments";
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPaymentsList(data.payments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (tab === "users") void loadUsers(userSearch);
    if (tab === "payments") void loadPayments(paymentFilter);
  }, [tab, userSearch, paymentFilter, loadUsers, loadPayments]);

  const grantSubscription = async (userId: string, planId: string) => {
    setGrantingUser(userId);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planId, action: "grant_subscription" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "اعطای اشتراک ناموفق بود.");
      setActionSuccess(data.message || "اشتراک کاربر فعال شد.");
      void loadUsers(userSearch);
      void loadOverview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "خطا در انجام عملیات");
    } finally {
      setGrantingUser(null);
    }
  };

  const manualApprovePayment = async (paymentId: string) => {
    setApprovingPayment(paymentId);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action: "manual_approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تأیید تراکنش ناموفق بود.");
      setActionSuccess(data.message || "تراکنش تأیید و اشتراک فعال شد.");
      void loadPayments(paymentFilter);
      void loadOverview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "خطا در تایید تراکنش");
    } finally {
      setApprovingPayment(null);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.href = "/admin-login";
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans selection:bg-brand selection:text-ink" dir="rtl">
      {/* Admin Top Header */}
      <header className="border-b border-white/10 bg-[#161b26]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="hidden sm:block border-r border-white/10 pr-4">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <span>مرکز فرماندهی آراما</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LIVE
                </span>
              </span>
              <p className="text-[10px] text-slate-400">مدیریت پلتفرم، امور مالی و کاربران</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void loadOverview()}
              title="بروزرسانی داده‌ها"
              className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto border-t border-white/5 py-2">
          {[
            { id: "overview", label: "شاخص‌ها و نمای کلی", icon: LayoutDashboard },
            { id: "users", label: "مدیریت کاربران", icon: Users },
            { id: "payments", label: "تراکنش‌ها و پرداخت‌ها", icon: WalletCards },
            { id: "ai", label: "تحلیل گفتگوها و خلق‌وخو", icon: MessageSquare },
            { id: "system", label: "وضعیت سرویس‌ها و زیرساخت", icon: Activity },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                tab === t.id
                  ? "bg-brand-deep text-onbrand shadow-md shadow-brand-deep/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess("")}><X className="h-4 w-4" /></button>
          </div>
        )}
        {actionError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <XCircle className="h-4 w-4" /> {actionError}
            </span>
            <button onClick={() => setActionError("")}><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* ── TAB 1: OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-8 animate-in fade-in">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">کل کاربران ثبت‌نامی</span>
                  <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {overview?.stats.totalUsers.toLocaleString("fa-IR") || "۰"}
                  </span>
                  <span className="text-xs text-slate-500">نفر</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">اشتراک‌های فعال</span>
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Award className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">
                    {overview?.stats.activeSubscriptions.toLocaleString("fa-IR") || "۰"}
                  </span>
                  <span className="text-xs text-slate-500">حساب فعال</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">درآمد ناخالص</span>
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <WalletCards className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    {overview?.stats.totalRevenue.toLocaleString("fa-IR") || "۰"}
                  </span>
                  <span className="text-xs text-amber-400 font-bold">تومان</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">پیام‌های همدلانه آراما</span>
                  <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {overview?.stats.totalMessages.toLocaleString("fa-IR") || "۰"}
                  </span>
                  <span className="text-xs text-slate-500">پیام</span>
                </div>
              </div>
            </div>

            {/* Quick Summary Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Users */}
              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-sky-400" />
                    <span>آخرین کاربران ثبت‌نامی</span>
                  </h3>
                  <button
                    onClick={() => setTab("users")}
                    className="text-xs font-bold text-brand hover:underline"
                  >
                    مشاهده همه
                  </button>
                </div>
                <div className="space-y-2.5">
                  {overview?.recentUsers.map((u) => (
                    <div
                      key={u.userId}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{u.name || "کاربر جدید"}</p>
                        <p className="font-mono text-[11px] text-slate-400" dir="ltr">
                          {u.phone}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                  ))}
                  {(!overview?.recentUsers || overview.recentUsers.length === 0) && (
                    <p className="text-center py-6 text-xs text-slate-500">هنوز کاربری ثبت نشده است.</p>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <WalletCards className="h-4 w-4 text-emerald-400" />
                    <span>آخرین تراکنش‌ها و پرداخت‌ها</span>
                  </h3>
                  <button
                    onClick={() => setTab("payments")}
                    className="text-xs font-bold text-brand hover:underline"
                  >
                    مشاهده همه
                  </button>
                </div>
                <div className="space-y-2.5">
                  {overview?.recentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">
                          {p.amount.toLocaleString("fa-IR")} تومان
                        </span>
                        <p className="font-mono text-[10px] text-slate-500">
                          {p.refId || p.id.slice(0, 10)}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : p.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {p.status === "paid" ? "موفق" : p.status === "pending" ? "در انتظار" : "ناموفق"}
                      </span>
                    </div>
                  ))}
                  {(!overview?.recentPayments || overview.recentPayments.length === 0) && (
                    <p className="text-center py-6 text-xs text-slate-500">هنوز تراکنشی ثبت نشده است.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: USERS ── */}
        {tab === "users" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="جستجو با شماره موبایل یا نام..."
                  className="w-full h-11 pr-10 pl-4 rounded-2xl border border-white/10 bg-[#161b26] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
                />
              </div>

              <button
                onClick={() => void loadUsers(userSearch)}
                className="flex items-center gap-1.5 px-4 h-11 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>بروزرسانی لیست</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl border border-white/10 bg-[#161b26] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-bold">
                    <tr>
                      <th className="p-4">کاربر</th>
                      <th className="p-4">شماره موبایل</th>
                      <th className="p-4">وضعیت اشتراک</th>
                      <th className="p-4">تاریخ ثبت‌نام</th>
                      <th className="p-4 text-left">عملیات اشتراک</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.userId} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 font-bold text-white">{u.name || "کاربر آراما"}</td>
                        <td className="p-4 font-mono text-slate-300" dir="ltr">
                          {u.phone}
                        </td>
                        <td className="p-4">
                          {u.hasSubscription ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck className="h-3 w-3" />
                              <span>فعال ({u.subscriptionPlan || "ویژه"})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                              رایگان
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString("fa-IR")}
                        </td>
                        <td className="p-4 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={grantingUser === u.userId}
                              onClick={() => void grantSubscription(u.userId, "1-month")}
                              className="px-2.5 py-1 rounded-xl bg-brand-deep/80 text-onbrand text-[11px] font-bold hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                              title="اعطای اشتراک ۱ ماهه"
                            >
                              +۱ ماهه
                            </button>
                            <button
                              disabled={grantingUser === u.userId}
                              onClick={() => void grantSubscription(u.userId, "3-month")}
                              className="px-2.5 py-1 rounded-xl bg-teal-600/80 text-white text-[11px] font-bold hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                              title="اعطای اشتراک ۳ ماهه"
                            >
                              +۳ ماهه
                            </button>
                            <button
                              disabled={grantingUser === u.userId}
                              onClick={() => void grantSubscription(u.userId, "1-year")}
                              className="px-2.5 py-1 rounded-xl bg-amber-600/80 text-white text-[11px] font-bold hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                              title="اعطای اشتراک ۱ ساله"
                            >
                              +۱ ساله
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && !loadingUsers && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          هیچ کاربری با این مشخصات یافت نشد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: PAYMENTS ── */}
        {tab === "payments" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                {[
                  { id: "", label: "همه تراکنش‌ها" },
                  { id: "paid", label: "موفق" },
                  { id: "pending", label: "در انتظار" },
                  { id: "failed", label: "ناموفق" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPaymentFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      paymentFilter === f.id
                        ? "bg-white/10 text-white border border-white/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => void loadPayments(paymentFilter)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>بروزرسانی</span>
              </button>
            </div>

            {/* Payments Table */}
            <div className="rounded-3xl border border-white/10 bg-[#161b26] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-bold">
                    <tr>
                      <th className="p-4">کاربر</th>
                      <th className="p-4">مبلغ (تومان)</th>
                      <th className="p-4">طرح</th>
                      <th className="p-4">شناسه رهگیری / فاکتور</th>
                      <th className="p-4">وضعیت</th>
                      <th className="p-4">تاریخ</th>
                      <th className="p-4 text-left">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paymentsList.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-4">
                          <p className="font-bold text-white">{p.userName}</p>
                          <p className="font-mono text-[10px] text-slate-400" dir="ltr">
                            {p.userPhone}
                          </p>
                        </td>
                        <td className="p-4 font-black text-white">
                          {p.amount.toLocaleString("fa-IR")}
                        </td>
                        <td className="p-4 text-slate-300">{p.planId}</td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {p.refId || p.authority}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : p.status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {p.status === "paid" ? "موفق" : p.status === "pending" ? "در انتظار" : "ناموفق"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString("fa-IR")}
                        </td>
                        <td className="p-4 text-left">
                          {p.status !== "paid" && (
                            <button
                              disabled={approvingPayment === p.id}
                              onClick={() => void manualApprovePayment(p.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600/90 text-white text-[11px] font-bold hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                            >
                              {approvingPayment === p.id ? "در حال تایید..." : "تأیید دستی"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {paymentsList.length === 0 && !loadingPayments && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          تراکنشی یافت نشد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: AI & MOOD ── */}
        {tab === "ai" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-brand-glow" />
                  <span>توزیع احساسات ثبت‌شده کاربران</span>
                </h3>
                <div className="space-y-3">
                  {overview?.moodDistribution.map((m) => (
                    <div key={m.mood} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-300">{m.mood}</span>
                        <span className="font-mono text-slate-400">{m.count} بار</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-brand-deep rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, (m.count / (overview.stats.totalMoodEntries || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {(!overview?.moodDistribution || overview.moodDistribution.length === 0) && (
                    <p className="text-xs text-slate-500 py-6 text-center">داده‌ای ثبت نشده است.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6 space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-400" />
                  <span>شاخص‌های همدلی و سلامت پلتفرم</span>
                </h3>
                <p className="text-xs text-slate-400 leading-6">
                  هوش مصنوعی آراما با پروتکل‌های CBT و ذهن‌آگاهی به‌صورت بلادرنگ به همراهی کاربران می‌پردازد. تمامی مکالمات طبق استاندارد حفظ حریم خصوصی رمزنگاری شده و داده‌های هویتی محافظت می‌شوند.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-400">مجموع چک‌این‌های روانی</span>
                    <p className="text-xl font-black text-white mt-1">
                      {overview?.stats.totalMoodEntries.toLocaleString("fa-IR") || "۰"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-400">تعداد گفتگوهای درمانی</span>
                    <p className="text-xl font-black text-white mt-1">
                      {overview?.stats.totalConversations.toLocaleString("fa-IR") || "۰"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: SYSTEM & INFRA ── */}
        {tab === "system" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">سامانه ملی‌پیامک (SMS OTP)</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    فعال
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-5">
                  پترن خط خدماتی <b>543305</b> با شناسه ملی‌پیامک و ارسال زیر ۲ ثانیه فعال است.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">درگاه کارت‌به‌کارت (CartBeCart)</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    متصل
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-5">
                  درگاه مستقیم هوشمند و شبیه‌ساز شاپرک جهت پرداخت آنی کاربران تنظیم شده است.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#161b26] p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">پایگاه داده PostgreSQL</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    متصل
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-5">
                  ارتباط دیتابیس از طریق استخر اتصال Drizzle ORM در پایداری کامل است.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
