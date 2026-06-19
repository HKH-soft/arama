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
        checked ? "bg-primary" : "bg-white/20"
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
      <div className="bg-gradient-to-b from-slate-800/40 via-[#1a1a2e] to-[#121212] px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">تنظیمات</h1>
        <p className="text-white/50 mt-1 text-sm">
          مدیریت حساب کاربری و تنظیمات برنامه
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Profile section */}
        <div className="bg-white/5 rounded-lg p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl">
              س‌م
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">سارا محمدی</h3>
              <p className="text-white/40 text-sm">sara@example.com</p>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                پریمیوم
              </span>
            </div>
          </div>
        </div>

        {/* Settings groups */}
        <div className="space-y-4">
          {/* Notifications */}
          <div className="bg-white/5 rounded-lg divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-white/50" />
                <span className="text-sm text-white">اعلان‌ها</span>
              </div>
              <Toggle
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-white/50" />
                <span className="text-sm text-white">حالت تاریک</span>
              </div>
              <Toggle checked={theme === "dark"} onChange={toggleTheme} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-white/50" />
                <span className="text-sm text-white">صدا و صوت</span>
              </div>
              <Toggle
                checked={soundEnabled}
                onChange={() => setSoundEnabled(!soundEnabled)}
              />
            </div>
          </div>

          {/* Navigation items */}
          <div className="bg-white/5 rounded-lg divide-y divide-white/5">
            {[
              { icon: Shield, label: "حریم خصوصی و امنیت" },
              { icon: Palette, label: "شخصی‌سازی ظاهر" },
              { icon: User, label: "ویرایش پروفایل" },
            ].map((item, i) => (
              <button
                key={i}
                className="flex items-center justify-between p-4 w-full hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-white/50" />
                  <span className="text-sm text-white">{item.label}</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-white/30" />
              </button>
            ))}
          </div>

          {/* Danger zone */}
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <button className="w-full text-right text-sm text-red-400 hover:text-red-300 transition-colors py-2">
              حذف تمام گفتگوها
            </button>
            <button className="w-full text-right text-sm text-red-400 hover:text-red-300 transition-colors py-2">
              حذف حساب کاربری
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
