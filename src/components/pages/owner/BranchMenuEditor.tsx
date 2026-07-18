import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import type { BranchMenuView } from '../../../types/menu.types'

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

interface DirtyCategoryState {
  isActive: boolean
}

interface DirtyItemState {
  isActive: boolean
  basePrice: number | null
}

interface BranchMenuEditorProps {
  branchId: string
  branchName: string
  globalPricingEnabled: boolean
  allowLocalPricingOverride: boolean
  saving: boolean
  menuData: BranchMenuView
  onSave: (
    categories: { categoryId: string; isActive: boolean }[],
    items: { menuItemId: string; isActive: boolean; basePrice?: number | null }[],
  ) => void
  onReset: () => void
}

export function BranchMenuEditor({
  branchId: _branchId,
  branchName,
  globalPricingEnabled,
  allowLocalPricingOverride,
  saving,
  menuData,
  onSave,
  onReset,
}: BranchMenuEditorProps) {
  const [dirtyCategories, setDirtyCategories] = useState<Record<string, DirtyCategoryState>>({})
  const [dirtyItems, setDirtyItems] = useState<Record<string, DirtyItemState>>({})

  // Cast response data — API returns flat objects from getBranchMenu
  const categories = useMemo(
    () =>
      (menuData.categories ?? []) as Array<{
        id: string
        name: string
        icon?: string
        isActive: boolean
        displayOrder?: number
      }>,
    [menuData.categories],
  )

  const items = useMemo(
    () =>
      (menuData.menuItems ?? []) as Array<{
        id: string
        categoryId: string
        name: string
        description?: string
        imageUrl?: string
        basePrice: number
        isFeatured?: boolean
        isActive: boolean
      }>,
    [menuData.menuItems],
  )

  // Initialize dirty state from fresh menuData
  useEffect(() => {
    const catState: Record<string, DirtyCategoryState> = {}
    for (const c of categories) {
      catState[c.id] = { isActive: c.isActive }
    }
    setDirtyCategories(catState)

    const itemState: Record<string, DirtyItemState> = {}
    for (const i of items) {
      itemState[i.id] = { isActive: i.isActive, basePrice: i.basePrice ?? null }
    }
    setDirtyItems(itemState)
  }, [menuData]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleCategory(id: string) {
    setDirtyCategories((prev) => {
      const current = prev[id]
      if (!current) return prev
      return { ...prev, [id]: { ...current, isActive: !current.isActive } }
    })
  }

  function toggleItem(id: string) {
    setDirtyItems((prev) => {
      const current = prev[id]
      if (!current) return prev
      return { ...prev, [id]: { ...current, isActive: !current.isActive } }
    })
  }

  function setItemPrice(id: string, price: number | null) {
    setDirtyItems((prev) => {
      const current = prev[id]
      if (!current) return prev
      return { ...prev, [id]: { ...current, basePrice: price } }
    })
  }

  function isDirty(): boolean {
    for (const c of categories) {
      const s = dirtyCategories[c.id]
      if (s && s.isActive !== c.isActive) return true
    }
    for (const i of items) {
      const s = dirtyItems[i.id]
      if (!s) continue
      if (s.isActive !== i.isActive) return true
      if (s.basePrice !== (i.basePrice ?? null)) return true
    }
    return false
  }

  function handleSave() {
    const catChanges: { categoryId: string; isActive: boolean }[] = []
    for (const c of categories) {
      const s = dirtyCategories[c.id]
      if (s && s.isActive !== c.isActive) {
        catChanges.push({ categoryId: c.id, isActive: s.isActive })
      }
    }

    const itemChanges: { menuItemId: string; isActive: boolean; basePrice?: number | null }[] = []
    for (const i of items) {
      const s = dirtyItems[i.id]
      if (!s) continue
      const changed = s.isActive !== i.isActive || s.basePrice !== (i.basePrice ?? null)
      if (changed) {
        const entry: { menuItemId: string; isActive: boolean; basePrice?: number | null } = {
          menuItemId: i.id,
          isActive: s.isActive,
        }
        if (s.basePrice !== (i.basePrice ?? null)) {
          entry.basePrice = s.basePrice
        }
        itemChanges.push(entry)
      }
    }

    onSave(catChanges, itemChanges)
  }

  const showPriceInput = !globalPricingEnabled || allowLocalPricingOverride
  const hasChanges = isDirty()

  // Group items by category
  const itemsByCategoryId: Record<string, typeof items> = {}
  for (const item of items) {
    const catId = item.categoryId ?? '__unknown__'
    if (!itemsByCategoryId[catId]) itemsByCategoryId[catId] = []
    itemsByCategoryId[catId].push(item)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-coffee">{branchName}</h3>
          <p className="text-sm text-muted">Tuỳ chỉnh thực đơn cho chi nhánh này</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-12 text-center">
          <p className="font-medium text-muted">Chưa có danh mục nào</p>
          <p className="mt-1 text-sm text-muted/70">Vui lòng đồng bộ menu từ Global Menu trước.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
            .map((cat) => {
              const catState = dirtyCategories[cat.id]
              if (!catState) return null
              const catItems = itemsByCategoryId[cat.id] ?? []

              return (
                <div
                  key={cat.id}
                  className="overflow-hidden rounded-xl border border-line bg-white shadow-sm"
                >
                  {/* Category header */}
                  <div className="flex items-center justify-between bg-cream/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{cat.icon ?? '📦'}</span>
                      <span className="font-semibold text-coffee">{cat.name ?? 'Danh mục'}</span>
                      <span className="rounded-full bg-beige px-2 py-0.5 text-xs font-medium text-muted">
                        {catItems.length} món
                      </span>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <span className="text-xs font-medium text-muted">
                        {catState.isActive ? 'Hiện' : 'Ẩn'}
                      </span>
                      <input
                        type="checkbox"
                        checked={catState.isActive}
                        onChange={() => toggleCategory(cat.id)}
                        className="peer sr-only"
                      />
                      <div className="relative h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-coffee peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  <div className="border-t border-line" />

                  {/* Items */}
                  <div className="px-4 py-2">
                    {catItems.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted">Chưa có món nào</p>
                    ) : (
                      <ul className="divide-y divide-line/60">
                        {catItems.map((item) => {
                          const itemState = dirtyItems[item.id]
                          if (!itemState) return null

                          return (
                            <li key={item.id} className="flex items-center gap-3 py-2.5">
                              {/* Item image */}
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

                              {/* Item name + toggle */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-coffee">
                                    {item.name ?? 'Món'}
                                  </p>
                                  <label className="inline-flex cursor-pointer items-center">
                                    <input
                                      type="checkbox"
                                      checked={itemState.isActive}
                                      onChange={() => toggleItem(item.id)}
                                      className="peer sr-only"
                                    />
                                    <div className="relative h-4 w-7 rounded-full bg-gray-200 after:absolute after:left-[1px] after:top-[1px] after:h-[14px] after:w-[14px] after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-coffee peer-checked:after:translate-x-[12px]" />
                                  </label>
                                </div>
                                <p className="mt-0.5 text-xs text-muted">
                                  Giá gốc: {formatVND(item.basePrice)}
                                </p>
                              </div>

                              {/* Price override input */}
                              {showPriceInput && (
                                <div className="shrink-0">
                                  <Input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={itemState.basePrice ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      setItemPrice(item.id, val === '' ? null : Number(val))
                                    }}
                                    className="h-8 w-28 text-xs"
                                    placeholder="Giá lẻ"
                                  />
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Action buttons */}
      {hasChanges && (
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 flex items-center justify-end gap-3 border-t border-line bg-white px-6 py-4">
          <button
            className="h-9 rounded-lg border border-line px-4 text-sm font-semibold text-muted transition-colors hover:bg-beige"
            disabled={saving}
            onClick={onReset}
          >
            Huỷ
          </button>
          <button
            className="h-9 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      )}
    </div>
  )
}
