import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Edit3, Plus, Search, Trash2, Loader2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { CmsEditorModal } from './CmsEditorModal'
import {
  createPromotion,
  getPromotions,
} from '../../api/chain.api'
import { getBranches } from '../../api/chain.api'
import { httpClient } from '../../api/httpClient'
import type { Promotion, PromotionPayload, Branch, ApiResponse } from '../../types'
import { formatVnDate } from '../../utils/date'
import { cn } from '../../utils/cn'
import { getAuthToken } from '../../store/auth.store'

type NoticeState = { type: 'success' | 'error'; message: string }

const emptyPromotionDraft: PromotionPayload = {
  name: '',
  description: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  discountValue: 0,
  discountType: 'percent',
  scope: 'global',
  appliedBranches: [],
  isActive: true,
}

// These are missing from chain.api.ts so we define them here locally
function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function updatePromotion(id: string, payload: PromotionPayload) {
  return httpClient<ApiResponse<Promotion>>(`/promotions/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

function deletePromotion(id: string) {
  return httpClient<ApiResponse<{ id: string }>>(`/promotions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

export function PromotionsPanel() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [promoRes, branchRes] = await Promise.all([
          getPromotions(),
          getBranches()
        ])
        if (!alive) return
        setPromotions(promoRes.data || [])
        setBranches(branchRes.data?.items || [])
      } catch (loadError) {
        if (!alive) return
        setError(loadError instanceof Error ? loadError.message : 'Không tải được danh sách khuyến mãi.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 10000)
      return () => clearTimeout(timer)
    }
  }, [notice])

  const filteredPromotions = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return promotions
      .filter((promo) => {
        const matchesKeyword = !keyword || [promo.name, promo.description].some((value) => value?.toLowerCase().includes(keyword))
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? promo.isActive : !promo.isActive)
        return matchesKeyword && matchesStatus
      })
      .sort((a, b) => (b.startDate).localeCompare(a.startDate))
  }, [promotions, search, statusFilter])

  function startCreate() {
    setEditingPromotion(null)
    setEditorOpen(true)
  }

  function startEdit(promo: Promotion) {
    setEditingPromotion(promo)
    setEditorOpen(true)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Xóa khuyến mãi này?')) return
    try {
      await deletePromotion(id)
      setPromotions((current) => current.filter((item) => item.id !== id))
      setNotice({ type: 'success', message: 'Đã xóa khuyến mãi.' })
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : 'Không xóa được khuyến mãi.' })
    }
  }

  async function handleSave(payload: PromotionPayload, id?: string) {
    const response = id ? await updatePromotion(id, payload) : await createPromotion(payload)
    const saved = response.data
    setPromotions((current) => {
      const next = current.filter((item) => item.id !== saved.id)
      return [saved, ...next]
    })
    setNotice({ type: 'success', message: id ? 'Đã cập nhật khuyến mãi.' : 'Đã tạo khuyến mãi mới.' })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Promotions</p>
            <h2 className="mt-1 text-[24px] font-bold">Quản lý Khuyến mãi (Chiến dịch)</h2>
            <p className="mt-2 text-sm text-muted">Tạo các chiến dịch giảm giá. Mã giảm giá (Voucher) sẽ được sinh tự động.</p>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-opacity-90">
            <Plus className="h-4 w-4" />
            Tạo Campaign
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, mô tả..." className="h-12 w-full rounded-[14px] border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-coffee" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã tạm dừng</option>
          </select>
        </div>
      </Card>

      {notice && (
        <div className={cn('rounded-[16px] border px-4 py-3 text-sm', notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800')}>
          {notice.message}
        </div>
      )}

      {error && (
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      
      {loading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/3 rounded bg-beige" />
            <div className="h-12 w-full rounded bg-beige" />
            <div className="h-12 w-full rounded bg-beige" />
          </div>
        </Card>
      ) : filteredPromotions.length === 0 ? (
        <Card className="p-6">
           <div className="grid place-items-center rounded-[18px] border border-dashed border-latte bg-cream px-6 py-10 text-center">
            <p className="text-base font-semibold text-coffee">Chưa có khuyến mãi</p>
            <p className="mt-2 text-sm leading-6 text-muted">Tạo khuyến mãi đầu tiên cho khách hàng.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredPromotions.map((promo) => (
            <article key={promo.id} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft transition hover:border-coffee cursor-pointer">
              <div className="space-y-4 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[20px] font-semibold">{promo.name}</h3>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', promo.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{promo.description}</p>
                    <p className="mt-2 text-sm font-semibold text-gold">Giảm: {promo.discountType === 'percent' ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()}đ`}</p>
                  </div>
                </div>
                <div className="grid gap-3 text-sm text-muted lg:grid-cols-2">
                  <div className="rounded-[14px] bg-cream px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Bắt đầu</p>
                    <p className="mt-1 text-sm font-medium text-coffee">{promo.startDate ? formatVnDate(promo.startDate) : ''}</p>
                  </div>
                  <div className="rounded-[14px] bg-cream px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Kết thúc</p>
                    <p className="mt-1 text-sm font-medium text-coffee">{promo.endDate ? formatVnDate(promo.endDate) : ''}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEdit(promo)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee hover:bg-cream">
                    <Edit3 className="h-4 w-4" />
                    Sửa
                  </button>
                  <button type="button" onClick={() => handleDelete(promo.id)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editorOpen && (
        <PromotionEditorDialog
          promotion={editingPromotion}
          branches={branches}
          onClose={() => setEditorOpen(false)}
          onSave={async (payload) => {
            await handleSave(payload, editingPromotion?.id)
            setEditorOpen(false)
          }}
        />
      )}
    </div>
  )
}

function PromotionEditorDialog({
  promotion,
  branches,
  onClose,
  onSave,
}: {
  promotion: Promotion | null
  branches: Branch[]
  onClose: () => void
  onSave: (payload: PromotionPayload) => Promise<void>
}) {
  const [draft, setDraft] = useState<PromotionPayload>(
    promotion
      ? {
          name: promotion.name,
          description: promotion.description || undefined,
          startDate: new Date(promotion.startDate).toISOString().slice(0, 10),
          endDate: new Date(promotion.endDate).toISOString().slice(0, 10),
          discountValue: promotion.discountValue,
          discountType: promotion.discountType,
          scope: promotion.scope,
          appliedBranches: promotion.appliedBranches,
          isActive: promotion.isActive,
        }
      : { ...emptyPromotionDraft },
  )
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [unsaved, setUnsaved] = useState(false)

  function updateDraft<K extends keyof PromotionPayload>(key: K, value: PromotionPayload[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setUnsaved(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...draft,
        name: draft.name.trim(),
        description: draft.description ? draft.description.trim() : undefined,
      })
      setUnsaved(false)
    } catch (saveError) {
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : 'Không lưu được khuyến mãi.' })
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (unsaved && !window.confirm('Bạn có thay đổi chưa lưu. Đóng form mà không lưu?')) return
    onClose()
  }

  return (
    <CmsEditorModal
      open
      title={promotion ? 'Sửa Chiến dịch Khuyến mãi' : 'Tạo Chiến dịch Khuyến mãi mới'}
      description="Chiến dịch (Campaign) giúp tự động sinh mã Voucher cho khách hàng đổi điểm."
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      {notice && (
        <div className={cn('rounded-[16px] border px-4 py-3 text-sm mb-4', notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800')}>
          {notice.message}
        </div>
      )}
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
          <span>Tên chiến dịch</span>
          <input value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee" />
        </label>
        
        <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
          <span>Mô tả (Điều kiện / thông báo)</span>
          <textarea value={draft.description || ''} onChange={(e) => updateDraft('description', e.target.value)} rows={2} className="rounded-[14px] border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-coffee" />
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>Ngày bắt đầu</span>
            <input type="date" value={draft.startDate} onChange={(e) => updateDraft('startDate', e.target.value)} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>Ngày kết thúc</span>
            <input type="date" value={draft.endDate} onChange={(e) => updateDraft('endDate', e.target.value)} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee" />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>Mức giảm giá</span>
            <input type="number" min={0} value={draft.discountValue} onChange={(e) => updateDraft('discountValue', Number(e.target.value))} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>Loại giảm giá</span>
            <select value={draft.discountType} onChange={(e) => updateDraft('discountType', e.target.value as any)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee">
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền mặt (VND)</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>Phạm vi áp dụng</span>
            <select value={draft.scope} onChange={(e) => updateDraft('scope', e.target.value as any)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee">
              <option value="global">Toàn chuỗi</option>
              <option value="specific">Chi nhánh cụ thể</option>
            </select>
          </label>
          
          {draft.scope === 'specific' && (
            <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
              <span>Chi nhánh</span>
              <select value={draft.appliedBranches[0] || ''} onChange={(e) => updateDraft('appliedBranches', e.target.value ? [e.target.value] : [])} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee">
                <option value="">Chọn chi nhánh...</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        <label className="flex flex-col gap-2 text-sm font-semibold text-coffee mt-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={draft.isActive} onChange={(e) => updateDraft('isActive', e.target.checked)} className="h-4 w-4 rounded border-line text-coffee focus:ring-coffee" />
            <span>Kích hoạt Campaign (Khách hàng có thể đổi Voucher)</span>
          </div>
        </label>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-line mt-2">
          <button type="button" onClick={handleClose} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee hover:bg-cream">
            Hủy
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-opacity-90 disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {promotion ? 'Lưu thay đổi' : 'Tạo Campaign'}
          </button>
        </div>
      </form>
    </CmsEditorModal>
  )
}
