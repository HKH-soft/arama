import { auth } from "./auth";
import { headers } from "next/headers";
import { getUserByEmail, getUserById, hashPassword } from "./auth-helpers-no-auth";

export { getUserByEmail, getUserById, hashPassword };

function normalizeRoles(role?: string | null) {
  return (role ?? "user")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

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

    const sessionRole = (session.user as { role?: string }).role;
    const persistedRole = (user as { role?: string }).role;
    const roles = normalizeRoles(sessionRole ?? persistedRole);

    return {
      ...user,
      isActive: user.isActive ?? true,
      roles,
    };
  } catch (error) {
    // During Next.js build, headers() throws a "Dynamic server usage" error
    // to detect which routes need dynamic rendering. This is expected, not a bug.
    // Check both the message and digest properties since the format varies.
    if (
      error instanceof Error &&
      (error.message?.includes("Dynamic server usage") ||
        (error as any).digest === "DYNAMIC_SERVER_USAGE")
    ) {
      // Re-throw so Next.js correctly marks the route as dynamic
      throw error;
    }
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
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("احراز هویت الزامی: کاربر وارد نشده است");
  }

  const roles = currentUser.roles ?? [];

  // Check if user has admin role (which grants all permissions)
  const isAdmin = roles.some((r) => r === "admin" || r === "super_admin");
  if (!isAdmin) {
    throw new Error(`دسترسی ممنوع: کاربر مجوز لازم '${permission}' را ندارد`);
  }

  return {
    ...currentUser,
    roles,
  };
}
