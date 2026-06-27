import db from "@/lib/db"; // Updated to use Drizzle
import nodemailer from "nodemailer";
import { 
  emailVerificationTokens,
  passwordResetTokens,
  users
} from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Create test transporter for development
// In production, configure with actual email service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@arama.app",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendVerificationEmail(userId: string, email: string): Promise<boolean> {
  try {
    // Generate verification token
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store the token in the database
    await db.insert(emailVerificationTokens).values({
      id: randomUUID(),
      userId,
      token,
      expiresAt,
    });

    // Create verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/${token}`;

    // Send verification email
    return await sendEmail({
      to: email,
      subject: "تایید ایمیل - آراما",
      html: `
        <h2>تایید ایمیل</h2>
        <p>برای تایید ایمیل خود، لطفاً روی لینک زیر کلیک کنید:</p>
        <a href="${verificationLink}">تایید ایمیل</a>
        <p>این لینک پس از 24 ساعت منقضی می‌شود.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(userId: string, email: string): Promise<boolean> {
  try {
    // Generate reset token
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store the token in the database
    await db.insert(passwordResetTokens).values({
      id: randomUUID(),
      userId,
      token,
      expiresAt,
    });

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

    // Send reset email
    return await sendEmail({
      to: email,
      subject: "بازنشانی رمز عبور - آراما",
      html: `
        <h2>بازنشانی رمز عبور</h2>
        <p>برای بازنشانی رمز عبور خود، لطفاً روی لینک زیر کلیک کنید:</p>
        <a href="${resetLink}">بازنشانی رمز عبور</a>
        <p>این لینک پس از 1 ساعت منقضی می‌شود.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}

export async function verifyEmailToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const tokenResult = await db.select({
      id: emailVerificationTokens.id,
      userId: emailVerificationTokens.userId,
      token: emailVerificationTokens.token,
      expiresAt: emailVerificationTokens.expiresAt,
      usedAt: emailVerificationTokens.usedAt,
    })
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token));

    if (tokenResult.length === 0) {
      return null;
    }

    const tokenRecord = tokenResult[0];

    // Check if token is expired
    if (tokenRecord.expiresAt && new Date() > new Date(tokenRecord.expiresAt)) {
      return null;
    }

    // Check if token is already used
    if (tokenRecord.usedAt) {
      return null;
    }

    // Get user email
    const userResult = await db.select({
      email: users.email
    })
    .from(users)
    .where(eq(users.id, tokenRecord.userId));

    if (userResult.length === 0) {
      return null;
    }

    // Mark token as used
    await db.update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, tokenRecord.id));

    return {
      userId: tokenRecord.userId,
      email: userResult[0].email,
    };
  } catch (error) {
    console.error("Error verifying email token:", error);
    return null;
  }
}

export async function verifyPasswordResetToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const tokenResult = await db.select({
      id: passwordResetTokens.id,
      userId: passwordResetTokens.userId,
      token: passwordResetTokens.token,
      expiresAt: passwordResetTokens.expiresAt,
      usedAt: passwordResetTokens.usedAt,
    })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));

    if (tokenResult.length === 0) {
      return null;
    }

    const tokenRecord = tokenResult[0];

    // Check if token is expired
    if (tokenRecord.expiresAt && new Date() > new Date(tokenRecord.expiresAt)) {
      return null;
    }

    // Check if token is already used
    if (tokenRecord.usedAt) {
      return null;
    }

    // Get user email
    const userResult = await db.select({
      email: users.email
    })
    .from(users)
    .where(eq(users.id, tokenRecord.userId));

    if (userResult.length === 0) {
      return null;
    }

    // Mark token as used
    await db.update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    return {
      userId: tokenRecord.userId,
      email: userResult[0].email,
    };
  } catch (error) {
    console.error("Error verifying password reset token:", error);
    return null;
  }
}