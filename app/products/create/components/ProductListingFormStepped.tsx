"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, Plus, ChevronRight, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import type { ProductCreateRequest, ProductCondition } from "@/lib/types/product-request"
import type { CategoryResponse } from "@/lib/types/product"
import { PRODUCT_CONDITIONS } from "@/lib/types/product-request"

type Step = 1 | 2 | 3 | 4

export default function ProductListingFormStepped() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [files, setFiles] = useState<File[]>([])
  
  // Debug: Log files state on every render
  console.log('🔄 Component render - currentStep:', currentStep, 'files.length:', files.length)

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
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: data[0].id }))
          }
        } else {
          toast.error("Failed to load categories. Please refresh the page.")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Failed to load categories. Please check your connection.")
      }
    }
    fetchCategories()
  }, [])

  const steps = [
    { number: 1, title: "Basic Info", description: "Product details" },
    { number: 2, title: "Images", description: "Upload photos" },
    { number: 3, title: "Pricing", description: "Set your price" },
    { number: 4, title: "Details", description: "Additional info" },
  ]

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags((prev) => [...prev, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const uploadImages = async (uploadFiles: File[]): Promise<string[]> => {
    console.log('📤 uploadImages called with files:', uploadFiles.length)
    const urls: string[] = []
    for (const file of uploadFiles) {
      console.log('📤 Processing file:', file.name, 'type:', file.type, 'size:', file.size)
      if (!file.type.startsWith("image/")) {
        throw new Error(`${file.name} is not an image`)
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`${file.name} exceeds 5MB`)
      }

      const form = new FormData()
      form.append("file", file)
      
      console.log('📤 FormData created, file appended:', form.has('file'))
      console.log('📤 FormData entries:', Array.from(form.entries()).map(([k, v]) => [k, v instanceof File ? `File: ${v.name}` : v]))

      const res = await fetch("http://localhost:8080/api/images/upload-product", {
        method: "POST",
        credentials: "include",
        body: form,
      })
      
      console.log('📤 Upload response status:', res.status, res.statusText)

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Failed to upload ${file.name}`)
      }

      const urlPath = await res.text() // e.g. "/api/images/products/..."
      urls.push(urlPath)
    }
    return urls
  }

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          toast.error("Product title is required")
          return false
        }
        if (!formData.description.trim()) {
          toast.error("Product description is required")
          return false
        }
        if (!formData.categoryId) {
          toast.error("Please select a category")
          return false
        }
        return true
      case 2:
        // Images are optional but good to have
        if (files.length === 0) {
          toast.error("Please add at least one image")
          return false
        }
        return true
      case 3:
        if (!formData.price || formData.price <= 0) {
          toast.error("Please enter a valid price")
          return false
        }
        return true
      case 4:
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4) as Step)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(4)) return
    
    setIsLoading(true)
    try {
      let imageUrls: string[] = []
      if (files.length > 0) {
        imageUrls = await uploadImages(files)
      }

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
        imageUrls,
        ...(formData.originalPrice && formData.originalPrice > 0 && { originalPrice: formData.originalPrice }),
        ...(formData.brand && { brand: formData.brand }),
        ...(formData.model && { model: formData.model }),
      }

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
        throw new Error(errorData.message || errorData.error || "Failed to create product")
      }

      toast.success("Product listed successfully!")
      router.push("/products")
    } catch (error: any) {
      console.error("Error creating product:", error)
      toast.error(error.message || "Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step.number
                    ? "bg-button text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs sm:text-sm font-medium ${currentStep >= step.number ? "text-button" : "text-gray-500"}`}>
                  {step.title}
                </p>
                <p className="hidden sm:block text-xs text-gray-400">{step.description}</p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 transition-all ${
                  currentStep > step.number ? "bg-button" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-heading mb-4">Basic Information</h2>
                
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button min-h-32 transition-colors"
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
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button transition-colors"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button transition-colors"
                    >
                      {PRODUCT_CONDITIONS.map((cond) => (
                        <option key={cond.value} value={cond.value}>
                          {cond.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Images */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-heading mb-4">Product Images</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="px-6 py-3 bg-button text-white rounded-lg hover:bg-blue-700 inline-block transition-colors">
                      Choose Images
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => {
                        console.log('📁 File input onChange triggered')
                        const list = e.target.files
                        console.log('📁 Files selected:', list?.length || 0)
                        if (!list) return
                        const incoming = Array.from(list)
                        console.log('📁 Incoming files array:', incoming.map(f => f.name))
                        const valid: File[] = []
                        for (const f of incoming) {
                          if (!f.type.startsWith("image/")) {
                            toast.error(`${f.name} is not an image`)
                            continue
                          }
                          if (f.size > 5 * 1024 * 1024) {
                            toast.error(`${f.name} exceeds 5MB`)
                            continue
                          }
                          valid.push(f)
                        }
                        console.log('✅ Valid files:', valid.map(f => f.name))
                        if (valid.length > 0) {
                          setFiles((prev) => {
                            console.log('📁 Previous files:', prev.length)
                            const newFiles = [...prev, ...valid]
                            console.log('📁 New files state:', newFiles.length)
                            return newFiles
                          })
                        }
                        e.currentTarget.value = ""
                      }}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Upload multiple images (max 5MB each)</p>
                </div>

                {files.length > 0 && (
                  <>
                    {console.log('🖼️ Preview render check - files.length:', files.length)}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {files.map((file, idx) => {
                        console.log(`🖼️ Rendering preview for file ${idx}:`, file.name)
                        const url = URL.createObjectURL(file)
                        console.log(`🖼️ Created blob URL:`, url)
                        const isPrimary = idx === 0
                        return (
                          <div key={idx} className="relative rounded-lg overflow-hidden border-2 border-gray-200 group">
                            <img src={url} alt={file.name} className="w-full h-40 object-cover" />
                            {isPrimary && (
                              <span className="absolute top-2 left-2 bg-button text-white text-xs px-2 py-1 rounded font-medium">
                                Primary
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  className="px-3 py-1 bg-white text-xs rounded font-medium"
                                  onClick={() => {
                                    setFiles((prev) => {
                                      const copy = [...prev]
                                      const [moved] = copy.splice(idx, 1)
                                      copy.unshift(moved)
                                      return copy
                                    })
                                  }}
                                >
                                  Make Primary
                                </button>
                              )}
                              <button
                                type="button"
                                className="p-2 bg-red-500 text-white rounded-full"
                                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button transition-colors"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button transition-colors"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: Show discount</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNegotiable}
                      onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                      className="w-5 h-5 text-button border-gray-300 rounded focus:ring-button"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Price is negotiable</span>
                      <p className="text-xs text-gray-500">Allow buyers to make offers</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.deliveryAvailable}
                      onChange={(e) => setFormData({ ...formData, deliveryAvailable: e.target.checked })}
                      className="w-5 h-5 text-button border-gray-300 rounded focus:ring-button"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Delivery available</span>
                      <p className="text-xs text-gray-500">Can deliver to buyer's location</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Additional Details */}
            {currentStep === 4 && (
              <div className="space-y-4">
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button transition-colors"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button transition-colors"
                      placeholder="e.g., iPhone 13 Pro"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <input
                    id="pickupLocation"
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-button transition-colors"
                    placeholder="e.g., VIT Main Campus, Block A"
                  />
                  <p className="text-sm text-gray-500 mt-1">Where buyers can meet you</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-3">
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
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-button font-semibold flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 bg-button text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-button to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                >
                  {isLoading ? "Creating..." : "List Product 🎉"}
                </button>
              )}

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-red-400 hover:text-red-600 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
