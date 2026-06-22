import { useEffect, useState } from 'react'
import { Sparkline } from '../../components/charts/Sparkline'
import { Card } from '../../components/ui/Card'
import { products } from '../../_mock/products.mock'
import { cn } from '../../utils/cn'
import { getChainDashboard } from '../../api/chain.api'
import type { ChainDashboard } from '../../types'

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<ChainDashboard | null>(null)

  useEffect(() => {
    let alive = true
    getChainDashboard({}).then((res) => {
      if (alive && res.data) setDashboard(res.data)
    }).catch(console.error)
    return () => { alive = false }
  }, [])

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

  const kpis = dashboard ? [
    ['Doanh thu toàn chuỗi', formatVND(dashboard.kpis.totalRevenue), '+12.4%', true],
    ['Tổng đơn hàng', dashboard.kpis.totalOrders.toLocaleString(), '+8.1%', true],
    ['Lợi nhuận gộp', formatVND(dashboard.kpis.grossProfit), '+5.7%', true],
    ['Chi nhánh hoạt động', '12 / 12', '-0.4%', false],
  ] : [
    ['Doanh thu toàn chuỗi', '₫0', '0%', true],
    ['Tổng đơn hàng', '0', '0%', true],
    ['Lợi nhuận gộp', '₫0', '0%', true],
    ['Chi nhánh hoạt động', '0', '0%', false],
  ]

  const branchPerformance = dashboard?.branchPerformance?.length
    ? dashboard.branchPerformance.map(b => [b.branchName, Math.min(100, Math.round(b.revenue / (dashboard.kpis.totalRevenue || 1) * 100))])
    : [['Quận 1', 92], ['Thảo Điền', 80], ['Hồ Tây', 73], ['Đà Nẵng', 61]]

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="mb-1 text-sm font-medium text-muted">Chain Owner View · Hôm nay</p>
          <h1 className="text-[34px] font-bold tracking-[-0.03em]">Tổng quan chuỗi Little Hogsmeade</h1>
        </div>
        <div className="flex gap-2">
          {['Hôm nay', 'Tuần này', 'Tháng này'].map((x) => <button key={x} className={cn('rounded-[14px] border border-line px-4 py-2.5 text-sm font-semibold', x === 'Tuần này' ? 'bg-coffee text-white' : 'bg-white')}>{x}</button>)}
        </div>
      </div>

      <section className="mt-8 grid grid-cols-4 gap-5">
        {kpis.map(([label, value, delta, good], index) => (
          <Card key={label as string} className="min-h-[234px] p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-white text-xl">{['$', '▣', '♧', '▤'][index]}</span>
              <span className={cn('rounded-full px-3 py-1 text-xs font-bold', good ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>⌁ {delta as string}</span>
            </div>
            <p className="text-sm font-medium text-muted">{label as string}</p>
            <strong className="mt-1 block text-[31px] tracking-[-0.04em]">{value as string}</strong>
            <Sparkline />
          </Card>
        ))}
      </section>

      <Card className="mt-8 p-7">
        <div className="flex justify-between">
          <div><h2 className="text-xl font-bold">Doanh thu toàn chuỗi theo thời gian</h2><p className="mt-1 text-sm text-muted">So sánh tuần này với tuần trước</p></div>
          <div className="flex items-center gap-2 text-sm font-medium"><span className="h-3 w-3 rounded-full bg-coffee" />Tuần này <span className="h-3 w-3 rounded-full bg-latte" />Tuần trước</div>
        </div>
        <div className="mt-8 h-[300px] rounded-[14px] bg-white p-8"><Sparkline /></div>
      </Card>

      <section className="mt-8 grid grid-cols-[1.25fr_.8fr] gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold">Hiệu suất theo chi nhánh</h2>
          {branchPerformance.map(([branch, value]) => (
            <div key={branch as string} className="mt-4 flex items-center gap-4 rounded-[14px] bg-white p-3">
              <span className="w-28 text-sm font-semibold">{branch as string}</span>
              <div className="h-2 flex-1 rounded-full bg-beige"><b className="block h-full rounded-full bg-coffee" style={{ width: `${value}%` }} /></div>
              <strong>{value as number}%</strong>
            </div>
          ))}
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-bold">Món ăn bán chạy nhất</h2>
          {products.slice(0, 4).map(([name, price, img], i) => (
            <div key={name as string} className="mt-4 flex items-center gap-4 rounded-[14px] bg-white p-3">
              <img src={img as string} alt="" className="h-12 w-12 rounded-[12px] object-cover" />
              <div className="flex-1"><strong className="block text-sm">{name as string}</strong><span className="text-xs text-muted">{price as string}</span></div>
              <b>+{[184, 168, 151, 137][i]}</b>
            </div>
          ))}
        </Card>
      </section>
    </>
  )
}
