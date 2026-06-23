import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, Edit3, Trash2, Eye } from 'lucide-react'
import { listEvents, deleteEvent, createEvent, updateEvent } from '../../../api/cms.api'
import { getBranches } from '../../../api/chain.api'
import type { Event, EventPayload, Branch } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { Pagination } from '../../../components/ui/Pagination'
import { formatVnDate, formatVnTime, formatVnDateTime } from '../../../utils/date'
import { useLocale } from '../../../hooks/useLocale'
import type { NoticeState } from './cms.types'
import { normalizeList } from './cms.utils'
import { StateShell, InlineNotice, StatusPill, InfoRow } from './CmsSharedUI'
import { EventEditorDialog } from './EventEditorDialog'
import { EventDetailDialog } from './EventDetailDialog'

export function EventsPanel() {
  const { t } = useLocale()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    void getBranches().then((res) => setBranches(normalizeList<Branch>(res.data))).catch(() => {})
  }, [])

  const fetchEvents = useCallback(async (currentPage: number, currentSearch: string, currentStatus: string) => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: 4 }
      if (currentSearch.trim()) params.search = currentSearch.trim()
      if (currentStatus !== 'all') params.status = currentStatus
      const response = await listEvents(params)
      const paginated = response.data
      if (paginated && typeof paginated === 'object' && 'items' in paginated) {
        setEvents((paginated as { items: Event[] }).items)
        const pag = (paginated as { pagination: { page: number; limit: number; total: number; totalPages: number } }).pagination
        setTotalPages(pag.totalPages)
        setTotal(pag.total)
      } else {
        setEvents(normalizeList<Event>(response.data))
        setTotalPages(1)
        setTotal(0)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t.cms.events.loadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    void fetchEvents(page, debouncedSearch, statusFilter)
  }, [page, debouncedSearch, statusFilter, fetchEvents])

  function startCreate() {
    setEditingEvent(null)
    setEditorOpen(true)
  }

  function startEdit(event: Event) {
    setEditingEvent(event)
    setEditorOpen(true)
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t.cms.events.deleteConfirm)) return
    try {
      await deleteEvent(id)
      setNotice({ type: 'success', message: t.cms.events.deleteSuccess })
      void fetchEvents(page, debouncedSearch, statusFilter)
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : t.cms.events.deleteError })
    }
  }

  async function handleSave(payload: EventPayload, id?: string) {
    const response = id ? await updateEvent(id, payload) : await createEvent(payload)
    const saved = response.data
    if (saved) {
      setEvents((current) => {
        const next = current.filter((item) => item.id !== saved.id)
        return [saved, ...next]
      })
    }
    setNotice({ type: 'success', message: id ? t.cms.events.updateSuccess : t.cms.events.createSuccess })
    void fetchEvents(page, debouncedSearch, statusFilter)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Events</p>
            <h2 className="mt-1 text-[24px] font-bold">{t.cms.events.pageTitle}</h2>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft">
            <Plus className="h-4 w-4" />
            {t.cms.events.newEvent}
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.cms.events.searchPlaceholder} className="h-12 w-full rounded-[14px] border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-latte" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none">
            <option value="all">{t.common.allStatus}</option>
            <option value="published">{t.common.published}</option>
            <option value="draft">{t.common.draft}</option>
          </select>
        </div>
      </Card>

      {notice && <InlineNotice notice={notice} />}
      <StateShell loading={loading} error={error} empty={events.length === 0 && !loading} title={t.cms.events.noEvents} description={t.cms.events.noEventsDesc} />

      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <article key={event.id} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft">
            <div className="relative aspect-video bg-beige">
              <img src={event.thumbnailUrl} alt={event.title} className="h-full w-full object-cover" />
              <div className="absolute left-4 top-4 flex gap-2">
                <StatusPill active={event.isPublished} />
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-coffee">
                  {formatVnDate(event.eventDate)}
                </span>
              </div>
            </div>
            <div className="border-b border-line p-5">
              <h3 className="text-[20px] font-bold">{event.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{event.description}</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid gap-3 text-sm text-muted lg:grid-cols-2">
                <InfoRow label="Khung giờ" value={`${formatVnTime(event.startTime)} - ${formatVnTime(event.endTime)}`} />
                <InfoRow label="Địa điểm" value={event.locationNote} />
                <InfoRow label="Cập nhật" value={formatVnDateTime(event.updatedAt ?? event.createdAt)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setViewingEvent(event)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                   <Eye className="h-4 w-4" />
                   {t.cms.events.view}
                </button>
                <button type="button" onClick={() => startEdit(event)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                   <Edit3 className="h-4 w-4" />
                   {t.common.edit}
                </button>
                <button type="button" onClick={() => handleDelete(event.id)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-red-700">
                   <Trash2 className="h-4 w-4" />
                   {t.common.delete}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

        {!loading && totalPages > 0 && (
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} label={t.common.events} />
        )}

      {viewingEvent && (
        <EventDetailDialog
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onEdit={() => {
            setViewingEvent(null)
            startEdit(viewingEvent)
          }}
        />
      )}

      {editorOpen && (
        <EventEditorDialog
          event={editingEvent}
          branches={branches}
          onClose={() => setEditorOpen(false)}
          onSave={async (payload) => {
            await handleSave(payload, editingEvent?.id)
            setEditorOpen(false)
          }}
        />
      )}
    </div>
  )
}
