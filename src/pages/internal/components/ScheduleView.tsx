import { useEffect, useState } from 'react'
import * as rosterApi from '../../../api/roster.api'
import * as shiftApi from '../../../api/shift.api'
import * as employeeApi from '../../../api/employee.api'
import type { RosterEntry, Shift, Employee, Branch, CreateRosterPayload } from '../../../types'

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

export function ScheduleView() {
  const [rosters, setRosters] = useState<RosterEntry[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [weekStart, setWeekStart] = useState(formatDate(getMonday(new Date())))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Assignment modal
  const [showAssign, setShowAssign] = useState(false)
  const [assignDate, setAssignDate] = useState('')
  const [assignEmployee, setAssignEmployee] = useState('')
  const [assignShift, setAssignShift] = useState('')

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      loadData()
    }
  }, [selectedBranch, weekStart])

  async function loadBranches() {
    try {
      const res = await employeeApi.getBranches()
      const items = Array.isArray(res.data) ? res.data : []
      setBranches(items)
      if (items.length > 0 && !selectedBranch) setSelectedBranch(items[0].id)
    } catch { /* ignore */ }
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
      setRosters(Array.isArray(rosterRes.data) ? rosterRes.data : [])
      setShifts(Array.isArray(shiftRes.data) ? shiftRes.data : [])
      const empItems = empRes.data?.items ?? (Array.isArray(empRes.data) ? empRes.data : [])
      setEmployees(empItems)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign() {
    if (!assignEmployee || !assignShift || !assignDate) {
      setError('Vui lòng chọn đầy đủ nhân viên, ca và ngày')
      return
    }
    try {
      setError('')
      const payload: CreateRosterPayload = {
        employeeId: assignEmployee,
        shiftId: assignShift,
        date: assignDate,
        branchId: selectedBranch,
      }
      await rosterApi.createRoster(payload)
      setNotice('Đã xếp lịch thành công')
      setShowAssign(false)
      setAssignEmployee('')
      setAssignShift('')
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xếp lịch')
    }
  }

  async function handleRemove(id: string) {
    try {
      await rosterApi.deleteRoster(id)
      setNotice('Đã xóa lịch')
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xóa')
    }
  }

  // Build week dates
  const weekDates: Date[] = []
  const startDate = new Date(weekStart)
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    weekDates.push(d)
  }

  function getRostersForCell(employeeId: string, date: Date): RosterEntry[] {
    const dateStr = formatDate(date)
    return rosters.filter(
      (r) => r.employeeId === employeeId && r.date.startsWith(dateStr)
    )
  }

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(formatDate(d))
  }

  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(formatDate(d))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Lịch làm việc (UC60)</h2>
        <button onClick={() => setShowAssign(true)}
          className="rounded-lg bg-coffee px-4 py-2 text-sm font-bold text-white hover:bg-coffee/90 transition-colors">
          + Xếp lịch
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted">Chi nhánh:</label>
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="rounded border border-line px-2 py-1 text-xs hover:bg-surface-alt">◀</button>
          <span className="text-sm font-medium">
            {weekDates[0]?.toLocaleDateString('vi-VN')} – {weekDates[6]?.toLocaleDateString('vi-VN')}
          </span>
          <button onClick={nextWeek} className="rounded border border-line px-2 py-1 text-xs hover:bg-surface-alt">▶</button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">{notice}</div>}

      {/* Assignment modal */}
      {showAssign && (
        <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
          <h3 className="font-bold text-sm">Xếp lịch mới</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-muted">Nhân viên *</label>
              <select value={assignEmployee} onChange={(e) => setAssignEmployee(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm">
                <option value="">Chọn nhân viên</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Ca làm việc *</label>
              <select value={assignShift} onChange={(e) => setAssignShift(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm">
                <option value="">Chọn ca</option>
                {shifts.map((s) => <option key={s.id} value={s.id}>{s.name} ({formatTime(s.startTime)}-{formatTime(s.endTime)})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Ngày *</label>
              <input type="date" value={assignDate} onChange={(e) => setAssignDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAssign} className="rounded-lg bg-coffee px-4 py-2 text-sm font-bold text-white hover:bg-coffee/90">
              Xác nhận
            </button>
            <button onClick={() => setShowAssign(false)} className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-gray-50">
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Weekly grid */}
      {loading ? (
        <div className="py-8 text-center text-muted text-sm">Đang tải...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="px-3 py-2 text-left font-bold text-muted min-w-[140px]">Nhân viên</th>
                {weekDates.map((d, i) => (
                  <th key={i} className="px-2 py-2 text-center font-bold text-muted min-w-[100px]">
                    <div>{DAYS[i]}</div>
                    <div className="text-xs font-normal">{d.getDate()}/{d.getMonth() + 1}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {employees.length === 0 ? (
                <tr><td colSpan={8} className="py-6 text-center text-muted">Không có nhân viên</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-3 py-2 font-medium">{emp.fullName}</td>
                    {weekDates.map((date, i) => {
                      const cellRosters = getRostersForCell(emp.id, date)
                      return (
                        <td key={i} className="px-2 py-2 text-center">
                          {cellRosters.length > 0 ? cellRosters.map((r) => (
                            <div key={r.id} className="mb-1 inline-flex items-center gap-1 rounded bg-coffee/10 px-1.5 py-0.5 text-xs text-coffee">
                              <span>{r.shift?.name ?? '?'}</span>
                              <button onClick={() => handleRemove(r.id)}
                                className="text-red-400 hover:text-red-600 font-bold" title="Xóa">×</button>
                            </div>
                          )) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
