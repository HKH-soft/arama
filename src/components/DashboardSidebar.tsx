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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "خانه", href: "/dashboard" },
    { icon: MessageCircle, label: "گفتگوی من", href: "/chat" },
    { icon: BarChart2, label: "تحلیل احساسات", href: "/dashboard/analytics" },
    { icon: Activity, label: "تمرینات", href: "/dashboard/exercises" },
    { icon: Wind, label: "مدیتیشن", href: "/dashboard/meditation" },
    { icon: FileText, label: "گزارش‌ها", href: "/dashboard/reports" },
    { icon: Settings, label: "تنظیمات", href: "/dashboard/settings" },
  ];

  return (
    <div className="w-64 shrink-0 bg-sidebar border-l border-sidebar-border flex flex-col hidden md:flex">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-xl">
            آ
          </div>
          <span className="font-bold text-xl tracking-tight text-sidebar-foreground">آراما</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-10 w-10 border border-sidebar-border">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/20 text-primary">س‌م</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">سارا محمدی</span>
            <span className="text-xs text-sidebar-foreground/60">کاربر پریمیوم</span>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground rounded-md transition-colors">
          <LogOut className="w-5 h-5" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}
