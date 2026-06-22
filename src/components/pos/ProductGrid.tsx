import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/pos/ProductCard';
import { getMenuItems } from '@/api/menu-item.api';
import type { MenuItem } from '@/types/menu.types';
interface ProductGridProps {
  onProductClick: (product: MenuItem) => void;
}

export function ProductGrid({ onProductClick }: ProductGridProps) {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const response = await getMenuItems({ limit: 20, skip: 0 });
        let dataToSet: MenuItem[] = [];
        if (Array.isArray(response.data)) {
          dataToSet = response.data;
        } else if (Array.isArray(response)) {
          dataToSet = response;
        } else if (response && typeof response === 'object' && 'items' in response && Array.isArray((response as any).items)) {
          dataToSet = (response as any).items;
        }
        setProducts(dataToSet);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách món');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center">
        <div className="text-muted font-semibold">Đang tải danh sách món...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
        <div className="text-red-500 font-semibold mb-2">Đã xảy ra lỗi</div>
        <p className="text-muted text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
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
    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            name={product.name}
            category={product.itemType || 'Chưa phân loại'}
            price={`₫${product.basePrice.toLocaleString('vi-VN')}`}
            image={product.imageUrl || 'https://placehold.co/400x300/F5F0E6/8a7560?text=Chưa+Có+Ảnh'}
            outOfStock={!product.isActive}
            isBestSeller={product.isFeatured}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </div>
  );
}
