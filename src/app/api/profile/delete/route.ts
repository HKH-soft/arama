import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, conversations, messages, moodEntries, subscriptions, voiceJournals, exerciseCompletions, payments } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function DELETE(request: NextRequest) {
  const userResult = requireUser(request);
  if (userResult instanceof NextResponse) return userResult;

  const { userId } = userResult;

  try {
    await db.delete(moodEntries).where(eq(moodEntries.userId, userId));
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    await db.delete(exerciseCompletions).where(eq(exerciseCompletions.userId, userId));
    await db.delete(payments).where(eq(payments.userId, userId));
    
    // voiceJournals might not exist if it was added recently, let's wrap in try/catch just in case
    try { await db.delete(voiceJournals).where(eq(voiceJournals.userId, userId)); } catch (e) {}
    
    // Get user conversations
    const userConvs = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.userId, userId));
    for (const conv of userConvs) {
      await db.delete(messages).where(eq(messages.conversationId, conv.id));
    }
    await db.delete(conversations).where(eq(conversations.userId, userId));
    
    // Finally delete profile
    await db.delete(profiles).where(eq(profiles.userId, userId));

    // Clear auth cookie
    (await cookies()).delete("arama-user");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DeleteAccount]", error);
    return NextResponse.json({ error: "خطا در حذف اطلاعات کاربری." }, { status: 500 });
  }
}
