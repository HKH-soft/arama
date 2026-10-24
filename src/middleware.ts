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

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  "default_dev_secret_only_for_local_dev_123456";

async function verifySessionEdge(token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [userId, signature] = parts;
  
  const encoder = new TextEncoder();
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(userId));
    const expectedArray = Array.from(new Uint8Array(expectedBuffer));
    const expectedHex = expectedArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return signature === expectedHex;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieValue = request.cookies.get("arama-user")?.value;
  
  let isAuthenticated = false;
  if (cookieValue) {
    isAuthenticated = await verifySessionEdge(cookieValue);
  }

  const isProtected = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isAuthPage =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/");

  // If they have an invalid cookie (it's present but failed verification), clear it.
  const needsCookieClear = cookieValue && !isAuthenticated;

  // Send already-authenticated users away from the login page.
  if (isAuthPage && isAuthenticated) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  // Send unauthenticated users away from protected pages.
  if (isProtected && !isAuthenticated) {
    const url = new URL("/login", request.url);
    const res = NextResponse.redirect(url);
    if (needsCookieClear) {
      res.cookies.delete("arama-user");
    }
    return res;
  }

  // Next.js App Router CSP
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://integrate.api.nvidia.com https://images.unsplash.com;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://integrate.api.nvidia.com https://openrouter.ai;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  if (needsCookieClear) {
    response.cookies.delete("arama-user");
  }
  
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
