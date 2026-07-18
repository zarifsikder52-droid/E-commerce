'use client';

import { useUIStore } from '@/store/use-ui';
import { Search } from 'lucide-react';

export default function Header() {
  const { navigate } = useUIStore();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="flex items-center h-11 gap-2 px-3">
        {/* Search Input */}
        <button
          onClick={() => navigate('search')}
          className="flex-1 flex items-center h-9 px-3 bg-[#f5f5f5] rounded-md border border-[#e8e8e8] gap-2"
        >
          <Search className="size-4 text-gray-400 shrink-0" strokeWidth={2} />
          <span className="text-[13px] text-gray-400 flex-1 text-left">
            Search products...
          </span>
        </button>
        {/* Orange Search Button */}
        <button
          onClick={() => navigate('search')}
          className="shrink-0 h-9 px-4 bg-[#f85606] hover:bg-[#e04d05] rounded-md text-white text-[13px] font-semibold transition-colors"
        >
          Search
        </button>
      </div>
    </header>
  );
}