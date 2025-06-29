// app/login/page.tsx
"use client"

import type React from "react"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { toast } from "sonner"
import { LoginPageSkeleton } from "@/components/ui/page-skeletons"
import { loginAction, githubLoginAction } from "./actions"
import { getUserState, saveUserState, clearUserState, setClientUser } from "@/lib/auth"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("🎉 Email verified successfully! You can now log in.", {
        duration: 5000,
      })
    }
  }, [searchParams])

  // Add this after the existing useEffect
  useEffect(() => {
    // Check if user just completed email verification and needs student verification
    const userState = getUserState()
    if (userState?.needsStudentVerification && searchParams.get("verified") === "true") {
      toast.info("Please log in to continue with student verification.", {
        duration: 5000,
      })
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("email", formData.email)
      formDataObj.append("password", formData.password)

      console.log("Attempting login for:", formData.email)
      const result = await loginAction(formDataObj)
      console.log("Login result:", result)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success("🚀 Welcome back! Redirecting...", {
          duration: 3000,
        })

        // Store user data
        if (result.user) {
          setClientUser(result.user)
        }

        // Check if user needs student verification
        if (result.needsStudentVerification) {
          console.log("User needs student verification, redirecting...")

          // Update state for student verification
          saveUserState({
            step: "verify-student",
            email: formData.email,
            needsStudentVerification: true,
          })

          router.push("/verify-student")
        } else {
          console.log("User verified, redirecting to dashboard")
          clearUserState()
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGithubLogin() {
    setIsGithubLoading(true)
    try {
      const result = await githubLoginAction()
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success && result.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } catch (error) {
      toast.error("Failed to initiate GitHub login")
    } finally {
      setIsGithubLoading(false)
    }
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
            Welcome Back
          </h2>
          <p className="animate-fade-in-delay-2" style={{ color: "var(--color-text)" }}>
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-fade-in-delay-3 group">
              <label
                className="block text-sm font-semibold mb-2 transition-colors"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Email Address
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
                placeholder="Enter your email"
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
                Password
              </label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
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
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-end animate-fade-in-delay-5">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold hover:underline transition-all duration-200 cursor-pointer"
                style={{
                  color: "var(--color-link)",
                  fontFamily: "var(--font-link)",
                }}
              >
                Forgot password?
              </Link>
            </div>

            <div className="animate-fade-in-delay-6">
              <button
                type="submit"
                disabled={isLoading}
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
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "var(--color-button-hover)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "var(--color-button)"
                  }
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center animate-fade-in-delay-7">
            <p style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold hover:underline transition-all duration-200 cursor-pointer"
                style={{
                  color: "var(--color-link)",
                  fontFamily: "var(--font-link)",
                }}
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 animate-fade-in-delay-8">
            <div className="text-center">
              <p className="text-xs mb-4" style={{ color: "var(--color-subheading)" }}>
                Or continue with
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={isLoading || isGithubLoading}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl 
                           hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 
                           flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed
                           transform hover:scale-105 active:scale-95 disabled:scale-100 cursor-pointer"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  {isGithubLoading ? "Connecting..." : "Continue with GitHub"}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl 
                           hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 
                           flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed
                           transform hover:scale-105 active:scale-95 disabled:scale-100 cursor-pointer"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
