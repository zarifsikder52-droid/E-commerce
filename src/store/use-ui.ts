import { create } from 'zustand';
import type { ViewType, Product, Category, Brand, User, Address, Order, Coupon, Notification as AppNotification } from '@/types';

interface UIState {
  currentView: ViewType;
  selectedProductId: string | null;
  selectedOrderId: string | null;
  selectedCategoryId: string | null;
  selectedBrandId: string | null;
  searchQuery: string;
  isSearchOpen: boolean;
  isCartDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  featuredProducts: Product[];
  trendingProducts: Product[];
  bestSellerProducts: Product[];
  newArrivalProducts: Product[];
  flashSaleProducts: Product[];
  totalProducts: number;
  isLoading: boolean;
  // Customer data
  orders: Order[];
  addresses: Address[];
  notifications: AppNotification[];
  unreadNotifications: number;
  // Recent searches
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  // Admin data
  isDataRefreshing: boolean;
  analyticsData: { date: string; revenue: number; orders: number; visitors: number }[];
  dashboardStats: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    revenueGrowth: number;
    orderGrowth: number;
    userGrowth: number;
    productGrowth: number;
  };

  // Actions
  navigate: (view: ViewType) => void;
  viewProduct: (productId: string) => void;
  viewOrder: (orderId: string) => void;
  setCategory: (categoryId: string | null) => void;
  setBrand: (brandId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setCartDrawerOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setProducts: (products: Product[], total?: number) => void;
  setCategories: (categories: Category[]) => void;
  setBrands: (brands: Brand[]) => void;
  setFeaturedProducts: (products: Product[]) => void;
  setTrendingProducts: (products: Product[]) => void;
  setBestSellerProducts: (products: Product[]) => void;
  setNewArrivalProducts: (products: Product[]) => void;
  setFlashSaleProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setOrders: (orders: Order[]) => void;
  setAddresses: (addresses: Address[]) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  setAnalyticsData: (data: { date: string; revenue: number; orders: number; visitors: number }[]) => void;
  setDashboardStats: (stats: UIState['dashboardStats']) => void;
  invalidateStoreData: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'home',
  selectedProductId: null,
  selectedOrderId: null,
  selectedCategoryId: null,
  selectedBrandId: null,
  searchQuery: '',
  isSearchOpen: false,
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  products: [],
  categories: [],
  brands: [],
  featuredProducts: [],
  trendingProducts: [],
  bestSellerProducts: [],
  newArrivalProducts: [],
  flashSaleProducts: [],
  totalProducts: 0,
  isLoading: false,
  orders: [],
  addresses: [],
  notifications: [],
  unreadNotifications: 0,
  recentSearches: [],
  isDataRefreshing: false,
  analyticsData: [],
  dashboardStats: {
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    userGrowth: 0,
    productGrowth: 0,
  },

  navigate: (view) => set({ currentView: view, isMobileMenuOpen: false }),
  viewProduct: (productId) => set({ selectedProductId: productId, currentView: 'product' }),
  viewOrder: (orderId) => set({ selectedOrderId: orderId, currentView: 'order-detail' }),
  setCategory: (categoryId) => set({ selectedCategoryId: categoryId }),
  setBrand: (brandId) => set({ selectedBrandId: brandId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setProducts: (products, total) => set({ products, totalProducts: total ?? products.length }),
  setCategories: (categories) => set({ categories }),
  setBrands: (brands) => set({ brands }),
  setFeaturedProducts: (products) => set({ featuredProducts: products, isDataRefreshing: false }),
  setTrendingProducts: (products) => set({ trendingProducts: products }),
  setBestSellerProducts: (products) => set({ bestSellerProducts: products }),
  setNewArrivalProducts: (products) => set({ newArrivalProducts: products }),
  setFlashSaleProducts: (products) => set({ flashSaleProducts: products }),
  setLoading: (isLoading) => set({ isLoading }),
  setOrders: (orders) => set({ orders }),
  setAddresses: (addresses) => set({ addresses }),
  setNotifications: (notifications) => set({
    notifications,
    unreadNotifications: notifications.filter(n => !n.isRead).length,
  }),
  setAnalyticsData: (analyticsData) => set({ analyticsData }),
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  addRecentSearch: (query) => {
    if (!query.trim()) return;
    const searches = [query.trim(), ...get().recentSearches.filter(s => s !== query.trim())].slice(0, 10);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nextshop-recent-searches', JSON.stringify(searches));
    }
    set({ recentSearches: searches });
  },
  clearRecentSearches: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nextshop-recent-searches');
    }
    set({ recentSearches: [] });
  },
  invalidateStoreData: () => set({
    products: [],
    featuredProducts: [],
    trendingProducts: [],
    bestSellerProducts: [],
    newArrivalProducts: [],
    flashSaleProducts: [],
    categories: [],
    brands: [],
    isDataRefreshing: true,
  }),
}));