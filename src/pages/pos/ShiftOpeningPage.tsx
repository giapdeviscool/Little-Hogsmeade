import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

export function ShiftOpeningPage() {
  const navigate = useNavigate()
  const [realTimeClock, setRealTimeClock] = useState('--/--/---- - --:--')
  const [floatValue, setFloatValue] = useState('')
  const [error, setError] = useState(false)
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
      setError(false)
      return
    }

    const numericValue = parseInt(value, 10)
    setFloatValue(numericValue.toLocaleString('vi-VN'))

    if (numericValue >= 0) {
      setError(false)
    }
  }

  const handleConfirm = () => {
    const rawValue = floatValue.replace(/\./g, '')
    const value = parseInt(rawValue, 10)

    if (isNaN(value) || value < 0) {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 400)
    } else {
      setIsSubmitting(true)

      setTimeout(() => {
        setIsSuccess(true)
        setTimeout(() => {
          navigate(ROUTES.pos)
        }, 500)
      }, 1000)
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
        className={`fixed inset-0 z-50 flex items-center justify-center bg-coffee/40 backdrop-blur-md p-4 sm:p-6 md:p-8 transition-opacity duration-500 ${isSuccess ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="bg-white w-11/12 max-w-md sm:max-w-lg md:max-w-xl max-h-[95vh] rounded-2xl shadow-soft flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="w-full overflow-y-auto custom-scrollbar flex flex-col">
            <div className="h-24 sm:h-28 md:h-32 w-full overflow-hidden relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-coffee/80 via-coffee/30 to-transparent z-10" />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKyclJepVyrLIa8S34bRlyESJ3e0DAbRfpedJ9vxkW2AZFQI4wdxNMTApn6XiXb5WaYo0LqoqxHnuJDkF34Bdug3bfP-nhwRZrDcbKL8RanIJuf-ORauVSfD3zBYM5dIeu5YpGNcpLjTFC07PXXfzouBXXG1Vh6MTIHCTk8SOrqgj7oDWMFXeFgssPP1bE09PiPdR4H0jKOzXQ_GLy-Sl3bo32exUnjjhEE-3o0FQJDvfd3S4GUQgSiU1JNAY82LNndStdb5dUrE3j')" }}
              />
              <div className="absolute bottom-3 sm:bottom-4 left-5 sm:left-6 md:left-8 z-20">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-0.5 sm:mb-1">Little Hogsmeade</h1>
                <p className="text-xs font-bold text-white/80 uppercase tracking-[0.12em]">Bán hàng & Thu ngân</p>
              </div>
            </div>

            <div className="px-5 sm:px-8 md:px-10 py-5 sm:py-6 flex flex-col gap-4 md:gap-5 shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-coffee mb-1 sm:mb-1.5 md:mb-2">Khởi tạo ca làm việc mới</h2>
                <p className="text-xs sm:text-sm md:text-base font-medium text-muted">Chào mừng trở lại! Vui lòng kiểm tra thông tin và nhập số dư tiền mặt để bắt đầu ca.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 bg-cream p-4 sm:p-5 rounded-2xl border border-[rgba(74,53,37,0.06)]">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted block uppercase tracking-[0.12em]">Chi nhánh</span>
                  <div className="flex items-center gap-1.5 text-coffee">
                    <span className="material-symbols-outlined text-base sm:text-lg md:text-xl">store</span>
                    <span className="text-sm font-bold">Hogsmeade Central</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted block uppercase tracking-[0.12em]">Thu ngân</span>
                  <div className="flex items-center gap-1.5 text-coffee">
                    <span className="material-symbols-outlined text-base sm:text-lg md:text-xl">person</span>
                    <span className="text-sm font-bold">Nhân viên trực ca</span>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1 border-t border-[rgba(74,53,37,0.06)] pt-3 mt-0.5">
                  <span className="text-xs font-bold text-muted block uppercase tracking-[0.12em]">Thời gian hệ thống</span>
                  <div className="flex items-center gap-1.5 md:gap-2 text-coffee">
                    <span className="material-symbols-outlined text-base sm:text-lg md:text-xl">schedule</span>
                    <span className="text-sm font-bold tabular-nums">{realTimeClock}</span>
                  </div>
                </div>
              </div>

              <div className={`flex flex-col gap-2 sm:gap-3 ${shake ? 'animate-shake' : ''}`}>
                <label className="text-sm sm:text-base font-bold text-coffee flex items-center gap-1.5">
                  Số tiền mặt đầu ca (Starting Float)
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="0 VND"
                    value={floatValue}
                    onChange={handleInputChange}
                    className={`w-full h-12 sm:h-14 px-4 sm:px-5 bg-white border ${error ? 'border-red-500' : 'border-[rgba(74,53,37,0.12)]'} rounded-xl text-base sm:text-lg md:text-xl font-bold text-coffee focus:border-coffee focus:ring-1 focus:ring-coffee outline-none transition-all placeholder:text-muted/50 text-right pr-10 sm:pr-12`}
                  />
                  <span className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 font-bold text-muted">₫</span>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-500/20 p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined text-base sm:text-lg text-red-600">error</span>
                    <span className="text-red-600 text-xs sm:text-sm font-bold">Vui lòng nhập số tiền hợp lệ</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:gap-3 pt-1">
                <button 
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-full h-12 sm:h-14 bg-coffee text-white font-bold text-sm sm:text-base rounded-xl shadow-soft hover:bg-[#3f2d20] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-base sm:text-lg md:text-xl">progress_activity</span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base sm:text-lg md:text-xl">lock_open</span>
                      Xác nhận & Mở ca
                    </>
                  )}
                </button>
                <button 
                  onClick={handleLogout}
                  disabled={isSubmitting}
                  className="w-full h-12 sm:h-14 border border-[rgba(74,53,37,0.12)] bg-white text-coffee text-sm sm:text-base hover:bg-cream transition-colors font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg md:text-xl">logout</span>
                  Đăng xuất
                </button>
              </div>
            </div>

            <div className="bg-cream border-t border-[rgba(74,53,37,0.06)] px-5 sm:px-8 md:px-10 py-3 sm:py-4 text-center shrink-0">
              <p className="text-xs sm:text-sm font-semibold text-muted">Hệ thống ghi nhận hành động này để phục vụ mục đích đối soát.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
