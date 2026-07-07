import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logAudit, getClientInfo } from "@/lib/audit";

/**
 * GET /api/profile
 * Returns the current user's profile data including subscription info.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        image: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch current subscription (no relations defined in schema, so manual join)
    const subscription = await db.query.subscriptions.findFirst({
      where: (subscriptions, { and, eq }) =>
        and(
          eq(subscriptions.userId, session.user.id),
          eq(subscriptions.status, "ACTIVE"),
        ),
    });

    // Fetch plan separately
    let planData = null;
    if (subscription) {
      planData = await db.query.subscriptionPlans.findFirst({
        where: (plans, { eq }) => eq(plans.id, subscription.planId),
      });
    }

    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || user.image || null,
      role: user.role || "user",
      isActive: user.isActive,
      createdAt: user.createdAt?.getTime() || 0,
      lastLoginAt: user.lastLoginAt?.getTime() || 0,
      subscription: subscription
        ? {
            plan: {
              displayName: planData?.displayName || "رایگان",
              price: planData?.price || 0,
              durationDays: planData?.durationDays || 0,
              features: planData?.features || [],
            },
            status: subscription.status,
            startDate: subscription.startDate?.getTime() || 0,
            endDate: subscription.endDate?.getTime() || 0,
          }
        : null,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/profile
 * Updates the current user's profile data.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, phone } = body;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;

    const clientInfo = await getClientInfo(request);

    await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, session.user.id));

    const updatedUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        avatarUrl: true,
        image: true,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "PROFILE_UPDATED",
      entity: "user",
      entityId: session.user.id,
      metadata: { updatedFields: Object.keys(updateData).filter(k => k !== "updatedAt") },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({
      id: updatedUser!.id,
      name: updatedUser!.name,
      email: updatedUser!.email,
      phone: updatedUser!.phone || "",
      bio: updatedUser!.bio || "",
      avatarUrl: updatedUser!.avatarUrl || updatedUser!.image || null,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/profile
 * Partial update for the current user's profile data.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, phone } = body;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;

    const clientInfo = await getClientInfo(request);

    await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, session.user.id));

    const updatedUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        avatarUrl: true,
        image: true,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "PROFILE_UPDATED",
      entity: "user",
      entityId: session.user.id,
      metadata: { updatedFields: Object.keys(updateData).filter(k => k !== "updatedAt") },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({
      id: updatedUser!.id,
      name: updatedUser!.name,
      email: updatedUser!.email,
      phone: updatedUser!.phone || "",
      bio: updatedUser!.bio || "",
      avatarUrl: updatedUser!.avatarUrl || updatedUser!.image || null,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/profile
 * Deletes the current user's account after password verification.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "رمز عبور الزامی است" },
        { status: 400 },
      );
    }

    // Verify password using auth API
    const verifyResult = await auth.api.signInEmail({
      body: {
        email: session.user.email,
        password,
      },
    });

    if (!verifyResult || !verifyResult.token) {
      return NextResponse.json(
        { error: "رمز عبور نامعتبر است" },
        { status: 401 },
      );
    }

    const clientInfo = await getClientInfo(request);

    // Delete user's subscriptions first
    await db
      .delete(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, session.user.id));

    // Delete user's payments
    await db
      .delete(schema.payments)
      .where(eq(schema.payments.userId, session.user.id));

    // Delete user account
    await db.delete(schema.users).where(eq(schema.users.id, session.user.id));

    await logAudit({
      userId: session.user.id,
      action: "ACCOUNT_DELETED",
      entity: "user",
      entityId: session.user.id,
      metadata: { email: session.user.email },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "خطا در حذف حساب کاربری" },
      { status: 500 },
    );
  }
}
