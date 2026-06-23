import { useMemo, useState, type ComponentType } from 'react'
import { Navigate } from 'react-router-dom'
import { Armchair, Bell, ChevronDown, Grid2x2, House, MapPin, Search, Trees, Users, Wine } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { env } from '../../config/env'
import { useBranchTableLayout } from '../../hooks/useTableLayout'
import { useTableStatusSocket } from '../../hooks/useTableStatusSocket'
import { getAuthSession } from '../../store/auth.store'
import type { BranchTable, BranchTableLayout, BranchTableStatus } from '../../types'
import { cn } from '../../utils/cn'
import { UpdateTableStatusModal } from './UpdateTableStatusModal'
import { OccupiedTableModal } from './OccupiedTableModal'
import { ReservedTableModal } from './ReservedTableModal'

const UPDATED_AT = '2026-06-22T10:00:00Z'

const temporaryLayout: BranchTableLayout = {
  branch_id: 'demo',
  branch_name: 'Little Hogsmeade - Hồ Tây',
  total_tables: 15,
  areas: [
    {
      area_name: 'Trong nhà',
      tables: [
        { id: 101, name: 'Bàn T1-01', capacity: 4, status: 'occupied', current_order_id: 4052, updated_at: UPDATED_AT },
        { id: 102, name: 'Bàn T1-02', capacity: 2, status: 'available', current_order_id: null, updated_at: UPDATED_AT },
        { id: 103, name: 'Bàn T1-03', capacity: 4, status: 'reserved', reservation_id: 88, updated_at: UPDATED_AT },
        { id: 104, name: 'Bàn T1-04', capacity: 6, status: 'occupied', current_order_id: 4055, updated_at: UPDATED_AT },
        { id: 105, name: 'Bàn T1-05', capacity: 2, status: 'available', current_order_id: null, updated_at: UPDATED_AT },
        { id: 106, name: 'Bàn T1-06', capacity: 8, status: 'occupied', current_order_id: 4058, updated_at: UPDATED_AT },
        { id: 107, name: 'Bàn T1-07', capacity: 4, status: 'cleaning', current_order_id: null, updated_at: UPDATED_AT },
        { id: 108, name: 'Bàn T1-08', capacity: 4, status: 'available', current_order_id: null, updated_at: UPDATED_AT },
      ],
    },
    {
      area_name: 'Ngoài trời',
      tables: [
        { id: 201, name: 'Bàn N-01', capacity: 6, status: 'reserved', reservation_id: 91, updated_at: UPDATED_AT },
        { id: 202, name: 'Bàn N-02', capacity: 4, status: 'available', current_order_id: null, updated_at: UPDATED_AT },
        { id: 203, name: 'Bàn N-03', capacity: 6, status: 'occupied', current_order_id: 4061, updated_at: UPDATED_AT },
        { id: 204, name: 'Bàn N-04', capacity: 4, status: 'available', current_order_id: null, updated_at: UPDATED_AT },
      ],
    },
    {
      area_name: 'Quầy bar',
      tables: [
        { id: 301, name: 'Bàn B-01', capacity: 2, status: 'occupied', current_order_id: 4064, updated_at: UPDATED_AT },
        { id: 302, name: 'Bàn B-02', capacity: 2, status: 'available', current_order_id: null, updated_at: UPDATED_AT },
        { id: 303, name: 'Bàn B-03', capacity: 2, status: 'cleaning', current_order_id: null, updated_at: UPDATED_AT },
      ],
    },
  ],
}

const statusDetails: Record<BranchTableStatus, { label: string; dot: string; surface: string }> = {
  available: { label: 'Trống', dot: 'border border-coffee bg-white', surface: 'border-[#d8d0c8] bg-white text-coffee' },
  occupied: { label: 'Đang phục vụ', dot: 'bg-[#c2a68c]', surface: 'border-[#c2a68c] bg-[#c2a68c] text-white shadow-[0_8px_16px_rgba(74,53,37,0.10)]' },
  reserved: { label: 'Đã đặt trước', dot: 'border border-[#ded3c4] bg-[#f5f0e6]', surface: 'border-[#ded3c4] bg-[#f5f0e6] text-coffee' },
  cleaning: { label: 'Đang dọn', dot: 'bg-[#a6a09a]', surface: 'border-[#d5d1cd] bg-[#ebe8e4] text-[#716a64]' },
}

const tableShapes = ['square', 'circle', 'square', 'circle', 'square', 'wide', 'circle', 'square', 'square', 'circle', 'wide', 'square'] as const

