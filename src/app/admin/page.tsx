import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import AdminConsole from "./console";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuthed = await isAdminSession();
  if (!isAuthed) {
    redirect("/admin-login");
  }

  return <AdminConsole />;
}
