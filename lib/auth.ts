// lib/auth.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  needsStudentVerification: boolean // Added this field
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

// Helper function to log request details
function logRequest(method: string, url: string, body?: any, headers?: any) {
  console.log(`🌐 ${method} ${url}`)
  if (headers) {
    console.log("📋 Headers:", headers)
  }
  if (body) {
    console.log("📦 Body:", typeof body === "string" ? body : JSON.stringify(body, null, 2))
  }
}

// Helper function to log response details
function logResponse(response: Response, data?: any) {
  console.log(`📡 Response: ${response.status} ${response.statusText}`)
  console.log("📋 Response Headers:", Object.fromEntries(response.headers.entries()))
  if (data) {
    console.log("📦 Response Data:", data)
  }
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    const url = `${API_BASE_URL}/api/auth/login`
    const requestBody = { email: email.trim(), password }
    const headers = { "Content-Type": "application/json" }

    logRequest("POST", url, requestBody, headers)

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    let responseData: any
    const contentType = response.headers.get("content-type")

    try {
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError)
      responseData = null
    }

    logResponse(response, responseData)

    if (!response.ok) {
      let errorMessage = "Login failed"

      if (responseData) {
        if (typeof responseData === "object") {
          errorMessage = responseData.message || responseData.error || errorMessage
        } else {
          errorMessage = responseData
        }
      }

      console.error("❌ Login failed:", errorMessage)
      throw new Error(errorMessage)
    }

    if (!responseData || typeof responseData !== "object") {
      throw new Error("Invalid response format from server")
    }

    console.log("✅ Login successful")
    return responseData
  } catch (error) {
    console.error("💥 Login error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Network error occurred during login")
  }
}

export async function registerUser(userData: {
  name: string
  email: string
  password: string
  phoneNumber?: string
}): Promise<{ message: string; email: string; isAutoVerified?: boolean }> {
  try {
    const url = `${API_BASE_URL}/api/auth/register`
    const requestBody = {
      name: userData.name.trim(),
      email: userData.email.trim(),
      password: userData.password,
      ...(userData.phoneNumber && { phoneNumber: userData.phoneNumber.trim() }),
    }
    const headers = { "Content-Type": "application/json" }

    logRequest("POST", url, requestBody, headers)

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    let responseData: any
    const contentType = response.headers.get("content-type")

    try {
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError)
      responseData = null
    }

    logResponse(response, responseData)

    if (!response.ok) {
      let errorMessage = "Registration failed"

      if (responseData) {
        if (typeof responseData === "object") {
          errorMessage = responseData.message || responseData.error || errorMessage
        } else {
          errorMessage = responseData
        }
      }

      console.error("❌ Registration failed:", errorMessage)
      throw new Error(errorMessage)
    }

    // Handle response format
    if (typeof responseData === "string") {
      return {
        message: responseData || "Registration successful. OTP sent to email.",
        email: userData.email.trim(),
      }
    } else if (typeof responseData === "object") {
      return {
        ...responseData,
        email: userData.email.trim(),
        message: responseData.message || "Registration successful. Please check your email for verification.",
      }
    } else {
      return {
        message: "Registration successful. OTP sent to email.",
        email: userData.email.trim(),
      }
    }
  } catch (error) {
    console.error("💥 Register error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Network error occurred during registration")
  }
}

export async function checkEmailExists(email: string): Promise<{ exists: boolean; verified: boolean }> {
  try {
    const url = `${API_BASE_URL}/api/auth/check-email`
    const requestBody = { email: email.trim() }
    const headers = { "Content-Type": "application/json" }

    logRequest("POST", url, requestBody, headers)

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    let responseData: any
    try {
      responseData = await response.json()
    } catch (parseError) {
      console.warn("⚠️ Failed to parse check-email response, assuming email doesn't exist")
      return { exists: false, verified: false }
    }

    logResponse(response, responseData)

    if (!response.ok) {
      console.warn("⚠️ Check email failed, assuming email doesn't exist")
      return { exists: false, verified: false }
    }

    return responseData || { exists: false, verified: false }
  } catch (error) {
    console.warn("⚠️ Check email error, assuming email doesn't exist:", error)
    return { exists: false, verified: false }
  }
}

export async function verifyEmail(email: string, otp: string): Promise<{ message: string; shouldAutoLogin?: boolean }> {
  try {
    const url = `${API_BASE_URL}/api/auth/verify`
    const requestBody = { email: email.trim(), otp: otp.trim() }
    const headers = { "Content-Type": "application/json" }

    logRequest("POST", url, requestBody, headers)

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    let responseData: any
    const contentType = response.headers.get("content-type")

    try {
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError)
      responseData = null
    }

    logResponse(response, responseData)

    if (!response.ok) {
      let errorMessage = "Verification failed"

      if (responseData) {
        if (typeof responseData === "object") {
          errorMessage = responseData.message || responseData.error || errorMessage
        } else {
          errorMessage = responseData
        }
      }

      console.error("❌ Verification failed:", errorMessage)
      throw new Error(errorMessage)
    }

    // Handle response format
    if (typeof responseData === "string") {
      return {
        message: responseData || "Email verified successfully.",
        shouldAutoLogin: true,
      }
    } else if (typeof responseData === "object") {
      return {
        ...responseData,
        shouldAutoLogin: true,
      }
    } else {
      return {
        message: "Email verified successfully.",
        shouldAutoLogin: true,
      }
    }
  } catch (error) {
    console.error("💥 Verify error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Network error occurred during verification")
  }
}

