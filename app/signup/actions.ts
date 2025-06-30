"use server"

interface RegisterRequest {
  email: string
  password: string
  name: string
}

interface OtpVerifyRequest {
  email: string
  otp: string
}

interface ResendOtpRequest {
  email: string
}

export async function signupAction(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const middleName = formData.get("middleName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  console.log("Signup action called for:", email)

  // Validation
  if (!firstName || !lastName || !email || !password) {
    console.error("Missing required fields")
    return { error: "Please fill in all required fields" }
  }

  if (firstName.length < 2) {
    return { error: "First name must be at least 2 characters long" }
  }

  if (lastName.length < 2) {
    return { error: "Last name must be at least 2 characters long" }
  }

  if (!email.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    console.log("Checking if email exists:", email)

    // Check if email already exists and is verified
    try {
      const emailCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      if (emailCheckResponse.ok) {
        const emailCheck = await emailCheckResponse.json()
        console.log("Email check result:", emailCheck)

        if (emailCheck.exists && emailCheck.verified) {
          console.log("Email already exists and is verified")
          return {
            error: "An account with this email already exists and is verified. Please log in instead.",
            redirectToLogin: true,
          }
        }
      }
    } catch (emailCheckError) {
      console.warn("Email check failed, continuing with registration:", emailCheckError)
    }

    // Build full name
    const fullName = middleName
      ? `${firstName.trim()} ${middleName.trim()} ${lastName.trim()}`
      : `${firstName.trim()} ${lastName.trim()}`

    const registerRequest: RegisterRequest = {
      name: fullName,
      email: email.trim().toLowerCase(),
      password,
    }

    console.log("Registering user with data:", { ...registerRequest, password: "[HIDDEN]" })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerRequest),
    })

    console.log("Registration response status:", response.status)

    if (!response.ok) {
      let errorText: string
      try {
        const errorData = await response.json()
        errorText = errorData.message || errorData.error || `HTTP ${response.status}`
      } catch {
        errorText = await response.text()
      }

      console.error("Registration failed:", errorText)

      if (response.status === 400) {
        if (
          errorText.toLowerCase().includes("email already exists") ||
          errorText.toLowerCase().includes("already registered")
        ) {
          return {
            error: "An account with this email already exists. Try logging in instead.",
            redirectToLogin: true,
          }
        } else if (errorText.toLowerCase().includes("invalid email")) {
          return { error: "Please enter a valid email address." }
        } else if (errorText.toLowerCase().includes("weak password")) {
          return { error: "Password is too weak. Please choose a stronger password." }
        }
      }

      return { error: errorText || "Registration failed. Please try again." }
    }

    let result: any
    try {
      result = await response.json()
    } catch (parseError) {
      console.error("Failed to parse registration response:", parseError)
      // If we can't parse the response but got a 200, assume success
      result = { message: "Registration successful!" }
    }

    console.log("Registration successful:", result)

    // ALL emails need OTP verification - no auto-verification during registration
    // University emails will be auto-verified as students AFTER OTP verification
    return {
      success: true,
      message: result.message || "Registration successful!",
      email: email.trim().toLowerCase(),
      isAutoVerified: false, // Always require OTP verification first
    }
  } catch (error) {
    console.error("Signup error:", error)

    let errorMessage = "Registration failed. Please check your connection and try again."

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("fetch")) {
        errorMessage = "Connection error. Please check your internet and try again."
      } else if (message.includes("email already exists") || message.includes("already registered")) {
        return {
          error: "An account with this email already exists. Try logging in instead.",
          redirectToLogin: true,
        }
      } else {
        errorMessage = error.message
      }
    }

    return { error: errorMessage }
  }
}

