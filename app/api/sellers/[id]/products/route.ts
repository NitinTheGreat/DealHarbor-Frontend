// app/api/sellers/[id]/products/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const page = searchParams.get("page") || "0"
    const size = searchParams.get("size") || "20"

    // Get cookies from the incoming request
    const cookieHeader = req.headers.get("cookie")

    console.log(`/api/sellers/${id}/products - Fetching seller products`)

    const backendRes = await fetch(
      `${API_BASE_URL}/api/products/seller/${id}?page=${page}&size=${size}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
      }
    )

    console.log(`/api/sellers/${id}/products - Backend response status:`, backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error(`/api/sellers/${id}/products - Backend error:`, errorText)
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
    console.error(`/api/sellers/${params}/products error:`, err)
    return NextResponse.json({ error: "Failed to fetch seller products" }, { status: 500 })
  }
}
