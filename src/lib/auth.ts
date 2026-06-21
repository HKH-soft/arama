import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const COOKIE_NAME = "arama_session";
const JWT_SECRET_RAW = process.env.JWT_SECRET || "arama-dev-secret-change-in-production";
const secret = new TextEncoder().encode(JWT_SECRET_RAW);

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------
export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, 12);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed);
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------
export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers (Server Components / Route Handlers)
// ---------------------------------------------------------------------------
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

// ---------------------------------------------------------------------------
// Get current user from session (for Server Components / Route Handlers)
// ---------------------------------------------------------------------------
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return verifySession(token);
}

// ---------------------------------------------------------------------------
// Get current user from raw cookie string (for middleware / edge runtime)
// ---------------------------------------------------------------------------
export async function verifySessionFromCookie(cookieValue: string): Promise<SessionPayload | null> {
  return verifySession(cookieValue);
}

export { COOKIE_NAME };
