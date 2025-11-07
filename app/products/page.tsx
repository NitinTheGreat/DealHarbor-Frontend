"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import type { Metadata } from "next"
import ProductGrid from "./components/ProductGrid"
import type { PagedResponse, ProductResponse } from "@/lib/types/product"

async function getProducts(page: number = 0, sortBy: string = "date_desc"): Promise<PagedResponse<ProductResponse>> {
  try {
    const res = await fetch(`/api/products?page=${page}&size=20&sortBy=${sortBy}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch products")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      last: true,
    }
  }
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [productsData, setProductsData] = useState<PagedResponse<ProductResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const page = parseInt(searchParams.get("page") || "0")
  const sortBy = searchParams.get("sortBy") || "date_desc"

  // Prefetch categories on mount for faster create page load
  useEffect(() => {
    // Prefetch categories in background
    fetch("/api/categories", { credentials: "include" }).catch(() => {
      // Silently fail, not critical for products page
    })
  }, [])

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      const data = await getProducts(page, sortBy)
      setProductsData(data)
      setIsLoading(false)
    }
    loadProducts()
  }, [page, sortBy])

  const handleSortChange = (newSortBy: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set("sortBy", newSortBy)
    url.searchParams.set("page", "0")
    router.push(url.pathname + url.search)
  }

  const handlePageChange = (newPage: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set("page", newPage.toString())
    router.push(url.pathname + url.search)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className="text-3xl font-bold text-heading"
                style={{ fontFamily: "var(--font-heading)", color: "var(--color-heading)" }}
              >
                Browse Products
              </h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: "var(--font-body)" }}>
                {isLoading ? "Loading..." : `${productsData?.totalElements.toLocaleString()} products available`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sell Product Button */}
              <button
                onClick={() => router.push("/products/create")}
                className="flex items-center gap-2 px-6 py-2.5 bg-button text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Plus className="w-5 h-5" />
                Sell Product
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <ProductGrid products={[]} isLoading={true} />
        ) : (
          <>
            <ProductGrid products={productsData?.content || []} />

            {/* Pagination */}
            {productsData && productsData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {page > 0 && (
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-button transition-colors font-medium"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    ← Previous
                  </button>
                )}

                <span className="px-4 py-2 text-gray-700" style={{ fontFamily: "var(--font-body)" }}>
                  Page {page + 1} of {productsData.totalPages}
                </span>

                {!productsData.last && (
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-button transition-colors font-medium"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
