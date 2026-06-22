import { SearchFilter } from './SearchFilter';
import { ProductGrid } from './ProductGrid';

export function ProductSection() {
  return (
    <section className="w-[65%] flex flex-col h-full overflow-hidden border-r border-line">
      <SearchFilter />
      <ProductGrid />
    </section>
  );
}
