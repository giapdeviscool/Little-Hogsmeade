import { useState, type FormEvent } from 'react'
import { Navigation, Search, CalendarClock } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { LandingInput } from './LandingSharedUI'
import type { BookingDraft } from '../landing.types'
import { lookupReservationByPhone } from '../../../api/reservation.api'
import { formatVnDate, formatVnTime } from '../../../utils/date'
import { cn } from '../../../utils/cn'

import type { Reservation } from '../../../types/reservation.types'

export function BookingSection({
  draft,
  setDraft,
  onSubmit,
  notice,
  branches,
  onDetectLocation,
  locationNotice,
}: {
  draft: BookingDraft
  setDraft: (value: BookingDraft) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  notice: string | null
  branches: Array<{ id: string; name: string; address: string; distanceKm: number | null }>
  onDetectLocation: () => void
  locationNotice: string | null
}) {
  const [activeMode, setActiveMode] = useState<'booking' | 'lookup'>('booking')
  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResults, setLookupResults] = useState<Reservation[]>([])
  const [lookupNotice, setLookupNotice] = useState<string | null>(null)

  async function handleLookup(e: FormEvent) {
    e.preventDefault()
    if (!lookupPhone) return
    setLookupLoading(true)
    setLookupNotice(null)
    setLookupResults([])
    
    try {
      const res = await lookupReservationByPhone(lookupPhone)
      if (res.data && res.data.length > 0) {
        setLookupResults(res.data)
      } else {
        setLookupNotice('Không tìm thấy thông tin đặt bàn cho số điện thoại này.')
      }
    } catch {
      setLookupNotice('Có lỗi xảy ra khi tra cứu. Vui lòng thử lại.')
    } finally {
      setLookupLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận'
      case 'confirmed': return 'Đã xác nhận'
      case 'reserved': return 'Đã xếp bàn'
      case 'checked_in': return 'Đã đến'
      case 'completed': return 'Hoàn thành'
      case 'cancelled': return 'Đã hủy'
      case 'no_show': return 'Không đến'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': case 'reserved': return 'bg-blue-100 text-blue-800'
      case 'checked_in': case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': case 'no_show': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <section id="landing-booking" className="bg-white py-20 md:py-24">
      <div className="mx-auto grid max-w-[980px] gap-12 px-4 md:px-8 lg:grid-cols-[1fr_425px] lg:items-center lg:gap-24 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Đặt bàn / Order</p>
          <h2 className="mt-4 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[46px]">
            Giữ chỗ cho buổi hẹn không thể quên của bạn
          </h2>
          <p className="mt-6 text-[15px] leading-7 text-coffee/85">
            Nâng tầm trải nghiệm ẩm thực của bạn với dịch vụ đặt bàn trước, giúp mọi khoảnh khắc trở nên trọn vẹn hơn.
          </p>
        </div>
        <Card className="rounded-[18px] border border-line bg-cream p-7 shadow-soft">
          <div className="flex mb-6 rounded-lg border border-line bg-white p-1">
            <button
              onClick={() => setActiveMode('booking')}
              className={cn("flex-1 rounded-md py-2 text-sm font-bold transition", activeMode === 'booking' ? "bg-coffee text-white shadow-sm" : "text-muted hover:text-coffee")}
            >
              Đặt bàn mới
            </button>
            <button
              onClick={() => setActiveMode('lookup')}
              className={cn("flex-1 rounded-md py-2 text-sm font-bold transition", activeMode === 'lookup' ? "bg-coffee text-white shadow-sm" : "text-muted hover:text-coffee")}
            >
              Tra cứu trạng thái
            </button>
          </div>

          {activeMode === 'booking' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-xl font-bold">Thông tin đặt bàn</h3>
              {notice && (
                <div className="mt-4 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {notice}
                </div>
              )}

              {!draft.branchId ? (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Chọn cửa hàng bạn muốn đặt bàn <span className="text-red-500">*</span></p>
                    <button type="button" onClick={onDetectLocation} className="flex items-center rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-coffee hover:bg-beige transition">
                      <Navigation className="mr-1.5 h-3.5 w-3.5" /> Tìm cửa hàng gần nhất
                    </button>
                  </div>
                  {locationNotice && <p className="mb-4 text-xs italic text-muted">{locationNotice}</p>}
                  <div className="grid max-h-[360px] gap-3 overflow-y-auto">
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setDraft({ ...draft, branchId: b.id })}
                        className="flex w-full flex-col gap-2 rounded-[14px] border border-line bg-white p-4 text-left transition hover:border-coffee"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-[15px] leading-snug">{b.name}</strong>
                          {b.distanceKm !== null && (
                            <span className="shrink-0 rounded-full bg-cream px-2 py-1 text-[10px] font-bold text-coffee">{b.distanceKm.toFixed(1)} km</span>
                          )}
                        </div>
                        <p className="text-xs leading-5 text-muted">{b.address}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="mb-5 flex items-center justify-between rounded-[14px] border border-emerald-200 bg-emerald-50 p-4">
                    <div>
                      <p className="text-xs text-emerald-700">Chi nhánh đã chọn:</p>
                      <strong className="text-sm text-emerald-900">{branches.find((b) => b.id === draft.branchId)?.name}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, branchId: '' })}
                      className="text-xs font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                    >
                      Đổi
                    </button>
                  </div>

                  <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <LandingInput label="Họ và tên" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} placeholder="Trần Mai Anh" />
                    <LandingInput label="Số điện thoại" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} placeholder="0912 345 678" />
                    <div className="grid grid-cols-2 gap-3">
                      <LandingInput label="Ngày giờ" value={draft.datetime} onChange={(value) => setDraft({ ...draft, datetime: value })} placeholder="2026-06-20T19:30" type="datetime-local" />
                      <LandingInput label="Số lượng khách" value={draft.guests} onChange={(value) => setDraft({ ...draft, guests: value })} placeholder="4" />
                    </div>
                    <LandingInput label="Ghi chú" value={draft.note} onChange={(value) => setDraft({ ...draft, note: value })} placeholder="Sinh nhật, ghế trẻ em..." />
                    <button type="submit" className="h-12 w-full rounded-[12px] bg-coffee text-sm font-bold text-white">
                      Xác nhận đặt bàn
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-xl font-bold mb-4">Tra cứu trạng thái</h3>
              <form onSubmit={handleLookup} className="flex gap-2 mb-6">
                <input
                  type="tel"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  placeholder="Nhập số điện thoại đã đặt..."
                  className="flex-1 rounded-[12px] border border-line px-4 text-sm outline-none focus:border-coffee"
                />
                <button type="submit" disabled={lookupLoading || !lookupPhone} className="flex h-12 w-14 items-center justify-center rounded-[12px] bg-coffee text-white disabled:opacity-50">
                  <Search className="h-5 w-5" />
                </button>
              </form>

              {lookupNotice && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {lookupNotice}
                </div>
              )}

              {lookupResults.length > 0 && (
                <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {lookupResults.map(res => (
                    <div key={res.id} className="rounded-[14px] border border-line bg-white p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-coffee text-sm">{res.branch?.name}</h4>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold", getStatusColor(res.status))}>
                          {getStatusText(res.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted mb-1">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatVnDate(res.reservedDate)} - {formatVnTime(res.reservedTime)}</span>
                      </div>
                      <p className="text-xs text-coffee mt-2 font-semibold">Tên khách: {res.guestName} • {res.guestCount} người</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
