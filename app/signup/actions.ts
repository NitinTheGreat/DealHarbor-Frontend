// app/signup/actions.ts
"use server"

import { registerUser, checkEmailExists } from "@/lib/auth"

export async function signupAction(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const middleName = formData.get("middleName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  console.log("📝 Signup action called for:", email)

  // Validation
  if (!firstName || !lastName || !email || !password) {
    console.error("❌ Missing required fields")
    return { error: "Please fill in all required fields" }
  }

  if (firstName.length < 2) {
    return { error: "First name must be at least 2 characters long" }
  }

  if (lastName.length < 2) {
    return { error: "Last name must be at least 2 characters long" }
  }

  if (!email.includes("@")) {
    return { error: "Please enter a valid email address" }
  }

  if (phoneNumber && !/^\+?[\d\s\-()]{10,15}$/.test(phoneNumber)) {
    return { error: "Please enter a valid phone number" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  // Password strength validation
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return {
      error: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }
  }

  try {
    console.log("🔍 Checking if email exists:", email)

    // Check if email already exists and is verified
    const emailCheck = await checkEmailExists(email.trim().toLowerCase())
    console.log("📧 Email check result:", emailCheck)

    if (emailCheck.exists && emailCheck.verified) {
      console.log("⚠️ Email already exists and is verified")
      return {
        error: "An account with this email already exists and is verified. Please log in instead.",
        redirectToLogin: true,
      }
    }

    // Build full name
    const fullName = middleName
      ? `${firstName.trim()} ${middleName.trim()} ${lastName.trim()}`
      : `${firstName.trim()} ${lastName.trim()}`

    const userData = {
      name: fullName,
      email: email.trim().toLowerCase(),
      password,
      ...(phoneNumber && { phoneNumber: phoneNumber.trim() }),
    }

    console.log("🚀 Registering user with data:", { ...userData, password: "[HIDDEN]" })
    const response = await registerUser(userData)
    console.log("✅ Registration successful:", response)

    return {
      success: true,
      message: response.message,
      email: email.trim().toLowerCase(),
      isAutoVerified: response.isAutoVerified || false,
    }
  } catch (error) {
    console.error("💥 Signup error:", error)

    let errorMessage = "Registration failed. Please try again."

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("email already exists") || message.includes("already registered")) {
        return {
          error: "An account with this email already exists. Try logging in instead.",
          redirectToLogin: true,
        }
      } else if (message.includes("invalid email")) {
        errorMessage = "Please enter a valid email address."
      } else if (message.includes("weak password")) {
        errorMessage = "Password is too weak. Please choose a stronger password."
      } else if (message.includes("network") || message.includes("connection")) {
        errorMessage = "Connection error. Please check your internet and try again."
      } else {
        errorMessage = error.message
      }
    }

    return { error: errorMessage }
  }
}
