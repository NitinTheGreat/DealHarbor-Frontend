import { Skeleton } from "@/components/ui/skeleton"

export default function SignupLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--color-background)" }}
    >

      <div className="max-w-6xl w-full mt-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-white/20">
          <div className="space-y-6">
            {/* Name Fields Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            </div>

            {/* Contact Fields Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-3" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-3" />
              </div>
            </div>

            {/* Password Fields Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-8" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-8" />
              </div>
            </div>

            {/* Terms Skeleton */}
            <div className="flex items-start">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="ml-3 h-4 flex-1" />
            </div>

            {/* Submit Button Skeleton */}
            <Skeleton className="h-14 rounded-xl" />
          </div>

          <div className="mt-8 text-center">
            <Skeleton className="h-4 mx-auto max-w-xs" />
          </div>
        </div>
      </div>
    </div>
  )
}
