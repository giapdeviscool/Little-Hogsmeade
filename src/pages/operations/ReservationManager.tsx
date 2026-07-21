import { useEffect, useState } from 'react'
import { assignReservationTable, listReservations, updateReservation } from '../../api/reservation.api'
import type { Reservation, ReservationStatus } from '../../types'
import { MapPin, Edit3 } from 'lucide-react'
import { AssignReservationModal } from './AssignReservationModal'
import { UpdateReservationStatusModal } from './UpdateReservationStatusModal'
import { getUserBranchId } from '../../utils/permissions'
import { useQueryClient } from '@tanstack/react-query'
import { tableLayoutQueryKeys } from '../../hooks/useTableLayout'
import { formatVnDate, formatVnTime } from '../../utils/date'

export function ReservationManager() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservationToAssign, setSelectedReservationToAssign] = useState<Reservation | null>(null)
  const [selectedReservationToUpdate, setSelectedReservationToUpdate] = useState<Reservation | null>(null)
  const queryClient = useQueryClient()

  const [filterName, setFilterName] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterCount, setFilterCount] = useState('')

  const branchId = getUserBranchId()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await listReservations(branchId || undefined)
      // Sort by newest first
      if (res.data) {
        setReservations(res.data.sort((a, b) => new Date(b.reservedDate).getTime() - new Date(a.reservedDate).getTime()))
      }
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
      
      // Nếu trạng thái làm thay đổi bàn (ví dụ huỷ, hoàn thành), ta cũng nên làm mới sơ đồ bàn
      queryClient.invalidateQueries({ queryKey: tableLayoutQueryKeys.branch(branchId, {}) })
    } catch (err) {
      alert('Lỗi cập nhật trạng thái đặt bàn')
    }
  }

  async function handleAssignTable(tableId: string | number, _tableName: string) {
    if (!selectedReservationToAssign) return
    try {
      await assignReservationTable(selectedReservationToAssign.id, tableId)
      
      setReservations(prev => prev.map(r => 
        r.id === selectedReservationToAssign.id 
          ? { ...r, status: 'confirmed', tableId: String(tableId), table: { id: String(tableId), name: _tableName } } 
          : r
      ))
      
      // Quan trọng: Invalidate cache để Tab Sơ đồ tải lại trạng thái bàn mới nhất!
      queryClient.invalidateQueries({ queryKey: tableLayoutQueryKeys.branch(branchId, {}) })
      
      setSelectedReservationToAssign(null)
    } catch (err) {
      alert('Lỗi gán bàn')
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
      case 'checked_in': return 'Khách đã đến'
      case 'no_show': return 'Không đến'
      default: return status
    }
  }

  const filteredReservations = reservations.filter(res => {
    if (filterName) {
      const q = filterName.toLowerCase()
      if (!res.guestName.toLowerCase().includes(q) && !res.guestPhone.includes(q)) {
        return false
      }
    }
    if (filterDate && res.reservedDate !== filterDate) {
      return false
    }
    if (filterCount && res.guestCount !== Number(filterCount)) {
      return false
    }
    return true
  })

  return (
    <div className="mt-8 rounded-[16px] border border-line bg-white shadow-soft">
      <div className="border-b border-line px-6 py-5">
        <h2 className="text-[20px] font-bold">Danh sách Đặt bàn</h2>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 border-b border-line bg-cream/30 px-6 py-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm tên khách hàng hoặc SĐT..."
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-coffee placeholder:text-muted focus:border-coffee focus:outline-none"
          />
        </div>
        <div className="w-[160px]">
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-coffee placeholder:text-muted focus:border-coffee focus:outline-none"
          />
        </div>
        <div className="w-[140px]">
          <input
            type="number"
            placeholder="Số lượng..."
            value={filterCount}
            onChange={e => setFilterCount(e.target.value)}
            min="1"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-coffee placeholder:text-muted focus:border-coffee focus:outline-none"
          />
        </div>
        {(filterName || filterDate || filterCount) && (
          <button
            onClick={() => {
              setFilterName('')
              setFilterDate('')
              setFilterCount('')
            }}
            className="text-sm font-semibold text-red-500 hover:text-red-700"
          >
            Xoá lọc
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-muted">
            <tr>
              <th className="px-6 py-4 font-semibold">Khách hàng</th>
              <th className="px-6 py-4 font-semibold">Thời gian</th>
              <th className="px-6 py-4 font-semibold">Khách</th>
              <th className="px-6 py-4 font-semibold">Bàn</th>
              <th className="px-6 py-4 font-semibold">Ghi chú</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-muted">Đang tải dữ liệu...</td></tr>
            ) : filteredReservations.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-muted">Không tìm thấy đơn đặt bàn nào.</td></tr>
            ) : (
              filteredReservations.map(res => (
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
                  <td className="px-6 py-4 font-semibold text-coffee">
                    {res.table?.name || res.tableId ? (
                      res.table?.name || res.tableId
                    ) : (
                      <span className="font-normal text-muted italic">Chưa gán</span>
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-muted" title={res.note}>{res.note || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(res.status)}`}>
                      {statusLabel(res.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {res.status === 'pending' && !res.tableId && (
                        <button 
                          onClick={() => setSelectedReservationToAssign(res)} 
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition hover:bg-blue-100" 
                          title="Gán bàn"
                        >
                          <MapPin className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedReservationToUpdate(res)} 
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-slate-200" 
                        title="Cập nhật trạng thái"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AssignReservationModal 
        isOpen={!!selectedReservationToAssign}
        reservation={selectedReservationToAssign}
        branchId={selectedReservationToAssign?.branchId || branchId}
        onClose={() => setSelectedReservationToAssign(null)}
        onAssign={handleAssignTable}
      />

      <UpdateReservationStatusModal
        isOpen={!!selectedReservationToUpdate}
        reservation={selectedReservationToUpdate}
        onClose={() => setSelectedReservationToUpdate(null)}
        onUpdate={handleStatusChange}
      />
    </div>
  )
}
