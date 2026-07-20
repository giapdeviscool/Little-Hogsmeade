import { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '@/components/pos/ProductCard';
import { getMenuItems } from '@/api/menu-item.api';
import type { MenuItem } from '@/types/menu.types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 12;

interface ProductGridProps {
  onProductClick: (product: MenuItem) => void;
  searchQuery: string;
  selectedCategory: string;
}

export function ProductGrid({ onProductClick, searchQuery, selectedCategory }: ProductGridProps) {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page, limit: PAGE_SIZE };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.categoryId = selectedCategory;

      const response = await getMenuItems(params);
      const items = response?.data?.items;
      const pagination = response?.data?.pagination;

      setProducts(Array.isArray(items) ? items : []);
      setTotalPages(pagination?.totalPages ?? 1);
      setTotalItems(pagination?.total ?? 0);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách món');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategory]);

  useEffect(() => {
    setPage(1); // Reset to page 1 when search or category changes
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-coffee border-t-transparent rounded-full animate-spin" />
          <div className="text-muted font-semibold text-sm">Đang tải danh sách món...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
        <div className="text-red-500 font-semibold mb-2">Đã xảy ra lỗi</div>
        <p className="text-muted text-sm">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-coffee/90 active:scale-95"
        >Thử lại</button>
      </div>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center">
        <div className="text-muted font-semibold">Chưa có món nào được thêm.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              category={product.category?.name || product.itemType || 'Chưa phân loại'}
              price={`₫${product.basePrice.toLocaleString('vi-VN')}`}
              image={product.imageUrl || 'https://placehold.co/400x300/F5F0E6/8a7560?text=Chưa+Có+Ảnh'}
              isActive={product.isActive}
              isAvailable={product.isAvailable !== false}
              isBestSeller={product.isFeatured}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      </div>

      {/* Pagination bar */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-line bg-white flex items-center justify-between shrink-0">
          <span className="text-xs text-muted font-medium">
            {totalItems} món · Trang {page}/{totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-coffee hover:bg-beige disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      page === p
                        ? 'bg-coffee text-white'
                        : 'border border-line text-coffee hover:bg-beige'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-coffee hover:bg-beige disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
