export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg max-w-md mx-auto animate-pulse"></div>
        </div>

        {/* Benefits Card Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="h-6 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <div className="space-y-8">
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded-lg max-w-sm mx-auto animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded max-w-xs animate-pulse"></div>
            </div>
            <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Skip Option Skeleton */}
        <div className="text-center mt-8">
          <div className="h-5 bg-gray-200 rounded max-w-xs mx-auto mb-3 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded max-w-sm mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
