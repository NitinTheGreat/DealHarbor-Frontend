import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// GET /api/messages/conversations/:id/messages - Fetch messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get all cookies from the incoming request and forward them to backend
    const cookieHeader = request.headers.get("cookie")

    if (!cookieHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(`${API_BASE}/api/messages/conversations/${id}/messages`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Failed to fetch messages" }))
      return NextResponse.json(
        { error: error.message },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/messages/conversations/:id/messages - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get all cookies from the incoming request and forward them to backend
    const cookieHeader = request.headers.get("cookie")

    if (!cookieHeader) {
      console.error('[Send Message] No cookie header found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    console.log('[Send Message] Conversation ID:', id)
    console.log('[Send Message] Request body:', body)

    const res = await fetch(`${API_BASE}/api/messages/conversations/${id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(body),
    })

    console.log('[Send Message] Backend response status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Send Message] Backend error:', errorText)
      return NextResponse.json(
        { error: errorText || "Failed to send message" },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log('[Send Message] Message sent successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Send Message] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
