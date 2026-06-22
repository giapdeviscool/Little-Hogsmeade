import { Search, ChevronDown, Eye, CreditCard, Banknote, Wallet } from 'lucide-react';

export interface Invoice {
  id: string;
  time: string;
  status: 'paid' | 'refunded' | 'cancelled';
  method: 'visa' | 'cash' | 'apple_pay';
  total: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
}

export function InvoiceTable({ invoices, onSelectInvoice }: InvoiceTableProps) {
  const getStatusDisplay = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 uppercase tracking-wider">Đã thanh toán</span>;
      case 'refunded':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 uppercase tracking-wider">Hoàn tiền</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-600 uppercase tracking-wider">Đã hủy</span>;
    }
  };

  const getMethodDisplay = (method: Invoice['method']) => {
    switch (method) {
      case 'visa':
        return <><CreditCard className="w-5 h-5" /> <span>Visa</span></>;
      case 'cash':
        return <><Banknote className="w-5 h-5" /> <span>Tiền mặt</span></>;
      case 'apple_pay':
        return <><Wallet className="w-5 h-5" /> <span>Apple Pay</span></>;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="relative w-full md:w-[480px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <Search className="w-5 h-5" />
          </span>
          <input className="w-full h-14 pl-12 pr-6 bg-white border border-line rounded-2xl focus:ring-2 focus:ring-coffee/20 focus:border-coffee focus:outline-none shadow-sm transition-all placeholder:text-muted/60" placeholder="Tìm mã đơn hàng hoặc khách hàng..." type="text"/>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none h-14 w-full md:w-48 bg-white border border-line px-6 py-2 pr-12 rounded-2xl font-semibold text-sm text-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20 cursor-pointer shadow-sm">
              <option>Tất cả trạng thái</option>
              <option>ĐÃ THANH TOÁN</option>
              <option>HOÀN TIỀN</option>
              <option>ĐÃ HỦY</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <ChevronDown className="w-5 h-5" />
            </span>
          </div>
          <button className="h-14 px-8 bg-gold text-coffee rounded-2xl font-bold text-sm shadow-sm hover:brightness-105 active:scale-95 transition-all">
            Lọc kết quả
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-line overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream border-b border-line">
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted">Mã đơn hàng</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted">Thời gian</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted">Trạng thái</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted">Phương thức</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted text-right">Tổng cộng</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {invoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-cream/50 transition-colors cursor-pointer group h-20" onClick={() => onSelectInvoice(invoice)}>
                <td className="px-6 py-4 font-bold text-coffee group-hover:text-gold transition-colors">{invoice.id}</td>
                <td className="px-6 py-4 text-muted text-sm">{invoice.time}</td>
                <td className="px-6 py-4">{getStatusDisplay(invoice.status)}</td>
                <td className="px-6 py-4 flex items-center gap-2 text-muted text-sm h-20">{getMethodDisplay(invoice.method)}</td>
                <td className="px-6 py-4 text-right font-bold text-coffee">{invoice.total}</td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 hover:bg-beige rounded-full transition-colors text-coffee" onClick={(e) => { e.stopPropagation(); onSelectInvoice(invoice); }}>
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
