"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, Share2, MessageCircle, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/ClientAuth"
import MarkAsSoldButton from "./MarkAsSoldButton"

interface Props {
  productId: string
  sellerId: string
  product: {
    title: string
    price: number
    imageUrl?: string
  }
}

export default function ProductActions({ productId, sellerId, product }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [message, setMessage] = useState("")
  const [phone, setPhone] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasNativeShare, setHasNativeShare] = useState(false)
  
  const isOwner = user?.id === sellerId

  // Check if favorited on mount
  useEffect(() => {
    checkFavoriteStatus()
    // Check if native share is available
    if (typeof window !== "undefined" && "share" in navigator) {
      setHasNativeShare(true)
    }
  }, [productId])

  const checkFavoriteStatus = async () => {
    try {
      const res = await fetch("/api/favorites", { credentials: "include" })
      if (res.ok) {
        const favorites = await res.json()
        const isFav = favorites.some((fav: any) => fav.productId === productId)
        setIsFavorited(isFav)
      }
    } catch (error) {
      console.error("Failed to check favorite status:", error)
    }
  }

  const toggleFavorite = async () => {
    setFavoriteLoading(true)
    try {
      const method = isFavorited ? "DELETE" : "POST"
      const res = await fetch(`/api/favorites/${productId}`, {
        method,
        credentials: "include",
      })

      if (res.status === 401) {
        router.push(`/login?redirect=/products/${productId}`)
        return
      }

      if (res.ok) {
        setIsFavorited(!isFavorited)
        toast.success(isFavorited ? "Removed from favorites" : "Added to favorites")
      } else {
        throw new Error("Failed to update favorite")
      }
    } catch (error) {
      toast.error("Failed to update favorite")
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleShare = async (platform: "whatsapp" | "facebook" | "twitter" | "copy" | "native") => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    const text = `Check out this ${product.title} for ₹${product.price}!`

    if (platform === "native" && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text,
          url,
        })
      } catch (error) {
        // User cancelled share
      }
      return
    }

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error("Failed to copy link")
      }
      return
    }

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    }

    if (platform in shareUrls) {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400")
    }
  }

  const handleChatWithSeller = async () => {
    try {
      // Check if user is authenticated
      const authRes = await fetch("/api/auth/me", { credentials: "include" })
      if (!authRes.ok) {
        router.push(`/login?redirect=/products/${productId}`)
        return
      }

      const userData = await authRes.json()

      // Redirect directly to messages page with seller ID
      // The messages page will handle creating the conversation via WebSocket
      router.push(`/messages?sellerId=${sellerId}&productId=${productId}`)
    } catch (error) {
      console.error('Error starting chat:', error)
      toast.error("Failed to start chat")
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingMessage(true)

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: sellerId,
          productId,
          content: message,
        }),
      })

      if (res.status === 401) {
        router.push(`/login?redirect=/products/${productId}`)
        return
      }

      if (res.ok) {
        const data = await res.json()
        toast.success("Redirecting to chat...")
        setShowMessageModal(false)
        setMessage("")
        setPhone("")
        // Redirect to messages page
        router.push(`/messages?conversationId=${data.conversationId || data.id}`)
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        {/* Show Mark as Sold for owner, otherwise show Chat button */}
        {isOwner ? (
          <MarkAsSoldButton productId={productId} productTitle={product.title} />
        ) : (
          <button
            onClick={handleChatWithSeller}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#D97E96] to-[#E598AD] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontFamily: "var(--font-button)" }}
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Seller
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isFavorited
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            {isFavorited ? "Saved" : "Save"}
          </button>

          {/* Share Button */}
          <div className="relative group">
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Share
            </button>
            
            {/* Share Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
              >
                Facebook
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
              >
                Twitter
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              {hasNativeShare && (
                <button
                  onClick={() => handleShare("native")}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  More Options
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Seller</h3>
            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hi, I'm interested in this product..."
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Phone (Optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
