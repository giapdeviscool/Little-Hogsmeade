import { useState, useEffect } from 'react';
import { AdminPageHeader } from '../../components/ui/AdminPageHeader';
import { getAdminInvoices } from '../../api/invoice.api';
import { DatePicker } from '../../components/ui/DatePicker';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { StatisticCard } from '../../components/ledger/StatisticCard';
import { LedgerTable } from '../../components/ledger/LedgerTable';
import { RecordPagination } from '../../components/ui/RecordPagination';

// --- Main Page Component ---

export function POSPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    cashierId: '',
    startDate: '',
    endDate: '',
  });

  // Calculate some simple statistics from current page
  const totalRevenueCurrentPage = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.totalAmount : 0), 0);
  const totalRefundedCurrentPage = invoices.reduce((sum, inv) => sum + (inv.status === 'refunded' ? inv.totalAmount : 0), 0);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '—';
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await getAdminInvoices({
          page: currentPage,
          limit: 20,
          status: filters.status,
          paymentMethod: filters.paymentMethod,
          cashierId: filters.cashierId,
          startDate: filters.startDate,
          endDate: filters.endDate,
        });

        if (response.success) {
          setInvoices(response.data || []);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalDocs(response.pagination?.totalDocs || 0);
        }
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [currentPage, filters]);


  return (
    <div className="ledger-container">
      {/* Header Section */}
      <AdminPageHeader
        className="mb-10"
        moduleName="Tài chính & Kế toán"
        pageName="Sổ cái Giao dịch"
        pageDescription="Global Transaction Ledger • Real-time Data"
        action={
          <>
            <button className="flex items-center gap-2 px-5 h-12 bg-beige text-coffee rounded-xl font-semibold text-sm border border-line hover:bg-latte/10 transition-colors">
              <span className="material-symbols-outlined text-lg">download</span> Export CSV
            </button>
            <button className="flex items-center gap-2 px-5 h-12 bg-beige text-coffee rounded-xl font-semibold text-sm border border-line hover:bg-latte/10 transition-colors">
              <span className="material-symbols-outlined text-lg">print</span> Print Ledger
            </button>
          </>
        }
      />

      {/* Overview/KPI Section (Calculated dynamically from current page) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <StatisticCard
          name="Doanh thu (Trang này)"
          value={formatCurrency(totalRevenueCurrentPage)}
          icon="payments"
        />
        <StatisticCard
          name="Tổng Hoàn tiền (Trang này)"
          value={formatCurrency(totalRefundedCurrentPage)}
          icon="replay"
          iconColorClass="text-[#c25a5a]"
          bgIconClass="bg-[#c25a5a]/10"
        />
        <StatisticCard
          name="Số Giao dịch (Trang này)"
          value={`${invoices.length} / ${totalDocs} Giao dịch`}
          icon="show_chart"
          iconColorClass="text-gold"
          bgIconClass="bg-gold/10"
        />
      </section>

      {/* Filters Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10 bg-cream p-6 rounded-2xl border border-line shadow-sm">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted px-1 uppercase">Từ ngày</label>
          <DatePicker
            value={filters.startDate}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, startDate: val }));
              setCurrentPage(1);
            }}
            placeholder="Chọn ngày bắt đầu"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted px-1 uppercase">Đến ngày</label>
          <DatePicker
            value={filters.endDate}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, endDate: val }));
              setCurrentPage(1);
            }}
            placeholder="Chọn ngày kết thúc"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted px-1 uppercase">Phương thức</label>
          <CustomSelect
            value={filters.paymentMethod}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, paymentMethod: val }));
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "Tất cả phương thức" },
              { value: "vietqr", label: "Chuyển khoản / QR" },
              { value: "cash", label: "Tiền mặt" }
            ]}
            placeholder="Tất cả phương thức"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted px-1 uppercase">Mã Thu ngân</label>
          <div className="relative">
            <input
              className="w-full bg-white border border-line rounded-xl px-4 h-12 text-sm text-coffee focus:ring-1 focus:ring-gold focus:border-gold outline-none transition-all"
              placeholder="Nhập ID thu ngân..."
              type="text"
              value={filters.cashierId}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, cashierId: e.target.value }));
                setCurrentPage(1);
              }}
            />
            <span className="material-symbols-outlined absolute right-3 top-3 text-muted text-xl pointer-events-none">search</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted px-1 uppercase">Trạng thái</label>
          <CustomSelect
            value={filters.status}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, status: val }));
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "paid", label: "Đã thanh toán (Paid)" },
              { value: "unpaid", label: "Chờ thanh toán (Unpaid)" },
              { value: "refunded", label: "Đã hoàn tiền (Refunded)" }
            ]}
            placeholder="Tất cả trạng thái"
          />
        </div>
      </section>

      {/* Ledger Table */}
      <section className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden mb-10">
        <LedgerTable
          invoices={invoices}
          loading={loading}
          expandedRow={expandedRow}
          onToggleExpand={(id) => setExpandedRow(prev => prev === id ? null : id)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
        
        <RecordPagination
          currentPage={currentPage}
          pageSize={20}
          totalDocs={totalDocs}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setCurrentPage}
          label="giao dịch"
        />
      </section>
    </div>
  );
}
