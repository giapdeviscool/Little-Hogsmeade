import { useState } from 'react';
import { InvoiceLayout } from '@/layouts/InvoiceLayout';
import { InvoiceTable, type Invoice } from '@/components/invoices/InvoiceTable';
import { InvoiceDetailPanel } from '@/components/invoices/InvoiceDetailPanel';
import { RefundModal } from '@/components/invoices/RefundModal';

const MOCK_INVOICES: Invoice[] = [
  { id: '#LH-98210', time: '14:23 - 24 Th10, 2023', status: 'paid', method: 'visa', total: '₫612.500' },
  { id: '#LH-98208', time: '14:10 - 24 Th10, 2023', status: 'refunded', method: 'cash', total: '₫300.000' },
  { id: '#LH-98205', time: '13:55 - 24 Th10, 2023', status: 'paid', method: 'apple_pay', total: '₫1.128.000' },
  { id: '#LH-98199', time: '13:30 - 24 Th10, 2023', status: 'paid', method: 'cash', total: '₫212.500' },
];

export function InvoicePage() {
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
    <InvoiceLayout>
      <div className="flex w-full h-full relative overflow-hidden bg-beige">
        <section className={`p-8 overflow-y-auto custom-scrollbar transition-all duration-300 h-full ${isDetailOpen ? 'w-[65%] border-r border-line' : 'w-full'}`}>
          <InvoiceTable invoices={MOCK_INVOICES} onSelectInvoice={handleSelectInvoice} />
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
    </InvoiceLayout>
  );
}
