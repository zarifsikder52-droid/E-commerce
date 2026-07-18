'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useUIStore } from '@/store/use-ui';
import { useSiteSettings } from '@/store/use-site-settings';
import Header from '@/components/ecommerce/Header';
import BottomNav from '@/components/ecommerce/BottomNav';
import CartDrawer from '@/components/ecommerce/CartDrawer';
import HomePage from '@/components/ecommerce/HomePage';
import ShopPage from '@/components/ecommerce/ShopPage';
import ProductDetail from '@/components/ecommerce/ProductDetail';
import CartPage from '@/components/ecommerce/CartPage';
import WishlistPage from '@/components/ecommerce/WishlistPage';
import CheckoutPage from '@/components/ecommerce/CheckoutPage';
import SearchPage from '@/components/ecommerce/SearchPage';
import MessagesPage from '@/components/ecommerce/MessagesPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/components/ecommerce/AuthPages';
import CustomerDashboard from '@/components/ecommerce/CustomerDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Views that show bottom nav
const bottomNavViews = new Set([
  'home', 'shop', 'product', 'cart', 'wishlist', 'search', 'messages',
  'dashboard', 'orders', 'order-detail', 'addresses',
]);

export default function NextShopApp() {
  const { currentView, invalidateStoreData, isDataRefreshing } = useUIStore();
  const { fetchSettings } = useSiteSettings();
  const handledRef = useRef(false);

  const showBottomNav = bottomNavViews.has(currentView);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useLayoutEffect(() => {
    if (handledRef.current) return;
    if (typeof window !== 'undefined' && sessionStorage.getItem('nextshop-admin-changed')) {
      sessionStorage.removeItem('nextshop-admin-changed');
      handledRef.current = true;
      invalidateStoreData();
      fetchSettings();
    }
  }, [invalidateStoreData, fetchSettings]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'product':
        return <ProductDetail />;
      case 'cart':
        return <CartPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'dashboard':
      case 'orders':
      case 'order-detail':
      case 'addresses':
        return <CustomerDashboard />;
      case 'search':
        return <SearchPage />;
      case 'messages':
        return <MessagesPage />;
      default:
        return <HomePage />;
    }
  };

  if (isDataRefreshing) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Header />
      <CartDrawer />

      <main className={`flex-1 ${showBottomNav ? 'pb-14' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}