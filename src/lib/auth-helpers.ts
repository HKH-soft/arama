import { auth } from "./auth";
import { getUserByEmail, getUserById, hashPassword } from "./auth-helpers-no-auth";
import { NextRequest, NextResponse } from "next/server";
import { hasPermission as checkPermission, getUserRoles, getUserPermissions } from "./rbac";

export { getUserByEmail, getUserById, hashPassword };

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }
  const user = await getUserByEmail(session.user.email);
  if (!user) return null;

  const [roles, permissions] = await Promise.all([
    getUserRoles(user.id),
    getUserPermissions(user.id),
  ]);

  return {
    ...user,
    isActive: user.isActive ?? true,
    roles,
    permissions,
  };
}

export async function requireAuth(request?: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.email) {
    throw new Error("احراز هویت الزامی: کاربر وارد نشده است");
  }
  
  const user = await getUserByEmail(session.user.email);
  
  if (!user) {
    throw new Error("کاربر یافت نشد: حساب کاربری احراز هویت شده وجود ندارد");
  }
  
  return user;
}

export async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("احراز هویت الزامی: کاربر وارد نشده است");
  }
  
  const user = await getUserByEmail(session.user.email);
  if (!user) {
    throw new Error("کاربر یافت نشد: حساب کاربری احراز هویت شده وجود ندارد");
  }
  
  const permitted = await checkPermission(user.id, permission);
  if (!permitted) {
    throw new Error(`دسترسی ممنوع: کاربر مجوز لازم '${permission}' را ندارد`);
  }
  
  const roles = await getUserRoles(user.id);
  
  return {
    ...user,
    roles,
  };
}