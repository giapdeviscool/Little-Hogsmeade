import type { FormEvent } from 'react'
import { Navigation } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { LandingInput } from './LandingSharedUI'
import type { BookingDraft } from '../landing.types'

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
          {/* <p className="mt-7 flex items-center gap-2 text-sm font-bold text-gold">
            <Star className="h-4 w-4" />
            4.9 / 5 · 1,284 đánh giá
          </p> */}
        </div>
        <Card className="rounded-[18px] border border-line bg-cream p-7 shadow-soft">
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
        </Card>
      </div>
    </section>
  )
}
