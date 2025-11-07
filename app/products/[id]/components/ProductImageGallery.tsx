"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ZoomIn } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

interface ProductImage {
  id: string
  imageUrl: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
}

interface Props {
  images: ProductImage[]
  title: string
}

export default function ProductImageGallery({ images, title }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1
    if (b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })

  const currentImage = sortedImages[selectedIndex] || sortedImages[0]

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.png"
    if (url.startsWith("http")) return url
    return `${API_BASE}${url}`
  }

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400">No images available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Main Image */}
        <div
          className="relative aspect-square bg-gray-100 cursor-zoom-in group"
          onClick={() => setIsZoomed(true)}
        >
          <Image
            src={getImageUrl(currentImage.imageUrl)}
            alt={currentImage.altText || title}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {/* Image counter */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {sortedImages.length > 1 && (
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedIndex
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={getImageUrl(image.imageUrl)}
                    alt={`${title} - ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 20vw, 10vw"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close zoom"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src={getImageUrl(currentImage.imageUrl)}
              alt={currentImage.altText || title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  )
}
