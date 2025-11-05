// app/api/products/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    const { productId } = params

    // Get cookies from the incoming request
    const cookieHeader = req.headers.get("cookie")

    console.log(`/api/products/${productId} - Fetching product details`)

    const backendRes = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    console.log(`/api/products/${productId} - Backend response status:`, backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error(`/api/products/${productId} - Backend error:`, errorText)
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
    console.error(`/api/products/${params.productId} error:`, err)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
