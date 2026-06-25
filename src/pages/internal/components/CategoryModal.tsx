import { useState, useEffect } from 'react'
import type { Category } from '../../../types'
import { createCategory, updateCategory } from '../../../api/category.api'

interface CategoryModalProps {
  category: Category | null
  onClose: () => void
  onSuccess: (msg: string) => void
}

export function CategoryModal({ category, onClose, onSuccess }: CategoryModalProps) {
  const isEditing = !!category
  
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    isActive: true,
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon || '',
        isActive: category.isActive,
      })
    }
  }, [category])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isEditing) {
        await updateCategory(category.id, formData)
        onSuccess('Cập nhật danh mục thành công!')
      } else {
        await createCategory(formData)
        onSuccess('Thêm mới danh mục thành công!')
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu danh mục')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">{isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tên danh mục <span className="text-red-500">*</span></label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-line px-4 py-2"
              placeholder="VD: Cà phê pha máy..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Icon (Text/Emoji)</label>
            <input
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full rounded-xl border border-line px-4 py-2"
              placeholder="VD: ☕, 🍰, 🍹..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Đang hoạt động (Hiển thị)
            </label>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-line py-2 font-bold text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-coffee py-2 font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
