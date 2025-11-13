# Active Listings Fix - Testing Guide

## ✅ What Was Fixed

The "Active" tab in the profile page was showing only a placeholder message instead of actually fetching and displaying the user's products.

### Changes Made:

1. **Created `ActiveProductsTab.tsx`** - New component that:
   - Fetches user's products from `/api/sellers/{userId}/products`
   - Displays products in a responsive grid (1/2/3 columns)
   - Shows product images, title, price, condition, category
   - Includes view count and favorite count stats
   - Provides "View" and "Edit" action buttons
   - Has pagination support (12 products per page)
   - Loading states and error handling
   - Empty state with "Create New Listing" button

2. **Updated `ProfilePageComponent.tsx`**:
   - Imported `ActiveProductsTab` component
   - Changed active tab from placeholder to `<ActiveProductsTab userId={user.id} />`

### API Endpoint Used:
- **GET** `/api/sellers/{userId}/products?page=0&size=12`
- Returns paginated list of products for a specific seller
- Includes product details, images, stats

---

## 🧪 Testing Instructions

### Prerequisites:
1. Backend server must be running on `http://localhost:8080`
2. Frontend must be running on `http://localhost:3000`
3. User must be logged in

### Test Steps:

1. **Start Backend Server:**
   ```powershell
   cd path\to\backend
   .\mvnw spring-boot:run
   # or
   java -jar target/your-app.jar
   ```

2. **Start Frontend Server:**
   ```powershell
   cd C:\Users\-THE-GREAT-\Downloads\DealHarbor-Frontend\dealharbor-frontend
   npm run dev
   ```

3. **Manual API Test (with cookies):**
   
   Once you're logged in through the browser:
   
   a. Open browser DevTools (F12) → Application → Cookies
   b. Find the `JSESSIONID` cookie and copy its value
   c. Run this PowerShell command:
   
   ```powershell
   # Replace YOUR_SESSION_ID with actual JSESSIONID from browser
   $sessionId = "YOUR_SESSION_ID"
   $cookie = "JSESSIONID=$sessionId"
   
   # Get your profile to get user ID
   $profile = Invoke-WebRequest -Uri "http://localhost:8080/api/profile" `
     -Headers @{ "Cookie" = $cookie } `
     -Method GET | 
     ConvertFrom-Json
   
   Write-Host "User ID: $($profile.id)" -ForegroundColor Yellow
   Write-Host "Active Listings: $($profile.activeListings)" -ForegroundColor Yellow
   
   # Test the products endpoint
   $products = Invoke-WebRequest -Uri "http://localhost:8080/api/products/seller/$($profile.id)?page=0&size=20" `
     -Headers @{ "Cookie" = $cookie } `
     -Method GET | 
     ConvertFrom-Json
   
   Write-Host "`nTotal Products: $($products.totalElements)" -ForegroundColor Green
   Write-Host "Total Pages: $($products.totalPages)" -ForegroundColor Green
   
   if ($products.content) {
     Write-Host "`nYour Products:" -ForegroundColor Cyan
     $products.content | ForEach-Object {
       Write-Host "  - $($_.title) | Price: `$$($_.price) | Condition: $($_.condition)" -ForegroundColor White
     }
   }
   ```

4. **Visual Test in Browser:**
   
   a. Login to the app: http://localhost:3000/login
   
   b. Navigate to profile: http://localhost:3000/profile
   
   c. Click on "Active Listings" tab
   
   **Expected Results:**
   - ✅ Loading spinner appears briefly
   - ✅ Your products displayed in grid layout
   - ✅ Each product shows: image, title, price, condition badge, category, view count, favorite count
   - ✅ "View" and "Edit" buttons on each product
   - ✅ Pagination appears if more than 12 products
   - ✅ If no products: "You don't have any active listings yet" message with "Create New Listing" button

5. **Test Scenarios:**

   **Scenario A: User with products**
   - Active tab should show all active listings
   - Products should be clickable
   - Edit button should work
   - Pagination should work if > 12 products

   **Scenario B: User with no products**
   - Should show empty state
   - "Create New Listing" button should redirect to /products/create

   **Scenario C: Loading state**
   - Should show spinner while fetching
   - Should show products after loading complete

   **Scenario D: Error state**
   - If backend is down: should show error message
   - "Try Again" button should retry fetch

---

## 🔍 Debugging

### Check Browser Console:
```
[ActiveProductsTab] Fetching products for user: {userId}, page: 0
[ActiveProductsTab] Response status: 200
[ActiveProductsTab] Received data: { totalElements: X, totalPages: Y, ... }
```

### Check Network Tab:
- Request: `GET /api/sellers/{userId}/products?page=0&size=12`
- Status: 200 OK
- Response: JSON with products array

### Common Issues:

1. **"Failed to fetch products" error**
   - Backend server not running
   - Check: http://localhost:8080/actuator/health

2. **Empty list but profile shows activeListings > 0**
   - Products might be archived/inactive
   - Check backend database

3. **Images not loading**
   - Check image URLs in response
   - Verify CORS settings

4. **401 Unauthorized**
   - User not logged in
   - Cookie not being sent
   - Session expired

---

## 📊 Component Structure

```
ProfilePageComponent
├── Product Statistics (ArchivalStatsCard)
└── My Products (Tabs)
    ├── Active Listings Tab → ActiveProductsTab ✅ NEW
    │   ├── Products Grid (responsive)
    │   ├── Product Cards
    │   │   ├── Image + Condition Badge
    │   │   ├── Title + Price
    │   │   ├── Description
    │   │   ├── Category Badge
    │   │   ├── Stats (views, favorites)
    │   │   └── Actions (View, Edit)
    │   └── Pagination
    ├── Sold Products Tab → SoldProductsTab
    └── Expired Products Tab → UnsoldProductsTab
