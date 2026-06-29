"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  Shield,
  Activity,
  BarChart3,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  changeType: "positive" | "negative";
}

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  changeType,
}: StatCardProps) => (
  <Card className="bg-background/50 backdrop-blur-sm border-border/50">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon className="w-4 h-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p
        className={`text-xs mt-1 ${changeType === "positive" ? "text-green-500" : "text-red-500"}`}
      >
        {change}
      </p>
    </CardContent>
  </Card>
);

const RecentActivityItem = ({
  user,
  action,
  time,
}: {
  user: string;
  action: string;
  time: string;
}) => (
  <div className="flex justify-between py-3 text-sm border-b border-border/50 last:border-0">
    <div className="font-medium text-foreground">{user}</div>
    <div className="text-muted-foreground truncate max-w-30 text-left">
      {action}
    </div>
    <div className="text-muted-foreground/60 text-xs text-right">{time}</div>
  </div>
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);

          // Convert recent users to activities format
          const activities = data.recentUsers.map((u: any, i: number) => ({
            user: u.name,
            action: "ثبت نام جدید",
            time: i === 0 ? "الان" : `${i + 1} روز پیش`,
          }));
          setRecentActivities(activities);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="bg-linear-to-b from-primary/25 via-card/40 to-card px-6 pt-6 pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              پنل مدیریت آراما
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              نمای کلی وضعیت سیستم، آمار کاربران و تراکنش‌ها
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 ml-2" />
              فیلتر
            </Button>
            <Button size="sm">
              <Calendar className="w-4 h-4 ml-2" />
              گزارش‌ها
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="bg-background/50 backdrop-blur-sm border-border/50"
              >
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-20 mt-2" />
                </CardContent>
              </Card>
            ))
          ) : stats ? (
            <>
              <StatCard
                title="کل کاربران"
                value={stats.totalUsers}
                change="+۱۲٪ از ماه گذشته"
                icon={Users}
                changeType="positive"
              />
              <StatCard
                title="درآمد ماه جاری"
                value={stats.monthlyRevenue}
                change="+۸٪ از ماه گذشته"
                icon={DollarSign}
                changeType="positive"
              />
              <StatCard
                title="اشتراک‌های فعال"
                value={stats.activeSubscriptions}
                change="+۱۵٪ از ماه گذشته"
                icon={Shield}
                changeType="positive"
              />
              <StatCard
                title="نرخ موفقیت"
                value={stats.successRate}
                change="+۰.۴٪ از ماه گذشته"
                icon={TrendingUp}
                changeType="positive"
              />
            </>
          ) : null}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>آخرین فعالیت‌های سیستم</span>
                </CardTitle>
                <Badge variant="secondary">جدید</Badge>
              </div>
              <CardDescription>
                آخرین ورودها و عملیات انجام شده توسط کاربران
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between py-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {recentActivities.map((log, idx) => (
                    <RecentActivityItem
                      key={idx}
                      user={log.user}
                      action={log.action}
                      time={log.time}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Expirations */}
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>اشتراک‌های منقضی شونده</span>
                </CardTitle>
                <Badge variant="destructive">
                  {stats?.expiringSubscriptions || "۱۸"}
                </Badge>
              </div>
              <CardDescription>
                کاربرانی که اشتراک آن‌ها در ۷ روز آینده منقضی می‌شود
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between py-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between py-2">
                    <span className="text-foreground font-medium">
                      سروش احمدی
                    </span>
                    <span className="text-muted-foreground">
                      ۲ روز باقی مانده
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-foreground font-medium">
                      مهسا رضایی
                    </span>
                    <span className="text-muted-foreground">
                      ۴ روز باقی مانده
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-foreground font-medium">
                      عرفان کریمی
                    </span>
                    <span className="text-muted-foreground">
                      ۶ روز باقی مانده
                    </span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    مشاهده همه
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Growth Chart */}
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>نمودار رشد کاربران</span>
              </CardTitle>
              <CardDescription>
                آمار ثبت‌نام کاربران در ۳۰ روز گذشته
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/30 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm font-semibold">
                [نمودار رشد کاربران]
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>درآمد ماهانه</span>
              </CardTitle>
              <CardDescription>
                جمع درآمد از فروش اشتراک‌ها در ۶ ماه اخیر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/30 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm font-semibold">
                [نمودار درآمد ماهانه]
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
