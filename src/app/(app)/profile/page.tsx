"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  Shield,
  Key,
  Eye,
  EyeOff,
  CreditCard,
  Wallet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Receipt,
  Download,
  Activity,
  Trash2,
  Camera,
  Monitor,
  LogOut,
  Globe,
  Link,
  Moon,
  Sun,
  Palette,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: number;
  lastLoginAt: number;
  isActive: boolean;
  subscription: {
    plan: {
      displayName: string;
      price: number;
      durationDays: number;
      features: string[];
    };
    status: string;
    startDate: number;
    endDate: number;
  } | null;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  gatewayName: string;
  description: string;
  createdAt: number;
  paidAt: number | null;
  subscription: {
    plan: {
      displayName: string;
    };
  };
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

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { updateUser } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [activeSessions, setActiveSessions] = useState<
    {
      id: string;
      device: string;
      location: string;
      ip: string;
      lastActivity: string;
      isActive: boolean;
      isCurrent: boolean;
    }[]
  >([]);
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
          });
          if (data.avatarUrl) {
            setAvatarPreview(data.avatarUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast({ title: "خطا در بارگذاری پروفایل", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [toast]);

  // Fetch payments history
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments/history");
        if (res.ok) {
          const data = await res.json();
          const paymentsData =
            data.data && Array.isArray(data.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];
          setPayments(paymentsData);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setPaymentsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (res.ok) {
          const data = await res.json();
          const plansData =
            data.data && Array.isArray(data.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];
          setAvailablePlans(plansData);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Fetch active sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/profile/sessions");
        if (res.ok) {
          const data = await res.json();
          setActiveSessions(data);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };
    fetchSessions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setUserData((prev) => (prev ? { ...prev, ...updated } : null));
        updateUser(updated);
        setEditing(false);
        toast({ title: "پروفایل با موفقیت ذخیره شد" });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast({ title: "خطا در ذخیره تغییرات", variant: "destructive" });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUserData((prev) =>
          prev ? { ...prev, avatarUrl: data.avatarUrl } : null,
        );
        updateUser({ avatarUrl: data.avatarUrl });
        toast({ title: "تصویر پروفایل با موفقیت آپلود شد" });
      } else {
        const error = await res.json();
        toast({ title: error.error || "خطا در آپلود", variant: "destructive" });
        setAvatarPreview(userData?.avatarUrl || null);
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast({ title: "خطا در اتصال به سرور", variant: "destructive" });
      setAvatarPreview(userData?.avatarUrl || null);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const res = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });
      if (res.ok) {
        setAvatarPreview(null);
        setUserData((prev) => (prev ? { ...prev, avatarUrl: null } : null));
        updateUser({ avatarUrl: null });
        toast({ title: "تصویر پروفایل حذف شد" });
      }
    } catch (err) {
      console.error("Error deleting avatar:", err);
      toast({ title: "خطا در حذف تصویر", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({ title: "رمز عبور الزامی است", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (res.ok) {
        toast({ title: "حساب کاربری حذف شد" });
        window.location.href = "/login";
      } else {
        const error = await res.json();
        toast({
          title: error.error || "خطا در حذف حساب",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      toast({ title: "خطا در اتصال به سرور", variant: "destructive" });
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/profile/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        toast({ title: "نشست حذف شد" });
        setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        const error = await res.json();
        toast({
          title: error.error || "خطا در حذف نشست",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error revoking session:", err);
      toast({ title: "خطا در اتصال به سرور", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            موفق
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            ناموفق
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            در انتظار
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Sessions are now fetched from /api/profile/sessions

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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">پروفایل کاربری</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            مدیریت اطلاعات حساب کاربری، اشتراک و تاریخچه پرداخت‌ها
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="gap-2">
            امنیت
            <Shield className="w-4 h-4" />
          </TabsTrigger>

          <TabsTrigger value="billing" className="gap-2">
            صورتحساب
            <CreditCard className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            اشتراک
            <Wallet className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            پروفایل
            <User className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-3" dir="rtl">
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <div className="relative mx-auto group w-24 h-24">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={avatarPreview || undefined}
                      alt="Profile"
                    />
                    <AvatarFallback>
                      {loading ? (
                        <Skeleton className="h-6 w-6 rounded-full" />
                      ) : userData?.name ? (
                        userData.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                      ) : (
                        "SA"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-0 left-0 -m-2 w-8 h-8 rounded-full p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {avatarPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`mt-5 mx-auto text-destructive`}
                    onClick={handleDeleteAvatar}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    حذف تصویر
                  </Button>
                )}
                <CardTitle className={`${avatarPreview ? "mt-2" : "mt-7"}`}>
                  {loading ? (
                    <Skeleton className="h-6 w-32 mx-auto" />
                  ) : (
                    userData?.name
                  )}
                </CardTitle>
                {userData?.subscription ? (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                    {userData.subscription.plan.displayName}
                  </span>
                ) : (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full mt-1 inline-block">
                    رایگان
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      عضویت از
                    </span>
                    <span className="text-sm font-medium">
                      {loading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : userData?.createdAt ? (
                        new Date(userData.createdAt).toLocaleDateString("fa-IR")
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      آخرین ورود
                    </span>
                    <span className="text-sm font-medium">
                      {loading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : userData?.lastLoginAt ? (
                        new Date(userData.lastLoginAt).toLocaleDateString(
                          "fa-IR",
                        )
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      وضعیت اشتراک
                    </span>
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {userData?.subscription?.status === "ACTIVE"
                        ? "فعال"
                        : "رایگان"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>جزئیات پروفایل</CardTitle>
                  {!editing && !loading && (
                    <Button onClick={() => setEditing(true)}>
                      <Edit className="w-4 h-4 ml-2" />
                      ویرایش
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                ) : !editing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          نام کامل
                        </Label>
                        <p className="font-medium">
                          {formData.name || "ثبت نشده"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          ایمیل
                        </Label>
                        <p className="font-medium">
                          {formData.email || "ثبت نشده"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          تلفن
                        </Label>
                        <p className="font-medium">
                          {formData.phone || "ثبت نشده"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">نام کامل</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">ایمیل</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">تلفن</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        dir="ltr"
                        className="text-left"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="w-full sm:w-auto">
                        <Save className="w-4 h-4 ml-2" />
                        ذخیره تغییرات
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: userData?.name || "",
                            email: userData?.email || "",
                            phone: userData?.phone || "",
                          });
                        }}
                        className="w-full sm:w-auto"
                      >
                        انصراف
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Appearance */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  ظاهر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="pt-2">
                  <div className="flex flex-col gap-2">
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
            {/* Notifications */}
            <Card className="md:col-span-2">
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
          </div>
        </TabsContent>

        {/* SUBSCRIPTION TAB */}
        <TabsContent value="subscription" className="space-y-6 mt-6 ">
          {userData?.subscription ? (
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    اشتراک فعلی
                  </CardTitle>
                  <Badge
                    variant={
                      userData.subscription.status === "ACTIVE"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {userData.subscription.status === "ACTIVE"
                      ? "فعال"
                      : "منقضی شده"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {userData.subscription.plan.displayName}
                    </h3>
                    <p className="text-muted-foreground">
                      {userData.subscription.plan.price === 0
                        ? "پلن رایگان"
                        : `اشتراک ${userData.subscription.plan.durationDays} روزه`}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          شروع:{" "}
                          {userData.subscription.startDate
                            ? new Date(
                                userData.subscription.startDate,
                              ).toLocaleDateString("fa-IR")
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          پایان:{" "}
                          {userData.subscription.endDate
                            ? new Date(
                                userData.subscription.endDate,
                              ).toLocaleDateString("fa-IR")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {userData.subscription.plan.price === 0
                        ? "رایگان"
                        : `${userData.subscription.plan.price.toLocaleString()} تومان`}
                    </div>
                  </div>
                </div>
                <Separator className="my-6" />
                <div>
                  <h4 className="font-medium mb-3">امکانات پلن:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {userData.subscription.plan.features.map(
                      (feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  اشتراک فعلی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">اشتراکی ندارید</h3>
                  <p className="text-muted-foreground mb-6">
                    برای دسترسی به تمام امکانات، یکی از پلن‌ها را انتخاب کنید
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                پلن‌های موجود
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-64" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {availablePlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`border-2 h-full flex flex-col ${userData?.subscription?.plan.displayName === plan.displayName ? "border-primary" : ""}`}
                    >
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg">
                          {plan.displayName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {plan.description || ""}
                        </p>
                      </CardHeader>
                      <CardContent className="text-center flex-1 flex flex-col">
                        <div className="text-2xl font-bold mb-4">
                          {plan.price === 0
                            ? "رایگان"
                            : `${plan.price.toLocaleString()} تومان`}
                          {plan.durationDays > 0 && (
                            <span className="text-sm font-normal text-muted-foreground block">
                              /{" "}
                              {plan.durationDays === 30
                                ? "ماه"
                                : plan.durationDays === 365
                                  ? "سال"
                                  : `${plan.durationDays} روز`}
                            </span>
                          )}
                        </div>
                        <ul className="text-sm text-right space-y-2 mb-6 flex-1">
                          {(plan.features || [])
                            .slice(0, 4)
                            .map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          {(plan.features || []).length > 4 && (
                            <li className="text-muted-foreground text-xs">
                              +{(plan.features || []).length - 4} ویژگی دیگر
                            </li>
                          )}
                        </ul>
                        <Button
                          className="w-full mt-auto"
                          onClick={() =>
                            (window.location.href = "/api/payments/create")
                          }
                          disabled={
                            userData?.subscription?.plan.displayName ===
                            plan.displayName
                          }
                        >
                          {userData?.subscription?.plan.displayName ===
                          plan.displayName
                            ? "فعال"
                            : "انتخاب پلن"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING TAB */}
        <TabsContent value="billing" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>تراکنش‌های مالی</CardTitle>
                <Button>
                  <Download className="w-4 h-4 ml-2" />
                  دانلود گزارش
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {paymentsLoading ? (
                <div className="p-6">
                  <Skeleton className="h-80 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>شناسه</TableHead>
                      <TableHead>مبلغ</TableHead>
                      <TableHead>پلن</TableHead>
                      <TableHead>درگاه</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-xs">
                            {payment.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 ml-1 text-muted-foreground" />
                              {payment.amount.toLocaleString()}{" "}
                              {payment.currency || "تومان"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {payment.subscription?.plan.displayName || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.gatewayName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 ml-1 text-muted-foreground" />
                              {new Date(payment.createdAt).toLocaleDateString(
                                "fa-IR",
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Receipt className="w-4 h-4 ml-2" />
                              مشاهده
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          تراکنشی یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  کل پرداختی
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentsLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    `${payments
                      .filter((p) => p.status === "SUCCESS")
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()} تومان`
                  )}
                </div>
                <div className="text-xs mt-1 text-green-500">
                  {paymentsLoading ? (
                    <Skeleton className="h-3 w-16" />
                  ) : (
                    `در ${payments.filter((p) => p.status === "SUCCESS").length} تراکنش`
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  تراکنش موفق
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-100 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentsLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    payments.filter((p) => p.status === "SUCCESS").length
                  )}
                </div>
                <p className="text-xs mt-1 text-green-500">موفقیت آمیز</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  تراکنش ناموفق
                </CardTitle>
                <div className="p-2 rounded-lg bg-red-100 text-red-700">
                  <XCircle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentsLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    payments.filter((p) => p.status === "FAILED").length
                  )}
                </div>
                <p className="text-xs mt-1 text-red-500">ناموفق</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card dir="rtl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                امنیت حساب کاربری
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
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
                        <Label htmlFor="confirmNewPassword">
                          تکرار رمز جدید
                        </Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                          dir="ltr"
                          required
                        />
                      </div>

                      <Button type="submit">ذخیره رمز جدید</Button>
                    </form>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 py-3">
                <Activity className="w-5 h-5" />
                نشست‌های فعال
              </div>

              <div>
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-4 md:flex-row md:gap-0 items-center justify-between p-4 border border-border rounded-lg"
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                          >
                            <LogOut className="w-4 h-4 ml-2" />
                            خروج
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-destructive">حذف حساب</h3>
                  <p className="text-sm text-muted-foreground">
                    حذف دائمی حساب کاربری
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  حذف حساب
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
          dir="rtl"
        >
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-bold mb-4">تأیید حذف حساب</h3>
            <p className="text-sm text-muted-foreground mb-4">
              برای حذف حساب کاربری خود، رمز عبور خود را وارد کنید.
            </p>
            <Input
              type="password"
              placeholder="رمز عبور"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(false)}
              >
                انصراف
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
              >
                حذف حساب
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
