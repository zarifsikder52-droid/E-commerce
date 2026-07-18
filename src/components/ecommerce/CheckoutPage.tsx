'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/use-cart';
import { useUIStore } from '@/store/use-ui';
import { useAuthStore } from '@/store/use-auth';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, ArrowRight, Check, CreditCard, Truck, Building, Wallet, Smartphone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Address } from '@/types';

const formatPrice = (price: number) => '৳' + price.toLocaleString();

const STEPS = [
  { id: 1, label: 'Shipping', icon: Truck },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: Check },
] as const;

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive your order', icon: Wallet },
  { id: 'bkash', label: 'bKash', description: 'Mobile banking payment via bKash', icon: Smartphone },
  { id: 'nagad', label: 'Nagad', description: 'Mobile financial service via Nagad', icon: Smartphone },
  { id: 'bank_transfer', label: 'Bank Transfer', description: 'Direct bank transfer to our account', icon: Building },
  { id: 'card', label: 'Card Payment', description: 'Credit or debit card payment', icon: CreditCard },
] as const;

interface ShippingForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const defaultShippingForm: ShippingForm = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Bangladesh',
};

const inputClass = (error?: string) =>
  `mt-1.5 w-full h-11 px-4 rounded-lg border bg-transparent outline-none focus:ring-1 focus:ring-foreground/10 text-sm ${error ? 'border-red-500' : 'border-border/50'}`;

