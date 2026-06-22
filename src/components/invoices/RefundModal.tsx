import { Shield } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
}

export function RefundModal({ isOpen, onClose, invoiceId }: RefundModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-coffee/40 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-line">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-coffee mb-2">Xác thực Hoàn tiền</h3>
          <p className="text-muted text-sm mb-8 leading-relaxed">
            Vui lòng nhập mã OTP để tiếp tục hoàn tiền cho đơn hàng <span className="font-bold text-gold">{invoiceId}</span>
          </p>
          
          {/* Toggle */}
          <div className="inline-flex p-1 bg-beige rounded-xl mb-10 w-full">
            <button className="flex-1 py-3 rounded-lg font-bold text-xs transition-all bg-white shadow-sm text-coffee uppercase tracking-widest">Customer OTP</button>
            <button className="flex-1 py-3 rounded-lg font-bold text-xs transition-all text-muted hover:text-coffee uppercase tracking-widest">Admin OTP</button>
          </div>
          
          {/* OTP Input */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <input key={i} className="w-14 h-16 text-center text-2xl font-bold border-2 border-line rounded-xl focus:border-gold focus:ring-0 focus:outline-none bg-white transition-all" maxLength={1} type="text" />
            ))}
          </div>
          
          <p className="text-xs text-muted mb-10 font-medium">Gửi lại mã sau <span className="font-bold text-gold">60s</span></p>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="h-14 border border-line rounded-xl font-bold text-coffee hover:bg-beige transition-colors text-sm active:scale-95" onClick={onClose}>
              Hủy
            </button>
            <button className="h-14 bg-coffee text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all text-sm active:scale-95" onClick={onClose}>
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
