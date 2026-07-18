'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/store/use-ui';
import { Search, ArrowLeft, Clock, ShoppingBag, Star } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

export default function SearchPage() {
  const { navigate, addRecentSearch, recentSearches, clearRecentSearches, setSearchQuery, categories, setCategory } = useUIStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRefCallback = useCallback((node: HTMLInputElement | null) => {
    if (node) setTimeout(() => node.focus(), 100);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nextshop-recent-searches');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as string[];
          if (parsed.length > 0 && useUIStore.getState().recentSearches.length === 0) {
            useUIStore.setState({ recentSearches: parsed });
          }
        } catch { /* ignore */ }
      }
    }
  }, []);

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;
    addRecentSearch(q);
    setSearchQuery(q);
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=20`);
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, addRecentSearch, setSearchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategoryClick = (categoryId: string) => {
    setCategory(categoryId);
    navigate('shop');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Search Header - Daraz style */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center h-11 gap-2 px-3">
          <button
            onClick={() => navigate('home')}
            className="shrink-0 w-8 h-8 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="flex-1 flex items-center h-9 px-3 bg-[#f5f5f5] rounded-md border border-gray-200 gap-2">
            <Search className="size-4 text-gray-400 shrink-0" strokeWidth={2} />
            <input
              ref={inputRefCallback}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-400 font-normal"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            className="shrink-0 h-9 px-4 bg-[#f85606] hover:bg-[#e04d05] rounded-md text-white text-[13px] font-semibold transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      <div className="px-3 pt-3">
        {!hasSearched ? (
          <div className="bg-white rounded-md">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[13px] font-bold text-gray-800">Recent Searches</h3>
                  <button onClick={clearRecentSearches} className="text-[11px] text-gray-400">Clear all</button>
                </div>
                <div className="space-y-0.5">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); handleSearch(term); }}
                      className="flex items-center gap-2.5 w-full px-2 py-2 rounded hover:bg-gray-50 text-left"
                    >
                      <Clock className="size-3.5 text-gray-300 shrink-0" strokeWidth={1.5} />
                      <span className="text-[13px] text-gray-600">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Categories */}
            {categories.length > 0 && (
              <div className="p-3">
                <h3 className="text-[13px] font-bold text-gray-800 mb-2">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="px-3 py-1.5 text-[12px] text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-100 font-normal"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentSearches.length === 0 && categories.length === 0 && (
              <div className="py-16 text-center">
                <Search className="size-8 text-gray-300 mx-auto mb-3" />
                <p className="text-[13px] text-gray-400">Search for products</p>
              </div>
            )}
          </div>
        ) : isSearching ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-[#f85606] rounded-full animate-spin" />
          </div>
        ) : (
          <div>
            <p className="text-[12px] text-gray-500 mb-3 font-normal">
              {results.length > 0
                ? `${results.length} result${results.length > 1 ? 's' : ''} for "${query}"`
                : `No results for "${query}"`}
            </p>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-md">
                <p className="text-[13px] text-gray-400">Try different keywords</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}