"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  price: number;
  durationDays: number;
  features: string[] | null;
  maxConversations: number | null;
  maxMessagesPerDay: number | null;
  isActive: boolean;
  sortOrder: number | null;
}

export default function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    price: 0,
    durationDays: 30,
    features: "",
    maxConversations: 0,
    maxMessagesPerDay: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans?limit=100");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.data || []);
      } else {
        toast.error("خطا در دریافت پلن‌ها");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      price: 0,
      durationDays: 30,
      features: "",
      maxConversations: 0,
      maxMessagesPerDay: 0,
      isActive: true,
    });
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const featuresArray = formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: featuresArray,
          maxConversations: formData.maxConversations || null,
          maxMessagesPerDay: formData.maxMessagesPerDay || null,
        }),
      });

      if (res.ok) {
        toast.success("پلن با موفقیت ایجاد شد");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchPlans();
      } else {
        const err = await res.json();
        toast.error(err.error || "خطا در ایجاد پلن");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingPlan) return;
    setSaving(true);
    try {
      const featuresArray = formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName,
          description: formData.description,
          price: formData.price,
          durationDays: formData.durationDays,
          features: featuresArray,
          maxConversations: formData.maxConversations || null,
          maxMessagesPerDay: formData.maxMessagesPerDay || null,
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        toast.success("پلن با موفقیت به‌روزرسانی شد");
        setIsEditDialogOpen(false);
        setEditingPlan(null);
        fetchPlans();
      } else {
        const err = await res.json();
        toast.error(err.error || "خطا در به‌روزرسانی پلن");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`آیا از حذف پلن "${plan.displayName}" اطمینان دارید؟`)) return;

    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("پلن با موفقیت حذف شد");
        fetchPlans();
      } else {
        const err = await res.json();
        toast.error(err.error || "خطا در حذف پلن");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description || "",
      price: plan.price,
      durationDays: plan.durationDays,
      features: (plan.features || []).join("\n"),
      maxConversations: plan.maxConversations || 0,
      maxMessagesPerDay: plan.maxMessagesPerDay || 0,
      isActive: plan.isActive,
    });
    setIsEditDialogOpen(true);
  };

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
              <DialogDescription>
                اطلاعات پلن جدید را وارد کنید
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">نام پلن</Label>
                  <Input
                    id="name"
                    placeholder="نام انگلیسی پلن"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">عنوان نمایشی</Label>
                  <Input
                    id="displayName"
                    placeholder="عنوان فارسی پلن"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">توضیحات</Label>
                <Input
                  id="description"
                  placeholder="توضیحات پلن"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">قیمت (تومان)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="durationDays">مدت زمان (روز)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    placeholder="0"
                    value={formData.durationDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationDays: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxConversations">
                    حداکثر گفتگوها (روزانه)
                  </Label>
                  <Input
                    id="maxConversations"
                    type="number"
                    placeholder="0"
                    value={formData.maxConversations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxConversations: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxMessagesPerDay">
                    حداکثر پیام‌ها (روزانه)
                  </Label>
                  <Input
                    id="maxMessagesPerDay"
                    type="number"
                    placeholder="0"
                    value={formData.maxMessagesPerDay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxMessagesPerDay: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="features">امکانات (هر خط یک مورد)</Label>
                <textarea
                  id="features"
                  placeholder="هر خط یک ویژگی پلن را وارد کنید"
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground min-h-25"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">فعال</Label>
              </div>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? "در حال ایجاد..." : "ایجاد پلن"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ویرایش پلن</DialogTitle>
            <DialogDescription>اطلاعات پلن را ویرایش کنید</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">نام پلن</Label>
                <Input
                  id="edit-name"
                  placeholder="نام انگلیسی پلن"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="edit-displayName">عنوان نمایشی</Label>
                <Input
                  id="edit-displayName"
                  placeholder="عنوان فارسی پلن"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">توضیحات</Label>
              <Input
                id="edit-description"
                placeholder="توضیحات پلن"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">قیمت (تومان)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-durationDays">مدت زمان (روز)</Label>
                <Input
                  id="edit-durationDays"
                  type="number"
                  placeholder="0"
                  value={formData.durationDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationDays: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-maxConversations">
                  حداکثر گفتگوها (روزانه)
                </Label>
                <Input
                  id="edit-maxConversations"
                  type="number"
                  placeholder="0"
                  value={formData.maxConversations}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxConversations: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-maxMessagesPerDay">
                  حداکثر پیام‌ها (روزانه)
                </Label>
                <Input
                  id="edit-maxMessagesPerDay"
                  type="number"
                  placeholder="0"
                  value={formData.maxMessagesPerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxMessagesPerDay: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-features">امکانات (هر خط یک مورد)</Label>
              <textarea
                id="edit-features"
                placeholder="هر خط یک ویژگی پلن را وارد کنید"
                className="w-full p-2 border border-input rounded-md bg-background text-foreground min-h-25"
                value={formData.features}
                onChange={(e) =>
                  setFormData({ ...formData, features: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="edit-isActive">فعال</Label>
            </div>

            <Button className="w-full" onClick={handleUpdate} disabled={saving}>
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                        title={(plan.features || []).join(", ")}
                      >
                        {(plan.features || []).join(", ")}
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
                          <DropdownMenuItem
                            onClick={() => openEditDialog(plan)}
                          >
                            <Edit className="w-4 h-4 ml-2" />
                            ویرایش
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(plan)}
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
