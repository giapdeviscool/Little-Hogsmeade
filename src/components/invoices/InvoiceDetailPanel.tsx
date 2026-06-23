import { Star, Printer, RotateCcw, X, Loader2, AlertCircle } from 'lucide-react';
import type { Invoice } from '@/components/invoices/InvoiceTable';
import { useState, useEffect } from 'react';
import { getInvoice } from '@/api/invoice.api';

interface InvoiceDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefund: () => void;
  invoice: Invoice | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export function InvoiceDetailPanel({ isOpen, onClose, onRefund, invoice }: InvoiceDetailPanelProps) {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !invoice) return;

    const fetchInvoiceData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const idToFetch = invoice.originalInvoiceId || invoice.id;
        const response = await getInvoice(idToFetch);
        if (response.error) {
          setError({ status: response.status || 500, message: response.error.message || 'Error fetching invoice' });
        } else {
          setInvoiceData(response.data);
        }
      } catch (err: any) {
        setError({ status: 500, message: err.message || 'An unexpected error occurred' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceData();
  }, [isOpen, invoice]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="text-muted text-sm font-medium">Đang tải thông tin đơn hàng...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="text-xl font-bold text-coffee">
            {error.status === 404 ? '404 - Invoice Not Found' : 'Không thể tải đơn hàng'}
          </h3>
          <p className="text-muted text-sm">{error.message}</p>
        </div>
      );
    }

    if (!invoiceData) {
      return null;
    }

    const { order, payments = [] } = invoiceData;

    return (
      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        <div className="p-6 rounded-2xl bg-beige/40 border border-line">
          <div className="flex items-center gap-3 mb-5">
            <Star className="w-5 h-5 text-gold fill-gold" />
            <span className="font-bold text-coffee uppercase tracking-wider text-sm">Thông tin Khách hàng</span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Khách hàng</p>
              <p className="font-bold text-coffee">
                {order?.customer ? order.customer.fullName : 'Khách vãng lai'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Số điện thoại</p>
              <p className="font-bold text-coffee">
                {order?.customer?.phone ? order.customer.phone : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-[10px] font-bold text-muted uppercase mb-6 tracking-widest">Danh sách món ăn</h4>
          <div className="space-y-6">
            {order?.orderItems?.map((item: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-coffee">{item.menuItem?.name || 'Sản phẩm'}</p>
                    <p className="text-xs text-muted mt-1">
                      x{item.quantity} @ {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold text-coffee">{formatCurrency(item.subtotal)}</span>
                </div>
                {item.orderItemToppings && item.orderItemToppings.length > 0 && (
                  <div className="mt-2 pl-4 space-y-2 border-l-2 border-dashed border-line">
                    {item.orderItemToppings.map((topping: any, tIdx: number) => (
                      <div key={tIdx} className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted">{topping.topping?.name || 'Topping'}</p>
                          <p className="text-xs text-muted mt-1">x{topping.quantity} @ {formatCurrency(topping.extraPrice)}</p>
                        </div>
                        <span className="text-sm text-muted">{formatCurrency(topping.quantity * topping.extraPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-8 border-t-2 border-dashed border-line space-y-3">
            <div className="flex justify-between text-sm text-muted">
              <span>Tạm tính</span>
              <span>{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            {invoiceData.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-gold">
                <span>Giảm giá</span>
                <span>-{formatCurrency(invoiceData.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-muted">
              <span>Thuế VAT</span>
              <span>{formatCurrency(invoiceData.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-coffee pt-4 border-t border-line mt-2">
              <span>Tổng thanh toán</span>
              <span className="text-gold">{formatCurrency(invoiceData.totalAmount)}</span>
            </div>
          </div>
        </div>

        {payments.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-muted uppercase mb-4 tracking-widest">Thanh toán</h4>
            <div className="space-y-3">
              {payments.map((payment: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm text-muted bg-white p-3 rounded-xl border border-line">
                  <span className="capitalize font-medium">{payment.method === 'cash' ? 'Tiền mặt' : payment.method === 'credit' ? 'Thẻ/Chuyển khoản' : payment.method}</span>
                  <span className="font-bold text-coffee">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {order?.pointTransactions && order.pointTransactions.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-muted uppercase mb-4 tracking-widest text-gold">Giao dịch điểm thưởng</h4>
            <div className="space-y-3">
              {order.pointTransactions.map((tx: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm bg-gold/10 p-3 rounded-xl border border-gold/20">
                  <div>
                    <span className="font-bold text-coffee block">{tx.type === 'earn' ? 'Tích điểm' : tx.type === 'redeem' ? 'Tiêu điểm' : tx.type}</span>
                    <span className="text-xs text-muted block mt-0.5">{tx.note}</span>
                  </div>
                  <span className={`font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-6 text-[10px] text-muted flex justify-between italic uppercase tracking-wider font-medium">
          <span>Thu ngân: {order?.employee?.fullName || 'N/A'}</span>
          <span>Máy POS: 01</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`absolute top-0 right-0 h-full w-[35%] border-l border-line bg-white flex flex-col transition-transform duration-300 z-10 ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}>
      <div className="p-8 border-b border-line flex justify-between items-center bg-cream/30">
        <div>
          <h3 className="text-2xl font-bold text-coffee">Chi tiết Đơn hàng</h3>
          <p className="text-xs font-bold text-gold tracking-widest mt-1">MÃ ĐƠN: {invoiceData?.order?.id ? `#...${invoiceData.order.id.substring(invoiceData.order.id.length - 8)}` : (invoice?.id || '#LH-98210')}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${invoiceData?.status === 'refunded' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
            {invoiceData?.status === 'refunded' ? 'Hoàn tiền' : 'Đã thanh toán'}
          </span>
          <button onClick={onClose} className="p-2 hover:bg-beige rounded-full transition-colors text-muted hover:text-coffee">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {renderContent()}
      
      <div className="p-8 bg-cream/30 border-t border-line grid grid-cols-1 gap-4">
        <button className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-line text-coffee rounded-xl font-bold text-sm hover:bg-beige transition-all shadow-sm active:scale-95 disabled:opacity-50" disabled={isLoading || !!error}>
          <Printer className="w-5 h-5" /> In lại hóa đơn
        </button>
        <button onClick={onRefund} className="w-full h-14 flex items-center justify-center gap-3 bg-coffee text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-md active:scale-95 disabled:opacity-50" disabled={isLoading || !!error}>
          <RotateCcw className="w-5 h-5" /> Hoàn tiền (Refund)
        </button>
      </div>
    </div>
  );
}
