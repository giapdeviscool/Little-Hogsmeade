import { Search } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { formatVND } from '../../../utils/formatCurrency'
import type { FeaturedMenuBlock } from '../landing.types'

export function FeaturedMenuSection({
  featuredMenuBlock,
  query,
  setQuery,
}: {
  featuredMenuBlock: FeaturedMenuBlock
  query: string
  setQuery: (value: string) => void
}) {
  const filteredItems = featuredMenuBlock.items.filter((item) => [item.name, item.description, item.badge ?? ''].some((value) => value.toLowerCase().includes(query.toLowerCase())))

  return (
    <section id="landing-menu" className="bg-cream py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Menu & khuyến mãi</p>
            <h2 className="mt-3 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[48px]">
              {featuredMenuBlock.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{featuredMenuBlock.description}</p>
          </div>
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm món nổi bật..." className="h-12 w-full rounded-full border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-latte" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <article key={item.name} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft">
              <img src={item.imageUrl} alt={item.name} className="h-[280px] w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[18px] font-bold">{item.name}</h3>
                    <p className="mt-2 min-h-[44px] text-sm leading-6 text-muted">{item.description}</p>
                  </div>
                  <span className="rounded-full bg-beige px-3 py-1 text-xs font-semibold text-coffee">{item.badge ?? 'Nổi bật'}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <b>{formatVND(item.price)}</b>
                  <button type="button" className="rounded-full bg-coffee px-4 py-2 text-xs font-bold text-white">
                    Order
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="mt-8 p-6 text-center">
            <p className="text-sm font-semibold">Không tìm thấy món phù hợp.</p>
            <p className="mt-2 text-sm text-muted">Thử xoá từ khoá hoặc cập nhật dữ liệu menu nổi bật trong CMS.</p>
          </Card>
        )}
      </div>
    </section>
  )
}
