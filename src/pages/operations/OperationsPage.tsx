import { useState } from 'react'
import { tableMap } from '../../_mock/tables.mock'
import { cn } from '../../utils/cn'
import { ReservationManager } from './ReservationManager'

export function OperationsPage() {
  const [activeTab, setActiveTab] = useState<'tables' | 'menu' | 'reservations'>('tables')
  const statusClass = (status: string) => status === 'Đang phục vụ' ? 'border-latte bg-latte text-white' : status === 'Đã đặt trước' ? 'border-line bg-beige text-coffee' : 'border-line bg-white text-coffee'

  return (
    <>
      <div className="flex items-center justify-between rounded-[18px] bg-cream p-1">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('tables')} className={cn('rounded-[14px] px-4 py-2.5 text-sm font-semibold', activeTab === 'tables' ? 'bg-coffee text-white' : 'text-muted hover:bg-white')}>Sơ đồ phòng/bàn</button>
          <button onClick={() => setActiveTab('menu')} className={cn('rounded-[14px] px-4 py-2.5 text-sm font-semibold', activeTab === 'menu' ? 'bg-coffee text-white' : 'text-muted hover:bg-white')}>Quản lý thực đơn</button>
          <button onClick={() => setActiveTab('reservations')} className={cn('rounded-[14px] px-4 py-2.5 text-sm font-semibold', activeTab === 'reservations' ? 'bg-coffee text-white' : 'text-muted hover:bg-white')}>Quản lý đặt bàn</button>
        </div>
        <button className="rounded-[14px] border border-line bg-white px-4 py-2.5 text-sm font-semibold">⌖ Chi nhánh Quận 1⌄</button>
      </div>
      {activeTab === 'reservations' ? (
        <ReservationManager />
      ) : (
        <>
          <section className="mt-8 grid grid-cols-4 gap-4">
            {[
              ['Tổng số bàn', 15],
              ['Đang phục vụ', 6],
              ['Trống sẵn sàng', 6],
              ['Đã đặt trước', 3],
            ].map(([label, value]) => <article key={label} className="rounded-[16px] border border-line bg-white px-12 py-5 shadow-soft"><span className="text-sm text-muted">{label}</span><b className="block text-[26px]">{value}</b></article>)}
          </section>
          <div className="mt-7 flex items-center justify-between">
            <div className="flex gap-2">{['☕ Tất cả', '⌂ Trong nhà (Tầng 1)', '☂ Ngoài trời (Sân vườn)', '♙ Quầy Bar'].map((x, i) => <button key={x} className={cn('rounded-[14px] border border-line px-4 py-2.5 text-sm font-semibold', i === 0 ? 'bg-coffee text-white' : 'bg-white')}>{x}</button>)}</div>
            <div className="flex gap-5 text-sm font-medium text-muted"><span>○ Trống</span><span>● Đang phục vụ</span><span>◌ Đã đặt trước</span></div>
          </div>
          <section className="mt-7 rounded-[16px] border border-line bg-cream/60 p-7 shadow-soft">
            <div className="grid grid-cols-4 gap-5 [grid-auto-rows:242px]">
              {tableMap.map(([num, seats, status, time, shape]) => (
                <article key={num} className={cn('relative flex items-center justify-center overflow-hidden shadow-soft', shape === 'circle' ? 'rounded-full' : 'rounded-[14px]', shape === 'wide' && 'col-span-2', statusClass(status))}>
                  <span className="absolute left-4 top-4 text-xs font-semibold opacity-80">♧ {seats}</span>
                  <div className="text-center"><strong className="block text-[34px] leading-none tracking-[-0.04em]">{num}</strong><small className="mt-2 block text-[11px] font-bold tracking-[0.18em]">BÀN</small>{time && <b className="mt-3 inline-flex rounded-full bg-white/45 px-3 py-1 text-xs">◷ {time}</b>}</div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}
