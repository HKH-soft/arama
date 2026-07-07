"use client";

import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
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
import { Textarea } from "@/components/ui/textarea";
import {
  roleDefinitions,
  roleDisplayNames,
  roleDescriptions,
} from "@/lib/permissions";

export default function AdminRolesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const roles = Object.entries(roleDefinitions).map(([name, definition]) => ({
    id: name,
    name,
    displayName: roleDisplayNames[name] || name,
    description: roleDescriptions[name] || "",
    permissions: definition.permissions,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت نقش‌ها</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            ایجاد، ویرایش و مدیریت نقش‌های سیستم
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              افزودن نقش
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>ایجاد نقش جدید</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">نام نقش</Label>
                  <Input id="name" placeholder="نام انگلیسی نقش" />
                </div>
                <div>
                  <Label htmlFor="displayName">عنوان نمایشی</Label>
                  <Input id="displayName" placeholder="عنوان فارسی نقش" />
                </div>
              </div>

              <div>
                <Label htmlFor="description">توضیحات</Label>
                <Textarea id="description" placeholder="توضیحات نقش" />
              </div>

              <div>
                <Label>مجوزهای نقش</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {Object.values(roleDefinitions)
                    .flatMap((role) => role.permissions)
                    .map((perm) => (
                      <div key={perm} className="flex items-center">
                        <input type="checkbox" id={perm} className="mr-2" />
                        <label htmlFor={perm}>{perm}</label>
                      </div>
                    ))}
                </div>
              </div>

              <Button className="w-full">ایجاد نقش</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="border-b border-border/50">
          <CardTitle>لیست نقش‌های سیستم</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead>توضیحات</TableHead>
                <TableHead>مجوزها</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.displayName}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {role.permissions.slice(0, 3).map((perm: string) => (
                        <Badge key={perm} variant="secondary" className="mr-1 mb-1">
                          {perm}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="mr-1 mb-1">
                          +{role.permissions.length - 3}
                        </Badge>
                      )}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
