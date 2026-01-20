# Backend API Requirements for DealHarbor Homepage

## Overview
The frontend homepage has been redesigned with new sections that require additional API endpoints. Some endpoints may already exist and just need modifications, while others are completely new.

---

## Required Endpoints

### 1. GET /api/homepage/stats
**Purpose:** Compact platform statistics for homepage stats bar

**Response:**
```json
{
  "totalActiveProducts": 1234,
  "totalVerifiedStudents": 567,
  "avgSavingsPercent": 42,
  "successfulSales": 890
}
```

**Implementation Notes:**
- Cache for 5 minutes (stats don't need real-time updates)
- `avgSavingsPercent` = average of ((originalPrice - price) / originalPrice * 100) across products with discounts
- `successfulSales` = count of products with status = "SOLD"

---

### 2. GET /api/categories/featured
**Purpose:** Top categories with product counts for "Quick Browse" section

**Query Parameters:**
- `limit` (optional, default: 6)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Electronics",
    "productCount": 234,
    "iconName": "laptop",
    "imageUrl": "/images/categories/electronics.jpg"
  }
]
```

**Implementation Notes:**
- Order by productCount DESC
- `iconName` is optional, frontend has fallback icons
- `imageUrl` is optional, for future category images

---

### 3. GET /api/sellers/top-rated
**Purpose:** Featured sellers spotlight on homepage

**Query Parameters:**
- `limit` (optional, default: 6)
- `minRating` (optional, default: 4.0)
- `verified` (optional, default: true)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "profilePhotoUrl": "/photos/user123.jpg",
    "rating": 4.9,
    "reviewCount": 23,
    "totalSales": 47,
    "isVerified": true,
    "badge": "GOLD",
    "joinedAt": "2024-08-15T00:00:00Z"
  }
]
```

**Implementation Notes:**
- Order by rating DESC, then totalSales DESC
- `badge` enum: BRONZE, SILVER, GOLD, PLATINUM (based on sales milestones)
- Only return sellers with at least 1 completed sale

---

### 4. GET /api/testimonials
**Purpose:** Student testimonials for social proof section

**Query Parameters:**
- `limit` (optional, default: 3)
- `featured` (optional, default: true) - only return approved testimonials

**Response:**
```json
[
  {
    "id": "uuid",
    "studentName": "Rahul Kumar",
    "batch": "CSE 2024",
    "quote": "Sold my laptop within 2 days!",
    "profilePhotoUrl": "/photos/student.jpg",
    "rating": 5,
    "createdAt": "2025-12-01T00:00:00Z"
  }
]
```

**Implementation Notes:**
- This requires a new `testimonials` table in the database
- Admin should be able to approve/feature testimonials
- If testimonials table doesn't exist yet, you can create a simple one or return hardcoded testimonials initially

---

### 5. MODIFY: GET /api/products
**Purpose:** Enhanced filtering for products page

**New Query Parameters to Support:**
- `categoryId` (UUID) - Filter by category
- `condition` (enum) - Filter by condition: NEW, LIKE_NEW, GOOD, FAIR, USED
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `sellerId` (UUID) - Filter by seller
- `featured` (boolean) - Only featured products
- `hasDiscount` (boolean) - Only products where originalPrice > price

**Existing Parameters (ensure these work):**
- `page`, `size` - Pagination
- `sortBy` - Sorting: date_desc, date_asc, price_asc, price_desc, popularity

---

### 6. GET /api/products/just-listed
**Purpose:** Products listed in the last 24 hours for "Just Listed" section

**Query Parameters:**
- `limit` (optional, default: 10)
- `hours` (optional, default: 24) - How many hours back to look

**Response:** Same as regular products response

**Implementation Notes:**
- Filter where `createdAt >= NOW() - INTERVAL X HOURS`
- Order by createdAt DESC

---

### 7. GET /api/products/deals
**Purpose:** Products with significant discounts for "Hot Deals" section

**Query Parameters:**
- `limit` (optional, default: 10)
- `minDiscountPercent` (optional, default: 10)

**Response:** Same as regular products response, but only products where:
- `originalPrice` is not null
- `originalPrice > price`
- `(originalPrice - price) / originalPrice * 100 >= minDiscountPercent`

**Implementation Notes:**
- Order by discount percentage DESC

---

## Database Schema Additions

### Testimonial Table (if not exists)
```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  student_name VARCHAR(100) NOT NULL,
  batch VARCHAR(50),
  quote TEXT NOT NULL,
  profile_photo_url VARCHAR(500),
  rating INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Table Additions (if not exists)
Ensure users table has:
- `badge` enum (BRONZE, SILVER, GOLD, PLATINUM)
- `total_sales` integer
- `rating` decimal
- `review_count` integer

---

## Priority Order
1. **High:** Modify `/api/products` with filter params (already most important)
2. **High:** `/api/categories/featured` (needed for Quick Browse)
3. **Medium:** `/api/homepage/stats` (fallback values exist)
4. **Medium:** `/api/sellers/top-rated` (mock data works for now)
5. **Low:** `/api/testimonials` (using hardcoded for now)
6. **Low:** `/api/products/just-listed` (can use regular products endpoint)
7. **Low:** `/api/products/deals` (can use regular products endpoint)

---

## CORS / Auth Notes
- All these endpoints should be PUBLIC (no auth required)
- Ensure CORS headers allow frontend domain
- Cache headers recommended for stats endpoint (Cache-Control: max-age=300)
