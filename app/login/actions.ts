"use server"

interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

interface ApiResponse {
  success: boolean
  error?: string
  redirectToSignup?: boolean
}

interface EmailCheckResponse {
  exists: boolean
  verified: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function loginUser(credentials: LoginRequest): Promise<ApiResponse> {
  try {
    console.log("Attempting login for:", credentials.email)
    console.log("API_BASE_URL:", API_BASE_URL)
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: allows backend to set session cookie
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    })

    console.log("Login response status:", response.status)
    console.log("Login response headers:", Object.fromEntries(response.headers.entries()))

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

    // Backend returns plain text on successful login and sets SESSION cookie
    // The client will call /api/auth/me to get user data
    console.log("Login successful - session cookie set by backend")

    return {
      success: true,
      // Client will fetch user data using the session cookie
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
