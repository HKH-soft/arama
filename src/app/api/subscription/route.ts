import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plans, subscriptions, payments } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { ensurePlans } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const [row] = await db
      .select({ subscription: subscriptions, plan: plans })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.userId, user.userId))
      .limit(1);

    const paymentRows = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, user.userId))
      .orderBy(desc(payments.createdAt));

    return NextResponse.json({
      subscription: row ?? null,
      payments: paymentRows,
    });
  } catch {
    return NextResponse.json(
      { error: "اطلاعات اشتراک فعلاً در دسترس نیست." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const { action } = (await request.json()) as {
      action?: string;
    };

    if (action === "cancel") {
      await db
        .update(subscriptions)
        .set({ status: "canceled" })
        .where(eq(subscriptions.userId, user.userId));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "درخواست نامعتبر است." },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "تغییر اشتراک انجام نشد." },
      { status: 500 },
    );
  }
}
