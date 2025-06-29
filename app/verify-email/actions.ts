// app/verify-email/actions.ts
"use server"

import { verifyEmail, resendOTP, loginUser } from "@/lib/auth"
import { setAuthCookies } from "@/lib/auth-server"

export async function verifyEmailAction(formData: FormData) {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string
  const password = formData.get("password") as string // For auto-login

  console.log("🔐 Verify email action called for:", email, "with OTP:", otp, "password provided:", !!password)

  if (!email || !otp) {
    return { error: "Please enter the verification code" }
  }

  if (otp.length !== 6) {
    return { error: "Verification code must be 6 digits" }
  }

  try {
    // First verify the email
    console.log("📧 Starting email verification...")
    const response = await verifyEmail(email, otp)
    console.log("✅ Email verification response:", response)

    // If password is provided, attempt auto-login
    if (password) {
      try {
        console.log("🔑 Attempting auto-login for:", email)
        const loginResponse = await loginUser(email, password)
        console.log("✅ Auto-login successful:", loginResponse)

        await setAuthCookies(loginResponse)

        // Check if user needs student verification
        const needsStudentVerification = !loginResponse.user.isStudentVerified
        console.log("🎓 Needs student verification:", needsStudentVerification)

        return {
          success: true,
          message: "Email verified and logged in successfully!",
          autoLogin: true,
          needsStudentVerification,
          user: loginResponse.user,
        }
      } catch (loginError) {
        console.error("❌ Auto-login failed:", loginError)
        // If auto-login fails, still consider verification successful but don't auto-login
        return {
          success: true,
          message: response.message,
          autoLogin: false,
          needsStudentVerification: true, // Assume needs verification for non-auto-login
        }
      }
    }

    console.log("✅ Email verification completed without auto-login")
    return { success: true, message: response.message, autoLogin: false }
  } catch (error) {
    console.error("💥 Email verification error:", error)
    let errorMessage = "Verification failed. Please try again."

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("invalid otp") || message.includes("incorrect")) {
        errorMessage = "Invalid verification code. Please check and try again."
      } else if (message.includes("expired")) {
        errorMessage = "Verification code has expired. Please request a new one."
      } else if (message.includes("already verified")) {
        errorMessage = "Email is already verified. You can now log in."
      } else {
        errorMessage = error.message
      }
    }

    return { error: errorMessage }
  }
}

export async function resendOTPAction(formData: FormData) {
  const email = formData.get("email") as string

  console.log("📧 Resend OTP action called for:", email)

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const response = await resendOTP(email)
    console.log("✅ Resend OTP successful:", response)
    return { success: response.message }
  } catch (error) {
    console.error("💥 Resend OTP error:", error)
    let errorMessage = "Failed to resend verification code."

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("already verified")) {
        errorMessage = "Email is already verified. You can log in now."
      } else if (message.includes("rate limit")) {
        errorMessage = "Please wait before requesting another code."
      } else {
        errorMessage = error.message
      }
    }

    return { error: errorMessage }
  }
}
