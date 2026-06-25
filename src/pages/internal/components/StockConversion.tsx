import { useState, useEffect } from 'react'
import { getIngredients, type Ingredient } from '../../../api/ingredient.api'
import { httpClient } from '../../../api/httpClient'
import { Card } from '../../../components/ui/Card'

export function StockConversion() {
  const [preparations, setPreparations] = useState<Ingredient[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [yieldQuantity, setYieldQuantity] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // For previewing formula
  const [formula, setFormula] = useState<any[]>([])
  const [formulaYield, setFormulaYield] = useState<number>(1)

  useEffect(() => {
    getIngredients().then(res => {
      setPreparations(res.data.filter(i => i.ingredientType === 'preparation'))
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedId) {
      httpClient<{ data: any }>(`/preparations/${selectedId}`)
        .then(res => {
          const prepIngs = res.data?.preparationIngredients || []
          setFormula(prepIngs)
          setFormulaYield(prepIngs.length > 0 ? prepIngs[0].yieldQuantity : 1)
        })
        .catch(console.error)
    } else {
      setFormula([])
    }
  }, [selectedId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId || !yieldQuantity) return

    if (formula.length === 0) {
      setError('Bán thành phẩm này chưa có công thức. Vui lòng cấu hình trước.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await httpClient('/stock-conversions', {
        method: 'POST',
        body: JSON.stringify({ preparationId: selectedId, yieldQuantity: Number(yieldQuantity) })
      })
      setSuccess('Chế biến bán thành phẩm thành công!')
      setYieldQuantity('')
      setSelectedId('')
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi chế biến')
    } finally {
      setLoading(false)
    }
  }

  const selectedPrep = preparations.find(p => p.id === selectedId)

  return (
    <>
      <div className="flex justify-between mb-6">
        <div><p className="text-sm text-muted">Quản trị Nội bộ</p><h1 className="text-[34px] font-bold">Chế biến Bán thành phẩm</h1></div>
      </div>
      
      <Card className="max-w-2xl p-6">
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded bg-emerald-50 p-3 text-sm text-emerald-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Chọn Bán thành phẩm cần chế biến</label>
            <select
              className="w-full rounded-lg border border-line px-4 py-2"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              required
            >
              <option value="">-- Chọn --</option>
              {preparations.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.currentStock} {p.unit} hiện có)</option>
              ))}
            </select>
          </div>

          {selectedPrep && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Số lượng muốn tạo ra</label>
              <div className="relative w-48">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full rounded-lg border border-line px-4 py-2 pr-12"
                  value={yieldQuantity}
                  onChange={e => setYieldQuantity(e.target.value ? parseFloat(e.target.value) : '')}
                />
                <span className="absolute right-3 top-2 text-sm text-muted">{selectedPrep.unit}</span>
              </div>
            </div>
          )}

          {selectedPrep && formula.length > 0 && typeof yieldQuantity === 'number' && yieldQuantity > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-line">
              <h4 className="font-semibold text-sm mb-3">Nguyên liệu cần tiêu hao (Dự kiến):</h4>
              <ul className="space-y-2 text-sm">
                {formula.map((item, idx) => {
                  const multiplier = yieldQuantity / formulaYield
                  const reqQty = (item.quantityRequired * multiplier).toFixed(2)
                  const currentStock = item.rawIngredient.currentStock
                  const isEnough = currentStock >= Number(reqQty)
                  return (
                    <li key={idx} className="flex justify-between items-center">
                      <span>{item.rawIngredient.name}</span>
                      <div className="text-right">
                        <span className={`font-semibold ${!isEnough ? 'text-red-600' : ''}`}>
                          -{reqQty} {item.rawIngredient.unit}
                        </span>
                        {!isEnough && <span className="ml-2 text-xs text-red-500">(Thiếu tồn kho: có {currentStock})</span>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {selectedPrep && formula.length === 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-600 text-sm">
              Bán thành phẩm này chưa có công thức. Vui lòng cấu hình công thức trước khi chế biến.
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || formula.length === 0}
              className="rounded-lg bg-coffee px-6 py-2.5 font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận chế biến'}
            </button>
          </div>
        </form>
      </Card>
    </>
  )
}
