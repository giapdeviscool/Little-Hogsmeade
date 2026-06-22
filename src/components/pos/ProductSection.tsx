import { SearchFilter } from '@/components/pos/SearchFilter';
import { ProductGrid } from '@/components/pos/ProductGrid';
import type { MenuItem } from '@/types/menu.types';

interface ProductSectionProps {
  isOrderOpen: boolean;
  onProductClick: (product: MenuItem) => void;
}

export function ProductSection({ isOrderOpen, onProductClick }: ProductSectionProps) {
  return (
    <section className={`flex flex-col h-full overflow-hidden border-r border-line transition-all duration-300 ${isOrderOpen ? 'w-[65%]' : 'w-[calc(100%-80px)]'}`}>
      <SearchFilter />
      <ProductGrid onProductClick={onProductClick} />
    </section>
  );
}
