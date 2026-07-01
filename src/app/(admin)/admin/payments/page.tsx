"use client";

import { useState, useEffect } from "react";
import { 
  Search,
  MoreHorizontal, 
  Eye,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/payments?limit=100");
        if (res.ok) {
          const data = await res.json();
          setPayments(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching admin payments:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const filteredPayments = payments.filter(payment => 
    (payment.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.includes(searchTerm)
  );
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت پرداخت‌ها</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            مشاهده و مدیریت تراکنش‌های مالی
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>لیست پرداخت‌ها</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="جستجوی پرداخت..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شناسه</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>درگاه</TableHead>
                <TableHead>پلن</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono">{payment.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 ml-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{payment.user?.name || "-"}</div>
                          <div className="text-xs text-muted-foreground">{payment.user?.email || "-"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 ml-1 text-muted-foreground" />
                        {payment.amount.toLocaleString()} {payment.currency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.gatewayName}</Badge>
                    </TableCell>
                    <TableCell>{payment.plan?.displayName || payment.subscription?.plan?.displayName || "-"}</TableCell>
                    <TableCell>
                      {payment.status === "SUCCESS" ? (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          موفق
                        </Badge>
                      ) : payment.status === "FAILED" ? (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          ناموفق
                        </Badge>
                      ) : payment.status === "PENDING" ? (
                        <Badge variant="secondary">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          در انتظار
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {payment.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 ml-1 text-muted-foreground" />
                        {new Date(payment.createdAt).toLocaleDateString('fa-IR')}
                      </div>
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    پرداختی یافت نشد
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