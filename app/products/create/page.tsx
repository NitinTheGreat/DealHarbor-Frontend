"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/ClientAuth"
import ProductListingFormStepped from "./components/ProductListingFormStepped"

export default function CreateProductPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated after loading is complete
    if (!isLoading && !user) {
      router.push("/login?from=/products/create")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1
            className="text-3xl font-bold text-heading"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-heading)" }}
          >
            List Your Product
          </h1>
          <p className="text-gray-600 mt-1" style={{ fontFamily: "var(--font-body)" }}>
            Fill in the details to list your product for sale
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <ProductListingFormStepped />
        </div>
      </div>
    </div>
  )
}
