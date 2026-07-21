import { useState, useMemo, useEffect } from 'react'
import { CalendarDays, Clock, MapPin, Users, Info, AlertCircle, X, Search, Store } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useBranchTableLayout } from '../../hooks/useTableLayout'
import { useTableStatusSocket } from '../../hooks/useTableStatusSocket'
import { getBranches } from '../../api/chain.api'
import type { Reservation, BranchTable, BranchTableStatus } from '../../types'
import { formatVnDate, formatVnTime } from '../../utils/date'
import { cn } from '../../utils/cn'

interface AssignReservationModalProps {
  isOpen: boolean
  reservation: Reservation | null
  branchId: string | null
  onClose: () => void
  onAssign: (tableId: string | number, tableName: string) => void
}

export function AssignReservationModal({ isOpen, reservation, branchId, onClose, onAssign }: AssignReservationModalProps) {
  const [search, setSearch] = useState('')
  const [statusOverrides, setStatusOverrides] = useState<Record<string, BranchTableStatus>>({})
  const [selectedTable, setSelectedTable] = useState<BranchTable | null>(null)
  const [branchName, setBranchName] = useState<string>('')

  // Lấy danh sách nhánh để hiển thị tên chi nhánh
  useEffect(() => {
    if (branchId) {
      getBranches()
        .then(res => {
          const branches = res?.data?.items || []
          const branch = branches.find((b: any) => b.id === branchId)
          if (branch) setBranchName(branch.name)
        })
        .catch(err => console.error('Lỗi lấy chi nhánh:', err))
    }
  }, [branchId])

  const layoutQuery = useBranchTableLayout(branchId)
  
  useTableStatusSocket(branchId, (event) => {
    setStatusOverrides((current) => ({ ...current, [String(event.tableId)]: event.newStatus }))
  })

  const availableTables = useMemo(() => {
    if (!layoutQuery.data) return []
    const keyword = search.trim().toLowerCase()
    
    return layoutQuery.data.areas
      .flatMap((area) => area.tables)
      .map(t => ({ ...t, status: statusOverrides[String(t.id)] ?? t.status }))
      .filter((table) => table.status === 'available')
      .filter((table) => !keyword || table.name.toLowerCase().includes(keyword))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }))
  }, [layoutQuery.data, search, statusOverrides])

  if (!isOpen || !reservation) return null

  const handleClose = () => {
    setSelectedTable(null)
    setSearch('')
    onClose()
  }

  const isCapacityEnough = selectedTable ? selectedTable.capacity >= reservation.guestCount : false

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-white shadow-2xl overflow-hidden flex max-h-[90vh]">
        
        {/* Left Column: Reservation Info */}
        <div className="w-[350px] shrink-0 bg-cream p-8 flex flex-col border-r border-line">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-coffee tracking-tight">Gán bàn</h2>
            <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              Đang chờ gán
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <p className="text-sm font-semibold text-muted mb-1">Khách hàng</p>
              <p className="text-lg font-bold text-coffee">{reservation.guestName}</p>
              <p className="text-coffee/80">{reservation.guestPhone}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-line shadow-sm">
              <p className="text-[10px] uppercase font-bold text-muted flex items-center gap-1.5 mb-1"><Store className="size-3" /> Chi nhánh đặt</p>
              <p className="font-semibold text-sm text-coffee">{branchName || 'Đang tải...'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-line shadow-sm">
                <p className="text-[10px] uppercase font-bold text-muted flex items-center gap-1.5 mb-1"><CalendarDays className="size-3" /> Ngày</p>
                <p className="font-semibold text-sm">{formatVnDate(reservation.reservedDate)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-line shadow-sm">
                <p className="text-[10px] uppercase font-bold text-muted flex items-center gap-1.5 mb-1"><Clock className="size-3" /> Giờ</p>
                <p className="font-semibold text-sm">{formatVnTime(reservation.reservedTime)}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-line shadow-sm">
              <p className="text-[10px] uppercase font-bold text-muted flex items-center gap-1.5 mb-1"><Users className="size-3" /> Số lượng khách</p>
              <p className="font-semibold text-sm">{reservation.guestCount} người</p>
            </div>

            {reservation.note && (
              <div className="bg-beige/50 p-4 rounded-2xl border border-gold/20">
                <p className="text-[10px] uppercase font-bold text-[#8a6820] flex items-center gap-1.5 mb-1.5"><Info className="size-3" /> Ghi chú đặc biệt</p>
                <p className="text-sm text-coffee/90 leading-relaxed italic">"{reservation.note}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Table Selection */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="p-6 border-b border-line flex items-center justify-between gap-4 bg-white">
            <div>
              <h3 className="font-bold text-coffee text-xl">Chọn bàn trống</h3>
              <p className="text-xs text-muted mt-1">Danh sách bàn có thể gán</p>
            </div>
            
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Tìm bàn..." 
                className="h-10 rounded-xl border-line bg-cream pl-10 text-sm focus-visible:ring-1 focus-visible:ring-latte" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-[#fcfbf9]">
            {layoutQuery.isLoading ? (
              <div className="h-full flex items-center justify-center text-muted text-sm font-medium">Đang tải danh sách bàn...</div>
            ) : availableTables.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <AlertCircle className="size-10 text-muted/30 mb-3" />
                <p className="font-bold text-coffee/80">Không có bàn trống phù hợp</p>
                <p className="text-sm text-muted mt-1">Thử bỏ tìm kiếm hoặc đợi bàn trống.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTables.map(table => {
                  const isSmall = table.capacity < reservation.guestCount;
                  return (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group",
                        selectedTable?.id === table.id 
                          ? (isSmall ? "border-red-400 bg-red-50/50 ring-1 ring-red-400 shadow-sm" : "border-gold bg-beige/40 ring-1 ring-gold shadow-sm") 
                          : "border-line bg-white hover:border-latte hover:bg-cream"
                      )}
                    >
                      {selectedTable?.id === table.id && (
                        <div className={cn("absolute top-0 right-0 w-8 h-8 rounded-bl-2xl flex items-center justify-center", isSmall ? "bg-red-500" : "bg-gold")}>
                          <MapPin className="size-3 text-white" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <strong className="text-coffee font-bold text-lg">{table.name}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors",
                          isSmall ? "text-red-600 bg-red-50" : "text-muted bg-cream group-hover:bg-white"
                        )}>
                          <Users className="size-3" /> {table.capacity} khách
                        </span>
                        <p className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">Trống</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-line bg-white flex items-center justify-between">
            <Button variant="ghost" onClick={handleClose} className="text-muted hover:text-coffee h-11 px-6 rounded-xl font-semibold">Hủy bỏ</Button>
            
            <div className="flex items-center gap-4">
              {selectedTable && (
                <div className="flex flex-col items-end">
                  <span className="text-sm text-coffee">
                    Đã chọn: <strong className="font-bold text-lg">{selectedTable.name}</strong>
                  </span>
                  {!isCapacityEnough && (
                    <span className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      Bàn không đủ chỗ cho {reservation.guestCount} người
                    </span>
                  )}
                </div>
              )}
              <Button 
                onClick={() => selectedTable && isCapacityEnough && onAssign(selectedTable.id, selectedTable.name)}
                disabled={!selectedTable || !isCapacityEnough}
                className={cn(
                  "px-8 rounded-xl font-bold h-11 transition-all",
                  selectedTable && isCapacityEnough
                    ? "bg-coffee hover:bg-[#3a291d] text-white shadow-soft" 
                    : "bg-line/50 text-muted cursor-not-allowed"
                )}
              >
                Gán bàn này
              </Button>
            </div>
          </div>

        </div>
        
        {/* Close button absolute top right */}
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 text-muted hover:text-coffee transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>
    </>
  )
}
