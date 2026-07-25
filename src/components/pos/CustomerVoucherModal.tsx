import { useState, useEffect } from 'react';
import { X, Tag, Search, Loader2, CheckCircle2, Ticket, AlertCircle } from 'lucide-react';
import { getCustomerVouchersApi, validateVoucherApi } from '@/api/voucher.api';

export interface CustomerVoucher {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expireDate?: string;
  isActive?: boolean;
}

interface CustomerVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  customerName?: string;
  orderSubtotal: number;
  currentVoucherCode?: string;
  onApplyVoucher: (voucherCode?: string, discountAmount?: number, giftProductId?: string, giftProduct?: any) => void;
}

export function CustomerVoucherModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  orderSubtotal,
  currentVoucherCode,
  onApplyVoucher
}: CustomerVoucherModalProps) {
  const [manualCode, setManualCode] = useState(currentVoucherCode || '');
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [validating, setValidating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setError(null);
      setSuccessMsg(null);
      setManualCode(currentVoucherCode || '');
      if (customerId) {
        loadVouchers();
      } else {
        setVouchers([]);
      }
    }
  }, [isOpen, customerId, currentVoucherCode]);

  const loadVouchers = async () => {
    if (!customerId) return;
    setLoadingVouchers(true);
    try {
      const res = await getCustomerVouchersApi(customerId);
      let list: CustomerVoucher[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.items)) {
        list = res.items;
      } else if (Array.isArray(res?.data?.items)) {
        list = res.data.items;
      }

      setVouchers(list);
    } catch (err: any) {
      console.warn('API getCustomerVouchersApi error:', err);
      setVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleApplyCode = async (codeToApply: string) => {
    const trimmed = codeToApply.trim().toUpperCase();
    if (!trimmed) return;

    setValidating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await validateVoucherApi({
        code: trimmed,
        orderSubtotal,
        customerId
      });

      if (res.data && res.data.isValid) {
        const discount = res.data.discountAmount || 0;
        setSuccessMsg(`Đã áp dụng mã ${trimmed} (Giảm ₫${discount.toLocaleString('vi-VN')})`);
        onApplyVoucher(trimmed, discount, res.data.giftProductId, res.data.giftProduct);
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setError('Mã không hợp lệ hoặc chưa đủ điều kiện.');
        onApplyVoucher(undefined, 0);
      }
    } catch (err: any) {
      setError(err.message || 'Mã không hợp lệ hoặc chưa đủ điều kiện áp dụng.');
      onApplyVoucher(undefined, 0);
    } finally {
      setValidating(false);
    }
  };

  const handleRemove = () => {
    setManualCode('');
    setError(null);
    setSuccessMsg(null);
    onApplyVoucher(undefined, 0);
  };

  if (!isOpen) return null;

  const filteredVouchers = vouchers.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (v.code && v.code.toLowerCase().includes(q)) ||
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.description && v.description.toLowerCase().includes(q))
    );
  });

  const formatCurrency = (val?: number) => {
    const num = val || 0;
    return `₫${num.toLocaleString('vi-VN')}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[rgba(74,53,37,0.12)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-sans">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(74,53,37,0.08)] bg-cream flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gold/15 text-gold rounded-xl flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-coffee">Khuyến Mãi & Voucher</h3>
              <p className="text-xs text-muted">
                {customerName ? `Khách hàng: ${customerName}` : 'Chọn hoặc nhập mã ưu đãi cho đơn hàng'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-coffee hover:bg-white rounded-full transition-colors border border-transparent hover:border-line"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manual Voucher Entry Card inside Modal */}
        <div className="p-4 bg-white border-b border-line space-y-2.5">
          {currentVoucherCode && (
            <div className="flex items-center justify-between bg-green-50 text-green-700 px-3.5 py-2 rounded-xl border border-green-200 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span className="font-semibold">
                  Mã <strong className="uppercase">{currentVoucherCode}</strong> đang được áp dụng
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="font-bold text-red-600 hover:text-red-800 uppercase text-[11px] tracking-wider bg-white px-2 py-0.5 rounded border border-red-200"
              >
                Gỡ bỏ
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Nhập mã voucher..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-line text-xs outline-none focus:ring-2 focus:ring-latte uppercase font-bold bg-beige/30"
              />
              <Tag className="w-4 h-4 text-muted absolute left-3 top-3" />
            </div>
            <button
              type="button"
              onClick={() => handleApplyCode(manualCode)}
              disabled={validating || !manualCode.trim()}
              className="h-10 px-5 bg-coffee text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
            >
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium px-1">{error}</p>
          )}
          {successMsg && (
            <p className="text-xs text-green-600 font-medium px-1">{successMsg}</p>
          )}
        </div>

        {/* Search Bar for Customer Vouchers */}
        {customerId && vouchers.length > 0 && (
          <div className="px-6 pt-3 pb-2 border-b border-line bg-cream/40 flex items-center justify-between">
            <span className="text-xs font-bold text-coffee uppercase tracking-wider">
              Voucher của khách ({vouchers.length})
            </span>
            <div className="relative w-1/2">
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã voucher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-[11px] bg-white border border-line rounded-lg outline-none focus:border-coffee"
              />
            </div>
          </div>
        )}

        {/* Scrollable List Container */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-3 bg-cream/20">
          {!customerId ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="font-bold text-coffee text-xs">Chưa chọn khách hàng</p>
              <p className="text-[11px] text-muted max-w-xs mt-1">
                Chọn hoặc tìm kiếm SĐT khách hàng ở khung tạo đơn để xem danh sách voucher tích điểm của khách.
              </p>
            </div>
          ) : loadingVouchers ? (
            <div className="py-10 flex flex-col items-center justify-center text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-gold mb-2" />
              <span className="text-xs font-medium">Đang tải danh sách voucher khách hàng...</span>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-cream text-muted flex items-center justify-center mb-2.5">
                <Ticket className="w-5 h-5" />
              </div>
              <p className="font-bold text-coffee text-xs">Khách hàng hiện không có voucher nào khả dụng</p>
              <p className="text-[11px] text-muted max-w-xs mt-1">
                {searchQuery ? 'Không có voucher phù hợp với từ khóa.' : 'Khách hàng này chưa có mã voucher ưu đãi nào.'}
              </p>
            </div>
          ) : (
            filteredVouchers.map((v) => {
              const isApplied = currentVoucherCode && currentVoucherCode.toUpperCase() === v.code.toUpperCase();
              const minVal = v.minOrderValue || 0;
              const isEligible = orderSubtotal >= minVal;

              return (
                <div
                  key={v.id || v.code}
                  className={`relative flex items-stretch rounded-2xl border transition-all overflow-hidden bg-white shadow-sm ${isApplied
                    ? 'border-green-500 ring-2 ring-green-500/20'
                    : isEligible
                      ? 'border-line hover:border-gold/60 hover:shadow-md'
                      : 'border-line/60 opacity-80 bg-gray-50/50'
                    }`}
                >
                  {/* Left Ticket Stub */}
                  <div className="w-24 bg-gradient-to-br from-coffee to-[#362619] p-3 flex flex-col items-center justify-center text-white relative shrink-0">
                    <Tag className="w-4 h-4 text-gold mb-1" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-center break-all text-gold">
                      {v.code}
                    </span>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-cream/30 rounded-full border border-line" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-cream/30 rounded-full border border-line" />
                  </div>

                  {/* Voucher Info */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-coffee text-xs leading-snug">{v.name}</h4>
                        {isApplied && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            Đã chọn
                          </span>
                        )}
                      </div>

                      {v.description && (
                        <p className="text-[11px] text-muted mt-1 leading-relaxed line-clamp-2">
                          {v.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-line/60 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-muted space-y-0.5">
                        <p>
                          Đơn tối thiểu:{' '}
                          <span className={orderSubtotal < minVal ? 'text-red-500 font-bold' : 'font-semibold text-coffee'}>
                            {formatCurrency(minVal)}
                          </span>
                        </p>
                        {v.expireDate && <p>HSD: {formatDate(v.expireDate)}</p>}
                      </div>

                      <div>
                        {isApplied ? (
                          <button
                            type="button"
                            onClick={handleRemove}
                            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                          >
                            Gỡ bỏ
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApplyCode(v.code)}
                            disabled={!isEligible || validating}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm ${isEligible
                              ? 'bg-gold text-coffee hover:bg-gold/90 active:scale-95'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              }`}
                          >
                            {isEligible ? 'Dùng ngay' : 'Chưa đủ đ/k'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-line bg-white flex items-center justify-between text-xs text-muted">
          <span>Tạm tính đơn: <strong className="text-coffee">{formatCurrency(orderSubtotal)}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-beige hover:bg-line text-coffee font-semibold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
