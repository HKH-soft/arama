import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  users
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";

const updateAvatarSchema = z.object({
  avatarUrl: z.string().url("آدرس تصویر نامعتبر است"),
});

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const clientInfo = getClientInfo(request);
    
    const body = await request.json();
    const parsed = updateAvatarSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { avatarUrl } = parsed.data;
    
    // Update user avatar
    const updatedUserResult = await db.update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id))
      .returning();
    
    const updatedUser = updatedUserResult[0];
    
    // Log audit
    await logAudit({
      userId: currentUser.id,
      action: "AVATAR_UPDATED",
      entity: "user",
      entityId: currentUser.id,
      metadata: { avatarUrl },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json({ avatarUrl: updatedUser.avatarUrl });
  } catch (err) {
    console.error("Update avatar error:", err);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی تصویر پروفایل", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}