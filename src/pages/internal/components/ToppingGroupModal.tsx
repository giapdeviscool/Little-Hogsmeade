import { useState, useEffect } from 'react'
import { createToppingGroup, updateToppingGroup } from '../../../api/topping-group.api'
import { AlertModal } from '../../../components/ui/AlertModal'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'

interface ToppingGroupModalProps {
  isOpen: boolean
  editData?: any
  onClose: () => void
  onSuccess: () => void
}

export function ToppingGroupModal({ isOpen, editData, onClose, onSuccess }: ToppingGroupModalProps) {
  const [name, setName] = useState('')
  const [minSelect, setMinSelect] = useState(0)
  const [maxSelect, setMaxSelect] = useState(1)
  const [toppings, setToppings] = useState<{ name: string; extraPrice: number }[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info'}>({ isOpen: false, title: '', message: '', type: 'info' })

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setName(editData.name)
        setMinSelect(editData.minSelect)
        setMaxSelect(editData.maxSelect)
        setToppings(editData.toppings.map((t: any) => ({ name: t.name, extraPrice: t.extraPrice })))
      } else {
        setName('')
        setMinSelect(0)
        setMaxSelect(1)
        setToppings([])
      }
      setError('')
    }
  }, [isOpen, editData])

  if (!isOpen) return null

  const handleAddTopping = () => {
    setToppings([...toppings, { name: '', extraPrice: 0 }])
  }

  const handleToppingChange = (index: number, field: 'name' | 'extraPrice', value: string) => {
    const newToppings = [...toppings]
    if (field === 'name') {
      newToppings[index].name = value
    } else {
      newToppings[index].extraPrice = parseInt(value) || 0
    }
    setToppings(newToppings)
  }

  const handleRemoveTopping = (index: number) => {
    setToppings(toppings.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (editData) {
        await updateToppingGroup(editData.id, {
          name,
          minSelect,
          maxSelect,
          toppings
        })
      } else {
        await createToppingGroup({
          name,
          minSelect,
          maxSelect,
          toppings
        })
      }
      setAlertConfig({ isOpen: true, title: 'Thành công', message: 'Lưu nhóm Topping thành công!', type: 'success' })
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo nhóm Topping')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-[24px] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-6 text-2xl font-bold text-coffee">{editData ? 'Sửa nhóm Topping' : 'Thêm nhóm Topping mới'}</h2>
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Tên nhóm Topping <span className="text-red-500">*</span></label>
            <input
              required
              className="w-full rounded-[14px] border border-line p-3"
              placeholder="VD: Mức Đá, Mức Đường, Topping thêm..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Chọn tối thiểu</label>
              <input
                type="number"
                min="0"
                required
                className="w-full rounded-[14px] border border-line p-3"
                value={minSelect}
                onChange={(e) => setMinSelect(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Chọn tối đa</label>
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-[14px] border border-line p-3"
                value={maxSelect}
                onChange={(e) => setMaxSelect(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Các tuỳ chọn</h3>
              <button 
                type="button"
                onClick={handleAddTopping}
                className="text-coffee font-medium hover:underline text-sm"
              >
                + Thêm lựa chọn
              </button>
            </div>

            {toppings.length === 0 && (
              <p className="text-sm text-muted italic">Chưa có tuỳ chọn nào. Vui lòng thêm ít nhất 1 tuỳ chọn.</p>
            )}

            <div className="space-y-3">
              {toppings.map((top, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      required
                      placeholder="Tên tuỳ chọn (VD: 50% Đường)"
                      className="w-full rounded-[14px] border border-line p-3 text-sm"
                      value={top.name}
                      onChange={(e) => handleToppingChange(idx, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-1/3">
                    <CurrencyInput
                      required
                      placeholder="Phụ thu (VND)"
                      className="w-full rounded-[14px] border border-line p-3 text-sm"
                      value={top.extraPrice}
                      onValueChange={(val) => handleToppingChange(idx, 'extraPrice', val)}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveTopping(idx)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-[14px]"
                  >
                    Xoá
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[14px] px-6 py-3 font-medium hover:bg-gray-100"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading || toppings.length === 0}
              className="rounded-[14px] bg-coffee px-6 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu nhóm Topping'}
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          setAlertConfig({ ...alertConfig, isOpen: false })
          if (alertConfig.type === 'success') {
            setName('')
            setMinSelect(0)
            setMaxSelect(1)
            setToppings([])
            onSuccess()
          }
        }}
      />
    </div>
  )
}
