import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { getAuthSession } from '../../store/auth.store'
import { openCashierShift } from '../../api/shift.api'
import { setShiftId } from '../../store/shift.store'

export function ShiftOpeningPage() {
  const navigate = useNavigate()
  const session = getAuthSession()
  const cashierName = session?.user?.fullName || session?.user?.name || session?.user?.phone || 'Nhân viên trực ca'

  const [realTimeClock, setRealTimeClock] = useState('--/--/---- - --:--')
  const [floatValue, setFloatValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')

      setRealTimeClock(`${day}/${month}/${year} - ${hours}:${minutes}`)
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '')

    if (value === '') {
      setFloatValue('')
      setErrorMessage('')
      return
    }

    const numericValue = parseInt(value, 10)
    setFloatValue(numericValue.toLocaleString('vi-VN'))

    if (numericValue >= 0) {
      setErrorMessage('')
    }
  }

  const handleConfirm = async () => {
    const rawValue = floatValue.replace(/\./g, '')
    const value = parseInt(rawValue, 10)

    if (isNaN(value) || value < 0) {
      setErrorMessage('Vui lòng nhập số tiền hợp lệ')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await openCashierShift(value)
      if (response?.data?.shift_id) {
        setShiftId(response.data.shift_id)
        setIsSuccess(true)
        setTimeout(() => {
          navigate(ROUTES.pos)
        }, 500)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi mở ca. Vui lòng thử lại.')
      setShake(true)
      setTimeout(() => setShake(false), 400)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    navigate(ROUTES.cashierLogin)
  }

  return (
    <div className="bg-canvas font-sans text-coffee overflow-hidden min-h-screen">
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
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(74,53,37,0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(74,53,37,0.3);
        }
      `}</style>

      {/* Full-screen Lock Overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-coffee/40 backdrop-blur-md p-4 transition-opacity duration-500 ${isSuccess ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="bg-white w-11/12 max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] rounded-2xl shadow-soft flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="w-full overflow-y-auto custom-scrollbar flex flex-col">
            <div className="h-20 sm:h-24 md:h-26 w-full overflow-hidden relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-coffee/80 via-coffee/30 to-transparent z-10" />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKyclJepVyrLIa8S34bRlyESJ3e0DAbRfpedJ9vxkW2AZFQI4wdxNMTApn6XiXb5WaYo0LqoqxHnuJDkF34Bdug3bfP-nhwRZrDcbKL8RanIJuf-ORauVSfD3zBYM5dIeu5YpGNcpLjTFC07PXXfzouBXXG1Vh6MTIHCTk8SOrqgj7oDWMFXeFgssPP1bE09PiPdR4H0jKOzXQ_GLy-Sl3bo32exUnjjhEE-3o0FQJDvfd3S4GUQgSiU1JNAY82LNndStdb5dUrE3j')" }}
              />
              <div className="absolute bottom-2.5 sm:bottom-3.5 left-4 sm:left-5 md:left-6 z-20">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white mb-0.5">Little Hogsmeade</h1>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.12em]">Bán hàng & Thu ngân</p>
              </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex flex-col gap-3 sm:gap-4 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-coffee mb-1">Khởi tạo ca làm việc mới</h2>
                <p className="text-[11px] sm:text-xs md:text-sm font-medium text-muted">Chào mừng trở lại! Vui lòng kiểm tra thông tin và nhập số dư tiền mặt để bắt đầu ca.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 bg-cream p-3 sm:p-4 rounded-xl border border-[rgba(74,53,37,0.06)]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted block uppercase tracking-[0.12em]">Chi nhánh</span>
                  <div className="flex items-center gap-1 text-coffee">
                    <span className="material-symbols-outlined text-sm sm:text-base">store</span>
                    <span className="text-xs sm:text-sm font-bold">Hogsmeade Central</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted block uppercase tracking-[0.12em]">Thu ngân</span>
                  <div className="flex items-center gap-1 text-coffee">
                    <span className="material-symbols-outlined text-sm sm:text-base">person</span>
                    <span className="text-xs sm:text-sm font-bold">{cashierName}</span>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-0.5 border-t border-[rgba(74,53,37,0.06)] pt-2.5 mt-0.5">
                  <span className="text-[10px] font-bold text-muted block uppercase tracking-[0.12em]">Thời gian hệ thống</span>
                  <div className="flex items-center gap-1 text-coffee">
                    <span className="material-symbols-outlined text-sm sm:text-base">schedule</span>
                    <span className="text-xs sm:text-sm font-bold tabular-nums">{realTimeClock}</span>
                  </div>
                </div>
              </div>

              <div className={`flex flex-col gap-1.5 sm:gap-2 ${shake ? 'animate-shake' : ''}`}>
                <label className="text-xs sm:text-sm font-bold text-coffee flex items-center gap-1">
                  Số tiền mặt đầu ca (Starting Float)
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="0 VND"
                    value={floatValue}
                    onChange={handleInputChange}
                    className={`w-full h-10 sm:h-11 md:h-12 px-3 sm:px-4 bg-white border ${errorMessage ? 'border-red-500' : 'border-[rgba(74,53,37,0.12)]'} rounded-lg text-sm sm:text-base md:text-lg font-bold text-coffee focus:border-coffee focus:ring-1 focus:ring-coffee outline-none transition-all placeholder:text-muted/50 text-right pr-8 sm:pr-10`}
                  />
                  <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 font-bold text-muted text-sm">₫</span>
                </div>
                
                {errorMessage && (
                  <div className="bg-red-50 border border-red-500/20 p-2.5 sm:p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined text-sm sm:text-base text-red-600">error</span>
                    <span className="text-red-600 text-[10px] sm:text-xs font-bold">{errorMessage}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-0.5">
                <button 
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-full h-10 sm:h-11 bg-coffee text-white font-bold text-xs sm:text-sm rounded-lg shadow-soft hover:bg-[#3f2d20] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm sm:text-base">progress_activity</span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm sm:text-base">lock_open</span>
                      Xác nhận & Mở ca
                    </>
                  )}
                </button>
                <button 
                  onClick={handleLogout}
                  disabled={isSubmitting}
                  className="w-full h-10 sm:h-11 border border-[rgba(74,53,37,0.12)] bg-white text-coffee text-xs sm:text-sm hover:bg-cream transition-colors font-bold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-sm sm:text-base">logout</span>
                  Đăng xuất
                </button>
              </div>
            </div>

            <div className="bg-cream border-t border-[rgba(74,53,37,0.06)] px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-center shrink-0">
              <p className="text-[10px] sm:text-xs font-semibold text-muted">Hệ thống ghi nhận hành động này để phục vụ mục đích đối soát.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
