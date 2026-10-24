import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  conversations,
  exercises,
  meditationTracks,
  messages,
  moodEntries,
  payments,
  plans,
  profiles,
  subscriptions,
} from "@/db/schema";
import { isAdminSession, unauthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuthed = await isAdminSession();
  if (!isAuthed) return unauthorized();

  try {
    // 1. Total users
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(profiles);

    // 2. Subscriptions
    const [activeSubs] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    // 3. Revenue from paid payments
    const [revData] = await db
      .select({ totalRevenue: sql<number>`coalesce(sum(amount), 0)::int` })
      .from(payments)
      .where(eq(payments.status, "paid"));

    // 4. Conversations and messages
    const [convCount] = await db.select({ count: sql<number>`count(*)::int` }).from(conversations);
    const [msgCount] = await db.select({ count: sql<number>`count(*)::int` }).from(messages);

    // 5. Mood entries
    const [moodCount] = await db.select({ count: sql<number>`count(*)::int` }).from(moodEntries);

    // 6. Content library items
    const [tracksCount] = await db.select({ count: sql<number>`count(*)::int` }).from(meditationTracks);
    const [exercisesCount] = await db.select({ count: sql<number>`count(*)::int` }).from(exercises);

    // 7. Recent 5 users
    const recentUsers = await db
      .select({
        userId: profiles.userId,
        phone: profiles.phone,
        name: profiles.name,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .orderBy(desc(profiles.createdAt))
      .limit(6);

    // 8. Recent 6 payments
    const recentPayments = await db
      .select({
        id: payments.id,
        userId: payments.userId,
        planId: payments.planId,
        amount: payments.amount,
        status: payments.status,
        refId: payments.refId,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .orderBy(desc(payments.createdAt))
      .limit(6);

    // 9. Mood sentiment distribution
    const moodDistribution = await db
      .select({
        mood: moodEntries.mood,
        count: sql<number>`count(*)::int`,
      })
      .from(moodEntries)
      .groupBy(moodEntries.mood);

    return NextResponse.json({
      ok: true,
      stats: {
        totalUsers: userCount?.count || 0,
        activeSubscriptions: activeSubs?.count || 0,
        totalRevenue: revData?.totalRevenue || 0,
        totalConversations: convCount?.count || 0,
        totalMessages: msgCount?.count || 0,
        totalMoodEntries: moodCount?.count || 0,
        meditationTracks: tracksCount?.count || 0,
        exercisesCount: exercisesCount?.count || 0,
      },
      recentUsers,
      recentPayments,
      moodDistribution,
      system: {
        nodeEnv: process.env.NODE_ENV || "development",
        cartbecartConfigured: !!process.env.CARTBECART_API_KEY,
        smsConfigured: !!(process.env.MELLIPAYAMAK_USERNAME || process.env.MELIPAYAMAK_USERNAME),
        aiConfigured: !!process.env.AI_API_KEY,
      },
    });
  } catch (error) {
    console.error("[Admin Overview Error]:", error);
    return NextResponse.json({ error: "خطا در واکشی اطلاعات داشبورد مدیریت." }, { status: 500 });
  }
}
