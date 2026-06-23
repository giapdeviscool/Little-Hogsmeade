import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { CalendarDays, Loader2, Phone, UserRound } from 'lucide-react'
import { updateTableStatus } from '../../api/tableStatus.api'
import { env } from '../../config/env'
import { getAuthToken } from '../../store/auth.store'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import type { BranchTable, UpdateTableStatus, UpdateTableStatusPayload } from '../../types'
import { cn } from '../../utils/cn'

type UpdateTableStatusModalProps = {
  isOpen: boolean
  onClose: () => void
  tableData: BranchTable | null
  branchId: string | null
  initialStatus?: UpdateTableStatus
  onUpdateSuccess: (table: BranchTable) => void
}

type ApiError = { message?: string; errors?: Array<{ message?: string }> }

type CreateReservationResponse = {
  data?: { id?: string }
}

const statusOptions: Array<{ value: UpdateTableStatus; label: string; description: string }> = [
  { value: 'available', label: 'Trống', description: 'Bàn đã sẵn sàng đón khách' },
  { value: 'reserved', label: 'Đã đặt trước', description: 'Tạo đặt chỗ cho khách' },
]

function getInitialStatus(status?: string): UpdateTableStatus {
  return status === 'occupied' || status === 'reserved' ? status : 'available'
}

function isMongoObjectId(value: number | string) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)
}

function getToday() {
  return new Date().toLocaleDateString('en-CA')
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiError>(error)) return error.response?.data?.message || error.response?.data?.errors?.[0]?.message || fallback
  return fallback
}

