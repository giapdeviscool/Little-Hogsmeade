import { useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { CmsEditorModal } from '../CmsEditorModal'
import { uploadImage } from '../../../api/cms.api'
import { useLocale } from '../../../hooks/useLocale'
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
  const { t } = useLocale()
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
      if (response.data) {
        updateDraft('thumbnailUrl', response.data.secure_url)
      }
      setNotice({ type: 'success', message: t.cms.events.uploadSuccess })
    } catch (uploadError) {
      setNotice({ type: 'error', message: uploadError instanceof Error ? uploadError.message : t.common.uploadError })
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
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : t.cms.events.saveError })
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (unsaved && !window.confirm(t.common.unsavedChanges)) return
    onClose()
  }

  return (
    <CmsEditorModal
      open
      title={event ? t.cms.events.editorTitleEdit : t.cms.events.editorTitleCreate}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      {notice && <InlineNotice notice={notice} />}
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label={t.cms.events.labelTitle} value={draft.title} onChange={(value) => updateDraft('title', value)} required />
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>{t.cms.events.labelBranch}</span>
            <select
              value={draft.branchId}
              onChange={(e) => updateDraft('branchId', e.target.value)}
              required
              className="h-12 w-full appearance-none rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="" disabled>{t.cms.events.labelBranchSelect}</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
        </div>
        <RichTextEditor label={t.cms.events.labelDescription} value={draft.description} onChange={(value) => updateDraft('description', value)} />
        <ImageField label={t.cms.events.labelThumbnail} value={draft.thumbnailUrl} onChange={(value) => updateDraft('thumbnailUrl', value)} onUpload={handleUpload} fileRef={fileRef} />
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label={t.cms.events.labelEventDate} type="date" value={draft.eventDate} onChange={(value) => updateDraft('eventDate', value)} />
          <TextField label={t.cms.events.labelStartTime} type="time" value={draft.startTime} onChange={(value) => updateDraft('startTime', value)} />
          <TextField label={t.cms.events.labelEndTime} type="time" value={draft.endTime} onChange={(value) => updateDraft('endTime', value)} />
        </div>
        <TextField label={t.cms.events.labelLocationNote} value={draft.locationNote} onChange={(value) => updateDraft('locationNote', value)} />
        <ToggleField label={t.cms.events.labelPublished} checked={draft.isPublished} onChange={(checked) => updateDraft('isPublished', checked)} />
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={handleClose} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee">
            {t.common.cancel}
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {event ? t.common.saveChanges : t.cms.events.editorTitleCreate}
          </button>
        </div>
      </form>
    </CmsEditorModal>
  )
}
