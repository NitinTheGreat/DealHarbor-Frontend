// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    
    // Get cookies from the incoming request and forward to backend
    const cookieHeader = req.headers.get("cookie")
    
    // Call backend logout API to invalidate session
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
      })
    } catch (error) {
      console.error("Backend logout error:", error)
      // Continue even if backend fails
    }

    // Best-effort: clear SESSION cookie on client as well
    const res = NextResponse.json({ success: true })
    // Expire SESSION cookie if set on root path
    res.headers.append(
      "set-cookie",
      `SESSION=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
    )
    return res
  } catch (error) {
    console.error("Logout route error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
