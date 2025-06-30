import { redirect } from "next/navigation"
import { getCurrentUser } from "./actions"
import StudentVerificationForm from "./components/StudentVerificationForm"

export default async function VerifyStudentPage() {
  // Check if user is authenticated and get their verification status
  const userResponse = await getCurrentUser()

  if (!userResponse.success) {
    // If not authenticated, redirect to login
    redirect("/login")
  }

  const user = userResponse.data!

  // If already verified, redirect to profile
  if (user.isVerifiedStudent) {
    redirect("/profile")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-button/20 to-button-hover/20 rounded-full mb-6 backdrop-blur-sm border border-button/20">
            <svg className="w-10 h-10 text-button" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-heading font-bold text-heading mb-4">Verify Your Student Status</h1>
          <p className="text-lg text-subheading font-body max-w-md mx-auto leading-relaxed">
            Verify your VIT student email to unlock exclusive features and build trust within our community.
          </p>
        </div>

        {/* Benefits Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-button/20 rounded-2xl p-8 mb-8 shadow-lg">
          <h3 className="text-xl font-heading font-semibold text-heading mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-button to-button-hover rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Benefits of Student Verification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Verified student badge on your profile",
              "Higher trust rating with other users",
              "Access to student-only features",
              "Priority support and assistance",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-button to-button-hover rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-text font-body">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <StudentVerificationForm user={user} />
        </div>

        {/* Skip Option */}
        <div className="text-center mt-8">
          <p className="text-subheading font-body mb-3">Want to verify later?</p>
          <a
            href="/profile"
            className="text-link font-link font-medium hover:text-button transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
          >
            Skip for now and go to profile
          </a>
        </div>
      </div>
    </div>
  )
}
