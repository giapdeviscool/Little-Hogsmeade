import { CheckCircle2, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CheckoutSuccessModalProps {
  isOpen: boolean;
  orderId: string;
  totalAmount: string;
  paymentMethod?: string;
  onNewOrder: () => void;
  onPrint?: () => void;
}

export function CheckoutSuccessModal({
  isOpen,
  orderId,
  totalAmount,
  paymentMethod = 'Tiền mặt',
  onNewOrder,
  onPrint
}: CheckoutSuccessModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee/20 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-500 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-6 relative">
            <CheckCircle2 className={`text-gold w-12 h-12 transition-all duration-700 delay-150 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
            {isOpen && <div className="absolute inset-0 rounded-full border-2 border-gold animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>}
          </div>
          <h2 className="text-2xl font-bold text-coffee mb-2">Thanh toán thành công!</h2>
          <p className="text-muted font-bold tracking-widest uppercase text-xs mb-6">Mã đơn: {orderId.startsWith('#') ? orderId : `#${orderId}`}</p>
          <div className="w-full bg-beige rounded-xl p-4 mb-8 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Tổng cộng</span>
              <span className="font-price-display font-bold text-coffee text-lg">{totalAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Phương thức</span>
              <span className="font-bold text-coffee text-sm">{paymentMethod}</span>
            </div>
          </div>
          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={onNewOrder}
              className="w-full h-14 bg-coffee text-white rounded-xl font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
            >
              Đơn hàng mới
            </button>
            <button 
              onClick={onPrint}
              className="w-full h-14 bg-white border border-line text-coffee rounded-xl font-bold text-sm hover:bg-beige active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              In lại hóa đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
