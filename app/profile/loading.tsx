import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
            <div className="flex items-center space-x-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Skeleton className="h-8 w-48 rounded-lg" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
                <Skeleton className="h-6 mb-6 rounded-lg" />
                <div className="space-y-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons Skeleton */}
          <div className="mt-8 flex flex-wrap gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
