// app/verify-student/actions.ts
"use server"

import { cookies } from "next/headers"

export async function sendStudentOTPAction(formData: FormData) {
  const studentEmail = formData.get("studentEmail") as string

  if (!studentEmail) {
    return { error: "Student email is required" }
  }

  if (!studentEmail.includes("@")) {
    return { error: "Please enter a valid email address" }
  }

  try {
    // Get the token from cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get("accessToken")?.value

    console.log("🔐 Token found:", !!token)
    console.log("🌐 Sending student OTP request to backend for:", studentEmail)

    if (!token) {
      console.log("❌ No authentication token found")
      return { error: "Please log in first to verify your student status" }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/student-verification/send-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentEmail }),
      },
    )

    console.log("📡 Student OTP Response status:", response.status)
    console.log("📋 Response headers:", Object.fromEntries(response.headers.entries()))

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

    console.log("📦 Student OTP Response data:", responseData)

    if (!response.ok) {
      let errorMessage = "Failed to send verification code."

      if (responseData) {
        if (typeof responseData === "object") {
          errorMessage = responseData.message || responseData.error || errorMessage
        } else {
          errorMessage = responseData
        }
      }

      console.error("❌ Student OTP request failed:", errorMessage)
      throw new Error(errorMessage)
    }

    // Handle response format
    if (typeof responseData === "string") {
      return { success: true, message: responseData }
    } else if (typeof responseData === "object" && responseData.message) {
      return { success: true, message: responseData.message }
    } else {
      return { success: true, message: "OTP sent to your student email. Please check your inbox." }
    }
  } catch (error) {
    console.error("💥 Student OTP send error:", error)

    let errorMessage = "Failed to send verification code."

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("already verified")) {
        errorMessage = "This email is already verified."
      } else if (message.includes("rate limit")) {
        errorMessage = "Please wait before requesting another code."
      } else if (message.includes("invalid email")) {
        errorMessage = "Please enter a valid VIT student email address."
      } else if (message.includes("log in") || message.includes("unauthorized")) {
        errorMessage = "Please log in first to verify your student status."
      } else {
        errorMessage = error.message
      }
    }

    return { error: errorMessage }
  }
}

export async function verifyStudentOTPAction(formData: FormData) {
  const studentEmail = formData.get("studentEmail") as string
  const otp = formData.get("otp") as string
  const universityId = formData.get("universityId") as string
  const department = formData.get("department") as string
  const graduationYear = formData.get("graduationYear") as string

  if (!studentEmail || !otp) {
    return { error: "Student email and OTP are required" }
  }

  if (otp.length !== 6) {
    return { error: "OTP must be 6 digits" }
  }

  try {
    // Get the token from cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get("accessToken")?.value

    console.log("🔐 Token found for verification:", !!token)
    console.log("🌐 Sending student OTP verification to backend for:", studentEmail)

    if (!token) {
      console.log("❌ No authentication token found for verification")
      return { error: "Please log in first to verify your student status" }
    }

    const verificationData = {
      studentEmail,
      otp,
      ...(universityId && { universityId }),
      ...(department && { department }),
      ...(graduationYear && { graduationYear: Number.parseInt(graduationYear) }),
    }

    console.log("📦 Verification data:", { ...verificationData, otp: "[HIDDEN]" })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/student-verification/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(verificationData),
      },
    )

    console.log("📡 Student verification response status:", response.status)
    console.log("📋 Response headers:", Object.fromEntries(response.headers.entries()))

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

    console.log("📦 Student verification response data:", responseData)

    if (!response.ok) {
      let errorMessage = "Student verification failed. Please try again."

      if (responseData) {
        if (typeof responseData === "object") {
          errorMessage = responseData.message || responseData.error || errorMessage
        } else {
          errorMessage = responseData
        }
      }

      console.error("❌ Student verification failed:", errorMessage)
      throw new Error(errorMessage)
    }

    // Handle response format
    if (typeof responseData === "string") {
      return { success: true, message: responseData }
    } else if (typeof responseData === "object" && responseData.message) {
      return { success: true, message: responseData.message }
    } else {
      return { success: true, message: "Student verification successful! You are now a verified VIT student." }
    }
  } catch (error) {
    console.error("💥 Student verification error:", error)

    let errorMessage = "Student verification failed. Please try again."

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("invalid otp") || message.includes("incorrect")) {
        errorMessage = "Invalid verification code. Please check and try again."
      } else if (message.includes("expired")) {
        errorMessage = "Verification code has expired. Please request a new one."
      } else if (message.includes("already verified")) {
        errorMessage = "Student email is already verified."
      } else if (message.includes("log in") || message.includes("unauthorized")) {
        errorMessage = "Please log in first to verify your student status."
      } else {
        errorMessage = error.message
      }
    }

    return { error: errorMessage }
  }
}
