"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Props {
  productId: string
  productTitle: string
}

export default function MarkAsSoldButton({ productId, productTitle }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  async function handleMarkAsSold() {
    if (!confirm(`Are you sure you want to mark "${productTitle}" as sold? This action cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${API_BASE}/api/products/archived/mark-sold/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Optional: You can add buyer info here if needed
          // buyerId: "...",
          // soldPrice: ...
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to mark product as sold")
      }

      const data = await response.json()
      toast.success("✅ " + data.message)

      // Wait a bit for user to see success message
      setTimeout(() => {
        router.push("/profile?tab=sold")
        router.refresh()
      }, 1500)
    } catch (error: any) {
      console.error("Error marking as sold:", error)
      toast.error("❌ " + (error.message || "Failed to mark product as sold"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkAsSold}
      disabled={loading}
      className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Marking as Sold...
        </>
      ) : (
        <>
          <CheckCircle className="w-5 h-5" />
          Mark as Sold
        </>
      )}
    </button>
  )
}
