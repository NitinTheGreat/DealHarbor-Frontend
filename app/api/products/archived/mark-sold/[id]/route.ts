// app/api/products/archived/mark-sold/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  
  let productId: string | undefined

  try {
    const { id } = await params
    productId = id

    // Get ALL cookies from the incoming request and forward them to backend (same as other routes)
    const cookieHeader = req.headers.get("cookie")

    console.log(`[API] Marking product ${id} as sold`)
    console.log(`[API] Cookie header present:`, !!cookieHeader)

    if (!cookieHeader) {
      console.error(`[API] No cookie header found - user not authenticated`)
      return NextResponse.json(
        { error: "Not authenticated. Please login first." },
        { status: 401 }
      )
    }

    // Get request body if provided (for soldPrice, buyerId, etc.)
    let requestBody = {}
    try {
      requestBody = await req.json()
    } catch {
      // No body provided, that's okay
    }

    console.log(`[API] Forwarding request to backend: POST /api/products/archived/mark-sold/${id}`)

    const backendRes = await fetch(
      `${API_BASE_URL}/api/products/archived/mark-sold/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(requestBody),
      }
    )

    console.log(`[API] Backend response status:`, backendRes.status)

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error(`[API] Backend error response:`, errorText)
      console.error(`[API] Backend status:`, backendRes.status)
      
      let errorMessage = "Failed to mark product as sold"
      let errorDetails = null
      
      try {
        const errorData = JSON.parse(errorText)
        console.error(`[API] Parsed error data:`, errorData)
        errorMessage = errorData.message || errorData.error || errorMessage
        errorDetails = errorData
      } catch {
        // If not JSON, use the raw text
        console.error(`[API] Could not parse error as JSON`)
        errorMessage = errorText || errorMessage
      }

      // If it's an authentication error, provide specific message
      if (backendRes.status === 401 || backendRes.status === 403) {
        errorMessage = "Authentication failed. Please logout and login again."
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          status: backendRes.status
        },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()
    return NextResponse.json(data)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    const isConnectionRefused = errorMessage.includes("ECONNREFUSED") || errorMessage.includes("fetch failed")
    
    console.error(`[API] Error marking product ${productId || "unknown"} as sold:`, err)
    
    return NextResponse.json({ 
      error: isConnectionRefused 
        ? "Backend server is not running. Please start the Spring Boot server on port 8080." 
        : "Failed to mark product as sold",
      details: errorMessage
    }, { status: 503 })
  }
}
