import { LedgerRow } from './LedgerRow';

interface LedgerTableProps {
  invoices: any[];
  loading: boolean;
  expandedRow: string | null;
  onToggleExpand: (invoiceId: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}

export function LedgerTable({
  invoices,
  loading,
  expandedRow,
  onToggleExpand,
  formatCurrency,
  formatDate
}: LedgerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-beige/40 border-b border-line">
          <tr>
            <th className="px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest">Thời gian</th>
            <th className="px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest">ID Giao dịch</th>
            <th className="px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest">Chi nhánh</th>
            <th className="px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest">Thu ngân</th>
            <th className="px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest">Phương thức</th>
            <th className="px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest text-right">Tổng tiền</th>
            <th className="px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest">Trạng thái</th>
            <th className="px-4 py-3.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse bg-white">
                <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="px-4 py-3 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                <td className="px-4 py-3"></td>
              </tr>
            ))
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-muted font-medium">
                Không tìm thấy giao dịch nào phù hợp với bộ lọc.
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => {
              const invoiceId = invoice.id || (invoice as any)._id || '';
              return (
                <LedgerRow
                  key={invoiceId}
                  invoice={invoice}
                  isExpanded={expandedRow === invoiceId}
                  onToggleExpand={() => onToggleExpand(invoiceId)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
