"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HeroSection() {
  const [keyword, setKeyword] = useState("")
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [floatingItems, setFloatingItems] = useState<Array<{ id: number; x: number; y: number }>>([])

  // Initialize floating items
  useEffect(() => {
    setFloatingItems(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      })),
    )
  }, [])

  // Handle parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (keyword.trim()) {
      console.log("[v0] Search initiated with keyword:", keyword)
      router.push(`/search?q=${encodeURIComponent(keyword)}`)
    }
  }

  return (
    <section className="relative w-full h-screen bg-gradient-to-br from-[#FEF5F6] via-[#FFF8F3] to-[#F5F0FF] overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D97E96]/20 to-[#D97E96]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-32 right-0 w-80 h-80 bg-gradient-to-bl from-purple-400/15 to-pink-300/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-pink-300/15 to-purple-400/8 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-gradient-to-tl from-[#D97E96]/12 to-purple-500/8 rounded-full blur-3xl animate-pulse delay-500" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-bl from-purple-300/12 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-300" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-pink-200/10 to-purple-300/8 rounded-full blur-3xl animate-pulse delay-100" />
      <div className="absolute bottom-1/3 right-1/2 w-80 h-80 bg-gradient-to-r from-[#D97E96]/8 to-pink-400/5 rounded-full blur-3xl animate-pulse delay-900" />
      <div className="absolute top-20 left-1/2 w-72 h-72 bg-gradient-to-b from-pink-400/10 to-purple-300/5 rounded-full blur-3xl animate-pulse delay-200" />
      <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-gradient-to-t from-[#D97E96]/10 to-pink-300/5 rounded-full blur-3xl animate-pulse delay-600" />

      {/* Floating Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingItems.map((item) => (
          <div
            key={item.id}
            className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#D97E96]/25 to-[#D97E96]/8 backdrop-blur-sm"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animation: `float ${3 + (item.id % 5)}s infinite ease-in-out`,
              animationDelay: `${item.id * 0.15}s`,
              transform: `translateY(${scrollY * 0.08 * (item.id % 2 === 0 ? 1 : -1)}px)`,
            }}
          />
        ))}
      </div>

      {/* Main Content - Fully responsive layout */}
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center">
        <div className="text-center space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-[#D97E96]/20 hover:border-[#D97E96]/40 transition-all mx-auto text-xs sm:text-sm">
            <span className="font-body font-medium text-heading">Welcome to DealHarbor ✨</span>
          </div>

          {/* Main Headline - Improved FIND text with better animation and responsive sizing */}
          <div className="space-y-2 sm:space-y-3 w-full">
            <div className="relative">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-heading leading-tight sm:leading-none">
                {/* FIND with enhanced triple-layer animation */}
                <span className="inline-block relative">
                  <span className="absolute inset-0 blur-2xl sm:blur-3xl bg-gradient-to-r from-[#D97E96] via-purple-500 to-pink-500 opacity-50 sm:opacity-60 animate-pulse-slow" />
                  <span
                    className="relative bg-gradient-to-r from-[#D97E96] via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-shift font-black"
                    style={{
                      backgroundSize: "300% 300%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    FIND
                  </span>
                </span>
              </h1>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-heading leading-tight sm:leading-none mt-1 sm:mt-2">
                Your Perfect
              </h1>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight sm:leading-none mt-1 sm:mt-2">
                <span
                  className="bg-gradient-to-r from-[#D97E96] via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient-shift"
                  style={{ backgroundSize: "300% 300%" }}
                >
                  Deal Today
                </span>
              </h1>
            </div>

            <p className="font-body text-sm sm:text-base md:text-lg text-subheading max-w-3xl mx-auto pt-1 sm:pt-2">
              Explore verified sellers, authentic products, and exclusive student deals.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto px-2 sm:px-4 mt-6 sm:mt-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-[#D97E96] to-purple-500 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300" />
              <div className="relative flex items-center bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-[#D97E96]/10">
                <Search className="absolute left-4 sm:left-6 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e as any)
                    }
                  }}
                  className="flex-1 pl-12 sm:pl-16 pr-4 py-3 sm:py-4 bg-transparent focus:outline-none font-body text-sm sm:text-base md:text-lg text-heading placeholder-gray-400"
                />
              </div>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 pt-4 sm:pt-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 text-xs sm:text-sm">
              <span className="text-green-500 font-bold">✓</span>
              <span className="font-body text-heading">Verified Sellers</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 text-xs sm:text-sm">
              <span className="text-blue-500 font-bold">✓</span>
              <span className="font-body text-heading">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 text-xs sm:text-sm">
              <span className="text-purple-500 font-bold">✓</span>
              <span className="font-body text-heading">Student Exclusive</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(5deg);
          }
        }
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </section>
  )
}
