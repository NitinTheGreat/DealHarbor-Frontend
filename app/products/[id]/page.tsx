import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Heart, Share2, MapPin, Truck, Eye, Star, ShieldCheck } from "lucide-react"
import ProductImageGallery from "./components/ProductImageGallery"
import ProductActions from "./components/ProductActions"
import SellerCard from "./components/SellerCard"
// import ReviewSection from "./components/ReviewSection"  // Temporarily disabled
import RelatedProducts from "./components/RelatedProducts"
import ViewTracker from "./components/ViewTracker"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  isNegotiable: boolean
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR" | "USED"
  brand?: string
  model?: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "SOLD"
  pickupLocation?: string
  deliveryAvailable: boolean
  viewCount: number
  favoriteCount: number
  isFeatured: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  sellerId: string
  sellerName: string
  sellerBadge: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  sellerRating: number
  isVerifiedStudent: boolean
  categoryId: string
  categoryName: string
  images: {
    id: string
    imageUrl: string
    altText?: string
    isPrimary: boolean
    sortOrder: number
  }[]
  primaryImageUrl?: string
}

// Generate metadata for SEO and social sharing (WhatsApp, Twitter, Facebook)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    const product = await fetchProduct(id)

    // Get the product image URL - prioritize primary image
    const imageUrl = product.primaryImageUrl || product.images?.[0]?.imageUrl

    // Ensure image URL is absolute for social sharing
    let absoluteImageUrl = imageUrl
    if (imageUrl && !imageUrl.startsWith("http")) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      absoluteImageUrl = `${backendUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
    }

    const description = product.description?.slice(0, 160) || `${product.title} - Available on DealHarbor`
    const siteUrl = "https://dealharbor.tech"
    const productUrl = `${siteUrl}/products/${id}`

    return {
      title: `${product.title} - ₹${product.price.toLocaleString()} | DealHarbor`,
      description,
      openGraph: {
        title: `${product.title} - ₹${product.price.toLocaleString()}`,
        description,
        url: productUrl,
        siteName: "DealHarbor",
        type: "website",
        images: absoluteImageUrl ? [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.title} - ₹${product.price.toLocaleString()}`,
        description,
        images: absoluteImageUrl ? [absoluteImageUrl] : [],
      },
    }
  } catch {
    return {
      title: "Product Not Found - DealHarbor",
      description: "The product you're looking for doesn't exist.",
    }
  }
}

async function fetchProduct(id: string): Promise<Product> {
  // Call backend directly - simple and reliable
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  const res = await fetch(`${backendUrl}/api/products/${id}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error("Product not found")
  }

  return res.json()
}

const conditionColors = {
  NEW: "bg-green-100 text-green-800",
  LIKE_NEW: "bg-blue-100 text-blue-800",
  GOOD: "bg-cyan-100 text-cyan-800",
  FAIR: "bg-yellow-100 text-yellow-800",
  POOR: "bg-orange-100 text-orange-800",
  USED: "bg-gray-100 text-gray-800",
}

const badgeColors = {
  BRONZE: "bg-orange-100 text-orange-800",
  SILVER: "bg-gray-100 text-gray-800",
  GOLD: "bg-yellow-100 text-yellow-800",
  PLATINUM: "bg-purple-100 text-purple-800",
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let product: Product

  try {
    product = await fetchProduct(id)
  } catch {
    notFound()
  }

  const formattedDate = new Date(product.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.primaryImageUrl || product.images?.[0]?.imageUrl,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.status === "SOLD" ? "OutOfStock" : "InStock",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ViewTracker productId={id} />

      <div className="min-h-screen bg-gradient-to-br from-[#FEF5F6] via-white to-[#F5F0FF]">
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
            <Link href={`/products?category=${product.categoryId}`} className="hover:text-gray-900">
              {product.categoryName}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <ProductImageGallery images={product.images} title={product.title} />

              {/* Product Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <h1 className="text-3xl font-bold text-[#2D3748] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{product.title}</h1>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                </div>

                {/* Product Details */}
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500">Condition</dt>
                      <dd className="mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${conditionColors[product.condition]}`}>
                          {product.condition.replace("_", " ")}
                        </span>
                      </dd>
                    </div>
                    {product.brand && (
                      <div>
                        <dt className="text-sm text-gray-500">Brand</dt>
                        <dd className="mt-1 text-sm font-medium text-gray-900">{product.brand}</dd>
                      </div>
                    )}
                    {product.model && (
                      <div>
                        <dt className="text-sm text-gray-500">Model</dt>
                        <dd className="mt-1 text-sm font-medium text-gray-900">{product.model}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm text-gray-500">Posted</dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900">{formattedDate}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        Views
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900">{product.viewCount}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        Favorites
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900">{product.favoriteCount}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Reviews Section - Temporarily Disabled */}
              {/* <ReviewSection productId={id} /> */}
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Price Card - Premium styling */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-[#D97E96] to-purple-600 bg-clip-text text-transparent">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.isNegotiable && (
                      <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        Negotiable
                      </span>
                    )}
                  </div>

                  <ProductActions
                    productId={id}
                    sellerId={product.sellerId}
                    product={{
                      title: product.title,
                      price: product.price,
                      imageUrl: product.primaryImageUrl || product.images?.[0]?.imageUrl,
                    }}
                  />
                </div>

                {/* Seller Card */}
                <SellerCard
                  seller={{
                    id: product.sellerId,
                    name: product.sellerName,
                    badge: product.sellerBadge,
                    rating: product.sellerRating,
                    isVerified: product.isVerifiedStudent,
                  }}
                />

                {/* Location & Delivery Info */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                  <h3 className="text-lg font-semibold text-[#2D3748] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Location & Delivery</h3>
                  <div className="space-y-3">
                    {product.pickupLocation && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Pickup Location</p>
                          <p className="text-sm text-gray-600">{product.pickupLocation}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Delivery</p>
                        <p className="text-sm text-gray-600">
                          {product.deliveryAvailable ? "Available" : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {product.status === "SOLD" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-800 font-semibold">This item has been sold</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <RelatedProducts categoryId={product.categoryId} currentProductId={id} />
          </div>
        </div>
      </div>
    </>
  )
}
