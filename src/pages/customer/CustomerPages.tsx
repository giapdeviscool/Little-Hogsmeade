import { useEffect, useMemo, useState, useRef, type FormEvent } from 'react'
import { BookingSection } from '../landing/components/BookingSection'
import { EventSection } from '../landing/components/EventSection'
import { PublicMenuSection } from './components/PublicMenuSection'
import { StoreAndMemberSection } from '../landing/components/StoreAndMemberSection'
import { StorySection } from '../landing/components/StorySection'
import {
  getOpeningHoursBlock,
  normalizeBranches,
  normalizeList,
} from '../landing/landing.utils'
import type { BookingDraft } from '../landing/landing.types'
import { listEvents, listPages, listPosts } from '../../api/cms.api'
import { checkCustomerPhone, customerLogin, getPointTransactions, getActiveVouchers, getCustomerVouchers, redeemLoyaltyRewardApi } from '../../api/customer.api'
import { getBranchesPublic as getBranches, getTopSellingMenu } from '../../api/public-menu.api'
import { getCustomerLoyaltyRewards } from '../../api/loyalty.api'
import type { Branch, CmsPage, Event, Post, LoyaltyReward } from '../../types'
import type { Customer, CustomerMembership, PointTransaction } from '../../types/customer.types'
import { formatVnDate, formatVnDateTime } from '../../utils/date'
import { Eye, Gift, Award, History, Ticket } from 'lucide-react'
import { PostDetailModal } from '../../components/customer/DetailModals'
import { cn } from '../../utils/cn'

function PinOtpInput({ value, onChange, disabled, autoFocus }: { value: string; onChange: (v: string) => void; disabled?: boolean; autoFocus?: boolean }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  
  useEffect(() => {
    if (autoFocus && !disabled) {
      setTimeout(() => {
        inputs.current[0]?.focus()
      }, 100)
    }
  }, [autoFocus, disabled])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) {
      const arr = value.split('')
      arr[i] = ''
      onChange(arr.join(''))
      return
    }
    const char = val[val.length - 1]
    const arr = value.split('')
    arr[i] = char
    const newStr = arr.join('').slice(0, 6)
    onChange(newStr)
    
    if (i < 5 && char) {
      inputs.current[i + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  return (
    <div className="flex justify-between gap-2 w-full mx-auto max-w-[340px]">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          autoFocus={i === 0}
          className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-xl border border-line bg-white outline-none focus:border-coffee shadow-soft disabled:opacity-50"
        />
      ))}
    </div>
  )
}

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadiusKm = 6371
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}


export function CustomerMenuPage() {
  const [topSellingMenu, setTopSellingMenu] = useState<any[]>([])

  useEffect(() => {
    let alive = true
    getTopSellingMenu().then((t) => {
      if (alive) {
        setTopSellingMenu(t.data || [])
      }
    })
    return () => { alive = false }
  }, [])

  return (
    <>
      <PublicMenuSection topSellingMenu={topSellingMenu} />
    </>
  )
}

export function CustomerEventsPage() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    let alive = true
    listEvents().then((res) => {
      if (alive && res.data) {
        setEvents(normalizeList<Event>(res.data))
      }
    })
    return () => { alive = false }
  }, [])

  return (
    <>
      <EventSection events={events} className="border-b border-line bg-white py-20 md:py-24" />
    </>
  )
}

