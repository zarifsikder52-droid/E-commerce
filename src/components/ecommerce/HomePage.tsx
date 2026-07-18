'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useUIStore } from '@/store/use-ui';
import { useSiteSettings } from '@/store/use-site-settings';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';

const formatPrice = (price: number) => '৳' + price.toLocaleString();

// ===== Category Quick Icons =====
const quickCategories = [
  { label: 'Flash Sale', color: '#f85606', icon: '⚡' },
  { label: 'Free Delivery', color: '#16a34a', icon: '🚚' },
  { label: 'New Arrivals', color: '#7c3aed', icon: '🆕' },
  { label: 'Best Sellers', color: '#dc2626', icon: '🔥' },
  { label: 'Vouchers', color: '#ea580c', icon: '🎫' },
  { label: 'Top Brands', color: '#2563eb', icon: '⭐' },
  { label: 'Under 999', color: '#0891b2', icon: '💰' },
  { label: 'Deals', color: '#e11d48', icon: '🎁' },
  { label: 'Fashion', color: '#c026d3', icon: '👕' },
  { label: 'Electronics', color: '#4f46e5', icon: '📱' },
];

// ===== Hero Banner Slider =====
function HeroSlider() {
  const { featuredProducts, flashSaleProducts } = useUIStore();
  const { settings } = useSiteSettings();

  const sliderImages = [
    ...flashSaleProducts.filter(p => p.images?.[0]?.url),
    ...featuredProducts.filter(p => p.images?.[0]?.url),
  ].slice(0, 6);

  const banners = sliderImages.length > 0
    ? sliderImages.map(p => ({ url: p.images[0].url, alt: p.name, id: p.id }))
    : [];

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + banners.length) % banners.length);
  }, [banners.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(next, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, banners.length]);

  // Don't render slider if no images
  if (banners.length === 0) {
    return (
      <div className="mx-3 mt-3 rounded-lg overflow-hidden bg-gradient-to-r from-[#f85606] to-[#ff7e33] h-32 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg font-bold">{settings.storeName}</p>
          <p className="text-xs opacity-80 mt-1">{settings.tagline || 'Shop the best deals'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mt-3 rounded-lg overflow-hidden relative">
      <div className="relative aspect-[2.5/1] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <img
              src={banners[current].url}
              alt={banners[current].alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {/* Arrows */}
        <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center" aria-label="Previous">
          <ChevronLeft className="size-4 text-white" />
        </button>
        <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center" aria-label="Next">
          <ChevronRight className="size-4 text-white" />
        </button>
      </div>
      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {banners.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-white' : 'w-1 bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Flash Sale Product Card =====
function FlashSaleCard({ product }: { product: Product }) {
  const { viewProduct } = useUIStore();

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;
  const displayPrice = product.discountPrice ?? product.price;
  const imageUrl = product.images?.[0]?.url;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock <= 0;

  return (
    <button
      onClick={() => viewProduct(product.id)}
      className="shrink-0 w-[130px] bg-white rounded-md overflow-hidden border border-gray-100 text-left"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="size-6 text-gray-300" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
            SAVE {discountPercent}%
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-2">
        <p className="text-[14px] font-bold text-red-600">{formatPrice(displayPrice)}</p>
        {hasDiscount && (
          <p className="text-[11px] text-gray-400 line-through">{formatPrice(product.price)}</p>
        )}
        {!isOutOfStock && (
          <span className={`inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded-sm text-white ${isLowStock ? 'bg-red-500' : 'bg-red-400'}`}>
            {isLowStock ? `${product.stock} Stock left` : `${product.soldCount} Sold`}
          </span>
        )}
      </div>
    </button>
  );
}

// ===== Section Header =====
function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { navigate } = useUIStore();
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
      {action && (
        <button
          onClick={onAction || (() => navigate('shop'))}
          className="flex items-center gap-0.5 text-[12px] text-[#f85606] font-medium"
        >
          {action}
          <ChevronRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export default function HomePage() {
  const {
    categories,
    featuredProducts,
    flashSaleProducts,
    trendingProducts,
    newArrivalProducts,
    navigate,
    setCategories,
    setFeaturedProducts,
    setFlashSaleProducts,
    setTrendingProducts,
    setNewArrivalProducts,
    setCategory,
  } = useUIStore();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, flashRes, trendRes, newRes] =
          await Promise.allSettled([
            fetch('/api/categories?parentOnly=true'),
            fetch('/api/products?featured=true&limit=8'),
            fetch('/api/products?onSale=true&limit=10'),
            fetch('/api/products?trending=true&limit=8'),
            fetch('/api/products?newArrival=true&limit=8'),
          ]);

        if (catRes.status === 'fulfilled') {
          const data = await catRes.value.json();
          if (data.categories) setCategories(data.categories);
          else if (Array.isArray(data)) setCategories(data);
        }
        if (featRes.status === 'fulfilled') {
          const data = await featRes.value.json();
          if (data.products) setFeaturedProducts(data.products);
          else if (Array.isArray(data)) setFeaturedProducts(data);
        }
        if (flashRes.status === 'fulfilled') {
          const data = await flashRes.value.json();
          if (data.products) setFlashSaleProducts(data.products);
          else if (Array.isArray(data)) setFlashSaleProducts(data);
        }
        if (trendRes.status === 'fulfilled') {
          const data = await trendRes.value.json();
          if (data.products) setTrendingProducts(data.products);
          else if (Array.isArray(data)) setTrendingProducts(data);
        }
        if (newRes.status === 'fulfilled') {
          const data = await newRes.value.json();
          if (data.products) setNewArrivalProducts(data.products);
          else if (Array.isArray(data)) setNewArrivalProducts(data);
        }
      } catch {
        // Silently handle
      }
    };
    fetchData();
  }, [setCategories, setFeaturedProducts, setFlashSaleProducts, setTrendingProducts, setNewArrivalProducts]);

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      setCategory(categoryId);
      navigate('shop');
    },
    [setCategory, navigate]
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-16">
      {/* ===== Banner Slider ===== */}
      <HeroSlider />

      {/* ===== Quick Category Icons (2 rows × 5 cols) ===== */}
      <div className="px-3 pt-4 pb-1">
        <div className="grid grid-cols-5 gap-y-4">
          {quickCategories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                if (cat.label === 'Flash Sale') {
                  navigate('shop');
                } else {
                  navigate('shop');
                }
              }}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: cat.color + '15' }}
              >
                {cat.icon}
              </div>
              <span className="text-[10px] text-gray-700 leading-tight text-center font-medium">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== Flash Sale ===== */}
      {flashSaleProducts.length > 0 && (
        <div className="mt-2 bg-white">
          <SectionHeader title="Flash Sale" action="Shop More" />
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-3 pb-3 -mx-3 px-3">
            {flashSaleProducts.slice(0, 10).map((product) => (
              <FlashSaleCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* ===== Popular Categories ===== */}
      {categories.length > 0 && (
        <div className="mt-2 bg-white">
          <SectionHeader title="Popular Categories For You" action="Scroll More" />
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-0.5 px-3 pb-3">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex flex-col items-center gap-2 py-2"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-lg text-gray-400">{cat.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-700 text-center leading-tight font-medium line-clamp-2">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== Just For You / Featured ===== */}
      {featuredProducts.length > 0 && (
        <div className="mt-2 bg-white">
          <SectionHeader title="Just For You" />
          <div className="grid grid-cols-2 gap-px bg-gray-100 mx-3 rounded-md overflow-hidden">
            {featuredProducts.slice(0, 6).map((product) => {
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;
              const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;
              const displayPrice = product.discountPrice ?? product.price;
              const imageUrl = product.images?.[0]?.url;

              return (
                <button
                  key={product.id}
                  onClick={() => useUIStore.getState().viewProduct(product.id)}
                  className="bg-white p-2 text-left"
                >
                  <div className="relative aspect-square bg-gray-50 rounded-sm overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="size-6 text-gray-300" />
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-1 left-1 bg-[#f85606] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    <p className="text-[11px] text-gray-800 line-clamp-2 leading-tight font-normal">{product.name}</p>
                    <p className="text-[13px] font-bold text-red-600 mt-1">{formatPrice(displayPrice)}</p>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[11px] text-amber-500">★</span>
                        <span className="text-[10px] text-gray-500">{product.rating}</span>
                        {product.reviewCount > 0 && (
                          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== New Arrivals ===== */}
      {newArrivalProducts.length > 0 && (
        <div className="mt-2 bg-white">
          <SectionHeader title="New Arrivals" action="Shop More" />
          <div className="grid grid-cols-2 gap-px bg-gray-100 mx-3 rounded-md overflow-hidden">
            {newArrivalProducts.slice(0, 4).map((product) => {
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;
              const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;
              const displayPrice = product.discountPrice ?? product.price;
              const imageUrl = product.images?.[0]?.url;

              return (
                <button
                  key={product.id}
                  onClick={() => useUIStore.getState().viewProduct(product.id)}
                  className="bg-white p-2 text-left"
                >
                  <div className="relative aspect-square bg-gray-50 rounded-sm overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="size-6 text-gray-300" />
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-1 left-1 bg-[#f85606] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    <p className="text-[11px] text-gray-800 line-clamp-2 leading-tight font-normal">{product.name}</p>
                    <p className="text-[13px] font-bold text-red-600 mt-1">{formatPrice(displayPrice)}</p>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[11px] text-amber-500">★</span>
                        <span className="text-[10px] text-gray-500">{product.rating}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}