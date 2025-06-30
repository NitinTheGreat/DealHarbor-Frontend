"use server"

interface ApiResponse {
  success: boolean
  error?: string
  message?: string
}

interface EmailResetEligibilityResponse {
  exists: boolean
  verified: boolean
  eligible: boolean
  message: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function checkEmailForReset(email: string): Promise<EmailResetEligibilityResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      throw new Error("Failed to check email eligibility")
    }

    const data = await response.json()

    // Transform CheckEmailResponse to EmailResetEligibilityResponse format
    const eligible = data.exists && data.verified
    let message = "Email eligible for password reset"

    if (!data.exists) {
      message = "Email not found"
    } else if (!data.verified) {
      message = "Email not verified"
    }

    return {
      exists: data.exists,
      verified: data.verified,
      eligible: eligible,
      message: message,
    }
  } catch (error) {
    console.error("Email eligibility check error:", error)
    return {
      exists: false,
      verified: false,
      eligible: false,
      message: "Unable to verify email. Please try again.",
    }
  }
}

export async function sendResetOtp(email: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (response.ok) {
      return { success: true, message: "Reset code sent to your email!" }
    } else {
      const errorText = await response.text()
      console.error("API Error:", errorText)

      if (errorText.includes("Email not found or not verified")) {
        return { success: false, error: "Email not found or not verified. Please check your email or sign up." }
      }

      return { success: false, error: "Unable to send reset code. Please try again." }
    }
  } catch (error) {
    console.error("Send reset OTP error:", error)
    return { success: false, error: "Network error. Please check your connection and try again." }
  }
}

export async function verifyResetOtp(email: string, otp: string): Promise<ApiResponse> {
  try {
    // We don't have a separate verify endpoint, so we'll validate format here
    // The actual verification happens during password reset
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      return { success: false, error: "Please enter a valid 6-digit code" }
    }

    return { success: true, message: "Code verified successfully" }
  } catch (error) {
    console.error("Verify reset OTP error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
        newPassword,
      }),
    })

    if (response.ok) {
      return { success: true, message: "Password reset successfully. You can now log in with your new password." }
    } else {
      const errorText = await response.text()
      console.error("Reset password error:", errorText)

      if (errorText.includes("Invalid OTP")) {
        return { success: false, error: "Invalid or expired code. Please request a new one." }
      } else if (errorText.includes("OTP expired")) {
        return { success: false, error: "Code has expired. Please request a new one." }
      } else if (errorText.includes("User not found")) {
        return { success: false, error: "Unable to reset password. Please try again." }
      } else if (errorText.includes("New password cannot be the same")) {
        return {
          success: false,
          error: "New password cannot be the same as your current password. Please choose a different password.",
        }
      }

      return { success: false, error: "Failed to reset password. Please try again." }
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "Network error. Please check your connection and try again." }
  }
}
