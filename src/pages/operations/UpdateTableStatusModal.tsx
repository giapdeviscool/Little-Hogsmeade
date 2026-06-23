import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { updateTableStatus } from '../../api/tableStatus.api'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import type { BranchTable, UpdateTableStatus, UpdateTableStatusPayload } from '../../types'
import { cn } from '../../utils/cn'

type UpdateTableStatusModalProps = {
  isOpen: boolean
  onClose: () => void
  tableData: BranchTable | null
  onUpdateSuccess: (table: BranchTable) => void
}

const statusOptions: Array<{ value: UpdateTableStatus; label: string; description: string }> = [
  { value: 'available', label: 'Trống', description: 'Bàn đã sẵn sàng đón khách' },
  { value: 'occupied', label: 'Đang phục vụ', description: 'Khách đã vào bàn' },
  { value: 'reserved', label: 'Đã đặt trước', description: 'Bàn dành cho khách đặt chỗ' },
]

function getInitialStatus(status?: string): UpdateTableStatus {
  return status === 'occupied' || status === 'reserved' ? status : 'available'
}

function isMongoObjectId(value: number | string) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)
}

export function UpdateTableStatusModal({ isOpen, onClose, tableData, onUpdateSuccess }: UpdateTableStatusModalProps) {
  const [status, setStatus] = useState<UpdateTableStatus>('available')
  const [guestCount, setGuestCount] = useState('')
  const [orderId, setOrderId] = useState('')
  const [reservationId, setReservationId] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !tableData) return
    setStatus(getInitialStatus(tableData.status))
    setGuestCount(tableData.guest_count ? String(tableData.guest_count) : '')
    setOrderId(tableData.current_order_id ? String(tableData.current_order_id) : '')
    setReservationId(tableData.reservation_id ? String(tableData.reservation_id) : '')
    setNote(tableData.note || '')
    setError('')
  }, [isOpen, tableData])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!tableData) return

    const parsedGuestCount = guestCount ? Number(guestCount) : undefined
    if ((status === 'occupied' || status === 'reserved') && parsedGuestCount !== undefined && parsedGuestCount <= 0) {
      setError('Số lượng khách phải lớn hơn 0.')
      return
    }
    const usesBackend = isMongoObjectId(tableData.id)
    if (usesBackend && status === 'occupied' && orderId.trim() && !isMongoObjectId(orderId.trim())) {
      setError('Mã hóa đơn phải là ObjectId gồm 24 ký tự.')
      return
    }
    if (usesBackend && status === 'reserved' && reservationId.trim() && !isMongoObjectId(reservationId.trim())) {
      setError('Mã đặt bàn phải là ObjectId gồm 24 ký tự.')
      return
    }

    const payload: UpdateTableStatusPayload = { status }
    if (status === 'occupied') {
      if (parsedGuestCount !== undefined) payload.guest_count = parsedGuestCount
      if (orderId.trim()) payload.order_id = orderId.trim()
      if (note.trim()) payload.note = note.trim()
    }
    if (status === 'reserved') {
      if (reservationId.trim()) payload.reservation_id = reservationId.trim()
      if (parsedGuestCount !== undefined) payload.guest_count = parsedGuestCount
      if (note.trim()) payload.note = note.trim()
    }

    setError('')
    setIsLoading(true)

    try {
      if (!isMongoObjectId(tableData.id)) {
        onUpdateSuccess({
          ...tableData,
          status,
          guest_count: payload.guest_count ?? tableData.guest_count,
          current_order_id: payload.order_id ?? tableData.current_order_id,
          reservation_id: payload.reservation_id ?? tableData.reservation_id,
          note: payload.note ?? tableData.note,
        })
        onClose()
        return
      }

      const response = await updateTableStatus(tableData.id, payload)
      onUpdateSuccess(response.data || { ...tableData, status })
      onClose()
    } catch (requestError) {
      if (axios.isAxiosError<{ message?: string; errors?: Array<{ message?: string }> }>(requestError)) {
        const apiMessage = requestError.response?.data?.message || requestError.response?.data?.errors?.[0]?.message
        setError(apiMessage || (requestError.response?.status === 400 ? 'Không thể dọn bàn do hóa đơn chưa thanh toán.' : 'Không thể cập nhật trạng thái bàn.'))
      } else {
        setError('Không thể kết nối đến máy chủ.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose() }}>
    <DialogContent className="overflow-hidden rounded-2xl border-line bg-white p-6 text-coffee sm:max-w-[540px]">
      <DialogHeader><DialogTitle className="text-xl font-bold">Cập nhật trạng thái {tableData?.name}</DialogTitle><DialogDescription className="text-muted">Chọn trạng thái mới và bổ sung thông tin cần thiết.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="mt-2 space-y-5">
        <fieldset className="space-y-2"><legend className="mb-2 text-sm font-bold">Trạng thái mới</legend>{statusOptions.map((option) => <label key={option.value} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition', status === option.value ? 'border-coffee bg-beige/70' : 'border-line bg-white hover:bg-cream')}><input type="radio" name="status" value={option.value} checked={status === option.value} onChange={() => { setStatus(option.value); setError('') }} className="size-4 accent-coffee" /><span><strong className="block text-sm">{option.label}</strong><small className="text-muted">{option.description}</small></span></label>)}</fieldset>

        {status === 'occupied' && <div className="space-y-4 rounded-xl bg-cream p-4"><label className="block text-sm font-semibold">Số lượng khách<Input type="number" min={1} value={guestCount} onChange={(event) => setGuestCount(event.target.value)} placeholder="Ví dụ: 4" className="mt-2 h-10 border-line bg-white" /></label><label className="block text-sm font-semibold">Mã hóa đơn (không bắt buộc)<Input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="ObjectId của order" className="mt-2 h-10 border-line bg-white" /></label><label className="block text-sm font-semibold">Ghi chú<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Ghi chú phục vụ..." className="mt-2 w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-latte/40" /></label></div>}
        {status === 'reserved' && <div className="space-y-4 rounded-xl bg-cream p-4"><label className="block text-sm font-semibold">Mã đặt bàn<Input value={reservationId} onChange={(event) => setReservationId(event.target.value)} placeholder="ObjectId từ /api/v1/reservations" className="mt-2 h-10 border-line bg-white" /><small className="mt-1 block font-normal text-muted">Hiện dùng reservation đã tồn tại; chưa hỗ trợ tạo đặt bàn nghiệp vụ ngay tại đây.</small></label><label className="block text-sm font-semibold">Số lượng khách<Input type="number" min={1} value={guestCount} onChange={(event) => setGuestCount(event.target.value)} placeholder="Ví dụ: 4" className="mt-2 h-10 border-line bg-white" /></label><label className="block text-sm font-semibold">Ghi chú<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Tên khách, thời gian đến..." className="mt-2 w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-latte/40" /></label></div>}
        {error && <p role="alert" className="rounded-xl border border-[#c25a5a]/20 bg-red-50 px-4 py-3 text-sm font-semibold text-[#c25a5a]">{error}</p>}
        <DialogFooter className="-mx-6 -mb-6 px-6"><Button type="button" variant="outline" disabled={isLoading} onClick={onClose} className="h-10 rounded-xl border-line">Hủy</Button><Button type="submit" disabled={isLoading} className="h-10 rounded-xl bg-coffee px-5 text-white hover:bg-[#3f2d20]">{isLoading && <Loader2 className="size-4 animate-spin" />}{isLoading ? 'Đang cập nhật...' : 'Xác nhận'}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
