'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useUIStore } from '@/store/use-ui';
import { useAuthStore } from '@/store/use-auth';
import { useAdminAuth } from '@/store/use-admin-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown,
  Eye, ArrowUpRight, MoreHorizontal, Search, Filter,
  Download, RefreshCw, BarChart3, PieChart as PieChartIcon,
  Tag, MessageSquare, ImageIcon, Settings, Menu, Loader2,
  AlertTriangle, ChevronRight, Star, Plus, Pencil, Trash2, ChevronDown, Save, Check, X,
  Bell, LayoutDashboard, LogOut, Store, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import type { Order, Product, User as AppUser, Coupon, Review, Category, Brand } from '@/types';

// ─── Constants ───
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const orderStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800' },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800' },
  processing: { label: 'Processing', color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800' },
  shipped: { label: 'Shipped', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-800' },
  delivered: { label: 'Delivered', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800' },
};

const roleConfig: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800' },
  seller: { label: 'Seller', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800' },
  customer: { label: 'Customer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800' },
};

type AdminTab = 'overview' | 'orders' | 'products' | 'users' | 'coupons' | 'reviews' | 'settings';

const sidebarItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { id: 'products', label: 'Products', icon: <Package className="h-4 w-4" /> },
  { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { id: 'coupons', label: 'Coupons', icon: <Tag className="h-4 w-4" /> },
  { id: 'reviews', label: 'Reviews', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

// ─── Custom scrollbar ───
const scrollbarStyles = `
  .admin-scroll::-webkit-scrollbar { width: 5px; }
  .admin-scroll::-webkit-scrollbar-track { background: transparent; }
  .admin-scroll::-webkit-scrollbar-thumb { background: #404040; border-radius: 3px; }
  .admin-scroll::-webkit-scrollbar-thumb:hover { background: #525252; }
  .admin-content-scroll::-webkit-scrollbar { width: 6px; }
  .admin-content-scroll::-webkit-scrollbar-track { background: transparent; }
  .admin-content-scroll::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 3px; }
  .admin-content-scroll::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
  @media (prefers-color-scheme: dark) {
    .admin-content-scroll::-webkit-scrollbar-thumb { background: #3f3f46; }
    .admin-content-scroll::-webkit-scrollbar-thumb:hover { background: #52525b; }
  }
`;

// ─── Format helpers ───
const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const generateSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Product form type ───
interface ProductFormData {
  name: string;
  slug: string;
  categoryId: string;
  brandId: string;
  price: string;
  discountPrice: string;
  stock: string;
  shortDesc: string;
  description: string;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
}

const emptyProductForm: ProductFormData = {
  name: '', slug: '', categoryId: '', brandId: '',
  price: '', discountPrice: '', stock: '0', shortDesc: '',
  description: '', status: 'active',
  isFeatured: false, isTrending: false, isBestSeller: false, isNewArrival: false,
};

// ─── Admin user type (with order count) ───
interface AdminUser extends AppUser {
  _count?: { orders: number };
  createdAt?: string;
}

export default function AdminDashboard() {
  const { user: spaUser, isAuthenticated: spaAuthenticated } = useAuthStore();
  const { admin, isAuthenticated: adminAuthenticated } = useAdminAuth();
  const { navigate, analyticsData, setAnalyticsData, dashboardStats, setDashboardStats } = useUIStore();

  // Use admin auth if available, fall back to SPA auth
  const isAuthenticated = adminAuthenticated || spaAuthenticated;
  const user = admin || spaUser;

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Admin data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});

  // Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const ordersPerPage = 10;
  const productPerPage = 10;
  const usersPerPage = 10;

  // Product dialog
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(emptyProductForm);
  const [productSaving, setProductSaving] = useState(false);

  // Expanded orders
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Settings saving
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  // ─── Fetch functions ───
  const fetchProducts = useCallback(async (page = 1, search = '', status = 'all') => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(productPerPage) });
      if (search) params.set('search', search);
      if (status && status !== 'all') params.set('status', status);
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch { /* silent */ }
  }, []);

  const fetchUsers = useCallback(async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(usersPerPage) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch { /* silent */ }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        const flat: Category[] = [];
        for (const c of data.categories) {
          flat.push(c);
          if (c.children) flat.push(...c.children);
        }
        setCategories(flat);
      }
    } catch { /* silent */ }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      if (data.brands) setBrands(data.brands);
    } catch { /* silent */ }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setSiteSettings(data.settings);
        setSettingsForm(data.settings);
      }
    } catch { /* silent */ }
  }, []);

  // ─── Initial data load ───
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, analyticsRes, topProductsRes, ordersRes, couponsRes, categoriesRes, brandsRes, settingsRes] = await Promise.allSettled([
          fetch('/api/admin?endpoint=stats').then(r => r.json()),
          fetch('/api/admin?endpoint=analytics').then(r => r.json()),
          fetch('/api/products?limit=5&sort=soldCount').then(r => r.json()),
          fetch('/api/orders?limit=50').then(r => r.json()),
          fetch('/api/coupons').then(r => r.json()),
          fetch('/api/admin/categories').then(r => r.json()),
          fetch('/api/brands').then(r => r.json()),
          fetch('/api/admin/settings').then(r => r.json()),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
          setDashboardStats(statsRes.value.stats);
        }
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data) {
          setAnalyticsData(analyticsRes.value.data);
        }
        if (topProductsRes.status === 'fulfilled' && topProductsRes.value?.products) {
          setProducts(topProductsRes.value.products);
        }
        if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
          setAllOrders(ordersRes.value.orders);
        }
        if (couponsRes.status === 'fulfilled' && couponsRes.value?.coupons) {
          setCoupons(couponsRes.value.coupons);
        }
        if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.categories) {
          const flat: Category[] = [];
          for (const c of categoriesRes.value.categories) {
            flat.push(c);
            if (c.children) flat.push(...c.children);
          }
          setCategories(flat);
        }
        if (brandsRes.status === 'fulfilled' && brandsRes.value?.brands) {
          setBrands(brandsRes.value.brands);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value?.settings) {
          setSiteSettings(settingsRes.value.settings);
          setSettingsForm(settingsRes.value.settings);
        }
      } catch {
        // mock data fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user, setAnalyticsData, setDashboardStats]);

  // Fetch products, users when their tabs become active
  useEffect(() => {
    if (activeTab === 'products' && !loading) fetchProducts(1, productSearch, productStatusFilter);
  }, [activeTab, loading, fetchProducts, productSearch, productStatusFilter]);

  useEffect(() => {
    if (activeTab === 'users' && !loading) fetchUsers(1, userSearch);
  }, [activeTab, loading, fetchUsers, userSearch]);

  useEffect(() => {
    if (activeTab === 'settings' && !loading) fetchSettings();
  }, [activeTab, loading, fetchSettings]);

  // ─── Handlers ───
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const order = allOrders.find(o => o.id === orderId);
    const originalStatus = order?.status || 'pending';
    // Optimistic update
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success('Order status updated');
        sessionStorage.setItem('nextshop-admin-changed', 'true');
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update');
      }
    } catch (err) {
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: originalStatus } : o));
      toast.error(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setEditingProductId(product.id);
      setProductForm({
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        brandId: product.brandId || '',
        price: String(product.price),
        discountPrice: product.discountPrice ? String(product.discountPrice) : '',
        stock: String(product.stock),
        shortDesc: product.shortDesc || '',
        description: product.description || '',
        status: product.status,
        isFeatured: product.isFeatured,
        isTrending: product.isTrending,
        isBestSeller: product.isBestSeller,
        isNewArrival: product.isNewArrival,
      });
    } else {
      setEditingProductId(null);
      setProductForm(emptyProductForm);
    }
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.slug || !productForm.categoryId || !productForm.price) return;
    setProductSaving(true);
    try {
      const url = editingProductId
        ? `/api/admin/products/${editingProductId}`
        : '/api/admin/products';
      const method = editingProductId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      if (res.ok) {
        setProductDialogOpen(false);
        fetchProducts(productPage, productSearch, productStatusFilter);
        toast.success(editingProductId ? 'Product updated' : 'Product created');
        sessionStorage.setItem('nextshop-admin-changed', 'true');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to save product');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
    setProductSaving(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Archive this product? (Sets status to draft)')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts(productPage, productSearch, productStatusFilter);
        toast.success('Product archived');
        sessionStorage.setItem('nextshop-admin-changed', 'true');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to archive product');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  const handleUserStatusToggle = async (userId: string, currentActive: boolean) => {
    const newActive = !currentActive;
    // Optimistic
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: newActive } : u));
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: newActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(`User ${newActive ? 'activated' : 'deactivated'}`);
    } catch {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: currentActive } : u));
      toast.error('Failed to update user status');
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId);
    const originalRole = user?.role || 'customer';
    // Optimistic
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Role changed to ${newRole}`);
    } catch {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: originalRole } : u));
      toast.error('Failed to change user role');
    }
  };

  const handleFileUpload = async (file: File, settingKey: 'logoUrl' | 'faviconUrl') => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/x-icon'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Use JPEG, PNG, SVG, WebP, or ICO.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setSettingsForm(prev => ({ ...prev, [settingKey]: data.url }));
          toast.success(`${settingKey === 'logoUrl' ? 'Logo' : 'Favicon'} uploaded`);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed. Please try again.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, 'logoUrl');
    e.target.value = '';
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, 'faviconUrl');
    e.target.value = '';
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSiteSettings(data.settings);
        toast.success('Settings saved');
        sessionStorage.setItem('nextshop-admin-changed', 'true');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
    setSettingsSaving(false);
  };

  // ─── Computed data (before early return to satisfy hooks rules) ───
  const filteredOrders = useMemo(() => {
    let result = allOrders;
    if (orderStatusFilter !== 'all') {
      result = result.filter(o => o.status === orderStatusFilter);
    }
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.items.some(i => i.productName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allOrders, orderStatusFilter, orderSearch]);

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, orderPage]);

  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const filteredProducts = useMemo(() => {
    if (!productSearch && productStatusFilter === 'all') return products;
    return products.filter(p => {
      const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase());
      const matchStatus = productStatusFilter === 'all' || p.status === productStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [products, productSearch, productStatusFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productPerPage;
    return filteredProducts.slice(start, start + productPerPage);
  }, [filteredProducts, productPage]);

  const totalProductPages = Math.ceil(filteredProducts.length / productPerPage);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, userPage]);

  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);

  const recentOrders = allOrders.slice(0, 5);

  // Pie data for order status distribution
  const orderStatusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    allOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: orderStatusConfig[name]?.label ?? name,
      value,
    }));
  }, [allOrders]);

  // ─── Not authenticated ───
  if (!isAuthenticated || !user || user.role !== 'admin') {
    if (adminAuthenticated || typeof window !== 'undefined' && window.location.pathname === '/admin') {
      return null;
    }
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-4">
        <div className="h-20 w-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-zinc-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Admin Access Required</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            You need to be signed in as an administrator to access the admin dashboard.
          </p>
        </div>
        <Button size="lg" onClick={() => navigate('login')} className="gap-2">
          Sign In
        </Button>
      </div>
    );
  }

  // ─── Stat card component ───
  const StatCard = ({ title, value, growth, icon, iconBg = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' }: {
    title: string; value: string; growth: number; icon: React.ReactNode; prefix?: string; iconBg?: string;
  }) => (
    <Card className="rounded-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          {growth >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className={`text-xs font-medium ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {Math.abs(growth)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Sidebar content ───
  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5 px-3">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => { setActiveTab(item.id); onNavigate?.(); }}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 text-left w-full ${
            activeTab === item.id
              ? 'bg-white/10 text-white'
              : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
          }`}
        >
          <span className={activeTab === item.id ? 'text-white' : 'text-zinc-500'}>{item.icon}</span>
          {item.label}
          {activeTab === item.id && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </button>
      ))}
      <div className="my-3 border-t border-white/10" />
      <button
        onClick={() => { sessionStorage.setItem('nextshop-admin-changed', 'true'); window.location.href = '/'; onNavigate?.(); }}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-all duration-200 text-left w-full"
      >
        <Store className="h-4 w-4" />
        View Store
        <ArrowUpRight className="h-3 w-3 ml-auto" />
      </button>
    </nav>
  );

  // ─── Stars component ───
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 dark:text-zinc-700'}`}
        />
      ))}
    </div>
  );

  // ─── Pagination component ───
  const Pagination = ({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <Button
              key={i + 1}
              variant={page === i + 1 ? 'default' : 'outline'}
              size="sm"
              className="w-8 h-8 p-0 text-xs"
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          {totalPages > 5 && <span className="text-muted-foreground text-xs px-1">...</span>}
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
        </div>
      </div>
    );
  };

  // ─── Page title map ───
  const pageTitles: Record<AdminTab, { title: string; description: string }> = {
    overview: { title: 'Overview', description: 'Your store at a glance' },
    orders: { title: 'Orders', description: 'Manage and track customer orders' },
    products: { title: 'Products', description: 'Manage your product catalog' },
    users: { title: 'Users', description: 'Manage registered users' },
    coupons: { title: 'Coupons', description: 'Manage discount coupons' },
    reviews: { title: 'Reviews', description: 'Monitor customer reviews' },
    settings: { title: 'Settings', description: 'Configure your store' },
  };

  const currentPageInfo = pageTitles[activeTab];

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="w-full min-h-screen bg-background">
        {/* ─── Desktop Sidebar (fixed) ─── */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[260px] flex-col bg-zinc-950 border-r border-white/[0.06]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] shrink-0">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              <LayoutDashboard className="h-4.5 w-4.5 text-zinc-900" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-tight">NextShop</p>
              <p className="text-[11px] text-zinc-500">Admin Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto admin-scroll py-4">
            <SidebarNav />
          </div>

          {/* User at bottom */}
          <div className="border-t border-white/[0.06] p-4 shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-200 truncate">{user.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => { sessionStorage.setItem('nextshop-admin-changed', 'true'); window.location.href = '/'; }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ─── Mobile Nav ─── */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-background border-b">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-9">
                <Menu className="h-4 w-4" />
                <span className="text-sm font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0 bg-zinc-950 border-white/[0.06]">
              <SheetHeader className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                    <LayoutDashboard className="h-4.5 w-4.5 text-zinc-900" />
                  </div>
                  <SheetTitle className="text-left text-sm font-semibold text-white tracking-tight">NextShop</SheetTitle>
                </div>
              </SheetHeader>
              <div className="px-5 py-2 border-b border-white/[0.06] mb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{user.name}</p>
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-white/10 text-zinc-400 bg-transparent">
                      {roleConfig.admin?.label}
                    </Badge>
                  </div>
                </div>
              </div>
              <SidebarNav onNavigate={() => setIsMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px] bg-zinc-100 dark:bg-zinc-800">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <main className="lg:pl-[260px] min-h-screen">
          <div className="p-4 pt-[68px] lg:p-8 lg:pt-8">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading dashboard...</p>
                </div>
              </div>
            ) : (
              <>

                {/* ════════════════════════════════════════════
                    TOP BAR
                ════════════════════════════════════════════ */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight">{currentPageInfo.title}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{currentPageInfo.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-medium rounded-lg">
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-medium rounded-lg">
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                </div>

                {/* ════════════════════════════════════════════
                    OVERVIEW TAB
                ════════════════════════════════════════════ */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <StatCard
                        title="Total Revenue"
                        value={`৳${dashboardStats.totalRevenue.toLocaleString()}`}
                        growth={dashboardStats.revenueGrowth}
                        icon={<DollarSign className="h-5 w-5" />}
                        iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                      />
                      <StatCard
                        title="Total Orders"
                        value={dashboardStats.totalOrders.toLocaleString()}
                        growth={dashboardStats.orderGrowth}
                        icon={<ShoppingCart className="h-5 w-5" />}
                        iconBg="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
                      />
                      <StatCard
                        title="Total Users"
                        value={dashboardStats.totalUsers.toLocaleString()}
                        growth={dashboardStats.userGrowth}
                        icon={<Users className="h-5 w-5" />}
                        iconBg="bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400"
                      />
                      <StatCard
                        title="Total Products"
                        value={dashboardStats.totalProducts.toLocaleString()}
                        growth={dashboardStats.productGrowth}
                        icon={<Package className="h-5 w-5" />}
                        iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                      />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Revenue Chart */}
                      <Card className="rounded-xl border-border/50 shadow-sm">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-sm font-semibold tracking-tight">Revenue Trend</CardTitle>
                          <CardDescription className="text-xs">Revenue over the past 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {analyticsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                              <AreaChart data={analyticsData}>
                                <defs>
                                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  interval="preserveStartEnd"
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis
                                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                  }}
                                  formatter={(value: number, name: string) => [
                                    name === 'revenue' ? formatCurrency(value) : value,
                                    name === 'revenue' ? 'Revenue' : 'Orders'
                                  ]}
                                  labelFormatter={(label) => new Date(label as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="revenue"
                                  stroke="#6366f1"
                                  fill="url(#revenueGrad)"
                                  strokeWidth={2}
                                  name="revenue"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                              No analytics data available
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Orders Chart */}
                      <Card className="rounded-xl border-border/50 shadow-sm">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-sm font-semibold tracking-tight">Daily Orders</CardTitle>
                          <CardDescription className="text-xs">Order volume over the past 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {analyticsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                              <BarChart data={analyticsData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  interval="preserveStartEnd"
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis
                                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                  }}
                                  formatter={(value: number) => [value, 'Orders']}
                                  labelFormatter={(label) => new Date(label as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                />
                                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="orders" />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                              No analytics data available
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Bottom Row: Recent Orders + Pie + Top Products */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      {/* Recent Orders Table */}
                      <Card className="xl:col-span-2 rounded-xl border-border/50 shadow-sm">
                        <CardHeader className="pb-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-sm font-semibold tracking-tight">Recent Orders</CardTitle>
                              <CardDescription className="text-xs">Latest 5 orders</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground rounded-lg" onClick={() => setActiveTab('orders')}>
                              View All
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-3" />
                              <p className="text-sm text-muted-foreground">No orders yet</p>
                            </div>
                          ) : (
                            <ScrollArea className="max-h-96 admin-content-scroll">
                              <Table>
                                <TableHeader>
                                  <TableRow className="hover:bg-transparent border-b">
                                    <TableHead className="text-xs font-medium text-muted-foreground h-9">Order</TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden sm:table-cell">Date</TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground h-9">Total</TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground h-9">Status</TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground h-9 text-right">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {recentOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                                      <TableCell className="font-mono text-xs font-medium py-3">#{order.orderNumber}</TableCell>
                                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground py-3">{formatDate(order.createdAt)}</TableCell>
                                      <TableCell className="text-sm font-medium py-3">{formatCurrency(order.total)}</TableCell>
                                      <TableCell className="py-3">
                                        <Badge variant="outline" className={`text-[11px] h-6 px-2 rounded-md font-medium ${orderStatusConfig[order.status]?.color ?? ''}`}>
                                          {orderStatusConfig[order.status]?.label ?? order.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right py-3">
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md" onClick={() => setActiveTab('orders')}>
                                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>

                      {/* Right column */}
                      <div className="space-y-6">
                        {/* Order Status Pie */}
                        <Card className="rounded-xl border-border/50 shadow-sm">
                          <CardHeader className="pb-1">
                            <CardTitle className="text-sm font-semibold tracking-tight">Order Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {orderStatusPieData.length > 0 ? (
                              <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                  <Pie
                                    data={orderStatusPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={72}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                  >
                                    {orderStatusPieData.map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--popover))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                                No data
                              </div>
                            )}
                            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
                              {orderStatusPieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                  <span className="text-muted-foreground">{entry.name}</span>
                                  <span className="font-medium">{entry.value}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Top Products */}
                        <Card className="rounded-xl border-border/50 shadow-sm">
                          <CardHeader className="pb-1">
                            <CardTitle className="text-sm font-semibold tracking-tight">Top Products</CardTitle>
                            <CardDescription className="text-xs">By sales count</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {products.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">No products</p>
                            ) : (
                              <div className="space-y-3">
                                {products.slice(0, 5).map((product, idx) => (
                                  <div key={product.id} className="flex items-center gap-3 group">
                                    <span className="text-xs font-semibold text-muted-foreground/60 w-4">{idx + 1}</span>
                                    <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                                      {product.images?.[0] ? (
                                        <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                                      ) : (
                                        <Package className="h-3.5 w-3.5 text-muted-foreground/30" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate group-hover:text-foreground transition-colors">{product.name}</p>
                                      <p className="text-[11px] text-muted-foreground">{product.soldCount} sold</p>
                                    </div>
                                    <span className="text-xs font-semibold">{formatCurrency(product.price)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════
                    ORDERS TAB
                ════════════════════════════════════════════ */}
                {activeTab === 'orders' && (
                  <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardContent className="p-6">
                      {/* Search & Filter */}
                      <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by order # or product name..."
                            value={orderSearch}
                            onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                            className="pl-9 h-9 rounded-lg text-sm"
                          />
                        </div>
                        <Select value={orderStatusFilter} onValueChange={(v) => { setOrderStatusFilter(v); setOrderPage(1); }}>
                          <SelectTrigger className="w-full sm:w-48 h-9 rounded-lg text-sm">
                            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Filter status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Orders Table */}
                      {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground/20 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground">No orders found</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filter</p>
                        </div>
                      ) : (
                        <>
                          <ScrollArea className="max-h-[520px] admin-content-scroll">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-b">
                                  <TableHead className="w-8 text-xs font-medium text-muted-foreground h-9"></TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9">Order</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden md:table-cell">Items</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9">Total</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden sm:table-cell">Payment</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9">Status</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden lg:table-cell">Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginatedOrders.map((order) => (
                                  <>
                                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                      <TableCell>
                                        <ChevronDown className={`h-4 w-4 text-muted-foreground/60 transition-transform duration-200 ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                                      </TableCell>
                                      <TableCell className="font-mono text-xs font-medium py-3">#{order.orderNumber}</TableCell>
                                      <TableCell className="hidden md:table-cell text-sm py-3 text-muted-foreground">{order.items.length} item{order.items.length > 1 ? 's' : ''}</TableCell>
                                      <TableCell className="text-sm font-medium py-3">{formatCurrency(order.total)}</TableCell>
                                      <TableCell className="hidden sm:table-cell py-3">
                                        <Badge variant="outline" className={`text-[11px] h-6 px-2 rounded-md font-medium ${order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'}`}>
                                          {order.paymentStatus}
                                        </Badge>
                                      </TableCell>
                                      <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Select value={order.status} onValueChange={(v) => handleOrderStatusChange(order.id, v)}>
                                          <SelectTrigger className={`h-7 w-28 text-[11px] rounded-md font-medium ${orderStatusConfig[order.status]?.color}`}>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Object.entries(orderStatusConfig).map(([key, cfg]) => (
                                              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground py-3">{formatDate(order.createdAt)}</TableCell>
                                    </TableRow>
                                    {/* Expandable order items row */}
                                    {expandedOrderId === order.id && (
                                      <TableRow key={`${order.id}-items`}>
                                        <TableCell colSpan={7} className="bg-muted/20 p-4">
                                          <div className="space-y-2">
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Items</p>
                                            {order.items.map((item) => (
                                              <div key={item.id} className="flex items-center gap-3 text-sm">
                                                <div className="h-10 w-10 rounded-lg bg-background border border-border/50 flex items-center justify-center shrink-0 overflow-hidden">
                                                  {item.productImage ? (
                                                    <img src={item.productImage} alt="" className="h-full w-full object-cover" />
                                                  ) : (
                                                    <Package className="h-4 w-4 text-muted-foreground/30" />
                                                  )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-medium truncate">{item.productName}</p>
                                                  <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} {item.variant ? `· ${item.variant}` : ''}</p>
                                                </div>
                                                <span className="text-sm font-semibold">{formatCurrency(item.total)}</span>
                                              </div>
                                            ))}
                                            {order.trackingNumber && (
                                              <p className="text-[11px] text-muted-foreground mt-2">
                                                Tracking: <span className="font-mono">{order.trackingNumber}</span>
                                              </p>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>

                          <Pagination page={orderPage} totalPages={totalOrderPages} onPageChange={setOrderPage} />
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ════════════════════════════════════════════
                    PRODUCTS TAB
                ════════════════════════════════════════════ */}
                {activeTab === 'products' && (
                  <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex gap-1.5">
                          {['all', 'active', 'draft'].map(s => (
                            <Button
                              key={s}
                              variant={productStatusFilter === s ? 'default' : 'outline'}
                              size="sm"
                              className="h-8 text-xs rounded-lg"
                              onClick={() => { setProductStatusFilter(s); setProductPage(1); }}
                            >
                              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Search products..."
                              value={productSearch}
                              onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                              className="pl-9 h-9 rounded-lg text-sm"
                            />
                          </div>
                          <Button size="sm" className="h-9 gap-1.5 shrink-0 rounded-lg text-sm font-medium" onClick={() => handleOpenProductDialog()}>
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </div>

                      {paginatedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Package className="h-12 w-12 text-muted-foreground/20 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground">No products found</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Create your first product to get started</p>
                        </div>
                      ) : (
                        <>
                          <ScrollArea className="max-h-[520px] admin-content-scroll">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-b">
                                  <TableHead className="w-12 text-xs font-medium text-muted-foreground h-9"></TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9">Product</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden md:table-cell">Category</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9">Price</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden sm:table-cell">Stock</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9">Status</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9 text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginatedProducts.map((product) => (
                                  <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                      <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden border border-border/50">
                                        {product.images?.[0] ? (
                                          <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                                        ) : (
                                          <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                                        <p className="text-[11px] text-muted-foreground md:hidden">{product.category?.name}</p>
                                        <div className="flex gap-1 mt-1">
                                          {product.isFeatured && <Badge variant="outline" className="text-[10px] h-5 px-1.5 py-0 rounded-md border-violet-200 text-violet-600 dark:border-violet-800 dark:text-violet-400 bg-transparent">Featured</Badge>}
                                          {product.isTrending && <Badge variant="outline" className="text-[10px] h-5 px-1.5 py-0 rounded-md border-cyan-200 text-cyan-600 dark:border-cyan-800 dark:text-cyan-400 bg-transparent">Trending</Badge>}
                                          {product.isNewArrival && <Badge variant="outline" className="text-[10px] h-5 px-1.5 py-0 rounded-md border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400 bg-transparent">New</Badge>}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                      {product.category?.name ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        <span className="text-sm font-medium">{formatCurrency(product.discountPrice ?? product.price)}</span>
                                        {product.discountPrice && (
                                          <span className="text-[11px] text-muted-foreground/60 line-through ml-1">{formatCurrency(product.price)}</span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                      <div className="space-y-0.5">
                                        <span className="text-sm font-medium">{product.stock}</span>
                                        {product.stock > 0 && product.stock <= 10 && (
                                          <p className="text-[11px] text-amber-600 dark:text-amber-400">Low stock</p>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {product.status === 'active' ? (
                                        product.stock > 10 ? (
                                          <Badge className="text-[11px] h-6 px-2 rounded-md font-medium bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">In Stock</Badge>
                                        ) : product.stock > 0 ? (
                                          <Badge className="text-[11px] h-6 px-2 rounded-md font-medium bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">Low Stock</Badge>
                                        ) : (
                                          <Badge className="text-[11px] h-6 px-2 rounded-md font-medium bg-red-50 text-red-700 border-red-200 hover:bg-red-50 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800">Out of Stock</Badge>
                                        )
                                      ) : (
                                        <Badge variant="outline" className="text-[11px] h-6 px-2 rounded-md font-medium">Inactive</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-0.5">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md" onClick={() => handleOpenProductDialog(product)}>
                                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>

                          <Pagination page={productPage} totalPages={totalProductPages} onPageChange={setProductPage} />
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ════════════════════════════════════════════
                    USERS TAB
                ════════════════════════════════════════════ */}
                {activeTab === 'users' && (
                  <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <p className="text-sm text-muted-foreground">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</p>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                            className="pl-9 h-9 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Users className="h-12 w-12 text-muted-foreground/20 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground">No users found</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Users will appear here when they register</p>
                        </div>
                      ) : (
                        <>
                          <ScrollArea className="max-h-[520px] admin-content-scroll">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-b">
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9">User</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden sm:table-cell">Email</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9">Role</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden md:table-cell">Orders</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9">Status</TableHead>
                                  <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden lg:table-cell">Joined</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginatedUsers.map((u) => (
                                  <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="text-xs bg-muted/50 font-medium">{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{u.name}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{u.email}</TableCell>
                                    <TableCell>
                                      <Select value={u.role} onValueChange={(v) => handleUserRoleChange(u.id, v)}>
                                        <SelectTrigger className="h-7 w-24 text-[11px] rounded-md">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="customer">Customer</SelectItem>
                                          <SelectItem value="seller">Seller</SelectItem>
                                          <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm">
                                      <span className="font-medium">{u._count?.orders ?? 0}</span>
                                    </TableCell>
                                    <TableCell>
                                      <button
                                        onClick={() => handleUserStatusToggle(u.id, u.isActive)}
                                        className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium border transition-all duration-200 ${
                                          u.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                                        }`}
                                      >
                                        <span className={`h-1.5 w-1.5 rounded-full transition-colors ${u.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                                        {u.isActive ? 'Active' : 'Inactive'}
                                      </button>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                                      {u.createdAt ? formatDate(u.createdAt) : '—'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>

                          <Pagination page={userPage} totalPages={totalUserPages} onPageChange={setUserPage} />
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ════════════════════════════════════════════
                    COUPONS TAB
                ════════════════════════════════════════════ */}
                {activeTab === 'coupons' && (
                  <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-muted-foreground">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
                        <Button size="sm" className="h-9 gap-1.5 rounded-lg text-sm font-medium">
                          <Tag className="h-4 w-4" />
                          Create Coupon
                        </Button>
                      </div>

                      {coupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Tag className="h-12 w-12 text-muted-foreground/20 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground">No coupons</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Create your first discount coupon</p>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-96 admin-content-scroll">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="text-xs font-medium text-muted-foreground h-9">Code</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9">Type</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9">Value</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden sm:table-cell">Min Purchase</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden md:table-cell">Usage</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9">Status</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9 text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {coupons.map((coupon) => (
                                <TableRow key={coupon.id} className="hover:bg-muted/30 transition-colors">
                                  <TableCell>
                                    <code className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border border-border/50">{coupon.code}</code>
                                  </TableCell>
                                  <TableCell className="text-sm capitalize text-muted-foreground">{coupon.type}</TableCell>
                                  <TableCell className="text-sm font-medium">
                                    {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                    {coupon.minPurchase ? formatCurrency(coupon.minPurchase) : '—'}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                      <Progress value={coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0} className="h-1.5 w-16" />
                                      <span className="text-[11px] text-muted-foreground">{coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-[11px] h-6 px-2 rounded-md font-medium ${coupon.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800' : 'bg-muted text-muted-foreground border-border'}`}>
                                      {coupon.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md">
                                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ════════════════════════════════════════════
                    REVIEWS TAB
                ════════════════════════════════════════════ */}
                {activeTab === 'reviews' && (
                  <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground mb-6">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>

                      {reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <MessageSquare className="h-12 w-12 text-muted-foreground/20 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground">No reviews yet</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Customer reviews will appear here</p>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-96 admin-content-scroll">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden lg:table-cell">Product</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9">User</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9">Rating</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden md:table-cell">Comment</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9">Status</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9 hidden sm:table-cell">Date</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground h-9 text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {reviews.map((review) => (
                                <TableRow key={review.id} className="hover:bg-muted/30 transition-colors">
                                  <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">#{review.productId.slice(0, 8)}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-7 w-7">
                                        <AvatarFallback className="text-[10px] bg-muted/50 font-medium">{review.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium">{review.user.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5">
                                      <StarRating rating={review.rating} />
                                      <span className="text-[11px] text-muted-foreground">({review.rating})</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-48 truncate">
                                    {review.comment || '—'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-[11px] h-6 px-2 rounded-md font-medium ${review.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'}`}>
                                      {review.isVerified ? (
                                        <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Verified</span>
                                      ) : 'Pending'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                                    {formatDate(review.createdAt)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md">
                                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ════════════════════════════════════════════
                    SETTINGS TAB
                ════════════════════════════════════════════ */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Brand & Logo */}
                    <Card className="rounded-xl border-border/50 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold tracking-tight">Brand & Logo</CardTitle>
                        <CardDescription className="text-xs">Upload your store logo and favicon</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
                          {/* Logo Upload */}
                          <div className="space-y-3">
                            <Label className="text-xs font-medium">Store Logo</Label>
                            {settingsForm.logoUrl ? (
                              <div className="relative group w-full h-24 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-center overflow-hidden">
                                <img src={settingsForm.logoUrl} alt="Logo" className="h-16 w-auto max-w-full object-contain p-2" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <label className="cursor-pointer text-white text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors">
                                    Replace
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                  </label>
                                  <button onClick={() => { setSettingsForm(p => ({ ...p, logoUrl: '' })); }} className="text-white text-xs font-medium bg-red-500/80 hover:bg-red-500 rounded-lg px-3 py-1.5 transition-colors">
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-foreground/30 bg-muted/10 cursor-pointer transition-colors">
                                <Upload className="h-5 w-5 text-muted-foreground mb-1.5" />
                                <span className="text-xs text-muted-foreground">Click to upload logo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                              </label>
                            )}
                          </div>
                          {/* Favicon Upload */}
                          <div className="space-y-3">
                            <Label className="text-xs font-medium">Favicon</Label>
                            {settingsForm.faviconUrl ? (
                              <div className="relative group w-full h-24 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-center overflow-hidden">
                                <img src={settingsForm.faviconUrl} alt="Favicon" className="h-12 w-12 object-contain p-2" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <label className="cursor-pointer text-white text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors">
                                    Replace
                                    <input type="file" accept="image/x-icon,image/png,image/svg+xml" className="hidden" onChange={handleFaviconUpload} />
                                  </label>
                                  <button onClick={() => { setSettingsForm(p => ({ ...p, faviconUrl: '' })); }} className="text-white text-xs font-medium bg-red-500/80 hover:bg-red-500 rounded-lg px-3 py-1.5 transition-colors">
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-foreground/30 bg-muted/10 cursor-pointer transition-colors">
                                <Upload className="h-5 w-5 text-muted-foreground mb-1.5" />
                                <span className="text-xs text-muted-foreground">Click to upload favicon</span>
                                <input type="file" accept="image/x-icon,image/png,image/svg+xml" className="hidden" onChange={handleFaviconUpload} />
                              </label>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* General Settings */}
                    <Card className="rounded-xl border-border/50 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold tracking-tight">General Settings</CardTitle>
                        <CardDescription className="text-xs">Configure your store settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Store Name</Label>
                            <Input
                              value={settingsForm.storeName || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, storeName: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Tagline</Label>
                            <Input
                              value={settingsForm.tagline || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, tagline: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Currency Symbol</Label>
                            <Input
                              value={settingsForm.currency || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, currency: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Currency Code</Label>
                            <Input
                              value={settingsForm.currencyCode || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, currencyCode: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Free Shipping Minimum (৳)</Label>
                            <Input
                              type="number"
                              value={settingsForm.freeShippingMin || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, freeShippingMin: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Default Shipping Rate (৳)</Label>
                            <Input
                              type="number"
                              value={settingsForm.defaultShippingRate || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, defaultShippingRate: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Tax Rate (%)</Label>
                            <Input
                              type="number"
                              value={settingsForm.taxRate || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, taxRate: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="rounded-xl border-border/50 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold tracking-tight">Contact Information</CardTitle>
                        <CardDescription className="text-xs">How customers can reach you</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Contact Email</Label>
                            <Input
                              type="email"
                              value={settingsForm.contactEmail || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Phone</Label>
                            <Input
                              value={settingsForm.phone || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label className="text-xs font-medium">Address</Label>
                            <Input
                              value={settingsForm.address || ''}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t">
                          <Button onClick={handleSaveSettings} disabled={settingsSaving} className="h-9 gap-2 rounded-lg text-sm font-medium">
                            {settingsSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Save Settings
                          </Button>
                          {siteSettings !== settingsForm && (
                            <span className="text-xs text-muted-foreground">Unsaved changes</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="rounded-xl border-red-200/60 dark:border-red-900/40 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold tracking-tight text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                        <CardDescription className="text-xs">Irreversible and destructive actions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">Reset All Data</p>
                            <p className="text-xs text-muted-foreground mt-0.5">This will permanently delete all products, orders, and user data.</p>
                          </div>
                          <Button variant="destructive" size="sm" className="shrink-0 h-8 rounded-lg text-xs font-medium">Reset Data</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ─── Product Create/Edit Dialog ─── */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight">{editingProductId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingProductId ? 'Update product details below.' : 'Fill in the details to create a new product.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Product Name *</Label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({
                  ...prev,
                  name: e.target.value,
                  slug: !editingProductId ? generateSlug(e.target.value) : prev.slug,
                }))}
                placeholder="Product name"
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Slug *</Label>
              <Input
                value={productForm.slug}
                onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="product-url-slug"
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Category *</Label>
              <Select value={productForm.categoryId} onValueChange={(v) => setProductForm(prev => ({ ...prev, categoryId: v }))}>
                <SelectTrigger className="h-9 rounded-lg text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Brand</Label>
              <Select value={productForm.brandId} onValueChange={(v) => setProductForm(prev => ({ ...prev, brandId: v }))}>
                <SelectTrigger className="h-9 rounded-lg text-sm">
                  <SelectValue placeholder="Select brand (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Price *</Label>
              <Input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Discount Price</Label>
              <Input
                type="number"
                value={productForm.discountPrice}
                onChange={(e) => setProductForm(prev => ({ ...prev, discountPrice: e.target.value }))}
                placeholder="Leave empty for no discount"
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Stock</Label>
              <Input
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={productForm.status} onValueChange={(v) => setProductForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="h-9 rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-medium">Short Description</Label>
              <Input
                value={productForm.shortDesc}
                onChange={(e) => setProductForm(prev => ({ ...prev, shortDesc: e.target.value }))}
                placeholder="Brief product description"
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Full product description (supports plain text)"
                rows={3}
                className="text-sm rounded-lg resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium mb-2.5 block">Product Flags</Label>
              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={productForm.isFeatured}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isFeatured: !!checked }))}
                  />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={productForm.isTrending}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isTrending: !!checked }))}
                  />
                  <span className="text-sm">Trending</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={productForm.isBestSeller}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isBestSeller: !!checked }))}
                  />
                  <span className="text-sm">Best Seller</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={productForm.isNewArrival}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isNewArrival: !!checked }))}
                  />
                  <span className="text-sm">New Arrival</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)} className="h-9 rounded-lg text-sm">Cancel</Button>
            <Button
              onClick={handleSaveProduct}
              disabled={productSaving || !productForm.name || !productForm.slug || !productForm.categoryId || !productForm.price}
              className="h-9 gap-2 rounded-lg text-sm font-medium"
            >
              {productSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {editingProductId ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}