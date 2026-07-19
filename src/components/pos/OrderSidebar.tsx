import { OrderTabs } from '@/components/pos/OrderTabs';
import { CartItem } from '@/components/pos/CartItem';
import { CartSummary } from '@/components/pos/CartSummary';
import { X, Truck } from 'lucide-react';
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
  onSetOrderType: (type: 'dine-in' | 'takeaway' | 'delivery') => void;
  onUpdateDeliveryInfo: (info: Partial<NonNullable<OrderType['deliveryInfo']>>) => void;
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
  onUpdateDeliveryInfo,
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
        {activeOrder.orderType === 'delivery' && (
          <div className="p-4 rounded-xl bg-cream border border-line space-y-3">
            <div className="flex items-center gap-2 text-coffee font-bold text-sm">
              <Truck className="size-4 text-latte" />
              <span>Thông tin giao hàng</span>
            </div>
            <div className="grid gap-2.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                Tên người nhận
                <input
                  type="text"
                  value={activeOrder.deliveryInfo?.receiverName || ''}
                  onChange={(e) => onUpdateDeliveryInfo({ receiverName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-latte"
                />
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                Số điện thoại
                <input
                  type="text"
                  value={activeOrder.deliveryInfo?.receiverPhone || ''}
                  onChange={(e) => onUpdateDeliveryInfo({ receiverPhone: e.target.value })}
                  placeholder="Ví dụ: 0987654321"
                  className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-latte"
                />
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                Địa chỉ nhận hàng
                <input
                  type="text"
                  value={activeOrder.deliveryInfo?.deliveryAddress || ''}
                  onChange={(e) => onUpdateDeliveryInfo({ deliveryAddress: e.target.value })}
                  placeholder="Số nhà, tên đường, quận..."
                  className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-latte"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                  Khoảng cách (km)
                  <div className="relative mt-1 flex items-center">
                    <input
                      type="number"
                      value={activeOrder.deliveryInfo?.distance || ''}
                      readOnly
                      placeholder="Auto"
                      className="h-9 w-full rounded-lg border border-line bg-beige/50 px-3 pr-10 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randDistance = Math.floor(Math.random() * 8) + 1; // 1-8km
                        const fee = randDistance * 5000;
                        onUpdateDeliveryInfo({
                          distance: randDistance,
                          deliveryFee: fee
                        });
                      }}
                      className="absolute right-1 top-1 h-7 rounded bg-coffee px-2 text-[10px] font-bold text-white hover:opacity-90 transition"
                    >
                      Tính
                    </button>
                  </div>
                </label>

                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                  Phí Ship (đ)
                  <input
                    type="number"
                    value={activeOrder.deliveryInfo?.deliveryFee || 0}
                    onChange={(e) => onUpdateDeliveryInfo({ deliveryFee: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-latte"
                  />
                </label>
              </div>

              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                Ghi chú giao hàng
                <input
                  type="text"
                  value={activeOrder.deliveryInfo?.note || ''}
                  onChange={(e) => onUpdateDeliveryInfo({ note: e.target.value })}
                  placeholder="Yêu cầu thêm..."
                  className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-latte"
                />
              </label>
            </div>
          </div>
        )}
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
        deliveryInfo={activeOrder.deliveryInfo}
        voucherCode={activeOrder.voucherCode}
        discountAmount={activeOrder.discountAmount}
        onSetVoucher={onSetVoucher}
        onClear={onClearOrder}
      />
    </aside>
  );
}
