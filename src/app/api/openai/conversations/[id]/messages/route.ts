import { NextRequest } from "next/server";

const BACKEND = process.env.OPENAI_BACKEND_URL || "http://localhost:3001";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const backendRes = await fetch(`${BACKEND}/openai/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: request.signal,
    });

    if (!backendRes.ok || !backendRes.body) {
      return new Response(
        JSON.stringify({ error: "Failed to send message" }),
        { status: backendRes.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the SSE response from the backend directly to the client
    return new Response(backendRes.body, {
      headers: {
        "Content-Type": backendRes.headers.get("Content-Type") ?? "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Backend unavailable" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
