import type { BranchWithDistance } from './useBranches'
import { Card } from '../../components/ui/Card'
import { MapPin, Phone, Mail, Navigation } from 'lucide-react'

export function BranchCard({ branch }: { branch: BranchWithDistance }) {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`

  return (
    <Card className="flex h-full flex-col rounded-[18px] border border-line bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-hover">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[18px] font-bold leading-tight text-coffee">{branch.name}</h3>
          {branch.distanceKm != null && (
            <span className="shrink-0 rounded-full bg-cream px-3 py-1 text-xs font-bold text-coffee">
              {branch.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2.5 text-sm text-muted">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span>{branch.address}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 shrink-0 text-gold" />
            <a href={`tel:${branch.phone}`} className="font-semibold text-coffee hover:underline">
              {branch.phone}
            </a>
          </div>
          {branch.email && (
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${branch.email}`} className="font-semibold text-coffee hover:underline">
                {branch.email}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-2.5 text-xs font-bold text-white transition hover:bg-opacity-90"
        >
          <Navigation className="h-3.5 w-3.5" />
          Mở Google Maps
        </a>
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-xs font-bold text-coffee transition hover:border-coffee hover:text-coffee"
        >
          Xem chi tiết
        </a>
      </div>
    </Card>
  )
}