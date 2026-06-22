import { useState, useEffect } from 'react'
import { getMenuItemToppingGroups, assignMenuItemToppingGroups } from '../../../api/menu-item.api'
import type { ToppingGroupAssignment } from '../../../types'
import { cn } from '../../../utils/cn'
import { AlertModal } from '../../../components/ui/AlertModal'

interface AssignToppingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  menuItemId: string | null
  menuItemName: string
}

export function AssignToppingModal({ isOpen, onClose, onSuccess, menuItemId, menuItemName }: AssignToppingModalProps) {
  const [groups, setGroups] = useState<ToppingGroupAssignment[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info'}>({ isOpen: false, title: '', message: '', type: 'info' })

  useEffect(() => {
    if (isOpen && menuItemId) {
      setLoading(true)
      setError('')
      getMenuItemToppingGroups(menuItemId)
        .then(res => {
          const data = res.data as ToppingGroupAssignment[]
          setGroups(data)
          const initialSelected = new Set<string>()
          data.forEach(g => {
            if (g.isAssigned) initialSelected.add(g.id)
          })
          setSelectedIds(initialSelected)
        })
        .catch(err => {
          setError(err.message || 'Không thể tải danh sách topping.')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, menuItemId])

  if (!isOpen || !menuItemId) return null

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
      await assignMenuItemToppingGroups(menuItemId, Array.from(selectedIds))
      setAlertConfig({ isOpen: true, title: 'Thành công', message: 'Gán nhóm Topping thành công!', type: 'success' })
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu.')
    } finally {
      setSaving(false)
    }
  }

  const handleAlertClose = () => {
    setAlertConfig({ ...alertConfig, isOpen: false })
    if (alertConfig.type === 'success') {
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-[24px] bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        <h2 className="mb-2 text-2xl font-bold text-coffee">Gán Topping cho món ăn</h2>
        <p className="mb-6 text-sm text-muted">Món: <span className="font-bold text-black">{menuItemName}</span></p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-[300px] border border-line rounded-[14px] p-2 bg-gray-50">
          {loading ? (
            <div className="py-10 text-center text-muted">Đang tải...</div>
          ) : groups.length === 0 ? (
            <div className="py-10 text-center text-muted">Chưa có nhóm Topping nào khả dụng.</div>
          ) : (
            <div className="space-y-2">
              {groups.map(group => (
                <label 
                  key={group.id} 
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border bg-white cursor-pointer transition-colors hover:bg-emerald-50",
                    selectedIds.has(group.id) ? "border-emerald-500 ring-1 ring-emerald-500" : "border-line"
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
                    checked={selectedIds.has(group.id)}
                    onChange={() => handleToggle(group.id)}
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{group.name}</h4>
                    <p className="text-xs text-muted mt-1">
                      {group.toppingsCount} tuỳ chọn • Chọn {group.minSelect}-{group.maxSelect}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[14px] px-6 py-3 font-medium hover:bg-gray-100"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="rounded-[14px] bg-coffee px-6 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={handleAlertClose}
      />
    </div>
  )
}