export function UpdateTableStatusModal({ isOpen, onClose, tableData, branchId, initialStatus, onUpdateSuccess }: UpdateTableStatusModalProps) {
  const [status, setStatus] = useState<UpdateTableStatus>('available')
  const [guestCount, setGuestCount] = useState('')
  const [note, setNote] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [reservedDate, setReservedDate] = useState(getToday)
  const [reservedTime, setReservedTime] = useState('12:30')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !tableData) return
    const syncForm = async () => {
      setStatus(initialStatus ?? getInitialStatus(tableData.status))
      setGuestCount(tableData.guest_count ? String(tableData.guest_count) : '')
      setNote(tableData.note || '')
      setGuestName('')
      setGuestPhone('')
      setReservedDate(getToday())
      setReservedTime('12:30')
      setError('')
    }
    void syncForm()
  }, [initialStatus, isOpen, tableData])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!tableData) return

    const parsedGuestCount = Number(guestCount)
    const needsGuestCount = status === 'occupied' || status === 'reserved'
    if (needsGuestCount && (!Number.isInteger(parsedGuestCount) || parsedGuestCount < 1)) {
      setError('Số lượng khách phải là số nguyên lớn hơn 0.')
      return
    }
    if (status === 'reserved' && (!guestName.trim() || !guestPhone.trim() || !reservedDate || !reservedTime)) {
      setError('Vui lòng nhập đầy đủ tên khách, số điện thoại, ngày và giờ hẹn.')
      return
    }

    const payload: UpdateTableStatusPayload = { status }
    if (needsGuestCount) payload.guest_count = parsedGuestCount
    if (note.trim() && status !== 'available') payload.note = note.trim()

    setError('')
    setIsLoading(true)
    try {
      if (!isMongoObjectId(tableData.id)) {
        onUpdateSuccess({ ...tableData, status, guest_count: payload.guest_count ?? tableData.guest_count, note: payload.note ?? tableData.note })
        onClose()
        return
      }

      if (status === 'reserved') {
        if (!branchId) throw new Error('Không xác định được chi nhánh để tạo đặt bàn.')
        const reservationDateTime = new Date(`${reservedDate}T${reservedTime}:00`).toISOString()
        const token = getAuthToken()
        const reservationResponse = await axios.post<CreateReservationResponse>(
          `${env.apiBaseUrl}/reservations`,
          {
            branchId,
            tableId: tableData.id,
            guestName: guestName.trim(),
            guestPhone: guestPhone.trim(),
            guestCount: parsedGuestCount,
            reservedDate: reservationDateTime,
            reservedTime: reservationDateTime,
            note: note.trim(),
            status: 'reserved',
          },
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
        )
        const reservationId = reservationResponse.data.data?.id
        if (!reservationId) throw new Error('Không nhận được mã đặt bàn từ máy chủ.')
        payload.reservation_id = reservationId
      }

      const response = await updateTableStatus(tableData.id, payload)
      onUpdateSuccess(response.data || { ...tableData, status })
      onClose()
    } catch (requestError) {
      setError(requestError instanceof Error && !axios.isAxiosError(requestError) ? requestError.message : getApiErrorMessage(requestError, 'Không thể cập nhật trạng thái bàn.'))
    } finally {
      setIsLoading(false)
    }
  }

  const showOccupiedFields = status === 'occupied'
  const showReservationFields = status === 'reserved'
  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose() }}>
    <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-line bg-white p-6 text-coffee sm:max-w-[560px]">
      <DialogHeader><DialogTitle className="text-xl font-bold">Cập nhật trạng thái {tableData?.name}</DialogTitle><DialogDescription className="text-muted">Chọn trạng thái và bổ sung thông tin phục vụ.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="mt-2 space-y-5">
        <fieldset className="space-y-2"><legend className="mb-2 text-sm font-bold">Trạng thái mới</legend>{statusOptions.map((option) => <label key={option.value} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition', status === option.value ? 'border-coffee bg-beige/70' : 'border-line bg-white hover:bg-cream')}><input type="radio" name="status" value={option.value} checked={status === option.value} onChange={() => { setStatus(option.value); setError('') }} className="size-4 accent-coffee" /><span><strong className="block text-sm">{option.label}</strong><small className="text-muted">{option.description}</small></span></label>)}</fieldset>
        {showOccupiedFields && <div className="space-y-4 rounded-xl bg-cream p-4"><label className="block text-sm font-semibold">Số lượng khách<Input type="number" min={1} value={guestCount} onChange={(event) => setGuestCount(event.target.value)} placeholder="Ví dụ: 4" className="mt-2 h-10 border-line bg-white" /></label><label className="block text-sm font-semibold">Ghi chú<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Ghi chú phục vụ..." className="mt-2 w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-latte/40" /></label></div>}
        {showReservationFields && <div className="space-y-4 rounded-2xl bg-cream p-4"><div className="flex items-center gap-2"><CalendarDays className="size-4 text-latte" /><p className="font-bold">Thông tin đặt bàn</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold sm:col-span-2">Tên khách<div className="relative mt-2"><UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-latte" /><Input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Nguyễn Văn A" className="h-10 border-line bg-white pl-10" /></div></label><label className="block text-sm font-semibold sm:col-span-2">Số điện thoại<div className="relative mt-2"><Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-latte" /><Input value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} inputMode="tel" placeholder="0901 112 233" className="h-10 border-line bg-white pl-10" /></div></label><label className="block text-sm font-semibold">Ngày hẹn<Input type="date" value={reservedDate} onChange={(event) => setReservedDate(event.target.value)} className="mt-2 h-10 border-line bg-white" /></label><label className="block text-sm font-semibold">Giờ hẹn<Input type="time" value={reservedTime} onChange={(event) => setReservedTime(event.target.value)} className="mt-2 h-10 border-line bg-white" /></label><label className="block text-sm font-semibold sm:col-span-2">Số lượng khách<Input type="number" min={1} value={guestCount} onChange={(event) => setGuestCount(event.target.value)} placeholder="Ví dụ: 4" className="mt-2 h-10 border-line bg-white" /></label></div><label className="block text-sm font-semibold">Ghi chú<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Ví dụ: Cần ghế trẻ em" className="mt-2 w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-latte/40" /></label></div>}
        {error && <p role="alert" className="rounded-xl border border-[#c25a5a]/20 bg-red-50 px-4 py-3 text-sm font-semibold text-[#c25a5a]">{error}</p>}
        <DialogFooter className="-mx-6 -mb-6 px-6"><Button type="button" variant="outline" disabled={isLoading} onClick={onClose} className="h-10 rounded-xl border-line">Hủy</Button><Button type="submit" disabled={isLoading} className="h-10 rounded-xl bg-coffee px-5 text-white hover:bg-[#3f2d20]">{isLoading && <Loader2 className="size-4 animate-spin" />}{isLoading ? 'Đang lưu...' : showReservationFields ? 'Tạo đặt bàn' : 'Xác nhận'}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
