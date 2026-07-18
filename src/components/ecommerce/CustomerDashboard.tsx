'use client';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/use-ui';
import { useAuthStore } from '@/store/use-auth';
import { useWishlistStore } from '@/store/use-wishlist';
import { useCartStore } from '@/store/use-cart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  User, Package, Heart, MapPin, Settings, Bell, LogOut, ChevronRight,
  Eye, Camera, Plus, Trash2, Star, Clock, CheckCircle2,
  XCircle, Truck, ShoppingBag, Menu, Loader2
} from 'lucide-react';
import type { Order, Address, Notification as AppNotification } from '@/types';

// ─── Status helpers ───
const orderStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-muted text-foreground border border-border rounded-full px-3 py-1 text-xs', icon: <Clock className="h-3.5 w-3.5" /> },
  confirmed: { label: 'Confirmed', color: 'bg-muted text-foreground border border-border rounded-full px-3 py-1 text-xs', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  processing: { label: 'Processing', color: 'bg-muted text-foreground border border-border rounded-full px-3 py-1 text-xs', icon: <Package className="h-3.5 w-3.5" /> },
  shipped: { label: 'Shipped', color: 'bg-muted text-foreground border border-border rounded-full px-3 py-1 text-xs', icon: <Truck className="h-3.5 w-3.5" /> },
  delivered: { label: 'Delivered', color: 'bg-muted text-foreground border border-border rounded-full px-3 py-1 text-xs', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-3 py-1 text-xs', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const notificationIcons: Record<string, React.ReactNode> = {
  order: <Package className="h-5 w-5 text-muted-foreground" />,
  promo: <Star className="h-5 w-5 text-muted-foreground" />,
  system: <Bell className="h-5 w-5 text-muted-foreground" />,
  shipping: <Truck className="h-5 w-5 text-muted-foreground" />,
};

type Tab = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'notifications' | 'settings';

const sidebarItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'orders', label: 'Orders', icon: <Package className="h-4 w-4" /> },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart className="h-4 w-4" /> },
  { id: 'addresses', label: 'Addresses', icon: <MapPin className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

// ─── Custom scrollbar styles ───
const scrollbarStyles = `
  .dashboard-scroll::-webkit-scrollbar { width: 6px; }
  .dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
  .dashboard-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
  .dashboard-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
`;

export default function CustomerDashboard() {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { navigate, orders, setOrders, addresses, setAddresses, notifications, setNotifications, viewOrder } = useUIStore();
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const addCartItem = useCartStore((s) => s.addItem);

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Address dialog
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState({
    label: '', fullName: '', phone: '', address: '', city: '', state: '', zipCode: '', country: 'Bangladesh',
  });

  // Settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Selected order for detail view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, addressesRes, notifsRes] = await Promise.allSettled([
          fetch(`/api/orders?userId=${user.id}`).then(r => r.json()),
          fetch(`/api/addresses?userId=${user.id}`).then(r => r.json()),
          fetch(`/api/notifications?userId=${user.id}`).then(r => r.json()),
        ]);

        if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
          setOrders(ordersRes.value.orders);
        }
        if (addressesRes.status === 'fulfilled' && addressesRes.value?.addresses) {
          setAddresses(addressesRes.value.addresses);
        }
        if (notifsRes.status === 'fulfilled' && notifsRes.value?.notifications) {
          setNotifications(notifsRes.value.notifications);
        }
      } catch {
        // use mock data from store if API fails
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user, setOrders, setAddresses, setNotifications]);

  // Initialize edit form
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone ?? '');
    }
  }, [user]);

  const handleSaveProfile = () => {
    updateUser({ name: editName, email: editEmail, phone: editPhone });
    setIsEditing(false);
  };

  const handleMarkNotificationRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      const updated = addresses.map(a =>
        a.id === editingAddress.id
          ? { ...a, ...addrForm }
          : a
      );
      setAddresses(updated);
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        userId: user!.id,
        isDefault: addresses.length === 0,
        ...addrForm,
      };
      setAddresses([...addresses, newAddr]);
    }
    setAddressDialogOpen(false);
    setEditingAddress(null);
    setAddrForm({ label: '', fullName: '', phone: '', address: '', city: '', state: '', zipCode: '', country: 'Bangladesh' });
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddrForm({
      label: addr.label ?? '',
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state ?? '',
      zipCode: addr.zipCode ?? '',
      country: addr.country,
    });
    setAddressDialogOpen(true);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  // ─── Not authenticated view ───
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-4">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-medium tracking-tight">Please login to view your dashboard</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          You need to be signed in to access your orders, wishlist, and account settings.
        </p>
        <button
          onClick={() => navigate('login')}
          className="bg-foreground text-background hover:bg-foreground/90 h-11 px-8 rounded-full text-sm font-medium transition-all duration-300 inline-flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign In
        </button>
      </div>
    );
  }

  // ─── Sidebar content (shared between desktop & mobile) ───
  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 p-2">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            setSelectedOrder(null);
            onNavigate?.();
          }}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 text-left w-full ${
            activeTab === item.id && !selectedOrder
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
      <Separator className="my-2" />
      <button
        onClick={() => { logout(); onNavigate?.(); }}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-300 text-left w-full"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </nav>
  );

  // ─── Format helpers ───
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="w-full">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('home')} className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Desktop Sidebar ─── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="rounded-xl border border-border/50 sticky top-6">
              <div className="p-3">
                <div className="flex items-center gap-3 p-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-foreground font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <ScrollArea>
                  <SidebarNav />
                </ScrollArea>
              </div>
            </div>
          </aside>

          {/* ─── Mobile Sidebar (Sheet) ─── */}
          <div className="lg:hidden">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <button className="border border-border hover:bg-accent h-9 px-3 rounded-lg text-sm inline-flex items-center gap-2 transition-all duration-300 mb-4">
                  <Menu className="h-4 w-4" />
                  Menu
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4 pb-2">
                  <SheetTitle className="text-left">My Account</SheetTitle>
                </SheetHeader>
                <div className="flex items-center gap-3 px-4 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-foreground font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <SidebarNav onNavigate={() => setIsMobileNavOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          {/* ─── Main Content ─── */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
              </div>
            ) : selectedOrder ? (
              /* ─── Order Detail View ─── */
              <div className="rounded-xl border border-border/50">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-300">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      Back
                    </button>
                  </div>
                  <h2 className="text-lg font-medium tracking-tight">Order #{selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="px-6 pb-6 space-y-6">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <span className="text-xs gap-1 border border-border px-3 py-1 rounded-full inline-flex items-center font-medium bg-muted text-foreground">
                      {orderStatusConfig[selectedOrder.status]?.icon}
                      <span className="ml-1">{orderStatusConfig[selectedOrder.status]?.label ?? selectedOrder.status}</span>
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h3 className="font-medium tracking-tight text-sm">Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                          {item.productImage && (
                            <img src={item.productImage} alt={item.productName} className="h-14 w-14 rounded-lg object-cover bg-muted" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}{item.variant ? ` · ${item.variant}` : ''}</p>
                          </div>
                          <p className="font-semibold text-sm">{formatCurrency(item.total)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Discount</span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{selectedOrder.shippingCharge === 0 ? 'Free' : formatCurrency(selectedOrder.shippingCharge)}</span>
                    </div>
                    {selectedOrder.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>

                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Status</p>
                      <span className="text-xs border border-border px-3 py-1 rounded-full font-medium bg-muted text-foreground">
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Tracking Number</p>
                        <p className="font-medium font-mono">{selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ─── Tabbed Content ─── */
              <>
                {/* ── Profile Tab ── */}
                {activeTab === 'profile' && (
                  <div className="rounded-xl border border-border/50">
                    <div className="p-6">
                      <h2 className="font-medium tracking-tight">My Profile</h2>
                      <p className="text-sm text-muted-foreground">Manage your personal information</p>
                    </div>
                    <div className="px-6 pb-6 space-y-6">
                      {/* Avatar Section */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                          <Avatar className="h-24 w-24">
                            <AvatarFallback className="bg-muted text-foreground text-3xl font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <button className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                          </button>
                        </div>
                      </div>

                      <Separator />

                      {isEditing ? (
                        <div className="space-y-4 max-w-md mx-auto">
                          <div className="space-y-1.5">
                            <Label htmlFor="editName">Full Name</Label>
                            <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} className="border-border" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="editEmail">Email Address</Label>
                            <Input id="editEmail" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="border-border" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="editPhone">Phone Number</Label>
                            <Input id="editPhone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="border-border" />
                          </div>
                          <div className="flex gap-3">
                            <button onClick={handleSaveProfile} className="flex-1 bg-foreground text-background hover:bg-foreground/90 h-11 rounded-full text-sm font-medium transition-all duration-300">Save Changes</button>
                            <button onClick={() => setIsEditing(false)} className="border border-border hover:bg-accent h-11 px-4 rounded-lg text-sm font-medium transition-all duration-300">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 max-w-md mx-auto">
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">Full Name</span>
                            <span className="font-medium text-sm">{user.name}</span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">Email Address</span>
                            <span className="font-medium text-sm">{user.email}</span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">Phone Number</span>
                            <span className="font-medium text-sm">{user.phone || 'Not set'}</span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">Role</span>
                            <span className="bg-muted text-foreground border border-border rounded-full px-3 py-1 text-xs font-medium capitalize">{user.role}</span>
                          </div>
                          <button onClick={() => setIsEditing(true)} className="w-full border border-border hover:bg-accent h-11 rounded-lg text-sm font-medium transition-all duration-300 mt-2">
                            Edit Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Orders Tab ── */}
                {activeTab === 'orders' && (
                  <div className="rounded-xl border border-border/50">
                    <div className="p-6">
                      <h2 className="font-medium tracking-tight flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        My Orders
                      </h2>
                      <p className="text-sm text-muted-foreground">View and track your orders</p>
                    </div>
                    <div className="px-6 pb-6">
                      {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-lg mb-1">No orders yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">Your order history will appear here</p>
                          <button onClick={() => navigate('shop')} className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300">Start Shopping</button>
                        </div>
                      ) : (
                        <>
                          {/* Desktop Table */}
                          <div className="hidden md:block">
                            <ScrollArea className="max-h-96">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {orders.map((order) => {
                                    const statusCfg = orderStatusConfig[order.status];
                                    return (
                                      <TableRow key={order.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setSelectedOrder(order)}>
                                        <TableCell className="font-medium font-mono text-sm">#{order.orderNumber}</TableCell>
                                        <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
                                        <TableCell className="text-sm">{order.items.length} item{order.items.length > 1 ? 's' : ''}</TableCell>
                                        <TableCell className="font-semibold text-sm">{formatCurrency(order.total)}</TableCell>
                                        <TableCell>
                                          <span className={`gap-1 border inline-flex items-center font-medium ${statusCfg?.color ?? ''}`}>
                                            {statusCfg?.icon}
                                            <span className="ml-1">{statusCfg?.label ?? order.status}</span>
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="text-muted-foreground hover:text-foreground transition-all duration-300">
                                            <Eye className="h-4 w-4" />
                                          </button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                          </div>

                          {/* Mobile Cards */}
                          <div className="md:hidden space-y-3">
                            {orders.map((order) => {
                              const statusCfg = orderStatusConfig[order.status];
                              return (
                                <div
                                  key={order.id}
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 cursor-pointer transition-all duration-300"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-sm font-medium">#{order.orderNumber}</span>
                                    <span className={`gap-1 border inline-flex items-center font-medium ${statusCfg?.color ?? ''}`}>
                                      {statusCfg?.icon}
                                      <span className="ml-1">{statusCfg?.label ?? order.status}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{formatDate(order.createdAt)} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                                    <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Wishlist Tab ── */}
                {activeTab === 'wishlist' && (
                  <div className="rounded-xl border border-border/50">
                    <div className="p-6">
                      <h2 className="font-medium tracking-tight flex items-center gap-2">
                        <Heart className="h-5 w-5 text-muted-foreground" />
                        My Wishlist
                      </h2>
                      <p className="text-sm text-muted-foreground">Products you&apos;ve saved for later</p>
                    </div>
                    <div className="px-6 pb-6">
                      {wishlistItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Heart className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-lg mb-1">Wishlist is empty</h3>
                          <p className="text-sm text-muted-foreground mb-4">Save items you love for later</p>
                          <button onClick={() => navigate('shop')} className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300">Browse Products</button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {wishlistItems.map((product) => (
                            <div key={product.id} className="group rounded-xl border border-border/50 bg-card overflow-hidden">
                              <div
                                className="aspect-square bg-muted relative cursor-pointer"
                                onClick={() => useUIStore.getState().viewProduct(product.id)}
                              >
                                {product.images?.[0] ? (
                                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                                  </div>
                                )}
                                {product.discountPrice && (
                                  <span className="absolute top-2 left-2 bg-foreground text-background text-xs px-1.5 py-0.5 rounded-full font-medium">
                                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                  </span>
                                )}
                              </div>
                              <div className="p-3 space-y-2">
                                <h4 className="font-medium text-sm line-clamp-1 cursor-pointer hover:text-foreground/70 transition-colors" onClick={() => useUIStore.getState().viewProduct(product.id)}>
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-foreground">{formatCurrency(product.discountPrice ?? product.price)}</span>
                                  {product.discountPrice && (
                                    <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                                    />
                                  ))}
                                  <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
                                </div>
                                <div className="flex gap-2">
                                  <button className="flex-1 h-9 bg-foreground text-background hover:bg-foreground/90 rounded-full text-xs font-medium transition-all duration-300 inline-flex items-center justify-center gap-1" onClick={() => addCartItem(product)}>
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    Add to Cart
                                  </button>
                                  <button className="h-9 w-9 border border-border hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-all duration-300 inline-flex items-center justify-center" onClick={() => removeWishlistItem(product.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Addresses Tab ── */}
                {activeTab === 'addresses' && (
                  <div className="rounded-xl border border-border/50">
                    <div className="p-6 flex flex-row items-center justify-between">
                      <div>
                        <h2 className="font-medium tracking-tight flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          My Addresses
                        </h2>
                        <p className="text-sm text-muted-foreground">Manage your shipping addresses</p>
                      </div>
                      <Dialog open={addressDialogOpen} onOpenChange={(open) => {
                        setAddressDialogOpen(open);
                        if (!open) { setEditingAddress(null); setAddrForm({ label: '', fullName: '', phone: '', address: '', city: '', state: '', zipCode: '', country: 'Bangladesh' }); }
                      }}>
                        <DialogTrigger asChild>
                          <button className="bg-foreground text-background hover:bg-foreground/90 h-11 px-4 rounded-full text-sm font-medium transition-all duration-300 inline-flex items-center gap-1">
                            <Plus className="h-4 w-4" />
                            Add Address
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <Label>Label</Label>
                              <Input placeholder="e.g. Home, Office" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} className="border-border" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label>Full Name *</Label>
                                <Input value={addrForm.fullName} onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} className="border-border" />
                              </div>
                              <div className="space-y-1.5">
                                <Label>Phone *</Label>
                                <Input value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} className="border-border" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label>Address *</Label>
                              <Input value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} className="border-border" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label>City *</Label>
                                <Input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} className="border-border" />
                              </div>
                              <div className="space-y-1.5">
                                <Label>State</Label>
                                <Input value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} className="border-border" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label>Zip Code</Label>
                                <Input value={addrForm.zipCode} onChange={(e) => setAddrForm({ ...addrForm, zipCode: e.target.value })} className="border-border" />
                              </div>
                              <div className="space-y-1.5">
                                <Label>Country *</Label>
                                <Input value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} className="border-border" />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild><button className="border border-border hover:bg-accent h-11 px-4 rounded-lg text-sm font-medium transition-all duration-300">Cancel</button></DialogClose>
                            <button onClick={handleSaveAddress} className="bg-foreground text-background hover:bg-foreground/90 h-11 px-4 rounded-full text-sm font-medium transition-all duration-300">Save Address</button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="px-6 pb-6">
                      {addresses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <MapPin className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-lg mb-1">No addresses saved</h3>
                          <p className="text-sm text-muted-foreground">Add a shipping address for faster checkout</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {addresses.map((addr) => (
                            <div
                              key={addr.id}
                              className={`relative p-4 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-sm ${
                                addr.isDefault ? 'border-foreground bg-foreground/5' : ''
                              }`}
                            >
                              {addr.isDefault && (
                                <span className="absolute top-3 right-3 bg-foreground text-background text-xs px-2.5 py-0.5 rounded-full font-medium">Default</span>
                              )}
                              {addr.label && (
                                <p className="font-medium text-sm mb-1">{addr.label}</p>
                              )}
                              <p className="font-medium text-sm">{addr.fullName}</p>
                              <p className="text-sm text-muted-foreground">{addr.phone}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {addr.address}
                                {addr.city && `, ${addr.city}`}
                                {addr.state && `, ${addr.state}`}
                                {addr.zipCode && ` - ${addr.zipCode}`}
                              </p>
                              <p className="text-sm text-muted-foreground">{addr.country}</p>
                              <div className="flex items-center gap-2 mt-3">
                                <button onClick={() => handleEditAddress(addr)} className="border border-border hover:bg-accent h-8 px-3 rounded-lg text-xs font-medium transition-all duration-300">
                                  Edit
                                </button>
                                {!addr.isDefault && (
                                  <button onClick={() => handleSetDefaultAddress(addr.id)} className="border border-border hover:bg-accent h-8 px-3 rounded-lg text-xs font-medium transition-all duration-300">
                                    Set Default
                                  </button>
                                )}
                                <button onClick={() => handleDeleteAddress(addr.id)} className="h-8 px-2 rounded-lg text-xs text-muted-foreground hover:text-destructive transition-all duration-300 ml-auto inline-flex items-center">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Notifications Tab ── */}
                {activeTab === 'notifications' && (
                  <div className="rounded-xl border border-border/50">
                    <div className="p-6">
                      <h2 className="font-medium tracking-tight flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                      </h2>
                      <p className="text-sm text-muted-foreground">Stay updated on your orders and promotions</p>
                    </div>
                    <div className="px-6 pb-6">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Bell className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-lg mb-1">No notifications</h3>
                          <p className="text-sm text-muted-foreground">We&apos;ll notify you about order updates and deals</p>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-96">
                          <div className="space-y-2">
                            {notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleMarkNotificationRead(notif.id)}
                                className={`flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer transition-all duration-300 hover:bg-muted/50 ${
                                  !notif.isRead ? 'bg-foreground/5 border-foreground/20' : ''
                                }`}
                              >
                                <div className="mt-0.5">
                                  {notificationIcons[notif.type] ?? notificationIcons.system}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className={`text-sm ${!notif.isRead ? 'font-medium' : 'font-medium'}`}>{notif.title}</p>
                                    {!notif.isRead && (
                                      <span className="h-2 w-2 rounded-full bg-foreground shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.createdAt)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Settings Tab ── */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="rounded-xl border border-border/50">
                      <div className="p-6">
                        <h2 className="font-medium tracking-tight">Change Password</h2>
                        <p className="text-sm text-muted-foreground">Update your account password</p>
                      </div>
                      <div className="px-6 pb-6 space-y-4 max-w-md">
                        <div className="space-y-1.5">
                          <Label>Current Password</Label>
                          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="border-border" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>New Password</Label>
                          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="border-border" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Confirm New Password</Label>
                          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="border-border" />
                        </div>
                        <button
                          onClick={() => {
                            if (newPassword && newPassword === confirmPassword) {
                              setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                            }
                          }}
                          disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                          className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Theme Preference */}
                    <div className="rounded-xl border border-border/50">
                      <div className="p-6">
                        <h2 className="font-medium tracking-tight">Appearance</h2>
                        <p className="text-sm text-muted-foreground">Customize how NextShop looks for you</p>
                      </div>
                      <div className="px-6 pb-6">
                        <p className="text-sm text-muted-foreground">
                          Theme preference can be changed using the theme toggle in the header.
                        </p>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="rounded-xl border border-destructive/30">
                      <div className="p-6">
                        <h2 className="font-medium tracking-tight text-destructive">Delete Account</h2>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <div className="px-6 pb-6 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          This action cannot be undone. All your data including orders, addresses, and preferences will be permanently removed.
                        </p>
                        <div className="space-y-1.5 max-w-md">
                          <Label>Type &quot;DELETE&quot; to confirm</Label>
                          <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder='Type "DELETE" here'
                            className="border-border"
                          />
                        </div>
                        <button
                          disabled={deleteConfirmText !== 'DELETE'}
                          onClick={() => {
                            logout();
                            setDeleteConfirmText('');
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50"
                        >
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}