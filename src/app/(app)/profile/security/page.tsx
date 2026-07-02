"use client";

import { useState } from "react";
import {
  Shield,
  Key,
  Activity,
  Clock,
  Monitor,
  Globe,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SecurityPage() {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const activeSessions = [
    {
      id: "session1",
      device: "Chrome on Windows",
      location: "تهران، ایران",
      ip: "192.168.1.100",
      lastActivity: "همین الان",
      isActive: true,
      isCurrent: true,
    },
    {
      id: "session2",
      device: "Firefox on Linux",
      location: "تهران، ایران",
      ip: "192.168.1.101",
      lastActivity: "۲ ساعت پیش",
      isActive: true,
      isCurrent: false,
    },
    {
      id: "session3",
      device: "Safari on iPhone",
      location: "تهران، ایران",
      ip: "192.168.1.102",
      lastActivity: "۱ روز پیش",
      isActive: false,
      isCurrent: false,
    },
  ];

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be an API call
    console.log("Changing password:", {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowPasswordFields(false);
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">امنیت حساب</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          مدیریت رمز عبور و نشست‌های فعال
        </p>
      </div>

      <div className="grid gap-6">
        {/* Change Password Card */}
        <Card id="password">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              تغییر رمز عبور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">رمز عبور</h3>
                  <p className="text-sm text-muted-foreground">
                    رمز عبور فعلی ایمن است
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                  {showPasswordFields ? (
                    <EyeOff className="w-4 h-4 ml-2" />
                  ) : (
                    <Eye className="w-4 h-4 ml-2" />
                  )}
                  {showPasswordFields ? "مخفی کردن" : "تغییر رمز"}
                </Button>
              </div>

              {showPasswordFields && (
                <form
                  onSubmit={handlePasswordChange}
                  className="p-4 border border-border rounded-lg space-y-4"
                >
                  <div>
                    <Label htmlFor="currentPassword">رمز فعلی</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">رمز جدید</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmNewPassword">تکرار رمز جدید</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>

                  <Button type="submit">ذخیره رمز جدید</Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions Card */}
        <Card id="sessions">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              نشست‌های فعال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {session.isCurrent ? (
                        <Monitor className="w-5 h-5 text-primary" />
                      ) : (
                        <Globe className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{session.device}</h4>
                      <p className="text-sm text-muted-foreground">
                        {session.location} • {session.ip}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        آخرین فعالیت: {session.lastActivity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.isCurrent && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        نشست فعلی
                      </span>
                    )}
                    {session.isActive ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        فعال
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        غیرفعال
                      </span>
                    )}
                    {!session.isCurrent && (
                      <Button variant="outline" size="sm">
                        <LogOut className="w-4 h-4 ml-2" />
                        خروج
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Recommendations Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              توصیه‌های امنیتی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>رمز عبور فعلی ایمن است</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>احراز هویت دو مرحله‌ای فعال نیست (توصیه می‌شود)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>هیچ فعالیت مشکوکی شناسایی نشده است</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
