"use server"

import { cookies } from "next/headers"

interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginResponse {
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
  needsStudentVerification?: boolean
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  redirectToSignup?: boolean
}

interface EmailCheckResponse {
  exists: boolean
  verified: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"


export async function loginUser(
  credentials: LoginRequest,
): Promise<ApiResponse<LoginResponse> & { needsStudentVerification?: boolean; redirectToSignup?: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()

      if (errorText.includes("REDIRECT_TO_SIGNUP")) {
        return {
          success: false,
          redirectToSignup: true,
          error: "No account found with this email. Please sign up first.",
        }
      }

      if (response.status === 400 || response.status === 401) {
        return {
          success: false,
          error: errorText || "Invalid credentials. Please check your email and password.",
        }
      }

      if (response.status === 423) {
        return {
          success: false,
          error: "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
        }
      }

      return {
        success: false,
        error: "Login failed. Please try again.",
      }
    }

    const data: LoginResponse = await response.json()

    // Set cookies as before
    const cookieStore = await cookies()
    const maxAge = credentials.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day

    cookieStore.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.expiresIn,
      path: "/",
    })

    cookieStore.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    })

    cookieStore.set("user_data", JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    })
console.log("about to fetch /api/auth/me")
    // Call /api/auth/me to get updated is_verified_student status
    const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
    })

    let isVerifiedStudent = data.user.isStudentVerified
    if (meResponse.ok) {
      console.log("Fetching student verification status from /api/auth/me")
      console.log(meResponse)
      const meData = await meResponse.json()
      console.log("Response from /api/auth/me:", meData)
      // Assuming the API returns { is_verified_student: boolean }
      if (typeof meData.verifiedStudent === "boolean") {
        isVerifiedStudent = meData.verifiedStudent
      }
    } else {
      // If /me API fails, fallback to current user info
      console.warn("Failed to fetch student verification status from /api/auth/me")
    }

    return {
      success: true,
      data,
      needsStudentVerification: !isVerifiedStudent,
    }
  } catch (error) {
    console.error("Login API error:", error)
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    }
  }
}


export async function checkEmailExists(email: string): Promise<EmailCheckResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      throw new Error("Failed to check email")
    }

    const data = await response.json()
    console.log("Raw API response:", data) // Debug log

    // Backend returns: { exists: boolean, verified: boolean }
    const result = {
      exists: data.exists,
      verified: data.verified,
    }

    console.log("Processed result:", result) // Debug log
    return result
  } catch (error) {
    console.error("Email check error:", error)
    // Return exists: false to show X icon on network errors
    return {
      exists: false,
      verified: false,
    }
  }
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies()

  try {
    const refreshToken = cookieStore.get("refresh_token")?.value
    const accessToken = cookieStore.get("access_token")?.value

    // Call logout API if tokens exist
    if (refreshToken && accessToken) {
      await fetch(`${API_BASE_URL}/api/auth/logout?refreshToken=${refreshToken}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    }
  } catch (error) {
    console.error("Logout API error:", error)
    // Continue with cookie cleanup even if API fails
  } finally {
    // Clear all auth cookies
    cookieStore.delete("access_token")
    cookieStore.delete("refresh_token")
    cookieStore.delete("user_data")
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!refreshToken) {
      return false
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh?refreshToken=${refreshToken}`, {
      method: "POST",
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()

    // Update cookies with new tokens
    cookieStore.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.expiresIn,
      path: "/",
    })

    cookieStore.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return true
  } catch (error) {
    console.error("Token refresh error:", error)
    return false
  }
}
