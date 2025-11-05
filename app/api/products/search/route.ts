// app/api/products/search/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    const body = await req.json()

    // Get cookies from the incoming request
    const cookieHeader = req.headers.get("cookie")

    console.log("/api/products/search - Search request:", body)

    const backendRes = await fetch(`${API_BASE_URL}/api/products/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(body),
    })

    console.log("/api/products/search - Backend response status:", backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error("/api/products/search - Backend error:", errorText)
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
    console.error("/api/products/search error:", err)
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 })
  }
}
