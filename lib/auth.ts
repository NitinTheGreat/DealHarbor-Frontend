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

export async function getUser(): Promise<User | null> {
  try {
    // Uses Vercel proxy - relative URL ensures cookies work (same-domain)
    const response = await fetch('/api/auth/me', {
      method: "GET",
      credentials: "include", // REQUIRED for cookies
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
