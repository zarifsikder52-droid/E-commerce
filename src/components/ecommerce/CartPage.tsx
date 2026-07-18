'use client';
import { useCartStore } from '@/store/use-cart';
import { useWishlistStore } from '@/store/use-wishlist';
import { useUIStore } from '@/store/use-ui';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, ArrowLeft, Gift, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const formatPrice = (price: number) => '৳' + price.toLocaleString();

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getTotalSavings, getItemCount, appliedCoupon, couponDiscount, applyCoupon, removeCoupon } = useCartStore();
  const { addToWishlist } = useWishlistStore();
  const { navigate } = useUIStore();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const savings = getTotalSavings();
  const shipping = subtotal >= 2000 ? 0 : 60;
  const total = subtotal - couponDiscount + shipping;
  const itemCount = getItemCount();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponInput.trim())}&subtotal=${subtotal}`);
      if (res.ok) {
        const data = await res.json();
        applyCoupon(data.coupon, subtotal);
        toast.success('Coupon applied successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Invalid coupon code');
      }
    } catch {
      toast.error('Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    toast.success('Coupon removed');
  };

  const handleSaveForLater = (item: typeof items[0]) => {
    addToWishlist(item.product);
    removeItem(item.product.id);
    toast.success('Moved to wishlist');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mb-5">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground font-light text-sm mb-8 max-w-md">
          Discover our amazing products and add them to your cart.
        </p>
        <button
          onClick={() => navigate('shop')}
          className="bg-foreground text-background hover:bg-foreground/90 h-11 px-8 rounded-full text-sm font-medium transition-all duration-300"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('home')}
              className="cursor-pointer text-muted-foreground hover:text-foreground transition-all duration-300"
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-foreground font-medium">Shopping Cart</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
          Shopping Cart
          <span className="text-sm font-light text-muted-foreground ml-2">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        </h1>
        <button
          onClick={() => navigate('shop')}
          className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items Column */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.product.discountPrice ?? item.product.price;
            const originalPrice = item.product.price;
            const lineTotal = price * item.quantity;
            const image = item.product.images?.[0]?.url || '/placeholder.png';

            return (
              <div key={item.product.id + (item.variantId || '')} className="rounded-xl border border-border/50 hover:border-border/80 transition-all duration-300">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-28 h-28 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                      <img
                        src={image}
                        alt={item.product.name}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                        onClick={() => useUIStore.getState().viewProduct(item.product.id)}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className="text-sm font-medium text-foreground hover:text-foreground/70 transition-all duration-300 cursor-pointer line-clamp-2"
                            onClick={() => useUIStore.getState().viewProduct(item.product.id)}
                          >
                            {item.product.name}
                          </h3>
                          {item.variantName && (
                            <p className="text-sm text-muted-foreground mt-0.5 font-light">{item.variantName}</p>
                          )}
                          {item.product.sku && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5">SKU: {item.product.sku}</p>
                          )}
                        </div>
                        <button
                          onClick={() => { removeItem(item.product.id); toast.success('Item removed'); }}
                          className="text-muted-foreground hover:text-destructive transition-all duration-300 p-1.5 flex-shrink-0 rounded-lg hover:bg-muted/30"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                        <div className="flex items-center gap-4">
                          {/* Price */}
                          <div className="space-y-0.5">
                            <p className="text-base font-medium text-foreground">{formatPrice(price)}</p>
                            {item.product.discountPrice && item.product.discountPrice < item.product.price && (
                              <p className="text-sm text-muted-foreground/50 line-through font-light">{formatPrice(originalPrice)}</p>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium border-x border-border/30">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-base font-medium text-foreground">{formatPrice(lineTotal)}</span>
                          <button
                            onClick={() => handleSaveForLater(item)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-all duration-300 inline-flex items-center gap-1.5"
                          >
                            <Gift className="h-3.5 w-3.5" />
                            Save for Later
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border/50 p-6 sticky top-4">
            <h2 className="text-base font-medium tracking-tight mb-5">Order Summary</h2>
            <div className="space-y-5">
              {/* Coupon Code */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{appliedCoupon.code}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-muted-foreground hover:text-destructive font-medium transition-all duration-300"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="w-full h-11 pl-9 pr-3 text-sm rounded-lg border border-border/50 bg-transparent outline-none focus:ring-1 focus:ring-foreground/10"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="h-11 px-4 border border-border hover:bg-accent rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-40"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              )}

              <Separator />

              {/* Summary Breakdown */}
              <div className="space-y-3 text-sm font-light">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Product Savings</span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" />
                    Shipping
                  </span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground/60">Free shipping on orders above {formatPrice(2000)}</p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-medium">
                <span>Grand Total</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>

              <button
                onClick={() => navigate('checkout')}
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 rounded-full text-sm font-medium transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigate('shop')}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center gap-2 font-light"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}