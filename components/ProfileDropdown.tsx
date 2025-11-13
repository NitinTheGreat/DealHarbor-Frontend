"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./ClientAuth"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, User, LogOut, MessageCircle, PlusCircle } from "lucide-react"

export default function ProfileDropdown() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleProfile = () => {
    setIsOpen(false)
    router.push("/profile")
  }

  const handleMessages = () => {
    setIsOpen(false)
    router.push("/messages")
  }

  const handleSellProduct = () => {
    setIsOpen(false)
    router.push("/products/create")
  }

  if (!user) return null

  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || "User"
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const profileImage = user.profilePhotoUrl && !imageError 
    ? user.profilePhotoUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=D97E96&color=fff&size=128`

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-button flex-shrink-0">
          {!imageError && user.profilePhotoUrl ? (
            <img
              src={profileImage}
              alt={userName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#D97E96] to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {userInitials}
            </div>
          )}
        </div>
        <span className="hidden sm:block font-medium text-heading max-w-[120px] truncate">
          {userName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-subheading transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-br from-[#FEF5F6] to-white">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-button flex-shrink-0">
                  {!imageError && user.profilePhotoUrl ? (
                    <img
                      src={profileImage}
                      alt={userName}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#D97E96] to-purple-500 flex items-center justify-center text-white font-bold text-base">
                      {userInitials}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-heading truncate">{userName}</p>
                  <p className="text-xs text-subheading truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <motion.button
                whileHover={{ backgroundColor: "#F3F4F6", x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProfile}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-heading text-sm">View Profile</p>
                  <p className="text-xs text-subheading">Manage your account</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: "#F3F4F6", x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMessages}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-heading text-sm">Messages</p>
                  <p className="text-xs text-subheading">View your conversations</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: "#F3F4F6", x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSellProduct}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-heading text-sm">Sell Product</p>
                  <p className="text-xs text-subheading">List a new product</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: "#FEE2E2", x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors group mt-1 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 group-hover:bg-red-600 flex items-center justify-center transition-colors">
                  <LogOut className="w-5 h-5 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-red-600 group-hover:text-red-700 text-sm">Logout</p>
                  <p className="text-xs text-red-400 group-hover:text-red-500">Sign out of your account</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
