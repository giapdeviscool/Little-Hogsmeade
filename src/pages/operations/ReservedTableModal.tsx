import { useEffect, useState } from 'react'
import { httpClient } from '../../api/httpClient'
import { CalendarCheck2, Clock3, Loader2, Phone, User, UsersRound } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Skeleton } from '../../components/ui/skeleton'

type ReservationDetail = {
  id: number | string
  tableName: string
  guestName: string
  guestPhone: string
  reservedTime: string
  guestCount: number
  note: string
}

type ReservedTableModalProps = {
  isOpen: boolean
  onClose: () => void
  tableId: number | string | null
  onSuccess: (nextTableStatus: 'occupied' | 'available') => void
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function unwrapData<T>(payload: T | { data?: T }) {
  return (payload as { data?: T }).data ?? payload as T
}

function toReservationDetail(payload: Record<string, unknown>, fallbackTableId: number | string): ReservationDetail {
  const customer = payload.customer as { name?: string; phone?: string } | undefined
  const table = payload.table as { name?: string } | undefined
  return {
    id: (payload.id ?? payload.reservation_id ?? '') as number | string,
    tableName: String(payload.table_name ?? payload.tableName ?? table?.name ?? `Bàn #${fallbackTableId}`),
    guestName: String(payload.guest_name ?? payload.guestName ?? payload.customer_name ?? customer?.name ?? 'Khách chưa cập nhật tên'),
    guestPhone: String(payload.guest_phone ?? payload.guestPhone ?? payload.phone ?? customer?.phone ?? 'Chưa cập nhật'),
    reservedTime: String(payload.reserved_time ?? payload.reservedTime ?? payload.arrival_time ?? payload.time ?? 'Chưa cập nhật'),
    guestCount: Number(payload.guest_count ?? payload.guestCount ?? 1) || 1,
    note: String(payload.note ?? payload.notes ?? ''),
  }
}

function ReservationSkeleton() {
  return <div className="space-y-4 py-2"><Skeleton className="h-28 rounded-2xl bg-beige" /><Skeleton className="h-12 rounded-xl bg-beige" /><Skeleton className="h-16 rounded-xl bg-beige" /></div>
}

export function ReservedTableModal({ isOpen, onClose, tableId, onSuccess }: ReservedTableModalProps) {
  const [reservation, setReservation] = useState<ReservationDetail | null>(null)
  const [actualGuestCount, setActualGuestCount] = useState('1')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showNoShowConfirm, setShowNoShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!isOpen || tableId === null) return
    let isCurrent = true
    const loadReservation = async () => {
      setIsLoading(true)
      setReservation(null)
      setError('')
      setToast('')
      setShowNoShowConfirm(false)
      try {
        const response = await httpClient<any>(`/tables/${tableId}/reservation`)
        if (!isCurrent) return
        const detail = toReservationDetail(unwrapData(response) as Record<string, unknown>, tableId)
        setReservation(detail)
        setActualGuestCount(String(detail.guestCount))
      } catch (requestError) {
        if (isCurrent) setError(getErrorMessage(requestError, 'Không thể tải thông tin đặt bàn.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }
    void loadReservation()

    return () => { isCurrent = false }
  }, [isOpen, tableId])

  const finishSuccess = (message: string, nextTableStatus: 'occupied' | 'available') => {
    setToast(message)
    onSuccess(nextTableStatus)
    window.setTimeout(onClose, 900)
  }

  const checkIn = async () => {
    const guestCount = Number(actualGuestCount)
    if (!reservation?.id) return setError('Không tìm thấy mã đặt bàn.')
    if (!Number.isInteger(guestCount) || guestCount < 1) return setError('Số lượng khách phải lớn hơn 0.')

    setError('')
    setIsCheckingIn(true)
    try {
      await httpClient(`/reservations/${reservation.id}/check-in`, { method: 'POST', body: JSON.stringify({ actual_guest_count: guestCount }) })
      finishSuccess('Nhận bàn thành công', 'occupied')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể nhận bàn. Vui lòng thử lại.'))
    } finally {
      setIsCheckingIn(false)
    }
  }

  const markNoShow = async () => {
    if (!reservation?.id) return setError('Không tìm thấy mã đặt bàn.')
    setError('')
    setIsCancelling(true)
    try {
      await httpClient(`/reservations/${reservation.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'no_show' }) })
      finishSuccess('Đã ghi nhận khách không đến', 'available')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể cập nhật trạng thái đặt bàn.'))
    } finally {
      setIsCancelling(false)
    }
  }

  const isSubmitting = isCheckingIn || isCancelling
  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSubmitting) onClose() }}>
    <DialogContent showCloseButton={!isSubmitting} className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-[rgba(74,53,37,0.12)] bg-white p-0 text-coffee sm:max-w-[560px]">
      <DialogHeader className="border-b border-[rgba(74,53,37,0.08)] bg-[#fffaf0] px-6 py-5"><div className="flex items-center gap-3 pr-8"><span className="grid size-10 place-items-center rounded-xl bg-gold/15 text-[#9f7a0a]"><CalendarCheck2 className="size-5" /></span><div><DialogTitle className="text-xl font-bold">{reservation?.tableName ?? `Bàn #${tableId}`}</DialogTitle><span className="mt-1 inline-flex rounded-full bg-gold/15 px-2.5 py-1 text-xs font-bold text-[#8a6820]">Đã đặt trước</span></div></div></DialogHeader>
      <div className="px-6 py-5">
        {toast && <p role="status" className="mb-4 rounded-xl border border-[#5fa876]/25 bg-[#f0f8f1] px-4 py-3 text-sm font-semibold text-[#3d8053]">{toast}</p>}
        {error && <p role="alert" className="mb-4 rounded-xl border border-[#c25a5a]/20 bg-red-50 px-4 py-3 text-sm font-semibold text-[#c25a5a]">{error}</p>}
        {isLoading ? <ReservationSkeleton /> : reservation && <section className="space-y-4"><article className="rounded-2xl border border-[rgba(74,53,37,0.08)] bg-cream p-5"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-latte shadow-[0_1px_2px_rgba(74,53,37,0.04)]"><User className="size-5" /></span><div className="min-w-0"><h3 className="truncate text-lg font-bold">{reservation.guestName}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><Phone className="size-3.5" />{reservation.guestPhone}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[rgba(74,53,37,0.08)] pt-4"><div className="flex gap-2 text-sm"><Clock3 className="mt-0.5 size-4 shrink-0 text-latte" /><div><p className="text-xs text-muted">Giờ hẹn đến</p><strong>{reservation.reservedTime}</strong></div></div><div className="flex gap-2 text-sm"><UsersRound className="mt-0.5 size-4 shrink-0 text-latte" /><div><p className="text-xs text-muted">Số lượng khách</p><strong>{reservation.guestCount} khách</strong></div></div></div></article>{reservation.note && <article className="rounded-xl border border-[rgba(74,53,37,0.08)] px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-muted">Ghi chú đặt bàn</p><p className="mt-1.5 text-sm leading-6">{reservation.note}</p></article>}{showNoShowConfirm ? <div className="rounded-xl border border-[#c25a5a]/20 bg-red-50 p-4"><p className="font-bold text-[#9f4444]">Xác nhận khách không đến?</p><p className="mt-1 text-sm text-[#9f4444]/85">Thao tác này sẽ giải phóng bàn và đánh dấu đặt chỗ là không đến.</p></div> : <label className="block rounded-xl border border-[rgba(74,53,37,0.08)] p-4 text-sm font-semibold">Số khách thực tế<Input type="number" min={1} value={actualGuestCount} onChange={(event) => setActualGuestCount(event.target.value)} disabled={isSubmitting} className="mt-2 h-10 border-[rgba(74,53,37,0.12)] bg-white" /></label>}</section>}
      </div>
      <DialogFooter className="m-0 rounded-none border-t border-[rgba(74,53,37,0.08)] bg-white px-6 py-4 sm:justify-between">{showNoShowConfirm ? <><Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setShowNoShowConfirm(false)} className="h-10 rounded-xl border-[rgba(74,53,37,0.16)]">Quay lại</Button><Button type="button" disabled={isSubmitting} onClick={markNoShow} className="h-10 rounded-xl bg-[#c25a5a] px-4 text-white hover:bg-[#a84a4a]">{isCancelling && <Loader2 className="size-4 animate-spin" />}{isCancelling ? 'Đang cập nhật...' : 'Xác nhận không đến'}</Button></> : <><Button type="button" variant="outline" disabled={isLoading || isSubmitting || Boolean(error)} onClick={() => setShowNoShowConfirm(true)} className="h-10 rounded-xl border-[#c25a5a]/35 text-[#b14d4d] hover:bg-red-50 hover:text-[#a44545]">Hủy / Khách không đến</Button><Button type="button" disabled={isLoading || isSubmitting || Boolean(error)} onClick={checkIn} className="h-10 rounded-xl bg-[#5fa876] px-4 text-white hover:bg-[#4e9064]">{isCheckingIn && <Loader2 className="size-4 animate-spin" />}{isCheckingIn ? 'Đang nhận bàn...' : 'Nhận bàn / Check-in'}</Button></>}</DialogFooter>
    </DialogContent>
  </Dialog>
}
