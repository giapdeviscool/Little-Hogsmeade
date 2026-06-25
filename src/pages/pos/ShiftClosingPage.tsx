import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { ROUTES } from '../../constants/routes';
import { getShiftId, clearShiftId } from '../../store/shift.store';
import { clearAuthSession, getAuthSession } from '../../store/auth.store';
import { 
  requestShiftClosure, 
  finalizeShiftClosure, 
  getActiveCashierShift, 
  getShiftReconciliation
} from '../../api/shift.api';

export function ShiftClosingPage() {
  const navigate = useNavigate();

  const [shiftId, setLocalShiftId] = useState<string | null>(null);
  const [startingFloat, setStartingFloat] = useState<number>(0);
  const [cashSales, setCashSales] = useState<number>(0);
  const [cashRefunds, setCashRefunds] = useState<number>(0);
  const [expectedCash, setExpectedCash] = useState<number>(0);

  const [actualCashInput, setActualCashInput] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: counted cash, 2: TOTP verification, 3: EOD report
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(60);
  const [shake, setShake] = useState(false);
  const [eodReport, setEodReport] = useState<any>(null);

  // New fields from design
  const [totalInvoices, setTotalInvoices] = useState<number>(0);
  const [refundedInvoices, setRefundedInvoices] = useState<number>(0);
  const [openedAt, setOpenedAt] = useState<string>('');
  const [cashierName, setCashierName] = useState<string>('');
  const [cashierRole, setCashierRole] = useState<string>('');
  const [terminalNo, setTerminalNo] = useState<string>('#01');

  // Helper to format date cleanly
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      return `${hours}:${minutes}, ${day} Tháng ${month}, ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Load shift info on mount
  useEffect(() => {
    const activeShiftId = getShiftId();
    if (!activeShiftId) {
      navigate(ROUTES.shiftOpening);
      return;
    }
    setLocalShiftId(activeShiftId);

    const loadData = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        // 1. Get starting float & active shift metadata
        const activeRes = await getActiveCashierShift();
        if (activeRes?.data) {
          if (activeRes.data.starting_float !== undefined) {
            setStartingFloat(activeRes.data.starting_float);
          }
          if (activeRes.data.opened_at) {
            setOpenedAt(activeRes.data.opened_at);
          } else if (activeRes.data.openedAt) {
            setOpenedAt(activeRes.data.openedAt);
          }
          
          const employee = activeRes.data.employee;
          if (employee) {
            setCashierName(employee.fullName || employee.name || '');
            setCashierRole(employee.role || employee.roleName || '');
          }
          if (activeRes.data.terminal) {
            setTerminalNo(activeRes.data.terminal);
          }
        }

        // Fallback cashier details from authSession if not returned by API
        const authSession = getAuthSession();
        if (authSession?.user) {
          setCashierName(prev => prev || authSession.user.fullName || authSession.user.name || 'Nguyễn Văn A');
          setCashierRole(prev => prev || authSession.user.role || authSession.user.roleName || 'Nhân viên phục vụ');
        } else {
          setCashierName(prev => prev || 'Nguyễn Văn A');
          setCashierRole(prev => prev || 'Nhân viên phục vụ');
        }

        // 2. Pre-fetch shift reconciliation data
        const totalsRes = await getShiftReconciliation(activeShiftId);
        if (totalsRes?.data) {
          setExpectedCash(totalsRes.data.expected_cash_system ?? totalsRes.data.expectedCashSystem ?? 0);
          setCashSales(totalsRes.data.cash_sales ?? totalsRes.data.cashSales ?? 0);
          setCashRefunds(totalsRes.data.cash_refunds ?? totalsRes.data.cashRefunds ?? 0);
          
          setTotalInvoices(totalsRes.data.total_invoices ?? totalsRes.data.totalInvoices ?? 0);
          setRefundedInvoices(totalsRes.data.refunded_invoices ?? totalsRes.data.refundedInvoices ?? 0);
        }
      } catch (err: any) {
        // If there are pending orders or unpaid invoices
        const errorMsg = err.error || err.message || 'Lỗi tải dữ liệu ca làm việc.';
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Countdown timer for Step 2
  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setActualCashInput('');
      return;
    }
    const numericValue = parseInt(value, 10);
    setActualCashInput(numericValue.toLocaleString('vi-VN'));
  };

  const handleRequestClosure = async () => {
    if (!shiftId) return;

    const rawCash = actualCashInput.replace(/\./g, '');
    const actualCashCounted = parseInt(rawCash, 10);

    if (isNaN(actualCashCounted) || actualCashCounted < 0) {
      setErrorMessage('Vui lòng nhập số tiền hợp lệ');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await requestShiftClosure({ shiftId, actualCashCounted });
      if (res.success) {
        setStep(2);
        setTimeLeft(60);
      }
    } catch (err: any) {
      const errorMsg = err.error || err.message || 'Lỗi yêu cầu đóng ca.';
      setErrorMessage(errorMsg);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  };

  // OTP box input micro-interactions
  const handleOtpChange = (value: string, idx: number) => {
    const val = value.replace(/[^0-9]/g, '');
    const newOtp = [...otpCode];
    newOtp[idx] = val.slice(-1);
    setOtpCode(newOtp);

    // Auto-focus next field
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handleFinalizeClosure = async () => {
    if (!shiftId) return;

    const rawCash = actualCashInput.replace(/\./g, '');
    const actualCashCounted = parseInt(rawCash, 10);
    const code = otpCode.join('');

    if (code.length < 6) {
      setErrorMessage('Vui lòng nhập đầy đủ mã OTP 6 chữ số');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await finalizeShiftClosure({ shiftId, actualCashCounted, code });
      if (res.success && res.data) {
        setEodReport(res.data);
        setStep(3);
      }
    } catch (err: any) {
      const errorMsg = err.error || err.message || 'Xác thực OTP thất bại. Vui lòng kiểm tra lại.';
      setErrorMessage(errorMsg);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinish = () => {
    clearShiftId();
    clearAuthSession();
    navigate(ROUTES.cashierLogin);
  };

  const discrepancy = actualCashInput 
    ? parseInt(actualCashInput.replace(/\./g, ''), 10) - expectedCash
    : 0;

  return (
    <div className="bg-[#fef9ef] text-[#1d1c16] font-sans min-h-screen pb-16">
      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
            animation-iteration-count: 2;
        }
        .otp-input:focus {
            outline: none;
            border-color: #D4AF37;
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
        }
        .unbalanced-glow {
            animation: pulse-border 2s infinite;
        }
        @keyframes pulse-border {
            0% { border-color: rgba(186, 26, 26, 0.5); }
            50% { border-color: rgba(186, 26, 26, 1); }
            100% { border-color: rgba(186, 26, 26, 0.5); }
        }
        
        @media print {
            body * {
                visibility: hidden;
            }
            #printableReport, #printableReport * {
                visibility: visible;
            }
            #printableReport {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
        }
      `}</style>

      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white shadow-sm border-b border-line">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-primary font-display cursor-pointer" onClick={() => navigate(ROUTES.pos)}>Little Hogsmeade</h1>
          <nav className="hidden md:flex gap-6 ml-6">
            <span className="text-on-surface-variant font-semibold text-xs cursor-pointer hover:text-coffee" onClick={() => navigate(ROUTES.pos)}>Bán Hàng</span>
            <span className="text-on-surface-variant font-semibold text-xs cursor-pointer hover:text-coffee" onClick={() => navigate(ROUTES.invoices)}>Lịch sử Hóa Đơn</span>
            <span className="text-primary border-b-2 border-primary font-bold pb-1 text-xs">Đóng Ca</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 items-center px-3 py-1 bg-surface-container rounded-full text-on-surface-variant text-xs">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span>Ca Thu Ngân</span>
          </div>
          <button 
            onClick={() => navigate(ROUTES.pos)}
            className="border border-line bg-white text-coffee px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-cream transition-colors cursor-pointer"
          >
            Quay lại POS
          </button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {step !== 3 ? (
          <>
            {/* Title */}
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-coffee">Đóng Ca & Đối Soát</h2>
              <p className="text-muted text-sm mt-1">Vui lòng kiểm tra doanh thu hệ thống và xác nhận số dư thực tế tại két.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Transaction Summary & System Audit */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Transaction Summary Section */}
                <div className="bg-[#FAF8F5] border border-line rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6 border-b border-line pb-3">
                    <h3 className="font-bold text-coffee flex items-center gap-2 text-lg">
                      <span className="material-symbols-outlined text-xl">receipt_long</span>
                      Tổng quan giao dịch
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm text-coffee">
                    <div className="flex justify-between items-center py-2.5 border-b border-dashed border-line">
                      <span className="text-muted font-medium">Tổng số hóa đơn</span>
                      <span className="font-mono font-bold text-base">{totalInvoices}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-dashed border-line">
                      <span className="text-muted font-medium">Hóa đơn hoàn tiền</span>
                      <span className="font-mono font-bold text-base text-red-600">{refundedInvoices}</span>
                    </div>
                  </div>
                </div>

                {/* System Audit Ledger */}
                <div className="bg-[#FAF8F5] border border-line rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6 border-b border-line pb-3">
                    <h3 className="font-bold text-coffee flex items-center gap-2 text-lg">
                      <span className="material-symbols-outlined text-xl">analytics</span>
                      Sổ Cái Hệ Thống (System Audit)
                    </h3>
                    <span className="bg-latte/15 text-coffee text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md font-bold">Auto-Generated</span>
                  </div>
                  
                  <div className="space-y-4 text-sm text-coffee">
                    <div className="flex justify-between items-center py-2.5 border-b border-dashed border-line">
                      <span className="text-muted font-medium">Tiền mặt đầu ca</span>
                      <span className="font-mono font-bold text-base">{formatCurrency(startingFloat)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-dashed border-line">
                      <span className="text-muted font-medium">Doanh thu tiền mặt</span>
                      <span className="font-mono font-bold text-base">{formatCurrency(cashSales)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-dashed border-line text-red-600">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-base">remove_circle</span>
                        Tổng hoàn tiền mặt
                      </span>
                      <span className="font-mono font-bold text-base">-{formatCurrency(cashRefunds)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 mt-6 bg-[#f2ede3] px-4 rounded-xl">
                      <span className="font-bold text-coffee text-base">Tổng tiền mặt hệ thống</span>
                      <span className="font-mono font-bold text-lg text-primary">{formatCurrency(expectedCash)}</span>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-cream rounded-xl flex gap-3 items-start border border-line/40">
                    <span className="material-symbols-outlined text-muted mt-0.5">info</span>
                    <p className="text-xs text-muted leading-relaxed italic">
                      Lưu ý: "Tổng tiền mặt hệ thống" được tính bằng (Tiền mặt đầu ca + Doanh thu tiền mặt - Hoàn tiền). Báo cáo chi tiết về phương thức thanh toán khác (Thẻ, Chuyển khoản) sẽ được in kèm sau khi chốt ca.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Actual Counting Panel */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Cashier Info Card */}
                <div className="bg-[#FAF8F5] border border-line rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#D4AF37] text-xl">person</span>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted tracking-wider leading-none mb-1">Thu ngân</p>
                      <p className="text-sm font-bold text-coffee">
                        {cashierName} <span className="font-normal text-muted text-xs ml-1">({cashierRole})</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#D4AF37] text-xl">point_of_sale</span>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted tracking-wider leading-none mb-1">Quầy / Terminal</p>
                      <p className="text-sm font-bold text-coffee">{terminalNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#D4AF37] text-xl">calendar_today</span>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted tracking-wider leading-none mb-1">Thời gian mở ca</p>
                      <p className="text-sm font-bold text-coffee">{formatDateTime(openedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Step 1 panel */}
                <div className={cn("bg-white border border-line rounded-2xl p-6 shadow-sm transition-all", step === 2 && "opacity-60 pointer-events-none")}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-coffee text-lg">Kiểm đếm thực tế</h3>
                    {step === 2 && (
                      <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Đã gửi yêu cầu
                      </span>
                    )}
                  </div>
                  <div className={`mb-6 ${shake && step === 1 ? 'animate-shake' : ''}`}>
                    <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Số tiền mặt thực tế tại két</label>
                    <div className="relative">
                      <input 
                        className="w-full text-xl font-bold bg-[#FAF8F5] border border-line rounded-xl h-14 px-4 text-right pr-16 focus:ring-1 focus:ring-coffee focus:border-coffee outline-none transition-all"
                        placeholder="0" 
                        type="text" 
                        inputMode="numeric"
                        value={actualCashInput}
                        onChange={handleCashInputChange}
                        disabled={step === 2 || loading}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">VND</span>
                    </div>
                  </div>

                  {step === 1 && (
                    <button 
                      onClick={handleRequestClosure}
                      disabled={loading}
                      className="w-full h-12 bg-coffee text-white font-bold rounded-xl hover:bg-[#3f2d20] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                    >
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">lock_clock</span>
                          Yêu cầu Đóng ca (Request Closure)
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Step 2 Panel (Verification & Discrepancy Alert) */}
                {step === 2 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-md unbalanced-glow flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-600 text-3xl mt-0.5">warning</span>
                      <div>
                        <p className="font-bold uppercase text-[9px] tracking-widest text-red-600 mb-0.5">Alert: Discrepancy Verification Required</p>
                        <h4 className="font-bold text-coffee text-base">
                          {discrepancy !== 0 ? (
                            `CẢNH BÁO: Lệch két tiền ${discrepancy < 0 ? '-' : '+'}${formatCurrency(Math.abs(discrepancy))}`
                          ) : (
                            'Xác nhận đóng ca từ Quản lý'
                          )}
                        </h4>
                      </div>
                    </div>

                    <div className="bg-white/70 p-5 rounded-xl border border-red-200/50 flex flex-col items-center">
                      <p className="text-xs text-coffee font-medium text-center mb-4 leading-relaxed">
                        Chênh lệch hoặc đóng ca yêu cầu mã **Google Authenticator (TOTP)** từ **Quản lý**.
                      </p>
                      
                      <div className="flex justify-center gap-2 mb-4">
                        {otpCode.map((digit, idx) => (
                          <input 
                            key={idx}
                            id={`otp-${idx}`}
                            className="otp-input w-10 h-12 bg-white border border-line rounded-lg text-center font-mono font-bold text-xl text-coffee focus:border-coffee"
                            maxLength={1} 
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target.value, idx)}
                            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                            disabled={loading}
                          />
                        ))}
                      </div>

                      {timeLeft > 0 ? (
                        <p className="text-center text-xs text-muted">
                          Thời gian mã lực: <span className="font-bold text-coffee tabular-nums">{timeLeft}s</span>
                        </p>
                      ) : (
                        <button 
                          onClick={() => {
                            setTimeLeft(60);
                            setOtpCode(Array(6).fill(''));
                          }}
                          className="text-xs text-gold font-bold hover:underline cursor-pointer"
                        >
                          Làm mới OTP
                        </button>
                      )}
                    </div>

                    <button 
                      onClick={handleFinalizeClosure}
                      disabled={loading || otpCode.join('').length < 6}
                      className="w-full h-12 bg-[#4A3525] text-white font-bold rounded-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                          Đang xác thực...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">print</span>
                          Chốt ca & In báo cáo tài chính (EOD)
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-[10px] uppercase text-muted tracking-widest font-bold">
                      Requires Manager Level Authorization
                    </p>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                    <span className="material-symbols-outlined text-red-600 shrink-0">error</span>
                    <div className="flex-1 text-xs font-semibold text-red-600 leading-normal">
                      {errorMessage}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Step 3: Success EOD Report */
          <div className="max-w-2xl mx-auto bg-white border border-line rounded-3xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300" id="printableReport">
            {/* Receipt Header */}
            <div className="bg-[#FAF8F5] border-b border-line p-8 text-center relative">
              <span className="material-symbols-outlined text-green-600 text-5xl mb-2">check_circle</span>
              <h2 className="font-display text-2xl font-bold text-coffee">BÁO CÁO KẾT THÚC CA (EOD)</h2>
              <p className="text-xs text-muted font-bold uppercase tracking-wider mt-1">Little Hogsmeade Central</p>
              
              <button 
                onClick={handlePrint}
                className="absolute top-4 right-4 p-2 hover:bg-cream rounded-full transition-colors text-coffee print:hidden cursor-pointer"
                title="In báo cáo"
              >
                <span className="material-symbols-outlined text-xl">print</span>
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-8 space-y-6 text-sm text-coffee">
              {/* Meta information */}
              <div className="grid grid-cols-2 gap-4 border-b border-line pb-4 text-xs">
                <div>
                  <span className="text-muted font-bold uppercase block tracking-wider text-[10px]">Mã ca trực</span>
                  <span className="font-mono text-coffee font-semibold">{eodReport?.shift?.id}</span>
                </div>
                <div>
                  <span className="text-muted font-bold uppercase block tracking-wider text-[10px]">Thời gian chốt</span>
                  <span className="text-coffee font-semibold">{new Date(eodReport?.summary?.closedAt).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-muted font-bold uppercase block tracking-wider text-[10px]">Thu ngân</span>
                  <span className="text-coffee font-semibold">{eodReport?.shift?.employee?.fullName}</span>
                </div>
                <div>
                  <span className="text-muted font-bold uppercase block tracking-wider text-[10px]">Quản lý xác thực</span>
                  <span className="text-coffee font-semibold">{eodReport?.shift?.authorizedAdmin?.fullName || 'Hệ thống'}</span>
                </div>
              </div>

              {/* Financial calculations */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-widest text-xs text-muted mb-2">Tóm tắt két tiền mặt</h4>
                <div className="flex justify-between py-1 border-b border-dashed border-line/60">
                  <span className="text-muted">Tiền mặt đầu ca</span>
                  <span className="font-mono font-medium">{formatCurrency(eodReport?.summary?.startingFloat || 0)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-line/60">
                  <span className="text-muted">Tổng doanh thu tiền mặt</span>
                  <span className="font-mono font-medium">{formatCurrency(cashSales)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-line/60 text-red-600">
                  <span className="text-red-600">Tổng hoàn tiền mặt</span>
                  <span className="font-mono font-medium">-{formatCurrency(cashRefunds)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-line/60">
                  <span className="text-muted">Số dư hệ thống mong đợi</span>
                  <span className="font-mono font-bold text-[#735c00]">{formatCurrency(eodReport?.summary?.expectedCashSystem || 0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-line bg-cream px-3 rounded-lg">
                  <span className="font-bold">Tiền mặt thực tế kiểm đếm</span>
                  <span className="font-mono font-bold text-lg">{formatCurrency(eodReport?.summary?.actualCashCounted || 0)}</span>
                </div>
              </div>

              {/* Discrepancy indicator */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${eodReport?.summary?.discrepancyAmount !== 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">{eodReport?.summary?.discrepancyAmount !== 0 ? 'warning' : 'check_circle'}</span>
                  <span className="font-bold text-xs uppercase tracking-wider">Chênh lệch két (Variance)</span>
                </div>
                <span className="font-mono font-bold text-base">
                  {eodReport?.summary?.discrepancyAmount === 0 ? 'KHỚP KÉT (0 ₫)' : `${eodReport?.summary?.discrepancyAmount > 0 ? '+' : ''}${formatCurrency(eodReport?.summary?.discrepancyAmount)}`}
                </span>
              </div>

              {/* Sales analytics info */}
              <div className="space-y-2 border-t border-line/60 pt-4 text-xs">
                <p>Tổng số đơn hàng phục vụ: <span className="font-bold">{eodReport?.orders?.length || 0} đơn</span></p>
                <p>Tổng số hóa đơn phát sinh: <span className="font-bold">{eodReport?.invoices?.length || 0} hóa đơn</span></p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-6 print:hidden">
                <button 
                  onClick={handleFinish}
                  className="w-full h-12 bg-coffee text-white font-bold rounded-xl hover:bg-[#3f2d20] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Hoàn tất & Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Atmospheric Visual Element */}
        <div className="mt-12 border-t border-line pt-12 flex justify-center items-center gap-12 grayscale opacity-30 print:hidden">
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl">coffee</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Brews</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl">bakery_dining</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Pastries</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl">receipt_long</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Shift Logs</span>
          </div>
        </div>
      </main>
    </div>
  );
}
