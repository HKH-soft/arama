"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

// Mock data for demonstration
const mockPlans = [
  {
    id: "1",
    name: "FREE",
    displayName: "رایگان",
    description: "دسترسی پایه به امکانات آراما",
    price: 0,
    durationDays: 0,
    features: ["۵ گفتگو در روز", "تمرینات پایه", "مدیتیشن‌های عمومی"],
    maxConversations: 5,
    maxMessagesPerDay: 50,
    isActive: true,
    sortOrder: 0,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "MONTHLY",
    displayName: "ماهانه",
    description: "اشتراک یک ماهه آراما",
    price: 149000,
    durationDays: 30,
    features: [
      "گفتگوهای نامحدود",
      "تمام تمرینات",
      "تمام مدیتیشن‌ها",
      "گزارش‌های تحلیلی",
      "پشتیبانی اولویت‌دار",
    ],
    maxConversations: null,
    maxMessagesPerDay: null,
    isActive: true,
    sortOrder: 1,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    name: "YEARLY",
    displayName: "سالانه",
    description: "اشتراک یک ساله آراما — ۴۰٪ تخفیف",
    price: 1070000,
    durationDays: 365,
    features: [
      "تمام امکانات ماهانه",
      "۴۰٪ تخفیف",
      "دسترسی زودهنگام به ویژگی‌های جدید",
      "مشاوره رایگان ماهانه",
    ],
    maxConversations: null,
    maxMessagesPerDay: null,
    isActive: true,
    sortOrder: 2,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "4",
    name: "PROFESSIONAL",
    displayName: "حرفه‌ای",
    description: "برای روانشناسان و مشاوران",
    price: 499000,
    durationDays: 30,
    features: [
      "تمام امکانات سالانه",
      "پنل مدیریت بیماران",
      "API اختصاصی",
      "گزارش‌های تخصصی",
      "پشتیبانی ۲۴/۷",
      "برندینگ سفارشی",
    ],
    maxConversations: null,
    maxMessagesPerDay: null,
    isActive: true,
    sortOrder: 3,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

export default function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setPlans(mockPlans);
        setLoading(false);
      }, 800);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            مدیریت پلن‌های اشتراک
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            ایجاد، ویرایش و مدیریت پلن‌های اشتراک
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              افزودن پلن
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>ایجاد پلن اشتراک جدید</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">نام پلن</Label>
                  <Input id="name" placeholder="نام انگلیسی پلن" />
                </div>
                <div>
                  <Label htmlFor="displayName">عنوان نمایشی</Label>
                  <Input id="displayName" placeholder="عنوان فارسی پلن" />
                </div>
              </div>

              <div>
                <Label htmlFor="description">توضیحات</Label>
                <Input id="description" placeholder="توضیحات پلن" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">قیمت (تومان)</Label>
                  <Input id="price" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="durationDays">مدت زمان (روز)</Label>
                  <Input id="durationDays" type="number" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxConversations">
                    حداکثر گفتگوها (روزانه)
                  </Label>
                  <Input id="maxConversations" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="maxMessagesPerDay">
                    حداکثر پیام‌ها (روزانه)
                  </Label>
                  <Input id="maxMessagesPerDay" type="number" placeholder="0" />
                </div>
              </div>

              <div>
                <Label htmlFor="features">امکانات (هر خط یک مورد)</Label>
                <textarea
                  id="features"
                  placeholder="هر خط یک ویژگی پلن را وارد کنید"
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground min-h-25"
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch id="isActive" />
                <Label htmlFor="isActive">فعال</Label>
              </div>

              <Button className="w-full">ایجاد پلن</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="border-b border-border/50">
          <CardTitle>لیست پلن‌های اشتراک</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead>قیمت</TableHead>
                <TableHead>مدت</TableHead>
                <TableHead>امکانات</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : plans.length > 0 ? (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.displayName}</TableCell>
                    <TableCell>
                      {plan.price === 0 ? (
                        <Badge variant="secondary">رایگان</Badge>
                      ) : (
                        `${plan.price.toLocaleString()} تومان`
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.durationDays === 0
                        ? "نامحدود"
                        : `${plan.durationDays} روز`}
                    </TableCell>
                    <TableCell>
                      <div
                        className="max-w-xs truncate"
                        title={plan.features.join(", ")}
                      >
                        {plan.features.join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {plan.isActive ? (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          فعال
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          غیرفعال
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 ml-2" />
                            مشاهده جزئیات
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 ml-2" />
                            ویرایش
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    پلنی یافت نشد
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
