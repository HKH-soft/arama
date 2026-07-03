import db from "./db";
import { auditLogs } from "@/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export interface AuditLog {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAudit(log: AuditLog): Promise<void> {
  try {
    // Get client info asynchronously using the headers function
    let finalIpAddress = log.ipAddress || "unknown";
    let finalUserAgent = log.userAgent || "unknown";
    
    if (!log.ipAddress || !log.userAgent) {
      try {
        const headersList = await headers();
        const ip = (
          headersList.get("x-forwarded-for") ||
          headersList.get("x-real-ip") ||
          headersList.get("x-client-ip") ||
          "unknown"
        ).split(",")[0].trim();
        
        const userAgent = headersList.get("user-agent") || "unknown";
        
        finalIpAddress = log.ipAddress || ip;
        finalUserAgent = log.userAgent || userAgent;
      } catch (error) {
        // If we can't get headers, use values from log or defaults
      }
    }

    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: log.userId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      metadata: log.metadata || {},
      ipAddress: finalIpAddress,
      userAgent: finalUserAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
    // Don't throw error as audit logging shouldn't break the main flow
  }
}

/**
 * Get client IP address from request headers
 */
export async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();
    return (
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      headersList.get("x-client-ip") ||
      "unknown"
    ).split(",")[0].trim();
  } catch (error) {
    return "unknown";
  }
}

/**
 * Get user agent from request headers
 */
export async function getUserAgent(): Promise<string> {
  try {
    const headersList = await headers();
    return headersList.get("user-agent") || "unknown";
  } catch (error) {
    return "unknown";
  }
}

/**
 * Get client info including IP and user agent
 */
export async function getClientInfo(request?: NextRequest) {
  if (request) {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = request.headers.get("x-client-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    const userAgent = request.headers.get("user-agent");

    // Prioritize IPs in this order: x-forwarded-for, x-real-ip, x-client-ip, cf-connecting-ip
    const ip = forwarded?.split(",")[0].trim() || 
               realIp?.trim() || 
               clientIp?.trim() || 
               cfConnectingIp?.trim() || 
               "unknown";

    return {
      ipAddress: ip,
      userAgent: userAgent || "unknown",
    };
  }

  // Fallback to headers when request object is not available
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = headersList.get("x-client-ip");
    const cfConnectingIp = headersList.get("cf-connecting-ip");
    const userAgent = headersList.get("user-agent");

    const ip = forwarded?.split(",")[0].trim() || 
               realIp?.trim() || 
               clientIp?.trim() || 
               cfConnectingIp?.trim() || 
               "unknown";

    return {
      ipAddress: ip,
      userAgent: userAgent || "unknown",
    };
  } catch (error) {
    return {
      ipAddress: "unknown",
      userAgent: "unknown",
    };
  }
}