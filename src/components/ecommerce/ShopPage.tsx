'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUIStore } from '@/store/use-ui';
import { useCartStore } from '@/store/use-cart';
import { useWishlistStore } from '@/store/use-wishlist';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from './ProductCard';
import { SlidersHorizontal, X, Grid3X3, List, Star, Search, PackageOpen } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Product, Category, Brand } from '@/types';

const PRODUCTS_PER_PAGE = 12;
const MAX_PRICE = 300000;

type ViewMode = 'grid' | 'list';
type SortOption = 'popularity' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

interface FilterState {
  search: string;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  minRating: number;
  inStock: boolean;
  onSale: boolean;
  sort: SortOption;
  page: number;
}

function getInitialFilters(): FilterState {
  return {
    search: '',
    categories: [],
    brands: [],
    priceRange: [0, MAX_PRICE],
    minRating: 0,
    inStock: false,
    onSale: false,
    sort: 'popularity',
    page: 1,
  };
}

// ─── Filter Sidebar Content (shared between desktop & sheet) ───────────

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: Category[];
  brands: Brand[];
  onClose?: () => void;
}

function FilterSidebar({ filters, setFilters, categories, brands, onClose }: FilterSidebarProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleArrayFilter = (key: 'categories' | 'brands', id: string) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      const next = arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id];
      return { ...prev, [key]: next, page: 1 };
    });
  };

  const clearAll = () => {
    setFilters(getInitialFilters());
    onClose?.();
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < MAX_PRICE ||
    filters.minRating > 0 ||
    filters.inStock ||
    filters.onSale ||
    filters.search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-base tracking-tight">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
            Clear All
          </button>
        )}
      </div>

      <Separator />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="input-elegant w-full h-11 rounded-lg border border-border/50 bg-transparent px-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Categories</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => toggleArrayFilter('categories', cat.id)}
              >
                <Checkbox
                  checked={filters.categories.includes(cat.id)}
                  onCheckedChange={() => toggleArrayFilter('categories', cat.id)}
                />
                <span className="text-sm flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
                  {cat.name}
                </span>
                <span className="text-xs text-muted-foreground/60">({cat._count?.products ?? 0})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Brands */}
      {brands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Brands</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => toggleArrayFilter('brands', brand.id)}
              >
                <Checkbox
                  checked={filters.brands.includes(brand.id)}
                  onCheckedChange={() => toggleArrayFilter('brands', brand.id)}
                />
                <span className="text-sm flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
                  {brand.name}
                </span>
                <span className="text-xs text-muted-foreground/60">({brand._count?.products ?? 0})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Price Range</h4>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={500}
          value={filters.priceRange}
          onValueChange={(val) => updateFilter('priceRange', val as [number, number])}
          className="mt-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatPrice(filters.priceRange[0])}</span>
          <span>{formatPrice(filters.priceRange[1])}</span>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((r) => (
            <label
              key={r}
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => updateFilter('minRating', filters.minRating === r ? 0 : r)}
            >
              <Checkbox checked={filters.minRating === r} />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'size-3.5',
                      i < r ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Availability</h4>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={filters.inStock}
            onCheckedChange={(checked) => updateFilter('inStock', !!checked)}
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>

      <Separator />

      {/* On Sale */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Special Offers</h4>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={filters.onSale}
            onCheckedChange={(checked) => updateFilter('onSale', !!checked)}
          />
          <span className="text-sm">On Sale</span>
        </label>
      </div>
    </div>
  );
}

// ─── Active Filter Badges ───────────────────────────────────────────────

interface ActiveFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: Category[];
  brands: Brand[];
}

function ActiveFilters({ filters, setFilters, categories, brands }: ActiveFiltersProps) {
  const removeCategory = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== id),
      page: 1,
    }));
  };

  const removeBrand = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.filter((b) => b !== id),
      page: 1,
    }));
  };

  const clearPrice = () => {
    setFilters((prev) => ({ ...prev, priceRange: [0, MAX_PRICE], page: 1 }));
  };

  const clearRating = () => {
    setFilters((prev) => ({ ...prev, minRating: 0, page: 1 }));
  };

  const clearStock = () => {
    setFilters((prev) => ({ ...prev, inStock: false, page: 1 }));
  };

  const clearSale = () => {
    setFilters((prev) => ({ ...prev, onSale: false, page: 1 }));
  };

  const clearSearch = () => {
    setFilters((prev) => ({ ...prev, search: '', page: 1 }));
  };

  const badges: { label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    badges.push({ label: `Search: "${filters.search}"`, onRemove: clearSearch });
  }
  filters.categories.forEach((id) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) badges.push({ label: cat.name, onRemove: () => removeCategory(id) });
  });
  filters.brands.forEach((id) => {
    const brand = brands.find((b) => b.id === id);
    if (brand) badges.push({ label: brand.name, onRemove: () => removeBrand(id) });
  });
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE) {
    badges.push({
      label: `${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`,
      onRemove: clearPrice,
    });
  }
  if (filters.minRating > 0) {
    badges.push({ label: `${filters.minRating}+ Stars`, onRemove: clearRating });
  }
  if (filters.inStock) {
    badges.push({ label: 'In Stock', onRemove: clearStock });
  }
  if (filters.onSale) {
    badges.push({ label: 'On Sale', onRemove: clearSale });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active Filters:</span>
      {badges.map((b, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 bg-foreground text-background text-xs px-3 py-1 rounded-full font-medium">
          {b.label}
          <button
            onClick={b.onRemove}
            className="hover:text-foreground/60 transition-colors"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Pagination ─────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 w-9 flex items-center justify-center rounded-lg text-sm hover:bg-muted transition-all duration-200 disabled:opacity-40"
      >
        ‹
      </button>
      {getPageNumbers().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'h-9 w-9 flex items-center justify-center rounded-lg text-sm transition-all duration-200',
              page === currentPage
                ? 'bg-foreground text-background'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {page}
          </button>
        )
      )}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 w-9 flex items-center justify-center rounded-lg text-sm hover:bg-muted transition-all duration-200 disabled:opacity-40"
      >
        ›
      </button>
    </nav>
  );
}

