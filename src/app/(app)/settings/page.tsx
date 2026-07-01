"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  ChevronLeft,
  Sun,
  Volume2,
  Key,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: number;
  lastLoginAt: number;
  isActive: boolean;
}

interface Subscription {
  plan: {
    displayName: string;
  };
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, subscriptionRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/subscriptions/current"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserData(profileData);
        }

        if (subscriptionRes.ok) {
          const subscriptionData = await subscriptionRes.json();
          setSubscription(subscriptionData.subscription);
        }
      } catch (err) {
        console.error("Error fetching settings data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <div className="bg-linear-to-b from-primary/25 via-card/40 to-card px-6 pt-6 pb-4 border-b border-border/50">
        <h1 className="text-2xl font-bold text-foreground">تنظیمات</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          مدیریت حساب کاربری و تنظیمات برنامه
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Profile section */}
        <div className="bg-muted/30 border border-border rounded-lg p-5 mt-6">
          {loading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-foreground font-bold text-2xl">
                {userData?.name ? userData.name.split(' ').map(n => n[0]).join('') : '?'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {userData?.name || 'کاربر'}
                </h3>
                <p className="text-muted-foreground/80 text-sm">
                  {userData?.email || '-'}
                </p>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                  {subscription?.plan?.displayName || 'رایگان'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settings groups */}
        <div className="space-y-4">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                اعلان‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">اعلان‌های وب</Label>
                  <p className="text-xs text-muted-foreground">
                    دریافت اعلان‌ها در مرورگر
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">صدا</Label>
                  <p className="text-xs text-muted-foreground">
                    پخش صدای اعلان‌ها
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">ایمیل</Label>
                  <p className="text-xs text-muted-foreground">
                    دریافت اعلان‌ها از طریق ایمیل
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                حریم خصوصی و امنیت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    احراز هویت دو مرحله‌ای
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    افزایش امنیت حساب
                  </p>
                </div>
                <Switch
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </div> */}

              <div className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/session-management#password">
                    <Key className="w-4 h-4 ml-2" />
                    تغییر رمز عبور
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                مدیریت نشست‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    نشست‌های فعال، دستگاه‌های وارد شده و خروج از همه دستگاه‌ها را مدیریت کن.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/session-management#sessions">
                      <Monitor className="w-4 h-4 ml-2" />
                      رفتن به مدیریت نشست‌ها
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                ظاهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-2">
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    <Sun className="w-4 h-4 ml-2" />
                    روشن
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    <Moon className="w-4 h-4 ml-2" />
                    تاریک
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                حساب کاربری
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">حذف حساب</Label>
                  <p className="text-xs text-muted-foreground">
                    حذف دائمی حساب کاربری
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}