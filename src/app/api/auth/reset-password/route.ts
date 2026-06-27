import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  users,
  passwordResetTokens
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import * as argon2 from "argon2";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "توکن الزامی است"),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
});

export async function POST(request: NextRequest) {
  try {
    const clientInfo = getClientInfo(request);
    
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { token, password } = parsed.data;
    
    // Find valid reset token
    const tokenResult = await db.select({
      id: passwordResetTokens.id,
      userId: passwordResetTokens.userId,
      expiresAt: passwordResetTokens.expiresAt,
      usedAt: passwordResetTokens.usedAt,
    })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));
    
    const resetToken = tokenResult[0];
    
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "توکن نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }
    
    // Hash new password
    const hashedPassword = await argon2.hash(password);
    
    // Update user password
    await db.update(users)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId));
    
    // Mark token as used
    await db.update(passwordResetTokens)
      .set({
        usedAt: new Date(),
      })
      .where(eq(passwordResetTokens.id, resetToken.id));
    
    // Log audit
    await logAudit({
      action: "PASSWORD_RESET_COMPLETED",
      entity: "user",
      entityId: resetToken.userId,
      metadata: { resetTokenId: resetToken.id },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json({ message: "رمز عبور با موفقیت تغییر کرد" });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "خطا در بازیابی رمز عبور", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}