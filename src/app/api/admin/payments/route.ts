import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, profiles, subscriptions } from "@/db/schema";
import { isAdminSession, unauthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const isAuthed = await isAdminSession();
  if (!isAuthed) return unauthorized();

  try {
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");

    let query = db
      .select({
        id: payments.id,
        userId: payments.userId,
        planId: payments.planId,
        amount: payments.amount,
        status: payments.status,
        authority: payments.authority,
        refId: payments.refId,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .orderBy(desc(payments.createdAt));

    const paymentRows = statusFilter
      ? await db
          .select({
            id: payments.id,
            userId: payments.userId,
            planId: payments.planId,
            amount: payments.amount,
            status: payments.status,
            authority: payments.authority,
            refId: payments.refId,
            createdAt: payments.createdAt,
          })
          .from(payments)
          .where(eq(payments.status, statusFilter))
          .orderBy(desc(payments.createdAt))
          .limit(100)
      : await query.limit(100);

    // Get user phones/names
    const userIds = Array.from(new Set(paymentRows.map((p) => p.userId)));
    const userProfiles = await db
      .select({ userId: profiles.userId, phone: profiles.phone, name: profiles.name })
      .from(profiles);

    const userMap = new Map<string, { phone: string; name: string | null }>();
    for (const p of userProfiles) {
      userMap.set(p.userId, { phone: p.phone, name: p.name });
    }

    const enhanced = paymentRows.map((p) => {
      const u = userMap.get(p.userId);
      return {
        ...p,
        userPhone: u?.phone || "نامشخص",
        userName: u?.name || "کاربر آراما",
      };
    });

    return NextResponse.json({ ok: true, payments: enhanced });
  } catch (error) {
    console.error("[Admin Payments GET Error]:", error);
    return NextResponse.json({ error: "خطا در واکشی اطلاعات تراکنش‌ها." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isAuthed = await isAdminSession();
  if (!isAuthed) return unauthorized();

  try {
    const body = (await request.json()) as {
      paymentId?: string;
      action?: "manual_approve" | "mark_failed";
    };

    const { paymentId, action = "manual_approve" } = body;
    if (!paymentId) {
      return NextResponse.json({ error: "شناسه پرداخت الزامی است." }, { status: 400 });
    }

    const [paymentRecord] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!paymentRecord) {
      return NextResponse.json({ error: "تراکنش پیدا نشد." }, { status: 404 });
    }

    if (action === "manual_approve") {
      const refId = `ADMIN_APPR_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      await db
        .update(payments)
        .set({ status: "paid", refId })
        .where(eq(payments.id, paymentRecord.id));

      const days = paymentRecord.planId === "1-year" ? 365 : paymentRecord.planId === "3-month" ? 90 : 30;
      const now = new Date();
      const renewsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      await db.insert(subscriptions).values({
        userId: paymentRecord.userId,
        planId: paymentRecord.planId,
        amount: paymentRecord.amount,
        status: "active",
        interval: paymentRecord.planId === "1-year" ? "yearly" : paymentRecord.planId === "3-month" ? "quarterly" : "monthly",
        startedAt: now,
        renewsAt,
      });

      return NextResponse.json({
        ok: true,
        message: "تراکنش با موفقیت تأیید شد و اشتراک کاربر بلافاصله فعال گردید.",
      });
    }

    if (action === "mark_failed") {
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.id, paymentRecord.id));

      return NextResponse.json({ ok: true, message: "وضعیت تراکنش به ناموفق تغییر یافت." });
    }

    return NextResponse.json({ error: "عملیات نامعتبر است." }, { status: 400 });
  } catch (error) {
    console.error("[Admin Payments POST Error]:", error);
    return NextResponse.json({ error: "خطا در پردازش تراکنش." }, { status: 500 });
  }
}
