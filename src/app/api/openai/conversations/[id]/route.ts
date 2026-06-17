import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.OPENAI_BACKEND_URL || "http://localhost:3001";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${BACKEND}/openai/conversations/${id}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Conversation not found" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${BACKEND}/openai/conversations/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to delete conversation" }, { status: res.status });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
