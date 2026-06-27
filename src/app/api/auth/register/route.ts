import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth-helpers-no-auth";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  users,
  userRoles,
  roles,
  subscriptions,
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and } from 'drizzle-orm'; // Import Drizzle operators
import { sendVerificationEmail } from "@/lib/email";
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";
import { randomUUID } from 'crypto';

const registerSchema = z.object({
  name: z.string().min(1, "نام الزامی است").max(100),
  email: z.string().email("فرمت ایمیل نامعتبر است").max(255),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
  phone: z.string().max(20).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clientInfo = getClientInfo(request);
    
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, email, password, phone } = parsed.data;
    
    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "کاربری با این ایمیل قبلاً ثبت نام کرده است" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Start transaction - create user, assign default role, and create free subscription
    const newUserResult = await db.insert(users).values({
      id: randomUUID(),
      name,
      email,
      passwordHash: hashedPassword,
      phone,
      isActive: true,
      emailVerified: null, // User needs to verify email
    }).returning();
    
    const newUser = newUserResult[0];
    
    // Assign default USER role
    const userRole = await db.select()
      .from(roles)
      .where(eq(roles.name, "USER"));
    
    if (userRole.length > 0) {
      await db.insert(userRoles).values({
        id: randomUUID(),
        userId: newUser.id,
        roleId: userRole[0].id,
      });
    }
    
    // Create FREE subscription
    const freePlan = await db.select()
      .from(subscriptionPlans)
      .where(and(
        eq(subscriptionPlans.name, "FREE"),
        eq(subscriptionPlans.isActive, true)
      ));
    
    if (freePlan.length > 0) {
      await db.insert(subscriptions).values({
        id: randomUUID(),
        userId: newUser.id,
        planId: freePlan[0].id,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + freePlan[0].durationDays * 24 * 60 * 60 * 1000),
      });
    }
    
    // Send verification email
    await sendVerificationEmail(newUser.id, email);
    
    // Log audit
    await logAudit({
      userId: newUser.id,
      action: "USER_REGISTERED",
      entity: "user",
      entityId: newUser.id,
      metadata: { email },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json({
      message: "ثبت نام با موفقیت انجام شد. لطفاً ایمیل خود را برای تأیید بررسی کنید.",
      userId: newUser.id,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "خطا در ثبت نام", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}