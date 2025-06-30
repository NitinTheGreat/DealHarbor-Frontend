// lib/auth.ts
import { cookies } from "next/headers"
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
    const cookieStore = await cookies()
    const userDataCookie = cookieStore.get("user_data")

    if (!userDataCookie?.value) {
      return null
    }

    const userData = JSON.parse(userDataCookie.value)
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

export async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")
    return accessToken?.value || null
  } catch (error) {
    console.error("Error getting access token:", error)
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  const accessToken = await getAccessToken()

  return !!(user && accessToken)
}
