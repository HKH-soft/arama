import { asc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));
    return NextResponse.json({ messages: rows });
  } catch {
    return NextResponse.json(
      { error: "پیام‌های گفتگو بارگذاری نشدند." },
      { status: 503 },
    );
  }
}
