import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "arama_admin";

function adminPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD?.trim();
  if (!pwd) {
    return "Im@njani8507";
  }
  return pwd;
}

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  if (!secret) {
    return "arama-admin-session-secret-key-2026";
  }
  return secret;
}

export function createAdminToken(): string {
  return createHmac("sha256", sessionSecret()).update(adminPassword()).digest("hex");
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const expected = createAdminToken();
    const received = Buffer.from(token);
    const target = Buffer.from(expected);
    if (received.length !== target.length) return false;
    return timingSafeEqual(received, target);
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  try {
    const expected = Buffer.from(adminPassword());
    const received = Buffer.from(candidate ?? "");
    if (expected.length !== received.length) return false;
    return timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export function unauthorized() {
  return NextResponse.json(
    { error: "دسترسی غیرمجاز. لطفاً ابتدا وارد پنل مدیریت شوید." },
    { status: 401 }
  );
}
