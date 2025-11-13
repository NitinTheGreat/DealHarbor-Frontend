import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoading() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#FEF5F6] via-white to-[#FEF5F6]">
      {/* Conversation List Sidebar Skeleton */}
      <div className="w-full lg:w-96 border-r border-gray-200 bg-white/80 backdrop-blur-sm flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white/90">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-hidden p-2 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area Skeleton */}
      <div className="hidden lg:flex flex-1 flex-col bg-white/50 backdrop-blur">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-4 bg-white/90">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-2 max-w-md ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-1">
                  <Skeleton className={`h-16 ${i % 3 === 0 ? 'w-48' : i % 3 === 1 ? 'w-64' : 'w-56'} rounded-2xl`} />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white/90">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
