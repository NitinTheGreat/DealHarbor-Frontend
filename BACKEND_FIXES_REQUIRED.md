# Backend Fixes Required - Comprehensive Guide

## Issues Identified
1. **Categories not loading** - `/api/categories/featured` returning empty or failing
2. **Stats all showing 0** - `/api/products/homepage-stats` not calculating properly
3. **Favorites system not implemented** - Need full user favorites functionality

---

## 1. Fix: GET /api/categories/featured

**Problem:** Categories returning empty array

**Expected Response:**
```json
[
  { "id": "uuid", "name": "Electronics", "productCount": 45 },
  { "id": "uuid", "name": "Books", "productCount": 32 }
]
```

**Implementation Check:**
```java
// CategoryRepository.java
@Query("SELECT c.id as id, c.name as name, COUNT(p) as productCount " +
       "FROM Category c LEFT JOIN Product p ON p.category = c AND p.status = 'ACTIVE' " +
       "GROUP BY c.id, c.name " +
       "ORDER BY COUNT(p) DESC")
List<FeaturedCategoryProjection> findFeaturedCategories(Pageable pageable);

// CategoryService.java
public List<FeaturedCategoryResponse> getFeaturedCategories(int limit) {
    return categoryRepository.findFeaturedCategories(PageRequest.of(0, limit))
        .stream()
        .map(p -> new FeaturedCategoryResponse(p.getId(), p.getName(), p.getProductCount()))
        .collect(Collectors.toList());
}

// CategoryController.java
@GetMapping("/featured")
public ResponseEntity<List<FeaturedCategoryResponse>> getFeaturedCategories(
    @RequestParam(defaultValue = "6") int limit) {
    return ResponseEntity.ok(categoryService.getFeaturedCategories(limit));
}
```

---

## 2. Fix: GET /api/products/homepage-stats

**Problem:** All values returning 0

**Required Stats Calculation:**
```java
// HomepageStatsResponse.java
public class HomepageStatsResponse {
    private long totalProducts;
    private long totalActiveProducts;
    private long totalVerifiedStudents;
    private int avgSavingsPercent;
    private long successfulSales;
}

// ProductRepository.java
@Query("SELECT COUNT(p) FROM Product p WHERE p.status = 'ACTIVE'")
long countActiveProducts();

@Query("SELECT AVG((p.originalPrice - p.price) * 100.0 / p.originalPrice) " +
       "FROM Product p WHERE p.originalPrice > p.price AND p.status = 'ACTIVE'")
Double calculateAverageDiscountPercent();

@Query("SELECT COUNT(p) FROM Product p WHERE p.status = 'SOLD'")
long countSoldProducts();

// UserRepository.java
@Query("SELECT COUNT(u) FROM User u WHERE u.isStudentVerified = true")
long countVerifiedStudents();

// ProductService.java
public HomepageStatsResponse getHomepageStats() {
    long activeProducts = productRepository.countActiveProducts();
    long verifiedStudents = userRepository.countVerifiedStudents();
    Double avgDiscount = productRepository.calculateAverageDiscountPercent();
    long soldProducts = productRepository.countSoldProducts();
    
    return new HomepageStatsResponse(
        productRepository.count(),
        activeProducts,
        verifiedStudents,
        avgDiscount != null ? avgDiscount.intValue() : 0,
        soldProducts
    );
}
```

**Debug:** Add logging to verify:
```java
@GetMapping("/homepage-stats")
public ResponseEntity<HomepageStatsResponse> getHomepageStats() {
    HomepageStatsResponse stats = productService.getHomepageStats();
    log.info("Homepage stats: {}", stats);
    return ResponseEntity.ok(stats);
}
```

---

## 3. NEW: Complete Favorites System

### Database Schema

```sql
-- Create user_favorites table
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate favorites
    CONSTRAINT unique_user_product_favorite UNIQUE (user_id, product_id)
);

-- Index for fast lookups
CREATE INDEX idx_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_favorites_product_id ON user_favorites(product_id);
```

### Entity

```java
// UserFavorite.java
@Entity
@Table(name = "user_favorites", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
public class UserFavorite {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### Repository

```java
// UserFavoriteRepository.java
@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UUID> {
    
    // Check if user has favorited a product
    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
    
    // Find all favorites for a user
    Page<UserFavorite> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    // Delete a favorite
    void deleteByUserIdAndProductId(UUID userId, UUID productId);
    
    // Count favorites for a product
    long countByProductId(UUID productId);
    
    // Get all favorited product IDs for a user (for bulk checking)
    @Query("SELECT f.product.id FROM UserFavorite f WHERE f.user.id = :userId")
    List<UUID> findProductIdsByUserId(@Param("userId") UUID userId);
}
```

### Service

```java
// FavoriteService.java
@Service
@Transactional
public class FavoriteService {
    
    private final UserFavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    
    // Add to favorites
    public FavoriteResponse addFavorite(UUID userId, UUID productId) {
        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new AlreadyFavoritedException("Product is already in favorites");
        }
        
        // Verify product exists
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        User user = new User();
        user.setId(userId);
        
        UserFavorite favorite = new UserFavorite();
        favorite.setUser(user);
        favorite.setProduct(product);
        
