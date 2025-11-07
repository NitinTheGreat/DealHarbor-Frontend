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

    const res = await fetch(`${API_BASE}/products/${params.id}/views`, {
      method: "POST",
      headers: {
        ...(authToken && { Cookie: `JSESSIONID=${authToken}` }),
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to increment views" },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing views:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
