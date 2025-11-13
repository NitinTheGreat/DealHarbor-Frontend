import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies()
    
    // Get all cookies and forward them
    const cookieHeader = request.headers.get("cookie")

    const res = await fetch(`${API_BASE}/api/products/${id}/views`, {
      method: "POST",
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to increment views" },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing views:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
