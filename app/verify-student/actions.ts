"use server"

import { cookies } from "next/headers"

interface User {
  id: string
  name: string
  email: string
  isVerifiedStudent: boolean
  profilePhotoUrl?: string
  phoneNumber?: string
  bio?: string
  universityEmail?: string
  universityId?: string
  department?: string
  graduationYear?: number
  totalListings?: number
  totalSales?: number
  totalPurchases?: number
  overallRating?: number
  sellerBadge?: string
  sellerRating?: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface StudentOtpRequest {
  studentEmail: string
}

interface StudentOtpVerifyRequest {
  studentEmail: string
  otp: string
  universityId?: string
  graduationYear?: number
  department?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value

    if (!accessToken) {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to get user data",
      }
    }

    const userData = await response.json()

    return {
      success: true,
      data: userData,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return {
      success: false,
      error: "Network error",
    }
  }
}

export async function sendStudentOtp(request: StudentOtpRequest): Promise<ApiResponse<string>> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value

    if (!accessToken) {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/student-verification/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: errorText || "Failed to send OTP",
      }
    }

    const message = await response.text()
    return {
      success: true,
      data: message,
    }
  } catch (error) {
    console.error("Send student OTP error:", error)
    return {
      success: false,
      error: "Network error. Please try again.",
    }
  }
}

export async function verifyStudentOtp(request: StudentOtpVerifyRequest): Promise<ApiResponse<string>> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value

    if (!accessToken) {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/student-verification/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: errorText || "Failed to verify OTP",
      }
    }

    const message = await response.text()
    return {
      success: true,
      data: message,
    }
  } catch (error) {
    console.error("Verify student OTP error:", error)
    return {
      success: false,
      error: "Network error. Please try again.",
    }
  }
}