export async function resendOTP(email: string): Promise<{ message: string }> {
  try {
    const url = `${API_BASE_URL}/api/auth/resend-otp`
    const requestBody = { email: email.trim() }
    const headers = { "Content-Type": "application/json" }

    logRequest("POST", url, requestBody, headers)

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    let responseData: any
    const contentType = response.headers.get("content-type")

    try {
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError)
      responseData = null
    }

    logResponse(response, responseData)

    if (!response.ok) {
      let errorMessage = "Failed to resend OTP"

      if (responseData) {
        if (typeof responseData === "object") {
          errorMessage = responseData.message || responseData.error || errorMessage
        } else {
          errorMessage = responseData
        }
      }

      console.error("❌ Resend OTP failed:", errorMessage)
      throw new Error(errorMessage)
    }

    // Handle response format
    if (typeof responseData === "string") {
      return { message: responseData || "New OTP sent to email." }
    } else if (typeof responseData === "object") {
      return responseData
    } else {
      return { message: "New OTP sent to email." }
    }
  } catch (error) {
    console.error("💥 Resend OTP error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Network error occurred")
  }
}

// Student verification functions following the README
export async function sendStudentOTP(studentEmail: string): Promise<{ message: string }> {
  try {
    const token = getClientToken()
    const response = await fetch(`${API_BASE_URL}/api/student-verification/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ studentEmail }),
    })

    if (!response.ok) {
      let errorMessage = "Failed to send student verification OTP"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = `Failed to send OTP with status ${response.status}`
      }
      throw new Error(errorMessage)
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      return data
    } else {
      const message = await response.text()
      return { message: message || "OTP sent to your student email. Please check your inbox." }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Network error occurred")
  }
}

export async function verifyStudentOTP(data: {
  studentEmail: string
  otp: string
  universityId?: string
  graduationYear?: number
  department?: string
}): Promise<{ message: string }> {
  try {
    const token = getClientToken()
    const response = await fetch(`${API_BASE_URL}/api/student-verification/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorMessage = "Student verification failed"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = `Student verification failed with status ${response.status}`
      }
      throw new Error(errorMessage)
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      return data
    } else {
      const message = await response.text()
      return { message: message || "Student verification successful! You are now a verified VIT student." }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Network error occurred")
  }
}

export async function githubLogin(): Promise<{ redirectUrl: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/github`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error("Failed to initiate GitHub login")
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Network error occurred")
  }
}

// Get current user from backend (authenticated endpoint)
export async function getCurrentUser(): Promise<any> {
  try {
    const token = getClientToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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

    // Update localStorage with fresh data
    setClientUser(userData)

    return userData
  } catch (error) {
    console.error("💥 Get current user error:", error)
    throw error
  }
}

// Logout function
export async function logoutUser(): Promise<void> {
  try {
    const token = getClientToken()
    if (token) {
      // Try to logout on backend (optional - don't fail if it doesn't work)
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout-all`, {
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
  } finally {
    // Always clear local storage
    removeClientToken()
    clearUserState()
  }
}

// Change password function
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  try {
    const token = getClientToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(errorData || "Failed to change password")
    }

    return { message: "Password changed successfully" }
  } catch (error) {
    console.error("💥 Change password error:", error)
    throw error
  }
}

// Update profile function
export async function updateProfile(profileData: {
  name: string
  bio?: string
  phoneNumber?: string
}): Promise<any> {
  try {
    const token = getClientToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(errorData || "Failed to update profile")
    }

    const updatedUser = await response.json()
    setClientUser(updatedUser)
    return updatedUser
  } catch (error) {
    console.error("💥 Update profile error:", error)
    throw error
  }
}

// Get account stats
export async function getAccountStats(): Promise<any> {
  try {
    const token = getClientToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/account-stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch account stats")
    }

    return await response.json()
  } catch (error) {
    console.error("💥 Get account stats error:", error)
    throw error
  }
}

// Client-side token management
export function getClientToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken")
}

export function setClientToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token)
  }
}

export function removeClientToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
  }
}

export function getClientUser() {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function setClientUser(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

// State management for page refreshes
export interface UserState {
  step: "signup" | "verify-email" | "verify-student" | "complete"
  email?: string
  password?: string
  needsStudentVerification?: boolean
  studentEmail?: string
  isStudentVerified?: boolean
  lastOTPSent?: number
}

export function saveUserState(state: UserState) {
  if (typeof window !== "undefined") {
    localStorage.setItem("userState", JSON.stringify(state))
  }
}

export function getUserState(): UserState | null {
  if (typeof window === "undefined") return null
  const stateStr = localStorage.getItem("userState")
  if (!stateStr) return null
  try {
    return JSON.parse(stateStr)
  } catch {
    return null
  }
}

export function clearUserState() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userState")
  }
}

// OTP Timer management
export function setOTPTimer(email: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`otpTimer_${email}`, Date.now().toString())
  }
}

export function getOTPTimer(email: string): number | null {
  if (typeof window === "undefined") return null
  const timer = localStorage.getItem(`otpTimer_${email}`)
  return timer ? Number.parseInt(timer) : null
}

export function clearOTPTimer(email: string) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`otpTimer_${email}`)
  }
}

export function canResendOTP(email: string): boolean {
  const lastSent = getOTPTimer(email)
  if (!lastSent) return true
  const now = Date.now()
  const timeDiff = now - lastSent
  return timeDiff >= 60000 // 1 minute = 60000ms
}

export function getResendTimeLeft(email: string): number {
  const lastSent = getOTPTimer(email)
  if (!lastSent) return 0
  const now = Date.now()
  const timeDiff = now - lastSent
  const timeLeft = 60000 - timeDiff
  return timeLeft > 0 ? Math.ceil(timeLeft / 1000) : 0
}
