// app/verify-email/actions.ts
"use server"

import { redirect } from "next/navigation"
import { verifyEmail, resendOTP } from "@/lib/auth"

export async function verifyEmailAction(formData: FormData) {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string

  if (!email || !otp) {
    return { error: "Please enter the verification code" }
  }

  if (otp.length !== 6) {
    return { error: "Verification code must be 6 digits" }
  }

  try {
    const response = await verifyEmail(email, otp)
    redirect(`/login?verified=true&message=${encodeURIComponent(response.message)}`)
  } catch (error) {
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

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const response = await resendOTP(email)
    return { success: response.message }
  } catch (error) {
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
