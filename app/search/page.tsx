import type { Metadata } from "next"
import SearchPage from "@/components/SearchComponent"

export const metadata: Metadata = {
  title: "Search Products | DealHarbor",
  description: "Search and discover amazing deals on DealHarbor. Find verified sellers and authentic products.",
}

export default function Page() {
  return <SearchPage />
}
