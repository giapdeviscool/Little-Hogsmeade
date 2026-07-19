import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getShiftId } from '@/store/shift.store';
import { getAuthSession } from '@/store/auth.store';
import { getActiveCashierShift } from '@/api/shift.api';
import { listInvoices } from '@/api/invoice.api';
import { PosHeader } from '@/layouts/PosHeader';

export function ShiftOverviewPage() {
  const navigate = useNavigate();

  const [cashierName, setCashierName] = useState('');
  const [cashierRole, setCashierRole] = useState('');
  const [branchName, setBranchName] = useState('');
  const [openedAt, setOpenedAt] = useState('');
  const [startingFloat, setStartingFloat] = useState(0);
  
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [refundedInvoices, setRefundedInvoices] = useState(0);
  const [cashSales, setCashSales] = useState(0);
  const [cashRefunds, setCashRefunds] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const shiftId = getShiftId();
    if (!shiftId) {
      navigate(ROUTES.shiftOpening);
      return;
    }

    const loadData = async () => {
      try {
        // 1. Fetch active shift details
        const activeRes = await getActiveCashierShift();
        if (activeRes?.data) {
          if (activeRes.data.starting_float !== undefined) {
            setStartingFloat(activeRes.data.starting_float);
          }
          if (activeRes.data.opened_at || activeRes.data.openedAt) {
            setOpenedAt(activeRes.data.opened_at || activeRes.data.openedAt);
          }
          const employee = activeRes.data.employee;
          if (employee) {
            setCashierName(employee.fullName || employee.name || '');
            setCashierRole(employee.role || employee.roleName || '');
          }
        }

        // Fallback info
        const authSession = getAuthSession();
        if (authSession?.user) {
          setCashierName(prev => prev || authSession.user.fullName || authSession.user.name || 'Nguyễn Văn A');
          setCashierRole(prev => prev || authSession.user.role || authSession.user.roleName || 'Nhân viên phục vụ');
          setBranchName(authSession.user.branchId || '123 Quận 1, TP HCM');
        } else {
          setCashierName(prev => prev || 'Nguyễn Văn A');
          setCashierRole(prev => prev || 'Nhân viên phục vụ');
          setBranchName('123 Quận 1, TP HCM');
        }

        // 2. Fetch invoices for current shift
        const invoicesRes = await listInvoices({ currentShift: true, limit: 1000 });
        if (invoicesRes.data) {
          const invoices = invoicesRes.data;
          setTotalInvoices(invoices.length);
          
          let refundedCount = 0;
          let currentCashSales = 0;
          let currentCashRefunds = 0;

          invoices.forEach((inv: any) => {
            if (inv.status === 'refunded') {
              refundedCount++;
              if (inv.paymentMethod === 'cash' || !inv.paymentMethod) { 
                  currentCashRefunds += inv.totalAmount || 0;
              }
            } else if (inv.status === 'paid') {
              if (inv.paymentMethod === 'cash' || !inv.paymentMethod) {
                  currentCashSales += inv.totalAmount || 0;
              }
            }
          });

          setRefundedInvoices(refundedCount);
          setCashSales(currentCashSales);
          setCashRefunds(currentCashRefunds);
          setRecentInvoices(invoices.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load shift overview data:", err);
      }
    };
    loadData();
  }, [navigate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };
  
  const fullFormatDate = (date: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[date.getDay()]}, ngày ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  const expectedSystemCash = startingFloat + cashSales - cashRefunds;

  return (
    <div className="bg-beige text-coffee min-h-screen pb-20 md:pb-0 font-sans flex flex-col">
      <PosHeader />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-10 flex-1 w-full mt-16">
          {/* Hero Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                  <h2 className="font-display text-3xl font-bold text-coffee">Tổng Quan Ca Hiện Tại</h2>
                  <div className="flex items-center gap-3 text-muted">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                      <p className="font-medium text-sm">{fullFormatDate(currentTime)}</p>
                      <span className="mx-2">•</span>
                      <p className="font-medium text-sm font-bold">{currentTime.toLocaleTimeString('vi-VN')}</p>
                  </div>
              </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Employee & KPIs */}
              <div className="lg:col-span-8 space-y-6">
                  {/* Thông Tin Nhân Viên Card */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-line flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-cream flex items-center justify-center">
                          <span className="material-symbols-outlined text-coffee text-3xl">person</span>
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div>
                              <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Nhân viên</p>
                              <p className="font-semibold text-lg text-coffee">{cashierName}</p>
                          </div>
                          <div>
                              <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Chức vụ</p>
                              <p className="text-base text-coffee">{cashierRole}</p>
                          </div>
                          <div className="">
                              <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Chi nhánh</p>
                              <p className="text-base text-coffee">{branchName || 'Chi nhánh mặc định'}</p>
                          </div>
                      </div>
                  </div>

                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="bg-cream p-6 rounded-xl space-y-1">
                          <span className="material-symbols-outlined text-gold mb-2 block">schedule</span>
                          <p className="text-muted text-xs font-bold uppercase tracking-wider">Giờ Mở Ca</p>
                          <p className="font-display text-2xl font-bold">{formatDate(openedAt)}</p>
                      </div>
                      <div className="bg-cream p-6 rounded-xl space-y-1">
                          <span className="material-symbols-outlined text-gold mb-2 block">payments</span>
                          <p className="text-muted text-xs font-bold uppercase tracking-wider">Tiền Đầu Ca</p>
                          <p className="font-display text-2xl font-bold">{formatCurrency(startingFloat)}</p>
                      </div>
                      <div className="bg-cream p-6 rounded-xl space-y-1">
                          <span className="material-symbols-outlined text-gold mb-2 block">receipt_long</span>
                          <p className="text-muted text-xs font-bold uppercase tracking-wider">Số Hóa Đơn</p>
                          <p className="font-display text-2xl font-bold">{totalInvoices}</p>
                      </div>
                      <div className="bg-cream p-6 rounded-xl space-y-1">
                          <span className="material-symbols-outlined text-red-600 mb-2 block">assignment_return</span>
                          <p className="text-muted text-xs font-bold uppercase tracking-wider">Hoàn Tiền</p>
                          <p className="font-display text-2xl font-bold">{refundedInvoices}</p>
                      </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-sm border border-line overflow-hidden">
                      <div className="px-6 py-4 bg-cream border-b border-line flex justify-between items-center">
                          <h3 className="font-semibold text-lg text-coffee">Hoạt Động Gần Đây</h3>
                          <a href={ROUTES.invoices} className="text-gold text-sm font-semibold hover:underline">Xem tất cả</a>
                      </div>
                      <div className="divide-y divide-line">
                          {recentInvoices.length > 0 ? (
                            recentInvoices.map((inv, idx) => (
                              <div key={inv.id || idx} className="p-6 flex items-center justify-between hover:bg-cream transition-colors">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inv.status === 'refunded' ? 'bg-red-50 text-red-600' : 'bg-latte/20 text-coffee'}`}>
                                          <span className="material-symbols-outlined">{inv.status === 'refunded' ? 'history' : 'coffee'}</span>
                                      </div>
                                      <div className="">
                                          <p className="text-base font-bold text-coffee">{inv.status === 'refunded' ? 'Hoàn tiền' : 'Hóa đơn'} #{inv.id?.slice(-4) || '----'}</p>
                                          <p className="text-muted text-sm">
                                            {inv.orderItems?.length || 0} món • {inv.paymentMethod === 'vietqr' ? 'Chuyển khoản' : 'Tiền mặt'}
                                          </p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className={`font-bold text-[22px] ${inv.status === 'refunded' ? 'text-red-600' : 'text-coffee'}`}>
                                        {inv.status === 'refunded' ? '-' : ''}{formatCurrency(inv.totalAmount || 0)}
                                      </p>
                                      <p className="text-muted text-xs font-bold uppercase tracking-wider">{formatDate(inv.createdAt)}</p>
                                  </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center text-muted">
                              Không có hoạt động nào trong ca này.
                            </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* Right Column: Revenue Summary */}
              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-coffee p-6 rounded-xl shadow-lg text-white space-y-10 relative overflow-hidden">
                      {/* Subtle background decoration */}
                      <div className="absolute -right-8 -bottom-8 opacity-10">
                          <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
                      </div>

                      <div className="relative z-10">
                          <h3 className="font-display text-2xl font-bold mb-6 border-b border-white/20 pb-2">Thống Kê Doanh Thu</h3>
                          
                          <div className="space-y-6">
                              <div className="flex justify-between items-center opacity-90">
                                  <span className="text-sm">Doanh thu tiền mặt</span>
                                  <span className="text-sm font-bold">+{formatCurrency(cashSales)}</span>
                              </div>
                              <div className="flex justify-between items-center opacity-90">
                                  <span className="text-sm">Tổng tiền hoàn</span>
                                  <span className="text-sm font-bold text-red-300">-{formatCurrency(cashRefunds)}</span>
                              </div>
                              <div className="flex justify-between items-center opacity-90">
                                  <span className="text-sm">Tiền mặt đầu ca</span>
                                  <span className="text-sm font-bold">{formatCurrency(startingFloat)}</span>
                              </div>

                              <div className="pt-10 mt-10 border-t border-white/30">
                                  <p className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Tiền mặt hiện tại (Hệ thống)</p>
                                  <div className="flex flex-col gap-1">
                                      <h4 className="font-display font-bold text-[32px] tracking-tight">{formatCurrency(expectedSystemCash)}</h4>
                                      <p className="text-xs opacity-60 italic">* Đây là số tiền dự kiến có trong két</p>
                                  </div>
                              </div>
                          </div>

                          <div className="mt-10 space-y-3">
                              <button 
                                onClick={() => navigate(ROUTES.shiftClosing)}
                                className="w-full bg-gold text-coffee py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-colors active:scale-95 cursor-pointer">
                                  <span className="material-symbols-outlined">print</span>
                                  Chốt Ca & In Báo Cáo
                              </button>
                              <button 
                                onClick={() => navigate(ROUTES.shiftClosing)}
                                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-bold text-sm border border-white/20 transition-all cursor-pointer">
                                  Đối Soát Két Tiền
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </main>
    </div>
  );
}
