import { Card } from '../../components/ui/Card'
import { products } from '../../_mock/products.mock'
import { cn } from '../../utils/cn'

export function POSPage() {
  return (
    <>
      <div className="flex items-start justify-between">
        <div><p className="text-sm text-muted">Point of Sale</p><h1 className="text-[34px] font-bold tracking-[-0.03em]">Bán hàng & Thu ngân</h1></div>
        <button className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white">Mở ca bán hàng</button>
      </div>
      <section className="mt-6 grid grid-cols-[1fr_380px] gap-6">
        <Card className="p-6">
          <div className="flex gap-2">{['Khai vị', 'Món chính', 'Đồ uống', 'Đồ có cồn'].map((x, i) => <button key={x} className={cn('rounded-[14px] border border-line px-4 py-2.5 text-sm font-semibold', i === 0 ? 'bg-coffee text-white' : 'bg-white')}>{x}</button>)}</div>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {products.map(([name, price, img, soldOut]) => (
              <article key={name} className="relative rounded-[15px] border border-line bg-white p-3 shadow-soft">
                {soldOut && <span className="absolute left-5 top-5 rounded-full bg-beige px-3 py-1 text-xs font-bold text-muted">Tạm hết hàng</span>}
                <img src={img} alt="" className="h-[132px] w-full rounded-[12px] object-cover" />
                <div className="mt-3 flex min-h-[52px] flex-col"><strong className="text-[15px]">{name}</strong><span className="text-sm text-muted">{price}</span></div>
                <button disabled={!!soldOut} className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-coffee text-xl text-white disabled:bg-muted/30">+</button>
              </article>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Phiếu gọi món</h2>
          <input className="h-11 w-full rounded-[13px] border border-line bg-white px-4 text-sm outline-none" placeholder="Tìm số điện thoại khách hàng" />
          <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Gold Member · 5% Discount</span>
          {['Latte Hạt Dẻ', 'Beef Steak Bistro', 'Croissant Bơ Pháp'].map((item, i) => (
            <div key={item} className="mt-4 flex items-center gap-4 rounded-[14px] bg-white p-3">
              <div className="flex-1"><strong className="block text-sm">{item}</strong><span className="text-xs text-muted">{i === 0 ? 'Ít đá · Thêm shot' : 'Ghi chú bếp'}</span></div>
              <div className="flex items-center gap-2"><button>-</button><b>{i + 1}</b><button>+</button></div>
              <b>{['72.000đ', '248.000đ', '68.000đ'][i]}</b>
            </div>
          ))}
          <div className="mt-5 rounded-[16px] bg-cream p-4">{['Tạm tính 456.000đ', 'Giảm giá -22.800đ', 'VAT 43.320đ', 'Tổng cộng 476.520đ'].map((x) => <p key={x} className="flex justify-between py-2 text-sm text-muted"><span>{x.split(' ').slice(0, -1).join(' ')}</span><b>{x.split(' ').at(-1)}</b></p>)}</div>
          <div className="mt-4 grid grid-cols-2 gap-3">{['Tiền mặt', 'Ví điện tử', 'Thẻ ngân hàng', 'Quét VietQR'].map((x) => <button key={x} className="rounded-[14px] border border-line bg-white px-4 py-2.5 text-sm font-semibold">{x}</button>)}</div>
        </Card>
      </section>
    </>
  )
}
