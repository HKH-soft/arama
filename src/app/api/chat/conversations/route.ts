import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { conversations } from "@/db/schema"; // Import Drizzle tables
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";

const createConversationSchema = z.object({
  title: z
    .string()
    .max(200, "عنوان گفتگو نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
    .optional(),
});

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const conversationsResult = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.createdAt));

    return NextResponse.json(conversationsResult);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await _request.json();
    const parsed = createConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
    }

    // Create conversation
    const conversationResult = await db
      .insert(conversations)
      .values({
        id: randomUUID(),
        userId: user.id,
        title: parsed.data.title || "مکالمه جدید",
      })
      .returning();

    return NextResponse.json(conversationResult[0]);
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
