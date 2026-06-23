import { SearchFilter } from '@/components/pos/SearchFilter';
import { ProductGrid } from '@/components/pos/ProductGrid';
import type { MenuItem } from '@/types/menu.types';

interface ProductSectionProps {
  isOrderOpen: boolean;
  onProductClick: (product: MenuItem) => void;
}

export function ProductSection({ isOrderOpen: _isOrderOpen, onProductClick }: ProductSectionProps) {
  return (
    <section className="flex-1 flex flex-col h-full overflow-hidden border-r border-line transition-all duration-300 min-w-0">
      <SearchFilter />
      <ProductGrid onProductClick={onProductClick} />
    </section>
  );
}
