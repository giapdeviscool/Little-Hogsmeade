import { Star, Printer, RotateCcw, X, Loader2, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import type { Invoice } from '@/components/invoices/InvoiceTable';
import { useState, useEffect } from 'react';
import { getInvoice } from '@/api/invoice.api';
import { ConfirmModal } from '../ui/ConfirmModal';
import { updateOrderStatus } from '@/api/order.api';

interface InvoiceDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefund: () => void;
  invoice: Invoice | null;
  onUpdate?: () => void;
  refreshTrigger?: number;
  onCheckout: (orderId: string, invoiceId: string, totalAmount: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export function InvoiceDetailPanel({ isOpen, onClose, onRefund, invoice, onUpdate, refreshTrigger, onCheckout }: InvoiceDetailPanelProps) {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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
  }, [isOpen, invoice, refreshTrigger]);

  const handleCancelOrder = () => {
    setIsCancelConfirmOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!invoiceData?.order?.id) return;
    
    setIsMutating(true);
    setIsCancelConfirmOpen(false);
    try {
      const response = await updateOrderStatus(invoiceData.order.id, 'cancelled');
      if (response && response.data) {
        setInvoiceData((prev: any) => ({
          ...prev,
          status: 'cancelled',
          order: {
            ...prev.order,
            status: 'cancelled'
          }
        }));
        
        setSuccessToast('Đã hủy đơn hàng thành công!');
        setTimeout(() => setSuccessToast(null), 3000);
        
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Hủy đơn hàng thất bại.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleCheckout = () => {
    if (invoiceData?.order) {
      onCheckout(invoiceData.order.id, invoiceData.id, invoiceData.totalAmount);
    }
  };

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

  const status = invoiceData?.order?.status || invoiceData?.status || '';

  return (
    <div className={`absolute top-0 right-0 h-full w-[35%] border-l border-line bg-white flex flex-col transition-transform duration-300 z-10 ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}>
      {successToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-[#5fa876] text-white px-6 py-3.5 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="p-8 border-b border-line flex justify-between items-center bg-cream/30">
        <div>
          <h3 className="text-2xl font-bold text-coffee">Chi tiết Đơn hàng</h3>
          <p className="text-xs font-bold text-gold tracking-widest mt-1">MÃ ĐƠN: {invoiceData?.order?.id ? `#...${invoiceData.order.id.substring(invoiceData.order.id.length - 8)}` : (invoice?.id || '#LH-98210')}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            status === 'refunded' ? 'bg-red-500/10 text-red-600' : 
            status === 'cancelled' ? 'bg-gray-500/10 text-gray-600' : 
            status === 'pending' || status === 'unpaid' ? 'bg-yellow-500/10 text-yellow-600' :
            'bg-green-500/10 text-green-600'
          }`}>
            {status === 'refunded' ? 'Hoàn tiền' : 
             status === 'cancelled' ? 'Đã hủy' : 
             status === 'pending' || status === 'unpaid' ? 'Chờ thanh toán' :
             'Đã thanh toán'}
          </span>
          <button onClick={onClose} className="p-2 hover:bg-beige rounded-full transition-colors text-muted hover:text-coffee">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {renderContent()}
      
      <div className="p-8 bg-cream/30 border-t border-line grid grid-cols-1 gap-4">
        {status === 'pending' || status === 'unpaid' ? (
          <>
            <button 
              onClick={handleCheckout} 
              className="w-full h-14 flex items-center justify-center gap-3 bg-gold text-coffee rounded-xl font-bold text-sm hover:brightness-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
              disabled={isLoading || isMutating}
            >
              {isMutating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Thanh toán
            </button>
            <button 
              onClick={handleCancelOrder}
              className="w-full h-14 flex items-center justify-center gap-3 bg-red-50 text-[#c25a5a] border border-[#c25a5a]/20 rounded-xl font-bold text-sm hover:bg-red-100/50 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              disabled={isLoading || isMutating}
            >
              {isMutating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              Hủy đơn
            </button>
          </>
        ) : status === 'paid' ? (
          <>
            <button 
              onClick={() => window.print()}
              className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-line text-coffee rounded-xl font-bold text-sm hover:bg-beige active:scale-95 transition-all shadow-sm disabled:opacity-50"
              disabled={isLoading}
            >
              <Printer className="w-5 h-5" /> In lại hóa đơn
            </button>
            <button onClick={onRefund} className="w-full h-14 flex items-center justify-center gap-3 bg-coffee text-white rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50" disabled={isLoading}>
              <RotateCcw className="w-5 h-5" /> Hoàn tiền (Refund)
            </button>
          </>
        ) : status === 'cancelled' ? (
          <div className="text-center py-4 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50 rounded-xl border border-gray-200">
            Đơn hàng đã bị hủy
          </div>
        ) : status === 'refunded' ? (
          <div className="text-center py-4 text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 rounded-xl border border-red-100">
            Đơn hàng đã hoàn tiền
          </div>
        ) : null}
      </div>

      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        title="Hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không?"
        confirmText="Xác nhận hủy"
        cancelText="Quay lại"
        onConfirm={handleCancelConfirm}
        onCancel={() => setIsCancelConfirmOpen(false)}
      />
    </div>
  );
}
