import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/about",
  "/contact",
  "/blog",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/robots.txt",
  "/sitemap.xml",
];

// API paths that don't require authentication
const publicApiPaths = ["/api/auth", "/api/plans", "/api/blog"];

// Generate CSP with nonce for security
function generateCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", // Next.js requires unsafe-inline for styles
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", generateCSP(nonce));
    response.headers.set("x-nonce", nonce);
    return response;
  }

  // Allow public API paths
  if (publicApiPaths.some((path) => pathname.startsWith(path))) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", generateCSP(nonce));
    response.headers.set("x-nonce", nonce);
    return response;
  }

  // Allow static files and Next.js internal paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname === "/"
  ) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", generateCSP(nonce));
    response.headers.set("x-nonce", nonce);
    return response;
  }

  // Allow robots.txt and sitemap
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", generateCSP(nonce));
    response.headers.set("x-nonce", nonce);
    return response;
  }

  // Check authentication using Better-Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    // Redirect to login for protected routes
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Content-Security-Policy", generateCSP(nonce));
    response.headers.set("x-nonce", nonce);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", generateCSP(nonce));
  response.headers.set("x-nonce", nonce);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (image files)
     * - public/ (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
