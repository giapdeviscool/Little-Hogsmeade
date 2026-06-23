import { useEffect, useState, type FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Edit3, Plus, Search, Trash2, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../hooks/useLocale'
import { CmsEditorModal } from './CmsEditorModal'
import {
  createPromotion,
  getPromotions,
} from '../../api/chain.api'
import { getBranches } from '../../api/chain.api'
import { httpClient } from '../../api/httpClient'
import type { Promotion, PromotionPayload, Branch, ApiResponse } from '../../types'
import { formatVnDate } from '../../utils/date'
import { Card } from '../../components/ui/Card'
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
  const { t } = useLocale()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [promoRes, branchRes] = await Promise.all([
          getPromotions({
            page,
            limit: 20,
            search: debouncedSearch,
            status: statusFilter
          }),
          getBranches()
        ])
        if (!alive) return
        if (promoRes.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setPromotions((promoRes.data as any).items || promoRes.data)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pag = (promoRes.data as any).pagination
          setTotalPages(pag?.totalPages || 1)
          setTotal(pag?.total || 0)
        }
        setBranches(branchRes.data?.items || [])
      } catch (loadError) {
        if (!alive) return
        setError(loadError instanceof Error ? loadError.message : t.cms.promotions.loadError)
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => { alive = false }
  }, [page, debouncedSearch, statusFilter])

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 10000)
      return () => clearTimeout(timer)
    }
  }, [notice])

  function startCreate() {
    setEditingPromotion(null)
    setEditorOpen(true)
  }

  function startEdit(promo: Promotion) {
    setEditingPromotion(promo)
    setEditorOpen(true)
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t.cms.promotions.deleteConfirm)) return
    try {
      await deletePromotion(id)
      setPromotions((current) => current.filter((item) => item.id !== id))
      setNotice({ type: 'success', message: t.cms.promotions.deleteSuccess })
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : t.cms.promotions.deleteError })
    }
  }

  async function handleSave(payload: PromotionPayload, id?: string) {
    const response = id ? await updatePromotion(id, payload) : await createPromotion(payload)
    const saved = response.data
    if (saved) {
      setPromotions((current) => {
        const next = current.filter((item) => item.id !== saved.id)
        return [saved, ...next].slice(0, 20)
      })
    }
    setNotice({ type: 'success', message: id ? t.cms.promotions.updateSuccess : t.cms.promotions.createSuccess })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Promotions</p>
            <h2 className="mt-1 text-[24px] font-bold">{t.cms.promotions.pageTitle}</h2>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-opacity-90">
            <Plus className="h-4 w-4" />
            {t.cms.promotions.createCampaign}
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.cms.promotions.searchPlaceholder} className="h-12 w-full rounded-[14px] border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-coffee" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none">
            <option value="all">{t.common.allStatus}</option>
            <option value="active">{t.common.active}</option>
            <option value="inactive">{t.common.inactive}</option>
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
      ) : promotions.length === 0 ? (
        <Card className="p-6">
           <div className="grid place-items-center rounded-[18px] border border-dashed border-latte bg-cream px-6 py-10 text-center">
            <p className="text-base font-semibold text-coffee">{t.cms.promotions.noPromotions}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{t.cms.promotions.noPromotionsDesc}</p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream text-muted">
                <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t.cms.promotions.tableHeaders.campaign}</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t.cms.promotions.tableHeaders.status}</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t.cms.promotions.tableHeaders.discount}</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t.cms.promotions.tableHeaders.period}</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">{t.cms.promotions.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="transition-colors hover:bg-beige/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-coffee">{promo.name}</div>
                      {promo.description && <div className="mt-1 text-xs text-muted max-w-[200px] truncate">{promo.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', promo.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800')}>
                        {promo.isActive ? t.cms.promotions.statusActive : t.cms.promotions.statusInactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gold">
                      {promo.discountType === 'percent' ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()}đ`}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      <div>{t.cms.promotions.periodFrom} {promo.startDate ? formatVnDate(promo.startDate) : ''}</div>
                      <div>{t.cms.promotions.periodTo} {promo.endDate ? formatVnDate(promo.endDate) : ''}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <button type="button" onClick={() => startEdit(promo)} className="p-2 text-coffee hover:bg-cream rounded-full transition-colors" title={t.cms.promotions.editTitle}>
                          <Edit3 className="h-4 w-4" />
                        </button>
                         <button type="button" onClick={() => handleDelete(promo.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title={t.cms.promotions.deleteTitle}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && (
        <PromotionPaginationBar page={page} totalPages={totalPages} total={total} onPageChange={setPage} t={t} />
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
  const { t } = useLocale()
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
      title={promotion ? t.cms.promotions.editorTitleEdit : t.cms.promotions.editorTitleCreate}
      description={t.cms.promotions.editorDescription}
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
          <span>{t.cms.promotions.labelName}</span>
          <input value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee" />
        </label>
        
        <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
          <span>{t.cms.promotions.labelDescription}</span>
          <textarea value={draft.description || ''} onChange={(e) => updateDraft('description', e.target.value)} rows={2} className="rounded-[14px] border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-coffee" />
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>{t.cms.promotions.labelStartDate}</span>
            <input type="date" value={draft.startDate} onChange={(e) => updateDraft('startDate', e.target.value)} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>{t.cms.promotions.labelEndDate}</span>
            <input type="date" value={draft.endDate} onChange={(e) => updateDraft('endDate', e.target.value)} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee" />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>{t.cms.promotions.labelDiscountValue}</span>
            <input type="number" min={0} value={draft.discountValue} onChange={(e) => updateDraft('discountValue', Number(e.target.value))} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>{t.cms.promotions.labelDiscountType}</span>
            <select value={draft.discountType} onChange={(e) => updateDraft('discountType', e.target.value as any)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee">
              <option value="percent">{t.cms.promotions.discountTypePercent}</option>
              <option value="fixed">{t.cms.promotions.discountTypeFixed}</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>{t.cms.promotions.labelScope}</span>
            <select value={draft.scope} onChange={(e) => updateDraft('scope', e.target.value as any)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee">
              <option value="global">{t.cms.promotions.scopeGlobal}</option>
              <option value="specific">{t.cms.promotions.scopeSpecific}</option>
            </select>
          </label>
          
          {draft.scope === 'specific' && (
            <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
              <span>{t.cms.promotions.labelBranch}</span>
              <select value={draft.appliedBranches[0] || ''} onChange={(e) => updateDraft('appliedBranches', e.target.value ? [e.target.value] : [])} required className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-coffee">
                <option value="">{t.cms.promotions.labelBranchSelect}</option>
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
            <span>{t.cms.promotions.labelActive}</span>
          </div>
        </label>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-line mt-2">
          <button type="button" onClick={handleClose} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee hover:bg-cream">
            {t.common.cancel}
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-opacity-90 disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {promotion ? t.common.saveChanges : t.cms.promotions.createCampaign}
          </button>
        </div>
      </form>
    </CmsEditorModal>
  )
}

function PromotionPaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
  t,
}: {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  t: ReturnType<typeof useLocale>['t']
}) {
  // Build page number array with ellipsis
  const pages: (number | '...')[] = []
  const maxVisible = 5
  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    if (start > 2) pages.push('...')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted">
        {t.cms.promotions.paginationTotal} <span className="font-semibold text-coffee">{total}</span> {t.common.promotions} · {t.cms.promotions.paginationOf} <span className="font-semibold text-coffee">{page}</span>/{totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-coffee transition hover:bg-cream disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-1 text-sm text-muted">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                'inline-flex h-9 min-w-[36px] items-center justify-center rounded-full border text-sm font-semibold transition',
                p === page
                  ? 'border-coffee bg-coffee text-white shadow-soft'
                  : 'border-line bg-white text-coffee hover:bg-cream',
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-coffee transition hover:bg-cream disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
