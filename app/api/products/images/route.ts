import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("JSESSIONID")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Please select a file to upload" }, { status: 400 })
    }

    // Forward the request to the backend
    const backendFormData = new FormData()
    backendFormData.append("file", file)

    const res = await fetch(`${API_BASE_URL}/api/images/upload-product`, {
      method: "POST",
      headers: {
        Cookie: `JSESSIONID=${authToken}`,
      },
      body: backendFormData,
      credentials: "include",
    })

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json(
        { error: errorText || "Failed to upload image" },
        { status: res.status }
      )
    }

    // The backend returns the image URL as plain text
    const imageUrl = await res.text()

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
