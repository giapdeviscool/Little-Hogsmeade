import { useState, useEffect } from 'react'
import { getIngredients, type Ingredient } from '../../../api/ingredient.api'
import { getRecipes, setMenuItemRecipes } from '../../../api/recipe.api'

interface RecipeConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  menuItemId: string | null
  menuItemName: string
}

interface RecipeRow {
  ingredientId: string
  quantityRequired: number
}

export function RecipeConfigModal({ isOpen, onClose, onSuccess, menuItemId, menuItemName }: RecipeConfigModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<RecipeRow[]>([])
  const [variantId, setVariantId] = useState<string | null>(null) // Currently default to base recipe

  useEffect(() => {
    if (isOpen) {
      getIngredients().then(res => setIngredients(res.data)).catch(console.error)
      if (menuItemId) {
        setLoading(true)
        getRecipes({ search: menuItemName, limit: 100 })
          .then(res => {
            const currentRecipes = res.data.items.filter(r => r.menuItemId === menuItemId)
            setRows(currentRecipes.map(r => ({
              ingredientId: r.ingredientId,
              quantityRequired: r.quantityRequired
            })))
          })
          .catch(console.error)
          .finally(() => setLoading(false))
      }
    } else {
      setRows([])
      setError('')
      setVariantId(null)
    }
  }, [isOpen, menuItemId, menuItemName])

  if (!isOpen) return null

  const handleAddRow = () => {
    setRows([...rows, { ingredientId: '', quantityRequired: 1 }])
  }

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof RecipeRow, value: any) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value }
    setRows(newRows)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!menuItemId) return

    // Validation
    const ingredientSet = new Set()
    for (const r of rows) {
      if (!r.ingredientId) {
        setError('Vui lòng chọn nguyên liệu cho tất cả các dòng.')
        return
      }
      if (ingredientSet.has(r.ingredientId)) {
        setError('Một nguyên liệu chỉ được cấu hình một lần trong công thức. Vui lòng gộp số lượng.')
        return
      }
      if (r.quantityRequired <= 0) {
        setError('Số lượng tiêu hao phải lớn hơn 0.')
        return
      }
      ingredientSet.add(r.ingredientId)
    }

    try {
      setLoading(true)
      setError('')
      await setMenuItemRecipes(menuItemId, variantId, rows)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cấu hình công thức')
    } finally {
      setLoading(false)
    }
  }

  const getUnit = (ingredientId: string) => {
    const ing = ingredients.find(i => i.id === ingredientId)
    return ing ? ing.unit : ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-2 text-2xl font-bold">Cấu hình BOM (Recipe)</h2>
        <p className="mb-6 text-sm text-muted">Món ăn: <span className="font-semibold text-black">{menuItemName}</span></p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-line">
              <h3 className="font-semibold">Danh sách nguyên liệu</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-sm font-semibold text-coffee hover:underline"
              >
                + Thêm nguyên liệu
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted">
                Chưa có nguyên liệu nào. Hãy thêm nguyên liệu.
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-line">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted mb-1">Nguyên liệu</label>
                      <select
                        className="w-full rounded border border-line px-3 py-2 text-sm"
                        value={row.ingredientId}
                        onChange={(e) => handleChange(index, 'ingredientId', e.target.value)}
                        required
                      >
                        <option value="">-- Chọn nguyên liệu --</option>
                        <optgroup label="Bán thành phẩm">
                          {ingredients.filter(i => i.ingredientType === 'preparation').map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Nguyên liệu thô">
                          {ingredients.filter(i => i.ingredientType === 'raw').map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Vật tư tiêu hao (Bao bì)">
                          {ingredients.filter(i => i.ingredientType === 'consumable').map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div className="w-48">
                      <label className="block text-xs font-semibold text-muted mb-1">Lượng tiêu hao</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded border border-line px-3 py-2 pr-12 text-sm"
                          value={row.quantityRequired}
                          onChange={(e) => handleChange(index, 'quantityRequired', parseFloat(e.target.value))}
                          required
                        />
                        <span className="absolute right-3 top-2 text-sm text-muted pointer-events-none">
                          {getUnit(row.ingredientId)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="text-red-500 hover:text-red-700 font-bold px-2 py-1 text-sm"
                        title="Xóa dòng"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-line pt-4">
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
              {loading ? 'Đang lưu...' : 'Lưu công thức'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
