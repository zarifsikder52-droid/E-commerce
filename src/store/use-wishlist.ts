import { create } from 'zustand';
import type { Product } from '@/types';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  addItem: (product) => {
    if (!get().isInWishlist(product.id)) {
      set({ items: [...get().items, product] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.id !== productId) });
  },

  isInWishlist: (productId) => {
    return get().items.some((i) => i.id === productId);
  },

  clearWishlist: () => set({ items: [] }),
}));