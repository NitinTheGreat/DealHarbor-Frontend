"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft, Send, Shield, X } from "lucide-react"
import { checkEmailForReset, sendResetOtp, verifyResetOtp, resetPassword } from "../actions"
import { toast } from "sonner"
import { OTPInput } from "@/components/ui/otp-input"

type Step = "email" | "otp" | "password"

interface FormData {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  otp?: string
  newPassword?: string
  confirmPassword?: string
  general?: string
}

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [formData, setFormData] = useState<FormData>({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailCheckStatus, setEmailCheckStatus] = useState<"idle" | "checking" | "eligible" | "not-eligible">("idle")
  const [otpSent, setOtpSent] = useState(false)

  // Auto-focus email field on mount
  useEffect(() => {
    const emailInput = document.getElementById("email")
    if (emailInput) {
      emailInput.focus()
    }
  }, [])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailBlur = async () => {
    if (formData.email && validateEmail(formData.email)) {
      setEmailCheckStatus("checking")
      try {
        const response = await checkEmailForReset(formData.email)
        console.log("Email eligibility check response:", response)

        if (response.eligible) {
          setEmailCheckStatus("eligible")
          setErrors((prev) => ({
            ...prev,
            email: undefined,
          }))
        } else {
          setEmailCheckStatus("not-eligible")
          let errorMessage = response.message

          if (!response.exists) {
            errorMessage = "No account found with this email. Please check your email or sign up."
          } else if (!response.verified) {
            errorMessage = "Email not verified. Please verify your email first before resetting password."
          }

          setErrors((prev) => ({
            ...prev,
            email: errorMessage,
          }))
        }
      } catch (error) {
        console.error("Email eligibility check error:", error)
        setEmailCheckStatus("idle")
        toast.error("Unable to verify email. Please try again.")
      }
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field-specific errors
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Reset email check status when email changes
    if (field === "email") {
      setEmailCheckStatus("idle")
      setOtpSent(false)
    }
  }

  const validateEmailStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    } else if (emailCheckStatus !== "eligible") {
      newErrors.email = "Please enter a valid and verified email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateOtpStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.otp) {
      newErrors.otp = "Verification code is required"
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "Please enter the complete 6-digit code"
    } else if (!/^\d+$/.test(formData.otp)) {
      newErrors.otp = "Verification code must contain only numbers"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmailStep()) return

    startTransition(async () => {
      setErrors({})

      try {
        const result = await sendResetOtp(formData.email)

        if (result.success) {
          setOtpSent(true)
          setCurrentStep("otp")
          toast.success(result.message || "Reset code sent to your email!")
        } else {
          setErrors({ general: result.error || "Failed to send reset code. Please try again." })
          toast.error(result.error || "Failed to send reset code. Please try again.")
        }
      } catch (error) {
        console.error("Send reset OTP error:", error)
        const errorMessage = "An unexpected error occurred. Please try again."
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      }
    })
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateOtpStep()) return

    startTransition(async () => {
      setErrors({})

      try {
        const result = await verifyResetOtp(formData.email, formData.otp)

        if (result.success) {
          setCurrentStep("password")
          toast.success("Code verified! Please set your new password.")
        } else {
          setErrors({ general: result.error || "Invalid verification code. Please try again." })
          toast.error(result.error || "Invalid verification code. Please try again.")
        }
      } catch (error) {
        console.error("Verify reset OTP error:", error)
        const errorMessage = "An unexpected error occurred. Please try again."
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      }
    })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordStep()) return

    startTransition(async () => {
      setErrors({})

      try {
        const result = await resetPassword(formData.email, formData.otp, formData.newPassword)

        if (result.success) {
          toast.success(result.message || "Password reset successfully!")
          router.push("/login?message=Password reset successfully. Please log in with your new password.")
        } else {
          setErrors({ general: result.error || "Failed to reset password. Please try again." })
          toast.error(result.error || "Failed to reset password. Please try again.")
        }
      } catch (error) {
        console.error("Reset password error:", error)
        const errorMessage = "An unexpected error occurred. Please try again."
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      }
    })
  }

  const handleBackToLogin = () => {
    router.push("/login")
  }

  const handleResendOtp = async () => {
    startTransition(async () => {
      try {
        const result = await sendResetOtp(formData.email)
        if (result.success) {
          toast.success("New reset code sent to your email!")
        } else {
          toast.error(result.error || "Failed to resend code. Please try again.")
        }
      } catch (error) {
        console.error("Resend OTP error:", error)
        toast.error("Failed to resend code. Please try again.")
      }
    })
  }

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-6">
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
            {emailCheckStatus === "eligible" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {emailCheckStatus === "not-eligible" && <X className="h-5 w-5 text-red-500" />}
          </div>
        </div>

        {errors.email && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 font-body">{errors.email}</p>
          </div>
        )}
      </div>

      {/* Send Reset Code Button */}
      <button
        type="submit"
        disabled={isPending || emailCheckStatus === "checking" || emailCheckStatus !== "eligible"}
        className="w-full py-4 px-6 bg-gradient-to-r from-button to-button-hover text-white font-button font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-button/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        {isPending ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Sending...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Send Reset Code</span>
          </div>
        )}
      </button>
    </form>
  )

  const renderOtpStep = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-6">
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

      {/* Info Message */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <p className="text-sm text-blue-800 font-body">
              We've sent a 6-digit verification code to <span className="font-semibold">{formData.email}</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">Check your email and enter the code below.</p>
          </div>
        </div>
      </div>

      {/* OTP Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-heading font-body">Verification Code</label>
        <OTPInput
          value={formData.otp}
          onChange={(value: string) => handleInputChange("otp", value)}
          length={6}
          disabled={isPending}
        />

        {errors.otp && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600 font-body">{errors.otp}</p>
          </div>
        )}
      </div>

      {/* Verify Code Button */}
      <button
        type="submit"
        disabled={isPending || formData.otp.length !== 6}
        className="w-full py-4 px-6 bg-gradient-to-r from-button to-button-hover text-white font-button font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-button/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        {isPending ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Verifying...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Verify Code</span>
          </div>
        )}
      </button>

      {/* Resend Code */}
      <div className="text-center">
        <p className="text-sm text-subheading font-body">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isPending}
            className="text-link hover:text-button font-link font-medium hover:underline transition-colors disabled:opacity-50"
          >
            Resend Code
          </button>
        </p>
      </div>
    </form>
  )

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-6">
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

      {/* Success Message */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm text-green-800 font-body">Code verified! Now set your new password.</p>
        </div>
      </div>

      {/* New Password Field */}
      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-semibold text-heading font-body">
          New Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-600 group-focus-within:text-button transition-colors" />
          </div>
          <input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) => handleInputChange("newPassword", e.target.value)}
            className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl font-body text-text placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-button transition-all duration-200 bg-white/80 backdrop-blur-sm ${
              errors.newPassword
                ? "border-red-300 bg-red-50/50 focus:border-red-400"
                : "border-gray-300 hover:border-gray-400 focus:border-button"
            }`}
            placeholder="Enter your new password"
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

        {errors.newPassword && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600 font-body">{errors.newPassword}</p>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-heading font-body">
          Confirm New Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-600 group-focus-within:text-button transition-colors" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl font-body text-text placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-button transition-all duration-200 bg-white/80 backdrop-blur-sm ${
              errors.confirmPassword
                ? "border-red-300 bg-red-50/50 focus:border-red-400"
                : "border-gray-300 hover:border-gray-400 focus:border-button"
            }`}
            placeholder="Confirm your new password"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            disabled={isPending}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {errors.confirmPassword && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600 font-body">{errors.confirmPassword}</p>
          </div>
        )}
      </div>

      {/* Password Requirements */}
      <div className="p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm border border-gray-200">
        <p className="text-xs text-gray-600 font-body mb-2">Password must contain:</p>
        <ul className="text-xs text-gray-600 font-body space-y-1">
          <li className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span>At least 8 characters</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span>One uppercase letter</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span>One lowercase letter</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span>One number</span>
          </li>
        </ul>
      </div>

      {/* Reset Password Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 px-6 bg-gradient-to-r from-button to-button-hover text-white font-button font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-button/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        {isPending ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Resetting Password...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Reset Password</span>
          </div>
        )}
      </button>
    </form>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-button/10 to-button-hover/10 rounded-2xl backdrop-blur-sm border border-button/20">
            <Shield className="h-8 w-8 text-button" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-heading font-heading">
              {currentStep === "email" && "Reset Password"}
              {currentStep === "otp" && "Verify Code"}
              {currentStep === "password" && "New Password"}
            </h1>
            <p className="text-subheading font-subheading mt-1">
              {currentStep === "email" && "Enter your email to receive a reset code"}
              {currentStep === "otp" && "Enter the verification code sent to your email"}
              {currentStep === "password" && "Create a strong new password"}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            currentStep === "email" ? "bg-button text-white shadow-lg" : "bg-green-500 text-white"
          }`}
        >
          1
        </div>
        <div
          className={`h-1 w-12 rounded-full transition-all duration-300 ${
            currentStep === "email" ? "bg-gray-300" : "bg-green-500"
          }`}
        ></div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            currentStep === "otp"
              ? "bg-button text-white shadow-lg"
              : currentStep === "password"
                ? "bg-green-500 text-white"
                : "bg-gray-300 text-gray-600"
          }`}
        >
          2
        </div>
        <div
          className={`h-1 w-12 rounded-full transition-all duration-300 ${
            currentStep === "password" ? "bg-green-500" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            currentStep === "password" ? "bg-button text-white shadow-lg" : "bg-gray-300 text-gray-600"
          }`}
        >
          3
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
        {currentStep === "email" && renderEmailStep()}
        {currentStep === "otp" && renderOtpStep()}
        {currentStep === "password" && renderPasswordStep()}
      </div>

      {/* Back to Login */}
      <div className="text-center">
        <button
          onClick={handleBackToLogin}
          className="inline-flex items-center space-x-2 text-link hover:text-button font-link font-medium hover:underline transition-colors duration-200 decoration-2 underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Login</span>
        </button>
      </div>
    </div>
  )
}
