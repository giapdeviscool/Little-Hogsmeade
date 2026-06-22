import { useState } from 'react';
import { PosLayout } from '@/layouts/PosLayout';
import { ProductSection } from '@/components/pos/ProductSection';
import { OrderSidebar } from '@/components/pos/OrderSidebar';
import { Plus, ShoppingCart } from 'lucide-react';
import type { MenuItem } from '@/types/menu.types';
import type { Customer } from '@/types/customer.types';

export interface CartItemType {
  id: string;
  name: string;
  note: string;
  price: string;
  quantity: number;
}

export interface OrderType {
  id: string;
  title: string;
  customer: Customer | null;
  cartItems: CartItemType[];
}

export function PosPage() {
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orders, setOrders] = useState<OrderType[]>([
    { id: '1', title: 'Đơn mới #1', customer: null, cartItems: [] }
  ]);
  const [activeOrderId, setActiveOrderId] = useState<string>('1');

  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0];

  const handleProductClick = (product: MenuItem) => {
    if (!isOrderOpen) setIsOrderOpen(true);
    
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== activeOrderId) return order;
      
      const existing = order.cartItems.find(item => item.id === product.id);
      let newCartItems;
      if (existing) {
        newCartItems = order.cartItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        newCartItems = [...order.cartItems, {
          id: product.id,
          name: product.name,
          price: `₫${product.basePrice.toLocaleString('vi-VN')}`,
          note: '',
          quantity: 1,
        }];
      }
      return { ...order, cartItems: newCartItems };
    }));
  };

  const handleAddOrder = () => {
    const newId = Date.now().toString();
    const newOrder: OrderType = {
      id: newId,
      title: `Đơn mới #${orders.length + 1}`,
      customer: null,
      cartItems: []
    };
    setOrders(prev => [...prev, newOrder]);
    setActiveOrderId(newId);
    setIsOrderOpen(true);
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(prev => {
      const filtered = prev.filter(o => o.id !== id);
      if (filtered.length === 0) {
        const newId = Date.now().toString();
        setActiveOrderId(newId);
        return [{ id: newId, title: 'Đơn mới #1', customer: null, cartItems: [] }];
      }
      if (activeOrderId === id) {
        setActiveOrderId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  const handleSetCustomer = (customer: Customer | null) => {
    setOrders(prev => prev.map(o => 
      o.id === activeOrderId ? { ...o, customer } : o
    ));
  };

  return (
    <PosLayout>
      <div className="flex w-full h-full relative overflow-hidden bg-beige">
        <ProductSection 
          isOrderOpen={isOrderOpen} 
          onProductClick={handleProductClick} 
        />
        
        <div 
          className={`absolute top-0 right-0 h-full bg-white flex flex-col transition-transform duration-300 z-10 ${
            isOrderOpen ? 'w-[35%] translate-x-0 shadow-2xl border-l border-line' : 'w-[80px] translate-x-0 border-l border-line items-center py-6'
          }`}
        >
          {isOrderOpen ? (
            <OrderSidebar 
              orders={orders}
              activeOrderId={activeOrderId}
              activeOrder={activeOrder}
              onClose={() => setIsOrderOpen(false)}
              onAddOrder={handleAddOrder}
              onDeleteOrder={handleDeleteOrder}
              onChangeOrder={setActiveOrderId}
              onSetCustomer={handleSetCustomer}
            />
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={() => setIsOrderOpen(true)}
                className="w-12 h-12 bg-white text-coffee border border-line rounded-full flex items-center justify-center hover:bg-beige transition-colors shadow-sm relative"
                title="Mở đơn hiện tại"
              >
                <ShoppingCart className="w-5 h-5" />
                {activeOrder.cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeOrder.cartItems.length}
                  </span>
                )}
              </button>
              <button 
                onClick={handleAddOrder}
                className="w-12 h-12 bg-coffee text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                title="Tạo đơn mới"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </PosLayout>
  );
}
