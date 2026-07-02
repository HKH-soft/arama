"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import type { AuthUser } from "@/types/auth";

const AdminSidebar = dynamic(
    () => import("@/components/AdminSidebar").then((m) => m.AdminSidebar),
    { ssr: false },
);

export function AdminLayoutClient({
    user,
    children,
}: {
    user: AuthUser | null;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // If user is null due to auth failure, redirect client-side
    useEffect(() => {
        if (!user) {
            window.location.href = "/login";
        }
    }, [user]);

    if (!user) {
        return null;
    }

    return (
        <div
            dir="rtl"
            className="h-screen flex flex-col bg-background text-foreground overflow-hidden"
        >
            {/* Main area: sidebar + content with gap */}
            <div className="flex flex-1 gap-2 p-2 min-h-0">
                {/* Desktop sidebar */}
                <AdminSidebar user={user} />

                {/* Mobile sidebar sheet */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent
                        side="right"
                        className="bg-transparent border-none p-0 w-75 [&>button]:hidden [&_aside]:!flex [&_aside]:h-full text-foreground"
                    >
                        <SheetTitle className="sr-only">منو</SheetTitle>
                        <AdminSidebar user={user} />
                    </SheetContent>
                </Sheet>

                {/* Main content panel */}
                <main className="flex-1 bg-card rounded-lg overflow-y-auto min-w-0 relative">
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-card transition-colors shadow-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    {children}
                </main>
            </div>
        </div>
    );
}