export function CustomerPromotionsPage() {
  const [activeTab, setActiveTab] = useState<'vouchers' | 'rewards' | 'my_vouchers'>('vouchers')
  const [vouchers, setvouchers] = useState<any[]>([])
  const [myVouchers, setMyVouchers] = useState<any[]>([])
  const [rewards, setRewards] = useState<LoyaltyReward[]>([])
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [authStep, setAuthStep] = useState<'phone' | 'pin'>('phone')
  const [authStatus, setAuthStatus] = useState<'not_found' | 'no_pin' | 'has_pin' | 'locked'>('has_pin')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [pin, setPin] = useState('')
  const [fullName, setFullName] = useState('')
  const [isChangingPin, setIsChangingPin] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [membership, setMembership] = useState<CustomerMembership | null>(null)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{type: 'success' | 'error', msg: string} | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([
      getActiveVouchers().catch(() => ({ data: [] })),
      getCustomerLoyaltyRewards().catch(() => [])
    ]).then(([voucherRes, rewardsRes]) => {
      if (alive) {
        setvouchers(voucherRes.data || [])
        setRewards(rewardsRes || [])
        setLoading(false)
      }
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 10000)
      return () => clearTimeout(timer)
    }
  }, [notice])

  async function handleCheckPhone(e: FormEvent) {
    e.preventDefault()
    if (!phone) return
    setIsAuthenticating(true)
    try {
      const res = await checkCustomerPhone(phone)
      setAuthStatus(res.status)
      if (res.customer?.fullName) {
        setFullName(res.customer.fullName)
      }
      if (res.status === 'locked') {
        setNotice({ type: 'error', msg: 'Tài khoản của bạn đã bị khóa mã PIN. Vui lòng đến cửa hàng để được hỗ trợ.' })
      } else {
        setAuthStep('pin')
      }
    } catch {
      setNotice({ type: 'error', msg: 'Lỗi khi kiểm tra số điện thoại.' })
    } finally {
      setIsAuthenticating(false)
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!phone || !pin) return
    if (authStatus === 'not_found' && !fullName) {
      setNotice({ type: 'error', msg: 'Vui lòng nhập họ tên.' })
      return
    }

    setIsAuthenticating(true)
    try {
      const res = await customerLogin({ phone, pin, fullName: authStatus === 'not_found' ? fullName : undefined })
      if (res.data) {
        const fullProfile = res.data as any
        setCustomer(fullProfile)
        
        if (fullProfile.customerMemberships && fullProfile.customerMemberships.length > 0) {
          setMembership(fullProfile.customerMemberships[0])
        }
        
        const myVouchersRes = await getCustomerVouchers(fullProfile.id)
        setMyVouchers(myVouchersRes.data || [])
        setNotice({ type: 'success', msg: 'Đăng nhập thành công!' })
      }
    } catch (error: any) {
      setNotice({ type: 'error', msg: error?.message || 'Lỗi đăng nhập. Vui lòng kiểm tra lại.' })
    } finally {
      setIsAuthenticating(false)
    }
  }

  async function handleChangePin(e: FormEvent) {
    e.preventDefault()
    if (oldPin.length < 6 || newPin.length < 6) return
    setIsAuthenticating(true)
    try {
      const { changeCustomerPin } = await import('../../api/customer.api')
      await changeCustomerPin({ oldPin, newPin })
      setNotice({ type: 'success', msg: 'Đổi mã PIN thành công!' })
      setIsChangingPin(false)
      setOldPin('')
      setNewPin('')
    } catch (error: any) {
      setNotice({ type: 'error', msg: error?.message || 'Lỗi khi đổi mã PIN.' })
    } finally {
      setIsAuthenticating(false)
    }
  }

  async function handleRedeem(reward: LoyaltyReward) {
    if (!membership || !customer) {
      setNotice({ type: 'error', msg: 'Vui lòng xác thực số điện thoại trước khi đổi phần thưởng.' })
      return
    }
    
    const requiredPoints = reward.pointsRequired
    if (membership.totalPoints < requiredPoints) {
      setNotice({ type: 'error', msg: `Bạn không đủ điểm. Cần ${requiredPoints} điểm để đổi.` })
      return
    }

    if (!window.confirm(`Bạn có chắc muốn dùng ${requiredPoints} điểm để đổi phần thưởng "${reward.name}"?`)) return

    setRedeemingId(reward.id)
    try {
      const res = await redeemLoyaltyRewardApi(customer.id, reward.id)
      
      if (res.data) {
        const { voucher, updatedMembership } = res.data
        setMembership(updatedMembership)
        setMyVouchers(prev => [voucher, ...prev])
        setNotice({ type: 'success', msg: `Đổi thành công! Voucher "${reward.name}" đã được thêm vào Kho Voucher của bạn.` })
      }
    } catch (error: any) {
      setNotice({ type: 'error', msg: error?.message || 'Có lỗi xảy ra khi đổi điểm. Vui lòng thử lại.' })
    } finally {
      setRedeemingId(null)
    }
  }

  return (
    <section className="bg-cream py-20 md:py-24 min-h-[80vh]">
      <div className="mx-auto max-w-[1000px] px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Offers & Rewards</p>
          <h2 className="mt-3 text-[36px] font-bold md:text-[48px]">Đổi Điểm Nhận Ưu Đãi</h2>
          <p className="mt-4 text-muted mx-auto max-w-xl">Sử dụng điểm tích lũy của bạn để đổi lấy các voucher giảm giá cực hấp dẫn từ Little Hogsmeade.</p>
        </div>

        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-soft mb-12 border border-line flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            {membership ? (
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-coffee/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-coffee" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-coffee">{customer?.fullName}</p>
                  <p className="text-sm text-muted">Hạng: <span className="font-bold text-gold">{membership.tier?.name || 'Thành viên'}</span> • Hiện có: <span className="font-bold text-coffee">{membership.totalPoints} điểm</span></p>
                </div>
              </div>
            ) : authStep === 'phone' ? (
              <form onSubmit={handleCheckPhone} className="flex gap-3 w-full">
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Nhập số điện thoại để xem điểm..."
                  className="flex-1 h-[48px] rounded-xl border border-line bg-white px-4 text-sm outline-none focus:border-coffee"
                  disabled={isAuthenticating}
                />
                <button type="submit" disabled={isAuthenticating || !phone} className="h-[48px] rounded-xl bg-coffee px-6 font-bold text-white transition hover:bg-opacity-90 disabled:opacity-50">
                  {isAuthenticating ? 'Đang tải...' : 'Tiếp tục'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col gap-3 w-full">
                <p className="text-sm font-semibold text-coffee mb-1">
                  {authStatus === 'not_found' ? 'Tạo tài khoản mới' : authStatus === 'no_pin' ? 'Thiết lập mã PIN bảo mật' : 'Nhập mã PIN để đăng nhập'}
                </p>
                {authStatus === 'not_found' && (
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="Họ và tên của bạn"
                    className="w-full h-[48px] rounded-xl border border-line bg-white px-4 text-sm outline-none focus:border-coffee mb-2"
                    disabled={isAuthenticating}
                  />
                )}
                <div className="flex flex-col gap-4 w-full items-center mt-2">
                  <PinOtpInput value={pin} onChange={setPin} disabled={isAuthenticating} />
                  <button type="submit" disabled={isAuthenticating || pin.length < 6} className="h-[48px] w-full max-w-[340px] mx-auto rounded-xl bg-coffee px-6 font-bold text-white transition hover:bg-opacity-90 disabled:opacity-50 mt-2">
                    {isAuthenticating ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('phone')
                      setPin('')
                      setNotice(null)
                    }}
                    className="text-sm font-semibold text-muted hover:text-coffee"
                  >
                    Quay lại
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {(membership || authStep === 'pin') && (
            <button onClick={() => { setMembership(null); setCustomer(null); setPhone(''); setPin(''); setAuthStep('phone'); setNotice(null); setMyVouchers([]); }} className="text-sm text-muted hover:text-coffee font-semibold underline whitespace-nowrap">
              Đổi số điện thoại
            </button>
          )}
        </div>

        {notice && (
          <div className={cn("mb-8 rounded-xl p-4 text-center text-sm font-semibold border", notice.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
            {notice.msg}
          </div>
        )}

        {customer && !isChangingPin && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsChangingPin(true)}
              className="text-sm font-bold text-coffee underline hover:text-opacity-80"
            >
              Đổi mã PIN
            </button>
          </div>
        )}

        {isChangingPin && (
          <form onSubmit={handleChangePin} className="bg-white p-6 rounded-2xl border border-line mb-8 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-center">Đổi mã PIN</h3>
            <div className="flex flex-col items-center gap-6">
              <div className="w-full">
                <p className="text-sm font-semibold mb-2 text-center">Mã PIN hiện tại</p>
                <PinOtpInput value={oldPin} onChange={setOldPin} disabled={isAuthenticating} />
              </div>
              <div className="w-full">
                <p className="text-sm font-semibold mb-2 text-center">Mã PIN mới</p>
                <PinOtpInput value={newPin} onChange={setNewPin} disabled={isAuthenticating} />
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="px-6 py-2 rounded-xl border border-line text-sm font-semibold hover:bg-surface"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating || oldPin.length < 6 || newPin.length < 6}
                  className="px-6 py-2 rounded-xl bg-coffee text-white text-sm font-bold hover:bg-opacity-90 disabled:opacity-50"
                >
                  Xác nhận đổi
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full border border-line bg-white p-1">
            <button
              onClick={() => setActiveTab('vouchers')}
              className={cn(
                'rounded-full px-6 py-2.5 text-sm font-bold transition-all',
                activeTab === 'vouchers'
                  ? 'bg-coffee text-white shadow-sm'
                  : 'text-muted hover:text-coffee hover:bg-cream',
              )}
            >
              Ưu Đãi Hiện Có
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={cn(
                'rounded-full px-6 py-2.5 text-sm font-bold transition-all',
                activeTab === 'rewards'
                  ? 'bg-coffee text-white shadow-sm'
                  : 'text-muted hover:text-coffee hover:bg-cream',
              )}
            >
              Đổi Thưởng
            </button>
            {membership && (
              <button
                onClick={() => setActiveTab('my_vouchers')}
                className={cn(
                  'rounded-full px-6 py-2.5 text-sm font-bold transition-all',
                  activeTab === 'my_vouchers'
                    ? 'bg-coffee text-white shadow-sm'
                    : 'text-muted hover:text-coffee hover:bg-cream',
                )}
              >
                Kho Voucher
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-10 text-muted">Đang tải...</div>
          ) : activeTab === 'my_vouchers' ? (
            myVouchers.length > 0 ? (
              myVouchers.map(voucher => (
                <div key={voucher.id} className="group overflow-hidden rounded-[24px] bg-white border border-line shadow-soft transition hover:-translate-y-1 hover:shadow-hover flex flex-col">
                  <div className="h-[140px] bg-coffee p-6 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] h-[100px] w-[100px] rounded-full bg-white/10" />
                    <Ticket className="h-8 w-8 mb-2 text-gold" />
                    <h3 className="font-bold text-xl relative z-10 leading-tight truncate">{voucher.name}</h3>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold px-2 py-1 bg-cream text-coffee rounded-md">MÃ: {voucher.code}</span>
                      {voucher.expireDate && <span className="text-xs text-muted">HSD: {new Date(voucher.expireDate).toLocaleDateString('vi-VN')}</span>}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-line border-dashed">
                      <div>
                        <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Mức giảm</p>
                        <p className="font-bold text-lg text-coffee">
                          {voucher.discountType === 'percent' ? `${voucher.discountValue}%` : `${new Intl.NumberFormat('vi-VN').format(voucher.discountValue || 0)}đ`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Tối thiểu</p>
                        <p className="font-bold text-sm text-coffee">
                          {new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue || 0)}đ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-muted">
                Bạn chưa có voucher nào trong kho.
              </div>
            )
          ) : activeTab === 'vouchers' ? (
            vouchers.length > 0 ? (
              vouchers.map(voucher => (
                <div key={voucher.id} className="group overflow-hidden rounded-[24px] bg-white border border-line shadow-soft transition hover:-translate-y-1 hover:shadow-hover flex flex-col">
                  <div className="h-[140px] bg-coffee p-6 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] h-[100px] w-[100px] rounded-full bg-white/10" />
                    <Ticket className="h-8 w-8 mb-2 text-gold" />
                    <h3 className="font-bold text-xl relative z-10 leading-tight truncate">{voucher.name}</h3>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-sm text-muted mb-4 flex-1">
                      {voucher.discountType === 'percent' 
                        ? `Giảm ${voucher.discountValue}% cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue || 0)}đ`
                        : `Giảm ${new Intl.NumberFormat('vi-VN').format(voucher.discountValue || 0)}đ cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue || 0)}đ`
                      }
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-line border-dashed">
                      <div>
                        <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Mã Code</p>
                        <p className="font-bold text-lg text-coffee">
                          {voucher.code || 'Tự động áp dụng'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Phạm vi</p>
                        <p className="font-bold text-sm text-coffee">
                          {voucher.scope === 'global' ? 'Toàn hệ thống' : 'Chi nhánh cụ thể'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-muted">
                Hiện chưa có chương trình ưu đãi nào.
              </div>
            )
          ) : (
            rewards.length > 0 ? (
              rewards.map(reward => (
                <div key={reward.id} className="group overflow-hidden rounded-[24px] bg-white border border-line shadow-soft transition hover:-translate-y-1 hover:shadow-hover flex flex-col">
                  <div className="h-[140px] bg-gold p-6 text-white flex flex-col justify-center relative overflow-hidden">
                    {reward.imageUrl ? (
                      <img src={reward.imageUrl} alt={reward.name} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute right-[-20px] top-[-20px] h-[100px] w-[100px] rounded-full bg-white/20" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                    <Gift className="h-8 w-8 mb-2 text-white relative z-10" />
                    <h3 className="font-bold text-xl relative z-10 leading-tight truncate">{reward.name}</h3>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-sm text-muted mb-4 flex-1">{reward.description || 'Voucher ưu đãi'}</p>
                    
                    <div className="flex items-center justify-between mb-6 pt-4 border-t border-line border-dashed">
                      <div>
                        <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Loại</p>
                        <p className="font-bold text-sm text-coffee">
                          Voucher Giảm Giá
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Cần dùng</p>
                        <p className="font-bold text-lg text-gold">{reward.pointsRequired} Điểm</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRedeem(reward)}
                      disabled={redeemingId === reward.id || (membership && membership.totalPoints < reward.pointsRequired) || !membership}
                      className="w-full h-12 rounded-full bg-coffee font-bold text-white transition hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {redeemingId === reward.id ? 'Đang xử lý...' : membership ? 'Đổi thưởng' : 'Đăng nhập để đổi'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-muted">
                Hiện chưa có phần thưởng nào để đổi.
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}

export function CustomerBookingPage() {
  const [draft, setDraft] = useState<BookingDraft>({ name: '', phone: '', guests: '4', datetime: '', note: '', branchId: '' })
  const [notice, setNotice] = useState<string | null>(null)
  const [locationNotice, setLocationNotice] = useState<string | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    let alive = true
    getBranches().then((res) => {
      if (alive) setBranches(normalizeBranches(res.data))
    })
    return () => { alive = false }
  }, [])

  const branchCards = useMemo(() => {
    return [...branches]
      .map((branch) => ({
        ...branch,
        distanceKm: loc ? calculateDistanceKm(loc.lat, loc.lng, branch.lat, branch.lng) : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return a.name.localeCompare(b.name)
        if (a.distanceKm == null) return 1
        if (b.distanceKm == null) return -1
        return a.distanceKm - b.distanceKm
      })
  }, [branches, loc])

  function onDetectLocation() {
    if (!navigator.geolocation) {
      setLocationNotice('Trình duyệt không hỗ trợ.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationNotice('Đã lấy vị trí hiện tại.')
      },
      () => setLocationNotice('Không lấy được vị trí.')
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!draft.branchId) {
      setNotice('Vui lòng chọn chi nhánh.')
      return
    }
    setNotice('Đã ghi nhận yêu cầu. Cảm ơn bạn!')
  }

  return (
    <BookingSection
      draft={draft}
      setDraft={setDraft}
      onSubmit={onSubmit}
      notice={notice}
      branches={branchCards}
      onDetectLocation={onDetectLocation}
      locationNotice={locationNotice}
    />
  )
}

const BLOG_CATEGORIES = ['All', 'Coffee', 'Food', 'Beverage', 'Lifestyle', 'Event', 'Promotion']

export function CustomerBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  useEffect(() => {
    let alive = true
    listPosts().then((p) => {
      if (alive) {
        setPosts(normalizeList<Post>(p.data))
      }
    })
    return () => { alive = false }
  }, [])

  const publishedPosts = posts.filter((p) => p.isPublished)
  const filteredPosts = publishedPosts.filter((p) => activeCategory === 'All' || p.category === activeCategory)
  
  if (filteredPosts.length === 0) {
    return (
      <section className="bg-cream py-20 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Little Hogsmeade Tạp chí</p>
              <h2 className="mt-3 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[48px]">Tin tức & Sự kiện</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeCategory === cat ? 'border-coffee bg-coffee text-white' : 'border-line bg-white text-muted hover:border-coffee'}`}
                >
                  {cat === 'All' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-muted">Chưa có bài viết nào trong danh mục này.</p>
        </div>
      </section>
    )
  }

  const [featuredPost, ...otherPosts] = filteredPosts

  return (
    <section className="bg-cream py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Little Hogsmeade Tạp chí</p>
            <h2 className="mt-3 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[48px]">Tin tức & Sự kiện</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeCategory === cat ? 'border-coffee bg-coffee text-white' : 'border-line bg-white text-muted hover:border-coffee'}`}
              >
                {cat === 'All' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Báo Mới: Featured Post */}
        <article className="group mb-12 flex flex-col gap-6 overflow-hidden rounded-[24px] border border-line bg-white shadow-soft lg:flex-row lg:items-center cursor-pointer transition hover:border-coffee" onClick={() => setSelectedPost(featuredPost)}>
          <div className="overflow-hidden lg:w-3/5">
            <img src={featuredPost.thumbnailUrl} alt={featuredPost.title} className="h-[300px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[400px]" />
          </div>
          <div className="flex flex-col p-6 lg:w-2/5 lg:p-10 lg:pl-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{featuredPost.category}</p>
            <h3 className="mt-4 text-[28px] font-bold leading-[1.2] transition group-hover:text-coffee">{featuredPost.title}</h3>
            <p className="mt-4 line-clamp-4 text-base leading-7 text-muted">{featuredPost.content}</p>
            <div className="mt-8 flex items-center justify-between border-t border-line pt-6 text-sm text-muted">
              <span>{formatVnDate(featuredPost.publishedAt ?? featuredPost.createdAt)}</span>
              <span className="flex items-center gap-2 font-bold text-coffee"><Eye className="h-4 w-4" /> Đọc tiếp</span>
            </div>
          </div>
        </article>

        {/* Các bài khác: Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {otherPosts.map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-[22px] border border-line bg-white shadow-soft transition hover:border-coffee cursor-pointer hover:-translate-y-1" onClick={() => setSelectedPost(post)}>
              <div className="overflow-hidden">
                <img src={post.thumbnailUrl} alt={post.title} className="h-[210px] w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5 flex flex-col h-[calc(100%-210px)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{post.category}</p>
                <h3 className="mt-2 text-[18px] font-bold leading-6 transition group-hover:text-coffee">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted flex-1">{post.content}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
                  <span>{formatVnDate(post.publishedAt ?? post.createdAt)}</span>
                  <span className="flex items-center gap-1 font-bold text-coffee"><Eye className="h-3.5 w-3.5" /> Đọc tiếp</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </section>
  )
}

export function CustomerStoresPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [pages, setPages] = useState<CmsPage[]>([])
  const [query, setQuery] = useState('')
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([getBranches(), listPages()]).then(([b, p]) => {
      if (alive) {
        setBranches(normalizeBranches(b.data))
        setPages(normalizeList<CmsPage>(p.data))
      }
    })
    return () => { alive = false }
  }, [])

  const branchCards = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...branches]
      .filter((branch) => !q || [branch.name, branch.address, branch.phone, branch.email ?? ''].some((value) => value.toLowerCase().includes(q)))
      .map((branch) => ({
        ...branch,
        distanceKm: loc ? calculateDistanceKm(loc.lat, loc.lng, branch.lat, branch.lng) : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return a.name.localeCompare(b.name)
        if (a.distanceKm == null) return 1
        if (b.distanceKm == null) return -1
        return a.distanceKm - b.distanceKm
      })
  }, [branches, query, loc])

  const openingHoursBlock = useMemo(() => getOpeningHoursBlock(pages), [pages])

  function onDetect() {
    if (!navigator.geolocation) {
      setNotice('Trình duyệt không hỗ trợ.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setNotice('Không lấy được vị trí.')
    )
  }

  return (
    <StoreAndMemberSection
      openingHoursBlock={openingHoursBlock}
      branches={branchCards}
      storeQuery={query}
      setStoreQuery={setQuery}
      userLocation={loc}
      onDetectLocation={onDetect}
      locationNotice={notice}
    />
  )
}

export function CustomerMembershipPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authStep, setAuthStep] = useState<'phone' | 'pin'>('phone')
  const [authStatus, setAuthStatus] = useState<'not_found' | 'no_pin' | 'has_pin' | 'locked'>('has_pin')
  const [pin, setPin] = useState('')
  const [fullName, setFullName] = useState('')
  const [isChangingPin, setIsChangingPin] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [membership, setMembership] = useState<CustomerMembership | null>(null)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [rewards, setRewards] = useState<LoyaltyReward[]>([])
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [successVoucher, setSuccessVoucher] = useState<any>(null)

  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')

  useEffect(() => {
    getBranches().then(res => {
      if (res.data?.items) setBranches(res.data.items)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    getCustomerLoyaltyRewards(selectedBranch || null).then(res => setRewards(res || [])).catch(() => {})
  }, [selectedBranch])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

  async function handleCheckPhone(e: FormEvent) {
    e.preventDefault()
    if (!phone) return
    
    setLoading(true)
    setError(null)
    try {
      const res = await checkCustomerPhone(phone)
      setAuthStatus(res.status)
      if (res.customer?.fullName) {
        setFullName(res.customer.fullName)
      }
      if (res.status === 'locked') {
        setError('Tài khoản của bạn đã bị khóa mã PIN. Vui lòng đến cửa hàng để được hỗ trợ.')
      } else {
        setAuthStep('pin')
      }
    } catch {
      setError('Đã xảy ra lỗi khi kiểm tra số điện thoại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!phone || !pin) return
    if (authStatus === 'not_found' && !fullName) {
      setError('Vui lòng nhập họ tên để đăng ký.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await customerLogin({ phone, pin, fullName: authStatus === 'not_found' ? fullName : undefined })
      if (res.data) {
        const fullProfile = res.data as any
        setCustomer(fullProfile)
        
        if (fullProfile.customerMemberships && fullProfile.customerMemberships.length > 0) {
          const m = fullProfile.customerMemberships[0];
          setMembership(m)
          getPointTransactions(m.id).then(txRes => {
            if (txRes.data) setTransactions(txRes.data)
          }).catch(() => {})
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi đăng nhập. Vui lòng kiểm tra lại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRedeem(reward: LoyaltyReward) {
    if (!membership || !customer) return
    
    const requiredPoints = reward.pointsRequired
    if (membership.totalPoints < requiredPoints) {
      setError(`Bạn không đủ điểm. Cần ${requiredPoints} điểm để đổi.`)
      return
    }

    if (!window.confirm(`Bạn có chắc muốn dùng ${requiredPoints} điểm để đổi phần thưởng "${reward.name}"?`)) return

    setRedeemingId(reward.id)
    try {
      const res = await redeemLoyaltyRewardApi(customer.id, reward.id)
      
      if (res.data) {
        const { voucher, updatedMembership } = res.data
        setMembership(updatedMembership)
        setSuccessVoucher(voucher)
        
        getPointTransactions(customer.id).then(txRes => {
          if (txRes.data) setTransactions(txRes.data)
        }).catch(() => {})
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi đổi điểm. Vui lòng thử lại.')
    } finally {
      setRedeemingId(null)
    }
  }

  async function handleChangePin(e: FormEvent) {
    e.preventDefault()
    if (oldPin.length < 6 || newPin.length < 6) return
    setLoading(true)
    setError(null)
    try {
      const { changeCustomerPin } = await import('../../api/customer.api')
      await changeCustomerPin({ oldPin, newPin })
      setError('Đổi mã PIN thành công!') // using error state as notice for simplicity here
      setIsChangingPin(false)
      setOldPin('')
      setNewPin('')
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi đổi mã PIN.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-cream py-20 md:py-24 min-h-[80vh]">
      <div className="mx-auto max-w-[800px] px-4 md:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Little Hogsmeade</p>
          <h2 className="mt-3 text-[36px] font-bold md:text-[48px]">Tra cứu Thẻ thành viên</h2>
        </div>
        
        {authStep === 'phone' && !customer ? (
          <form onSubmit={handleCheckPhone} className="relative flex items-center mx-auto max-w-[500px] mb-12">
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại của bạn..."
              className="h-[60px] w-full rounded-full border border-line bg-white pl-6 pr-32 text-base outline-none focus:border-coffee shadow-soft"
            />
            <button 
              type="submit" 
              disabled={loading || !phone}
              className="absolute right-2 top-2 bottom-2 rounded-full bg-coffee px-6 font-bold text-white transition hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Đang tải...' : 'Tiếp tục'}
            </button>
          </form>
        ) : !customer ? (
          <form onSubmit={handleLogin} className="mx-auto max-w-[500px] mb-12 space-y-4">
            <p className="text-sm font-semibold text-coffee mb-1 text-center">
              {authStatus === 'not_found' ? 'Tạo tài khoản thành viên mới' : authStatus === 'no_pin' ? 'Thiết lập mã PIN bảo mật' : authStatus === 'locked' ? 'Tài khoản bị khóa' : 'Nhập mã PIN để tra cứu'}
            </p>
            {authStatus === 'not_found' && (
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Họ và tên của bạn"
                className="h-[60px] w-full rounded-full border border-line bg-white px-6 text-base outline-none focus:border-coffee shadow-soft"
              />
            )}
            <div className="flex flex-col items-center gap-6 mt-6">
              {authStatus !== 'locked' && (
                <>
                  <PinOtpInput value={pin} onChange={setPin} disabled={loading} autoFocus />
                  <button 
                    type="submit" 
                    disabled={loading || pin.length < 6}
                    className="h-[60px] w-full max-w-[340px] rounded-full bg-coffee px-6 font-bold text-white transition hover:bg-opacity-90 disabled:opacity-50 shadow-soft"
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                </>
              )}
              <button 
                type="button"
                onClick={() => setAuthStep('phone')}
                className="h-[60px] w-full max-w-[340px] rounded-full border-2 border-line bg-white px-6 font-bold text-coffee transition hover:bg-surface-alt shadow-soft"
              >
                Quay lại
              </button>
            </div>
          </form>
        ) : null}

        {customer && (
          <div className="text-center mb-8">
            <button onClick={() => { setCustomer(null); setMembership(null); setPhone(''); setPin(''); setAuthStep('phone'); }} className="text-sm text-muted hover:text-coffee font-semibold underline mr-4">
              Tra cứu số điện thoại khác
            </button>
            {!isChangingPin && (
              <button onClick={() => setIsChangingPin(true)} className="text-sm text-coffee hover:text-opacity-80 font-semibold underline">
                Đổi mã PIN
              </button>
            )}
          </div>
        )}

        {isChangingPin && (
          <form onSubmit={handleChangePin} className="bg-white p-6 md:p-8 rounded-[32px] border border-line mb-10 shadow-soft max-w-[600px] mx-auto">
            <h3 className="font-bold text-xl mb-6 text-center text-coffee">Đổi mã PIN</h3>
            <div className="flex flex-col items-center gap-6">
              <div className="w-full">
                <p className="text-sm font-semibold mb-2 text-center">Mã PIN hiện tại</p>
                <PinOtpInput value={oldPin} onChange={setOldPin} disabled={loading} />
              </div>
              <div className="w-full">
                <p className="text-sm font-semibold mb-2 text-center">Mã PIN mới</p>
                <PinOtpInput value={newPin} onChange={setNewPin} disabled={loading} />
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="px-8 py-3 rounded-full border-2 border-line text-sm font-bold hover:bg-surface"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || oldPin.length < 6 || newPin.length < 6}
                  className="px-8 py-3 rounded-full bg-coffee text-white text-sm font-bold hover:bg-opacity-90 disabled:opacity-50 shadow-soft"
                >
                  Xác nhận đổi
                </button>
              </div>
            </div>
          </form>
        )}

        {error && (
          <div className="mx-auto max-w-[500px] rounded-[16px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800 mb-8">
            {error}
          </div>
        )}

        {customer && membership && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="grid md:grid-cols-[1fr_300px] gap-6">
              <div className="rounded-[24px] border border-line bg-white p-6 md:p-8 shadow-soft flex flex-col justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">Thẻ thành viên của</p>
                  <h3 className="text-[24px] font-bold text-coffee">{customer.fullName}</h3>
                  <p className="text-sm font-semibold mt-2 px-3 py-1 bg-gold/10 text-gold rounded-full inline-block">
                    Hạng: {membership.tier?.name || 'Khách hàng mới'}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                  <div>
                    <p className="text-xs text-muted mb-1 uppercase tracking-wider font-bold">Điểm hiện tại</p>
                    <p className="text-[32px] font-bold text-coffee leading-none">{membership.totalPoints}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted mb-1 uppercase tracking-wider font-bold">Chi tiêu tích lũy</p>
                    <p className="text-[20px] font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(membership.totalSpent)}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-[24px] border border-line bg-coffee text-white p-6 md:p-8 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="h-6 w-6 text-gold" />
                  <h3 className="font-bold text-lg">Đặc quyền hạng thẻ</h3>
                </div>
                {membership.tier ? (
                  <ul className="space-y-4 text-sm text-white/80">
                    {membership.tier.discountPercent > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-gold">★</span>
                        <span>Giảm <strong>{membership.tier.discountPercent}%</strong> cho mọi hóa đơn.</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-gold">★</span>
                      <span>{membership.tier.description || 'Tham gia tích điểm đổi quà.'}</span>
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-white/70">Chưa có thông tin đặc quyền.</p>
                )}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <button onClick={() => setShowRewardModal(true)} className="w-full block text-center rounded-xl bg-white text-coffee font-bold py-3 hover:bg-cream transition">
                    Đổi thưởng ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Lịch sử giao dịch */}
            <div className="rounded-[24px] border border-line bg-white p-6 md:p-8 shadow-soft mt-8">
              <div className="flex items-center gap-2 mb-6">
                <History className="h-5 w-5 text-muted" />
                <h3 className="font-bold text-lg">Lịch sử tích/tiêu điểm</h3>
              </div>
              
              {transactions.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between border-b border-line pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-[15px]">{tx.type === 'earn' ? 'Tích điểm từ hóa đơn' : tx.type === 'redeem' ? 'Đổi điểm nhận ưu đãi' : 'Điều chỉnh điểm'}</p>
                        <p className="text-xs text-muted mt-1">{formatVnDateTime(tx.createdAt)}</p>
                      </div>
                      <div className={`font-bold text-lg ${tx.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.points > 0 ? '+' : ''}{tx.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted text-center py-6">Chưa có giao dịch nào.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Gift className="h-5 w-5 text-gold" />
                Danh sách phần thưởng
              </h3>
              
              <div className="flex items-center gap-3">
                {!successVoucher && (
                  <select 
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="border border-line rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-coffee"
                  >
                    <option value="">Tất cả chi nhánh (Chung)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
                
                <button onClick={() => { setShowRewardModal(false); setSuccessVoucher(null); }} className="p-2 hover:bg-cream rounded-full transition text-muted">
                  <span className="sr-only">Đóng</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-cream/30">
              {successVoucher ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h4 className="font-bold text-xl mb-2 text-emerald-700">Đổi thưởng thành công!</h4>
                  <p className="text-muted mb-6">Mã voucher của bạn đã được tạo thành công và chỉ được sử dụng 1 lần.</p>
                  
                  <div className="bg-white border border-emerald-200 rounded-xl p-6 max-w-sm mx-auto shadow-sm">
                    <p className="text-sm font-semibold text-muted mb-2 uppercase tracking-wider">Mã Voucher của bạn</p>
                    <p className="text-3xl font-black text-coffee tracking-widest mb-4">{successVoucher.code}</p>
                    {successVoucher.expireDate && (
                      <p className="text-sm text-muted">Hết hạn: <span className="font-semibold text-red-500">{formatVnDate(successVoucher.expireDate)}</span></p>
                    )}
                  </div>
                  
                  <button onClick={() => setSuccessVoucher(null)} className="mt-8 px-6 py-2.5 bg-coffee text-white font-bold rounded-lg hover:bg-opacity-90 transition">
                    Đổi thêm quà khác
                  </button>
                </div>
              ) : rewards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rewards.map(reward => {
                    const canRedeem = membership ? membership.totalPoints >= reward.pointsRequired : false;
                    return (
                      <div key={reward.id} className="bg-white p-5 rounded-xl border border-line shadow-sm hover:shadow-md transition flex flex-col">
                        <div className="mb-4 -mx-5 -mt-5 h-32 rounded-t-xl overflow-hidden bg-[#F5F1EA] border-b border-line flex items-center justify-center">
                          {reward.imageUrl ? (
                            <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover" />
                          ) : (
                            <Gift className="w-10 h-10 text-coffee opacity-20" />
                          )}
                        </div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-coffee leading-tight">{reward.name}</h4>
                          <span className="flex items-center gap-1 bg-gold/10 text-gold font-bold px-2.5 py-1 rounded-full text-xs shrink-0 whitespace-nowrap">
                            <Award className="w-3 h-3" />
                            {reward.pointsRequired}
                          </span>
                        </div>
                        {reward.description && <p className="text-sm text-muted mb-4 line-clamp-2">{reward.description}</p>}
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={!canRedeem || redeemingId === reward.id}
                          className={`w-full py-2.5 rounded-lg font-bold text-sm transition mt-auto ${canRedeem ? 'bg-coffee text-white hover:bg-opacity-90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                          {redeemingId === reward.id ? 'Đang xử lý...' : canRedeem ? 'Đổi thẻ này' : 'Không đủ điểm'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Gift className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-medium">Hiện tại chưa có phần thưởng nào để đổi.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export function CustomerAboutPage() {
  return <StorySection />
}


