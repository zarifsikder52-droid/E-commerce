import { create } from 'zustand';

interface SiteSettings {
  storeName: string;
  tagline: string;
  currency: string;
  currencyCode: string;
  freeShippingMin: string;
  contactEmail: string;
  phone: string;
  address: string;
  defaultShippingRate: string;
  taxRate: string;
  logoUrl: string;
  faviconUrl: string;
}

interface SiteSettingsState {
  settings: SiteSettings;
  loaded: boolean;
  fetchSettings: () => Promise<void>;
}

const defaults: SiteSettings = {
  storeName: 'NextShop',
  tagline: 'Your premium online shopping destination',
  currency: '৳',
  currencyCode: 'BDT',
  freeShippingMin: '2000',
  contactEmail: 'support@nextshop.com',
  phone: '+880 1234-567890',
  address: 'Dhaka, Bangladesh',
  defaultShippingRate: '60',
  taxRate: '0',
  logoUrl: '',
  faviconUrl: '',
};

export const useSiteSettings = create<SiteSettingsState>((set) => ({
  settings: defaults,
  loaded: false,
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          set({ settings: { ...defaults, ...data.settings }, loaded: true });
        }
      }
    } catch { /* silent */ }
  },
}));