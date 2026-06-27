"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    name: "سروش احمدی",
    email: "ahmadi@example.com",
    isActive: true,
    isDeleted: false,
    createdAt: "2024-01-15",
    lastLoginAt: "2024-06-20",
    roles: ["USER"]
  },
  {
    id: "2",
    name: "مهسا رضایی",
    email: "rezai@example.com",
    isActive: true,
    isDeleted: false,
    createdAt: "2024-02-20",
    lastLoginAt: "2024-06-21",
    roles: ["USER"]
  },
  {
    id: "3",
    name: "عرفان کریمی",
    email: "karimi@example.com",
    isActive: false,
    isDeleted: false,
    createdAt: "2024-03-10",
    lastLoginAt: "2024-05-15",
    roles: ["USER"]
  },
  {
    id: "4",
    name: "زهرا محمدی",
    email: "mohammadi@example.com",
    isActive: true,
    isDeleted: false,
    createdAt: "2024-01-05",
    lastLoginAt: "2024-06-22",
    roles: ["ADMIN"]
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 800);
    };
    
    fetchData();
  }, []);
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت کاربران</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            مشاهده، ایجاد و مدیریت حساب‌های کاربری
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 ml-2" />
              افزودن کاربر
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>ایجاد کاربر جدید</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">نام کامل</label>
                <Input placeholder="نام کامل کاربر را وارد کنید" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">ایمیل</label>
                <Input type="email" placeholder="آدرس ایمیل کاربر" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">رمز عبور</label>
                <Input type="password" placeholder="رمز عبور کاربر" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">نقش</label>
                <select className="w-full p-2 border border-input rounded-md bg-background text-foreground">
                  <option value="USER">کاربر عادی</option>
                  <option value="ADMIN">مدیر</option>
                </select>
              </div>
              <Button className="w-full">ایجاد کاربر</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>لیست کاربران</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="جستجوی کاربر..."
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
                <TableHead>نام</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>تاریخ عضویت</TableHead>
                <TableHead>آخرین ورود</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.roles.map((role: string) => (
                        <Badge key={role} variant="secondary" className="mr-1">
                          {role === "ADMIN" ? "مدیر" : "کاربر"}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>{user.lastLoginAt || "ثبت نشده"}</TableCell>
                    <TableCell>
                      {user.isActive ? (
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
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    کاربری یافت نشد
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

