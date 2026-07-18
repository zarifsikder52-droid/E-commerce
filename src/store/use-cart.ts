import { create } from 'zustand';
import type { Product } from '@/types';

interface CartItemLocal {
  product: Product;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

interface CartState {
  items: CartItemLocal[];
  couponCode: string | null;
  couponDiscount: number;
  appliedCoupon: { code: string; type: string; value: number; maxDiscount?: number } | null;

  addItem: (product: Product, quantity?: number, variantId?: string, variantName?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: { code: string; type: string; value: number; maxDiscount?: number }, subtotal: number) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getTotalSavings: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: null,
  couponDiscount: 0,
  appliedCoupon: null,

  addItem: (product, quantity = 1, variantId, variantName) => {
    const items = [...get().items];
    const existingIdx = items.findIndex(
      (i) => i.product.id === product.id && i.variantId === variantId
    );
    if (existingIdx >= 0) {
      items[existingIdx].quantity += quantity;
    } else {
      items.push({ product, quantity, variantId, variantName });
    }
    set({ items });
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.product.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const items = get().items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    set({ items });
  },

  clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0, appliedCoupon: null }),

  applyCoupon: (coupon, subtotal) => {
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }
    set({ couponCode: coupon.code, couponDiscount: discount, appliedCoupon: coupon });
  },

  removeCoupon: () => set({ couponCode: null, couponDiscount: 0, appliedCoupon: null }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);
  },

  getTotalSavings: () => {
    return get().items.reduce((sum, item) => {
      const diff = item.product.price - (item.product.discountPrice ?? item.product.price);
      return sum + diff * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));