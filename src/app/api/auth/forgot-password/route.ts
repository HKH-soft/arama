import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  users,
  passwordResetTokens
} from "@/db/schema"; // Import Drizzle tables
import { eq, and } from 'drizzle-orm';
import { sendPasswordResetEmail } from "@/lib/email";
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";
import { randomUUID } from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
});

export async function POST(request: NextRequest) {
  try {
    const clientInfo = getClientInfo(request);
    
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { email } = parsed.data;
    
    // Find user
    const userResult = await db.select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.isDeleted, false)
      ));
      
    const user = userResult[0];
    
    if (!user) {
      // Don't reveal if email exists to prevent enumeration attacks
      return NextResponse.json({ 
        message: "اگر ایمیل شما در سیستم موجود باشد، ایمیل بازیابی رمز عبور برای شما ارسال خواهد شد" 
      });
    }
    
    // Generate reset token
    const token = randomUUID();
    
    // Create password reset token record
    await db.insert(passwordResetTokens).values({
      id: randomUUID(),
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Token expires in 15 minutes
    });
    
    // Send reset email with the generated token
    await sendPasswordResetEmail(user.id, email, token);
    
    // Log audit
    await logAudit({
      action: "PASSWORD_RESET_REQUESTED",
      entity: "user",
      entityId: user.id,
      metadata: { email },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json({ 
      message: "اگر ایمیل شما در سیستم موجود باشد، ایمیل بازیابی رمز عبور برای شما ارسال خواهد شد" 
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "خطا در درخواست بازیابی رمز عبور", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}