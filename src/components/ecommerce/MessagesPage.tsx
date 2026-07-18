'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/use-ui';
import { useAuthStore } from '@/store/use-auth';
import { ArrowLeft, Bell, ShoppingBag, Truck, Gift, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Notification } from '@/types';

const iconMap: Record<string, typeof Bell> = {
  order: ShoppingBag,
  shipping: Truck,
  promo: Gift,
  info: Info,
  default: Bell,
};

const typeColors: Record<string, string> = {
  order: 'bg-blue-50 text-blue-500',
  shipping: 'bg-green-50 text-green-500',
  promo: 'bg-orange-50 text-orange-500',
  info: 'bg-gray-50 text-gray-500',
};

export default function MessagesPage() {
  const { navigate, notifications, setNotifications } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) {
        const sampleNotifications: Notification[] = [
          { id: '1', title: 'Welcome!', message: 'Welcome to our store. Browse our latest collection and find amazing deals.', type: 'info', isRead: false, createdAt: new Date().toISOString() },
          { id: '2', title: 'Flash Sale Live', message: 'Limited time offers are available now. Check out the deals before they expire!', type: 'promo', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', title: 'Free Shipping', message: 'Enjoy free shipping on all orders above ৳999. Shop now!', type: 'shipping', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
        ];
        setNotifications(sampleNotifications);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchNotifications();
  }, [isAuthenticated, setNotifications]);

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center h-11 px-3 gap-2">
          <button onClick={() => navigate('home')} className="shrink-0 w-8 h-8 flex items-center justify-center" aria-label="Go back">
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <h1 className="text-[15px] font-bold text-gray-900">Messages</h1>
        </div>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-[#f85606] rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-20 bg-white rounded-md">
            <Bell className="size-8 text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-gray-400">No messages yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-md overflow-hidden">
            <AnimatePresence>
              {notifications.map((notif, i) => {
                const IconComp = iconMap[notif.type] || iconMap.default;
                const colorClass = typeColors[notif.type] || typeColors.info;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className={`flex items-start gap-3 p-3 border-b border-gray-50 last:border-0 ${!notif.isRead ? 'bg-orange-50/30' : ''}`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                      <IconComp className="size-3.5" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-[13px] ${!notif.isRead ? 'font-bold' : 'font-normal'} text-gray-800`}>
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <span className="shrink-0 w-2 h-2 mt-1 bg-[#f85606] rounded-full" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}