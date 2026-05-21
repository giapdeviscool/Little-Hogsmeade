import { products } from '../../_mock/products.mock'
import { Card } from '../../components/ui/Card'
import { cn } from '../../utils/cn'

export function CMSPage() {
  return (
    <>
      <div className="flex justify-between">
        <div className="flex gap-2">{['Quản lý Khối nội dung (Blocks)', 'Bài viết & Tin tức', 'Quản lý Sự kiện'].map((x, i) => <button key={x} className={cn('rounded-[14px] border border-line px-4 py-2.5 text-sm font-semibold', i === 2 ? 'bg-coffee text-white' : 'bg-white')}>{x}</button>)}</div>
        <button className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white">+ Tạo sự kiện mới</button>
      </div>
      <section className="mt-6 grid grid-cols-3 gap-5">
        {['Acoustic Night - Thứ Bảy', 'Wine Tasting Workshop', 'Sunday Brunch'].map((event, i) => (
          <Card key={event} className="p-4">
            <img src={products[i + 1][2]} alt="" className="h-44 w-full rounded-[13px] object-cover" />
            <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-muted">25/05 · 19:30</span>
            <h2 className="mt-3 text-xl font-bold">{event}</h2>
            <p className="text-sm text-muted">{[84, 42, 128][i]} lượt đăng ký</p>
            <label className="mt-4 flex gap-2 text-sm font-semibold"><input type="checkbox" defaultChecked={i < 2} /> Đồng bộ lên Landing Page</label>
          </Card>
        ))}
      </section>
    </>
  )
}
