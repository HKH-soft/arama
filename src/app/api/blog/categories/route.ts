import { NextResponse } from "next/server";
import db from "@/lib/db";
import { blogCategories } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const categories = await db
      .select()
      .from(blogCategories)
      .orderBy(asc(blogCategories.sortOrder));

    return NextResponse.json(categories);
  } catch (err) {
    console.error("Blog categories fetch error:", err);
    return NextResponse.json(
      {
        error: "خطا در دریافت دسته‌بندی‌ها",
      },
      { status: 500 },
    );
  }
}
