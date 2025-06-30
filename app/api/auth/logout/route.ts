// app/api/auth/logout/route.ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Get tokens before clearing
    const refreshToken = cookieStore.get("refresh_token")?.value
    const accessToken = cookieStore.get("access_token")?.value

    // Call backend logout API if tokens exist
    if (refreshToken && accessToken) {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        await fetch(`${API_BASE_URL}/api/auth/logout?refreshToken=${refreshToken}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } catch (error) {
        console.error("Backend logout error:", error)
        // Continue with cookie cleanup even if backend fails
      }
    }

    // Clear all auth cookies
    cookieStore.delete("access_token")
    cookieStore.delete("refresh_token")
    cookieStore.delete("user_data")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout route error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
