'use client';
import { useUIStore } from '@/store/use-ui';
import { useCartStore } from '@/store/use-cart';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const formatPrice = (price: number) => '৳' + price.toLocaleString();

export default function CartDrawer() {
  const { isCartDrawerOpen, setCartDrawerOpen, navigate } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotal, getTotalSavings, getItemCount, appliedCoupon, couponDiscount, applyCoupon, removeCoupon } = useCartStore();
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

  const handleClose = () => setCartDrawerOpen(false);

  return (
    <Sheet open={isCartDrawerOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 className="text-base font-medium tracking-tight">
            Cart <span className="text-muted-foreground font-light">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-all duration-300 p-1.5 rounded-lg hover:bg-muted/30"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Separator />

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground font-light mb-6">
              Looks like you haven&apos;t added any items yet.
            </p>
            <button
              onClick={() => { handleClose(); navigate('shop'); }}
              className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 h-0">
              <div className="px-6 py-4 space-y-4">
                {items.map((item) => {
                  const price = item.product.discountPrice ?? item.product.price;
                  const lineTotal = price * item.quantity;
                  const image = item.product.images?.[0]?.url || '/placeholder.png';

                  return (
                    <div key={item.product.id + (item.variantId || '')} className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                        <img
                          src={image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate leading-tight">
                          {item.product.name}
                        </h4>
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground mt-0.5 font-light">{item.variantName}</p>
                        )}
                        <p className="text-sm font-medium text-foreground mt-1">{formatPrice(price)}</p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted/30"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted/30"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{formatPrice(lineTotal)}</span>
                            <button
                              onClick={() => { removeItem(item.product.id); toast.success('Item removed'); }}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all duration-300 rounded-lg hover:bg-muted/30"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Separator />

            {/* Coupon Section */}
            <div className="px-6 py-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{appliedCoupon.code}</span>
                    <span className="text-xs text-muted-foreground font-light">-{formatPrice(couponDiscount)}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-muted-foreground hover:text-destructive transition-all duration-300 p-1 rounded-lg hover:bg-muted/30"
                    aria-label="Remove coupon"
                  >
                    <X className="h-3.5 w-3.5" />
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
                    className="h-11 px-3 border border-border hover:bg-accent rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-40"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="px-6 py-4 space-y-2.5 text-sm font-light">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Savings</span>
                  <span>-{formatPrice(savings)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-medium">
                <span>Total</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>
            </div>

            <SheetFooter className="px-6 pb-6 pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => { handleClose(); navigate('checkout'); }}
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 rounded-full text-sm font-medium transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => { handleClose(); navigate('cart'); }}
                className="w-full border border-border/50 hover:bg-accent hover:border-border h-11 rounded-full text-sm font-medium transition-all duration-300"
              >
                View Cart
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}