import { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { verify2FA } from '@/api/otp.api';
import { checkCustomerPin } from '@/api/customer.api';
import { updateOrderStatus } from '@/api/order.api';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any;
  onSuccess?: () => void;
}

export function RefundModal({ isOpen, onClose, invoiceData, onSuccess }: RefundModalProps) {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('admin');
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const customerId = invoiceData?.order?.customerId;
  const orderId = invoiceData?.order?.id;
  const displayId = invoiceData?.order?.id ? invoiceData.order.id.substring(invoiceData.order.id.length - 8) : (invoiceData?.id ? invoiceData.id.substring(invoiceData.id.length - 8) : '');

  useEffect(() => {
    if (isOpen) {
      setOtpCode(Array(6).fill(''));
      setErrorMsg('');
      if (customerId) {
        setActiveTab('customer');
      } else {
        setActiveTab('admin');
      }
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const handleOtpChange = (value: string, idx: number) => {
    const val = value.replace(/[^0-9]/g, '');
    const newOtp = [...otpCode];
    newOtp[idx] = val.slice(-1);
    setOtpCode(newOtp);
    setErrorMsg('');

    if (val && idx < 5) {
      const nextInput = document.getElementById(`refund-otp-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
      const prevInput = document.getElementById(`refund-otp-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handleConfirm = async () => {
    const code = otpCode.join('');
    if (code.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (activeTab === 'admin') {
        const otpRes = await verify2FA(code);
        if (!otpRes || !otpRes.success) {
          throw new Error('Mã OTP quản lý không hợp lệ.');
        }
      } else if (activeTab === 'customer') {
        if (!customerId) throw new Error('Không tìm thấy thông tin khách hàng.');
        const pinRes = await checkCustomerPin({ customerId, pin: code });
        if (pinRes && (pinRes as any).success === false) {
          throw new Error((pinRes as any).message || 'Xác thực mã PIN thất bại.');
        }
      }

      if (orderId) {
        await updateOrderStatus(orderId, 'refunded');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error('Lỗi dữ liệu: Không có mã đơn hàng.');
      }
    } catch (err: any) {
      const msg = err.error || err.message || 'Xác thực thất bại. Vui lòng kiểm tra lại.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-coffee/40 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-line">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-coffee mb-2">Xác thực Hoàn tiền</h3>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Vui lòng xác thực bằng mã PIN hoặc OTP quản lý để tiếp tục hoàn tiền cho đơn hàng <span className="font-bold text-gold">#{displayId}</span>
          </p>
          
          {/* Toggle */}
          <div className="inline-flex p-1 bg-beige rounded-xl mb-6 w-full">
            {customerId && (
              <button 
                onClick={() => { setActiveTab('customer'); setOtpCode(Array(6).fill('')); setErrorMsg(''); }}
                className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all uppercase tracking-widest ${activeTab === 'customer' ? 'bg-white shadow-sm text-coffee' : 'text-muted hover:text-coffee'}`}
              >
                Customer PIN
              </button>
            )}
            <button 
              onClick={() => { setActiveTab('admin'); setOtpCode(Array(6).fill('')); setErrorMsg(''); }}
              className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all uppercase tracking-widest ${activeTab === 'admin' ? 'bg-white shadow-sm text-coffee' : 'text-muted hover:text-coffee'}`}
            >
              Admin OTP
            </button>
          </div>
          
          <p className="text-xs text-muted mb-4 font-medium uppercase tracking-widest">
            {activeTab === 'customer' ? 'Nhập mã PIN của khách hàng' : 'Nhập mã Authenticator (Quản lý)'}
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-4">
            {otpCode.map((digit, idx) => (
              <input 
                key={idx} 
                id={`refund-otp-${idx}`}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-line rounded-xl focus:border-gold focus:ring-0 focus:outline-none bg-white transition-all" 
                maxLength={1} 
                type={activeTab === 'customer' ? "password" : "text"} 
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, idx)}
                onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                disabled={loading}
              />
            ))}
          </div>
          
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-xl">
              {errorMsg}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button disabled={loading} className="h-14 border border-line rounded-xl font-bold text-coffee hover:bg-beige transition-colors text-sm active:scale-95 disabled:opacity-50" onClick={onClose}>
              Hủy
            </button>
            <button disabled={loading || otpCode.join('').length < 6} className="h-14 bg-coffee text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all text-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50" onClick={handleConfirm}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