function normalizeAreaName(areaName: string) {
  return areaName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function getAreaConfig(areaName: string): { value: string; label: string; icon: ComponentType<{ className?: string }> } {
  const normalized = normalizeAreaName(areaName)
  if (normalized.includes('trong') || normalized.includes('indoor')) return { value: 'indoor', label: areaName, icon: House }
  if (normalized.includes('ngoai') || normalized.includes('outdoor')) return { value: 'outdoor', label: areaName, icon: Trees }
  if (normalized.includes('bar')) return { value: 'bar', label: areaName, icon: Wine }
  return { value: normalized.replace(/\s+/g, '_'), label: areaName, icon: Armchair }
}

function flattenTables(layout: BranchTableLayout) {
  return layout.areas.flatMap((area) => area.tables)
}

export function TableLayoutPage() {
  const session = getAuthSession()
  if (!session?.user) return <Navigate to="/login" replace />
  const branchId = session.user.branchId || env.defaultBranchId || null
  return <TableLayoutContent branchId={branchId} />
}

function TableLayoutContent({ branchId }: { branchId: string | null }) {
  const [selectedArea, setSelectedArea] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<BranchTableStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedTable, setSelectedTable] = useState<BranchTable | null>(null)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, BranchTableStatus>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const allLayoutQuery = useBranchTableLayout(branchId)
  const fullLayout = allLayoutQuery.data ?? temporaryLayout
  const withCurrentStatus = (table: BranchTable): BranchTable => ({ ...table, status: statusOverrides[String(table.id)] ?? table.status })
  const allTables = flattenTables(fullLayout).map(withCurrentStatus)

  useTableStatusSocket(branchId, (event) => {
    setStatusOverrides((current) => ({ ...current, [String(event.tableId)]: event.newStatus }))
  })

  const tables = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return fullLayout.areas
      .filter((area) => selectedArea === 'all' || getAreaConfig(area.area_name).value === selectedArea)
      .flatMap((area) => area.tables)
      .map(withCurrentStatus)
      .filter((table) => selectedStatus === 'all' || table.status === selectedStatus)
      .filter((table) => !keyword || table.name.toLowerCase().includes(keyword))
      .sort((first, second) => first.name.localeCompare(second.name, 'vi', { numeric: true }))
  }, [fullLayout, search, selectedArea, selectedStatus, statusOverrides])

  const counters = {
    total: fullLayout.total_tables,
    occupied: allTables.filter((table) => table.status === 'occupied').length,
    available: allTables.filter((table) => table.status === 'available').length,
    reserved: allTables.filter((table) => table.status === 'reserved').length,
  }

  return (
    <section className="-mx-10 -my-8 min-h-screen bg-white text-coffee">
      <header className="flex min-h-[68px] flex-wrap items-center gap-5 border-b border-[rgba(74,53,37,0.08)] bg-white px-7 py-3">
        <div className="relative w-full max-w-[400px]"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm bàn..." className="h-10 rounded-xl border-line bg-cream pl-11 text-sm text-coffee placeholder:text-muted focus-visible:ring-1 focus-visible:ring-latte" /></div>
        <Button variant="outline" className="h-10 rounded-xl border-line bg-white px-4 text-sm font-semibold"><MapPin className="size-4 text-latte" /> {fullLayout.branch_name} <ChevronDown className="size-4" /></Button>
        <Button variant="outline" size="icon" className="relative ml-auto size-10 rounded-xl border-line"><Bell className="size-4" /><span className="absolute right-2 top-2 size-2 rounded-full bg-gold ring-2 ring-white" /></Button>
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-coffee text-xs font-bold text-white">AN</span><span className="hidden text-sm leading-tight sm:block"><strong className="block">Anna Nguyễn</strong><small className="text-muted">Quản lý</small></span></div>
      </header>

      <main className="px-7 py-7">
        {successMessage && <div className="fixed right-6 top-6 z-[80] rounded-xl bg-[#3d8053] px-4 py-3 text-sm font-bold text-white shadow-lg">{successMessage}</div>}
        {!branchId && <div className="mb-5 rounded-xl border border-gold/30 bg-[#fffaf0] px-4 py-3 text-sm text-[#8a6820]">Chưa có branchId trong phiên đăng nhập. Đang hiển thị dữ liệu mẫu; Owner có thể cấu hình VITE_DEFAULT_BRANCH_ID.</div>}
        <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex rounded-2xl bg-cream p-1"><Button className="h-10 rounded-xl bg-white px-5 text-sm font-bold text-coffee shadow-[0_3px_10px_rgba(74,53,37,0.08)] hover:bg-white">Sơ đồ phòng/bàn</Button><Button variant="ghost" className="h-10 rounded-xl px-5 text-sm font-semibold text-muted">Quản lý thực đơn</Button></div><span className="text-xs text-muted">Cập nhật theo thời gian thực</span></div>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Tổng số bàn', value: counters.total, dot: 'bg-[#8a7560]' },
            { label: 'Đang phục vụ', value: counters.occupied, dot: statusDetails.occupied.dot },
            { label: 'Trống sẵn sàng', value: counters.available, dot: statusDetails.available.dot },
            { label: 'Đã đặt trước', value: counters.reserved, dot: statusDetails.reserved.dot },
          ].map((item) => <article key={item.label} className="flex min-h-[82px] items-center gap-4 rounded-2xl border border-line bg-white px-5"><span className={cn('size-3 rounded-full', item.dot)} /><div><p className="text-xs text-muted">{item.label}</p><strong className="mt-1 block text-2xl leading-none">{item.value}</strong></div></article>)}
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2"><Button onClick={() => setSelectedArea('all')} className={cn('h-9 rounded-full px-4 text-sm font-semibold', selectedArea === 'all' ? 'bg-coffee text-white hover:bg-coffee' : 'border border-line bg-white text-coffee hover:bg-cream')}><Grid2x2 className="size-4" /> Tất cả</Button>{fullLayout.areas.map((area) => { const config = getAreaConfig(area.area_name); const AreaIcon = config.icon; return <Button key={area.area_name} onClick={() => setSelectedArea(config.value)} variant="outline" className={cn('h-9 rounded-full border-line px-4 text-sm font-semibold', selectedArea === config.value ? 'border-coffee bg-beige' : 'bg-white')}><AreaIcon className="size-4" /> {config.label}</Button> })}</div>
          <div className="flex flex-wrap items-center gap-4">{(Object.entries(statusDetails) as Array<[BranchTableStatus, (typeof statusDetails)[BranchTableStatus]]>).map(([key, detail]) => <button key={key} type="button" onClick={() => setSelectedStatus(selectedStatus === key ? 'all' : key)} className={cn('flex items-center gap-2 text-xs text-muted transition-opacity', selectedStatus !== 'all' && selectedStatus !== key && 'opacity-40')}><span className={cn('size-3 rounded-full', detail.dot)} /> {detail.label}</button>)}</div>
        </div>

        <section className="mt-6 rounded-2xl border border-line bg-[#fcfbf9] p-6">
          {allLayoutQuery.isError && <p className="mb-4 rounded-xl bg-beige px-4 py-3 text-xs text-muted">Backend chưa phản hồi, đang hiển thị dữ liệu mẫu.</p>}
          {tables.length === 0 ? <div className="py-20 text-center"><p className="font-bold">Không tìm thấy bàn phù hợp</p><p className="mt-1 text-sm text-muted">Thử đổi khu vực, trạng thái hoặc từ khoá.</p></div> : <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">{tables.map((table, index) => <TableShape key={table.id} table={table} index={index} onSelect={setSelectedTable} />)}</div>}
        </section>
      </main>
      <UpdateTableStatusModal
        isOpen={selectedTable !== null && selectedTable.status !== 'occupied' && selectedTable.status !== 'reserved'}
        tableData={selectedTable}
        branchId={branchId}
        onClose={() => setSelectedTable(null)}
        onUpdateSuccess={(updatedTable) => {
          setStatusOverrides((current) => ({ ...current, [String(updatedTable.id)]: updatedTable.status }))
          setSuccessMessage('Cập nhật trạng thái bàn thành công')
          window.setTimeout(() => setSuccessMessage(''), 2500)
        }}
      />
      <OccupiedTableModal
        isOpen={selectedTable?.status === 'occupied'}
        tableId={selectedTable?.status === 'occupied' ? selectedTable.id : null}
        availableTables={allTables.filter((table) => table.status === 'available').map((table) => ({ id: table.id, name: table.name, status: table.status }))}
        onClose={() => setSelectedTable(null)}
        onSuccess={() => {
          setStatusOverrides((current) => ({ ...current, ...(selectedTable ? { [String(selectedTable.id)]: 'available' } : {}) }))
          setSuccessMessage('Cập nhật sơ đồ bàn thành công')
          window.setTimeout(() => setSuccessMessage(''), 2500)
        }}
      />
      <ReservedTableModal
        isOpen={selectedTable?.status === 'reserved'}
        tableId={selectedTable?.status === 'reserved' ? selectedTable.id : null}
        onClose={() => setSelectedTable(null)}
        onSuccess={(nextTableStatus) => {
          setStatusOverrides((current) => ({ ...current, ...(selectedTable ? { [String(selectedTable.id)]: nextTableStatus } : {}) }))
          setSuccessMessage('Cập nhật sơ đồ bàn thành công')
          window.setTimeout(() => setSuccessMessage(''), 2500)
        }}
      />
    </section>
  )
}

