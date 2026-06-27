import { headers } from "next/headers";
import { logAudit } from "@/lib/audit";

// Simple in-memory store for rate limiting (use Redis in production)
const attempts = new Map<string, { count: number; timestamp: number }>();

export interface RateLimitResult {
  blocked: boolean;
  remaining: number;
  resetTime: number;
}

export function isLoginBlocked(ip: string, email: string): RateLimitResult {
  const key = `${ip}:${email}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  const attempt = attempts.get(key);
  
  if (!attempt) {
    // First attempt
    attempts.set(key, { count: 1, timestamp: now });
    return { blocked: false, remaining: 4, resetTime: now + windowMs };
  }
  
  // Check if window has passed
  if (now - attempt.timestamp > windowMs) {
    attempts.set(key, { count: 1, timestamp: now });
    return { blocked: false, remaining: 4, resetTime: now + windowMs };
  }
  
  // Increment count
  attempt.count++;
  attempts.set(key, attempt);
  
  // Check if blocked
  const blocked = attempt.count > 5; // Allow 5 attempts
  const remaining = Math.max(0, 5 - attempt.count);
  const resetTime = attempt.timestamp + windowMs;
  
  if (blocked) {
    logAudit({
      action: "RATE_LIMIT_EXCEEDED",
      entity: "auth",
      metadata: { ip, email, attempts: attempt.count },
      ipAddress: ip,
    });
  }
  
  return { blocked, remaining, resetTime };
}