export default function CheckoutPage() {
  const { items, getSubtotal, getTotalSavings, appliedCoupon, couponDiscount, clearCart } = useCartStore();
  const { navigate, addresses } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState(1);
  const [shippingForm, setShippingForm] = useState<ShippingForm>(defaultShippingForm);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = getSubtotal();
  const savings = getTotalSavings();
  const shipping = subtotal >= 2000 ? 0 : 60;
  const total = subtotal - couponDiscount + shipping;

  const validateShipping = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingForm, string>> = {};
    if (!shippingForm.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingForm.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^(?:\+880|01)\d{9,10}$/.test(shippingForm.phone.trim())) newErrors.phone = 'Enter a valid BD phone number';
    if (!shippingForm.address.trim()) newErrors.address = 'Address is required';
    if (!shippingForm.city.trim()) newErrors.city = 'City is required';
    if (!shippingForm.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateShipping()) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setShippingForm({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state || '',
      zipCode: addr.zipCode || '',
      country: addr.country,
    });
    setErrors({});
  };

  const handlePlaceOrder = async () => {
    if (!agreeTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }
    setPlacingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            variantId: item.variantId,
            variantName: item.variantName,
            price: item.product.discountPrice ?? item.product.price,
            name: item.product.name,
            image: item.product.images?.[0]?.url,
          })),
          shippingAddress: shippingForm,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          subtotal,
          discount: couponDiscount,
          shippingCharge: shipping,
          total,
        }),
      });
      if (res.ok) {
        setOrderSuccess(true);
        clearCart();
        toast.success('Order placed successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to place order');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const selectedPayment = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-[#5B7553]/10 flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-[#5B7553]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-3">Order Placed Successfully!</h2>
        <p className="text-muted-foreground font-light text-sm mb-2">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        <p className="text-sm text-muted-foreground font-light mb-8">
          You can track your order status from your orders page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('orders')}
            className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate('home')}
            className="border border-border hover:bg-accent h-11 px-6 rounded-full text-sm font-medium transition-all duration-300"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-medium text-foreground mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground font-light text-sm mb-6">Add some items to your cart before checking out.</p>
        <button onClick={() => navigate('shop')} className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300">
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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
            <BreadcrumbLink
              onClick={() => navigate('cart')}
              className="cursor-pointer text-muted-foreground hover:text-foreground transition-all duration-300"
            >
              Cart
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-foreground font-medium">Checkout</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-foreground text-background'
                      : isActive
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4.5 w-4.5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-px mx-3 mb-5 sm:mb-0 transition-colors duration-300 ${
                    step > s.id ? 'bg-foreground' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="rounded-xl border border-border/50 p-6">
              <h2 className="text-base font-medium tracking-tight flex items-center gap-2.5 mb-6">
                <Truck className="h-5 w-5 text-muted-foreground" />
                Shipping Address
              </h2>
              <div className="space-y-6">
                {/* Saved Addresses */}
                {isAuthenticated && addresses.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">Saved Addresses</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectAddress(addr)}
                          className={`text-left p-4 rounded-xl border-2 transition-all duration-300 hover:border-foreground/30 ${
                            selectedAddressId === addr.id
                              ? 'border-foreground bg-foreground/[0.03]'
                              : 'border-border/50'
                          }`}
                        >
                          {addr.isDefault && (
                            <span className="bg-muted text-foreground text-[10px] px-2 py-0.5 rounded-full inline-block mb-2 font-medium">
                              Default
                            </span>
                          )}
                          <p className="font-medium text-sm text-foreground">{addr.fullName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-light">{addr.address}, {addr.city}</p>
                          <p className="text-xs text-muted-foreground">{addr.phone}</p>
                        </button>
                      ))}
                    </div>
                    <Separator className="my-5" />
                  </div>
                )}

                {/* Shipping Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="text-sm font-medium">Full Name *</label>
                    <input
                      id="fullName"
                      value={shippingForm.fullName}
                      onChange={(e) => { setShippingForm({ ...shippingForm, fullName: e.target.value }); setErrors({ ...errors, fullName: undefined }); }}
                      placeholder="John Doe"
                      className={inputClass(errors.fullName)}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone Number *</label>
                    <input
                      id="phone"
                      value={shippingForm.phone}
                      onChange={(e) => { setShippingForm({ ...shippingForm, phone: e.target.value }); setErrors({ ...errors, phone: undefined }); }}
                      placeholder="01XXXXXXXXX"
                      className={inputClass(errors.phone)}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="text-sm font-medium">Address *</label>
                    <input
                      id="address"
                      value={shippingForm.address}
                      onChange={(e) => { setShippingForm({ ...shippingForm, address: e.target.value }); setErrors({ ...errors, address: undefined }); }}
                      placeholder="House No, Road, Area"
                      className={inputClass(errors.address)}
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label htmlFor="city" className="text-sm font-medium">City *</label>
                    <input
                      id="city"
                      value={shippingForm.city}
                      onChange={(e) => { setShippingForm({ ...shippingForm, city: e.target.value }); setErrors({ ...errors, city: undefined }); }}
                      placeholder="Dhaka"
                      className={inputClass(errors.city)}
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="state" className="text-sm font-medium">State / Division</label>
                    <input
                      id="state"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      placeholder="Dhaka Division"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="text-sm font-medium">Zip Code *</label>
                    <input
                      id="zipCode"
                      value={shippingForm.zipCode}
                      onChange={(e) => { setShippingForm({ ...shippingForm, zipCode: e.target.value }); setErrors({ ...errors, zipCode: undefined }); }}
                      placeholder="1205"
                      className={inputClass(errors.zipCode)}
                    />
                    {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>}
                  </div>
                  <div>
                    <label htmlFor="country" className="text-sm font-medium">Country</label>
                    <input
                      id="country"
                      value={shippingForm.country}
                      onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                      placeholder="Bangladesh"
                      className={inputClass()}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Continue to Payment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="rounded-xl border border-border/50 p-6">
              <h2 className="text-base font-medium tracking-tight flex items-center gap-2.5 mb-6">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      htmlFor={`payment-${method.id}`}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:border-foreground/30 ${
                        paymentMethod === method.id
                          ? 'border-foreground bg-foreground/[0.03]'
                          : 'border-border/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        id={`payment-${method.id}`}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        paymentMethod === method.id ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">{method.label}</p>
                        <p className="text-xs text-muted-foreground font-light">{method.description}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <Check className="h-5 w-5 text-foreground flex-shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="border border-border hover:bg-accent h-11 px-5 rounded-full text-sm font-medium transition-all duration-300 inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300 inline-flex items-center gap-2"
                >
                  Review Order
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Order Review */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Items */}
              <div className="rounded-xl border border-border/50 p-6">
                <h3 className="text-base font-medium tracking-tight mb-4">Order Items ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item) => {
                    const price = item.product.discountPrice ?? item.product.price;
                    const image = item.product.images?.[0]?.url || '/placeholder.png';
                    return (
                      <div key={item.product.id + (item.variantId || '')} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                          <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                          {item.variantName && (
                            <p className="text-xs text-muted-foreground font-light">{item.variantName}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-light mt-0.5">Qty: {item.quantity} × {formatPrice(price)}</p>
                        </div>
                        <span className="text-sm font-medium text-foreground flex-shrink-0">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address Summary */}
              <div className="rounded-xl border border-border/50 p-6">
                <h3 className="text-base font-medium tracking-tight mb-3 flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  Shipping Address
                </h3>
                <div className="text-sm font-light">
                  <p className="font-medium">{shippingForm.fullName}</p>
                  <p className="text-muted-foreground">{shippingForm.phone}</p>
                  <p className="text-muted-foreground">{shippingForm.address}</p>
                  <p className="text-muted-foreground">
                    {shippingForm.city}{shippingForm.state ? `, ${shippingForm.state}` : ''} {shippingForm.zipCode}
                  </p>
                  <p className="text-muted-foreground">{shippingForm.country}</p>
                </div>
              </div>

              {/* Payment Method Summary */}
              <div className="rounded-xl border border-border/50 p-6">
                <h3 className="text-base font-medium tracking-tight mb-3 flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Payment Method
                </h3>
                <div>
                  <p className="text-sm font-medium">{selectedPayment?.label}</p>
                  <p className="text-xs text-muted-foreground font-light">{selectedPayment?.description}</p>
                </div>
              </div>

              {/* Terms & Place Order */}
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked === true)}
                    className="mt-0.5 rounded border-border h-4 w-4"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer font-light">
                    I agree to the <span className="text-foreground font-medium cursor-pointer hover:underline">Terms & Conditions</span> and{' '}
                    <span className="text-foreground font-medium cursor-pointer hover:underline">Privacy Policy</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/20 border border-border/50">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs text-muted-foreground font-light">
                    Your payment information is secure and encrypted. We never store your card details.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleBack}
                    className="border border-border hover:bg-accent h-11 px-5 rounded-full text-sm font-medium transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || !agreeTerms}
                    className="bg-foreground text-background hover:bg-foreground/90 h-12 w-full rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {placingOrder ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border/50 p-6 sticky top-4">
            <h2 className="text-base font-medium tracking-tight mb-5">Order Summary</h2>
            <div className="space-y-4 text-sm font-light">
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {items.map((item) => {
                  const price = item.product.discountPrice ?? item.product.price;
                  return (
                    <div key={item.product.id + (item.variantId || '')} className="flex justify-between gap-2">
                      <span className="text-muted-foreground truncate flex-1">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium flex-shrink-0">{formatPrice(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2.5">
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
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}