import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="space-y-8">
            {/* Section 1 */}
            <div className="space-y-4">
              <Skeleton className="h-7 w-48 mb-4" />
              <Skeleton className="h-10" />
              <Skeleton className="h-32" />
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </div>

            {/* Submit Button */}
            <Skeleton className="h-12" />
          </div>
        </div>
      </div>
    </div>
  )
}
