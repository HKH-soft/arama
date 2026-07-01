import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname, search } = req.nextUrl;

  const protectedRoutes = [
    "/dashboard",
    "/chat",
    "/analytics",
    "/exercises",
    "/meditation",
    "/reports",
    "/settings",
    "/subscriptions",
    "/profile",
    "/admin",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);

    loginUrl.searchParams.set("callbackUrl", pathname + search);

    return NextResponse.redirect(loginUrl);
  }

  // Also protect API routes (except NextAuth's own auth endpoints)
  if (pathname.startsWith("/api/") && 
      !pathname.startsWith("/api/auth/") && 
      !req.auth) {
    return NextResponse.json(
      { error: "Unauthorized: authentication required" },
      { status: 401 }
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
