import { useState, useEffect } from 'react';
import { X, Banknote, QrCode, CreditCard, Delete, Printer, RefreshCw, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  onConfirm: (method: 'cash' | 'qr', cashGiven?: number) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  onConfirm
}: PaymentModalProps) {
  const [method, setMethod] = useState<'cash' | 'qr' | 'card'>('cash');
  const [cashGivenStr, setCashGivenStr] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setCashGivenStr(totalAmount.toString());
    }
  }, [isOpen, totalAmount]);

  if (!isOpen) return null;

  const formatPrice = (val: number) => `₫${Math.round(val).toLocaleString('vi-VN')}`;
  
  const cashGiven = parseInt(cashGivenStr.replace(/\D/g, ''), 10) || 0;
  const changeDue = Math.max(0, cashGiven - totalAmount);

  const handleNumpad = (val: string) => {
    if (val === 'backspace') {
      setCashGivenStr(prev => prev.slice(0, -1));
    } else if (val === 'exact') {
      setCashGivenStr(totalAmount.toString());
    } else {
      setCashGivenStr(prev => prev + val);
    }
  };

  const handleQuickAdd = (amount: number) => {
    setCashGivenStr(amount.toString());
  };

  const handleConfirm = () => {
    if (method === 'cash') {
      if (cashGiven < totalAmount) {
        alert('Tiền khách đưa chưa đủ!');
        return;
      }
      onConfirm('cash', cashGiven);
    } else if (method === 'qr') {
      onConfirm('qr');
    }
  };

  return (
    <div className="fixed inset-0 bg-coffee/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-[1000px] h-[720px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-line animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-line flex justify-between items-center bg-cream">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest text-gold uppercase font-bold">HÓA ĐƠN {orderId.startsWith('#') ? orderId : `#${orderId}`}</span>
            <h2 className="text-2xl font-bold text-coffee">Tiến hành Thanh toán</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-line/50 rounded-full transition-colors">
            <X className="w-6 h-6 text-coffee" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Section */}
          <div className="w-1/3 border-r border-line bg-beige/50 p-6 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-line/80 text-center">
              <span className="text-xs tracking-widest text-muted uppercase font-bold block mb-2">Tổng tiền cần thu</span>
              <div className="font-price-display text-4xl font-bold text-coffee">{formatPrice(totalAmount)}</div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs tracking-widest text-muted uppercase font-bold">Phương thức</span>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setMethod('cash')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${method === 'cash' ? 'bg-cream border-coffee shadow-[0_0_0_1px_#4A3525]' : 'bg-white/50 border-line hover:bg-white'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center text-coffee">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-coffee">Tiền mặt</div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Cash Payment</div>
                  </div>
                </button>

                <button 
                  onClick={() => setMethod('qr')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${method === 'qr' ? 'bg-cream border-coffee shadow-[0_0_0_1px_#4A3525]' : 'bg-white/50 border-line hover:bg-white'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center text-coffee">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-coffee">Chuyển khoản / QR</div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Digital Transfer</div>
                  </div>
                </button>

                <button 
                  disabled
                  className="flex items-center gap-4 p-4 rounded-2xl border border-line bg-white/50 opacity-60 cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center text-coffee">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-coffee">Thẻ (Card)</div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Terminal Payment</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1 p-6 bg-white relative overflow-y-auto">
            
            {/* Cash UI */}
            {method === 'cash' && (
              <div className="h-full flex flex-col gap-6 animate-in fade-in">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest text-muted uppercase">Tiền khách đưa</label>
                    <div className="bg-cream p-4 rounded-2xl border-2 border-coffee flex items-center justify-between shadow-sm">
                      <input 
                        className="bg-transparent border-none focus:ring-0 font-price-display text-2xl font-bold text-coffee w-full text-right p-0" 
                        readOnly 
                        value={cashGiven.toLocaleString('vi-VN')}
                      />
                      <span className="text-xl ml-2 font-bold text-muted">₫</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest text-muted uppercase">Tiền thối (Change due)</label>
                    <div className="bg-beige/30 p-4 rounded-2xl border-2 border-dashed border-latte/40 flex items-center justify-between">
                      <div className="font-price-display text-2xl font-bold text-latte">{changeDue.toLocaleString('vi-VN')}</div>
                      <span className="text-xl font-bold ml-2 text-latte">₫</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 mt-4">
                  <span className="text-xs tracking-widest font-bold text-muted uppercase block mb-3">Gợi ý nhanh</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[50000, 100000, 200000, 500000].map(amount => (
                      <button 
                        key={amount}
                        onClick={() => handleQuickAdd(amount)}
                        className="bg-cream min-h-[64px] rounded-2xl border border-line flex flex-col items-center justify-center hover:bg-latte hover:text-white transition-colors active:scale-95"
                      >
                        <span className="text-lg font-bold">{amount.toLocaleString('vi-VN')}</span>
                        <span className="text-[10px] font-bold opacity-70">VNĐ</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleNumpad('backspace')}
                      className="bg-cream border border-line/80 h-14 rounded-2xl font-bold text-coffee flex items-center justify-center gap-2 hover:bg-line/50 transition-colors active:scale-95"
                    >
                      <Delete className="w-5 h-5" /> Xóa
                    </button>
                    <button 
                      onClick={() => handleNumpad('exact')}
                      className="bg-latte text-white h-14 rounded-2xl font-bold hover:brightness-95 shadow-sm active:scale-95 transition-all"
                    >
                      Tiền vừa đủ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QR UI */}
            {method === 'qr' && (
              <div className="h-full flex flex-col items-center justify-center gap-6 animate-in fade-in">
                <div className="bg-white p-8 rounded-3xl border border-line/80 shadow-lg relative group overflow-hidden">
                  <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 cursor-pointer">
                    <RefreshCw className="text-coffee w-10 h-10" />
                  </div>
                  <div className="w-64 h-64 bg-cream rounded-2xl flex items-center justify-center relative border border-line p-4">
                    {/* Placeholder for actual VietQR image. In a real app we'd construct the URL */}
                    <img 
                      className="w-full h-full object-contain" 
                      alt="VietQR code for transaction" 
                      src={`https://img.vietqr.io/image/970436-0123456789-compact2.jpg?amount=${totalAmount}&addInfo=Little%20Hogsmeade%20${orderId}&accountName=LITTLE%20HOGSMEADE`} 
                    />
                    <div className="absolute inset-0 border-2 border-gold/30 rounded-2xl animate-pulse pointer-events-none"></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-coffee">Quét mã để thanh toán</p>
                  <p className="text-sm text-muted mt-2">Vui lòng chờ khách xác nhận giao dịch trên ứng dụng</p>
                </div>
                <div className="flex items-center gap-3 bg-beige border border-line px-6 py-3 rounded-full">
                  <Loader2 className="text-latte animate-spin w-4 h-4" />
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Đang chờ tín hiệu từ ngân hàng...</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Action */}
        <div className="px-6 py-4 border-t border-line bg-cream flex gap-6 mt-auto">
          <button 
            onClick={onClose}
            className="flex-1 bg-white border border-line/80 text-muted font-bold text-lg h-16 rounded-2xl hover:bg-line/30 transition-colors active:scale-95"
          >
            Hủy & Quay lại
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-[2] bg-coffee text-white font-bold text-lg h-16 rounded-2xl shadow-lg shadow-coffee/10 flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]"
          >
            XÁC NHẬN & IN HÓA ĐƠN <Printer className="w-5 h-5 ml-2" />
          </button>
        </div>

      </div>
    </div>
  );
}
