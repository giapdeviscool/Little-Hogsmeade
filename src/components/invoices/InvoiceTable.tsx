import { useState, useEffect } from 'react';
import { Search, ChevronDown, Eye, CreditCard, Banknote, Wallet, ChevronLeft, ChevronRight, Loader2, AlertCircle, Filter, RotateCcw } from 'lucide-react';
import { listInvoices } from '@/api/invoice.api';

export interface Invoice {
  id: string; // Map orderId here for compatibility with existing Detail Panel
  originalInvoiceId: string;
}

interface InvoiceTableProps {
  onSelectInvoice: (invoice: Invoice) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const truncateId = (id: string) => {
  if (!id) return '';
  return id.length > 8 ? `#...${id.substring(id.length - 8)}` : `#${id}`;
};

export function InvoiceTable({ onSelectInvoice }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [customerName, setCustomerName] = useState('');
  const [idSearchType, setIdSearchType] = useState<'id' | 'order_id'>('order_id');
  const [idSearchValue, setIdSearchValue] = useState('');
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchInvoicesData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await listInvoices({
          page: currentPage,
          limit,
          ...appliedFilters
        });
        if (response.success) {
          setInvoices(response.data || []);
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages || 1);
          }
        } else {
          setError('Failed to fetch invoices');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching invoices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoicesData();
  }, [currentPage, appliedFilters]);

  const handleSearch = () => {
    setCurrentPage(1);
    const newFilters: Record<string, any> = {};
    if (customerName) newFilters.customerName = customerName;
    if (status) newFilters.status = status;
    if (paymentMethod) newFilters.paymentMethod = paymentMethod;
    if (startDate) newFilters.startDate = startDate;
    if (endDate) newFilters.endDate = endDate;
    if (idSearchValue) {
      newFilters[idSearchType] = idSearchValue;
    }
    setAppliedFilters(newFilters);
  };

  const handleClearFilters = () => {
    setCustomerName('');
    setIdSearchValue('');
    setStatus('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    setAppliedFilters({});
  };

  const getStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 uppercase tracking-wider">Đã thanh toán</span>;
      case 'refunded':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 uppercase tracking-wider">Hoàn tiền</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-600 uppercase tracking-wider">Đã hủy</span>;
      case 'unpaid':
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-600 uppercase tracking-wider">Chưa thanh toán</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-600 uppercase tracking-wider">{status || 'Unknown'}</span>;
    }
  };

  const getMethodDisplay = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'visa':
      case 'credit':
        return <><CreditCard className="w-5 h-5" /> <span>Thẻ/Chuyển khoản</span></>;
      case 'cash':
        return <><Banknote className="w-5 h-5" /> <span>Tiền mặt</span></>;
      case 'apple_pay':
        return <><Wallet className="w-5 h-5" /> <span>Apple Pay</span></>;
      default:
        return <><CreditCard className="w-5 h-5" /> <span className="capitalize">{method || 'N/A'}</span></>;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 w-full md:max-w-[480px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              <Search className="w-5 h-5" />
            </span>
            <input 
              className="w-full h-14 pl-12 pr-6 bg-white border border-line rounded-2xl focus:ring-2 focus:ring-coffee/20 focus:border-coffee focus:outline-none shadow-sm transition-all placeholder:text-muted/60 text-sm" 
              placeholder="Tìm tên khách hàng..." 
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {Object.keys(appliedFilters).length > 0 && (
              <button 
                onClick={handleClearFilters}
                className="h-14 px-5 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="hidden lg:inline">Xóa lọc</span>
              </button>
            )}
            <div className="relative flex-1 md:flex-none">
              <select 
                className="appearance-none h-14 w-full md:w-48 bg-white border border-line px-6 py-2 pr-12 rounded-2xl font-semibold text-sm text-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20 cursor-pointer shadow-sm"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  // We could auto search here if wanted, but using explicit button is fine
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="refunded">Hoàn tiền</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <ChevronDown className="w-5 h-5" />
              </span>
            </div>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-14 px-5 bg-beige text-coffee rounded-2xl font-bold text-sm hover:bg-line/50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Filter className="w-5 h-5" />
              <span className="hidden md:inline">{showAdvanced ? 'Ẩn bộ lọc' : 'Lọc nâng cao'}</span>
            </button>
            <button 
              onClick={handleSearch}
              className="h-14 px-8 bg-gold text-coffee rounded-2xl font-bold text-sm shadow-sm hover:brightness-105 active:scale-95 transition-all"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="p-6 bg-white border border-line rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-200">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Tra cứu theo mã</label>
              <div className="flex h-12 shadow-sm rounded-xl">
                <select 
                  className="appearance-none bg-beige border border-line border-r-0 px-4 py-2 rounded-l-xl font-bold text-sm text-coffee focus:outline-none cursor-pointer"
                  value={idSearchType}
                  onChange={(e) => setIdSearchType(e.target.value as 'id' | 'order_id')}
                >
                  <option value="order_id">Mã đơn (Order ID)</option>
                  <option value="id">Mã hóa đơn (Invoice ID)</option>
                </select>
                <input 
                  type="text"
                  placeholder="Nhập mã 24 ký tự..."
                  className="flex-1 min-w-0 bg-white border border-line rounded-r-xl px-4 text-sm focus:ring-2 focus:ring-coffee/20 focus:border-coffee focus:outline-none"
                  value={idSearchValue}
                  onChange={(e) => setIdSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Phương thức</label>
              <div className="relative h-12">
                <select 
                  className="appearance-none h-full w-full bg-white border border-line px-4 py-2 pr-10 rounded-xl font-semibold text-sm text-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20 shadow-sm cursor-pointer"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="credit">Thẻ/Chuyển khoản</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </div>
            </div>
            
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Từ ngày</label>
                <input 
                  type="date"
                  className="h-12 w-full bg-white border border-line px-4 py-2 rounded-xl text-sm font-semibold text-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20 shadow-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Đến ngày</label>
                <div className="flex gap-3">
                  <input 
                    type="date"
                    className="h-12 flex-1 min-w-0 bg-white border border-line px-4 py-2 rounded-xl text-sm font-semibold text-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20 shadow-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button 
                    onClick={handleClearFilters}
                    className="h-12 w-12 shrink-0 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                    title="Xóa bộ lọc"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-line overflow-hidden mb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <p className="text-muted text-sm font-medium">Đang tải danh sách hóa đơn...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-muted text-sm font-medium">{error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted text-sm font-medium">Không tìm thấy kết quả phù hợp</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream border-b border-line">
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted">Mã đơn hàng</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted">Khách hàng</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted">Thời gian</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted">Trạng thái</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted">Phương thức</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted text-right">Tổng cộng</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map(invoice => {
                const method = invoice.payments?.[0]?.method || 'N/A';
                return (
                  <tr key={invoice.id} className="hover:bg-cream/50 transition-colors cursor-pointer group h-20" onClick={() => onSelectInvoice({ id: invoice.orderId, originalInvoiceId: invoice.id })}>
                    <td className="px-6 py-4 font-bold text-coffee group-hover:text-gold transition-colors" title={invoice.orderId}>{truncateId(invoice.orderId)}</td>
                    <td className="px-6 py-4 font-semibold text-coffee">{invoice.order?.customer?.fullName || 'Khách vãng lai'}</td>
                    <td className="px-6 py-4 text-muted text-sm">{formatDate(invoice.createdAt)}</td>
                    <td className="px-6 py-4">{getStatusDisplay(invoice.status)}</td>
                    <td className="px-6 py-4 flex items-center gap-2 text-muted text-sm h-20">{getMethodDisplay(method)}</td>
                    <td className="px-6 py-4 text-right font-bold text-coffee">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 hover:bg-beige rounded-full transition-colors text-coffee" onClick={(e) => { e.stopPropagation(); onSelectInvoice({ id: invoice.orderId, originalInvoiceId: invoice.id }); }}>
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && !error && invoices.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Trang <span className="font-bold text-coffee">{currentPage}</span> / {totalPages}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-line bg-white text-coffee hover:bg-beige disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-line bg-white text-coffee hover:bg-beige disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
