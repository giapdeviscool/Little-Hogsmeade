import { useState, useEffect } from 'react'
import { createIngredient, updateIngredient, type Ingredient } from '../../../api/ingredient.api'

interface IngredientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  ingredient?: Ingredient | null
}

const CATEGORIES = [
  'Đồ pha chế',
  'Nguyên liệu thô',
  'Đồ đóng gói',
  'Vật tư tiêu hao',
  'Khác'
]

export function IngredientFormModal({ isOpen, onClose, onSuccess, ingredient }: IngredientFormModalProps) {
  const isEditing = !!ingredient

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: CATEGORIES[0],
    unit: 'g',
    importUnit: 'kg',
    conversionRate: 1000,
    minStockLevel: 0
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (ingredient) {
        setFormData({
          name: ingredient.name,
          sku: ingredient.sku || '',
          category: ingredient.category || CATEGORIES[0],
          unit: ingredient.unit,
          importUnit: ingredient.importUnit || '',
          conversionRate: ingredient.conversionRate || 1,
          minStockLevel: ingredient.minStockLevel || 0
        })
      } else {
        setFormData({
          name: '',
          sku: '',
          category: CATEGORIES[0],
          unit: 'g',
          importUnit: 'kg',
          conversionRate: 1000,
          minStockLevel: 0
        })
      }
      setError('')
    }
  }, [isOpen, ingredient])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEditing) {
        await updateIngredient(ingredient.id, formData)
      } else {
        await createIngredient(formData)
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu nguyên liệu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">
          {isEditing ? 'Sửa thông tin Nguyên liệu' : 'Thêm Nguyên liệu mới'}
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Tên nguyên liệu *</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-line px-4 py-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Mã SKU</label>
              <input
                type="text"
                className="w-full rounded-lg border border-line px-4 py-2"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Ví dụ: CF-01"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Danh mục</label>
              <select
                className="w-full rounded-lg border border-line px-4 py-2"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Đơn vị Nhập kho</label>
              <input
                type="text"
                className="w-full rounded-lg border border-line px-4 py-2"
                value={formData.importUnit}
                onChange={(e) => setFormData({ ...formData, importUnit: e.target.value })}
                placeholder="VD: kg, can, hộp"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Đơn vị Xuất / Recipe *</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-line px-4 py-2"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="VD: g, ml, ly"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Tỷ lệ quy đổi</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">1 {formData.importUnit || 'Đơn vị nhập'} =</span>
              <input
                type="number"
                step="0.01"
                required
                className="w-32 rounded-lg border border-line px-3 py-1"
                value={formData.conversionRate}
                onChange={(e) => setFormData({ ...formData, conversionRate: parseFloat(e.target.value) })}
              />
              <span className="text-sm text-muted">{formData.unit || 'Đơn vị xuất'}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Ví dụ: Nhập theo kg, Xuất theo gam thì 1 kg = 1000 g.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Định mức tồn kho tối thiểu</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full rounded-lg border border-line px-4 py-2"
              value={formData.minStockLevel}
              onChange={(e) => setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) })}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-semibold text-muted hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-coffee px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
