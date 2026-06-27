"use client";

import { useState, useEffect } from "react";
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
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: ""
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  // Simulate fetching user data
  useEffect(() => {
    const fetchUserData = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setUserData({
          id: "user1",
          name: "سروش احمدی",
          email: "ahmadi@example.com",
          phone: "09123456789",
          bio: "کاربر فعال سیستم آراما",
          avatarUrl: null,
          createdAt: "2024-01-15",
          lastLoginAt: "2024-06-22"
        });
        
        setFormData({
          name: "سروش احمدی",
          email: "ahmadi@example.com",
          phone: "09123456789",
          bio: "کاربر فعال سیستم آراما"
        });
        
        setLoading(false);
      }, 800);
    };
    
    fetchUserData();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    // In a real app, this would be an API call
    console.log("Saving profile:", formData);
    setUserData((prev: any) => ({
      ...prev,
      ...formData
    }));
    setEditing(false);
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">پروفایل کاربری</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            مدیریت اطلاعات حساب کاربری
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userData?.avatarUrl || ""} alt="Profile" />
                <AvatarFallback>
                  {userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('') : 'SA'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="mt-4">
              {loading ? <Skeleton className="h-6 w-32 mx-auto" /> : userData?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">عضویت از</span>
                <span className="text-sm font-medium">
                  {loading ?
                    <Skeleton className="h-4 w-24" /> :
                    new Date(userData?.createdAt).toLocaleDateString('fa-IR')
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">آخرین ورود</span>
                <span className="text-sm font-medium">
                  {loading ?
                    <Skeleton className="h-4 w-24" /> :
                    new Date(userData?.lastLoginAt).toLocaleDateString('fa-IR')
                  }
                </span>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">وضعیت اشتراک</span>
                <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  فعال
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>جزئیات پروفایل</CardTitle>
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
            ) : (
              <div className="space-y-6">
                {!editing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">نام کامل</Label>
                        <p className="font-medium">{formData.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">ایمیل</Label>
                        <p className="font-medium">{formData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">تلفن</Label>
                        <p className="font-medium">{formData.phone || 'ثبت نشده'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <Label className="text-sm text-muted-foreground">بیو</Label>
                        <p className="font-medium">{formData.bio || 'توضیحاتی ثبت نشده است'}</p>
                      </div>
                    </div>
                    
                    <Button onClick={() => setEditing(true)} className="w-full sm:w-auto">
                      <Edit className="w-4 h-4 ml-2" />
                      ویرایش پروفایل
                    </Button>
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
                        dir="rtl"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">بیو</Label>
                      <Input
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        dir="rtl"
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
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone,
                            bio: userData.bio
                          });
                        }}
                        className="w-full sm:w-auto"
                      >
                        انصراف
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            امنیت
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">تغییر رمز عبور</h3>
                <p className="text-sm text-muted-foreground">برای امنیت بیشتر رمز عبور خود را تغییر دهید</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                {showPasswordFields ? <EyeOff className="w-4 h-4 ml-2" /> : <Eye className="w-4 h-4 ml-2" />}
                {showPasswordFields ? "مخفی کردن" : "تغییر رمز"}
              </Button>
            </div>
            
            {showPasswordFields && (
              <div className="p-4 border border-border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentPassword">رمز فعلی</Label>
                    <Input id="currentPassword" type="password" dir="ltr" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">رمز جدید</Label>
                    <Input id="newPassword" type="password" dir="ltr" />
                  </div>
                  <div>
                    <Label htmlFor="confirmNewPassword">تکرار رمز جدید</Label>
                    <Input id="confirmNewPassword" type="password" dir="ltr" />
                  </div>
                </div>
                <Button>ذخیره رمز جدید</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}