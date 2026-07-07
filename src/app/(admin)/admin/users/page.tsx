"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  role?: string;
  createdAt: number | null;
  lastLoginAt: number | null;
  isActive: boolean;
  isDeleted: boolean;
  phone: string | null;
  bio: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
    bio: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users?limit=100");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      } else {
        toast.error("خطا در دریافت کاربران");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      phone: "",
      bio: "",
      isActive: true,
    });
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("کاربر با موفقیت ایجاد شد");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || "خطا در ایجاد کاربر");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
          phone: formData.phone || undefined,
          bio: formData.bio || undefined,
        }),
      });

      if (res.ok) {
        toast.success("کاربر با موفقیت به‌روزرسانی شد");
        setIsEditDialogOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || "خطا در به‌روزرسانی کاربر");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`آیا از حذف کاربر "${user.name}" اطمینان دارید؟`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("کاربر با موفقیت حذف شد");
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || "خطا در حذف کاربر");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role || "user",
      phone: user.phone || "",
      bio: user.bio || "",
      isActive: user.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
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
          <DialogContent className="max-w-md" aria-describedby="create-user-desc">
            <DialogHeader>
              <DialogTitle>ایجاد کاربر جدید</DialogTitle>
              <DialogDescription id="create-user-desc">
                اطلاعات کاربر جدید را وارد کنید
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">نام کامل</label>
                <Input
                  placeholder="نام کامل کاربر را وارد کنید"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">ایمیل</label>
                <Input
                  type="email"
                  placeholder="آدرس ایمیل کاربر"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">رمز عبور</label>
                <Input
                  type="password"
                  placeholder="رمز عبور کاربر"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">نقش</label>
                <select
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">کاربر عادی</option>
                  <option value="admin">مدیر</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">تلفن</label>
                <Input
                  placeholder="شماره تلفن (اختیاری)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={saving}>
                {saving ? "در حال ایجاد..." : "ایجاد کاربر"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="edit-user-desc">
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
            <DialogDescription id="edit-user-desc">
              اطلاعات کاربر را ویرایش کنید
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">نام کامل</label>
              <Input
                placeholder="نام کامل کاربر"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">ایمیل</label>
              <Input
                type="email"
                placeholder="آدرس ایمیل"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">نقش</label>
              <select
                className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user">کاربر عادی</option>
                <option value="admin">مدیر</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">تلفن</label>
              <Input
                placeholder="شماره تلفن"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">بیو</label>
              <Input
                placeholder="بیو (اختیاری)"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-input"
              />
              <label htmlFor="edit-isActive" className="text-sm font-medium text-foreground">
                کاربر فعال است
              </label>
            </div>
            <Button className="w-full" onClick={handleUpdate} disabled={saving}>
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>لیست کاربران</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="جستجوی کاربر..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <UserPlus className="w-4 h-4 ml-2" />
                افزودن کاربر
              </Button>
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
                <TableHead>تلفن</TableHead>
                <TableHead>بیو</TableHead>
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
                      {(user.roles || [user.role || "user"]).map((role: string) => (
                        <Badge key={role} variant={role === "admin" ? "default" : "secondary"} className="mr-1">
                          {role === "admin" ? "مدیر" : role === "super_admin" ? "مدیر ارشد" : "کاربر"}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      {user.phone || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={user.bio || ""}>
                        {user.bio || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("fa-IR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString("fa-IR")
                        : "ثبت نشده"}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="w-4 h-4 ml-2" />
                            ویرایش
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(user)}
                          >
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
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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