import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.userId))
      .orderBy(desc(conversations.updatedAt));
    const result = await Promise.all(
      rows.map(async (conversation) => {
        const [last] = await db
          .select({ content: messages.content, createdAt: messages.createdAt })
          .from(messages)
          .where(eq(messages.conversationId, conversation.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);
        return {
          ...conversation,
          lastMessage: last?.content ?? null,
          lastMessageAt: last?.createdAt ?? null,
        };
      }),
    );
    return NextResponse.json({ conversations: result });
  } catch {
    return NextResponse.json(
      { error: "تاریخچهٔ گفتگوها فعلاً در دسترس نیست." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id)
      return NextResponse.json(
        { error: "شناسهٔ گفتگو لازم است." },
        { status: 400 },
      );
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db
      .delete(conversations)
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.userId, user.userId),
        ),
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "حذف گفتگو انجام نشد." },
      { status: 500 },
    );
  }
}
