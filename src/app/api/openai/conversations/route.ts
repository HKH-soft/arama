import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.OPENAI_BACKEND_URL || "http://localhost:3001";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/openai/conversations`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/openai/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to create conversation" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
