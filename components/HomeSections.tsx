"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Zap,
  Users,
  ShoppingBag,
  TrendingUp,
  GraduationCap,
  CheckCircle,
  MapPin,
  Percent,
  ArrowRight,
  Sparkles,
  Quote,
  BadgeCheck,
  Laptop,
  BookOpen,
  Sofa,
  Shirt,
  Bike,
  Watch,
} from "lucide-react"
import ProductCard from "@/components/ProductCard"

// ============= TYPES =============
interface Category {
  id: string
  name: string
  productCount: number
  iconName?: string
  imageUrl?: string
}

interface TopSeller {
  id: string
  name: string
  profilePhotoUrl?: string
  rating: number
  totalSales: number
  isVerified: boolean
  badge: string
}

interface Testimonial {
  id: string
  studentName: string
  batch: string
  quote: string
  profilePhotoUrl?: string
  rating: number
}

interface HomepageStats {
  totalActiveProducts: number
  totalVerifiedStudents: number
  avgSavingsPercent: number
  successfulSales: number
}

// ============= API FETCHERS =============
async function fetchStats(): Promise<HomepageStats | null> {
  try {
    const res = await fetch("/api/products/homepage-stats")
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch("/api/categories/featured?limit=6")
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function fetchTopSellers(): Promise<TopSeller[]> {
  try {
    const res = await fetch("/api/sellers/top-rated?limit=4&minRating=4.0&verified=true")
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch("/api/testimonials?limit=3&featured=true")
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function fetchJustListed(): Promise<any[]> {
  try {
    const res = await fetch("/api/products/just-listed?limit=10&hours=24")
    if (!res.ok) return []
    const data = await res.json()
    return data.content || data || []
  } catch {
    return []
  }
}

async function fetchTrending(): Promise<any[]> {
  try {
    const res = await fetch("/api/products?sortBy=popularity&size=10")
    if (!res.ok) return []
    const data = await res.json()
    return data.content || []
  } catch {
    return []
  }
}

async function fetchDeals(): Promise<any[]> {
  try {
    const res = await fetch("/api/products?hasDiscount=true&size=6")
    if (!res.ok) return []
    const data = await res.json()
    return data.content || []
  } catch {
    return []
  }
}

// ============= QUICK BROWSE CATEGORIES =============
function QuickBrowseSection({ categories }: { categories: Category[] }) {
  const router = useRouter()

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes("electronic") || n.includes("laptop")) return Laptop
    if (n.includes("book") || n.includes("note")) return BookOpen
    if (n.includes("furniture") || n.includes("sofa")) return Sofa
    if (n.includes("cloth") || n.includes("shirt")) return Shirt
    if (n.includes("cycle") || n.includes("bike")) return Bike
    if (n.includes("accessor") || n.includes("watch")) return Watch
    return ShoppingBag
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-3">What are you looking for?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-heading mb-3">What are you looking for?</h2>
          <p className="text-subheading max-w-2xl mx-auto">Browse by category to find exactly what you need</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name)
            return (
              <button
                key={category.id}
                onClick={() => router.push(`/products?categoryId=${category.id}`)}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-button/10 to-button/5 border border-button/20 hover:border-button hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-[#D97E96] to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-heading text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-subheading">{category.productCount} items</p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============= COUNT UP ANIMATION =============
function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const animatedRef = useRef(false)

  useEffect(() => {
    // Only animate once when end becomes non-zero
    if (end === 0 || animatedRef.current) {
      if (end > 0 && !animatedRef.current) {
        // First time we get a real value
      } else {
        return
      }
    }

    animatedRef.current = true

    const duration = 1500 // 1.5 seconds
    const steps = 40
    const increment = end / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      setCount(Math.min(Math.floor(increment * step), end))
      if (step >= steps) {
        setCount(end)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [end])

  return <span>{count.toLocaleString()}{suffix}</span>
}

// ============= COMPACT STATS BAR =============
function StatsBar({ stats }: { stats: HomepageStats | null }) {
  const s = stats || {
    totalActiveProducts: 0,
    totalVerifiedStudents: 0,
    avgSavingsPercent: 0,
    successfulSales: 0,
  }

  return (
    <section className="py-8 bg-gradient-to-r from-[#D97E96] to-purple-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold">
              <CountUp end={s.totalActiveProducts || 0} suffix="+" />
            </p>
            <p className="text-sm text-white/80 mt-1">Products Listed</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold">
              <CountUp end={s.totalVerifiedStudents || 0} suffix="+" />
            </p>
            <p className="text-sm text-white/80 mt-1">Verified Students</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold">
              <CountUp end={s.avgSavingsPercent || 0} suffix="%" />
            </p>
            <p className="text-sm text-white/80 mt-1">Avg. Savings</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold">
              <CountUp end={s.successfulSales || 0} suffix="+" />
            </p>
            <p className="text-sm text-white/80 mt-1">Successful Sales</p>
          </div>
        </div>
      </div>
    </section>
  )
}


// ============= JUST LISTED (FRESH PRODUCTS) =============
function JustListedSection({ products }: { products: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" })
    }
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-heading">Just Listed</h2>
              <p className="text-subheading text-sm">Fresh arrivals in the last 24 hours</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="p-2 rounded-full bg-white shadow hover:shadow-md transition">
              <ChevronLeft className="w-5 h-5 text-heading" />
            </button>
            <button onClick={() => scroll("right")} className="p-2 rounded-full bg-white shadow hover:shadow-md transition">
              <ChevronRight className="w-5 h-5 text-heading" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-72 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= WHY DEALHARBOR =============
function WhyDealHarborSection() {
  const features = [
    {
      icon: GraduationCap,
      title: "VIT Students Only",
      description: "Every seller is a verified VIT student. Buy and sell with people you can trust.",
    },
    {
      icon: MapPin,
      title: "Meet on Campus",
      description: "No shipping hassles. Meet anywhere in the campus - Food Court, or your hostel. Safe and convenient.",
    },
    {
      icon: Percent,
      title: "Save Up to 70%",
      description: "Get pre-owned items at a fraction of retail price. Great deals from fellow students.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">Why Students Love DealHarbor</h2>
          <p className="text-subheading max-w-2xl mx-auto">Built by students, for students. We understand campus life.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-button/30 transition-all">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-[#D97E96]/20 to-purple-500/20 mb-6">
                  <Icon className="w-8 h-8 text-[#D97E96]" />
                </div>
                <h3 className="text-xl font-bold text-heading mb-3">{feature.title}</h3>
                <p className="text-subheading">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============= TOP SELLERS SPOTLIGHT =============
function TopSellersSection({ sellers }: { sellers: TopSeller[] }) {
  const router = useRouter()

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "PLATINUM": return "bg-purple-500 text-white"
      case "GOLD": return "bg-yellow-500 text-white"
      case "SILVER": return "bg-gray-400 text-white"
      default: return "bg-orange-400 text-white"
    }
  }

  if (!sellers || sellers.length === 0) return null

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BadgeCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-heading">Top Sellers</h2>
              <p className="text-subheading text-sm">Our highest-rated student sellers</p>
            </div>
          </div>
          <Link href="/sellers" className="text-button hover:text-button-hover font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sellers.map((seller) => (
            <div key={seller.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-button/30 transition-all text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D97E96] to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {seller.profilePhotoUrl ? (
                    <Image src={seller.profilePhotoUrl} alt={seller.name} fill className="rounded-full object-cover" />
                  ) : (
                    seller.name.charAt(0)
                  )}
                </div>
                {seller.isVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-heading mb-1">{seller.name}</h3>
              <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getBadgeStyle(seller.badge)}`}>
                {seller.badge}
              </div>
              <div className="flex items-center justify-center gap-1 text-sm text-subheading mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-heading">{seller.rating}</span>
                <span className="text-gray-300">•</span>
                <span>{seller.totalSales} sales</span>
              </div>
              <button
                onClick={() => router.push(`/products?sellerId=${seller.id}`)}
                className="mt-3 w-full py-2 text-sm font-medium text-[#D97E96] border border-[#D97E96] rounded-lg hover:bg-gradient-to-r hover:from-[#D97E96] hover:to-purple-500 hover:text-white hover:border-transparent transition"
              >
                View Products
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= DEALS SECTION =============
function DealsSection({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-heading">Hot Deals</h2>
              <p className="text-subheading text-sm">Best discounts from our sellers</p>
            </div>
          </div>
          <Link href="/products?hasDiscount=true" className="text-button hover:text-button-hover font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= TRENDING SECTION =============
function TrendingSection({ products }: { products: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" })
    }
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-heading">Trending Now</h2>
              <p className="text-subheading text-sm">Most viewed products this week</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="p-2 rounded-full bg-white shadow hover:shadow-md transition">
              <ChevronLeft className="w-5 h-5 text-heading" />
            </button>
            <button onClick={() => scroll("right")} className="p-2 rounded-full bg-white shadow hover:shadow-md transition">
              <ChevronRight className="w-5 h-5 text-heading" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-72 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= STUDENT TESTIMONIALS =============
function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">What Students Say</h2>
          <p className="text-subheading max-w-2xl mx-auto">Real experiences from VIT students</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-background rounded-2xl p-8 border border-gray-100">
              <Quote className="w-10 h-10 text-button/30 mb-4" />
              <p className="text-text mb-6 text-lg leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D97E96] to-purple-500 flex items-center justify-center text-white font-bold">
                  {testimonial.profilePhotoUrl ? (
                    <Image src={testimonial.profilePhotoUrl} alt={testimonial.studentName} width={48} height={48} className="rounded-full object-cover" />
                  ) : (
                    testimonial.studentName.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-semibold text-heading">{testimonial.studentName}</p>
                  <p className="text-sm text-subheading">{testimonial.batch}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= CTA SECTION =============
function CTASection() {
  const router = useRouter()

  return (
    <section className="py-20 bg-gradient-to-r from-[#D97E96] to-purple-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Selling?</h2>
        <p className="text-white/90 mb-8 text-lg">List your first product in under 2 minutes. It's free!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/products/create")}
            className="px-8 py-4 bg-white text-[#D97E96] font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Start Selling Now
          </button>
          <button
            onClick={() => router.push("/products")}
            className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
          >
            Browse Products
          </button>
        </div>
      </div>
    </section>
  )
}

// ============= MAIN COMPONENT =============
export default function AllSections() {
  const [stats, setStats] = useState<HomepageStats | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [sellers, setSellers] = useState<TopSeller[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [justListed, setJustListed] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])

  useEffect(() => {
    // Fetch all data in parallel
    fetchStats().then(setStats)
    fetchCategories().then(setCategories)
    fetchTopSellers().then(setSellers)
    fetchTestimonials().then(setTestimonials)
    fetchJustListed().then(setJustListed)
    fetchTrending().then(setTrending)
    fetchDeals().then(setDeals)
  }, [])

  return (
    <>
      <QuickBrowseSection categories={categories} />
      <StatsBar stats={stats} />
      <JustListedSection products={justListed} />
      <WhyDealHarborSection />
      <DealsSection products={deals} />
      <TopSellersSection sellers={sellers} />
      <TrendingSection products={trending} />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection />
    </>
  )
}
