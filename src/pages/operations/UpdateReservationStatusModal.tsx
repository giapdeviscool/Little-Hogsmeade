import { useState, useEffect } from 'react'
import { X, CalendarDays, MapPin } from 'lucide-react'
import { Button } from '../../components/ui/button'
import type { Reservation, ReservationStatus } from '../../types'
import { formatVnDate, formatVnTime } from '../../utils/date'

interface UpdateReservationStatusModalProps {
  isOpen: boolean
  reservation: Reservation | null
  onClose: () => void
  onUpdate: (id: string, status: ReservationStatus) => Promise<void>
}

export function UpdateReservationStatusModal({ isOpen, reservation, onClose, onUpdate }: UpdateReservationStatusModalProps) {
  const [status, setStatus] = useState<ReservationStatus>('pending')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (reservation) {
      setStatus(reservation.status)
    }
  }, [reservation])

  if (!isOpen || !reservation) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onUpdate(reservation.id, status)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-5 bg-cream">
          <h2 className="text-xl font-bold text-coffee">Cập nhật Trạng thái</h2>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-muted hover:bg-black/5 hover:text-coffee transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted">Khách hàng</p>
            <p className="text-lg font-bold text-coffee">{reservation.guestName} <span className="text-base font-medium text-muted">({reservation.guestPhone})</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#fcfbf9] p-3 rounded-xl border border-line">
              <p className="text-[10px] uppercase font-bold text-muted flex items-center gap-1.5 mb-1"><CalendarDays className="size-3" /> Ngày & Giờ</p>
              <p className="font-semibold text-sm">{formatVnTime(reservation.reservedTime)} - {formatVnDate(reservation.reservedDate)}</p>
            </div>
            {reservation.tableId && (
              <div className="bg-beige/40 p-3 rounded-xl border border-gold/20">
                <p className="text-[10px] uppercase font-bold text-[#8a6820] flex items-center gap-1.5 mb-1"><MapPin className="size-3" /> Bàn đã gán</p>
                <p className="font-semibold text-sm text-coffee">{reservation.table?.name || `ID: ${reservation.tableId}`}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-3 rounded-xl border border-line">
            <p className="text-[10px] uppercase font-bold text-muted mb-1">Số lượng khách</p>
            <p className="font-semibold text-sm text-coffee">{reservation.guestCount} người</p>
          </div>
          
          {reservation.note && (
            <div className="bg-[#fcfbf9] p-3 rounded-xl border border-line">
              <p className="text-[10px] uppercase font-bold text-muted mb-1">Ghi chú đặc biệt</p>
              <p className="font-medium text-sm text-coffee/80 italic">"{reservation.note}"</p>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-bold text-coffee">Chọn Trạng thái mới</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReservationStatus)}
                className="w-full h-12 rounded-xl border border-line bg-[#fcfbf9] pl-4 pr-10 text-sm font-semibold text-coffee focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-latte appearance-none"
              >
                <option value="pending">Chờ duyệt (Pending)</option>
                <option value="confirmed">Đã xác nhận (Confirmed)</option>
                <option value="checked_in">Khách đã đến (Checked-In)</option>
                <option value="completed">Khách đã rời đi (Completed)</option>
                <option value="cancelled">Khách huỷ (Cancelled)</option>
                <option value="no_show">Khách không đến (No-Show)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-coffee/60">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            
            {status === 'cancelled' || status === 'no_show' ? (
              <p className="text-xs text-red-600 font-medium">Lưu ý: Thao tác này sẽ trả lại Bàn (nếu đã gán) về trạng thái Trống.</p>
            ) : status === 'checked_in' ? (
              <p className="text-xs text-emerald-600 font-medium">Bàn sẽ chuyển sang trạng thái Đang phục vụ (Occupied).</p>
            ) : status === 'confirmed' && !reservation.tableId ? (
              <p className="text-xs text-amber-600 font-medium">Gợi ý: Đừng quên gán bàn sau khi xác nhận.</p>
            ) : null}
          </div>
        </div>

        <div className="p-6 border-t border-line bg-[#fcfbf9] flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="h-11 px-6 rounded-xl font-semibold text-muted hover:text-coffee">
            Huỷ bỏ
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || status === reservation.status}
            className="h-11 px-8 rounded-xl font-bold bg-coffee hover:bg-[#3a291d] text-white shadow-soft transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu cập nhật'}
          </Button>
        </div>
      </div>
    </>
  )
}
