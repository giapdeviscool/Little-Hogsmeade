import { SearchFilter } from './SearchFilter';
import { ProductGrid } from './ProductGrid';

export function ProductSection() {
  return (
    <section className="flex-1 p-6 flex flex-col h-full overflow-hidden">
      <SearchFilter />
      <ProductGrid />
    </section>
  );
}
