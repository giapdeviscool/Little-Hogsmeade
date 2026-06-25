import { useState, useRef, useEffect } from 'react'
import { Card } from '../../../components/ui/Card'
import { updateMenuItem } from '../../../api/menu-item.api'
import type { Category, MenuItem } from '../../../types'

interface EditMenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categories: Category[]
  item: MenuItem | null
}

export function EditMenuItemModal({ isOpen, onClose, onSuccess, categories, item }: EditMenuItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    basePrice: '',
    description: ''
  })

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name || '',
        categoryId: item.categoryId || '',
        basePrice: item.basePrice?.toString() || '',
        description: item.description || ''
      })
      setError('')
    }
  }, [item, isOpen])

  if (!isOpen || !item) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formPayload = new FormData()
      formPayload.append('name', formData.name)
      formPayload.append('categoryId', formData.categoryId)
      formPayload.append('basePrice', formData.basePrice)
      if (formData.description) {
        formPayload.append('description', formData.description)
      }
      
      if (fileInputRef.current?.files?.[0]) {
        formPayload.append('image', fileInputRef.current.files[0])
      }

      await updateMenuItem(item.id, formPayload)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo món ăn')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-xl font-bold">Chỉnh sửa món ăn</h2>
          <button onClick={onClose} className="text-muted hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tên món ăn <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-line px-3 py-2"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Cà phê sữa đá"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Danh mục <span className="text-red-500">*</span></label>
              <select
                required
                className="w-full rounded-lg border border-line px-3 py-2 bg-white"
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="" disabled>Chọn danh mục</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Giá bán (VND) <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                min="0"
                className="w-full rounded-lg border border-line px-3 py-2"
                value={formData.basePrice}
                onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                placeholder="VD: 35000"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Mô tả</label>
              <textarea
                className="w-full rounded-lg border border-line px-3 py-2"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả về món ăn..."
              ></textarea>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Hình ảnh</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-coffee px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
