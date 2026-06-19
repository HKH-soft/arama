"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div dir="rtl" className="h-screen flex flex-col bg-black overflow-hidden">
      {/* Main area: sidebar + content with gap (Spotify seams) */}
      <div className="flex flex-1 gap-2 p-2 min-h-0">
        {/* Desktop sidebar */}
        <DashboardSidebar />

        {/* Mobile sidebar sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="right"
            className="bg-[#121212] border-none p-0 w-[300px] [&>button]:hidden [&_aside]:!flex [&_aside]:h-full"
          >
            <SheetTitle className="sr-only">منو</SheetTitle>
            <DashboardSidebar />
          </SheetContent>
        </Sheet>

        {/* Main content panel */}
        <main className="flex-1 bg-[#121212] rounded-lg overflow-y-auto min-w-0 relative">
          {/* Mobile hamburger - floating, non-blocking */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 rounded-full bg-[#121212]/90 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#121212] transition-colors shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          {children}
        </main>
      </div>
    </div>
  );
}
