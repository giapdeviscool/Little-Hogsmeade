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

export function MetricCard({
  label,
  value,
  emphasis = false,
  helperText,
}: {
  label: string
  value: string
  emphasis?: boolean
  helperText?: string
}) {
  return (
    <Card
      className={
        emphasis
          ? 'border-l-4 border-l-coffee bg-cream p-5'
          : 'border-l-4 border-l-line p-5'
      }
    >
      <p className="text-sm text-muted">{label}</p>
      <b className={emphasis ? 'mt-2 block text-3xl font-semibold tabular-nums' : 'mt-2 block text-2xl font-semibold tabular-nums'}>
        {value}
      </b>
      {helperText ? <p className="mt-1 text-xs text-muted">{helperText}</p> : null}
    </Card>
  )
}

function RevenueTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
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
        <RechartsBarChart data={chartData} margin={{ top: 30, right: 8, left: 8, bottom: 0 }} barCategoryGap="30%">
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

export function BranchPerformanceTable({ data }: { data: ChainDashboard['branchPerformance'] }) {
  if (data.length === 0) {
    return (
      <div className="mt-5 grid h-56 place-items-center text-sm text-muted">
        Chưa có dữ liệu chi nhánh.
      </div>
    )
  }

  return (
    <div className="mt-4 max-h-80 overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className=" top-0 bg-white">
          <tr className="text-xs text-muted">
            <th className="pl-1 border-b border-line py-2 text-left font-medium">Chi nhánh</th>
            <th className="border-b border-line py-2 text-left font-medium">Doanh thu</th>
            <th className="border-b border-line py-2 text-left font-medium">Đơn</th>
            <th className="pr-1 border-b border-line py-2 text-right font-medium">Lãi gộp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.branchId} className="border-b border-line/60">
              <td className="pl-1 py-2 font-medium">{item.branchName}</td>
              <td className="py-2 text-left tabular-nums text-muted">{formatCurrency(item.revenue)}</td>
              <td className="py-2 text-left tabular-nums text-muted">{item.orders}</td>
              <td
                className={
                  item.grossProfit < 0
                    ? 'py-2 pr-1 text-right tabular-nums font-semibold text-red-600'
                    : 'py-2 pr-1 text-right tabular-nums font-semibold text-green-700'
                }
              >
                {item.grossProfit < 0 ? '−' : '+'}
                {formatCurrency(Math.abs(item.grossProfit))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LowStockBanner({ data }: { data: ChainDashboard['lowStockAlerts'] }) {
  if (!data || data.length === 0) return null

  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
      <span className="text-sm font-medium text-red-800">
        {data.length} chi nhánh có nguyên liệu sắp hết ({totalCount} mặt hàng)
      </span>
      <div className="flex flex-wrap gap-2">
        {data.map((item) => (
          <span
            key={item.branchId}
            className="rounded-full border border-red-200 bg-white px-3 py-0.5 text-xs text-red-700"
          >
            {item.branchName} · {item.count}
          </span>
        ))}
      </div>
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