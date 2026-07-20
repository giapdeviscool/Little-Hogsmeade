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
  onSetOrderType: (type: 'dine-in' | 'takeaway') => void;
  onClearOrder: () => void;
  onUpdateItem: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCustomizeItem: (itemId: string) => void;
  onSetVoucher: (voucherCode?: string, discountAmount?: number) => void;
}

export function OrderSidebar({
  orders,
  activeOrderId,
  activeOrder,
  onClose,
  onAddOrder,
  onDeleteOrder,
  onChangeOrder,
  onSetCustomer,
  onSetOrderType,
  onClearOrder,
  onUpdateItem,
  onRemoveItem,
  onCustomizeItem,
  onSetVoucher
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
        onSetOrderType={onSetOrderType}
      />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
        {activeOrder.cartItems.map((item) => {
          const parsePrice = (priceStr: string) => {
            return parseInt(priceStr.replace(/\D/g, ''), 10) || 0;
          };
          const basePrice = parsePrice(item.price);
          const toppingsPrice = (item.toppings || []).reduce((sum, t) => sum + t.extraPrice * t.quantity, 0);
          const totalPrice = (basePrice + toppingsPrice) * item.quantity;
          const displayPrice = `₫${totalPrice.toLocaleString('vi-VN')}`;

          return (
            <CartItem
              key={item.id}
              id={item.id}
              name={item.name}
              note={item.note}
              price={displayPrice}
              quantity={item.quantity}
              toppings={item.toppings}
              onIncrease={() => onUpdateItem(item.id, 1)}
              onDecrease={() => onUpdateItem(item.id, -1)}
              onRemove={() => onRemoveItem(item.id)}
              onCustomize={() => onCustomizeItem(item.id)}
            />
          );
        })}
        {activeOrder.cartItems.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted mt-20">
            <p className="text-sm">Chưa có món nào được chọn</p>
          </div>
        )}
      </div>
      <CartSummary
        cartItems={activeOrder.cartItems}
        orderType={activeOrder.orderType}
        customerId={activeOrder.customer?.id || null}
        voucherCode={activeOrder.voucherCode}
        discountAmount={activeOrder.discountAmount}
        onSetVoucher={onSetVoucher}
        onClear={onClearOrder}
      />
    </aside>
  );
}
