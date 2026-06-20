import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Edit3, Plus, Search, Trash2, Loader2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { CmsEditorModal } from './CmsEditorModal'
import {
  createPromotion,
  deletePromotion,
  listPromotions,
  updatePromotion,
} from '../../api/cms.api'
import type { Promotion, PromotionPayload } from '../../types/cms.types'
import { formatVnDate } from '../../utils/date'
import { cn } from '../../utils/cn'

type NoticeState = { type: 'success' | 'error'; message: string }

const emptyPromotionDraft: PromotionPayload = {
  name: '',
  description: '',
  discountInfo: '',
  applicableProducts: [],
  startDate: '',
  endDate: '',
  status: 'draft',
}

function normalizeList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const items = (value as { items?: unknown }).items
    if (Array.isArray(items)) return items as T[]
  }
  return []
}

export function PromotionsPanel() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await listPromotions()
        if (!alive) return
        setPromotions(normalizeList<Promotion>(response.data))
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

  const filteredPromotions = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return promotions
      .filter((promo) => {
        const matchesKeyword = !keyword || [promo.name, promo.description, promo.discountInfo].some((value) => value.toLowerCase().includes(keyword))
        const matchesStatus = statusFilter === 'all' || promo.status === statusFilter
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
            <h2 className="mt-1 text-[24px] font-bold">Quản lý Khuyến mãi</h2>
            <p className="mt-2 text-sm text-muted">Lưu ngày giờ theo ISO string, lọc theo trạng thái và sắp xếp theo ngày.</p>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft">
            <Plus className="h-4 w-4" />
            New Promotion
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, mô tả..." className="h-12 w-full rounded-[14px] border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-latte" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
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
            <article key={promo.id} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft">
              <div className="space-y-4 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[20px] font-semibold">{promo.name}</h3>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', promo.status === 'active' ? 'bg-emerald-100 text-emerald-700' : promo.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-beige text-muted')}>
                        {promo.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{promo.description}</p>
                    <p className="mt-2 text-sm font-semibold text-gold">{promo.discountInfo}</p>
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
                  <button type="button" onClick={() => startEdit(promo)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                    <Edit3 className="h-4 w-4" />
                    Sửa
                  </button>
                  <button type="button" onClick={() => handleDelete(promo.id)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-red-700">
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
  onClose,
  onSave,
}: {
  promotion: Promotion | null
  onClose: () => void
  onSave: (payload: PromotionPayload) => Promise<void>
}) {
  const [draft, setDraft] = useState<PromotionPayload>(
    promotion
      ? {
          name: promotion.name,
          description: promotion.description,
          discountInfo: promotion.discountInfo,
          applicableProducts: promotion.applicableProducts,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          status: promotion.status,
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
        description: draft.description.trim(),
        discountInfo: draft.discountInfo.trim(),
        applicableProducts: draft.applicableProducts.map((p) => p.trim()).filter(Boolean),
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
      title={promotion ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
      description="Quản lý chi tiết khuyến mãi."
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
          <span>Tên khuyến mãi</span>
          <input value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte" />
        </label>
        
        <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
          <span>Mô tả</span>
          <textarea value={draft.description} onChange={(e) => updateDraft('description', e.target.value)} rows={3} className="rounded-[14px] border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-latte" />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
          <span>Thông tin giảm giá</span>
          <input value={draft.discountInfo} onChange={(e) => updateDraft('discountInfo', e.target.value)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte" />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
          <span>Sản phẩm áp dụng (cách nhau bởi dấu phẩy)</span>
          <input value={draft.applicableProducts.join(', ')} onChange={(e) => updateDraft('applicableProducts', e.target.value.split(','))} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte" />
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>Ngày bắt đầu</span>
            <input type="date" value={draft.startDate} onChange={(e) => updateDraft('startDate', e.target.value)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>Ngày kết thúc</span>
            <input type="date" value={draft.endDate} onChange={(e) => updateDraft('endDate', e.target.value)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte" />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
          <span>Trạng thái</span>
          <select value={draft.status} onChange={(e) => updateDraft('status', e.target.value as any)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={handleClose} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee">
            Hủy
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {promotion ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}
          </button>
        </div>
      </form>
    </CmsEditorModal>
  )
}
