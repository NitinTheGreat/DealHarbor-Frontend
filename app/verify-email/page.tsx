// app/verify-email/page.tsx
"use client"

import type React from "react"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { toast } from "sonner"
import { VerifyEmailSkeleton } from "@/components/ui/page-skeletons"
import { OTPInput } from "@/components/ui/otp-input"
import { verifyEmailAction, resendOTPAction } from "./actions"
import { saveUserState, clearUserState, setOTPTimer, canResendOTP, getResendTimeLeft, setClientUser } from "@/lib/auth"

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const message = searchParams.get("message")
  const password = searchParams.get("password") // For auto-login
  const needsStudentVerification = searchParams.get("needsStudentVerification") === "true"

  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [otp, setOtp] = useState("")
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (message) {
      toast.success(message)
    }

    // Start timer if needed
    if (email && !canResendOTP(email)) {
      const timeLeft = getResendTimeLeft(email)
      setResendTimer(timeLeft)
    }
  }, [message, email])

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [resendTimer])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email || "")
      formData.append("otp", otp)
      if (password) formData.append("password", password)

      console.log("🔐 Submitting verification for:", email, "with OTP:", otp, "password provided:", !!password)
      const result = await verifyEmailAction(formData)
      console.log("📧 Verification result:", result)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success("🎉 Email verified successfully!", {
          duration: 5000,
        })

        if (result.autoLogin && result.user) {
          // Store user data in localStorage for client-side access
          setClientUser(result.user)

          console.log("✅ Auto-login successful, user:", result.user)
          console.log("🎓 Needs student verification:", result.needsStudentVerification)

          if (result.needsStudentVerification) {
            toast.success("🚀 Logged in! Please verify your student status to access all features.", {
              duration: 3000,
            })

            // Update state for student verification
            saveUserState({
              step: "verify-student",
              email: email || "",
              needsStudentVerification: true,
            })

            console.log("➡️ Redirecting to student verification")
            router.push("/verify-student")
          } else {
            toast.success("🚀 Welcome to DealHarbor! Redirecting to dashboard...", {
              duration: 3000,
            })

            // Clear state and redirect to dashboard
            clearUserState()
            console.log("➡️ Redirecting to dashboard")
            router.push("/dashboard")
          }
        } else {
          // Manual login required or auto-login failed
          console.log("⚠️ Auto-login failed or not attempted, redirecting to login")

          if (result.needsStudentVerification) {
            // Save state indicating student verification is needed after login
            saveUserState({
              step: "verify-email",
              email: email || "",
              needsStudentVerification: true,
            })
          }

          router.push("/login?verified=true")
        }
      }
    } catch (error) {
      console.error("💥 Verification error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendOTP() {
    if (!email || !canResendOTP(email)) return

    setIsResending(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      const result = await resendOTPAction(formData)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success("📧 " + result.success)
        setOTPTimer(email)
        setResendTimer(60) // Start 1-minute timer
      }
    } catch (error) {
      toast.error("Failed to resend verification code.")
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <h1
            className="text-2xl font-bold mb-4"
            style={{
              color: "var(--color-heading)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Invalid Request
          </h1>
          <p className="mb-6" style={{ color: "var(--color-text)" }}>
            No email address provided for verification.
          </p>
          <Link
            href="/signup"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold
                     transform transition-all duration-200 hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: "var(--color-button)",
              fontFamily: "var(--font-button)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-button-hover)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-button)"
            }}
          >
            Go back to signup
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1
            className="text-5xl font-bold mb-3 animate-fade-in"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-heading)",
            }}
          >
            DealHarbor
          </h1>
          <h2
            className="text-2xl font-semibold mb-4 animate-fade-in-delay-1"
            style={{
              fontFamily: "var(--font-subheading)",
              color: "var(--color-subheading)",
            }}
          >
            Verify Your Email
          </h2>
          <p className="mb-2 animate-fade-in-delay-2" style={{ color: "var(--color-text)" }}>
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-semibold mb-4 animate-fade-in-delay-3" style={{ color: "var(--color-heading)" }}>
            {email}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-fade-in-delay-4 group">
              <label
                className="block text-sm font-semibold mb-4 text-center transition-colors"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Enter Verification Code
              </label>

              <OTPInput length={6} value={otp} onChange={setOtp} disabled={isLoading} autoFocus={true} />

              <p
                className="mt-4 text-xs text-center animate-fade-in-delay-5"
                style={{ color: "var(--color-subheading)" }}
              >
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <div className="animate-fade-in-delay-6">
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-4 px-6 rounded-xl font-bold text-white text-lg
                         focus:outline-none focus:ring-4 focus:ring-opacity-50 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transform transition-all duration-200 
                         hover:scale-105 active:scale-95 disabled:scale-100
                         shadow-lg hover:shadow-xl cursor-pointer"
                style={
                  {
                    backgroundColor: "var(--color-button)",
                    fontFamily: "var(--font-button)",
                    "--tw-ring-color": "var(--color-button)",
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  if (!isLoading && otp.length === 6) {
                    e.currentTarget.style.backgroundColor = "var(--color-button-hover)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && otp.length === 6) {
                    e.currentTarget.style.backgroundColor = "var(--color-button)"
                  }
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm animate-fade-in-delay-7" style={{ color: "var(--color-text)" }}>
              Didn't receive the code?{" "}
              <button
                onClick={handleResendOTP}
                disabled={isResending || isLoading || resendTimer > 0}
                className="font-semibold hover:underline transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  color: "var(--color-link)",
                  fontFamily: "var(--font-link)",
                }}
              >
                {isResending ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
              </button>
            </p>

            <p className="text-sm animate-fade-in-delay-8" style={{ color: "var(--color-text)" }}>
              Wrong email?{" "}
              <Link
                href="/signup"
                className="font-semibold hover:underline transition-all duration-200 cursor-pointer"
                style={{
                  color: "var(--color-link)",
                  fontFamily: "var(--font-link)",
                }}
              >
                Go back to signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailForm />
    </Suspense>
  )
}
