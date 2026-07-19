import { useState, useEffect } from 'react'
import { getIngredients, type Ingredient } from '../../../api/ingredient.api'
import { createStocktakeNote } from '../../../api/stocktake.api'
import { cn } from '../../../utils/cn'

interface StocktakeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  branchId: string
}

export function StocktakeModal({ isOpen, onClose, onSuccess, branchId }: StocktakeModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  // Map to store input values by ingredientId
  const [actualCounts, setActualCounts] = useState<Record<string, string>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && branchId) {
      // BR-INV21: Snapshot Isolation Protocol
      // Fetching all ingredients right now forms our baseline snapshot.
      getIngredients({ branchId }).then(res => {
        // Only active raw materials and preparations
        setIngredients(res.data.filter((i: any) => i.isActive !== false))
      }).catch(() => {})
      
      setActualCounts({})
      setReasons({})
      setNotes({})
      setNote('')
      setError('')
    }
  }, [isOpen, branchId])

  if (!isOpen) return null

  const handleActualCountChange = (ingredientId: string, value: string) => {
    setActualCounts(prev => ({ ...prev, [ingredientId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchId) {
      setError('Vui lòng chọn chi nhánh ở ngoài màn hình chính trước khi tạo phiếu')
      return
    }

    const payloadItems = []

    for (const ing of ingredients) {
      const countStr = actualCounts[ing.id]
      if (countStr && countStr.trim() !== '') {
        const actualCount = parseFloat(countStr)
        if (isNaN(actualCount) || actualCount < 0) {
          setError(`Số lượng đếm thực tế của ${ing.name} không hợp lệ`)
          return
        }
        
        payloadItems.push({
          ingredientId: ing.id,
          systemQuantity: ing.currentStock || 0,
          actualQuantity: actualCount,
          variance: actualCount - (ing.currentStock || 0),
          reason: reasons[ing.id] || '',
          note: notes[ing.id] || ''
        })
      }
    }

    if (payloadItems.length === 0) {
      setError('Vui lòng nhập số lượng đếm thực tế cho ít nhất một nguyên liệu')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createStocktakeNote({
        branchId,
        note,
        items: payloadItems
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo phiếu kiểm kho')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        <h2 className="mb-4 text-xl font-bold text-coffee">Tạo Phiếu Kiểm Kho (Stocktake Notes)</h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <strong>Lưu ý:</strong> Việc kiểm kho sẽ chỉ tạo phiếu <b>Nháp (Pending)</b> ghi nhận số chênh lệch, không làm thay đổi trực tiếp lượng Tồn kho hiện tại. Chênh lệch sẽ được quyết toán ở chức năng "Duyệt kiểm kho". Nếu bỏ trống ô SL Đếm thực tế, hệ thống sẽ tự hiểu nguyên liệu đó không được kiểm đếm đợt này.
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase text-muted mb-1 font-semibold">Ghi chú chung cho đợt kiểm kho</label>
          <input
            type="text"
            className="w-full rounded border border-line px-3 py-2"
            placeholder="Ví dụ: Kiểm kho cuối tháng 6..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
          <table className="w-full text-left text-sm mb-4 border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr>
                <th className="pb-3 pt-2 text-muted uppercase text-xs w-[25%] border-b border-line">Nguyên liệu</th>
                <th className="pb-3 pt-2 text-muted uppercase text-xs w-[12%] border-b border-line">Tồn kho HT</th>
                <th className="pb-3 pt-2 text-muted uppercase text-xs w-[18%] border-b border-line">SL Đếm thực tế</th>
                <th className="pb-3 pt-2 text-muted uppercase text-xs w-[12%] border-b border-line">Chênh lệch</th>
                <th className="pb-3 pt-2 text-muted uppercase text-xs w-[15%] border-b border-line">Lý do (tuỳ chọn)</th>
                <th className="pb-3 pt-2 text-muted uppercase text-xs w-[18%] border-b border-line">Ghi chú (tuỳ chọn)</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => {
                const countStr = actualCounts[ing.id]
                const hasValue = countStr && countStr.trim() !== ''
                const actualCount = hasValue ? parseFloat(countStr) : 0
                const currentStock = ing.currentStock || 0
                const variance = hasValue ? actualCount - currentStock : 0
                
                return (
                  <tr key={ing.id} className="hover:bg-Cream/50 transition-colors border-b border-line last:border-0">
                    <td className="py-3 pr-2">
                      <div className="font-semibold text-coffee">{ing.name}</div>
                      <div className="text-[10px] text-muted">{ing.sku || `NVL-${ing.id.slice(-4).toUpperCase()}`} - Đơn vị: {ing.unit}</div>
                    </td>
                    <td className="py-3 pr-2 font-semibold">
                      {currentStock} {ing.unit}
                    </td>
                    <td className="py-3 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Để trống nếu bỏ qua..."
                        className="w-full rounded border border-line px-2 py-1.5 focus:border-coffee focus:ring-1 focus:ring-coffee outline-none transition-all"
                        value={actualCounts[ing.id] || ''}
                        onChange={(e) => handleActualCountChange(ing.id, e.target.value)}
                      />
                    </td>
                    <td className="py-3 pr-2 font-bold">
                      {hasValue ? (
                        <span className={cn(variance < 0 ? 'text-red-500' : variance > 0 ? 'text-emerald-600' : 'text-gray-500')}>
                          {variance > 0 ? '+' : ''}{parseFloat(variance.toFixed(2))}
                        </span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-3 pr-2">
                      <select
                        className="w-full rounded border border-line px-2 py-1.5 text-xs disabled:opacity-50"
                        value={reasons[ing.id] || ''}
                        onChange={(e) => setReasons(prev => ({ ...prev, [ing.id]: e.target.value }))}
                        disabled={!hasValue}
                      >
                        <option value="">Lý do...</option>
                        <option value="Hỏng/Hết hạn">Hỏng/Hết hạn</option>
                        <option value="Thất thoát">Thất thoát</option>
                        <option value="Chưa cập nhật phần mềm">Chưa cập nhật PM</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </td>
                    <td className="py-3 pr-2">
                      <input
                        type="text"
                        placeholder="Ghi chú..."
                        className="w-full rounded border border-line px-2 py-1.5 text-xs disabled:opacity-50"
                        value={notes[ing.id] || ''}
                        onChange={(e) => setNotes(prev => ({ ...prev, [ing.id]: e.target.value }))}
                        disabled={!hasValue}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </form>

        <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-semibold text-muted hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-coffee px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Lưu Phiếu Kiểm Kho'}
          </button>
        </div>
      </div>
    </div>
  )
}
