"use client"

import { useState } from "react"
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

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

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="aspect-square bg-gray-100 flex items-center justify-center rounded-lg">
          <p className="text-gray-400">No images available</p>
        </div>
      </div>
    )
  }

  // Sort images - primary first, then by sort order
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1
    if (b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })

  const getFullImageUrl = (url: string) => {
    if (!url) return "/placeholder.png"
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = url.startsWith("/") ? url.substring(1) : url
    return `${API_BASE}/${cleanUrl}`
  }

  const currentImageUrl = getFullImageUrl(sortedImages[selectedIndex]?.imageUrl || "")

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Main Image Display */}
        <div className="relative bg-white">
          <div 
            className="relative w-full overflow-hidden cursor-crosshair group"
            style={{ height: "500px" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = ((e.clientX - rect.left) / rect.width) * 100
              const y = ((e.clientY - rect.top) / rect.height) * 100
              const img = e.currentTarget.querySelector('img')
              if (img) {
                img.style.transformOrigin = `${x}% ${y}%`
              }
            }}
            onMouseLeave={(e) => {
              const img = e.currentTarget.querySelector('img')
              if (img) {
                img.style.transformOrigin = 'center center'
              }
            }}
          >
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={currentImageUrl}
                alt={sortedImages[selectedIndex]?.altText || `${title} - Image ${selectedIndex + 1}`}
                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-200 group-hover:scale-150"
              />
            </div>
            
            {/* Navigation arrows for multiple images */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>
              </>
            )}

            {/* Image counter */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                {selectedIndex + 1} / {sortedImages.length}
              </div>
            )}

            {/* Zoom hint */}
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ZoomIn className="w-4 h-4 inline mr-1" />
              Hover to zoom
            </div>
          </div>
        </div>

        {/* Thumbnail strip */}
        {sortedImages.length > 1 && (
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex gap-2 overflow-x-auto">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => setSelectedIndex(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedIndex
                      ? "border-orange-500 shadow-md scale-105"
                      : "border-gray-300 hover:border-gray-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getFullImageUrl(image.imageUrl)}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={currentImageUrl}
            alt={sortedImages[selectedIndex]?.altText || title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
                {selectedIndex + 1} / {sortedImages.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
