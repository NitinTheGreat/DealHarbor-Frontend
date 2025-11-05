"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TermsModal } from "@/components/ui/terms-modal"
import { PasswordStrength } from "@/components/ui/password-strength"
import { PasswordMatch } from "@/components/ui/password-match"
import { OTPInput } from "@/components/ui/otp-input"
import { signupAction, verifyEmailAction, resendOtpAction } from "@/app/signup/actions"

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

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
              i < currentStep
                ? "bg-[#D97E96] text-white scale-110"
                : i === currentStep
                  ? "bg-[#D97E96] text-white ring-4 ring-[#F5E6E8] scale-110"
                  : "bg-[#E8D4D8] text-[#718096]"
            }`}
          >
            {i < currentStep ? "✓" : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-12 h-1 rounded-full transition-all duration-300 ${
                i < currentStep ? "bg-[#D97E96]" : "bg-[#E8D4D8]"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function PersonalInfoStep({ formData, isLoading, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#2D3748] mb-4 flex items-center gap-2">
          <span>👤</span> Personal Information
        </h3>
        <p className="text-sm text-[#718096] mb-6">Let us know who you are. We'll use this to create your account.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">First Name *</label>
            <input
              type="text"
              disabled={isLoading}
              value={formData.firstName}
              onChange={(e) => onChange({ ...formData, firstName: e.target.value })}
              placeholder="John"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-[#E8D4D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:border-transparent transition-all duration-200 placeholder:text-[#718096] disabled:bg-[#F5E6E8] disabled:cursor-not-allowed hover:border-[#C9647A]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">Middle Name</label>
            <input
              type="text"
              disabled={isLoading}
              value={formData.middleName}
              onChange={(e) => onChange({ ...formData, middleName: e.target.value })}
              placeholder="Optional"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-[#E8D4D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:border-transparent transition-all duration-200 placeholder:text-[#718096] disabled:bg-[#F5E6E8] disabled:cursor-not-allowed hover:border-[#C9647A]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">Last Name *</label>
            <input
              type="text"
              disabled={isLoading}
              value={formData.lastName}
              onChange={(e) => onChange({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-[#E8D4D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:border-transparent transition-all duration-200 placeholder:text-[#718096] disabled:bg-[#F5E6E8] disabled:cursor-not-allowed hover:border-[#C9647A]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactInfoStep({ formData, isLoading, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#2D3748] mb-4 flex items-center gap-2">
          <span>📧</span> Contact Information
        </h3>
        <p className="text-sm text-[#718096] mb-6">We'll use this to verify your account and keep you updated.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">Email Address *</label>
            <input
              type="email"
              disabled={isLoading}
              value={formData.email}
              onChange={(e) => onChange({ ...formData, email: e.target.value })}
              placeholder="john.doe@vitstudent.ac.in"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-[#E8D4D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:border-transparent transition-all duration-200 placeholder:text-[#718096] disabled:bg-[#F5E6E8] disabled:cursor-not-allowed hover:border-[#C9647A]"
            />
            <p className="mt-2 text-xs text-[#D97E96] font-medium">✓ VIT emails get automatic student verification</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">Phone Number (Optional)</label>
            <input
              type="tel"
              disabled={isLoading}
              value={formData.phoneNumber}
              onChange={(e) => onChange({ ...formData, phoneNumber: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-[#E8D4D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:border-transparent transition-all duration-200 placeholder:text-[#718096] disabled:bg-[#F5E6E8] disabled:cursor-not-allowed hover:border-[#C9647A]"
            />
            <p className="mt-2 text-xs text-[#718096]">For better communication</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PasswordStep({ password, confirmPassword, isLoading, onPasswordChange, onConfirmChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#2D3748] mb-4 flex items-center gap-2">
          <span>🔐</span> Create Password
        </h3>
        <p className="text-sm text-[#718096] mb-6">Create a strong password to secure your account.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">Password *</label>
            <input
              type="password"
              disabled={isLoading}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Create a strong password"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-[#E8D4D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:border-transparent transition-all duration-200 placeholder:text-[#718096] disabled:bg-[#F5E6E8] disabled:cursor-not-allowed hover:border-[#C9647A]"
            />
            <PasswordStrength password={password} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">Confirm Password *</label>
            <input
              type="password"
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => onConfirmChange(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-[#E8D4D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:border-transparent transition-all duration-200 placeholder:text-[#718096] disabled:bg-[#F5E6E8] disabled:cursor-not-allowed hover:border-[#C9647A]"
            />
            <PasswordMatch password={password} confirmPassword={confirmPassword} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TermsStep({ termsAccepted, isLoading, onTermsChange, onShowTerms }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#2D3748] mb-4 flex items-center gap-2">
          <span>📋</span> Terms & Conditions
        </h3>
        <p className="text-sm text-[#718096] mb-6">Please review and accept our terms before creating your account.</p>
        <div className="flex items-start gap-3 p-4 bg-[#F5E6E8] rounded-lg border border-[#E8D4D8]">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            disabled={isLoading}
            className="w-5 h-5 mt-0.5 rounded border-2 border-[#E8D4D8] focus:ring-2 focus:ring-[#D97E96] accent-[#D97E96] cursor-pointer disabled:cursor-not-allowed"
          />
          <label htmlFor="terms" className="text-sm text-[#333333] cursor-pointer flex-1">
            I agree to the{" "}
            <button type="button" onClick={onShowTerms} className="font-semibold text-[#D97E96] hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button type="button" onClick={onShowTerms} className="font-semibold text-[#D97E96] hover:underline">
              Privacy Policy
            </button>
          </label>
        </div>
      </div>
    </div>
  )
}

function SuccessState() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login")
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(to bottom right, #FEF5F6, #F5E6E8)" }}
    >
      <div className="max-w-md w-full text-center">
        <div className="mb-8 animate-bounce">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-[#2D3748] mb-2">Account Created!</h2>
          <p className="text-[#718096] text-lg">Welcome to DealHarbor! Your account is ready to use.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8D4D8] p-6 mb-6">
          <p className="text-sm text-[#718096] mb-2">Redirecting to login...</p>
          <div className="w-full bg-[#E8D4D8] rounded-full h-1 overflow-hidden">
            <div className="bg-[#D97E96] h-full animate-pulse" style={{ width: "100%" }}></div>
          </div>
        </div>

        <Link href="/login" className="text-[#D97E96] hover:underline font-medium text-sm">
          Or click here to go to login
        </Link>
      </div>
    </div>
  )
}

export function SignupFormContainer() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"form" | "verify-email">("form")
  const [formStep, setFormStep] = useState(0)
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
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  })

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

  const loadSignupState = (): SignupState | null => {
    try {
      const saved = localStorage.getItem(SIGNUP_STATE_KEY)
      if (!saved) return null

      const state: SignupState = JSON.parse(saved)

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

  const clearSignupState = () => {
    try {
      localStorage.removeItem(SIGNUP_STATE_KEY)
    } catch (error) {
      console.error("Failed to clear signup state:", error)
    }
  }

  useEffect(() => {
    const initializeSignup = async () => {
      try {
        const savedState = loadSignupState()

        if (savedState) {
          if (savedState.step === "verify-email" && savedState.email) {
            setRegisteredEmail(savedState.email)
            setCurrentStep("verify-email")

            if (savedState.formData) {
              setFormData(savedState.formData)
            }

            toast.info("Continuing your signup process. Please verify your email.")
          } else if (savedState.formData) {
            setFormData(savedState.formData)
            setTermsAccepted(true)
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

  useEffect(() => {
    if (!isInitializing && (formData.firstName || formData.lastName || formData.email)) {
      const timeoutId = setTimeout(() => {
        saveSignupState({
          step: "form",
          formData,
        })
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [formData, isInitializing])

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

        toast.success("Account created successfully! Please check your email for verification code.", {
          duration: 5000,
        })

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
        setShowSuccess(true)
        clearSignupState()
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
        setResendCooldown(60)
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
    saveSignupState({
      step: "form",
      formData,
    })
  }

  const isPersonalInfoValid = formData.firstName.length >= 2 && formData.lastName.length >= 2
  const isContactValid = formData.email.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  const isPasswordValid = password === confirmPassword && password.length >= 8

  const isFormValid = isPersonalInfoValid && isContactValid && isPasswordValid && termsAccepted

  const canAdvance = () => {
    if (formStep === 0) return isPersonalInfoValid
    if (formStep === 1) return isContactValid
    if (formStep === 2) return isPasswordValid
    if (formStep === 3) return termsAccepted
    return false
  }

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(to bottom right, #FEF5F6, #F5E6E8)" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E8D4D8] border-t-[#D97E96] mx-auto mb-4"></div>
          <p className="text-[#718096] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return <SuccessState />
  }

  if (currentStep === "verify-email") {
    const isUniversityEmail =
      registeredEmail.toLowerCase().includes("@vitstudent.ac.in") ||
      registeredEmail.toLowerCase().includes("@vit.ac.in") ||
      registeredEmail.toLowerCase().includes("@vitchennai.ac.in")

    return (
      <div
        className="min-h-screen flex items-center justify-center py-6 px-4"
        style={{ background: "linear-gradient(to bottom right, #FEF5F6, #F5E6E8)" }}
      >
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">📧</div>
            <h1 className="text-3xl font-bold text-[#2D3748] mb-2">Verify Your Email</h1>
            <p className="text-sm text-[#718096] mb-1">We've sent a 6-digit verification code to</p>
            <p className="font-semibold text-sm text-[#D97E96] break-all">{registeredEmail}</p>
            {isUniversityEmail && (
              <p className="text-xs mt-3 p-3 bg-[#F5E6E8] text-[#C9647A] rounded-lg border border-[#E8D4D8]">
                🎓 VIT email detected! Your student status will be verified automatically.
              </p>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/30">
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-4 text-center">
                  Enter Verification Code
                </label>
                <OTPInput value={otp} onChange={setOtp} length={6} disabled={isLoading} autoFocus={true} />
                {otpError && <p className="mt-3 text-sm text-center text-red-600 font-medium">{otpError}</p>}
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || isLoading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-[#D97E96] hover:bg-[#E598AD] focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="text-center space-y-2">
                <p className="text-xs text-[#718096]">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm font-semibold text-[#D97E96] hover:underline transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleBackToForm}
                className="w-full text-sm text-[#718096] hover:text-[#333333] font-medium transition-colors"
              >
                ← Back to form
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen py-12 px-4 flex items-center justify-center"
      style={{ background: "linear-gradient(to bottom right, #FEF5F6, #F5E6E8)" }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "College, serif" }}>
            DealHarbor
          </h1>
          <p className="text-lg text-[#333333]">Join the VIT Marketplace</p>
          <p className="text-sm text-[#718096] mt-2">Create your account to start buying and selling</p>
        </div>

        {/* Progress Indicator */}
        <StepIndicator currentStep={formStep} totalSteps={4} />

        {/* Form Container with Glass Effect */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step Content */}
            <div className="space-y-6">
              {formStep === 0 && <PersonalInfoStep formData={formData} isLoading={isLoading} onChange={setFormData} />}
              {formStep === 1 && <ContactInfoStep formData={formData} isLoading={isLoading} onChange={setFormData} />}
              {formStep === 2 && (
                <PasswordStep
                  password={password}
                  confirmPassword={confirmPassword}
                  isLoading={isLoading}
                  onPasswordChange={setPassword}
                  onConfirmChange={setConfirmPassword}
                />
              )}
              {formStep === 3 && (
                <TermsStep
                  termsAccepted={termsAccepted}
                  isLoading={isLoading}
                  onTermsChange={setTermsAccepted}
                  onShowTerms={() => setShowTermsModal(true)}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => setFormStep(Math.max(0, formStep - 1))}
                disabled={formStep === 0 || isLoading}
                className="px-6 py-3 rounded-lg font-semibold text-[#333333] bg-[#F5E6E8] hover:bg-[#E8D4D8] focus:outline-none focus:ring-2 focus:ring-[#D97E96] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-1"
              >
                ← Back
              </button>

              {formStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setFormStep(formStep + 1)}
                  disabled={!canAdvance() || isLoading}
                  className="px-6 py-3 rounded-lg font-semibold text-white bg-[#D97E96] hover:bg-[#E598AD] focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-1"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="px-6 py-3 rounded-lg font-semibold text-white bg-[#D97E96] hover:bg-[#E598AD] focus:outline-none focus:ring-2 focus:ring-[#D97E96] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-1 shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#718096]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#D97E96] hover:underline transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} onAccept={handleTermsAccept} />
    </div>
  )
}
