// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    // Get query parameters from the request
    const searchParams = req.nextUrl.searchParams
    const page = searchParams.get("page") || "0"
    const size = searchParams.get("size") || "20"
    const sortBy = searchParams.get("sortBy") || "date_desc"

    // Get cookies from the incoming request (for authenticated requests)
    const cookieHeader = req.headers.get("cookie")

    console.log(`/api/products - Fetching products: page=${page}, size=${size}, sortBy=${sortBy}`)

    const backendRes = await fetch(
      `${API_BASE_URL}/api/products?page=${page}&size=${size}&sortBy=${sortBy}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          // Forward cookies if present (for personalized data if needed)
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
      }
    )

    console.log("/api/products - Backend response status:", backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error("/api/products - Backend error:", errorText)
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
    console.error("/api/products error:", err)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  try {
    // Get cookies from the incoming request (for authentication)
    const cookieHeader = req.headers.get("cookie")
    
    // Get the request body
    const body = await req.json()

    console.log("/api/products POST - Creating product")

    const backendRes = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(body),
    })

    console.log("/api/products POST - Backend response status:", backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error("/api/products POST - Backend error:", errorText)
      return new NextResponse(errorText, {
        status: backendRes.status,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("/api/products POST error:", err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
