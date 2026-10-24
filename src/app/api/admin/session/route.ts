import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkPassword,
  createAdminToken,
  isAdminSession,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuthed = await isAdminSession();
  return NextResponse.json({ authenticated: isAuthed });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { password?: string };
    const password = body.password?.trim() || "";

    if (!password) {
      return NextResponse.json({ error: "رمز عبور مدیریت الزامی است." }, { status: 400 });
    }

    if (!checkPassword(password)) {
      return NextResponse.json({ error: "رمز عبور مدیریت نادرست است." }, { status: 401 });
    }

    const token = createAdminToken();
    const response = NextResponse.json({
      ok: true,
      message: "ورود به مرکز فرماندهی آراما با موفقیت انجام شد.",
    });

    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Admin Session Error]:", error);
    return NextResponse.json({ error: "خطا در برقراری ارتباط با سرور." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, message: "خروج با موفقیت انجام شد." });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
