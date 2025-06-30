// app/login/page.tsx
import type { Metadata, Viewport } from "next"
import LoginForm from "./components/LoginForm"
import { Suspense } from "react"
import Loading from "./loading"

export const metadata: Metadata = {
  title: "Sign In | DealHarbor",
  description: "Sign in to your DealHarbor account to buy and sell items within your university community.",
  keywords: ["login", "sign in", "dealharbor", "university marketplace", "student marketplace"],
  robots: "index, follow",
  openGraph: {
    title: "Sign In | DealHarbor",
    description: "Sign in to your DealHarbor account to buy and sell items within your university community.",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-button/20 via-button-hover/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-button-hover/15 via-button/10 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-button/10 to-transparent rounded-full blur-2xl"></div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading text-heading mb-2">Welcome Back</h1>
            <p className="text-subheading font-body">Sign in to your DealHarbor account</p>
          </div>

          {/* Login Form Container with Glass Effect */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 relative">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-2xl"></div>

            <div className="relative z-10">
              <Suspense fallback={<Loading />}>
                <LoginForm />
              </Suspense>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-text font-body">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-link font-link font-medium hover:text-button transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
