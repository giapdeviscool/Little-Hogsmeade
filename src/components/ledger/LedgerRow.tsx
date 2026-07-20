import { Fragment } from 'react';
import { cn } from '../../utils/cn';
import { LedgerInvoiceDetail } from './LedgerInvoiceDetail';
import { getAuthSession } from '@/store/auth.store';

interface LedgerRowProps {
  invoice: any;
  branches?: any[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}

export function LedgerRow({
  invoice,
  branches = [],
  isExpanded,
  onToggleExpand,
  formatCurrency,
  formatDate
}: LedgerRowProps) {
  const session = getAuthSession();
  const invoiceId = invoice.id || (invoice as any)._id || '';
  const displayId = invoiceId ? `#...${invoiceId.substring(invoiceId.length - 6)}` : '';
  const method = invoice.paymentMethod || invoice.payments?.[0]?.method;
  
  // Find branch name from branches list if provided, otherwise fallback to session branch name
  const branchName = branches.find(b => (b.id || b._id) === invoice.orderId.branchId)?.name || session?.user.branchName || 'Hogsmeade';

  // Color codes border-l of expanded row based on status
  let borderLeftColor = "border-l-transparent hover:bg-cream";
  if (isExpanded) {
    if (invoice.status === 'paid') borderLeftColor = "bg-cream border-l-[#5fa876]";
    else if (invoice.status === 'refunded') borderLeftColor = "bg-cream border-l-[#c25a5a]";
    else borderLeftColor = "bg-cream border-l-gold";
  }

  return (
    <Fragment>
      <tr 
        className={cn("transition-colors cursor-pointer group border-l-4", borderLeftColor)}
        onClick={onToggleExpand}
      >
        <td className="px-2 py-3 text-sm">{formatDate(invoice.createdAt)}</td>
        <td className="px-2 py-3 text-sm font-bold text-gold">{displayId}</td>
        <td className="px-2 py-3 text-sm">{branchName}</td>
        <td className="px-2 py-3 text-sm">{invoice.cashierId?.name || "Hệ thống"}</td>
        <td className="px-2 py-3 text-sm flex items-center gap-2">
          {method === 'vietqr' ? (
            <>
              <span className="material-symbols-outlined text-lg text-latte">qr_code_2</span> Chuyển khoản / QR
            </>
          ) : method === 'cash' ? (
            <>
              <span className="material-symbols-outlined text-lg text-latte">payments</span> Tiền mặt
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg text-latte">help</span> —
            </>
          )}
        </td>
        <td className="px-2 py-3 text-right font-bold text-base text-coffee">{formatCurrency(invoice.totalAmount)}</td>
        <td className="px-2 py-3">
          {invoice.status === 'paid' && (
            <span className="px-3 py-1 rounded-full bg-[#5fa876]/10 text-[#5fa876] text-xs font-bold uppercase tracking-wide">Đã thanh toán</span>
          )}
          {invoice.status === 'refunded' && (
            <span className="px-3 py-1 rounded-full bg-[#c25a5a]/10 text-[#c25a5a] text-xs font-bold uppercase tracking-wide">Đã hoàn tiền</span>
          )}
          {(invoice.status === 'unpaid' || invoice.status === 'pending') && (
            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wide">Chờ thanh toán</span>
          )}
        </td>
        <td className="px-2 py-3 text-right">
          <span className={cn("material-symbols-outlined text-coffee transition-transform", isExpanded ? 'rotate-90' : '')}>expand_more</span>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-cream">
          <td className="px-4 pb-6 pt-2" colSpan={8}>
            <LedgerInvoiceDetail
              invoiceId={invoiceId}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </td>
        </tr>
      )}
    </Fragment>
  );
}
