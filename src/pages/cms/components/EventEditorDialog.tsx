import { useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { CmsEditorModal } from '../CmsEditorModal'
import { uploadImage } from '../../../api/cms.api'
import type { Event, EventPayload, Branch } from '../../../types'
import type { NoticeState } from './cms.types'
import { emptyEventDraft } from './cms.constants'
import { TextField, ImageField, ToggleField, InlineNotice } from './CmsSharedUI'
import { RichTextEditor } from './RichTextEditor'

export function EventEditorDialog({
  event,
  branches,
  onClose,
  onSave,
}: {
  event: Event | null
  branches: Branch[]
  onClose: () => void
  onSave: (payload: EventPayload) => Promise<void>
}) {
  const [draft, setDraft] = useState<EventPayload>(
    event
      ? {
        title: event.title,
        branchId: event.branchId,
        description: event.description,
        thumbnailUrl: event.thumbnailUrl,
        eventDate: event.eventDate.split('T')[0],
        startTime: event.startTime.includes('T') ? event.startTime.split('T')[1].slice(0, 5) : event.startTime,
        endTime: event.endTime.includes('T') ? event.endTime.split('T')[1].slice(0, 5) : event.endTime,
        locationNote: event.locationNote,
        ticketPrice: event.ticketPrice,
        isPublished: event.isPublished,
      }
      : { ...emptyEventDraft },
  )
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [unsaved, setUnsaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function updateDraft<K extends keyof EventPayload>(key: K, value: EventPayload[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setUnsaved(true)
  }

  async function handleUpload(file: File) {
    setSaving(true)
    setNotice(null)
    try {
      const response = await uploadImage(file, 'events')
      updateDraft('thumbnailUrl', response.data.secure_url)
      setNotice({ type: 'success', message: 'Ảnh sự kiện đã được tải lên.' })
    } catch (uploadError) {
      setNotice({ type: 'error', message: uploadError instanceof Error ? uploadError.message : 'Không tải được ảnh.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        branchId: draft.branchId,
        description: draft.description.trim(),
        locationNote: draft.locationNote.trim(),
        thumbnailUrl: draft.thumbnailUrl.trim(),
        eventDate: new Date(draft.eventDate).toISOString(),
        startTime: new Date(`${draft.eventDate}T${draft.startTime}:00.000Z`).toISOString(),
        endTime: new Date(`${draft.eventDate}T${draft.endTime}:00.000Z`).toISOString(),
      })
      setUnsaved(false)
    } catch (saveError) {
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : 'Không lưu được sự kiện.' })
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
      title={event ? 'Sửa sự kiện' : 'Tạo sự kiện mới'}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      {notice && <InlineNotice notice={notice} />}
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="Tiêu đề" value={draft.title} onChange={(value) => updateDraft('title', value)} required />
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>Chi nhánh tổ chức</span>
            <select
              value={draft.branchId}
              onChange={(e) => updateDraft('branchId', e.target.value)}
              required
              className="h-12 w-full appearance-none rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="" disabled>Chọn chi nhánh</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
        </div>
        <RichTextEditor label="Mô tả" value={draft.description} onChange={(value) => updateDraft('description', value)} />
        <ImageField label="Thumbnail" value={draft.thumbnailUrl} onChange={(value) => updateDraft('thumbnailUrl', value)} onUpload={handleUpload} fileRef={fileRef} />
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="Ngày diễn ra" type="date" value={draft.eventDate} onChange={(value) => updateDraft('eventDate', value)} />
          <TextField label="Start time" type="time" value={draft.startTime} onChange={(value) => updateDraft('startTime', value)} />
          <TextField label="End time" type="time" value={draft.endTime} onChange={(value) => updateDraft('endTime', value)} />
        </div>
        <TextField label="Location note" value={draft.locationNote} onChange={(value) => updateDraft('locationNote', value)} />
        <ToggleField label="Published" checked={draft.isPublished} onChange={(checked) => updateDraft('isPublished', checked)} />
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={handleClose} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee">
            Hủy
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {event ? 'Lưu thay đổi' : 'Tạo sự kiện'}
          </button>
        </div>
      </form>
    </CmsEditorModal>
  )
}
