import { CmsEditorModal } from '../CmsEditorModal'
import { formatVnDate, formatVnTime, formatVnDateTime } from '../../../utils/date'
import { StatusPill, InfoRow } from './CmsSharedUI'
import type { Event } from '../../../types'

export function EventDetailDialog({
  event,
  onClose,
  onEdit,
}: {
  event: Event
  onClose: () => void
  onEdit: () => void
}) {
  return (
    <CmsEditorModal
      open
      title="Chi tiết sự kiện"
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <div className="space-y-6">
        {/* Thumbnail */}
        {event.thumbnailUrl && (
          <div className="overflow-hidden rounded-[18px] border border-line">
            <img
              src={event.thumbnailUrl}
              alt={event.title}
              className="aspect-video w-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[24px] font-bold">{event.title}</h3>
              <StatusPill active={event.isPublished} />
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Ngày diễn ra" value={formatVnDate(event.eventDate)} />
          <InfoRow
            label="Khung giờ"
            value={`${formatVnTime(event.startTime)} – ${formatVnTime(event.endTime)}`}
          />
          <InfoRow label="Địa điểm" value={event.locationNote} />
          <InfoRow label="Cập nhật" value={formatVnDateTime(event.updatedAt ?? event.createdAt)} />
        </div>

        {/* Description */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-gold">Mô tả</p>
          <div
            className="cms-rendered-content rounded-[14px] border border-line bg-cream/50 p-5 text-sm leading-7 text-coffee"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft"
          >
            Sửa sự kiện
          </button>
        </div>
      </div>
    </CmsEditorModal>
  )
}
