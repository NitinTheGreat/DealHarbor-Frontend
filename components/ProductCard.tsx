"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import type { ProductResponse } from "@/lib/types/product"

interface ProductCardProps {
  product: ProductResponse
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // Image source resolution per backend notes: prefer primaryImageUrl, else first of images[], else imageUrls[0]
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  const anyProduct = product as any
  const primaryImageUrl: string | undefined = anyProduct?.primaryImageUrl
  const firstImageFromImages: string | undefined = anyProduct?.images?.[0]?.imageUrl
  const firstLegacy = Array.isArray((product as any)?.imageUrls) ? (product as any).imageUrls[0] : undefined
  const rawImage = primaryImageUrl || firstImageFromImages || firstLegacy
  const resolvedImage = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${API_BASE}${rawImage}`
    : undefined

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

  return (
    <Link href={`/products/${product.id}`} className="cursor-pointer">
      <div className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-button transition-all duration-200 overflow-hidden hover:shadow-lg">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {resolvedImage ? (
            <Image
              src={resolvedImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span className="text-4xl">📦</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {hasDiscount && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                {discountPercent}% OFF
              </span>
            )}
            {product.isNegotiable && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
                Negotiable
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              // TODO: Implement favorite functionality
              console.log("Add to favorites:", product.id)
            }}
            className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors cursor-pointer"
          >
            <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
          </button>

          {/* Condition Badge */}
          <div className="absolute bottom-2 left-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${getConditionColor(product.condition)}`}>
              {formatCondition(product.condition)}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Title */}
          <h3
            className="font-semibold text-lg text-heading line-clamp-2 mb-2 group-hover:text-button transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-button" style={{ fontFamily: "var(--font-heading)" }}>
              ₹{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice?.toLocaleString()}</span>
            )}
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200">
              {product?.seller?.profilePhotoUrl ? (
                <Image src={product.seller.profilePhotoUrl} alt={product?.seller?.name || "Seller"} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-xs font-bold text-gray-600">
                  {(product?.seller?.name?.[0] || "S").toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{product?.seller?.name || "Seller"}</p>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span>
                  ⭐ {Number(product?.seller?.rating ?? 0).toFixed(1)}
                </span>
                {(product as any)?.seller?.studentVerified || (product as any)?.seller?.isStudentVerified ? (
                  <>
                    <span>•</span>
                    <span className="text-green-600">✓ Verified</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Category & Stats */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded">{product?.category?.name || "Misc"}</span>
            <div className="flex items-center gap-3">
              <span>👁️ {Number((product as any)?.views ?? 0)}</span>
              <span>❤️ {Number((product as any)?.favorites ?? 0)}</span>
            </div>
          </div>

          {/* Delivery Badge */}
          {product.deliveryAvailable && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-green-600 font-medium">🚚 Delivery Available</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
