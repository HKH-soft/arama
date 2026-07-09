import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators/contact";
import { sendEmail } from "@/lib/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@arama.app";
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Simple in-memory rate limit
const submissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = submissions.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  submissions.set(ip, recent);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) return true;
  recent.push(now);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید." },
        { status: 429 },
      );
    }

    const body = await request.json();

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "اطلاعات وارد شده معتبر نیست" },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = result.data;

    const html = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 8px;">
          پیام جدید از فرم تماس
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 120px;">نام:</td>
            <td style="padding: 8px 12px; color: #333;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">ایمیل:</td>
            <td style="padding: 8px 12px; color: #333;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">موضوع:</td>
            <td style="padding: 8px 12px; color: #333;">${subject}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; border-right: 4px solid #6366f1;">
          <p style="font-weight: bold; color: #555; margin-top: 0;">پیام:</p>
          <p style="color: #333; line-height: 1.8; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 16px;">
          این پیام از فرم تماس وب‌سایت ارسال شده است.
        </p>
      </div>
    `;

    const sent = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[Arama] ${subject} - ${name}`,
      html,
      text: `پیام جدید از ${name} (${email}):\nموضوع: ${subject}\n\n${message}`,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "خطا در ارسال پیام. لطفاً دوباره تلاش کنید." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "پیام شما با موفقیت ارسال شد.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "خطای سرور. لطفاً دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
