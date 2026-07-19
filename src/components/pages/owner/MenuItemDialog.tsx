import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Image } from 'lucide-react'
import { createMenuItem, updateMenuItem } from '../../../api/menu-item.api'
import { uploadImage } from '../../../api/cms.api'
import type { Category, Branch, MenuItem } from '../../../types'

interface MenuItemDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  categories: Category[]
  branches?: Branch[]
  editingItem?: MenuItem | null
  defaultBranchId?: string | null
  defaultCategoryId?: string | null
}

export function MenuItemDialog({
  open,
  onClose,
  onSuccess,
  categories,
  branches = [],
  editingItem,
  defaultBranchId,
  defaultCategoryId,
}: MenuItemDialogProps) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [basePrice, setBasePrice] = useState(0)
  const [description, setDescription] = useState('')
  const [scope, setScope] = useState<'global' | 'branch'>('global')
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!editingItem
  const showScopeSelector = !isEditing

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setName(editingItem.name || '')
        setCategoryId(editingItem.categoryId || '')
        setBasePrice(editingItem.basePrice || 0)
        setDescription(editingItem.description ?? '')
        setScope(editingItem.branchId ? 'branch' : 'global')
        setSelectedBranchId(editingItem.branchId ?? '')
        setImagePreview(editingItem.imageUrl ?? null)
      } else {
        setName('')
        setCategoryId(defaultCategoryId ?? '')
        setBasePrice(0)
        setDescription('')
        setScope(defaultBranchId ? 'branch' : 'global')
        setSelectedBranchId(defaultBranchId ?? '')
        setImagePreview(null)
      }
      setImageFile(null)
      setError('')
    }
  }, [open, editingItem, defaultBranchId, defaultCategoryId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Vui lòng nhập tên món ăn'); return }
    if (!categoryId) { setError('Vui lòng chọn danh mục'); return }
    if (!basePrice || basePrice <= 0) { setError('Vui lòng nhập giá bán hợp lệ'); return }
    if (scope === 'branch' && !selectedBranchId) { setError('Vui lòng chọn chi nhánh'); return }

    setSaving(true)
    setError('')

    try {
      let imageUrl = editingItem?.imageUrl ?? null

      if (imageFile) {
        const uploadRes = await uploadImage(imageFile, 'bistro-cafe/menu-items')
        imageUrl = uploadRes?.data?.secure_url ?? null
      }

      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('categoryId', categoryId)
      formData.append('basePrice', String(basePrice))
      if (description.trim()) formData.append('description', description.trim())
      if (editingItem?.branchId) {
        formData.append('branchId', editingItem.branchId)
      } else if (scope === 'branch') {
        formData.append('branchId', selectedBranchId)
      } else {
        formData.append('branchId', '')
      }
      if (imageUrl) formData.append('imageUrl', imageUrl)

      if (editingItem) {
        await updateMenuItem(editingItem.id, formData)
      } else {
        await createMenuItem(formData)
      }

      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi lưu món ăn')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-coffee">
              Tên món ăn <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cà phê sữa đá"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-coffee">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="" disabled>Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-coffee">
              Giá bán (VND) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={0}
              step={1000}
              value={basePrice || ''}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              placeholder="VD: 35000"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-coffee">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả về món ăn..."
              rows={3}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>

          {showScopeSelector && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-coffee">Phạm vi</label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    checked={scope === 'global'}
                    onChange={() => { setScope('global'); setSelectedBranchId('') }}
                    className="h-4 w-4 accent-coffee"
                  />
                  <span className="text-sm text-gray-700">Toàn chuỗi</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    checked={scope === 'branch'}
                    onChange={() => setScope('branch')}
                    className="h-4 w-4 accent-coffee"
                  />
                  <span className="text-sm text-gray-700">Riêng 1 chi nhánh</span>
                </label>
              </div>
            </div>
          )}

          {scope === 'branch' && branches.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-coffee">
                Chi nhánh <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>Chọn chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-coffee">Hình ảnh</label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg border object-cover"
                />
              )}
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Image className="mr-1.5 h-4 w-4" />
                {imagePreview ? 'Đổi ảnh' : 'Chọn ảnh'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="text-xs text-muted hover:text-red-500"
                >
                  Xoá
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-coffee text-white hover:bg-coffee/90">
            {saving ? 'Đang lưu...' : (editingItem ? 'Lưu thay đổi' : 'Lưu món ăn')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
