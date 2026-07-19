import { useState, useEffect } from 'react'
import { createIngredient, updateIngredient, type Ingredient } from '../../../api/ingredient.api'

interface IngredientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  ingredient?: Ingredient | null
  branchId?: string
  branches?: any[]
  isChainOwner?: boolean
}

const CATEGORIES = [
  'Đồ pha chế',
  'Nguyên liệu thô',
  'Đồ đóng gói',
  'Vật tư tiêu hao',
  'Khác'
]

export function IngredientFormModal({ isOpen, onClose, onSuccess, ingredient, branchId, branches, isChainOwner }: IngredientFormModalProps) {
  const isEditing = !!ingredient

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: CATEGORIES[0],
    ingredientType: 'raw',
    unit: 'g',
    importUnit: 'kg',
    conversionRate: 1000,
    minStockLevel: 0,
    branchId: branchId || ''
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
          ingredientType: ingredient.ingredientType || 'raw',
          unit: ingredient.unit,
          importUnit: ingredient.importUnit || '',
          conversionRate: ingredient.conversionRate || 1,
          minStockLevel: ingredient.minStockLevel || 0,
          branchId: ingredient.branchId || branchId || ''
        })
      } else {
        setFormData({
          name: '',
          sku: '',
          category: CATEGORIES[0],
          ingredientType: 'raw',
          unit: 'g',
          importUnit: 'kg',
          conversionRate: 1000,
          minStockLevel: 0,
          branchId: branchId || (branches?.length ? branches[0].id : '')
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
      if (ingredient) {
        await updateIngredient(ingredient.id, formData)
      } else {
        await createIngredient({ ...formData })
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu nguyên liệu')
    } finally {
      setLoading(false)
    }
  }

  const isIngredientGroup = ['raw', 'preparation'].includes(formData.ingredientType || 'raw')
  const mainGroupValue = isIngredientGroup ? 'nguyen_lieu' : formData.ingredientType

  const handleMainGroupChange = (val: string) => {
    if (val === 'nguyen_lieu') {
      setFormData({ ...formData, ingredientType: 'raw' })
    } else {
      setFormData({ ...formData, ingredientType: val as any })
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
          {isChainOwner && branches && branches.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Chi nhánh *</label>
              <select
                required
                className="w-full rounded-lg border border-line px-4 py-2"
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              >
                <option value="" disabled>Chọn chi nhánh</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Phân loại danh mục *</label>
              <select
                className="w-full rounded-lg border border-line px-4 py-2"
                value={mainGroupValue}
                onChange={(e) => handleMainGroupChange(e.target.value)}
              >
                <option value="nguyen_lieu">Nguyên liệu</option>
                <option value="consumable">Vật tư tiêu hao (Bao bì)</option>
                <option value="equipment">Công cụ, dụng cụ (CCDC)</option>
                <option value="chemical">Hóa chất & Văn phòng phẩm</option>
              </select>
            </div>
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
            {mainGroupValue === 'nguyen_lieu' ? (
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Loại nguyên liệu *</label>
                <select
                  className="w-full rounded-lg border border-line px-4 py-2"
                  value={formData.ingredientType}
                  onChange={(e) => setFormData({ ...formData, ingredientType: e.target.value as any })}
                >
                  <option value="raw">Nguyên liệu thô</option>
                  <option value="preparation">Bán thành phẩm</option>
                </select>
              </div>
            ) : <div></div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Đơn vị Nhập kho</label>
              <input
                type="text"
                className="w-full rounded-lg border border-line px-4 py-2"
                value={formData.importUnit}
                onChange={(e) => setFormData({ ...formData, importUnit: e.target.value })}
                placeholder="VD: kg, can, hộp, mẻ"
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
