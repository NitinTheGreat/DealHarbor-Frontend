import { Suspense } from "react"
import ForgotPasswordForm from "./components/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-button/20 to-button-hover/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-button-hover/20 to-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-button/10 to-transparent rounded-full blur-2xl" />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Glass Container */}
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 relative">
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10">
              <Suspense fallback={<div>Loading...</div>}>
                <ForgotPasswordForm />
              </Suspense>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-subheading font-subheading">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-link font-link font-medium hover:text-button transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
