// Types for creating/updating products

export interface ProductCreateRequest {
  title: string
  description: string
  price: number
  originalPrice?: number
  categoryId: string
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR" | "USED"
  brand?: string
  model?: string
  tags?: string[]
  pickupLocation?: string
  deliveryAvailable?: boolean
  isNegotiable?: boolean
  imageUrls?: string[]
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: number
}

export type ProductCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR" | "USED"

export const PRODUCT_CONDITIONS: { value: ProductCondition; label: string; description: string }[] = [
  {
    value: "NEW",
    label: "New",
    description: "Brand new, never used, with original packaging",
  },
  {
    value: "LIKE_NEW",
    label: "Like New",
    description: "Gently used, in excellent condition",
  },
  {
    value: "GOOD",
    label: "Good",
    description: "Used with minor signs of wear",
  },
  {
    value: "FAIR",
    label: "Fair",
    description: "Used with noticeable signs of wear",
  },
  {
    value: "POOR",
    label: "Poor",
    description: "Heavily used, may have defects",
  },
  {
    value: "USED",
    label: "Used",
    description: "Previously owned, normal wear",
  },
]
