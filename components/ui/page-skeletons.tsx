// components/ui/page-skeletons.tsx
"use client"

export function LoginPageSkeleton() {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse" />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SignupPageSkeleton() {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-4xl w-full">
        <div className="text-center mb-6">
          <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-40 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 rounded-lg mx-auto animate-pulse" />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function VerifyEmailSkeleton() {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded-lg mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded-lg mx-auto animate-pulse" />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function StudentVerificationSkeleton() {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <div className="h-10 w-56 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-40 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 rounded-lg mx-auto animate-pulse" />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-28 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-32 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
