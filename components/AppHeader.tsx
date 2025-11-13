"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home, Search } from "lucide-react"
import { useMemo, useState, FormEvent } from "react"
import ProfileDropdown from "./ProfileDropdown"

interface BreadcrumbItem {
  label: string
  href: string
}

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const breadcrumbs = useMemo(() => {
    const paths = pathname.split("/").filter(Boolean)
    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/" }
    ]

    let currentPath = ""
    
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      
      // Skip if it's a UUID (product/message IDs)
      if (path.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        items.push({
          label: "Details",
          href: currentPath
        })
        return
      }

      // Convert path to readable label
      let label = path
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      // Special cases
      if (path === "verify-student") label = "Verify Student Status"
      if (path === "create") label = "Create Product"
      
      items.push({
        label,
        href: currentPath
      })
    })

    return items
  }, [pathname])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  // Don't show header on these pages - check AFTER all hooks
  const excludedPaths = ["/", "/login", "/signup", "/forgot-password", "/verify-student"]
  if (excludedPaths.includes(pathname)) return null

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-6 lg:gap-8">
          {/* Breadcrumbs - Left */}
          <nav className="flex-shrink-0 min-w-0">
            <ol className="flex items-center space-x-2 text-xs sm:text-sm">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1
                const isFirst = index === 0

                return (
                  <li key={item.href} className="flex items-center min-w-0">
                    {index > 0 && (
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-2 flex-shrink-0" />
                    )}
                    
                    {isLast ? (
                      <span className="font-semibold text-heading truncate">
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-subheading hover:text-button transition-colors flex items-center gap-1.5 truncate"
                      >
                        {isFirst && <Home className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
                        <span className="truncate hidden sm:inline">{item.label}</span>
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-button transition-colors shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </form>

          {/* Profile Dropdown - Right */}
          <div className="flex-shrink-0 ml-auto">
            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-button transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </form>
      </div>
    </div>
  )
}
