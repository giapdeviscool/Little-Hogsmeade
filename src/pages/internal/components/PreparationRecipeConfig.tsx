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
  isReadOnly?: boolean
}

interface RecipeRow {
  rawIngredientId: string
  quantityRequired: number
}

export function PreparationRecipeConfig({ isOpen, onClose, onSuccess, preparationId, preparationName, yieldUnit, branchId, isReadOnly }: PreparationRecipeConfigProps) {
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
                  min="0.1"
                  step="0.1"
                  className="w-full rounded-lg border border-line px-3 py-1.5"
                  value={yieldQuantity}
                  onChange={(e) => setYieldQuantity(parseFloat(e.target.value) || 1)}
                  disabled={isReadOnly}
                />
                <span className="absolute right-3 top-2 text-sm text-muted">{yieldUnit}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-line">
              <h3 className="font-semibold">Thành phần Nguyên liệu thô</h3>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="mt-4 font-bold text-coffee hover:underline"
                >
                  + Thêm nguyên liệu con
                </button>
              )}
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
                        className="w-full rounded-lg border border-line px-3 py-1.5"
                        value={row.rawIngredientId}
                        onChange={(e) => handleChange(index, 'rawIngredientId', e.target.value)}
                        disabled={isReadOnly}
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
                        min="0.1"
                        step="0.1"
                        className="w-32 rounded-lg border border-line px-3 py-1.5"
                        value={row.quantityRequired}
                        onChange={(e) => handleChange(index, 'quantityRequired', parseFloat(e.target.value) || 0)}
                        disabled={isReadOnly}
                      />
                        <span className="absolute right-3 top-2 text-sm text-muted pointer-events-none">
                          {getUnit(row.rawIngredientId)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-1">
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hướng dẫn chế biến</label>
            <textarea
              className="w-full rounded-lg border border-line p-3 h-24 resize-none"
              placeholder="Ví dụ: Rửa sạch, cắt nhỏ, đun sôi trong 10 phút..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          {!isReadOnly && (
            <div className="flex justify-end gap-3 rounded-b-xl border-t border-line p-6 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-100"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-coffee px-6 py-2.5 font-bold text-white hover:opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu công thức'}
              </button>
            </div>
          )}
          {isReadOnly && (
            <div className="flex justify-between items-center rounded-b-xl border-t border-line p-6 bg-gray-50">
              <span className="text-sm text-amber-600 font-medium">⚠️ Đây là cấu hình BOM của Nguyên liệu Toàn chuỗi, chỉ được xem và không thể sửa tại chi nhánh.</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-6 py-2.5 font-bold bg-coffee text-white hover:opacity-90"
              >
                Đóng
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
