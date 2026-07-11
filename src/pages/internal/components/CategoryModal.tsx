import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from 'react'
import type { Category } from '../../../types'
import { createCategory, updateCategory } from '../../../api/category.api'
import { Loader2 } from 'lucide-react'

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-coffee">
            {isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-coffee">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-coffee placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coffee/20"
              placeholder="VD: Cà phê pha máy..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-coffee">
              Icon (Text/Emoji)
            </label>
            <input
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-coffee placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coffee/20"
              placeholder="VD: ☕, 🍰, 🍹..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-coffee">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-line accent-coffee"
            />
            <span className="font-medium">Đang hoạt động (Hiển thị)</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 rounded-lg border border-line bg-white px-4 text-sm font-medium text-muted transition-colors hover:bg-beige"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
