import { useState } from 'react';
import { SearchFilter } from '@/components/pos/SearchFilter';
import { ProductGrid } from '@/components/pos/ProductGrid';
import type { MenuItem } from '@/types/menu.types';

interface ProductSectionProps {
  isOrderOpen: boolean;
  onProductClick: (product: MenuItem) => void;
}

export function ProductSection({ isOrderOpen: _isOrderOpen, onProductClick }: ProductSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  return (
    <section className="flex-1 flex flex-col h-full overflow-hidden border-r border-line transition-all duration-300 min-w-0">
      <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <ProductGrid 
        onProductClick={onProductClick} 
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />
    </section>
  );
}
