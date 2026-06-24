import { useState, useEffect } from 'react';
import { X, Banknote, QrCode, CreditCard, Delete, Printer, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { getQrIntent, settleCashPayment } from '@/api/payment.api';
import { io } from 'socket.io-client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  invoiceId?: string;
  totalAmount: number;
  onSuccess: (method: 'cash' | 'qr') => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  orderId,
  invoiceId,
  totalAmount,
  onSuccess
}: PaymentModalProps) {
  const [method, setMethod] = useState<'cash' | 'qr' | 'card'>('cash');
  const [cashGivenStr, setCashGivenStr] = useState<string>('');
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success'>('pending');
  const [cashSettling, setCashSettling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setCashGivenStr(totalAmount.toString());
      setQrCodeUrl('');
      setTransactionRef('');
      setPaymentStatus('pending');
    }
  }, [isOpen, totalAmount]);

  useEffect(() => {
    if (method === 'qr' && isOpen && invoiceId && !qrCodeUrl) {
      setQrLoading(true);
      getQrIntent({ invoice_id: invoiceId, amount: totalAmount })
        .then(res => {
          if (res?.data?.qrCodeUrl) {
            setQrCodeUrl(res.data.qrCodeUrl);
            setTransactionRef(res.data.transactionRef);
          }
        })
        .catch(err => {
          console.error("Failed to fetch QR intent:", err);
        })
        .finally(() => setQrLoading(false));
    }
  }, [method, isOpen, invoiceId, totalAmount, qrCodeUrl]);

  useEffect(() => {
    if (!isOpen || !invoiceId || method !== 'qr') return;

    const socket = io(); // Connect to default host which is proxied by Vite

    socket.on(`payment_success_${invoiceId}`, () => {
      setPaymentStatus('success');
      setTimeout(() => {
        onSuccess('qr');
      }, 1500);
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, invoiceId, method, onSuccess]);

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

  const handleConfirmCash = async () => {
    if (cashGiven < totalAmount) {
      alert('Tiền khách đưa chưa đủ!');
      return;
    }
    
    if (!invoiceId) return;

    setCashSettling(true);
    try {
      await settleCashPayment({ invoice_id: invoiceId, cash_received: cashGiven });
      // Proceed on 200 OK (no thrown error from httpClient)
      setPaymentStatus('success');
      setTimeout(() => {
        onSuccess('cash');
      }, 1500);
    } catch (e) {
      console.error('Failed to settle cash payment:', e);
      alert('Lỗi kết nối khi xác nhận tiền mặt!');
    } finally {
      setCashSettling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-coffee/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[800px] h-[550px] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-line animate-in fade-in zoom-in-95 duration-200 relative">
        
        {paymentStatus === 'success' && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[70] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-coffee mb-2">Thanh toán thành công!</h2>
            <p className="text-muted">Hệ thống đang hoàn tất giao dịch...</p>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-line flex justify-between items-center bg-cream">
          <div className="flex flex-col">
            <span className="text-[9px] tracking-widest text-gold uppercase font-bold">
              {invoiceId ? `INVOICE #${invoiceId.slice(-6)}` : `HÓA ĐƠN ${orderId.startsWith('#') ? orderId : `#${orderId}`}`}
            </span>
            <h2 className="text-lg font-bold text-coffee">Tiến hành Thanh toán</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-line/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-coffee" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Section */}
          <div className="w-1/3 border-r border-line bg-beige/50 p-4.5 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-line/80 text-center">
              <span className="text-[10px] tracking-widest text-muted uppercase font-bold block mb-1">Tổng tiền cần thu</span>
              <div className="font-price-display text-2xl font-bold text-coffee">{formatPrice(totalAmount)}</div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] tracking-widest text-muted uppercase font-bold">Phương thức</span>
              <div className="grid grid-cols-1 gap-2.5">
                <button 
                  onClick={() => setMethod('cash')}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${method === 'cash' ? 'bg-cream border-coffee shadow-[0_0_0_1px_#4A3525]' : 'bg-white/50 border-line hover:bg-white'}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-beige flex items-center justify-center text-coffee">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-coffee">Tiền mặt</div>
                    <div className="text-[9px] font-bold text-muted uppercase tracking-wider">Cash Payment</div>
                  </div>
                </button>

                <button 
                  onClick={() => setMethod('qr')}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${method === 'qr' ? 'bg-cream border-coffee shadow-[0_0_0_1px_#4A3525]' : 'bg-white/50 border-line hover:bg-white'}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-beige flex items-center justify-center text-coffee">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-coffee">Chuyển khoản / QR</div>
                    <div className="text-[9px] font-bold text-muted uppercase tracking-wider">Digital Transfer</div>
                  </div>
                </button>

                <button 
                  disabled
                  className="flex items-center gap-3 p-3 rounded-xl border border-line bg-white/50 opacity-60 cursor-not-allowed"
                >
                  <div className="w-9 h-9 rounded-lg bg-beige flex items-center justify-center text-coffee">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-coffee">Thẻ (Card)</div>
                    <div className="text-[9px] font-bold text-muted uppercase tracking-wider">Terminal Payment</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1 p-4.5 bg-white relative overflow-y-auto">
            
            {/* Cash UI */}
            {method === 'cash' && (
              <div className="h-full flex flex-col gap-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-muted uppercase">Tiền khách đưa</label>
                    <div className="bg-cream p-3 rounded-xl border border-coffee flex items-center justify-between shadow-sm">
                      <input 
                        className="bg-transparent border-none focus:ring-0 font-price-display text-lg font-bold text-coffee w-full text-right p-0 outline-none" 
                        readOnly 
                        value={cashGiven.toLocaleString('vi-VN')}
                      />
                      <span className="text-base ml-1.5 font-bold text-muted">₫</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-muted uppercase">Tiền thối (Change due)</label>
                    <div className="bg-beige/30 p-3 rounded-xl border border-dashed border-latte/40 flex items-center justify-between">
                      <div className="font-price-display text-lg font-bold text-latte">{changeDue.toLocaleString('vi-VN')}</div>
                      <span className="text-base font-bold ml-1.5 text-latte">₫</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 mt-3">
                  <span className="text-[10px] tracking-widest font-bold text-muted uppercase block mb-2">Gợi ý nhanh</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[50000, 100000, 200000, 500000].map(amount => (
                      <button 
                        key={amount}
                        onClick={() => handleQuickAdd(amount)}
                        className="bg-cream min-h-[50px] rounded-xl border border-line flex flex-col items-center justify-center hover:bg-latte hover:text-white transition-colors active:scale-95"
                      >
                        <span className="text-sm font-bold">{amount.toLocaleString('vi-VN')}</span>
                        <span className="text-[9px] font-bold opacity-70">VNĐ</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleNumpad('backspace')}
                      className="bg-cream border border-line/80 h-11 rounded-xl font-bold text-sm text-coffee flex items-center justify-center gap-1.5 hover:bg-line/50 transition-colors active:scale-95"
                    >
                      <Delete className="w-4 h-4" /> Xóa
                    </button>
                    <button 
                      onClick={() => handleNumpad('exact')}
                      className="bg-latte text-white h-11 rounded-xl font-bold text-sm hover:brightness-95 shadow-sm active:scale-95 transition-all"
                    >
                      Tiền vừa đủ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QR UI */}
            {method === 'qr' && (
              <div className="h-full flex flex-col items-center justify-center gap-4 animate-in fade-in">
                {qrLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-latte animate-spin" />
                    <p className="text-sm text-muted">Đang tạo mã VietQR...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-5 rounded-2xl border border-line/80 shadow-lg relative group overflow-hidden">
                      <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 cursor-pointer">
                        <RefreshCw className="text-coffee w-8 h-8" />
                      </div>
                      <div className="w-48 h-48 bg-cream rounded-xl flex items-center justify-center relative border border-line p-3">
                        {qrCodeUrl ? (
                           <img 
                            className="w-full h-full object-contain mix-blend-multiply" 
                            alt="VietQR code for transaction" 
                            src={qrCodeUrl} 
                          />
                        ) : (
                           <div className="text-sm text-muted text-center">Không thể tải QR</div>
                        )}
                        <div className="absolute inset-0 border-2 border-gold/30 rounded-xl animate-pulse pointer-events-none"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-coffee">Quét mã để thanh toán</p>
                      <p className="text-xs text-muted mt-1.5">Mã giao dịch: <strong className="text-coffee">{transactionRef || 'Đang chờ...'}</strong></p>
                    </div>
                    <div className="flex items-center gap-2 bg-beige border border-line px-4.5 py-2.5 rounded-full mt-2">
                      <Loader2 className="text-latte animate-spin w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Đang chờ tín hiệu từ ngân hàng...</span>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer Action */}
        <div className="px-5 py-3 border-t border-line bg-cream flex gap-4 mt-auto z-10">
          <button 
            onClick={onClose}
            className="flex-1 bg-white border border-line/80 text-muted font-bold text-sm h-11 rounded-xl hover:bg-line/30 transition-colors active:scale-95"
          >
            Hủy & Quay lại
          </button>
          {method === 'cash' && (
            <button 
              onClick={handleConfirmCash}
              disabled={cashGiven < totalAmount || cashSettling}
              className={`flex-[2] text-white font-bold text-sm h-11 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all ${
                cashGiven < totalAmount || cashSettling 
                  ? 'bg-line cursor-not-allowed text-muted opacity-70' 
                  : 'bg-coffee shadow-coffee/10 hover:brightness-110 active:scale-[0.98]'
              }`}
            >
              {cashSettling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'XÁC NHẬN & IN HÓA ĐƠN'}
              {!cashSettling && <Printer className="w-4 h-4 ml-1.5" />}
            </button>
          )}
          {method === 'qr' && (
            <button 
              disabled
              className="flex-[2] bg-line text-muted font-bold text-sm h-11 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              CHỜ KHÁCH THANH TOÁN
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
