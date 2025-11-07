import Link from "next/link"
import Image from "next/image"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

interface Product {
  id: string
  title: string
  price: number
  condition: string
  primaryImageUrl?: string
  images?: { imageUrl: string }[]
}

interface Props {
  categoryId: string
  currentProductId: string
}

const conditionColors: Record<string, string> = {
  NEW: "bg-green-100 text-green-800",
  LIKE_NEW: "bg-blue-100 text-blue-800",
  GOOD: "bg-cyan-100 text-cyan-800",
  FAIR: "bg-yellow-100 text-yellow-800",
  POOR: "bg-orange-100 text-orange-800",
  USED: "bg-gray-100 text-gray-800",
}

async function fetchRelatedProducts(categoryId: string, excludeId: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_BASE}/products?categoryId=${categoryId}&status=APPROVED&size=6`,
      { next: { revalidate: 300 } }
    )
    
    if (!res.ok) return []
    
    const data = await res.json()
    const products = Array.isArray(data) ? data : data.content || []
    
    // Filter out current product
    return products.filter((p: Product) => p.id !== excludeId).slice(0, 6)
  } catch (error) {
    console.error("Failed to fetch related products:", error)
    return []
  }
}

export default async function RelatedProducts({ categoryId, currentProductId }: Props) {
  const products = await fetchRelatedProducts(categoryId, currentProductId)

  if (products.length === 0) {
    return null
  }

  const getImageUrl = (product: Product) => {
    const imageUrl = product.primaryImageUrl || product.images?.[0]?.imageUrl
    if (!imageUrl) return "/placeholder.png"
    if (imageUrl.startsWith("http")) return imageUrl
    return `${API_BASE}${imageUrl}`
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={getImageUrl(product)}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 truncate text-sm mb-1">
                {product.title}
              </h3>
              <p className="text-lg font-bold text-blue-600 mb-2">
                ₹{product.price.toLocaleString()}
              </p>
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                  conditionColors[product.condition] || conditionColors.USED
                }`}
              >
                {product.condition.replace("_", " ")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
