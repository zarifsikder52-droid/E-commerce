'use client';

import { useEffect, useState, useRef } from 'react';
import { useUIStore } from '@/store/use-ui';
import { useCartStore } from '@/store/use-cart';
import { useWishlistStore } from '@/store/use-wishlist';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  ChevronRight,
  Check,
  Package,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth';
import { toast } from 'sonner';
import ProductCard from './ProductCard';
import type { Product, Review } from '@/types';

// ─── Star Rating Input ──────────────────────────────────────────────────

function StarRatingInput({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'lg' ? 'size-6' : size === 'sm' ? 'size-3.5' : 'size-5';
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const starVal = i + 1;
        const filled = starVal <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={cn(
              'transition-colors',
              !readonly && 'cursor-pointer hover:scale-110',
              readonly && 'cursor-default'
            )}
            onMouseEnter={() => !readonly && setHover(starVal)}
            onMouseLeave={() => !readonly && setHover(0)}
            onClick={() => onChange?.(starVal)}
          >
            <Star
              className={cn(
                sizeClass,
                filled ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Rating Distribution Bar ────────────────────────────────────────────

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === star).length;
    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percent };
  });

  return (
    <div className="space-y-2">
      {distribution.map(({ star, count, percent }) => (
        <div key={star} className="flex items-center gap-2 text-sm">
          <span className="w-6 text-right text-muted-foreground">{star}</span>
          <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Review Form ────────────────────────────────────────────────────────

function ReviewForm({ productId, onSubmit }: { productId: string; onSubmit: () => void }) {
  const { user, isAuthenticated } = useAuthStore();
  const { navigate } = useUIStore();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId, rating, title, comment }),
      });
      if (res.ok) {
        setSuccess(true);
        setRating(0);
        setTitle('');
        setComment('');
        onSubmit();
        toast.success('Review submitted successfully!');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          toast.error('You have already reviewed this product');
        } else {
          toast.error(data.error || 'Failed to submit review');
        }
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20 text-center">
        <h4 className="font-semibold">Write a Review</h4>
        <p className="text-sm text-muted-foreground">Please sign in to write a review.</p>
        <button
          onClick={() => navigate('login')}
          className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
      <h4 className="font-semibold">Write a Review</h4>

      {/* Rating */}
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Your Rating</label>
        <StarRatingInput value={rating} onChange={setRating} size="lg" />
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Review Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm outline-none transition-colors focus:ring-1 focus:ring-foreground/10"
        />
      </div>

      {/* Comment */}
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Your Review</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="bg-foreground text-background hover:bg-foreground/90 h-9 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {success && (
          <span className="text-foreground text-sm flex items-center gap-1">
            <Check className="size-4" />
            Review submitted!
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Review Item ────────────────────────────────────────────────────────

function ReviewItem({ review }: { review: Review }) {
  const initials = review.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="border-b border-border last:border-b-0 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Avatar className="size-10">
          <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-medium text-sm">{review.user.name}</span>
            {review.isVerified && (
              <span className="text-[10px] gap-1 bg-muted text-foreground border border-border px-1.5 py-0.5 rounded-sm inline-flex items-center">
                <Check className="size-3" />
                Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRatingInput value={review.rating} readonly size="sm" />
            <span className="text-xs text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          {review.title && (
            <h5 className="font-medium text-sm mt-2">{review.title}</h5>
          )}
          {review.comment && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{review.comment}</p>
          )}

          {/* Admin Reply */}
          {review.reply && (
            <div className="mt-3 ml-2 pl-3 border-l-2 border-border bg-muted/20 rounded-r-md p-3">
              <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <Package className="size-3" />
                Seller Response
              </p>
              <p className="text-sm text-muted-foreground">{review.reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ProductDetail Component ───────────────────────────────────────

export default function ProductDetail() {
  const selectedProductId = useUIStore((s) => s.selectedProductId);
  const navigate = useUIStore((s) => s.navigate);
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, addItem: addWish, removeItem: removeWish } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variant / quantity state
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Review scroll ref
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Fetch product
  useEffect(() => {
    if (!selectedProductId) return;
    setIsLoading(true);
    setSelectedImageIndex(0);
    setSelectedVariants({});
    setQuantity(1);

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${selectedProductId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);

          // Fetch related products
          if (data.categoryId) {
            const relatedRes = await fetch(
              `/api/products?categoryId=${data.categoryId}&limit=4&exclude=${data.id}`
            );
            if (relatedRes.ok) {
              const relatedData = await relatedRes.json();
              setRelatedProducts(relatedData.products ?? []);
            }
          }
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${selectedProductId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(Array.isArray(data) ? data : data.reviews ?? []);
        }
      } catch {
        // silently fail
      }
    }

    fetchProduct();
    fetchReviews();
  }, [selectedProductId]);

  // Derive values
  const images = product?.images ?? [];
  const hasDiscount = product && product.discountPrice && product.discountPrice < product.price;
  const effectivePrice = product?.discountPrice ?? product?.price ?? 0;
  const discountPercent =
    hasDiscount && product
      ? Math.round(((product.price - (product.discountPrice ?? 0)) / product.price) * 100)
      : 0;
  const savingsAmount =
    hasDiscount && product ? product.price - (product.discountPrice ?? 0) : 0;

  // Group variants by name
  const variantGroups: Record<string, typeof product.variants> = {};
  if (product?.variants) {
    for (const v of product.variants) {
      if (!variantGroups[v.name]) variantGroups[v.name] = [];
      variantGroups[v.name].push(v);
    }
  }

  // Average review rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : product?.rating ?? 0;

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Handlers
  const handleAddToCart = () => {
    if (!product) return;
    const variantId = Object.values(selectedVariants)[0];
    const variant = product.variants.find((v) => v.id === variantId);
    addItem(product, quantity, variantId, variant ? `${variant.name}: ${variant.value}` : undefined);
  };

  const handleWishlist = () => {
    if (!product) return;
    if (inWishlist) removeWish(product.id);
    else addWish(product);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('checkout');
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDesc || '',
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-md" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Package className="size-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Product Not Found</h2>
          <button
            onClick={() => navigate('shop')}
            className="border border-border hover:bg-accent h-10 px-4 rounded-md text-sm font-medium transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('home'); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('shop'); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {product.category?.name || 'Shop'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium line-clamp-1 max-w-[200px]">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ─── Gallery ─── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={images[selectedImageIndex]?.url || '/placeholder-product.png'}
                alt={images[selectedImageIndex]?.alt || product.name}
                className="h-full w-full object-cover"
              />

              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {hasDiscount && (
                  <span className="bg-foreground text-background text-sm px-2 py-0.5 rounded-sm font-medium">
                    -{discountPercent}%
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="bg-muted text-foreground border border-border text-sm px-2 py-0.5 rounded-sm font-medium">New</span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id || i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={cn(
                      'shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all',
                      selectedImageIndex === i
                        ? 'border-foreground'
                        : 'border-transparent hover:border-muted-foreground/30'
                    )}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ─── */}
          <div className="space-y-5">
            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {product.brand.name}
              </p>
            )}

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">{product.name}</h1>

            {/* Rating */}
            <div
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') reviewsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              <StarRatingInput value={Math.round(product.rating)} readonly size="sm" />
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-foreground">
                  {formatPrice(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {hasDiscount && savingsAmount > 0 && (
                <p className="text-sm text-muted-foreground font-medium">
                  You save {formatPrice(savingsAmount)} ({discountPercent}%)
                </p>
              )}
            </div>

            <Separator />

            {/* Short Description */}
            {product.shortDesc && (
              <p className="text-muted-foreground leading-relaxed">{product.shortDesc}</p>
            )}

            {/* Availability */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'size-2.5 rounded-full',
                  product.stock > 0 ? 'bg-foreground' : 'bg-destructive'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  product.stock > 0 ? 'text-foreground' : 'text-destructive'
                )}
              >
                {product.stock > 0
                  ? product.stock <= 5
                    ? `Only ${product.stock} left in stock`
                    : 'In Stock'
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Variant Selectors */}
            {Object.entries(variantGroups).map(([groupName, variants]) => (
              <div key={groupName} className="space-y-2">
                <label className="text-sm font-medium">
                  {groupName}:{' '}
                  <span className="text-muted-foreground font-normal">
                    {selectedVariants[groupName] ||
                      variants.find((v) => v.id === Object.values(selectedVariants)[0])?.value ||
                      'Select'}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={cn(
                        'h-9 px-4 rounded-md text-sm font-medium border transition-colors',
                        selectedVariants[groupName] === variant.value
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border hover:bg-accent text-foreground',
                        variant.stock <= 0 && 'opacity-40 cursor-not-allowed'
                      )}
                      disabled={variant.stock <= 0}
                      onClick={() =>
                        setSelectedVariants((prev) => ({ ...prev, [groupName]: variant.value }))
                      }
                    >
                      {variant.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity + Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    className="size-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-l-lg"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-12 text-center font-medium tabular-nums">{quantity}</span>
                  <button
                    className="size-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-r-lg"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90 h-12 rounded-md text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="size-4" />
                  Add to Cart
                </button>
              </div>

              <div className="flex gap-3">
                {/* Wishlist */}
                <button
                  className="flex-1 h-11 border border-border hover:bg-accent rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
                  onClick={handleWishlist}
                >
                  <Heart
                    className={cn('size-4', inWishlist ? 'fill-red-500 text-red-500' : '')}
                  />
                  {inWishlist ? 'Wishlisted' : 'Wishlist'}
                </button>

                {/* Buy Now */}
                <button
                  className="flex-1 h-11 border border-border hover:bg-accent rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </button>

                {/* Share */}
                <button
                  className="size-11 border border-border hover:bg-accent rounded-md transition-colors inline-flex items-center justify-center shrink-0"
                  onClick={handleShare}
                  aria-label="Share"
                >
                  <Share2 className="size-4" />
                </button>
              </div>
            </div>

            <Separator />

            {/* Feature Icons Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'On orders over ৳5,000' },
                { icon: Shield, label: 'Secure Payment', desc: '100% protected' },
                { icon: RotateCcw, label: 'Easy Returns', desc: product.returnPolicy || '7-day returns' },
                { icon: Package, label: 'Warranty', desc: product.warranty || '1 year warranty' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 py-2">
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Tabs Section ─── */}
        <div className="mt-12">
          <div className="border-b border-border">
            <div className="flex gap-6">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: `Reviews (${reviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'reviews') {
                      reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent first:border-foreground first:text-foreground"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description || product.shortDesc || 'No description available for this product.'}
            </p>
          </div>

          {/* Specifications */}
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Specifications</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: 'SKU', value: product.sku },
                    { label: 'Category', value: product.category?.name },
                    { label: 'Brand', value: product.brand?.name },
                    { label: 'Weight', value: product.weight ? `${product.weight}g` : undefined },
                    { label: 'Warranty', value: product.warranty },
                    { label: 'Return Policy', value: product.returnPolicy },
                    { label: 'Shipping', value: product.shippingInfo },
                  ]
                    .filter((row) => row.value)
                    .map((row, i) => (
                      <tr
                        key={row.label}
                        className={cn('border-b border-border last:border-b-0', i % 2 === 0 ? 'bg-muted/20' : '')}
                      >
                        <td className="px-4 py-3 font-medium text-muted-foreground w-40">
                          {row.label}
                        </td>
                        <td className="px-4 py-3">{row.value}</td>
                      </tr>
                    ))}
                  {!product.sku &&
                    !product.weight &&
                    !product.warranty &&
                    !product.returnPolicy &&
                    !product.shippingInfo && (
                      <tr className="bg-muted/20">
                        <td className="px-4 py-3 font-medium text-muted-foreground w-40">
                          Category
                        </td>
                        <td className="px-4 py-3">{product.category?.name || 'N/A'}</td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-8" ref={reviewsRef}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rating Summary */}
              <div className="lg:col-span-1">
                <div className="border border-border p-5 rounded-lg sticky top-24">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
                    <StarRatingInput value={Math.round(avgRating)} readonly size="md" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <RatingDistribution reviews={reviews} />
                </div>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-6">
                <ReviewForm productId={product.id} onSubmit={() => {}} />

                <Separator />

                <div className="space-y-0">
                  <h4 className="font-semibold mb-4">
                    Customer Reviews ({reviews.length})
                  </h4>
                  {reviews.length > 0 ? (
                    reviews.map((review) => <ReviewItem key={review.id} review={review} />)
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Related Products ─── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold tracking-tight">Related Products</h2>
              <button
                onClick={() => navigate('shop')}
                className="border border-border hover:bg-accent h-8 px-3 rounded-md text-sm transition-colors inline-flex items-center gap-1"
              >
                View All
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}