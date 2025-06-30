export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-32 animate-pulse"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
                <div className="h-6 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
                <div className="space-y-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j}>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons Skeleton */}
          <div className="mt-8 flex flex-wrap gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
