import { auth } from "./auth";
import { headers } from "next/headers";
import { getUserByEmail, getUserById, hashPassword } from "./auth-helpers-no-auth";

export { getUserByEmail, getUserById, hashPassword };

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return null;
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) return null;

    // Get role from session (Better-Auth admin plugin stores role on user)
    const role = (session.user as { role?: string }).role || "user";
    const roles = role.split(",").filter(Boolean);

    return {
      ...user,
      isActive: user.isActive ?? true,
      roles,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    throw new Error("احراز هویت الزامی: کاربر وارد نشده است");
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    throw new Error("کاربر یافت نشد: حساب کاربری احراز هویت شده وجود ندارد");
  }

  // Get role from session (Better-Auth admin plugin stores role on user)
  const role = (session.user as { role?: string }).role || "user";
  const roles = role.split(",").filter(Boolean);

  // Check if user has admin role (which grants all permissions)
  const isAdmin = roles.some((r) => r === "admin" || r === "super_admin");
  if (!isAdmin) {
    throw new Error(`دسترسی ممنوع: کاربر مجوز لازم '${permission}' را ندارد`);
  }

  return {
    ...user,
    roles,
  };
}
