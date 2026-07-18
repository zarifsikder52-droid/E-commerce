'use client';

import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/use-cart';
import { useWishlistStore } from '@/store/use-wishlist';
import { useUIStore } from '@/store/use-ui';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-0.5">
      <Star className="size-3 text-amber-500 fill-amber-500" strokeWidth={0} />
      <span className="text-[11px] text-gray-600 font-medium">{rating}</span>
      {reviewCount > 0 && (
        <span className="text-[10px] text-gray-400">({reviewCount})</span>
      )}
    </div>
  );
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } =
    useWishlistStore();
  const { viewProduct } = useUIStore();

  const inWishlist = isInWishlist(product.id);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;
  const displayPrice = product.discountPrice ?? product.price;
  const imageUrl = product.images?.[0]?.url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCardClick = () => {
    viewProduct(product.id);
  };

  const isOutOfStock = product.stock <= 0;

  if (viewMode === 'list') {
    return (
      <div
        className="group flex gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-50 shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} loading="lazy" className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <ShoppingCart className="size-6 text-gray-300" />
            </div>
          )}
          {hasDiscount && (
            <span className="absolute top-1 left-1 bg-[#f85606] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
              -{discountPercent}%
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <h3 className="text-[13px] font-normal text-gray-800 line-clamp-2 leading-tight">{product.name}</h3>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold text-red-600">৳{displayPrice.toLocaleString()}</span>
              {hasDiscount && (
                <span className="text-[12px] text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
              )}
            </div>
            {product.rating > 0 && (
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full group">
      <div
        className="h-full bg-white rounded-md overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <ShoppingCart className="size-8 text-gray-300" />
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute top-1.5 left-1.5 bg-[#f85606] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
              -{discountPercent}%
            </span>
          )}

          {/* Out of Stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <span className="text-[11px] font-medium bg-white border border-gray-200 px-3 py-1 rounded-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`size-3.5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              strokeWidth={1.5}
            />
          </button>

          {/* Add to Cart (mobile always, desktop hover) */}
          <div className="absolute bottom-0 left-0 right-0 lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 p-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full h-8 bg-[#f85606] hover:bg-[#e04d05] text-white rounded-sm text-[12px] font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="size-3" strokeWidth={2} />
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col p-2.5 flex-1">
          <h3 className="text-[12px] text-gray-800 line-clamp-2 leading-tight font-normal min-h-[2rem]">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1.5 mt-auto pt-1">
            <span className="text-[14px] font-bold text-red-600">৳{displayPrice.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-[11px] text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="mt-1">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}