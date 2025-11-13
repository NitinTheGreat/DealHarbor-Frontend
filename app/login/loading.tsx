import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Email Field Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 rounded-xl" />
      </div>

      {/* Password Field Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 rounded-xl" />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Login Button */}
      <Skeleton className="h-12 rounded-xl" />

      {/* Divider */}
      <div className="flex items-center space-x-4">
        <Skeleton className="flex-1 h-px" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="flex-1 h-px" />
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    </div>
  )
}
