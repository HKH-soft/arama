import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  emailVerificationTokens,
  users
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const clientInfo = getClientInfo(request);
    const { token } = await params;

    // Find valid verification token
    const tokenResult = await db.select({
      id: emailVerificationTokens.id,
      userId: emailVerificationTokens.userId,
      expiresAt: emailVerificationTokens.expiresAt,
      usedAt: emailVerificationTokens.usedAt,
    })
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token));
    
    const verificationToken = tokenResult[0];
    
    if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt < new Date()) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=invalid-token`);
    }

    // Update user as verified and token as used in a transaction-like manner
    await db.update(users)
      .set({
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, verificationToken.userId));
    
    await db.update(emailVerificationTokens)
      .set({
        usedAt: new Date(),
      })
      .where(eq(emailVerificationTokens.id, verificationToken.id));

    // Get user info for audit logging
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, verificationToken.userId));
      
    const user = userResult[0];

    // Log audit
    await logAudit({
      userId: user.id,
      action: "EMAIL_VERIFIED",
      entity: "user",
      entityId: user.id,
      metadata: { email: user.email },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email?success=true`);
  } catch (err) {
    console.error("Email verification error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=server-error`);
  }
}