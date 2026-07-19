import { useState, useEffect } from 'react'
import { getIngredients, type Ingredient } from '../../../api/ingredient.api'
import { createGoodsReceipt } from '../../../api/stock-transaction.api'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'

interface GoodsReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  branchId: string
}

export function GoodsReceiptModal({ isOpen, onClose, onSuccess, branchId }: GoodsReceiptModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [items, setItems] = useState<Array<{
    id: number
    ingredientId: string
    quantity: string
    unitCost: string
    note: string
  }>>([])

  useEffect(() => {
    if (isOpen && branchId) {
      getIngredients({ branchId }).then(res => {
        setIngredients(res.data.filter(i => i.ingredientType !== 'preparation'))
      }).catch(() => {})
      setItems([{ id: Date.now(), ingredientId: '', quantity: '', unitCost: '', note: '' }])
      setError('')
    }
  }, [isOpen, branchId])

  if (!isOpen) return null

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), ingredientId: '', quantity: '', unitCost: '', note: '' }])
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
      setError('Vui lòng chọn chi nhánh ở ngoài màn hình chính trước khi nhập kho')
      return
    }
    
    if (items.length === 0) {
      setError('Vui lòng thêm ít nhất một nguyên liệu')
      return
    }

    const payloadItems = items.map(i => ({
      ingredientId: i.ingredientId,
      quantity: parseFloat(i.quantity),
      unitCost: parseFloat(i.unitCost),
      note: i.note
    }))

    for (let i = 0; i < payloadItems.length; i++) {
      if (!payloadItems[i].ingredientId) {
        setError(`Dòng ${i + 1}: Vui lòng chọn nguyên liệu`)
        return
      }
      if (isNaN(payloadItems[i].quantity) || payloadItems[i].quantity <= 0) {
        setError(`Dòng ${i + 1}: Số lượng phải lớn hơn 0`)
        return
      }
      if (isNaN(payloadItems[i].unitCost) || payloadItems[i].unitCost < 0) {
        setError(`Dòng ${i + 1}: Giá đơn vị không hợp lệ`)
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      await createGoodsReceipt({
        branchId,
        items: payloadItems
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo phiếu nhập kho')
    } finally {
      setLoading(false)
    }
  }

  const totalReceiptCost = items.reduce((sum, item) => {
    const q = parseFloat(item.quantity) || 0
    const c = parseFloat(item.unitCost) || 0
    return sum + (q * c)
  }, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        <h2 className="mb-4 text-xl font-bold">Tạo Phiếu Nhập Kho (Goods Receipt)</h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
          <table className="w-full text-left text-sm mb-4">
            <thead>
              <tr>
                <th className="pb-2 text-muted uppercase text-xs w-[30%]">Nguyên liệu</th>
                <th className="pb-2 text-muted uppercase text-xs w-[15%]">SL (Đ.vị nhập)</th>
                <th className="pb-2 text-muted uppercase text-xs w-[15%]">Đơn giá (₫)</th>
                <th className="pb-2 text-muted uppercase text-xs w-[15%]">Thành tiền</th>
                <th className="pb-2 text-muted uppercase text-xs w-[20%]">Ghi chú</th>
                <th className="pb-2 text-muted uppercase text-xs w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const selectedIng = ingredients.find(i => i.id === item.ingredientId)
                const totalCost = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0)
                
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
                      {selectedIng ? (
                        <div className="text-[10px] text-muted mt-1">
                          1 {selectedIng.importUnit || 'đ.vị'} = {selectedIng.conversionRate} {selectedIng.unit}
                        </div>
                      ) : (
                        <div className="text-[10px] text-transparent mt-1 select-none">
                          placeholder
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <input
                        type="number"
                        step="0.01"
                        required
                        min="0.01"
                        placeholder="0"
                        className="w-full rounded border border-line px-2 py-1.5"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <CurrencyInput
                        required
                        placeholder="0"
                        className="w-full rounded border border-line px-2 py-1.5"
                        value={item.unitCost}
                        onValueChange={(val) => handleItemChange(item.id, 'unitCost', val)}
                      />
                    </td>
                    <td className="py-2 pr-2 font-semibold align-top">
                      <div className="py-1.5">
                        {totalCost.toLocaleString('vi-VN')} ₫
                      </div>
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

        <div className="mt-6 flex justify-between items-center border-t border-line pt-4">
          <div className="font-bold text-lg">
            Tổng cộng: {totalReceiptCost.toLocaleString('vi-VN')} ₫
          </div>
          <div className="flex gap-3">
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
              className="rounded-lg bg-coffee px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Xác nhận Nhập kho'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
