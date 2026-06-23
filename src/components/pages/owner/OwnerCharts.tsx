import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../../ui/Card'
import type { ChainDashboard } from '../../../types'
import { formatCurrency } from '../../../utils/owner.utils'

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-l-4 border-l-latte p-5">
      <p className="text-sm text-muted">{label}</p>
      <b className="mt-2 block text-2xl font-semibold tabular-nums">{value}</b>
    </Card>
  )
}

function RevenueTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload as { date: string; revenue: number }
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold">{item.date}</p>
      <p className="mt-1 text-muted">{formatCurrency(item.revenue)}</p>
    </div>
  )
}

export function BarChart({ data }: { data: ChainDashboard['revenueSeries'] }) {
  if (data.length === 0) {
    return (
      <div className="mt-5 grid h-64 w-full place-items-center text-sm text-muted">
        Chưa có dữ liệu doanh thu.
      </div>
    )
  }

  const chartData = data.map((item) => ({ ...item, label: item.date.slice(5) }))

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="var(--color-line, #e5e0d8)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#8a8478' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#8a8478' }}
            tickFormatter={(value) => formatCurrency(value)}
            width={70}
          />
          <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="revenue" fill="#A47551" radius={[6, 6, 0, 0]} maxBarSize={56} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BranchShareChart({ data }: { data: ChainDashboard['branchPerformance'] }) {
  const total = data.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <div className="mt-5 space-y-3">
      {data.length === 0 ? <div className="grid h-56 place-items-center text-sm text-muted">Chưa có dữ liệu chi nhánh.</div> : null}
      {data.slice(0, 6).map((item) => {
        const percent = total > 0 ? Math.round((item.revenue / total) * 100) : 0
        return (
          <div key={item.branchId}>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{item.branchName}</span>
              <span className="text-muted">{percent}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-line">
              <div className="h-2 rounded-full bg-coffee" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">{formatCurrency(item.revenue)} · {item.orders} đơn</p>
          </div>
        )
      })}
    </div>
  )
}

export function SimpleList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 max-h-72 space-y-2 overflow-auto">
        {items.length === 0 ? <p className="text-sm text-muted">Chưa có dữ liệu.</p> : null}
        {items.map((item) => <p key={item} className="rounded-lg bg-cream px-3 py-2 text-sm text-muted">{item}</p>)}
      </div>
    </div>
  )
}
