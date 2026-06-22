import { SearchFilter } from '@/components/pos/SearchFilter';
import { ProductGrid } from '@/components/pos/ProductGrid';

export function ProductSection() {
  return (
    <section className="w-[65%] flex flex-col h-full overflow-hidden border-r border-line">
      <SearchFilter />
      <ProductGrid />
    </section>
  );
}
