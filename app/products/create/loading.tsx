export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="space-y-8">
            {/* Section 1 */}
            <div className="space-y-4">
              <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
