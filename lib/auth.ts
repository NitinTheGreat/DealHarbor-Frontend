// lib/auth.ts
import { redirect } from "next/navigation"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isStudentVerified: boolean
  profilePhotoUrl: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function getUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include", // Important: includes session cookie
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Don't cache auth checks
    })

    if (!response.ok) {
      return null
    }

    const userData = await response.json()
    return userData
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return !!user
}
