// app/verify-email/page.tsx
"use client"

import type React from "react"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { verifyEmailAction, resendOTPAction } from "./actions"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const message = searchParams.get("message")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (message) {
      toast.success(message)
    }
  }, [message])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await verifyEmailAction(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Email verified successfully! Redirecting to login...")
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendOTP() {
    if (!email) return

    setIsResending(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      const result = await resendOTPAction(formData)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.success)
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
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-heading)" }}>
            Invalid Request
          </h1>
          <p className="mb-4" style={{ color: "var(--color-text)" }}>
            No email address provided for verification.
          </p>
          <Link
            href="/signup"
            className="inline-block px-4 py-2 rounded-md text-white font-semibold"
            style={{ backgroundColor: "var(--color-button)" }}
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
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
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
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: "var(--font-subheading)",
              color: "var(--color-subheading)",
            }}
          >
            Verify Your Email
          </h2>
          <p className="text-sm mb-2" style={{ color: "var(--color-text)" }}>
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-medium mb-4 text-sm" style={{ color: "var(--color-heading)" }}>
            {email}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="email" value={email} />

            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                disabled={isLoading}
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors
                         text-center text-lg font-mono tracking-widest
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={
                  {
                    fontFamily: "var(--font-body)",
                    "--tw-ring-color": "var(--color-button)",
                  } as React.CSSProperties
                }
                placeholder="123456"
              />
              <p className="mt-1 text-xs" style={{ color: "var(--color-subheading)" }}>
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-md font-semibold text-white 
                       transition-colors duration-200 hover:opacity-90 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                {
                  backgroundColor: "var(--color-button)",
                  fontFamily: "var(--font-button)",
                  "--tw-ring-color": "var(--color-button)",
                } as React.CSSProperties
              }
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              Didn't receive the code?{" "}
              <button
                onClick={handleResendOTP}
                disabled={isResending || isLoading}
                className="font-medium hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: "var(--color-link)",
                  fontFamily: "var(--font-link)",
                }}
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
            </p>

            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              Wrong email?{" "}
              <Link
                href="/signup"
                className="font-medium hover:underline transition-colors"
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
