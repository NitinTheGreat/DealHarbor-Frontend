import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get("limit") || "3"
        const featured = searchParams.get("featured") || "true"

        const res = await fetch(
            `${API_BASE}/api/testimonials?limit=${limit}&featured=${featured}`,
            {
                headers: {
                    Accept: "application/json",
                },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        )

        if (!res.ok) {
            console.error("Testimonials error:", res.status)
            return NextResponse.json([], { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error fetching testimonials:", error)
        return NextResponse.json([], { status: 500 })
    }
}
