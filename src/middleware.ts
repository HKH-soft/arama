import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/chat",
  "/exercises",
  "/meditation",
  "/reports",
  "/session-management",
  "/billing",
  "/profile",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("arama-user");

  const isProtected = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isAuthPage = pathname === "/login" || pathname.startsWith("/login/");

  // Send unauthenticated users away from protected pages.
  if (isProtected && !isAuthenticated) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // Send already-authenticated users away from the login page.
  if (isAuthPage && isAuthenticated) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/exercises/:path*",
    "/meditation/:path*",
    "/reports/:path*",
    "/session-management/:path*",
    "/billing/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login/:path*",
    "/login",
  ],
};
