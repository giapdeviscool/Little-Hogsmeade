import { useState, useEffect } from 'react'
import { getIngredients, type Ingredient } from '../../../api/ingredient.api'
import { createGoodsIssue } from '../../../api/stock-transaction.api'

interface GoodsIssueModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  branchId: string
}

export function GoodsIssueModal({ isOpen, onClose, onSuccess, branchId }: GoodsIssueModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [items, setItems] = useState<Array<{
    id: number
    ingredientId: string
    quantity: string
    reason: string
    note: string
  }>>([])

  useEffect(() => {
    if (isOpen && branchId) {
      getIngredients({ branchId }).then(res => {
        // Only allow raw materials to be issued manually
        setIngredients(res.data.filter((i: any) => i.ingredientType !== 'preparation'))
      }).catch(() => {})
      setItems([{ id: Date.now(), ingredientId: '', quantity: '', reason: 'DAMAGED', note: '' }])
      setError('')
    }
  }, [isOpen, branchId])

  if (!isOpen) return null

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), ingredientId: '', quantity: '', reason: 'DAMAGED', note: '' }])
  }

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleItemChange = (id: number, field: string, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchId) {
      setError('Vui lòng chọn chi nhánh ở ngoài màn hình chính trước khi xuất kho')
      return
    }
    
    if (items.length === 0) {
      setError('Vui lòng thêm ít nhất một nguyên liệu')
      return
    }

    const payloadItems = items.map(i => ({
      ingredientId: i.ingredientId,
      quantity: parseFloat(i.quantity),
      reason: i.reason,
      note: i.note
    }))

    for (let i = 0; i < payloadItems.length; i++) {
      if (!payloadItems[i].ingredientId) {
        setError(`Dòng ${i + 1}: Vui lòng chọn nguyên liệu`)
        return
      }
      if (isNaN(payloadItems[i].quantity) || payloadItems[i].quantity <= 0) {
        setError(`Dòng ${i + 1}: Số lượng xuất phải lớn hơn 0`)
        return
      }
      if (!payloadItems[i].reason) {
        setError(`Dòng ${i + 1}: Vui lòng chọn lý do xuất`)
        return
      }

      // Check current stock limit
      const ingredient = ingredients.find(ing => ing.id === payloadItems[i].ingredientId)
      if (ingredient && payloadItems[i].quantity > (ingredient.currentStock || 0)) {
        setError(`Dòng ${i + 1}: Số lượng xuất (${payloadItems[i].quantity}) không được vượt quá tồn kho hiện tại (${ingredient.currentStock}) của ${ingredient.name}`)
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      await createGoodsIssue({
        branchId,
        items: payloadItems
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo phiếu xuất/hủy kho')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        <h2 className="mb-4 text-xl font-bold text-red-700">Tạo Phiếu Xuất/Hủy Kho (Goods Issue)</h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <strong>Lưu ý:</strong> Việc xuất kho thủ công chỉ dùng cho các trường hợp hao hụt (Hư hỏng, Hết hạn) hoặc Tiêu dùng nội bộ (Nhân sự ăn uống). Thao tác này sẽ trực tiếp trừ Tồn kho nhưng KHÔNG làm thay đổi Giá vốn (MAC).
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
          <table className="w-full text-left text-sm mb-4">
            <thead>
              <tr>
                <th className="pb-2 text-muted uppercase text-xs w-[25%]">Nguyên liệu</th>
                <th className="pb-2 text-muted uppercase text-xs w-[15%]">Tồn kho HT</th>
                <th className="pb-2 text-muted uppercase text-xs w-[15%]">SL Xuất</th>
                <th className="pb-2 text-muted uppercase text-xs w-[20%]">Lý do</th>
                <th className="pb-2 text-muted uppercase text-xs w-[20%]">Ghi chú</th>
                <th className="pb-2 text-muted uppercase text-xs w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const selectedIng = ingredients.find(i => i.id === item.ingredientId)
                const currentStock = selectedIng?.currentStock || 0
                const isOverStock = (parseFloat(item.quantity) || 0) > currentStock
                
                return (
                  <tr key={item.id}>
                    <td className="py-2 pr-2 align-top">
                      <select
                        required
                        className="w-full rounded border border-line px-2 py-1.5"
                        value={item.ingredientId}
                        onChange={(e) => handleItemChange(item.id, 'ingredientId', e.target.value)}
                      >
                        <option value="" disabled>Chọn vật tư / nguyên liệu</option>
                        <optgroup label="Nguyên liệu thô">
                          {ingredients.filter(ing => ing.ingredientType === 'raw').map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.sku || 'N/A'})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Vật tư tiêu hao (Bao bì)">
                          {ingredients.filter(ing => ing.ingredientType === 'consumable').map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.sku || 'N/A'})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Công cụ, dụng cụ (CCDC)">
                          {ingredients.filter(ing => ing.ingredientType === 'equipment').map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.sku || 'N/A'})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Hóa chất & Văn phòng phẩm">
                          {ingredients.filter(ing => ing.ingredientType === 'chemical').map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.sku || 'N/A'})</option>
                          ))}
                        </optgroup>
                      </select>
                      <div className="text-[10px] text-transparent mt-1 select-none">
                        placeholder
                      </div>
                    </td>
                    <td className="py-2 pr-2 font-semibold align-top">
                      <div className="py-1.5">
                        {selectedIng ? (
                          <span className={currentStock <= 0 ? 'text-red-500' : 'text-coffee'}>
                            {currentStock} {selectedIng.unit}
                          </span>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <input
                        type="number"
                        step="0.01"
                        required
                        min="0.01"
                        placeholder="0"
                        className={`w-full rounded border px-2 py-1.5 ${isOverStock ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-line'}`}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <select
                        required
                        className="w-full rounded border border-line px-2 py-1.5"
                        value={item.reason}
                        onChange={(e) => handleItemChange(item.id, 'reason', e.target.value)}
                      >
                        <option value="DAMAGED">Hư hỏng/Hết hạn</option>
                        <option value="DISPOSAL">Tiêu hủy/Bỏ đi</option>
                        <option value="INTERNAL_USE">Dùng nội bộ</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <input
                        type="text"
                        placeholder="Ghi chú..."
                        className="w-full rounded border border-line px-2 py-1.5"
                        value={item.note}
                        onChange={(e) => handleItemChange(item.id, 'note', e.target.value)}
                      />
                    </td>
                    <td className="py-2 align-top">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 mt-0.5"
                        disabled={items.length === 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <button
            type="button"
            onClick={handleAddItem}
            className="text-sm font-bold text-coffee hover:underline"
          >
            + Thêm dòng
          </button>
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
            disabled={loading || items.length === 0}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Xác nhận Xuất/Hủy'}
          </button>
        </div>
      </div>
    </div>
  )
}
