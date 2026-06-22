import { useEffect, useMemo, useState } from 'react'
import * as rosterApi from '../../../api/roster.api'
import * as shiftApi from '../../../api/shift.api'
import * as employeeApi from '../../../api/employee.api'
import { getAuthSession } from '../../../store/auth.store'
import type { RosterEntry, Shift, Employee, Branch, CreateRosterPayload } from '../../../types'

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']
const MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]

const SHIFT_TONES = [
  { dot: 'bg-teal-600', text: 'text-teal-800', border: 'border-teal-400', bg: 'bg-teal-50/80', bar: 'bg-teal-600' },
  { dot: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-400', bg: 'bg-blue-50/80', bar: 'bg-blue-600' },
  { dot: 'bg-red-500', text: 'text-red-700', border: 'border-red-300', bg: 'bg-red-50/80', bar: 'bg-red-500' },
  { dot: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-300', bg: 'bg-amber-50/80', bar: 'bg-amber-500' },
  { dot: 'bg-zinc-900', text: 'text-zinc-800', border: 'border-zinc-400', bg: 'bg-zinc-100/80', bar: 'bg-zinc-900' },
]

const ROW_HEIGHT = 78
const LEFT_WIDTH = 284
const GRID_DAYS = 7
const DAY_COLUMN = 'minmax(132px, 1fr)'
const SCHEDULE_GRID_TEMPLATE = `${LEFT_WIDTH}px repeat(${GRID_DAYS}, ${DAY_COLUMN})`
const SCHEDULE_MIN_WIDTH = LEFT_WIDTH + GRID_DAYS * 132

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(isoString?: string): string {
  if (!isoString) return '--:--'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString.slice(0, 5)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

function durationHours(shift?: Pick<Shift, 'startTime' | 'endTime'> | RosterEntry['shift']): number {
  if (!shift) return 0
  const [sh, sm] = formatTime(shift.startTime).split(':').map(Number)
  const [eh, em] = formatTime(shift.endTime).split(':').map(Number)
  if ([sh, sm, eh, em].some(Number.isNaN)) return 0
  let minutes = eh * 60 + em - (sh * 60 + sm)
  if (minutes < 0) minutes += 1440
  return minutes / 60
}

function shiftStartMinutes(shift?: Pick<Shift, 'startTime'> | RosterEntry['shift']): number {
  if (!shift) return Number.MAX_SAFE_INTEGER
  const [hour, minute] = formatTime(shift.startTime).split(':').map(Number)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return Number.MAX_SAFE_INTEGER
  return hour * 60 + minute
}

function sortRostersByTime(a: RosterEntry, b: RosterEntry): number {
  return shiftStartMinutes(a.shift) - shiftStartMinutes(b.shift)
}

function sameDate(a: string, b: Date): boolean {
  return a.startsWith(formatDate(b))
}

function employeeInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function ScheduleView() {
  const authSession = getAuthSession()
  const isChainOwner = authSession?.user?.roleName?.toLowerCase().includes('owner') || authSession?.user?.role?.toLowerCase().includes('owner')
  const userBranchId = authSession?.user?.branchId || ''
  const [rosters, setRosters] = useState<RosterEntry[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState(isChainOwner ? '' : userBranchId)
  const [weekStart, setWeekStart] = useState(formatDate(getMonday(new Date())))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showAssign, setShowAssign] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Employee['status']>('all')
  const [activeShiftIds, setActiveShiftIds] = useState<string[]>([])
  const [selectedRoster, setSelectedRoster] = useState<RosterEntry | null>(null)
  const [assignDate, setAssignDate] = useState('')
  const [assignEmployee, setAssignEmployee] = useState('')
  const [assignShift, setAssignShift] = useState('')

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    if (selectedBranch) loadData()
  }, [selectedBranch, weekStart])

  useEffect(() => {
    setActiveShiftIds((current) => {
      if (current.length > 0) return current.filter((id) => shifts.some((shift) => shift.id === id))
      return shifts.map((shift) => shift.id)
    })
  }, [shifts])

  async function loadBranches() {
    try {
      const res = await employeeApi.getBranches()
      const data = res.data
      const items = Array.isArray(data) ? data : (data as any)?.items || []
      setBranches(items)
      if (isChainOwner && items.length > 0 && !selectedBranch) setSelectedBranch(items[0].id)
    } catch {
      /* Branch selector is optional for non-owner users. */
    }
  }

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [rosterRes, shiftRes, empRes] = await Promise.all([
        rosterApi.getRosters({ branchId: selectedBranch, weekStart }),
        shiftApi.getShifts(selectedBranch),
        employeeApi.getEmployees({ branchId: selectedBranch, status: 'active', limit: 100 }),
      ])
      const rosterData = rosterRes.data
      const shiftData = shiftRes.data
      const empItems = empRes.data?.items ?? (Array.isArray(empRes.data) ? empRes.data : [])
      setRosters(Array.isArray(rosterData) ? rosterData : (rosterData as any)?.items || [])
      setShifts(Array.isArray(shiftData) ? shiftData : (shiftData as any)?.items || [])
      setEmployees(empItems)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch làm việc')
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign() {
    if (!assignEmployee || !assignShift || !assignDate) {
      setError('Vui lòng chọn nhân viên, ca làm và ngày trước khi lưu.')
      return
    }
    try {
      setSaving(true)
      setError('')
      const payload: CreateRosterPayload = {
        employeeId: assignEmployee,
        shiftId: assignShift,
        date: assignDate,
        branchId: selectedBranch,
      }
      await rosterApi.createRoster(payload)
      setNotice('Đã xếp lịch thành công.')
      setShowAssign(false)
      setAssignEmployee('')
      setAssignShift('')
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể xếp lịch')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id: string) {
    try {
      setSaving(true)
      await rosterApi.deleteRoster(id)
      setNotice('Đã xóa lịch làm việc.')
      setSelectedRoster(null)
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể xóa lịch')
    } finally {
      setSaving(false)
    }
  }

  const timelineDates = useMemo(() => {
    const startDate = parseDate(weekStart)
    return Array.from({ length: GRID_DAYS }, (_, index) => {
      const d = new Date(startDate)
      d.setDate(d.getDate() + index)
      return d
    })
  }, [weekStart])

  const visibleEmployees = useMemo(() => {
    return employees.filter((employee) => statusFilter === 'all' || employee.status === statusFilter)
  }, [employees, statusFilter])

  const visibleRosters = useMemo(() => {
    return rosters.filter((roster) => activeShiftIds.includes(roster.shiftId))
  }, [rosters, activeShiftIds])

  const employeeGroups = useMemo(() => {
    const groups = new Map<string, Employee[]>()
    visibleEmployees.forEach((employee) => {
      const key = employee.role?.name || 'Đội vận hành'
      groups.set(key, [...(groups.get(key) || []), employee])
    })
    return Array.from(groups.entries())
  }, [visibleEmployees])

  const totalHours = visibleRosters.reduce((sum, roster) => sum + durationHours(roster.shift), 0)
  const weeklyHours = visibleRosters
    .filter((roster) => timelineDates.slice(0, 7).some((date) => sameDate(roster.date, date)))
    .reduce((sum, roster) => sum + durationHours(roster.shift), 0)
  const selectedMonth = parseDate(weekStart).getMonth()

  function getTone(shiftId: string) {
    const index = Math.max(0, shifts.findIndex((shift) => shift.id === shiftId))
    return SHIFT_TONES[index % SHIFT_TONES.length]
  }

  function openAssign(employeeId?: string, date?: Date) {
    setAssignEmployee(employeeId || '')
    setAssignDate(date ? formatDate(date) : '')
    setAssignShift(shifts[0]?.id || '')
    setShowAssign(true)
  }

  function prevPeriod() {
    const d = parseDate(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(formatDate(getMonday(d)))
  }

  function nextPeriod() {
    const d = parseDate(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(formatDate(getMonday(d)))
  }

  function jumpToMonth(monthIndex: number) {
    const current = parseDate(weekStart)
    const target = new Date(current.getFullYear(), monthIndex, 4)
    setWeekStart(formatDate(getMonday(target)))
  }

  function toggleShift(shiftId: string) {
    setActiveShiftIds((current) => {
      if (current.includes(shiftId)) return current.filter((id) => id !== shiftId)
      return [...current, shiftId]
    })
  }

  return (
    <div className="space-y-5 text-[#17161f]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted">
            <span>Lịch</span>
            <span>/</span>
            <span className="text-coffee">Lịch làm việc</span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <h2 className="text-4xl font-black tracking-normal text-black">
              {timelineDates[0].getDate()} {MONTHS[timelineDates[0].getMonth()]} {timelineDates[0].getFullYear()}
            </h2>
            <button
              onClick={prevPeriod}
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-xl font-bold shadow-sm hover:bg-cream"
              title="Tuần trước"
            >
              &larr;
            </button>
            <button
              onClick={nextPeriod}
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-xl font-bold shadow-sm hover:bg-cream"
              title="Tuần sau"
            >
              &rarr;
            </button>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-3 pt-9">
          <button
            onClick={() => setShowFilters((value) => !value)}
            className="inline-flex h-12 items-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm hover:bg-cream"
          >
            <span className="text-lg leading-none">▽</span>
            Bộ lọc
            <span className="text-sm">{showFilters ? '^' : 'v'}</span>
          </button>
          <button
            onClick={() => openAssign()}
            className="inline-flex h-12 items-center gap-3 rounded-lg bg-[#171126] px-6 text-sm font-bold text-white shadow-sm hover:bg-[#241a38]"
          >
            <span className="text-lg leading-none">+</span>
            Xếp lịch
          </button>

          {showFilters && (
            <div className="absolute right-24 top-24 z-30 w-80 rounded-lg border border-line bg-white p-5 shadow-[0_18px_45px_rgba(23,17,38,0.16)]">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-black">Bộ lọc</h3>
                <button
                  onClick={() => {
                    setCountrySearch('')
                    setStatusFilter('all')
                    setActiveShiftIds(shifts.map((shift) => shift.id))
                  }}
                  className="text-xs font-bold text-blue-600 underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
              {isChainOwner && (
                <label className="mb-5 block">
                  <span className="mb-2 block text-sm font-bold text-muted">Chi nhánh</span>
                  <select
                    value={selectedBranch}
                    onChange={(event) => setSelectedBranch(event.target.value)}
                    className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500"
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="mb-5 border-t border-line pt-5">
                <div className="mb-3 flex items-center justify-between text-sm font-bold">
                  <span>Quốc gia</span>
                  <span>^</span>
                </div>
                <div className="mb-3 flex h-11 items-center rounded-lg border border-blue-500 px-3 shadow-[0_0_0_2px_rgba(37,99,235,0.12)]">
                  <input
                    value={countrySearch}
                    onChange={(event) => setCountrySearch(event.target.value)}
                    placeholder="Tìm kiếm"
                    className="w-full border-0 bg-transparent text-sm outline-none"
                  />
                  <span className="text-lg text-muted">⌕</span>
                </div>
                {['Belarus', 'Serbia', 'Georgia', 'Ukraine', 'Vương quốc Anh', 'Hoa Kỳ']
                  .filter((country) => country.toLowerCase().includes(countrySearch.toLowerCase()))
                  .map((country) => (
                    <label key={country} className="flex h-9 items-center gap-3 text-sm text-muted">
                      <input type="checkbox" checked={country === 'Vương quốc Anh'} readOnly className="h-5 w-5 accent-blue-600" />
                      <span className={country === 'Vương quốc Anh' ? 'font-semibold text-[#17161f]' : ''}>{country}</span>
                    </label>
                  ))}
              </div>
              <label className="block border-t border-line pt-5">
                <span className="mb-2 block text-sm font-bold text-muted">Trạng thái</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                  className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả nhân viên đang làm</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="on_leave">Đang nghỉ phép</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="resigned">Đã nghỉ việc</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 overflow-hidden rounded-lg border border-line bg-white text-sm">
        {MONTHS.map((month, index) => (
          <button
            key={month}
            onClick={() => jumpToMonth(index)}
            className={`h-9 border-r border-line font-bold last:border-r-0 ${index === selectedMonth ? 'bg-white text-black shadow-inner' : 'bg-[#fbfbfb] text-muted hover:bg-cream'}`}
          >
            {month}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[280px_1fr_150px] items-center gap-6 rounded-lg border border-line bg-white px-6 py-5 shadow-sm">
        <div className="border-r border-line pr-6">
          <div className="text-xs font-bold text-muted">Tổng giờ làm trong tuần</div>
          <div className="mt-3 flex items-center gap-5">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-teal-50">
              <div className="h-full w-4/5 rounded-full bg-teal-600" />
            </div>
            <strong className="text-2xl text-black">{Math.round(weeklyHours)}h</strong>
          </div>
        </div>
        <div>
          <div className="mb-3 text-xs font-bold text-muted">Tỷ lệ giờ làm theo ca</div>
          <div className="flex h-2 overflow-hidden rounded-full bg-teal-50">
            {shifts.map((shift) => {
              const tone = getTone(shift.id)
              const width = Math.max(8, (visibleRosters.filter((roster) => roster.shiftId === shift.id).length / Math.max(visibleRosters.length, 1)) * 100)
              return <div key={shift.id} className={tone.bar} style={{ width: `${width}%` }} />
            })}
          </div>
        </div>
        <div>
          <div className="text-xs font-bold text-muted">Tổng trong giai đoạn</div>
          <strong className="mt-1 block text-2xl text-black">{Math.round(totalHours)}h</strong>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {shifts.map((shift) => {
            const tone = getTone(shift.id)
            const isActive = activeShiftIds.includes(shift.id)
            return (
              <button
                key={shift.id}
                onClick={() => toggleShift(shift.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold shadow-sm ${isActive ? 'border-line bg-white text-[#17161f]' : 'border-line bg-[#f8f8f8] text-muted opacity-60'}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                {shift.name}
                <span className="font-medium text-muted">({formatTime(shift.startTime)} - {formatTime(shift.endTime)})</span>
                <span className="pl-1 text-lg leading-none">x</span>
              </button>
            )
          })}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCategories((value) => !value)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold shadow-sm"
          >
            <span className="text-muted">Danh mục:</span>
            Nhiều lựa chọn
            <span>{showCategories ? '^' : 'v'}</span>
          </button>
          {showCategories && (
            <div className="absolute right-0 top-12 z-20 w-72 rounded-lg border border-line bg-white py-4 shadow-[0_18px_45px_rgba(23,17,38,0.16)]">
              {shifts.map((shift) => {
                const tone = getTone(shift.id)
                return (
                  <button
                    key={shift.id}
                    onClick={() => toggleShift(shift.id)}
                    className="flex h-12 w-full items-center gap-3 px-5 text-left text-sm font-bold hover:bg-cream"
                  >
                    <span className="w-5 text-muted">{activeShiftIds.includes(shift.id) ? '✓' : ''}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                    <span>{shift.name}</span>
                    <span className="font-medium text-muted">({formatTime(shift.startTime)} - {formatTime(shift.endTime)})</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
      {notice && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">{notice}</div>}

      {showAssign && (
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black">Xếp lịch làm việc</h3>
            <button onClick={() => setShowAssign(false)} className="grid h-9 w-9 place-items-center rounded-full border border-line text-xl hover:bg-cream">×</button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <label>
              <span className="mb-1 block text-xs font-bold text-muted">Nhân viên</span>
              <select value={assignEmployee} onChange={(event) => setAssignEmployee(event.target.value)} className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-coffee">
                <option value="">Chọn nhân viên</option>
                {visibleEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold text-muted">Ca làm</span>
              <select value={assignShift} onChange={(event) => setAssignShift(event.target.value)} className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-coffee">
                <option value="">Chọn ca làm</option>
                {shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)})</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold text-muted">Ngày</span>
              <input type="date" value={assignDate} onChange={(event) => setAssignDate(event.target.value)} className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-coffee" />
            </label>
            <div className="flex items-end gap-2">
              <button onClick={handleAssign} disabled={saving} className="h-11 rounded-lg bg-coffee px-5 text-sm font-bold text-white hover:bg-coffee/90 disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu lịch'}
              </button>
              <button onClick={() => setShowAssign(false)} className="h-11 rounded-lg border border-line px-5 text-sm font-bold text-muted hover:bg-cream">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-line bg-white py-12 text-center text-sm font-semibold text-muted">Đang tải lịch làm việc...</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div style={{ minWidth: SCHEDULE_MIN_WIDTH }}>
              <div className="sticky top-0 z-10 grid bg-white" style={{ gridTemplateColumns: SCHEDULE_GRID_TEMPLATE }}>
                <div className="sticky left-0 z-20 flex h-16 items-center border-b border-r border-line bg-white px-6 text-sm font-black">
                  Nhân viên
                  <span className="ml-2 rounded-full bg-[#f2f2f2] px-2 py-1 text-xs text-muted">{visibleEmployees.length}</span>
                </div>
                {timelineDates.map((date) => {
                  const isToday = formatDate(date) === formatDate(new Date())
                  return (
                    <div key={formatDate(date)} className="flex h-16 flex-col items-center justify-center border-b border-r border-line">
                      <div className={`grid h-14 w-14 place-items-center rounded-lg ${isToday ? 'bg-blue-600 text-white' : 'text-[#17161f]'}`}>
                        <span className="text-xl font-black leading-5">{date.getDate()}</span>
                        <span className="text-xs font-medium">{DAY_LABELS[(date.getDay() + 6) % 7]}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {employeeGroups.length === 0 ? (
                <div className="py-14 text-center text-sm font-semibold text-muted">Không tìm thấy nhân viên trong lịch này.</div>
              ) : (
                employeeGroups.map(([groupName, groupEmployees]) => (
                  <div key={groupName}>
                    <div className="grid" style={{ gridTemplateColumns: SCHEDULE_GRID_TEMPLATE }}>
                      <div className="sticky left-0 z-10 flex h-10 items-center gap-3 border-b border-r border-line bg-green-50 px-6 text-xs font-black uppercase text-green-700">
                        <span className="h-5 w-5 rounded border border-line bg-white" />
                        {groupName}
                      </div>
                      <div className="border-b border-line bg-green-50/70" style={{ gridColumn: `2 / span ${GRID_DAYS}` }} />
                    </div>
                    {groupEmployees.map((employee) => {
                      const employeeRosters = visibleRosters.filter((roster) => roster.employeeId === employee.id)
                      const maxRosterCount = Math.max(
                        1,
                        ...timelineDates.map((date) => employeeRosters.filter((roster) => sameDate(roster.date, date)).length),
                      )
                      const rowHeight = Math.max(ROW_HEIGHT, 24 + maxRosterCount * 60)
                      return (
                        <div key={employee.id} className="grid" style={{ gridTemplateColumns: SCHEDULE_GRID_TEMPLATE }}>
                          <div className="sticky left-0 z-10 flex items-center gap-4 border-b border-r border-line bg-white px-6" style={{ height: rowHeight }}>
                            <span className="h-5 w-5 rounded border border-line bg-white" />
                            {employee.avatarUrl ? (
                              <img src={employee.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <span className="grid h-10 w-10 place-items-center rounded-full bg-coffee text-xs font-black text-white">
                                {employeeInitials(employee.fullName)}
                              </span>
                            )}
                            <div className="min-w-0">
                              <div className="truncate text-sm font-black">{employee.fullName}</div>
                              <div className="truncate text-xs font-semibold text-muted">@{employee.email?.split('@')[0] || employee.phone}</div>
                            </div>
                          </div>
                          {timelineDates.map((date) => {
                            const cellRosters = employeeRosters
                              .filter((roster) => sameDate(roster.date, date))
                              .sort(sortRostersByTime)
                            return (
                              <div
                                key={formatDate(date)}
                                onClick={() => openAssign(employee.id, date)}
                                className="cursor-pointer space-y-2 border-b border-r border-line bg-white p-2 hover:bg-cream/70"
                                style={{ height: rowHeight }}
                                title="Xếp ca"
                              >
                                {cellRosters.map((roster) => {
                                  const tone = getTone(roster.shiftId)
                                  return (
                                    <button
                                      key={roster.id}
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        setSelectedRoster(roster)
                                      }}
                                      className={`flex h-12 w-full flex-col justify-center rounded border px-3 text-left text-xs font-black shadow-sm ${tone.border} ${tone.bg} ${tone.text}`}
                                      title={`${roster.shift?.name || 'Ca làm'} ${formatTime(roster.shift?.startTime)} - ${formatTime(roster.shift?.endTime)}`}
                                    >
                                      <span className="truncate">{roster.shift?.name || 'Ca làm'}</span>
                                      <span className="font-semibold text-[#6f6a72]">{formatTime(roster.shift?.startTime)} - {formatTime(roster.shift?.endTime)}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-line bg-white px-5 py-4 text-sm font-bold">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-11 place-items-center rounded border border-line bg-white">10</span>
              <span>Dòng mỗi trang</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={prevPeriod} className="grid h-9 w-9 place-items-center rounded border border-line hover:bg-cream">&lsaquo;</button>
              <span>1</span>
              <button onClick={nextPeriod} className="grid h-9 w-9 place-items-center rounded border border-line hover:bg-cream">&rsaquo;</button>
            </div>
            <div className="flex items-center gap-3">
              <span>Trang</span>
              <span className="grid h-9 w-11 place-items-center rounded border border-line bg-white">1</span>
            </div>
          </div>
        </div>
      )}

      {selectedRoster && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/10 p-4" onClick={() => setSelectedRoster(null)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(23,17,38,0.18)]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${getTone(selectedRoster.shiftId).dot}`} />
                  <h3 className="text-xl font-black">{selectedRoster.shift?.name || 'Ca làm'}</h3>
                </div>
                <div className="mt-2 text-sm font-semibold text-muted">{formatTime(selectedRoster.shift?.startTime)} - {formatTime(selectedRoster.shift?.endTime)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openAssign(selectedRoster.employeeId, parseDate(selectedRoster.date.slice(0, 10)))} className="grid h-9 w-9 place-items-center rounded-full border border-line text-lg hover:bg-cream" title="Chỉnh sửa">✎</button>
                <button onClick={() => handleRemove(selectedRoster.id)} disabled={saving} className="grid h-9 w-9 place-items-center rounded-full border border-line text-lg hover:bg-red-50 disabled:opacity-50" title="Xóa">⌫</button>
                <button onClick={() => setSelectedRoster(null)} className="grid h-9 w-9 place-items-center rounded-full border border-line text-xl hover:bg-cream" title="Đóng">×</button>
              </div>
            </div>
            <div className="space-y-4 text-sm font-bold">
              <div className="flex items-center gap-4">
                <span className="text-2xl">▣</span>
                <span>{new Date(selectedRoster.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">♙</span>
                <span>{selectedRoster.employee?.fullName || employees.find((employee) => employee.id === selectedRoster.employeeId)?.fullName || 'Nhân viên'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
