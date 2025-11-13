import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" />
          <Skeleton className="h-10 rounded-lg mb-4 max-w-md mx-auto" />
          <Skeleton className="h-6 rounded-lg max-w-md mx-auto" />
        </div>

        {/* Benefits Card Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 mb-8 shadow-lg">
          <Skeleton className="h-6 rounded-lg mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <div className="space-y-8">
            <div className="text-center">
              <Skeleton className="h-8 rounded-lg mb-3 max-w-sm mx-auto" />
              <Skeleton className="h-5 rounded-lg max-w-sm mx-auto" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-4 max-w-xs" />
            </div>
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>

        {/* Skip Option Skeleton */}
        <div className="text-center mt-8">
          <Skeleton className="h-5 max-w-xs mx-auto mb-3" />
          <Skeleton className="h-5 max-w-sm mx-auto" />
        </div>
      </div>
    </div>
  )
}
