// ===== Navigation Types =====
export type ViewType =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'wishlist'
  | 'checkout'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'dashboard'
  | 'orders'
  | 'order-detail'
  | 'addresses'
  | 'search'
  | 'messages';

// ===== Product Types =====
export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  sku?: string;
  price?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string;
  description?: string;
  sku?: string;
  categoryId: string;
  brandId?: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  stock: number;
  weight?: number;
  tags?: string;
  warranty?: string;
  returnPolicy?: string;
  shippingInfo?: string;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  category?: Category;
  brand?: Brand;
}

// ===== Category Types =====
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  parentId?: string;
  status: string;
  children?: Category[];
  _count?: { products: number };
}

// ===== Brand Types =====
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  status: string;
  _count?: { products: number };
}

// ===== Cart Types =====
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  variantId?: string;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

// ===== Wishlist Types =====
export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  product: Product;
}

// ===== Order Types =====
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

// ===== User Types =====
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
}

export interface Address {
  id: string;
  userId: string;
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  isDefault: boolean;
}

// ===== Review Types =====
export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  reply?: string;
  user: { name: string; avatar?: string };
  createdAt: string;
}

// ===== Coupon Types =====
export interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  status: string;
}

// ===== Notification Types =====
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ===== Analytics Types =====
export interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
  pageViews: number;
  conversions: number;
}

// ===== Dashboard Stats =====
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  productGrowth: number;
}

// ===== Filter Types =====
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  pages: number;
}

// ===== Payment Types =====
export type PaymentMethod = 'stripe' | 'paypal' | 'sslcommerz' | 'bkash' | 'nagad' | 'cod' | 'bank_transfer';

export interface CheckoutData {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  shippingMethod?: string;
}