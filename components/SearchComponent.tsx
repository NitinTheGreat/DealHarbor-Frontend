"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  title: string
  description?: string
  price: number
  originalPrice?: number
  condition?: string
  brand?: string
  model?: string
  viewCount?: number
  favoriteCount?: number
  pickupLocation?: string
  deliveryAvailable?: boolean
  isNegotiable?: boolean
  primaryImage?: {
    imageUrl: string
    altText?: string
  }
  seller?: {
    id: string
    name: string
    sellerRating?: number
    isVerifiedStudent?: boolean
    totalListings?: number
  }
  category?: {
    id: string
    name: string
  }
  createdAt?: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [keyword, setKeyword] = useState(query)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/products/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          keyword: searchQuery,
          page: 0,
          size: 20,
          sortBy: "date_desc"
        }),
      })

      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      console.log("Search results:", data)
      setResults(data.content || [])
    } catch (err) {
      setError("Failed to fetch search results. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (keyword.trim()) {
      performSearch(keyword)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF5F6] via-[#FFF8F3] to-[#F5F0FF]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#D97E96]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[#D97E96] hover:text-[#c5697a] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body font-semibold">Back</span>
            </Link>

            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97E96]/30 font-body text-heading"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-[#D97E96] to-pink-600 hover:from-[#c5697a] hover:to-pink-700 text-white rounded-lg font-body font-semibold transition-all"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {query && (
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-heading mb-2">Search Results for "{query}"</h1>
            <p className="font-body text-subheading">{loading ? "Searching..." : `Found ${results.length} products`}</p>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-8">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-[#D97E96]/20 border-t-[#D97E96] rounded-full animate-spin" />
              <p className="font-body text-subheading">Searching for products...</p>
            </div>
          </div>
        ) : results.length === 0 && query ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-4">
              <Search className="w-16 h-16 mx-auto text-gray-300" />
              <p className="font-body text-lg text-subheading">No products found</p>
              <p className="font-body text-sm text-gray-400">Try searching with different keywords</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((product) => {
              // Image resolution logic (same as ProductCard)
              const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
              const anyProduct = product as any
              const primaryImageUrl: string | undefined = anyProduct?.primaryImageUrl
              const firstImageFromImages: string | undefined = anyProduct?.images?.[0]?.imageUrl
              const firstLegacy = Array.isArray(anyProduct?.imageUrls) ? anyProduct.imageUrls[0] : undefined
              const rawImage = primaryImageUrl || firstImageFromImages || firstLegacy || product.primaryImage?.imageUrl
              const resolvedImage = rawImage
                ? rawImage.startsWith("http")
                  ? rawImage
                  : `${API_BASE}${rawImage}`
                : undefined

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {resolvedImage ? (
                      <img
                        src={resolvedImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = `/placeholder.svg?height=300&width=300&query=product`
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.condition && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-body rounded">
                        {product.condition.replace('_', ' ')}
                      </span>
                    )}
                    {product.isNegotiable && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-body rounded">
                        Negotiable
                      </span>
                    )}
                    {product.seller?.isVerifiedStudent && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-body rounded">
                        🎓 Verified
                      </span>
                    )}
                  </div>

                  <h3 className="font-body font-semibold text-heading line-clamp-2">{product.title}</h3>

                  <div className="flex items-center gap-2">
                    <span className="font-body font-bold text-heading text-lg">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="font-body text-sm text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {product.seller?.sellerRating && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-400">★</span>
                      <span className="font-body text-heading">{product.seller.sellerRating.toFixed(1)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <p className="font-body text-subheading truncate">{product.seller?.name || 'Unknown Seller'}</p>
                    {product.deliveryAvailable && (
                      <span className="text-green-600 text-xs font-body">🚚 Delivery</span>
                    )}
                  </div>

                  {(product.viewCount !== undefined || product.favoriteCount !== undefined) && (
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {product.viewCount !== undefined && <span>👁️ {product.viewCount}</span>}
                      {product.favoriteCount !== undefined && <span>❤️ {product.favoriteCount}</span>}
                    </div>
                  )}
                </div>
              </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
