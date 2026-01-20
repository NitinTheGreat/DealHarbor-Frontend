"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, CheckCircle, Shield, GraduationCap, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "./ClientAuth"
import ProfileDropdown from "./ProfileDropdown"
import Link from "next/link"

export default function HeroSection() {
  const [keyword, setKeyword] = useState("")
  const router = useRouter()
  const { user } = useAuth()
  const [scrollY, setScrollY] = useState(0)
  const [floatingItems, setFloatingItems] = useState<Array<{ id: number; x: number; y: number }>>([])

  // Initialize floating items - reduced from 20 to 6 for cleaner look
  useEffect(() => {
    setFloatingItems(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: 15 + (i * 15) + Math.random() * 10,
        y: 20 + (i * 12) + Math.random() * 10,
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
    <section className="relative w-full h-screen bg-gradient-to-br from-[#FEF5F6] via-[#FFF8F3] to-[#F5F0FF] overflow-hidden flex flex-col">
      {/* Header Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <span className="font-heading text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#D97E96] to-purple-500 bg-clip-text text-transparent">DealHarbor</span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <ProfileDropdown />
              ) : (
                <Link
                  href="/login"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#D97E96] to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="flex-1 flex items-center justify-center">
        {/* Background Gradient Blurs - reduced from 9 to 4 */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D97E96]/15 to-[#D97E96]/5 rounded-full blur-3xl" />
        <div className="absolute top-32 right-0 w-80 h-80 bg-gradient-to-bl from-purple-400/12 to-pink-300/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-pink-300/10 to-purple-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-tl from-[#D97E96]/10 to-purple-500/5 rounded-full blur-3xl" />

        {/* Floating Animated Elements - reduced and subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingItems.map((item) => (
            <div
              key={item.id}
              className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                animation: `float ${4 + (item.id % 3)}s infinite ease-in-out`,
                animationDelay: `${item.id * 0.3}s`,
                transform: `translateY(${scrollY * 0.05 * (item.id % 2 === 0 ? 1 : -1)}px)`,
              }}
            />
          ))}
        </div>

        {/* Main Content - Fully responsive layout */}
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center">
          <div className="text-center space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto">
            {/* Tag */}
            {/* <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-[#D97E96]/20 hover:border-[#D97E96]/40 transition-all mx-auto text-xs sm:text-sm">
            <span className="font-body font-medium text-heading">Welcome to DealHarbor ✨</span>
          </div> */}

            {/* Main Headline */}
            <div className="space-y-2 sm:space-y-3 w-full">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-heading leading-tight sm:leading-none">
                <span className="inline-block relative">
                  <span
                    className="relative bg-gradient-to-r from-[#D97E96] via-purple-500 to-pink-500 bg-clip-text text-transparent font-black"
                    style={{
                      backgroundSize: "300% 300%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Buy & Sell
                  </span>
                </span>
              </h1>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-heading leading-tight sm:leading-none">
                Within Your Campus
              </h1>
              <p className="font-body text-base sm:text-lg md:text-xl text-subheading max-w-2xl mx-auto pt-2 sm:pt-4">
                The trusted marketplace for VIT students. Buy pre-loved items from verified students, sell what you don't need, and save money.
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

            {/* Trust Indicators with proper icons */}
            {/* <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 pt-6 sm:pt-8 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200 shadow-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-body text-sm font-medium text-heading">Verified Students Only</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200 shadow-sm">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="font-body text-sm font-medium text-heading">Safe Transactions</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200 shadow-sm">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <span className="font-body text-sm font-medium text-heading">VIT Exclusive</span>
              </div>
            </div> */}

            {/* Social Proof */}
            {/* <div className="flex items-center justify-center gap-6 pt-6 text-sm text-subheading">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">500+ Active Students</span>
              </div>
              <span className="text-gray-300">|</span>
              <span>1,200+ Products Listed</span>
            </div> */}
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
    </section >
  )
}
