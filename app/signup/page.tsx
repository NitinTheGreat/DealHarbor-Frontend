// app/signup/page.tsx
"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { toast } from "sonner"
import { TermsModal } from "@/components/ui/terms-modal"
import { PasswordStrength } from "@/components/ui/password-strength"
import { PasswordMatch } from "@/components/ui/password-match"
import { SignupPageSkeleton } from "@/components/ui/page-skeletons"
import { signupAction } from "./actions"
import { saveUserState, getUserState } from "@/lib/auth"

function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  })

  // Check for existing state on mount
  useEffect(() => {
    const existingState = getUserState()
    if (existingState) {
      if (existingState.step === "verify-email" && existingState.email) {
        // Redirect to email verification
        const params = new URLSearchParams({
          email: existingState.email,
          ...(existingState.password && { password: existingState.password }),
          ...(existingState.needsStudentVerification && { needsStudentVerification: "true" }),
        })
        router.push(`/verify-email?${params.toString()}`)
        return
      } else if (existingState.step === "verify-student" && existingState.studentEmail) {
        // Redirect to student verification
        router.push("/verify-student")
        return
      }
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions to continue")
      return
    }

    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("firstName", formData.firstName)
      formDataObj.append("middleName", formData.middleName)
      formDataObj.append("lastName", formData.lastName)
      formDataObj.append("email", formData.email)
      formDataObj.append("phoneNumber", formData.phoneNumber)
      formDataObj.append("password", password)
      formDataObj.append("confirmPassword", confirmPassword)

      const result = await signupAction(formDataObj)

      if (result?.error) {
        toast.error(result.error)
        if (result.redirectToLogin) {
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        }
      } else if (result?.success) {
        if (result.isAutoVerified) {
          // VIT email - auto verified, redirect to login
          toast.success("🎉 Account created and verified! Please log in to continue.", {
            duration: 5000,
          })
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        } else {
          // Regular email - needs verification
          toast.success("🎉 Account created successfully! Please check your email for verification.", {
            duration: 5000,
          })

          // Save state for page refresh handling
          saveUserState({
            step: "verify-email",
            email: result.email,
            password: password,
            needsStudentVerification: true, // Non-VIT emails need student verification
          })

          // Navigate to verification page
          const params = new URLSearchParams({
            email: result.email,
            message: result.message,
            password: password, // For auto-login after verification
            needsStudentVerification: "true",
          })

          router.push(`/verify-email?${params.toString()}`)
        }
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleTermsAccept() {
    setTermsAccepted(true)
    setShowTermsModal(false)
    toast.success("✅ Terms accepted! You can now create your account.")
  }

  const isFormValid =
    termsAccepted &&
    password === confirmPassword &&
    password.length >= 8 &&
    formData.firstName.length >= 2 &&
    formData.lastName.length >= 2 &&
    formData.email.includes("@")

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
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
              Join the VIT Marketplace
            </h2>
            <p className="animate-fade-in-delay-2" style={{ color: "var(--color-text)" }}>
              Create your account to start buying and selling with fellow VIT students
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto border border-white/20 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="animate-fade-in-delay-3 group">
                  <label
                    className="block text-sm font-semibold mb-2 transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400 cursor-pointer"
                    style={
                      {
                        fontFamily: "var(--font-body)",
                        "--tw-ring-color": "var(--color-button)",
                      } as React.CSSProperties
                    }
                    placeholder="John"
                  />
                </div>

                <div className="animate-fade-in-delay-4 group">
                  <label
                    className="block text-sm font-semibold mb-2 transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400 cursor-pointer"
                    style={
                      {
                        fontFamily: "var(--font-body)",
                        "--tw-ring-color": "var(--color-button)",
                      } as React.CSSProperties
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="animate-fade-in-delay-5 group">
                  <label
                    className="block text-sm font-semibold mb-2 transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400 cursor-pointer"
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

              {/* Email Field */}
              <div className="animate-fade-in-delay-6 group">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                           transition-all duration-200 hover:border-gray-300 
                           disabled:bg-gray-50 disabled:cursor-not-allowed
                           placeholder:text-gray-400 cursor-pointer"
                  style={
                    {
                      fontFamily: "var(--font-body)",
                      "--tw-ring-color": "var(--color-button)",
                    } as React.CSSProperties
                  }
                  placeholder="john.doe@vitstudent.ac.in or john@gmail.com"
                />
                <p className="mt-2 text-xs animate-fade-in-delay-7" style={{ color: "var(--color-subheading)" }}>
                  💡 VIT emails are auto-verified. Other emails need verification.
                </p>
              </div>

              {/* Phone Number Field */}
              <div className="animate-fade-in-delay-8 group">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                           transition-all duration-200 hover:border-gray-300 
                           disabled:bg-gray-50 disabled:cursor-not-allowed
                           placeholder:text-gray-400 cursor-pointer"
                  style={
                    {
                      fontFamily: "var(--font-body)",
                      "--tw-ring-color": "var(--color-button)",
                    } as React.CSSProperties
                  }
                  placeholder="+91 98765 43210"
                />
                <p className="mt-2 text-xs animate-fade-in-delay-9" style={{ color: "var(--color-subheading)" }}>
                  📱 For better communication with buyers/sellers
                </p>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="animate-fade-in-delay-10 group">
                  <label
                    className="block text-sm font-semibold mb-2 transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400 cursor-pointer"
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

                <div className="animate-fade-in-delay-11 group">
                  <label
                    className="block text-sm font-semibold mb-2 transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                             transition-all duration-200 hover:border-gray-300 
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             placeholder:text-gray-400 cursor-pointer"
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
              <div className="flex items-start animate-fade-in-delay-12 group">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={isLoading}
                  className="h-5 w-5 mt-1 rounded border-2 border-gray-300 
                           focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed 
                           transition-all duration-200 cursor-pointer"
                  style={
                    {
                      accentColor: "var(--color-button)",
                      "--tw-ring-color": "var(--color-button)",
                    } as React.CSSProperties
                  }
                />
                <label
                  htmlFor="terms"
                  className="ml-3 block text-sm cursor-pointer"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-semibold hover:underline transition-all duration-200 cursor-pointer"
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
                    className="font-semibold hover:underline transition-all duration-200 cursor-pointer"
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
              <div className="animate-fade-in-delay-13">
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
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
                    if (!isLoading && isFormValid) {
                      e.currentTarget.style.backgroundColor = "var(--color-button-hover)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && isFormValid) {
                      e.currentTarget.style.backgroundColor = "var(--color-button)"
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center animate-fade-in-delay-14">
              <p style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold hover:underline transition-all duration-200 cursor-pointer"
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
    <Suspense fallback={<SignupPageSkeleton />}>
      <SignupForm />
    </Suspense>
  )
}
