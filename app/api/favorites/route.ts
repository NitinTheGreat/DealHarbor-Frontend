import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the incoming request and forward them to backend
    const cookieHeader = request.headers.get("cookie")
    const authHeader = request.headers.get("authorization")

    if (!cookieHeader && !authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const headers: HeadersInit = {
      Accept: "application/json",
    }

    // Forward cookies from browser to backend
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader
    }

    // Forward Authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const res = await fetch(`${API_BASE}/api/favorites`, {
      headers,
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch favorites" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