function TableShape({ table, index, onSelect }: { table: BranchTable; index: number; onSelect: (table: BranchTable) => void }) {
  const detail = statusDetails[table.status] ?? statusDetails.cleaning
  const shape = tableShapes[index % tableShapes.length]
  const reference = table.current_order_id ? `Đơn #${table.current_order_id}` : table.reservation_id ? `Đặt bàn #${table.reservation_id}` : null

  return <button type="button" onClick={() => onSelect(table)} className={cn('relative flex min-h-[245px] items-center justify-center border p-5 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold', detail.surface, shape === 'circle' ? 'aspect-square rounded-full' : 'rounded-2xl', shape === 'wide' && 'md:col-span-2')}>
    <span className="absolute left-4 top-4 flex items-center gap-1 text-xs opacity-85"><Users className="size-3.5" /> {table.capacity}</span>
    <span className="absolute right-4 top-4 rounded-full bg-white/60 px-2 py-1 text-[9px] font-bold text-coffee/70">{detail.label}</span>
    <div className="text-center"><strong className="block text-2xl tracking-[-0.04em]">{table.name}</strong><span className="mt-1 block text-[10px] font-bold tracking-[0.16em]">BÀN</span>{reference && <span className="mt-3 inline-flex rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-coffee">{reference}</span>}</div>
  </button>
}
