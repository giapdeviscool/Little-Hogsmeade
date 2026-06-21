import { useEffect, useState } from 'react'
import { listReservations, updateReservation } from '../../api/reservation.api'
import type { Reservation, ReservationStatus } from '../../types'
import { formatVnDate, formatVnTime } from '../../utils/date'
import { Check, Clock, X, CheckCircle2 } from 'lucide-react'

export function ReservationManager() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await listReservations()
      // Sort by newest first
      setReservations(res.data.sort((a, b) => new Date(b.reservedDate).getTime() - new Date(a.reservedDate).getTime()))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: string, status: ReservationStatus) {
    try {
      await updateReservation(id, { status })
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch (err) {
      alert('Lỗi cập nhật trạng thái đặt bàn')
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt'
      case 'confirmed': return 'Đã xác nhận'
      case 'completed': return 'Hoàn thành'
      case 'cancelled': return 'Đã huỷ'
      default: return status
    }
  }

  return (
    <div className="mt-8 rounded-[16px] border border-line bg-white shadow-soft">
      <div className="border-b border-line px-6 py-5">
        <h2 className="text-[20px] font-bold">Danh sách Đặt bàn</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-muted">
            <tr>
              <th className="px-6 py-4 font-semibold">Khách hàng</th>
              <th className="px-6 py-4 font-semibold">Thời gian</th>
              <th className="px-6 py-4 font-semibold">Khách</th>
              <th className="px-6 py-4 font-semibold">Ghi chú</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted">Đang tải dữ liệu...</td></tr>
            ) : reservations.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted">Chưa có đơn đặt bàn nào.</td></tr>
            ) : (
              reservations.map(res => (
                <tr key={res.id} className="transition hover:bg-cream/50">
                  <td className="px-6 py-4">
                    <strong className="block font-semibold text-coffee">{res.guestName}</strong>
                    <span className="text-muted">{res.guestPhone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="block font-semibold">{formatVnDate(res.reservedDate)}</span>
                    <span className="text-muted">{formatVnTime(res.reservedTime)}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold">{res.guestCount} người</td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-muted" title={res.note}>{res.note || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(res.status)}`}>
                      {statusLabel(res.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {res.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusChange(res.id, 'confirmed')} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition hover:bg-blue-100" title="Xác nhận">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleStatusChange(res.id, 'cancelled')} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100" title="Từ chối/Huỷ">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {res.status === 'confirmed' && (
                        <>
                          <button onClick={() => handleStatusChange(res.id, 'completed')} className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100" title="Hoàn thành (Khách đã đến)">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleStatusChange(res.id, 'cancelled')} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100" title="Khách không đến/Huỷ">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {(res.status === 'completed' || res.status === 'cancelled') && (
                        <button onClick={() => handleStatusChange(res.id, 'pending')} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition hover:bg-gray-200" title="Hoàn tác về chờ duyệt">
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
