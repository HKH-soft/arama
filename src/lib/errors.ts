import { NextResponse } from "next/server";

export class UnauthorizedError extends Error {
  status = 401 as const;
  constructor(msg = "احراز هویت الزامی است") {
    super(msg);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  status = 403 as const;
  constructor(msg = "دسترسی ممنوع است") {
    super(msg);
    this.name = "ForbiddenError";
  }
}

export function isAuthError(err: unknown): err is UnauthorizedError | ForbiddenError {
  return err instanceof UnauthorizedError || err instanceof ForbiddenError;
}

export function handleApiError(err: unknown) {
  if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("Unhandled API error:", err);
  return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
}
