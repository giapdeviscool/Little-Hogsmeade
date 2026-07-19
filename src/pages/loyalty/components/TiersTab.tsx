import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/pages/owner/DataTable'
import { ConfirmDialog } from '../../../components/pages/owner/ConfirmDialog'
import { Skeleton } from '../../../components/ui/skeleton'
import { getMembershipTiers, createMembershipTier, updateMembershipTier, deleteMembershipTier } from '../../../api/loyalty.api'
import type { MembershipTier, MembershipTierPayload } from '../../../api/loyalty.api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../components/ui/dialog'

export function TiersTab() {
  const [tiers, setTiers] = useState<MembershipTier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null)
  const [formData, setFormData] = useState<MembershipTierPayload>({ name: '', minPoints: 0, discountPercent: 0, description: '' })
  
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    loading: boolean;
    onConfirm: () => void;
    onClose: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: '',
    cancelLabel: '',
    loading: false,
    onConfirm: () => {},
    onClose: () => {}
  })

  const loadTiers = async () => {
    try {
      setLoading(true)
      const data = await getMembershipTiers()
      setTiers(data)
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách hạng thẻ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTiers()
  }, [])

  const handleOpenDialog = (tier?: MembershipTier) => {
    if (tier) {
      setEditingTier(tier)
      setFormData({ name: tier.name, minPoints: tier.minPoints, discountPercent: tier.discountPercent, description: tier.description || '' })
    } else {
      setEditingTier(null)
      setFormData({ name: '', minPoints: 0, discountPercent: 0, description: '' })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name) return alert('Vui lòng nhập tên hạng thẻ')
    try {
      if (editingTier) {
        await updateMembershipTier(editingTier.id, formData)
      } else {
        await createMembershipTier(formData)
      }
      setIsDialogOpen(false)
      loadTiers()
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Xóa hạng thẻ',
      description: 'Bạn có chắc chắn muốn xóa hạng thẻ này? (Sẽ không thể xóa nếu đang có khách hàng thuộc hạng này)',
      confirmLabel: 'Xóa',
      cancelLabel: 'Hủy',
      loading: false,
      onConfirm: async () => {
        try {
          setDeleteConfirm(prev => ({ ...prev, loading: true }))
          await deleteMembershipTier(id)
          setDeleteConfirm(prev => ({ ...prev, isOpen: false }))
          loadTiers()
        } catch (err: any) {
          alert(err.message || 'Có lỗi xảy ra')
        } finally {
          setDeleteConfirm(prev => ({ ...prev, loading: false }))
        }
      },
      onClose: () => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))
    })
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.04em]">Hạng thành viên</h2>
          <p className="text-sm text-muted">Quản lý các hạng thẻ và điều kiện xét hạng</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-coffee px-5 text-sm font-semibold text-white transition hover:bg-coffee/90 shadow-soft"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm hạng thẻ</span>
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm font-medium text-[#c25a5a]">{error}</div>
        ) : (
          <DataTable
            data={tiers}
            colSpan={5}
            emptyMessage="Chưa có cấu hình hạng thẻ nào."
            renderHeader={() => (
              <tr>
                <th className="px-5 py-4 font-semibold text-left">Tên hạng</th>
                <th className="px-5 py-4 font-semibold text-right">Điểm tối thiểu</th>
                <th className="px-5 py-4 font-semibold text-right">Giảm giá (%)</th>
                <th className="px-5 py-4 font-semibold text-left">Mô tả</th>
                <th className="px-5 py-4 font-semibold text-right w-[100px]">Thao tác</th>
              </tr>
            )}
            renderRow={(tier) => (
              <tr key={tier.id} className="border-t border-line transition hover:bg-cream/50">
                <td className="px-5 py-4 font-semibold text-coffee">{tier.name}</td>
                <td className="px-5 py-4 text-right">{tier.minPoints.toLocaleString()}</td>
                <td className="px-5 py-4 text-right text-[#d99a4b] font-semibold">{tier.discountPercent}%</td>
                <td className="px-5 py-4 text-sm text-muted">{tier.description || '-'}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenDialog(tier)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-cream text-coffee hover:bg-coffee hover:text-white transition"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tier.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-cream text-[#c25a5a] hover:bg-[#c25a5a] hover:text-white transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Sửa hạng thành viên' : 'Thêm hạng thành viên'}</DialogTitle>
            <DialogDescription>Thiết lập tên hạng, số điểm cần đạt và mức giảm giá ưu đãi.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-coffee">Tên hạng thẻ <span className="text-[#c25a5a]">*</span></label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: VIP, Gold..."
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-coffee"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-coffee">Điểm tối thiểu</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minPoints}
                  onChange={e => setFormData({ ...formData, minPoints: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-coffee"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-coffee">Giảm giá (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercent}
                  onChange={e => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-coffee"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-coffee">Mô tả (Tùy chọn)</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Quyền lợi chi tiết..."
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-coffee min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="h-10 rounded-lg px-5 text-sm font-semibold text-muted hover:bg-cream"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="h-10 rounded-lg bg-coffee px-5 text-sm font-semibold text-white hover:bg-coffee/90"
            >
              Lưu thay đổi
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        description={deleteConfirm.description}
        confirmLabel={deleteConfirm.confirmLabel}
        cancelLabel={deleteConfirm.cancelLabel}
        loading={deleteConfirm.loading}
        onConfirm={deleteConfirm.onConfirm}
        onClose={deleteConfirm.onClose}
      />
    </section>
  )
}
