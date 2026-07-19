import { useEffect, useState, useMemo } from 'react'
import * as payrollApi from '../../../api/payroll.api'
import * as employeeApi from '../../../api/employee.api'
import { getExpenseCategories, createExpenseCategory, createExpense } from '../../../api/expense.api'
import { getAuthSession } from '../../../store/auth.store'
import type { PayrollSummary, Branch } from '../../../types'
import { TimesheetModal } from './TimesheetModal'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function PayrollView() {
  const authSession = getAuthSession()
  const isChainOwner = authSession?.user?.roleName?.toLowerCase().includes('owner') || authSession?.user?.role?.toLowerCase().includes('owner')
  const isChainAdmin = authSession?.user?.roleName?.toLowerCase().includes('chain admin') || authSession?.user?.role?.toLowerCase().includes('chain admin')
  const userBranchId = authSession?.user?.branchId || ''

  const [payroll, setPayroll] = useState<PayrollSummary[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState(isChainOwner ? '' : userBranchId)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Trạng thái thanh toán
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    loadPayroll()
  }, [selectedBranch, selectedMonth])

  async function loadBranches() {
    try {
      const res = await employeeApi.getBranches()
      const data = res.data
      const items = Array.isArray(data) ? data : (data as any)?.items || []
      setBranches(items)
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

  // Tính lương Part-time theo branch
  const partTimePayroll = payroll.filter(p => p.employeeType === 'part_time' || p.roleName?.toLowerCase().includes('part-time') || p.roleName?.toLowerCase().includes('bán thời gian'))
  const partTimeTotalSalary = partTimePayroll.reduce((sum, p) => sum + p.estimatedSalary, 0)

  const handlePayPartTime = async () => {
    if (partTimeTotalSalary <= 0) {
      alert('Không có lương nhân viên part-time để thanh toán trong tháng này.')
      return
    }

    if (!confirm(`Bạn có chắc chắn muốn thanh toán tổng cộng ${formatCurrency(partTimeTotalSalary)} cho nhân viên part-time?`)) {
      return
    }

    setIsPaying(true)
    try {
      // Nhóm theo chi nhánh
      const branchTotals = partTimePayroll.reduce((acc, p) => {
        acc[p.branchId] = (acc[p.branchId] || 0) + p.estimatedSalary
        return acc
      }, {} as Record<string, number>)

      // Gọi API lấy categories
      const categories = await getExpenseCategories()

      for (const branchId of Object.keys(branchTotals)) {
        let cat = categories.find(c => c.name.toLowerCase().includes('lương nhân viên part-time') && (c.branchId === branchId || !c.branchId))
        if (!cat) {
          cat = await createExpenseCategory({
            name: 'Lương nhân viên part-time',
            costType: 'VARIABLE',
            isSystem: false,
            branchId
          })
          categories.push(cat)
        }

        await createExpense({
          branchId,
          expenseCategoryId: cat.id,
          amount: branchTotals[branchId],
          description: `Thanh toán lương Part-time tháng ${selectedMonth}`,
          date: new Date().toISOString(),
          employeeId: authSession?.user?.id || ''
        })
      }

      alert('Thanh toán lương Part-time thành công!')
    } catch (err: any) {
      alert('Lỗi khi thanh toán: ' + (err.message || 'Unknown error'))
    } finally {
      setIsPaying(false)
    }
  }

  // Phân trang
  const totalPages = Math.ceil(payroll.length / itemsPerPage)
  const paginatedPayroll = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return payroll.slice(start, start + itemsPerPage)
  }, [payroll, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedBranch, selectedMonth, payroll.length])

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
        {/* Branch filter - Only show for Owner */}
        {isChainOwner && (
          <div className="flex gap-3 items-center">
            <label className="text-sm font-medium text-secondary min-w-[100px]">Chi nhánh:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-border bg-white px-4 py-2 text-sm focus:border-coffee focus:outline-none"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
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
                {!isChainAdmin && <th className="px-4 py-3 text-left font-bold text-muted">Chi nhánh</th>}
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
              {paginatedPayroll.map((p) => (
                <tr key={p.employeeId} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.employeeName}</td>
                  {!isChainAdmin && <td className="px-4 py-3">{p.branchName ?? '—'}</td>}
                  <td className="px-4 py-3">
                    {p.roleName ?? '—'}
                    {p.employeeType === 'part_time' && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Part-time</span>}
                  </td>
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
                    <button onClick={() => setExpandedId(p.employeeId)}
                      className="text-coffee hover:underline text-xs font-bold">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && payroll.length > itemsPerPage && (
        <div className="flex items-center justify-between border-t border-line pt-4 mt-4">
          <div className="text-sm text-muted">
            Hiển thị <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-bold">{Math.min(currentPage * itemsPerPage, payroll.length)}</span> trong <span className="font-bold">{payroll.length}</span> nhân viên
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-line bg-white text-sm disabled:opacity-50 hover:bg-cream transition-colors"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-line bg-white text-sm disabled:opacity-50 hover:bg-cream transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Payment Action */}
      {(isChainOwner || isChainAdmin) && partTimePayroll.length > 0 && (
        <div className="mt-8 p-6 bg-coffee/5 border border-coffee/20 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-coffee text-lg">Thanh toán lương Part-time</h3>
            <p className="text-sm text-muted mt-1">
              Có <strong className="text-foreground">{partTimePayroll.length}</strong> nhân viên part-time. Tổng lương cần thanh toán: <strong className="text-green-600">{formatCurrency(partTimeTotalSalary)}</strong>
            </p>
          </div>
          <button
            onClick={handlePayPartTime}
            disabled={isPaying}
            className="px-6 py-2.5 bg-coffee text-white font-bold rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPaying ? 'Đang xử lý...' : 'Tạo phiếu chi tự động'}
          </button>
        </div>
      )}

      <TimesheetModal 
        isOpen={!!expandedId} 
        onClose={() => setExpandedId(null)} 
        payroll={payroll.find(p => p.employeeId === expandedId) || null} 
      />
    </div>
  )
}
