import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { getAuthSession, clearAuthSession } from '../../store/auth.store'
import { getActiveCashierShift } from '../../api/shift.api'
import { setShiftId } from '../../store/shift.store'
import { verify2FA } from '@/api/otp.api'

export function ShiftResumePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getAuthSession()
  const cashierName = session?.user?.fullName || session?.user?.name || session?.user?.phone || 'Nhân viên trực ca'

  const [activeShift, setActiveShift] = useState<any>(location.state?.activeShift || null)
  const [showOtp, setShowOtp] = useState(false)
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [shake, setShake] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // If we didn't receive state, check active shift now
    if (!activeShift) {
      const fetchActive = async () => {
        try {
          const response = await getActiveCashierShift()
          if (response?.data?.active && response?.data?.shift_id) {
            setActiveShift(response.data)
          } else {
            // No active shift, redirect to shift opening
            navigate(ROUTES.shiftOpening)
          }
        } catch (err) {
          console.error('Error fetching active shift:', err)
          navigate(ROUTES.shiftOpening)
        }
      }
      fetchActive()
    }
  }, [activeShift, navigate])

  const handleOtpChange = (value: string, idx: number) => {
    const val = value.replace(/[^0-9]/g, '')
    const newOtp = [...otpCode]
    newOtp[idx] = val.slice(-1)
    setOtpCode(newOtp)

    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-resume-${idx + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-resume-${idx - 1}`)
      prevInput?.focus()
    }
  }

  const handleConfirmYes = () => {
    setShowOtp(true)
    setErrorMessage('')
    setTimeout(() => {
      document.getElementById('otp-resume-0')?.focus()
    }, 100)
  }

  const handleCancel = () => {
    clearAuthSession()
    navigate(ROUTES.cashierLogin)
  }

  const handleVerifyOtp = async () => {
    const code = otpCode.join('')
    if (code.length < 6) {
      setErrorMessage('Vui lòng nhập đầy đủ mã OTP 6 chữ số')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    if (attemptsLeft <= 0) {
      setErrorMessage('Bạn đã nhập sai quá 3 lần. Vui lòng liên hệ quản trị viên.')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const res = await verify2FA(code)
      if (res.success) {
        setIsSuccess(true)
        if (activeShift?.shift_id) {
          setShiftId(activeShift.shift_id)
        }
        setTimeout(() => {
          navigate(ROUTES.pos)
        }, 1200)
      } else {
        throw new Error(res.message || 'Mã xác thực không chính xác.')
      }
    } catch (err: any) {
      const newAttempts = attemptsLeft - 1
      setAttemptsLeft(newAttempts)
      setOtpCode(Array(6).fill(''))
      
      if (newAttempts <= 0) {
        setErrorMessage('Bạn đã nhập sai 3 lần. Thao tác đã bị khóa.')
      } else {
        setErrorMessage(`Mã xác thực không chính xác. Bạn còn ${newAttempts} lần thử.`)
      }
      
      setShake(true)
      setTimeout(() => {
        setShake(false)
        document.getElementById('otp-resume-0')?.focus()
      }, 400)
    } finally {
      setLoading(false)
    }
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
        .otp-input:focus {
            outline: none;
            border-color: #D4AF37;
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="bg-white w-11/12 max-w-sm sm:max-w-md rounded-2xl shadow-soft flex flex-col overflow-hidden animate-in zoom-in duration-300">
          <div className="w-full overflow-y-auto custom-scrollbar flex flex-col">
            
            {/* Header Section with Bistro background */}
            <div className="h-20 sm:h-24 w-full overflow-hidden relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-coffee/80 via-coffee/30 to-transparent z-10" />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=85')" }}
              />
              <div className="absolute bottom-2.5 left-4 z-20">
                <h1 className="text-base sm:text-lg font-bold text-white mb-0.5">Little Hogsmeade</h1>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.12em]">Phục hồi ca làm việc</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4 sm:px-6 py-5 flex flex-col gap-4 shrink-0">
              
              {!showOtp ? (
                // Step 1: Confirmation
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-bold text-coffee">Hiện đang có ca làm việc mở</h2>
                    <p className="text-xs text-muted">
                      Hệ thống ghi nhận có một ca làm việc của thủ quỹ/thu ngân đang mở tại chi nhánh này. Bạn có muốn tiếp tục ca làm việc đó không?
                    </p>
                  </div>

                  <div className="bg-cream p-3 sm:p-4 rounded-xl border border-[rgba(74,53,37,0.06)] space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted font-medium">Thu ngân:</span>
                      <span className="font-bold text-coffee">{cashierName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted font-medium">Thời gian bắt đầu:</span>
                      <span className="font-bold text-coffee">
                        {activeShift?.opened_at ? new Date(activeShift.opened_at).toLocaleString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted font-medium">Số dư ban đầu:</span>
                      <span className="font-bold text-coffee">
                        {activeShift?.starting_float ? `${activeShift.starting_float.toLocaleString('vi-VN')} ₫` : '0 ₫'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={handleConfirmYes}
                      className="w-full h-10 sm:h-11 bg-coffee text-white font-bold text-xs sm:text-sm rounded-lg shadow-soft hover:bg-[#3f2d20] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-base">restore</span>
                      Có, tiếp tục ca làm việc
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full h-10 sm:h-11 border border-[rgba(74,53,37,0.12)] bg-white text-coffee text-xs sm:text-sm hover:bg-cream transition-colors font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-base">cancel</span>
                      Hủy bỏ & Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                // Step 2: Admin OTP Verification
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-bold text-coffee">Xác thực mã PIN</h2>
                    <p className="text-xs text-muted">
                      Để tiếp tục ca làm việc, vui lòng nhập mã PIN xác thực của Quản lý / Thu ngân.
                    </p>
                  </div>

                  <div className={`flex flex-col items-center bg-cream p-4 rounded-xl border border-[rgba(74,53,37,0.06)] ${shake ? 'animate-shake' : ''}`}>
                    <div className="flex justify-center gap-2 mb-3">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-resume-${idx}`}
                          className="otp-input w-10 h-12 bg-white border border-[rgba(74,53,37,0.12)] rounded-lg text-center font-mono font-bold text-xl text-coffee focus:border-coffee"
                          maxLength={1}
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                          disabled={loading || attemptsLeft <= 0 || isSuccess}
                        />
                      ))}
                    </div>

                    {errorMessage && (
                      <div className="bg-red-50 border border-red-500/20 p-2.5 rounded-lg flex items-center gap-2 mt-2 w-full">
                        <span className="material-symbols-outlined text-sm text-red-600">error</span>
                        <span className="text-red-600 text-[10px] sm:text-xs font-bold">{errorMessage}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || otpCode.join('').length < 6 || attemptsLeft <= 0 || isSuccess}
                      className="w-full h-10 sm:h-11 bg-coffee text-white font-bold text-xs sm:text-sm rounded-lg shadow-soft hover:bg-[#3f2d20] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                          Đang xác thực...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">lock_open</span>
                          Xác nhận mã PIN
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowOtp(false)
                        setOtpCode(Array(6).fill(''))
                        setErrorMessage('')
                      }}
                      disabled={loading || isSuccess}
                      className="w-full h-10 sm:h-11 border border-[rgba(74,53,37,0.12)] bg-white text-coffee text-xs sm:text-sm hover:bg-cream transition-colors font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="bg-cream border-t border-[rgba(74,53,37,0.06)] py-2.5 text-center shrink-0">
              <p className="text-[10px] font-semibold text-muted">Hệ thống ghi nhận hành động này để phục vụ mục đích đối soát.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Overlay */}
      <div 
        className={`fixed inset-0 bg-coffee/60 backdrop-blur-md z-50 flex items-center justify-center transition-opacity duration-300 ${
          isSuccess ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl p-6 max-w-[280px] w-full text-center shadow-2xl border border-line">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="material-symbols-outlined text-[38px]">check_circle</span>
          </div>
          <h3 className="text-[20px] font-bold text-coffee">Thành công</h3>
          <p className="text-[13px] font-medium text-muted mt-1.5 mb-6">Mã PIN chính xác. Đang chuyển hướng vào POS...</p>
          <div className="animate-spin h-7 w-7 border-4 border-coffee border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    </div>
  )
}
