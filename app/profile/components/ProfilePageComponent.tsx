"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArchivalStatsCard } from "@/components/ArchivalStatsCard"
import { SoldProductsTab } from "./SoldProductsTab"
import { UnsoldProductsTab } from "./UnsoldProductsTab"
import { ActiveProductsTab } from "./ActiveProductsTab"
import { Package, TrendingUp, Archive } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  name: string
  bio: string | null
  phoneNumber: string | null
  profilePhotoUrl: string
  role: string
  enabled: boolean
  locked: boolean
  provider: string
  createdAt: string
  lastLoginAt: string
  sellerBadge: string | null
  sellerRating: number
  buyerRating: number
  totalSales: number
  totalPurchases: number
  totalListings: number
  activeListings: number
  totalRevenue: number
  responseRate: number
  positiveReviews: number
  negativeReviews: number
  firstSaleAt: string | null
  universityId: string | null
  graduationYear: string | null
  department: string | null
  overallRating: number
  sellerSuccessRate: number
  verifiedStudent: boolean
}

export default function ProfileComponent() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"active" | "sold" | "expired">("active")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/profile", {
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        const data = await response.json()
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p style={{ color: "var(--color-text)" }}>Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle style={{ color: "var(--color-heading)" }}>Error Loading Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: "var(--color-text)" }} className="mb-4">
              {error || "Unable to load your profile. Please try again."}
            </p>
            <Button
              onClick={() => window.location.reload()}
              style={{ backgroundColor: "var(--color-button)" }}
              className="w-full text-white"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatBadge = (badge: string) => {
    return badge
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Card with Profile Info */}
        <Card className="border-2" style={{ borderColor: "var(--color-button)" }}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.profilePhotoUrl && user.profilePhotoUrl !== "/api/images/default-avatar.png" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profilePhotoUrl || "/placeholder.svg"}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover border-4"
                    style={{ borderColor: "var(--color-button)" }}
                  />
                ) : (
                  <div
                    className="h-24 w-24 rounded-full flex items-center justify-center text-2xl font-bold text-white border-4"
                    style={{
                      backgroundColor: "var(--color-button)",
                      borderColor: "var(--color-button)",
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              {/* Profile Header Info */}
              <div className="flex-1">
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-heading)",
                  }}
                >
                  {user.name}
                </h1>
                <p style={{ color: "var(--color-text)" }} className="text-sm mb-3">
                  {user.email}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {user.verifiedStudent && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: "var(--color-button)" }}
                    >
                      ✓ Student Verified
                    </span>
                  )}
                  {user.sellerBadge && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: "#4299E1" }}
                    >
                      {formatBadge(user.sellerBadge)}
                    </span>
                  )}
                  {user.role && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: "#718096" }}
                    >
                      {user.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ratings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ color: "var(--color-subheading)" }}>
                Overall Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" style={{ color: "var(--color-button)" }}>
                {user.overallRating.toFixed(2)}
              </p>
              <p style={{ color: "var(--color-text)" }} className="text-xs mt-1">
                out of 5.00
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ color: "var(--color-subheading)" }}>
                Seller Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" style={{ color: "var(--color-button)" }}>
                {user.sellerRating.toFixed(2)}
              </p>
              <p style={{ color: "var(--color-text)" }} className="text-xs mt-1">
                {user.totalSales} sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ color: "var(--color-subheading)" }}>
                Buyer Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" style={{ color: "var(--color-button)" }}>
                {user.buyerRating.toFixed(2)}
              </p>
              <p style={{ color: "var(--color-text)" }} className="text-xs mt-1">
                {user.totalPurchases} purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ color: "var(--color-subheading)" }}>
                Response Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" style={{ color: "var(--color-button)" }}>
                {user.responseRate.toFixed(0)}%
              </p>
              <p style={{ color: "var(--color-text)" }} className="text-xs mt-1">
                Average response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ color: "var(--color-subheading)" }}>
                Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span style={{ color: "var(--color-text)" }} className="text-sm">
                    Total Listings
                  </span>
                  <span className="font-bold text-lg" style={{ color: "var(--color-button)" }}>
                    {user.totalListings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: "var(--color-text)" }} className="text-sm">
                    Active Listings
                  </span>
                  <span className="font-bold text-lg" style={{ color: "var(--color-button)" }}>
                    {user.activeListings}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ color: "var(--color-subheading)" }}>
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span style={{ color: "var(--color-text)" }} className="text-sm">
                    Positive Reviews
                  </span>
                  <span className="font-bold text-lg" style={{ color: "#48BB78" }}>
                    {user.positiveReviews}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: "var(--color-text)" }} className="text-sm">
                    Negative Reviews
                  </span>
                  <span className="font-bold text-lg" style={{ color: "#F56565" }}>
                    {user.negativeReviews}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ color: "var(--color-subheading)" }}>
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span style={{ color: "var(--color-text)" }} className="text-sm">
                    Total Revenue
                  </span>
                  <span className="font-bold text-lg" style={{ color: "var(--color-button)" }}>
                    {formatCurrency(user.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: "var(--color-text)" }} className="text-sm">
                    Success Rate
                  </span>
                  <span className="font-bold text-lg" style={{ color: "var(--color-button)" }}>
                    {user.sellerSuccessRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: "var(--color-heading)" }}>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-subheading)" }}>
                  Email Address
                </p>
                <p style={{ color: "var(--color-text)" }}>{user.email}</p>
              </div>

              {user.phoneNumber && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-subheading)" }}>
                    Phone Number
                  </p>
                  <p style={{ color: "var(--color-text)" }}>{user.phoneNumber}</p>
                </div>
              )}

              {user.bio && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-subheading)" }}>
                    Bio
                  </p>
                  <p style={{ color: "var(--color-text)" }}>{user.bio}</p>
                </div>
              )}

              {user.department && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-subheading)" }}>
                    Department
                  </p>
                  <p style={{ color: "var(--color-text)" }}>{user.department}</p>
                </div>
              )}

              {user.graduationYear && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-subheading)" }}>
                    Graduation Year
                  </p>
                  <p style={{ color: "var(--color-text)" }}>{user.graduationYear}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-subheading)" }}>
                  Account Status
                </p>
                <p style={{ color: "var(--color-text)" }}>
                  {user.enabled ? "Active" : "Inactive"}
                  {user.locked && " (Locked)"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Timeline */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: "var(--color-heading)" }}>Account Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm font-semibold" style={{ color: "var(--color-subheading)" }}>
                  Account Created
                </span>
                <span style={{ color: "var(--color-text)" }}>{formatDate(user.createdAt)}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm font-semibold" style={{ color: "var(--color-subheading)" }}>
                  Last Login
                </span>
                <span style={{ color: "var(--color-text)" }}>{formatDate(user.lastLoginAt)}</span>
              </div>

              {user.firstSaleAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold" style={{ color: "var(--color-subheading)" }}>
                    First Sale
                  </span>
                  <span style={{ color: "var(--color-text)" }}>{formatDate(user.firstSaleAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Archival Statistics */}
        <div className="my-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-heading)" }}>
            Product Statistics
          </h2>
          <ArchivalStatsCard />
        </div>

        {/* Products Tabs Section */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: "var(--color-heading)" }}>My Products</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === "active"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>Active Listings</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("sold")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === "sold"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Sold Products</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("expired")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === "expired"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    <span>Expired Products</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "active" && user && <ActiveProductsTab userId={user.id} />}

              {activeTab === "sold" && <SoldProductsTab />}

              {activeTab === "expired" && <UnsoldProductsTab />}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild style={{ backgroundColor: "var(--color-button)" }} className="text-white">
            <Link href="/edit-profile">Edit Profile</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            style={{
              borderColor: "var(--color-button)",
              color: "var(--color-button)",
            }}
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