export async function verifyEmailAction(email: string, otp: string) {
  try {
    console.log("Verifying email OTP for:", email, "with OTP:", otp)

    const verifyRequest: OtpVerifyRequest = {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    }

    console.log("Sending verification request:", verifyRequest)

    // Using the correct backend endpoint /api/auth/verify
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyRequest),
    })

    console.log("Verification response status:", response.status)
    console.log("Verification response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorText: string
      try {
        const errorData = await response.json()
        errorText = errorData.message || errorData.error || `HTTP ${response.status}`
        console.error("Verification error response:", errorData)
      } catch {
        errorText = await response.text()
        console.error("Verification error text:", errorText)
      }

      console.error("Email verification failed:", errorText)

      if (response.status === 400) {
        if (errorText.toLowerCase().includes("invalid otp") || errorText.toLowerCase().includes("invalid")) {
          return { error: "Invalid OTP. Please check and try again." }
        } else if (errorText.toLowerCase().includes("expired")) {
          return { error: "OTP has expired. Please request a new one." }
        } else if (errorText.toLowerCase().includes("not found")) {
          return { error: "Email not found. Please sign up first." }
        }
      }

      return { error: errorText || "Verification failed. Please try again." }
    }

    // Handle successful response
    let result: any
    try {
      const responseText = await response.text()
      console.log("Verification response text:", responseText)

      // Backend returns plain text: "Email verified successfully. You can now log in."
      result = { message: responseText }
    } catch (parseError) {
      console.error("Failed to parse verification response:", parseError)
      result = { message: "Email verified successfully!" }
    }

    console.log("Email verification successful:", result)

    // Check if it's a university email to show appropriate success message
    const isUniversityEmail =
      email.toLowerCase().includes("@vitstudent.ac.in") ||
      email.toLowerCase().includes("@vit.ac.in") ||
      email.toLowerCase().includes("@vitchennai.ac.in")

    const successMessage = isUniversityEmail
      ? "Email verified successfully! Your VIT student status has been automatically verified. You can now log in."
      : "Email verified successfully! You can now log in."

    return {
      success: true,
      message: successMessage,
    }
  } catch (error) {
    console.error("Email verification error:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

export async function resendOtpAction(email: string) {
  try {
    console.log("Resending OTP for:", email)

    const resendRequest: ResendOtpRequest = {
      email: email.trim().toLowerCase(),
    }

    console.log("Sending resend OTP request:", resendRequest)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendRequest),
    })

    console.log("Resend OTP response status:", response.status)

    if (!response.ok) {
      let errorText: string
      try {
        const errorData = await response.json()
        errorText = errorData.message || errorData.error || `HTTP ${response.status}`
      } catch {
        errorText = await response.text()
      }

      console.error("Resend OTP failed:", errorText)

      if (response.status === 400) {
        if (errorText.toLowerCase().includes("already verified")) {
          return { error: "Email is already verified. Please try logging in." }
        } else if (errorText.toLowerCase().includes("not found")) {
          return { error: "Email not found. Please sign up first." }
        }
      }

      return { error: errorText || "Failed to resend OTP. Please try again." }
    }

    // Handle successful response
    let result: any
    try {
      const responseText = await response.text()
      console.log("Resend OTP response text:", responseText)

      // Backend returns plain text: "New OTP sent to email."
      result = { message: responseText }
    } catch (parseError) {
      console.error("Failed to parse resend OTP response:", parseError)
      result = { message: "New OTP sent successfully!" }
    }

    console.log("OTP resent successfully:", result)

    return {
      success: true,
      message: result.message || "New OTP sent successfully!",
    }
  } catch (error) {
    console.error("Resend OTP error:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

export async function checkEmailExists(email: string) {
  try {
    if (!email.trim()) {
      return { exists: false, verified: false }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })

    if (!response.ok) {
      return { exists: false, verified: false }
    }

    const data = await response.json()
    return { exists: data.exists || false, verified: data.verified || false }
  } catch (error) {
    console.error("Email check error:", error)
    return { exists: false, verified: false }
  }
}

// registerUser function that matches the expected return structure
export async function registerUser(userData: { name: string; email: string; password: string; phoneNumber?: string }) {
  try {
    console.log("Registering user with data:", { ...userData, password: "[HIDDEN]" })

    // Check if email already exists and is verified
    try {
      const emailCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userData.email.trim().toLowerCase() }),
      })

      if (emailCheckResponse.ok) {
        const emailCheck = await emailCheckResponse.json()
        console.log("Email check result:", emailCheck)

        if (emailCheck.exists && emailCheck.verified) {
          console.log("Email already exists and is verified")
          return {
            success: false,
            error: "An account with this email already exists and is verified. Please log in instead.",
            email: userData.email.trim().toLowerCase(),
          }
        }
      }
    } catch (emailCheckError) {
      console.warn("Email check failed, continuing with registration:", emailCheckError)
    }

    const registerRequest: RegisterRequest = {
      name: userData.name,
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerRequest),
    })

    if (!response.ok) {
      let errorText: string
      try {
        const errorData = await response.json()
        errorText = errorData.message || errorData.error || `HTTP ${response.status}`
      } catch {
        errorText = await response.text()
      }

      console.error("Registration failed:", errorText)

      if (response.status === 400 && errorText.toLowerCase().includes("email already exists")) {
        return {
          success: false,
          error: "An account with this email already exists. Try logging in instead.",
          email: userData.email.trim().toLowerCase(),
        }
      }

      return {
        success: false,
        error: errorText || "Registration failed. Please try again.",
        email: userData.email.trim().toLowerCase(),
      }
    }

    let result: any
    try {
      result = await response.json()
    } catch (parseError) {
      console.error("Failed to parse registration response:", parseError)
      result = { message: "Registration successful!" }
    }

    console.log("Registration successful:", result)

    // ALL emails need OTP verification - no auto-verification during registration
    return {
      success: true,
      message: result.message || "Registration successful!",
      email: userData.email.trim().toLowerCase(),
      isAutoVerified: false, // Always require OTP verification first
    }
  } catch (error) {
    console.error("Register user error:", error)

    let errorMessage = "Registration failed. Please check your connection and try again."

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("fetch")) {
        errorMessage = "Connection error. Please check your internet and try again."
      } else if (message.includes("email already exists") || message.includes("already registered")) {
        errorMessage = "An account with this email already exists. Try logging in instead."
      } else {
        errorMessage = error.message
      }
    }

    return {
      success: false,
      error: errorMessage,
      email: userData.email.trim().toLowerCase(),
    }
  }
}
