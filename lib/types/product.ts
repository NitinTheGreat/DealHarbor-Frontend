// lib/types/product.ts

export type ProductCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR" | "USED"

export type ProductStatus = "PENDING" | "APPROVED" | "REJECTED" | "SOLD" | "DELETED"

export type SellerBadge =
  | "NEW_SELLER"
  | "ACTIVE_SELLER"
  | "TRUSTED_SELLER"
  | "DEALHARBOR_CHOICE"
  | "PREMIUM_SELLER"
  | "LEGENDARY_SELLER"

export interface CategoryResponse {
  id: string
  name: string
  slug: string
  iconUrl?: string
  parentId?: string
  displayOrder: number
}

export interface ProductResponse {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  isNegotiable: boolean
  condition: ProductCondition
  brand?: string
  model?: string
  category: CategoryResponse
  seller: {
    id: string
    name: string
    profilePhotoUrl?: string
    studentVerified: boolean
    sellerBadge: SellerBadge
    rating: number
  }
  imageUrls: string[]
  tags: string[]
  pickupLocation?: string
  deliveryAvailable: boolean
  views: number
  favorites: number
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface ProductSearchRequest {
  keyword?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  conditions?: ProductCondition[]
  location?: string
  deliveryAvailable?: boolean
  isNegotiable?: boolean
  verifiedStudentsOnly?: boolean
  sortBy?: string
  page?: number
  size?: number
}
