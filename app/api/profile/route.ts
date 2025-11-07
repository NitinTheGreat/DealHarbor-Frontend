// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    // Get cookies from the incoming request and forward them to backend
    const cookieHeader = req.headers.get("cookie")
    console.log("/api/profile - Forwarding cookies:", cookieHeader)

    // Try /api/auth/me first, then fall back to /api/users/me
    let backendRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // Forward cookies from browser to backend
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    // If that fails, try alternative endpoint
    if (!backendRes.ok) {
      console.log("/api/profile - Trying alternative endpoint /api/users/me")
      backendRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
      })
    }

    console.log("/api/profile - Backend response status:", backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.log("/api/profile - Backend error:", errorText)
      return new NextResponse(errorText, {
        status: backendRes.status,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const data = await backendRes.json()

    return NextResponse.json(data)
  } catch (err) {
    console.error("/api/profile error:", err)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
