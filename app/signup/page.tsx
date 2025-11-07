import { Suspense } from "react"
import { SignupFormContainer } from "@/components/SignupForm"

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignupFormContainer />
    </Suspense>
  )
}

function LoadingSpinner() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(to bottom right, #FEF5F6, #F5E6E8)" }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E8D4D8] border-t-[#D97E96] mx-auto mb-4"></div>
        <p className="text-[#718096] font-medium">Loading signup...</p>
      </div>
    </div>
  )
}
