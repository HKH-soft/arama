"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  Home,
  MessageCircle,
  BarChart2,
  Activity,
  Wind,
  FileText,
  Settings,
  LogOut,
  Crown,
  CreditCard,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AuthUser } from "@/types/auth";
import { useUser } from "@/contexts/UserContext";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name.slice(0, 2);
}

export function DashboardSidebar({
  user: initialUser,
}: {
  user: AuthUser | null;
}) {
  const { user } = useUser();
  const effectiveUser = user || initialUser;
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Home, label: "خانه", href: "/dashboard" },
    { icon: MessageCircle, label: "گفتگوی من", href: "/chat" },
    { icon: BarChart2, label: "تحلیل احساسات", href: "/analytics" },
    { icon: Activity, label: "تمرینات", href: "/exercises" },
    { icon: Wind, label: "مدیتیشن", href: "/meditation" },
    { icon: FileText, label: "گزارش‌ها", href: "/reports" },
  ].filter(Boolean) as { icon: any; label: string; href: string }[];

  // Show admin link if user has admin role
  const isAdmin = user?.roles?.some(
    (r) => r === "super_admin" || r === "admin",
  );

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName = effectiveUser?.name || "کاربر مهمان";
  const initials = effectiveUser?.name ? getInitials(effectiveUser.name) : "؟";
  const avatarUrl = effectiveUser?.avatarUrl || effectiveUser?.image || "";
  const isSuperAdmin = effectiveUser?.roles?.includes("super_admin");

  return (
    <aside className="w-75 shrink-0 flex-col gap-2 hidden md:flex bg-transparent">
      {/* Navigation panel */}
      <div className="bg-sidebar rounded-lg p-4 grow border border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
            آ
          </div>
          <span className="font-bold text-xl tracking-tight text-sidebar-foreground">
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
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-semibold mt-2 border-t border-sidebar-border/50 pt-3",
                pathname?.startsWith("/admin")
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Settings className="w-6 h-6" />
              پنل مدیریت
            </Link>
          )}
        </nav>
      </div>

      {/* User panel */}
      <div className="bg-sidebar rounded-lg p-3 mt-auto border border-sidebar-border">
        <div className="flex items-center justify-between px-2">
          <Link href="/profile" className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/30 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">
                {displayName}
              </span>
              <span className="text-[11px] text-sidebar-foreground/40">
                {isSuperAdmin ? "مدیر ارشد" : "کاربر"}
              </span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1"
            title="خروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
