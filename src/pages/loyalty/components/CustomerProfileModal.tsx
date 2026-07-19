import { useEffect, useState, type ReactNode } from 'react'
import {
  CalendarDays,
  Phone,
  Receipt,
  Sparkles,
  UserRound,
  Wallet,
  Eye,
  EyeOff
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '../../../components/ui/skeleton'
import { cn } from '../../../utils/cn'
import { formatVnDate, formatVnDateTime } from '../../../utils/date'
import {
  fetchCustomerOrders,
  fetchCustomerPointTransactions,
  fetchCustomerProfile,
  updateCustomerMembershipApi,
  resetCustomerPin
} from '../../../api/customer.api'
import { getMembershipTiers } from '../../../api/loyalty.api'
import type { MembershipTier } from '../../../api/loyalty.api'
import type {
  CustomerListItem,
  CustomerOrderHistoryItem,
  CustomerPointTransaction,
  CustomerProfile,
  CustomerProfileTab,
} from '../../../types/customer.types'
import {
  CustomerTierBadge,
  formatCustomerPoints,
  formatCustomerSpent,
  formatPointTransactionLabel,
  getCustomerInitials,
} from './CustomerSharedUI'

type CustomerProfileModalProps = {
  customerId: string | null
  preview?: CustomerListItem | null
  onClose: () => void
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 px-1">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full bg-beige" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48 bg-beige" />
          <Skeleton className="h-4 w-24 rounded-full bg-beige" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-2xl bg-beige" />
        <Skeleton className="h-24 rounded-2xl bg-beige" />
      </div>
      <Skeleton className="h-40 rounded-2xl bg-beige" />
    </div>
  )
}

function ProfileAvatar({ profile }: { profile: Pick<CustomerProfile, 'fullName' | 'avatarUrl'> }) {
  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={profile.fullName}
        className="h-20 w-20 rounded-full object-cover ring-4 ring-beige"
      />
    )
  }

  return (
    <span className="grid h-20 w-20 place-items-center rounded-full bg-beige text-2xl font-semibold text-coffee ring-4 ring-white">
      {getCustomerInitials(profile.fullName)}
    </span>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3">
      <span className="mt-0.5 text-muted">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 text-sm font-medium text-coffee">{value}</p>
      </div>
    </div>
  )
}

