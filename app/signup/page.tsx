"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { toast } from "sonner"
import { TermsModal } from "@/components/ui/terms-modal"
import { PasswordStrength } from "@/components/ui/password-strength"
import { PasswordMatch } from "@/components/ui/password-match"
import { OTPInput } from "@/components/ui/otp-input"
import { signupAction, verifyEmailAction, resendOtpAction } from "./actions"

interface SignupState {
  step: "form" | "verify-email"
  email?: string
  formData?: {
    firstName: string
    middleName: string
    lastName: string
    email: string
    phoneNumber: string
  }
  timestamp?: number
}

const SIGNUP_STATE_KEY = "dealharbor_signup_state"
const STATE_EXPIRY_HOURS = 24

function SignupForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"form" | "verify-email">("form")
  const [isLoading, setIsLoading] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isInitializing, setIsInitializing] = useState(true)

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  })

  // Save signup state to localStorage
  const saveSignupState = (state: SignupState) => {
    try {
      localStorage.setItem(
        SIGNUP_STATE_KEY,
        JSON.stringify({
          ...state,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      console.error("Failed to save signup state:", error)
    }
  }

  // Load signup state from localStorage
  const loadSignupState = (): SignupState | null => {
    try {
      const saved = localStorage.getItem(SIGNUP_STATE_KEY)
      if (!saved) return null

      const state: SignupState = JSON.parse(saved)

      // Check if state has expired (24 hours)
      if (state.timestamp && Date.now() - state.timestamp > STATE_EXPIRY_HOURS * 60 * 60 * 1000) {
        localStorage.removeItem(SIGNUP_STATE_KEY)
        return null
      }

      return state
    } catch (error) {
      console.error("Failed to load signup state:", error)
      localStorage.removeItem(SIGNUP_STATE_KEY)
      return null
    }
  }

  // Clear signup state
  const clearSignupState = () => {
    try {
      localStorage.removeItem(SIGNUP_STATE_KEY)
    } catch (error) {
      console.error("Failed to clear signup state:", error)
    }
  }

  // Initialize component and check for existing signup state
  useEffect(() => {
    const initializeSignup = async () => {
      try {
        const savedState = loadSignupState()

        if (savedState) {
          console.log("Found saved signup state:", savedState)

          if (savedState.step === "verify-email" && savedState.email) {
            // User was in the middle of email verification
            setRegisteredEmail(savedState.email)
            setCurrentStep("verify-email")

            if (savedState.formData) {
              setFormData(savedState.formData)
            }

            toast.info("Continuing your signup process. Please verify your email.")
          } else if (savedState.formData) {
            // User was filling the form
            setFormData(savedState.formData)
            setTermsAccepted(true) // They must have accepted terms to get this far
            toast.info("Your form data has been restored.")
          }
        }
      } catch (error) {
        console.error("Error initializing signup:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeSignup()
  }, [])

  // Auto-save form data as user types
  useEffect(() => {
    if (!isInitializing && (formData.firstName || formData.lastName || formData.email)) {
      const timeoutId = setTimeout(() => {
        saveSignupState({
          step: "form",
          formData,
        })
      }, 1000) // Debounce for 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [formData, isInitializing])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions to continue")
      return
    }

    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("firstName", formData.firstName.trim())
      formDataObj.append("middleName", formData.middleName.trim())
      formDataObj.append("lastName", formData.lastName.trim())
      formDataObj.append("email", formData.email.trim().toLowerCase())
      formDataObj.append("phoneNumber", formData.phoneNumber.trim())
      formDataObj.append("password", password)
      formDataObj.append("confirmPassword", confirmPassword)

      const result = await signupAction(formDataObj)

      if (result?.error) {
        toast.error(result.error)
        if (result.redirectToLogin) {
          setTimeout(() => {
            clearSignupState()
            router.push("/login")
          }, 2000)
        }
      } else if (result?.success) {
        const email = result.email || formData.email.trim().toLowerCase()

        // ALL emails now go to OTP verification step
        toast.success("Account created successfully! Please check your email for verification code.", {
          duration: 5000,
        })

        // Check if it's a university email to show additional info
        const isUniversityEmail =
          email.toLowerCase().includes("@vitstudent.ac.in") ||
          email.toLowerCase().includes("@vit.ac.in") ||
          email.toLowerCase().includes("@vitchennai.ac.in")

        if (isUniversityEmail) {
          toast.info(
            "VIT email detected! Your student status will be automatically verified after email confirmation.",
            {
              duration: 7000,
            },
          )
        }

        setRegisteredEmail(email)
        setCurrentStep("verify-email")

        // Save state for email verification step
        saveSignupState({
          step: "verify-email",
          email,
          formData,
        })
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    setOtpError("")

    try {
      const result = await verifyEmailAction(registeredEmail, otp)

      if (result?.error) {
        setOtpError(result.error)
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.message || "Email verified successfully! You can now log in.", {
          duration: 5000,
        })
        clearSignupState()
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      const errorMsg = "An unexpected error occurred. Please try again."
      setOtpError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return

    setIsLoading(true)

    try {
      const result = await resendOtpAction(registeredEmail)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success("New OTP sent successfully!")
        setResendCooldown(60) // 60 second cooldown
        setOtp("")
        setOtpError("")
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast.error("Failed to resend OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleTermsAccept() {
    setTermsAccepted(true)
    setShowTermsModal(false)
    toast.success("Terms accepted! You can now create your account.")
  }

  function handleBackToForm() {
    setCurrentStep("form")
    setOtp("")
    setOtpError("")
    // Keep the saved state for form data
    saveSignupState({
      step: "form",
      formData,
    })
  }

  const isFormValid =
    termsAccepted &&
    password === confirmPassword &&
    password.length >= 8 &&
    formData.firstName.length >= 2 &&
    formData.lastName.length >= 2 &&
    formData.email.includes("@") &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

  // Show loading spinner during initialization
  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p style={{ color: "var(--color-text)" }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (currentStep === "verify-email") {
    // Check if it's a university email for display
    const isUniversityEmail =
      registeredEmail.toLowerCase().includes("@vitstudent.ac.in") ||
      registeredEmail.toLowerCase().includes("@vit.ac.in") ||
      registeredEmail.toLowerCase().includes("@vitchennai.ac.in")

    return (
      <div
        className="min-h-screen flex items-center justify-center py-6 px-4"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-heading)",
              }}
            >
              Verify Your Email
            </h1>
            <p className="text-sm mb-1" style={{ color: "var(--color-text)" }}>
              We've sent a 6-digit verification code to
            </p>
            <p className="font-semibold text-sm break-all" style={{ color: "var(--color-subheading)" }}>
              {registeredEmail}
            </p>
            {isUniversityEmail && (
              <p className="text-xs mt-2 p-2 bg-blue-50 text-blue-700 rounded-lg">
                🎓 VIT email detected! Your student status will be automatically verified after confirmation.
              </p>
            )}
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-3 text-center"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Enter Verification Code
                </label>
                <OTPInput value={otp} onChange={setOtp} length={6} disabled={isLoading} autoFocus={true} />
                {otpError && (
                  <p className="mt-2 text-sm text-center" style={{ color: "#ef4444" }}>
                    {otpError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || isLoading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white
                         focus:outline-none focus:ring-2 focus:ring-opacity-50 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-md hover:shadow-lg"
                style={
                  {
                    backgroundColor: "var(--color-button)",
                    fontFamily: "var(--font-button)",
                    "--tw-ring-color": "var(--color-button)",
                  } as React.CSSProperties
                }
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="text-center space-y-2">
                <p className="text-xs" style={{ color: "var(--color-text)" }}>
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm font-semibold hover:underline transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: "var(--color-link)",
                    fontFamily: "var(--font-link)",
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="text-sm hover:underline transition-all duration-200"
                  style={{
                    color: "var(--color-subheading)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  ← Back to signup form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center py-6 px-4"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="max-w-4xl w-full">
          <div className="text-center mb-6">
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-heading)",
              }}
            >
              DealHarbor
            </h1>
            <h2
              className="text-xl font-semibold mb-2"
              style={{
                fontFamily: "var(--font-subheading)",
                color: "var(--color-subheading)",
              }}
            >
              Join the VIT Marketplace
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              Create your account to start buying and selling with fellow VIT students
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 max-w-3xl mx-auto border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1"
                    style={{
                      color: "var(--color-text)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400"
                    style={
                      {
                        fontFamily: "var(--font-body)",
                        "--tw-ring-color": "var(--color-button)",
                      } as React.CSSProperties
                    }
                    placeholder="John"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-1"
                    style={{
                      color: "var(--color-text)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Middle Name
                  </label>
                  <input
                    type="text"
                    disabled={isLoading}
                    value={formData.middleName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, middleName: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400"
                    style={
                      {
                        fontFamily: "var(--font-body)",
                        "--tw-ring-color": "var(--color-button)",
                      } as React.CSSProperties
                    }
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-1"
                    style={{
                      color: "var(--color-text)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400"
                    style={
                      {
                        fontFamily: "var(--font-body)",
                        "--tw-ring-color": "var(--color-button)",
                      } as React.CSSProperties
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1"
                    style={{
                      color: "var(--color-text)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400"
                    style={
                      {
                        fontFamily: "var(--font-body)",
                        "--tw-ring-color": "var(--color-button)",
                      } as React.CSSProperties
                    }
                    placeholder="john.doe@vitstudent.ac.in"
                  />
                  <p className="mt-1 text-xs" style={{ color: "var(--color-subheading)" }}>
                    VIT emails get automatic student verification
                  </p>
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-1"
                    style={{
                      color: "var(--color-text)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    disabled={isLoading}
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400"
                    style={
                      {
                        fontFamily: "var(--font-body)",
                        "--tw-ring-color": "var(--color-button)",
                      } as React.CSSProperties
                    }
                    placeholder="+91 98765 43210"
                  />
                  <p className="mt-1 text-xs" style={{ color: "var(--color-subheading)" }}>
                    For better communication
                  </p>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1"
                    style={{
                      color: "var(--color-text)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400"
                    style={
                      {
                        fontFamily: "var(--font-body)",
                        "--tw-ring-color": "var(--color-button)",
                      } as React.CSSProperties
                    }
                    placeholder="Create a strong password"
                  />
                  <PasswordStrength password={password} />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-1"
                    style={{
                      color: "var(--color-text)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400"
                    style={
                      {
                        fontFamily: "var(--font-body)",
                        "--tw-ring-color": "var(--color-button)",
                      } as React.CSSProperties
                    }
                    placeholder="Confirm your password"
                  />
                  <PasswordMatch password={password} confirmPassword={confirmPassword} />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 mt-0.5 rounded border-2 border-gray-300 
                           focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed 
                           transition-all duration-200"
                  style={
                    {
                      accentColor: "var(--color-button)",
                      "--tw-ring-color": "var(--color-button)",
                    } as React.CSSProperties
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm cursor-pointer"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-semibold hover:underline transition-all duration-200"
                    style={{
                      color: "var(--color-link)",
                      fontFamily: "var(--font-link)",
                    }}
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-semibold hover:underline transition-all duration-200"
                    style={{
                      color: "var(--color-link)",
                      fontFamily: "var(--font-link)",
                    }}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-white
                           focus:outline-none focus:ring-2 focus:ring-opacity-50 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 shadow-md hover:shadow-lg"
                  style={
                    {
                      backgroundColor: "var(--color-button)",
                      fontFamily: "var(--font-button)",
                      "--tw-ring-color": "var(--color-button)",
                    } as React.CSSProperties
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold hover:underline transition-all duration-200"
                  style={{
                    color: "var(--color-link)",
                    fontFamily: "var(--font-link)",
                  }}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} onAccept={handleTermsAccept} />
    </>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p style={{ color: "var(--color-text)" }}>Loading signup...</p>
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
