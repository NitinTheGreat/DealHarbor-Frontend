// app/api/sellers/[id]/route.ts
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

    console.log(`/api/sellers/${id} - Fetching seller details`)

    const backendRes = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    console.log(`/api/sellers/${id} - Backend response status:`, backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error(`/api/sellers/${id} - Backend error:`, errorText)
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
    console.error(`/api/sellers error:`, err)
    return NextResponse.json({ error: "Failed to fetch seller" }, { status: 500 })
  }
}
