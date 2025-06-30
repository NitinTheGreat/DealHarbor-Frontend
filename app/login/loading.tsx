// app/login/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Email Field Skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Password Field Skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Login Button */}
      <div className="h-12 bg-gray-200 rounded-xl"></div>

      {/* Divider */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}
