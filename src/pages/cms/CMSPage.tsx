import { useState } from 'react'
import { cn } from '../../utils/cn'
import { LandingPage } from '../landing/LandingPage'

const events = [
  {
    title: 'Acoustic Night - Thứ Bảy',
    schedule: 'Thứ 7, 24/05 · 20:00 - 23:00',
    registered: 84,
    capacity: 120,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
    synced: true,
  },
  {
    title: 'Wine Tasting Workshop',
    schedule: 'Thứ 5, 29/05 · 18:30 - 21:00',
    registered: 36,
    capacity: 50,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=85',
    synced: true,
  },
  {
    title: 'Latte Art Masterclass',
    schedule: 'Chủ Nhật, 01/06 · 10:00 - 12:00',
    registered: 22,
    capacity: 30,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85',
    synced: false,
  },
]

export function CMSPage() {
  const [isLandingPreviewOpen, setIsLandingPreviewOpen] = useState(false)
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex rounded-[14px] bg-cream p-1">
          {['Quản lý Khối nội dung (Blocks)', 'Bài viết & Tin tức', 'Quản lý Sự kiện'].map((tab, index) => (
            <button key={tab} type="button" className={cn('rounded-[11px] px-5 py-3 text-sm font-semibold transition', index === 2 ? 'bg-white text-coffee shadow-soft' : 'text-muted')}>
              {tab}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setIsLandingPreviewOpen(true)} className="rounded-[13px] border border-line bg-white px-5 py-3 text-sm font-bold text-coffee transition hover:bg-cream">↗&nbsp; Xem trang Landing</button>
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.035em]">Quản lý Sự kiện</h1>
          <p className="mt-1 text-sm text-muted">Các sự kiện được đồng bộ sẽ tự động hiển thị trên trang chủ</p>
        </div>
        <button type="button" onClick={() => setIsCreateDrawerOpen(true)} className="rounded-[14px] bg-coffee px-5 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgba(74,53,37,0.18)]">＋&nbsp; Tạo sự kiện mới</button>
      </div>

      <section className="mt-7 grid grid-cols-3 gap-5">
        {events.map((event) => {
          const progress = Math.round((event.registered / event.capacity) * 100)
          return (
            <article key={event.title} className="overflow-hidden rounded-[16px] border border-line bg-white shadow-soft">
              <div className="relative h-[254px] overflow-hidden">
                <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-coffee shadow-sm">▣&nbsp; {event.schedule}</span>
                <span className="absolute right-3 top-3 rounded-full bg-beige/95 px-3 py-1.5 text-xs font-semibold text-muted">Sắp diễn ra</span>
              </div>
              <div className="p-5">
                <h2 className="text-[19px] font-bold">{event.title}</h2>
                <div className="mt-4 flex items-center justify-between text-sm text-muted"><span>♧&nbsp; <b className="text-coffee">{event.registered}</b> / {event.capacity} đăng ký</span><span>{progress}%</span></div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-beige"><div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} /></div>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-coffee"><input type="checkbox" defaultChecked={event.synced} className="peer sr-only" /><span className="relative h-5 w-9 rounded-full bg-beige transition peer-checked:bg-coffee after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" /> Đồng bộ lên Landing Page</label>
                  <div className="flex gap-1.5"><button className="grid h-8 w-8 place-items-center rounded-[9px] border border-line text-xs">⊙</button><button className="grid h-8 w-8 place-items-center rounded-[9px] border border-line text-xs">✎</button><button className="grid h-8 w-8 place-items-center rounded-[9px] border border-line text-xs">•••</button></div>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      {isCreateDrawerOpen && <CreateEventDrawer onClose={() => setIsCreateDrawerOpen(false)} />}
      {isLandingPreviewOpen && <LandingPage onClose={() => setIsLandingPreviewOpen(false)} />}
    </>
  )
}

function CreateEventDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-coffee/25" onMouseDown={onClose}>
      <aside className="ml-auto h-full w-[480px] overflow-y-auto bg-white p-7 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">CMS Event</p><h2 className="mt-2 text-[26px] font-bold">Tạo sự kiện mới</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-line text-xl">×</button></div>
        <form className="mt-7 flex flex-col gap-5">
          <DrawerInput label="Tên sự kiện" placeholder="Acoustic Night - Thứ Bảy" />
          <label className="flex flex-col gap-2 text-sm font-bold">Banner sự kiện<div className="grid h-[150px] place-items-center rounded-[14px] border border-dashed border-latte bg-cream text-center text-sm text-muted">＋<br />Tải banner lên</div></label>
          <div className="grid grid-cols-2 gap-3"><DrawerInput label="Ngày diễn ra" type="date" /><DrawerInput label="Khung giờ" type="time" /></div>
          <label className="flex flex-col gap-2 text-sm font-bold">Mô tả ngắn<textarea rows={4} className="rounded-[12px] border border-line bg-cream p-3 text-sm outline-none" placeholder="Mô tả nội dung sự kiện..." /></label>
          <label className="flex gap-3 rounded-[13px] bg-amber-50 p-4 text-sm font-semibold text-coffee"><input type="checkbox" /> Áp dụng tặng kèm Voucher/Combo khuyến mãi</label>
          <div className="mt-2 flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-[12px] border border-line py-3 text-sm font-bold">Huỷ</button><button type="button" className="flex-1 rounded-[12px] bg-coffee py-3 text-sm font-bold text-white">Tạo sự kiện</button></div>
        </form>
      </aside>
    </div>
  )
}

function DrawerInput({ label, placeholder, type = 'text' }: { label: string; placeholder?: string; type?: string }) {
  return <label className="flex flex-col gap-2 text-sm font-bold">{label}<input type={type} placeholder={placeholder} className="h-12 rounded-[12px] border border-line bg-cream px-4 text-sm outline-none focus:border-latte" /></label>
}
