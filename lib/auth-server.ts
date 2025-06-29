// lib/auth-server.ts
"use server"

import { cookies } from "next/headers"
import type { LoginResponse } from "./auth"

export async function setAuthCookies(loginResponse: LoginResponse) {
  const cookieStore = await cookies()

  cookieStore.set("accessToken", loginResponse.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: loginResponse.expiresIn,
  })

  cookieStore.set("refreshToken", loginResponse.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
  })

  cookieStore.set("user", JSON.stringify(loginResponse.user), {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
  })

  console.log("Auth cookies set for user:", loginResponse.user.email)
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete("accessToken")
  cookieStore.delete("refreshToken")
  cookieStore.delete("user")

  // Also clear localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
  }
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("accessToken")?.value || null
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")?.value

  if (!userCookie) return null

  try {
    return JSON.parse(userCookie)
  } catch {
    return null
  }
}

export async function getCurrentUserFromBackend() {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value

  if (!token) return null

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return null
    }

    const userData = await response.json()
    console.log("✅ Backend user data:", userData)
    return userData
  } catch (error) {
    console.error("❌ Failed to fetch user from backend:", error)
    return null
  }
}
