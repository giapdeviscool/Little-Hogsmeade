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

export function BarChart({ data }: { data: ChainDashboard['revenueSeries'] }) {
  const max = Math.max(...data.map((item) => item.revenue), 1)

  return (
    <div className="mt-5 flex h-64 items-end gap-2 border-b border-line">
      {data.length === 0 ? <div className="grid h-full w-full place-items-center text-sm text-muted">Chưa có dữ liệu doanh thu.</div> : null}
      {data.map((item) => (
        <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-lg bg-latte" style={{ height: `${Math.max((item.revenue / max) * 220, 8)}px` }} title={formatCurrency(item.revenue)} />
          <span className="max-w-full truncate text-[11px] text-muted">{item.date.slice(5)}</span>
        </div>
      ))}
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
