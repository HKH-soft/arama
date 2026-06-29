"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    Home,
    CreditCard,
    Users,
    Crown,
    Settings,
    LogOut,
    Shield,
    Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AuthUser } from "@/types/auth";

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.slice(0, 2);
}

export function AdminSidebar({ user }: { user: AuthUser | null }) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { icon: Shield, label: "داشبورد مدیریت", href: "/admin/dashboard" },
        { icon: Users, label: "مدیریت کاربران", href: "/admin/users" },
        { icon: CreditCard, label: "پرداخت‌ها", href: "/admin/payments" },
        { icon: Crown, label: "اشتراک‌ها", href: "/admin/subscriptions" },
        { icon: Settings, label: "نقش‌ها", href: "/admin/roles" },
        { icon: Activity, label: "لاگ‌های سیستم", href: "/admin/audit-logs" },
    ];

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/login");
        router.refresh();
    };

    const displayName = user?.name || "مدیر";
    const initials = user?.name ? getInitials(user.name) : "م";
    const avatarUrl = user?.image || "";
    const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN");

    return (
        <aside className="w-75 shrink-0 flex flex-col gap-2 hidden md:flex">
            {/* Navigation panel */}
            <div className="bg-sidebar rounded-lg p-4 grow border border-sidebar-border">
                <Link href="/admin/dashboard" className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        م
                    </div>
                    <span className="font-bold text-xl tracking-tight text-sidebar-foreground">
                        پنل مدیریت
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
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-semibold mt-3 border-t border-sidebar-border/50 pt-3",
                            pathname?.startsWith("/dashboard")
                                ? "bg-sidebar-accent text-sidebar-primary"
                                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                        )}
                    >
                        <Home className="w-6 h-6" />
                        بخش کاربری
                    </Link>
                </nav>
            </div>

            {/* User panel */}
            <div className="bg-sidebar rounded-lg p-3 border border-sidebar-border">
                <div className="flex items-center gap-3 px-2">
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
                            {isSuperAdmin ? "مدیر ارشد" : "مدیر"}
                        </span>
                    </div>
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