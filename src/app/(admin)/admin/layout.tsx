import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth-helpers";
import { AdminLayoutClient } from "@/components/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user has admin permissions
  let user: any;
  try {
    user = await requirePermission("users:read"); // Basic admin permission

    // If user doesn't have admin role, redirect
    const hasAdminRole = (user.roles ?? []).some(
      (role: string) => role.toLowerCase() === "admin" || role.toLowerCase() === "super_admin"
    );

    if (!hasAdminRole) {
      redirect("/dashboard");
    }
  } catch (error) {
    // If not authenticated, redirect to login
    redirect("/login");
  }

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  );
}
