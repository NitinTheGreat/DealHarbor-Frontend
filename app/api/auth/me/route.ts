// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    // Get cookies from the incoming request and forward them to backend
    const cookieHeader = req.headers.get("cookie")
    console.log("/api/auth/me - Forwarding cookies:", cookieHeader)

    const backendRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // Forward cookies from browser to backend
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    console.log("/api/auth/me - Backend response status:", backendRes.status)

    const text = await backendRes.text()

    const res = new NextResponse(text, {
      status: backendRes.status,
      headers: {
        "Content-Type": backendRes.headers.get("content-type") || "application/json",
      },
    })

    return res
  } catch (err) {
    console.error("/api/auth/me error:", err)
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 })
  }
}
