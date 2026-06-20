"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  ChevronLeft,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          checked ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  );

  return (
    <>
      <div className="bg-gradient-to-b from-primary/25 via-card/40 to-card px-6 pt-6 pb-4 border-b border-border/50">
        <h1 className="text-2xl font-bold text-foreground">تنظیمات</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          مدیریت حساب کاربری و تنظیمات برنامه
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Profile section */}
        <div className="bg-muted/30 border border-border rounded-lg p-5 mt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl">
              س‌م
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">سارا محمدی</h3>
              <p className="text-muted-foreground/80 text-sm">sara@example.com</p>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                پریمیوم
              </span>
            </div>
          </div>
        </div>

        {/* Settings groups */}
        <div className="space-y-4">
          {/* Notifications */}
          <div className="bg-muted/30 border border-border rounded-lg divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">اعلان‌ها</span>
              </div>
              <Toggle
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">حالت تاریک</span>
              </div>
              <Toggle checked={theme === "dark"} onChange={toggleTheme} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">صدا و صوت</span>
              </div>
              <Toggle
                checked={soundEnabled}
                onChange={() => setSoundEnabled(!soundEnabled)}
              />
            </div>
          </div>

          {/* Navigation items */}
          <div className="bg-muted/30 border border-border rounded-lg divide-y divide-border">
            {[
              { icon: Shield, label: "حریم خصوصی و امنیت" },
              { icon: Palette, label: "شخصی‌سازی ظاهر" },
              { icon: User, label: "ویرایش پروفایل" },
            ].map((item, i) => (
              <button
                key={i}
                className="flex items-center justify-between p-4 w-full hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground/50" />
              </button>
            ))}
          </div>

          {/* Danger zone */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
            <button className="w-full text-right text-sm text-red-500 hover:text-red-400 transition-colors py-2">
              حذف تمام گفتگوها
            </button>
            <button className="w-full text-right text-sm text-red-500 hover:text-red-400 transition-colors py-2">
              حذف حساب کاربری
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
