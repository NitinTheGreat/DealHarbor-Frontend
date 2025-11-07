import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("JSESSIONID")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `JSESSIONID=${authToken}`,
      },
      body: JSON.stringify(body),
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Failed to send message" }))
      return NextResponse.json(
        { error: error.message },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
