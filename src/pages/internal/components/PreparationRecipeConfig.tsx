import { useState, useEffect } from 'react'
import { getIngredients, type Ingredient } from '../../../api/ingredient.api'
import { httpClient } from '../../../api/httpClient'

interface PreparationRecipeConfigProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preparationId: string | null
  preparationName: string
  yieldUnit: string
  branchId?: string
}

interface RecipeRow {
  rawIngredientId: string
  quantityRequired: number
}

export function PreparationRecipeConfig({ isOpen, onClose, onSuccess, preparationId, preparationName, yieldUnit, branchId }: PreparationRecipeConfigProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<RecipeRow[]>([])
  const [yieldQuantity, setYieldQuantity] = useState<number>(1)
  const [instructions, setInstructions] = useState('')

  useEffect(() => {
    if (isOpen) {
      getIngredients({ branchId }).then(res => {
        // Only raw ingredients can be used in preparation recipes
        setIngredients(res.data.filter(i => i.ingredientType === 'raw'))
      }).catch(console.error)
      
      if (preparationId) {
        setLoading(true)
        const qs = branchId ? `?branchId=${branchId}` : ''
        httpClient<{ data: any }>(`/preparations/${preparationId}${qs}`)
          .then(res => {
            const prepIngs = res.data?.preparationIngredients || []
            if (prepIngs.length > 0) {
              setYieldQuantity(prepIngs[0].yieldQuantity || 1)
              setInstructions(prepIngs[0].instructions || '')
              setRows(prepIngs.map((r: any) => ({
                rawIngredientId: r.rawIngredientId,
                quantityRequired: r.quantityRequired
              })))
            } else {
              setYieldQuantity(1)
              setInstructions('')
              setRows([])
            }
          })
          .catch(console.error)
          .finally(() => setLoading(false))
      }
    } else {
      setRows([])
      setError('')
      setYieldQuantity(1)
      setInstructions('')
    }
  }, [isOpen, preparationId, branchId])

  if (!isOpen) return null

  const handleAddRow = () => {
    setRows([...rows, { rawIngredientId: '', quantityRequired: 1 }])
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
    if (!preparationId) return

    const ingredientSet = new Set()
    for (const r of rows) {
      if (!r.rawIngredientId) {
        setError('Vui lòng chọn nguyên liệu thô cho tất cả các dòng.')
        return
      }
      if (ingredientSet.has(r.rawIngredientId)) {
        setError('Một nguyên liệu thô chỉ được cấu hình một lần. Vui lòng gộp số lượng.')
        return
      }
      if (r.quantityRequired <= 0) {
        setError('Số lượng tiêu hao phải lớn hơn 0.')
        return
      }
      ingredientSet.add(r.rawIngredientId)
    }

    if (yieldQuantity <= 0) {
      setError('Lượng bán TP tạo ra phải lớn hơn 0.')
      return
    }

    const payload = rows.map(r => ({
      ...r,
      yieldQuantity,
      instructions
    }))

    try {
      setLoading(true)
      setError('')
      const qs = branchId ? `?branchId=${branchId}` : ''
      await httpClient(`/preparations/${preparationId}/recipe${qs}`, {
        method: 'PUT',
        body: JSON.stringify({ recipeData: payload })
      })
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
        <h2 className="mb-2 text-2xl font-bold">Cấu hình Bán Thành Phẩm</h2>
        <p className="mb-6 text-sm text-muted">Bán thành phẩm: <span className="font-semibold text-black">{preparationName}</span></p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lượng tạo ra (Yield Quantity) *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full rounded border border-line px-3 py-2 pr-12"
                  value={yieldQuantity}
                  onChange={e => setYieldQuantity(parseFloat(e.target.value))}
                />
                <span className="absolute right-3 top-2 text-sm text-muted">{yieldUnit}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-line">
              <h3 className="font-semibold">Thành phần Nguyên liệu thô</h3>
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
                Chưa có nguyên liệu nào.
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-line">
                    <div className="flex-1">
                      <select
                        className="w-full rounded border border-line px-3 py-2 text-sm"
                        value={row.rawIngredientId}
                        onChange={(e) => handleChange(index, 'rawIngredientId', e.target.value)}
                        required
                      >
                        <option value="">-- Chọn nguyên liệu thô --</option>
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>{ing.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-48">
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
                          {getUnit(row.rawIngredientId)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="text-red-500 hover:text-red-700 font-bold px-2 py-1 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hướng dẫn chế biến</label>
            <textarea
              className="w-full rounded border border-line px-3 py-2 text-sm"
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Ví dụ: Ủ trong 90 độ C trong 15 phút..."
            ></textarea>
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
