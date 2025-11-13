import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-12" />
          </div>
          <Skeleton className="h-12" />
        </div>
      </div>
    </div>
  )
}
