// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    const { id } = await params

    // Get cookies from the incoming request
    const cookieHeader = req.headers.get("cookie")

    console.log(`/api/products/${id} - Fetching product details`)

    const backendRes = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    console.log(`/api/products/${id} - Backend response status:`, backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error(`/api/products/${id} - Backend error:`, errorText)
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
    console.error(`/api/products error:`, err)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
