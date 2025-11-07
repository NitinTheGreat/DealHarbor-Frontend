// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    // Get cookies from the incoming request (for authentication)
    const cookieHeader = req.headers.get("cookie")
    
    console.log("/api/categories - Fetching categories")
    console.log("/api/categories - Forwarding cookies:", cookieHeader)

    const backendRes = await fetch(`${API_BASE_URL}/api/categories`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    console.log("/api/categories - Backend response status:", backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error("/api/categories - Backend error:", errorText)
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
    console.error("/api/categories error:", err)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
