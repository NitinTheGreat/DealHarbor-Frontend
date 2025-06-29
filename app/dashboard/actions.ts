// app/dashboard/actions.ts
"use server"

import { cookies } from "next/headers"

export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("accessToken")?.value

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user profile")
    }

    const userData = await response.json()
    console.log("✅ Fresh user data from backend:", userData)

    return { success: true, user: userData }
  } catch (error) {
    console.error("❌ Get current user error:", error)
    return { error: error instanceof Error ? error.message : "Failed to fetch user data" }
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("accessToken")?.value

    if (token) {
      // Try to logout on backend
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/logout-all`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      } catch (e) {
        console.warn("Backend logout failed:", e)
      }
    }

    // Clear cookies
    cookieStore.delete("accessToken")
    cookieStore.delete("refreshToken")
    cookieStore.delete("user")

    return { success: true }
  } catch (error) {
    console.error("❌ Logout error:", error)
    return { error: "Logout failed" }
  }
}