```

---

## 🎨 UI Features

### Product Card Design:
- **Image**: 192px height, object-cover, with fallback icon
- **Condition Badge**: Color-coded (NEW=green, LIKE_NEW=blue, GOOD=yellow, FAIR=orange, POOR=red)
- **Price**: Large, bold, pink color (#D97E96)
- **Stats**: Eye icon for views, Heart icon for favorites
- **Hover Effect**: Shadow elevation on hover
- **Buttons**: Outlined style with icons

### Responsive Grid:
- **Mobile**: 1 column
- **Tablet**: 2 columns (md:grid-cols-2)
- **Desktop**: 3 columns (lg:grid-cols-3)

### Pagination:
- Previous/Next buttons
- Numbered page buttons
- Current page highlighted in blue
- Disabled state when loading

---

## ✅ Verification Checklist

Before marking as complete, verify:

- [ ] Backend server running on port 8080
- [ ] Frontend server running on port 3000
- [ ] User logged in successfully
- [ ] Profile page loads without errors
- [ ] "Active Listings" tab shows products
- [ ] Product images display correctly
- [ ] Condition badges show correct colors
- [ ] View/Edit buttons work
- [ ] Pagination works (if applicable)
- [ ] Empty state shows if no products
- [ ] Loading state appears during fetch
- [ ] Error handling works if backend down

---

## 🚀 API Test Commands (Quick Copy)

```powershell
# Test 1: Check backend health
Invoke-RestMethod -Uri "http://localhost:8080/actuator/health"

# Test 2: Get profile (replace JSESSIONID)
$cookie = "JSESSIONID=YOUR_SESSION_ID_HERE"
$profile = Invoke-RestMethod -Uri "http://localhost:8080/api/profile" -Headers @{ "Cookie" = $cookie }
$profile

# Test 3: Get user's products
$userId = $profile.id
$products = Invoke-RestMethod -Uri "http://localhost:8080/api/products/seller/$userId?page=0&size=20" -Headers @{ "Cookie" = $cookie }
$products | ConvertTo-Json -Depth 3

# Test 4: Quick summary
Write-Host "User: $($profile.name)" -ForegroundColor Green
Write-Host "Active Listings: $($profile.activeListings)" -ForegroundColor Yellow
Write-Host "Total Products Returned: $($products.content.Count)" -ForegroundColor Cyan
```

---

## 📝 Notes

- The component uses the same API endpoint as the seller profile page
- Products are fetched by seller ID (which is the logged-in user's ID)
- Only active (non-archived) products are shown in this tab
- Sold products appear in the "Sold Products" tab
- Expired products appear in the "Expired Products" tab

---

**Status**: ✅ Ready for Testing (pending backend startup)
