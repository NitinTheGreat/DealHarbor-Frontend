import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("JSESSIONID")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(`${API_BASE}/favorites`, {
      headers: {
        Cookie: `JSESSIONID=${authToken}`,
      },
      credentials: "include",
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
