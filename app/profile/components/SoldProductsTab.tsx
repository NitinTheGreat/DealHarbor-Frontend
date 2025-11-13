"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Calendar, User, TrendingDown, TrendingUp } from "lucide-react"

interface SoldProduct {
  id: string
  title: string
  description: string
  price: number
  soldPrice: number
  condition: string
  categoryName: string
  sellerName: string
  buyerId?: string
  buyerName?: string
  primaryImageUrl?: string
  viewCount: number
  favoriteCount: number
  createdAt: string
  soldAt: string
  archivedAt: string
}

interface PageableResponse {
  content: SoldProduct[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export function SoldProductsTab() {
  const [soldProducts, setSoldProducts] = useState<SoldProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    fetchSoldProducts()
  }, [page])

  async function fetchSoldProducts() {
    setLoading(true)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${API_BASE}/api/products/archived/sold?page=${page}&size=12`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch sold products")
      }

      const data: PageableResponse = await response.json()
      setSoldProducts(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error("Error fetching sold products:", error)
      setSoldProducts([])
    } finally {
      setLoading(false)
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "NEW":
        return "bg-green-100 text-green-800"
      case "LIKE_NEW":
        return "bg-blue-100 text-blue-800"
      case "GOOD":
        return "bg-yellow-100 text-yellow-800"
      case "FAIR":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCondition = (condition: string) => {
    return condition.replace("_", " ")
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border rounded-xl overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (soldProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Sold Products Yet</h3>
        <p className="text-gray-500">Products you mark as sold will appear here</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with count */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-heading">Sold Products</h2>
          <p className="text-sm text-subheading mt-1">
            {totalElements} {totalElements === 1 ? "product" : "products"} sold
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {soldProducts.map((product) => {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          const imageUrl = product.primaryImageUrl
            ? product.primaryImageUrl.startsWith("http")
              ? product.primaryImageUrl
              : `${API_BASE}${product.primaryImageUrl}`
            : null

          const priceChange = product.soldPrice - product.price
          const priceChangePercent = ((priceChange / product.price) * 100).toFixed(1)

          return (
            <div
              key={product.id}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {imageUrl ? (
                  <Image src={imageUrl} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📦</span>
                  </div>
                )}

                {/* SOLD Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    ✓ SOLD
                  </span>
                </div>

                {/* Condition Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getConditionColor(product.condition)}`}>
                    {formatCondition(product.condition)}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-heading line-clamp-2 mb-3">{product.title}</h3>

                {/* Pricing */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Listed Price:</span>
                    <span className="text-sm line-through text-gray-400">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sold For:</span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{product.soldPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Price Change Indicator */}
                  <div className="flex items-center justify-end gap-1">
                    {priceChange > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-semibold">
                          +₹{Math.abs(priceChange).toLocaleString("en-IN")} ({priceChangePercent}%)
                        </span>
                      </>
                    ) : priceChange < 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                        <span className="text-xs text-orange-600 font-semibold">
                          -₹{Math.abs(priceChange).toLocaleString("en-IN")} ({Math.abs(Number(priceChangePercent))}%)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">Same price</span>
                    )}
                  </div>
                </div>

                {/* Buyer Info */}
                {product.buyerName && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Buyer</p>
                      <p className="text-sm font-medium text-text">{product.buyerName}</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Sold on {new Date(product.soldAt).toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                      year: "numeric" 
                    })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{product.categoryName}</span>
                    <div className="flex items-center gap-3">
                      <span>👁️ {product.viewCount}</span>
                      <span>❤️ {product.favoriteCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-10 h-10 rounded-lg font-semibold transition-colors cursor-pointer ${
                  page === i
                    ? "bg-button text-white"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
