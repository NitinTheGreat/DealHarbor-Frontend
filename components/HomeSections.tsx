"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Heart,
  Zap,
  Clock,
  BarChart3,
  Users,
  ShoppingBag,
  TrendingUp,
} from "lucide-react"
import ProductCard from "@/components/ProductCard"

// ============= STATS SECTION =============
function CountUp({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = end / (duration / 50)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 50)

    return () => clearInterval(timer)
  }, [end, duration])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

function StatsSection({ stats }: any) {
  if (!stats) {
    return (
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  const statItems = [
    {
      icon: ShoppingBag,
      label: "Active Products",
      value: stats.totalActiveProducts,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      label: "Verified Students",
      value: stats.totalVerifiedStudents,
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: TrendingUp,
      label: "Weekly Additions",
      value: stats.productsAddedThisWeek,
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: BarChart3,
      label: "Categories",
      value: stats.totalCategories,
      color: "from-green-500 to-green-600",
    },
    {
      icon: Zap,
      label: "Total Sellers",
      value: stats.totalSellers,
      color: "from-red-500 to-red-600",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {statItems.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-button transition-all duration-300 hover:shadow-lg"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-full h-full text-white" />
                </div>
                <p className="font-subheading text-sm text-subheading mb-2">{stat.label}</p>
                <p className="font-heading text-3xl md:text-4xl font-bold text-heading">
                  <CountUp end={stat.value} />
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============= TRENDING SECTION =============
function TrendingSection({ products }: any) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (!products) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-12">🔥 Trending Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading">🔥 Trending Now</h2>
          </div>
          <a href="/trending" className="text-button hover:text-button-hover font-body font-semibold transition">
            View All →
          </a>
        </div>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
          >
            {products.map((product: any) => (
              <div key={product.id} className="flex-shrink-0 w-72 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-heading" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-heading" />
          </button>
        </div>
      </div>
    </section>
  )
}

// ============= CATEGORIES SECTION =============
function CategoriesSection({ categories }: any) {
  const router = useRouter()

  if (!categories) {
    return (
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-12">📂 Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-4">📂 Shop by Category</h2>
        <p className="font-body text-subheading mb-12">
          Browse thousands of products across our most popular categories
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() =>
                router.push(`/search?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`)
              }
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-button hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-2.5 mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <img
                    src={category.iconUrl || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <h3 className="font-heading text-lg font-semibold text-heading mb-1 group-hover:text-button transition">
                  {category.name}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= DEALS SECTION =============
function DealsSection({ products }: any) {
  const getDiscountPercentage = (price: number, originalPrice: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  if (!products) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-12">⚡ Deals of the Day</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-500" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading">⚡ Deals of the Day</h2>
          </div>
          <a href="/deals" className="text-button hover:text-button-hover font-body font-semibold transition">
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const discount = getDiscountPercentage(product.price, product.originalPrice)
            return (
              <div
                key={product.id}
                className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                  <img
                    src={product.primaryImage?.imageUrl || "/placeholder.svg"}
                    alt={product.primaryImage?.altText}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    -{discount}%
                  </div>
                  <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100">
                    <Heart className="w-4 h-4 text-button" />
                  </button>
                </div>

                <div className="p-4">
                  <p className="font-body text-xs text-subheading mb-2">{product.category?.name}</p>
                  <h3 className="font-subheading text-sm font-bold text-heading line-clamp-2 mb-3">{product.title}</h3>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-heading text-lg font-bold text-heading">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="font-body text-xs line-through text-subheading">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-subheading">{product.seller?.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-body text-xs font-semibold text-heading">
                        {product.seller?.sellerRating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============= RECENT ARRIVALS SECTION =============
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function RecentArrivalsSection({ products }: any) {
  if (!products) {
    return (
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-12">⏱️ Recently Added</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading">⏱️ Recently Added</h2>
          </div>
          <a href="/recent" className="text-button hover:text-button-hover font-body font-semibold transition">
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="group bg-background rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
            >
              <div className="relative overflow-hidden bg-gray-100 aspect-square">
                <img
                  src={product.primaryImage?.imageUrl || "/placeholder.svg"}
                  alt={product.primaryImage?.altText}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                  NEW
                </div>
                <div className="absolute top-3 right-3 text-xs bg-white px-2 py-1 rounded font-semibold text-heading">
                  {getTimeAgo(product.createdAt)}
                </div>
                <button className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100">
                  <Heart className="w-4 h-4 text-button" />
                </button>
              </div>

              <div className="p-4">
                <p className="font-body text-xs text-subheading mb-2">{product.category?.name}</p>
                <h3 className="font-subheading text-sm font-bold text-heading line-clamp-2 mb-3">{product.title}</h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-heading text-lg font-bold text-heading">₹{product.price.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-subheading truncate">{product.seller?.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-body text-xs font-semibold text-heading">{product.seller?.sellerRating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= TOP RATED SECTION =============
function TopRatedSection({ products }: any) {
  if (!products) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-12">⭐ Top Rated by Sellers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading">⭐ Top Rated by Sellers</h2>
          </div>
          <a href="/top-rated" className="text-button hover:text-button-hover font-body font-semibold transition">
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative overflow-hidden bg-gray-100 aspect-square">
                <img
                  src={product.primaryImage?.imageUrl || "/placeholder.svg"}
                  alt={product.primaryImage?.altText}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ TOP SELLER
                </div>
                <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100">
                  <Heart className="w-4 h-4 text-button" />
                </button>
              </div>

              <div className="p-4">
                <p className="font-body text-xs text-subheading mb-2">{product.category?.name}</p>
                <h3 className="font-subheading text-sm font-bold text-heading line-clamp-2 mb-3">{product.title}</h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-heading text-lg font-bold text-heading">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className="font-body text-xs line-through text-subheading">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-xs font-semibold text-heading">{product.seller?.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-body text-xs font-bold text-heading">{product.seller?.sellerRating}</span>
                    </div>
                  </div>
                  <p className="font-body text-xs text-subheading">Highly trusted seller</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= FEATURED SECTION =============
function FeaturedSection({ products }: any) {
  if (!products) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading">✨ Featured Picks</h2>
          <a href="#" className="text-button hover:text-button-hover font-body text-sm font-semibold">
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-purple-200"
            >
              <div className="relative overflow-hidden bg-gray-100 aspect-square">
                <img
                  src={product.primaryImage?.imageUrl || "/placeholder.svg"}
                  alt={product.primaryImage?.altText}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ FEATURED
                </div>
                <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100">
                  <Heart className="w-4 h-4 text-button" />
                </button>
              </div>

              <div className="p-5">
                <p className="font-body text-xs text-subheading mb-2">{product.category?.name}</p>
                <h3 className="font-subheading text-sm font-bold text-heading line-clamp-2 mb-3">{product.title}</h3>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-heading text-lg font-bold text-heading">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className="font-body text-xs line-through text-subheading">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-subheading">{product.seller?.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-body text-xs font-semibold text-heading">{product.seller?.sellerRating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= CATEGORY PREVIEW SECTION =============
function CategoryPreviewSection({ categories }: any) {
  const router = useRouter()

  if (!categories) {
    return (
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-12">📦 Explore by Category</h2>
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-4">📦 Explore by Category</h2>
        <p className="font-body text-subheading mb-12">Curated collections from our most popular categories</p>

        <div className="space-y-12">
          {categories.map((category: any) => (
            <div
              key={category.categoryId}
              className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-heading mb-2">{category.categoryName}</h3>
                  <p className="font-body text-subheading">{category.totalProducts} products available</p>
                </div>
                <button
                  onClick={() =>
                    router.push(
                      `/search?categoryId=${category.categoryId}&categoryName=${encodeURIComponent(category.categoryName)}`,
                    )
                  }
                  className="flex items-center gap-2 text-button hover:text-button-hover font-body font-semibold transition"
                >
                  View All <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {category.products.map((product: any) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer border border-gray-100"
                  >
                    <div className="w-full h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={product.primaryImage?.imageUrl || "/placeholder.svg"}
                        alt={product.primaryImage?.altText}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-subheading text-xs font-bold text-heading line-clamp-2 mb-2">
                        {product.title}
                      </h4>
                      <p className="font-heading text-sm font-bold text-button mb-2">
                        ₹{product.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-body text-xs font-semibold text-heading">
                          {product.seller?.sellerRating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= MAIN COMPONENT =============
export default function AllSections() {
  const [stats, setStats] = useState<any>(null)
  const [trending, setTrending] = useState<any>(null)
  const [categories, setCategories] = useState<any>(null)
  const [deals, setDeals] = useState<any>(null)
  const [recent, setRecent] = useState<any>(null)
  const [topRated, setTopRated] = useState<any>(null)
  const [featured, setFeatured] = useState<any>(null)
  const [categoryPreviews, setCategoryPreviews] = useState<any>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, trendingRes, categoriesRes, dealsRes, recentRes, topRatedRes, featuredRes, previewRes] =
          await Promise.all([
            fetch("/api/products/homepage-stats"),
            fetch("/api/products/trending?page=0&size=12"),
            fetch("/api/categories"),
            fetch("/api/products/deals?page=0&size=12"),
            fetch("/api/products/recent?page=0&size=12"),
            fetch("/api/products/top-rated?page=0&size=12"),
            fetch("/api/products/featured?page=0&size=8"),
            fetch("/api/products/by-category-preview?productsPerCategory=6"),
          ])

        if (statsRes.ok) setStats(await statsRes.json())
        if (trendingRes.ok) setTrending((await trendingRes.json()).content)
        if (categoriesRes.ok) setCategories((await categoriesRes.json()).filter((c: any) => c.isActive).slice(0, 8))
        if (dealsRes.ok) setDeals((await dealsRes.json()).content)
        if (recentRes.ok) setRecent((await recentRes.json()).content)
        if (topRatedRes.ok) setTopRated((await topRatedRes.json()).content)
        if (featuredRes.ok) setFeatured((await featuredRes.json()).content)
        if (previewRes.ok) setCategoryPreviews(await previewRes.json())
      } catch (error) {
        console.error("[v0] Failed to fetch sections:", error)
      }
    }

    fetchAll()
  }, [])

  return (
    <>
      <StatsSection stats={stats} />
      <TrendingSection products={trending} />
      <CategoriesSection categories={categories} />
      <DealsSection products={deals} />
      <RecentArrivalsSection products={recent} />
      <TopRatedSection products={topRated} />
      <FeaturedSection products={featured} />
      <CategoryPreviewSection categories={categoryPreviews} />
    </>
  )
}
