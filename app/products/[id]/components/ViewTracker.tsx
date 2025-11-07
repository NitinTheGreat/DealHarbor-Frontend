"use client"

import { useEffect } from "react"

interface Props {
  productId: string
}

export default function ViewTracker({ productId }: Props) {
  useEffect(() => {
    // Increment view count when page loads
    fetch(`/api/products/${productId}/views`, { method: "POST" })
      .catch((err) => console.error("Failed to increment views:", err))
  }, [productId])

  return null
}
