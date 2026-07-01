"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Receipt,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function BillingHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/payments/history");
        if (!res.ok) {
          const errorData = await res.json();
          console.error("API error:", errorData);
          setPayments([]);
          return;
        }
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          setPayments(data.data);
        } else if (Array.isArray(data)) {
          setPayments(data);
        } else {
          setPayments([]);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge variant="default">
            <CheckCircle className="w-3 h-3 mr-1" />
            موفق
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            ناموفق
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary">
            <AlertTriangle className="w-3 h-3 mr-1" />
            در انتظار
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">تاریخچه صورتحساب</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          مشاهده تاریخچه پرداخت‌ها و فاکتورها
        </p>
      </div>

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
          {loading ? (
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
                      <TableCell className="font-mono">{payment.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 ml-1 text-muted-foreground" />
                          {payment.amount.toLocaleString()} {payment.currency}
                        </div>
                      </TableCell>
                      <TableCell>{payment.subscription?.plan.displayName || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.gatewayName}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 ml-1 text-muted-foreground" />
                          {new Date(payment.createdAt).toLocaleDateString('fa-IR')}
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      تراکنشی یافت نشد
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">کل پرداختی</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ?
                <Skeleton className="h-6 w-24" /> :
                `${payments.filter(p => p.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0).toLocaleString()} تومان`
              }
            </div>
            <div className="text-xs mt-1 text-green-500">
              {loading ?
                <Skeleton className="h-3 w-16" /> :
                `در ${payments.filter(p => p.status === "SUCCESS").length} تراکنش`
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">تراکنش موفق</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 text-green-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ?
                <Skeleton className="h-6 w-16" /> :
                payments.filter(p => p.status === "SUCCESS").length
              }
            </div>
            <p className="text-xs mt-1 text-green-500">موفقیت آمیز</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">تراکنش ناموفق</CardTitle>
            <div className="p-2 rounded-lg bg-red-100 text-red-700">
              <XCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ?
                <Skeleton className="h-6 w-16" /> :
                payments.filter(p => p.status === "FAILED").length
              }
            </div>
            <p className="text-xs mt-1 text-red-500">ناموفق</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}