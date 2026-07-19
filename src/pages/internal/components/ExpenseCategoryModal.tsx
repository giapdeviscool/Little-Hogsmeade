import { useState, useEffect } from 'react'
import { X, Trash2, Plus, ShieldAlert } from 'lucide-react'
import { getExpenseCategories, createExpenseCategory, deleteExpenseCategory, type ExpenseCategory } from '@/api/expense.api'
import { getAuthSession } from '@/store/auth.store'

interface ExpenseCategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExpenseCategoryModal({ isOpen, onClose }: ExpenseCategoryModalProps) {
  const currentBranchId = getAuthSession()?.user?.branchId || null
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCostType, setNewCostType] = useState('VARIABLE')

  const fetchCategories = async () => {
    try {
      const data = await getExpenseCategories()
      setCategories(data)
    } catch (error) {
      alert('Không thể tải danh mục chi phí')
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      setNewCatName('')
    }
  }, [isOpen])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    setIsLoading(true)
    try {
      await createExpenseCategory({ 
        name: newCatName.trim(), 
        costType: newCostType,
        isSystem: false,
        branchId: currentBranchId 
      })
      alert('Đã thêm danh mục')
      setNewCatName('')
      fetchCategories()
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Lỗi khi thêm danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (cat: ExpenseCategory) => {
    if (cat.isSystem) {
      alert('Không thể xóa danh mục hệ thống')
      return
    }
    
    try {
      await deleteExpenseCategory(cat.id)
      alert('Đã xóa danh mục')
      fetchCategories()
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Không thể xóa danh mục này (có thể đã có giao dịch)')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-xl font-bold text-coffee">Quản lý Danh mục Chi phí</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted transition hover:bg-beige"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleAdd} className="mb-6 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Tên danh mục (VD: Tiền điện)"
              className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-xl border border-line bg-cream px-3 py-2.5 outline-none transition focus:border-coffee"
                value={newCostType}
                onChange={(e) => setNewCostType(e.target.value)}
              >
                <option value="VARIABLE">Biến phí (Thay đổi theo DS)</option>
                <option value="FIXED">Định phí (Cố định)</option>
                <option value="SEMI_VARIABLE">Hỗn hợp (Bán biến phí)</option>
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center rounded-xl bg-coffee px-4 text-white transition hover:bg-coffee/90 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between rounded-xl border border-line p-3 hover:bg-beige/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-coffee">{cat.name}</span>
                    {cat.isSystem && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Hệ thống
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${
                    cat.costType === 'FIXED' ? 'text-orange-600' : 
                    cat.costType === 'SEMI_VARIABLE' ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    {cat.costType === 'FIXED' ? 'Định phí (Cố định)' : 
                     cat.costType === 'SEMI_VARIABLE' ? 'Hỗn hợp (Bán biến phí)' : 'Biến phí (Thay đổi)'}
                  </div>
                </div>
                {!cat.isSystem && (
                  <button
                    onClick={() => handleDelete(cat)}
                    className="rounded p-1.5 text-red-500 transition hover:bg-red-50"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-center text-muted py-4">Chưa có danh mục nào</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
