import { Sparkline } from '../../components/charts/Sparkline'
import { Card } from '../../components/ui/Card'

export function OwnerPage() {
  return (
    <>
      <div className="flex justify-between"><div><p className="text-sm text-muted">Owner Console</p><h1 className="text-[34px] font-bold">Quản trị Chuỗi</h1></div><button className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white">Xuất báo cáo</button></div>
      <section className="mt-6 grid grid-cols-4 gap-5">{['Doanh thu ₫1.84tỷ', 'Chi phí ₫684M', 'Lợi nhuận ₫492M', 'Đơn xử lý 286'].map((x) => <Card key={x} className="p-5"><span className="text-sm text-muted">{x.split(' ')[0]}</span><b className="block text-[28px]">{x.split(' ').at(-1)}</b><em className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold not-italic text-emerald-700">+8.9%</em></Card>)}</section>
      <section className="mt-8 grid grid-cols-[1fr_320px] gap-6"><Card className="p-7"><h2 className="text-xl font-bold">So sánh doanh thu chi nhánh</h2><Sparkline /></Card><Card className="p-6 text-center"><h2 className="text-xl font-bold">Cơ cấu doanh thu</h2><div className="mx-auto my-6 grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#4a3525_0_48%,#c2a68c_48%_85%,#d4af37_85%_100%)] text-xl font-bold shadow-[inset_0_0_0_34px_#faf8f5]">₫1.84B</div><p className="text-sm text-muted">Food 48% · Coffee 37% · Alcohol 15%</p></Card></section>
    </>
  )
}
