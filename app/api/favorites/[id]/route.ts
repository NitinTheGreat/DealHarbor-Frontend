import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get cookies from the incoming request and forward them to backend
    const cookieHeader = request.headers.get("cookie")
    const authHeader = request.headers.get("authorization")

    if (!cookieHeader && !authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Forward cookies from browser to backend
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader
    }

    // Forward Authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const res = await fetch(`${API_BASE}/api/favorites/${id}`, {
      method: "POST",
      headers,
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json(
        { error: error || "Failed to add favorite" },
        { status: res.status }
      )
    }

    const data = await res.json().catch(() => ({ success: true }))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error adding favorite:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get cookies from the incoming request and forward them to backend
    const cookieHeader = request.headers.get("cookie")
    const authHeader = request.headers.get("authorization")

    if (!cookieHeader && !authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Forward cookies from browser to backend
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader
    }

    // Forward Authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const res = await fetch(`${API_BASE}/api/favorites/${id}`, {
      method: "DELETE",
      headers,
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json(
        { error: error || "Failed to remove favorite" },
        { status: res.status }
      )
    }

    const data = await res.json().catch(() => ({ success: true }))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error removing favorite:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
