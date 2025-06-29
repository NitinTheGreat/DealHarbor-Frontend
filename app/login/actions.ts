// app/login/actions.ts
"use server"

import { redirect } from "next/navigation"
import { loginUser, setAuthCookies } from "@/lib/auth"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Please enter both email and password" }
  }

  // Basic email validation
  if (!email.includes("@")) {
    return { error: "Please enter a valid email address" }
  }

  try {
    const loginResponse = await loginUser(email, password)
    await setAuthCookies(loginResponse)

    // Redirect to dashboard or home page after successful login
    redirect("/dashboard")
  } catch (error) {
    // Parse and return user-friendly error messages
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
