// app/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getCurrentUser, logoutUser, getClientUser } from "@/lib/auth"

interface UserProfile {
  id: string
  email: string
  name: string
  bio?: string
  phoneNumber?: string
  profilePhotoUrl?: string
  role: string
  enabled: boolean
  locked: boolean
  provider: string
  createdAt: string
  lastLoginAt?: string
  // University fields
  universityId?: string
  graduationYear?: number
  department?: string
  verifiedStudent: boolean
  // Computed fields
  overallRating?: number
  sellerSuccessRate?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // First try to get from localStorage for immediate display
      const cachedUser = getClientUser()
      if (cachedUser) {
        setUser(cachedUser)
      }

      // Then fetch fresh data from backend
      const freshUser = await getCurrentUser()
      setUser(freshUser)

      console.log("✅ Fresh user data loaded:", freshUser)
    } catch (error) {
      console.error("❌ Failed to fetch user data:", error)
      toast.error("Failed to load user data. Please log in again.")
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshProfile = async () => {
    try {
      setRefreshing(true)
      const freshUser = await getCurrentUser()
      setUser(freshUser)
      toast.success("Profile refreshed successfully!")
    } catch (error) {
      toast.error("Failed to refresh profile")
    } finally {
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Still redirect even if backend logout fails
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--color-button)" }}
          ></div>
          <p style={{ color: "var(--color-text)" }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-heading)" }}>
            User not found
          </h1>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: "var(--color-button)" }}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-heading)",
              }}
            >
              Welcome to DealHarbor, {user.name.split(" ")[0]}!
            </h1>
            <p style={{ color: "var(--color-subheading)" }}>Your VIT student marketplace dashboard</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefreshProfile}
              disabled={refreshing}
              className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {refreshing ? "Refreshing..." : "Refresh Profile"}
            </button>

            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: "var(--color-button)",
                fontFamily: "var(--font-button)",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mr-4"
                    style={{ backgroundColor: "var(--color-button)" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold" style={{ color: "var(--color-heading)" }}>
                      {user.name}
                    </h2>
                    <p style={{ color: "var(--color-subheading)" }}>{user.email}</p>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="text-right">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.verifiedStudent ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.verifiedStudent ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified Student
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Pending Verification
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: "var(--color-heading)" }}>
                    Account Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium" style={{ color: "var(--color-subheading)" }}>
                        Email:
                      </span>
                      <p style={{ color: "var(--color-text)" }}>{user.email}</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: "var(--color-subheading)" }}>
                        Role:
                      </span>
                      <p style={{ color: "var(--color-text)" }}>{user.role}</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: "var(--color-subheading)" }}>
                        Account Status:
                      </span>
                      <p style={{ color: "var(--color-text)" }}>
                        {user.enabled ? "Active" : "Inactive"}
                        {user.locked && " (Locked)"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: "var(--color-subheading)" }}>
                        Member Since:
                      </span>
                      <p style={{ color: "var(--color-text)" }}>{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    {user.lastLoginAt && (
                      <div>
                        <span className="font-medium" style={{ color: "var(--color-subheading)" }}>
                          Last Login:
                        </span>
                        <p style={{ color: "var(--color-text)" }}>{new Date(user.lastLoginAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Information */}
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: "var(--color-heading)" }}>
                    Student Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium" style={{ color: "var(--color-subheading)" }}>
                        Student Status:
                      </span>
                      <p style={{ color: user.verifiedStudent ? "var(--color-link)" : "var(--color-text)" }}>
                        {user.verifiedStudent ? "✅ Verified VIT Student" : "❌ Not Verified"}
                      </p>
                    </div>
                    {user.universityId && (
                      <div>
                        <span className="font-medium" style={{ color: "var(--color-subheading)" }}>
                          University ID:
                        </span>
                        <p style={{ color: "var(--color-text)" }}>{user.universityId}</p>
                      </div>
                    )}
                    {user.department && (
                      <div>
                        <span className="font-medium" style={{ color: "var(--color-subheading)" }}>
                          Department:
                        </span>
                        <p style={{ color: "var(--color-text)" }}>{user.department}</p>
                      </div>
                    )}
                    {user.graduationYear && (
                      <div>
                        <span className="font-medium" style={{ color: "var(--color-subheading)" }}>
                          Graduation Year:
                        </span>
                        <p style={{ color: "var(--color-text)" }}>{user.graduationYear}</p>
                      </div>
                    )}
                    {!user.verifiedStudent && (
                      <div className="mt-4">
                        <button
                          onClick={() => router.push("/verify-student")}
                          className="px-4 py-2 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                          style={{
                            backgroundColor: "var(--color-button)",
                            fontFamily: "var(--font-button)",
                          }}
                        >
                          Verify Student Status
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-semibold mb-4" style={{ color: "var(--color-heading)" }}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full text-left p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  onClick={() => toast.info("Marketplace coming soon!")}
                >
                  <div className="font-medium" style={{ color: "var(--color-heading)" }}>
                    Browse Marketplace
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-subheading)" }}>
                    Find items from fellow students
                  </div>
                </button>

                <button
                  className="w-full text-left p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  onClick={() => toast.info("Listing feature coming soon!")}
                >
                  <div className="font-medium" style={{ color: "var(--color-heading)" }}>
                    Create Listing
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-subheading)" }}>
                    Sell your items
                  </div>
                </button>

                <button
                  className="w-full text-left p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  onClick={() => toast.info("Profile settings coming soon!")}
                >
                  <div className="font-medium" style={{ color: "var(--color-heading)" }}>
                    Profile Settings
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-subheading)" }}>
                    Update your information
                  </div>
                </button>

                <button
                  className="w-full text-left p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  onClick={() => toast.info("Messages feature coming soon!")}
                >
                  <div className="font-medium" style={{ color: "var(--color-heading)" }}>
                    Messages
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-subheading)" }}>
                    Chat with buyers/sellers
                  </div>
                </button>
              </div>
            </div>

            {/* Student Verification Status Card */}
            {!user.verifiedStudent && (
              <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-yellow-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Student Verification Required</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Verify your VIT student status to access all marketplace features and build trust with other
                      students.
                    </p>
                    <button
                      onClick={() => router.push("/verify-student")}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-xl font-semibold text-sm hover:bg-yellow-700 transition-colors"
                    >
                      Verify Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
