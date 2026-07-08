import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";

/**
 * POST /api/profile/avatar
 * Uploads/updates the current user's profile avatar image.
 * Accepts multipart form data with a field named "avatar".
 * Uses Vercel Blob for storage (works on both Vercel and local dev).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Fetch current avatar to delete old blob if replacing
    const currentUser = await db
      .select({ avatarUrl: schema.users.avatarUrl })
      .from(schema.users)
      .where(eq(schema.users.id, session.user.id))
      .limit(1);

    const oldAvatarUrl = currentUser[0]?.avatarUrl;

    // Generate unique filename
    const ext = file.name.split(".").pop() || "png";
    const filename = `avatars/${session.user.id}/${randomUUID()}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    // Delete old blob if it exists and is a Vercel Blob URL
    if (oldAvatarUrl && oldAvatarUrl.includes("blob.vercel-storage.com")) {
      try {
        await del(oldAvatarUrl);
      } catch {
        // Ignore errors deleting old blob
      }
    }

    // Update user in database with blob URL
    await db
      .update(schema.users)
      .set({ avatarUrl: blob.url, updatedAt: new Date() })
      .where(eq(schema.users.id, session.user.id));

    return NextResponse.json({
      success: true,
      avatarUrl: blob.url,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/avatar
 * Deletes the current user's profile avatar from Vercel Blob and database.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch current avatar URL before clearing
    const currentUser = await db
      .select({ avatarUrl: schema.users.avatarUrl })
      .from(schema.users)
      .where(eq(schema.users.id, session.user.id))
      .limit(1);

    const currentAvatarUrl = currentUser[0]?.avatarUrl;

    // Delete blob from Vercel Blob storage
    if (currentAvatarUrl && currentAvatarUrl.includes("blob.vercel-storage.com")) {
      try {
        await del(currentAvatarUrl);
      } catch {
        // Ignore errors deleting blob — file may already be gone
      }
    }

    // Update user - clear avatarUrl
    await db
      .update(schema.users)
      .set({ avatarUrl: null, updatedAt: new Date() })
      .where(eq(schema.users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
