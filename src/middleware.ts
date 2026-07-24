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

  // Send already-authenticated users away from the login page.
  if (isAuthPage && isAuthenticated) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  // Next.js App Router CSP
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://integrate.api.nvidia.com;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://integrate.api.nvidia.com https://openrouter.ai;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
