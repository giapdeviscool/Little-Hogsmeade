import { useState } from 'react';
import { Tag, Ticket, ChevronRight } from 'lucide-react';
import { CustomerVoucherModal } from './CustomerVoucherModal';

interface VoucherInputProps {
  orderSubtotal: number;
  customerId?: string | null;
  customerName?: string;
  voucherCode?: string;
  onApplyVoucher: (voucherCode?: string, discountAmount?: number) => void;
}

export function VoucherInput({
  orderSubtotal,
  customerId,
  customerName,
  voucherCode,
  onApplyVoucher,
}: VoucherInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasCustomer = Boolean(customerId);

  return (
    <>
      <div className="border border-line rounded-xl bg-white overflow-hidden text-sm mb-3 shadow-sm">
        <button
          type="button"
          onClick={() => {
            if (hasCustomer) {
              setIsModalOpen(true);
            }
          }}
          disabled={!hasCustomer}
          title={!hasCustomer ? "Vui lòng chọn khách hàng trước để áp dụng voucher" : "Khuyến mãi / Voucher"}
          className={`w-full flex items-center justify-between p-3 transition-colors text-left ${
            hasCustomer
              ? "cursor-pointer hover:bg-beige"
              : "cursor-not-allowed opacity-60 bg-gray-50/70"
          }`}
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-latte" />
            <span className="font-semibold text-coffee">Khuyến mãi / Voucher</span>
          </div>

          <div className="flex items-center gap-1.5">
            {voucherCode ? (
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-green-600" />
                {voucherCode}
              </span>
            ) : (
              <span className="text-xs text-muted flex items-center gap-1 font-medium">
                {hasCustomer ? "Chọn / Nhập mã" : "Chưa chọn khách"}
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Full Voucher & Customer Promo Popup Modal */}
      {hasCustomer && (
        <CustomerVoucherModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customerId={customerId || null}
          customerName={customerName}
          orderSubtotal={orderSubtotal}
          currentVoucherCode={voucherCode}
          onApplyVoucher={onApplyVoucher}
        />
      )}
    </>
  );
}
