// app/verify-student/page.tsx
"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { toast } from "sonner"
import { StudentVerificationSkeleton } from "@/components/ui/page-skeletons"
import { OTPInput } from "@/components/ui/otp-input"
import { sendStudentOTPAction, verifyStudentOTPAction } from "./actions"
import {
  saveUserState,
  getUserState,
  clearUserState,
  getClientUser,
  setOTPTimer,
  canResendOTP,
  getResendTimeLeft,
} from "@/lib/auth"

function StudentVerificationForm() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [studentEmail, setStudentEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const [formData, setFormData] = useState({
    universityId: "",
    department: "",
    graduationYear: "",
  })

  // Check for existing state and user authentication
  useEffect(() => {
    const user = getClientUser()
    if (!user) {
      toast.error("Please log in first")
      router.push("/login")
      return
    }

    const existingState = getUserState()
    if (existingState?.step === "verify-student" && existingState.studentEmail) {
      setStudentEmail(existingState.studentEmail)
      setStep("otp")

      // Check timer for this email
      if (!canResendOTP(existingState.studentEmail)) {
        const timeLeft = getResendTimeLeft(existingState.studentEmail)
        setResendTimer(timeLeft)
      }
    }
  }, [router])

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

  async function handleSendOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("studentEmail", studentEmail)

      const result = await sendStudentOTPAction(formDataObj)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success("📧 OTP sent to your student email! Please check your inbox.", {
          duration: 5000,
        })

        // Save state for page refresh handling
        saveUserState({
          step: "verify-student",
          studentEmail: studentEmail,
        })

        // Set timer
        setOTPTimer(studentEmail)
        setResendTimer(60)

        setStep("otp")
      }
    } catch (error) {
      console.error("Send OTP error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("studentEmail", studentEmail)
      formDataObj.append("otp", otp)
      formDataObj.append("universityId", formData.universityId)
      formDataObj.append("department", formData.department)
      formDataObj.append("graduationYear", formData.graduationYear)

      const result = await verifyStudentOTPAction(formDataObj)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success("🎉 Student verification successful! You are now a verified VIT student.", {
          duration: 8000,
        })

        // Clear state and redirect to dashboard
        clearUserState()
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Verify OTP error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendOTP() {
    if (!canResendOTP(studentEmail)) return

    setIsResending(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("studentEmail", studentEmail)
      const result = await sendStudentOTPAction(formDataObj)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success("📧 New OTP sent to your student email!")
        setOTPTimer(studentEmail)
        setResendTimer(60)
      }
    } catch (error) {
      toast.error("Failed to resend OTP.")
    } finally {
      setIsResending(false)
    }
  }

  if (step === "email") {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h1
              className="text-5xl font-bold mb-3 animate-fade-in"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-heading)",
              }}
            >
              Student Verification
            </h1>
            <h2
              className="text-2xl font-semibold mb-4 animate-fade-in-delay-1"
              style={{
                fontFamily: "var(--font-subheading)",
                color: "var(--color-subheading)",
              }}
            >
              Verify Your VIT Student Status
            </h2>
            <p className="animate-fade-in-delay-2" style={{ color: "var(--color-text)" }}>
              Enter your VIT student email to receive a verification code
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 animate-slide-up">
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="animate-fade-in-delay-3 group">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  VIT Student Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
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
                  placeholder="john.doe@vitstudent.ac.in"
                />
                <p className="mt-2 text-xs animate-fade-in-delay-4" style={{ color: "var(--color-subheading)" }}>
                  📧 Enter your official VIT student email address
                </p>
              </div>

              <div className="animate-fade-in-delay-5">
                <button
                  type="submit"
                  disabled={isLoading || !studentEmail.includes("@")}
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
                    if (!isLoading && studentEmail.includes("@")) {
                      e.currentTarget.style.backgroundColor = "var(--color-button-hover)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && studentEmail.includes("@")) {
                      e.currentTarget.style.backgroundColor = "var(--color-button)"
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1
            className="text-5xl font-bold mb-3 animate-fade-in"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-heading)",
            }}
          >
            Verify Student Email
          </h1>
          <h2
            className="text-2xl font-semibold mb-4 animate-fade-in-delay-1"
            style={{
              fontFamily: "var(--font-subheading)",
              color: "var(--color-subheading)",
            }}
          >
            Enter Verification Code
          </h2>
          <p className="mb-2 animate-fade-in-delay-2" style={{ color: "var(--color-text)" }}>
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-semibold mb-4 animate-fade-in-delay-3" style={{ color: "var(--color-heading)" }}>
            {studentEmail}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 animate-slide-up">
          <form onSubmit={handleVerifyOTP} className="space-y-6">
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
                Enter the 6-digit code sent to your student email
              </p>
            </div>

            {/* Optional Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="animate-fade-in-delay-6 group">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  University ID (Optional)
                </label>
                <input
                  type="text"
                  disabled={isLoading}
                  value={formData.universityId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, universityId: e.target.value }))}
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
                  placeholder="e.g., VIT2021001"
                />
              </div>

              <div className="animate-fade-in-delay-7 group">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Graduation Year (Optional)
                </label>
                <select
                  disabled={isLoading}
                  value={formData.graduationYear}
                  onChange={(e) => setFormData((prev) => ({ ...prev, graduationYear: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                           transition-all duration-200 hover:border-gray-300 
                           disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                  style={
                    {
                      fontFamily: "var(--font-body)",
                      "--tw-ring-color": "var(--color-button)",
                    } as React.CSSProperties
                  }
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 8 }, (_, i) => {
                    const year = new Date().getFullYear() + i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="animate-fade-in-delay-8 group">
              <label
                className="block text-sm font-semibold mb-2 transition-colors"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Department (Optional)
              </label>
              <select
                disabled={isLoading}
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent 
                         transition-all duration-200 hover:border-gray-300 
                         disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                style={
                  {
                    fontFamily: "var(--font-body)",
                    "--tw-ring-color": "var(--color-button)",
                  } as React.CSSProperties
                }
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science & Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="animate-fade-in-delay-9">
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
                  "Verify Student Status"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm animate-fade-in-delay-10" style={{ color: "var(--color-text)" }}>
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

            <p className="text-sm animate-fade-in-delay-11" style={{ color: "var(--color-text)" }}>
              Wrong email?{" "}
              <button
                onClick={() => setStep("email")}
                className="font-semibold hover:underline transition-all duration-200 cursor-pointer"
                style={{
                  color: "var(--color-link)",
                  fontFamily: "var(--font-link)",
                }}
              >
                Change email address
              </button>
            </p>
          </div>

          <div
            className="mt-8 p-4 rounded-xl animate-fade-in-delay-12"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ color: "var(--color-link)" }}>
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3
                  className="text-sm font-medium"
                  style={{
                    color: "var(--color-heading)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Verification Process
                </h3>
                <div className="mt-2 text-sm" style={{ color: "var(--color-text)" }}>
                  <p>
                    We'll verify your student status using your VIT email. This helps maintain a trusted marketplace
                    environment for all VIT students.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentVerificationPage() {
  return (
    <Suspense fallback={<StudentVerificationSkeleton />}>
      <StudentVerificationForm />
    </Suspense>
  )
}