function OrdersTabPanel({ customerId }: { customerId: string }) {
  const [orders, setOrders] = useState<CustomerOrderHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    fetchCustomerOrders(customerId)
      .then((items) => {
        if (!active) return
        setOrders(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Không tải được lịch sử hóa đơn.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [customerId])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl bg-beige" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-[#c25a5a]">{error}</p>
  }

  if (orders.length === 0) {
    return <p className="rounded-xl bg-beige px-4 py-6 text-center text-sm text-muted">Chưa có hóa đơn nào.</p>
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-line bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-coffee">{order.orderCode}</p>
              <p className="mt-1 text-xs text-muted">{formatVnDateTime(order.purchasedAt)}</p>
            </div>
            <span className="rounded-full bg-beige px-3 py-1 text-xs font-semibold text-coffee">
              {order.branchName}
            </span>
          </div>
          <div className="mt-3 rounded-xl bg-cream px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Món đã gọi</p>
            <p className="mt-1 text-sm leading-6 text-coffee">{order.briefItems}</p>
          </div>
          {order.totalAmount ? (
            <p className="mt-3 text-right text-sm font-semibold text-coffee">
              {formatCustomerSpent(order.totalAmount)}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  )
}

function PointsTabPanel({ customerId }: { customerId: string }) {
  const [transactions, setTransactions] = useState<CustomerPointTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    fetchCustomerPointTransactions(customerId)
      .then((items) => {
        if (!active) return
        setTransactions(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Không tải được lịch sử điểm.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [customerId])

  if (loading) {
    return (
      <div className="space-y-4 pl-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-xl bg-beige" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-[#c25a5a]">{error}</p>
  }

  if (transactions.length === 0) {
    return <p className="rounded-xl bg-beige px-4 py-6 text-center text-sm text-muted">Chưa có giao dịch điểm.</p>
  }

  return (
    <div className="relative space-y-0 pl-3">
      <span className="absolute bottom-2 left-[7px] top-2 w-px bg-line" aria-hidden="true" />
      {transactions.map((transaction) => {
        const isEarn = transaction.transactionType === 'EARN'

        return (
          <div key={transaction.id} className="relative pb-5 pl-6 last:pb-0">
            <span
              className={cn(
                'absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ring-2',
                isEarn ? 'bg-[#5fa876] ring-[#5fa876]/20' : 'bg-[#c25a5a] ring-[#c25a5a]/20',
              )}
            />
            <div className="rounded-xl border border-line bg-white px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isEarn ? 'text-[#5fa876]' : 'text-[#c25a5a]',
                  )}
                >
                  {formatPointTransactionLabel(transaction.transactionType, transaction.points)}
                </p>
                <p className="text-xs text-muted">{formatVnDateTime(transaction.createdAt)}</p>
              </div>
              {transaction.note ? (
                <p className="mt-2 text-sm text-coffee">{transaction.note}</p>
              ) : (
                <p className="mt-2 text-xs text-muted">
                  {transaction.transactionType === 'EARN'
                    ? 'Tích điểm từ đơn hàng'
                    : transaction.transactionType === 'REDEEM'
                      ? 'Đổi thưởng'
                      : 'Điểm hết hạn'}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CustomerProfileModal({
  customerId,
  preview,
  onClose,
}: CustomerProfileModalProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<CustomerProfileTab>('orders')
  const [loadedTabs, setLoadedTabs] = useState<Record<CustomerProfileTab, boolean>>({
    orders: false,
    points: false,
  })

  // State for Membership Editing
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTotalPoints, setEditTotalPoints] = useState(0)
  const [editTierId, setEditTierId] = useState<string>('')
  const [dynamicTiers, setDynamicTiers] = useState<MembershipTier[]>([])
  const [savingMembership, setSavingMembership] = useState(false)
  const [resettingPin, setResettingPin] = useState(false)
  const [showPhone, setShowPhone] = useState(false)

  useEffect(() => {
    getMembershipTiers().then(setDynamicTiers).catch(console.error)
  }, [])

  const handleSaveMembership = async () => {
    if (!profile) return
    try {
      setSavingMembership(true)
      await updateCustomerMembershipApi(profile.id, {
        totalPoints: editTotalPoints,
        tierId: editTierId
      })
      // Refresh profile
      const data = await fetchCustomerProfile(profile.id)
      setProfile(data)
      setIsEditMode(false)
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật hạng thẻ.')
    } finally {
      setSavingMembership(false)
    }
  }

  async function handleResetPin() {
    if (!profile) return
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục mã PIN của khách hàng này không?')) return
    
    try {
      setResettingPin(true)
      await resetCustomerPin(profile.id)
      alert('Mã PIN đã được khôi phục về 000000.')
    } catch (err: any) {
      alert(err?.message || 'Có lỗi xảy ra khi khôi phục mã PIN.')
    } finally {
      setResettingPin(false)
    }
  }

  useEffect(() => {
    if (!customerId) {
      setProfile(null)
      setNotFound(false)
      setActiveTab('orders')
      setLoadedTabs({ orders: false, points: false })
      return
    }

    let active = true
    setLoading(true)
    setNotFound(false)
    setProfileError(null)
    setProfile(null)
    setActiveTab('orders')
    setLoadedTabs({ orders: false, points: false })

    fetchCustomerProfile(customerId)
      .then((data) => {
        if (!active) return
        setProfile(data)
      })
      .catch((error: unknown) => {
        if (!active) return
        const message = error instanceof Error ? error.message.toLowerCase() : ''
        const isMissing =
          message.includes('404') ||
          message.includes('not found') ||
          message.includes('không tồn tại') ||
          message.includes('đã bị xóa')

        if (isMissing) {
          setNotFound(true)
          return
        }

        setProfileError(error instanceof Error ? error.message : 'Không tải được hồ sơ khách hàng.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [customerId])

  useEffect(() => {
    if (!customerId || !profile) return
    setLoadedTabs((prev) => ({ ...prev, [activeTab]: true }))
  }, [activeTab, customerId, profile])

  const displayName = profile?.fullName ?? preview?.fullName ?? 'Khách hàng'

  return (
    <Dialog open={!!customerId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-3xl md:max-w-4xl p-0 gap-0 overflow-hidden bg-cream border-line">
        <DialogHeader className="border-b border-line bg-white px-6 py-5 text-left">
          <DialogTitle className="text-xl font-bold text-coffee">Hồ sơ khách hàng</DialogTitle>
          <DialogDescription className="text-sm text-muted">
            Xem thông tin thành viên, lịch sử mua hàng và biến động điểm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6 overflow-y-auto max-h-[85vh]">
          {loading ? (
            <ProfileSkeleton />
          ) : notFound ? (
            <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center">
              <UserRound className="mx-auto h-10 w-10 text-muted" />
              <p className="mt-4 text-base font-semibold text-coffee">
                Khách hàng không tồn tại hoặc đã bị xóa
              </p>
              <p className="mt-2 text-sm text-muted">
                Không thể tải hồ sơ cho mã khách hàng này.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 h-10 rounded-lg bg-coffee px-5 text-sm font-semibold text-white transition hover:bg-coffee/90"
              >
                Quay lại danh sách
              </button>
            </div>
          ) : profileError ? (
            <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center">
              <p className="text-sm font-medium text-[#c25a5a]">{profileError}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 h-10 rounded-lg bg-coffee px-5 text-sm font-semibold text-white transition hover:bg-coffee/90"
              >
                Quay lại danh sách
              </button>
            </div>
          ) : profile ? (
            <>
              <section className="rounded-2xl border border-line bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <ProfileAvatar profile={profile} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold tracking-tight text-coffee">{displayName}</h2>
                      <button 
                        onClick={() => {
                          setEditTotalPoints(profile.totalPoints)
                          setEditTierId((profile.tier as any)?.id || dynamicTiers.find(t => t.name === profile.tier || t.name.toUpperCase() === profile.tier)?.id || dynamicTiers[0]?.id || '')
                          setIsEditMode(!isEditMode)
                        }}
                        className="text-sm font-semibold text-muted hover:text-coffee px-3 py-1.5 rounded-lg border border-line"
                      >
                        {isEditMode ? 'Hủy sửa' : 'Sửa hạng/điểm'}
                      </button>
                    </div>
                    <div className="mt-2">
                      <CustomerTierBadge tier={profile.tier} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-muted">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted">Số điện thoại</p>
                      <div
                        className="flex cursor-pointer items-center gap-2"
                        onClick={() => setShowPhone(!showPhone)}
                      >
                        <span className="font-medium text-coffee">
                          {showPhone ? (profile.rawPhone || profile.phone) : profile.phone}
                        </span>
                        {showPhone ? <EyeOff className="h-4 w-4 text-muted" /> : <Eye className="h-4 w-4 text-muted" />}
                      </div>
                    </div>
                  </div>
                  <InfoRow
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Ngày tham gia"
                    value={formatVnDate(profile.createdAt)}
                  />
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleResetPin}
                    disabled={resettingPin}
                    className="text-sm font-semibold text-[#c25a5a] hover:underline disabled:opacity-50"
                  >
                    {resettingPin ? 'Đang khôi phục...' : 'Khôi phục mã PIN (Reset PIN)'}
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-beige px-4 py-4">
                    <div className="flex items-center gap-2 text-muted">
                      <Wallet className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Tổng chi tiêu</span>
                    </div>
                    <p
                      className="mt-2 text-lg font-bold text-coffee sm:text-xl md:text-2xl whitespace-nowrap overflow-hidden text-ellipsis"
                      title={formatCustomerSpent(profile.totalSpent)}
                    >
                      {formatCustomerSpent(profile.totalSpent)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#faf3e8] px-4 py-4">
                    <div className="flex items-center gap-2 text-[#9a7b1a]">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Điểm hiện tại</span>
                    </div>
                    <p
                      className="mt-2 text-lg font-bold text-[#d99a4b] sm:text-xl md:text-2xl whitespace-nowrap overflow-hidden text-ellipsis"
                      title={`${formatCustomerPoints(profile.totalPoints)} điểm`}
                    >
                      {formatCustomerPoints(profile.totalPoints)}
                    </p>
                  </div>
                </div>

                {isEditMode && (
                  <div className="mt-5 rounded-2xl bg-cream p-4 space-y-4 border border-line">
                    <h3 className="text-sm font-bold text-coffee">Điều chỉnh hạng & điểm</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-muted block mb-1">Điểm hiện tại</label>
                        <input 
                          type="number" 
                          min="0"
                          value={editTotalPoints} 
                          onChange={e => setEditTotalPoints(parseInt(e.target.value) || 0)}
                          className="w-full h-10 rounded-lg px-3 border border-line text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted block mb-1">Hạng thành viên</label>
                        <select 
                          value={editTierId} 
                          onChange={e => setEditTierId(e.target.value)}
                          className="w-full h-10 rounded-lg px-3 border border-line text-sm"
                        >
                          {dynamicTiers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={handleSaveMembership}
                      disabled={savingMembership}
                      className="w-full h-10 rounded-lg bg-coffee text-white font-semibold text-sm transition hover:bg-coffee/90 disabled:opacity-50"
                    >
                      {savingMembership ? 'Đang lưu...' : 'Lưu cập nhật'}
                    </button>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-line bg-white p-5">
                <div className="flex flex-wrap gap-2 rounded-xl bg-cream p-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
                      activeTab === 'orders' ? 'bg-white text-coffee shadow-soft' : 'text-muted hover:text-coffee',
                    )}
                  >
                    <Receipt className="h-4 w-4" />
                    Lịch sử hóa đơn
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('points')}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
                      activeTab === 'points' ? 'bg-white text-coffee shadow-soft' : 'text-muted hover:text-coffee',
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    Lịch sử tích/đổi điểm
                  </button>
                </div>

                <div className="mt-5">
                  {loadedTabs.orders ? (
                    <div className={activeTab === 'orders' ? '' : 'hidden'}>
                      <OrdersTabPanel customerId={profile.id} />
                    </div>
                  ) : null}
                  {loadedTabs.points ? (
                    <div className={activeTab === 'points' ? '' : 'hidden'}>
                      <PointsTabPanel customerId={profile.id} />
                    </div>
                  ) : null}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
