// app/signup/actions.ts
"use server"

import { redirect } from "next/navigation"
import { registerUser } from "@/lib/auth"

export async function signupAction(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validation
  if (!firstName || !lastName || !email || !password) {
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
    // Combine firstName and lastName into name field as expected by backend
    const userData = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim().toLowerCase(),
      password,
    }

    const response = await registerUser(userData)

    // Redirect to verification page with email and success message
    redirect(`/verify-email?email=${encodeURIComponent(email)}&message=${encodeURIComponent(response.message)}`)
  } catch (error) {
    // Parse and return user-friendly error messages
    let errorMessage = "Registration failed. Please try again."

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("email already exists") || message.includes("already registered")) {
        errorMessage = "An account with this email already exists. Try logging in instead."
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
