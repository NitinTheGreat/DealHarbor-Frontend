"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrength } from "@/components/ui/password-strength"
import { PasswordMatch } from "@/components/ui/password-match"
import { TermsModal } from "@/components/ui/terms-modal"
import { registerUser, checkEmailExists } from "../actions"
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface FormData {
  firstName: string
  middleName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptedTerms: boolean
}

interface EmailStatus {
  checking: boolean
  exists: boolean
  verified: boolean
}

export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  })

  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    checking: false,
    exists: false,
    verified: false,
  })

  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Email validation with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.email.trim() && formData.email.includes("@")) {
        setEmailStatus((prev) => ({ ...prev, checking: true }))
        const result = await checkEmailExists(formData.email)
        setEmailStatus({
          checking: false,
          exists: result.exists,
          verified: result.verified,
        })
      } else {
        setEmailStatus({ checking: false, exists: false, verified: false })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.email])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required"
    if (!formData.lastName.trim()) return "Last name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.password) return "Password is required"
    if (formData.password !== formData.confirmPassword) return "Passwords do not match"
    if (emailStatus.exists) return "An account with this email already exists"

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address"

    // Password strength validation
    if (formData.password.length < 8) return "Password must be at least 8 characters long"

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!formData.acceptedTerms) {
      setShowTermsModal(true)
      return
    }

    await submitForm()
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const result = await registerUser({
        name: `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        setSuccess(result.message || "Registration successful!")
        // Redirect to verification page after 2 seconds
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(result.email || formData.email)}`)
        }, 2000)
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTermsAccept = () => {
    setFormData((prev) => ({ ...prev, acceptedTerms: true }))
    setShowTermsModal(false)
    submitForm()
  }

  const getEmailStatusIcon = () => {
    if (emailStatus.checking) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
    }
    if (formData.email && emailStatus.exists) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (formData.email && !emailStatus.exists && formData.email.includes("@")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <Mail className="h-4 w-4 text-gray-600" />
  }

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      !emailStatus.exists &&
      !emailStatus.checking
    )
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-800">Registration Successful!</h3>
          <p className="text-sm text-green-600 mt-2">{success}</p>
          <p className="text-xs text-gray-500 mt-2">Redirecting to verification page...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="block text-sm font-medium mb-2">
              First Name *
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-600 group-focus-within:text-button transition-colors" />
              </div>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="pl-10"
                placeholder="John"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lastName" className="block text-sm font-medium mb-2">
              Last Name *
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-600 group-focus-within:text-button transition-colors" />
              </div>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="pl-10"
                placeholder="Doe"
                required
              />
            </div>
          </div>
        </div>

        {/* Middle Name */}
        <div>
          <Label htmlFor="middleName" className="block text-sm font-medium mb-2">
            Middle Name (Optional)
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-600 group-focus-within:text-button transition-colors" />
            </div>
            <Input
              id="middleName"
              type="text"
              value={formData.middleName}
              onChange={(e) => handleInputChange("middleName", e.target.value)}
              className="pl-10"
              placeholder="Michael"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address *
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {getEmailStatusIcon()}
            </div>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="pl-10"
              placeholder="john.doe@vitstudent.ac.in"
              required
            />
          </div>

          {/* Email Status Messages */}
          {emailStatus.checking && <p className="mt-1 text-xs text-gray-500">Checking email availability...</p>}
          {formData.email && emailStatus.exists && (
            <p className="mt-1 text-xs text-red-600">This email is already registered</p>
          )}
          {formData.email && !emailStatus.exists && formData.email.includes("@") && !emailStatus.checking && (
            <p className="mt-1 text-xs text-green-600">Email is available</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="block text-sm font-medium mb-2">
            Password *
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-600 group-focus-within:text-button transition-colors" />
            </div>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="pl-10"
              placeholder="Create a strong password"
              required
            />
          </div>
          <PasswordStrength password={formData.password} />
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password *
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-600 group-focus-within:text-button transition-colors" />
            </div>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className="pl-10"
              placeholder="Confirm your password"
              required
            />
          </div>
          <PasswordMatch password={formData.password} confirmPassword={formData.confirmPassword} />
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-2">
          <input
            id="terms"
            type="checkbox"
            checked={formData.acceptedTerms}
            onChange={(e) => handleInputChange("acceptedTerms", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-button"
          />
          <Label htmlFor="terms" className="text-sm leading-5">
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="font-medium hover:underline transition-colors"
              style={{ color: "var(--color-button)" }}
            >
              Terms & Conditions
            </button>
          </Label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--color-button)",
            fontFamily: "var(--font-button)",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Terms Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} onAccept={handleTermsAccept} />
    </>
  )
}
