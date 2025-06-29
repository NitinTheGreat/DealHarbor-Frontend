// lib/auth.ts
import { cookies } from "next/headers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    isStudentVerified: boolean
    profilePhotoUrl: string
  }
}

export interface ApiError {
  error: boolean
  message: string
  timestamp: number
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMessage = data.message || data.error || "Login failed"
    throw new Error(errorMessage)
  }

  return data
}

export async function registerUser(userData: {
  name: string
  email: string
  password: string
}): Promise<{ message: string }> {
  const requestData = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMessage = data.message || data.error || "Registration failed"
    throw new Error(errorMessage)
  }

  return data
}

export async function verifyEmail(email: string, otp: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMessage = data.message || data.error || "Verification failed"
    throw new Error(errorMessage)
  }

  return data
}

export async function resendOTP(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMessage = data.message || data.error || "Failed to resend OTP"
    throw new Error(errorMessage)
  }

  return data
}

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
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete("accessToken")
  cookieStore.delete("refreshToken")
  cookieStore.delete("user")
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
