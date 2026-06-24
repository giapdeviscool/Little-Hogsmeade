import { useState, useEffect } from 'react';
import { getInvoice } from '../../api/invoice.api';

interface LedgerInvoiceDetailProps {
  invoiceId: string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}

export function LedgerInvoiceDetail({
  invoiceId,
  formatCurrency,
  formatDate
}: LedgerInvoiceDetailProps) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getInvoice(invoiceId);
        if (active) {
          if (response.success) {
            setDetail(response.data);
          } else {
            setError("Không tải được chi tiết hóa đơn.");
          }
        }
      } catch (err) {
        if (active) {
          setError("Có lỗi xảy ra khi kết nối API.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      active = false;
    };
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee"></div>
        <span className="ml-3 text-sm text-muted">Đang tải chi tiết hóa đơn...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-sm text-[#c25a5a] font-medium">
        {error}
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  const cashierName = detail.order?.employee?.fullName || 'Hệ thống';
  const cashierCode = detail.order?.employeeId ? detail.order.employeeId.slice(-6) : '';
  const printedTime = detail.printedAt ? formatDate(detail.printedAt) : formatDate(detail.createdAt);
  const orderItems = detail.order?.orderItems || [];
  const customerName = detail.order?.customer?.fullName || detail.customer?.fullName || 'Khách vãng lai';
  const customerPhone = detail.order?.customer?.phone || detail.customer?.phone || '—';

  return (
    <div className="bg-white rounded-2xl border border-line p-6 shadow-sm flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-12">
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-coffee flex items-center gap-2 mb-6 uppercase tracking-widest">
          <span className="material-symbols-outlined text-lg">receipt_long</span> Chi tiết Hóa đơn #{invoiceId.substring(invoiceId.length - 6)}
        </h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="py-2">Sản phẩm</th>
                <th className="py-2 text-center">SL</th>
                <th className="py-2 text-right">Đơn giá</th>
                <th className="py-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {orderItems.map((item: any, idx: number) => {
                const itemName = item.menuItem?.name || 'Unknown Item';
                return (
                  <tr key={idx} className="text-coffee">
                    <td className="py-3 font-medium">{itemName}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                  </tr>
                );
              })}
              {orderItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-muted">
                    Không có thông tin chi tiết món ăn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-line/60 pt-4">
          <div className="flex justify-between">
            <span className="text-muted text-xs font-semibold uppercase tracking-wider">Tạm tính</span>
            <span className="text-coffee font-medium">{formatCurrency(detail.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted text-xs font-semibold uppercase tracking-wider">Điểm tích lũy</span>
            <span className="text-coffee font-medium">+{detail.pointsEarned || 0} điểm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted text-xs font-semibold uppercase tracking-wider">Giảm giá</span>
            <span className="text-coffee font-medium">-{formatCurrency(detail.discountAmount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted text-xs font-semibold uppercase tracking-wider">Điểm đã dùng</span>
            <span className="text-coffee font-medium">-{detail.pointsUsed || 0} điểm</span>
          </div>
          <div className="flex justify-between col-span-2 border-t border-line/40 pt-2">
            <span className="text-coffee font-bold text-base">Tổng cộng</span>
            <span className="text-coffee font-bold text-lg">{formatCurrency(detail.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-80 flex flex-col justify-between p-6 bg-cream rounded-xl border border-line">
        <div>
          <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Thông tin bổ sung</h5>
          <div className="space-y-4 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted font-medium uppercase tracking-wider text-xs">Thu ngân</span>
              <span className="text-coffee font-semibold">{cashierName} {cashierCode ? `(${cashierCode})` : ''}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted font-medium uppercase tracking-wider text-xs">Thời gian in</span>
              <span className="text-coffee">{printedTime}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted font-medium uppercase tracking-wider text-xs">ID Giao dịch (Full)</span>
              <span className="font-mono text-[#5e4a3b] break-all">{invoiceId}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-line/60 pt-4">
          <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Khách hàng</h5>
          <div className="space-y-4 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted font-medium uppercase tracking-wider text-xs">Họ và tên</span>
              <span className="text-coffee font-semibold">{customerName}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted font-medium uppercase tracking-wider text-xs">Số điện thoại</span>
              <span className="text-coffee font-semibold">{customerPhone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
