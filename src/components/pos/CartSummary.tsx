import type { CartItemType } from '@/pages/pos/index';
import { createOrder } from '@/api/order.api';
import { useState } from 'react';
import { CheckoutSuccessModal } from './CheckoutSuccessModal';
import { PaymentModal } from './PaymentModal';

interface CartSummaryProps {
  cartItems?: CartItemType[];
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
  customerId?: string | null;
  onClear?: () => void;
}

export function CartSummary({ cartItems = [], orderType = 'dine-in', customerId = null, onClear }: CartSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{isOpen: boolean, orderId: string, total: string} | null>(null);

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/\D/g, ''), 10) || 0;
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (parsePrice(item.price) * item.quantity), 0);
  const discount = 0;
  const total = subtotal - discount;

  const formatPrice = (val: number) => `₫${Math.round(val).toLocaleString('vi-VN')}`;

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống, không thể thanh toán');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async (method: 'cash' | 'qr', _cashGiven?: number) => {
    setIsPaymentModalOpen(false);
    setLoading(true);
    const items = cartItems.map((ci) => ({
      menuItemId: ci.id,
      unitPrice: parsePrice(ci.price),
      quantity: ci.quantity,
      toppings: [] as any[],
    }));
    const payload = {
      branchId: 'default-branch-id',
      customerId: customerId || null,
      paymentMethod: method,
      discountAmount: 0,
      taxAmount: 0,
      orderType,
      items,
      // We could optionally send cashGiven to backend if needed
      // cashGiven: method === 'cash' ? cashGiven : undefined
    };
    try {
      const res = await createOrder(payload);
      if (res && !res.error) {
        const orderId = res?.data?.id || `LH-${Math.floor(1000 + Math.random() * 9000)}`;
        setSuccessModalData({
          isOpen: true,
          orderId,
          total: formatPrice(total)
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

  return (
    <div className="p-4 bg-cream border-t border-line mt-auto">
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="flex justify-between text-sm text-muted font-medium">
          <span>Tạm tính</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-red-600 font-bold">
            <span>Giảm giá</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between items-end mt-2 pt-2 border-t border-dashed border-coffee/10">
          <span className="font-bold text-lg text-coffee">Tổng cộng</span>
          <span className="text-2xl font-bold text-coffee font-price-display">{formatPrice(total)}</span>
        </div>
      </div>
      {/* <div className="grid grid-cols-3 gap-2 mb-3">
        <button className="h-11 bg-white border border-line rounded-xl font-bold text-xs text-coffee hover:bg-beige transition-all flex flex-col items-center justify-center gap-1 shadow-sm">
          <Save className="w-4 h-4" /> Lưu nháp
        </button>
        <button className="h-11 bg-white border border-line rounded-xl font-bold text-xs text-coffee hover:bg-beige transition-all flex flex-col items-center justify-center gap-1 shadow-sm">
          <FileText className="w-4 h-4" /> Ghi chú
        </button>
        <button className="h-11 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:opacity-80 transition-all flex flex-col items-center justify-center gap-1 shadow-sm">
          <Ban className="w-4 h-4" /> Hủy đơn
        </button>
      </div> */}
      <button
        className="w-full bg-gold hover:opacity-90 text-coffee h-13 rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-between px-5 border border-coffee/5"
        onClick={handleCheckoutClick}
        disabled={loading}
      >
        <span className="uppercase tracking-widest text-xs">Thanh toán</span>
        <span className="font-price-display text-xl">{formatPrice(total)}</span>
      </button>

      <CheckoutSuccessModal 
        isOpen={!!successModalData?.isOpen}
        orderId={successModalData?.orderId || ''}
        totalAmount={successModalData?.total || ''}
        onNewOrder={() => {
          setSuccessModalData(null);
          if (onClear) onClear();
        }}
        onPrint={() => {
          // Just an example action
          alert('Đang in hóa đơn...');
        }}
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderId="MỚI"
        totalAmount={total}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}
