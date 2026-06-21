import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "arama_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "arama-dev-secret-change-in-production",
);

// Routes that require an authenticated session
const PROTECTED_PREFIXES = ["/dashboard", "/chat", "/analytics", "/meditation", "/exercises", "/reports", "/settings"];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/signup"];

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protected routes: redirect to /login if no session ─────────────────────
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const authenticated = await hasValidSession(request);
    if (!authenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Auth routes: redirect to /dashboard if already logged in ───────────────
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r);

  if (isAuthRoute) {
    const authenticated = await hasValidSession(request);
    if (authenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/analytics/:path*",
    "/meditation/:path*",
    "/exercises/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
