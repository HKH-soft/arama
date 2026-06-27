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
    throw new Error("Unauthorized");
  }
  
  const user = await getUserByEmail(session.user.email);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

export async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  
  const user = await getUserByEmail(session.user.email);
  if (!user) {
    throw new Error("User not found");
  }
  
  const permitted = await checkPermission(user.id, permission);
  if (!permitted) {
    throw new Error("Forbidden");
  }
  
  const roles = await getUserRoles(user.id);
  
  return {
    ...user,
    roles,
  };
}