import { useState, useEffect, useMemo } from 'react'
import { EyeOff, Eye, Pencil, Pizza, ClipboardList, Plus } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { MenuItemDialog } from './MenuItemDialog'
import { AssignToppingModal } from '../../../pages/internal/components/AssignToppingModal'
import { RecipeConfigModal } from '../../../pages/internal/components/RecipeConfigModal'
import type { Category, Branch, MenuItem } from '../../../types'

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

interface BranchMenuEditorProps {
  branchName: string
  branchId: string
  menuData: { categories: any[], menuItems: any[] }
  onSave: (items: { menuItemId: string; isActive?: boolean; basePrice?: number | null }[]) => void
  onReset: () => void
  saving: boolean
  categories: Category[]
  branches: Branch[]
}

export function BranchMenuEditor({
  branchName,
  branchId,
  menuData,
  onSave,
  onReset,
  saving,
  categories,
  branches,
}: BranchMenuEditorProps) {
  const [localItems, setLocalItems] = useState<any[]>([])
  const [dirty, setDirty] = useState(false)
  const [addingForCategoryId, setAddingForCategoryId] = useState<string | null>(null)
  const [editingLocalItem, setEditingLocalItem] = useState<MenuItem | null>(null)
  const [assignToppingTarget, setAssignToppingTarget] = useState<{ id: string; name: string } | null>(null)
  const [bomTarget, setBomTarget] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const allItems = menuData.menuItems ?? []
    setLocalItems(allItems.map((i: any) => ({
      ...i,
      _isActive: i.branchId ? i.isActive : true,
      _basePrice: i.branchId ? i.basePrice : i.basePrice,
    })))
    setDirty(false)
  }, [menuData])

  const itemsByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {}
    for (const item of localItems) {
      const catId = item.categoryId ?? '__unknown__'
      if (!groups[catId]) groups[catId] = []
      groups[catId].push(item)
    }
    return groups
  }, [localItems])

  function toggleItem(id: string) {
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, _isActive: !i._isActive } : i))
    setDirty(true)
  }

  function handleSave() {
    const changes = localItems
      .filter(i => i.branchId)
      .map(i => ({
        menuItemId: i.id,
        isActive: i._isActive,
        basePrice: i._basePrice !== i.basePrice ? i._basePrice : undefined,
      }))
    onSave(changes)
    setDirty(false)
  }

  const catOrder = menuData.categories ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-coffee">{branchName}</h3>
          <p className="text-sm text-muted">Các món toàn chuỗi + món riêng của chi nhánh</p>
        </div>
      </div>

      {Object.keys(itemsByCategory).length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-12 text-center">
          <p className="font-medium text-muted">Chưa có món nào</p>
          <p className="mt-1 text-sm text-muted/70">Đồng bộ menu từ Base Menu trước.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {catOrder.map((cat: any) => {
            const catItems = itemsByCategory[cat.id]
            if (!catItems || catItems.length === 0) return null

            const globalItems = catItems.filter((i: any) => !i.branchId)
            const privateItems = catItems.filter((i: any) => i.branchId)

            return (
              <div key={cat.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
                <div className="flex items-center gap-2 bg-cream/50 px-4 py-3 border-b border-line">
                  <span className="font-semibold text-coffee">{cat.name}</span>
                  <span className="rounded-full bg-beige px-2 py-0.5 text-xs font-medium text-muted">
                    {catItems.length} món
                  </span>
                </div>

                {globalItems.length > 0 && (
                  <div className="px-4 py-2 border-b border-line/50">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Toàn chuỗi</p>
                    {globalItems.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-beige flex items-center justify-center text-lg">🍽️</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-coffee">{item.name}</p>
                          <p className="text-xs text-muted">Giá: {formatVND(item.basePrice)}</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase text-muted/50 bg-beige/50 px-2 py-1 rounded">Chuỗi</span>
                      </div>
                    ))}
                  </div>
                )}

                {privateItems.length > 0 && (
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Riêng chi nhánh</p>
                    {privateItems.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-beige flex items-center justify-center text-lg">🍽️</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-coffee">{item.name}</p>
                          <p className="text-xs text-muted">Giá: {formatVND(item._basePrice)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                              item._isActive
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {item._isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {item._isActive ? 'Hiện' : 'Ẩn'}
                          </button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setEditingLocalItem(item)}
                                className="rounded-lg p-1.5 text-muted hover:bg-beige hover:text-coffee transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent><p>Chỉnh sửa</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setAssignToppingTarget({ id: item.id, name: item.name })}
                                className="rounded-lg p-1.5 text-muted hover:bg-beige hover:text-coffee transition-colors"
                              >
                                <Pizza className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent><p>Gán Topping</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setBomTarget({ id: item.id, name: item.name })}
                                className="rounded-lg p-1.5 text-muted hover:bg-beige hover:text-coffee transition-colors"
                              >
                                <ClipboardList className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent><p>Cấu hình BOM</p></TooltipContent>
                          </Tooltip>
                          {item._count?.menuItemToppingGroups !== undefined && item._count.menuItemToppingGroups > 0 && (
                            <span className="text-[11px] font-medium text-muted bg-beige/60 rounded-md px-1.5 py-0.5">
                              {item._count.menuItemToppingGroups}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-dashed border-line/40 mx-4" />

                <div className="px-4 py-2">
                  <button
                    onClick={() => setAddingForCategoryId(cat.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-coffee transition-colors hover:bg-beige"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm món riêng
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {dirty && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-line bg-white px-6 py-4 -mx-6 -mb-6">
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

      <MenuItemDialog
        open={!!addingForCategoryId}
        onClose={() => setAddingForCategoryId(null)}
        onSuccess={() => { setAddingForCategoryId(null); onReset() }}
        categories={categories}
        branches={branches}
        editingItem={null}
        defaultBranchId={branchId}
        defaultCategoryId={addingForCategoryId}
      />

      <MenuItemDialog
        open={!!editingLocalItem}
        onClose={() => setEditingLocalItem(null)}
        onSuccess={() => { setEditingLocalItem(null); onReset() }}
        categories={categories}
        branches={branches}
        editingItem={editingLocalItem}
      />

      {assignToppingTarget && (
        <AssignToppingModal
          isOpen={!!assignToppingTarget}
          menuItemId={assignToppingTarget.id}
          menuItemName={assignToppingTarget.name}
          onClose={() => setAssignToppingTarget(null)}
          onSuccess={() => { setAssignToppingTarget(null); onReset() }}
        />
      )}

      {bomTarget && (
        <RecipeConfigModal
          isOpen={!!bomTarget}
          menuItemId={bomTarget.id}
          menuItemName={bomTarget.name}
          onClose={() => setBomTarget(null)}
          onSuccess={() => { setBomTarget(null); onReset() }}
        />
      )}
    </div>
  )
}
