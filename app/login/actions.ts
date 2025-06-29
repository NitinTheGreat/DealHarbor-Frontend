// app/login/actions.ts
"use server"

import { loginUser } from "@/lib/auth"
import { setAuthCookies } from "@/lib/auth-server"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("🔑 Login action called for:", email)

  if (!email || !password) {
    return { error: "Please enter both email and password" }
  }

  if (!email.includes("@")) {
    return { error: "Please enter a valid email address" }
  }

  try {
    const loginResponse = await loginUser(email, password)
    console.log("✅ Login successful for:", email)
    console.log("🎓 Backend response - needsStudentVerification:", loginResponse.needsStudentVerification)
    console.log("👤 User isStudentVerified:", loginResponse.user.isStudentVerified)

    await setAuthCookies(loginResponse)

    // CRITICAL FIX: Use the backend's needsStudentVerification field directly
    const needsStudentVerification = loginResponse.needsStudentVerification
    console.log("🎯 Final decision - needsStudentVerification:", needsStudentVerification)

    return {
      success: true,
      needsStudentVerification,
      user: loginResponse.user,
    }
  } catch (error) {
    console.error("💥 Login error:", error)
    let errorMessage = "Login failed. Please try again."

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("invalid credentials") || message.includes("unauthorized")) {
        errorMessage = "Invalid email or password. Please check your credentials."
      } else if (message.includes("account not verified")) {
        errorMessage = "Please verify your email address before logging in."
      } else if (message.includes("account locked") || message.includes("banned")) {
        errorMessage = "Your account has been temporarily locked. Contact support for assistance."
      } else if (message.includes("network") || message.includes("connection")) {
        errorMessage = "Connection error. Please check your internet and try again."
      } else {
        errorMessage = error.message
      }
    }

    return { error: errorMessage }
  }
}

export async function githubLoginAction() {
  try {
    const { githubLogin } = await import("@/lib/auth")
    const response = await githubLogin()
    return { success: true, redirectUrl: response.redirectUrl }
  } catch (error) {
    return { error: "Failed to initiate GitHub login" }
  }
}
