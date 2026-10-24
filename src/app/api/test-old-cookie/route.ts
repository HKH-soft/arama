import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }
  const url = new URL("/dashboard", request.url);
  const response = NextResponse.redirect(url);
  // Set an old-format (pre-HMAC) raw UUID cookie
  response.cookies.set("arama-user", "user-12345678-old-format-uuid", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
