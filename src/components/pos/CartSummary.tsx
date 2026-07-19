import type { CartItemType } from '@/pages/pos/index';
import { createOrder } from '@/api/order.api';
import { createDeliveryOrder } from '@/api/delivery.api';
import { useState } from 'react';
import { PaymentModal } from './PaymentModal';

interface CartSummaryProps {
  cartItems?: CartItemType[];
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
  customerId?: string | null;
  deliveryInfo?: {
    receiverName: string;
    receiverPhone: string;
    deliveryAddress: string;
    deliveryFee: number;
    distance?: number;
    note?: string;
  };
  onClear?: () => void;
}

export function CartSummary({
  cartItems = [],
  orderType = 'dine-in',
  customerId = null,
  deliveryInfo,
  onClear,
}: CartSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{isOpen: boolean, orderId: string, invoiceId: string, total: number} | null>(null);

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/\D/g, ''), 10) || 0;
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const base = parsePrice(item.price);
    const toppingsTotal = (item.toppings || []).reduce((sum, t) => sum + t.extraPrice * t.quantity, 0);
    return acc + (base + toppingsTotal) * item.quantity;
  }, 0);
  const discount = 0;
  const shippingFee = orderType === 'delivery' ? (deliveryInfo?.deliveryFee || 0) : 0;
  const total = subtotal - discount + shippingFee;

  const formatPrice = (val: number) => `₫${Math.round(val).toLocaleString('vi-VN')}`;

  const handleCheckoutClick = async () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống, không thể thanh toán');
      return;
    }
    
    setLoading(true);
    const items = cartItems.map((ci) => ({
      menuItemId: ci.id,
      unitPrice: parsePrice(ci.price),
      quantity: ci.quantity,
      toppings: (ci.toppings || []).map((t) => ({
        toppingId: t.toppingId,
        quantity: t.quantity,
        extraPrice: t.extraPrice,
      })),
    }));
    
    const payload = {
      branchId: 'default-branch-id',
      customerId: customerId || null,
      discountAmount: 0,
      taxAmount: 0,
      orderType,
      items,
    };
    
    try {
      const res = await createOrder(payload) as any;
      if (res && res.success) {
        setPaymentModalData({
          isOpen: true,
          orderId: res.order_id,
          invoiceId: res.invoice_id,
          total: res.total_amount || total
        });
      } else {
        const errMsg = (res?.error && (res.error.message || res.error)) || 'Tạo Đơn hàng thất bại';
        alert(`Tạo Đơn hàng thất bại: ${errMsg}`);
      }
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Có lỗi xảy ra khi tạo đơn: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (_method: 'cash' | 'qr') => {
    setPaymentModalData(null);
    if (onClear) onClear();
  };

  return (
    <div className="p-3 bg-cream border-t border-line mt-auto">
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex justify-between text-xs text-muted font-medium">
          <span>Tạm tính</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-xs text-red-600 font-bold">
            <span>Giảm giá</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between items-end mt-1.5 pt-1.5 border-t border-dashed border-coffee/10">
          <span className="font-bold text-sm text-coffee">Tổng cộng</span>
          <span className="text-lg font-bold text-coffee font-price-display">{formatPrice(total)}</span>
        </div>
      </div>
      <button
        className="w-full bg-gold hover:opacity-90 text-coffee h-10 rounded-lg font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-between px-4 border border-coffee/5"
        onClick={handleCheckoutClick}
        disabled={loading}
      >
        <span className="uppercase tracking-widest text-[10px]">{loading ? 'Đang tạo đơn...' : 'Thanh toán'}</span>
        <span className="font-price-display text-sm">{formatPrice(total)}</span>
      </button>


      <PaymentModal 
        isOpen={!!paymentModalData?.isOpen}
        onClose={() => setPaymentModalData(null)}
        orderId={paymentModalData?.orderId || ''}
        invoiceId={paymentModalData?.invoiceId || ''}
        totalAmount={paymentModalData?.total || total}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
