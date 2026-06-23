import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getCategories } from '@/api/category.api';
import type { Category } from '@/types/menu.types';

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
}

export function SearchFilter({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory 
}: SearchFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories({ limit: 100 })
      .then(res => setCategories(res.data?.items || []))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 bg-white/50 space-y-4">
      {/* Search Bar */}
      <div className="relative w-full">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <Search className="w-5 h-5" />
        </span>
        <input 
          className="w-full pl-12 pr-4 py-3 bg-white border border-line rounded-xl focus:ring-2 focus:ring-coffee/20 font-sans text-sm outline-none shadow-sm" 
          placeholder="Tìm kiếm món ăn, đồ uống..." 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Category Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setSelectedCategory('')}
          className={`h-11 px-6 rounded-full font-bold whitespace-nowrap shadow-sm transition-all ${
            selectedCategory === '' 
              ? 'bg-latte text-white' 
              : 'bg-white text-coffee border border-line hover:bg-latte/10'
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`h-11 px-6 rounded-full font-bold whitespace-nowrap shadow-sm transition-all ${
              selectedCategory === cat.id 
                ? 'bg-latte text-white' 
                : 'bg-white text-coffee border border-line hover:bg-latte/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
