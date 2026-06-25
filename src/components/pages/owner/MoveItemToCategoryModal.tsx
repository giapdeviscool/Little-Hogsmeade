import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { moveItemsToCategory } from '../../../api/menu-item.api'
import type { Category, MenuItem } from '../../../types'

interface MoveItemToCategoryModalProps {
  category: Category
  allGlobalItems: MenuItem[]
  onClose: () => void
  onSuccess: () => void
}

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function MoveItemToCategoryModal({
  category,
  allGlobalItems,
  onClose,
  onSuccess,
}: MoveItemToCategoryModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only show items NOT already in this category
  const eligibleItems = useMemo(
    () => allGlobalItems.filter((i) => i.categoryId !== category.id),
    [allGlobalItems, category.id]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return eligibleItems
    return eligibleItems.filter((i) => i.name.toLowerCase().includes(q))
  }, [eligibleItems, search])

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleConfirm = async () => {
    if (selected.size === 0) return
    setLoading(true)
    setError(null)
    try {
      await moveItemsToCategory(Array.from(selected), category.id)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi chuyển món')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-coffee">
              Chuyển món vào{' '}
              <span className="text-coffee">
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-muted">Chọn các món muốn chuyển sang danh mục này</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-beige hover:text-coffee"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-line px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Tìm theo tên món..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-background pl-9 pr-3 text-sm text-coffee placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coffee/20"
            />
          </div>
        </div>

        {/* Item list */}
        <div className="max-h-80 flex-1 overflow-y-auto px-6 py-2">
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              {search ? 'Không tìm thấy món phù hợp' : 'Không có món nào để chuyển'}
            </p>
          ) : (
            <ul className="divide-y divide-line/60">
              {filtered.map((item) => {
                const isChecked = selected.has(item.id)
                return (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-center gap-3 py-3 transition-colors hover:bg-beige/30 -mx-2 px-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(item.id)}
                        className="h-4 w-4 shrink-0 accent-coffee"
                      />
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige text-xl">
                          🍽️
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-coffee">{item.name}</p>
                        <p className="text-xs text-muted">
                          Hiện ở: {item.category?.name ?? 'Không rõ'}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-coffee">
                        {formatVND(item.basePrice)}
                      </p>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line px-6 py-4">
          <p className="text-sm text-muted">
            {selected.size > 0 ? (
              <span className="font-semibold text-coffee">Đã chọn {selected.size} món</span>
            ) : (
              'Chưa chọn món nào'
            )}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 rounded-lg px-4 text-sm font-medium text-muted transition-colors hover:bg-beige"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0 || loading}
              className="h-9 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
            >
              {loading ? 'Đang chuyển...' : 'Chuyển vào danh mục'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