        favoriteRepository.save(favorite);
        
        long totalFavorites = favoriteRepository.countByProductId(productId);
        
        return new FavoriteResponse(true, totalFavorites, "Added to favorites");
    }
    
    // Remove from favorites
    public FavoriteResponse removeFavorite(UUID userId, UUID productId) {
        if (!favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new ResourceNotFoundException("Favorite not found");
        }
        
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
        
        long totalFavorites = favoriteRepository.countByProductId(productId);
        
        return new FavoriteResponse(false, totalFavorites, "Removed from favorites");
    }
    
    // Toggle favorite (add if not exists, remove if exists)
    public FavoriteResponse toggleFavorite(UUID userId, UUID productId) {
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            return removeFavorite(userId, productId);
        } else {
            return addFavorite(userId, productId);
        }
    }
    
    // Get user's favorites
    public Page<ProductResponse> getUserFavorites(UUID userId, Pageable pageable) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(f -> productMapper.toResponse(f.getProduct()));
    }
    
    // Check if product is favorited by user
    public boolean isFavorited(UUID userId, UUID productId) {
        return favoriteRepository.existsByUserIdAndProductId(userId, productId);
    }
    
    // Bulk check for multiple products
    public Map<UUID, Boolean> checkFavorites(UUID userId, List<UUID> productIds) {
        List<UUID> favoritedIds = favoriteRepository.findProductIdsByUserId(userId);
        Set<UUID> favoritedSet = new HashSet<>(favoritedIds);
        
        return productIds.stream()
            .collect(Collectors.toMap(
                id -> id,
                id -> favoritedSet.contains(id)
            ));
    }
}
```

### DTOs

```java
// FavoriteResponse.java
public class FavoriteResponse {
    private boolean isFavorited;
    private long totalFavorites;
    private String message;
}

// FavoriteCheckRequest.java
public class FavoriteCheckRequest {
    private List<UUID> productIds;
}

// FavoriteCheckResponse.java
public class FavoriteCheckResponse {
    private Map<UUID, Boolean> favorites; // productId -> isFavorited
}
```

### Controller

```java
// FavoriteController.java
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    
    private final FavoriteService favoriteService;
    
    // Add to favorites
    @PostMapping("/products/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FavoriteResponse> addFavorite(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(favoriteService.addFavorite(userId, productId));
    }
    
    // Remove from favorites
    @DeleteMapping("/products/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FavoriteResponse> removeFavorite(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(favoriteService.removeFavorite(userId, productId));
    }
    
    // Toggle favorite (convenience endpoint)
    @PostMapping("/products/{productId}/toggle")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FavoriteResponse> toggleFavorite(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(favoriteService.toggleFavorite(userId, productId));
    }
    
    // Get user's favorites
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ProductResponse>> getUserFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(
            favoriteService.getUserFavorites(userId, PageRequest.of(page, size))
        );
    }
    
    // Check if single product is favorited
    @GetMapping("/products/{productId}/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> checkFavorite(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(favoriteService.isFavorited(userId, productId));
    }
    
    // Bulk check favorites (for product lists)
    @PostMapping("/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FavoriteCheckResponse> checkFavorites(
            @RequestBody FavoriteCheckRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        Map<UUID, Boolean> result = favoriteService.checkFavorites(userId, request.getProductIds());
        return ResponseEntity.ok(new FavoriteCheckResponse(result));
    }
}
```

---

## 4. Enhance Product Response with Favorite Info

```java
// ProductResponse.java - Add these fields
public class ProductResponse {
    // ... existing fields ...
    
    private long favoriteCount;    // Total favorites for this product
    private boolean isFavorited;   // Whether current user has favorited (null if not logged in)
    private long viewCount;        // Total views
}

// When fetching products for authenticated user, populate isFavorited
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/favorites/products/{id}` | Yes | Add to favorites |
| DELETE | `/api/favorites/products/{id}` | Yes | Remove from favorites |
| POST | `/api/favorites/products/{id}/toggle` | Yes | Toggle favorite |
| GET | `/api/favorites` | Yes | Get user's favorites (paginated) |
| GET | `/api/favorites/products/{id}/check` | Yes | Check if favorited |
| POST | `/api/favorites/check` | Yes | Bulk check favorites |

---

## Testing Commands

```bash
# Add to favorites
curl -X POST http://localhost:8080/api/favorites/products/{productId} \
  -H "Authorization: Bearer {token}"

# Remove from favorites
curl -X DELETE http://localhost:8080/api/favorites/products/{productId} \
  -H "Authorization: Bearer {token}"

# Get my favorites
curl http://localhost:8080/api/favorites \
  -H "Authorization: Bearer {token}"

# Check categories
curl http://localhost:8080/api/categories/featured?limit=6

# Check stats
curl http://localhost:8080/api/products/homepage-stats
```

---

## Priority Order
1. **HIGH:** Fix `/api/categories/featured` - Homepage looks broken without categories
2. **HIGH:** Fix `/api/products/homepage-stats` - Stats showing 0 looks bad
3. **MEDIUM:** Implement favorites system - Core user feature
4. **LOW:** Add view tracking - Nice to have
