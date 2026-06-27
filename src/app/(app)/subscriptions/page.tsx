"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Shield, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Receipt,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionsPage() {
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  
  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      // In a real app, this would be API calls
      setTimeout(() => {
        setActiveSubscription({
          id: "sub1",
          plan: {
            id: "plan2",
            name: "MONTHLY",
            displayName: "ماهانه",
            description: "اشتراک یک ماهه آراما",
            price: 149000,
            durationDays: 30,
            features: ["گفتگوهای نامحدود", "تمام تمرینات", "تمام مدیتیشن‌ها", "گزارش‌های تحلیلی", "پشتیبانی اولویت‌دار"]
          },
          status: "ACTIVE",
          startDate: "2024-06-01",
          endDate: "2024-07-01",
          createdAt: "2024-06-01"
        });
        
        setAvailablePlans([
          {
            id: "plan1",
            name: "FREE",
            displayName: "رایگان",
            description: "دسترسی پایه به امکانات آراما",
            price: 0,
            durationDays: 0,
            features: ["۵ گفتگو در روز", "تمرینات پایه", "مدیتیشن‌های عمومی"],
            maxConversations: 5,
            maxMessagesPerDay: 50
          },
          {
            id: "plan2",
            name: "MONTHLY",
            displayName: "ماهانه",
            description: "اشتراک یک ماهه آراما",
            price: 149000,
            durationDays: 30,
            features: ["گفتگوهای نامحدود", "تمام تمرینات", "تمام مدیتیشن‌ها", "گزارش‌های تحلیلی", "پشتیبانی اولویت‌دار"]
          },
          {
            id: "plan3",
            name: "YEARLY",
            displayName: "سالانه",
            description: "اشتراک یک ساله آراما — ۴۰٪ تخفیف",
            price: 1070000,
            durationDays: 365,
            features: ["تمام امکانات ماهانه", "۴۰٪ تخفیف", "دسترسی زودهنگام به ویژگی‌های جدید", "مشاوره رایگان ماهانه"]
          },
          {
            id: "plan4",
            name: "PROFESSIONAL",
            displayName: "حرفه‌ای",
            description: "برای روانشناسان و مشاوران",
            price: 499000,
            durationDays: 30,
            features: ["تمام امکانات سالانه", "پنل مدیریت بیماران", "API اختصاصی", "گزارش‌های تخصصی", "پشتیبانی ۲۴/۷", "برندینگ سفارشی"]
          }
        ]);
        
        setLoading(false);
      }, 800);
    };
    
    fetchData();
  }, []);
  
  const handleRenew = async () => {
    setRenewing(true);
    // In a real app, this would be an API call
    setTimeout(() => {
      setRenewing(false);
      alert("اشتراک با موفقیت تمدید شد!");
    }, 1000);
  };
  
  const handleSubscribe = async (planId: string) => {
    // In a real app, this would redirect to payment
    console.log(`Subscribing to plan: ${planId}`);
    alert(`در حال انتقال به صفحه پرداخت برای پلن ${availablePlans.find(p => p.id === planId)?.displayName}`);
  };
  
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">اشتراک‌ها</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          مدیریت اشتراک و خرید پلن‌های جدید
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اشتراک فعلی</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>پلن‌های موجود</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Current Subscription Card */}
          {activeSubscription ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    اشتراک فعلی
                  </CardTitle>
                  <Badge variant={activeSubscription.status === "ACTIVE" ? "default" : "destructive"}>
                    {activeSubscription.status === "ACTIVE" ? "فعال" : "منقضی شده"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{activeSubscription.plan.displayName}</h3>
                    <p className="text-muted-foreground">{activeSubscription.plan.description}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>شروع: {new Date(activeSubscription.startDate).toLocaleDateString('fa-IR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>پایان: {new Date(activeSubscription.endDate).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {activeSubscription.plan.price === 0 ? "رایگان" : `${activeSubscription.plan.price.toLocaleString()} تومان`}
                    </div>
                    <Button 
                      onClick={handleRenew} 
                      disabled={renewing}
                      className="mt-2"
                    >
                      {renewing ? (
                        <>
                          <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                          در حال تمدید...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 ml-2" />
                          تمدید اشتراک
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h4 className="font-medium mb-3">امکانات پلن:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeSubscription.plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
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
                  <p className="text-muted-foreground mb-6">برای دسترسی به تمام امکانات، یکی از پلن‌ها را انتخاب کنید</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Plans Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                پلن‌های موجود
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {availablePlans.map((plan) => (
                  <Card key={plan.id} className={`border-2 ${activeSubscription?.plan.id === plan.id ? 'border-primary' : ''}`}>
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-2xl font-bold mb-4">
                        {plan.price === 0 ? "رایگان" : `${plan.price.toLocaleString()} تومان`}
                        {plan.durationDays > 0 && (
                          <span className="text-sm font-normal text-muted-foreground block">
                            / {plan.durationDays === 30 ? "ماه" : plan.durationDays === 365 ? "سال" : `${plan.durationDays} روز`}
                          </span>
                        )}
                      </div>
                      
                      <ul className="text-sm text-left space-y-2 mb-6">
                        {plan.features.slice(0, 4).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-muted-foreground text-xs">
                            +{plan.features.length - 4} ویژگی دیگر
                          </li>
                        )}
                      </ul>
                      
                      <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={activeSubscription?.plan.id === plan.id}
                      >
                        {activeSubscription?.plan.id === plan.id ? "فعال" : "انتخاب پلن"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}