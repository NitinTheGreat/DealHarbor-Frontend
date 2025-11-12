import type { Metadata } from "next"
import { Suspense } from "react"
import SearchPage from "@/components/SearchComponent"

export const metadata: Metadata = {
  title: "Search Products | DealHarbor",
  description: "Search and discover amazing deals on DealHarbor. Find verified sellers and authentic products.",
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#FEF5F6] via-[#FFF8F3] to-[#F5F0FF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D97E96] mx-auto mb-4"></div>
          <p className="text-heading font-body">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchPage />
    </Suspense>
  )
}
