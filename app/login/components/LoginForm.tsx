"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Sparkles, X } from "lucide-react"
import { loginUser, checkEmailExists } from "../actions"
import { toast } from "sonner"

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [emailCheckStatus, setEmailCheckStatus] = useState<"idle" | "checking" | "exists" | "not-exists">("idle")

  // Handle redirect messages
  const message = searchParams.get("message")
  const redirectFrom = searchParams.get("from")

  useEffect(() => {
    // Auto-focus email field
    const emailInput = document.getElementById("email")
    if (emailInput) {
      emailInput.focus()
    }

    // Show success message if present
    if (message) {
      toast.success(message)
    }
  }, [message])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailBlur = async () => {
    if (formData.email && validateEmail(formData.email)) {
      setEmailCheckStatus("checking")
      try {
        const response = await checkEmailExists(formData.email)
        console.log("Email check response:", response) // Debug log

        setEmailCheckStatus(response.exists ? "exists" : "not-exists")

        if (!response.exists) {
          setErrors((prev) => ({
            ...prev,
            email: "No account found with this email. Would you like to sign up?",
          }))
        } else {
          setErrors((prev) => ({
            ...prev,
            email: undefined,
          }))
        }
      } catch (error) {
        console.error("Email check error:", error)
        setEmailCheckStatus("idle")
        toast.error("Unable to verify email. Please try again.")
      }
    }
  }

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field-specific errors
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Reset email check status when email changes
    if (field === "email") {
      setEmailCheckStatus("idle")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    startTransition(async () => {
      setErrors({})

      try {
        const result = await loginUser({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        })

        if (result.success) {
          toast.success("Welcome back! Signing you in...")

          // Check if student verification is needed
          // if (result.needsStudentVerification) {
          //   router.push("/verify-student?from=login")
          //   return
          // }
            // Check if student verification is needed
            if (result.needsStudentVerification) {
            router.push("/verify-student?from=login");
            return;
            }

          // Redirect to intended page or profile
          const redirectTo = redirectFrom || "/profile"
          router.push(redirectTo)
        } else if (result.redirectToSignup) {
          // Redirect to signup with email prefilled
          const params = new URLSearchParams()
          params.set("email", formData.email)
          if (redirectFrom) params.set("from", redirectFrom)
          router.push(`/signup?${params.toString()}`)
        } else {
          setErrors({ general: result.error || "Login failed. Please try again." })
          toast.error(result.error || "Login failed. Please try again.")
        }
      } catch (error) {
        console.error("Login error:", error)
        const errorMessage = "An unexpected error occurred. Please try again."
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      }
    })
  }

  const handleSignUpRedirect = () => {
    const params = new URLSearchParams()
    if (formData.email) params.set("email", formData.email)
    if (redirectFrom) params.set("from", redirectFrom)

    router.push(`/signup?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-red-800 font-body">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-heading font-body">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-600 group-focus-within:text-button transition-colors" />
          </div>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            onBlur={handleEmailBlur}
            className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl font-body text-text placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-button transition-all duration-200 bg-white/80 backdrop-blur-sm ${
              errors.email
                ? "border-red-300 bg-red-50/50 focus:border-red-400"
                : "border-gray-300 hover:border-gray-400 focus:border-button"
            }`}
            placeholder="Enter your email address"
            disabled={isPending}
          />

          {/* Email Status Indicator */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {emailCheckStatus === "checking" && (
              <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-button rounded-full"></div>
            )}
            {emailCheckStatus === "exists" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {emailCheckStatus === "not-exists" && <X className="h-5 w-5 text-red-500" />}
          </div>
        </div>

        {errors.email && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 font-body">{errors.email}</p>
            </div>
            {emailCheckStatus === "not-exists" && (
              <button
                type="button"
                onClick={handleSignUpRedirect}
                className="text-sm text-link hover:text-button font-link font-medium hover:underline transition-colors"
              >
                Sign up instead
              </button>
            )}
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-heading font-body">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-600 group-focus-within:text-button transition-colors" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl font-body text-text placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-button transition-all duration-200 bg-white/80 backdrop-blur-sm ${
              errors.password
                ? "border-red-300 bg-red-50/50 focus:border-red-400"
                : "border-gray-300 hover:border-gray-400 focus:border-button"
            }`}
            placeholder="Enter your password"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            disabled={isPending}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {errors.password && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600 font-body">{errors.password}</p>
          </div>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
            className="h-4 w-4 text-button border-2 border-gray-300 rounded focus:ring-button focus:ring-2 focus:ring-offset-0 transition-colors"
            disabled={isPending}
          />
          <span className="text-sm text-text font-body group-hover:text-heading transition-colors">Remember me</span>
        </label>

        <a
          href="/forgot-password"
          className="text-sm text-link font-link font-medium hover:text-button transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
        >
          Forgot password?
        </a>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={isPending || emailCheckStatus === "checking"}
        className="w-full py-4 px-6 bg-gradient-to-r from-button to-button-hover text-white font-button font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-button/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        {isPending ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Signing in...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>Sign In</span>
            <Sparkles className="h-4 w-4" />
          </div>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <span className="text-sm text-subheading font-subheading px-4 bg-white/80 rounded-full backdrop-blur-sm">
          or continue with
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="py-3 px-4 border-2 border-gray-300 rounded-xl font-body text-text hover:bg-white/80 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 hover:shadow-md group bg-white/60 backdrop-blur-sm"
          disabled={isPending}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
            <span className="text-sm">Google</span>
          </div>
        </button>

        <button
          type="button"
          className="py-3 px-4 border-2 border-gray-300 rounded-xl font-body text-text hover:bg-white/80 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 hover:shadow-md group bg-white/60 backdrop-blur-sm"
          disabled={isPending}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-sm">GitHub</span>
          </div>
        </button>
      </div>
    </form>
  )
}
