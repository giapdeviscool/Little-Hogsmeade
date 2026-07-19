import { useState, useEffect } from 'react';
import { Tag, Loader2, Search, CheckCircle } from 'lucide-react';
import { validateVoucherApi, getCustomerVouchersApi } from '@/api/voucher.api';

interface VoucherInputProps {
  orderSubtotal: number;
  customerId?: string | null;
  voucherCode?: string;
  onApplyVoucher: (voucherCode?: string, discountAmount?: number) => void;
}

export function VoucherInput({ orderSubtotal, customerId, voucherCode, onApplyVoucher }: VoucherInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState(voucherCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerVouchers, setCustomerVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  useEffect(() => {
    setCode(voucherCode || '');
  }, [voucherCode]);

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomerVouchers();
    }
  }, [isOpen, customerId]);

  const loadCustomerVouchers = async () => {
    if (!customerId) return;
    setLoadingVouchers(true);
    try {
      const res = await getCustomerVouchersApi(customerId);
      setCustomerVouchers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleValidate = async (voucherToApply: string = code) => {
    if (!voucherToApply.trim()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await validateVoucherApi({
        code: voucherToApply.trim(),
        orderSubtotal,
        customerId
      });
      
      if (res.data && res.data.isValid) {
        setSuccess(`Đã áp dụng giảm ₫${res.data.discountAmount.toLocaleString('vi-VN')}`);
        onApplyVoucher(voucherToApply.trim(), res.data.discountAmount);
        setIsOpen(false);
      } else {
        setError('Mã không hợp lệ');
        onApplyVoucher(undefined, 0);
      }
    } catch (err: any) {
      setError(err.message || 'Mã không hợp lệ hoặc chưa đủ điều kiện.');
      onApplyVoucher(undefined, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setSuccess('');
    setError('');
    onApplyVoucher(undefined, 0);
  };

  return (
    <div className="border border-line rounded-xl bg-white overflow-hidden text-sm mb-3">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-beige transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-latte" />
          <span className="font-semibold text-coffee">Khuyến mãi / Voucher</span>
        </div>
        <div className="flex items-center gap-2">
          {voucherCode ? (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
              {voucherCode}
            </span>
          ) : (
            <span className="text-xs text-muted">Chưa áp dụng</span>
          )}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-3 border-t border-line bg-cream space-y-3">
          {voucherCode && success && (
            <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">{success}</span>
              </div>
              <button 
                onClick={handleRemove}
                className="text-xs font-bold text-red-500 hover:text-red-700 uppercase"
              >
                Gỡ
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Nhập mã voucher..." 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-line text-xs outline-none focus:ring-2 focus:ring-latte uppercase font-bold"
              />
              <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
            </div>
            <button 
              onClick={() => handleValidate(code)}
              disabled={loading || !code.trim()}
              className="h-9 px-4 bg-coffee text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
            </button>
          </div>
          
          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          {customerId && (
            <div className="mt-3 border-t border-line border-dashed pt-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Voucher của khách</p>
              {loadingVouchers ? (
                <div className="flex justify-center p-2"><Loader2 className="w-4 h-4 animate-spin text-muted" /></div>
              ) : customerVouchers.length > 0 ? (
                <div className="space-y-2">
                  {customerVouchers.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-2 rounded border border-gold/30 bg-white">
                      <div>
                        <p className="font-bold text-coffee text-xs">{v.code}</p>
                        <p className="text-[10px] text-muted">{v.name}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setCode(v.code);
                          handleValidate(v.code);
                        }}
                        className="text-[10px] font-bold text-gold uppercase bg-gold/10 px-2 py-1 rounded hover:bg-gold hover:text-white transition-colors"
                      >
                        Dùng
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted italic">Không có voucher nào khả dụng.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
