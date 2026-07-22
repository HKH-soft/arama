import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { ensurePlans } from "@/lib/demo-data";

export async function GET() {
  try {
    await ensurePlans();
    const rows = await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(asc(plans.sortOrder));
    return NextResponse.json({ plans: rows });
  } catch {
    return NextResponse.json({ error: "تعرفه‌ها فعلاً در دسترس نیستند." }, { status: 503 });
  }
}
