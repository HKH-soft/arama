"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  User,
  Activity,
  Clock,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Key,
  Mail,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/audit-logs?limit=100");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      (log.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user?.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.includes(searchTerm),
  );

  // Function to get icon based on action
  const getActionIcon = (action: string) => {
    switch (action) {
      case "LOGIN_SUCCESS":
      case "LOGOUT":
        return <User className="w-4 h-4" />;
      case "SUBSCRIPTION_CREATED":
      case "SUBSCRIPTION_RENEWED":
      case "SUBSCRIPTION_CANCELLED":
        return <Shield className="w-4 h-4" />;
      case "USER_UPDATED":
      case "USER_CREATED":
        return <User className="w-4 h-4" />;
      case "PASSWORD_CHANGED":
        return <Key className="w-4 h-4" />;
      case "EMAIL_VERIFIED":
        return <Mail className="w-4 h-4" />;
      case "FAILED_LOGIN":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Function to get badge variant based on action
  const getActionVariant = (action: string) => {
    if (action.includes("SUCCESS")) return "default";
    if (action.includes("FAILED")) return "destructive";
    if (action.includes("LOGIN")) return "default";
    if (action.includes("SUBSCRIPTION")) return "secondary";
    if (action.includes("USER")) return "outline";
    return "secondary";
  };

  // Function to format metadata for display
  const formatMetadata = (metadata: any) => {
    if (!metadata) return "-";
    if (typeof metadata === "object") {
      return Object.entries(metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }
    return String(metadata);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            لاگ‌های حسابرسی
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            مشاهده تمام فعالیت‌های سیستم
          </p>
        </div>
        {/* <Button variant="outline">
          <Filter className="w-4 h-4 ml-2" />
          فیلتر
        </Button> */}
      </div>

      <Card>
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>لیست لاگ‌ها</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="جستجوی لاگ..."
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
                <TableHead>کاربر</TableHead>
                <TableHead>عملیات</TableHead>
                <TableHead>موجودیت</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>زمان</TableHead>
                <TableHead>جزئیات</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 ml-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {log.user?.name || "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.user?.email || "-"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="ml-2">
                          {getActionIcon(log.action)}
                        </span>
                        <Badge variant={getActionVariant(log.action) as any}>
                          {log.action}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Monitor className="w-4 h-4 ml-2 text-muted-foreground" />
                        {log.entity} {log.entityId ? `(${log.entityId})` : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-mono text-xs">
                          {log.ipAddress}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 ml-2 text-muted-foreground" />
                        {new Date(
                          log.timestamp || log.createdAt,
                        ).toLocaleString("fa-IR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="max-w-xs truncate"
                        title={formatMetadata(log.metadata)}
                      >
                        {formatMetadata(log.metadata)}
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
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    لاگی یافت نشد
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
