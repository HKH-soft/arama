"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Report {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: "weekly" | "monthly";
  reportDate: number;
  createdAt: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fa-IR");
  };

  return (
    <>
      <div className="bg-linear-to-b from-amber-900/40 via-background to-background px-6 pt-6 pb-4 border-b border-border/60">
        <h1 className="text-2xl font-bold text-foreground">گزارش‌ها</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          مشاهده پیشرفت و تاریخچه فعالیت‌های شما
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Quick stats */}
        {!loading && <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              label: "میانگین خلق ماهانه",
              val: reports.length > 0 ? "—" : "—",
              change: "",
              icon: TrendingUp,
            },
            {
              label: "روزهای فعال",
              val: "—",
              change: "",
              icon: Calendar,
            },
            {
              label: "تعداد گزارش‌ها",
              val: reports.length > 0 ? reports.length.toString() : "—",
              change: "",
              icon: BarChart2,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 text-foreground/50 mb-2">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {stat.val}
                </span>
                {stat.change ? <span className="text-xs text-green-400">{stat.change}</span> : null}
              </div>
            </div>
          ))}
        </div>}

        {/* Report list */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm">
            گزارش‌های شما
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-card/90 hover:bg-card transition-colors rounded-lg p-4 flex items-center justify-between group cursor-pointer border border-border shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-foreground/50">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {report.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-foreground/40">
                        {formatDate(report.reportDate)}
                      </span>
                      <span className="text-[10px] bg-white/10 text-foreground/50 px-1.5 py-0.5 rounded">
                        {report.type === "monthly" ? "ماهانه" : "هفتگی"}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white/10">
                  <Download className="w-4 h-4 text-foreground/60" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">گزارشی یافت نشد</p>
          )}
        </div>
      </div>
    </>
  );
}