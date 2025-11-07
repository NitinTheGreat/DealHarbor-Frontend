// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    const body = await req.json()
    
    console.log("/api/auth/login - Login request for:", body.email)

    // Forward login to backend
    const backendRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("/api/auth/login - Backend response status:", backendRes.status)

    const text = await backendRes.text()

    // Mirror backend status
    const res = new NextResponse(text, { status: backendRes.status })

    // Proxy Set-Cookie from backend to the browser
    const setCookie = backendRes.headers.get("set-cookie")
    if (setCookie) {
      console.log("/api/auth/login - Setting cookie:", setCookie)
      res.headers.set("set-cookie", setCookie)
    } else {
      console.log("/api/auth/login - No Set-Cookie header from backend")
    }

    return res
  } catch (err) {
    console.error("/api/auth/login error:", err)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
