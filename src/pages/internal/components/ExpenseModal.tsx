import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { getExpenseCategories, createExpense, type ExpenseCategory } from '@/api/expense.api'
import { getAuthSession } from '@/store/auth.store'
import { CurrencyInput } from '@/components/ui/CurrencyInput'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  branchId: string
}

export function ExpenseModal({ isOpen, onClose, onSuccess, branchId }: ExpenseModalProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    expenseCategoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      setFormData({
        expenseCategoryId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      })
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const data = await getExpenseCategories()
      setCategories(data)
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, expenseCategoryId: data[0].id }))
      }
    } catch (error) {
      alert('Không thể tải danh mục chi phí')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchId) {
      alert('Không xác định được chi nhánh')
      return
    }

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      alert('Số tiền không hợp lệ')
      return
    }

    setIsLoading(true)
    try {
      await createExpense({
        branchId: branchId,
        expenseCategoryId: formData.expenseCategoryId,
        amount: Number(formData.amount),
        description: formData.description,
        date: formData.date
      })
      alert('Tạo phiếu chi thành công')
      onSuccess()
      onClose()
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Lỗi khi tạo phiếu chi')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-xl font-bold text-coffee">Tạo phiếu chi mới</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted transition hover:bg-beige"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold uppercase tracking-wider text-muted">
                Hạng mục chi *
              </label>
              <select
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee"
                value={formData.expenseCategoryId}
                onChange={(e) => setFormData({ ...formData, expenseCategoryId: e.target.value })}
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.costType === 'FIXED' ? 'Định phí' : cat.costType === 'SEMI_VARIABLE' ? 'Hỗn hợp' : 'Biến phí'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold uppercase tracking-wider text-muted">
                Ngày chi *
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold uppercase tracking-wider text-muted">
                Số tiền (VNĐ) *
              </label>
              <CurrencyInput
                required
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee font-semibold text-red-600"
                placeholder="VD: 15.000.000"
                value={formData.amount}
                onValueChange={(val) => setFormData({ ...formData, amount: val })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold uppercase tracking-wider text-muted">
                Nội dung chi *
              </label>
              <textarea
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee resize-none"
                rows={3}
                placeholder="VD: Thanh toán tiền điện tháng 5"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 font-semibold text-coffee transition hover:bg-beige"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || categories.length === 0}
              className="rounded-xl bg-coffee px-5 py-2.5 font-semibold text-white transition hover:bg-coffee/90 disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu phiếu chi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
