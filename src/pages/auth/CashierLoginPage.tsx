import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../api/auth.api'
import { saveAuthSession } from '../../store/auth.store'
import { ROUTES } from '../../constants/routes'

export function CashierLoginPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')

    try {
      const response = await login({ identifier: email, password })

      if (!response.data) {
        throw new Error(response.error || 'Unable to authenticate')
      }

      saveAuthSession(response.data)
      setIsSuccess(true)

      // Transition effect and redirect
      setTimeout(() => {
        navigate(ROUTES.shiftOpening)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to server')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="text-coffee font-sans min-h-screen w-full flex items-center justify-center p-8 relative overflow-hidden">
      {/* Blurred Bistro Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=85')" }}
        />
        <div className="absolute inset-0 bg-coffee/40 backdrop-blur-sm" />
      </div>

      {/* Login Container */}
      <main className="w-full max-w-[480px] relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_14px_40px_rgba(74,53,37,0.12)] border border-white/20 flex flex-col items-center px-10 py-12 gap-8 animate-in fade-in zoom-in duration-500">
          
          {/* Header Section */}
          <header className="text-center space-y-2">
            <h1 className="text-[32px] font-bold tracking-tight text-coffee">Little Hogsmeade</h1>
            <p className="text-xs font-bold tracking-[0.12em] text-muted uppercase">Hệ thống Quản lý Bán hàng</p>
          </header>

          {/* User Profile Selection */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-cream p-1 shadow-sm bg-white">
                <img 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8l7Beop4J9uu3TOftKj7EGG0Zm51qFI4Up0_IHr2Eo_x1aoCuFPjmfEqSYIPoSgLzAHoAnH77_w8QhCH2KJq6l9ON0Um3KP7P8ilUrWQzoUbOLmi5kllbeYelsNKSWG7R9bGivsPf3yqePgN5pfpu84m3nHNyFsWsYIrRR2treF39f7_Vi6cU8I72OrZYySqqjRDIw1QaoWz1rgAOwapNdvTdbGTQTotK4gtyieZkhuDSXQlJsc5P0M5flQAeLEMCZGzyDUejyOk5" 
                />
              </div>
              {/* <div className="absolute -bottom-1 -right-1 bg-coffee text-white p-1 rounded-full border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
              </div> */}
            </div>
            <div className="text-center">
              <h2 className="text-[20px] font-bold text-coffee">Đăng Nhập POS</h2>
            </div>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-[0.12em] text-muted uppercase ml-1">Email</label>
              <input 
                name="email"
                type="email" 
                required
                placeholder="name@littlehogsmeade.com" 
                className="w-full h-14 px-5 rounded-xl bg-cream border border-[rgba(74,53,37,0.12)] text-coffee focus:border-coffee focus:ring-1 focus:ring-coffee outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-[0.12em] text-muted uppercase ml-1">Mật khẩu</label>
              <input 
                name="password"
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full h-14 px-5 rounded-xl bg-cream border border-[rgba(74,53,37,0.12)] text-coffee focus:border-coffee focus:ring-1 focus:ring-coffee outline-none transition-all"
              />
            </div>
            
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 text-center">{error}</p>}

            <div className="w-full pt-2">
              <button 
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="w-full h-14 bg-coffee text-white rounded-xl font-bold text-[16px] shadow-[0_10px_20px_rgba(74,53,37,0.15)] active:scale-95 transition-all hover:bg-[#3f2d20] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          {/* Footer Text */}
          <footer className="text-center w-full mt-2">
            <div className="flex justify-center">
              <button 
                onClick={() => navigate(ROUTES.login)}
                className="text-muted hover:text-coffee font-semibold flex items-center gap-1.5 text-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Quay lại
              </button>
            </div>
          </footer>
        </div>
      </main>

      {/* Success Modal Overlay */}
      <div 
        className={`fixed inset-0 bg-coffee/60 backdrop-blur-md z-50 flex items-center justify-center transition-opacity duration-300 ${
          isSuccess ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl p-10 max-w-[340px] w-full text-center shadow-2xl border border-line">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[48px]">check_circle</span>
          </div>
          <h3 className="text-[24px] font-bold text-coffee">Thành công</h3>
          <p className="text-[15px] font-medium text-muted mt-2 mb-8">Chào mừng quay trở lại. Đang mở ca làm việc...</p>
          <div className="animate-spin h-8 w-8 border-4 border-coffee border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    </div>
  )
}
