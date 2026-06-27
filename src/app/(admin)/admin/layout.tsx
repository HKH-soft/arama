import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user has admin permissions
  try {
    const user = await requirePermission("users:read"); // Basic admin permission
    
    // If user doesn't have admin role, redirect
    const hasAdminRole = user.roles.some(
      (role: string) => role === "ADMIN" || role === "SUPER_ADMIN"
    );
    
    if (!hasAdminRole) {
      redirect("/dashboard");
    }
  } catch (error) {
    // If not authenticated, redirect to login
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-muted">
      {/* Sidebar would go here */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}