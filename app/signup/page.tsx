// app/signup/page.tsx
"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { TermsModal } from "@/components/ui/terms-modal"
import { PasswordStrength } from "@/components/ui/password-strength"
import { PasswordMatch } from "@/components/ui/password-match"
import { signupAction } from "./actions"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  async function handleSubmit(formData: FormData) {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions to continue")
      return
    }

    setIsLoading(true)
    try {
      const result = await signupAction(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Account created successfully! Please check your email for verification.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleTermsAccept() {
    setTermsAccepted(true)
    setShowTermsModal(false)
    toast.success("Terms accepted! You can now create your account.")
  }

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
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
              className="text-xl font-semibold mb-4"
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

          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <form action={handleSubmit} className="space-y-6">
              {/* Name Fields - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
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

              {/* Email Field - Full Width */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors
                           disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={
                    {
                      fontFamily: "var(--font-body)",
                      "--tw-ring-color": "var(--color-button)",
                    } as React.CSSProperties
                  }
                  placeholder="john.doe@vitstudent.ac.in"
                />
                <p className="mt-1 text-xs" style={{ color: "var(--color-subheading)" }}>
                  Use your VIT email for instant verification
                </p>
              </div>

              {/* Password Fields - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 mt-1 rounded border-gray-300 disabled:cursor-not-allowed"
                  style={{ accentColor: "var(--color-button)" }}
                />
                <label htmlFor="terms" className="ml-2 block text-sm" style={{ color: "var(--color-text)" }}>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="hover:underline font-medium"
                    style={{ color: "var(--color-link)" }}
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="hover:underline font-medium"
                    style={{ color: "var(--color-link)" }}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !termsAccepted || password !== confirmPassword || password.length < 8}
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: "var(--color-text)" }}>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium hover:underline transition-colors"
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
