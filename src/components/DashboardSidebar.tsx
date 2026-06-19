"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  BarChart2,
  Activity,
  Wind,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "خانه", href: "/dashboard" },
    { icon: MessageCircle, label: "گفتگوی من", href: "/chat" },
    { icon: BarChart2, label: "تحلیل احساسات", href: "/analytics" },
    { icon: Activity, label: "تمرینات", href: "/exercises" },
    { icon: Wind, label: "مدیتیشن", href: "/meditation" },
    { icon: FileText, label: "گزارش‌ها", href: "/reports" },
    { icon: Settings, label: "تنظیمات", href: "/settings" },
  ];

  return (
    <aside className="w-[300px] shrink-0 flex flex-col gap-2 hidden md:flex">
      {/* Navigation panel */}
      <div className="bg-[#121212] rounded-lg p-4 grow">
        <Link href="/" className="flex items-center gap-2 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
            آ
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            آراما
          </span>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-semibold",
                  isActive ? "text-white" : "text-white/60 hover:text-white",
                )}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User panel */}
      <div className="bg-[#121212] rounded-lg p-3 mt-auto">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/30 text-primary text-xs font-bold">
              س‌م
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-white truncate">
              سارا محمدی
            </span>
            <span className="text-[11px] text-white/40">کاربر پریمیوم</span>
          </div>
          <button className="text-white/40 hover:text-white transition-colors p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
