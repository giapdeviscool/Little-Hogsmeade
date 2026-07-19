import { useState, useEffect } from 'react'
import { Plus, Settings, FileText, Trash2, Calendar } from 'lucide-react'
import { getExpenses, deleteExpense, type Expense } from '@/api/expense.api'
import { getBranches } from '@/api/chain.api'
import type { Branch } from '@/types'
import { getAuthSession } from '@/store/auth.store'
import { formatVND } from '@/utils/formatCurrency'
import { formatVnDate } from '@/utils/date'
import { ExpenseModal } from './ExpenseModal'
import { ExpenseCategoryModal } from './ExpenseCategoryModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function ExpenseManagement() {
  const session = getAuthSession()
  const currentBranchId = session?.user?.branchId || ''
  const roleName = session?.user?.role?.name || ''
  const isOwner = ['owner', 'admin', 'chủ quán', 'chu quan', 'manager'].some(r => roleName.toLowerCase().includes(r)) || !currentBranchId || roleName === ''

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState(currentBranchId)

  useEffect(() => {
    getBranches().then(res => {
      const fetchedBranches = res.data?.items || (Array.isArray(res.data) ? res.data : [])
      setBranches(fetchedBranches)
      if (!selectedBranchId && fetchedBranches.length > 0) {
        setSelectedBranchId(fetchedBranches[0].id)
      }
    }).catch(err => console.error(err))
  }, [selectedBranchId])

  const fetchExpenses = async () => {
    const branchToFetch = isOwner ? selectedBranchId : currentBranchId
    if (!branchToFetch) return
    setIsLoading(true)
    try {
      // Fetching all for simplicity, can add date filters later
      const data = await getExpenses(currentBranchId)
      setExpenses(data)
    } catch (error) {
      console.error(error)
      alert('Lỗi khi tải danh sách phiếu chi')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [selectedBranchId, currentBranchId])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteExpense(deleteId)
      alert('Đã xóa phiếu chi')
      fetchExpenses()
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Lỗi khi xóa phiếu chi')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee">Quản lý Phiếu chi</h1>
          <p className="mt-1 text-sm text-muted">Ghi nhận và theo dõi các khoản chi phí của quán</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(isOwner || branches.length > 0) && (
            <select
              className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-coffee outline-none cursor-pointer"
              value={selectedBranchId || currentBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              {branches.length === 0 && currentBranchId && (
                <option value={currentBranchId}>Chi nhánh hiện tại</option>
              )}
            </select>
          )}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-beige px-4 py-2 text-sm font-semibold text-coffee transition hover:bg-beige/80"
          >
            <Settings className="h-4 w-4" />
            Danh mục chi phí
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-coffee px-4 py-2 text-sm font-semibold text-white transition hover:bg-coffee/90 shadow-soft"
          >
            <Plus className="h-4 w-4" />
            Tạo phiếu chi
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-2xl bg-white shadow-sm border border-line">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-cream/95 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 font-semibold text-muted">Ngày ghi nhận</th>
              <th className="px-6 py-4 font-semibold text-muted">Hạng mục</th>
              <th className="px-6 py-4 font-semibold text-muted">Nội dung chi</th>
              <th className="px-6 py-4 font-semibold text-muted text-right">Số tiền (VNĐ)</th>
              <th className="px-6 py-4 font-semibold text-muted">Người tạo</th>
              <th className="px-6 py-4 font-semibold text-muted">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted">Đang tải dữ liệu...</td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-muted">
                    <FileText className="h-12 w-12 mb-3 opacity-20" />
                    <p>Chưa có phiếu chi nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="transition-colors hover:bg-beige/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted" />
                      {formatVnDate(exp.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      exp.expenseCategory?.costType === 'FIXED' ? 'bg-orange-100 text-orange-700' : 
                      exp.expenseCategory?.costType === 'SEMI_VARIABLE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {exp.expenseCategory?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-[300px] truncate">{exp.description}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-red-600">
                    -{formatVND(exp.amount)}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {exp.employee?.fullName}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDeleteId(exp.id)}
                      className="rounded p-1.5 text-red-500 transition hover:bg-red-50"
                      title="Xóa phiếu chi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={fetchExpenses}
        branchId={isOwner ? selectedBranchId : currentBranchId}
      />

      <ExpenseCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        title="Xóa phiếu chi"
        message="Bạn có chắc chắn muốn xóa phiếu chi này không? Thao tác này không thể hoàn tác và sẽ ảnh hưởng đến báo cáo tài chính."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
