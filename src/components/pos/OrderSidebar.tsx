import { OrderTabs } from '@/components/pos/OrderTabs';
import { CartItem } from '@/components/pos/CartItem';
import { CartSummary } from '@/components/pos/CartSummary';
import { X } from 'lucide-react';
import type { OrderType } from '@/pages/pos/index';
import type { Customer } from '@/types/customer.types';

interface OrderSidebarProps {
  orders: OrderType[];
  activeOrderId: string;
  activeOrder: OrderType;
  onClose: () => void;
  onAddOrder: () => void;
  onDeleteOrder: (id: string) => void;
  onChangeOrder: (id: string) => void;
  onSetCustomer: (customer: Customer | null) => void;
}

export function OrderSidebar({
  orders,
  activeOrderId,
  activeOrder,
  onClose,
  onAddOrder,
  onDeleteOrder,
  onChangeOrder,
  onSetCustomer
}: OrderSidebarProps) {
  return (
    <aside className="w-full bg-white flex flex-col h-full relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-muted hover:text-coffee hover:bg-beige rounded-full transition-colors"
        title="Đóng"
      >
        <X className="w-5 h-5" />
      </button>
      <OrderTabs 
        orders={orders}
        activeOrderId={activeOrderId}
        activeOrder={activeOrder}
        onAddOrder={onAddOrder}
        onDeleteOrder={onDeleteOrder}
        onChangeOrder={onChangeOrder}
        onSetCustomer={onSetCustomer}
      />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
        {activeOrder.cartItems.map((item) => (
          <CartItem key={item.id} {...item} />
        ))}
        {activeOrder.cartItems.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted mt-20">
            <p className="text-sm">Chưa có món nào được chọn</p>
          </div>
        )}
      </div>
      <CartSummary />
    </aside>
  );
}
