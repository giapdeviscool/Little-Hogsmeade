import { useState, useEffect, useCallback } from 'react'
import { ChevronUp, ChevronDown, Pencil, Trash2, TriangleAlert, Plus, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getCategories, updateCategory, moveCategory } from '../../../api/category.api'
import { getMenuItems } from '../../../api/menu-item.api'
import { ConfirmDialog } from './ConfirmDialog'
import { CategoryModal } from '../../../pages/internal/components/CategoryModal'
import { MoveItemToCategoryModal } from './MoveItemToCategoryModal'
import type { Category, MenuItem } from '../../../types'

interface GlobalMenuPanelProps {
  overrideBranchesCount?: number
  saving?: boolean
  onSync: () => void
}

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function GlobalMenuPanel({
  overrideBranchesCount = 0,
  saving = false,
  onSync,
}: GlobalMenuPanelProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([])
  const [loadingCats, setLoadingCats] = useState(true)

  // Dialogs
  const [confirmSync, setConfirmSync] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState<Category | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null | 'new'>('new')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [movingToCategory, setMovingToCategory] = useState<Category | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const fetchData = useCallback(async () => {
    setLoadingCats(true)
    try {
      const [catRes, itemRes] = await Promise.all([
        getCategories({ limit: 100, status: 'active' }),
        getMenuItems({ limit: 200, isActive: true }),
      ])

      const cats: Category[] = catRes.data?.items ?? catRes.data ?? []
      const globalCats = cats
        .filter((c: Category) => !c.branchId)
        .sort((a: Category, b: Category) => a.displayOrder - b.displayOrder)
      setCategories(globalCats)

      const items: MenuItem[] = itemRes.data?.items ?? itemRes.data ?? []
      const globalItems = items.filter((i: MenuItem) => !i.branchId && i.isActive)
      setAllMenuItems(globalItems)
    } catch (err) {
      console.error('Failed to fetch global menu data', err)
    } finally {
      setLoadingCats(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleMoveCategory = async (cat: Category, direction: 'up' | 'down') => {
    try {
      await moveCategory(cat.id, direction)
      await fetchData()
    } catch (err) {
      console.error('Failed to move category', err)
    }
  }

  const handleDeactivateCategory = async () => {
    if (!confirmDeactivate) return
    setActionLoading(true)
    try {
      await updateCategory(confirmDeactivate.id, { isActive: false })
      setConfirmDeactivate(null)
      showSuccess(`Đã ẩn danh mục "${confirmDeactivate.name}"`)
      await fetchData()
    } catch (err) {
      console.error('Failed to deactivate category', err)
    } finally {
      setActionLoading(false)
    }
  }

  const openCreateCategory = () => {
    setEditingCategory(null)
    setShowCategoryModal(true)
  }

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat)
    setShowCategoryModal(true)
  }

  const handleCategoryModalSuccess = (msg: string) => {
    setShowCategoryModal(false)
    setEditingCategory('new')
    showSuccess(msg)
    fetchData()
  }

  const itemsForCategory = (catId: string) =>
    allMenuItems.filter((i) => i.categoryId === catId)

  if (loadingCats) {
    return (
      <div className="py-12 text-center text-sm text-muted">Đang tải Global Menu...</div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Success toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-[70] flex items-center rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Top row: sync button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Quản lý cấu trúc danh mục và món dùng chung cho toàn chuỗi.
        </p>
        <button
          className="h-9 whitespace-nowrap rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
          disabled={saving}
          onClick={() => setConfirmSync(true)}
        >
          Đồng bộ xuống chi nhánh
        </button>
      </div>

      {/* Override warning banner */}
      {overrideBranchesCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {overrideBranchesCount} chi nhánh đang tự set giá riêng. Đồng bộ có thể ảnh hưởng đến giá hiện tại của các chi nhánh này.
          </p>
        </div>
      )}

      {/* Add category button */}
      <div>
        <button
          onClick={openCreateCategory}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-medium text-coffee transition-colors hover:bg-beige"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Category list or empty state */}
      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-16 text-center">
          <UtensilsCrossed className="mx-auto mb-3 h-10 w-10 text-muted/40" />
          <p className="font-medium text-coffee">Chưa có danh mục nào trong Global Menu</p>
          <p className="mt-1 text-sm text-muted">Bắt đầu bằng cách thêm danh mục đầu tiên</p>
          <button
            onClick={openCreateCategory}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-coffee px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coffee/90"
          >
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const items = itemsForCategory(cat.id)
            const isFirst = idx === 0
            const isLast = idx === categories.length - 1

            return (
              <div
                key={cat.id}
                className="overflow-hidden rounded-xl border border-line bg-white shadow-sm"
              >
                {/* Card header */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-cream/50">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-xl leading-none">{cat.icon || '📦'}</span>
                    <span className="truncate font-semibold text-coffee">{cat.name}</span>
                    <span className="shrink-0 rounded-full bg-beige px-2 py-0.5 text-xs font-medium text-muted">
                      {items.length} món
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isFirst} onClick={() => handleMoveCategory(cat, 'up')}>
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Lên trên</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isLast} onClick={() => handleMoveCategory(cat, 'down')}>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Xuống dưới</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => openEditCategory(cat)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sửa danh mục</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-red-600 hover:bg-red-50" onClick={() => setConfirmDeactivate(cat)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ẩn danh mục</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-line" />

                {/* Items list */}
                <div className="px-4 py-2">
                  {items.length === 0 ? (
                    <button
                      onClick={() => setMovingToCategory(cat)}
                      className="my-2 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-line py-6 text-center transition-colors hover:border-coffee/40 hover:bg-beige/50"
                    >
                      <p className="text-sm font-medium text-muted">Chưa có món nào trong danh mục này</p>
                      <p className="mt-0.5 text-xs text-muted/70">Nhấn để chuyển món vào đây</p>
                    </button>
                  ) : (
                    <ul className="divide-y divide-line/60">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 py-2.5">
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
                          </div>
                          <p className="shrink-0 text-sm font-semibold text-coffee">
                            {formatVND(item.basePrice)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add item button (always shown below list) */}
                  {items.length > 0 && (
                    <button
                      onClick={() => setMovingToCategory(cat)}
                      className="mb-1 mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-coffee transition-colors hover:bg-beige"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thêm món
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm: Sync */}
      <ConfirmDialog
        isOpen={confirmSync}
        title="Đồng bộ menu xuống chi nhánh?"
        description="Hành động này sẽ dọn dữ liệu override không còn hợp lệ và xác nhận menu hiện tại với tất cả chi nhánh đang hoạt động."
        confirmLabel="Đồng bộ"
        onConfirm={() => {
          setConfirmSync(false)
          onSync()
        }}
        onClose={() => setConfirmSync(false)}
        loading={saving}
      />

      {/* Confirm: Deactivate category */}
      {confirmDeactivate && (
        <ConfirmDialog
          isOpen={!!confirmDeactivate}
          title={`Ẩn danh mục "${confirmDeactivate.name}"?`}
          description="Danh mục sẽ không hiển thị trên menu nhưng dữ liệu vẫn được lưu. Bạn có thể kích hoạt lại qua trang Quản lý danh mục."
          confirmLabel="Ẩn danh mục"
          onConfirm={handleDeactivateCategory}
          onClose={() => setConfirmDeactivate(null)}
          loading={actionLoading}
        />
      )}

      {/* Category Modal (create / edit) */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory === 'new' || editingCategory === null ? null : editingCategory}
          onClose={() => {
            setShowCategoryModal(false)
            setEditingCategory('new')
          }}
          onSuccess={handleCategoryModalSuccess}
        />
      )}

      {/* Move items to category modal */}
      {movingToCategory && (
        <MoveItemToCategoryModal
          category={movingToCategory}
          allGlobalItems={allMenuItems}
          onClose={() => setMovingToCategory(null)}
          onSuccess={() => {
            setMovingToCategory(null)
            showSuccess('Đã chuyển món vào danh mục thành công!')
            fetchData()
          }}
        />
      )}
    </div>
  )
}
