"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, Plus } from "lucide-react"
import { toast } from "sonner"
import type { ProductCreateRequest, ProductCondition } from "@/lib/types/product-request"
import type { CategoryResponse } from "@/lib/types/product"
import { PRODUCT_CONDITIONS } from "@/lib/types/product-request"

export default function ProductListingForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")

  const [formData, setFormData] = useState<ProductCreateRequest>({
    title: "",
    description: "",
    price: 0,
    originalPrice: undefined,
    categoryId: "",
    condition: "GOOD",
    brand: "",
    model: "",
    tags: [],
    pickupLocation: "",
    deliveryAvailable: false,
    isNegotiable: true,
    imageUrls: [],
  })

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories", {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
          console.log("Categories loaded:", data.length)
          
          // Set first category as default
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: data[0].id }))
          }
        } else {
          console.error("Failed to fetch categories, status:", res.status)
          const errorText = await res.text()
          console.error("Categories error:", errorText)
          toast.error("Failed to load categories. Please refresh the page.")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Failed to load categories. Please check your connection.")
      }
    }
    fetchCategories()
  }, [])

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags((prev) => [...prev, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate categoryId
      if (!formData.categoryId || formData.categoryId === "") {
        toast.error("Please select a valid category")
        return
      }

      // Create product data matching backend API exactly
      const productData: ProductCreateRequest = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        condition: formData.condition,
        isNegotiable: formData.isNegotiable,
        deliveryAvailable: formData.deliveryAvailable,
        tags: tags.length > 0 ? tags : undefined,
        pickupLocation: formData.pickupLocation || undefined,
        // Include optional fields only if they have values
        ...(formData.originalPrice && formData.originalPrice > 0 && { originalPrice: formData.originalPrice }),
        ...(formData.brand && { brand: formData.brand }),
        ...(formData.model && { model: formData.model }),
      }

      console.log("Creating product with data:", productData)

      const res = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to create product" }))
        console.error("Product creation failed:", errorData)
        throw new Error(errorData.message || errorData.error || "Failed to create product")
      }

      const data = await res.json()
      console.log("Product created successfully:", data)
      toast.success("Product listed successfully!")
      
      // Redirect to products page
      router.push("/products")
    } catch (error: any) {
      console.error("Error creating product:", error)
      toast.error(error.message || "Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section>
        <h2 className="text-2xl font-bold text-heading mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Product Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button"
              placeholder="e.g., iPhone 13 Pro Max 256GB"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button min-h-32"
              placeholder="Describe your product in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="categoryId"
                required
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData({ ...formData, categoryId: e.target.value })
                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button"
              >
                {categories.length === 0 ? (
                  <option value="">Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Condition *
              </label>
              <select
                id="condition"
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as ProductCondition })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button"
              >
                {PRODUCT_CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label} - {cond.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Images - Coming Soon */}
      <section>
        <h2 className="text-2xl font-bold text-heading mb-4">Product Images</h2>
        
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 font-medium">
            📸 Image upload coming soon!
          </p>
          <p className="text-amber-700 text-sm mt-1">
            Product images will be available in a future update. You can still create your product listing now.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section>
        <h2 className="text-2xl font-bold text-heading mb-4">Pricing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price * (₹)
            </label>
            <input
              id="price"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Original Price (₹)
            </label>
            <input
              id="originalPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.originalPrice || ""}
              onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || undefined })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isNegotiable}
              onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
              className="w-4 h-4 text-button border-gray-300 rounded focus:ring-button"
            />
            <span className="text-sm text-gray-700">Price is negotiable</span>
          </label>
        </div>
      </section>

      {/* Additional Details */}
      <section>
        <h2 className="text-2xl font-bold text-heading mb-4">Additional Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              id="brand"
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button"
              placeholder="e.g., Apple, Samsung"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              id="model"
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button"
              placeholder="e.g., iPhone 13 Pro"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button"
              placeholder="Add tags (press Enter)"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-button text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Options */}
      <section>
        <h2 className="text-2xl font-bold text-heading mb-4">Delivery Options</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location
            </label>
            <input
              id="pickupLocation"
              type="text"
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button"
              placeholder="e.g., VIT Main Campus, Block A"
            />
            <p className="text-sm text-gray-500 mt-1">Where buyers can meet you to pick up the item</p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.deliveryAvailable}
                onChange={(e) => setFormData({ ...formData, deliveryAvailable: e.target.checked })}
                className="w-4 h-4 text-button border-gray-300 rounded focus:ring-button"
              />
              <span className="text-sm text-gray-700">Delivery available</span>
            </label>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 bg-button text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? "Creating..." : "List Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-button font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
