'use client';
import { useWishlistStore } from '@/store/use-wishlist';
import { useCartStore } from '@/store/use-cart';
import { useUIStore } from '@/store/use-ui';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import ProductCard from './ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const { navigate } = useUIStore();

  const handleMoveAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((product) => {
      addToCart(product);
    });
    clearWishlist();
    toast.success(`${items.length} item${items.length > 1 ? 's' : ''} moved to cart`);
    navigate('cart');
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId);
    toast.success('Removed from wishlist');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => navigate('home')}
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-foreground font-medium">Wishlist</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-foreground mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md">
            Save your favorite items here so you can easily find them later.
          </p>
          <button
            onClick={() => navigate('shop')}
            className="bg-foreground text-background hover:bg-foreground/90 h-11 px-8 rounded-full text-sm font-medium transition-all duration-300"
          >
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('home')}
              className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-foreground font-medium">Wishlist</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">My Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <button
          onClick={handleMoveAllToCart}
          className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-full text-sm font-medium transition-all duration-300 inline-flex items-center gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Move All to Cart
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}