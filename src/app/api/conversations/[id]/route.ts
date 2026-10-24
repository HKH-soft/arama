import { and, asc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "شناسه گفتگو الزامی است." },
        { status: 400 },
      );
    }

    // Ensure the conversation belongs to the authenticated user
    const [conv] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.userId, user.userId),
        ),
      )
      .limit(1);

    if (!conv) {
      return NextResponse.json(
        { error: "گفتگو یافت نشد." },
        { status: 404 },
      );
    }

    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json({ messages: rows });
  } catch (error) {
    console.error("[Conversation Detail API Error]", error);
    return NextResponse.json(
      { error: "پیام‌های گفتگو بارگذاری نشدند." },
      { status: 503 },
    );
  }
}
