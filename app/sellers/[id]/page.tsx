"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  Calendar, 
  Package, 
  TrendingUp,
  Award,
  MessageCircle,
  ChevronRight,
  Loader2
} from "lucide-react"

interface Seller {
  id: string
  name: string
  email: string
  phoneNumber?: string
  profilePictureUrl?: string
  location?: string
  bio?: string
  isVerifiedStudent: boolean
  badge: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  rating: number
  totalReviews: number
  totalSales: number
  memberSince: string
  responseRate?: number
  responseTime?: string
  university?: string
}

interface Product {
  id: string
  title: string
  price: number
  condition: string
  primaryImageUrl?: string
  status: string
  createdAt: string
}

interface Review {
  id: string
  rating: number
  comment: string
  reviewerName: string
  createdAt: string
}



const badgeConfig = {
  BRONZE: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: "🥉" },
  SILVER: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "🥈" },
  GOLD: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🥇" },
  PLATINUM: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: "💎" },
}

export default function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSellerData() {
      try {
        setLoading(true)
        
        // Fetch seller info
        const sellerRes = await fetch(`/api/sellers/${id}`, {
          credentials: "include",
        })

        if (!sellerRes.ok) {
          if (sellerRes.status === 401) {
            router.push(`/login?returnTo=/sellers/${id}`)
            return
          }
          throw new Error("Failed to load seller")
        }

        const sellerData = await sellerRes.json()
        setSeller(sellerData)

        // Fetch products and reviews in parallel
        const [productsRes, reviewsRes] = await Promise.all([
          fetch(`/api/sellers/${id}/products`, { credentials: "include" }),
          fetch(`/api/sellers/${id}/reviews`, { credentials: "include" }),
        ])

        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData.content || [])
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          setReviews(reviewsData.content || [])
        }
      } catch (err) {
        console.error("Error loading seller:", err)
        setError("Failed to load seller profile")
      } finally {
        setLoading(false)
      }
    }

    loadSellerData()
  }, [id, router])

  if (loading) {
    return null // Loading state now handled by loading.tsx
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The seller you're looking for doesn't exist."}</p>
          <Link
            href="/products"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const memberSinceDate = new Date(seller.memberSince).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  const badgeStyle = badgeConfig[seller.badge] || badgeConfig.BRONZE

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-gray-900">
            Products
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Seller Profile</span>
        </nav>

        {/* Seller Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {seller.profilePictureUrl ? (
                  <Image
                    src={seller.profilePictureUrl}
                    alt={seller.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {seller.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                    {seller.isVerifiedStudent && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-medium">Verified Student</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-4 py-1.5 rounded-full font-semibold border-2 ${badgeStyle.color}`}>
                      {badgeStyle.icon} {seller.badge}
                    </span>
                  </div>

                  {seller.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{seller.location}</span>
                    </div>
                  )}

                  {seller.university && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{seller.university}</span>
                    </div>
                  )}
                </div>

                {/* Contact Button */}
                <Link
                  href={`/messages?seller=${id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Seller
                </Link>
              </div>

              {/* Bio */}
              {seller.bio && (
                <p className="text-gray-700 mb-4">{seller.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-2xl font-bold text-gray-900">
                      {seller.rating ? seller.rating.toFixed(1) : "0.0"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{seller.totalReviews || 0} reviews</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {seller.totalSales || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Sales</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {memberSinceDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Member since</p>
                </div>

                {seller.responseRate && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {seller.responseRate}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Response rate</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Active Listings ({products.length})
              </h2>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-48 bg-gray-100">
                        {product.primaryImageUrl ? (
                          <Image
                            src={product.primaryImageUrl}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-16 h-16" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-blue-600">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">{product.condition}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No active listings at the moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Reviews */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Reviews ({reviews.length})
              </h2>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {review.reviewerName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
