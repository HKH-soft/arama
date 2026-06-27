import db from "@/lib/db";
import { auditLogs } from "../db/schema";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  metadata,
  ipAddress,
  userAgent,
}: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: userId || null,
      action,
      entity: entity || null,
      entityId: entityId || null,
      metadata: metadata || {},
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  } catch (error) {
    console.error("Error logging audit:", error);
    // Don't throw error as audit logging shouldn't break main functionality
  }
}

export async function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  entity?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    // Implementation would go here
    return [];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
}

export function getClientInfo(request?: NextRequest) {
  // Extract IP address
  let ipAddress = request?.headers.get('x-forwarded-for') ||
                 request?.headers.get('x-real-ip') ||
                 request?.headers.get('x-client-ip') ||
                 request?.headers.get('cf-connecting-ip') ||
                 'Unknown';

  // Handle array of IPs from x-forwarded-for
  if (ipAddress && typeof ipAddress === 'string') {
    ipAddress = ipAddress.split(',')[0].trim();
  }

  // Get user agent
  const userAgent = request?.headers.get('user-agent') || 'Unknown';

  return {
    ipAddress: ipAddress as string,
    userAgent: userAgent as string,
  };
}