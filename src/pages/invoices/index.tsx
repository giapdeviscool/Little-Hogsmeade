import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getShiftId } from '@/store/shift.store';
import { PosLayout } from '@/layouts/PosLayout';
import { InvoiceTable, type Invoice } from '@/components/invoices/InvoiceTable';
import { InvoiceDetailPanel } from '@/components/invoices/InvoiceDetailPanel';
import { RefundModal } from '@/components/invoices/RefundModal';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { CheckCircle2 } from 'lucide-react';

export function InvoicePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const activeShiftId = getShiftId();
    if (!activeShiftId) {
      navigate(ROUTES.shiftOpening);
    }
  }, [navigate]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [paymentModalData, setPaymentModalData] = useState<{
    orderId: string;
    invoiceId: string;
    totalAmount: number;
  } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalData(null);
    handleUpdate();
    setSuccessToast('Thanh toán đơn hàng thành công!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <PosLayout>
      <div className="flex w-full h-full relative overflow-hidden bg-beige">
        {successToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#5fa876] text-white px-6 py-3.5 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successToast}</span>
          </div>
        )}

        <section className={`p-8 overflow-y-auto custom-scrollbar transition-all duration-300 h-full ${isDetailOpen ? 'w-[65%] border-r border-line' : 'w-full'}`}>
          <InvoiceTable onSelectInvoice={handleSelectInvoice} refreshTrigger={refreshTrigger} />
        </section>
        
        <InvoiceDetailPanel 
          isOpen={isDetailOpen} 
          onClose={handleCloseDetail} 
          invoice={selectedInvoice}
          onRefund={() => setIsRefundModalOpen(true)}
          onUpdate={handleUpdate}
          refreshTrigger={refreshTrigger}
          onCheckout={(orderId, invoiceId, totalAmount) => {
            setPaymentModalData({ orderId, invoiceId, totalAmount });
          }}
        />
      </div>
      
      <RefundModal 
        isOpen={isRefundModalOpen} 
        onClose={() => setIsRefundModalOpen(false)} 
        invoiceId={selectedInvoice?.id || ''}
      />

      {paymentModalData && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPaymentModalData(null)}
          orderId={paymentModalData.orderId}
          invoiceId={paymentModalData.invoiceId}
          totalAmount={paymentModalData.totalAmount}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </PosLayout>
  );
}
