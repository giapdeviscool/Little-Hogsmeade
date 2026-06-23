import { useState } from 'react'
import { Clock3, MapPin, Eye } from 'lucide-react'
import { formatVnDate, formatVnTime } from '../../../utils/date'
import defaultHeroImage from '../../../assets/image/default.jpg'
import { EventDetailModal } from '../../../components/customer/DetailModals'
import type { Event } from '../../../types'

export function EventSection({ events, className }: { events: Event[]; className?: string }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const items = events.length
    ? events
    : [
      {
        id: 'fallback-1',
        title: 'Đêm Nhạc Acoustic',
        description: 'Đêm acoustic ấm áp cùng ban nhạc khách mời, free welcome drink.',
        thumbnailUrl: defaultHeroImage,
        eventDate: new Date().toISOString(),
        startTime: '20:00',
        endTime: '23:00',
        locationNote: 'Sân khấu tầng trệt',
        ticketPrice: 0,
        isPublished: true,
      } as unknown as Event,
    ]

  return (
    <section id="landing-events" className={className || "border-y border-line bg-white py-20 md:py-24"}>
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
        <p className="text-center text-xs font-bold uppercase tracking-[0.32em] text-gold">Sự kiện</p>
        <h2 className="mx-auto mt-4 max-w-[700px] text-center text-[36px] font-bold leading-[1] tracking-[-0.055em] md:text-[48px]">
          Khoảnh khắc đáng nhớ tại Little Hogsmeade
        </h2>
        <div className="mt-14 grid gap-7 lg:grid-cols-2">
          {items.map((event) => (
            <article key={event.id} className="relative min-h-[380px] overflow-hidden rounded-[22px] bg-coffee group cursor-pointer" onClick={() => setSelectedEvent(event)}>
              <img src={event.thumbnailUrl} alt={event.title} className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-coffee/95 via-coffee/25 to-transparent" />
              <span className="absolute left-6 top-6 rounded-[14px] bg-white px-4 py-3 text-center text-coffee shadow-soft">
                <small className="block text-[11px] tracking-[0.14em] text-muted">{formatVnDate(event.eventDate)}</small>
                <b className="mt-1 block text-[22px]">{event.isPublished ? 'Published' : 'Draft'}</b>
              </span>
              <div className="absolute bottom-7 left-7 max-w-[520px] text-white">
                <small className="text-xs font-bold tracking-[0.1em] text-white/75">
                  <Clock3 className="mr-1 inline h-4 w-4" />
                  {formatVnTime(event.startTime)} - {formatVnTime(event.endTime)}
                </small>
                <h3 className="mt-3 text-[29px] font-bold">{event.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">{event.description}</p>
                <p className="mt-3 text-sm text-white/70">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  {event.locationNote}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30">
                  <Eye className="h-4 w-4" /> Xem chi tiết event
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </section>
  )
}
