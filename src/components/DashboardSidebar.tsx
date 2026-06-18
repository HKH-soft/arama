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
  Library,
  Music2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Track } from "@/hooks/useAudioPlayer";

interface DashboardSidebarProps {
  tracks?: Track[];
  currentTrack?: Track | null;
  isPlaying?: boolean;
  onPlayTrack?: (track: Track) => void;
}

export function DashboardSidebar({
  tracks = [],
  currentTrack = null,
  isPlaying = false,
  onPlayTrack,
}: DashboardSidebarProps = {}) {
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
    <aside className="w-[300px] shrink-0 flex flex-col gap-2 hidden md:flex">
      {/* Navigation panel */}
      <div className="bg-[#121212] rounded-lg p-4">
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
                  isActive
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Music library panel */}
      {tracks.length > 0 && (
      <div className="bg-[#121212] rounded-lg p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Library className="w-6 h-6 text-white/60" />
          <span className="font-semibold text-white text-sm">
            کتابخانه صوتی
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5 -mx-2 px-2">
          {tracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => onPlayTrack?.(track)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-right group",
                  isCurrent
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-md flex items-center justify-center shrink-0",
                    isCurrent
                      ? "bg-primary/30"
                      : "bg-white/5 group-hover:bg-white/10"
                  )}
                >
                  {isCurrent && isPlaying ? (
                    <div className="flex items-end gap-[2px] h-4">
                      <span className="w-[3px] bg-primary rounded-full animate-[equalizer_0.8s_ease-in-out_infinite_alternate] h-2" />
                      <span className="w-[3px] bg-primary rounded-full animate-[equalizer_0.6s_ease-in-out_infinite_alternate_0.2s] h-4" />
                      <span className="w-[3px] bg-primary rounded-full animate-[equalizer_0.7s_ease-in-out_infinite_alternate_0.4s] h-3" />
                    </div>
                  ) : (
                    <Music2 className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isCurrent ? "text-primary" : ""
                    )}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {track.artist}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* User panel */}
      <div className="bg-[#121212] rounded-lg p-3">
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
