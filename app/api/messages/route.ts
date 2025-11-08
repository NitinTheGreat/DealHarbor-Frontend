import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// GET /api/messages - Fetch all conversations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';
    
    // Get all cookies from the incoming request and forward them to backend
    const cookieHeader = request.headers.get("cookie")

    console.log(`[Conversations] Fetching - page: ${page}, size: ${size}`)

    const res = await fetch(`${API_BASE}/api/messages/conversations?page=${page}&size=${size}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    console.log("[Conversations] Response status:", res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error("[Conversations] Backend error:", errorText)
      return NextResponse.json(
        { error: "Failed to fetch conversations", content: [] },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log("[Conversations] Loaded", data.content?.length || 0, "conversations")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Conversations] Error:", error)
    return NextResponse.json(
      { error: "Internal server error", content: [] },
      { status: 500 }
    )
  }
}
