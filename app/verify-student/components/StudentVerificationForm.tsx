"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Mail, Sparkles } from "lucide-react"
import { sendStudentOtp, verifyStudentOtp } from "../actions"
import { OTPInput } from "@/components/ui/otp-input"

interface User {
  id: string
  name: string
  email: string
  isStudentVerified: boolean
}

interface StudentVerificationFormProps {
  user: User
}

export default function StudentVerificationForm({ user }: StudentVerificationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<"email" | "otp">("email")
  const [studentEmail, setStudentEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [universityId, setUniversityId] = useState("")
  const [graduationYear, setGraduationYear] = useState("")
  const [department, setDepartment] = useState("")

  const validateVitEmail = (email: string): boolean => {
    const validDomains = ["@vitstudent.ac.in", "@vit.ac.in", "@vitchennai.ac.in"]
    return validDomains.some((domain) => email.toLowerCase().endsWith(domain))
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentEmail.trim()) {
      toast.error("Please enter your student email address")
      return
    }

    if (!validateVitEmail(studentEmail)) {
      toast.error("Please enter a valid VIT email address")
      return
    }

    startTransition(async () => {
      try {
        const result = await sendStudentOtp({ studentEmail })

        if (result.success) {
          toast.success("OTP sent to your student email! Please check your inbox.")
          setStep("otp")
        } else {
          toast.error(result.error || "Failed to send OTP")
        }
      } catch (error) {
        toast.error("An unexpected error occurred")
      }
    })
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      toast.error("Please enter the OTP")
      return
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits")
      return
    }

    startTransition(async () => {
      try {
        const result = await verifyStudentOtp({
          studentEmail,
          otp,
          universityId: universityId.trim() || undefined,
          graduationYear: graduationYear ? Number.parseInt(graduationYear) : undefined,
          department: department.trim() || undefined,
        })

        if (result.success) {
          toast.success("Student verification successful! Welcome to the verified community! 🎉")
          // Redirect to products after successful verification
          setTimeout(() => {
            router.push("/products")
          }, 1500)
        } else {
          toast.error(result.error || "Failed to verify OTP")
        }
      } catch (error) {
        toast.error("An unexpected error occurred")
      }
    })
  }

  const handleResendOtp = async () => {
    startTransition(async () => {
      try {
        const result = await sendStudentOtp({ studentEmail })

        if (result.success) {
          toast.success("New OTP sent to your email!")
        } else {
          toast.error(result.error || "Failed to resend OTP")
        }
      } catch (error) {
        toast.error("An unexpected error occurred")
      }
    })
  }

  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-heading mb-3">Enter Your Student Email</h2>
          <p className="text-subheading font-body">We'll send a verification code to your VIT student email address.</p>
        </div>

        <div className="space-y-3">
          <label htmlFor="studentEmail" className="block text-sm font-semibold text-heading font-body">
            Student Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-600 group-focus-within:text-button transition-colors" />
            </div>
            <input
              type="email"
              id="studentEmail"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="your.name@vitstudent.ac.in"
              className="w-full pl-12 pr-4 py-4 border-2 rounded-xl font-body text-text placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-button transition-all duration-200 bg-white/80 backdrop-blur-sm border-gray-300 hover:border-gray-400"
              required
              disabled={isPending}
            />
          </div>
          <p className="text-xs text-subheading font-body">
            Accepted domains: @vitstudent.ac.in, @vit.ac.in, @vitchennai.ac.in
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 px-6 bg-gradient-to-r from-button to-button-hover text-white font-button font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-button/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          {isPending ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Sending OTP...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Send Verification Code</span>
              <Sparkles className="h-4 w-4" />
            </div>
          )}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-heading mb-3">Enter Verification Code</h2>
        <p className="text-subheading font-body">
          We've sent a 6-digit code to <span className="font-semibold text-button">{studentEmail}</span>
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-heading font-body text-center">Verification Code</label>
        <div className="flex justify-center">
          <OTPInput length={6} value={otp} onChange={setOtp} disabled={isPending} autoFocus={true} />
        </div>
      </div>

      {/* Optional fields */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-heading font-semibold text-heading mb-6 text-center">
          Additional Information <span className="text-sm font-body text-subheading font-normal">(Optional)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="universityId" className="block text-sm font-semibold text-heading font-body">
              University ID
            </label>
            <input
              type="text"
              id="universityId"
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              placeholder="VIT2021001"
              className="w-full px-4 py-3 border-2 rounded-xl font-body text-text placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-button transition-all duration-200 bg-white/80 backdrop-blur-sm border-gray-300 hover:border-gray-400"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="graduationYear" className="block text-sm font-semibold text-heading font-body">
              Graduation Year
            </label>
            <input
              type="number"
              id="graduationYear"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="2025"
              min="2020"
              max="2030"
              className="w-full px-4 py-3 border-2 rounded-xl font-body text-text placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-button transition-all duration-200 bg-white/80 backdrop-blur-sm border-gray-300 hover:border-gray-400"
              disabled={isPending}
            />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <label htmlFor="department" className="block text-sm font-semibold text-heading font-body">
            Department
          </label>
          <input
            type="text"
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Computer Science"
            className="w-full px-4 py-3 border-2 rounded-xl font-body text-text placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-button transition-all duration-200 bg-white/80 backdrop-blur-sm border-gray-300 hover:border-gray-400"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <button
          type="submit"
          disabled={isPending}
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
              <span>Verify & Complete</span>
              <Sparkles className="h-4 w-4" />
            </div>
          )}
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isPending}
            className="flex-1 py-3 px-6 border-2 border-gray-300 text-text font-body font-medium rounded-xl hover:bg-white/80 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 bg-white/60 backdrop-blur-sm"
          >
            Resend Code
          </button>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="flex-1 py-3 px-6 border-2 border-gray-300 text-text font-body font-medium rounded-xl hover:bg-white/80 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 bg-white/60 backdrop-blur-sm"
            disabled={isPending}
          >
            Change Email
          </button>
        </div>
      </div>
    </form>
  )
}