// ─── Main ShopPage Component ────────────────────────────────────────────

export default function ShopPage() {
  const {
    categories,
    brands,
    setCategories,
    setBrands,
    selectedCategoryId,
    setCategory,
    navigate,
  } = useUIStore();

  const [filters, setFilters] = useState<FilterState>(getInitialFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Sync selectedCategoryId from store
  useEffect(() => {
    if (selectedCategoryId) {
      setFilters((prev) => ({
        ...prev,
        categories: [selectedCategoryId],
        page: 1,
      }));
    }
  }, [selectedCategoryId]);

  // Fetch categories & brands
  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/brands'),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          setBrands(brandData);
        }
      } catch {
        // Silently fail — filters just won't show
      }
    }
    fetchData();
  }, [setCategories, setBrands]);

  // Fetch products based on filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(filters.page));
      params.set('limit', String(PRODUCTS_PER_PAGE));
      params.set('sort', filters.sort);

      if (filters.search) params.set('search', filters.search);
      filters.categories.forEach((c) => params.append('categoryId', c));
      filters.brands.forEach((b) => params.append('brandId', b));
      if (filters.priceRange[0] > 0) params.set('minPrice', String(filters.priceRange[0]));
      if (filters.priceRange[1] < MAX_PRICE) params.set('maxPrice', String(filters.priceRange[1]));
      if (filters.minRating > 0) params.set('rating', String(filters.minRating));
      if (filters.inStock) params.set('inStock', 'true');
      if (filters.onSale) params.set('onSale', 'true');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products ?? []);
        setTotalProducts(data.total ?? 0);
        setTotalPages(data.pages ?? 1);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCategoryName = categories.find((c) =>
    filters.categories.includes(c.id)
  )?.name;

  const fromIndex = (filters.page - 1) * PRODUCTS_PER_PAGE + 1;
  const toIndex = Math.min(filters.page * PRODUCTS_PER_PAGE, totalProducts);

  // ─── Filter sidebar for desktop ───
  const sidebarContent = (
    <FilterSidebar
      filters={filters}
      setFilters={setFilters}
      categories={categories}
      brands={brands}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 py-8">
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
              {selectedCategoryName ? (
                <>
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigate('shop'); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Shop
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage className="text-foreground font-medium">{selectedCategoryName}</BreadcrumbPage>
                </>
              ) : (
                <BreadcrumbPage className="text-foreground font-medium">Shop</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight">
            {selectedCategoryName || 'All Products'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">
            {totalProducts > 0 ? (
              <>Showing <span className="font-medium text-foreground">{fromIndex}–{toIndex}</span> of <span className="font-medium text-foreground">{totalProducts}</span> products</>
            ) : (
              'No products found'
            )}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="rounded-xl border border-border/50 p-6">{sidebarContent}</div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <button className="lg:hidden h-11 px-4 border border-border hover:bg-accent rounded-lg text-sm inline-flex items-center gap-2 transition-all duration-300">
                      <SlidersHorizontal className="size-4" />
                      Filters
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="px-4 pb-6 pt-2">
                      <FilterSidebar
                        filters={filters}
                        setFilters={setFilters}
                        categories={categories}
                        brands={brands}
                        onClose={() => setSheetOpen(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select
                  value={filters.sort}
                  onValueChange={(val) =>
                    setFilters((prev) => ({ ...prev, sort: val as SortOption, page: 1 }))
                  }
                >
                  <SelectTrigger className="w-44 border-border/50 rounded-lg">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                <button
                  className={cn(
                    'size-8 flex items-center justify-center rounded-lg transition-all duration-200',
                    viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="size-4" />
                </button>
                <button
                  className={cn(
                    'size-8 flex items-center justify-center rounded-lg transition-all duration-200',
                    viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setViewMode('list')}
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            <ActiveFilters
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              brands={brands}
            />

            {/* Product Grid / List */}
            {isLoading ? (
              <div
                className={cn(
                  'grid gap-4 md:gap-5 lg:gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-border/50">
                    <Skeleton className={cn('w-full bg-muted/30', viewMode === 'grid' ? 'aspect-square' : 'h-48')} />
                    <div className="p-4 space-y-2.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                className={cn(
                  'grid gap-4 md:gap-5 lg:gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                    : 'grid-cols-1'
                )}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-5">
                  <PackageOpen className="size-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-medium text-lg mb-1.5">No products found</h3>
                <p className="text-muted-foreground text-sm max-w-sm font-light">
                  Try adjusting your filters or search terms to find what you&apos;re looking for.
                </p>
                <button
                  className="mt-5 border border-border hover:bg-accent h-11 px-5 rounded-lg text-sm font-medium transition-all duration-300"
                  onClick={() => setFilters(getInitialFilters())}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="pt-6">
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}