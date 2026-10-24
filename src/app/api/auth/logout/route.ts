import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("arama-user");

    return NextResponse.json({
      success: true,
      message: "با موفقیت از حساب کاربری خارج شدید.",
    });
  } catch (error) {
    console.error("[LogoutError]", error);
    return NextResponse.json(
      { error: "خطایی در فرآیند خروج از حساب رخ داد." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
