'use client';

import { useUIStore } from '@/store/use-ui';
import { useCartStore } from '@/store/use-cart';
import { useAuthStore } from '@/store/use-auth';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';

const navItems = [
  { key: 'home' as const, icon: Home, label: 'Home' },
  { key: 'shop' as const, icon: LayoutGrid, label: 'Categories' },
  { key: 'cart' as const, icon: ShoppingCart, label: 'Cart' },
  { key: 'profile' as const, icon: User, label: 'Account' },
];

export default function BottomNav() {
  const { currentView, navigate } = useUIStore();
  const { getItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const cartCount = getItemCount();

  const getActiveKey = () => {
    if (currentView === 'home' || currentView === 'messages') return 'home';
    if (currentView === 'shop' || currentView === 'product') return 'shop';
    if (currentView === 'cart' || currentView === 'checkout') return 'cart';
    if (['dashboard', 'orders', 'order-detail', 'addresses', 'login', 'register', 'forgot-password', 'wishlist'].includes(currentView)) return 'profile';
    return '';
  };

  const activeKey = getActiveKey();

  const handleNav = (key: string) => {
    switch (key) {
      case 'home':
        navigate('home');
        break;
      case 'shop':
        navigate('shop');
        break;
      case 'cart':
        navigate('cart');
        break;
      case 'profile':
        navigate(isAuthenticated ? 'dashboard' : 'login');
        break;
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map(({ key, icon: Icon, label }) => {
          const isActive = activeKey === key;
          const showBadge = key === 'cart' && cartCount > 0;

          return (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 flex-1"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`size-[22px] transition-colors duration-200 ${
                    isActive ? 'text-[#f85606]' : 'text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2 : 1.6}
                  fill={isActive ? '#f85606' : 'none'}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white bg-[#f85606] rounded-full px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] leading-none transition-colors duration-200 ${
                  isActive ? 'text-[#f85606] font-semibold' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}