import { useEffect, useState } from 'react'
import * as payrollApi from '../../../api/payroll.api'
import * as employeeApi from '../../../api/employee.api'
import type { PayrollSummary, Branch } from '../../../types'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function PayrollView() {
  const [payroll, setPayroll] = useState<PayrollSummary[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    loadPayroll()
  }, [selectedBranch, selectedMonth])

  async function loadBranches() {
    try {
      const res = await employeeApi.getBranches()
      setBranches(Array.isArray(res.data) ? res.data : [])
    } catch { /* ignore */ }
  }

  async function loadPayroll() {
    try {
      setLoading(true)
      setError('')
      const res = await payrollApi.getPayroll({
        month: selectedMonth,
        branchId: selectedBranch || undefined,
      })
      setPayroll(Array.isArray(res.data) ? res.data : [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load payroll')
    } finally {
      setLoading(false)
    }
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const totalSalary = payroll.reduce((sum, p) => sum + p.estimatedSalary, 0)
  const totalHours = payroll.reduce((sum, p) => sum + p.totalWorkedHours, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Bảng lương (UC62)</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted">Tháng:</label>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted">Chi nhánh:</label>
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
            <option value="">Tất cả</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs font-medium text-muted">Tổng nhân viên</div>
          <div className="text-2xl font-bold text-foreground">{payroll.length}</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs font-medium text-muted">Tổng giờ làm</div>
          <div className="text-2xl font-bold text-coffee">{totalHours.toFixed(1)}h</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs font-medium text-muted">Tổng lương ước tính</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSalary)}</div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {/* Payroll table */}
      {loading ? (
        <div className="py-8 text-center text-muted text-sm">Đang tải...</div>
      ) : payroll.length === 0 ? (
        <div className="py-8 text-center text-muted text-sm">Không có dữ liệu lương cho tháng này</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-muted">Nhân viên</th>
                <th className="px-4 py-3 text-left font-bold text-muted">Chi nhánh</th>
                <th className="px-4 py-3 text-left font-bold text-muted">Vai trò</th>
                <th className="px-4 py-3 text-right font-bold text-muted">Lương cơ bản</th>
                <th className="px-4 py-3 text-right font-bold text-muted">Giờ làm</th>
                <th className="px-4 py-3 text-right font-bold text-muted">Ngày làm</th>
                <th className="px-4 py-3 text-right font-bold text-muted">Đến muộn</th>
                <th className="px-4 py-3 text-right font-bold text-muted">Lương ước tính</th>
                <th className="px-4 py-3 text-center font-bold text-muted">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payroll.map((p) => (
                <>
                  <tr key={p.employeeId} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.employeeName}</td>
                    <td className="px-4 py-3">{p.branchName ?? '—'}</td>
                    <td className="px-4 py-3">{p.roleName ?? '—'}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(p.baseSalary)}</td>
                    <td className="px-4 py-3 text-right">{p.totalWorkedHours.toFixed(1)}h</td>
                    <td className="px-4 py-3 text-right">{p.totalDays}</td>
                    <td className="px-4 py-3 text-right">
                      {p.lateArrivals > 0 ? (
                        <span className="text-orange-500 font-bold">{p.lateArrivals}</span>
                      ) : '0'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(p.estimatedSalary)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setExpandedId(expandedId === p.employeeId ? null : p.employeeId)}
                        className="text-coffee hover:underline text-xs font-bold">
                        {expandedId === p.employeeId ? 'Thu gọn' : 'Xem'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === p.employeeId && p.dailyDetails.length > 0 && (
                    <tr key={`${p.employeeId}-detail`}>
                      <td colSpan={9} className="px-4 py-3 bg-surface-alt/30">
                        <div className="text-xs font-bold text-muted mb-2">Chi tiết chấm công hàng ngày:</div>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                          {p.dailyDetails.map((d, idx) => (
                            <div key={idx} className="rounded border border-line bg-surface px-3 py-2 text-xs">
                              <span className="font-medium">{new Date(d.date).toLocaleDateString('vi-VN')}</span>
                              {' — '}
                              <span>{d.checkIn ? new Date(d.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '?'}</span>
                              {' → '}
                              <span>{d.checkOut ? new Date(d.checkOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'chưa ra'}</span>
                              <span className="text-muted ml-1">({d.workedHours}h)</span>
                              {d.shiftName && <span className="ml-1 text-coffee">[{d.shiftName}]</span>}
                              {d.note && <span className="ml-1 text-orange-500">⚠ {d.note}</span>}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
