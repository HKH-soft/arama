import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  sessions
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Check if session belongs to user and delete it
    const sessionResult = await db.select()
      .from(sessions)
      .where(and(
        eq(sessions.id, id),
        eq(sessions.userId, user.id)
      ));
      
    if (sessionResult.length === 0) {
      return NextResponse.json(
        { error: "نشست یافت نشد یا متعلق به شما نیست" },
        { status: 404 }
      );
    }
    
    await db.delete(sessions).where(eq(sessions.id, id));
    
    return NextResponse.json({ message: "نشست با موفقیت حذف شد" });
  } catch (err) {
    console.error("Delete session error:", err);
    return NextResponse.json(
      { error: "خطا در حذف نشست", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}