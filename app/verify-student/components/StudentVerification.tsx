"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { sendStudentOtp, verifyStudentOtp } from "../actions"

interface User {
  id: string
  name: string
  email: string
  isVerifiedStudent: boolean
}

interface StudentVerificationFormProps {
  user: User
}

export default function StudentVerificationForm({ user }: StudentVerificationFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)
  const [studentEmail, setStudentEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [universityId, setUniversityId] = useState("")
  const [graduationYear, setGraduationYear] = useState("")
  const [department, setDepartment] = useState("")

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentEmail.trim()) {
      toast.error("Please enter your student email address")
      return
    }

    // Validate VIT email domains
    const validDomains = ["@vitstudent.ac.in", "@vit.ac.in", "@vitchennai.ac.in"]
    const isValidDomain = validDomains.some((domain) => studentEmail.toLowerCase().endsWith(domain))

    if (!isValidDomain) {
      toast.error("Please enter a valid VIT email address")
      return
    }

    setLoading(true)

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
    } finally {
      setLoading(false)
    }
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

    setLoading(true)

    try {
      const result = await verifyStudentOtp({
        studentEmail,
        otp,
        universityId: universityId.trim() || undefined,
        graduationYear: graduationYear ? Number.parseInt(graduationYear) : undefined,
        department: department.trim() || undefined,
      })

      if (result.success) {
        toast.success("Student verification successful! 🎉")
        // Redirect to profile after successful verification
        setTimeout(() => {
          router.push("/profile")
        }, 1500)
      } else {
        toast.error(result.error || "Failed to verify OTP")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)

    try {
      const result = await sendStudentOtp({ studentEmail })

      if (result.success) {
        toast.success("New OTP sent to your email!")
      } else {
        toast.error(result.error || "Failed to resend OTP")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter Your Student Email</h2>
          <p className="text-sm text-gray-600 mb-4">
            We'll send a verification code to your VIT student email address.
          </p>
        </div>

        <div>
          <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Student Email Address
          </label>
          <input
            type="email"
            id="studentEmail"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            placeholder="your.name@vitstudent.ac.in"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted domains: @vitstudent.ac.in, @vit.ac.in, @vitchennai.ac.in
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending OTP...
            </>
          ) : (
            "Send Verification Code"
          )}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter Verification Code</h2>
        <p className="text-sm text-gray-600 mb-4">
          We've sent a 6-digit code to <span className="font-medium">{studentEmail}</span>
        </p>
      </div>

      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl font-mono tracking-widest"
          maxLength={6}
          required
          disabled={loading}
        />
      </div>

      {/* Optional fields */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="universityId" className="block text-sm font-medium text-gray-700 mb-2">
              University ID
            </label>
            <input
              type="text"
              id="universityId"
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              placeholder="VIT2021001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <input
            type="text"
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Computer Science"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </>
          ) : (
            "Verify & Complete"
          )}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Resend Code
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep("email")}
          className="text-sm text-blue-600 hover:text-blue-700 underline"
          disabled={loading}
        >
          Change email address
        </button>
      </div>
    </form>
  )
}
