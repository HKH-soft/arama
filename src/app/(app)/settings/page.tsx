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
  Wallet,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
    price: number;
    durationDays: number;
    features: string[];
  };
  status: string;
  startDate: number;
  endDate: number;
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
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
      <div className="bg-linear-to-b from-primary/25 via-card/40 to-card px-6 pt-6 pb-4 ">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">تنظیمات</h1>
            <p className="text-muted-foreground mt-1 text-sm">تنظیمات برنامه</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6">
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

          {/* Current Plan Display */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="w-5 h-5" />
                پلن فعلی شما
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">پلن:</span>
                    <Badge variant="default">
                      {subscription.plan.displayName}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      وضعیت:
                    </span>
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      فعال
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">مبلغ:</span>
                    <span className="text-sm font-medium">
                      {subscription.plan.price === 0
                        ? "رایگان"
                        : `${subscription.plan.price.toLocaleString()} تومان`}
                    </span>
                  </div>
                  <Link href="/profile" passHref>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <User className="w-4 h-4 ml-2" />
                      مدیریت اشتراک در پروفایل
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">پلن:</span>
                    <Badge variant="outline">رایگان</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    برای دسترسی به امکانات پیشرفته، یکی از پلن‌های پولی را
                    انتخاب کنید
                  </p>
                  <Link href="/profile" passHref>
                    <Button variant="outline" size="sm" className="w-full">
                      <Wallet className="w-4 h-4 ml-2" />
                      مشاهده پلن‌ها
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
