"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Package, Eye, Heart, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ProductImage {
  imageUrl: string
  isPrimary?: boolean
}

interface Product {
  id: string
  title: string
  description: string
  price: number
  condition: string
  categoryName: string
  images?: ProductImage[]
  imageUrls?: string[]
  primaryImageUrl?: string
  sellerId: string
  sellerName: string
  createdAt: string
  viewCount: number
  favoriteCount: number
  isFavorite: boolean
}

interface PageableResponse {
  content: Product[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export function ActiveProductsTab({ userId }: { userId: string }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [markingAsSold, setMarkingAsSold] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; title: string } | null>(null)

  const fetchProducts = async (page: number = 0) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`[ActiveProductsTab] Fetching products for user: ${userId}, page: ${page}`)
      
      const response = await fetch(
        `/api/sellers/${userId}/products?page=${page}&size=12`,
        {
          credentials: "include",
        }
      )

      console.log(`[ActiveProductsTab] Response status:`, response.status)

      if (!response.ok) {
        let errorMessage = `Failed to fetch products (Status: ${response.status})`
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          const errorText = await response.text()
          console.error(`[ActiveProductsTab] Error response:`, errorText)
        }
        throw new Error(errorMessage)
      }

      const data: PageableResponse = await response.json()
      console.log(`[ActiveProductsTab] Received data:`, {
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.number,
        productsCount: data.content?.length || 0,
      })

      setProducts(data.content || [])
      setTotalPages(data.totalPages)
      setCurrentPage(data.number)
    } catch (err) {
      console.error("[ActiveProductsTab] Error fetching products:", err)
      setError(err instanceof Error ? err.message : "Failed to load products")
      toast.error("Failed to load your products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchProducts(0)
    }
  }, [userId])

  const getConditionColor = (condition: string) => {
    switch (condition?.toUpperCase()) {
      case "NEW":
        return "bg-green-100 text-green-800"
      case "LIKE_NEW":
        return "bg-blue-100 text-blue-800"
      case "GOOD":
        return "bg-yellow-100 text-yellow-800"
      case "FAIR":
        return "bg-orange-100 text-orange-800"
      case "POOR":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCondition = (condition: string) => {
    return condition?.replace(/_/g, " ") || "Unknown"
  }

  const handleMarkAsSoldClick = (productId: string, productTitle: string) => {
    setSelectedProduct({ id: productId, title: productTitle })
    setShowConfirmModal(true)
  }

  const handleConfirmMarkAsSold = async () => {
    if (!selectedProduct) return

    const { id: productId, title: productTitle } = selectedProduct
    setMarkingAsSold(productId)

    try {
      // Call via frontend API route to ensure cookies are forwarded properly
      const response = await fetch(`/api/products/archived/mark-sold/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: "Failed to mark as sold",
          error: "Unknown error" 
        }))
        
        console.error('[ActiveProductsTab] Mark as sold failed:', {
          status: response.status,
          error: errorData
        })
        
        // Specific error messages
        if (response.status === 401) {
          throw new Error("Please login again to continue")
        }
        
        throw new Error(errorData.error || errorData.message || "Failed to mark product as sold")
      }

      const data = await response.json()
      toast.success("✅ " + (data.message || "Product marked as sold successfully!"))

      // Remove the product from the list
      setProducts((prev) => prev.filter((p) => p.id !== productId))

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error("Error marking as sold:", error)
      toast.error("❌ " + (error.message || "Failed to mark product as sold"))
    } finally {
      setMarkingAsSold(null)
      setSelectedProduct(null)
    }
  }

  if (loading && currentPage === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Loading your active listings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchProducts(currentPage)} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">You don't have any active listings yet</p>
        <Button asChild style={{ backgroundColor: "var(--color-button)" }} className="text-white">
          <Link href="/products/create">Create New Listing</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
          >
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100">
              {(() => {
                // Image resolution: primaryImageUrl > images[0].imageUrl > imageUrls[0]
                const rawImage = product.primaryImageUrl || 
                                 product.images?.[0]?.imageUrl || 
                                 product.imageUrls?.[0]
                
                const imageUrl = rawImage
                  ? rawImage.startsWith("http")
                    ? rawImage
                    : `${API_BASE_URL}${rawImage}`
                  : null

                return imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )
              })()}

              {/* Condition Badge */}
              <div className="absolute top-3 left-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getConditionColor(
                    product.condition
                  )}`}
                >
                  {formatCondition(product.condition)}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                  {product.title}
                </h3>
                <span className="text-lg font-bold text-[#D97E96] whitespace-nowrap ml-2">
                  ₹{product.price.toFixed(2)}
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {product.description}
              </p>

              {/* Category */}
              {product.categoryName && (
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {product.categoryName}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{product.viewCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{product.favoriteCount || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Link href={`/products/${product.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>
                <Button
                  onClick={() => handleMarkAsSoldClick(product.id, product.title)}
                  disabled={markingAsSold === product.id}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white cursor-pointer"
                >
                  {markingAsSold === product.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Sold
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedProduct(null)
        }}
        onConfirm={handleConfirmMarkAsSold}
        title="Mark as Sold?"
        message={`Are you sure you want to mark "${selectedProduct?.title}" as sold? This action cannot be undone and the product will be moved to your Sold Products tab.`}
        confirmText="Yes, Mark as Sold"
        cancelText="Cancel"
        type="success"
        icon={<CheckCircle className="w-12 h-12 text-green-600" />}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchProducts(currentPage - 1)}
            disabled={currentPage === 0 || loading}
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => fetchProducts(page)}
                disabled={loading}
                size="sm"
                className={page === currentPage ? "bg-blue-500 text-white" : ""}
              >
                {page + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => fetchProducts(currentPage + 1)}
            disabled={currentPage === totalPages - 1 || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
