"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Filter, X, ChevronDown, SlidersHorizontal, LayoutGrid, LayoutList } from "lucide-react"
import ProductGrid from "./components/ProductGrid"
import type { PagedResponse, ProductResponse } from "@/lib/types/product"

interface Category {
  id: string
  name: string
}

const CONDITIONS = [
  { value: "", label: "All Conditions" },
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "USED", label: "Used" },
]

async function getProducts(
  page: number = 0,
  sortBy: string = "date_desc",
  categoryId?: string,
  condition?: string,
  minPrice?: string,
  maxPrice?: string
): Promise<PagedResponse<ProductResponse>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: "20",
      sortBy,
    })

    if (categoryId) params.set("categoryId", categoryId)
    if (condition) params.set("condition", condition)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)

    const res = await fetch(`/api/products?${params.toString()}`, {
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

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch("/api/categories", { credentials: "include" })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [productsData, setProductsData] = useState<PagedResponse<ProductResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const page = parseInt(searchParams.get("page") || "0")
  const sortBy = searchParams.get("sortBy") || "date_desc"
  const categoryId = searchParams.get("categoryId") || ""
  const condition = searchParams.get("condition") || ""
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""

  const hasActiveFilters = categoryId || condition || minPrice || maxPrice

  // Fetch categories on mount
  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      const data = await getProducts(page, sortBy, categoryId, condition, minPrice, maxPrice)
      setProductsData(data)
      setIsLoading(false)
    }
    loadProducts()
  }, [page, sortBy, categoryId, condition, minPrice, maxPrice])

  const updateUrlParams = (updates: Record<string, string>) => {
    const url = new URL(window.location.href)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value)
      } else {
        url.searchParams.delete(key)
      }
    })
    // Reset to page 0 when filters change (except when changing page)
    if (!("page" in updates)) {
      url.searchParams.set("page", "0")
    }
    router.push(url.pathname + url.search)
  }

  const handleClearFilters = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("categoryId")
    url.searchParams.delete("condition")
    url.searchParams.delete("minPrice")
    url.searchParams.delete("maxPrice")
    url.searchParams.set("page", "0")
    router.push(url.pathname + url.search)
  }

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Browse Products</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isLoading ? "Loading..." : `${productsData?.totalElements.toLocaleString() || 0} products available`}
                </p>
              </div>

              <button
                onClick={() => router.push("/products/create")}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D97E96] to-purple-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
              >
                <Plus className="w-4 h-4" />
                Sell Product
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => updateUrlParams({ categoryId: e.target.value })}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D97E96]/20 focus:border-[#D97E96] cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Condition Filter */}
              <div className="relative">
                <select
                  value={condition}
                  onChange={(e) => updateUrlParams({ condition: e.target.value })}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D97E96]/20 focus:border-[#D97E96] cursor-pointer"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => updateUrlParams({ minPrice: e.target.value })}
                  className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96]/20 focus:border-[#D97E96]"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => updateUrlParams({ maxPrice: e.target.value })}
                  className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96]/20 focus:border-[#D97E96]"
                />
              </div>

              {/* Sort */}
              <div className="relative ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => updateUrlParams({ sortBy: e.target.value })}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D97E96]/20 focus:border-[#D97E96] cursor-pointer"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popularity">Most Popular</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Active filters:</span>
                {categoryId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#D97E96]/10 text-[#D97E96] text-xs rounded-full">
                    {categories.find(c => c.id === categoryId)?.name || "Category"}
                    <button onClick={() => updateUrlParams({ categoryId: "" })} className="hover:bg-[#D97E96]/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {condition && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                    {CONDITIONS.find(c => c.value === condition)?.label}
                    <button onClick={() => updateUrlParams({ condition: "" })} className="hover:bg-blue-100 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
                    ₹{minPrice || "0"} - ₹{maxPrice || "∞"}
                    <button onClick={() => updateUrlParams({ minPrice: "", maxPrice: "" })} className="hover:bg-green-100 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}
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
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    ← Previous
                  </button>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, productsData.totalPages) }, (_, i) => {
                    let pageNum: number
                    if (productsData.totalPages <= 5) {
                      pageNum = i
                    } else if (page < 3) {
                      pageNum = i
                    } else if (page > productsData.totalPages - 4) {
                      pageNum = productsData.totalPages - 5 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${pageNum === page
                            ? "bg-[#D97E96] text-white"
                            : "hover:bg-gray-100 text-gray-700"
                          }`}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                </div>

                {!productsData.last && (
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGrid products={[]} isLoading={true} />}>
      <ProductsContent />
    </Suspense>
  )
}

