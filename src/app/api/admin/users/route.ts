import { desc, eq, ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, subscriptions, conversations, payments } from "@/db/schema";
import { isAdminSession, unauthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const isAuthed = await isAdminSession();
  if (!isAuthed) return unauthorized();

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("q")?.trim();

    let usersQuery = db
      .select({
        userId: profiles.userId,
        phone: profiles.phone,
        name: profiles.name,
        email: profiles.email,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .orderBy(desc(profiles.createdAt));

    const usersList = search
      ? await db
          .select({
            userId: profiles.userId,
            phone: profiles.phone,
            name: profiles.name,
            email: profiles.email,
            createdAt: profiles.createdAt,
          })
          .from(profiles)
          .where(or(ilike(profiles.phone, `%${search}%`), ilike(profiles.name, `%${search}%`)))
          .orderBy(desc(profiles.createdAt))
          .limit(50)
      : await usersQuery.limit(50);

    // Get active subscriptions for these users
    const allSubs = await db
      .select({
        userId: subscriptions.userId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        renewsAt: subscriptions.renewsAt,
      })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    const subMap = new Map<string, (typeof allSubs)[0]>();
    for (const sub of allSubs) {
      subMap.set(sub.userId, sub);
    }

    const enhanced = usersList.map((u) => {
      const activeSub = subMap.get(u.userId);
      return {
        ...u,
        hasSubscription: !!activeSub,
        subscriptionPlan: activeSub?.planId || null,
        renewsAt: activeSub?.renewsAt || null,
      };
    });

    return NextResponse.json({ ok: true, users: enhanced });
  } catch (error) {
    console.error("[Admin Users GET Error]:", error);
    return NextResponse.json({ error: "خطا در واکشی فهرست کاربران." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isAuthed = await isAdminSession();
  if (!isAuthed) return unauthorized();

  try {
    const body = (await request.json()) as {
      userId?: string;
      planId?: string; // "1-month" | "3-month" | "1-year"
      action?: "grant_subscription" | "revoke_subscription";
    };

    const { userId, planId = "1-month", action = "grant_subscription" } = body;

    if (!userId) {
      return NextResponse.json({ error: "شناسه کاربر الزامی است." }, { status: 400 });
    }

    if (action === "grant_subscription") {
      const days = planId === "1-year" ? 365 : planId === "3-month" ? 90 : 30;
      const now = new Date();
      const renewsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const amount = planId === "1-year" ? 990000 : planId === "3-month" ? 819000 : 335000;

      // Upsert subscription
      await db.insert(subscriptions).values({
        userId,
        planId,
        amount,
        status: "active",
        interval: planId === "1-year" ? "yearly" : planId === "3-month" ? "quarterly" : "monthly",
        startedAt: now,
        renewsAt,
      });

      return NextResponse.json({
        ok: true,
        message: `اشتراک ${days} روزه با موفقیت به کاربر اعطا گردید.`,
      });
    }

    if (action === "revoke_subscription") {
      await db
        .update(subscriptions)
        .set({ status: "canceled" })
        .where(eq(subscriptions.userId, userId));

      return NextResponse.json({ ok: true, message: "اشتراک کاربر لغو گردید." });
    }

    return NextResponse.json({ error: "عملیات نامعتبر است." }, { status: 400 });
  } catch (error) {
    console.error("[Admin Users POST Error]:", error);
    return NextResponse.json({ error: "خطا در اعمال تغییرات کاربر." }, { status: 500 });
  }
}
