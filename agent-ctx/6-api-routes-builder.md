# Task 6: API Routes Builder - Worklog

## Summary
Created all 14 API route files for the NextShop e-commerce application. All routes use Prisma ORM with SQLite, proper error handling, and Next.js 16 App Router conventions.

## Files Created

### 1. `/src/app/api/products/route.ts`
- **GET**: Lists products with comprehensive filtering (search, categoryId, brandId, minPrice, maxPrice, rating, sort, page, limit, featured, trending, bestSeller, newArrival, inStock, onSale). Includes category, brand, images (ordered), and variants. Returns paginated response `{ products, total, pages }`.
- **POST**: Creates a product with nested image and variant creation. Supports all product fields.

### 2. `/src/app/api/products/[id]/route.ts`
- **GET**: Fetches single product by ID with category, brand, images, variants, and reviews (with user info). Increments view count on fetch.
- **PUT**: Updates product with full field support. Handles nested image and variant replacement (deleteMany + create).
- **DELETE**: Deletes product by ID with existence check.

### 3. `/src/app/api/categories/route.ts`
- **GET**: Lists categories with children count. Supports `?parentOnly=true` for top-level only. Includes nested active children with their product counts.
- **POST**: Creates category with all fields including SEO.

### 4. `/src/app/api/brands/route.ts`
- **GET**: Lists active brands with product count via `_count`.
- **POST**: Creates brand with all fields.

### 5. `/src/app/api/cart/route.ts`
- **GET**: Gets/creates cart for user with items including product images and brand.
- **POST**: Adds item to cart with duplicate detection (increments quantity if exists). Validates stock.
- **PUT**: Updates cart item quantity with minimum 1 validation.
- **DELETE**: Removes cart item by cartItemId query param.

### 6. `/src/app/api/wishlist/route.ts`
- **GET**: Gets/creates wishlist with product details (images, brand, category).
- **POST**: Adds to wishlist with duplicate detection. Returns message if already exists.
- **DELETE**: Removes from wishlist by userId + productId query params.

### 7. `/src/app/api/orders/route.ts`
- **GET**: Lists orders for user with pagination, optional status filter. Includes items and last payment.
- **POST**: Creates order from cart data with: auto-generated order number, stock decrement, soldCount increment, coupon usage tracking, cart clearing, and notification creation.

### 8. `/src/app/api/orders/[id]/route.ts`
- **GET**: Gets single order with items, payments, refunds, coupon, and user info.

### 9. `/src/app/api/auth/route.ts`
- **POST** with `action: 'login'`: Email/password auth using bcryptjs `compare`. Returns user without password.
- **POST** with `action: 'register'`: Creates user with bcryptjs `hash` (12 rounds). Validates email uniqueness and password length.
- **GET** with `?email=`: Checks if email exists. Returns `{ exists: boolean }`.

### 10. `/src/app/api/coupons/route.ts`
- **GET**: Lists all active coupons.
- **POST**: Dual-purpose: validates coupon (when `code` + `subtotal` provided) or creates coupon (admin). Validation checks: active status, date range, usage limit, per-user limit, min purchase. Calculates discount for percentage/fixed/free_shipping types with maxDiscount cap.

### 11. `/src/app/api/reviews/route.ts`
- **GET**: Lists approved reviews for a product with user info.
- **POST**: Creates review with duplicate check, rating validation (1-5). Recalculates product aggregate rating and review count.

### 12. `/src/app/api/admin/route.ts`
- **GET** `?type=stats`: Dashboard stats (totalRevenue, totalOrders, totalUsers, totalProducts, ordersGrowth%, revenueGrowth%, pendingOrders, lowStockProducts).
- **GET** `?type=analytics`: 30-day daily revenue/orders chart data, order status distribution, top 5 selling products, category distribution.
- **GET** `?type=recent-orders`: Latest 10 orders with user info.

### 13. `/src/app/api/notifications/route.ts`
- **GET**: Gets notifications for user (last 50) with unread count.
- **PUT**: Marks notification as read by notificationId.

### 14. `/src/app/api/addresses/route.ts`
- **GET**: Lists addresses for user, default first.
- **POST**: Creates address. If `isDefault`, unsets other defaults first.
- **PUT**: Updates address fields. Handles default address logic.
- **DELETE**: Deletes address by `?id=` query param.

## Technical Notes
- All routes use `import { db } from '@/lib/db'` for Prisma access.
- Dynamic route params use Next.js 16 pattern: `const { id } = await context.params` where context is the second parameter.
- Proper HTTP status codes: 200, 201, 400, 401, 403, 404, 409, 500.
- Error handling with try/catch and console.error logging.
- No lint errors in any API route files.