import { Dialog, DialogContent } from '../ui/dialog'
import type { Event, Post } from '../../types/cms.types'
import { formatVnDate, formatVnTime } from '../../utils/date'
import { Clock3, MapPin } from 'lucide-react'

export function EventDetailModal({ event, onClose }: { event: Event | null; onClose: () => void }) {
  if (!event) return null

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[700px] overflow-hidden p-0 max-h-[90vh] flex flex-col">
        <div className="relative h-[250px] shrink-0 bg-coffee">
          <img src={event.thumbnailUrl} alt={event.title} className="absolute inset-0 h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-coffee/90 via-coffee/40 to-transparent" />
          <span className="absolute left-6 top-6 rounded-[14px] bg-white px-4 py-2 text-center text-coffee shadow-soft">
            <small className="block text-[11px] font-bold tracking-[0.14em] text-muted">{formatVnDate(event.eventDate)}</small>
          </span>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <small className="text-sm font-bold tracking-[0.1em] text-white/90">
              <Clock3 className="mr-2 inline h-4 w-4" />
              {formatVnTime(event.startTime)} - {formatVnTime(event.endTime)}
            </small>
            <h2 className="mt-2 text-[28px] font-bold leading-tight">{event.title}</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <p className="mb-6 flex items-center text-sm font-semibold text-coffee">
            <MapPin className="mr-2 h-5 w-5" />
            Địa điểm: {event.locationNote || 'Chưa cập nhật'}
          </p>
          <div className="prose prose-sm md:prose-base max-w-none text-muted">
            {event.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-7">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PostDetailModal({ post, onClose }: { post: Post | null; onClose: () => void }) {
  if (!post) return null

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[800px] overflow-hidden p-0 max-h-[90vh] flex flex-col">
        <div className="relative h-[300px] shrink-0 bg-cream">
          <img src={post.thumbnailUrl} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-8 md:left-8 md:right-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">{post.category}</p>
            <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">{post.title}</h2>
            <div className="mt-4 flex items-center gap-4 text-sm font-medium text-white/80">
              <span>{formatVnDate(post.publishedAt ?? post.createdAt)}</span>
              {post.tags && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/50" />
                  <span>{post.tags}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="prose prose-sm md:prose-base max-w-none text-coffee">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-5 leading-8">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
