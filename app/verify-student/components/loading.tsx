export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-lg max-w-md mx-auto animate-pulse"></div>
          </div>

          {/* Benefits Card Skeleton */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 mb-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <div className="space-y-6">
              <div>
                <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
