"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Package, DollarSign, Archive } from "lucide-react"

interface ArchivalStats {
  totalSold: number
  totalUnsold: number
  totalRevenue: number
}

export function ArchivalStatsCard() {
  const [stats, setStats] = useState<ArchivalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${API_BASE}/api/products/archived/stats`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch archival statistics")
      }

      const data = await response.json()
      setStats(data)
    } catch (error: any) {
      console.error("Error fetching archival stats:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return null // Silently fail if user has no stats yet
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Sold */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
            SOLD
          </span>
        </div>
        <div className="text-4xl font-bold text-green-700 mb-1">{stats.totalSold}</div>
        <div className="text-sm text-green-600 font-medium">Products Sold</div>
      </div>

      {/* Total Revenue */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            REVENUE
          </span>
        </div>
        <div className="text-4xl font-bold text-blue-700 mb-1">
          ₹{stats.totalRevenue.toLocaleString("en-IN")}
        </div>
        <div className="text-sm text-blue-600 font-medium">Total Earnings</div>
      </div>

      {/* Expired Products */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Archive className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
            EXPIRED
          </span>
        </div>
        <div className="text-4xl font-bold text-orange-700 mb-1">{stats.totalUnsold}</div>
        <div className="text-sm text-orange-600 font-medium">Archived Products</div>
      </div>
    </div>
  )
}
