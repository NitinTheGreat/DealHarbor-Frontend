"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Calendar, AlertCircle, Clock, Archive } from "lucide-react"

interface UnsoldProduct {
  id: string
  title: string
  description: string
  price: number
  condition: string
  categoryName: string
  sellerName: string
  primaryImageUrl?: string
  viewCount: number
  favoriteCount: number
  createdAt: string
  expiredAt: string
  archivedAt: string
  archivalReason: string
}

interface PageableResponse {
  content: UnsoldProduct[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export function UnsoldProductsTab() {
  const [unsoldProducts, setUnsoldProducts] = useState<UnsoldProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    fetchUnsoldProducts()
  }, [page])

  async function fetchUnsoldProducts() {
    setLoading(true)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${API_BASE}/api/products/archived/unsold?page=${page}&size=12`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch unsold products")
      }

      const data: PageableResponse = await response.json()
      setUnsoldProducts(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error("Error fetching unsold products:", error)
      setUnsoldProducts([])
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

  const getDaysListed = (createdAt: string, expiredAt: string) => {
    const created = new Date(createdAt).getTime()
    const expired = new Date(expiredAt).getTime()
    const days = Math.floor((expired - created) / (1000 * 60 * 60 * 24))
    return days
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

  if (unsoldProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Archive className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Expired Products</h3>
        <p className="text-gray-500">Products that expire after 6 months will appear here</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with count */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-heading">Expired Products</h2>
          <p className="text-sm text-subheading mt-1">
            {totalElements} {totalElements === 1 ? "product" : "products"} archived due to expiration
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-orange-900 mb-1">Auto-Archived Products</p>
          <p className="text-sm text-orange-700">
            These products were automatically archived after being listed for 6 months without being sold. They cannot be
            restored to active listings.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {unsoldProducts.map((product) => {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          const imageUrl = product.primaryImageUrl
            ? product.primaryImageUrl.startsWith("http")
              ? product.primaryImageUrl
              : `${API_BASE}${product.primaryImageUrl}`
            : null

          const daysListed = getDaysListed(product.createdAt, product.expiredAt)

          return (
            <div
              key={product.id}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 opacity-90"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {imageUrl ? (
                  <Image src={imageUrl} alt={product.title} fill className="object-cover grayscale" />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📦</span>
                  </div>
                )}

                {/* EXPIRED Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    ⏱️ EXPIRED
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

                {/* Price */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Listed Price:</span>
                    <span className="text-lg font-bold text-gray-700">₹{product.price.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    Never sold - Listed for {daysListed} days
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Created:{" "}
                      {new Date(product.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-orange-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Expired:{" "}
                      {new Date(product.expiredAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Archival Reason */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 italic line-clamp-2">{product.archivalReason}</p>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-1 bg-gray-100 rounded">{product.categoryName}</span>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>👁️ {product.viewCount}</span>
                    <span>❤️ {product.favoriteCount}</span>
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
