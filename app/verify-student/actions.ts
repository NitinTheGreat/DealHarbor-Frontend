"use server"

import { cookies } from "next/headers"

interface SendOtpRequest {
  studentEmail: string
}

interface VerifyOtpRequest {
  studentEmail: string
  otp: string
  universityId?: string
  graduationYear?: number
  department?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function sendStudentOtp(request: SendOtpRequest): Promise<ApiResponse<string>> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value

    if (!accessToken) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
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

      if (response.status === 401) {
        return {
          success: false,
          error: "Session expired. Please log in again.",
        }
      }

      if (response.status === 400) {
        if (errorText.includes("Invalid student email")) {
          return {
            success: false,
            error: "Please enter a valid VIT email address (@vitstudent.ac.in, @vit.ac.in, or @vitchennai.ac.in)",
          }
        }
        if (errorText.includes("already verified")) {
          return {
            success: false,
            error: "This student email is already verified by another user.",
          }
        }
        if (errorText.includes("already verified with a different email")) {
          return {
            success: false,
            error: "You are already verified with a different student email.",
          }
        }
      }

      return {
        success: false,
        error: errorText || "Failed to send OTP. Please try again.",
      }
    }

    const message = await response.text()
    return {
      success: true,
      data: message,
    }
  } catch (error) {
    console.error("Send OTP error:", error)
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    }
  }
}

export async function verifyStudentOtp(request: VerifyOtpRequest): Promise<ApiResponse<string>> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value

    if (!accessToken) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
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

      if (response.status === 401) {
        return {
          success: false,
          error: "Session expired. Please log in again.",
        }
      }

      if (response.status === 400) {
        if (errorText.includes("Invalid OTP")) {
          return {
            success: false,
            error: "Invalid OTP. Please check the code and try again.",
          }
        }
        if (errorText.includes("OTP expired")) {
          return {
            success: false,
            error: "OTP has expired. Please request a new one.",
          }
        }
        if (errorText.includes("already verified")) {
          return {
            success: false,
            error: "This student email is already verified by another user.",
          }
        }
      }

      return {
        success: false,
        error: errorText || "Failed to verify OTP. Please try again.",
      }
    }

    const message = await response.text()
    return {
      success: true,
      data: message,
    }
  } catch (error) {
    console.error("Verify OTP error:", error)
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    }
  }
}

export async function getCurrentUser(): Promise<ApiResponse<any>> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value

    if (!accessToken) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: "Session expired. Please log in again.",
        }
      }

      return {
        success: false,
        error: "Failed to get user information.",
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
      error: "Network error. Please check your connection and try again.",
    }
  }
}
