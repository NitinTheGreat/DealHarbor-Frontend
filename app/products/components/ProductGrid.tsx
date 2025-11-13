"use client"

import type { ProductResponse } from "@/lib/types/product"
import ProductCard from "./ProductCard"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductGridProps {
  products: ProductResponse[]
  isLoading?: boolean
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-24" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-heading mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          No products found
        </h3>
        <p className="text-gray-600 text-center" style={{ fontFamily: "var(--font-body)" }}>
          Try adjusting your filters or check back later for new listings.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
