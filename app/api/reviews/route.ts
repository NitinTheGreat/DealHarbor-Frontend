import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const page = searchParams.get("page") || "0"
    const size = searchParams.get("size") || "10"

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    const res = await fetch(
      `${API_BASE}/reviews/product/${productId}?page=${page}&size=${size}`,
      { next: { revalidate: 60 } }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("JSESSIONID")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const res = await fetch(`${API_BASE}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `JSESSIONID=${authToken}`,
      },
      body: JSON.stringify(body),
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Failed to create review" }))
      return NextResponse.json(
        { error: error.message },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
