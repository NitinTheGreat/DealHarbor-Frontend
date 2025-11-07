import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("JSESSIONID")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(`${API_BASE}/favorites/${params.id}`, {
      method: "POST",
      headers: {
        Cookie: `JSESSIONID=${authToken}`,
      },
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json(
        { error: error || "Failed to add favorite" },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding favorite:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("JSESSIONID")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(`${API_BASE}/favorites/${params.id}`, {
      method: "DELETE",
      headers: {
        Cookie: `JSESSIONID=${authToken}`,
      },
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json(
        { error: error || "Failed to remove favorite" },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing favorite:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
