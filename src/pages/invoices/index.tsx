import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getShiftId } from '@/store/shift.store';
import { PosLayout } from '@/layouts/PosLayout';
import { InvoiceTable, type Invoice } from '@/components/invoices/InvoiceTable';
import { InvoiceDetailPanel } from '@/components/invoices/InvoiceDetailPanel';
import { RefundModal } from '@/components/invoices/RefundModal';

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

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  return (
    <PosLayout>
      <div className="flex w-full h-full relative overflow-hidden bg-beige">
        <section className={`p-8 overflow-y-auto custom-scrollbar transition-all duration-300 h-full ${isDetailOpen ? 'w-[65%] border-r border-line' : 'w-full'}`}>
          <InvoiceTable onSelectInvoice={handleSelectInvoice} />
        </section>
        
        <InvoiceDetailPanel 
          isOpen={isDetailOpen} 
          onClose={handleCloseDetail} 
          invoice={selectedInvoice}
          onRefund={() => setIsRefundModalOpen(true)}
        />
      </div>
      
      <RefundModal 
        isOpen={isRefundModalOpen} 
        onClose={() => setIsRefundModalOpen(false)} 
        invoiceId={selectedInvoice?.id || ''}
      />
    </PosLayout>
  );
}
